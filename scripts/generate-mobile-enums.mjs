import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const openApiPath = path.join(rootDir, 'openapi', 'openapi.json');
const outputPath = path.join(rootDir, 'mobile', 'src', 'generated', 'api-enums.js');

if (!fs.existsSync(openApiPath)) {
  throw new Error('openapi/openapi.json not found. Run openapi:generate first.');
}

const openApi = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
const schemas = openApi?.components?.schemas || {};

const enumMap = new Map();

const toConstName = (value) => value
  .replace(/[^a-zA-Z0-9]+/g, ' ')
  .trim()
  .split(/\s+/)
  .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
  .join('');

for (const [schemaName, schema] of Object.entries(schemas)) {
  if (!schema || typeof schema !== 'object') {
    continue;
  }

  if (schema.type === 'string' && Array.isArray(schema.enum)) {
    enumMap.set(toConstName(schemaName), schema.enum);
  }

  const properties = schema.properties || {};
  for (const [propertyName, propertySchema] of Object.entries(properties)) {
    if (
      propertySchema &&
      typeof propertySchema === 'object' &&
      propertySchema.type === 'string' &&
      Array.isArray(propertySchema.enum)
    ) {
      const isToolConditionEnum =
        propertyName === 'condition' &&
        ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'].every((value) =>
          propertySchema.enum.includes(value),
        );
      const isPreferredPickupWindowEnum =
        propertyName === 'preferredPickupWindow' &&
        ['MORNING', 'AFTERNOON', 'EVENING', 'FLEXIBLE'].every((value) =>
          propertySchema.enum.includes(value),
        );
      const isBookingStatusEnum =
        propertyName === 'status' &&
        ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].every((value) =>
          propertySchema.enum.includes(value),
        );
      const name =
        propertyName === 'verificationTier'
          ? 'VerificationTier'
          : isToolConditionEnum
            ? 'ToolCondition'
            : isPreferredPickupWindowEnum
              ? 'PreferredPickupWindow'
              : isBookingStatusEnum
                ? 'BookingStatus'
            : toConstName(`${schemaName} ${propertyName}`);
      enumMap.set(name, propertySchema.enum);
    }
  }
}

const enumEntries = Array.from(enumMap.entries());

const lines = [
  '// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
  '// Run: npm run api:generate',
  '',
];

for (const [name, enumValues] of enumEntries) {
  lines.push(`export const ${name} = Object.freeze({`);
  for (const enumValue of enumValues) {
    lines.push(`  ${enumValue}: '${enumValue}',`);
  }
  lines.push('});');
  lines.push('');
}

if (!enumEntries.length) {
  lines.push('// No string enums found in OpenAPI schema.');
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
console.log('Generated mobile/src/generated/api-enums.js');

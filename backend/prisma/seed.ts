import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Icon names are from MaterialCommunityIcons (@expo/vector-icons)
// Usage in mobile: <MaterialCommunityIcons name={category.icon} />
const categories = [
    { name: 'Power Tools', slug: 'power-tools', icon: 'power-plug' },
    { name: 'Hand Tools', slug: 'hand-tools', icon: 'hammer' },
    { name: 'Measuring & Levelling', slug: 'measuring-tools', icon: 'ruler' },
    { name: 'Drilling & Fastening', slug: 'drilling-fastening', icon: 'screw-machine-flat-top' },
    { name: 'Cutting & Grinding', slug: 'cutting-grinding', icon: 'content-cut' },
    { name: 'Sanding & Finishing', slug: 'sanding-finishing', icon: 'brush' },
    { name: 'Welding & Metalwork', slug: 'welding-metalwork', icon: 'torch' },
    { name: 'Plumbing', slug: 'plumbing', icon: 'pipe-wrench' },
    { name: 'Electrical', slug: 'electrical', icon: 'lightning-bolt' },
    { name: 'Garden & Outdoor', slug: 'garden-outdoor', icon: 'flower' },
    { name: 'Lifting & Moving', slug: 'lifting-moving', icon: 'crane' },
    { name: 'Ladders & Scaffolding', slug: 'ladders-scaffolding', icon: 'ladder' },
    { name: 'Cleaning & Pressure Washing', slug: 'cleaning-pressure', icon: 'spray-bottle' },
    { name: 'Other', slug: 'other', icon: 'dots-horizontal' },
];

async function seedCountries() {
    console.log('Fetching countries from REST Countries API…');
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag');
    if (!res.ok) throw new Error(`REST Countries API error: ${res.status}`);

    const raw: any[] = await res.json();

    const rows = raw
        .map((c) => {
            const root = c.idd?.root ?? '';
            const suffix = c.idd?.suffixes?.[0] ?? '';
            const countryCode = root + suffix;
            return {
                code: c.cca2 as string,
                name: c.name.common as string,
                countryCode,
                flag: c.flag as string,
            };
        })
        .filter((r) => r.countryCode.startsWith('+')); // skip entries with no dial code

    console.log(`Seeding ${rows.length} countries…`);
    for (const row of rows) {
        await prisma.country.upsert({
            where: { code: row.code },
            update: { name: row.name, countryCode: row.countryCode, flag: row.flag },
            create: row,
        });
    }
    console.log(`✅ Seeded ${rows.length} countries.`);
}

async function main() {
    console.log('Seeding categories...');
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, icon: cat.icon },
            create: cat,
        });
    }
    console.log(`✅ Seeded ${categories.length} categories.`);

    await seedCountries();
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

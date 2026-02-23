-- Step 1: Create categories table
CREATE TABLE "categories" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- AddForeignKey (self-relation for subcategories)
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 2: Seed the 14 categories with auto-generated UUIDs
-- Icon names reference MaterialCommunityIcons from @expo/vector-icons
INSERT INTO "categories" ("name", "slug", "icon") VALUES
  ('Power Tools',                'power-tools',         'power-plug'),
  ('Hand Tools',                 'hand-tools',          'hammer'),
  ('Measuring & Levelling',      'measuring-tools',     'ruler'),
  ('Drilling & Fastening',       'drilling-fastening',  'screw-machine-flat-top'),
  ('Cutting & Grinding',         'cutting-grinding',    'content-cut'),
  ('Sanding & Finishing',        'sanding-finishing',   'brush'),
  ('Welding & Metalwork',        'welding-metalwork',   'torch'),
  ('Plumbing',                   'plumbing',            'pipe-wrench'),
  ('Electrical',                 'electrical',          'lightning-bolt'),
  ('Garden & Outdoor',           'garden-outdoor',      'flower'),
  ('Lifting & Moving',           'lifting-moving',      'crane'),
  ('Ladders & Scaffolding',      'ladders-scaffolding', 'ladder'),
  ('Cleaning & Pressure Washing','cleaning-pressure',   'spray-bottle'),
  ('Other',                      'other',               'dots-horizontal');

-- Step 3: Add categoryId as nullable first so we can populate it
ALTER TABLE "tools" ADD COLUMN "categoryId" TEXT;

-- Step 4: Migrate all existing tools to the "Other" category (looked up by slug)
UPDATE "tools" SET "categoryId" = (SELECT "id" FROM "categories" WHERE "slug" = 'other');

-- Step 5: Make the column NOT NULL now that all rows have a value
ALTER TABLE "tools" ALTER COLUMN "categoryId" SET NOT NULL;

-- Step 6: Drop the old free-text category column
ALTER TABLE "tools" DROP COLUMN "category";

-- Step 7: Add foreign key from tools to categories
ALTER TABLE "tools" ADD CONSTRAINT "tools_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

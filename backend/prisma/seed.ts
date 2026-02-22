import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Icon names are from MaterialCommunityIcons (@expo/vector-icons)
// Usage in mobile: <MaterialCommunityIcons name={category.icon} />
const categories = [
    { name: 'Power Tools', slug: 'power-tools', icon: 'power-plug' },
    { name: 'Hand Tools', slug: 'hand-tools', icon: 'hammer' },
    { name: 'Measuring & Levelling', slug: 'measuring-tools', icon: 'ruler' },
    { name: 'Drilling & Fastening', slug: 'drilling-fastening', icon: 'screw' },
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

async function main() {
    console.log('Seeding categories...');
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, icon: cat.icon },
            create: cat, // id is auto-generated UUID by the DB
        });
    }
    console.log(`✅ Seeded ${categories.length} categories.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

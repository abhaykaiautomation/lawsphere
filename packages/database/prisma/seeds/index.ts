import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const practiceAreas = [
  { name: 'Family Law', slug: 'family-law', description: 'Divorce, custody, adoption, domestic relations', sortOrder: 1 },
  { name: 'Criminal Law', slug: 'criminal-law', description: 'Defense, prosecution, bail, appeals', sortOrder: 2 },
  { name: 'Corporate Law', slug: 'corporate-law', description: 'Company formation, M&A, compliance, contracts', sortOrder: 3 },
  { name: 'Property Law', slug: 'property-law', description: 'Real estate, land disputes, tenant rights', sortOrder: 4 },
  { name: 'Employment Law', slug: 'employment-law', description: 'Wrongful termination, discrimination, labor rights', sortOrder: 5 },
  { name: 'Immigration Law', slug: 'immigration-law', description: 'Visas, citizenship, deportation defense', sortOrder: 6 },
  { name: 'Intellectual Property', slug: 'intellectual-property', description: 'Patents, trademarks, copyrights', sortOrder: 7 },
  { name: 'Tax Law', slug: 'tax-law', description: 'Tax planning, disputes, compliance', sortOrder: 8 },
  { name: 'Civil Litigation', slug: 'civil-litigation', description: 'Disputes, damages, injunctions', sortOrder: 9 },
  { name: 'Consumer Law', slug: 'consumer-law', description: 'Consumer protection, fraud, defective products', sortOrder: 10 },
  { name: 'Banking & Finance', slug: 'banking-finance', description: 'Loans, securities, regulatory compliance', sortOrder: 11 },
  { name: 'Medical Law', slug: 'medical-law', description: 'Medical negligence, malpractice, health regulations', sortOrder: 12 },
];

async function main() {
  console.log('Seeding database...');

  for (const area of practiceAreas) {
    await prisma.practiceArea.upsert({
      where: { slug: area.slug },
      update: {},
      create: area,
    });
  }

  console.log(`Seeded ${practiceAreas.length} practice areas`);
  console.log('Database seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { db } from '../lib/db/client';

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample libraries
  const demoLibrary = await db.library.create({
    data: {
      name: 'Demo Library',
      slug: 'demo-library',
      description: 'A sample library for demonstration purposes',
    },
  });

  const marketingLibrary = await db.library.create({
    data: {
      name: 'Marketing Videos',
      slug: 'marketing-videos',
      description: 'Collection of marketing and promotional videos',
    },
  });

  console.log('✅ Created sample libraries');

  // Create sample daily usage data for the last 30 days
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    await db.dailyUsage.create({
      data: {
        day: date,
        streamedMinutes: BigInt(Math.floor(Math.random() * 1000) + 100),
        storageGb: Math.random() * 50 + 10,
      },
    });
  }

  console.log('✅ Created sample usage data');

  // Create sample asset metadata
  const sampleAssets = [
    {
      assetId: 'sample-asset-1',
      title: 'Product Demo Video',
      description: 'Demonstration of our main product features',
      tags: ['demo', 'product', 'features'],
      duration: 120.5,
      aspectRatio: '16:9',
    },
    {
      assetId: 'sample-asset-2',
      title: 'Company Introduction',
      description: 'Brief introduction to our company and mission',
      tags: ['company', 'introduction', 'mission'],
      duration: 90.0,
      aspectRatio: '16:9',
    },
    {
      assetId: 'sample-asset-3',
      title: 'Tutorial: Getting Started',
      description: 'Step-by-step tutorial for new users',
      tags: ['tutorial', 'getting-started', 'onboarding'],
      duration: 300.75,
      aspectRatio: '16:9',
    },
  ];

  for (const asset of sampleAssets) {
    await db.assetMetadata.create({
      data: asset,
    });
  }

  console.log('✅ Created sample asset metadata');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- Kader 2.0: Starting Dummy Data Injection ---')

  // 1. Create Dummy Users
  const provider1 = await prisma.user.upsert({
    where: { clerkId: 'dummy_provider_1' },
    update: {},
    create: {
      clerkId: 'dummy_provider_1',
      name: 'Hussein - Cinema Gear',
      role: 'PROVIDER',
    },
  })

  const talent1 = await prisma.user.upsert({
    where: { clerkId: 'dummy_talent_1' },
    update: {},
    create: {
      clerkId: 'dummy_talent_1',
      name: 'Sarah - Pro Editor',
      role: 'PROVIDER',
      isCreator: true,
      creatorTitle: 'Colorist & Video Editor',
      creatorBio: 'Specializing in cinematic grading for commercials.',
    },
  })

  // 2. Create Listings (Gear & Locations)
  await prisma.listing.create({
    data: {
      title: 'ARRI Alexa 35 Package',
      description: 'Full cinematic package including lenses and media.',
      type: 'EQUIPMENT',
      pricePerDay: 150.00,
      userId: provider1.id,
      visibility: 'PUBLISHED',
      availability: 'AVAILABLE',
    }
  })

  const location = await prisma.listing.create({
    data: {
      title: 'Industrial Warehouse Studio',
      description: '4000 sqft warehouse with high ceilings and power grid.',
      type: 'LOCATION',
      pricePerDay: 200.00,
      userId: provider1.id,
      visibility: 'PUBLISHED',
      availability: 'AVAILABLE',
    }
  })

  await prisma.locationProfile.create({
    data: {
      listingId: location.id,
      address: 'Hidd, Bahrain',
      typeOfLocation: 'Industrial',
      sqftArea: '4000',
      powerSupply: '3-Phase High Voltage',
      permitStatus: 'Acquired',
    }
  })

  // 3. Create a Dummy Project for Testing
  const project = await prisma.project.create({
    data: {
      title: 'Commercial Shoot - Pepsi X Bahrain',
      description: 'Cinematic brand film for the regional market.',
      budget: 5000.00,
      userId: provider1.id, 
    }
  })

  // 4. Create a Dummy Transaction in the Pipeline (ESCROW_FUNDED)
  await prisma.callSheetItem.create({
    data: {
      projectId: project.id,
      listingId: location.id,
      status: 'ESCROW_FUNDED',
      totalCost: 400.00,
      startDate: new Date(),
      endDate: new Date(Date.now() + 172800000), 
    }
  })

  console.log('--- SEEDING COMPLETE: Hussein and Sarah are live ---')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

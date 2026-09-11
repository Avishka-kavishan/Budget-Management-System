import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Seed Zones
  const zonesList = [
    "Galle",
    "Ambalangoda",
    "Elpitiya",
    "Udugama",
    "Matara",
    "Akuressa",
    "Mulatiyana",
    "Deniyaya",
    "Hambantota",
    "Tangalle",
    "Walasmulla",
  ];

  for (const zoneName of zonesList) {
    await prisma.zone.upsert({
      where: { zoneName },
      update: {},
      create: { zoneName },
    });
  }
  console.log("✓ Zones seeded");

  const galleZone = await prisma.zone.findUnique({ where: { zoneName: "Galle" } });
  const mataraZone = await prisma.zone.findUnique({ where: { zoneName: "Matara" } });

  // 2. Seed Users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = [
    {
      name: "Provincial Admin",
      email: "admin@education.lk",
      password: hashedPassword,
      role: "admin",
      zoneId: galleZone?.id,
    },
    {
      name: "Chief Accountant",
      email: "accountant@education.lk",
      password: hashedPassword,
      role: "accountant",
      zoneId: galleZone?.id,
    },
    {
      name: "Zonal Director - Galle",
      email: "zonal.galle@education.lk",
      password: hashedPassword,
      role: "zonal director",
      zoneId: galleZone?.id,
    },
    {
      name: "Subject Officer - Matara",
      email: "user.matara@education.lk",
      password: hashedPassword,
      role: "user",
      zoneId: mataraZone?.id,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role, name: user.name, password: user.password },
      create: user,
    });
  }
  console.log("✓ Users seeded");

  // 3. Seed Votes
  const votes = [
    {
      voteNumber: "701-01-01",
      description: "Primary & Secondary Education Provincial Development Plan",
      totalAllocated: 5000000,
      totalUsed: 1250000,
      remaining: 3750000,
    },
    {
      voteNumber: "701-02-05",
      description: "Teacher Capacity Building & Educational Training Workshops",
      totalAllocated: 3000000,
      totalUsed: 800000,
      remaining: 2200000,
    },
    {
      voteNumber: "701-03-12",
      description: "Special Education Needs (SEN) Zonal Resource Support",
      totalAllocated: 2500000,
      totalUsed: 500000,
      remaining: 2000000,
    },
  ];

  for (const vote of votes) {
    const existing = await prisma.vote.findUnique({ where: { voteNumber: vote.voteNumber } });
    if (!existing) {
      const createdVote = await prisma.vote.create({ data: vote });
      // add an initial fund allocation tranche
      await prisma.fundAllocation.create({
        data: {
          voteId: createdVote.id,
          year: 2026,
          month: 1,
          amount: vote.totalAllocated,
          remarks: "Initial annual allocation approved by Provincial Council",
        },
      });
    }
  }
  console.log("✓ Votes & Fund allocations seeded");

  // 4. Seed Sample Projects
  const existingProject = await prisma.project.findFirst();
  if (!existingProject) {
    await prisma.project.createMany({
      data: [
        {
          strategy: "Strategy 1: Quality Learning Improvement",
          activityNo: "1.1.2",
          activityDescription: "Conducting diagnostic assessment for Grade 5 scholarship and Grade 6 entrants across southern schools.",
          location: "Southern Province Zones",
          q1: "Yes",
          q2: "No",
          q3: "Yes",
          q4: "No",
          budgetHead: "701",
          programme: "Primary Ed",
          project: "Scholarship Prep",
          objectCode: "1402",
          noOfUnits: 150,
          unitCost: 2500,
          estimatedCostR: 375000,
          estimatedCostC: 0,
          estimatedCostT: 375000,
          kpi: "150 schools assessed",
          fundingSource: "Provincial Fund",
          referencePlan: "ESDFP 2026",
          galle: 50000,
          ambalangoda: 40000,
          elipitiya: 35000,
          udugama: 30000,
          matara: 45000,
          akurassa: 35000,
          mulkirigala: 25000,
          deniyaya: 25000,
          hambantota: 30000,
          tangalle: 30000,
          walasmulla: 30000,
          pde: 0,
          total: 375000,
          status: "Approved",
        },
        {
          strategy: "Strategy 2: Teacher Professional Development",
          activityNo: "2.3.1",
          activityDescription: "3-Day STEM pedagogy and practical lab work training for zonal Science & Mathematics teachers.",
          location: "Provincial Teacher Center, Labuduwa, Galle",
          q1: "No",
          q2: "Yes",
          q3: "No",
          q4: "Yes",
          budgetHead: "701",
          programme: "Secondary Ed",
          project: "STEM Skills",
          objectCode: "1405",
          noOfUnits: 80,
          unitCost: 7500,
          estimatedCostR: 600000,
          estimatedCostC: 0,
          estimatedCostT: 600000,
          kpi: "80 teachers certified",
          fundingSource: "ESDFP Grant",
          referencePlan: "Annual Plan 2026",
          galle: 100000,
          ambalangoda: 80000,
          elipitiya: 60000,
          udugama: 40000,
          matara: 90000,
          akurassa: 50000,
          mulkirigala: 40000,
          deniyaya: 30000,
          hambantota: 40000,
          tangalle: 40000,
          walasmulla: 30000,
          pde: 0,
          total: 600000,
          status: "Approved",
        },
      ],
    });
    console.log("✓ Projects seeded");
  }

  // 5. Seed Sample Estimated Budget & Items
  const user = await prisma.user.findUnique({ where: { email: "user.matara@education.lk" } });
  if (user) {
    const existingBudget = await prisma.estimatedBudget.findFirst({ where: { userId: user.id } });
    if (!existingBudget) {
      const budget = await prisma.estimatedBudget.create({
        data: {
          userId: user.id,
          zone: "Matara",
          subject: "Mathematics & Science Workshop",
          activityCode: "ACT-MAT-2026-01",
          activityDescription: "Capacity building training for primary mathematics subject coordinators.",
          programme: "Provincial Quality Education",
          vote: "701-02-05",
          venue: "Zonal Education Office Auditorium, Matara",
          date: new Date("2026-03-15"),
          fundingSource: "Provincial Education Grant",
          estimateAuthorizationCircular: "ED/SP/ACC/2026/02",
          referenceFileNo: "MAT/ED/BUD/26/102",
          invitedParticipants: "45 Primary Subject Coordinators and 5 Resource Persons",
          estimatedTotal: 84000,
          advanceDate: new Date("2026-03-01"),
          advanceAmount: 80000,
          totalExpenditure: 84000,
          balance: -4000,
          deficitAmount: 4000,
          preparedBy: user.name,
          status: "approved",
          items: {
            create: [
              { category: "Resource Allowance 1", rate: 3000, quantity: 2, daysHours: 2, amount: 12000 },
              { category: "Hall Charges", rate: 10000, quantity: 1, daysHours: 2, amount: 20000 },
              { category: "Refreshment cost", rate: 400, quantity: 50, daysHours: 2, amount: 40000 },
              { category: "Stationery Cost", rate: 240, quantity: 50, daysHours: 1, amount: 12000 },
            ],
          },
        },
      });

      // Also create an approved Actual Budget settlement
      await prisma.actualBudget.create({
        data: {
          estimatedBudgetId: budget.id,
          userId: user.id,
          actualTotal: 82500,
          balance: -2500,
          deficitAmount: 2500,
          preparedBy: user.name,
          status: "approved",
          items: {
            create: [
              {
                category: "Resource Allowance 1",
                estRate: 3000,
                estQuantity: 2,
                estDaysHours: 2,
                estAmount: 12000,
                actualRate: 3000,
                actualQuantity: 2,
                actualDaysHours: 2,
                actualAmount: 12000,
              },
              {
                category: "Hall Charges",
                estRate: 10000,
                estQuantity: 1,
                estDaysHours: 2,
                estAmount: 20000,
                actualRate: 10000,
                actualQuantity: 1,
                actualDaysHours: 2,
                actualAmount: 20000,
              },
              {
                category: "Refreshment cost",
                estRate: 400,
                estQuantity: 50,
                estDaysHours: 2,
                estAmount: 40000,
                actualRate: 385,
                actualQuantity: 50,
                actualDaysHours: 2,
                actualAmount: 38500,
              },
              {
                category: "Stationery Cost",
                estRate: 240,
                estQuantity: 50,
                estDaysHours: 1,
                estAmount: 12000,
                actualRate: 240,
                actualQuantity: 50,
                actualDaysHours: 1,
                actualAmount: 12000,
              },
            ],
          },
        },
      });
      console.log("✓ Sample Estimated & Actual Budgets seeded");
    }
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from '../lib/prisma';
import bcryptjs from 'bcryptjs';

async function main() {
  // Create main admin user (sergio@specialized247.com)
  const mainAdminPassword = await bcryptjs.hash('S3rch126', 10);
  await prisma.user.upsert({
    where: { email: 'sergio@specialized247.com' },
    update: {},
    create: {
      email: 'sergio@specialized247.com',
      password: mainAdminPassword,
      name: 'Sergio',
      role: 'admin',
    },
  });

  // Create super admin user (sordaze@gmail.com)
  const superAdminPassword = await bcryptjs.hash('S3rch126', 10);
  await prisma.user.upsert({
    where: { email: 'sordaze@gmail.com' },
    update: {},
    create: {
      email: 'sordaze@gmail.com',
      password: superAdminPassword,
      name: 'Sordaze',
      role: 'admin',
    },
  });

  // Create admin user (john@doe.com - hidden test account)
  const adminPassword = await bcryptjs.hash('johndoe123', 10);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: adminPassword,
      name: 'John Doe',
      role: 'admin',
    },
  });

  // Create test user (for testing signup flow)
  const testPassword = await bcryptjs.hash('Test123!', 10);
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: testPassword,
      name: 'Test User',
      role: 'user',
    },
  });

  // Create sample jobs (5 test positions)
  const jobs = [
    {
      title: 'Senior Software Engineer',
      description: 'We are looking for an experienced software engineer to join our growing team. You will work on cutting-edge technologies and mentor junior engineers.',
      department: 'Engineering',
      location: 'New York, NY',
      jobType: 'Full-time',
    },
    {
      title: 'Product Manager',
      description: 'Lead product strategy and roadmap for our flagship product. Experience with SaaS products is essential.',
      department: 'Product',
      location: 'San Francisco, CA',
      jobType: 'Full-time',
    },
    {
      title: 'UX Designer',
      description: 'Design intuitive and beautiful user interfaces. We are looking for someone passionate about user experience.',
      department: 'Design',
      location: 'Remote',
      jobType: 'Full-time',
    },
    {
      title: 'Data Analyst',
      description: 'Analyze large datasets and provide insights to drive business decisions.',
      department: 'Analytics',
      location: 'Chicago, IL',
      jobType: 'Full-time',
    },
    {
      title: 'Marketing Manager',
      description: 'Develop and execute marketing strategies to increase brand awareness.',
      department: 'Marketing',
      location: 'Los Angeles, CA',
      jobType: 'Full-time',
    },
  ];

  for (const job of jobs) {
    const existingJob = await prisma.job.findFirst({
      where: { title: job.title },
    });
    
    if (!existingJob) {
      await prisma.job.create({
        data: job,
      });
    }
  }

  // Set default app settings
  await prisma.appSetting.upsert({
    where: { key: 'jobBoardPublic' },
    update: {},
    create: { key: 'jobBoardPublic', value: 'false' },
  });
  await prisma.appSetting.upsert({
    where: { key: 'maxPositions' },
    update: {},
    create: { key: 'maxPositions', value: '100' },
  });

  // Create sample email templates
  const templates = [
    {
      name: 'Welcome Email',
      subject: 'Welcome to {{company}}',
      body: 'Hi {{name}},\n\nWelcome to our team! We are excited to have you on board.\n\nBest regards,\nHR Team',
    },
    {
      name: 'Rejection Email',
      subject: 'Application Status Update',
      body: 'Hi {{name}},\n\nThank you for applying for the {{position}} role. We appreciate your interest and effort.\n\nUnfortunately, we have decided to move forward with other candidates.\n\nBest regards,\nHR Team',
    },
    {
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {{position}}',
      body: 'Hi {{name}},\n\nWe would like to invite you for an interview for the {{position}} role.\n\nPlease let us know your availability.\n\nBest regards,\nHR Team',
    },
  ];

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

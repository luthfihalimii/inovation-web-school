import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ============================================
  // 1. CREATE DEFAULT ADMIN USER
  // ============================================
  console.log('📝 Creating default admin user...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smkn1surabaya.sch.id' },
    update: {},
    create: {
      email: 'admin@smkn1surabaya.sch.id',
      name: 'Administrator',
      role: 'ADMIN',
      emailVerified: true,
      admin: {
        create: {
          position: 'Kepala Sekolah',
          phone: '031-1234567',
        },
      },
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // ============================================
  // 2. CREATE ACADEMIC YEAR
  // ============================================
  console.log('📅 Creating academic year...');

  const academicYear = await prisma.academicYear.upsert({
    where: { year: '2024/2025' },
    update: {},
    create: {
      year: '2024/2025',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2025-06-30'),
      isActive: true,
    },
  });
  console.log('✅ Academic year created:', academicYear.year);

  // ============================================
  // 3. CREATE SEMESTERS
  // ============================================
  console.log('📚 Creating semesters...');

  const semesterGanjil = await prisma.semester.upsert({
    where: {
      academicYearId_type: {
        academicYearId: academicYear.id,
        type: 'GANJIL',
      },
    },
    update: {},
    create: {
      academicYearId: academicYear.id,
      type: 'GANJIL',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    },
  });

  const semesterGenap = await prisma.semester.upsert({
    where: {
      academicYearId_type: {
        academicYearId: academicYear.id,
        type: 'GENAP',
      },
    },
    update: {},
    create: {
      academicYearId: academicYear.id,
      type: 'GENAP',
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-06-30'),
      isActive: false,
    },
  });
  console.log('✅ Semesters created');

  // ============================================
  // 4. CREATE MAJORS (JURUSAN)
  // ============================================
  console.log('🎓 Creating majors...');

  const majors = [
    {
      code: 'TKJ',
      name: 'Teknik Komputer dan Jaringan',
      description: 'Program keahlian yang mempelajari cara instalasi PC, instalasi LAN, troubleshooting jaringan, dan membuat sistem keamanan jaringan.',
    },
    {
      code: 'RPL',
      name: 'Rekayasa Perangkat Lunak',
      description: 'Program keahlian yang mempelajari pemrograman komputer, pengembangan aplikasi web dan mobile, serta database management.',
    },
    {
      code: 'MM',
      name: 'Multimedia',
      description: 'Program keahlian yang mempelajari desain grafis, animasi, video editing, fotografi, dan pembuatan konten multimedia.',
    },
    {
      code: 'TKRO',
      name: 'Teknik Kendaraan Ringan Otomotif',
      description: 'Program keahlian yang mempelajari perawatan, perbaikan, dan teknologi kendaraan ringan.',
    },
    {
      code: 'TEI',
      name: 'Teknik Elektronika Industri',
      description: 'Program keahlian yang mempelajari sistem kontrol elektronik, PLC, dan otomasi industri.',
    },
  ];

  const createdMajors: any[] = [];
  for (const major of majors) {
    const created = await prisma.major.upsert({
      where: { code: major.code },
      update: {},
      create: major,
    });
    createdMajors.push(created);
    console.log(`  ✅ ${major.name}`);
  }

  // ============================================
  // 5. CREATE COMMON SUBJECTS
  // ============================================
  console.log('📖 Creating subjects...');

  const commonSubjects = [
    // Mata Pelajaran Umum
    { code: 'PAI', name: 'Pendidikan Agama Islam', isCore: true, credits: 3 },
    { code: 'PPKN', name: 'Pendidikan Pancasila dan Kewarganegaraan', isCore: true, credits: 2 },
    { code: 'BIND', name: 'Bahasa Indonesia', isCore: true, credits: 4 },
    { code: 'MTK', name: 'Matematika', isCore: true, credits: 4 },
    { code: 'BING', name: 'Bahasa Inggris', isCore: true, credits: 3 },
    { code: 'SEJARAH', name: 'Sejarah Indonesia', isCore: true, credits: 2 },
    { code: 'PJOK', name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', isCore: true, credits: 2 },
    { code: 'SBK', name: 'Seni Budaya', isCore: true, credits: 2 },
    { code: 'PKWU', name: 'Prakarya dan Kewirausahaan', isCore: true, credits: 2 },
  ];

  // TKJ Subjects
  const tkjMajor = createdMajors.find((m) => m.code === 'TKJ');
  const tkjSubjects = [
    { code: 'TKJ-JARKOM', name: 'Jaringan Komputer', majorId: tkjMajor?.id, isCore: true, credits: 6 },
    { code: 'TKJ-SISKO', name: 'Sistem Komputer', majorId: tkjMajor?.id, isCore: true, credits: 4 },
    { code: 'TKJ-ADSIS', name: 'Administrasi Sistem', majorId: tkjMajor?.id, isCore: true, credits: 4 },
    { code: 'TKJ-KEAMANAN', name: 'Keamanan Jaringan', majorId: tkjMajor?.id, isCore: true, credits: 4 },
  ];

  // RPL Subjects
  const rplMajor = createdMajors.find((m) => m.code === 'RPL');
  const rplSubjects = [
    { code: 'RPL-PEMWEB', name: 'Pemrograman Web', majorId: rplMajor?.id, isCore: true, credits: 6 },
    { code: 'RPL-MOBILE', name: 'Pemrograman Mobile', majorId: rplMajor?.id, isCore: true, credits: 6 },
    { code: 'RPL-BASIS-DATA', name: 'Basis Data', majorId: rplMajor?.id, isCore: true, credits: 4 },
    { code: 'RPL-PBO', name: 'Pemrograman Berorientasi Objek', majorId: rplMajor?.id, isCore: true, credits: 4 },
  ];

  // MM Subjects
  const mmMajor = createdMajors.find((m) => m.code === 'MM');
  const mmSubjects = [
    { code: 'MM-DG', name: 'Desain Grafis', majorId: mmMajor?.id, isCore: true, credits: 6 },
    { code: 'MM-ANIMASI', name: 'Animasi 2D/3D', majorId: mmMajor?.id, isCore: true, credits: 6 },
    { code: 'MM-VIDEO', name: 'Video Editing', majorId: mmMajor?.id, isCore: true, credits: 4 },
    { code: 'MM-FOTOGRAFI', name: 'Fotografi', majorId: mmMajor?.id, isCore: true, credits: 4 },
  ];

  const allSubjects = [...commonSubjects, ...tkjSubjects, ...rplSubjects, ...mmSubjects];

  for (const subject of allSubjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: subject,
    });
    console.log(`  ✅ ${subject.name}`);
  }

  // ============================================
  // 6. CREATE BADGES (GAMIFICATION)
  // ============================================
  console.log('🏆 Creating badges...');

  const badges = [
    {
      name: 'Perfect Attendance',
      description: 'Hadir 100% dalam satu bulan',
      icon: '🎯',
      category: 'ATTENDANCE',
      criteria: { type: 'attendance', target: 100, period: 'monthly' },
      points: 50,
      rarity: 'RARE',
    },
    {
      name: 'Top Student',
      description: 'Masuk ranking 3 besar di kelas',
      icon: '🌟',
      category: 'ACADEMIC',
      criteria: { type: 'grade', rank: [1, 2, 3] },
      points: 100,
      rarity: 'EPIC',
    },
    {
      name: 'Early Bird',
      description: 'Selalu datang tepat waktu selama 1 minggu',
      icon: '🐦',
      category: 'ATTENDANCE',
      criteria: { type: 'punctuality', streak: 5 },
      points: 25,
      rarity: 'COMMON',
    },
    {
      name: 'Assignment Master',
      description: 'Mengumpulkan semua tugas tepat waktu dalam 1 bulan',
      icon: '📝',
      category: 'ACADEMIC',
      criteria: { type: 'assignment', completion: 100, period: 'monthly' },
      points: 75,
      rarity: 'RARE',
    },
    {
      name: 'Competition Winner',
      description: 'Menjuarai lomba tingkat kota atau lebih tinggi',
      icon: '🏅',
      category: 'ACHIEVEMENT',
      criteria: { type: 'achievement', level: ['KOTA', 'PROVINSI', 'NASIONAL', 'INTERNASIONAL'] },
      points: 200,
      rarity: 'LEGENDARY',
    },
    {
      name: 'Active Participant',
      description: 'Aktif dalam diskusi kelas (minimal 10 post per bulan)',
      icon: '💬',
      category: 'PARTICIPATION',
      criteria: { type: 'discussion', posts: 10, period: 'monthly' },
      points: 30,
      rarity: 'COMMON',
    },
    {
      name: 'Quiz Champion',
      description: 'Mendapat nilai sempurna dalam 5 quiz',
      icon: '🧠',
      category: 'ACADEMIC',
      criteria: { type: 'quiz', perfect: 5 },
      points: 150,
      rarity: 'EPIC',
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
    console.log(`  ✅ ${badge.icon} ${badge.name}`);
  }

  // ============================================
  // 7. CREATE SAMPLE CLASSES
  // ============================================
  console.log('🏫 Creating sample classes...');

  for (const major of createdMajors.slice(0, 3)) {
    // Create classes for grades 10, 11, 12
    for (let grade = 10; grade <= 12; grade++) {
      for (let section = 1; section <= 2; section++) {
        await prisma.class.create({
          data: {
            academicYearId: academicYear.id,
            majorId: major.id,
            grade,
            section: section.toString(),
            name: `${grade} ${major.code} ${section}`,
            maxStudents: 36,
          },
        });
        console.log(`  ✅ ${grade} ${major.code} ${section}`);
      }
    }
  }

  console.log('\n✨ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('  - 1 Admin user');
  console.log('  - 1 Academic year');
  console.log('  - 2 Semesters');
  console.log(`  - ${createdMajors.length} Majors`);
  console.log(`  - ${allSubjects.length} Subjects`);
  console.log(`  - ${badges.length} Badges`);
  console.log('  - 18 Classes');
  console.log('\n🔐 Default Admin Credentials:');
  console.log('  Email: admin@smkn1surabaya.sch.id');
  console.log('  Password: (Set via BetterAuth registration)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

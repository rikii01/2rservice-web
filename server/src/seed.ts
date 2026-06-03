import 'dotenv/config'
import bcrypt from 'bcryptjs'
import prisma from './lib/prisma.js'

async function seed() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@2rservice.com' },
    update: {},
    create: {
      nama: 'Admin 2R Service',
      email: 'admin@2rservice.com',
      noHp: '081234567890',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  })
  console.log(`✅ Admin created: ${admin.email}`)

  // Create sample customer
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      nama: 'Budi Santoso',
      email: 'user@example.com',
      noHp: '089876543210',
      password: userPassword,
      role: 'PELANGGAN',
    },
  })
  console.log(`✅ User created: ${user.email}`)

  // Seed catalog items
  const catalogItems = [
    { nama: 'Oli Yamalube Super 4T 1L', kategori: 'Oli', merk: 'Yamalube', harga: 45000, stok: 25, satuan: 'botol', deskripsi: 'Oli mesin motor 4-tak, cocok untuk motor Yamaha.' },
    { nama: 'Oli Federal Matic 0.8L', kategori: 'Oli', merk: 'Federal', harga: 38000, stok: 18, satuan: 'botol', deskripsi: 'Oli khusus motor matic, perlindungan mesin optimal.' },
    { nama: 'Oli Castrol Power1 1L', kategori: 'Oli', merk: 'Castrol', harga: 65000, stok: 10, satuan: 'botol', deskripsi: 'Performa tinggi untuk motor sport.' },
    { nama: 'Kampas Rem Depan Honda Beat', kategori: 'Rem', merk: 'Aspira', harga: 35000, stok: 12, satuan: 'set', deskripsi: 'Kampas rem depan disc brake untuk Honda Beat.' },
    { nama: 'Kampas Rem Belakang Vario', kategori: 'Rem', merk: 'Indoparts', harga: 28000, stok: 8, satuan: 'set', deskripsi: 'Kampas rem tromol belakang untuk Vario series.' },
    { nama: 'Busi NGK CPR9EA-9', kategori: 'Busi', merk: 'NGK', harga: 45000, stok: 30, satuan: 'pcs', deskripsi: 'Busi standar untuk motor injeksi Yamaha & Honda.' },
    { nama: 'Busi Iridium Denso IU24', kategori: 'Busi', merk: 'Denso', harga: 85000, stok: 5, satuan: 'pcs', deskripsi: 'Busi iridium performa tinggi, lebih awet.' },
    { nama: 'Ban Luar IRC NR73 80/90-14', kategori: 'Ban', merk: 'IRC', harga: 185000, stok: 6, satuan: 'pcs', deskripsi: 'Ban tubetype untuk motor matic ring 14.' },
    { nama: 'Ban Dalam Swallow 90/90-14', kategori: 'Ban', merk: 'Swallow', harga: 35000, stok: 15, satuan: 'pcs', deskripsi: 'Ban dalam berkualitas untuk motor matic.' },
    { nama: 'Rantai Kit SSS 428H', kategori: 'Rantai', merk: 'SSS', harga: 250000, stok: 4, satuan: 'set', deskripsi: 'Rantai kit lengkap (rantai + gear depan + gear belakang).' },
    { nama: 'V-Belt Honda Vario 125', kategori: 'Sparepart', merk: 'Honda Genuine', harga: 120000, stok: 7, satuan: 'pcs', deskripsi: 'V-Belt original Honda untuk Vario 125/150.' },
    { nama: 'Air Radiator Coolant 1L', kategori: 'Aksesoris', merk: 'Top1', harga: 30000, stok: 0, satuan: 'botol', deskripsi: 'Cairan pendingin radiator untuk motor liquid-cooled.' },
  ]

  for (const item of catalogItems) {
    await prisma.catalogItem.upsert({
      where: { id: item.nama }, // will fail match, forces create
      update: {},
      create: item,
    })
  }
  console.log(`✅ ${catalogItems.length} catalog items seeded`)

  console.log('🎉 Seeding complete!')
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

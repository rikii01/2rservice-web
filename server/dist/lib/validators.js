import { z } from 'zod';
export const registerSchema = z.object({
    nama: z
        .string()
        .min(2, 'Nama minimal 2 karakter')
        .max(100, 'Nama maksimal 100 karakter'),
    email: z
        .string()
        .email('Format email tidak valid'),
    noHp: z
        .string()
        .min(10, 'Nomor HP minimal 10 digit')
        .max(15, 'Nomor HP maksimal 15 digit'),
    password: z
        .string()
        .min(6, 'Password minimal 6 karakter')
        .max(100, 'Password maksimal 100 karakter'),
});
export const loginSchema = z.object({
    email: z
        .string()
        .email('Format email tidak valid'),
    password: z
        .string()
        .min(1, 'Password harus diisi'),
});
export const catalogItemSchema = z.object({
    nama: z
        .string()
        .min(2, 'Nama barang minimal 2 karakter')
        .max(200, 'Nama barang maksimal 200 karakter'),
    kategori: z
        .string()
        .min(1, 'Kategori harus diisi'),
    merk: z
        .string()
        .max(100, 'Merk maksimal 100 karakter')
        .optional()
        .nullable(),
    harga: z
        .number({ invalid_type_error: 'Harga harus berupa angka' })
        .int('Harga harus bilangan bulat')
        .min(0, 'Harga tidak boleh negatif'),
    stok: z
        .number({ invalid_type_error: 'Stok harus berupa angka' })
        .int('Stok harus bilangan bulat')
        .min(0, 'Stok tidak boleh negatif')
        .default(0),
    satuan: z
        .string()
        .max(20, 'Satuan maksimal 20 karakter')
        .default('pcs'),
    deskripsi: z
        .string()
        .max(1000, 'Deskripsi maksimal 1000 karakter')
        .optional()
        .nullable(),
    gambar: z
        .string()
        .url('Format URL gambar tidak valid')
        .optional()
        .nullable(),
});
export const catalogUpdateSchema = catalogItemSchema.partial();
export const queueCreateSchema = z.object({
    kategoriServis: z
        .string()
        .min(1, 'Kategori servis harus dipilih'),
    merkMotor: z
        .string()
        .min(2, 'Merk/Tipe motor harus diisi')
        .max(100, 'Merk/Tipe motor maksimal 100 karakter'),
    platNomor: z
        .string()
        .min(3, 'Nomor polisi/plat motor harus diisi')
        .max(20, 'Nomor polisi/plat motor maksimal 20 karakter'),
    keluhan: z
        .string()
        .max(1000, 'Keluhan maksimal 1000 karakter')
        .optional()
        .nullable(),
});
export const queueUpdateStatusSchema = z.object({
    status: z.enum(['MENUNGGU', 'PROSES', 'SELESAI', 'BATAL'], {
        errorMap: () => ({ message: 'Status antrian tidak valid' }),
    }),
});

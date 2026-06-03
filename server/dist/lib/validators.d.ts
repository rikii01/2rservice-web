import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    nama: z.ZodString;
    email: z.ZodString;
    noHp: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nama: string;
    email: string;
    noHp: string;
    password: string;
}, {
    nama: string;
    email: string;
    noHp: string;
    password: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const catalogItemSchema: z.ZodObject<{
    nama: z.ZodString;
    kategori: z.ZodString;
    merk: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    harga: z.ZodNumber;
    stok: z.ZodDefault<z.ZodNumber>;
    satuan: z.ZodDefault<z.ZodString>;
    deskripsi: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    gambar: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    nama: string;
    kategori: string;
    harga: number;
    stok: number;
    satuan: string;
    merk?: string | null | undefined;
    deskripsi?: string | null | undefined;
    gambar?: string | null | undefined;
}, {
    nama: string;
    kategori: string;
    harga: number;
    merk?: string | null | undefined;
    stok?: number | undefined;
    satuan?: string | undefined;
    deskripsi?: string | null | undefined;
    gambar?: string | null | undefined;
}>;
export declare const catalogUpdateSchema: z.ZodObject<{
    nama: z.ZodOptional<z.ZodString>;
    kategori: z.ZodOptional<z.ZodString>;
    merk: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    harga: z.ZodOptional<z.ZodNumber>;
    stok: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    satuan: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    deskripsi: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    gambar: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    nama?: string | undefined;
    kategori?: string | undefined;
    merk?: string | null | undefined;
    harga?: number | undefined;
    stok?: number | undefined;
    satuan?: string | undefined;
    deskripsi?: string | null | undefined;
    gambar?: string | null | undefined;
}, {
    nama?: string | undefined;
    kategori?: string | undefined;
    merk?: string | null | undefined;
    harga?: number | undefined;
    stok?: number | undefined;
    satuan?: string | undefined;
    deskripsi?: string | null | undefined;
    gambar?: string | null | undefined;
}>;
export declare const queueCreateSchema: z.ZodObject<{
    kategoriServis: z.ZodString;
    merkMotor: z.ZodString;
    platNomor: z.ZodString;
    keluhan: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    kategoriServis: string;
    merkMotor: string;
    platNomor: string;
    keluhan?: string | null | undefined;
}, {
    kategoriServis: string;
    merkMotor: string;
    platNomor: string;
    keluhan?: string | null | undefined;
}>;
export declare const queueUpdateStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["MENUNGGU", "PROSES", "SELESAI", "BATAL"]>;
}, "strip", z.ZodTypeAny, {
    status: "MENUNGGU" | "PROSES" | "SELESAI" | "BATAL";
}, {
    status: "MENUNGGU" | "PROSES" | "SELESAI" | "BATAL";
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CatalogItemInput = z.infer<typeof catalogItemSchema>;
export type CatalogUpdateInput = z.infer<typeof catalogUpdateSchema>;
export type QueueCreateInput = z.infer<typeof queueCreateSchema>;
export type QueueUpdateStatusInput = z.infer<typeof queueUpdateStatusSchema>;

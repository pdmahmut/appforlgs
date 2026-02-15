-- Add profile fields to students

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS ad_soyad TEXT,
  ADD COLUMN IF NOT EXISTS sinif TEXT,
  ADD COLUMN IF NOT EXISTS okul_numarasi TEXT,
  ADD COLUMN IF NOT EXISTS kayit_tarihi DATE;

-- Add deneme_tipi to exams

ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS deneme_tipi TEXT;

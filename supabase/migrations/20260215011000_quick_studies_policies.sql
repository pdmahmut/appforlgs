-- RLS policies for quick_studies (public CRUD)

ALTER TABLE public.quick_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read quick_studies" ON public.quick_studies
  FOR SELECT USING (true);

CREATE POLICY "public write quick_studies" ON public.quick_studies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public update quick_studies" ON public.quick_studies
  FOR UPDATE USING (true);

CREATE POLICY "public delete quick_studies" ON public.quick_studies
  FOR DELETE USING (true);

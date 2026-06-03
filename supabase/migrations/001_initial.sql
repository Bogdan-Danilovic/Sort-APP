-- ============================================================
-- MergeKit — Supabase početna migracija
-- Pokretati u Supabase SQL editoru (Dashboard → SQL Editor)
-- ============================================================

-- Tabela sesija spajanja
CREATE TABLE IF NOT EXISTS public.merge_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_name TEXT NOT NULL DEFAULT 'Bez naziva',
  source_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  merged_result JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes       TEXT
);

-- Tabela uploadovanih fajlova
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  UUID REFERENCES public.merge_sessions(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,
  file_type   TEXT NOT NULL DEFAULT 'txt',
  raw_content TEXT NOT NULL DEFAULT '',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indeksi ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS merge_sessions_user_id_idx
  ON public.merge_sessions(user_id);

CREATE INDEX IF NOT EXISTS merge_sessions_created_at_idx
  ON public.merge_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS uploaded_files_user_id_idx
  ON public.uploaded_files(user_id);

CREATE INDEX IF NOT EXISTS uploaded_files_session_id_idx
  ON public.uploaded_files(session_id);

-- ─── Row Level Security (RLS) ─────────────────────────────────

-- Aktiviraj RLS
ALTER TABLE public.merge_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Politike za merge_sessions
-- SELECT: korisnik vidi samo svoje sesije
CREATE POLICY "Korisnici vide samo svoje sesije"
  ON public.merge_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: korisnik može da kreira svoje sesije
CREATE POLICY "Korisnici kreiraju svoje sesije"
  ON public.merge_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: korisnik može da menja svoje sesije
CREATE POLICY "Korisnici menjaju svoje sesije"
  ON public.merge_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: korisnik može da briše svoje sesije
CREATE POLICY "Korisnici brisu svoje sesije"
  ON public.merge_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Politike za uploaded_files
CREATE POLICY "Korisnici vide samo svoje fajlove"
  ON public.uploaded_files
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Korisnici kreiraju svoje fajlove"
  ON public.uploaded_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Korisnici menjaju svoje fajlove"
  ON public.uploaded_files
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Korisnici brisu svoje fajlove"
  ON public.uploaded_files
  FOR DELETE
  USING (auth.uid() = user_id);

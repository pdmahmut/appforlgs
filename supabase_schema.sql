-- Schema for Öğrenci Takip Sistemi

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  backend_id TEXT UNIQUE,
  student_name TEXT NOT NULL,
  student_surname TEXT NOT NULL,
  student_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_backend_id ON students(backend_id);

CREATE TABLE IF NOT EXISTS studies (
  id SERIAL PRIMARY KEY,
  backend_id TEXT UNIQUE,
  student_backend_id TEXT,
  study_date DATE,
  study_subjects JSONB,
  study_total_net NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_study_student FOREIGN KEY(student_backend_id) REFERENCES students(backend_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_studies_student_backend_id ON studies(student_backend_id);

CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  backend_id TEXT UNIQUE,
  student_backend_id TEXT,
  exam_name TEXT,
  exam_date DATE,
  exam_subjects JSONB,
  exam_total_net NUMERIC,
  defined_exam_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_exam_student FOREIGN KEY(student_backend_id) REFERENCES students(backend_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_exams_student_backend_id ON exams(student_backend_id);

CREATE TABLE IF NOT EXISTS defined_exams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  exam_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

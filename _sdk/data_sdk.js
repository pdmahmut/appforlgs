// Data SDK - Supabase tabanlı veri yönetimi
(function initDataSdk() {
  const SUPABASE_URL =
    (window.__APP_CONFIG && window.__APP_CONFIG.SUPABASE_URL) ||
    'https://mnwxfknxkwwurrevmlri.supabase.co';
  const SUPABASE_ANON_KEY =
    (window.__APP_CONFIG && window.__APP_CONFIG.SUPABASE_ANON_KEY) ||
    'sb_publishable_qci3p2BNw3oqVNwd4Fhq9A_pgwOZrpc';

  function createBackendId(prefix) {
    const rand = Math.random().toString(36).slice(2, 10);
    return `${prefix}-${Date.now()}-${rand}`;
  }

  function safeJson(value) {
    if (value == null) return null;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return value;
  }

  function mapRowToRecord(type, row) {
    if (!row) return null;
    if (type === 'student') {
      return {
        type,
        __backendId: row.backend_id || String(row.id),
        student_name: row.student_name,
        student_surname: row.student_surname,
        student_number: row.student_number,
        ad_soyad: row.ad_soyad,
        sinif: row.sinif,
        okul_numarasi: row.okul_numarasi,
        kayit_tarihi: row.kayit_tarihi,
        created_at: row.created_at,
      };
    }
    if (type === 'study') {
      return {
        type,
        __backendId: row.backend_id || String(row.id),
        student_id: row.student_backend_id,
        study_date: row.study_date,
        study_subjects: row.study_subjects,
        study_total_net: row.study_total_net,
        created_at: row.created_at,
      };
    }
    if (type === 'exam') {
      return {
        type,
        __backendId: row.backend_id || String(row.id),
        student_id: row.student_backend_id,
        exam_name: row.exam_name,
        exam_date: row.exam_date,
        exam_subjects: row.exam_subjects,
        exam_total_net: row.exam_total_net,
        defined_exam_id: row.defined_exam_id,
        deneme_tipi: row.deneme_tipi,
        created_at: row.created_at,
      };
    }
    if (type === 'defined_exam') {
      return {
        type,
        __backendId: String(row.id),
        name: row.name,
        exam_date: row.exam_date,
        created_at: row.created_at,
      };
    }
    if (type === 'quick_study') {
      return {
        type,
        __backendId: row.backend_id || String(row.id),
        student_id: row.student_id,
        study_date: row.study_date,
        tur_d: row.tur_d,
        tur_y: row.tur_y,
        tur_b: row.tur_b,
        mat_d: row.mat_d,
        mat_y: row.mat_y,
        mat_b: row.mat_b,
        fen_d: row.fen_d,
        fen_y: row.fen_y,
        fen_b: row.fen_b,
        ink_d: row.ink_d,
        ink_y: row.ink_y,
        ink_b: row.ink_b,
        din_d: row.din_d,
        din_y: row.din_y,
        din_b: row.din_b,
        ing_d: row.ing_d,
        ing_y: row.ing_y,
        ing_b: row.ing_b,
        created_at: row.created_at,
      };
    }
    return null;
  }

  window.dataSdk = {
    _store: [],
    _supabase: null,
    _dataHandler: null,

    _notify() {
      const snapshot = [...this._store];
      console.log('[dataSdk._notify] Called with store size:', snapshot.length);
      if (this._dataHandler && typeof this._dataHandler.onDataChanged === 'function') {
        console.log('[dataSdk._notify] Calling dataHandler.onDataChanged');
        this._dataHandler.onDataChanged(snapshot);
      }
      if (typeof window.notifyDataChange === 'function') {
        console.log('[dataSdk._notify] Calling window.notifyDataChange');
        window.notifyDataChange(snapshot);
      } else {
        console.log('[dataSdk._notify] window.notifyDataChange not available');
      }
    },

    async init(dataHandler) {
      this._dataHandler = dataHandler || null;
      if (!window.supabase || !window.supabase.createClient) {
        return { isOk: false, error: 'Supabase client not loaded' };
      }
      this._supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return this.initialize();
    },

    async initialize() {
      try {
        console.log('[dataSdk.initialize] Starting');
        const client = this._supabase;
        if (!client) {
          console.log('[dataSdk.initialize] No Supabase client');
          return { isOk: false, error: 'Supabase client missing' };
        }

        console.log('[dataSdk.initialize] Fetching all tables');
        const [studentsRes, studiesRes, examsRes, definedRes, quickRes] = await Promise.all([
          client.from('students').select('*'),
          client.from('studies').select('*'),
          client.from('exams').select('*'),
          client.from('defined_exams').select('*'),
          client.from('quick_studies').select('*'),
        ]);

        console.log('[dataSdk.initialize] Fetch results:', {
          students: studentsRes.data?.length || 0,
          studies: studiesRes.data?.length || 0,
          exams: examsRes.data?.length || 0,
          defined_exams: definedRes.data?.length || 0,
          quick_studies: quickRes.data?.length || 0
        });

        if (studentsRes.error || studiesRes.error || examsRes.error || definedRes.error || quickRes.error) {
          const error =
            studentsRes.error || studiesRes.error || examsRes.error || definedRes.error || quickRes.error;
          console.log('[dataSdk.initialize] Error:', error);
          return { isOk: false, error: error.message };
        }

        const students = (studentsRes.data || []).map((r) => mapRowToRecord('student', r));
        const studies = (studiesRes.data || []).map((r) => mapRowToRecord('study', r));
        const exams = (examsRes.data || []).map((r) => mapRowToRecord('exam', r));
        const definedExams = (definedRes.data || []).map((r) => mapRowToRecord('defined_exam', r));
        const quickStudies = (quickRes.data || []).map((r) => mapRowToRecord('quick_study', r));

        this._store = [...students, ...studies, ...exams, ...definedExams, ...quickStudies].filter(Boolean);
        console.log('[dataSdk.initialize] Store updated with', this._store.length, 'records');
        this._notify();
        return { isOk: true };
      } catch (error) {
        console.error('[dataSdk.initialize] Caught error:', error);
        return { isOk: false, error: error.message };
      }
    },

    async create(data) {
      try {
        const client = this._supabase;
        if (!client) return { isOk: false, error: 'Supabase client missing' };
        if (!data || !data.type) return { isOk: false, error: 'Missing type' };

        if (data.type === 'student') {
          const backendId = data.__backendId || createBackendId('student');
          const payload = {
            backend_id: backendId,
            student_name: data.student_name,
            student_surname: data.student_surname,
            student_number: data.student_number || null,
            ad_soyad: data.ad_soyad || null,
            sinif: data.sinif || null,
            okul_numarasi: data.okul_numarasi || null,
            kayit_tarihi: data.kayit_tarihi || null,
            created_at: data.created_at || new Date().toISOString(),
          };
          const res = await client.from('students').insert(payload).select('*').single();
          if (res.error) throw res.error;
          const record = mapRowToRecord('student', res.data);
          this._store.push(record);
          this._notify();
          return { isOk: true, data: record };
        }

        if (data.type === 'study') {
          const backendId = data.__backendId || createBackendId('study');
          const payload = {
            backend_id: backendId,
            student_backend_id: data.student_id || data.student_backend_id || null,
            study_date: data.study_date || null,
            study_subjects: safeJson(data.study_subjects),
            study_total_net: data.study_total_net || null,
            created_at: data.created_at || new Date().toISOString(),
          };
          const res = await client.from('studies').insert(payload).select('*').single();
          if (res.error) throw res.error;
          const record = mapRowToRecord('study', res.data);
          this._store.push(record);
          this._notify();
          return { isOk: true, data: record };
        }

        if (data.type === 'exam') {
          const backendId = data.__backendId || createBackendId('exam');
          const payload = {
            backend_id: backendId,
            student_backend_id: data.student_id || data.student_backend_id || null,
            exam_name: data.exam_name || null,
            exam_date: data.exam_date || null,
            exam_subjects: safeJson(data.exam_subjects),
            exam_total_net: data.exam_total_net || null,
            defined_exam_id: data.defined_exam_id ? Number(data.defined_exam_id) : null,
            deneme_tipi: data.deneme_tipi || null,
            created_at: data.created_at || new Date().toISOString(),
          };
          const res = await client.from('exams').insert(payload).select('*').single();
          if (res.error) throw res.error;
          const record = mapRowToRecord('exam', res.data);
          this._store.push(record);
          this._notify();
          return { isOk: true, data: record };
        }

        if (data.type === 'defined_exam') {
          const payload = {
            name: data.name,
            exam_date: data.exam_date || null,
            created_at: data.created_at || new Date().toISOString(),
          };
          const res = await client.from('defined_exams').insert(payload).select('*').single();
          if (res.error) throw res.error;
          const record = mapRowToRecord('defined_exam', res.data);
          this._store.push(record);
          this._notify();
          return { isOk: true, data: record };
        }

        if (data.type === 'quick_study') {
          const backendId = data.__backendId || createBackendId('quick_study');
          const payload = {
            backend_id: backendId,
            student_id: data.student_id || null,
            study_date: data.study_date || null,
            tur_d: data.tur_d || 0,
            tur_y: data.tur_y || 0,
            tur_b: data.tur_b || 0,
            mat_d: data.mat_d || 0,
            mat_y: data.mat_y || 0,
            mat_b: data.mat_b || 0,
            fen_d: data.fen_d || 0,
            fen_y: data.fen_y || 0,
            fen_b: data.fen_b || 0,
            ink_d: data.ink_d || 0,
            ink_y: data.ink_y || 0,
            ink_b: data.ink_b || 0,
            din_d: data.din_d || 0,
            din_y: data.din_y || 0,
            din_b: data.din_b || 0,
            ing_d: data.ing_d || 0,
            ing_y: data.ing_y || 0,
            ing_b: data.ing_b || 0,
            created_at: data.created_at || new Date().toISOString(),
          };
          const res = await client.from('quick_studies').insert(payload).select('*').single();
          if (res.error) throw res.error;
          const record = mapRowToRecord('quick_study', res.data);
          this._store.push(record);
          this._notify();
          return { isOk: true, data: record };
        }

        return { isOk: false, error: 'Unknown type' };
      } catch (error) {
        console.error('Create error:', error);
        return { isOk: false, error: error.message };
      }
    },

    async update(data) {
      try {
        const client = this._supabase;
        if (!client) return { isOk: false, error: 'Supabase client missing' };
        if (!data || !data.type) return { isOk: false, error: 'Missing type' };

        if (data.type === 'student') {
          const payload = {
            student_name: data.student_name,
            student_surname: data.student_surname,
            student_number: data.student_number || null,
            ad_soyad: data.ad_soyad || null,
            sinif: data.sinif || null,
            okul_numarasi: data.okul_numarasi || null,
            kayit_tarihi: data.kayit_tarihi || null,
          };
          const res = await client
            .from('students')
            .update(payload)
            .eq('backend_id', data.__backendId)
            .select('*')
            .single();
          if (res.error) throw res.error;
          const record = mapRowToRecord('student', res.data);
          this._store = this._store.map((r) =>
            r.__backendId === record.__backendId && r.type === 'student' ? record : r
          );
          this._notify();
          return { isOk: true, data: record };
        }

        if (data.type === 'study') {
          const payload = {
            student_backend_id: data.student_id || data.student_backend_id || null,
            study_date: data.study_date || null,
            study_subjects: safeJson(data.study_subjects),
            study_total_net: data.study_total_net || null,
          };
          const res = await client
            .from('studies')
            .update(payload)
            .eq('backend_id', data.__backendId)
            .select('*')
            .single();
          if (res.error) throw res.error;
          const record = mapRowToRecord('study', res.data);
          this._store = this._store.map((r) =>
            r.__backendId === record.__backendId && r.type === 'study' ? record : r
          );
          this._notify();
          return { isOk: true, data: record };
        }

        if (data.type === 'quick_study') {
          const payload = {
            student_id: data.student_id || null,
            study_date: data.study_date || null,
            tur_d: data.tur_d || 0,
            tur_y: data.tur_y || 0,
            tur_b: data.tur_b || 0,
            mat_d: data.mat_d || 0,
            mat_y: data.mat_y || 0,
            mat_b: data.mat_b || 0,
            fen_d: data.fen_d || 0,
            fen_y: data.fen_y || 0,
            fen_b: data.fen_b || 0,
            ink_d: data.ink_d || 0,
            ink_y: data.ink_y || 0,
            ink_b: data.ink_b || 0,
            din_d: data.din_d || 0,
            din_y: data.din_y || 0,
            din_b: data.din_b || 0,
            ing_d: data.ing_d || 0,
            ing_y: data.ing_y || 0,
            ing_b: data.ing_b || 0,
          };
          const res = await client
            .from('quick_studies')
            .update(payload)
            .eq('backend_id', data.__backendId)
            .select('*')
            .single();
          if (res.error) throw res.error;
          const record = mapRowToRecord('quick_study', res.data);
          this._store = this._store.map((r) =>
            r.__backendId === record.__backendId && r.type === 'quick_study' ? record : r
          );
          this._notify();
          return { isOk: true, data: record };
        }

        if (data.type === 'exam') {
          const payload = {
            student_backend_id: data.student_id || data.student_backend_id || null,
            exam_name: data.exam_name || null,
            exam_date: data.exam_date || null,
            exam_subjects: safeJson(data.exam_subjects),
            exam_total_net: data.exam_total_net || null,
            defined_exam_id: data.defined_exam_id ? Number(data.defined_exam_id) : null,
            deneme_tipi: data.deneme_tipi || null,
          };
          const res = await client
            .from('exams')
            .update(payload)
            .eq('backend_id', data.__backendId)
            .select('*')
            .single();
          if (res.error) throw res.error;
          const record = mapRowToRecord('exam', res.data);
          this._store = this._store.map((r) =>
            r.__backendId === record.__backendId && r.type === 'exam' ? record : r
          );
          this._notify();
          return { isOk: true, data: record };
        }

        if (data.type === 'defined_exam') {
          const payload = {
            name: data.name,
            exam_date: data.exam_date || null,
          };
          const res = await client
            .from('defined_exams')
            .update(payload)
            .eq('id', Number(data.__backendId))
            .select('*')
            .single();
          if (res.error) throw res.error;
          const record = mapRowToRecord('defined_exam', res.data);
          this._store = this._store.map((r) =>
            r.__backendId === record.__backendId && r.type === 'defined_exam' ? record : r
          );
          this._notify();
          return { isOk: true, data: record };
        }

        return { isOk: false, error: 'Unknown type' };
      } catch (error) {
        console.error('Update error:', error);
        return { isOk: false, error: error.message };
      }
    },

    async delete(record) {
      try {
        const client = this._supabase;
        if (!client) return { isOk: false, error: 'Supabase client missing' };
        if (!record || !record.type) return { isOk: false, error: 'Missing type' };

        if (record.type === 'student') {
          // Delete student only - frontend filtering handles orphan records
          const res = await client.from('students').delete().eq('backend_id', record.__backendId);
          if (res.error) throw res.error;
        } else if (record.type === 'study') {
          const res = await client.from('studies').delete().eq('backend_id', record.__backendId);
          if (res.error) throw res.error;
        } else if (record.type === 'exam') {
          const res = await client.from('exams').delete().eq('backend_id', record.__backendId);
          if (res.error) throw res.error;
        } else if (record.type === 'defined_exam') {
          const res = await client.from('defined_exams').delete().eq('id', Number(record.__backendId));
          if (res.error) throw res.error;
        } else {
          return { isOk: false, error: 'Unknown type' };
        }

        this._store = this._store.filter(
          (r) => !(r.__backendId === record.__backendId && r.type === record.type)
        );
        this._notify();
        return { isOk: true };
      } catch (error) {
        console.error('Delete error:', error);
        return { isOk: false, error: error.message };
      }
    },

    getAll() {
      return this._store;
    },

    getByType(type) {
      return this._store.filter((r) => r.type === type);
    },
  };
})();

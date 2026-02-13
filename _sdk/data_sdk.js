// Data SDK - Veri yönetim sistemi
window.dataSdk = {
  // Bellekte saklanan veriler
  _store: [],
  _nextId: 1,

  /**
   * Yeni kayıt oluştur
   */
  async create(data) {
    try {
      const record = {
        ...data,
        __backendId: `${data.type}-${this._nextId++}`,
        __createdAt: new Date().toISOString(),
      };
      this._store.push(record);

      // localStorage'a kayıt tipine göre ekle
      if (data.type === 'exam') {
        const exams = this._getExamsFromStorage();
        exams.push(record);
        localStorage.setItem('exams', JSON.stringify(exams));
      } else if (data.type === 'study') {
        const studies = this._getStudiesFromStorage();
        studies.push(record);
        localStorage.setItem('studies', JSON.stringify(studies));
      } else if (data.type === 'student') {
        const students = this._getStudentsFromStorage();
        students.push(record);
        localStorage.setItem('students', JSON.stringify(students));
      }

      // HTML'deki global notifyDataChange fonksiyonunu çağır
      if (typeof window.notifyDataChange === 'function') {
        window.notifyDataChange(this._store);
      }

      return { isOk: true, data: record };
    } catch (error) {
      console.error('Create error:', error);
      return { isOk: false, error: error.message };
    }
  },

  /**
   * Kaydı güncelle
   */
  async update(data) {
    try {
      const idx = this._store.findIndex(r => r.__backendId === data.__backendId);
      if (idx === -1) {
        return { isOk: false, error: 'Record not found' };
      }
      
      this._store[idx] = {
        ...this._store[idx],
        ...data,
        __updatedAt: new Date().toISOString(),
      };

      // localStorage'ı güncelle
      if (data.type === 'exam') {
        const exams = this._getExamsFromStorage();
        const examIdx = exams.findIndex(e => e.__backendId === data.__backendId);
        if (examIdx !== -1) exams[examIdx] = this._store[idx];
        localStorage.setItem('exams', JSON.stringify(exams));
      } else if (data.type === 'study') {
        const studies = this._getStudiesFromStorage();
        const studyIdx = studies.findIndex(s => s.__backendId === data.__backendId);
        if (studyIdx !== -1) studies[studyIdx] = this._store[idx];
        localStorage.setItem('studies', JSON.stringify(studies));
      } else if (data.type === 'student') {
        const students = this._getStudentsFromStorage();
        const studentIdx = students.findIndex(s => s.__backendId === data.__backendId);
        if (studentIdx !== -1) students[studentIdx] = this._store[idx];
        localStorage.setItem('students', JSON.stringify(students));
      }

      // HTML'deki global notifyDataChange fonksiyonunu çağır
      if (typeof window.notifyDataChange === 'function') {
        window.notifyDataChange(this._store);
      }

      return { isOk: true, data: this._store[idx] };
    } catch (error) {
      console.error('Update error:', error);
      return { isOk: false, error: error.message };
    }
  },

  /**
   * Kaydı sil
   */
  async delete(record) {
    try {
      const idx = this._store.findIndex(r => r.__backendId === record.__backendId);
      if (idx === -1) {
        return { isOk: false, error: 'Record not found' };
      }

      const deleted = this._store.splice(idx, 1)[0];

      // localStorage'dan sil
      if (record.type === 'exam') {
        const exams = this._getExamsFromStorage().filter(e => e.__backendId !== record.__backendId);
        localStorage.setItem('exams', JSON.stringify(exams));
      } else if (record.type === 'study') {
        const studies = this._getStudiesFromStorage().filter(s => s.__backendId !== record.__backendId);
        localStorage.setItem('studies', JSON.stringify(studies));
      } else if (record.type === 'student') {
        const students = this._getStudentsFromStorage().filter(s => s.__backendId !== record.__backendId);
        localStorage.setItem('students', JSON.stringify(students));
      }

      // HTML'deki global notifyDataChange fonksiyonunu çağır
      if (typeof window.notifyDataChange === 'function') {
        window.notifyDataChange(this._store);
      }

      return { isOk: true, data: deleted };
    } catch (error) {
      console.error('Delete error:', error);
      return { isOk: false, error: error.message };
    }
  },

  /**
   * localStorage'dan öğrencileri al
   */
  _getStudentsFromStorage() {
    try {
      const stored = localStorage.getItem('students');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * localStorage'dan sınavları al
   */
  _getExamsFromStorage() {
    try {
      const stored = localStorage.getItem('exams');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * localStorage'dan çalışmaları al
   */
  _getStudiesFromStorage() {
    try {
      const stored = localStorage.getItem('studies');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Tüm verileri al
   */
  getAll() {
    return this._store;
  },

  /**
   * Tipe göre verileri al
   */
  getByType(type) {
    if (type === 'student') {
      return this._getStudentsFromStorage();
    } else if (type === 'exam') {
      return this._getExamsFromStorage();
    } else if (type === 'study') {
      return this._getStudiesFromStorage();
    }
    return [];
  },

  /**
   * Depoyu başlat (localStorage'dan yükle)
   */
  async initialize() {
    try {
      const students = this._getStudentsFromStorage();
      const exams = this._getExamsFromStorage();
      const studies = this._getStudiesFromStorage();

      this._store = [...students, ...exams, ...studies];
      
      // Maksimum ID'yi güncelle
      if (this._store.length > 0) {
        const ids = this._store
          .map(r => {
            const match = r.__backendId?.match(/-(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(id => id > 0);
        this._nextId = Math.max(...ids) + 1;
      }

      // HTML'deki global notifyDataChange fonksiyonunu çağır
      if (typeof window.notifyDataChange === 'function') {
        window.notifyDataChange(this._store);
      }

      return { isOk: true };
    } catch (error) {
      console.error('Initialize error:', error);
      return { isOk: false, error: error.message };
    }
  },

  /**
   * HTML tarafından çağrılan init fonksiyonu
   */
  async init(dataHandler) {
    try {
      if (dataHandler && dataHandler.onDataChanged) {
        // dataHandler'ı kaydet
        this._dataHandler = dataHandler;
      }
      
      // initialize'ı çağır
      const result = await this.initialize();
      
      return { isOk: result.isOk };
    } catch (error) {
      console.error('Init error:', error);
      return { isOk: false, error: error.message };
    }
  }
};

// Başlatmadan önce biraz bekle (HTML'nin fonksiyonları tanımlaması için)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dataSdk.initialize().then(() => {
      console.log('Data SDK initialized');
    });
  });
} else {
  window.dataSdk.initialize().then(() => {
    console.log('Data SDK initialized');
  });
}

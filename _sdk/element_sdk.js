// Element SDK - UI/Element kontrol sistemi
window.elementSdk = {
  /**
   * Öğe stil güncellemesi
   */
  setStyle(selector, styles) {
    const element = document.querySelector(selector);
    if (element) {
      Object.assign(element.style, styles);
      return true;
    }
    return false;
  },

  /**
   * Öğe sınıf güncellemesi
   */
  addClass(selector, className) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add(className);
      return true;
    }
    return false;
  },

  /**
   * Öğe sınıf kaldırma
   */
  removeClass(selector, className) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.remove(className);
      return true;
    }
    return false;
  },

  /**
   * Öğe metin güncelleme
   */
  setText(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = text;
      return true;
    }
    return false;
  },

  /**
   * Öğe HTML güncelleme
   */
  setHTML(selector, html) {
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = html;
      return true;
    }
    return false;
  },

  /**
   * Öğe görünürlüğü
   */
  setVisible(selector, visible) {
    const element = document.querySelector(selector);
    if (element) {
      element.style.display = visible ? '' : 'none';
      return true;
    }
    return false;
  },

  /**
   * Öğe etkinleştirme/devre dışı bırakma
   */
  setEnabled(selector, enabled) {
    const element = document.querySelector(selector);
    if (element) {
      element.disabled = !enabled;
      return true;
    }
    return false;
  },

  /**
   * SDK başlatma fonksiyonu (HTML tarafından çağrılır)
   */
  init(config) {
    try {
      this._config = config || {};
      
      // Config callback'lerini kaydet
      if (config && config.onConfigChange) {
        this._onConfigChange = config.onConfigChange;
      }
      
      if (config && config.mapToCapabilities) {
        this._mapToCapabilities = config.mapToCapabilities;
      }
      
      if (config && config.mapToEditPanelValues) {
        this._mapToEditPanelValues = config.mapToEditPanelValues;
      }
      
      console.log('Element SDK init complete');
      return { isOk: true };
    } catch (error) {
      console.error('Element SDK init error:', error);
      return { isOk: false, error: error.message };
    }
  },

  /**
   * Config güncelleme fonksiyonu
   */
  setConfig(newConfig) {
    try {
      this._config = { ...this._config, ...newConfig };
      
      if (this._onConfigChange) {
        this._onConfigChange(this._config);
      }
      
      return true;
    } catch (error) {
      console.error('SetConfig error:', error);
      return false;
    }
  }
};

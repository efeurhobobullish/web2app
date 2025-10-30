import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  WEB_CACHE: 'web_cache_',
  CACHE_METADATA: 'cache_metadata',
  CACHE_CONFIG: 'cache_config',
  OFFLINE_PAGES: 'offline_pages'
};

const DEFAULT_CONFIG = {
  maxCacheSize: 50 * 1024 * 1024,
  maxCacheAge: 7 * 24 * 60 * 60 * 1000,
  preloadUrls: [],
  cacheImages: true,
  cacheCSS: true,
  cacheJS: true,
  offlineMode: true,
  compressionEnabled: true
};

class CacheService {
  constructor() {
    this.config = DEFAULT_CONFIG;
    this.cacheMetadata = {};
    this.isInitialized = false;
  }

  async initialize(config = {}) {
    try {
      const storedConfig = await this.getStoredConfig();
      this.config = { ...DEFAULT_CONFIG, ...storedConfig, ...config };

      await this.loadCacheMetadata();
      await this.cleanExpiredCache();

      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize CacheService:', error);
      return false;
    }
  }

  async loadCacheMetadata() {
    try {
      const metadata = await AsyncStorage.getItem(CACHE_KEYS.CACHE_METADATA);
      this.cacheMetadata = metadata ? JSON.parse(metadata) : {};
    } catch (error) {
      this.cacheMetadata = {};
    }
  }

  async saveCacheMetadata() {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.CACHE_METADATA, JSON.stringify(this.cacheMetadata));
    } catch (error) {
      console.error('Failed to save cache metadata:', error);
    }
  }

  async getStoredConfig() {
    try {
      const config = await AsyncStorage.getItem(CACHE_KEYS.CACHE_CONFIG);
      return config ? JSON.parse(config) : {};
    } catch (error) {
      return {};
    }
  }

  async updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    await AsyncStorage.setItem(CACHE_KEYS.CACHE_CONFIG, JSON.stringify(this.config));
  }

  generateCacheKey(url) {
    try {
      const urlObj = new URL(url);
      const cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}${urlObj.search}`;
      return CACHE_KEYS.WEB_CACHE + btoa(cleanUrl).replace(/[^a-zA-Z0-9]/g, '');
    } catch (error) {
      return CACHE_KEYS.WEB_CACHE + btoa(url).replace(/[^a-zA-Z0-9]/g, '');
    }
  }

  shouldCache(url, contentType = '') {
    if (!this.config.offlineMode) return false;

    if (contentType.includes('image/') && !this.config.cacheImages) return false;
    if (contentType.includes('text/css') && !this.config.cacheCSS) return false;
    if (contentType.includes('javascript') && !this.config.cacheJS) return false;

    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('analytics') || urlLower.includes('tracking')) {
      return false;
    }

    if (urlLower.includes('ads') || urlLower.includes('advertisement')) {
      return false;
    }

    if (urlLower.includes('beacon') || urlLower.includes('ping')) {
      return false;
    }

    if (urlLower.includes('websocket') || urlLower.includes('ws://') || urlLower.includes('wss://')) {
      return false;
    }

    return true;
  }

  async cacheResource(url, data, contentType = '', headers = {}) {
    if (!this.shouldCache(url, contentType)) {
      return false;
    }

    try {
      const cacheKey = this.generateCacheKey(url);
      const timestamp = Date.now();
      
      let processedData = data;
      if (this.config.compressionEnabled && typeof data === 'string') {
        processedData = this.compressText(data);
      }

      const cacheEntry = {
        data: processedData,
        timestamp,
        contentType,
        headers,
        url,
        size: this.calculateSize(processedData),
        compressed: this.config.compressionEnabled && typeof data === 'string'
      };

      const entrySize = this.calculateSize(JSON.stringify(cacheEntry));
      
      if (await this.checkCacheSize(entrySize)) {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
        
        this.cacheMetadata[cacheKey] = {
          url,
          timestamp,
          size: entrySize,
          contentType,
          accessCount: 0,
          lastAccessed: timestamp
        };
        
        await this.saveCacheMetadata();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to cache resource:', error);
      return false;
    }
  }

  async getCachedResource(url) {
    try {
      const cacheKey = this.generateCacheKey(url);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const cacheEntry = JSON.parse(cachedData);
      
      if (Date.now() - cacheEntry.timestamp > this.config.maxCacheAge) {
        await this.removeCachedResource(url);
        return null;
      }

      if (this.cacheMetadata[cacheKey]) {
        this.cacheMetadata[cacheKey].accessCount++;
        this.cacheMetadata[cacheKey].lastAccessed = Date.now();
        await this.saveCacheMetadata();
      }

      let data = cacheEntry.data;
      if (cacheEntry.compressed && typeof data === 'string') {
        data = this.decompressText(data);
      }

      return {
        data,
        contentType: cacheEntry.contentType,
        headers: cacheEntry.headers,
        timestamp: cacheEntry.timestamp
      };
    } catch (error) {
      console.error('Failed to get cached resource:', error);
      return null;
    }
  }

  async removeCachedResource(url) {
    try {
      const cacheKey = this.generateCacheKey(url);
      await AsyncStorage.removeItem(cacheKey);
      
      if (this.cacheMetadata[cacheKey]) {
        delete this.cacheMetadata[cacheKey];
        await this.saveCacheMetadata();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to remove cached resource:', error);
      return false;
    }
  }

  async checkCacheSize(newEntrySize) {
    const currentSize = await this.getCurrentCacheSize();
    const totalSize = currentSize + newEntrySize;
    
    if (totalSize > this.config.maxCacheSize) {
      const spaceNeeded = totalSize - this.config.maxCacheSize;
      await this.cleanOldestEntries(spaceNeeded);
    }
    
    return true;
  }

  async getCurrentCacheSize() {
    let totalSize = 0;
    for (const key in this.cacheMetadata) {
      totalSize += this.cacheMetadata[key].size || 0;
    }
    return totalSize;
  }

  async cleanOldestEntries(spaceNeeded) {
    const entries = Object.entries(this.cacheMetadata)
      .map(([key, metadata]) => ({ key, ...metadata }))
      .sort((a, b) => a.lastAccessed - b.lastAccessed);

    let freedSpace = 0;
    for (const entry of entries) {
      if (freedSpace >= spaceNeeded) break;
      
      try {
        await AsyncStorage.removeItem(entry.key);
        freedSpace += entry.size || 0;
        delete this.cacheMetadata[entry.key];
      } catch (error) {
        console.error('Failed to remove cache entry:', error);
      }
    }
    
    await this.saveCacheMetadata();
  }

  async cleanExpiredCache() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, metadata] of Object.entries(this.cacheMetadata)) {
      if (now - metadata.timestamp > this.config.maxCacheAge) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      try {
        await AsyncStorage.removeItem(key);
        delete this.cacheMetadata[key];
      } catch (error) {
        console.error('Failed to remove expired cache entry:', error);
      }
    }

    if (expiredKeys.length > 0) {
      await this.saveCacheMetadata();
    }
  }

  async preloadUrls() {
    if (!this.config.preloadUrls || this.config.preloadUrls.length === 0) {
      return;
    }

    for (const url of this.config.preloadUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          const data = await response.text();
          await this.cacheResource(url, data, contentType, Object.fromEntries(response.headers));
        }
      } catch (error) {
        console.error(`Failed to preload URL ${url}:`, error);
      }
    }
  }

  async cachePageForOffline(url, html) {
    try {
      const offlinePages = await this.getOfflinePages();
      offlinePages[url] = {
        html,
        timestamp: Date.now(),
        size: this.calculateSize(html)
      };
      
      await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_PAGES, JSON.stringify(offlinePages));
      return true;
    } catch (error) {
      console.error('Failed to cache page for offline:', error);
      return false;
    }
  }

  async getOfflinePages() {
    try {
      const pages = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_PAGES);
      return pages ? JSON.parse(pages) : {};
    } catch (error) {
      return {};
    }
  }

  async getOfflinePage(url) {
    try {
      const offlinePages = await this.getOfflinePages();
      return offlinePages[url] || null;
    } catch (error) {
      return null;
    }
  }

  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(CACHE_KEYS.WEB_CACHE) || 
        key === CACHE_KEYS.CACHE_METADATA ||
        key === CACHE_KEYS.OFFLINE_PAGES
      );
      
      await AsyncStorage.multiRemove(cacheKeys);
      this.cacheMetadata = {};
      
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  async getCacheStats() {
    try {
      const totalSize = await this.getCurrentCacheSize();
      const entryCount = Object.keys(this.cacheMetadata).length;
      const offlinePages = await this.getOfflinePages();
      const offlinePagesCount = Object.keys(offlinePages).length;
      
      return {
        totalSize,
        entryCount,
        offlinePagesCount,
        maxCacheSize: this.config.maxCacheSize,
        hitRate: this.calculateCacheHitRate()
      };
    } catch (error) {
      return { totalSize: 0, entryCount: 0, offlinePagesCount: 0, maxCacheSize: this.config.maxCacheSize, hitRate: 0 };
    }
  }

  compressText(text) {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      return text;
    }
  }

  decompressText(compressedText) {
    try {
      return decodeURIComponent(escape(atob(compressedText)));
    } catch (error) {
      return compressedText;
    }
  }

  calculateSize(data) {
    if (typeof data === 'string') {
      return new Blob([data]).size;
    }
    return JSON.stringify(data).length;
  }

  calculateCacheHitRate() {
    const totalAccess = Object.values(this.cacheMetadata).reduce((sum, meta) => sum + (meta.accessCount || 0), 0);
    return totalAccess > 0 ? (totalAccess / Object.keys(this.cacheMetadata).length) : 0;
  }
}

export default new CacheService();
/*!
 * Cart Suggestion Widget v1.0.0
 * Build Date: 02.05.2026 00:10:24
 * (c) 2026 Yuddy
 */
var CartSuggestion = (function (exports) {
    'use strict';

    globalThis.__BUILD_ENV__ = '';

    let WidgetError$1 = class WidgetError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
            this.name = 'WidgetError';
        }
    };

    // Error types
    class WidgetError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
            this.name = 'WidgetError';
        }
    }
    class APIError extends WidgetError {
        constructor(message, status) {
            super(message, 'API_ERROR');
            this.status = status;
            this.name = 'APIError';
        }
    }

    // Storage keys
    const WIDGET_STORAGE_KEYS = {
        VIEWED_PRODUCTS: 'yuddy_cart_sug_viewed',
        ADDED_TO_CART: 'yuddy_cart_sug_cart',
        LAST_SHOWN: 'yuddy_cart_sug_last_shown',
        WIDGET_DATA: 'yuddy_cart_sug_data',
    };
    // Cookie names
    const WIDGET_COOKIE_NAMES = {
        WIDGET_SHOWN: 'yuddy_cart_sug_shown',
        USER_PREFERENCES: 'yuddy_cart_sug_prefs',
        WIDGET_BLOCKED: 'yuddy_cart_sug_blocked',
    };

    // Cache version - Bu değiştirildiğinde tüm cache'ler temizlenir
    const CACHE_VERSION = '4.0.25'; // Ürün yoksa slider / widget eklenmez

    class StorageManager {
        constructor() {
            this.localStorageAvailable = this.isLocalStorageAvailable();
            if (!this.localStorageAvailable) {
                console.warn('localStorage is not available.');
            }
        }
        /**
         * Check if localStorage is available
         */
        isLocalStorageAvailable() {
            try {
                const test = '__localStorage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            }
            catch {
                return false;
            }
        }
        /**
         * Get stored data
         */
        getData() {
            if (!this.localStorageAvailable)
                return null;
            try {
                const data = localStorage.getItem(WIDGET_STORAGE_KEYS.WIDGET_DATA);
                if (!data)
                    return null;
                return JSON.parse(data);
            }
            catch (error) {
                console.warn('Failed to parse localStorage data:', error);
                return null;
            }
        }
        /**
         * Set stored data
         */
        setData(data) {
            if (!this.localStorageAvailable)
                return;
            try {
                localStorage.setItem(WIDGET_STORAGE_KEYS.WIDGET_DATA, JSON.stringify(data));
            }
            catch (error) {
                console.warn('Failed to save to localStorage:', error);
            }
        }
        /**
         * Add viewed product
         */
        addViewedProduct(productId) {
            if (!this.localStorageAvailable)
                return;
            const data = this.getData() || {};
            const viewedProducts = data.viewedProducts || [];
            if (!viewedProducts.includes(productId)) {
                viewedProducts.push(productId);
                // Keep only last 50 viewed products
                if (viewedProducts.length > 50) {
                    viewedProducts.shift();
                }
            }
            this.setData({
                ...data,
                viewedProducts,
                lastUpdateTime: new Date().toISOString(),
            });
        }
        /**
         * Get viewed products
         */
        getViewedProducts() {
            const data = this.getData();
            return data?.viewedProducts || [];
        }
        /**
         * Add product to cart tracking
         */
        addToCart(productId) {
            if (!this.localStorageAvailable)
                return;
            const data = this.getData() || {};
            const addedToCart = data.addedToCart || [];
            if (!addedToCart.includes(productId)) {
                addedToCart.push(productId);
            }
            this.setData({
                ...data,
                addedToCart,
                lastUpdateTime: new Date().toISOString(),
            });
        }
        /**
         * Get products added to cart
         */
        getAddedToCart() {
            const data = this.getData();
            return data?.addedToCart || [];
        }
        /**
         * Save last shown products
         */
        saveLastShownProducts(productIds) {
            if (!this.localStorageAvailable)
                return;
            const data = this.getData() || {};
            this.setData({
                ...data,
                lastShownProducts: productIds,
                lastUpdateTime: new Date().toISOString(),
            });
        }
        /**
         * Get last shown products
         */
        getLastShownProducts() {
            const data = this.getData();
            return data?.lastShownProducts || [];
        }
        /**
         * Clear all stored data
         */
        clear() {
            if (!this.localStorageAvailable)
                return;
            try {
                localStorage.removeItem(WIDGET_STORAGE_KEYS.WIDGET_DATA);
                localStorage.removeItem(WIDGET_STORAGE_KEYS.VIEWED_PRODUCTS);
                localStorage.removeItem(WIDGET_STORAGE_KEYS.ADDED_TO_CART);
                localStorage.removeItem(WIDGET_STORAGE_KEYS.LAST_SHOWN);
            }
            catch (error) {
                console.warn('Failed to clear localStorage:', error);
            }
        }
        /**
         * Check if data is stale (older than specified hours)
         */
        isDataStale(hours = 24) {
            const data = this.getData();
            if (!data?.lastUpdateTime)
                return true;
            const lastUpdate = new Date(data.lastUpdateTime);
            const now = new Date();
            const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
            return diffHours > hours;
        }
        /**
         * Cache widget data
         * @param widgetData - Widget verisi
         * @param hostname - Domain adı
         * @param ttlMinutes - Cache süresi (dakika, varsayılan: 60)
         */
        cacheWidgetData(widgetData, hostname, ttlMinutes = 60) {
            if (!this.localStorageAvailable)
                return;
            try {
                const cacheData = {
                    version: CACHE_VERSION, // Cache version ekle
                    widgetData,
                    timestamp: Date.now(),
                    hostname,
                    ttl: ttlMinutes * 60 * 1000, // Dakikayı millisecond'a çevir
                };
                localStorage.setItem(WIDGET_STORAGE_KEYS.WIDGET_DATA + '_cache', JSON.stringify(cacheData));
                console.log(`💾 [Storage] Widget data cached for ${ttlMinutes} minutes (version: ${CACHE_VERSION})`);
            }
            catch (error) {
                console.warn('Failed to cache widget data:', error);
            }
        }
        /**
         * Get cached widget data
         * @param hostname - Domain adı
         * @returns Cached widget data veya null (eğer cache yoksa veya expire olduysa)
         */
        getCachedWidgetData(hostname) {
            if (!this.localStorageAvailable)
                return null;
            try {
                const cached = localStorage.getItem(WIDGET_STORAGE_KEYS.WIDGET_DATA + '_cache');
                if (!cached) {
                    console.log('ℹ️ [Storage] No cached widget data found');
                    return null;
                }
                const cacheData = JSON.parse(cached);
                // Cache version kontrolü
                if (cacheData.version !== CACHE_VERSION) {
                    console.log('⚠️ [Storage] Cache version mismatch, clearing old cache...');
                    this.clearWidgetCache();
                    return null;
                }
                // Hostname kontrolü
                if (cacheData.hostname !== hostname) {
                    console.log('⚠️ [Storage] Cached data is for different hostname');
                    this.clearWidgetCache();
                    return null;
                }
                // TTL kontrolü
                const now = Date.now();
                const age = now - cacheData.timestamp;
                if (age > cacheData.ttl) {
                    console.log('⏰ [Storage] Cache expired, clearing...');
                    this.clearWidgetCache();
                    return null;
                }
                const remainingMinutes = Math.round((cacheData.ttl - age) / 60000);
                console.log(`✅ [Storage] Using cached widget data (expires in ${remainingMinutes} minutes)`);
                return cacheData.widgetData;
            }
            catch (error) {
                console.warn('Failed to get cached widget data:', error);
                this.clearWidgetCache();
                return null;
            }
        }
        /**
         * Clear widget cache
         */
        clearWidgetCache() {
            if (!this.localStorageAvailable)
                return;
            try {
                localStorage.removeItem(WIDGET_STORAGE_KEYS.WIDGET_DATA + '_cache');
                console.log('🗑️ [Storage] Widget cache cleared');
            }
            catch (error) {
                console.warn('Failed to clear widget cache:', error);
            }
        }
        /**
         * Check if widget cache exists and is valid
         */
        hasValidCache(hostname) {
            return this.getCachedWidgetData(hostname) !== null;
        }
    }

    const VALID_ORDERS = new Set(['priceAsc', 'priceDesc', 'nameAsc', 'nameDesc']);
    /**
     * Kategori ürünlerini panelden gelen productOrder değerine göre sıralar.
     */
    function sortProductsByOrder(products, order) {
        if (!products.length)
            return [];
        const mode = order && VALID_ORDERS.has(order) ? order : 'nameAsc';
        const copy = [...products];
        copy.sort((a, b) => {
            const priceA = Number(a.price ?? 0);
            const priceB = Number(b.price ?? 0);
            switch (mode) {
                case 'priceAsc':
                    return priceA - priceB || a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' });
                case 'priceDesc':
                    return priceB - priceA || a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' });
                case 'nameDesc':
                    return b.name.localeCompare(a.name, 'tr', { sensitivity: 'base' });
                case 'nameAsc':
                default:
                    return a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' });
            }
        });
        return copy;
    }

    const detectPlatform = () => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return 'other';
        }
        if (window.IdeasoftSettings !== undefined ||
            document.querySelector('script[src*="ideasoft"]') !== null ||
            window.location.hostname.includes('ideasoft')) {
            return 'ideasoft';
        }
        if (window.IKAS !== undefined ||
            document.querySelector('script[src*="ikas"]') !== null ||
            window.location.hostname.includes('ikas')) {
            return 'ikas';
        }
        if (window.Shopify !== undefined ||
            document.querySelector('script[src*="shopify"]') !== null ||
            document.querySelector('meta[name="shopify-checkout-api-token"]') !== null) {
            return 'shopify';
        }
        if (window.location.hostname.includes('tsoft') || window.TSoft !== undefined) {
            return 'tsoft';
        }
        return 'other';
    };

    class APIClient {
        constructor(baseUrl, cacheTTL = 60) {
            this.testHostname = 'yuddy.store'; // Default test hostname
            this.baseUrl = baseUrl.replace(/\/$/, '');
            this.storageManager = new StorageManager();
            this.cacheTTL = cacheTTL;
        }
        /**
         * Check if hostname is a local development environment
         */
        isLocalEnvironment(hostname) {
            const localPatterns = [
                'localhost',
                '127.0.0.1',
                '0.0.0.0',
                '::1',
                /^192\.168\.\d+\.\d+$/, // Local network
                /^10\.\d+\.\d+\.\d+$/, // Local network
                /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/, // Local network
            ];
            return localPatterns.some(pattern => {
                if (typeof pattern === 'string') {
                    return hostname === pattern || hostname.startsWith(pattern + ':');
                }
                else {
                    return pattern.test(hostname);
                }
            });
        }
        /**
         * Get test hostname for local development
         */
        getTestHostname() {
            // window.YUDDY_CS_TEST_HOSTNAME varsa onu kullan
            if (typeof window !== 'undefined' && window.YUDDY_CS_TEST_HOSTNAME) {
                return window.YUDDY_CS_TEST_HOSTNAME;
            }
            return this.testHostname;
        }
        /**
         * Set custom test hostname for local development
         */
        setTestHostname(hostname) {
            this.testHostname = hostname;
        }
        /**
         * Get widget configuration and product data
         * Returns null if no data is available
         * Uses cache if available and fresh
         */
        async getWidgetData(hostname, forceRefresh = false) {
            let cleanHostname = hostname.replace(/^(www\.|http:\/\/|https:\/\/)/, '');
            // Development/demo ortamı için hostname override
            // localhost, 127.0.0.1, 0.0.0.0 gibi local adresler yerine test domain kullan
            if (this.isLocalEnvironment(cleanHostname)) {
                const testHostname = this.getTestHostname();
                cleanHostname = testHostname;
            }
            // Cache kontrolü (force refresh değilse)
            if (!forceRefresh) {
                const cachedData = this.storageManager.getCachedWidgetData(cleanHostname);
                if (cachedData) {
                    return cachedData;
                }
            }
            // Cache yoksa veya force refresh ise API'den çek
            try {
                const url = `${this.baseUrl}/cart-suggestion?storeName=${encodeURIComponent(cleanHostname)}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    if (response.status === 404) {
                        return null;
                    }
                    throw new APIError(`Failed to fetch widget data: ${response.status}`, response.status);
                }
                const apiResponse = await response.json();
                // API response'u WidgetData formatına dönüştür
                const widgetData = await this.transformApiResponse(apiResponse);
                // Veri varsa cache'e kaydet
                if (widgetData) {
                    this.storageManager.cacheWidgetData(widgetData, cleanHostname, this.cacheTTL);
                }
                return widgetData;
            }
            catch (error) {
                if (error instanceof APIError) {
                    throw error;
                }
                console.error('❌ [Yuddy CS API] Network error:', error);
                throw new APIError(`Network error: ${error.message}`);
            }
        }
        normalizeImageUrl(imageUrl) {
            if (!imageUrl)
                return '';
            if (imageUrl.startsWith('//'))
                return `https:${imageUrl}`;
            return imageUrl;
        }
        /**
         * İkas ve diğer platformlar: relative slug için sadece başına / eklenir (eski davranış).
         * Ideasoft: /urun/{slug} (zaten /urun/ ile geliyorsa dokunulmaz).
         */
        buildProductUrl(slug, platform) {
            if (!slug)
                return '#';
            if (slug.startsWith('http://') || slug.startsWith('https://')) {
                return slug;
            }
            if (platform === 'ideasoft') {
                const trimmed = slug.replace(/^\/+|\/+$/g, '');
                if (!trimmed)
                    return '#';
                const path = `/${trimmed}`;
                if (/^\/urun\//i.test(path)) {
                    return path;
                }
                return `/urun${path}`;
            }
            const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
            return normalizedSlug;
        }
        transformApplicableProductToWidgetProduct(product, platform) {
            return {
                id: product.id,
                name: product.name,
                price: Number(product.price) || 0,
                imageUrl: this.normalizeImageUrl(product.imageUrl),
                url: this.buildProductUrl(product.slug, platform),
            };
        }
        /**
         * API response'u internal WidgetData formatına dönüştür
         */
        async transformApiResponse(apiResponse) {
            // API direkt array döndürüyor
            if (!Array.isArray(apiResponse)) {
                return null;
            }
            // Array boş mu kontrol et
            if (apiResponse.length === 0) {
                return null;
            }
            const widgetData = {
                slider1: null,
                slider2: null,
            };
            const platform = detectPlatform();
            // API'den gelen applicableProducts listesini doğrudan kullan
            for (const category of apiResponse) {
                const applicableProducts = (category.applicableProducts || []).filter((product) => product.status !== false);
                const products = sortProductsByOrder(applicableProducts.map((product) => this.transformApplicableProductToWidgetProduct(product, platform)), category.sliderSettings?.productOrder);
                // Ürün listesi boşsa öneri alanı oluşturulmaz
                if (products.length === 0) {
                    continue;
                }
                const sliderData = {
                    id: category.id,
                    settings: category.sliderSettings,
                    products: products,
                };
                if (category.sortOrder === '1') {
                    widgetData.slider1 = sliderData;
                }
                else if (category.sortOrder === '2') {
                    widgetData.slider2 = sliderData;
                }
            }
            // En az bir sliderda ürün yoksa tüm widget verisi yok sayılır
            if (!widgetData.slider1 && !widgetData.slider2) {
                return null;
            }
            return widgetData;
        }
        /**
         * Check if API is available
         */
        async healthCheck() {
            try {
                const response = await fetch(`${this.baseUrl}/health`, {
                    method: 'GET',
                });
                return response.ok;
            }
            catch {
                return false;
            }
        }
        /**
         * Set API base URL
         */
        setBaseUrl(baseUrl) {
            this.baseUrl = baseUrl.replace(/\/$/, '');
        }
        /**
         * Get current API base URL
         */
        getBaseUrl() {
            return this.baseUrl;
        }
        /**
         * Clear widget cache
         */
        clearCache() {
            this.storageManager.clearWidgetCache();
        }
        /**
         * Set cache TTL
         */
        setCacheTTL(minutes) {
            this.cacheTTL = minutes;
        }
        /**
         * Check if valid cache exists
         */
        hasValidCache(hostname) {
            const cleanHostname = hostname.replace(/^(www\.|http:\/\/|https:\/\/)/, '');
            return this.storageManager.hasValidCache(cleanHostname);
        }
    }

    function getCartSuggestionHTML() {
        return `
<!-- Yuddy Cart Suggestion Widget -->
<div id="yuddy-cart-suggestion" class="yuddy-cs-widget" style="display: none;">
  <!-- First Slider -->
  <div id="yuddy-cs-slider-1" class="yuddy-cs-slider-container">
    <div class="yuddy-cs-slider-header">
      <h3 class="yuddy-cs-slider-title"></h3>
    </div>
    <div class="yuddy-cs-slider-wrapper">
      <button class="yuddy-cs-arrow yuddy-cs-arrow-prev" aria-label="Önceki">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="yuddy-cs-slider-track">
        <div class="yuddy-cs-slider-items"></div>
      </div>
      <button class="yuddy-cs-arrow yuddy-cs-arrow-next" aria-label="Sonraki">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
    <div class="yuddy-cs-dots"></div>
  </div>

  <!-- Second Slider (Optional) -->
  <div id="yuddy-cs-slider-2" class="yuddy-cs-slider-container" style="display: none;">
    <div class="yuddy-cs-slider-header">
      <h3 class="yuddy-cs-slider-title"></h3>
    </div>
    <div class="yuddy-cs-slider-wrapper">
      <button class="yuddy-cs-arrow yuddy-cs-arrow-prev" aria-label="Önceki">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="yuddy-cs-slider-track">
        <div class="yuddy-cs-slider-items"></div>
      </div>
      <button class="yuddy-cs-arrow yuddy-cs-arrow-next" aria-label="Sonraki">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
    <div class="yuddy-cs-dots"></div>
  </div>
</div>
`;
    }
    function getProductCardHTML(id, name, price, imageUrl, url, _originalPrice, _badge) {
        return `
<div class="yuddy-cs-product-card" data-product-id="${id}">
  <a href="${url}" class="yuddy-cs-product-link">
    <div class="yuddy-cs-product-image-wrapper">
      <img src="${imageUrl}" alt="${name}" class="yuddy-cs-product-image" loading="lazy" />
    </div>
    <div class="yuddy-cs-product-info">
      <h3 class="yuddy-cs-product-name">${name}</h3>
      <div class="yuddy-cs-product-prices">
        <span class="yuddy-cs-product-price">${price.toFixed(2)} ₺</span>
      </div>
    </div>
  </a>
</div>
`;
    }

    class DOMManager {
        constructor(containerSelector) {
            this.widgetElement = null;
            this.slider1Element = null;
            this.slider2Element = null;
            this.isInitialized = false;
            this.containerSelector = null;
            // Event listener cleanup (MEMORY LEAK FIX)
            this.navigationListeners = [];
            this.beforeUnloadHandler = () => this.cleanup();
            this.containerSelector = containerSelector || null;
            // Store reference for cleanup (MEMORY LEAK FIX)
            window.addEventListener('beforeunload', this.beforeUnloadHandler);
        }
        /**
         * Initialize DOM Manager
         */
        async init(widgetData) {
            // Guard: Already initialized
            if (this.isInitialized) {
                return;
            }
            this.injectHTML();
            this.widgetElement = document.getElementById('yuddy-cart-suggestion');
            this.slider1Element = document.getElementById('yuddy-cs-slider-1');
            this.slider2Element = document.getElementById('yuddy-cs-slider-2');
            // Guard: Critical element missing
            if (!this.widgetElement) {
                throw new Error('Widget element not found');
            }
            await this.populateSliders(widgetData);
            this.isInitialized = true;
        }
        /**
         * Inject HTML template into page
         */
        injectHTML() {
            this.removeExistingWidget();
            const html = getCartSuggestionHTML();
            // Guard: Container selector required
            if (!this.containerSelector) {
                throw new Error('[Cart Suggestion Widget] Container selector gerekli! Widget sadece belirtilen container içine eklenir.');
            }
            const container = document.querySelector(this.containerSelector);
            // Guard: Container not found
            if (!container) {
                throw new Error(`[Product Recommendation Widget] Hedef container bulunamadı: "${this.containerSelector}". Widget eklenemedi.`);
            }
            console.log('🎯 [Product Recommendation Widget] Widget eklendi:', {
                selector: this.containerSelector,
                element: container,
                tagName: container.tagName,
                className: container.className,
                id: container.id,
            });
            container.insertAdjacentHTML('beforeend', html);
        }
        /**
         * Remove existing widget elements
         */
        removeExistingWidget() {
            const existingWidget = document.getElementById('yuddy-cart-suggestion');
            if (existingWidget) {
                existingWidget.remove();
            }
        }
        /**
         * Populate sliders with data
         */
        async populateSliders(widgetData) {
            // Boş dizi JS'te truthy olduğu için uzunluk kontrolü şart
            const n1 = widgetData.slider1?.products?.length ?? 0;
            const n2 = widgetData.slider2?.products?.length ?? 0;
            if (n1 > 0 && this.slider1Element) {
                await this.setupSlider(this.slider1Element, widgetData.slider1.settings, widgetData.slider1.products);
                this.slider1Element.style.display = 'block';
            }
            else if (this.slider1Element) {
                this.slider1Element.style.display = 'none';
            }
            if (n2 > 0 && this.slider2Element) {
                await this.setupSlider(this.slider2Element, widgetData.slider2.settings, widgetData.slider2.products);
                this.slider2Element.style.display = 'block';
            }
            else if (this.slider2Element) {
                this.slider2Element.style.display = 'none';
            }
        }
        /**
         * Setup individual slider
         */
        async setupSlider(sliderElement, settings, products) {
            // Set title with optional icon
            const titleElement = sliderElement.querySelector('.yuddy-cs-slider-title');
            if (titleElement) {
                // Başlık ikonu varsa ekle (ASYNC FIX)
                if (settings.titleIcon) {
                    await this.setTitleWithIcon(titleElement, settings.title, settings.titleIcon);
                }
                else {
                    titleElement.textContent = settings.title;
                }
                // Font boyutu varsa uygula
                if (settings.titleFontSize) {
                    titleElement.style.fontSize = settings.titleFontSize;
                }
                // Başlık rengi
                if (settings.titleTextColor) {
                    titleElement.style.color = settings.titleTextColor;
                }
            }
            // Render products
            const itemsContainer = sliderElement.querySelector('.yuddy-cs-slider-items');
            if (itemsContainer) {
                itemsContainer.innerHTML = '';
                // Batch insert products (performance)
                const productsHTML = products.map(product => getProductCardHTML(product.id, product.name, product.price, product.imageUrl, product.url, product.originalPrice, product.badge)).join('');
                itemsContainer.insertAdjacentHTML('beforeend', productsHTML);
            }
            // Stil ayarlarını uygula (DUPLICATE FIX)
            this.applySliderStyles(sliderElement, settings);
            // Setup navigation (MEMORY LEAK FIX)
            this.setupNavigation(sliderElement);
        }
        /**
         * Apply slider settings (colors, fonts, button text)
         * ✅ PERFORMANCE FIX - Generic types + value caching
         */
        applySliderStyles(sliderElement, settings) {
            // Cache selectors with generic types (type-safe + performance)
            const productCards = sliderElement.querySelectorAll('.yuddy-cs-product-card');
            const productNames = sliderElement.querySelectorAll('.yuddy-cs-product-name');
            const prices = sliderElement.querySelectorAll('.yuddy-cs-product-price');
            // Ürün kartı arka plan rengi
            if (settings.itemBackgroundColor) {
                const backgroundColor = settings.itemBackgroundColor; // Cache value
                productCards.forEach(card => {
                    card.style.backgroundColor = backgroundColor;
                });
            }
            // Ürün adı rengi
            if (settings.itemTitleColor) {
                const titleColor = settings.itemTitleColor; // Cache value
                productNames.forEach(name => {
                    name.style.color = titleColor;
                });
            }
            // Fiyat rengi
            if (settings.itemPriceColor) {
                const priceColor = settings.itemPriceColor; // Cache value
                prices.forEach(price => {
                    price.style.color = priceColor;
                });
            }
        }
        /**
         * Set title with icon from Iconify
         */
        async setTitleWithIcon(titleElement, title, iconName) {
            // Guard: Missing params
            if (!titleElement || !title || !iconName) {
                return;
            }
            // İkon loading placeholder ekle
            titleElement.innerHTML = `
            <span style="display: inline-flex; align-items: center; gap: 8px;">
                <span class="yuddy-cs-icon-loading" style="width: 20px; height: 20px; font-size: x-large; opacity: 0.3;">⏳</span>
                <span>${title}</span>
            </span>
        `;
            try {
                const iconSvg = await this.fetchIconifySvg(iconName);
                if (iconSvg) {
                    titleElement.innerHTML = `
                    <span style="display: inline-flex; align-items: center; gap: 8px;">
                        <span class="yuddy-cs-title-icon" style="display: inline-flex; width: 20px; height: 20px; font-size: x-large;">${iconSvg}</span>
                        <span>${title}</span>
                    </span>
                `;
                }
                else {
                    // Fallback: Show only text
                    titleElement.textContent = title;
                }
            }
            catch (error) {
                console.warn('[Yuddy CS] Icon loading failed:', error);
                titleElement.textContent = title;
            }
        }
        /**
         * Fetch icon SVG from Iconify API
         */
        async fetchIconifySvg(iconName) {
            try {
                const [collection, icon] = iconName.split(':');
                // Guard: Invalid format
                if (!collection || !icon) {
                    console.warn('[Yuddy CS] Invalid icon format:', iconName);
                    return null;
                }
                const url = `https://api.iconify.design/${collection}/${icon}.svg`;
                const response = await fetch(url);
                // Guard: HTTP error
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return await response.text();
            }
            catch (error) {
                console.warn(`[Yuddy CS] Failed to fetch icon "${iconName}":`, error);
                return null;
            }
        }
        /**
         * Setup slider navigation
         * ✅ MEMORY LEAK FIX - Event listener'lar artık temizleniyor
         */
        setupNavigation(sliderElement) {
            const sliderTrack = sliderElement.querySelector('.yuddy-cs-slider-track');
            const prevButton = sliderElement.querySelector('.yuddy-cs-arrow-prev');
            const nextButton = sliderElement.querySelector('.yuddy-cs-arrow-next');
            // Guard: Missing slider track
            if (!sliderTrack) {
                return;
            }
            const scrollAmount = 160;
            // Previous button (MEMORY LEAK FIX)
            if (prevButton) {
                const prevHandler = () => {
                    sliderTrack.scrollBy({
                        left: -scrollAmount,
                        behavior: 'smooth',
                    });
                };
                prevButton.addEventListener('click', prevHandler);
                this.navigationListeners.push({
                    element: prevButton,
                    type: 'click',
                    handler: prevHandler
                });
            }
            // Next button (MEMORY LEAK FIX)
            if (nextButton) {
                const nextHandler = () => {
                    sliderTrack.scrollBy({
                        left: scrollAmount,
                        behavior: 'smooth',
                    });
                };
                nextButton.addEventListener('click', nextHandler);
                this.navigationListeners.push({
                    element: nextButton,
                    type: 'click',
                    handler: nextHandler
                });
            }
        }
        /**
         * Show widget
         */
        showWidget() {
            if (this.widgetElement) {
                this.widgetElement.style.display = 'block';
            }
        }
        /**
         * Hide widget
         */
        hideWidget() {
            if (this.widgetElement) {
                this.widgetElement.style.display = 'none';
            }
        }
        /**
         * Cleanup (MEMORY LEAK FIX)
         */
        cleanup() {
            // Remove navigation event listeners
            this.navigationListeners.forEach(({ element, type, handler }) => {
                element.removeEventListener(type, handler);
            });
            this.navigationListeners = [];
            // Remove beforeunload listener
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
            // Reset references
            this.widgetElement = null;
            this.slider1Element = null;
            this.slider2Element = null;
            this.isInitialized = false;
        }
    }

    class CookieManager {
        /**
         * Set a cookie
         */
        setCookie(name, value, options = {}) {
            const { expires = 24, // hours
            domain = window.location.hostname, path = '/', secure = false, sameSite = 'lax', } = options;
            const expirationDate = new Date(Date.now() + expires * 60 * 60 * 1000);
            let cookieString = `${name}=${encodeURIComponent(value)}`;
            cookieString += `; expires=${expirationDate.toUTCString()}`;
            cookieString += `; path=${path}`;
            cookieString += `; domain=${domain}`;
            if (secure) {
                cookieString += '; secure';
            }
            cookieString += `; samesite=${sameSite}`;
            document.cookie = cookieString;
        }
        /**
         * Get a cookie value
         */
        getCookie(name) {
            const cookies = document.cookie.split('; ');
            for (const cookie of cookies) {
                const [cookieName, cookieValue] = cookie.split('=');
                if (cookieName === name) {
                    return decodeURIComponent(cookieValue);
                }
            }
            return null;
        }
        /**
         * Delete a cookie
         */
        deleteCookie(name, path = '/', domain) {
            const cookieDomain = domain || window.location.hostname;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${cookieDomain}`;
        }
        /**
         * Check if a cookie exists
         */
        hasCookie(name) {
            return this.getCookie(name) !== null;
        }
        /**
         * Check if a time-based cookie has expired
         */
        isCookieExpired(name) {
            const value = this.getCookie(name);
            if (!value || value !== 'true') {
                return true;
            }
            return false;
        }
        /**
         * Set widget shown cookie
         */
        setWidgetShown(hours = 24) {
            this.setCookie(WIDGET_COOKIE_NAMES.WIDGET_SHOWN, 'true', {
                expires: hours,
            });
        }
        /**
         * Check if widget was shown
         */
        wasWidgetShown() {
            return !this.isCookieExpired(WIDGET_COOKIE_NAMES.WIDGET_SHOWN);
        }
        /**
         * Set widget blocked cookie
         */
        setWidgetBlocked(hours = 24) {
            this.setCookie(WIDGET_COOKIE_NAMES.WIDGET_BLOCKED, 'true', {
                expires: hours,
            });
        }
        /**
         * Check if widget is blocked
         */
        isWidgetBlocked() {
            return !this.isCookieExpired(WIDGET_COOKIE_NAMES.WIDGET_BLOCKED);
        }
        /**
         * Save user preferences
         */
        saveUserPreferences(preferences) {
            this.setCookie(WIDGET_COOKIE_NAMES.USER_PREFERENCES, JSON.stringify(preferences), {
                expires: 24 * 30, // 30 days
            });
        }
        /**
         * Get user preferences
         */
        getUserPreferences() {
            const value = this.getCookie(WIDGET_COOKIE_NAMES.USER_PREFERENCES);
            if (!value)
                return null;
            try {
                return JSON.parse(value);
            }
            catch {
                return null;
            }
        }
    }

    class WidgetVisibilityManager {
        constructor(cookieManager) {
            this.cookieManager = cookieManager;
        }
        /**
         * Check if widget should be shown
         * Yeni API formatında visibility ayarları yok, her zaman true döner
         */
        shouldShowWidget(widgetData) {
            if (!widgetData) {
                return false;
            }
            // En az bir sliderda gösterilecek ürün varsa widget'ı göster
            return ((widgetData.slider1?.products?.length ?? 0) > 0 ||
                (widgetData.slider2?.products?.length ?? 0) > 0);
        }
        /**
         * Check if device is compatible (her zaman true)
         */
        isDeviceCompatible(_widgetData) {
            // Yeni formatta device visibility yok, her zaman göster
            return true;
        }
        /**
         * Check if should show on current page (her zaman true)
         */
        checkCurrentPageVisibility(_widgetData) {
            // Yeni formatta page visibility yok, her zaman göster
            return true;
        }
    }

    class CartSuggestion {
        constructor(containerSelector) {
            this.widgetData = null;
            this.isInitialized = false;
            this.apiBaseUrl = "https://testapi.yuddy.com/api/v1/engagements";
            // Event listener cleanup references
            this.eventListeners = [];
            this.originalHistoryMethods = {};
            // Track if history methods are already overridden
            this.historyMethodsOverridden = false;
            // Cache last pathname to avoid redundant visibility checks
            this.lastPathname = '';
            // Initialize managers
            this.storageManager = new StorageManager();
            this.cookieManager = new CookieManager();
            this.apiClient = new APIClient(this.apiBaseUrl);
            this.domManager = new DOMManager(containerSelector);
            this.visibilityManager = new WidgetVisibilityManager(this.cookieManager);
            // Setup page change listeners BEFORE init
            this.setupPageChangeListeners();
            // Initialize widget
            this.initializeWidget();
        }
        /**
         * Initialize widget when DOM is ready
         */
        initializeWidget() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            }
            else {
                this.init();
            }
        }
        /**
         * Main initialization function
         */
        async init() {
            // Guard: Already initialized
            if (this.isInitialized) {
                return;
            }
            try {
                // Fetch widget data
                this.widgetData = await this.apiClient.getWidgetData(window.location.hostname);
                // Guard: No data received
                if (!this.widgetData) {
                    console.log('ℹ️ [Yuddy CS Widget] No data received from API, widget will not be displayed');
                    return;
                }
                // Guard: Visibility conditions not met
                if (!this.visibilityManager.shouldShowWidget(this.widgetData)) {
                    console.log('ℹ️ [Yuddy CS Widget] Visibility conditions not met');
                    return;
                }
                // Initialize DOM
                await this.domManager.init(this.widgetData);
                // Setup event listeners
                this.setupEventListeners();
                // Show widget
                this.domManager.showWidget();
                // Track impression
                this.trackImpression();
                this.isInitialized = true;
                // Set initial pathname after successful init
                this.lastPathname = window.location.pathname;
                console.log('✅ [Yuddy CS Widget] Successfully loaded');
            }
            catch (error) {
                console.error('❌ [Yuddy CS Widget] Loading error:', error);
                this.handleError(error);
            }
        }
        /**
         * Setup event listeners for product interactions
         */
        setupEventListeners() {
            const widgetElement = document.getElementById('yuddy-cart-suggestion');
            if (!widgetElement) {
                return;
            }
            // Product click tracking (event delegation - performance)
            const clickHandler = (e) => {
                const target = e.target;
                const productCard = target.closest('.yuddy-cs-product-card');
                if (!productCard) {
                    return;
                }
                const productId = productCard.getAttribute('data-product-id');
                if (productId) {
                    // Local storage tracking
                    this.storageManager.addViewedProduct(productId);
                }
            };
            widgetElement.addEventListener('click', clickHandler);
            // Store for cleanup
            this.eventListeners.push({
                element: widgetElement,
                type: 'click',
                handler: clickHandler
            });
        }
        /**
         * Track product impressions
         */
        trackImpression() {
            if (!this.widgetData) {
                return;
            }
            const productIds = [];
            // Collect product IDs from both sliders
            if (this.widgetData.slider1?.products) {
                productIds.push(...this.widgetData.slider1.products.map(p => String(p.id)));
            }
            if (this.widgetData.slider2?.products) {
                productIds.push(...this.widgetData.slider2.products.map(p => String(p.id)));
            }
            if (productIds.length === 0) {
                return;
            }
            // Local storage tracking
            this.storageManager.saveLastShownProducts(productIds);
        }
        /**
         * Handle add to cart action
         */
        handleAddToCart(productId) {
            // Guard: Invalid product ID
            if (!productId) {
                return;
            }
            console.log('Add to cart clicked:', productId);
            this.storageManager.addToCart(productId);
            // Emit custom event for platform integration
            const event = new CustomEvent('yuddy-cart-add-to-cart', {
                detail: { productId },
            });
            window.dispatchEvent(event);
        }
        /**
         * Setup page change listeners for SPA support
         */
        setupPageChangeListeners() {
            // Popstate listener (back/forward navigation)
            const popstateHandler = () => this.handlePageChange();
            window.addEventListener('popstate', popstateHandler);
            this.eventListeners.push({
                element: window,
                type: 'popstate',
                handler: popstateHandler
            });
            // Guard against multiple history method overrides
            if (this.historyMethodsOverridden) {
                return;
            }
            // Store original history methods for cleanup
            this.originalHistoryMethods.pushState = history.pushState;
            this.originalHistoryMethods.replaceState = history.replaceState;
            // Monitor pushState
            history.pushState = (...args) => {
                this.originalHistoryMethods.pushState?.apply(history, args);
                window.dispatchEvent(new Event('pushstate'));
            };
            // Monitor replaceState
            history.replaceState = (...args) => {
                this.originalHistoryMethods.replaceState?.apply(history, args);
                window.dispatchEvent(new Event('replacestate'));
            };
            // Custom event listeners
            const pushstateHandler = () => this.handlePageChange();
            const replacestateHandler = () => this.handlePageChange();
            window.addEventListener('pushstate', pushstateHandler);
            window.addEventListener('replacestate', replacestateHandler);
            this.eventListeners.push({ element: window, type: 'pushstate', handler: pushstateHandler }, { element: window, type: 'replacestate', handler: replacestateHandler });
            // Mark as overridden to prevent duplicate overrides
            this.historyMethodsOverridden = true;
        }
        /**
         * Handle page change
         */
        handlePageChange() {
            // Guard: Not initialized or no data
            if (!this.widgetData || !this.isInitialized) {
                return;
            }
            // Skip if pathname hasn't changed (optimization for hash/state changes)
            const currentPathname = window.location.pathname;
            if (currentPathname === this.lastPathname) {
                return;
            }
            this.lastPathname = currentPathname;
            const shouldShow = this.visibilityManager.checkCurrentPageVisibility(this.widgetData);
            if (shouldShow) {
                this.domManager.showWidget();
            }
            else {
                this.domManager.hideWidget();
            }
        }
        /**
         * Handle errors
         */
        handleError(error) {
            console.error('Cart Suggestion Error:', error);
            // Emit custom error event
            const event = new CustomEvent('yuddy-cart-suggestion-error', {
                detail: { error },
            });
            window.dispatchEvent(event);
            // Handle specific widget errors
            if (error instanceof WidgetError$1) {
                console.error(`Widget Error [${error.code}]:`, error.message);
            }
        }
        /**
         * Public API: Refresh widget with new data
         */
        async refresh() {
            this.isInitialized = false;
            this.domManager.cleanup();
            // Reset pathname cache on refresh
            this.lastPathname = '';
            await this.init();
        }
        /**
         * Public API: Show widget manually
         */
        show() {
            this.domManager.showWidget();
        }
        /**
         * Public API: Hide widget manually
         */
        hide() {
            this.domManager.hideWidget();
        }
        /**
         * Public API: Destroy widget
         */
        destroy() {
            // Cleanup event listeners
            this.eventListeners.forEach(({ element, type, handler }) => {
                element.removeEventListener(type, handler);
            });
            this.eventListeners = [];
            // Only restore history methods if we overrode them
            if (this.historyMethodsOverridden) {
                if (this.originalHistoryMethods.pushState) {
                    history.pushState = this.originalHistoryMethods.pushState;
                }
                if (this.originalHistoryMethods.replaceState) {
                    history.replaceState = this.originalHistoryMethods.replaceState;
                }
                this.historyMethodsOverridden = false;
            }
            // Cleanup DOM
            this.domManager.cleanup();
            // Reset state
            this.isInitialized = false;
            this.widgetData = null;
            this.lastPathname = '';
        }
    }

    const DEFAULT_CART_SELECTORS = [
        '.cart-drawer-height',
        '.MiniBasket_mini-basket__content__bdBr8',
    ];
    const DEFAULT_BASKET_ICON_SELECTORS = [
        '.basket-bag',
        '.Header_header__icon-link__T6JFE[title="Sepet"]',
    ];
    const PLATFORM_SELECTOR_CONFIG = {
        ikas: {
            cartSelectors: DEFAULT_CART_SELECTORS,
            basketIconSelectors: DEFAULT_BASKET_ICON_SELECTORS,
        },
        ideasoft: {
            cartSelectors: [
                '.cart-content-middle .cart-list',
                '#divCartContainer',
                '.header-cart',
                '.js-cart-container',
            ],
            basketIconSelectors: [
                '.cart-menu .openbox',
                '.header-cart-toggle',
                '.js-cart-toggle',
                'a[href*="/sepet"]',
                'a[href*="/cart"]',
            ],
        },
        shopify: {
            cartSelectors: [
                'cart-drawer',
                '.drawer__inner',
                '.cart-drawer',
            ],
            basketIconSelectors: [
                'a[href="/cart"]',
                '.header__icon--cart',
                '[data-cart-toggle]',
            ],
        },
        tsoft: {
            cartSelectors: ['.basket-content', '.mini-basket-content'],
            basketIconSelectors: ['.basket-link', '.header-basket'],
        },
        other: {
            cartSelectors: DEFAULT_CART_SELECTORS,
            basketIconSelectors: DEFAULT_BASKET_ICON_SELECTORS,
        },
    };
    const mergeUniqueSelectors = (...selectorGroups) => Array.from(new Set(selectorGroups.flat().filter(Boolean)));
    const getCartSelectorsForPlatform = (platform) => mergeUniqueSelectors(PLATFORM_SELECTOR_CONFIG[platform].cartSelectors, DEFAULT_CART_SELECTORS);
    const getBasketIconSelectorsForPlatform = (platform) => mergeUniqueSelectors(PLATFORM_SELECTOR_CONFIG[platform].basketIconSelectors, DEFAULT_BASKET_ICON_SELECTORS);

    var css_248z = "/* Yuddy Cart Suggestion Widget Styles */\n\n.yuddy-cs-widget {\n    width: 100%;\n    margin: 0;\n    padding: 0;\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n}\n\n/* Slider Container */\n.yuddy-cs-slider-container {\n    padding: 3px;\n    background-color: #FFFFFF;\n    position: relative;\n}\n\n.yuddy-cs-slider-container:not(:last-child) {\n    margin-bottom: 0;\n}\n\n/* Slider Header */\n.yuddy-cs-slider-header {\n    margin-bottom: 12px;\n}\n\n.yuddy-cs-slider-title {\n    font-size: 16px;\n    font-weight: 700;\n    margin: 0;\n    color: #2c3e50;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n}\n\n.yuddy-cs-slider-title-icon {\n    font-size: 20px;\n    display: inline-flex;\n    align-items: center;\n}\n\n/* Slider Wrapper - Horizontal scroll with navigation */\n.yuddy-cs-slider-wrapper {\n    position: relative;\n}\n\n.yuddy-cs-slider-track {\n    overflow-x: auto;\n    scroll-behavior: smooth;\n    scrollbar-width: none;\n    /* Firefox */\n    -ms-overflow-style: none;\n    /* IE and Edge */\n    padding-bottom: 8px;\n}\n\n.yuddy-cs-slider-track::-webkit-scrollbar {\n    display: none;\n    /* Chrome, Safari, Opera */\n}\n\n.yuddy-cs-slider-items {\n    display: flex;\n    gap: 5px;\n}\n\n/* Arrow Buttons - Positioned over slider */\n.yuddy-cs-arrow {\n    position: absolute;\n    top: 50%;\n    transform: translateY(-50%);\n    width: 32px;\n    height: 32px;\n    border: none;\n    background-color: #ffffff;\n    border-radius: 50%;\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);\n    transition: all 0.2s ease;\n    z-index: 10;\n}\n\n.yuddy-cs-arrow:hover {\n    background-color: #ffffff;\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n}\n\n.yuddy-cs-arrow:active {\n    transform: translateY(-50%) scale(0.95);\n}\n\n.yuddy-cs-arrow:disabled {\n    opacity: 0.3;\n    cursor: not-allowed;\n}\n\n.yuddy-cs-arrow-prev {\n    left: 8px;\n}\n\n.yuddy-cs-arrow-next {\n    right: 8px;\n}\n\n.yuddy-cs-arrow svg {\n    width: 20px;\n    height: 20px;\n    color: #333333;\n}\n\n/* Dots Navigation */\n.yuddy-cs-dots {\n    display: none;\n    /* Preview'da dots yok */\n}\n\n/* Product Card - Preview tasarımına uygun */\n.yuddy-cs-product-card {\n    flex: 0 0 auto;\n    min-width: 120px;\n    width: 115px;\n    background-color: #ffffff;\n    border-radius: 12px;\n    overflow: hidden;\n    border: 1px solid #e0e0e0;\n    padding: 5px;\n    cursor: pointer;\n    transition: all 0.2s ease;\n}\n\n.yuddy-cs-product-card:hover {\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);\n    transform: translateY(-2px);\n}\n\n.yuddy-cs-product-link {\n    text-decoration: none;\n    color: inherit;\n    display: block;\n}\n\n/* Product Image - Preview tasarımı */\n.yuddy-cs-product-image-wrapper {\n    position: relative;\n    width: 100%;\n    margin-bottom: 5px;\n}\n\n.yuddy-cs-product-image {\n    width: 100%;\n    height: 110px;\n    object-fit: cover;\n    border-radius: 8px;\n}\n\n/* Badges - Kaldırıldı (preview'da yok) */\n.yuddy-cs-product-badge,\n.yuddy-cs-product-discount {\n    display: none;\n}\n\n/* Product Info */\n.yuddy-cs-product-info {\n    padding: 0;\n}\n\n.yuddy-cs-product-name {\n    font-size: 12px !important;\n    font-weight: 600;\n    margin: 0 0 4px 0;\n    color: #333333;\n    overflow: hidden;\n    display: -webkit-box;\n    -webkit-line-clamp: 2;   /* 2 satırda sınırla */\n    -webkit-box-orient: vertical;\n    white-space: normal;\n    text-overflow: ellipsis;\n    line-height: 1.4;\n    max-height: 2.8em;\n}\n\n/* Prices */\n.yuddy-cs-product-prices {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    margin-bottom: 8px;\n}\n\n.yuddy-cs-product-price {\n    font-size: 13px;\n    font-weight: 700;\n    color: #e74c3c;\n}\n\n.yuddy-cs-product-original-price {\n    display: none;\n    /* Preview'da gösterilmiyor */\n}\n\n/* Responsive Design */\n@media (max-width: 1024px) {\n    .yuddy-cs-product-card {\n        flex: 0 0 calc(33.333% - 14px);\n    }\n\n    .yuddy-cs-slider-title {\n        font-size: 20px;\n    }\n}\n\n@media (max-width: 768px) {\n    .yuddy-cs-widget {\n        margin: 20px 0;\n    }\n\n    .yuddy-cs-slider-container {\n        padding: 0 4px;\n    }\n\n    .yuddy-cs_product-card {\n        flex: 0 0 calc(50% - 10px);\n        min-width: 150px;\n    }\n\n    .yuddy-cs-slider-title {\n        font-size: 18px;\n    }\n\n    .yuddy-cs-arrow {\n        width: 32px;\n        height: 32px;\n    }\n\n    .yuddy-cs-arrow svg {\n        width: 20px;\n        height: 20px;\n    }\n\n    .yuddy-cs-product-name {\n        font-size: 13px;\n        min-height: 20px;\n    }\n\n    .yuddy-cs-product-price {\n        font-size: 16px;\n    }\n\n    .yuddy-cs-product-original-price {\n        font-size: 14px;\n    }\n}\n\n@media (max-width: 480px) {\n    .yuddy-cs-slider-items {\n        gap: 2px;\n    }\n\n    .yuddy-cs_product-card {\n        min-width: 108px;\n    }\n\n    .yuddy-cs-product-info {\n        padding: 5px;\n    }\n}\n\n/* Grid Layout (Alternative) */\n.yuddy-cs-slider-container.grid-layout .yuddy-cs-slider-items {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n    gap: 20px;\n}\n\n.yuddy-cs-slider-container.grid-layout .yuddy-cs-product-card {\n    flex: unset;\n}\n\n/* Loading State */\n.yuddy-cs-widget.loading {\n    opacity: 0.6;\n    pointer-events: none;\n}\n\n/* Animation */\n@keyframes slideIn {\n    from {\n        opacity: 0;\n        transform: translateY(20px);\n    }\n\n    to {\n        opacity: 1;\n        transform: translateY(0);\n    }\n}\n\n.yuddy-cs-widget {\n    animation: slideIn 0.3s ease-out;\n}";
    (function() {
        if (typeof document === 'undefined') return;
        
        // Guard: Only inject once
        if (document.getElementById('yuddy-cart-suggestion-styles')) {
            return;
        }
        
        var style = document.createElement('style');
        style.id = 'yuddy-cart-suggestion-styles';
        style.textContent = css_248z;
        
        // Inject into head (non-blocking)
        if (document.head) {
            document.head.appendChild(style);
        } else {
            // Fallback: Wait for head to be available
            document.addEventListener('DOMContentLoaded', function() {
                if (document.head && !document.getElementById('yuddy-cart-suggestion-styles')) {
                    document.head.appendChild(style);
                }
            });
        }
    })();

    const detectedPlatform = detectPlatform();
    const CART_SELECTORS = getCartSelectorsForPlatform(detectedPlatform);
    const BASKET_ICON_SELECTORS = getBasketIconSelectorsForPlatform(detectedPlatform);
    // ✅ Widget element ID
    const WIDGET_ID = 'yuddy-cart-suggestion';
    // ✅ SAFE: Inject CSS once into <head> (guarded)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        if (!document.getElementById('yuddy-cart-suggestion-styles')) {
            console.log('🎨 [Yuddy CS] CSS will be auto-injected by PostCSS plugin');
        }
    }
    class FlexibleCartSuggestion {
        constructor(targetSelector) {
            this.instance = null;
            this.init(targetSelector);
        }
        async init(targetSelector) {
            try {
                const selectors = targetSelector
                    ? [targetSelector, ...CART_SELECTORS]
                    : [...CART_SELECTORS];
                const foundSelector = this.findFirstMatchingSelector(selectors);
                if (foundSelector) {
                    this.instance = new CartSuggestion(foundSelector);
                }
            }
            catch (error) {
                console.error('❌ [Yuddy CS] Widget initialization error:', error);
            }
        }
        findFirstMatchingSelector(selectors) {
            for (const selector of selectors) {
                if (document.querySelector(selector)) {
                    return selector;
                }
            }
            return null;
        }
        destroy() {
            if (this.instance) {
                this.instance.destroy?.();
                this.instance = null;
            }
        }
    }
    // Auto-initialize if used as UMD in browser
    if (typeof window !== 'undefined') {
        window.CartSuggestion = FlexibleCartSuggestion;
        window.OriginalCartSuggestion = CartSuggestion;
        let widgetInstance = null;
        let basketClickListenerAdded = false;
        let cartObserver = null;
        let positionObserver = null;
        const selectorCache = new Map();
        let initializationInProgress = false;
        // ✅ NEW: Track if SPA listeners are already set up
        let spaListenersAdded = false;
        /**
         * ✅ PERFORMANCE FIX: Get cached element with validation
         */
        const getCachedElement = (selector) => {
            if (selectorCache.has(selector)) {
                const cached = selectorCache.get(selector);
                if (cached && document.contains(cached)) {
                    return cached;
                }
                selectorCache.delete(selector);
            }
            const element = document.querySelector(selector);
            selectorCache.set(selector, element);
            return element;
        };
        /**
         * ✅ PERFORMANCE FIX: Clear cache entry
         */
        const clearCacheEntry = (selector) => {
            selectorCache.delete(selector);
        };
        /**
         * ✅ NEW: Clear all selector cache
         */
        const clearAllCache = () => {
            selectorCache.clear();
            console.log('🧹 [Yuddy CS] Selector cache temizlendi');
        };
        /**
         * ✅ NEW: Check if widget exists in DOM
         */
        const isWidgetInDOM = () => {
            return document.getElementById(WIDGET_ID) !== null;
        };
        /**
         * ✅ NEW: Check if widget exists inside cart container
         */
        const isWidgetInCartContainer = () => {
            const widgetElement = document.getElementById(WIDGET_ID);
            if (!widgetElement) {
                return false;
            }
            // Check if widget is inside any cart container
            for (const selector of CART_SELECTORS) {
                const cartContainer = document.querySelector(selector);
                if (cartContainer && cartContainer.contains(widgetElement)) {
                    return true;
                }
            }
            return false;
        };
        /**
         * ✅ IMPROVED: Check if element is cart container (uses CART_SELECTORS)
         */
        const isCartContainer = (element) => {
            // Check if element has cart container class
            for (const selector of CART_SELECTORS) {
                const className = selector.replace('.', '');
                if (element.classList?.contains(className)) {
                    return true;
                }
            }
            // Check if element contains cart container as child
            for (const selector of CART_SELECTORS) {
                if (element.querySelector(selector)) {
                    return true;
                }
            }
            return false;
        };
        /**
         * ✅ IMPROVED: Ensure widget is always at the bottom of cart container
         */
        const ensureWidgetPosition = () => {
            const widgetElement = document.getElementById(WIDGET_ID);
            if (!widgetElement) {
                return;
            }
            const parentContainer = widgetElement.parentElement;
            if (!parentContainer) {
                console.warn('⚠️ [Yuddy CS] Widget parent container bulunamadı');
                return;
            }
            const lastChild = parentContainer.lastElementChild;
            if (lastChild === widgetElement) {
                return; // ✅ Already at bottom
            }
            console.log('🔄 [Yuddy CS] Widget en alta taşınıyor...');
            parentContainer.appendChild(widgetElement);
            console.log('✅ [Yuddy CS] Widget en alta taşındı');
        };
        /**
         * ✅ IMPROVED: Observe widget position with subtree monitoring
         */
        const observeWidgetPosition = () => {
            if (positionObserver) {
                return;
            }
            const widgetElement = document.getElementById(WIDGET_ID);
            if (!widgetElement || !widgetElement.parentElement) {
                return;
            }
            const parentContainer = widgetElement.parentElement;
            let repositionTimeout = null;
            let mutationCount = 0; // ✅ NEW: Track mutation count
            const scheduleReposition = () => {
                if (repositionTimeout) {
                    return;
                }
                repositionTimeout = setTimeout(() => {
                    repositionTimeout = null;
                    const currentWidget = document.getElementById(WIDGET_ID);
                    if (!currentWidget || currentWidget !== widgetElement) {
                        return;
                    }
                    if (!isWidgetInCartContainer()) {
                        return;
                    }
                    ensureWidgetPosition();
                    // ✅ IMPROVED: Log batch summary after repositioning
                    if (mutationCount > 0) {
                        console.log(`✅ [Yuddy CS] Widget pozisyonu kontrol edildi (${mutationCount} değişiklik)`);
                        mutationCount = 0;
                    }
                }, 100);
            };
            positionObserver = new MutationObserver((mutations) => {
                let shouldReposition = false;
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE && node !== widgetElement) {
                                shouldReposition = true;
                                mutationCount++; // ✅ NEW: Count mutations
                                break;
                            }
                        }
                    }
                    if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                        for (const node of mutation.removedNodes) {
                            if (node === widgetElement) {
                                console.warn('⚠️ [Yuddy CS] Widget parent container\'dan çıkarıldı!');
                                stopObservingWidgetPosition();
                                return;
                            }
                        }
                    }
                    if (mutation.type === 'attributes') {
                        shouldReposition = true;
                        mutationCount++; // ✅ NEW: Count mutations
                    }
                    if (shouldReposition)
                        break;
                }
                if (shouldReposition) {
                    scheduleReposition();
                }
            });
            positionObserver.observe(parentContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style'],
            });
            console.log('👀 [Yuddy CS] Widget pozisyon observer aktif edildi (subtree: true)');
        };
        /**
         * ✅ NEW: Stop observing widget position
         */
        const stopObservingWidgetPosition = () => {
            if (positionObserver) {
                positionObserver.disconnect();
                positionObserver = null;
                console.log('🛑 [Yuddy CS] Widget pozisyon observer durduruldu');
            }
        };
        /**
         * ✅ IMPROVED: Initialize widget with cart container content check
         */
        const initializeWidget = () => {
            const foundSelector = findCartContainer();
            if (!foundSelector) {
                console.warn('⚠️ [Yuddy CS] Sepet container bulunamadı, widget eklenmeyecek');
                return;
            }
            // ✅ Check if widget exists in DOM
            const widgetExistsInDOM = isWidgetInDOM();
            // ✅ Check if widget is inside cart container
            const widgetInCartContainer = isWidgetInCartContainer();
            if (widgetExistsInDOM && widgetInCartContainer) {
                // ✅ Widget exists and is in correct location
                console.log('🔄 [Yuddy CS] Widget zaten mevcut ve doğru konumda');
                // ✅ Force position check (in case it moved)
                ensureWidgetPosition();
                // ✅ Restart observer (in case it was stopped)
                stopObservingWidgetPosition();
                observeWidgetPosition();
                return;
            }
            if (widgetExistsInDOM && !widgetInCartContainer) {
                // ✅ Widget exists but NOT in cart container (probably removed from cart)
                console.log('🧹 [Yuddy CS] Widget DOM\'da ama sepet dışında, temizleniyor...');
                if (widgetInstance) {
                    stopObservingWidgetPosition();
                    widgetInstance.destroy();
                    widgetInstance = null;
                }
                // Remove orphaned widget element
                const orphanedWidget = document.getElementById(WIDGET_ID);
                if (orphanedWidget) {
                    orphanedWidget.remove();
                    console.log('✅ [Yuddy CS] Yetim widget elementi temizlendi');
                }
            }
            // ✅ Create new widget instance
            console.log('✅ [Yuddy CS] Sepet container bulundu, widget ekleniyor...');
            if (widgetInstance) {
                console.log('🧹 [Yuddy CS] Eski widget instance temizleniyor...');
                stopObservingWidgetPosition();
                widgetInstance.destroy();
                widgetInstance = null;
            }
            widgetInstance = new FlexibleCartSuggestion(foundSelector);
            // ✅ Position check after widget is created
            setTimeout(() => {
                ensureWidgetPosition();
                observeWidgetPosition();
            }, 100);
        };
        /**
         * Find cart container
         */
        const findCartContainer = () => {
            for (const selector of CART_SELECTORS) {
                if (getCachedElement(selector)) {
                    console.log(`✅ [Yuddy CS] Sepet container bulundu: ${selector}`);
                    return selector;
                }
            }
            return null;
        };
        /**
         * ✅ IMPROVED: Handle basket icon click with direct widget existence check
         */
        const handleBasketIconClick = (event) => {
            const target = event.target;
            const basketIcon = target.closest(BASKET_ICON_SELECTORS.join(','));
            if (!basketIcon) {
                return;
            }
            console.log('🛒 [Yuddy CS] Sepet ikonuna tıklandı, widget kontrol ediliyor...');
            // ✅ GUARD 1: Widget already exists and is in correct location?
            const widgetExistsInDOM = isWidgetInDOM();
            const widgetInCartContainer = isWidgetInCartContainer();
            if (widgetExistsInDOM && widgetInCartContainer) {
                console.log('✅ [Yuddy CS] Widget zaten mevcut ve doğru konumda, yeni oluşturulmayacak');
                // Sadece pozisyon kontrolü yap
                ensureWidgetPosition();
                if (!positionObserver) {
                    observeWidgetPosition();
                }
                return; // ✅ Early exit - no initialization needed
            }
            // ✅ GUARD 2: Widget exists but outside cart? Clean it up
            if (widgetExistsInDOM && !widgetInCartContainer) {
                console.log('🧹 [Yuddy CS] Widget sepet dışında, temizleniyor...');
                if (widgetInstance) {
                    stopObservingWidgetPosition();
                    widgetInstance.destroy();
                    widgetInstance = null;
                }
                const orphanedWidget = document.getElementById(WIDGET_ID);
                if (orphanedWidget) {
                    orphanedWidget.remove();
                    console.log('✅ [Yuddy CS] Yetim widget temizlendi');
                }
                // Continue to initialization (don't return)
            }
            // ✅ GUARD 3: Initialization already in progress?
            if (initializationInProgress) {
                console.log('⏳ [Yuddy CS] Initialization zaten devam ediyor, atlanıyor...');
                return;
            }
            // ✅ Widget yoksa veya temizlendiyse → Initialization başlat
            console.log('🔄 [Yuddy CS] Widget yok, initialization başlatılıyor...');
            initializationInProgress = true;
            let retryCount = 0;
            const maxRetries = 4;
            const smartRetry = () => {
                if (retryCount >= maxRetries) {
                    console.warn('⚠️ [Yuddy CS] Max retry limit reached, stopping...');
                    initializationInProgress = false;
                    return;
                }
                const foundContainer = findCartContainer();
                if (foundContainer) {
                    console.log('🔍 [Yuddy CS] Sepet container bulundu, widget oluşturuluyor...');
                    initializeWidget();
                    initializationInProgress = false;
                    return;
                }
                retryCount++;
                const delay = 300 * retryCount;
                console.log(`⏳ [Yuddy CS] Sepet container bulunamadı, retry ${retryCount}/${maxRetries} (${delay}ms sonra)`);
                if (retryCount === maxRetries) {
                    setTimeout(() => {
                        initializationInProgress = false;
                    }, delay + 100);
                }
                setTimeout(smartRetry, delay);
            };
            smartRetry();
        };
        /**
         * Setup basket listener with event delegation
         */
        const setupBasketListener = () => {
            if (basketClickListenerAdded) {
                return;
            }
            document.body.addEventListener('click', handleBasketIconClick, true);
            basketClickListenerAdded = true;
            console.log('🛒 [Yuddy CS] Basket icon listener (event delegation) kuruldu');
            const { basketIcon, usedSelector } = findBasketIcon();
            if (basketIcon) {
                console.log(`🛒 [Yuddy CS] Sepet ikonu mevcut: ${usedSelector}`);
            }
            else {
                console.log('⏳ [Yuddy CS] Sepet ikonu henüz mevcut değil, event delegation ile bekliyor');
            }
        };
        /**
         * Find basket icon (for logging/debugging)
         */
        const findBasketIcon = () => {
            for (const selector of BASKET_ICON_SELECTORS) {
                const basketIcon = getCachedElement(selector);
                if (basketIcon) {
                    return { basketIcon, usedSelector: selector };
                }
            }
            return { basketIcon: null, usedSelector: '' };
        };
        /**
         * ✅ IMPROVED: Observe cart container with CART_SELECTORS
         */
        const observeCartContainer = () => {
            if (cartObserver) {
                console.log('👀 [Yuddy CS] MutationObserver zaten aktif');
                return;
            }
            cartObserver = new MutationObserver((mutations) => {
                let cartAdded = false;
                let cartRemoved = false;
                for (const mutation of mutations) {
                    if (cartAdded && cartRemoved)
                        break;
                    if (!cartAdded) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const element = node;
                                if (isCartContainer(element)) {
                                    cartAdded = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!cartRemoved) {
                        for (const node of mutation.removedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const element = node;
                                if (isCartContainer(element)) {
                                    cartRemoved = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (cartAdded) {
                    console.log('🔍 [Yuddy CS] Sepet container\'ı DOM\'a eklendi');
                    setTimeout(() => initializeWidget(), 300);
                }
                if (cartRemoved) {
                    console.log('🔍 [Yuddy CS] Sepet container\'ı DOM\'dan kaldırıldı');
                    if (widgetInstance) {
                        console.log('🧹 [Yuddy CS] Widget temizleniyor (sepet kapandı)');
                        stopObservingWidgetPosition();
                        widgetInstance.destroy();
                        widgetInstance = null;
                    }
                    CART_SELECTORS.forEach(selector => clearCacheEntry(selector));
                }
            });
            cartObserver.observe(document.body, {
                childList: true,
                subtree: true,
            });
            console.log('👀 [Yuddy CS] Sepet container MutationObserver ile izleniyor');
        };
        /**
         * ✅ NEW: Setup SPA page transition listeners
         */
        const setupSpaListeners = () => {
            if (spaListenersAdded) {
                console.log('🔄 [Yuddy CS] SPA listeners zaten ekli');
                return;
            }
            // ✅ Handle popstate (back/forward navigation)
            window.addEventListener('popstate', () => {
                console.log('🔄 [Yuddy CS] SPA popstate event - cache temizleniyor');
                clearAllCache();
            });
            // ✅ Proxy history.pushState
            const originalPushState = history.pushState;
            history.pushState = function (...args) {
                originalPushState.apply(this, args);
                console.log('🔄 [Yuddy CS] SPA pushState event - cache temizleniyor');
                clearAllCache();
                window.dispatchEvent(new Event('pushstate'));
            };
            // ✅ Proxy history.replaceState
            const originalReplaceState = history.replaceState;
            history.replaceState = function (...args) {
                originalReplaceState.apply(this, args);
                console.log('🔄 [Yuddy CS] SPA replaceState event - cache temizleniyor');
                clearAllCache();
                window.dispatchEvent(new Event('replacestate'));
            };
            spaListenersAdded = true;
            console.log('✅ [Yuddy CS] SPA listeners kuruldu (popstate, pushState, replaceState)');
        };
        // DOMContentLoaded
        document.addEventListener('DOMContentLoaded', () => {
            const autoInit = window.YUDDY_CS_AUTO_INIT !== false;
            if (!autoInit) {
                return;
            }
            console.log('🚀 [Yuddy CS] Widget hazır, sepet açıldığında eklenecek');
            initializeWidget();
            observeCartContainer();
            setupBasketListener();
            // ✅ NEW: Setup SPA listeners for page transitions
            setupSpaListeners();
        });
    }

    exports.APIError = APIError;
    exports.CartSuggestion = CartSuggestion;
    exports.WidgetError = WidgetError;
    exports.default = CartSuggestion;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});

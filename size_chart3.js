/*!
 * Size Chart Widget v1.0.0
 * Build Date: 03.05.2026 21:29:03
 * (c) 2026 Yuddy
 */
var SizeChart = (function (exports) {
    'use strict';

    globalThis.__BUILD_ENV__ = '';

    const emptyDesign = () => ({
        title: '',
        titleColor: '',
        buttonColor: '',
        tableBackgroundColor: '',
        tableTextColor: '',
        tableHeaderColor: '',
        enableSizeChartTab: true,
        enableMeasurementFinderTab: true,
        sizeChartTabTitle: '',
        measurementFinderTabTitle: '',
        measurementFinderButtonText: '',
    });
    function normalizeSizeItem(raw) {
        if (!raw || typeof raw !== 'object')
            return null;
        const r = raw;
        const id = r.id != null ? String(r.id) : '';
        const name = r.name != null ? String(r.name) : '';
        const value = typeof r.value === 'number' ? r.value : Number(r.value) || 0;
        const order = typeof r.order === 'number' ? r.order : Number(r.order) || 0;
        return { id, name, value, order };
    }
    function normalizeSizeGroup(raw) {
        if (!raw || typeof raw !== 'object')
            return null;
        const r = raw;
        const id = r.id != null ? String(r.id) : '';
        const name = r.name != null ? String(r.name) : '';
        const order = typeof r.order === 'number' ? r.order : Number(r.order) || 0;
        const sizesRaw = Array.isArray(r.sizes) ? r.sizes : [];
        const sizes = sizesRaw.map(normalizeSizeItem).filter((x) => x !== null);
        return { id, name, order, sizes };
    }
    /** API payload — eksik alanlara şema ile uyumlu varsayılanlar */
    function normalizeApplicableProduct(raw) {
        if (!raw || typeof raw !== 'object')
            return null;
        const r = raw;
        return {
            id: r.id != null ? String(r.id) : '',
            name: r.name != null ? String(r.name) : '',
            sku: r.sku != null ? String(r.sku) : '',
            slug: r.slug != null ? String(r.slug) : '',
            imageUrl: r.imageUrl != null ? String(r.imageUrl) : '',
            price: typeof r.price === 'number' ? r.price : Number(r.price) || 0,
            currency: r.currency != null ? String(r.currency) : '',
            currencyCode: r.currencyCode != null ? String(r.currencyCode) : '',
            currencySymbol: r.currencySymbol != null ? String(r.currencySymbol) : '',
            status: typeof r.status === 'boolean' ? r.status : true,
        };
    }
    function normalizeSizeDesign(raw) {
        if (!raw || typeof raw !== 'object')
            return emptyDesign();
        const r = raw;
        const base = emptyDesign();
        return {
            title: r.title != null ? String(r.title) : base.title,
            titleColor: r.titleColor != null ? String(r.titleColor) : base.titleColor,
            buttonColor: r.buttonColor != null ? String(r.buttonColor) : base.buttonColor,
            tableBackgroundColor: r.tableBackgroundColor != null ? String(r.tableBackgroundColor) : base.tableBackgroundColor,
            tableTextColor: r.tableTextColor != null ? String(r.tableTextColor) : base.tableTextColor,
            tableHeaderColor: r.tableHeaderColor != null ? String(r.tableHeaderColor) : base.tableHeaderColor,
            enableSizeChartTab: typeof r.enableSizeChartTab === 'boolean' ? r.enableSizeChartTab : base.enableSizeChartTab,
            enableMeasurementFinderTab: typeof r.enableMeasurementFinderTab === 'boolean'
                ? r.enableMeasurementFinderTab
                : base.enableMeasurementFinderTab,
            sizeChartTabTitle: r.sizeChartTabTitle != null ? String(r.sizeChartTabTitle) : base.sizeChartTabTitle,
            measurementFinderTabTitle: r.measurementFinderTabTitle != null
                ? String(r.measurementFinderTabTitle)
                : base.measurementFinderTabTitle,
            measurementFinderButtonText: r.measurementFinderButtonText != null
                ? String(r.measurementFinderButtonText)
                : base.measurementFinderButtonText,
        };
    }
    function normalizeSizeTable(raw) {
        if (!raw || typeof raw !== 'object')
            return null;
        const r = raw;
        const sizesRaw = Array.isArray(r.sizes) ? r.sizes : [];
        const groupsRaw = Array.isArray(r.sizeGroups) ? r.sizeGroups : [];
        const productsRaw = Array.isArray(r.applicableProducts) ? r.applicableProducts : [];
        const sizes = sizesRaw.map(normalizeSizeItem).filter((x) => x !== null);
        const sizeGroups = groupsRaw.map(normalizeSizeGroup).filter((x) => x !== null);
        const applicableProducts = productsRaw
            .map(normalizeApplicableProduct)
            .filter((x) => x !== null);
        return {
            id: r.id != null ? String(r.id) : '',
            name: r.name != null ? String(r.name) : '',
            description: r.description != null ? String(r.description) : '',
            sizes,
            sizeGroups,
            applicableProducts,
        };
    }
    function normalizeSizeSuggestion(raw) {
        if (!raw || typeof raw !== 'object')
            return null;
        const r = raw;
        const productsRaw = Array.isArray(r.applicableProducts) ? r.applicableProducts : [];
        const applicableProducts = productsRaw
            .map(normalizeApplicableProduct)
            .filter((x) => x !== null);
        return {
            id: r.id != null ? String(r.id) : '',
            description: r.description != null ? String(r.description) : '',
            imageUrl: r.imageUrl != null ? String(r.imageUrl) : '',
            applicableProducts,
        };
    }
    /**
     * Ham API gövdesini (wrapped veya düz) şemaya uygun `SizeChartData` yapar.
     */
    function normalizeSizeChartData(raw) {
        if (!raw || typeof raw !== 'object')
            return null;
        const r = raw;
        const tablesRaw = Array.isArray(r.sizeTables) ? r.sizeTables : [];
        const suggestionsRaw = Array.isArray(r.sizeSuggestions) ? r.sizeSuggestions : [];
        const sizeTables = tablesRaw.map(normalizeSizeTable).filter((x) => x !== null);
        const sizeSuggestions = suggestionsRaw
            .map(normalizeSizeSuggestion)
            .filter((x) => x !== null);
        return {
            isActive: typeof r.isActive === 'boolean' ? r.isActive : true,
            sizeDesign: normalizeSizeDesign(r.sizeDesign),
            sizeTables,
            sizeSuggestions,
        };
    }
    /** `{ success, data, message }` veya doğrudan beden tablosu gövdesi */
    function normalizeSizeChartApiResult(parsed) {
        if (!parsed || typeof parsed !== 'object')
            return null;
        const p = parsed;
        if (p.success === true && p.data !== undefined && p.data !== null) {
            return normalizeSizeChartData(p.data);
        }
        if (p.sizeDesign !== undefined || Array.isArray(p.sizeTables)) {
            return normalizeSizeChartData(parsed);
        }
        return null;
    }

    // Storage keys
    const WIDGET_STORAGE_KEYS = {
        USER_MEASUREMENTS: 'yuddy_size_chart_measurements',
        CALCULATED_MEASUREMENTS: 'yuddy_size_chart_calculated',
        LAST_PRODUCT_ID: 'yuddy_size_chart_product',
        WIDGET_CACHE: 'yuddy_size_chart_cache',
        SIZE_CHART_DATA: 'yuddy_size_chart_data_cache',
    };
    // Cookie names
    const WIDGET_COOKIE_NAMES = {
        WIDGET_SHOWN: 'yuddy_size_chart_shown'};

    // Cache version - Bu değiştirildiğinde tüm cache'ler temizlenir
    const CACHE_VERSION = '1.0.0';
    // Default measurements calculation factors
    const MEASUREMENT_FACTORS = {
        MALE: {
            baseChest: 92,
            baseWaist: 80,
            baseHip: 92,
            heightFactor: 0.3,
            weightFactor: 0.4,
        },
        FEMALE: {
            baseChest: 88,
            baseWaist: 72,
            baseHip: 92,
            heightFactor: 0.3,
            weightFactor: 0.4,
        },
    };
    // Body type modifiers
    const BODY_TYPE_MODIFIERS = {
        thin: { chest: -3, waist: -4, hip: -3 },
        normal: { chest: 0, waist: 0, hip: 0 },
        belly: { chest: 2, waist: 5, hip: 2 },
        large: { chest: 4, waist: 6, hip: 4 },
    };

    class StorageManager {
        constructor() {
            this.localStorageAvailable = this.isLocalStorageAvailable();
            if (!this.localStorageAvailable) {
                console.warn('[Size Chart] localStorage is not available.');
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
                const data = localStorage.getItem(WIDGET_STORAGE_KEYS.WIDGET_CACHE);
                if (!data)
                    return null;
                const parsed = JSON.parse(data);
                // Check cache version
                if (parsed.version !== CACHE_VERSION) {
                    this.clearData();
                    return null;
                }
                return parsed.data;
            }
            catch (error) {
                console.warn('[Size Chart] Failed to parse localStorage data:', error);
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
                localStorage.setItem(WIDGET_STORAGE_KEYS.WIDGET_CACHE, JSON.stringify({
                    version: CACHE_VERSION,
                    data,
                }));
            }
            catch (error) {
                console.warn('[Size Chart] Failed to save to localStorage:', error);
            }
        }
        /**
         * Save user measurements
         */
        saveUserMeasurements(measurements) {
            const data = this.getData() || {};
            this.setData({
                ...data,
                userMeasurements: measurements,
            });
        }
        /**
         * Get user measurements
         */
        getUserMeasurements() {
            const data = this.getData();
            return data?.userMeasurements;
        }
        /**
         * Save calculated measurements
         */
        saveCalculatedMeasurements(measurements) {
            const data = this.getData() || {};
            this.setData({
                ...data,
                calculatedMeasurements: measurements,
            });
        }
        /**
         * Get calculated measurements
         */
        getCalculatedMeasurements() {
            const data = this.getData();
            return data?.calculatedMeasurements;
        }
        /**
         * Save widget cache
         */
        saveWidgetCache(cache) {
            const data = this.getData() || {};
            this.setData({
                ...data,
                widgetCache: cache,
            });
        }
        /**
         * Get widget cache
         */
        getWidgetCache(productId) {
            const data = this.getData();
            const cache = data?.widgetCache;
            if (!cache || cache.productId !== productId) {
                return null;
            }
            // Check if cache is expired
            const now = Date.now();
            if (now - cache.timestamp > cache.ttl) {
                return null;
            }
            return cache;
        }
        /**
         * Cache size chart data
         */
        cacheSizeChartData(sizeChartData, hostname, ttlMinutes = 60) {
            if (!this.localStorageAvailable)
                return;
            try {
                const cacheData = {
                    version: CACHE_VERSION,
                    sizeChartData,
                    timestamp: Date.now(),
                    hostname,
                    ttl: ttlMinutes * 60 * 1000,
                };
                localStorage.setItem(WIDGET_STORAGE_KEYS.SIZE_CHART_DATA, JSON.stringify(cacheData));
            }
            catch (error) {
                console.warn('[Size Chart] Failed to cache size chart data:', error);
            }
        }
        /**
         * Get cached size chart data
         */
        getCachedSizeChartData(hostname) {
            if (!this.localStorageAvailable)
                return null;
            try {
                const cached = localStorage.getItem(WIDGET_STORAGE_KEYS.SIZE_CHART_DATA);
                if (!cached)
                    return null;
                const cacheData = JSON.parse(cached);
                // Cache version kontrolü
                if (cacheData.version !== CACHE_VERSION) {
                    this.clearSizeChartCache();
                    return null;
                }
                // Hostname kontrolü
                if (cacheData.hostname !== hostname) {
                    this.clearSizeChartCache();
                    return null;
                }
                // TTL kontrolü
                const now = Date.now();
                const age = now - cacheData.timestamp;
                if (age > cacheData.ttl) {
                    this.clearSizeChartCache();
                    return null;
                }
                return cacheData.sizeChartData;
            }
            catch (error) {
                console.warn('[Size Chart] Failed to get cached size chart data:', error);
                return null;
            }
        }
        /**
         * Clear size chart cache
         */
        clearSizeChartCache() {
            if (!this.localStorageAvailable)
                return;
            try {
                localStorage.removeItem(WIDGET_STORAGE_KEYS.SIZE_CHART_DATA);
            }
            catch (error) {
                console.warn('[Size Chart] Failed to clear size chart cache:', error);
            }
        }
        /**
         * Clear all data
         */
        clearData() {
            if (!this.localStorageAvailable)
                return;
            try {
                Object.values(WIDGET_STORAGE_KEYS).forEach((key) => {
                    localStorage.removeItem(key);
                });
            }
            catch (error) {
                console.warn('[Size Chart] Failed to clear localStorage:', error);
            }
        }
    }

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
                /^192\.168\.\d+\.\d+$/,
                /^10\.\d+\.\d+\.\d+$/,
                /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/,
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
            if (typeof window !== 'undefined' && window.YUDDY_SIZE_CHART_TEST_HOSTNAME) {
                return window.YUDDY_SIZE_CHART_TEST_HOSTNAME;
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
         * Get size chart data from API (public endpoint with storeName)
         * Returns all size chart data, product matching will be done client-side
         * Uses cache if available and fresh
         */
        async getSizeChartData(hostname, forceRefresh = false) {
            // DEMO: engagement API her zaman yuddy.store — URL/hostname argümanı yok sayılır (geri alırken bu 2 satırı silin, eski gövdeyi geri yazın)
            let cleanHostname = 'yuddy.store';
            // Development/demo ortamı için hostname override — sabit mağaza ile çakışmasın diye kapalı
            // if (this.isLocalEnvironment(cleanHostname)) { const testHostname = this.getTestHostname(); cleanHostname = testHostname; }
            // Cache kontrolü (force refresh değilse)
            if (!forceRefresh) {
                const cachedData = this.storageManager.getCachedSizeChartData(cleanHostname);
                if (cachedData) {
                    return cachedData;
                }
            }
            try {
                // Use public engagement endpoint (no auth required)
                // DEMO: storeName sabit — geri alırken encodeURIComponent(cleanHostname) kullanın
                const url = `${this.baseUrl}/engagements/size-chart?storeName=yuddy.store`;
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
                    console.warn('[Size Chart] API request failed:', response.status, response.statusText);
                    return null;
                }
                const result = await response.json();
                /** Şema: `{ success, data, message }` veya doğrudan gövde; nested ürün/kategori alanları normalize edilir */
                const sizeChartData = normalizeSizeChartApiResult(result);
                if (!sizeChartData) {
                    console.warn('[Size Chart] API returned no data');
                    return null;
                }
                // Cache the data
                this.storageManager.cacheSizeChartData(sizeChartData, cleanHostname, this.cacheTTL);
                return sizeChartData;
            }
            catch (error) {
                console.warn('[Size Chart] API error:', error);
                return null;
            }
        }
    }

    const FORCED_KEY = 'YUDDY_SIZE_CHART_PLATFORM';
    function detectPlatform() {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return 'other';
        }
        const forced = window[FORCED_KEY];
        if (forced === 'ikas' ||
            forced === 'ideasoft' ||
            forced === 'shopify' ||
            forced === 'tsoft' ||
            forced === 'other') {
            return forced;
        }
        let platform = 'other';
        if (window.IdeasoftSettings !== undefined ||
            document.querySelector('script[src*="ideasoft"]') !== null ||
            window.location.hostname.includes('ideasoft')) {
            platform = 'ideasoft';
        }
        else if (window.IKAS !== undefined ||
            document.querySelector('script[src*="ikas"]') !== null ||
            window.location.hostname.includes('ikas')) {
            platform = 'ikas';
        }
        else if (window.Shopify !== undefined ||
            document.querySelector('script[src*="shopify"]') !== null ||
            document.querySelector('meta[name="shopify-checkout-api-token"]') !== null) {
            platform = 'shopify';
        }
        else if (window.location.hostname.includes('tsoft') ||
            window.TSoft !== undefined) {
            platform = 'tsoft';
        }
        return platform;
    }

    /**
     * Otomasyon, tema ve dokümantasyon için sabit kanca.
     * İlk eklenen tetikleyiciye `id` verilir (HTML tek-id kuralı); diğerleri yalnızca class + data attribute kullanır.
     */
    const YUDDY_SIZE_CHART_BUTTON_ID = 'yuddy-size-chart-open-btn';
    const YUDDY_SIZE_CHART_BUTTON_CLASS = 'yuddy-size-chart-button';
    const YUDDY_SIZE_CHART_BUTTON_DATA_ATTR = 'data-yuddy-widget';
    const YUDDY_SIZE_CHART_BUTTON_DATA_VALUE = 'size-chart-open';
    /** Varsayılan sepet / drawer alanları (tüm platformlarla birleştirilir) */
    const DEFAULT_CART_EXCLUSION_SELECTORS = [
        '.cart',
        '.mini-cart',
        '.minicart',
        '.cart-drawer',
        '.drawer',
        '.offcanvas',
        '.panel',
        '#cart',
        '[id*="cart" i]',
        '[class*="cart" i]',
        '[class*="drawer" i]',
        '[class*="modal" i]',
        '.cart-drawer-variant',
        '.cart-drawer-height',
        '.cart__drawer__image',
        '.checkout-btn-main',
        '.yuddy-cs-widget',
        '#yuddy-cart-suggestion',
        '[class*="yuddy-cs"]',
    ];
    const IKAS_DOM = {
        variantRootSelectors: [
            '.product-detail-page-variants',
            '.product-detail-right .variant-type',
            '.choce-variant-type',
        ],
        lastVariantSelectors: [
            '.variant-name',
            '[class*="BoxVariant_boxVariantValue"]',
            '.variant-types:not(.variant-types-out-of-stock)',
            '[class*="variant"][class*="Variant"]',
        ],
        suggestionAnchorSelectors: [
            '.product-detail-page-variants',
            '.variant-types:not(.variant-types-out-of-stock)',
            '.product-detail-page-buy-box',
            '.product-detail-right form',
            '.product-detail-right',
        ],
        variantStructureSelectors: [
            '.product-detail-page-variants',
            '.variant-type',
            '.choce-variant-type',
            '.variant-types',
        ],
        cartExclusionExtra: [
            '.MiniBasket_mini-basket__content__bdBr8',
            '.cart-drawer-height',
            '.Header_header__icon-link__T6JFE[title="Sepet"]',
        ],
    };
    /** Henüz DOM haritası yok — yalnızca `dom-manager` içi genel fallback kullanılır */
    const EMPTY_PLATFORM_DOM = {
        variantRootSelectors: [],
        lastVariantSelectors: [],
        suggestionAnchorSelectors: [],
        variantStructureSelectors: [],
        cartExclusionExtra: [],
    };
    const IDEASOFT_DOM = {
        variantRootSelectors: [
            '.variant-list-group',
            '#divUrunEkSecenek',
            '.product-options',
            '.product-detail-options',
            '.js-product-variants',
            '[class*="varyant" i]',
        ],
        /** `.variant-list-group` kapsayıcısında: `.variant-list` içindeki son düğümden hemen sonra buton */
        lastVariantSelectors: [
            '.variant-list > :last-child',
            '.variant-item:last-child',
            '.option-item:last-child',
            'select[name*="varyant" i] option:last-child',
            '.product-option a:last-of-type',
        ],
        suggestionAnchorSelectors: [
            '.variant-list-group',
            '#divUrunEkSecenek',
            '.product-detail-form',
            '.product-cart-form',
            'form[action*="sepet" i]',
        ],
        variantStructureSelectors: [
            '.variant-list-group',
            '#divUrunEkSecenek',
            '.product-options',
            '.variant-list',
        ],
        cartExclusionExtra: ['#divCartContainer', '.header-cart', '.js-cart-container'],
    };
    const PLATFORM_DOM = {
        ikas: IKAS_DOM,
        ideasoft: IDEASOFT_DOM,
        shopify: EMPTY_PLATFORM_DOM,
        tsoft: EMPTY_PLATFORM_DOM,
        other: EMPTY_PLATFORM_DOM,
    };
    function getPlatformDomConfig(platform) {
        return PLATFORM_DOM[platform] ?? EMPTY_PLATFORM_DOM;
    }
    function getMergedCartExclusionSelectors(platform) {
        const extra = getPlatformDomConfig(platform).cartExclusionExtra;
        return [...DEFAULT_CART_EXCLUSION_SELECTORS, ...extra].join(', ');
    }

    /**
     * Sepet, drawer, mini sepet ve Yuddy sepet widget'ı içinde mi?
     * Tüm placement akışında tek doğruluk kaynağı.
     */
    function isInsideCartElement(element, platform) {
        if (!element || !element.closest) {
            return false;
        }
        const cartSelectors = getMergedCartExclusionSelectors(platform);
        return element.closest(cartSelectors) !== null;
    }

    function resolveVariantStructureFromAnchor(el, sel) {
        if (el.classList.contains('product-detail-page-variants') && el.parentElement) {
            return el.parentElement;
        }
        if (typeof el.matches === 'function' && (el.matches('.variant-type') || el.matches('.choce-variant-type'))) {
            return el.parentElement;
        }
        const cls = typeof el.className === 'string' ? el.className : '';
        if (cls.includes('variant-types') || sel.includes('variant-types')) {
            let parent = el.parentElement;
            const rootBody = el.ownerDocument.body;
            while (parent && parent !== rootBody) {
                if (parent.querySelector('.variant-type, .choce-variant-type, .product-detail-page-variants')) {
                    return parent;
                }
                const parentClasses = parent.className || '';
                if (typeof parentClasses === 'string' &&
                    (parentClasses.includes('variant') || parentClasses.includes('mb-4'))) {
                    return parent;
                }
                parent = parent.parentElement;
            }
            return el.parentElement;
        }
        if (el.tagName === 'VARIANT-SELECTS' || sel.toLowerCase().includes('variant-select')) {
            return (el.closest('[data-product-form]') ||
                el.closest('form') ||
                el.closest('.product') ||
                el.parentElement);
        }
        return el.parentElement || el;
    }
    function resolveLastVariantAnchorFromSelector(container, selector) {
        let matches = [];
        try {
            matches = Array.from(container.querySelectorAll(selector));
        }
        catch {
            return null;
        }
        if (matches.length === 0) {
            return null;
        }
        const last = matches[matches.length - 1];
        const cn = typeof last.className === 'string' ? last.className : '';
        if (selector.includes('variant-name') || last.classList.contains('variant-name')) {
            return last.parentElement;
        }
        if (selector.includes('BoxVariant') || cn.includes('BoxVariant')) {
            return last;
        }
        if (selector.includes('variant-types') || cn.includes('variant-types')) {
            return last;
        }
        if (last.tagName === 'OPTION' && last.parentElement) {
            return last.parentElement;
        }
        if (last.tagName === 'INPUT') {
            return last.closest('label') || last.parentElement || last;
        }
        if (last.tagName === 'LABEL') {
            return last;
        }
        // Ideasoft: `.variant-list > :last-child` — çapa listenin son çocuğu olmalı (buton bu elemandan sonra)
        if (selector.includes('.variant-list') && selector.includes(':last-child')) {
            return last;
        }
        return last.parentElement || last;
    }
    /**
     * Beden tablosu butonunun eklenebileceği varyant kapsayıcıları (platform kökleri + sezgisel fallback).
     */
    function collectVariantContainers(doc, platform) {
        const containers = [];
        const seen = new Set();
        const push = (el) => {
            if (!el || seen.has(el) || isInsideCartElement(el, platform)) {
                return;
            }
            seen.add(el);
            containers.push(el);
        };
        const cfg = getPlatformDomConfig(platform);
        for (const sel of cfg.variantRootSelectors) {
            try {
                doc.querySelectorAll(sel).forEach((el) => push(el));
            }
            catch {
                /* invalid selector */
            }
        }
        const bedenTextElements = Array.from(doc.querySelectorAll('*')).filter((el) => {
            const text = el.textContent?.toLowerCase() || '';
            return (text.includes('beden') &&
                (el.querySelector('.variant-name') || el.querySelector('[class*="variant"]')));
        });
        const boxVariantElements = Array.from(doc.querySelectorAll('[class*="BoxVariant_boxVariantValue"]'));
        const variantNameSpans = Array.from(doc.querySelectorAll('.variant-name'));
        variantNameSpans.forEach((span) => {
            let parent = span.parentElement;
            while (parent && parent !== doc.body) {
                const parentText = parent.textContent?.toLowerCase() || '';
                if (parentText.includes('beden')) {
                    push(parent);
                    break;
                }
                parent = parent.parentElement;
            }
        });
        boxVariantElements.forEach((button) => {
            let parent = button.parentElement;
            while (parent && parent !== doc.body) {
                const parentText = parent.textContent?.toLowerCase() || '';
                if (parentText.includes('beden') || parent.querySelector('[class*="variantTitle"]')) {
                    push(parent);
                    break;
                }
                parent = parent.parentElement;
            }
        });
        bedenTextElements.forEach((el) => push(el));
        return containers;
    }
    /**
     * Ürün varyant yapısı için üst kapsayıcı (öneri şeridi / fallback yerleşim).
     */
    function findVariantStructureRoot(doc, platform) {
        const cfg = getPlatformDomConfig(platform);
        for (const sel of cfg.variantStructureSelectors) {
            try {
                const el = doc.querySelector(sel);
                if (!el || isInsideCartElement(el, platform)) {
                    continue;
                }
                return resolveVariantStructureFromAnchor(el, sel);
            }
            catch {
                continue;
            }
        }
        const productDetailVariants = doc.querySelector('.product-detail-page-variants');
        if (productDetailVariants) {
            return productDetailVariants.parentElement;
        }
        const variantType = doc.querySelector('.variant-type, .choce-variant-type');
        if (variantType) {
            return variantType.parentElement;
        }
        const variantTypes = doc.querySelector('.variant-types');
        if (variantTypes) {
            let parent = variantTypes.parentElement;
            while (parent && parent !== doc.body) {
                if (parent.querySelector('.variant-type, .choce-variant-type, .product-detail-page-variants')) {
                    return parent;
                }
                const parentClasses = parent.className || '';
                if (parentClasses.includes('variant') || parentClasses.includes('mb-4')) {
                    return parent;
                }
                parent = parent.parentElement;
            }
            return variantTypes.parentElement;
        }
        const variantNames = Array.from(doc.querySelectorAll('.variant-name'));
        if (variantNames.length > 0) {
            let commonParent = variantNames[0].parentElement;
            while (commonParent && commonParent !== doc.body) {
                if (commonParent.querySelector('.variant-type, .choce-variant-type, .product-detail-page-variants')) {
                    return commonParent.parentElement || commonParent;
                }
                const allInParent = variantNames.every((vn) => commonParent?.contains(vn));
                if (allInParent) {
                    const parentClasses = commonParent.className || '';
                    if (parentClasses.includes('variant') || parentClasses.includes('mb-4')) {
                        return commonParent;
                    }
                }
                commonParent = commonParent.parentElement;
            }
        }
        return null;
    }
    /**
     * Kapsayıcı içinde "son beden kontrolü" düğümü (buton insertBefore/after için çapa).
     */
    function findLastVariantControlInContainer(container, platform) {
        const cfg = getPlatformDomConfig(platform);
        for (const sel of cfg.lastVariantSelectors) {
            const anchor = resolveLastVariantAnchorFromSelector(container, sel);
            if (anchor) {
                return anchor;
            }
        }
        const variantNameSpans = Array.from(container.querySelectorAll('.variant-name'));
        if (variantNameSpans.length > 0) {
            return variantNameSpans[variantNameSpans.length - 1].parentElement;
        }
        const boxVariantButtons = Array.from(container.querySelectorAll('[class*="BoxVariant_boxVariantValue"]'));
        if (boxVariantButtons.length > 0) {
            return boxVariantButtons[boxVariantButtons.length - 1];
        }
        const variantTypes = Array.from(container.querySelectorAll('.variant-types'));
        if (variantTypes.length > 0) {
            return variantTypes[variantTypes.length - 1];
        }
        const variantElements = Array.from(container.querySelectorAll('[class*="variant"], [class*="Variant"]')).filter((el) => {
            const text = el.textContent?.trim() || '';
            return /^[SMLXL\d]+$/.test(text);
        });
        if (variantElements.length > 0) {
            return variantElements[variantElements.length - 1];
        }
        return null;
    }

    function tryResolveSuggestionInsertion(doc, variantEl, platform, ctx) {
        if (isInsideCartElement(variantEl, platform)) {
            return false;
        }
        if (variantEl.classList.contains('product-detail-page-variants')) {
            ctx.parentElement = variantEl.parentElement;
            ctx.insertionPoint = variantEl;
            ctx.insertMethod = 'after';
            return !!(ctx.parentElement && ctx.insertionPoint);
        }
        if (variantEl.classList.contains('variant-types')) {
            let parent = variantEl.parentElement;
            while (parent && parent !== doc.body) {
                const pc = parent.className;
                if (typeof pc === 'string' && pc.includes('variant')) {
                    ctx.parentElement = parent.parentElement;
                    ctx.insertionPoint = parent;
                    ctx.insertMethod = 'after';
                    return !!(ctx.parentElement && ctx.insertionPoint);
                }
                parent = parent.parentElement;
            }
            return false;
        }
        ctx.parentElement = variantEl.parentElement;
        ctx.insertionPoint = variantEl;
        ctx.insertMethod = 'after';
        return !!(ctx.parentElement && ctx.insertionPoint);
    }
    /**
     * Beden önerisi şeridinin nereye ekleneceğini hesaplar (DOM mutasyonu yapmaz).
     */
    function resolveSuggestionInsertionPlan(doc, platform, buttonContainer) {
        const ctx = {
            parentElement: null,
            insertionPoint: null,
            insertMethod: 'after',
        };
        for (const sel of getPlatformDomConfig(platform).suggestionAnchorSelectors) {
            try {
                const variantEl = doc.querySelector(sel);
                if (variantEl && tryResolveSuggestionInsertion(doc, variantEl, platform, ctx)) {
                    break;
                }
            }
            catch {
                continue;
            }
        }
        if (!ctx.parentElement) {
            const variantContainerExact = doc.querySelector('.product-detail-page-variants, .variant-types:not(.variant-types-out-of-stock)');
            if (variantContainerExact) {
                tryResolveSuggestionInsertion(doc, variantContainerExact, platform, ctx);
            }
        }
        if (!ctx.parentElement && buttonContainer && !isInsideCartElement(buttonContainer, platform)) {
            ctx.parentElement = buttonContainer.parentElement;
            ctx.insertionPoint = buttonContainer;
            ctx.insertMethod = 'after';
        }
        if (!ctx.parentElement) {
            const variantContainers = collectVariantContainers(doc, platform);
            if (variantContainers.length > 0 && !isInsideCartElement(variantContainers[0], platform)) {
                ctx.parentElement = variantContainers[0].parentElement;
                ctx.insertionPoint = variantContainers[0];
                ctx.insertMethod = 'after';
            }
            else {
                const variantStructure = findVariantStructureRoot(doc, platform);
                if (variantStructure && !isInsideCartElement(variantStructure, platform)) {
                    ctx.parentElement = variantStructure.parentElement;
                    ctx.insertionPoint = variantStructure;
                    ctx.insertMethod = 'after';
                }
                else {
                    const saferFallbackSelectors = [
                        '.product-detail-page-buy-box',
                        '.product-detail-right form',
                        'form[action*="cart" i]',
                        '.product-actions',
                        '.product-detail-right',
                        '.product-info',
                        '[class*="AddToCart" i]',
                        '[class*="buy-button" i]',
                    ];
                    for (const selector of saferFallbackSelectors) {
                        const el = doc.querySelector(selector);
                        if (el && !isInsideCartElement(el, platform)) {
                            ctx.parentElement = el.parentElement || el;
                            ctx.insertionPoint = el;
                            ctx.insertMethod = 'before';
                            break;
                        }
                    }
                    if (!ctx.parentElement) {
                        const genericContainers = doc.querySelectorAll('[class*="product-detail" i], [class*="ProductDetail" i], [id*="product" i]');
                        for (const el of Array.from(genericContainers)) {
                            if (isInsideCartElement(el, platform))
                                continue;
                            const className = (el.className || '').toLowerCase();
                            const idName = (el.id || '').toLowerCase();
                            if (!className.includes('comment') &&
                                !className.includes('review') &&
                                !className.includes('related') &&
                                !className.includes('gallery') &&
                                !className.includes('image') &&
                                !className.includes('slider') &&
                                !className.includes('thumb') &&
                                !className.includes('tab') &&
                                !idName.includes('comment') &&
                                !idName.includes('review') &&
                                !idName.includes('gallery')) {
                                ctx.parentElement = el;
                                ctx.insertionPoint = null;
                                ctx.insertMethod = 'append';
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (!ctx.parentElement || isInsideCartElement(ctx.parentElement, platform)) {
            return null;
        }
        return {
            parentElement: ctx.parentElement,
            insertionPoint: ctx.insertionPoint,
            insertMethod: ctx.insertMethod,
        };
    }

    // Measurement calculation utilities
    // Based on calculate-size module logic
    const FIT_OPTIONS = [
        { value: 'tight', label: 'Dar Kesim', measurementAdjustment: -0.04 }, // %4 daha dar ölçüler
        { value: 'regular', label: 'Normal Kesim', measurementAdjustment: 0 }, // Normal ölçüler
        { value: 'loose', label: 'Bol Kesim', measurementAdjustment: 0.06 }, // %6 daha bol ölçüler
    ];
    /**
     * Anthropometric ratios — kalibre edilmiş formül
     * Erkek: tek base + beden tipi çarpanları; bel intercept 0 (178/79 dikdörtgen → bel ~92).
     * Kadın: tek base + beden tipi çarpanları + lightKg/tallMid.
     *
     * Yaklaşık referans (mevcut intercept’lerle):
     * - Erkek 180/80 Dikdörtgen → göğüs ~101, bel ~93, kalça ~99
     * - Erkek 178/79 Dikdörtgen → bel ~92
     * - Erkek 180/80 Ters Üçgen → göğüs ~110, bel ~95, kalça ~96
     * - Erkek 175/88 Yuvarlak → göğüs ~105, bel ~108, kalça ~103
     * - Kadın 160/50 Dikdörtgen → göğüs ~87, bel ~72, kalça ~92
     */
    const MEASUREMENT_RATIOS = {
        male: {
            // Kadın ile aynı yapı: tek base formül + beden tipi çarpımsal ayarları (body_type_adjustments).
            // Formül: base = (height_coef * height) + (weight_coef * weight) + intercept
            // Base intercept’ler: 178/79 dikdörtgen bel ~92; göğüs/kalça hafif düşük tutuldu
            chest: { height_coef: 0.10, weight_coef: 0.4375, intercept: 48 },
            waist: { height_coef: 0.10, weight_coef: 0.9375, intercept: 0 },
            hip: { height_coef: 0.10, weight_coef: 0.4375, intercept: 46 },
            // Length measurements (boy bazlı) - Gerçekçi oranlar
            neck_to_height: 0.19, // Boyun çevresi / Boy (175cm → ~33cm)
            shoulder_to_chest: 0.32, // Omuz genişliği / Göğüs çevresi (97cm → ~31cm genişlik)
            arm_length_to_height: 0.44, // Kol boyu / Boy (175cm → ~77cm)
            forearm_to_height: 0.25, // Önkol / Boy (175cm → ~44cm)
            inseam_to_height: 0.457, // İç bacak / Boy (175cm → ~80cm)
            outseam_to_height: 0.55, // Dış bacak / Boy (175cm → ~100cm; 0.60 fazla çıkıyordu)
            back_length_to_height: 0.30, // Sırt boyu / Boy (175cm → ~53cm)
            torso_to_height: 0.32, // Gövde boyu (anatomik: omuz–kalça) (175cm → ~56cm)
            product_length_to_height: 0.41, // Ürün boyu (gömlek/tişört: omuz–paça ucu) (175cm → 70cm, 190cm → 76cm)
            foot_to_height: 0.15, // Ayak boyu / Boy (175cm → ~26cm)
            // Circumference ratios (relative to chest) - Gerçekçi oranlar
            bicep_to_chest: 0.36, // Pazı / Göğüs (97cm → ~35cm)
            thigh_to_chest: 0.58, // Uyluk / Göğüs (97cm → ~56cm)
            calf_to_chest: 0.37, // Baldır / Göğüs (97cm → ~36cm)
            wrist_to_chest: 0.17, // Bilek / Göğüs (97cm → ~16.5cm)
            ankle_to_chest: 0.22, // Ayak bileği / Göğüs (97cm → ~21cm)
            head_to_chest: 0.58, // Baş çevresi / Göğüs (97cm → ~56cm)
            // Body type adjustments - Erkek beden tipleri (referans noktalarına göre kalibre)
            body_type_adjustments: {
                'rectangle': {
                    chest: 0,
                    waist: 0,
                    hip: 0,
                    bicep: 0,
                    thigh: 0,
                    calf: 0
                },
                'inverted-triangle': {
                    chest: 0.06,
                    waist: -0.03, // Bel hafif düşük (V görünümü)
                    hip: -0.06,
                    bicep: 0.08,
                    thigh: -0.06,
                    calf: -0.03
                },
                'triangle': {
                    chest: -0.05,
                    waist: 0.08,
                    hip: 0.07,
                    bicep: -0.08,
                    thigh: 0.06,
                    calf: 0.03
                },
                'round': {
                    chest: -0.01,
                    waist: 0.02,
                    hip: -0.01,
                    bicep: 0.04,
                    thigh: 0.06,
                    calf: 0.04
                }
            }
        },
        female: {
            // Base measurements için katsayılar (boy ve ağırlık kombinasyonu)
            // Formül: base = (height_coef * height) + (weight_coef * weight) + intercept
            // Göğüs ve kalça weight_coef 0.90 — tahminler makul seviyede kalsın (yüksek çıkmayı önler)
            // - 165cm, 57kg → Göğüs ~85cm, Bel ~72cm, Kalça ~90cm (BMI ~21)
            // - 165cm, 67kg → Göğüs ~95cm, Bel ~80cm, Kalça ~100cm (BMI ~24.6)
            // - 165cm, 70kg (Kum Saati) → Göğüs ~99–101, Bel ~83, Kalça ~106–108
            chest: { height_coef: 0.10, weight_coef: 0.90, intercept: 13.5 }, // Göğüs çevresi (cm)
            waist: { height_coef: 0.10, weight_coef: 1.0, intercept: -1.5 }, // Bel çevresi (cm)
            hip: { height_coef: 0.10, weight_coef: 0.90, intercept: 18.5 }, // Kalça çevresi (cm)
            // Length measurements (boy bazlı) - Gerçekçi oranlar
            neck_to_height: 0.18, // Boyun çevresi / Boy (165cm → ~30cm)
            shoulder_to_chest: 0.30, // Omuz genişliği / Göğüs çevresi (90cm → ~27cm genişlik)
            arm_length_to_height: 0.41, // Kol boyu / Boy (165cm → ~68cm)
            forearm_to_height: 0.23, // Önkol / Boy (165cm → ~38cm)
            inseam_to_height: 0.45, // İç bacak / Boy (165cm → ~74cm; 173cm → ~78cm)
            outseam_to_height: 0.56, // Dış bacak / Boy (165cm → ~92cm; pant paça boyu için makul)
            back_length_to_height: 0.28, // Sırt boyu / Boy (165cm → ~46cm)
            torso_to_height: 0.30, // Gövde boyu (anatomik) (165cm → ~50cm)
            product_length_to_height: 0.36, // Ürün boyu (gömlek/bluz) (165cm → ~59cm)
            foot_to_height: 0.14, // Ayak boyu / Boy (165cm → ~23cm)
            // Circumference ratios (relative to chest) - Gerçekçi oranlar
            bicep_to_chest: 0.32, // Pazı / Göğüs (90cm → ~29cm)
            thigh_to_chest: 0.65, // Uyluk / Göğüs (90cm → ~58cm)
            calf_to_chest: 0.40, // Baldır / Göğüs (90cm → ~36cm)
            wrist_to_chest: 0.15, // Bilek / Göğüs (90cm → ~13.5cm)
            ankle_to_chest: 0.20, // Ayak bileği / Göğüs (90cm → ~18cm)
            head_to_chest: 0.56, // Baş çevresi / Göğüs (90cm → ~50cm)             
            // Body type adjustments - Kadın beden tipleri
            body_type_adjustments: {
                'rectangle': {
                    chest: 0,
                    waist: 0,
                    hip: 0,
                    bicep: 0,
                    thigh: 0,
                    calf: 0
                },
                'pear': {
                    chest: -0.06,
                    waist: -0.03,
                    hip: 0.10,
                    bicep: -0.08,
                    thigh: 0.12,
                    calf: 0.06
                },
                'strawberry': {
                    chest: 0.08,
                    waist: -0.03,
                    hip: -0.08,
                    bicep: 0.10,
                    thigh: -0.06,
                    calf: -0.03
                },
                'apple': {
                    chest: 0.04,
                    waist: 0.15,
                    hip: -0.04,
                    bicep: 0.04,
                    thigh: 0.02,
                    calf: 0.02
                },
                'hourglass': {
                    chest: 0.04,
                    waist: -0.08,
                    hip: 0.06,
                    bicep: 0.04,
                    thigh: 0.08,
                    calf: 0.04
                }
            }
        }
    };
    /**
     * Calculate comprehensive body measurements
     */
    function calculateMeasurements(gender, bodyType, height, weight) {
        const ratios = MEASUREMENT_RATIOS[gender];
        // Cinsiyete göre geçerli beden tipini kontrol et
        const validBodyTypes = gender === 'male'
            ? ['rectangle', 'inverted-triangle', 'triangle', 'round']
            : ['rectangle', 'pear', 'strawberry', 'apple', 'hourglass'];
        // Geçersiz beden tipi durumunda varsayılan olarak rectangle kullan
        const finalBodyType = validBodyTypes.includes(bodyType)
            ? bodyType
            : 'rectangle';
        const adjustments = ratios.body_type_adjustments[finalBodyType];
        // BMI hesapla
        const bmi = weight / Math.pow(height / 100, 2);
        const bmiAdjustment = calculateBMIAdjustment(bmi, gender);
        // Her iki cinsiyette tek base formül (kadın yapısı): chest/waist/hip katsayıları
        const chestRatios = ratios.chest;
        const waistRatios = ratios.waist;
        const hipRatios = ratios.hip;
        // Kadın: göğüs/bel/kalça intercept düzeltmesi (hafif kilo, uzun-orta boy)
        const lightKg = gender === 'female' ? Math.min(Math.max(0, 65 - weight), 10) : 0;
        const tallMid = gender === 'female' ? Math.max(0, height - 170) * Math.min(Math.max(0, 68 - weight), 3) * 0.33 : 0;
        // Erkek: hafif/fazla kilo düzeltmesi sadece göğüs (chest) için — pantolon ölçüleri (bel, kalça) değişmesin
        const lightKgMale = gender === 'male' ? Math.min(Math.max(0, 78 - weight), 10) : 0;
        const heavyKgMale = gender === 'male' ? Math.min(Math.max(0, weight - 85), 15) : 0;
        const chestIntercept = chestRatios.intercept +
            (gender === 'female' ? lightKg * 1.098 + tallMid : 0) +
            (gender === 'male' ? -lightKgMale * 0.35 + heavyKgMale * 0.1 : 0);
        const waistIntercept = waistRatios.intercept +
            (gender === 'female' ? lightKg * 0.375 : 0);
        const hipIntercept = hipRatios.intercept +
            (gender === 'female' ? lightKg * 0.439 + tallMid : 0);
        // Base measurements: boy ve ağırlık ile hesapla (erkek ve kadın aynı formül yapısı)
        const baseChest = (chestRatios.height_coef * height) + (chestRatios.weight_coef * weight) + chestIntercept;
        const baseWaist = (waistRatios.height_coef * height) + (waistRatios.weight_coef * weight) + waistIntercept;
        const baseHip = (hipRatios.height_coef * height) + (hipRatios.weight_coef * weight) + hipIntercept;
        // Beden tipi ayarlamaları: Her iki cinsiyette çarpımsal (kadın metoduna uyumlu)
        const chestAdjustment = baseChest * adjustments.chest;
        const waistAdjustment = baseWaist * adjustments.waist;
        const hipAdjustment = baseHip * adjustments.hip;
        // BMI ayarlamalarını uygula (çarpımsal)
        let chest = Math.round((baseChest + chestAdjustment) * (1 + bmiAdjustment.chest));
        let waist = Math.round((baseWaist + waistAdjustment) * (1 + bmiAdjustment.waist));
        let hip = Math.round((baseHip + hipAdjustment) * (1 + bmiAdjustment.hip));
        const chestMin = gender === 'male' ? 80 : 75;
        const chestMax = gender === 'male' ? 142 : 120;
        const waistMin = gender === 'male' ? 70 : 65;
        const waistMax = gender === 'male' ? 132 : 110;
        const hipMin = gender === 'male' ? 80 : 85;
        const hipMax = gender === 'male' ? 140 : 125;
        // 1) Önce min/max ile sınırla — tüm değerler geçerli aralıkta olsun
        chest = Math.max(Math.min(chest, chestMax), chestMin);
        waist = Math.max(Math.min(waist, waistMax), waistMin);
        hip = Math.max(Math.min(hip, hipMax), hipMin);
        // 2) Tutarlılık kuralları — Üçgen (erkek) / Armut (kadın) hariç göğüs ≥ bel+5; kadında kalça ≥ göğüs+3; bel ≤ max(göğüs,kalça)+10
        const allowWaistWiderThanChest = (gender === 'male' && finalBodyType === 'triangle') || (gender === 'female' && finalBodyType === 'pear');
        if (!allowWaistWiderThanChest && chest < waist) {
            chest = Math.max(chest, waist + 5);
            chest = Math.min(chest, chestMax);
        }
        if (gender === 'female' && hip < chest) {
            hip = Math.max(hip, chest + 3);
            hip = Math.min(hip, hipMax);
        }
        if (waist > chest && waist > hip) {
            waist = Math.min(waist, Math.max(chest, hip) + 10);
            waist = Math.max(waist, waistMin);
        }
        // 3) Oran düzeltmelerinden sonra tekrar sınırda kaldığından emin ol
        chest = Math.max(Math.min(chest, chestMax), chestMin);
        waist = Math.max(Math.min(waist, waistMax), waistMin);
        hip = Math.max(Math.min(hip, hipMax), hipMin);
        // Calculate other measurements
        const neck = Math.round(height * ratios.neck_to_height * (1 + bmiAdjustment.neck));
        // Omuz genişliği göğüs çevresine göre hesaplanır (genişlik, çevre değil)
        // shoulder_to_chest oranı direkt çevreye göre ayarlanmış
        const shoulder = Math.round(chest * ratios.shoulder_to_chest * (1 + bmiAdjustment.general));
        const armLength = Math.round(height * ratios.arm_length_to_height);
        const forearmLength = Math.round(height * ratios.forearm_to_height);
        const inseam = Math.round(height * ratios.inseam_to_height);
        const outseam = Math.round(height * ratios.outseam_to_height);
        const backLength = Math.round(height * ratios.back_length_to_height);
        const torsoLength = Math.round(height * ratios.torso_to_height);
        const productLength = Math.round(height * ratios.product_length_to_height);
        const footLength = Math.round(height * ratios.foot_to_height);
        // Circumference measurements based on chest
        let bicep = Math.round(chest * ratios.bicep_to_chest * (1 + adjustments.bicep + bmiAdjustment.limbs));
        let thigh = Math.round(chest * ratios.thigh_to_chest * (1 + adjustments.thigh + bmiAdjustment.limbs));
        let calf = Math.round(chest * ratios.calf_to_chest * (1 + adjustments.calf + bmiAdjustment.limbs));
        let wristCircumference = Math.round(chest * ratios.wrist_to_chest * (1 + bmiAdjustment.extremities));
        let ankleCircumference = Math.round(chest * ratios.ankle_to_chest * (1 + bmiAdjustment.extremities));
        let headCircumference = Math.round(chest * ratios.head_to_chest * (1 + bmiAdjustment.head));
        // Minimum değerler (gerçekçi alt sınırlar)
        bicep = Math.max(bicep, gender === 'male' ? 25 : 22);
        thigh = Math.max(thigh, gender === 'male' ? 45 : 48);
        calf = Math.max(calf, gender === 'male' ? 30 : 32);
        wristCircumference = Math.max(wristCircumference, gender === 'male' ? 15 : 14);
        ankleCircumference = Math.max(ankleCircumference, gender === 'male' ? 20 : 19);
        headCircumference = Math.max(headCircumference, gender === 'male' ? 52 : 50);
        // Calculate rise (bel-kasık arası)
        const rise = Math.round(torsoLength * 0.35); // Rise yaklaşık olarak torso'nun %35'i
        // En = ürün genişliği (göğüs çevresinin yarısı)
        const width = Math.round(chest / 2);
        return {
            // Temel ölçüler
            chest,
            waist,
            hip,
            width,
            // Genişletilmiş ölçüler
            neck,
            shoulder,
            armLength,
            forearmLength,
            wristCircumference,
            bicep,
            thigh,
            calf,
            ankleCircumference,
            inseam,
            outseam,
            rise,
            backLength,
            torsoLength,
            productLength,
            footLength,
            headCircumference
        };
    }
    /**
     * Calculate BMI-based adjustment factors
     * Geliştirilmiş: Lineer geçişler ve cinsiyet farklılıkları
     */
    function calculateBMIAdjustment(bmi, gender) {
        let chest = 0, waist = 0, hip = 0, neck = 0, limbs = 0, extremities = 0, head = 0, general = 0;
        // Cinsiyet bazlı katsayılar
        const genderMultiplier = gender === 'male' ? 1.0 : 0.95;
        // Lineer interpolasyon ile daha hassas ve gerçekçi ayarlamalar
        if (bmi < 18.5) {
            // Underweight - BMI'ye göre lineer azalma (daha hafif)
            const factor = Math.min((18.5 - bmi) / 3.5, 1); // 15-18.5 arası normalleştirme, max 1
            chest = -0.05 * factor * genderMultiplier;
            waist = -0.08 * factor * genderMultiplier;
            hip = -0.04 * factor * genderMultiplier;
            neck = -0.03 * factor;
            limbs = -0.06 * factor * genderMultiplier;
            extremities = -0.03 * factor;
            head = -0.01 * factor;
            general = -0.03 * factor;
        }
        else if (bmi >= 18.5 && bmi < 22.5) {
            // Normal weight - minimal ayarlama (BMI 22.5 referans); erkekte referans aralığı için chest/waist/hip nötr
            const factor = (bmi - 22.5) / 2.5; // 18.5-25 arası, 22.5 referans
            if (gender === 'female') {
                chest = 0.015 * factor * genderMultiplier;
                waist = 0.02 * factor * genderMultiplier;
                hip = 0.015 * factor * genderMultiplier;
            }
            neck = 0.008 * factor;
            limbs = 0.015 * factor * genderMultiplier;
            extremities = 0.008 * factor;
            head = 0;
            general = 0.008 * factor;
        }
        else if (bmi >= 22.5 && bmi < 25) {
            // Üst-normal: Kadında artış uygula; erkekte referans değerler bu aralıkta tanımlı olduğu için chest/waist/hip nötr
            const factor = (bmi - 22.5) / 2.5;
            if (gender === 'female') {
                chest = 0.018 * factor * genderMultiplier;
                waist = 0.024 * factor * genderMultiplier;
                hip = 0.017 * factor * genderMultiplier;
            }
            // Erkek: chest/waist/hip = 0 (referans noktalarına uyum)
            neck = 0.012 * factor;
            limbs = 0.017 * factor * genderMultiplier;
            extremities = 0.010 * factor;
            head = 0.002 * factor;
            general = 0.010 * factor;
        }
        else if (bmi >= 25 && bmi < 27.5) {
            // Hafif kilolu — göğüs/kalça makul; erkekte daha düşük artış (hedef: göğüs 118–124, bel 116–122, kalça 112–118)
            const factor = (bmi - 25) / 2.5;
            if (gender === 'male') {
                chest = 0.008 + 0.004 * factor;
                waist = 0.02 + 0.01 * factor;
                hip = 0.004 + 0.002 * factor;
            }
            else {
                chest = (0.020 + 0.005 * factor) * genderMultiplier;
                waist = (0.07 + 0.015 * factor) * genderMultiplier;
                hip = (0.006 + 0.002 * factor) * genderMultiplier;
            }
            neck = 0.034 + 0.006 * factor;
            limbs = (0.031 + 0.012 * factor) * genderMultiplier;
            extremities = 0.015 + 0.004 * factor;
            head = 0.007 + 0.0015 * factor;
            general = 0.018 + 0.006 * factor;
        }
        else if (bmi >= 27.5 && bmi < 30) {
            // Bariz kilolu; erkekte kontrollü artış
            const factor = (bmi - 27.5) / 2.5;
            if (gender === 'male') {
                chest = 0.015 + 0.008 * factor;
                waist = -0.02 + 0.02 * factor; // bel daha düşük kalır
                hip = 0.008 + 0.004 * factor;
            }
            else {
                chest = (0.045 + 0.017 * factor) * genderMultiplier;
                waist = (0.085 + 0.020 * factor) * genderMultiplier;
                hip = (0.043 + 0.014 * factor) * genderMultiplier;
            }
            neck = 0.040 + 0.011 * factor;
            limbs = (0.038 + 0.018 * factor) * genderMultiplier;
            extremities = 0.019 + 0.008 * factor;
            head = 0.0085 + 0.002 * factor;
            general = 0.022 + 0.012 * factor;
        }
        else {
            // Obese; erkekte hedef aralığa uyum
            const factor = Math.min((bmi - 30) / 10, 1);
            if (gender === 'male') {
                chest = 0.06;
                waist = -0.08;
                hip = 0;
            }
            else {
                chest = (0.10 + 0.08 * factor) * genderMultiplier;
                waist = (0.20 + 0.12 * factor) * genderMultiplier;
                hip = (0.12 + 0.08 * factor) * genderMultiplier;
            }
            neck = 0.10 + 0.06 * factor;
            limbs = (0.12 + 0.08 * factor) * genderMultiplier;
            extremities = 0.05 + 0.03 * factor;
            head = 0.02 + 0.015 * factor;
            general = 0.08 + 0.06 * factor;
        }
        return { chest, waist, hip, neck, limbs, extremities, head, general };
    }
    /**
     * Calculate BMI with detailed categorization
     */
    function calculateBMI(height, weight) {
        const bmi = weight / Math.pow(height / 100, 2);
        const roundedBMI = Math.round(bmi * 10) / 10;
        let category;
        let label;
        let color;
        if (bmi < 18.5) {
            category = 'underweight';
            label = 'Zayıf';
            color = '#0f172a';
        }
        else if (bmi < 25) {
            category = 'normal';
            label = 'Normal';
            color = '#0f172a';
        }
        else if (bmi < 30) {
            category = 'overweight';
            label = 'Fazla Kilolu';
            color = '#0f172a';
        }
        else {
            category = 'obese';
            label = 'Obez';
            color = '#0f172a';
        }
        return {
            value: roundedBMI,
            label,
            color,
            category
        };
    }
    /**
     * Apply fit preference to measurements
     * Fit tercihine göre ölçüleri ayarlar (dar/bol kesim için)
     */
    function applyFitPreference(measurements, fitPreference) {
        const fitOption = FIT_OPTIONS.find((f) => f.value === fitPreference);
        const adjustment = fitOption?.measurementAdjustment || 0;
        if (adjustment === 0) {
            return measurements; // Normal kesim için değişiklik yok
        }
        // Sadece çevre ölçülerini ayarla (boy ölçüleri değişmez)
        const newChest = Math.round(measurements.chest * (1 + adjustment));
        return {
            ...measurements,
            // Çevre ölçüleri (fit tercihine göre ayarlanır)
            chest: newChest,
            waist: Math.round(measurements.waist * (1 + adjustment)),
            hip: Math.round(measurements.hip * (1 + adjustment)),
            width: Math.round(newChest / 2), // En = göğüs/2
            neck: Math.round(measurements.neck * (1 + adjustment * 0.5)), // Boyun daha az etkilenir
            bicep: Math.round(measurements.bicep * (1 + adjustment)),
            thigh: Math.round(measurements.thigh * (1 + adjustment)),
            calf: Math.round(measurements.calf * (1 + adjustment)),
            wristCircumference: Math.round(measurements.wristCircumference * (1 + adjustment * 0.3)), // Bilek çok az etkilenir
            ankleCircumference: Math.round(measurements.ankleCircumference * (1 + adjustment * 0.3)), // Ayak bileği çok az etkilenir
            // Omuz genişliği de ayarlanır
            shoulder: Math.round(measurements.shoulder * (1 + adjustment)),
            // Boy ölçüleri değişmez (armLength, inseam, outseam, vb.)
        };
    }
    /**
     * Enhanced size matching with comprehensive measurements
     */
    function findBestSizeFromTable(userMeasurements, sizeTable) {
        const results = [];
        sizeTable.sizes.forEach((size) => {
            const sizeMeasurements = sizeTable.measurements[size];
            if (!sizeMeasurements)
                return;
            let totalScore = 0;
            let measurementCount = 0;
            const measurementScores = {};
            // Karar ağırlıkları: önemsiz ölçüler (bilek, ayak bileği, baş) 0; açığa çıkan puan göğüse verildi
            const weights = {
                chest: 28, // En önemli (25+3: bilek/ayak bileği/baş ağırlıkları eklendi)
                waist: 20, // Çok önemli
                hip: 15, // Önemli
                width: 8, // En / ürün genişliği
                shoulder: 6, // Düşürüldü (tahmin belirsiz)
                inseam: 12, // Boya bağlı — pantolon boyu eşleşmesi
                neck: 5, // Gömlek için önemli
                armLength: 5, // Düşürüldü (tahmin belirsiz)
                bicep: 5, // Orta önemli
                thigh: 5, // Pantolon için orta önemli
                torsoLength: 7, // Gövde boyu (anatomik)
                productLength: 7, // Ürün boyu (gömlek/tişört) — tablo "Boy" ile eşleşir
                backLength: 6, // Sırt boyu
                outseam: 4, // Pantolon paça boyu
                rise: 3, // Pantolon için
                calf: 2, // Az önemli
                forearmLength: 2, // Az önemli
                footLength: 2, // Ayakkabı için
                wristCircumference: 0, // Kararda kullanılmıyor (puan göğüse verildi)
                ankleCircumference: 0, // Kararda kullanılmıyor
                headCircumference: 0 // Kararda kullanılmıyor
            };
            // Calculate scores for each available measurement
            Object.keys(sizeMeasurements).forEach((key) => {
                const measurementKey = key;
                const sizeValue = sizeMeasurements[measurementKey];
                const userValue = userMeasurements[measurementKey];
                const weight = weights[measurementKey] || 1;
                if (sizeValue && userValue && weight > 0) {
                    // Calculate percentage difference (average için alt sınır — küçük ölçülerde skor patlamasını önler)
                    const difference = Math.abs(sizeValue - userValue);
                    const average = Math.max((sizeValue + userValue) / 2, 5);
                    const percentageDifference = (difference / average) * 100;
                    // Convert to score (0-100, where 100 is perfect match)
                    let score = Math.max(0, 100 - percentageDifference * 2);
                    // Apply weight
                    const weightedScore = score * weight;
                    measurementScores[key] = score;
                    totalScore += weightedScore;
                    measurementCount += weight;
                }
            });
            if (measurementCount > 0) {
                const confidence = Math.round(totalScore / measurementCount);
                results.push({
                    size,
                    confidence: Math.min(100, Math.max(0, confidence)),
                    measurements: measurementScores
                });
            }
        });
        // Sort by confidence (highest first)
        results.sort((a, b) => b.confidence - a.confidence);
        return results;
    }
    /**
     * Validate measurement inputs
     */
    function validateInputs(height, weight, gender, bodyType) {
        const errors = [];
        // Validate height
        const heightNum = parseFloat(height);
        if (!height || isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
            errors.push('Boy 100-250 cm aralığında olmalıdır');
        }
        // Validate weight
        const weightNum = parseFloat(weight);
        if (!weight || isNaN(weightNum) || weightNum < 30 || weightNum > 200) {
            errors.push('Kilo 30-200 kg aralığında olmalıdır');
        }
        // Validate gender
        if (!gender) {
            errors.push('Cinsiyetinizi seçiniz');
        }
        // Validate body type
        if (!bodyType) {
            errors.push('Vücut yapınızı seçiniz');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Normalize measurement key - Farklı isimlerle girilen ölçüleri standart key'e çevirir
     *
     * ÖNEMLİ: getMeasurementLabel fonksiyonundaki TÜM Türkçe isimler otomatik olarak desteklenir
     * DB'den gelen herhangi bir ölçü adı (Göğüs, Bel, Kalça, Omuz Genişliği, Kol Boyu, vb.)
     * otomatik olarak standart key'e çevrilir ve eşleştirmede kullanılır.
     *
     * @param key - Kullanıcının girdiği ölçü ismi (herhangi bir format olabilir)
     * @returns Standart measurement key veya null
     */
    function normalizeMeasurementKey(key) {
        if (!key)
            return null;
        const normalizedKey = key.toLowerCase().trim();
        // Standart key'leri kontrol et
        const standardKeys = [
            'chest', 'width', 'waist', 'hip', 'neck', 'shoulder', 'armLength', 'forearmLength',
            'wristCircumference', 'bicep', 'thigh', 'calf', 'ankleCircumference',
            'inseam', 'outseam', 'rise', 'backLength', 'torsoLength', 'productLength', 'footLength', 'headCircumference'
        ];
        // Direkt eşleşme (standart key'ler)
        if (standardKeys.includes(normalizedKey)) {
            return normalizedKey;
        }
        // getMeasurementLabel'dan otomatik ters mapping oluştur
        const labels = {
            chest: 'Göğüs',
            width: 'En',
            waist: 'Bel',
            hip: 'Kalça',
            neck: 'Boyun',
            shoulder: 'Omuz Genişliği',
            armLength: 'Kol Boyu',
            forearmLength: 'Önkol Boyu',
            wristCircumference: 'Bilek Çevresi',
            bicep: 'Pazı',
            thigh: 'Uyluk Çevresi',
            calf: 'Baldır Çevresi',
            ankleCircumference: 'Ayak Bileği',
            inseam: 'İç Bacak Boyu',
            outseam: 'Dış Bacak Boyu',
            rise: 'Bel-Kasık Arası',
            backLength: 'Sırt Boyu',
            torsoLength: 'Gövde Boyu',
            productLength: 'Ürün Boyu',
            footLength: 'Ayak Boyu',
            headCircumference: 'Baş Çevresi'
        };
        // getMeasurementLabel'daki Türkçe isimleri direkt kontrol et
        for (const standardKey of Object.keys(labels)) {
            const turkishLabel = labels[standardKey].toLowerCase();
            if (normalizedKey === turkishLabel) {
                return standardKey;
            }
        }
        // Türkçe isimlerle eşleştirme - getMeasurementLabel'daki tüm değerler + varyasyonlar
        const turkishMap = {
            // Göğüs (chest) - getMeasurementLabel: 'Göğüs'
            'göğüs': 'chest', 'gogus': 'chest', 'göğüs çevresi': 'chest', 'gogus cevresi': 'chest',
            'göğüs genişliği': 'chest', 'gogus genisligi': 'chest',
            // En (width) - getMeasurementLabel: 'En' — ürün genişliği (göğüs/2)
            'en': 'width',
            // Bel (waist) - getMeasurementLabel: 'Bel'
            'bel': 'waist', 'bel çevresi': 'waist', 'bel cevresi': 'waist',
            'bel genişliği': 'waist', 'bel genisligi': 'waist',
            // Kalça (hip) - getMeasurementLabel: 'Kalça'
            'kalça': 'hip', 'kalca': 'hip', 'kalça çevresi': 'hip', 'kalca cevresi': 'hip',
            'kalça genişliği': 'hip', 'kalca genisligi': 'hip',
            // Boyun (neck) - getMeasurementLabel: 'Boyun'
            'boyun': 'neck', 'boyun çevresi': 'neck', 'boyun cevresi': 'neck',
            // Omuz Genişliği (shoulder) - getMeasurementLabel: 'Omuz Genişliği'
            'omuz': 'shoulder', 'omuz genişliği': 'shoulder', 'omuz genisligi': 'shoulder',
            'omuz genişlik': 'shoulder', 'omuz genislik': 'shoulder',
            // Kol Boyu (armLength) - getMeasurementLabel: 'Kol Boyu'
            'kol boyu': 'armLength', 'kol uzunluğu': 'armLength', 'kol uzunlugu': 'armLength',
            'kol': 'armLength',
            // Önkol Boyu (forearmLength) - getMeasurementLabel: 'Önkol Boyu'
            'önkol': 'forearmLength', 'onkol': 'forearmLength', 'önkol boyu': 'forearmLength',
            'onkol boyu': 'forearmLength', 'önkol uzunluğu': 'forearmLength',
            // Bilek Çevresi (wristCircumference) - getMeasurementLabel: 'Bilek Çevresi'
            'bilek': 'wristCircumference', 'bilek çevresi': 'wristCircumference',
            'bilek cevresi': 'wristCircumference',
            // Pazı (bicep) - getMeasurementLabel: 'Pazı'
            'pazı': 'bicep', 'pazi': 'bicep', 'pazı çevresi': 'bicep', 'pazi cevresi': 'bicep',
            // Uyluk Çevresi (thigh) - getMeasurementLabel: 'Uyluk Çevresi'
            'uyluk': 'thigh', 'uyluk çevresi': 'thigh', 'uyluk cevresi': 'thigh',
            // Baldır Çevresi (calf) - getMeasurementLabel: 'Baldır Çevresi'
            'baldır': 'calf', 'baldir': 'calf', 'baldır çevresi': 'calf', 'baldir cevresi': 'calf',
            // Ayak Bileği (ankleCircumference) - getMeasurementLabel: 'Ayak Bileği'
            'ayak bileği': 'ankleCircumference', 'ayak bilegi': 'ankleCircumference',
            'ayak bileği çevresi': 'ankleCircumference', 'ayak bilegi cevresi': 'ankleCircumference',
            // İç Bacak Boyu (inseam) - getMeasurementLabel: 'İç Bacak Boyu'
            'iç bacak': 'inseam', 'ic bacak': 'inseam', 'iç bacak boyu': 'inseam',
            'ic bacak boyu': 'inseam', 'bacak boyu': 'inseam', 'iç bacak uzunluğu': 'inseam',
            // Dış Bacak Boyu (outseam) - getMeasurementLabel: 'Dış Bacak Boyu'
            'dış bacak': 'outseam', 'dis bacak': 'outseam', 'dış bacak boyu': 'outseam',
            'dis bacak boyu': 'outseam', 'dış bacak uzunluğu': 'outseam',
            // Bel-Kasık Arası (rise) - getMeasurementLabel: 'Bel-Kasık Arası'
            'rise': 'rise', 'bel-kasık': 'rise', 'bel-kasik': 'rise',
            'bel kasık arası': 'rise', 'bel kasik arasi': 'rise',
            // Sırt Boyu (backLength) - getMeasurementLabel: 'Sırt Boyu'
            'sırt': 'backLength', 'sirt': 'backLength', 'sırt boyu': 'backLength',
            'sirt boyu': 'backLength', 'sırt uzunluğu': 'backLength',
            // Gövde Boyu (torsoLength) - anatomik
            'gövde': 'torsoLength', 'govde': 'torsoLength', 'gövde boyu': 'torsoLength',
            'govde boyu': 'torsoLength', 'gövde uzunluğu': 'torsoLength',
            // Ürün Boyu (productLength) - gömlek/tişört boyu; tabloda "Boy" ile eşleşir
            'ürün boyu': 'productLength', 'urun boyu': 'productLength', 'ürün uzunluğu': 'productLength',
            'boy': 'productLength', // En-Boy tablolarında "Boy" = ürün boyu
            // Ayak Boyu (footLength) - getMeasurementLabel: 'Ayak Boyu'
            'ayak': 'footLength', 'ayak boyu': 'footLength', 'ayak uzunluğu': 'footLength',
            // Baş Çevresi (headCircumference) - getMeasurementLabel: 'Baş Çevresi'
            'baş': 'headCircumference', 'bas': 'headCircumference', 'baş çevresi': 'headCircumference',
            'bas cevresi': 'headCircumference'
        };
        // Önce getMeasurementLabel'daki tam eşleşmeyi kontrol et
        for (const [standardKey, turkishLabel] of Object.entries(labels)) {
            if (normalizedKey === turkishLabel.toLowerCase()) {
                return standardKey;
            }
        }
        // Türkçe karakterleri normalize et
        const turkishNormalized = normalizedKey
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
        // Türkçe mapping'de ara (hem normalize edilmiş hem de orijinal)
        if (turkishMap[turkishNormalized] || turkishMap[normalizedKey]) {
            return turkishMap[turkishNormalized] || turkishMap[normalizedKey];
        }
        // Parantez içindeki birim bilgisini temizle ve tekrar dene
        const withoutUnit = normalizedKey.replace(/\s*\([^)]*\)\s*/g, '').trim();
        if (withoutUnit !== normalizedKey) {
            // Standart key kontrolü
            if (standardKeys.includes(withoutUnit)) {
                return withoutUnit;
            }
            // getMeasurementLabel kontrolü
            for (const [standardKey, turkishLabel] of Object.entries(labels)) {
                if (withoutUnit === turkishLabel.toLowerCase()) {
                    return standardKey;
                }
            }
            // Türkçe mapping kontrolü
            if (turkishMap[withoutUnit]) {
                return turkishMap[withoutUnit];
            }
        }
        return null;
    }

    var erkekDikdortgenIcon = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" data-name=\"Layer 1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 150 250\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: #404555;\n      }\n\n      .cls-2 {\n        fill: #f6c895;\n      }\n\n      .cls-3 {\n        fill: #e6e6e6;\n        stroke: #666;\n        stroke-dasharray: 2;\n        stroke-miterlimit: 10;\n        stroke-width: .5px;\n      }\n\n      .cls-4 {\n        fill: #fff;\n      }\n\n      .cls-5 {\n        fill: #d9a352;\n      }\n\n      .cls-6 {\n        opacity: .2;\n      }\n\n      .cls-7 {\n        fill: #b17b69;\n      }\n\n      .cls-8 {\n        fill: #e4a58a;\n      }\n    </style>\n  </defs>\n  <rect class=\"cls-3\" x=\"35.34\" y=\"47.34\" width=\"79.31\" height=\"114.18\" rx=\"5.85\" ry=\"5.85\"/>\n  <g>\n    <g>\n      <g>\n        <path class=\"cls-8\" d=\"M60.27,211.51c-.44,3.01-2.28,9.03-2.13,10.5.11,1.09,1.14,3.9.38,5.16-.63,1.06-2.48.41-4.15.55-1.67.14-2.89.61-4.23.68-1.61.08-5.73.66-6.21-.17-.51-.89,1.07-1.31,2.07-1.99.86-.58,2.9-1.26,4.01-1.8,1.12-.55,2.23-1.05,2.5-1.45.78-1.15,1.61-11.64,1.61-11.64l6.14.16Z\"/>\n        <path class=\"cls-7\" d=\"M44.39,228.61s-.09-.03-.12-.07c-.07-.12-.08-.25-.03-.37.15-.41.91-.7,1.88-1.08.25-.1.51-.2.77-.3.07-.03.15,0,.18.07.03.07,0,.15-.07.18-.26.11-.52.21-.78.31-.8.31-1.62.62-1.72.92-.02.05-.01.09.02.14.04.07.01.15-.05.19-.02.01-.04.02-.07.02Z\"/>\n        <path class=\"cls-7\" d=\"M43.97,228.31s-.1-.03-.12-.07c0-.02-.08-.16,0-.39.19-.49,1.02-.99,2.39-1.44.07-.02.15.02.17.09.02.07-.02.15-.09.17-1.71.57-2.12,1.05-2.22,1.29-.04.1-.02.16-.02.16.04.07.01.15-.05.19-.02.01-.04.02-.07.02Z\"/>\n      </g>\n      <g>\n        <path class=\"cls-8\" d=\"M83.32,215.04c.44,3.01.83,5.51.67,6.97-.11,1.09-1.14,3.9-.38,5.16.63,1.06,2.48.41,4.15.55,1.67.14,2.89.61,4.23.68,1.61.08,5.73.66,6.21-.17.51-.89-1.07-1.31-2.07-1.99-.86-.58-2.9-1.26-4.01-1.8-1.12-.55-2.23-1.05-2.5-1.45-.78-1.15-.56-8.01-.56-8.01l-5.74.05Z\"/>\n        <path class=\"cls-7\" d=\"M97.74,228.61s-.05,0-.07-.02c-.07-.04-.09-.12-.05-.19.03-.05.03-.09.02-.14-.11-.29-.93-.61-1.72-.92-.25-.1-.52-.2-.78-.31-.07-.03-.1-.11-.07-.18.03-.07.11-.1.18-.07.26.11.52.21.77.3.97.37,1.73.67,1.88,1.08.04.12.03.25-.03.37-.02.04-.07.07-.12.07Z\"/>\n        <path class=\"cls-7\" d=\"M98.16,228.31s-.04,0-.07-.02c-.06-.04-.09-.12-.06-.18,0,0,.02-.07-.03-.19-.11-.23-.53-.71-2.21-1.26-.07-.02-.11-.1-.09-.17.02-.07.1-.11.17-.09,1.37.45,2.19.95,2.39,1.44.09.23.02.37,0,.39-.02.05-.07.07-.12.07Z\"/>\n      </g>\n      <path class=\"cls-8\" d=\"M98.28,58.45c-1.46-2.92-13.43-4.28-14.98-6.41s-1.63-6.73-1.63-6.73l-10.37.4s.34,4.15-1.44,6.17-12.59,1.92-15.17,6.57c-2.09,3.76-14.39,25.1-14.21,28.75.19,3.66,12.44,24.15,12.44,24.15l4.25-1.96-9.35-20.91,12.52-16.47-1.71-2.96s.03,4.94.68,11.74c.57,5.93.99,11.13.61,17.74-.37,6.39-.79,10.35-1.54,14.26-.68,3.57-.51,6.55-.89,10.2-.13,1.22-.98,5.4-1.3,11.62-.2,3.9-.03,6.52.16,13.07.28,9.71-1.12,15.82-1.12,23.71,0,3.73-.86,10.76-1.14,17.89-.42,10.92.05,22.08.05,22.08l6.14.16s5.09-18.37,5.77-25.09c.68-6.72.64-12.56.72-15,.08-2.44,8.95-38.33,8.95-38.33,0,0,4.15,35.17,4.09,36.89-.06,1.73-.69,6.91-.63,13.96.06,7.05,4.14,31.1,4.14,31.1l5.74-.05s.93-14.59,2.01-29.18c.31-4.26.05-9.45.6-14.89.74-7.38,1.94-14.53,2.51-21.27.56-6.65.27-10.11.17-14.05-.14-5.82-.92-9.93-.93-11.28-.04-3.65-.18-7.88-.82-11.98-.59-3.79-1.15-7.43-1.38-12.67-.3-6.99.53-12.23,1.03-18.42.23-2.93.72-8.25.34-10.26-.53-2.83-1.71-.56-1.71-.57.02.74,11.28,17.24,11.28,17.24l-8.32,19.63,3.55,1.61s13.12-17.44,13.12-21.85-10.48-25.11-12.23-28.6Z\"/>\n      <path class=\"cls-1\" d=\"M92.64,112c-.22-.19-8.87,1.22-16.7,1.25-8.05.03-17.35-1.32-17.58-1.17-.2.13-.54,5.19-1.11,10.13-.71,6.11-1.61,12.38-1.22,12.91.32.43,5.25,1.53,9.02,2.11,4.69.72,9.74.63,10.08.11.34-.51.51-3.13.51-3.13,0,0,0,2.79.4,3.13.4.34,5.08.24,8.49,0,3.48-.25,9.44-.53,9.96-1.26.52-.73.12-7.42-.22-11.67-.55-6.8-1.2-12.04-1.65-12.42Z\"/>\n      <path class=\"cls-5\" d=\"M72.46,122.34s-.04,0-.06-.01c-.08-.03-.12-.13-.08-.21,1.13-2.6.81-4.82.81-4.84-.01-.09.05-.17.13-.18.09-.01.17.05.18.13.01.09.34,2.34-.83,5.02-.03.06-.08.09-.14.09Z\"/>\n      <path class=\"cls-5\" d=\"M77.25,124.6c-.05,0-.11-.03-.14-.08-2.33-4.04-2.09-7.09-2.08-7.22,0-.09.09-.15.17-.14.09,0,.15.08.14.17,0,.03-.24,3.09,2.03,7.03.04.08.02.17-.06.22-.02.01-.05.02-.08.02Z\"/>\n      <path class=\"cls-4\" d=\"M76.36,116.77c5.08-.18,12.48-.82,17.03-1.25-.27-2.04-.54-3.33-.75-3.52-.22-.19-8.87,1.22-16.7,1.25-8.05.03-17.35-1.32-17.58-1.17-.1.06-.23,1.32-.4,3.16,4.14.61,12.68,1.72,18.4,1.51Z\"/>\n      <path class=\"cls-7\" d=\"M70.53,59.1s-.03,0-.05,0l-7.92-2.85c-.07-.03-.11-.1-.08-.17.03-.07.1-.11.17-.08l7.92,2.85c.07.03.11.1.08.17-.02.06-.07.09-.13.09Z\"/>\n      <path class=\"cls-7\" d=\"M82.32,59.32c-.05,0-.1-.03-.13-.08-.03-.07,0-.15.07-.18l7.52-3.13c.07-.03.15,0,.18.07.03.07,0,.15-.07.18l-7.52,3.13s-.04.01-.05.01Z\"/>\n      <path class=\"cls-7\" d=\"M75.18,102.42s-.04,0-.06-.02c-.07-.04-.09-.12-.06-.19l.99-1.82c.04-.07.12-.09.19-.06.07.04.09.12.06.19l-.99,1.82s-.07.07-.12.07Z\"/>\n      <path class=\"cls-7\" d=\"M65.02,175.84s-.03,0-.05-.01c-.07-.03-.1-.11-.08-.18l1.5-3.72c.03-.07.11-.1.18-.08.07.03.1.11.08.18l-1.5,3.72c-.02.05-.07.09-.13.09Z\"/>\n      <path class=\"cls-7\" d=\"M58.26,175.61c-.06,0-.11-.04-.13-.09l-.91-2.73c-.02-.07.01-.15.09-.17.07-.02.15.01.17.09l.91,2.73c.02.07-.01.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n      <path class=\"cls-7\" d=\"M88.25,177.04s-.04,0-.06-.01c-.07-.03-.09-.12-.06-.18l2.52-4.99c.03-.07.12-.09.18-.06.07.03.09.12.06.18l-2.52,4.99s-.07.08-.12.08Z\"/>\n      <path class=\"cls-7\" d=\"M83.19,175.5s-.1-.03-.12-.07l-1.33-2.54c-.04-.07,0-.15.06-.18.07-.04.15,0,.18.06l1.33,2.54c.04.07,0,.15-.06.18-.02.01-.04.02-.06.02Z\"/>\n      <g>\n        <path class=\"cls-8\" d=\"M93.83,107.29s-.62,1.73-1.24,2.08c-.62.35-2.6,1.38-3.07,1.73-.47.35-1.73,1.24-1.92,1.47-.19.23-1.75,2.44-1.51,2.87.25.43.66.45.93.19.27-.27,1.47-2.23,1.71-2.35.25-.12.58-.02.58.39,0,0-1.3,2.29-1.49,2.66-.19.37-.85,1.36-.68,1.71.17.35.64.56.89.27s2.17-3.36,2.35-3.61c.19-.25.31.02.12.27s-.46,1.05-.67,1.62c-.15.4-.69,1.76-.73,2.05s.22.49.69.24.86-1.13,1-1.48c.14-.35.93-2.44,1.32-2.33.39.1-.45,1.92-.6,2.21s-.23.72.12.87c.35.14,1.03-.93,1.2-1.28.17-.35.62-1.51,1.07-1.92.45-.41,2.13-2.79,2.37-3.53.25-.74.56-1.86,1.09-2.52l-3.55-1.61Z\"/>\n        <path class=\"cls-7\" d=\"M87.6,112.71s-.06-.01-.09-.03c-.06-.05-.07-.13-.02-.19.15-.18.79-.65,1.56-1.21.15-.11.29-.21.39-.28.3-.22,1.53-.97,2.28-1.38.07-.04.15-.01.19.06.04.07.01.15-.06.19-.75.4-1.96,1.14-2.25,1.36-.1.07-.24.17-.39.28-.51.37-1.37.99-1.51,1.16-.03.03-.07.05-.11.05Z\"/>\n      </g>\n      <g>\n        <path class=\"cls-8\" d=\"M57.16,109.39c.34.65.78,1.41,1.58,1.18s2.1-1.02,2.84-1.17c.74-.14,1.79-.48,2.19-.34.4.14,2.67,2.47,2.64,2.81-.03.34-.34.82-.91.6-.57-.23-1.93-1.65-2.1-1.68-.17-.03-.74.68-.74.68,0,0,4.12,3.75,4.18,4.09.06.34-.28.88-.77.68-.48-.2-3.78-2.73-3.78-2.73,0,0,3.52,3.52,3.55,3.89.03.37-.34.74-.88.45-.54-.28-3.58-3.13-3.89-3.13s-.45.2-.45.2c0,0,2.8,2.93,2.79,3.17-.02.25-.34.89-1,.63-.66-.27-3.16-3.15-3.51-3.18-.34-.04-2.37.23-3.35-.68-.99-.91-2.63-3.53-2.63-3.53l4.25-1.96Z\"/>\n        <path class=\"cls-7\" d=\"M64.2,113.03s-.07-.01-.09-.04c-.83-.78-1.53-1.42-1.54-1.42-.05-.05-.06-.13-.01-.19.62-.77.81-.74.87-.73.1.02.23.13.72.57.46.42,1.1.99,1.42,1.12.17.07.33.06.45-.01.17-.1.26-.32.27-.47-.04-.3-2.17-2.54-2.55-2.67-.27-.1-.99.15-1.76.41-.22.08-.45.15-.69.23-.84.27-1.8.62-2.26.79-.13.05-.22.08-.24.09-.07.02-.15-.02-.17-.09-.02-.07.02-.15.09-.17.02,0,.1-.04.23-.08.46-.17,1.42-.52,2.27-.79.23-.07.46-.15.68-.23.88-.3,1.58-.53,1.94-.41.38.14,2.77,2.5,2.73,2.95-.02.21-.13.51-.4.68-.14.09-.38.16-.7.03-.36-.15-.99-.71-1.5-1.17-.23-.2-.48-.43-.57-.49-.09.04-.31.27-.53.53.22.2.79.73,1.44,1.33.06.05.06.14,0,.19-.03.03-.06.04-.1.04Z\"/>\n      </g>\n      <path class=\"cls-7\" d=\"M92.7,74.36s-.02,0-.03,0c-.07-.02-.12-.09-.11-.16l.94-4.38c.02-.07.09-.12.16-.11.07.02.12.09.11.16l-.94,4.38c-.01.06-.07.11-.13.11Z\"/>\n      <path class=\"cls-7\" d=\"M58.8,74.28c-.05,0-.11-.03-.13-.09l-1.49-3.9c-.03-.07,0-.15.08-.18.07-.03.15,0,.18.08l1.49,3.9c.03.07,0,.15-.08.18-.02,0-.03,0-.05,0Z\"/>\n      <path class=\"cls-7\" d=\"M47.81,88.62s-.07-.01-.09-.04l-2.34-2.19c-.05-.05-.06-.14,0-.19.05-.06.14-.06.19,0l2.34,2.19c.05.05.06.14,0,.19-.03.03-.06.04-.1.04Z\"/>\n      <path class=\"cls-7\" d=\"M102.15,87.79c-.05,0-.1-.03-.12-.08-.03-.07,0-.15.06-.18l1.77-.84c.07-.03.15,0,.18.06.03.07,0,.15-.06.18l-1.77.84s-.04.01-.06.01Z\"/>\n      <path class=\"cls-7\" d=\"M103.12,88.33s-.04,0-.07-.02l-.97-.53c-.07-.04-.09-.12-.05-.19.04-.07.12-.09.19-.05l.97.53c.07.04.09.12.05.19-.02.05-.07.07-.12.07Z\"/>\n      <path class=\"cls-7\" d=\"M65.78,74.95s-.04,0-.07-.02c-.07-.04-.09-.12-.05-.19l.82-1.51c.04-.07.12-.09.19-.05.07.04.09.12.05.19l-.82,1.51s-.07.07-.12.07Z\"/>\n      <path class=\"cls-7\" d=\"M86.96,74.95s-.04,0-.07-.02c-.07-.04-.09-.12-.05-.19l.82-1.51c.04-.07.12-.09.19-.05.07.04.09.12.05.19l-.82,1.51s-.07.07-.12.07Z\"/>\n      <path class=\"cls-7\" d=\"M66.08,77.64c-2.59,0-4.32-.63-4.35-.64-.07-.03-.11-.11-.08-.18.03-.07.11-.11.18-.08.04.02,4.31,1.57,9.46-.27.07-.02.15.01.17.08.03.07-.01.15-.08.17-1.95.7-3.77.91-5.3.91Z\"/>\n      <path class=\"cls-7\" d=\"M86.53,77.71c-1.48,0-3.22-.22-5.09-.88-.07-.03-.11-.1-.08-.17.03-.07.1-.11.17-.08,5.15,1.84,9.33.19,9.37.17.07-.03.15,0,.18.08.03.07,0,.15-.08.18-.03.01-1.81.72-4.47.72Z\"/>\n      <path class=\"cls-7\" d=\"M76.57,74.34c-.08,0-.14-.06-.14-.14v-8.6c0-.08.06-.14.14-.14s.14.06.14.14v8.6c0,.08-.06.14-.14.14Z\"/>\n    </g>\n    <g>\n      <path class=\"cls-7\" d=\"M81.66,44.99l-10.37.4v1.02c.53.61,1.06,1.07,1.5,1.35.98.62,2.47,1.13,3.64,1.13s2.47-.46,3.46-1.13c.54-.37,1.17-.94,1.77-1.69v-1.09Z\"/>\n      <path class=\"cls-2\" d=\"M67.53,36.84c.21,0-.72-5.53-.76-5.93-.21-1.76-.21-3.72.94-5.06.12-.14.26-.28.31-.46.04-.13.02-.27.03-.4,0-.9.63-1.71,1.4-2.19.77-.47,1.67-.68,2.56-.87,2.02-.44,4.27-.86,6.07.17.36-.6,1.14-.83,1.84-.75.72.09,1.32.43,1.92.79,1.05.62,2.39.77,3.57,1.06.35.08.71.18.96.44.21.22.3.52.37.81.66,2.88-.46,6.04-.59,8.95-.06,1.31-.36,2.66-.56,3.95-.02.15-7.51-.21-8.02-.22-2.01-.05-4.02-.11-6.02-.16-.77-.02-1.55-.04-2.32-.06-.41-.01-1.02.09-1.41-.04-.07-.02-.19,0-.27,0Z\"/>\n      <path class=\"cls-8\" d=\"M83.46,26.57c-1.81-2.24-3.76-3.06-7.03-3.06s-5.19.91-6.96,3.12c-1.8,2.25-1.57,6-1.29,8.77.28,2.77.34,5.34,1.25,7.56.91,2.22,2.34,3.75,3.35,4.38.98.62,2.47,1.13,3.64,1.13s2.47-.46,3.46-1.13c1.12-.76,2.58-2.37,3.49-4.72.91-2.35,1.01-4.45,1.29-7.22.28-2.77.8-6.35-1.22-8.84Z\"/>\n      <path class=\"cls-8\" d=\"M68.74,35.83c-.8-.98-2.61.07-2.37,1.91.25,1.84,1.95,3.7,3.01,3.69,1.06,0,.44-4.27-.64-5.59Z\"/>\n      <path class=\"cls-8\" d=\"M83.73,35.83c.8-.98,2.61.07,2.37,1.91-.25,1.84-1.95,3.7-3.01,3.69-1.06,0-.44-4.27.64-5.59Z\"/>\n      <path class=\"cls-2\" d=\"M68.99,38.81c.42,0,.15-5.45.63-5.96.11-.12.28-.15.44-.18.93-.16,1.79-.29,2.63-.76,1.15-.65,2.07-1.84,2.09-3.17,0-.09,0-.18.06-.25.05-.06.13-.07.19-.11,1.48-.87,3.08-.13,3.08-.13,0,0,1.77-.68,3.38.15.01,1.18.53,2.34,1.37,3.17.82.81,1.93,1.09,1.63,2.52-.31,1.48-.72,3.95-.5,4.01s1.62-4.08,1.73-4.78c.16-1.06-.07-1.11-.22-2.15-.18-1.24-.47-2.47-.98-3.61-.85-1.92-2.35-3.35-4.37-3.99-1.11-.35-2.28-.47-3.44-.47-2.65,0-5.43.62-7.19,2.76-2.13,2.58-2.16,7.67-1.82,9.23s1.03,3.72,1.29,3.72Z\"/>\n      <path class=\"cls-6\" d=\"M68.9,32.75c-.42,0-.84-.05-1.26-.14-.07-.02-.12-.09-.1-.16.02-.07.09-.12.16-.1,1.1.25,2.29.15,3.33-.3.07-.03.15,0,.18.07.03.07,0,.15-.07.18-.71.31-1.47.46-2.24.46Z\"/>\n      <path class=\"cls-6\" d=\"M74.59,28.67c-.07,0-.12-.05-.13-.11-.08-.47.12-1,.52-1.38.3-.29.71-.51,1.28-.69.07-.02.15.02.17.09.02.07-.02.15-.09.17-.53.16-.9.36-1.17.62-.33.32-.5.76-.44,1.14.01.07-.04.14-.11.16,0,0-.01,0-.02,0Z\"/>\n      <path class=\"cls-6\" d=\"M70.7,24.66c-.07,0-.13-.05-.14-.12,0-.08.05-.14.12-.15.29-.03.57-.12.81-.27.16-.09.3-.21.46-.33.09-.07.18-.15.28-.21.77-.56,1.79-.82,2.79-.73.93.09,1.88.48,2.67,1.11.06.05.07.13.02.19-.05.06-.13.07-.19.02-.75-.6-1.65-.97-2.52-1.06-.94-.09-1.89.16-2.61.68-.09.07-.18.14-.27.21-.15.12-.31.25-.49.35-.28.17-.6.27-.93.3,0,0,0,0-.01,0Z\"/>\n      <path class=\"cls-6\" d=\"M69.18,28.11c-.25,0-.49-.02-.72-.03-.08,0-.13-.07-.13-.15,0-.08.07-.13.15-.13.53.04,1.15.07,1.71-.09.59-.17,1.05-.55,1.22-1.02.03-.07.11-.11.18-.08.07.03.11.11.08.18-.21.55-.73.99-1.4,1.18-.36.1-.73.14-1.09.14Z\"/>\n      <path class=\"cls-6\" d=\"M81.69,28.56s-.01,0-.02,0c-.08,0-.13-.08-.12-.15.1-.81-.26-1.66-.91-2.15-.06-.05-.07-.13-.03-.19.05-.06.13-.07.19-.03.73.55,1.13,1.49,1.02,2.4,0,.07-.07.12-.14.12Z\"/>\n      <path class=\"cls-6\" d=\"M85.91,33.51s-.02,0-.03,0c-.81-.21-1.56-.67-2.11-1.3-.05-.06-.05-.14.01-.19.06-.05.14-.05.19.01.52.58,1.22,1.01,1.98,1.21.07.02.12.09.1.17-.02.06-.07.1-.13.1Z\"/>\n      <path class=\"cls-6\" d=\"M84.83,24.67s-.02,0-.04,0c-1.4-.38-2.65-1.29-3.43-2.51-.04-.06-.02-.15.04-.19.06-.04.15-.02.19.04.75,1.16,1.94,2.03,3.28,2.39.07.02.12.09.1.17-.02.06-.07.1-.13.1Z\"/>\n    </g>\n  </g>\n</svg>";

    var erkekTersUcgenIcon = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" data-name=\"Layer 1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 150 250\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: #404555;\n      }\n\n      .cls-2 {\n        fill: #e6e6e6;\n        stroke: #666;\n        stroke-dasharray: 2;\n        stroke-miterlimit: 10;\n        stroke-width: .5px;\n      }\n\n      .cls-3 {\n        fill: #fff;\n      }\n\n      .cls-4 {\n        fill: #d9a352;\n      }\n\n      .cls-5 {\n        opacity: .4;\n      }\n\n      .cls-6 {\n        fill: #a27242;\n      }\n\n      .cls-7 {\n        fill: #b17b69;\n      }\n\n      .cls-8 {\n        fill: #e4a58a;\n      }\n    </style>\n  </defs>\n  <path class=\"cls-2\" d=\"M69.99,166.95L19.79,58.83c-1.7-3.66.97-7.85,5.01-7.85h100.41c4.04,0,6.71,4.19,5.01,7.85l-50.2,108.12c-1.98,4.26-8.04,4.26-10.02,0Z\"/>\n  <g>\n    <g>\n      <g>\n        <path class=\"cls-8\" d=\"M64.3,210.46c-.44,3.01-1.56,9.03-1.41,10.5.11,1.09,1.14,3.9.38,5.16-.63,1.06-2.48.41-4.15.55-1.67.14-2.89.61-4.23.68-1.61.08-5.73.66-6.21-.17-.51-.89,1.07-1.31,2.07-1.99.86-.58,2.9-1.26,4.01-1.8,1.12-.55,2.23-1.05,2.5-1.45.78-1.15.89-11.64.89-11.64l6.14.16Z\"/>\n        <path class=\"cls-7\" d=\"M49.15,227.55s-.09-.03-.12-.07c-.07-.12-.08-.25-.03-.37.15-.41.91-.7,1.88-1.08.25-.1.51-.2.77-.3.07-.03.15,0,.18.07.03.07,0,.15-.07.18-.26.11-.52.21-.78.31-.8.31-1.62.62-1.72.92-.02.05-.01.09.02.14.04.07.01.15-.05.19-.02.01-.04.02-.07.02Z\"/>\n        <path class=\"cls-7\" d=\"M48.73,227.26s-.1-.03-.12-.07c0-.02-.08-.16,0-.39.19-.49,1.02-.99,2.39-1.44.07-.02.15.02.17.09.02.07-.02.15-.09.17-1.67.55-2.1,1.03-2.21,1.26-.05.12-.03.18-.03.19.04.07,0,.15-.06.18-.02.01-.04.02-.06.02Z\"/>\n      </g>\n      <path class=\"cls-8\" d=\"M100.47,57.39c-2.17-2.16-14.92-4.28-16.47-6.41-1.56-2.13-1.63-6.73-1.63-6.73l-10.37.4s.34,4.15-1.44,6.17c-1.78,2.01-11.52,2.4-15.67,5.85-3.31,2.75-16.9,24.23-16.94,27.9-.04,3.66,15.28,25.4,15.28,25.4l4.23-1.95-11-21.73,13.32-17.77-1.84-1.22s-.66,3.34.68,11.74c.97,6.07,2.02,11.74,2.51,18.12.5,6.53.16,10.66-.59,14.57-.68,3.57-.17,6.74-.55,10.38-.13,1.22-1.05,5.74-1.37,11.97,0,0-.84,3.27-1.14,11.17-.26,6.72-.3,17.18-.3,25.08,0,3.73.48,11.7.45,18.83-.04,10.67.54,21.14.54,21.14l6.14.16s2.81-17.46,3.49-24.18c.68-6.72.83-13.47.91-15.91.08-2.44,7.7-38.33,7.7-38.33,0,0,4.98,35.52,5.02,37.25.04,1.73-.28,6.94.21,13.97.49,7.03,4.69,28.23,4.69,28.23l6.14-.16s.96-12.29,1.16-26.92c.06-4.28-.52-9.44-.3-14.9.3-7.41.95-14.75.83-21.52-.14-8.24-.46-12.94-.46-12.94-.14-5.82-1.12-10.43-1.14-11.79-.04-3.65-.39-7.88-1.03-11.98-.59-3.79.15-8.76.46-14,.43-7.26,1.06-12.8,2.47-19.11.64-2.87,1.69-8,1.31-10.01-.53-2.83-3.03.36-3.03.36.02.74,11.92,17.25,11.92,17.25l-10.42,20.96,4.09,2.34s14.69-19.5,14.69-23.9-10.44-25.67-12.55-27.77Z\"/>\n      <path class=\"cls-7\" d=\"M65.86,76.13s-.04,0-.07-.02c-.07-.04-.09-.12-.05-.19l.82-1.51c.04-.07.12-.09.19-.05.07.04.09.12.05.19l-.82,1.51s-.07.07-.12.07Z\"/>\n      <path class=\"cls-7\" d=\"M87.04,76.13s-.04,0-.07-.02c-.07-.04-.09-.12-.05-.19l.82-1.51c.04-.07.12-.09.19-.05.07.04.09.12.05.19l-.82,1.51s-.07.07-.12.07Z\"/>\n      <path class=\"cls-7\" d=\"M66.16,78.81c-2.59,0-4.32-.63-4.35-.64-.07-.03-.11-.11-.08-.18.03-.07.11-.11.18-.08.04.02,4.31,1.57,9.46-.27.07-.02.15.01.17.08.03.07-.01.15-.08.17-1.95.7-3.77.91-5.3.91Z\"/>\n      <path class=\"cls-7\" d=\"M86.61,78.89c-1.48,0-3.22-.22-5.09-.88-.07-.03-.11-.1-.08-.17.03-.07.1-.11.17-.08,5.15,1.84,9.33.19,9.37.17.07-.03.15,0,.18.08.03.07,0,.15-.08.18-.03.01-1.81.72-4.47.72Z\"/>\n      <path class=\"cls-7\" d=\"M76.65,75.51c-.08,0-.14-.06-.14-.14v-8.6c0-.08.06-.14.14-.14s.14.06.14.14v8.6c0,.08-.06.14-.14.14Z\"/>\n      <path class=\"cls-1\" d=\"M91.83,110.95c-.22-.19-7.36,1.22-15.19,1.25-8.05.03-15.87-1.32-16.09-1.17-.2.13-.71,6.51-1.28,11.45-.71,6.11-1.05,11.07-.66,11.6.32.43,3.38,1.53,7.15,2.11,4.69.72,9.74.63,10.08.11.34-.51.51-3.13.51-3.13,0,0,0,2.79.4,3.13s5.08.24,8.49,0c3.48-.25,7.94-.53,8.46-1.26.52-.73.12-7.42-.22-11.67-.55-6.8-1.2-12.04-1.65-12.42Z\"/>\n      <path class=\"cls-3\" d=\"M76.58,114.14c5.14-.22,12.06-1.12,15.7-1.64-.16-.89-.32-1.44-.45-1.55-.22-.19-7.36,1.22-15.19,1.25-8.05.03-15.87-1.32-16.09-1.17-.06.04-.15.65-.26,1.61,2.49.45,10.25,1.75,16.29,1.49Z\"/>\n      <path class=\"cls-4\" d=\"M72.73,121.23s-.06,0-.08-.02c-.07-.05-.1-.14-.05-.22,1.53-2.46,1.48-6.79,1.48-6.83,0-.09.07-.16.16-.16h0c.09,0,.16.07.16.16,0,.18.05,4.46-1.53,7-.03.05-.08.07-.13.07Z\"/>\n      <path class=\"cls-4\" d=\"M77.1,122.81c-.05,0-.1-.03-.13-.07-1.59-2.55-.83-8.35-.79-8.6.01-.09.09-.15.18-.13.09.01.15.09.14.18,0,.06-.78,5.93.75,8.39.05.07.02.17-.05.22-.03.02-.05.02-.08.02Z\"/>\n      <path class=\"cls-7\" d=\"M71.23,58.04s-.03,0-.05,0l-7.92-2.85c-.07-.03-.11-.1-.08-.17.03-.07.1-.11.17-.08l7.92,2.85c.07.03.11.1.08.17-.02.06-.07.09-.13.09Z\"/>\n      <path class=\"cls-7\" d=\"M83.02,58.27c-.05,0-.1-.03-.13-.08-.03-.07,0-.15.07-.18l7.52-3.13c.07-.03.15,0,.18.07.03.07,0,.15-.07.18l-7.52,3.13s-.03.01-.05.01Z\"/>\n      <path class=\"cls-7\" d=\"M75.88,101.36s-.04,0-.06-.02c-.07-.04-.09-.12-.05-.19l.99-1.82c.04-.07.12-.09.19-.06.07.04.09.12.05.19l-.99,1.82s-.07.07-.12.07Z\"/>\n      <path class=\"cls-7\" d=\"M66.96,174.79s-.03,0-.05-.01c-.07-.03-.1-.11-.07-.18l1.75-4.28c.03-.07.11-.1.18-.08.07.03.1.11.07.18l-1.75,4.28c-.02.05-.07.09-.13.09Z\"/>\n      <path class=\"cls-7\" d=\"M58.08,173.19c-.06,0-.11-.04-.13-.09l-.91-2.73c-.02-.07.01-.15.09-.17.07-.02.15.02.17.09l.91,2.73c.02.07-.01.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n      <path class=\"cls-7\" d=\"M90.28,175.82s-.04,0-.05-.01c-.07-.03-.1-.11-.07-.18l2.22-5.13c.03-.07.11-.1.18-.07.07.03.1.11.07.18l-2.22,5.13c-.02.05-.07.08-.13.08Z\"/>\n      <path class=\"cls-7\" d=\"M85.14,174.59s-.09-.02-.12-.07l-1.48-2.46c-.04-.06-.02-.15.05-.19.06-.04.15-.02.19.05l1.48,2.46c.04.06.02.15-.05.19-.02.01-.05.02-.07.02Z\"/>\n      <g>\n        <path class=\"cls-8\" d=\"M94.24,106.73s-.73,1.94-1.55,2.21c-.82.27-3.41,1.01-4.06,1.31-.65.3-2.35,1.05-2.63,1.27s-2.66,2.46-2.48,3.03c.19.57.67.7,1.06.44s2.27-2.29,2.6-2.37c.32-.09.69.11.59.6,0,0-2.09,2.4-2.4,2.8-.31.4-1.33,1.41-1.22,1.86.11.46.62.81.99.53.36-.28,3.38-3.46,3.66-3.71.28-.25.36.1.08.35-.28.25-.56.62-.78,1.09-.22.46-1.65,2.59-1.77,2.92-.12.33.03.87.65.69.62-.18,1.4-1.37,1.65-1.75s1.69-2.66,2.13-2.44c.44.22-1,2.16-1.24,2.47-.24.31-.44.8-.06,1.06.38.26,1.45-.85,1.73-1.23.28-.38,1.1-1.64,1.73-2.01.64-.38,3.19-2.79,3.66-3.61.47-.82,1.03-2.44,1.75-3.18l-4.09-2.34Z\"/>\n        <path class=\"cls-7\" d=\"M86.01,111.66s-.08-.02-.11-.05c-.05-.06-.04-.14.02-.19.21-.17,1.09-.58,2.12-1.05.21-.1.39-.18.53-.24.4-.18,1.46-.52,2.55-.85.07-.02.15.02.17.09.02.07-.02.15-.09.17-1.03.31-2.14.66-2.52.84-.14.06-.32.15-.53.24-.7.32-1.86.85-2.06,1.01-.03.02-.06.03-.09.03Z\"/>\n      </g>\n      <g>\n        <path class=\"cls-8\" d=\"M57.45,108.02c.34.65.93,1.3,1.73,1.08s2.09-1.02,2.83-1.16c.74-.14,1.78-.48,2.18-.34.4.14,2.66,2.46,2.63,2.8-.03.34-.34.82-.91.59-.57-.23-1.92-1.64-2.09-1.67-.17-.03-.74.68-.74.68,0,0,4.1,3.73,4.16,4.07.06.34-.28.88-.76.68s-3.76-2.72-3.76-2.72c0,0,3.51,3.51,3.54,3.88.03.37-.34.74-.88.45-.54-.28-3.57-3.11-3.88-3.11s-.45.2-.45.2c0,0,2.79,2.91,2.77,3.16-.02.25-.34.89-1,.62-.66-.26-3.15-3.13-3.49-3.17-.34-.04-2.36.23-3.34-.68s-2.77-3.41-2.77-3.41l4.23-1.95Z\"/>\n        <path class=\"cls-7\" d=\"M64.61,111.55s-.07-.01-.09-.04c-.83-.77-1.53-1.41-1.53-1.41-.05-.05-.06-.13-.01-.19.62-.77.8-.74.86-.73.1.02.23.13.71.57.46.42,1.09.99,1.41,1.11.17.07.32.06.45-.01.17-.1.26-.31.27-.47-.04-.3-2.16-2.52-2.54-2.66-.32-.11-.99.07-1.53.21l-.18.05c-.39.1-.87.25-1.35.4l-.05-.13-.03-.13c.49-.16.97-.3,1.37-.41l.18-.05c.64-.17,1.3-.35,1.69-.21.38.14,2.76,2.49,2.72,2.94-.02.21-.13.51-.4.68-.14.09-.37.16-.7.03-.36-.15-.99-.71-1.49-1.16-.23-.2-.48-.43-.57-.49-.09.04-.31.27-.53.52.22.2.79.72,1.43,1.33.06.05.06.14,0,.19-.03.03-.06.04-.1.04ZM61.01,108.27h0,0Z\"/>\n      </g>\n      <path class=\"cls-7\" d=\"M95.41,72.86s-.02,0-.03,0c-.07-.01-.12-.09-.11-.16l.85-4.56c.01-.07.08-.12.16-.11.07.01.12.09.11.16l-.85,4.56c-.01.07-.07.11-.13.11Z\"/>\n      <path class=\"cls-7\" d=\"M57.74,71.43c-.05,0-.1-.03-.12-.08l-1.48-3.3c-.03-.07,0-.15.07-.18.07-.03.15,0,.18.07l1.48,3.3c.03.07,0,.15-.07.18-.02,0-.04.01-.06.01Z\"/>\n      <g>\n        <path class=\"cls-8\" d=\"M86.33,211.48s.22,3.05.6,5.33c.33,2,.44,4.06.32,5.46-.12,1.4-.62,2.2-.48,3.28.14,1.13,1.3,1.35,1.3,1.35,0,0,1.71,1.84,2.32,2.26.93.63,1.43.91,3.34.41,2.11-.54,3.6-1.57,3.57-2.25-.03-.69-2.78-2.28-3.31-3.42-1.68-3.63-1.51-10.16-1.52-12.58l-6.14.16Z\"/>\n        <path class=\"cls-7\" d=\"M92.88,229.79s-.09-.02-.12-.06l-1.3-2.11c-.04-.06-.02-.15.04-.19.06-.04.15-.02.19.04l1.3,2.11c.04.06.02.15-.04.19-.02.01-.05.02-.07.02Z\"/>\n        <path class=\"cls-7\" d=\"M94.25,229.41s-.09-.02-.12-.07l-1.19-1.94c-.04-.06-.02-.15.05-.19.06-.04.15-.02.19.05l1.19,1.94c.04.06.02.15-.05.19-.02.01-.05.02-.07.02Z\"/>\n        <path class=\"cls-7\" d=\"M95.65,228.85s-.08-.02-.11-.06l-1.08-1.52c-.04-.06-.03-.15.03-.19.06-.04.15-.03.19.03l1.08,1.52c.04.06.03.15-.03.19-.02.02-.05.03-.08.03Z\"/>\n        <path class=\"cls-7\" d=\"M96.78,228.11s-.07-.02-.1-.05l-.96-1.07c-.05-.06-.05-.14.01-.19.06-.05.14-.05.19.01l.96,1.07c.05.06.05.14-.01.19-.03.02-.06.03-.09.03Z\"/>\n      </g>\n    </g>\n    <g>\n      <path class=\"cls-6\" d=\"M68.3,35.95c-.08-.4.01-.76,0-1.16-.04-.7-.27-1.43-.39-2.12-.24-1.48-.4-2.98-.49-4.48-.07-1.19-.03-2.53.84-3.35.18-.17.39-.31.54-.5.36-.45.36-1.1.67-1.6.5-.8,1.6-.91,2.5-1.2.67-.22,1.29-.58,1.94-.85.65-.27,1.38-.45,2.06-.27.33.08.68.25,1.01.14.13-.04.25-.13.37-.2.55-.3,1.23-.22,1.82,0,.91.34,1.67,1,2.63,1.18.97.18,1.97.06,2.94.22.36.06.79.23.85.6.05.24-.09.52.03.74.09.17.29.24.45.33,1.02.55,1.05,1.98,1.11,2.99.07,1.43.07,2.87-.06,4.29-.15,1.74-.76,5.71-.76,5.72-.02.15-7.51-.21-8.02-.22-2.01-.05-4.02-.11-6.02-.16-.77-.02-1.55-.04-2.32-.06-.41-.01-1.02.09-1.41-.04-.07-.02-.19,0-.27,0Z\"/>\n      <path class=\"cls-7\" d=\"M82.36,43.94l-10.37.4v1.02c.53.61,1.06,1.07,1.5,1.35.98.62,2.47,1.13,3.64,1.13s2.47-.46,3.46-1.13c.54-.37,1.17-.94,1.77-1.69v-1.09Z\"/>\n      <path class=\"cls-8\" d=\"M84.16,25.52c-1.81-2.24-3.76-3.06-7.03-3.06s-5.19.91-6.96,3.12c-1.8,2.25-1.57,6-1.29,8.77.28,2.77.34,5.34,1.25,7.56.91,2.22,2.34,3.75,3.35,4.38.98.62,2.47,1.13,3.64,1.13s2.47-.46,3.46-1.13c1.12-.76,2.58-2.37,3.49-4.72.91-2.35,1.01-4.45,1.29-7.22.28-2.77.8-6.35-1.22-8.84Z\"/>\n      <path class=\"cls-6\" d=\"M77.48,22.21c-2.65,0-5.43.62-7.19,2.76-2.13,2.58-2.24,6.09-2.21,9.25,0,.26.06.58.31.63.52.1,1.42-1.14,1.47-1.46.11-.66.22-1.32.47-1.94.25-.62.66-1.19,1.23-1.52.43-.25.93-.34,1.42-.43.87-.16,1.77-.33,2.53-.79.62-.38,1.11-.93,1.71-1.32.29-.18,1.42-.57,1.68-.29.09.1.11.39.16.53.06.19.14.38.23.56.17.34.4.64.73.83.67.39,1.51.22,2.27.05,1.06-.23,1.96-.2,2.74.62.23.24.43.52.53.83.12.38.09.78.08,1.17,0,.53-.3,2.3-.19,2.81.06.3.31-.03.6-.15.99-.39.34-3.3.22-4.09-.18-1.24-.47-2.47-.98-3.61-.85-1.92-2.35-3.35-4.37-3.99-1.11-.35-2.28-.47-3.44-.47Z\"/>\n      <path class=\"cls-5\" d=\"M73.79,26.77c-.07,0-.13-.05-.14-.12,0-.08.05-.14.12-.15.46-.04.9-.22,1.32-.39.17-.07.34-.14.48-.24.15-.11.26-.26.38-.42.07-.09.14-.18.21-.26.4-.45,1-.72,1.6-.74.08,0,.14.06.14.13,0,.08-.06.14-.13.14-.53.01-1.05.26-1.41.65-.07.08-.13.16-.2.24-.13.17-.26.34-.44.47-.17.13-.37.21-.54.28-.44.18-.9.36-1.4.41,0,0,0,0-.01,0Z\"/>\n      <path class=\"cls-5\" d=\"M69.07,31.83c-.07,0-.13-.06-.14-.13-.07-1.21.47-2.44,1.41-3.21.06-.05.14-.04.19.02.05.06.04.14-.02.19-.87.71-1.38,1.85-1.31,2.98,0,.08-.05.14-.13.14,0,0,0,0,0,0Z\"/>\n      <path class=\"cls-5\" d=\"M69,26.79c-.07,0-.13-.05-.14-.12,0-.07.05-.14.12-.15.5-.06,1.08-.12,1.5-.44.11-.08.21-.18.31-.28l.11-.11c.55-.52,1.18-.85,1.82-.96.07-.01.14.04.16.11.01.07-.04.14-.11.16-.74.12-1.32.55-1.67.89l-.11.11c-.11.1-.22.21-.34.31-.49.36-1.12.43-1.63.49,0,0-.01,0-.02,0Z\"/>\n      <path class=\"cls-5\" d=\"M73.1,22.71s-.08,0-.11,0c-.08,0-.14-.06-.13-.14,0-.08.06-.13.14-.13.57.02,1.15-.08,1.68-.28l.14-.05c.17-.06.34-.13.53-.16.22-.04.43-.03.62-.01.64.05,1.27.19,1.87.42.07.03.11.11.08.18-.03.07-.11.1-.18.08-.58-.22-1.18-.36-1.8-.41-.18-.01-.37-.02-.55.01-.16.03-.31.09-.48.15l-.14.05c-.54.2-1.1.3-1.67.3Z\"/>\n      <path class=\"cls-5\" d=\"M81.88,28.03c-.54,0-1.07-.07-1.45-.44-.35-.34-.45-.83-.53-1.31-.01-.07.04-.14.11-.16.08-.01.14.04.16.11.07.45.17.88.45,1.16.37.36.98.37,1.56.36,0,0,0,0,0,0,.07,0,.13.06.14.13,0,.08-.06.14-.13.14-.1,0-.21,0-.31,0Z\"/>\n      <path class=\"cls-5\" d=\"M85.6,26.59s-.09-.02-.11-.06c-.33-.51-.93-.86-1.83-1.08-.22-.05-.44-.1-.66-.15-.52-.11-1.06-.22-1.56-.45-.64-.29-1.38-.95-1.4-1.83,0-.08.06-.14.13-.14h0c.07,0,.14.06.14.13.01.76.67,1.33,1.24,1.59.47.22.99.32,1.5.43.22.05.45.09.67.15.97.24,1.62.64,1.99,1.2.04.06.02.15-.04.19-.02.02-.05.02-.07.02Z\"/>\n      <path class=\"cls-5\" d=\"M83.28,23.2c-.32,0-.63-.04-.94-.13-.07-.02-.12-.1-.1-.17.02-.07.09-.12.17-.1.67.18,1.39.15,2.04-.1.07-.03.15,0,.18.08.03.07,0,.15-.08.18-.4.15-.84.23-1.27.23Z\"/>\n    </g>\n  </g>\n</svg>";

    var erkekUcgenIcon = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" data-name=\"Layer 1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 150 250\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: #884c39;\n      }\n\n      .cls-2 {\n        fill: #404555;\n      }\n\n      .cls-3 {\n        fill: #e6e6e6;\n        stroke: #666;\n        stroke-dasharray: 2;\n        stroke-miterlimit: 10;\n        stroke-width: .5px;\n      }\n\n      .cls-4 {\n        fill: #fff;\n      }\n\n      .cls-5 {\n        fill: #d9a352;\n      }\n\n      .cls-6 {\n        opacity: .4;\n      }\n\n      .cls-7 {\n        fill: #b17b69;\n      }\n\n      .cls-8 {\n        fill: #e4a58a;\n      }\n    </style>\n  </defs>\n  <path class=\"cls-3\" d=\"M81.34,52.63l47.9,103.16c2.15,4.64-1.23,9.94-6.34,9.94H27.1c-5.11,0-8.5-5.3-6.34-9.94l47.9-103.16c2.51-5.4,10.18-5.4,12.69,0Z\"/>\n  <g>\n    <g>\n      <path class=\"cls-8\" d=\"M58.74,211.48c-.44,3.01-2.28,9.03-2.13,10.5.11,1.09,1.14,3.9.38,5.16-.63,1.06-2.48.41-4.15.55-1.67.14-2.89.61-4.23.68-1.61.08-5.73.66-6.21-.17-.51-.89,1.07-1.31,2.07-1.99.86-.58,2.9-1.26,4.01-1.8,1.12-.55,2.23-1.05,2.5-1.45.78-1.15,1.61-11.64,1.61-11.64l6.14.16Z\"/>\n      <path class=\"cls-7\" d=\"M42.86,228.58s-.09-.03-.12-.07c-.07-.12-.08-.25-.03-.37.15-.41.91-.7,1.88-1.08.25-.1.51-.2.77-.3.07-.03.15,0,.18.07.03.07,0,.15-.07.18-.26.11-.52.21-.78.31-.8.31-1.62.62-1.72.91-.02.05-.01.09.02.14.04.07.01.15-.05.19-.02.01-.04.02-.07.02Z\"/>\n      <path class=\"cls-7\" d=\"M42.44,228.28s-.1-.03-.12-.07c0-.02-.08-.16,0-.39.19-.49,1.02-.99,2.39-1.44.07-.02.15.02.17.09.02.07-.02.15-.09.17-1.67.55-2.1,1.03-2.21,1.26-.05.12-.03.18-.03.19.04.07.01.15-.06.18-.02.01-.04.02-.06.02Z\"/>\n    </g>\n    <g>\n      <path class=\"cls-8\" d=\"M81.78,215.01c.44,3.01.83,5.51.67,6.97-.11,1.09-1.14,3.9-.38,5.16.63,1.06,2.48.41,4.15.55,1.67.14,2.89.61,4.23.68,1.61.08,5.73.66,6.21-.17.51-.89-1.07-1.31-2.07-1.99-.86-.58-2.9-1.26-4.01-1.8-1.12-.55-2.23-1.05-2.5-1.45-.78-1.15-.56-8.01-.56-8.01l-5.74.05Z\"/>\n      <path class=\"cls-7\" d=\"M96.21,228.58s-.05,0-.07-.02c-.07-.04-.09-.12-.05-.19.03-.05.03-.09.02-.14-.11-.29-.93-.61-1.72-.91-.25-.1-.52-.2-.78-.31-.07-.03-.1-.11-.07-.18.03-.07.11-.1.18-.07.26.11.52.21.77.3.97.37,1.73.67,1.88,1.08.04.12.03.25-.03.37-.02.04-.07.07-.12.07Z\"/>\n      <path class=\"cls-7\" d=\"M96.63,228.28s-.04,0-.07-.02c-.06-.04-.09-.11-.06-.18,0,0,.02-.07-.03-.19-.11-.23-.54-.71-2.21-1.26-.07-.02-.11-.1-.09-.17.02-.07.1-.11.17-.09,1.37.45,2.19.95,2.39,1.44.09.23.02.37,0,.39-.02.05-.07.07-.12.07Z\"/>\n    </g>\n    <path class=\"cls-8\" d=\"M95.07,58.42c-2.11-2.49-11.77-3.73-13.31-6.41-1.32-2.29-.63-10.76-.63-10.76l-11.38,4.43s.34,4.15-1.44,6.17c-1.78,2.01-9.93,3.15-13.35,6.57-3.04,3.04-15.05,24.47-15.08,28.13-.04,3.66,11.31,25.2,11.31,25.2l4.07-1.87-8.12-21.6,13.07-16.9-1.37-4.1v9.72c0,7.07-.18,12.27-.94,19.34-.68,6.37-2.35,11.79-3.1,15.7-.68,3.57.16,7.96-.22,11.61-.13,1.22-2.45,2.33-2.76,8.55-.2,3.9-.24,8.17-.05,14.72.28,9.71,1.92,16.55,1.92,24.44,0,3.73-.86,10.76-1.14,17.89-.42,10.92.05,22.08.05,22.08l6.14.16s5.09-18.37,5.77-25.09c.68-6.72.64-12.56.72-15,.04-1.12,2.97-9.18,5-17.67,2.4-10.05,3.95-20.66,3.95-20.66,0,0-.22,9.48.86,18.94.98,8.56,3.27,17.14,3.24,17.96-.06,1.73-.69,6.91-.63,13.96.06,7.05,4.14,31.1,4.14,31.1l5.74-.05s.93-14.59,2.01-29.18c.31-4.26.05-9.45.6-14.89.74-7.38,2.88-15.23,3.86-21.93.98-6.68,1.43-12.19,1.34-16.13-.14-5.82-1.83-5.86-1.85-7.22-.04-3.65.12-9.78-.51-13.87-.59-3.79-2.53-8.7-3.22-14.66-.8-6.95-.73-11.83-.6-18.04.11-5.47.46-13.1.46-13.1,0,0-1.6,4.45-1.6,4.44.02.74,3.75,15,5.14,21.84,1.53,7.48,6.16,31.07,6.16,31.07l4.16-.31s-1.8-26.28-2.76-34.74c-.96-8.47-3.32-27.09-5.63-29.83Z\"/>\n    <path class=\"cls-7\" d=\"M65.99,78.82c-2.06,0-3.57-.29-3.6-.3-.07-.01-.12-.09-.11-.16.01-.07.08-.12.16-.11.05,0,4.81.93,8.97-.54.07-.03.15.01.17.08.03.07-.01.15-.08.17-1.88.67-3.87.85-5.51.85Z\"/>\n    <path class=\"cls-7\" d=\"M81.91,78.51c-2.82,0-4.14-.68-4.22-.72-.07-.04-.09-.12-.06-.19.04-.07.12-.09.19-.06.03.01,2.71,1.4,8.64.19.07-.01.15.03.16.11.02.07-.03.15-.11.16-1.84.37-3.37.51-4.61.51Z\"/>\n    <path class=\"cls-7\" d=\"M74.57,76.46c-.07,0-.13-.06-.14-.13l-.1-3.6c0-.08.06-.14.13-.14h0c.07,0,.13.06.14.13l.1,3.6c0,.08-.06.14-.13.14h0Z\"/>\n    <path class=\"cls-7\" d=\"M82.38,76.02s-.04,0-.07-.02c-.07-.04-.09-.12-.05-.19l.82-1.51c.04-.07.12-.09.19-.05.07.04.09.12.05.19l-.82,1.51s-.07.07-.12.07Z\"/>\n    <path class=\"cls-7\" d=\"M66.3,76.02s-.04,0-.07-.02c-.07-.04-.09-.12-.05-.19l.82-1.51c.04-.07.12-.09.19-.05.07.04.09.12.05.19l-.82,1.51s-.07.07-.12.07Z\"/>\n    <path class=\"cls-2\" d=\"M92.77,110.19c-.22-.19-11.52,2.4-19.35,2.43-8.05.03-18.53-2.14-18.75-2-.2.13-1.87,6.93-2.44,11.87-.71,6.11-.82,12.08-.43,12.61.32.43,7.96,1.53,11.73,2.11,4.69.72,9.74.63,10.08.11.34-.51.51-3.13.51-3.13,0,0,0,2.79.4,3.13.4.34,5.08.24,8.49,0,3.48-.25,11.89-.53,12.42-1.26.52-.73.12-7.42-.22-11.67-.55-6.8-1.98-13.83-2.44-14.21Z\"/>\n    <path class=\"cls-5\" d=\"M69.95,123.44s-.05,0-.07-.02c-.08-.04-.11-.13-.07-.21,1.61-3.32,1.63-6.78,1.63-6.81,0-.09.07-.16.16-.16h0c.09,0,.16.07.16.16,0,.04-.02,3.57-1.66,6.95-.03.06-.08.09-.14.09Z\"/>\n    <path class=\"cls-5\" d=\"M74.26,121.48c-.08,0-.15-.06-.16-.14l-.55-5c0-.09.05-.16.14-.17.08,0,.16.05.17.14l.55,5c0,.09-.05.16-.14.17,0,0-.01,0-.02,0Z\"/>\n    <path class=\"cls-4\" d=\"M73.75,116.09c8.19-.58,16.02-1.93,19.92-2.67-.38-1.85-.72-3.08-.9-3.23-.22-.19-11.52,2.4-19.35,2.43-8.05.03-18.53-2.14-18.75-2-.09.06-.49,1.51-.95,3.54,3.81.94,11.71,2.52,20.03,1.93Z\"/>\n    <path class=\"cls-7\" d=\"M69,59.07s-.03,0-.05,0l-7.92-2.85c-.07-.03-.11-.1-.08-.17.03-.07.1-.11.17-.08l7.92,2.85c.07.03.11.1.08.17-.02.06-.07.09-.13.09Z\"/>\n    <path class=\"cls-7\" d=\"M80.79,59.29c-.05,0-.1-.03-.13-.08-.03-.07,0-.15.07-.18l7.52-3.13c.07-.03.15,0,.18.07.03.07,0,.15-.07.18l-7.52,3.13s-.04.01-.05.01Z\"/>\n    <path class=\"cls-7\" d=\"M73.65,102.39s-.04,0-.06-.02c-.07-.04-.09-.12-.06-.19l.99-1.82c.04-.07.12-.09.19-.06.07.04.09.12.06.19l-.99,1.82s-.07.07-.12.07Z\"/>\n    <path class=\"cls-7\" d=\"M63.48,175.81s-.03,0-.05-.01c-.07-.03-.1-.11-.08-.18l1.75-4.28c.03-.07.11-.1.18-.08.07.03.1.11.08.18l-1.75,4.28c-.02.05-.07.09-.13.09Z\"/>\n    <path class=\"cls-7\" d=\"M54.6,174.22c-.06,0-.11-.04-.13-.09l-.91-2.73c-.02-.07.01-.15.09-.17.07-.02.15.01.17.09l.91,2.73c.02.07-.01.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n    <path class=\"cls-7\" d=\"M86.72,177.01s-.04,0-.06-.01c-.07-.03-.09-.12-.06-.18l2.52-4.99c.03-.07.12-.09.18-.06.07.03.09.12.06.18l-2.52,4.99s-.07.08-.12.08Z\"/>\n    <path class=\"cls-7\" d=\"M81.66,175.47s-.1-.03-.12-.07l-1.33-2.54c-.04-.07,0-.15.06-.18.07-.04.15,0,.18.06l1.33,2.54c.04.07,0,.15-.06.18-.02.01-.04.02-.06.02Z\"/>\n    <g>\n      <path class=\"cls-8\" d=\"M55.26,109.87c.33.62.9,1.25,1.66,1.03.76-.22,2.01-.98,2.72-1.11.71-.14,1.71-.46,2.09-.33.38.14,2.55,2.36,2.53,2.69-.03.33-.33.79-.87.57-.54-.22-1.85-1.58-2.01-1.6-.16-.03-.71.65-.71.65,0,0,3.94,3.59,3.99,3.91.05.33-.27.84-.73.65s-3.61-2.61-3.61-2.61c0,0,3.37,3.37,3.4,3.72.03.35-.33.71-.84.43-.52-.27-3.42-2.99-3.72-2.99s-.43.19-.43.19c0,0,2.68,2.8,2.66,3.03-.02.24-.33.85-.96.6-.63-.25-3.02-3.01-3.35-3.04-.33-.04-2.26.22-3.21-.65-.94-.87-2.66-3.28-2.66-3.28l4.07-1.87Z\"/>\n      <path class=\"cls-7\" d=\"M64.25,112.29s0,0-.01,0c-.08,0-.13-.07-.12-.15-.05-.29-2.07-2.42-2.44-2.55-.19-.07-.71-.04-2.11.47-.5.18-1.14.42-1.61.6-.35.13-.62.23-.66.25-.07.02-.15-.02-.17-.09-.02-.07.02-.15.09-.17.04-.01.3-.11.64-.24.47-.18,1.11-.42,1.61-.6,1.21-.45,1.94-.6,2.29-.47.37.13,2.65,2.4,2.62,2.83,0,.07-.07.13-.14.13Z\"/>\n    </g>\n    <g>\n      <path class=\"cls-8\" d=\"M103.46,122.99s.41,4.06.52,5.21c.11,1.15,2.09,5.02,2.08,5.39,0,.37-.68,3.92-.95,4.34-.27.42-1.86,1.69-2.14,1.86-.29.17-1.3.79-1.56.63-.27-.16-.23-.31-.23-.31,0,0-.49.32-.71.04-.21-.27-.03-.87.2-1.07.23-.2,1.32-.78,1.32-.78,0,0-2.08.56-2.5.36-.42-.2-.22-.77.03-.96s1.24-.34,1.24-.34l-.18-.65s-.66.05-.76-.36c-.09-.4.64-.7.64-.7,0,0,.23-1.58-.28-2.46-.51-.88-.6-2.16-.3-3.01.3-.86.83-1.92.29-3.28-.54-1.36-.87-3.61-.87-3.61l4.16-.31Z\"/>\n      <path class=\"cls-7\" d=\"M101.62,138.2c-.36,0-.75-.2-.99-.79-.03-.07,0-.15.07-.18.07-.03.15,0,.18.07.25.61.69.69,1.01.56.26-.11.52-1.51.36-2.36-.16-.83.18-3.19.19-3.29.01-.07.08-.13.15-.12.07.01.13.08.12.15,0,.02-.34,2.41-.19,3.2.14.75,0,2.46-.52,2.66-.12.05-.24.07-.38.07Z\"/>\n      <path class=\"cls-7\" d=\"M101.18,140.25s-.02,0-.02,0c-.07-.01-.12-.08-.11-.16.01-.07.12-.69.33-.95.12-.15.39-.32.69-.49.2-.12.44-.26.5-.34.04-.04.08-.09.14-.15.23-.23.57-.57.73-1.12.02-.07.1-.11.17-.09.07.02.11.1.09.17-.18.62-.57,1.01-.8,1.24-.05.05-.1.1-.13.13-.09.11-.31.24-.57.4-.23.14-.53.32-.61.43-.14.18-.24.66-.27.83-.01.07-.07.11-.13.11Z\"/>\n      <path class=\"cls-7\" d=\"M101.99,138.44s-.08-.02-.11-.05c-.05-.06-.04-.14.02-.19.36-.29.94-.84,1.01-1.06.11-.34.52-1.22.54-1.26.03-.07.11-.1.18-.07.07.03.1.11.07.18,0,0-.42.9-.52,1.22-.11.36-.94,1.05-1.1,1.18-.03.02-.06.03-.09.03Z\"/>\n      <path class=\"cls-7\" d=\"M100.58,136.85c-.07,0-.13-.05-.14-.12l-.12-1.06c0-.08.05-.14.12-.15.07,0,.14.05.15.12l.12,1.06c0,.08-.05.14-.12.15,0,0-.01,0-.02,0Z\"/>\n    </g>\n    <path class=\"cls-7\" d=\"M58.83,72.72c-.06,0-.11-.03-.13-.09l-1.52-4.25c-.03-.07.01-.15.08-.17.07-.02.15.01.17.08l1.52,4.25c.03.07-.01.15-.08.17-.02,0-.03,0-.05,0Z\"/>\n    <path class=\"cls-7\" d=\"M89.22,76.67c-.07,0-.13-.05-.13-.12l-.61-4.25c-.01-.07.04-.14.12-.15.08,0,.14.04.15.12l.61,4.25c.01.07-.04.14-.12.15,0,0-.01,0-.02,0Z\"/>\n    <g>\n      <path class=\"cls-1\" d=\"M83.16,36.87c-.21,0,.72-5.53.76-5.93.21-1.76.21-3.72-.94-5.06-.12-.14-.26-.28-.31-.46-.04-.13-.02-.27-.03-.4,0-.9-.63-1.71-1.4-2.19-.77-.47-1.67-.68-2.56-.87-2.02-.44-4.27-.86-6.07.17-.36-.6-1.14-.83-1.84-.75-.72.09-1.32.43-1.92.79-.55.33-1.18.5-1.76.74-.6.24-1.26.3-1.74.8-.37.4-.52.95-.64,1.48-.67,3.01-.86,6.27.32,9.19.31.77.74,1.51.86,2.32.06.4.04.8.15,1.19.04.12.09.25.2.31.09.05.19.04.29.04,2.22-.13,4.35-1.03,6.59-1.09l6.02-.16,2.32-.06c.41-.01,1.02.09,1.41-.04.07-.02.19,0,.27,0Z\"/>\n      <path class=\"cls-7\" d=\"M72.32,49.2c1.14,0,3.19-.63,4.94-2.07,1.48-1.21,2.87-2.76,3.8-4.68.05-.66.07-1.21.07-1.21l-11.38,4.43s.08.99-.04,2.24c.77.77,1.66,1.28,2.61,1.28Z\"/>\n      <path class=\"cls-8\" d=\"M81.2,26.54c-1.81-2.24-3.76-3.06-7.03-3.06s-5.19.91-6.96,3.12c-1.8,2.25-1.57,6-1.29,8.77.28,2.77.46,5.3,1.25,7.56.84,2.42,2.78,5.51,5.14,5.51,1.14,0,3.19-.63,4.94-2.07,1.75-1.44,3.34-3.54,4.25-5.89.91-2.35.62-2.34.91-5.11.28-2.77.8-6.35-1.22-8.84Z\"/>\n      <path class=\"cls-8\" d=\"M81.48,35.8c.8-.98,2.61.07,2.37,1.91-.25,1.84-1.95,3.7-3.01,3.69-1.06,0-.44-4.27.64-5.59Z\"/>\n      <path class=\"cls-1\" d=\"M81.25,38.84c-.42,0,.31-5.45-.17-5.96-.11-.12-.28-.15-.44-.18-.93-.16-1.79-.29-2.63-.76-1.15-.65-2.07-1.84-2.09-3.17,0-.09,0-.18-.06-.25-.05-.06-.13-.07-.19-.11-1.48-.87-3.08-.13-3.08-.13,0,0-1.77-.68-3.38.15-.01,1.18-.53,2.34-1.37,3.17-.82.81-2.39,1.09-2.09,2.52.31,1.48.65,3.84.44,3.9s-1.1-3.97-1.21-4.67c-.16-1.06.07-1.11.22-2.15.18-1.24.47-2.47.98-3.61.85-1.92,2.35-3.35,4.37-3.99,1.11-.35,2.28-.47,3.44-.47,2.65,0,5.43.62,7.19,2.76,2.13,2.58,1.74,7.67,1.4,9.23-.34,1.56-1.06,3.72-1.33,3.72Z\"/>\n      <path class=\"cls-6\" d=\"M81.79,32.78c-.77,0-1.54-.16-2.24-.46-.07-.03-.1-.11-.07-.18.03-.07.11-.1.18-.07,1.04.45,2.22.56,3.33.3.08-.02.15.03.16.1.02.07-.03.15-.1.16-.41.1-.83.14-1.26.14Z\"/>\n      <path class=\"cls-6\" d=\"M76.1,28.7s-.01,0-.02,0c-.07-.01-.13-.08-.11-.16.06-.38-.11-.82-.44-1.14-.27-.26-.64-.46-1.17-.62-.07-.02-.11-.1-.09-.17s.1-.11.17-.09c.57.18.97.39,1.28.69.4.38.6.91.52,1.38-.01.07-.07.11-.13.11Z\"/>\n      <path class=\"cls-6\" d=\"M79.99,24.69s0,0-.01,0c-.33-.03-.65-.14-.93-.3-.18-.1-.33-.23-.49-.35-.09-.07-.18-.14-.27-.21-.72-.52-1.67-.77-2.61-.68-.88.08-1.77.46-2.52,1.06-.06.05-.14.04-.19-.02-.05-.06-.04-.14.02-.19.79-.63,1.74-1.03,2.67-1.11,1.01-.09,2.03.17,2.8.73.09.07.19.14.28.21.15.12.3.24.46.33.25.15.53.24.81.27.08,0,.13.07.12.15,0,.07-.07.12-.14.12Z\"/>\n      <path class=\"cls-6\" d=\"M81.51,28.15c-.36,0-.73-.03-1.09-.14-.67-.19-1.19-.64-1.4-1.18-.03-.07,0-.15.08-.18.07-.03.15,0,.18.08.18.47.63.85,1.22,1.02.56.16,1.18.13,1.71.09.08,0,.14.05.15.13,0,.08-.05.14-.13.15-.23.02-.47.03-.72.03Z\"/>\n      <path class=\"cls-6\" d=\"M69,28.59c-.07,0-.13-.05-.14-.12-.11-.91.29-1.85,1.02-2.4.06-.05.15-.03.19.03.05.06.03.15-.03.19-.65.49-1.01,1.34-.91,2.15,0,.07-.04.14-.12.15,0,0-.01,0-.02,0Z\"/>\n      <path class=\"cls-6\" d=\"M64.78,33.54c-.06,0-.12-.04-.13-.1-.02-.07.02-.15.1-.17.76-.2,1.46-.63,1.98-1.21.05-.06.14-.06.19-.01.06.05.06.14.01.19-.56.62-1.31,1.08-2.11,1.3-.01,0-.02,0-.03,0Z\"/>\n      <path class=\"cls-6\" d=\"M65.86,24.7c-.06,0-.12-.04-.13-.1-.02-.07.02-.15.1-.17,1.33-.36,2.53-1.23,3.28-2.39.04-.06.13-.08.19-.04.06.04.08.13.04.19-.79,1.22-2.04,2.13-3.43,2.51-.01,0-.02,0-.04,0Z\"/>\n    </g>\n  </g>\n</svg>";

    var erkekYuvarlakIcon = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" data-name=\"Layer 1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 150 250\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: #404555;\n      }\n\n      .cls-2 {\n        fill: #6e3735;\n      }\n\n      .cls-3 {\n        fill: #e6e6e6;\n        stroke: #666;\n        stroke-dasharray: 2;\n        stroke-miterlimit: 10;\n        stroke-width: .5px;\n      }\n\n      .cls-4 {\n        fill: #fff;\n      }\n\n      .cls-5 {\n        fill: #d9a352;\n      }\n\n      .cls-6 {\n        fill: #b17b69;\n      }\n\n      .cls-7 {\n        fill: #e4a58a;\n      }\n    </style>\n  </defs>\n  <circle class=\"cls-3\" cx=\"76.03\" cy=\"96.87\" r=\"55.65\"/>\n  <g>\n    <g>\n      <g>\n        <path class=\"cls-7\" d=\"M85.94,215.13s.13,1.25.13,3.12c0,1.42-.22,2.27-.22,3.11s-.25,2.64-.4,3.12c-.63,1.99-1.59,3.18-1.26,4.04.38.97,2.56.8,4.96.51,2.75-.33,4.61-.57,4.79-1.6.17-.97-.83-2.37-1.53-3.41-.7-1.04-.72-8.96-.72-8.96l-5.74.05Z\"/>\n        <path class=\"cls-6\" d=\"M86.68,229.32h0c-.08,0-.14-.06-.13-.14l.03-1.91c0-.07.06-.13.14-.13h0c.08,0,.14.06.13.14l-.03,1.91c0,.07-.06.13-.14.13Z\"/>\n        <path class=\"cls-6\" d=\"M89.06,229.05c-.07,0-.13-.05-.14-.12l-.24-1.64c-.01-.07.04-.14.12-.16.07,0,.14.04.16.12l.24,1.64c.01.07-.04.14-.12.16,0,0-.01,0-.02,0Z\"/>\n        <path class=\"cls-6\" d=\"M91.3,228.8c-.06,0-.11-.04-.13-.1-.15-.5-.4-1.31-.43-1.38-.05-.06-.03-.13.03-.18.06-.05.15-.02.2.04.02.03.03.04.46,1.44.02.07-.02.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n        <path class=\"cls-6\" d=\"M93.06,228.37c-.06,0-.11-.04-.13-.09l-.42-1.25c-.02-.07.01-.15.09-.17.07-.02.15.01.17.09l.42,1.25c.02.07-.01.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n      </g>\n      <path class=\"cls-7\" d=\"M113.71,86.84c.11-5.24-12.34-25.22-15.35-27.84-2.46-2.15-12.9-4.73-14.45-6.87-1.56-2.13-1.63-6.73-1.63-6.73l-11.18-1.79s1.15,6.34-.64,8.36c-1.78,2.01-12.47,3.71-15.17,8.28-1.78,3.01-5.59,26.17-5.59,26.17l-13.82-13.92-2.31,3.64c1.15,1.95,13.05,23.05,16.61,22.09,3.56-.96,8.38-12.76,9.74-18.15,1.94-7.65-.68-10.94-.68-10.94,0,0-2.94,4.12-3.17,10.94-.3,9.15-2.28,11.62-2.28,19.83s2.76,12.5,2.76,12.5c-.64,3.58.61,7.02.27,10.67-.11,1.22.28,5.39-.03,11.62-.2,3.9-.03,6.52.16,13.07.28,9.71.34,15.82.34,23.71,0,3.73.05,10.76-.23,17.89-.42,10.92-.33,22.08-.33,22.08l6.14.16s5.47-18.37,6.15-25.09c.68-6.72.75-12.56.83-15,.03-1.08,2.18-8.68,3.65-16.82,2.28-12.57,2.81-21.52,2.81-21.52,0,0,.04,6.32.84,16.65.77,9.9,2.47,20.7,2.51,21.62.07,1.73.3,7.58.91,14.6.61,7.02,5.35,29.08,5.35,29.08l5.74-.05s1.22-13.25,1.59-28.72c.12-5.07-.68-9.43-.55-14.89.17-7.41,1.51-14.98,2.07-21.73.56-6.65.55-12.7.46-16.65-.14-5.82-.56-7.34-.53-8.69.06-3.65-.48-12-.48-12,0,0,2.66-6.97,2.66-12.22,0-11.13-2.08-13.96-1.71-20.72,1.17-21.38-3.95-11.51-3.99-10.9-.02.25.93,2.14,3.05,5.47,3.73,5.85,9.59,14.47,9.59,14.47l-9.24,21.79,4.01,1.94s14.99-20.16,15.11-25.4Z\"/>\n      <path class=\"cls-6\" d=\"M62.49,81.72c-3.05,0-5.32-1.5-5.35-1.52-.06-.04-.08-.12-.04-.18.04-.06.12-.08.18-.04.05.04,5.47,3.59,10.74-.47.06-.04.14-.03.18.02.04.06.03.14-.02.18-1.97,1.52-3.95,2.01-5.69,2.01Z\"/>\n      <path class=\"cls-6\" d=\"M82.71,81.93c-1.53,0-3.18-.49-4.78-1.89-.05-.05-.06-.13-.01-.19.05-.05.13-.06.19-.01,5.18,4.53,10.99-.83,11.05-.88.05-.05.14-.05.19,0,.05.05.05.14,0,.19-.04.04-3,2.77-6.62,2.77Z\"/>\n      <path class=\"cls-6\" d=\"M72.92,77.18s0,0,0,0c-.07,0-.13-.07-.12-.14l.4-6.55c0-.07.07-.13.14-.12.07,0,.13.07.12.14l-.4,6.55c0,.07-.06.12-.13.12Z\"/>\n      <path class=\"cls-6\" d=\"M61.42,77.28s-.04,0-.07-.02c-.07-.04-.09-.12-.05-.19l.82-1.51c.04-.07.12-.09.19-.05.07.04.09.12.05.19l-.82,1.51s-.07.07-.12.07Z\"/>\n      <path class=\"cls-6\" d=\"M81.96,77.28s-.04,0-.07-.02c-.07-.04-.09-.12-.05-.19l.82-1.51c.04-.07.12-.09.19-.05.07.04.09.12.05.19l-.82,1.51s-.07.07-.12.07Z\"/>\n      <g>\n        <path class=\"cls-7\" d=\"M33.58,76.15s-2.85-3.66-3.8-4.02-4.5.35-4.88.22c-.37-.13-4.01-2.42-4.19-2.61-.18-.2-2.47-3.18-2.4-3.43.07-.26.5-.4.99-.23.48.17,2.19,2.08,2.19,2.08,0,0-.2-1.56.3-2.28.5-.72.84-1.54,1.32-1.54.47,0,.54.47.48.74s-.24.85-.24.85c0,0,.78-1.02,1.15-1,.37.02.66.53.36,1.13,0,0,1.03-.43,1.32-.44.29-.01.43.78.09,1l-.34.21s-.14.72.11.97c0,0,1.43.32,2.11.33s2.74-.41,3.89.45,3.84,3.92,3.84,3.92l-2.31,3.64Z\"/>\n        <path class=\"cls-6\" d=\"M25.48,69.48s-.06-.01-.09-.03c-.3-.24-1.27-1.06-1.35-1.35-.08-.34.1-1.7.74-2.15.06-.04.15-.03.19.03.04.06.03.15-.03.19-.52.37-.69,1.61-.63,1.86.04.15.68.74,1.26,1.21.06.05.07.13.02.19-.03.03-.07.05-.11.05Z\"/>\n        <path class=\"cls-6\" d=\"M24.42,70.76s-.05,0-.08-.02c-.49-.33-2.11-1.45-2.24-1.71-.13-.25.54-1.86,1.12-3.15.03-.07.11-.1.18-.07.07.03.1.11.07.18-.58,1.28-1.15,2.73-1.12,2.94.08.13,1.16.92,2.14,1.59.06.04.08.13.04.19-.03.04-.07.06-.11.06Z\"/>\n        <path class=\"cls-6\" d=\"M23.41,71.16s-.06-.01-.09-.03c-.44-.37-1.87-1.62-1.97-1.89-.11-.29,0-1.02.01-1.1.01-.07.08-.13.16-.11.07.01.13.08.11.16-.04.28-.09.8-.03.96.07.16,1.02,1.03,1.89,1.78.06.05.06.14.01.19-.03.03-.07.05-.1.05Z\"/>\n      </g>\n      <path class=\"cls-6\" d=\"M50.32,90.77s0,0,0,0c-.07,0-.13-.06-.13-.14.1-2.21-.6-4.14-.61-4.16-.03-.07,0-.14.08-.17.07-.02.14,0,.17.08,0,.02.73,2,.62,4.26,0,.07-.06.13-.13.13Z\"/>\n      <path class=\"cls-1\" d=\"M94.29,112.08c-.22-.19-9.9,1.24-17.73,1.27-8.05.03-19.92-1.33-20.14-1.17-.19.13-.66,5.04-.55,10.51.12,6.15.4,12.01.79,12.55.32.43,5.25,1.53,9.02,2.11,4.69.72,10.07.63,10.41.11.34-.51.19-3.13.19-3.13,0,0-.25,2.91.15,3.25s5.33.13,8.74-.11c3.48-.25,9.91-.89,10.43-1.62.52-.73.22-7.03,0-11.29-.35-6.82-.85-12.07-1.3-12.46Z\"/>\n      <path class=\"cls-4\" d=\"M94.83,114.6c-.18-1.46-.36-2.36-.54-2.52-.22-.19-9.9,1.24-17.73,1.27-8.05.03-19.92-1.33-20.14-1.17-.08.06-.21.93-.32,2.33,3.37.54,12.11,1.78,21.04,1.7,6.59-.06,13.24-.91,17.69-1.61Z\"/>\n      <path class=\"cls-5\" d=\"M71.28,124.49s-.05,0-.07-.02c-.08-.04-.11-.14-.07-.21,2.01-3.82,1.73-7.89,1.73-7.93,0-.09.06-.16.15-.17.09,0,.16.06.17.15,0,.04.29,4.2-1.76,8.1-.03.05-.08.08-.14.08Z\"/>\n      <path class=\"cls-5\" d=\"M76.11,127.52c-.08,0-.15-.06-.16-.15l-.82-10.99c0-.09.06-.16.15-.17.09,0,.16.06.17.15l.82,10.99c0,.09-.06.16-.15.17,0,0,0,0-.01,0Z\"/>\n      <path class=\"cls-6\" d=\"M67.18,58.56s-.05,0-.07-.02l-3.95-2.22c-.07-.04-.09-.12-.05-.19.04-.07.12-.09.19-.05l3.95,2.22c.07.04.09.12.05.19-.03.04-.07.07-.12.07Z\"/>\n      <path class=\"cls-6\" d=\"M80.17,58.73c-.05,0-.1-.03-.13-.08-.03-.07,0-.15.07-.18l7.52-3.13c.07-.03.15,0,.18.07.03.07,0,.15-.07.18l-7.52,3.13s-.03.01-.05.01Z\"/>\n      <path class=\"cls-6\" d=\"M70.05,102.52s-.04,0-.06-.02c-.07-.04-.09-.12-.05-.19l.99-1.82c.04-.07.12-.09.19-.06.07.04.09.12.05.19l-.99,1.82s-.07.07-.12.07Z\"/>\n      <path class=\"cls-6\" d=\"M68.13,175.94s-.03,0-.05-.01c-.07-.03-.1-.11-.08-.18l1.47-3.65c.03-.07.11-.1.18-.08.07.03.1.11.08.18l-1.47,3.65c-.02.05-.07.09-.13.09Z\"/>\n      <path class=\"cls-6\" d=\"M58.22,174.34c-.06,0-.11-.04-.13-.1l-.69-2.26c-.02-.07.02-.15.09-.17.07-.02.15.02.17.09l.69,2.26c.02.07-.02.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n      <path class=\"cls-6\" d=\"M89.78,177.84s-.03,0-.05-.01c-.07-.03-.1-.11-.07-.18l2.13-5.17c.03-.07.11-.1.18-.07.07.03.1.11.07.18l-2.13,5.17c-.02.05-.07.08-.13.08Z\"/>\n      <path class=\"cls-6\" d=\"M83.47,176.7s-.09-.02-.12-.06l-1.52-2.43c-.04-.06-.02-.15.04-.19.06-.04.15-.02.19.04l1.52,2.43c.04.06.02.15-.04.19-.02.01-.05.02-.07.02Z\"/>\n      <g>\n        <path class=\"cls-7\" d=\"M62.89,211.61s-1.01,3.05-1.39,5.33c-.33,2-.44,4.06-.32,5.46.12,1.4.62,2.2.48,3.28-.14,1.13-1.3,1.35-1.3,1.35,0,0-1.71,1.84-2.32,2.26-.93.63-1.43.91-3.34.41-2.11-.54-3.6-1.57-3.57-2.25.03-.69,2.78-2.28,3.31-3.42,1.68-3.63,2.3-10.16,2.31-12.58l6.14.16Z\"/>\n        <path class=\"cls-6\" d=\"M55.55,229.92s-.05,0-.07-.02c-.06-.04-.08-.12-.04-.19l1.3-2.11c.04-.06.12-.08.19-.04.06.04.08.12.04.19l-1.3,2.11s-.07.06-.12.06Z\"/>\n        <path class=\"cls-6\" d=\"M54.18,229.54s-.05,0-.07-.02c-.06-.04-.08-.12-.05-.19l1.19-1.94c.04-.06.12-.08.19-.05s.08.12.05.19l-1.19,1.94s-.07.07-.12.07Z\"/>\n        <path class=\"cls-6\" d=\"M52.78,228.98s-.06,0-.08-.03c-.06-.04-.08-.13-.03-.19l1.08-1.52c.04-.06.13-.08.19-.03.06.04.08.13.03.19l-1.08,1.52s-.07.06-.11.06Z\"/>\n        <path class=\"cls-6\" d=\"M51.65,228.25s-.06-.01-.09-.03c-.06-.05-.06-.14-.01-.19l.96-1.07c.05-.06.14-.06.19-.01.06.05.06.14.01.19l-.96,1.07s-.06.05-.1.05Z\"/>\n      </g>\n      <g>\n        <path class=\"cls-7\" d=\"M94.6,110.3c-.21.65-.8,2.15-1.56,2.07-.76-.08-2.07-.6-2.76-.62-.69-.01-1.7-.16-2.04.03-.34.19-2.04,2.66-1.96,2.96.08.3.44.69.92.4.48-.29,1.5-1.79,1.65-1.85s.78.5.78.5c0,0-3.16,4.04-3.15,4.36,0,.32.39.75.8.5.41-.26,3-3.06,3-3.06,0,0-2.65,3.74-2.62,4.08.03.34.42.62.87.28.45-.34,2.76-3.39,3.05-3.44.28-.05.44.11.44.11,0,0-2.09,3.09-2.03,3.31.06.22.45.75,1.01.41.56-.34,2.38-3.34,2.69-3.43s2.18-.16,2.94-1.14c.75-.98,1.99-3.54,1.99-3.54l-4.01-1.94Z\"/>\n        <path class=\"cls-6\" d=\"M87.51,112.79s-.06,0-.08-.03c-.06-.04-.07-.13-.03-.19.26-.36.61-.81.78-.91.39-.22,1.45-.2,2.14-.04.16.04.36.1.6.18.97.32,2.45.79,2.93-.07.4-.72,1.85-4.34,1.86-4.38.03-.07.11-.11.18-.08.07.03.1.11.08.18-.06.15-1.47,3.68-1.88,4.41-.59,1.06-2.19.54-3.25.2-.23-.07-.43-.14-.58-.17-.67-.15-1.65-.15-1.94.02-.06.03-.27.24-.69.83-.03.04-.07.06-.11.06Z\"/>\n      </g>\n      <path class=\"cls-6\" d=\"M54.33,93.75s-.01,0-.02,0c-.07,0-.13-.08-.12-.15.43-3.43,1.42-7.58,2.07-10.32.27-1.14.49-2.04.55-2.42.14-.9.11-1.9.07-2.96-.06-1.82-.12-3.87.65-6.01.03-.07.1-.11.18-.08.07.03.11.1.08.18-.76,2.08-.69,4.11-.64,5.9.03,1.07.07,2.08-.08,3.01-.06.39-.27,1.25-.55,2.44-.65,2.74-1.64,6.87-2.07,10.29,0,.07-.07.12-.14.12Z\"/>\n      <path class=\"cls-6\" d=\"M94.24,74.18s-.09-.02-.12-.07l-2.11-3.54c-.04-.06-.02-.15.05-.19.06-.04.15-.02.19.05l2.11,3.54c.04.06.02.15-.05.19-.02.01-.05.02-.07.02Z\"/>\n      <path class=\"cls-6\" d=\"M103.84,88.65s-.1-.03-.12-.07c-.03-.07,0-.15.06-.18l2.56-1.31c.07-.03.15,0,.18.06.03.07,0,.15-.06.18l-2.56,1.31s-.04.02-.06.02Z\"/>\n    </g>\n    <g>\n      <path class=\"cls-6\" d=\"M78.97,49.16c1.21,0,2.33-.72,3.25-1.51.11-.1.12-.12.23-.22-.15-1.52-.16-2.81-.16-2.81l-11.18-1.79s.15.84.26,2c.72,1.19,1.52,1.92,2.58,2.66,1.46,1.01,3.82,1.66,5.03,1.66Z\"/>\n      <path class=\"cls-2\" d=\"M69.07,36.94c-.08-.4.01-.76,0-1.16-.09-1.6-.56-3.15-.65-4.76-.07-1.23-.13-2.4.07-3.61.14-.87.29-1.76.63-2.58,1.07-2.58,4.5-3.95,7.02-4.53,2.17-.49,4.4-.23,6.48.5,1.87.65,3.88,1.41,4.72,3.34.16.36.25.73.34,1.11.47,1.98.35,3.6.09,5.57-.27,2.01-.39,4.01-.95,5.98-.05.19-.38.38-.5.53-.46.56-1.05.2-1.59.12-.79-.11-1.62-.08-2.42-.11-1.07-.04-2.14-.1-3.21-.13-2.01-.05-4.02-.11-6.02-.16-.77-.02-1.55-.04-2.32-.06-.41-.01-1.02.09-1.41-.04-.07-.02-.19,0-.27,0Z\"/>\n      <path class=\"cls-7\" d=\"M85.16,26.67c-1.86-2.24-3.85-3.06-7.2-3.06s-5.31.91-7.12,3.12c-1.84,2.25-1.02,5.83-.73,8.6.29,2.77-.46,5.12.47,7.34.93,2.22,1.9,3.22,3.36,4.23,1.46,1.01,3.82,1.66,5.03,1.66s2.33-.72,3.25-1.51c1.17-1.01,1.93-1.99,2.87-4.34.93-2.35,1.03-4.45,1.32-7.22.29-2.77.82-6.35-1.24-8.84Z\"/>\n      <path class=\"cls-7\" d=\"M71.07,35.92c-.8-.98-2.61.07-2.37,1.91.25,1.84,1.95,3.7,3.01,3.69,1.06,0,.44-4.27-.64-5.59Z\"/>\n      <path class=\"cls-2\" d=\"M86.29,34.13c0,2.28-.27,5.1-.31,5.1,0,0,.57-1.56.74-2.05.4-1.18.14-1.79.35-2.16.61-1.07.12-2.62-.04-3.75-.18-1.24-.47-2.47-.98-3.61-.85-1.92-2.35-3.35-4.37-3.99-1.11-.35-2.28-.47-3.44-.47-2.65,0-5.43.62-7.19,2.76-1.74,2.11-2.53,5.34-1.74,7.97.13.44.76,2.66,1.12,3.94.03.12.21.09.21-.03-.04-.88-.08-2.15,0-2.74.1-.83.11-1.67.23-2.5.24-1.6.75-3.22,1.97-4.35.49-.46,1.09-.79,1.72-1.04,2.85-1.11,6.07-.98,8.83.34,1.2.57,1.75,1.28,2.11,1.99.46.91.8,2.31.8,4.59Z\"/>\n    </g>\n  </g>\n</svg>";

    var kadinDikdortgenIcon = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" data-name=\"Layer 1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 150 250\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: #e6e6e6;\n      }\n\n      .cls-2 {\n        fill: #404555;\n      }\n\n      .cls-3 {\n        fill: none;\n        stroke: #666;\n        stroke-dasharray: 2.01 2.01;\n        stroke-miterlimit: 10;\n        stroke-width: .5px;\n      }\n\n      .cls-4 {\n        opacity: .4;\n      }\n\n      .cls-5 {\n        fill: #a27242;\n      }\n\n      .cls-6 {\n        fill: #b17b69;\n      }\n\n      .cls-7 {\n        fill: #e4a58a;\n      }\n    </style>\n  </defs>\n  <g>\n    <rect class=\"cls-1\" x=\"35.34\" y=\"54.71\" width=\"79.31\" height=\"114.18\" rx=\"3.41\" ry=\"3.41\"/>\n    <rect class=\"cls-3\" x=\"35.34\" y=\"54.71\" width=\"79.31\" height=\"114.18\" rx=\"3.41\" ry=\"3.41\"/>\n  </g>\n  <g>\n    <path class=\"cls-5\" d=\"M75.34,29.28s3.32-.74,6.41,1.97c2.24,1.96,3.95,5,3.79,8.05-.07,1.35-.51,2.72-.22,4.04.22,1,.83,1.89,1.02,2.9.31,1.72-.67,3.48-.36,5.2.16.88.62,1.88.06,2.58-.21.27-.54.42-.87.52-1.91.62-3.94,0-5.9.04-1.71.03-3.42.04-5.13.05-1.75,0-3.5.01-5.25.01-1.26,0-2.58.37-3.44-.83-.54-.75-.64-1.73-.53-2.64.11-.91.43-1.78.67-2.67.24-.89.4-1.82.2-2.72-.18-.83-.66-1.59-.74-2.44-.11-1.26.69-2.41.92-3.65.13-.72.08-1.46.12-2.19.18-2.85,2.24-5.67,4.61-7.16,1-.63,2.14-1.05,3.33-1.13.39-.03.95.15,1.31.07Z\"/>\n    <g>\n      <path class=\"cls-7\" d=\"M96.14,107.29s12.93-20.94,12.82-23.75c-.11-2.81-9.69-14.24-13.18-18.38-3.14-3.72-5.04-6.22-8.28-6.84-3.19-.61-6.76-.57-7.91-1.73-1.15-1.15-1.09-6.11-1.09-6.11l-8.56-1.19s.63,5.89-.77,7.29c-1.4,1.4-6.2,1.34-9.66,2.68-3.53,1.37-5.27,6.11-6.27,10.61-1.78,7.94-5.49,48.26-5.49,48.26l3.95-.02s7.75-36.34,9.21-42.22c.66-2.66-.71-3.97-.37-4.68,0,0-.69,2.95-.15,7.9.62,5.71,1.41,10.33,1.41,17.05,0,6.27-1.03,12.5-2.39,20.4-.11.62-.33,2.65-.6,5.38-.31,3.21-.28,10.75-.05,14.82.61,10.79,1.62,21.97,1.7,24.25.09,2.29-.12,9.25-.04,18.79s3.22,28.9,3.22,28.9l5.74.05s0-11.36,1.29-25.89c.44-4.91-.15-10.31.17-15.64.13-2.17,1.09-4.98,1.31-7.14.75-7.38,1.67-14.47,2.05-22.68.13-2.77.09-11.92.23-13.55.23-2.62.72-4.25.68-4.57.1.91.8,2.49,1.03,4.6.24,2.25,1.85,9.83,3.7,16.91,1.85,7.09,7.16,18.57,7.98,23.36.37,2.13,1.32,10.26,1.99,15.14,1.42,10.39,6.16,27.14,6.16,27.14l6.76-.16s-1.31-18.62-1.42-28.69c-.1-9.86-.49-15.59-.62-17.88-.12-2.29-1.92-12.99-3.9-23.22-1.85-9.52-4.44-17.75-4.93-20.14-1.97-9.52-2.38-12.91-2.5-19.06-.12-6.32.81-12.97.8-20.17,0-4.85-.34-5.58-.34-5.58.72,1.65,10.83,12.53,10.83,12.53l-8,21.59,3.5,1.59Z\"/>\n      <path class=\"cls-2\" d=\"M61.86,94.4c0-7.37-2.09-11.32-2.09-16.79,0-2.91.43-5.79.68-6.38.25-.57,9.66-2.02,16.81-1.9,7.15.12,12.11,1.8,12.55,2.24.5.5.67,3.06.67,5.96,0,5.32-1.42,10.43-1.2,18.31.18,6.36,2.03,11.92,1.83,12.53.91.46.49,5.36.61,7.29.05.92-3.39,1.68-7.16,4.33-4.1,2.88-7.19,6.9-7.65,7.12s-1.69.65-2.26.46c-.57-.19-4.65-4.74-8.1-7.35-3.67-2.77-6.95-5.04-6.84-5.58.23-1.14,2.15-11.34,2.15-20.25Z\"/>\n      <path class=\"cls-7\" d=\"M92.64,105.7s-.61,1.71-1.22,2.06c-.61.35-2.57,1.36-3.04,1.71s-1.71,1.22-1.89,1.45c-.18.22-1.73,2.4-1.49,2.83.24.43.65.45.92.18s1.45-2.2,1.69-2.32c.24-.12.57-.02.57.39,0,0-1.28,2.26-1.47,2.63s-.84,1.34-.67,1.69c.16.35.63.55.88.26.24-.29,2.14-3.32,2.32-3.56.18-.24.31.02.12.26-.18.24-.35.59-.45,1-.1.41-.9,2.34-.94,2.63-.04.29.16.69.63.45.47-.24.9-1.32,1.04-1.67.14-.35.92-2.4,1.3-2.3.39.1-.45,1.89-.59,2.18-.14.29-.22.71.12.86.35.14,1.02-.92,1.18-1.26.16-.35.61-1.49,1.06-1.89s2.1-2.75,2.34-3.48c.24-.73.55-1.83,1.08-2.49l-3.5-1.59Z\"/>\n      <g>\n        <path class=\"cls-7\" d=\"M69.38,208.78s-.13,1.25-.13,3.12c0,1.42.22,2.27.22,3.11s.25,2.64.4,3.12c.63,1.99,1.59,3.18,1.26,4.04-.38.97-2.56.8-4.96.51-2.75-.33-4.61-.57-4.79-1.6-.17-.97.83-2.37,1.53-3.41.7-1.04.72-8.96.72-8.96l5.74.05Z\"/>\n        <path class=\"cls-6\" d=\"M69.07,222.95c-.07,0-.13-.05-.14-.12l-.24-1.84c0-.07.04-.14.12-.15.08,0,.14.04.15.12l.24,1.84c0,.07-.04.14-.12.15,0,0-.01,0-.02,0Z\"/>\n        <path class=\"cls-6\" d=\"M66.27,222.7s-.01,0-.02,0c-.07-.01-.13-.08-.12-.16l.24-1.64c.01-.07.08-.12.16-.12.07.01.13.08.12.16l-.24,1.64c-.01.07-.07.12-.13.12Z\"/>\n        <path class=\"cls-6\" d=\"M64.03,222.45s-.03,0-.04,0c-.07-.02-.11-.1-.09-.17l.45-1.54c.02-.07.1-.11.17-.09.07.02.11.1.09.17l-.45,1.54c-.02.06-.07.1-.13.1Z\"/>\n        <path class=\"cls-6\" d=\"M62.26,222.02s-.03,0-.04,0c-.07-.02-.11-.1-.09-.17l.42-1.25c.02-.07.1-.11.17-.09.07.02.11.1.09.17l-.42,1.25c-.02.06-.07.09-.13.09Z\"/>\n      </g>\n      <path class=\"cls-6\" d=\"M71.43,60.13s-.02,0-.03,0l-6.8-1.48c-.07-.02-.12-.09-.1-.16.02-.07.09-.12.16-.1l6.8,1.48c.07.02.12.09.1.16-.01.06-.07.11-.13.11Z\"/>\n      <path class=\"cls-6\" d=\"M76.75,60.13c-.06,0-.12-.04-.13-.11-.02-.07.03-.15.1-.16l6.46-1.44c.07-.02.15.03.16.1.02.07-.03.15-.1.16l-6.46,1.44s-.02,0-.03,0Z\"/>\n      <path class=\"cls-6\" d=\"M68.57,168.27s-.06,0-.08-.03c-.06-.05-.07-.13-.03-.19l2.28-3.05c.05-.06.13-.07.19-.03.06.05.07.13.03.19l-2.28,3.05s-.07.06-.11.06Z\"/>\n      <path class=\"cls-6\" d=\"M62.32,167.26c-.05,0-.11-.03-.13-.09l-1.51-3.7c-.03-.07,0-.15.07-.18.07-.03.15,0,.18.07l1.51,3.7c.03.07,0,.15-.07.18-.02,0-.03.01-.05.01Z\"/>\n      <path class=\"cls-6\" d=\"M89.81,71.71s-.01,0-.02,0c-.07-.01-.13-.08-.11-.16l.5-3.27c.01-.07.08-.13.16-.11.07.01.13.08.11.16l-.5,3.27c-.01.07-.07.12-.13.12Z\"/>\n      <path class=\"cls-6\" d=\"M60.45,71.37c-.05,0-.1-.03-.12-.08l-1.27-2.72c-.03-.07,0-.15.07-.18.07-.03.15,0,.18.07l1.27,2.72c.03.07,0,.15-.07.18-.02,0-.04.01-.06.01Z\"/>\n      <g>\n        <path class=\"cls-7\" d=\"M47.74,118.15s-.01,3.49-.15,4.52c-.14,1.03-2.05,4.45-2.06,4.79,0,.34.48,3.56.71,3.95.23.39,1.62,1.59,1.87,1.75s1.14.76,1.39.62c.25-.14.22-.27.22-.27,0,0,.43.3.63.06.2-.24.06-.78-.14-.97-.2-.19-1.17-.75-1.17-.75,0,0,1.85.58,2.24.41.39-.16.22-.69,0-.87-.21-.18-1.1-.35-1.1-.35l.19-.58s.6.06.69-.3c.1-.36-.55-.65-.55-.65,0,0-.16-1.44.33-2.21.49-.78.62-1.92.37-2.71s-.45-1.81-.17-3.1c.2-.89.65-3.37.65-3.37l-3.95.02Z\"/>\n        <path class=\"cls-6\" d=\"M49.41,131.78c-.13,0-.26-.03-.38-.08-.46-.21-.54-1.76-.39-2.44.16-.7-.06-2.86-.07-2.89,0-.08.05-.14.12-.15.07,0,.14.05.15.12,0,.09.23,2.23.06,2.98-.17.74,0,2.02.23,2.13.28.13.67.07.91-.47.03-.07.11-.1.18-.07.07.03.1.11.07.18-.23.51-.58.68-.9.68Z\"/>\n        <path class=\"cls-6\" d=\"M49.71,133.64c-.07,0-.13-.05-.14-.12-.02-.15-.1-.59-.22-.75-.07-.1-.33-.27-.53-.4-.22-.15-.42-.27-.5-.38-.03-.03-.07-.08-.11-.12-.2-.22-.54-.58-.68-1.15-.02-.07.03-.15.1-.17.08-.02.15.03.17.1.13.5.42.82.62,1.03.05.05.09.1.12.14.06.07.26.2.44.32.26.17.5.33.61.47.18.25.26.81.27.88,0,.07-.04.14-.12.15,0,0-.01,0-.02,0Z\"/>\n        <path class=\"cls-6\" d=\"M49.04,131.99s-.06-.01-.09-.03c-.14-.13-.87-.78-.96-1.11-.08-.29-.43-1.11-.43-1.12-.03-.07,0-.15.07-.18.07-.03.15,0,.18.07.01.03.36.84.44,1.15.05.18.54.68.87.98.06.05.06.14.01.19-.03.03-.06.05-.1.05Z\"/>\n        <path class=\"cls-6\" d=\"M50.37,130.6s-.01,0-.02,0c-.07-.01-.13-.08-.11-.16l.14-.95c.01-.07.08-.12.16-.11.07.01.13.08.11.16l-.14.95c-.01.07-.07.12-.13.12Z\"/>\n      </g>\n      <g>\n        <path class=\"cls-7\" d=\"M95.97,206.47c.67,2.9,2.62,9.03,2.47,10.5-.11,1.09-1.14,3.9-.38,5.16.63,1.06,2.48.41,4.15.55,1.67.14,2.89.61,4.23.68,1.61.08,5.73.66,6.21-.17.51-.89-1.07-1.31-2.07-1.99-.86-.58-2.9-1.26-4.01-1.8-1.12-.55-2.23-1.05-2.5-1.45-.78-1.15-1.33-11.64-1.33-11.64l-6.76.16Z\"/>\n        <path class=\"cls-6\" d=\"M112.18,223.57s-.05,0-.07-.02c-.07-.04-.09-.12-.05-.19.03-.05.03-.09.02-.14-.11-.29-.93-.61-1.72-.91-.25-.1-.52-.2-.78-.31-.07-.03-.1-.11-.07-.18.03-.07.11-.1.18-.07.26.11.52.21.77.3.97.37,1.73.67,1.88,1.08.04.12.03.25-.03.37-.02.04-.07.07-.12.07Z\"/>\n        <path class=\"cls-6\" d=\"M112.6,223.27s-.04,0-.07-.02c-.06-.04-.09-.12-.06-.18,0,0,.02-.07-.03-.19-.11-.23-.54-.71-2.21-1.26-.07-.02-.11-.1-.09-.17.02-.07.1-.11.17-.09,1.37.45,2.19.95,2.39,1.44.09.23.02.37,0,.39-.02.05-.07.07-.12.07Z\"/>\n      </g>\n      <path class=\"cls-6\" d=\"M98.64,165.32s-.05,0-.08-.02c-.06-.04-.08-.13-.04-.19l2-3.03c.04-.06.13-.08.19-.04.06.04.08.13.04.19l-2,3.03s-.07.06-.11.06Z\"/>\n      <path class=\"cls-6\" d=\"M87.9,163.63s0,0-.01,0c-.08,0-.13-.07-.13-.15l.26-3.34c0-.08.06-.13.15-.13.08,0,.13.07.13.15l-.26,3.34c0,.07-.07.13-.14.13Z\"/>\n    </g>\n    <g>\n      <path class=\"cls-6\" d=\"M70.03,50.59c1.7,1.51,3.63,2.86,6.23,2.86,1.21,0,2.3-.96,2.3-.96l-.04-2.56-8.59-.51.09,1.18Z\"/>\n      <path class=\"cls-7\" d=\"M80.61,31.99c-2.35-2.03-4.62-2.02-5.27-2.02s-2.92,0-5.27,2.02c-2.27,1.96-2.98,4.76-2.76,8.41.22,3.65.58,7.15,2.52,9.3,2.14,2.35,4.83,3.26,6.34,3.26s3.31-1.26,4.6-3.32c1.28-2.06,2.37-5.58,2.59-9.23.22-3.65-.49-6.46-2.76-8.41Z\"/>\n      <path class=\"cls-7\" d=\"M81.99,41.65c.71-.86,2.31.06,2.09,1.68-.22,1.62-1.72,3.26-2.66,3.26-.94,0-.39-3.78.57-4.94Z\"/>\n      <path class=\"cls-7\" d=\"M68.79,41.65c-.71-.86-2.31.06-2.09,1.68.22,1.62,1.72,3.26,2.66,3.26.94,0,.39-3.78-.57-4.94Z\"/>\n      <path class=\"cls-5\" d=\"M70.03,31.85c2.37-2.05,4.67-2.04,5.32-2.04s2.95,0,5.32,2.04c2.29,1.98,3.01,4.81,2.79,8.5-.02.35.17,1.27.12,1.26-3.2-.98-2.5-4.32-4.01-6.01-1.53-1.71-3.34-.93-3.34-.93-2.14-.55-3.63.7-4.63,4.27-1.02,3.65-4.84,2.56-4.84,2.56l.54-.26c-.03-.29-.05-.59-.07-.88-.22-3.69.49-6.52,2.79-8.5Z\"/>\n      <path class=\"cls-4\" d=\"M82.75,37.26c-.06,0-.12-.04-.13-.11,0-.02-.57-2.49-2.2-3.95-1.6-1.44-4.16-.74-4.18-.73-.07.02-.15-.02-.17-.09-.02-.07.02-.15.09-.17.11-.03,2.72-.76,4.44.79,1.69,1.52,2.26,3.99,2.28,4.1.02.07-.03.15-.1.16-.01,0-.02,0-.03,0Z\"/>\n      <path class=\"cls-4\" d=\"M71.47,31.36s-.08-.02-.11-.06c-.04-.06-.03-.15.03-.19,1.63-1.16,4-.62,4.1-.59.07.02.12.09.1.16-.02.07-.09.12-.16.1-.02,0-2.35-.54-3.88.55-.02.02-.05.03-.08.03Z\"/>\n      <path class=\"cls-4\" d=\"M67.45,41.28c-.06,0-.11-.04-.13-.1-.02-.07.02-.15.09-.17,2.9-.93,3.66-7.06,3.67-7.12,0-.08.08-.13.15-.12.07,0,.13.08.12.15-.03.26-.79,6.37-3.85,7.35-.01,0-.03,0-.04,0Z\"/>\n      <path class=\"cls-4\" d=\"M66.34,37.64s-.02,0-.03,0c-.07-.01-.12-.09-.11-.16.4-2,2.14-3.37,2.22-3.43.06-.05.15-.04.19.02.05.06.04.15-.02.19-.02.01-1.74,1.37-2.11,3.26-.01.06-.07.11-.13.11Z\"/>\n      <path class=\"cls-4\" d=\"M83.78,52.98c-.06,0-.12-.04-.13-.1-.69-2.64.45-5.15.5-5.26.03-.07.11-.1.18-.07.07.03.1.11.07.18-.01.03-1.15,2.53-.49,5.07.02.07-.02.15-.1.17-.01,0-.02,0-.03,0Z\"/>\n      <path class=\"cls-4\" d=\"M67.82,52.98s-.03,0-.05,0c-.07-.02-.11-.1-.08-.17.39-1.11.45-2.4.45-2.41,0-.08.06-.13.14-.13.08,0,.13.07.13.14,0,.05-.06,1.34-.46,2.49-.02.06-.07.09-.13.09Z\"/>\n    </g>\n  </g>\n</svg>";

    var kadinArmutIcon = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" data-name=\"Layer 1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 150 250\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: #404555;\n      }\n\n      .cls-2 {\n        fill: #6e3735;\n      }\n\n      .cls-3 {\n        fill: #6f6f6f;\n        stroke: #666;\n        stroke-dasharray: 2;\n        stroke-miterlimit: 10;\n        stroke-width: .5px;\n      }\n\n      .cls-4 {\n        opacity: .4;\n      }\n\n      .cls-5 {\n        fill: #b17b69;\n      }\n\n      .cls-6 {\n        fill: #e4a58a;\n      }\n    </style>\n  </defs>\n  <path class=\"cls-3\" d=\"M81.6,54.28l47.47,102.23c2.24,4.82-1.28,10.33-6.6,10.33H27.53c-5.31,0-8.83-5.51-6.6-10.33l47.47-102.23c2.61-5.61,10.58-5.61,13.19,0Z\"/>\n  <g>\n    <g>\n      <path class=\"cls-6\" d=\"M51.27,95.17c1.95-3.24,8.29-21.36,8.63-22,0,0-1.6-1.38-1.95,3.46-.52,7.18,1,13.24-.38,19.42-1.3,5.82-4.8,7.83-6.77,17.34-.44,2.12-.3,8.95.33,15.39,1.1,11.23,6.45,30.85,6.75,33.26.36,2.86-1.94,10.47-2.87,16.71-.93,6.24,1.23,24.69,1.23,24.69l6.49.06s4.13-19.75,6.67-31.76c.85-4.02,2.01-6.61,2.13-8.05.36-4.47,2.72-25.68,3-30.81.28-5.13-1.7-13.22-1.6-14.13-.04.32-.41,9.51.11,14.78.69,6.98.95,13.24,1.82,22.03.21,2.15.62,9.7.83,11.85.53,5.31.36,10.58.8,15.49,1.31,14.52,2.83,25.89,2.83,25.89l5.74-.05s2.55-19.37,2.63-28.9c.08-9.53-1.06-16.73-1.06-19.02s5.31-16.06,5.7-28.88c.23-7.56-1.28-13.99-1.52-15.34-1.37-7.9-6.34-14.42-6.67-19.88-.33-5.69.6-10.82,1.62-16.48.89-4.9.31-7.29.31-7.29.4,1.03-.22.85.1,5.03,0,0-.76,15.87-.22,18.87.53,3,8.57,22.54,8.57,22.54l4.02-1.34-4.76-22.18s.85-18.3-.92-28.05c-.66-3.63-2.22-5.99-5.65-7.6-3.36-1.58-6.31-1.64-7.61-3.14s-.76-6.53-.76-6.53l-8.12-.22s-.29,4.95-1.52,6.01c-1.23,1.07-2.6.93-5.82,1.31-3.28.39-6.78,1.03-8.94,3.8-3.33,4.28-9.26,28.53-8.99,32.67.27,4.14,3.52,4.86,5.8,1.08Z\"/>\n      <path class=\"cls-5\" d=\"M84.28,164.81s-.05,0-.07-.02c-.06-.04-.08-.12-.04-.19l2.37-3.86c.04-.06.12-.08.19-.04.06.04.08.12.04.19l-2.37,3.86s-.07.07-.12.07Z\"/>\n      <path class=\"cls-5\" d=\"M79.35,167.28c-.05,0-.1-.03-.12-.08l-1.92-3.97c-.03-.07,0-.15.06-.18.07-.03.15,0,.18.06l1.92,3.97c.03.07,0,.15-.06.18-.02,0-.04.01-.06.01Z\"/>\n      <path class=\"cls-5\" d=\"M64.56,165.5c-.05,0-.11-.03-.13-.09l-1.51-3.84c-.03-.07,0-.15.08-.18.07-.03.15,0,.18.08l1.51,3.84c.03.07,0,.15-.08.18-.02,0-.03,0-.05,0Z\"/>\n      <path class=\"cls-5\" d=\"M69.9,164.26s-.03,0-.05-.01c-.07-.03-.1-.11-.08-.18l1.78-4.38c.03-.07.11-.1.18-.08.07.03.1.11.08.18l-1.78,4.38c-.02.05-.07.09-.13.09Z\"/>\n      <path class=\"cls-1\" d=\"M58.73,70.6c-.51.46-1.73,3.18-1.91,6.08-.16,2.52.48,4.6.82,6.01.33,1.39,26.88,2.76,27.6,1.78.35-.47,1.84-2.51,2.36-5.84.45-2.88-.32-6.53-3.94-7.97-2.66-1.05-5.4.32-7.93.18-2.74-.15-4.24-1.73-8.5-1.94-4.21-.21-8.24,1.45-8.5,1.7Z\"/>\n      <path class=\"cls-1\" d=\"M74.77,127.81c2.03-.95,3.78-4.17,7.42-7.21,3.7-3.08,8.56-4.54,8.49-5.02-.17-1.15-.84-6.39-2.32-6.84-.74-.23-9.87,1.26-17.2,1.28-7.34.03-18-3.41-18.45-3.19-.91.46-2.23,4.7-2.05,7.6.05.92,6.41,3.46,11.3,5.8,5.71,2.73,9.61,6.79,11.77,7.63.39.15.66.13,1.05-.06Z\"/>\n      <g>\n        <path class=\"cls-6\" d=\"M79.35,208.78s.13,1.25.13,3.12c0,1.42-.22,2.27-.22,3.11s-.25,2.64-.4,3.12c-.63,1.99-1.59,3.18-1.26,4.04.38.97,2.56.8,4.96.51,2.75-.33,4.61-.57,4.79-1.6.17-.97-.83-2.37-1.53-3.41-.7-1.04-.72-8.96-.72-8.96l-5.74.05Z\"/>\n        <path class=\"cls-5\" d=\"M79.56,222.93s-.03,0-.04,0c-.07-.02-.11-.1-.09-.17l.55-1.87c.02-.07.1-.11.17-.09.07.02.11.1.09.17l-.55,1.87c-.02.06-.07.1-.13.1Z\"/>\n        <path class=\"cls-5\" d=\"M81.87,222.7s-.02,0-.03,0c-.07-.02-.12-.09-.11-.16l.35-1.64c.02-.07.09-.12.16-.11.07.02.12.09.11.16l-.35,1.64c-.01.06-.07.11-.13.11Z\"/>\n        <path class=\"cls-5\" d=\"M84.15,222.36s0,0-.01,0c-.08,0-.13-.07-.12-.15l.12-1.3c0-.08.08-.13.15-.12.08,0,.13.07.12.15l-.12,1.3c0,.07-.07.12-.14.12Z\"/>\n        <path class=\"cls-5\" d=\"M86.25,221.99c-.07,0-.12-.05-.13-.11l-.2-1.23c-.01-.07.04-.14.11-.16.07-.01.15.04.16.11l.2,1.23c.01.07-.04.14-.11.16,0,0-.02,0-.02,0Z\"/>\n      </g>\n      <path class=\"cls-5\" d=\"M73.71,100.85c-.06,0-.11-.03-.13-.09l-.76-2.13c-.03-.07.01-.15.08-.17.07-.03.15.01.17.08l.76,2.13c.03.07-.01.15-.08.17-.02,0-.03,0-.05,0Z\"/>\n      <path class=\"cls-5\" d=\"M71.09,59.99s-.03,0-.04,0l-6.68-1.96c-.07-.02-.11-.1-.09-.17.02-.07.1-.11.17-.09l6.68,1.96c.07.02.11.1.09.17-.02.06-.07.1-.13.1Z\"/>\n      <path class=\"cls-5\" d=\"M76.39,60.37c-.07,0-.12-.05-.13-.12-.01-.07.04-.14.11-.16l6.54-.98c.07,0,.14.04.16.11.01.07-.04.14-.11.16l-6.54.98s-.01,0-.02,0Z\"/>\n      <path class=\"cls-5\" d=\"M86.92,73.68c-.06,0-.12-.04-.13-.11l-.62-3.08c-.01-.07.03-.15.11-.16.07-.02.15.03.16.11l.62,3.08c.01.07-.03.15-.11.16,0,0-.02,0-.03,0Z\"/>\n      <path class=\"cls-5\" d=\"M58.73,70.73s-.02,0-.03,0c-.07-.02-.12-.09-.11-.16l.37-1.74c.02-.07.09-.12.16-.11.07.02.12.09.11.16l-.37,1.74c-.01.06-.07.11-.13.11Z\"/>\n      <g>\n        <path class=\"cls-6\" d=\"M56.25,203.44s.5,3.25.63,5.56c.11,1.99-.32,3.71-.81,5.03-.48,1.32-1.18,1.96-1.33,3.04-.16,1.13.9,1.64.9,1.64,0,0,1.16,2.23,1.64,2.79.73.85,1.14,1.25,3.11,1.28,2.18.03,3.89-.56,4.04-1.23.15-.67-2.08-2.93-2.29-4.17-.67-3.94.2-10.66.59-13.88l-6.49-.06Z\"/>\n        <path class=\"cls-5\" d=\"M59.57,222.78c-.06,0-.12-.04-.13-.11l-.35-1.5c-.02-.07.03-.15.1-.16.08-.02.15.03.16.1l.35,1.5c.02.07-.03.15-.1.16-.01,0-.02,0-.03,0Z\"/>\n        <path class=\"cls-5\" d=\"M60.99,222.78c-.06,0-.11-.04-.13-.1l-.57-1.84c-.02-.07.02-.15.09-.17.07-.02.15.02.17.09l.57,1.84c.02.07-.02.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n        <path class=\"cls-5\" d=\"M62.48,222.6c-.06,0-.11-.03-.13-.09l-.78-2.07c-.03-.07,0-.15.08-.18.07-.03.15,0,.18.08l.78,2.07c.03.07,0,.15-.08.18-.02,0-.03,0-.05,0Z\"/>\n        <path class=\"cls-5\" d=\"M63.77,222.19c-.05,0-.1-.03-.12-.08l-.96-2.06c-.03-.07,0-.15.07-.18.07-.03.15,0,.18.07l.96,2.06c.03.07,0,.15-.07.18-.02,0-.04.01-.06.01Z\"/>\n      </g>\n      <path class=\"cls-5\" d=\"M73.86,141.82h-.27s.32-8.53.51-13.7c0-.08.06-.13.14-.13.08,0,.13.07.13.14-.19,5.17-.51,13.69-.51,13.69Z\"/>\n      <g>\n        <path class=\"cls-6\" d=\"M98.56,118.03s.91,3.37,1.31,4.33c.4.96,3.13,3.78,3.22,4.1.09.32.45,3.56.33,4-.12.43-1.15,1.95-1.36,2.18-.2.22-.91,1.03-1.18.96-.27-.07-.28-.21-.28-.21,0,0-.34.4-.6.22-.26-.18-.26-.74-.11-.98.15-.23.94-1.02.94-1.02,0,0-1.64,1.03-2.06.97-.41-.06-.39-.61-.23-.84.16-.23.98-.62.98-.62l-.33-.51s-.56.22-.75-.11c-.19-.32.36-.77.36-.77,0,0-.22-1.43-.89-2.05-.67-.63-1.09-1.7-1.06-2.52.03-.82.2-1.87-.62-2.9-.83-1.03-1.7-2.88-1.7-2.88l4.02-1.34Z\"/>\n        <path class=\"cls-5\" d=\"M100.25,131.67c-.27,0-.57-.13-.84-.46-.05-.06-.04-.16.02-.21.06-.05.16-.04.21.02.37.45.75.4.98.21.17-.14.05-1.39-.32-2.1-.36-.68-.69-2.81-.71-2.9-.01-.08.04-.16.12-.17.08-.01.16.04.17.12,0,.02.34,2.17.68,2.8.32.62.64,2.15.25,2.47-.15.13-.35.2-.56.2Z\"/>\n        <path class=\"cls-5\" d=\"M100.61,133.53c-.07,0-.14-.05-.15-.13,0-.06-.08-.64.03-.92.06-.16.26-.38.47-.61.14-.16.3-.34.34-.42.02-.05.05-.1.08-.17.14-.25.34-.64.33-1.15,0-.08.06-.15.15-.15.08,0,.15.06.15.15,0,.58-.23,1.03-.37,1.29-.03.06-.06.11-.07.15-.05.12-.21.3-.39.5-.16.18-.37.41-.41.52-.06.16-.04.56-.01.78.01.08-.05.16-.13.17,0,0-.01,0-.02,0Z\"/>\n        <path class=\"cls-5\" d=\"M100.83,131.75s-.06,0-.08-.02c-.07-.05-.09-.14-.04-.21.24-.37.59-.98.59-1.16,0-.32.13-1.19.13-1.23.01-.08.09-.14.17-.13.08.01.14.09.13.17,0,0-.13.89-.13,1.19,0,.34-.53,1.16-.64,1.32-.03.04-.08.07-.12.07Z\"/>\n        <path class=\"cls-5\" d=\"M99.19,130.76c-.06,0-.11-.03-.14-.09l-.38-.88c-.03-.08,0-.16.08-.2.08-.03.16,0,.2.08l.38.88c.03.08,0,.16-.08.2-.02,0-.04.01-.06.01Z\"/>\n      </g>\n      <g>\n        <path class=\"cls-6\" d=\"M46.39,96.82c1.64,2.16,5.57-.36,5.03-4.57-1-7.85-6.84-21.79-7.92-24.2l-4.9,1.34s4.42,23.01,7.79,27.43Z\"/>\n        <path class=\"cls-5\" d=\"M49.7,85.91c-.06,0-.12-.05-.13-.11-.4-2.16-1.54-5.91-1.55-5.94-.02-.07.02-.15.09-.17.07-.02.15.02.17.09.01.04,1.15,3.8,1.56,5.97.01.07-.03.15-.11.16,0,0-.02,0-.03,0Z\"/>\n      </g>\n      <g>\n        <path class=\"cls-6\" d=\"M43.5,68.04s-1.81-4.34-1.84-5.04c-.03-.7-.23-1.52-.72-2.09-.48-.57-2.05-1.76-2.15-2.43s-.08-1.31-.53-1.4c-.45-.08-.78-.19-1.2.08,0,0-.72-.34-1.11-.28s-.73.39-.73.39c0,0-.53-.07-.82.03-.29.1-.4.32-.4.32,0,0-.43-.17-.79-.1-.36.07-.57.36-.57.36,0,0-.8-.41-1.2-.14-.4.28-.24.81,0,.91.23.1.62.27,1.16,1.13,0,0,.17,1.73.38,2.12s3.5,1.48,3.95,1.87c.45.39.79.88,1.01,2.29.22,1.42.68,3.31.68,3.31l4.9-1.34Z\"/>\n        <path class=\"cls-5\" d=\"M37.13,59.33c-.08,0-.15-.07-.16-.15l-.08-2.01c0-.09.06-.16.15-.16.08,0,.16.06.16.15l.08,2.01c0,.09-.06.16-.15.16h0Z\"/>\n        <path class=\"cls-5\" d=\"M35.51,59.7c-.08,0-.15-.06-.16-.14l-.29-2.27c-.01-.09.05-.17.14-.18.08-.01.17.05.18.14l.29,2.27c.01.09-.05.17-.14.18,0,0-.01,0-.02,0Z\"/>\n        <path class=\"cls-5\" d=\"M33.96,60.21h0c-.09,0-.16-.07-.15-.16l.04-2.42c0-.09.08-.15.16-.15.09,0,.16.07.15.16l-.04,2.42c0,.09-.07.15-.16.15Z\"/>\n        <path class=\"cls-5\" d=\"M32.59,59.95c-.08,0-.15-.06-.16-.14-.11-1.23-.07-1.92.11-2.05.07-.05.17-.03.22.04.04.06.04.14-.01.19-.02.04-.14.36,0,1.79,0,.09-.06.16-.14.17,0,0,0,0-.01,0Z\"/>\n      </g>\n    </g>\n    <g>\n      <path class=\"cls-2\" d=\"M76.31,29.67c-.81-.05-1.63,0-2.43.12-3.37.55-6.54,2.66-7.91,5.83-.7,1.61-1.05,3.36-1.22,5.1-.09.9-.13,1.83.12,2.7.31,1.08,1.03,1.98,1.74,2.86.63.78,1.44,1.35,2.18,2.01,2.03,1.78,5.66,1.56,8.16,1.6.89.02,2.06.17,2.91-.15,2.15-.8,4.08-2.59,5.07-4.64.2-.42.37-.85.5-1.29,1.05-3.42.1-7.26-1.91-10.15-1.06-1.53-2.06-2.61-3.83-3.28-1.09-.41-2.23-.66-3.39-.73Z\"/>\n      <path class=\"cls-5\" d=\"M70.67,51.28c1.29,1.26,2.86,2.09,3.91,2.16,1.08.08,2.77-.45,4.17-1.47l.12-1.66-8.12-.22-.08,1.18Z\"/>\n      <path class=\"cls-6\" d=\"M81.35,32.51c-2.2-2.19-4.46-2.34-5.11-2.39-.65-.05-2.91-.21-5.4,1.64-2.4,1.79-3.31,4.54-3.35,8.2-.04,3.66.46,6.73,1.73,9.02,1.27,2.29,3.88,3.96,5.39,4.07s4.23-.96,5.66-2.93,2.76-5.4,3.24-9.02-.03-6.47-2.16-8.59Z\"/>\n      <path class=\"cls-6\" d=\"M82.6,42.29c.77-.81,2.3.22,1.97,1.83-.33,1.61-1.95,3.13-2.88,3.06-.93-.07-.12-3.79.92-4.89Z\"/>\n      <path class=\"cls-6\" d=\"M68.38,41.28c-.65-.91-2.31-.1-2.2,1.53.1,1.64,1.49,3.38,2.42,3.44s.65-3.74-.22-4.97Z\"/>\n      <path class=\"cls-2\" d=\"M81.41,32.42c-2.22-2.21-4.51-2.36-5.16-2.41-.65-.05-2.94-.22-5.45,1.66-1.25.93-1.82,2.17-2.71,3.38-.92,1.24-1.78,2.68-1.75,4.28.02,1.01.59,1.79,1.65,1.76,1.21-.03,2.26-.86,3.06-1.77.35-.39.67-.81,1.06-1.16.52-.48,1.16-.83,1.84-1.03.64-.18,1.32-.23,1.92-.51.63-.29,1.14-.84,1.39-1.49.05.91.5,1.75.93,2.55.22.41.45.83.75,1.18.3.35.66.64,1.02.92.89.7,1.99,1.67,3,2.16.34.17.54.04.88-.11.42-.19.55-.73.59-1.19.12-1.57-.16-3.19-.87-4.59-.66-1.3-1.07-2.57-2.14-3.63Z\"/>\n      <path class=\"cls-2\" d=\"M82.5,27.74c-1.04-.35-2.26-.22-3.07.51-.35.31-.6.71-.84,1.11-.13.21-.27.42-.32.67-.13.53.13,1.08.46,1.52.82,1.12,2.22,2.09,3.59,2.34.34.06.69.09,1.02,0,.92-.24,1.57-1,1.71-1.93.26-1.67-.74-3.45-2.3-4.11-.08-.04-.17-.07-.25-.1Z\"/>\n      <path class=\"cls-4\" d=\"M77.27,35.2s-.03,0-.05,0c-.07-.03-.11-.11-.08-.18.32-.83.45-1.74.38-2.63,0-.08.05-.14.13-.15.08,0,.14.05.15.13.07.93-.06,1.88-.4,2.75-.02.05-.07.09-.13.09Z\"/>\n      <path class=\"cls-4\" d=\"M68.35,34.76s-.05,0-.07-.02c-.06-.04-.09-.12-.05-.19.48-.8,1.23-1.49,2.25-2.03.92-.49,1.92-.8,2.81-1.08.07-.02.15.02.17.09.02.07-.02.15-.09.17-.88.27-1.87.58-2.76,1.06-.97.52-1.69,1.17-2.14,1.93-.03.04-.07.07-.12.07Z\"/>\n      <path class=\"cls-4\" d=\"M67.21,41.03s-.04,0-.06-.01c-.07-.03-.1-.11-.07-.18.69-1.47,1.47-3.13,2.89-4.19.06-.05.15-.03.19.03.05.06.03.15-.03.19-1.36,1.02-2.12,2.65-2.8,4.09-.02.05-.07.08-.12.08Z\"/>\n      <path class=\"cls-4\" d=\"M82.82,33.17s-.1-.03-.12-.07c-.2-.39-.41-.79-.73-1.09-.16-.14-.35-.26-.54-.38l-1.54-.95c-.06-.04-.08-.12-.04-.19.04-.06.12-.08.19-.04l1.54.95c.2.12.4.24.58.41.36.32.59.77.79,1.16.03.07,0,.15-.06.18-.02.01-.04.02-.06.02Z\"/>\n      <path class=\"cls-4\" d=\"M83.85,39.69s-.04,0-.07-.02c-.24-.13-.5-.24-.75-.34-.31-.13-.63-.26-.93-.44-1.17-.72-1.73-2.06-2.25-3.49-.03-.07.01-.15.08-.18.07-.03.15.01.18.08.5,1.38,1.05,2.67,2.14,3.35.28.17.57.29.89.42.26.11.52.22.77.36.07.04.09.12.05.19-.02.05-.07.07-.12.07Z\"/>\n      <path class=\"cls-4\" d=\"M83.67,36.91s-.07-.01-.09-.04c-.4-.38-.68-.89-.78-1.43-.01-.07.04-.15.11-.16.07-.01.15.04.16.11.09.49.34.94.7,1.28.05.05.06.14,0,.19-.03.03-.06.04-.1.04Z\"/>\n    </g>\n  </g>\n</svg>";

    var kadinCilekIcon = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" data-name=\"Layer 1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 150 250\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: #404555;\n      }\n\n      .cls-2 {\n        fill: #f6c895;\n      }\n\n      .cls-3 {\n        fill: #6f6f6f;\n        stroke: #666;\n        stroke-dasharray: 2;\n        stroke-miterlimit: 10;\n        stroke-width: .5px;\n      }\n\n      .cls-4 {\n        opacity: .2;\n      }\n\n      .cls-5 {\n        fill: #b17b69;\n      }\n\n      .cls-6 {\n        fill: #e4a58a;\n      }\n    </style>\n  </defs>\n  <path class=\"cls-3\" d=\"M69.51,164.63L20.14,58.3c-1.86-4.01,1.07-8.61,5.49-8.61h98.74c4.43,0,7.36,4.59,5.49,8.61l-49.37,106.33c-2.17,4.67-8.81,4.67-10.99,0Z\"/>\n  <path class=\"cls-6\" d=\"M89.89,71.71c.12.72.31,2.26.26,4.45-.04-.17-.08-.33-.12-.49-.53-2.13-.14-3.24-.14-3.96Z\"/>\n  <path class=\"cls-2\" d=\"M75.88,29.28c1.07-.23,2.17-.37,3.2.08.84.37,1.59.91,2.46,1.2.53.17,1.09.25,1.58.5.47.24.86.62,1.2,1.02.41.49.77,1.04.9,1.67.11.54.04,1.11.12,1.66.17,1.13.96,2.12,1.06,3.26.08.85-.23,1.67-.33,2.52-.13,1.08.09,2.19.62,3.14.55.99,1.47,1.92,1.33,3.05-.12,1-.6,2.28-1.51,2.79-.41.23-.9.35-1.26.66-.46.4-.61,1.05-1,1.51-.6.72-1.64.89-2.57.77-.93-.12-1.8-.49-2.72-.64-1.5-.25-3.03.04-4.51.38-1.48.34-3.07.71-4.48.15-.63-.25-1.18-.67-1.82-.91-.55-.2-1.13-.25-1.69-.4-.56-.15-1.12-.44-1.4-.95-.34-.63-.14-1.42.15-2.07.29-.66.68-1.3.71-2.02.04-.97-.58-1.84-.81-2.78-.23-.94-.06-1.98.46-2.8.26-.4.59-.75.77-1.2.52-1.31-.42-2.75-.12-4.07.24-1.04,1.3-1.54,1.95-2.28.74-.84.77-2.05,1.68-2.85.76-.66,1.8-.89,2.8-.97,1.09-.1,2.14-.17,3.22-.4Z\"/>\n  <path class=\"cls-6\" d=\"M56.1,65.85c1-4.76,3.23-5.84,6.39-6.79,3.11-.94,7.09-1.32,8.25-2.47,1.15-1.15,1.09-6.11,1.09-6.11l8.11-.36s-.18,5.07,1.22,6.46c1.4,1.4,6.2.31,9.66,1.65,3.53,1.37,5.82,4.74,8.29,8.64,3.64,5.74,10.08,16.63,9.94,20.43-.14,3.8-13.75,22.93-13.75,22.93l-3.42-2.92,9.23-19.77-11.22-15.84s.22,4.28.26,4.45c-.02.89-.08,1.88-.19,2.97-.62,5.71-2.53,10.33-2.53,17.05,0,6.27,2.36,12.12,2.66,16.94.3,4.82.95,14.29.72,18.37-.61,10.79-4.64,27.26-4.73,29.55-.09,2.29.12,9.25.04,18.79-.08,9.53-3.22,28.9-3.22,28.9l-5.74.05s0-11.36-1.29-25.89c-.44-4.91.15-10.31-.17-15.64-.13-2.17-1.09-4.98-1.31-7.14-.75-7.38.89-14.47.51-22.68-.13-2.77-.19-14.3-.15-14.62-.07.6.76,6.69,1.82,13.83,1.06,7.14.91,20.36,1.06,24.16.15,3.8-.24,10.02-1.63,19.03-1.46,9.42-3.26,26.75-3.26,26.75l-6.89.38s-2.2-15.02-1.9-24.44c.24-7.59,3.76-17.85,3.53-21.16-.23-3.3-6.54-22.91-7.86-29.74-1.37-7.07-.41-11.46-.03-14.39.38-2.92,3.14-12.66,3.26-18.81.12-6.32-2.69-14.07-2.68-21.27,0-4.85,3-1.11,3-1.11-.72,1.65-2.88,14.45-3.42,17.53-.55,3.08-11.72,23.62-11.72,23.62l-3.96-1.51,7.6-25.19s3.1-18.29,4.44-24.65Z\"/>\n  <path class=\"cls-6\" d=\"M44.06,115.69s-1.05,3.33-1.49,4.27c-.44.94-3.28,3.64-3.39,3.96-.11.32-.6,3.54-.5,3.98.1.44,1.07,2,1.26,2.23.19.23.86,1.06,1.14,1.01.28-.06.29-.2.29-.2,0,0,.32.42.59.25s.29-.73.16-.97c-.14-.24-.89-1.06-.89-1.06,0,0,1.6,1.1,2.01,1.06.42-.04.42-.59.27-.83s-.95-.66-.95-.66l.35-.5s.55.24.75-.08c.2-.31-.33-.79-.33-.79,0,0,.28-1.42.98-2.01.7-.6,1.16-1.65,1.16-2.47,0-.82-.13-1.88.74-2.87.87-.99,1.82-2.81,1.82-2.81l-3.96-1.51Z\"/>\n  <path class=\"cls-5\" d=\"M41.85,129.24c-.23,0-.43-.1-.58-.23-.38-.33,0-1.84.36-2.44.36-.62.79-2.75.8-2.78.01-.07.09-.12.16-.11.07.01.12.09.11.16-.02.09-.44,2.2-.83,2.86-.39.67-.6,1.93-.41,2.1.23.2.62.27,1.01-.17.05-.06.14-.06.19-.01.06.05.06.14.01.19-.28.31-.56.42-.81.42Z\"/>\n  <path class=\"cls-5\" d=\"M41.37,131.08s-.02,0-.02,0c-.07-.01-.12-.08-.11-.16.03-.15.08-.59.02-.78-.04-.12-.23-.35-.39-.54-.17-.21-.32-.39-.37-.51-.02-.04-.04-.09-.07-.15-.13-.27-.34-.72-.31-1.3,0-.08.07-.13.14-.13.08,0,.13.07.13.14-.03.51.16.91.29,1.17.03.07.06.12.08.17.03.08.19.27.32.44.2.24.38.47.44.63.1.29,0,.85,0,.92-.01.07-.07.11-.13.11Z\"/>\n  <path class=\"cls-5\" d=\"M41.22,129.29s-.09-.02-.12-.07c-.1-.16-.59-1-.58-1.34,0-.3-.08-1.19-.08-1.19,0-.08.05-.14.12-.15.07,0,.14.05.15.12,0,.04.09.91.08,1.23,0,.19.31.81.54,1.19.04.06.02.15-.05.19-.02.01-.05.02-.07.02Z\"/>\n  <path class=\"cls-5\" d=\"M42.9,128.37s-.04,0-.06-.01c-.07-.03-.1-.11-.06-.18l.42-.86c.03-.07.12-.1.18-.06.07.03.1.11.06.18l-.42.86s-.07.08-.12.08Z\"/>\n  <path class=\"cls-5\" d=\"M61.62,88.63c-.06,0-.12-.05-.13-.11l-.05-.25c-.27-1.44-.55-2.92-.79-4.4-.01-.07.04-.14.11-.16.07-.01.14.04.16.11.23,1.47.51,2.95.79,4.39l.05.25c.01.07-.03.15-.11.16,0,0-.02,0-.03,0Z\"/>\n  <path class=\"cls-5\" d=\"M75.8,181.33s-.01,0-.02,0c-.07-.01-.13-.08-.11-.16.52-3.35,1.12-6.63,1.64-9.54.89-4.91,1.66-9.14,1.66-11.52,0-3.14-2.76-22.48-4.21-32.27-.01-.07.04-.14.12-.16.08,0,.14.04.16.12.17,1.16,4.22,28.37,4.22,32.31,0,2.4-.77,6.65-1.66,11.57-.53,2.9-1.12,6.19-1.64,9.53-.01.07-.07.12-.13.12Z\"/>\n  <path class=\"cls-1\" d=\"M89.61,109.65c.39,1.86.85,4.76.77,5.4-.07.56-2.53,1.99-6.19,4.76-3.45,2.61-7.66,7.57-8.2,7.84-.59.3-1.51.25-1.94-.03-.6-.39-4.19-4.74-8.28-7.62-3.77-2.65-6.04-3.58-5.98-4.5.05-.86.62-3.07,1.29-5.59,9.45-.16,19.03-.44,28.53-.27Z\"/>\n  <path class=\"cls-6\" d=\"M91.88,107.32c-.27.59-1.35,2.44-2.06,2.28-.71-.16-1.9-.79-2.55-.88-.66-.09-1.6-.33-1.94-.19-.34.15-2.22,2.31-2.18,2.61s.34.71.83.48c.49-.23,1.61-1.55,1.76-1.58.15-.03.68.56.68.56,0,0-3.43,3.5-3.46,3.81-.03.3.29.76.71.56.41-.2,3.18-2.59,3.18-2.59,0,0-2.91,3.27-2.92,3.6,0,.33.34.63.8.35s2.98-2.93,3.26-2.94c.27-.02.41.15.41.15,0,0-2.31,2.71-2.28,2.93s.35.76.91.5c.57-.27,2.62-2.92,2.91-2.97.3-.05,2.09.08,2.91-.77.82-.85,2.45-2.97,2.45-2.97l-3.42-2.92Z\"/>\n  <path class=\"cls-5\" d=\"M89.34,109.59s-.03,0-.05,0c-.22-.08-.46-.18-.7-.27-.49-.2-1-.4-1.34-.45-.18-.02-.39-.06-.59-.1-.47-.08-1.06-.19-1.27-.1-.05.02-.27.19-.72.69-.05.06-.14.06-.19,0-.06-.05-.06-.14,0-.19.28-.3.65-.68.81-.75.29-.12.84-.02,1.43.08.2.04.4.07.58.1.37.05.9.26,1.41.47.24.1.47.19.69.27.07.03.11.1.08.17-.02.06-.07.09-.13.09Z\"/>\n  <path class=\"cls-6\" d=\"M77.15,208.78s.13,1.25.13,3.12c0,1.42-.22,2.27-.22,3.11s-.25,2.64-.4,3.12c-.63,1.99-1.59,3.18-1.26,4.04.38.97,2.56.8,4.96.51,2.75-.33,4.61-.57,4.79-1.6.17-.97-.83-2.37-1.53-3.41-.7-1.04-.72-8.96-.72-8.96l-5.74.05Z\"/>\n  <path class=\"cls-5\" d=\"M77.46,222.95s-.01,0-.02,0c-.07,0-.13-.08-.12-.15l.24-1.84c0-.07.08-.13.15-.12.07,0,.13.08.12.15l-.24,1.84c0,.07-.07.12-.14.12Z\"/>\n  <path class=\"cls-5\" d=\"M80.26,222.7c-.07,0-.13-.05-.14-.12l-.24-1.64c-.01-.07.04-.14.12-.16.07-.01.14.04.16.12l.24,1.64c.01.07-.04.14-.12.16,0,0-.01,0-.02,0Z\"/>\n  <path class=\"cls-5\" d=\"M82.5,222.45c-.06,0-.11-.04-.13-.1l-.45-1.54c-.02-.07.02-.15.09-.17.07-.02.15.02.17.09l.45,1.54c.02.07-.02.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n  <path class=\"cls-5\" d=\"M84.26,222.02c-.06,0-.11-.04-.13-.09l-.42-1.25c-.02-.07.01-.15.09-.17.07-.02.15.01.17.09l.42,1.25c.02.07-.01.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n  <path class=\"cls-5\" d=\"M78.9,60.13c-.06,0-.12-.04-.13-.11-.02-.07.03-.15.1-.16l6.8-1.48c.07-.02.15.03.16.1.02.07-.03.15-.1.16l-6.8,1.48s-.02,0-.03,0Z\"/>\n  <path class=\"cls-5\" d=\"M73.58,60.13s-.02,0-.03,0l-6.46-1.44c-.07-.02-.12-.09-.1-.16s.09-.12.16-.1l6.46,1.44c.07.02.12.09.1.16-.01.06-.07.11-.13.11Z\"/>\n  <path class=\"cls-5\" d=\"M84.21,167.26s-.03,0-.05-.01c-.07-.03-.1-.11-.07-.18l1.51-3.7c.03-.07.11-.1.18-.07.07.03.1.11.07.18l-1.51,3.7c-.02.05-.07.09-.13.09Z\"/>\n  <path class=\"cls-6\" d=\"M65.84,206.96c.45,2.11-.45,9.49-.8,10.52-.35,1.02-1.56,2.11-1.23,3.08.33.99,2.64,2.17,4.63,2.34,1.99.17,4.21-.14,4.96-.75s.12-2.44-.28-3.84c-.4-1.4-.04-8.1-.39-11.73l-6.89.38Z\"/>\n  <path class=\"cls-5\" d=\"M72.14,222.72c-.06,0-.12-.05-.13-.11l-.49-2.51c-.01-.07.03-.15.11-.16.07-.01.15.03.16.11l.49,2.51c.01.07-.03.15-.11.16,0,0-.02,0-.03,0Z\"/>\n  <path class=\"cls-5\" d=\"M68.97,223.01h0c-.08,0-.13-.07-.13-.14l.1-2.55c0-.08.06-.13.14-.13.08,0,.13.07.13.14l-.1,2.55c0,.07-.06.13-.14.13Z\"/>\n  <path class=\"cls-5\" d=\"M66.15,222.36s-.03,0-.04,0c-.07-.02-.11-.1-.08-.17l.75-2.19c.02-.07.1-.11.17-.08.07.02.11.1.08.17l-.75,2.19c-.02.06-.07.09-.13.09Z\"/>\n  <path class=\"cls-5\" d=\"M64.29,221.25s-.05,0-.07-.02c-.07-.04-.09-.12-.05-.19l.73-1.31c.04-.07.12-.09.19-.05.07.04.09.12.05.19l-.73,1.31s-.07.07-.12.07Z\"/>\n  <path class=\"cls-5\" d=\"M74.73,103.05s-.04,0-.06-.02c-.07-.04-.09-.12-.06-.19l1.06-1.98c.04-.07.12-.09.19-.06.07.04.09.12.06.19l-1.06,1.98s-.07.07-.12.07Z\"/>\n  <path class=\"cls-1\" d=\"M62.45,66.05c1.44-3.72,2.59-7.31,2.96-7.67.37-.36,1.4-.46,1.81-.39.41.06-2.14,13.59,8.12,13.59s8.31-14.26,8.82-14.38,1.59-.02,1.84.22c.25.24.59,6.37,2.23,9.97,1.54,3.39,2.53,7.02,2.38,10.31-.16,3.35-.87,5.66-1.37,6.04-.26.2-7.8,1.13-15.16,1.1-6.75-.03-13.24-.99-13.56-1.25-.66-.55-1.64-4.03-1.32-7.26.39-3.94,1.79-6.55,3.24-10.27Z\"/>\n  <path class=\"cls-5\" d=\"M79.92,51.47c-1.38,1.17-3,1.88-4.06,1.88s-2.73-.64-4.06-1.76v-1.66l8.11.36v1.18Z\"/>\n  <path class=\"cls-6\" d=\"M70.59,31.99c2.35-2.03,4.62-2.02,5.27-2.02s2.92,0,5.27,2.02c2.27,1.96,2.98,4.76,2.76,8.41-.22,3.65-.94,6.68-2.36,8.87-1.42,2.2-4.15,3.68-5.66,3.68s-4.15-1.26-5.44-3.32c-1.28-2.06-2.37-5.58-2.59-9.23-.22-3.65.49-6.46,2.76-8.41Z\"/>\n  <path class=\"cls-6\" d=\"M68.65,41.65c-.71-.86-2.31.06-2.09,1.68.22,1.62,1.72,3.26,2.66,3.26.94,0,.39-3.78-.57-4.94Z\"/>\n  <path class=\"cls-6\" d=\"M82.91,41.65c.71-.86,2.31.06,2.09,1.68-.22,1.62-1.72,3.26-2.66,3.26-.94,0-.39-3.78.57-4.94Z\"/>\n  <path class=\"cls-5\" d=\"M83.65,44.48s-.05,0-.08-.02c-.06-.04-.08-.13-.03-.19.39-.55.29-1.3.29-1.31-.01-.07.04-.14.12-.15.07,0,.14.04.15.12,0,.03.11.86-.34,1.5-.03.04-.07.06-.11.06Z\"/>\n  <path class=\"cls-2\" d=\"M70.56,31.85c2.37-2.05,4.67-2.04,5.32-2.04s2.95,0,5.32,2.04c1.19,1.02,2,2.37,2.42,3.88.21.78.29,1.56.41,2.34.13.86.6,1.63.9,2.44.65,1.75.52,3.71-.01,5.49-.15.51-.41,1.09-.94,1.2-.36.08-.74-.11-.98-.39-.24-.28-.36-.65-.44-1.01-.22-.95-.23-1.94-.03-2.89.11-.52.28-1.03.32-1.55.05-.64-.12-1.22-.38-1.79-.2-.44-.54-.75-.76-1.18-.22-.41-.32-.88-.55-1.29-.29-.5-.75-.86-1.14-1.27-.29-.31-.57-.68-.66-1.1-.04-.19-.18-.55-.33-.56-.15,0-.4,1.57-1.13,2.14-.49.38-1.16.43-1.78.41-.94-.04-2.47-.31-3.14.57-.42.55-.46,1.15-1.17,1.52-.51.27-1.14.33-1.56.73-.34.33-.48.83-.82,1.17-.23.24-1.3.75-1.63.83-.43.11-.9.11-1.28-.1-.89-.5.36-1.98.7-2.67.33-.69.58-1.24.71-1.98.11-.64.27-1.28.5-1.88.37-.97,1.16-2.56,2.14-3.05Z\"/>\n  <path class=\"cls-4\" d=\"M71.66,36.41s-.03,0-.05,0c-.07-.03-.11-.11-.08-.18.37-.95,1.25-1.69,2.25-1.88.3-.06.62-.07.92-.08.4-.01.78-.03,1.14-.14.73-.23,1.3-.93,1.39-1.7,0-.07.08-.13.15-.12.07,0,.13.08.12.15-.1.87-.75,1.66-1.58,1.92-.4.13-.81.14-1.22.16-.29.01-.59.02-.88.07-.91.17-1.72.85-2.05,1.71-.02.05-.07.09-.13.09Z\"/>\n  <path class=\"cls-4\" d=\"M74.28,32.01c-.08,0-.15,0-.23-.01-.33-.03-.65-.13-.96-.23-.17-.05-.33-.11-.5-.15-.39-.1-.93-.16-1.33.11-.06.04-.15.03-.19-.04-.04-.06-.03-.15.04-.19.38-.26.91-.31,1.55-.15.17.04.34.1.52.15.31.1.6.19.9.22.9.09,1.84-.44,2.22-1.26.03-.07.11-.1.18-.07.07.03.1.11.07.18-.4.85-1.32,1.43-2.26,1.43Z\"/>\n  <path class=\"cls-4\" d=\"M67.77,38.66s-.03,0-.04,0c-.07-.02-.11-.1-.09-.17.15-.45.21-.94.16-1.42-.01-.13-.03-.25-.05-.38-.05-.32-.1-.65-.04-.98.09-.52.45-1.03.99-1.38.48-.31,1.02-.48,1.54-.64.07-.02.15.02.17.09.02.07-.02.15-.09.17-.51.16-1.03.32-1.47.61-.48.31-.8.75-.87,1.2-.05.29,0,.58.04.89.02.13.04.26.05.39.05.51-.01,1.04-.17,1.53-.02.06-.07.09-.13.09Z\"/>\n  <path class=\"cls-4\" d=\"M84.51,40.98c-.07,0-.12-.05-.13-.11-.16-.92-.34-1.73-.9-2.29-.23-.23-.58-.42-.95-.62-.49-.27-1.05-.57-1.45-1.03-.05-.06-.04-.14.01-.19.06-.05.14-.04.19.01.36.42.88.7,1.37.97.39.21.76.41,1.01.67.61.61.8,1.47.97,2.44.01.07-.04.15-.11.16,0,0-.02,0-.02,0Z\"/>\n  <path class=\"cls-4\" d=\"M83.84,35.13s-.04,0-.06-.01c-.32-.15-.59-.45-.8-.9-.07-.15-.13-.31-.19-.46-.08-.2-.15-.39-.25-.57-.52-.98-1.73-1.54-2.82-1.3-.07.02-.15-.03-.16-.1-.02-.07.03-.15.1-.16,1.2-.26,2.54.36,3.12,1.44.1.2.18.4.26.6.06.15.12.3.18.44.18.38.4.64.67.77.07.03.1.11.06.18-.02.05-.07.08-.12.08Z\"/>\n  <path class=\"cls-4\" d=\"M83.59,50.9s-.07-.01-.09-.04c-.06-.05-.06-.14,0-.19.37-.41.51-1.04.37-1.65-.15-.66-.55-1.43-.84-2-.07-.14-.14-.27-.19-.38-.03-.07,0-.15.06-.18.07-.03.15,0,.18.06.05.11.12.24.19.37.3.58.71,1.37.86,2.06.16.7,0,1.43-.43,1.9-.03.03-.06.04-.1.04Z\"/>\n</svg>";

    var kadinElmaIcon = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" data-name=\"Layer 1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 150 250\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: #404555;\n      }\n\n      .cls-2 {\n        fill: #e6e6e6;\n        stroke: #666;\n        stroke-dasharray: 2;\n        stroke-miterlimit: 10;\n        stroke-width: .5px;\n      }\n\n      .cls-3 {\n        opacity: .4;\n      }\n\n      .cls-4 {\n        fill: #a27242;\n      }\n\n      .cls-5 {\n        fill: #b17b69;\n      }\n\n      .cls-6 {\n        fill: #e4a58a;\n      }\n    </style>\n  </defs>\n  <circle class=\"cls-2\" cx=\"75\" cy=\"104.13\" r=\"55.65\"/>\n  <g>\n    <g>\n      <path class=\"cls-4\" d=\"M73.27,29.32c-1.07-.23-2.17-.37-3.2.08-.84.37-1.59.91-2.46,1.2-.53.17-1.09.25-1.58.5-.47.24-.86.62-1.2,1.02-.41.49-.77,1.04-.9,1.67-.11.54-.04,1.11-.12,1.66-.17,1.13-.96,2.12-1.06,3.26-.08.85.23,1.67.33,2.52.13,1.08-.09,2.19-.62,3.14-.55.99-1.47,1.92-1.33,3.05.12,1,.6,2.28,1.51,2.79.41.23.9.35,1.26.66.46.4.61,1.05,1,1.51.6.72,1.64.89,2.57.77s1.8-.49,2.72-.64c1.5-.25,3.03.04,4.51.38,1.48.34,3.07.71,4.48.15.63-.25,1.18-.67,1.82-.91.55-.2,1.13-.25,1.69-.4.56-.15,1.12-.44,1.4-.95.34-.63.14-1.42-.15-2.07-.29-.66-.68-1.3-.71-2.02-.04-.97.58-1.84.81-2.78.23-.94.06-1.98-.46-2.8-.26-.4-.59-.75-.77-1.2-.52-1.31.42-2.75.12-4.07-.24-1.04-1.3-1.54-1.95-2.28-.74-.84-.77-2.05-1.68-2.85-.76-.66-1.8-.89-2.8-.97-1.09-.1-2.14-.17-3.22-.4Z\"/>\n      <path class=\"cls-6\" d=\"M113.55,67.69c.62-1.78-.41-4.31-1.64-5.89-5.57-7.11-21.16-15.12-21.16-15.12l-2.76,1.86,11.83,12.67s-7.43-3.01-11.54-3.73c-3.66-.64-7.6.5-8.99-.9s-.77-7.38-.77-7.38l-8.56,1.27s.06,4.95-1.09,6.11c-1.15,1.15-4.72,1.12-7.91,1.73-3.24.62-6.77,3.44-9.84,7.22-3.27,4.03-11.74,13.56-11.62,18,.11,4.44,12.87,23.98,12.87,23.98l3.29-3.08-6.59-20.33s8.85-10.89,9.57-12.53c0,0-1.63.73-1.63,5.58-.01,7.2.49,13.9.38,19.26-.1,4.58-2.66,12.72-4.33,22.3-.5,2.89,0,12.12,2.73,20.78,3.38,10.72,8.66,18.57,9.57,21.31.91,2.73,2.13,40.56,2.13,40.56l7.4,1.53c.08,1.8.16,3.72.21,5.85l5.74.07c.46-9.03,1.9-10.14,3.67-23.09.87-6.34,1.55-13.92,1.92-21.15.43-8.31,3.49-17.58,4.23-24.97.82-8.19,2.06-18.82,1.37-23.02-1.31-7.91-3.42-14.89-3.42-20.36s.06-10.17.68-15.88c.54-4.96-1.37-9.12-1.37-9.12,1.09,2.28,24.28.36,25.64-3.54Z\"/>\n      <g>\n        <path class=\"cls-6\" d=\"M90.75,46.69s-1.45-1.18-1.88-1.98c-.43-.79-.74-3.84-.86-4.33-.12-.49-.86-3.25-.99-3.45-.12-.2-2.56-2.82-2.74-2.86-.18-.04-.68.42-.07,1.2,0,0-.57-.23-.69.08-.12.32.11.92.79,1.11,0,0-.1.43.16.71.26.28.9.71,1.02.89.11.19.68,1.09.38,3,0,0-.71-1.73-1.16-1.89-.46-.16-.8.31-.78.55.02.24.33,1.36.54,1.79s.39,1.45.24,1.99c-.16.54.09,1.84.48,2.5.39.66,1.25,1.33,1.75,1.58.51.26,1.05.95,1.05.95l2.76-1.86Z\"/>\n        <path class=\"cls-5\" d=\"M85.79,42.2s0,0-.01,0c-.08,0-.14-.07-.13-.15l.08-.98c0-.08.07-.14.15-.13.08,0,.14.07.13.15l-.08.98c0,.07-.07.13-.14.13Z\"/>\n        <path class=\"cls-5\" d=\"M87.41,40.7c-.07,0-.13-.05-.14-.12-.09-.71-.27-1.9-.35-2.06-.13-.23-2.02-1.97-2.36-2.11-.1.03-.13.11-.13.11-.03.07-.11.11-.18.08-.07-.03-.11-.11-.08-.18.03-.08.14-.24.35-.29.37-.09,2.64,2.24,2.65,2.27.12.25.33,1.83.38,2.15.01.08-.04.15-.12.16,0,0-.01,0-.02,0Z\"/>\n        <path class=\"cls-5\" d=\"M87.08,37.59s-.07-.01-.1-.04c-.55-.56-2.82-2.15-2.85-2.17-.06-.04-.08-.13-.03-.2.04-.06.13-.08.2-.03.09.07,2.32,1.62,2.89,2.2.05.06.05.15,0,.2-.03.03-.06.04-.1.04Z\"/>\n      </g>\n      <path class=\"cls-5\" d=\"M102.93,64.78s-.06-.01-.09-.03c-1.54-1.33-2.51-2.4-3.14-3.46-.04-.06-.02-.15.05-.19.06-.04.15-.02.19.05.62,1.03,1.57,2.08,3.09,3.39.06.05.06.14.01.19-.03.03-.07.05-.1.05Z\"/>\n      <path class=\"cls-1\" d=\"M90.8,105.8c-.75-3.81-1.98-7.29-1.98-10.33,0-7.55,1.73-14.59,1.98-18.08.25-3.49-.56-5.89-1.17-6.15-6.91-3.02-13.34,1.29-16.08,1.29s-10.33-5.3-15.57-1.6c-.61.43-2.2,3.11-2.2,6.91,0,3.8,2.22,11.56,1.52,19.3-.3,3.34-1.73,7.83-2.49,10.79-.76,2.96-1.5,7.86-1.6,9.29-.06.92,3.8,2.38,8.32,4.62,5.02,2.48,10.42,6.1,11.63,6.1,1.33,0,6.03-3.84,10.67-6.78,4.3-2.73,8.31-4.81,8.18-5.36-.21-.93-.46-6.12-1.22-9.99Z\"/>\n      <path class=\"cls-6\" d=\"M55.64,104.45c.3.57,1.28,2.5,1.98,2.3s1.85-.9,2.5-1.02c.65-.12,1.57-.42,1.92-.3.35.12,2.35,2.17,2.32,2.47-.03.3-.3.72-.8.52-.5-.2-1.7-1.45-1.85-1.47-.15-.02-.65.6-.65.6,0,0,3.62,3.3,3.67,3.6.05.3-.25.77-.67.6-.42-.17-3.32-2.4-3.32-2.4,0,0,3.1,3.1,3.12,3.42.03.32-.3.65-.77.4-.47-.25-3.15-2.75-3.42-2.75s-.4.17-.4.17c0,0,2.47,2.57,2.45,2.79-.02.22-.3.78-.88.55-.58-.23-2.78-2.77-3.08-2.8-.3-.03-2.08.2-2.95-.6-.87-.8-2.45-3.02-2.45-3.02l3.29-3.08Z\"/>\n      <g>\n        <path class=\"cls-6\" d=\"M75.09,208.75s.11,1.26.06,3.13c-.03,1.42-.27,2.27-.28,3.1-.02.84-.3,2.63-.47,3.11-.67,1.97-1.66,3.15-1.34,4.01.36.98,2.55.85,4.95.62,2.76-.27,4.62-.48,4.82-1.49.19-.96-.78-2.39-1.46-3.44-.68-1.05-.53-8.97-.53-8.97l-5.74-.07Z\"/>\n        <path class=\"cls-5\" d=\"M75.05,222.9s-.03,0-.04,0c-.07-.02-.11-.1-.09-.17l.54-1.86c.02-.07.1-.11.17-.09.07.02.11.1.09.17l-.54,1.86c-.02.06-.07.1-.13.1Z\"/>\n        <path class=\"cls-5\" d=\"M77.7,222.78h0c-.08,0-.14-.06-.14-.14v-1.69c0-.08.07-.14.14-.14h0c.08,0,.14.06.14.14v1.69c0,.08-.07.14-.14.14Z\"/>\n        <path class=\"cls-5\" d=\"M80.16,222.53c-.06,0-.11-.04-.13-.1l-.4-1.4c-.02-.07.02-.15.09-.17.07-.02.15.02.17.09l.4,1.4c.02.07-.02.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n        <path class=\"cls-5\" d=\"M81.93,222.13c-.06,0-.11-.04-.13-.1l-.39-1.26c-.02-.07.02-.15.09-.17.07-.02.15.02.17.09l.39,1.26c.02.07-.02.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n      </g>\n      <path class=\"cls-5\" d=\"M70.97,60.13s-.02,0-.03,0l-6.8-1.48c-.07-.02-.12-.09-.1-.16.02-.07.09-.12.16-.1l6.8,1.48c.07.02.12.09.1.16-.01.06-.07.11-.13.11Z\"/>\n      <path class=\"cls-5\" d=\"M76.29,60.13c-.06,0-.12-.04-.13-.11-.02-.07.03-.15.1-.16l6.46-1.44c.07-.02.15.03.16.1.02.07-.03.15-.1.16l-6.46,1.44s-.02,0-.03,0Z\"/>\n      <g>\n        <path class=\"cls-6\" d=\"M67.48,201.36s.02,3.12-.08,5.17c-.1,2.15-2.83,9.07-3.42,9.98-.6.9-2.04,1.64-1.97,2.67.07,1.04,2,2.77,3.89,3.43s4.11.93,4.99.53c.88-.4.73-2.33.7-3.78-.04-1.46,2.01-7.85,2.58-11.45.35-2.21,1.06-6.8,1.06-6.8l-7.75.26Z\"/>\n        <path class=\"cls-5\" d=\"M69.55,223.37s0,0,0,0c-.08,0-.13-.07-.13-.14l.16-2.55c0-.08.07-.13.14-.13.08,0,.13.07.13.14l-.16,2.55c0,.07-.06.13-.14.13Z\"/>\n        <path class=\"cls-5\" d=\"M66.42,222.85s-.03,0-.04,0c-.07-.02-.11-.1-.09-.17l.74-2.44c.02-.07.1-.11.17-.09.07.02.11.1.09.17l-.74,2.44c-.02.06-.07.1-.13.1Z\"/>\n        <path class=\"cls-5\" d=\"M63.86,221.52s-.05,0-.08-.02c-.06-.04-.08-.13-.04-.19l1.28-1.93c.04-.06.13-.08.19-.04.06.04.08.13.04.19l-1.28,1.93s-.07.06-.11.06Z\"/>\n        <path class=\"cls-5\" d=\"M62.33,219.96s-.07-.01-.09-.04c-.05-.05-.06-.14,0-.19l1.03-1.08c.05-.05.14-.06.19,0,.05.05.06.14,0,.19l-1.03,1.08s-.06.04-.1.04Z\"/>\n      </g>\n      <path class=\"cls-5\" d=\"M75.08,203.02s-.01,0-.02,0c-.07-.01-.13-.08-.12-.15.06-.39,5.62-39.41,5.47-45.56-.15-6.14-7.3-29.11-7.37-29.34-.02-.07.02-.15.09-.17.07-.02.15.02.17.09.07.23,7.24,23.24,7.39,29.42.15,6.17-5.41,45.21-5.47,45.6,0,.07-.07.12-.14.12Z\"/>\n      <path class=\"cls-5\" d=\"M49.06,84.25s-.02,0-.03,0l-3.87-.8c-.07-.02-.12-.09-.11-.16s.09-.12.16-.11l3.87.8c.07.02.12.09.11.16-.01.06-.07.11-.13.11Z\"/>\n      <path class=\"cls-5\" d=\"M84.5,164.89s-.05,0-.07-.02c-.07-.04-.09-.12-.05-.19l1.98-3.49c.04-.07.12-.09.19-.05.07.04.09.12.05.19l-1.98,3.49s-.07.07-.12.07Z\"/>\n      <path class=\"cls-5\" d=\"M74.47,163.44s-.06,0-.09-.03l-3.42-2.73c-.06-.05-.07-.13-.02-.19.05-.06.13-.07.19-.02l3.42,2.73c.06.05.07.13.02.19-.03.03-.07.05-.11.05Z\"/>\n    </g>\n    <g>\n      <path class=\"cls-6\" d=\"M78.53,31.99c-2.35-2.03-4.62-2.02-5.27-2.02s-2.92,0-5.27,2.02c-2.27,1.96-2.98,4.76-2.76,8.41.22,3.65.94,6.68,2.36,8.87,1.42,2.2,3.24,3.68,4.76,3.68s4.06-1.02,5.81-3.11c1.94-2.32,2.9-5.8,3.12-9.45.22-3.65-.49-6.46-2.76-8.41Z\"/>\n      <path class=\"cls-5\" d=\"M72.36,53.09c-.76,0-1.63-.36-2.5-1.05-.06-.05-.07-.13-.02-.19.05-.06.13-.07.19-.02.82.65,1.63.99,2.33.99,1,0,2.35-.45,3.53-1.19.06-.04.15-.02.19.04.04.06.02.15-.04.19-1.24.77-2.62,1.23-3.68,1.23Z\"/>\n      <path class=\"cls-6\" d=\"M79.96,41.65c.71-.86,2.31.06,2.09,1.68-.22,1.62-1.72,3.26-2.66,3.26-.94,0-.39-3.78.57-4.94Z\"/>\n      <path class=\"cls-6\" d=\"M66.22,41.65c-.71-.86-2.31.06-2.09,1.68.22,1.62,1.72,3.26,2.66,3.26.94,0,.39-3.78-.57-4.94Z\"/>\n      <path class=\"cls-4\" d=\"M78.59,31.89c-2.37-2.05-4.67-2.04-5.32-2.04s-2.95,0-5.32,2.04c-1.19,1.02-2,2.37-2.42,3.88-.21.78-.29,1.56-.41,2.34-.13.86-.6,1.63-.9,2.44-.65,1.75-.52,3.71.01,5.49.15.51.41,1.09.94,1.2.36.08.74-.11.98-.39.24-.28.36-.65.44-1.01.22-.95.23-1.94.03-2.89-.11-.52-.28-1.03-.32-1.55-.05-.64.12-1.22.38-1.79.2-.44.54-.75.76-1.18.22-.41.32-.88.55-1.29.29-.5.75-.86,1.14-1.27.29-.31.57-.68.66-1.1.04-.19.18-.55.33-.56s.4,1.57,1.13,2.14c.49.38,1.16.43,1.78.41.94-.04,2.47-.31,3.14.57.42.55.46,1.15,1.17,1.52.51.27,1.14.33,1.56.73.34.33.48.83.82,1.17.23.24,1.3.75,1.63.83.43.11.9.11,1.28-.1.89-.5-.36-1.98-.7-2.67-.33-.69-.58-1.24-.71-1.98-.11-.64-.27-1.28-.5-1.88-.37-.97-1.16-2.56-2.14-3.05Z\"/>\n      <path class=\"cls-3\" d=\"M77.5,36.45c-.05,0-.11-.03-.13-.09-.33-.86-1.14-1.54-2.05-1.71-.28-.05-.58-.06-.88-.07-.4-.01-.82-.03-1.22-.16-.83-.27-1.48-1.06-1.58-1.92,0-.07.05-.14.12-.15.08,0,.14.05.15.12.09.76.66,1.46,1.39,1.7.36.12.74.13,1.14.14.3.01.61.02.92.08,1,.19,1.89.93,2.25,1.88.03.07,0,.15-.08.18-.02,0-.03,0-.05,0Z\"/>\n      <path class=\"cls-3\" d=\"M74.87,32.05c-.94,0-1.87-.57-2.26-1.43-.03-.07,0-.15.07-.18.07-.03.15,0,.18.07.38.82,1.32,1.35,2.22,1.26.3-.03.59-.12.9-.22.17-.05.34-.11.52-.15.63-.16,1.17-.11,1.55.15.06.04.08.13.04.19-.04.06-.13.08-.19.04-.4-.27-.94-.21-1.33-.11-.17.04-.33.09-.5.15-.31.1-.62.2-.96.23-.08,0-.15.01-.23.01Z\"/>\n      <path class=\"cls-3\" d=\"M81.38,38.7c-.06,0-.11-.04-.13-.09-.16-.49-.22-1.02-.17-1.53.01-.13.03-.26.05-.39.05-.31.09-.6.04-.89-.08-.45-.39-.89-.87-1.2-.45-.29-.97-.45-1.47-.61-.07-.02-.11-.1-.09-.17.02-.07.1-.11.17-.09.52.16,1.06.33,1.54.64.54.35.91.86.99,1.38.06.33,0,.66-.04.98-.02.13-.04.25-.05.38-.04.48.01.97.16,1.42.02.07-.02.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n      <path class=\"cls-3\" d=\"M64.65,41.02s-.02,0-.02,0c-.07-.01-.12-.08-.11-.16.17-.97.36-1.82.97-2.44.26-.26.62-.46,1.01-.67.49-.27,1.01-.55,1.37-.97.05-.06.14-.06.19-.01.06.05.06.14.01.19-.4.46-.95.77-1.45,1.03-.37.2-.72.39-.95.62-.56.56-.74,1.37-.9,2.29-.01.07-.07.11-.13.11Z\"/>\n      <path class=\"cls-3\" d=\"M65.31,35.17c-.05,0-.1-.03-.12-.08-.03-.07,0-.15.06-.18.26-.12.49-.38.67-.77.07-.14.13-.29.18-.44.08-.2.16-.41.26-.6.58-1.09,1.92-1.71,3.12-1.44.07.02.12.09.1.16-.02.07-.09.12-.16.1-1.09-.24-2.3.32-2.82,1.3-.1.18-.17.37-.25.57-.06.16-.12.31-.19.46-.21.44-.48.74-.8.9-.02,0-.04.01-.06.01Z\"/>\n      <path class=\"cls-3\" d=\"M65.56,50.94s-.07-.02-.1-.04c-.43-.47-.59-1.2-.43-1.9.16-.69.57-1.48.86-2.06.07-.14.14-.26.19-.37.03-.07.12-.1.18-.06.07.03.1.12.06.18-.05.11-.12.24-.19.38-.29.57-.69,1.34-.84,2-.14.61,0,1.25.37,1.65.05.06.05.14,0,.19-.03.02-.06.04-.09.04Z\"/>\n    </g>\n  </g>\n</svg>";

    var kadinKumSaatiIcon = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" data-name=\"Layer 1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 150 250\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: #404555;\n      }\n\n      .cls-2 {\n        fill: #e6e6e6;\n        stroke: #666;\n        stroke-dasharray: 2;\n        stroke-miterlimit: 10;\n        stroke-width: .5px;\n      }\n\n      .cls-3 {\n        opacity: .2;\n      }\n\n      .cls-4 {\n        fill: #a27242;\n      }\n\n      .cls-5 {\n        fill: #b17b69;\n      }\n\n      .cls-6 {\n        fill: #e4a58a;\n      }\n    </style>\n  </defs>\n  <path class=\"cls-2\" d=\"M106.83,37.7h-63.65c-5.15,0-8.59,5.32-6.47,10.02l26.28,58.29c.84,1.85.84,3.98,0,5.83l-26.28,58.29c-2.12,4.7,1.32,10.02,6.47,10.02h63.65c5.15,0,8.59-5.32,6.47-10.02l-26.28-58.29c-.84-1.86-.84-3.98,0-5.83l26.28-58.29c2.12-4.7-1.32-10.02-6.47-10.02Z\"/>\n  <g>\n    <g>\n      <path class=\"cls-4\" d=\"M75.72,29.32s-3.32-.74-6.41,1.97c-2.24,1.96-3.95,5-3.79,8.05.07,1.35.51,2.72.22,4.04-.22,1-.83,1.89-1.02,2.9-.31,1.72.67,3.48.36,5.2-.16.88-.62,1.88-.06,2.58.21.27-.22,4.64.11,4.75,1.91.62,4.72-1.11,6.68-1.08,1.71.03,3.4-3.07,5.11-3.06,1.75,0,3.5.01,5.25.01,1.26,0,2.58.37,3.44-.83.54-.75.64-1.73.53-2.64-.12-.91-.43-1.78-.67-2.67-.24-.89-.4-1.82-.2-2.72.18-.83.66-1.59.74-2.44.11-1.26-.69-2.41-.92-3.65-.13-.72-.08-1.46-.12-2.19-.18-2.85-2.24-5.67-4.61-7.16-1-.63-2.14-1.05-3.33-1.13-.39-.03-.95.15-1.31.07Z\"/>\n      <path class=\"cls-6\" d=\"M100.02,84.95l-9.39,18.74,3.68,1.67s13.38-18.17,13.38-21.25-4.56-9.91-9.19-17.09c-2-3.1-4.33-6.38-7.86-7.75-3.46-1.34-8.26-1.28-9.66-2.68s-1.22-6.46-1.22-6.46l-8.11.36s.06,4.95-1.09,6.11c-1.15,1.15-4.72,1.12-7.91,1.73-3.24.62-5.14,3.12-8.28,6.84-3.49,4.14-13.07,15.57-13.18,18.38-.11,2.81,12.87,24.02,12.87,24.02l3.81-1.76-8.36-21.69s10.11-10.89,10.83-12.53c0,0-.33.73-.34,5.58-.01,7.2,2.73,13.85,2.73,20.17,0,4.58-6,11.87-7.96,21.39-2.36,11.4.44,36.31.59,42.09.15,5.77,3.03,44.3,3.03,44.3l6.14.16s2.45-18.32,2.75-24.63c.3-6.31.04-15.29.38-18.16.34-2.89,4.18-17.97,6.34-38.55.22-2.11.92-3.69,1.03-4.6-.04.32.45,1.95.68,4.57.28,3.15.26,8.04.78,13.3.69,6.98,2,14.95,2.88,23.74.21,2.15.91,4.32,1.13,6.48.53,5.31.36,10.58.8,15.49,1.31,14.52,2.83,25.89,2.83,25.89l5.74-.05s1.6-19.37,1.68-28.9c.08-9.53-.91-16.73-.91-19.02s3.24-16.06,3.64-28.88c.23-7.56-.45-13.99-.68-15.34-1.37-7.9-7.06-14.93-7.06-20.4,0-6.72,2.61-11.34,3.23-17.05.54-4.96-.15-7.9-.15-7.9,1.09,2.28,10.41,13.71,10.41,13.71Z\"/>\n      <path class=\"cls-1\" d=\"M60.32,71.58c-.5.5-1.82,2.54-1.61,6.03.21,3.49,1.18,5.15,1.8,6.01.85,1.17,27.73,1.2,28.42.17.33-.49,2.05-2.06,2.19-6.03.14-3.96-1.26-5.93-1.51-6.53-.15-.34-2.22-1.69-6.4-1.69s-6.02,1.43-8.94,1.51c-2.67.07-4.73-1.92-8.49-1.64-4.01.29-5.22,1.93-5.46,2.17Z\"/>\n      <path class=\"cls-1\" d=\"M75.95,127.6c1.56-1.63,3.92-6.7,8.13-10.14,4.21-3.44,8.69-4.43,8.58-4.98-.23-1.14-.5-2-1.03-2.75-.45-.63-9.97,3.2-17.29,3.23-7.34.03-16.27-3.15-16.64-2.81-.75.68-1.46,2.43-1.61,3.36-.15.91,3.85,1.95,7.86,4.62,4.01,2.67,7.71,7.9,9.52,9.43.53.45,2.13.41,2.49.04Z\"/>\n      <g>\n        <path class=\"cls-6\" d=\"M90.62,103.69s-.82,1.59-1.46,1.95c-.64.36-2.7,1.43-3.19,1.8s-1.8,1.28-1.99,1.52c-.19.24-1.82,2.53-1.56,2.98.26.45.69.47.96.19.28-.28,1.52-2.31,1.78-2.44.26-.13.6-.02.6.41,0,0-1.35,2.38-1.54,2.76-.19.39-.88,1.41-.71,1.78s.66.58.92.28c.26-.3,2.25-3.49,2.44-3.75.19-.26.32.02.13.28-.19.26-.36.62-.47,1.05-.11.43-.94,2.46-.99,2.76s.17.73.66.47c.49-.26.94-1.39,1.09-1.76.15-.36.96-2.53,1.37-2.42.41.11-.47,1.99-.62,2.29-.15.3-.24.75.13.9s1.07-.96,1.24-1.33.64-1.56,1.11-1.99c.47-.43,2.21-2.89,2.46-3.66.26-.77.75-1.72,1.31-2.4l-3.68-1.67Z\"/>\n        <path class=\"cls-5\" d=\"M84.2,111.11s-.05,0-.08-.02c-.06-.04-.08-.13-.04-.19.64-.95.87-1.26,1.01-1.33.18-.09.39-.09.55.01.16.1.25.28.25.52,0,.02,0,.05-.02.07l-.39.69c-.04.07-.12.09-.19.05-.07-.04-.09-.12-.05-.19l.37-.65c0-.12-.05-.21-.12-.25-.08-.05-.18-.05-.28,0-.13.08-.67.89-.91,1.23-.03.04-.07.06-.11.06Z\"/>\n        <path class=\"cls-5\" d=\"M82.44,111.69s-.03,0-.04,0c-.07-.02-.11-.1-.09-.17.26-.83,1.39-2.42,1.57-2.63.15-.18.82-.67,1.61-1.25.16-.12.3-.22.41-.3.06-.04.15-.03.19.03.04.06.03.15-.03.19-.11.08-.25.18-.41.3-.53.38-1.42,1.03-1.56,1.2-.16.2-1.27,1.76-1.52,2.54-.02.06-.07.1-.13.1Z\"/>\n        <path class=\"cls-5\" d=\"M83.98,109.1s-.06-.01-.09-.03c-.06-.05-.07-.13-.02-.19.15-.18.82-.67,1.61-1.25.16-.12.3-.22.41-.3.3-.22,1.14-.69,2.01-1.15.07-.04.15-.01.19.05.04.07.01.15-.06.19-.81.44-1.68.92-1.97,1.13-.11.08-.25.18-.41.3-.53.38-1.42,1.03-1.56,1.2-.03.03-.07.05-.11.05Z\"/>\n      </g>\n      <g>\n        <path class=\"cls-6\" d=\"M57.86,105.8c.31.59.84,1.17,1.55.97.71-.2,1.88-.92,2.55-1.04.66-.13,1.6-.43,1.96-.31.36.13,2.39,2.21,2.37,2.52-.03.31-.31.74-.81.53s-1.73-1.48-1.88-1.5c-.15-.03-.66.61-.66.61,0,0,3.69,3.36,3.74,3.67.05.31-.25.79-.69.61-.43-.18-3.39-2.44-3.39-2.44,0,0,3.16,3.16,3.18,3.49.03.33-.31.66-.79.41-.48-.25-3.21-2.8-3.49-2.8s-.41.18-.41.18c0,0,2.51,2.62,2.49,2.84-.02.22-.31.8-.9.56-.59-.24-2.83-2.82-3.14-2.85-.31-.03-2.12.2-3-.61-.88-.81-2.49-3.07-2.49-3.07l3.81-1.76Z\"/>\n        <path class=\"cls-5\" d=\"M66.16,112.04c-.08,0-.16-.02-.24-.05-.24-.1-1.13-.74-1.95-1.35.21.22.42.44.63.66.05.05.05.14,0,.19-.06.05-.14.05-.19,0-.88-.93-1.9-1.96-1.92-1.97-.05-.05-.05-.13,0-.19.05-.05.13-.06.19-.02.82.63,3.01,2.28,3.35,2.43.12.05.23.03.32-.04.14-.11.2-.3.18-.42-.11-.26-2.33-2.34-3.7-3.59-.06-.05-.06-.14,0-.19.05-.06.14-.06.19,0,1.12,1.02,3.73,3.43,3.78,3.74.04.23-.08.52-.28.68-.11.09-.23.13-.36.13Z\"/>\n        <path class=\"cls-5\" d=\"M64.29,109s-.07-.01-.09-.04l-1.37-1.28c-.05-.05-.06-.13-.01-.19.56-.7.73-.67.79-.66.09.02.2.11.65.51.41.37.98.88,1.26,1,.15.06.28.06.39-.01.15-.09.22-.27.24-.41-.05-.27-1.94-2.26-2.28-2.38-.26-.09-.94.13-1.49.3-.11.04-.22.07-.32.1-.62.19-1.42.45-1.65.53l-.06.02c-.07.02-.15-.02-.17-.09-.02-.07.02-.15.09-.17l.06-.02c.23-.08,1.04-.34,1.66-.53.1-.03.21-.07.32-.1.65-.21,1.32-.42,1.67-.3.34.12,2.49,2.25,2.46,2.66-.02.19-.12.47-.36.62-.13.08-.34.15-.64.03-.33-.13-.89-.64-1.35-1.05-.2-.18-.42-.38-.5-.44-.08.05-.27.24-.46.46l1.28,1.19c.06.05.06.14,0,.19-.03.03-.06.04-.1.04Z\"/>\n      </g>\n      <g>\n        <path class=\"cls-6\" d=\"M64.52,205.26c-.44,3.01-.97,9.03-.82,10.5.11,1.09,1.14,3.9.38,5.16-.63,1.06-2.48.41-4.15.55-1.67.14-2.89.61-4.23.68-1.61.08-5.73.66-6.21-.17-.51-.89,1.07-1.31,2.07-1.99.86-.58,2.9-1.26,4.01-1.8,1.12-.55,2.23-1.05,2.5-1.45.78-1.15.3-11.64.3-11.64l6.14.16Z\"/>\n        <path class=\"cls-5\" d=\"M49.95,222.35s-.09-.03-.12-.07c-.07-.12-.08-.25-.03-.37.15-.41.91-.7,1.88-1.08.25-.1.51-.2.77-.3.07-.03.15,0,.18.07.03.07,0,.15-.07.18-.26.11-.52.21-.78.31-.8.31-1.62.62-1.72.91-.02.05-.01.09.02.14.04.07.01.15-.05.19-.02.01-.04.02-.07.02Z\"/>\n        <path class=\"cls-5\" d=\"M49.53,222.06s-.1-.03-.12-.07c0-.02-.08-.16,0-.39.19-.49,1.02-.99,2.39-1.44.07-.02.15.02.17.09.02.07-.02.15-.09.17-1.67.55-2.1,1.03-2.21,1.26-.05.12-.03.18-.03.19.04.07.01.15-.06.18-.02.01-.04.02-.06.02Z\"/>\n      </g>\n      <g>\n        <path class=\"cls-6\" d=\"M84.12,208.78s.13,1.25.13,3.12c0,1.42-.22,2.27-.22,3.11s-.25,2.64-.4,3.12c-.63,1.99-1.59,3.18-1.26,4.04.38.97,2.56.8,4.96.51,2.75-.33,4.61-.57,4.79-1.6.17-.97-.83-2.37-1.53-3.41-.7-1.04-.72-8.96-.72-8.96l-5.74.05Z\"/>\n        <path class=\"cls-5\" d=\"M84.86,222.97h0c-.08,0-.14-.06-.13-.14l.03-1.91c0-.07.06-.13.14-.13h0c.08,0,.14.06.13.14l-.03,1.91c0,.07-.06.13-.14.13Z\"/>\n        <path class=\"cls-5\" d=\"M87.24,222.7c-.07,0-.12-.05-.13-.12l-.24-1.64c-.01-.07.04-.14.12-.16.07,0,.14.04.16.12l.24,1.64c.01.07-.04.14-.12.16,0,0-.01,0-.02,0Z\"/>\n        <path class=\"cls-5\" d=\"M89.48,222.45c-.06,0-.11-.04-.13-.1l-.43-1.39c-.02-.07.02-.15.09-.17.07-.02.15.02.17.09l.43,1.39c.02.07-.02.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n        <path class=\"cls-5\" d=\"M91.24,222.02c-.06,0-.11-.04-.13-.09l-.42-1.25c-.02-.07.01-.15.09-.17.07-.02.15.01.17.09l.42,1.25c.02.07-.01.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n      </g>\n      <path class=\"cls-5\" d=\"M74.87,100.85c-.06,0-.11-.03-.13-.09l-.76-2.13c-.03-.07.01-.15.08-.17.07-.03.15.01.17.08l.76,2.13c.03.07-.01.15-.08.17-.02,0-.03,0-.05,0Z\"/>\n      <path class=\"cls-5\" d=\"M72.67,60.13s-.02,0-.03,0l-6.8-1.48c-.07-.02-.12-.09-.1-.16.02-.07.09-.12.16-.1l6.8,1.48c.07.02.12.09.1.16-.01.06-.07.11-.13.11Z\"/>\n      <path class=\"cls-5\" d=\"M77.99,60.13c-.06,0-.12-.04-.13-.11-.02-.07.03-.15.1-.16l6.46-1.44c.07-.02.15.03.16.1.02.07-.03.15-.1.16l-6.46,1.44s-.02,0-.03,0Z\"/>\n      <path class=\"cls-5\" d=\"M89.61,71.37c-.06,0-.12-.04-.13-.11l-.46-2.05c-.02-.07.03-.15.1-.16.08-.02.15.03.16.1l.46,2.05c.02.07-.03.15-.1.16,0,0-.02,0-.03,0Z\"/>\n      <path class=\"cls-5\" d=\"M60.66,71.22s-.04,0-.06-.02c-.07-.04-.09-.12-.06-.18l1.15-2.16c.04-.07.12-.09.18-.06.07.04.09.12.06.18l-1.15,2.16s-.07.07-.12.07Z\"/>\n      <path class=\"cls-5\" d=\"M82.6,168s-.08-.02-.11-.05l-2.39-2.96c-.05-.06-.04-.14.02-.19.06-.05.14-.04.19.02l2.39,2.96c.05.06.04.14-.02.19-.03.02-.06.03-.09.03Z\"/>\n      <path class=\"cls-5\" d=\"M89.21,167.03s-.03,0-.05,0c-.07-.03-.11-.1-.08-.18l1.37-3.76c.03-.07.1-.11.18-.08.07.03.11.1.08.18l-1.37,3.76c-.02.06-.07.09-.13.09Z\"/>\n      <path class=\"cls-5\" d=\"M58.04,168.69s-.08-.02-.11-.06l-2.16-2.96c-.04-.06-.03-.15.03-.19.06-.04.15-.03.19.03l2.16,2.96c.04.06.03.15-.03.19-.02.02-.05.03-.08.03Z\"/>\n      <path class=\"cls-5\" d=\"M67.43,163.63c-.07,0-.13-.05-.14-.12l-.46-3.34c-.01-.07.04-.14.12-.15.07-.01.14.04.15.12l.46,3.34c.01.07-.04.14-.12.15,0,0-.01,0-.02,0Z\"/>\n    </g>\n    <g>\n      <path class=\"cls-5\" d=\"M71.65,51.47c1.38,1.17,3,1.88,4.06,1.88s2.73-.64,4.06-1.76v-1.66l-8.11.36v1.18Z\"/>\n      <path class=\"cls-6\" d=\"M80.97,31.99c-2.35-2.03-4.62-2.02-5.27-2.02s-2.92,0-5.27,2.02c-2.27,1.96-2.98,4.76-2.76,8.41.22,3.65.94,6.68,2.36,8.87,1.42,2.2,4.15,3.68,5.66,3.68s4.15-1.26,5.44-3.32c1.28-2.06,2.37-5.58,2.59-9.23.22-3.65-.49-6.46-2.76-8.41Z\"/>\n      <path class=\"cls-6\" d=\"M82.91,41.65c.71-.86,2.31.06,2.09,1.68-.22,1.62-1.72,3.26-2.66,3.26-.94,0-.39-3.78.57-4.94Z\"/>\n      <path class=\"cls-6\" d=\"M68.66,41.65c-.71-.86-2.31.06-2.09,1.68.22,1.62,1.72,3.26,2.66,3.26.94,0,.39-3.78-.57-4.94Z\"/>\n      <path class=\"cls-4\" d=\"M81.02,31.89c-.69-.62-1.48-1.12-2.34-1.46-1.95-.79-4.21-.76-6.13.1-2.13.95-3.71,2.78-5.21,4.56-.6.71-1.21,1.43-1.53,2.3-.35.94-.31,1.93-.35,2.91-.04,1.16-.16,2.33-.24,3.49-.03.47-.07.94-.22,1.38-.23.68-.72,1.24-1.12,1.85-.81,1.25-1.21,2.76-1.13,4.25.03.61.15,1.22.09,1.83-.12,1.35-1.02,2.48-1.94,3.48-1.07,1.17-2.25,2.34-2.34,4-.1,1.77.49,3.49.7,5.23.22,1.87-.37,3.45-1.21,5.08-.03.06-.06.12-.06.19,0,.18.21.27.39.28.98.08,1.77-.82,2.16-1.72s.58-1.92,1.21-2.68c.85-1.03,2.37-1.41,3.01-2.57.62-1.13.21-2.67,1-3.7.49-.63,1.31-.89,2.05-1.19.59-.24,1.44-.53,1.88-1,.44-.46.71-1.29.95-1.87.2-.47.4-.96.38-1.47-.04-.91-.77-1.63-1.14-2.46-.65-1.44-.21-3.11-.27-4.68-.08-1.89-.88-3.69-.94-5.57-.08-2.5,1.18-4.89,2.88-6.72.38-.41.8-.81,1.32-1,.43-.15.89-.16,1.34-.16,1.12,0,2.33.01,3.24.67,1.85,1.34,1.48,4.54,3.35,5.85.83.58,1.95.63,2.89.25.23-2.22.23-4.55-.65-6.6-.46-1.08-1.17-2.05-2.04-2.84Z\"/>\n      <path class=\"cls-3\" d=\"M63.38,63.79s-.05,0-.07-.02c-.06-.04-.08-.12-.04-.19.8-1.26.6-2.79.42-4.13-.12-.91-.24-1.76-.02-2.43.15-.46.6-.95.99-1.39.14-.15.27-.3.37-.43.05-.06.13-.07.19-.02.06.05.07.13.02.19-.11.13-.24.28-.38.44-.38.42-.8.89-.93,1.29-.19.6-.08,1.43.04,2.31.19,1.39.4,2.96-.45,4.31-.03.04-.07.06-.12.06Z\"/>\n      <path class=\"cls-3\" d=\"M60.34,65.67s0,0-.01,0c-.08,0-.13-.07-.12-.15.27-3.08-.33-5.03-.34-5.05-.02-.07.02-.15.09-.17.07-.02.15.02.17.09.03.08.62,2.01.35,5.15,0,.07-.07.12-.14.12Z\"/>\n      <path class=\"cls-4\" d=\"M79.92,52.56c.11,1.77.32,3.54.62,5.29.1.56.21,1.13.5,1.62.43.7,1.23,1.15,2.05,1.22.82.07,1.65-.21,2.31-.71.6-.45,1.1-1.08,1.81-1.32.5-.16,1.11,0,1.63.07-1.21-2.16-2.51-4.52-2.62-6.99-.05-1.16-.6-2.17-.7-3.33-.05-.53-.06-1.07.04-1.59.09-.46.27-.89.39-1.34.26-1.01.2-2.1-.18-3.06l-5.86,10.14Z\"/>\n      <path class=\"cls-3\" d=\"M81.74,56.08c-.06,0-.12-.04-.13-.11-.24-1.16-.47-2.34-.66-3.5-.01-.07.04-.15.11-.16.07-.01.15.04.16.11.2,1.15.42,2.33.66,3.49.02.07-.03.15-.11.16,0,0-.02,0-.03,0Z\"/>\n      <path class=\"cls-3\" d=\"M84.75,58.7c-.2,0-.38-.06-.54-.19-.59-.46-.69-1.61-.69-1.66,0-.08.05-.14.13-.15.07,0,.14.05.15.12,0,.01.09,1.08.59,1.47.14.11.3.15.49.12.49-.08.76-.3,1.02-.52.28-.24.56-.48,1.09-.49.08,0,.14.06.14.13,0,.08-.06.14-.13.14-.43,0-.65.2-.92.42-.27.23-.58.49-1.15.59-.05,0-.11.01-.16.01Z\"/>\n      <path class=\"cls-3\" d=\"M84.03,52.73c-.06,0-.11-.04-.13-.1-.29-1.02-.41-2.13-.48-3.49,0-.08.05-.14.13-.14.08,0,.14.05.14.13.08,1.34.19,2.44.47,3.43.02.07-.02.15-.09.17-.01,0-.03,0-.04,0Z\"/>\n      <path class=\"cls-3\" d=\"M68.3,37.3s-.02,0-.03,0c-.07-.02-.12-.09-.1-.16.02-.1.59-2.57,2.28-4.1,1.72-1.54,4.33-.82,4.44-.79.07.02.11.1.09.17-.02.07-.1.12-.17.09-.03,0-2.58-.71-4.18.73-1.63,1.46-2.19,3.93-2.2,3.95-.01.06-.07.11-.13.11Z\"/>\n      <path class=\"cls-3\" d=\"M79.58,31.4s-.06,0-.08-.03c-1.52-1.09-3.85-.55-3.88-.55-.07.02-.15-.03-.16-.1-.02-.07.03-.15.1-.16.1-.02,2.47-.57,4.1.59.06.04.08.13.03.19-.03.04-.07.06-.11.06Z\"/>\n      <path class=\"cls-3\" d=\"M83.6,41.32s-.03,0-.04,0c-3.07-.98-3.82-7.09-3.85-7.35,0-.07.04-.14.12-.15.07,0,.14.04.15.12,0,.06.76,6.19,3.67,7.12.07.02.11.1.09.17-.02.06-.07.09-.13.09Z\"/>\n      <path class=\"cls-3\" d=\"M84.71,37.68c-.06,0-.12-.05-.13-.11-.38-1.9-2.1-3.25-2.11-3.26-.06-.05-.07-.13-.02-.19.05-.06.13-.07.19-.02.07.06,1.82,1.43,2.22,3.43.01.07-.03.15-.11.16,0,0-.02,0-.03,0Z\"/>\n      <path class=\"cls-3\" d=\"M67.27,53.02s-.02,0-.03,0c-.07-.02-.12-.09-.1-.17.66-2.54-.47-5.05-.49-5.07-.03-.07,0-.15.07-.18.07-.03.15,0,.18.07.05.11,1.19,2.62.5,5.26-.02.06-.07.1-.13.1Z\"/>\n    </g>\n  </g>\n</svg>";

    function generateBodyTypeHtml(gender) {
        const bodyTypes = gender === 'male'
            ? [
                { value: 'rectangle', label: 'Dikdörtgen', icon: erkekDikdortgenIcon },
                { value: 'inverted-triangle', label: 'Ters Üçgen', icon: erkekTersUcgenIcon },
                { value: 'triangle', label: 'Üçgen', icon: erkekUcgenIcon },
                { value: 'round', label: 'Yuvarlak', icon: erkekYuvarlakIcon },
            ]
            : [
                { value: 'rectangle', label: 'Dikdörtgen', icon: kadinDikdortgenIcon },
                { value: 'pear', label: 'Armut', icon: kadinArmutIcon },
                { value: 'strawberry', label: 'Çilek', icon: kadinCilekIcon },
                { value: 'apple', label: 'Elma', icon: kadinElmaIcon },
                { value: 'hourglass', label: 'Kum Saati', icon: kadinKumSaatiIcon },
            ];
        return bodyTypes
            .map((type) => {
            let iconHTML;
            if (type.icon && typeof type.icon === 'string') {
                const cleanIcon = type.icon.trim();
                if (cleanIcon.includes('<svg') || cleanIcon.startsWith('<?xml')) {
                    let svgContent = cleanIcon;
                    const svgMatch = cleanIcon.match(/<svg[\s\S]*<\/svg>/i);
                    if (svgMatch) {
                        svgContent = svgMatch[0];
                    }
                    else {
                        svgContent = cleanIcon.replace(/^<\?xml[\s\S]*?\?>\s*/i, '');
                    }
                    if (!svgContent.includes('width=') && !svgContent.includes('height=')) {
                        svgContent = svgContent.replace(/<svg([^>]*)>/i, '<svg$1 width="100%" height="100%" preserveAspectRatio="xMidYMid meet">');
                    }
                    iconHTML = svgContent;
                }
                else {
                    iconHTML = `<div class="yuddy-body-type-icon">${type.icon || '👤'}</div>`;
                }
            }
            else {
                iconHTML = `<div class="yuddy-body-type-icon">👤</div>`;
            }
            return `
        <button type="button" class="yuddy-body-type-btn" data-body-type="${type.value}">
          <div class="yuddy-body-type-icon-wrapper">
            ${iconHTML}
          </div>
          <span class="yuddy-body-type-label">${type.label}</span>
        </button>
      `;
        })
            .join('');
    }

    /** Modal başlık alanı (ikon + başlık) — overlay/body oluşturma DOMManager'da kalır. */
    function buildModalHeaderInnerHtml(buttonColor, modalTitle) {
        return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0; color: ${buttonColor};">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3 class="yuddy-size-chart-modal-title" style="color: ${buttonColor};">${modalTitle}</h3>
      </div>
    `;
    }

    function buildMeasurementResultsHtml(params) {
        const { buttonColor, bmiResult, calculatedSize, matchResults } = params;
        const bestMatch = matchResults[0];
        return `
      <!-- Important Note -->
      <div class="yuddy-calculation-note">
        <div class="yuddy-note-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
            <path d="M12 8V12"/>
            <path d="M12 16H12.01"/>
          </svg>
        </div>
        <div class="yuddy-note-content">
          <strong>Önemli Not:</strong> Tahmin edilen ölçüler, bu ürüne ait beden tablosundan ve girdiğiniz bilgilerden yola çıkarak hesaplanmıştır. 
          Bu tahminler antropometrik veriler ve bilimsel formüllere dayanır ancak kişisel farklılıklar gösterebilir. Satın alma öncesi beden tablosunu kontrol etmenizi öneririz.
        </div>
      </div>

      <!-- BMI Section -->
      <div class="yuddy-result-bmi">
        <label>VKİ (Vücut Kitle İndeksi)</label>
        <div class="yuddy-bmi-display">
          <span class="yuddy-bmi-value" style="color: ${buttonColor}">${bmiResult.value}</span>
          <span class="yuddy-bmi-label">${bmiResult.label}</span>
        </div>
      </div>

      <!-- Recommended Size Section -->
      <div class="yuddy-result-size" style="background-color: ${buttonColor}20; border-color: ${buttonColor}40;">
        <label>ÖNERİLEN BEDEN</label>
        <div class="yuddy-size-display" style="color: ${buttonColor}">
          ${calculatedSize}
        </div>
        ${bestMatch
        ? `
          <div class="yuddy-confidence">
            <div class="yuddy-confidence-bar">
              <div class="yuddy-confidence-fill" style="width: ${bestMatch.confidence}%; background-color: ${buttonColor};">
                <span>%${bestMatch.confidence}</span>
              </div>
            </div>
            <p>Hesaplanan ölçüleriniz bu bedenle %${bestMatch.confidence} oranında eşleşiyor</p>
          </div>
        `
        : ''}
      </div>
    `;
    }

    /** applicableProducts doluysa ve slug eşleşiyorsa true (boş liste false). */
    function applicableProductsHasSlug(applicable, productSlug) {
        if (!applicable?.length) {
            return false;
        }
        return applicable.some((p) => p.slug === productSlug);
    }
    /** Modal tablo filtresi: productId yoksa tümü; boş applicable = tüm ürünler; doluysa id veya slug. */
    function tableAppliesToProductForModal(table, productId) {
        if (!productId) {
            return true;
        }
        if (!table.applicableProducts?.length) {
            return true;
        }
        return table.applicableProducts.some((p) => p.id === productId || p.slug === productId);
    }
    /** Tablo bu ürüne ait mi? (SizeChart.init ile aynı: yalnızca slug eşleşmesi) */
    function findSizeTableForProductSlug(sizeTables, productSlug) {
        if (!sizeTables?.length || !productSlug) {
            return undefined;
        }
        return sizeTables.find((table) => applicableProductsHasSlug(table.applicableProducts, productSlug));
    }
    /** Öneri listesinde bu slug için eşleşen var mı? */
    function hasSizeSuggestionForProductSlug(sizeSuggestions, productSlug) {
        if (!sizeSuggestions?.length || !productSlug) {
            return false;
        }
        return sizeSuggestions.some((suggestion) => applicableProductsHasSlug(suggestion.applicableProducts, productSlug));
    }

    /** Ürüne göre filtrelenmiş beden tabloları */
    function getApplicableTablesForProduct(sizeTables, productId) {
        if (!productId) {
            return sizeTables;
        }
        return sizeTables.filter((table) => tableAppliesToProductForModal(table, productId));
    }
    /** Ürün slug'ına göre öneri listesi */
    function getApplicableSuggestionsForProduct(sizeSuggestions, productId) {
        if (!productId) {
            return [];
        }
        return sizeSuggestions.filter((suggestion) => applicableProductsHasSlug(suggestion.applicableProducts, productId));
    }
    function getRecommendationText(recommendation) {
        const texts = {
            true_to_size: 'Kendi bedenini al',
            size_up: 'Bir beden büyük al',
            size_down: 'Bir beden küçük al',
            runs_small: 'Dar kalıp',
            runs_large: 'Bol kalıp',
        };
        return recommendation ? texts[recommendation] : '';
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function buildTabsHTML(sizeDesign) {
        const hasSizeChartTab = sizeDesign.enableSizeChartTab === true;
        const hasMeasurementTab = sizeDesign.enableMeasurementFinderTab === true;
        if (hasSizeChartTab && hasMeasurementTab) {
            const buttonColor = sizeDesign.buttonColor || '#1976d2';
            return `
        <div class="yuddy-size-chart-tabs">
          <button class="yuddy-size-chart-tab yuddy-size-chart-tab-active" data-tab="size-chart" style="--active-color: ${buttonColor};">
            ${sizeDesign.sizeChartTabTitle || 'Beden Tablosu'}
          </button>
          <button class="yuddy-size-chart-tab" data-tab="measurement-finder" style="--active-color: ${buttonColor};">
            ${sizeDesign.measurementFinderTabTitle || 'Beden Bulucu'}
          </button>
        </div>
      `;
        }
        return '';
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function buildSizeTablesHTML(tables, sizeDesign) {
        if (tables.length === 0) {
            return '<div class="yuddy-size-chart-no-data">Beden tablosu bulunamadı.</div>';
        }
        return tables
            .map((table) => {
            const sortedSizes = [...table.sizes].sort((a, b) => a.order - b.order);
            const sortedGroups = [...table.sizeGroups].sort((a, b) => a.order - b.order);
            let tableHTML = '';
            if (sortedGroups.length > 0) {
                const headerColor = sizeDesign.tableHeaderColor || '#1976d2';
                const textColor = sizeDesign.tableTextColor || '#000000';
                const bgColor = sizeDesign.tableBackgroundColor || '#ffffff';
                tableHTML = `
          <div class="yuddy-size-chart-table-container">
            <div class="yuddy-size-chart-table-header">
              <h4 class="yuddy-size-chart-table-name">${table.name}</h4>
              ${table.description ? `<p class="yuddy-size-chart-table-description">${table.description}</p>` : ''}
            </div>
            <table class="yuddy-size-chart-table" style="background-color: ${bgColor}; color: ${textColor};">
              <thead>
                <tr>
                  <th style="color: #ffffff; font-weight: 700; text-align: left; padding: 12px 8px; color: ${headerColor};">Beden</th>
                  ${sortedSizes.map((size) => `<th style="color: ${headerColor}; font-weight: 700; text-align: center; padding: 12px 8px;">${size.name}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${sortedGroups
                .map((group, groupIndex) => {
                const sortedGroupSizes = [...group.sizes].sort((a, b) => a.order - b.order);
                const rowBgColor = groupIndex % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent';
                return `
                    <tr style="background-color: ${rowBgColor}; border-bottom: 1px solid #eee;">
                      <td style="font-weight: 600; text-align: left; padding: 10px 8px; color: ${textColor};">${group.name} (cm)</td>
                      ${sortedSizes
                    .map((size, sizeIndex) => {
                    let groupSize = sortedGroupSizes.find((gs) => gs.name === size.name);
                    if (!groupSize) {
                        groupSize = sortedGroupSizes[sizeIndex];
                    }
                    const value = groupSize && groupSize.value !== undefined && groupSize.value !== null
                        ? groupSize.value
                        : '-';
                    return `<td style="text-align: center; padding: 10px 8px; color: ${textColor};">${value}</td>`;
                })
                    .join('')}
                    </tr>
                  `;
            })
                .join('')}
              </tbody>
            </table>
            <a 
              href="https://app.yuddy.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                position: absolute;
                right: 10px;
                bottom: 0;
                z-index: 20;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: box-shadow 0.2s;
                text-decoration: none;
                font-size: 13px;
                min-width: 0;
                height: 29px;
              "
              title="Yuddy ile daha fazlası için tıkla"
            >
              <img 
                src="https://media.licdn.com/dms/image/v2/D4D0BAQEqMI-jQQeOSQ/company-logo_200_200/company-logo_200_200/0/1714325250068/jjaliri_logo?e=2147483647&v=beta&t=YnSwc3N6M_EN6_aWXJRpplXEkjfkWS7dFYN8KO3v8Js" 
                alt="Yuddy Logo" 
                style="height: 17px; width: 17px; border-radius: 50%; display: block; margin-right: 4px;"
                loading="lazy"
              />
              <span style="font-weight: 500; color:rgb(0, 0, 0); font-size: 10px; letter-spacing: 0.2px;">yuddy</span>
            </a>
          </div>
        `;
            }
            else if (sortedSizes.length > 0) {
                const headerColor = sizeDesign.tableHeaderColor || '#1976d2';
                const textColor = sizeDesign.tableTextColor || '#000000';
                const bgColor = sizeDesign.tableBackgroundColor || '#ffffff';
                tableHTML = `
          <div class="yuddy-size-chart-table-container">
            <div class="yuddy-size-chart-table-header">
              <h4 class="yuddy-size-chart-table-name">${table.name}</h4>
              ${table.description ? `<p class="yuddy-size-chart-table-description">${table.description}</p>` : ''}
            </div>
            <table class="yuddy-size-chart-table" style="background-color: ${bgColor}; color: ${textColor};">
              <thead>
                <tr>
                  ${sortedSizes
                .map((size) => `<th style="background-color: ${headerColor}; color: #ffffff; font-weight: 700; text-align: center; padding: 12px 8px;">${size.name}</th>`)
                .join('')}
                </tr>
              </thead>
              <tbody>
                <tr style="background-color: rgba(0,0,0,0.02); border-bottom: 1px solid #eee;">
                  ${sortedSizes
                .map((size) => {
                const value = size.value !== undefined && size.value !== null ? size.value : '-';
                return `<td style="text-align: center; padding: 10px 8px; color: ${textColor};">${value}</td>`;
            })
                .join('')}
                </tr>
              </tbody>
            </table>
          </div>
        `;
            }
            return tableHTML;
        })
            .join('');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function buildMeasurementFinderHTML(sizeDesign) {
        const buttonColor = sizeDesign.buttonColor || '#1976d2';
        const buttonText = sizeDesign.measurementFinderButtonText || 'Bedenimi Hesapla';
        return `
      <div class="yuddy-measurement-finder">
        <div class="yuddy-measurement-pages">
          <div class="yuddy-measurement-page yuddy-measurement-page-1 active" data-page="1">
            <div class="yuddy-measurement-form">
              <div class="yuddy-form-section">
                <label class="yuddy-form-label">Cinsiyetiniz nedir?</label>
                <div class="yuddy-gender-selector">
                  <button type="button" class="yuddy-gender-btn" data-gender="male">
                    <span>Erkek</span>
                  </button>
                  <button type="button" class="yuddy-gender-btn" data-gender="female">
                    <span>Kadın</span>
                  </button>
                </div>
              </div>

              <div class="yuddy-form-section yuddy-body-type-section" style="display: none;">
                <label class="yuddy-form-label">Vücut yapınız hangisine daha yakın?</label>
                <div class="yuddy-body-type-grid" id="yuddy-body-type-grid">
                </div>
              </div>

              <div class="yuddy-form-section yuddy-measurement-inputs">
                <div class="yuddy-input-group">
                  <label class="yuddy-input-label">Boy (cm)</label>
                  <input type="number" class="yuddy-input" id="measurement-height" placeholder="" min="100" max="250" />
                </div>
                <div class="yuddy-input-group">
                  <label class="yuddy-input-label">Kilo (kg)</label>
                  <input type="number" class="yuddy-input" id="measurement-weight" placeholder="" min="30" max="200" />
                </div>
              </div>

              <div class="yuddy-form-section">
                <label class="yuddy-form-label">Kıyafet tercihiniz</label>
                <div class="yuddy-fit-selector">
                  ${FIT_OPTIONS.map((option) => `
                    <button type="button" class="yuddy-fit-btn ${option.value === 'regular' ? 'active' : ''}" data-fit="${option.value}">
                      ${option.label}
                    </button>
                  `).join('')}
                </div>
              </div>

              <button type="button" class="yuddy-calculate-btn" style="background-color: ${buttonColor};" id="measurement-calculate-btn">
                ${buttonText}
              </button>
            </div>
          </div>

          <div class="yuddy-measurement-page yuddy-measurement-page-2" data-page="2" style="display: none;">
            <div class="yuddy-measurement-results" id="measurement-results">
              <div class="yuddy-results-header">
                <h4>Hesaplama Sonuçları</h4>
              </div>
              <div class="yuddy-results-content" id="measurement-results-content">
              </div>
            </div>
          </div>
        </div>

        <div class="yuddy-measurement-tabs">
          <button type="button" class="yuddy-measurement-tab active" data-tab="1">
            <span class="yuddy-tab-number">1</span>
            <span class="yuddy-tab-label">Bilgiler</span>
          </button>
          <button type="button" class="yuddy-measurement-tab" data-tab="2">
            <span class="yuddy-tab-number">2</span>
            <span class="yuddy-tab-label">Sonuçlar</span>
          </button>
        </div>
      </div>
    `;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function buildContentHTML(sizeDesign, applicableTables) {
        const hasSizeChartTab = sizeDesign.enableSizeChartTab === true;
        const hasMeasurementTab = sizeDesign.enableMeasurementFinderTab === true;
        const hasBothTabs = hasSizeChartTab && hasMeasurementTab;
        let sizeChartContent = '';
        if (hasSizeChartTab) {
            const isActive = !hasMeasurementTab || hasBothTabs;
            sizeChartContent = `
        <div class="yuddy-size-chart-tab-content ${isActive ? 'yuddy-size-chart-tab-content-active' : ''}" data-content="size-chart" style="${isActive ? '' : 'display: none;'}">
          ${buildSizeTablesHTML(applicableTables, sizeDesign)}
        </div>
      `;
        }
        let measurementContent = '';
        if (hasMeasurementTab) {
            const isActive = !hasSizeChartTab;
            measurementContent = `
        <div class="yuddy-size-chart-tab-content ${isActive ? 'yuddy-size-chart-tab-content-active' : ''}" data-content="measurement-finder" style="${isActive ? '' : 'display: none;'}">
          ${buildMeasurementFinderHTML(sizeDesign)}
        </div>
      `;
        }
        return sizeChartContent + measurementContent;
    }
    /**
     * Modal gövdesinde gösterilecek tam widget HTML'i.
     */
    function buildSizeChartWidgetHtml(params) {
        const { measurements, recommendation, sizeChartData, productId } = params;
        if (!sizeChartData) {
            const recommendationText = getRecommendationText(recommendation);
            return `
        <div id="yuddy-size-chart" class="yuddy-size-chart-widget">
          <div class="yuddy-size-chart-content">
            <div class="yuddy-size-chart-measurements">
              <div class="yuddy-size-chart-measurement-item">
                <span class="yuddy-size-chart-label">Göğüs:</span>
                <span class="yuddy-size-chart-value">${measurements.chest} cm</span>
              </div>
              <div class="yuddy-size-chart-measurement-item">
                <span class="yuddy-size-chart-label">Bel:</span>
                <span class="yuddy-size-chart-value">${measurements.waist} cm</span>
              </div>
              <div class="yuddy-size-chart-measurement-item">
                <span class="yuddy-size-chart-label">Kalça:</span>
                <span class="yuddy-size-chart-value">${measurements.hip} cm</span>
              </div>
            </div>
            ${recommendation
            ? `
              <div class="yuddy-size-chart-recommendation">
                <div class="yuddy-size-chart-recommendation-badge">
                  ${recommendationText}
                </div>
              </div>
            `
            : ''}
          </div>
        </div>
      `;
        }
        const { sizeDesign, sizeTables } = sizeChartData;
        const applicableTables = getApplicableTablesForProduct(sizeTables, productId);
        const tabsHTML = buildTabsHTML(sizeDesign);
        const contentHTML = buildContentHTML(sizeDesign, applicableTables);
        return `
      <div id="yuddy-size-chart" class="yuddy-size-chart-widget" style="background-color: ${sizeDesign.tableBackgroundColor || '#ffffff'}">
        <div class="yuddy-size-chart-content">
          ${tabsHTML}
          ${contentHTML}
        </div>
      </div>
    `;
    }

    /**
     * Beden tablosunu `findBestSizeFromTable` giriş formatına çevirir (saf veri; DOM yok).
     */
    function convertSizeTableToMatchFormat(sizeTable) {
        const sizes = [];
        const measurements = {};
        const sortedSizes = [...sizeTable.sizes].sort((a, b) => a.order - b.order);
        sortedSizes.forEach((size) => {
            sizes.push(size.name);
            measurements[size.name] = {};
        });
        if (sizeTable.sizeGroups && sizeTable.sizeGroups.length > 0) {
            const groups = sizeTable.sizeGroups.sort((a, b) => a.order - b.order);
            groups.forEach((group) => {
                const normalizedKey = normalizeMeasurementKey(group.name);
                if (!normalizedKey) {
                    console.warn(`[Size Chart] Ölçü adı normalize edilemedi: "${group.name}"`);
                    return;
                }
                sortedSizes.forEach((size) => {
                    const sizeItem = group.sizes.find((s) => s.name === size.name);
                    if (sizeItem && sizeItem.value > 0) {
                        if (!measurements[size.name]) {
                            measurements[size.name] = {};
                        }
                        measurements[size.name][normalizedKey] = sizeItem.value;
                    }
                });
            });
        }
        else {
            sortedSizes.forEach((size) => {
                if (size.value > 0) {
                    measurements[size.name] = { chest: size.value };
                }
            });
        }
        return { sizes, measurements };
    }

    class DOMManager {
        constructor() {
            this.isInitialized = false;
            this.modalElement = null;
            this.currentMeasurements = null;
            this.currentRecommendation = null;
            this.currentSizeChartData = null;
            this.currentProductId = null;
            this.lastInjectedProductId = null; // Son buton eklenen productId'yi takip et
            this.currentPlatform = null;
            // Cleanup on page unload
            window.addEventListener('beforeunload', () => {
                this.cleanup();
            });
        }
        /**
         * Initialize DOM Manager
         */
        async init(measurements, recommendation, sizeChartData, productId) {
            this.currentPlatform = detectPlatform();
            if (this.isInitialized) {
                return;
            }
            // Store measurements, recommendation, and size chart data for modal
            this.currentMeasurements = measurements;
            this.currentRecommendation = recommendation;
            this.currentSizeChartData = sizeChartData || null;
            this.currentProductId = productId || null;
            // Sadece slug değiştiğinde buton ekle
            if (this.currentProductId !== this.lastInjectedProductId) {
                // Önceki butonları temizle
                this.removeSizeChartButton();
                // Yeni buton ekle
                this.injectSizeChartButton();
                // Son eklenen productId'yi kaydet
                this.lastInjectedProductId = this.currentProductId;
            }
            this.isInitialized = true;
        }
        buildModalBodyHtml(measurements, recommendation) {
            return buildSizeChartWidgetHtml({
                measurements,
                recommendation,
                sizeChartData: this.currentSizeChartData,
                productId: this.currentProductId,
            });
        }
        /**
         * Remove existing widget (not used anymore, widget only shown in modal)
         */
        removeExistingWidget() {
            const existing = document.getElementById('yuddy-size-chart');
            if (existing) {
                existing.remove();
            }
        }
        /**
         * Update widget with new data
         */
        update(measurements, recommendation, sizeChartData, productId) {
            // Store for modal
            this.currentMeasurements = measurements;
            this.currentRecommendation = recommendation;
            if (sizeChartData) {
                this.currentSizeChartData = sizeChartData;
            }
            // ProductId değiştiyse buton ekle
            if (productId !== undefined) {
                const previousProductId = this.currentProductId;
                this.currentProductId = productId || null;
                // Sadece slug değiştiğinde buton ekle
                if (this.currentProductId !== this.lastInjectedProductId && this.currentProductId !== previousProductId) {
                    this.currentPlatform = detectPlatform();
                    // Önceki butonları temizle
                    this.removeSizeChartButton();
                    // Yeni buton ekle
                    this.injectSizeChartButton();
                    // Son eklenen productId'yi kaydet
                    this.lastInjectedProductId = this.currentProductId;
                }
            }
            // Update modal if open
            if (this.modalElement) {
                const modalBody = this.modalElement.querySelector('.yuddy-size-chart-modal-body');
                if (modalBody) {
                    modalBody.innerHTML = this.buildModalBodyHtml(measurements, recommendation);
                    // Re-attach tab event listeners
                    this.attachTabListeners();
                }
            }
        }
        /** Beden bulucu formu — event bağları */
        attachMeasurementFinderListeners() {
            if (!this.modalElement)
                return;
            // Gender selection
            const genderButtons = this.modalElement.querySelectorAll('.yuddy-gender-btn');
            genderButtons.forEach((btn) => {
                btn.addEventListener('click', () => {
                    genderButtons.forEach((b) => b.classList.remove('active'));
                    btn.classList.add('active');
                    const gender = btn.dataset.gender;
                    // Show body type section
                    const bodyTypeSection = this.modalElement?.querySelector('.yuddy-body-type-section');
                    if (bodyTypeSection) {
                        bodyTypeSection.style.display = 'block';
                    }
                    // Update body type grid based on gender
                    const bodyTypeGrid = this.modalElement?.querySelector('#yuddy-body-type-grid');
                    if (bodyTypeGrid && gender) {
                        bodyTypeGrid.innerHTML = generateBodyTypeHtml(gender);
                        // Re-attach body type listeners
                        const newBodyTypeButtons = this.modalElement?.querySelectorAll('.yuddy-body-type-btn');
                        newBodyTypeButtons?.forEach((bodyBtn) => {
                            bodyBtn.addEventListener('click', () => {
                                newBodyTypeButtons.forEach((b) => b.classList.remove('active'));
                                bodyBtn.classList.add('active');
                            });
                        });
                    }
                });
            });
            // Body type selection (initial load - will be re-attached on gender change)
            const bodyTypeButtons = this.modalElement?.querySelectorAll('.yuddy-body-type-btn');
            bodyTypeButtons?.forEach((btn) => {
                btn.addEventListener('click', () => {
                    bodyTypeButtons.forEach((b) => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
            // Fit preference selection
            const fitButtons = this.modalElement?.querySelectorAll('.yuddy-fit-btn');
            fitButtons?.forEach((btn) => {
                btn.addEventListener('click', () => {
                    fitButtons.forEach((b) => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
            // Calculate button
            const calculateBtn = this.modalElement?.querySelector('#measurement-calculate-btn');
            calculateBtn?.addEventListener('click', () => {
                this.handleMeasurementCalculation();
                // Switch to page 2 on mobile after calculation
                this.switchToMeasurementPage(2);
            });
            // Mobile tab navigation
            const tabButtons = this.modalElement?.querySelectorAll('.yuddy-measurement-tab');
            tabButtons?.forEach((tab) => {
                tab.addEventListener('click', () => {
                    const pageNumber = parseInt(tab.dataset.tab || '1');
                    this.switchToMeasurementPage(pageNumber);
                });
            });
        }
        /**
         * Handle measurement calculation
         */
        handleMeasurementCalculation() {
            if (!this.modalElement || !this.currentSizeChartData)
                return;
            // Get form values
            const genderBtn = this.modalElement.querySelector('.yuddy-gender-btn.active');
            const bodyTypeBtn = this.modalElement.querySelector('.yuddy-body-type-btn.active');
            const heightInput = this.modalElement.querySelector('#measurement-height');
            const weightInput = this.modalElement.querySelector('#measurement-weight');
            const fitBtn = this.modalElement.querySelector('.yuddy-fit-btn.active');
            const gender = genderBtn?.dataset.gender;
            const bodyType = bodyTypeBtn?.dataset.bodyType;
            const height = heightInput?.value || '';
            const weight = weightInput?.value || '';
            const fitPreference = fitBtn?.dataset.fit || 'regular';
            // Validate
            const validation = validateInputs(height, weight, gender, bodyType);
            if (!validation.isValid) {
                validation.errors.forEach((error) => {
                    console.error('[Size Chart] Validation error:', error);
                    // You can show toast/alert here if needed
                });
                return;
            }
            const heightNum = parseFloat(height);
            const weightNum = parseFloat(weight);
            // Calculate BMI
            const bmiResult = calculateBMI(heightNum, weightNum);
            // Calculate measurements
            const estimatedMeasurements = calculateMeasurements(gender, bodyType, heightNum, weightNum);
            // Get size table from current size chart data
            const applicableTables = getApplicableTablesForProduct(this.currentSizeChartData.sizeTables, this.currentProductId);
            if (applicableTables.length === 0) {
                console.warn('[Size Chart] No applicable size tables found');
                return;
            }
            // Use first applicable table for matching
            const sizeTable = applicableTables[0];
            const sizeTableData = convertSizeTableToMatchFormat(sizeTable);
            // Fit tercihine göre ölçüleri ayarla
            const adjustedMeasurements = applyFitPreference(estimatedMeasurements, fitPreference);
            // Ayarlanmış ölçülere göre en uygun bedeni bul
            const matchResults = findBestSizeFromTable(adjustedMeasurements, sizeTableData);
            // En iyi eşleşme
            const bestMatch = matchResults[0];
            const finalSize = bestMatch.size;
            // Display results
            this.displayMeasurementResults(estimatedMeasurements, bmiResult, finalSize, matchResults);
        }
        /**
         * Switch between measurement pages (mobile)
         */
        switchToMeasurementPage(pageNumber) {
            if (!this.modalElement)
                return;
            // Hide all pages
            const pages = this.modalElement.querySelectorAll('.yuddy-measurement-page');
            pages.forEach((page) => {
                page.style.display = 'none';
                page.classList.remove('active');
            });
            // Show selected page
            const selectedPage = this.modalElement.querySelector(`.yuddy-measurement-page-${pageNumber}`);
            if (selectedPage) {
                selectedPage.style.display = 'block';
                selectedPage.classList.add('active');
            }
            // Update tab buttons
            const tabs = this.modalElement.querySelectorAll('.yuddy-measurement-tab');
            tabs.forEach((tab) => {
                const tabPage = parseInt(tab.dataset.tab || '1');
                if (tabPage === pageNumber) {
                    tab.classList.add('active');
                }
                else {
                    tab.classList.remove('active');
                }
            });
        }
        displayMeasurementResults(_measurements, bmiResult, calculatedSize, matchResults) {
            if (!this.modalElement)
                return;
            const resultsContainer = this.modalElement.querySelector('#measurement-results');
            const resultsContent = this.modalElement.querySelector('#measurement-results-content');
            if (!resultsContainer || !resultsContent)
                return;
            const buttonColor = this.currentSizeChartData?.sizeDesign?.buttonColor || '#1976d2';
            resultsContent.innerHTML = buildMeasurementResultsHtml({
                buttonColor,
                bmiResult,
                calculatedSize,
                matchResults,
            });
            resultsContainer.style.display = 'block';
            if (window.innerWidth > 768) {
                resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        /**
         * Inject size chart button into variant selection area
         */
        injectSizeChartButton() {
            // Remove existing button if any
            this.removeSizeChartButton();
            // Check if we have size tables - button should only be shown if tables exist
            const hasSizeTables = this.currentSizeChartData?.sizeTables && this.currentSizeChartData.sizeTables.length > 0;
            const hasSizeSuggestions = this.currentSizeChartData?.sizeSuggestions && this.currentSizeChartData.sizeSuggestions.length > 0;
            // If no size tables and no suggestions, don't inject anything
            if (!hasSizeTables && !hasSizeSuggestions) {
                return;
            }
            // Try to find variant selection areas
            const variantContainers = collectVariantContainers(document, this.getPlatform());
            // If no variant containers found, still try to inject size suggestions if they exist
            if (variantContainers.length === 0) {
                if (hasSizeSuggestions) {
                    // Try to inject suggestions without button (find a suitable container)
                    this.injectSizeSuggestions(null);
                }
                return;
            }
            // Inject button only if size tables exist
            const buttonContainers = [];
            if (hasSizeTables) {
                let primaryButtonIdAssigned = false;
                variantContainers.forEach((container) => {
                    const assignPrimaryId = !primaryButtonIdAssigned;
                    const buttonAdded = this.addButtonToContainer(container, assignPrimaryId);
                    if (buttonAdded) {
                        primaryButtonIdAssigned = true;
                        buttonContainers.push(container);
                    }
                });
            }
            // Inject suggestions - use first button container if available, otherwise find suitable location
            const suggestionContainer = buttonContainers.length > 0 ? buttonContainers[0] : null;
            if (hasSizeSuggestions) {
                this.injectSizeSuggestions(suggestionContainer);
            }
        }
        /**
           * Add button to variant container
           * @returns true if button was added, false otherwise
           */
        addButtonToContainer(container, assignPrimaryId) {
            // Sepet kontrolü: Element sepet içindeyse buton EKLEME
            if (this.isInsideCart(container)) {
                return false;
            }
            // Only add button if size tables exist
            if (!this.currentSizeChartData?.sizeTables || this.currentSizeChartData.sizeTables.length === 0) {
                return false;
            }
            // Find the last size variant element
            const lastVariant = findLastVariantControlInContainer(container, this.getPlatform());
            if (!lastVariant) {
                return false;
            }
            // Check if button already exists
            const existingButton = container.querySelector(`.${YUDDY_SIZE_CHART_BUTTON_CLASS}`);
            if (existingButton) {
                return false;
            }
            // Create button
            const button = document.createElement('button');
            button.className = YUDDY_SIZE_CHART_BUTTON_CLASS;
            button.setAttribute(YUDDY_SIZE_CHART_BUTTON_DATA_ATTR, YUDDY_SIZE_CHART_BUTTON_DATA_VALUE);
            if (assignPrimaryId) {
                button.id = YUDDY_SIZE_CHART_BUTTON_ID;
            }
            const buttonText = this.currentSizeChartData?.sizeDesign?.title || 'Beden Tablosu';
            // Get button color from sizeDesign, ensure it's a valid color value
            const buttonColor = this.currentSizeChartData?.sizeDesign?.buttonColor?.trim() || '#1976d2';
            button.setAttribute('type', 'button');
            button.setAttribute('aria-label', buttonText);
            // Apply button color from design (use !important to override CSS)
            // Also apply to SVG and span elements
            button.style.setProperty('color', buttonColor, 'important');
            button.style.setProperty('--button-color', buttonColor);
            // Create button content with icon and text (matching admin format)
            // Apply color directly to SVG and span to ensure it's applied
            button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0; color: ${buttonColor} !important;">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span style="font-weight: 600; color: ${buttonColor} !important;">${buttonText}</span>
    `;
            // Add click handler
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openSizeChartModal();
            });
            // Insert button after last variant
            if (lastVariant.nextSibling) {
                lastVariant.parentElement?.insertBefore(button, lastVariant.nextSibling);
            }
            else {
                lastVariant.parentElement?.appendChild(button);
            }
            return true;
        }
        /**
           * Inject size suggestions outside the button container or in a suitable location
           * @param buttonContainer - Optional button container. If null, will try to find a suitable location
           */
        injectSizeSuggestions(buttonContainer) {
            if (!this.currentSizeChartData)
                return;
            // Remove existing suggestions if any
            const existingSuggestions = document.querySelector('.yuddy-size-suggestions-wrapper');
            if (existingSuggestions) {
                existingSuggestions.remove();
            }
            // Get applicable suggestions for current product
            const applicableSuggestions = getApplicableSuggestionsForProduct(this.currentSizeChartData.sizeSuggestions ?? [], this.currentProductId);
            if (applicableSuggestions.length === 0) {
                return;
            }
            const plan = resolveSuggestionInsertionPlan(document, this.getPlatform(), buttonContainer);
            if (!plan) {
                return;
            }
            const { parentElement, insertionPoint, insertMethod } = plan;
            // Margin ayarını DOM'a göre yapalım ki varyantların altındayken çok yapışmasın
            const wrapperMarginTop = "12px";
            const suggestionsWrapper = document.createElement('div');
            suggestionsWrapper.className = 'yuddy-size-suggestions-wrapper';
            suggestionsWrapper.style.marginTop = wrapperMarginTop; // Boşluk eklendi
            suggestionsWrapper.innerHTML = `
      <div class="yuddy-size-suggestions-content">
        ${applicableSuggestions.map(suggestion => `
          <div class="yuddy-size-suggestion-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V12" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16H12.01" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>${suggestion.description}</p>
          </div>
        `).join('')}
      </div>
    `;
            // DOM'a Ekleme Mantığı
            if (insertMethod === 'before' && insertionPoint) {
                parentElement.insertBefore(suggestionsWrapper, insertionPoint);
            }
            else if (insertMethod === 'after' && insertionPoint) {
                if (insertionPoint.nextSibling) {
                    parentElement.insertBefore(suggestionsWrapper, insertionPoint.nextSibling);
                }
                else {
                    parentElement.appendChild(suggestionsWrapper);
                }
            }
            else {
                parentElement.appendChild(suggestionsWrapper);
            }
        }
        /**
         * Open size chart modal
         */
        openSizeChartModal() {
            // Remove existing modal if any
            this.closeSizeChartModal();
            // Only open modal if size tables exist
            if (!this.currentSizeChartData?.sizeTables || this.currentSizeChartData.sizeTables.length === 0) {
                return;
            }
            if (!this.currentMeasurements) {
                console.warn('[Size Chart] Measurements not available, cannot open modal');
                return;
            }
            // Get button color from sizeDesign
            const buttonColor = this.currentSizeChartData?.sizeDesign?.buttonColor?.trim() || '#6366f1';
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'yuddy-size-chart-modal-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            const modalTitle = this.currentSizeChartData?.sizeDesign?.title || 'Beden Tablosu';
            overlay.setAttribute('aria-label', modalTitle);
            // Set CSS variables for button color (modal içindeki tüm elementler için)
            overlay.style.setProperty('--button-color', buttonColor);
            overlay.style.setProperty('--active-color', buttonColor);
            // Create modal container
            const modal = document.createElement('div');
            modal.className = 'yuddy-size-chart-modal';
            this.modalElement = modal;
            // Create modal header with icon and title
            const header = document.createElement('div');
            header.className = 'yuddy-size-chart-modal-header';
            header.innerHTML = buildModalHeaderInnerHtml(buttonColor, modalTitle);
            // Create modal body with widget content
            const body = document.createElement('div');
            body.className = 'yuddy-size-chart-modal-body';
            // Create close button
            const closeButton = document.createElement('button');
            closeButton.className = 'yuddy-size-chart-modal-close';
            closeButton.setAttribute('aria-label', 'Kapat');
            closeButton.innerHTML = '×';
            closeButton.addEventListener('click', () => {
                this.closeSizeChartModal();
            });
            // Add close button to header
            header.appendChild(closeButton);
            // Generate widget HTML for modal
            const widgetHTML = this.buildModalBodyHtml(this.currentMeasurements, this.currentRecommendation);
            body.innerHTML = widgetHTML;
            // Assemble modal
            modal.appendChild(header);
            modal.appendChild(body);
            overlay.appendChild(modal);
            // Add to body
            document.body.appendChild(overlay);
            // Attach tab listeners if tabs exist
            requestAnimationFrame(() => {
                this.attachTabListeners();
                this.attachMeasurementFinderListeners();
            });
            // Trigger animation
            requestAnimationFrame(() => {
                overlay.classList.add('yuddy-size-chart-modal-overlay-visible');
                modal.classList.add('yuddy-size-chart-modal-visible');
            });
            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeSizeChartModal();
                }
            });
            // Close on ESC key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.closeSizeChartModal();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
            // Emit custom event
            const event = new CustomEvent('yuddy-size-chart-modal-opened', {
                detail: { modalElement: modal },
            });
            window.dispatchEvent(event);
        }
        /**
         * Close size chart modal
         */
        closeSizeChartModal() {
            const overlay = document.querySelector('.yuddy-size-chart-modal-overlay');
            if (overlay) {
                overlay.classList.remove('yuddy-size-chart-modal-overlay-visible');
                const modal = overlay.querySelector('.yuddy-size-chart-modal');
                if (modal) {
                    modal.classList.remove('yuddy-size-chart-modal-visible');
                }
                // Remove after animation
                setTimeout(() => {
                    overlay.remove();
                    this.modalElement = null;
                }, 300);
            }
        }
        /**
         * Remove size chart button
         */
        removeSizeChartButton() {
            document.querySelectorAll(`.${YUDDY_SIZE_CHART_BUTTON_CLASS}`).forEach((button) => button.remove());
        }
        /**
         * Cleanup
         */
        cleanup() {
            // Close modal
            this.closeSizeChartModal();
            // Remove any existing widget (in case it was added)
            this.removeExistingWidget();
            this.removeSizeChartButton();
            this.currentMeasurements = null;
            this.currentRecommendation = null;
            this.currentSizeChartData = null;
            this.currentProductId = null;
            this.lastInjectedProductId = null;
            this.isInitialized = false;
            this.currentPlatform = null;
        }
        getPlatform() {
            return this.currentPlatform ?? detectPlatform();
        }
        /**
         * Attach tab event listeners
         */
        attachTabListeners() {
            if (!this.modalElement)
                return;
            const tabButtons = this.modalElement.querySelectorAll('.yuddy-size-chart-tab');
            const tabContents = this.modalElement.querySelectorAll('.yuddy-size-chart-tab-content');
            tabButtons.forEach((button) => {
                button.addEventListener('click', () => {
                    const targetTab = button.dataset.tab;
                    // Remove active class from all buttons and contents
                    tabButtons.forEach((btn) => btn.classList.remove('yuddy-size-chart-tab-active'));
                    tabContents.forEach((content) => {
                        content.classList.remove('yuddy-size-chart-tab-content-active');
                        content.style.display = 'none';
                    });
                    // Add active class to clicked button
                    button.classList.add('yuddy-size-chart-tab-active');
                    // Show corresponding content
                    const targetContent = this.modalElement?.querySelector(`[data-content="${targetTab}"]`);
                    if (targetContent) {
                        targetContent.classList.add('yuddy-size-chart-tab-content-active');
                        targetContent.style.display = 'block';
                    }
                });
            });
        }
        /**
         * Elementin sepet, modal veya drawer içinde olup olmadığını kontrol eder.
         */
        isInsideCart(element) {
            return isInsideCartElement(element, this.getPlatform());
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
            const value = this.getCookie(WIDGET_COOKIE_NAMES.WIDGET_SHOWN);
            return value === 'true';
        }
    }

    /**
     * Ürün slug / sayfa bağlamı — UMD bootstrap ve SizeChart aynı kuralları kullanır.
     */
    const PATH_SLUG_PATTERNS = [
        /^\/products\/([^/?]+)/i,
        /^\/product\/([^/?]+)/i,
        /^\/p\/([^/?]+)/i,
        /^\/urun\/([^/?]+)/i,
        /^\/urunler\/([^/?]+)/i,
        /^\/item\/([^/?]+)/i,
    ];
    const EXCLUDED_SLUGS = new Set([
        'home',
        'index',
        'about',
        'contact',
        'cart',
        'checkout',
        'account',
        'login',
        'register',
        'search',
        'category',
        'categories',
        'products',
        'product',
        'urun',
        'urunler',
        'p',
        'item',
    ].map((s) => s.toLowerCase()));
    /**
     * URL path'ten ürün slug'ı (önce yaygın mağaza şablonları, sonra ilk anlamlı segment).
     */
    function getProductSlugFromPathname(pathname) {
        const path = pathname || '';
        for (const pattern of PATH_SLUG_PATTERNS) {
            const match = path.match(pattern);
            if (match?.[1]) {
                const slug = match[1];
                if (!EXCLUDED_SLUGS.has(slug.toLowerCase())) {
                    return slug;
                }
            }
        }
        const segments = path.split('/').filter((s) => s.length > 0);
        if (segments.length === 0) {
            return null;
        }
        const first = segments[0];
        if (EXCLUDED_SLUGS.has(first.toLowerCase())) {
            if (segments.length > 1) {
                return segments[1];
            }
            return null;
        }
        return first;
    }
    const DOM_PRODUCT_SELECTORS = [
        '[data-product-id]',
        '[data-product-slug]',
        '.product-id',
        '[id*="product"]',
    ];
    /**
     * Config > path slug > DOM > query string — tek giriş noktası.
     */
    function resolveProductIdFromPage(options) {
        const { configuredProductId, pathname, search, doc } = options;
        if (configuredProductId) {
            return configuredProductId;
        }
        const fromPath = getProductSlugFromPathname(pathname);
        if (fromPath) {
            return fromPath;
        }
        if (doc?.querySelector) {
            for (const selector of DOM_PRODUCT_SELECTORS) {
                const element = doc.querySelector(selector);
                if (element) {
                    const productId = element.getAttribute('data-product-id') ||
                        element.getAttribute('data-product-slug') ||
                        element.getAttribute('id') ||
                        element.textContent?.trim();
                    if (productId) {
                        return productId;
                    }
                }
            }
        }
        const params = new URLSearchParams(search);
        return (params.get('productId') ||
            params.get('id') ||
            params.get('slug') ||
            params.get('productSlug'));
    }

    class SizeChart {
        constructor(config = {}) {
            this.isInitialized = false;
            this.apiBaseUrl = "https://testapi.yuddy.com/api/v1";
            this.currentProductId = null;
            this.sizeChartData = null;
            this.config = config;
            // Initialize managers
            this.storageManager = new StorageManager();
            this.cookieManager = new CookieManager();
            this.apiClient = new APIClient(this.config.apiBaseUrl || this.apiBaseUrl);
            this.domManager = new DOMManager();
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
            // SPA geçişleri: UMD girişi (index.ts) history/popstate ile tek instance yenilenir;
            // burada tekrar patch etmek çift dinleyici ve üst üste wrap riski yaratırdı.
        }
        /**
         * Main initialization function
         */
        async init() {
            try {
                // Get product ID/slug from config, URL, or DOM
                const productId = this.getProductId();
                if (!productId) {
                    // Don't return early - allow widget to be initialized later when product is available
                    return;
                }
                // Skip if same product is already initialized
                if (this.isInitialized && this.currentProductId === productId) {
                    return;
                }
                this.currentProductId = productId;
                // Get hostname for public API endpoint
                const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
                // Get all size chart data from API (public endpoint with storeName, matching will be done client-side)
                const allSizeChartData = await this.apiClient.getSizeChartData(hostname);
                if (!allSizeChartData || !allSizeChartData.isActive) {
                    console.warn('[Size Chart] Size chart is not active or data not available');
                    return;
                }
                // Find matching size table for this product based on applicableProducts
                // Match by slug only (storeName is already used in API call)
                const matchingSizeTable = findSizeTableForProductSlug(allSizeChartData.sizeTables, productId) ?? null;
                // Check if there are size suggestions for this product (even if no size table)
                const hasSizeSuggestions = hasSizeSuggestionForProductSlug(allSizeChartData.sizeSuggestions, productId);
                if (!matchingSizeTable && !hasSizeSuggestions) {
                    // Don't show widget if no match found
                    return;
                }
                // Create filtered size chart data
                // If no matching table, use empty array but keep sizeSuggestions
                this.sizeChartData = {
                    ...allSizeChartData,
                    sizeTables: matchingSizeTable ? [matchingSizeTable] : [],
                };
                // Get user measurements (from storage or calculate)
                const measurements = await this.getOrCalculateMeasurements();
                // Size recommendation will be calculated client-side if needed
                // For now, we'll pass null and let the measurement finder calculate it
                const recommendation = null;
                // Initialize DOM with size chart data
                await this.domManager.init(measurements, recommendation, this.sizeChartData, productId);
                // Track widget shown
                this.cookieManager.setWidgetShown();
                this.isInitialized = true;
            }
            catch (error) {
                console.error('[Size Chart] Loading error:', error);
                this.handleError(error);
            }
        }
        /**
         * Get product ID/slug from config, URL, or DOM
         * Priority: config > URL slug > DOM > query params
         */
        getProductId() {
            if (typeof window === 'undefined') {
                return null;
            }
            return resolveProductIdFromPage({
                configuredProductId: this.config.productId,
                pathname: window.location.pathname,
                search: window.location.search,
                doc: document,
            });
        }
        /**
         * Get or calculate user measurements
         */
        async getOrCalculateMeasurements() {
            // Try to get from storage
            const cached = this.storageManager.getCalculatedMeasurements();
            if (cached) {
                return cached;
            }
            // Try to get user measurements from storage
            const userMeasurements = this.storageManager.getUserMeasurements();
            if (userMeasurements) {
                const calculated = this.calculateMeasurements(userMeasurements);
                this.storageManager.saveCalculatedMeasurements(calculated);
                return calculated;
            }
            // If no measurements found, return mock data for demo
            // This provides realistic measurements for testing
            return {
                chest: 92.5,
                waist: 78.3,
                hip: 94.2,
            };
        }
        /**
         * Calculate body measurements from user input
         */
        calculateMeasurements(userMeasurements) {
            const factors = userMeasurements.gender === 'male'
                ? MEASUREMENT_FACTORS.MALE
                : MEASUREMENT_FACTORS.FEMALE;
            const bodyTypeMod = BODY_TYPE_MODIFIERS[userMeasurements.bodyType] || BODY_TYPE_MODIFIERS.normal;
            // Base measurements
            const baseHeightFactor = (userMeasurements.height - 170) * factors.heightFactor;
            const baseWeightFactor = (userMeasurements.weight - 70) * factors.weightFactor;
            // Calculate BMI
            const heightInMeters = userMeasurements.height / 100;
            const bmi = userMeasurements.weight / (heightInMeters * heightInMeters);
            const averageBMI = 22.5;
            const bmiDeviationFactor = (bmi - averageBMI) * 0.4;
            // Calculate measurements
            const chest = Math.round((factors.baseChest + baseHeightFactor + baseWeightFactor + bmiDeviationFactor + bodyTypeMod.chest * 2) * 10) / 10;
            const waist = Math.round((factors.baseWaist + baseHeightFactor + baseWeightFactor + bmiDeviationFactor + bodyTypeMod.waist * 2) * 10) / 10;
            const hip = Math.round((factors.baseHip + baseHeightFactor + baseWeightFactor + bmiDeviationFactor + bodyTypeMod.hip * 2) * 10) / 10;
            return { chest, waist, hip };
        }
        /**
         * Update measurements and recommendation
         */
        async updateMeasurements(userMeasurements) {
            const calculated = this.calculateMeasurements(userMeasurements);
            this.storageManager.saveUserMeasurements(userMeasurements);
            this.storageManager.saveCalculatedMeasurements(calculated);
            if (this.currentProductId) {
                // Refresh size chart data if needed
                if (!this.sizeChartData) {
                    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
                    const allSizeChartData = await this.apiClient.getSizeChartData(hostname);
                    if (allSizeChartData) {
                        const matchingSizeTable = findSizeTableForProductSlug(allSizeChartData.sizeTables, this.currentProductId) ?? null;
                        if (matchingSizeTable) {
                            this.sizeChartData = {
                                ...allSizeChartData,
                                sizeTables: [matchingSizeTable],
                            };
                        }
                    }
                }
                // Recommendation will be calculated by measurement finder if needed
                const recommendation = null;
                this.domManager.update(calculated, recommendation, this.sizeChartData, this.currentProductId);
            }
        }
        /**
         * Handle errors
         */
        handleError(error) {
            console.error('[Size Chart] Error:', error);
            // You can emit custom event for error tracking
            const event = new CustomEvent('yuddy-size-chart-error', {
                detail: { error },
            });
            window.dispatchEvent(event);
        }
        /**
         * Cleanup
         */
        destroy() {
            this.domManager.cleanup();
            this.isInitialized = false;
        }
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z = "/* Yuddy Size Chart Widget Styles - Professional Layout Update */\n\n.yuddy-size-chart-widget {\n    width: 100%;\n    margin: 0;\n    padding: 0;\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n    background-color: #ffffff;\n    border-radius: 0;\n    box-shadow: none;\n    font-feature-settings: 'kern' 1, 'liga' 1;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n}\n\n.yuddy-size-chart-content {\n    display: flex;\n    flex-direction: column;\n    gap: 0;\n}\n\n.yuddy-size-chart-header {\n    padding: 24px 28px 20px;\n    margin: 0;\n    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);\n    border-bottom: 1px solid #e2e8f0;\n}\n\n.yuddy-size-chart-title {\n    font-size: 20px;\n    font-weight: 700;\n    margin: 0;\n    line-height: 1.3;\n    letter-spacing: -0.025em;\n}\n\n.yuddy-size-chart-measurements {\n    display: flex;\n    flex-direction: column;\n    gap: 16px;\n    padding: 28px;\n}\n\n.yuddy-size-chart-measurement-item {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 18px 22px;\n    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);\n    border-radius: 12px;\n    border: 1px solid #e2e8f0;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n    position: relative;\n    overflow: hidden;\n}\n\n.yuddy-size-chart-measurement-item::before {\n    content: '';\n    position: absolute;\n    left: 0;\n    top: 0;\n    height: 100%;\n    width: 4px;\n    background: #6366f1;\n    transform: translateX(-100%);\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-size-chart-measurement-item:hover {\n    background: #ffffff;\n    border-color: #cbd5e1;\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);\n    transform: translateY(-1px);\n}\n\n.yuddy-size-chart-measurement-item:hover::before {\n    transform: translateX(0);\n}\n\n.yuddy-size-chart-label {\n    font-size: 14px;\n    font-weight: 600;\n    color: #6c757d;\n    letter-spacing: 0.01em;\n}\n\n.yuddy-size-chart-value {\n    font-size: 18px;\n    font-weight: 700;\n    letter-spacing: -0.01em;\n}\n\n.yuddy-size-chart-recommendation {\n    margin-top: 20px;\n    padding: 0 28px 28px;\n}\n\n.yuddy-size-chart-recommendation-badge {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    gap: 8px;\n    width: 100%;\n    padding: 20px 28px;\n    color: #ffffff;\n    border-radius: 14px;\n    font-size: 16px;\n    font-weight: 700;\n    text-align: center;\n    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);\n    letter-spacing: -0.01em;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n    position: relative;\n    overflow: hidden;\n}\n\n.yuddy-size-chart-recommendation-badge::before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: -100%;\n    width: 100%;\n    height: 100%;\n    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);\n    transition: left 0.6s ease;\n}\n\n.yuddy-size-chart-recommendation-badge:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);\n}\n\n.yuddy-size-chart-recommendation-badge:hover::before {\n    left: 100%;\n}\n\n/* Size Chart Button Styles - Clean Link Design */\n.yuddy-size-chart-button {\n    display: inline-flex;\n    align-items: center;\n    justify-content: flex-start;\n    gap: 8px;\n    background: transparent;\n    border: none;\n    font-size: 14px;\n    font-weight: 600;\n    cursor: pointer;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n    text-decoration: none;\n    line-height: 1.5;\n    border-radius: 8px;\n    position: relative;\n    max-height: 35px;\n}\n\n.yuddy-size-chart-button svg {\n    flex-shrink: 0;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-size-chart-button span {\n    position: relative;\n    padding: 0;\n    margin: 0;\n    border: none;\n}\n\n.yuddy-size-chart-button span::after {\n    content: '';\n    position: absolute;\n    bottom: -2px;\n    left: 0;\n    right: 0;\n    height: 1px;\n    background: currentColor;\n    transform: scaleX(0);\n    transform-origin: left;\n    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-size-chart-button:hover {\n    transform: translateY(-1px);\n    padding-left: 8px;\n    padding-right: 8px;\n}\n\n.yuddy-size-chart-button:hover svg {\n    transform: scale(1.1);\n}\n\n.yuddy-size-chart-button:hover span::after {\n    transform: scaleX(1);\n}\n\n.yuddy-size-chart-button:active {\n    transform: translateY(0);\n}\n\n/* =====================================================\n   Size Chart Modal Styles - Enhanced Professional Design\n   ===================================================== */\n\n.yuddy-size-chart-modal-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background-color: rgba(15, 23, 42, 0.6);\n    backdrop-filter: blur(12px);\n    -webkit-backdrop-filter: blur(12px);\n    z-index: 9999;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    padding: 24px;\n    opacity: 0;\n    visibility: hidden;\n    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-size-chart-modal-overlay-visible {\n    opacity: 1;\n    visibility: visible;\n    z-index: 99999;\n}\n\n.yuddy-size-chart-modal {\n    background-color: #ffffff;\n    border-radius: 20px;\n    box-shadow: \n        0 0 0 1px rgba(0, 0, 0, 0.05),\n        0 20px 25px -5px rgba(0, 0, 0, 0.1),\n        0 8px 10px -6px rgba(0, 0, 0, 0.1),\n        0 40px 60px -12px rgba(0, 0, 0, 0.25);\n    max-width: 800px;\n    width: 100%;\n    max-height: calc(100vh - 48px);\n    display: flex;\n    flex-direction: column;\n    transform: scale(0.9) translateY(40px);\n    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);\n    overflow: hidden;\n    border: 1px solid #e2e8f0;\n}\n\n.yuddy-size-chart-modal-visible {\n    transform: scale(1) translateY(0);\n}\n\n/* Modal Header */\n.yuddy-size-chart-modal-header {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 28px 32px;\n    border-bottom: 1px solid #e2e8f0;\n    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);\n    flex-shrink: 0;\n    position: relative;\n}\n\n.yuddy-size-chart-modal-title {\n    font-size: 24px;\n    font-weight: 800;\n    margin: 0;\n    line-height: 1.3;\n    color: #0f172a;\n    letter-spacing: -0.03em;\n}\n\n.yuddy-size-chart-modal-close {\n    position: absolute;\n    top: 50%;\n    right: 24px;\n    transform: translateY(-50%);\n    background: #f1f5f9;\n    border: 1px solid #e2e8f0;\n    font-size: 20px;\n    line-height: 1;\n    color: #64748b;\n    cursor: pointer;\n    padding: 0;\n    width: 44px;\n    height: 44px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: 12px;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n    font-weight: 400;\n}\n\n.yuddy-size-chart-modal-close:hover {\n    background-color: #fee2e2;\n    border-color: #fecaca;\n    color: #dc2626;\n    transform: translateY(-50%) scale(1.08) rotate(90deg);\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);\n}\n\n.yuddy-size-chart-modal-close:active {\n    transform: translateY(-50%) scale(0.95);\n}\n\n.yuddy-size-chart-modal-close:focus {\n    outline: none;\n    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);\n}\n\n/* Modal Body */\n.yuddy-size-chart-modal-body {\n    padding: 0;\n    overflow-y: auto;\n    flex: 1;\n    -webkit-overflow-scrolling: touch;\n    position: relative;\n    background-color: #ffffff;\n    scrollbar-width: thin;\n    scrollbar-color: #cbd5e1 #f1f5f9;\n}\n\n.yuddy-size-chart-modal-body::-webkit-scrollbar {\n    width: 12px;\n}\n\n.yuddy-size-chart-modal-body::-webkit-scrollbar-track {\n    background: #f1f5f9;\n    border-radius: 6px;\n    margin: 8px 0;\n}\n\n.yuddy-size-chart-modal-body::-webkit-scrollbar-thumb {\n    background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);\n    border-radius: 6px;\n    border: 2px solid #f1f5f9;\n}\n\n.yuddy-size-chart-modal-body::-webkit-scrollbar-thumb:hover {\n    background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);\n}\n\n.yuddy-size-chart-modal-body .yuddy-size-chart-widget {\n    box-shadow: none;\n    padding: 0;\n    margin: 0;\n    border-radius: 0;\n}\n\n/* =====================================================\n   Professional Tab Navigation\n   ===================================================== */\n\n.yuddy-size-chart-tabs {\n    display: flex;\n    border-bottom: 2px solid #e2e8f0;\n    margin: 0;\n    padding: 0 32px;\n    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);\n    gap: 8px;\n    overflow-x: auto;\n    scrollbar-width: none;\n}\n\n.yuddy-size-chart-tabs::-webkit-scrollbar {\n    display: none;\n}\n\n.yuddy-size-chart-tab {\n    position: relative;\n    flex: 1;\n    min-width: 140px;\n    padding: 20px 24px;\n    background: transparent;\n    border: none;\n    border-bottom: 3px solid transparent;\n    font-size: 15px;\n    font-weight: 700;\n    color: #64748b;\n    cursor: pointer;\n    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n    font-family: inherit;\n    margin-bottom: -2px;\n    letter-spacing: -0.01em;\n    border-radius: 12px 12px 0 0;\n    white-space: nowrap;\n}\n\n.yuddy-size-chart-tab::before {\n    content: '';\n    position: absolute;\n    inset: 0;\n    background: linear-gradient(135deg, transparent 0%, rgba(99, 102, 241, 0.04) 100%);\n    opacity: 0;\n    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n    border-radius: inherit;\n}\n\n.yuddy-size-chart-tab:hover {\n    color: var(--active-color, #6366f1);\n    transform: translateY(-2px);\n}\n\n.yuddy-size-chart-tab:hover::before {\n    opacity: 1;\n}\n\n.yuddy-size-chart-tab-active {\n    color: var(--active-color, #6366f1);\n    border-bottom-color: var(--active-color, #6366f1);\n    background: #ffffff;\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);\n    transform: translateY(-2px);\n}\n\n.yuddy-size-chart-tab-content {\n    display: none;\n    animation: slideInFade 0.4s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-size-chart-tab-content-active {\n    display: block;\n}\n\n@keyframes slideInFade {\n    from {\n        opacity: 0;\n        transform: translateY(16px);\n    }\n    to {\n        opacity: 1;\n        transform: translateY(0);\n    }\n}\n\n/* =====================================================\n   Enhanced Professional Table Design\n   ===================================================== */\n\n.yuddy-size-chart-table-container {\n    margin-bottom: 40px;\n    padding: 32px;\n    position: relative;\n}\n\n.yuddy-size-chart-table-container:last-child {\n    margin-bottom: 0;\n}\n\n.yuddy-size-chart-table-header {\n    display: none;\n}\n\n.yuddy-size-chart-table-header::after {\n    content: '';\n    position: absolute;\n    bottom: -2px;\n    left: 0;\n    width: 80px;\n    height: 2px;\n    background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);\n    border-radius: 1px;\n}\n\n.yuddy-size-chart-table-name {\n    display: none !important;\n    font-size: 22px;\n    font-weight: 800;\n    margin: 0 0 8px 0;\n    line-height: 1.3;\n    color: #0f172a;\n    letter-spacing: -0.03em;\n}\n\n.yuddy-size-chart-table-description {\n    font-size: 15px;\n    color: #64748b;\n    margin: 0;\n    line-height: 1.6;\n    font-weight: 500;\n}\n\n.yuddy-size-chart-table {\n    width: 100%;\n    border-collapse: separate;\n    border-spacing: 0;\n    margin: 0;\n    font-size: 14px;\n    border: 2px solid #e2e8f0;\n    border-radius: 16px;\n    overflow: hidden;\n    background-color: #ffffff;\n    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);\n}\n\n.yuddy-size-chart-table th,\n.yuddy-size-chart-table td {\n    padding: 16px 20px;\n    text-align: center;\n    border: none;\n    border-bottom: 1px solid #f1f5f9;\n    font-variant-numeric: tabular-nums;\n}\n\n.yuddy-size-chart-table thead {\n    position: relative;\n}\n\n.yuddy-size-chart-table thead::after {\n    content: '';\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    height: 1px;\n    background: linear-gradient(90deg, transparent 0%, #6366f1 50%, transparent 100%);\n}\n\n.yuddy-size-chart-table thead th {\n    border-bottom: 2px solid #e2e8f0;\n    font-weight: 800;\n    font-size: 13px;\n    color: #475569;\n    text-transform: uppercase;\n    letter-spacing: 0.08em;\n    position: relative;\n}\n\n.yuddy-size-chart-table th {\n    font-weight: 700;\n    text-align: center;\n    font-size: 13px;\n    letter-spacing: 0.02em;\n}\n\n.yuddy-size-chart-table td {\n    text-align: center;\n    font-weight: 600;\n    color: #334155;\n    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-size-chart-table tbody tr {\n    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);\n    position: relative;\n}\n\n.yuddy-size-chart-table tbody tr:hover {\n    background: linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, #ffffff 100%);\n    transform: scale(1.01);\n    z-index: 1;\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);\n}\n\n.yuddy-size-chart-table tbody tr:nth-child(even) {\n    background-color: #fafbfc;\n}\n\n.yuddy-size-chart-table tbody tr:nth-child(even):hover {\n    background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, #fafbfc 100%);\n}\n\n.yuddy-size-chart-table tbody tr:last-child td {\n    border-bottom: none;\n}\n\n/* Highlighted Row (Recommended Size) */\n.yuddy-size-chart-table tbody tr.highlighted {\n    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%);\n    position: relative;\n    border: 2px solid var(--active-color, #6366f1);\n}\n\n.yuddy-size-chart-table tbody tr.highlighted::before {\n    content: '';\n    position: absolute;\n    left: -2px;\n    top: 0;\n    bottom: 0;\n    width: 6px;\n    background: linear-gradient(180deg, var(--active-color, #6366f1) 0%, #10b981 100%);\n    border-radius: 0 3px 3px 0;\n}\n\n.yuddy-size-chart-table tbody tr.highlighted td {\n    font-weight: 700;\n    color: var(--active-color, #6366f1);\n    position: relative;\n}\n\n.yuddy-size-chart-table tbody tr.highlighted td:first-child::after {\n    content: '✓';\n    position: absolute;\n    left: 8px;\n    top: 50%;\n    transform: translateY(-50%);\n    font-size: 14px;\n    color: #10b981;\n    font-weight: 900;\n}\n\n/* =====================================================\n   Enhanced Measurement Finder - Professional Layout\n   ===================================================== */\n\n.yuddy-measurement-finder {\n    padding: 32px;\n    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);\n    position: relative;\n    min-height: 400px;\n}\n\n/* Mobile Pages Container */\n.yuddy-measurement-pages {\n    position: relative;\n    width: 100%;\n}\n\n.yuddy-measurement-page {\n    display: block;\n    width: 100%;\n    animation: fadeIn 0.3s ease-in-out;\n}\n\n.yuddy-measurement-page.active {\n    display: block;\n}\n\n@keyframes fadeIn {\n    from {\n        opacity: 0;\n        transform: translateX(10px);\n    }\n    to {\n        opacity: 1;\n        transform: translateX(0);\n    }\n}\n\n.yuddy-measurement-form {\n    display: flex;\n    flex-direction: column;\n    gap: 12px;\n}\n\n.yuddy-form-section {\n    display: flex;\n    flex-direction: column;\n    gap: 16px;\n}\n\n/* Enhanced Measurement Inputs - Side by Side Layout */\n.yuddy-measurement-inputs {\n    display: grid;\n    grid-template-columns: repeat(2, 1fr);\n    gap: 20px;\n    margin-bottom: 10px;\n}\n\n.yuddy-form-label {\n    font-size: 14px;\n    font-weight: 800;\n    color: #475569;\n    text-transform: uppercase;\n    letter-spacing: 0.08em;\n    position: relative;\n    padding-left: 10px;\n}\n\n.yuddy-form-label::before {\n    content: '';\n    position: absolute;\n    left: 0;\n    top: 50%;\n    transform: translateY(-50%);\n    width: 4px;\n    height: 16px;\n    background: var(--button-color, var(--active-color, #6366f1));\n    border-radius: 2px;\n}\n\n/* Compact Gender Selector */\n.yuddy-gender-selector {\n    display: grid;\n    grid-template-columns: repeat(2, 1fr);\n    gap: 16px;\n    max-width: 400px;\n}\n\n.yuddy-gender-btn {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    padding: 12px 20px;\n    border: 2px solid #e2e8f0;\n    border-radius: 12px;\n    background: #ffffff;\n    cursor: pointer;\n    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n    font-size: 14px;\n    font-weight: 700;\n    color: #475569;\n    position: relative;\n    overflow: hidden;\n}\n\n.yuddy-gender-btn::before {\n    content: '';\n    position: absolute;\n    inset: 0;\n    opacity: 0;\n    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-gender-btn:hover {\n    border-color: var(--button-color, var(--active-color, #6366f1));\n    transform: translateY(-2px);\n    box-shadow: 0 8px 20px color-mix(in srgb, var(--button-color, var(--active-color, #6366f1)) 12%, transparent);\n}\n\n.yuddy-gender-btn:hover::before {\n    opacity: 1;\n}\n\n.yuddy-gender-btn.active {\n    border-color: var(--button-color, var(--active-color, #6366f1));\n    background: var(--button-color, var(--active-color, #6366f1));\n    color: #ffffff;\n    box-shadow: 0 12px 28px color-mix(in srgb, var(--button-color, var(--active-color, #6366f1)) 25%, transparent);\n    transform: translateY(-2px) scale(1.02);\n}\n\n\n/* Compact Body Type Grid */\n.yuddy-body-type-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\n    gap: 12px;\n    max-width: 500px;\n    margin: 10px 0;\n}\n\n/* Kadın için 5 beden tipi, erkek için 4 beden tipi - responsive grid kullanıyoruz */\n@media (min-width: 480px) {\n    .yuddy-body-type-grid {\n        grid-template-columns: repeat(4, 1fr);\n    }\n}\n\n@media (min-width: 600px) {\n    .yuddy-body-type-grid {\n        grid-template-columns: repeat(5, 1fr);\n    }\n}\n\n.yuddy-body-type-btn {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: flex-start;\n    gap: 6px;\n    padding: 2px;\n    border: 2px solid #e2e8f0;\n    border-radius: 12px;\n    background: #ffffff;\n    cursor: pointer;\n    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n    font-size: 11px;\n    font-weight: 700;\n    color: #475569;\n    position: relative;\n    overflow: hidden;\n    min-height: 90px;\n    width: 100%;\n}\n\n.yuddy-body-type-btn::before {\n    content: '';\n    position: absolute;\n    inset: 0;\n    background: color-mix(in srgb, var(--button-color, var(--active-color, #6366f1)) 4%, transparent);\n    opacity: 0;\n    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-body-type-btn:hover {\n    border-color: var(--active-color, #6366f1);\n    transform: translateY(-2px);\n    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.12);\n}\n\n.yuddy-body-type-btn:hover::before {\n    opacity: 1;\n}\n\n.yuddy-body-type-btn.active {\n    border-color: var(--button-color, var(--active-color, #6366f1));\n    background: color-mix(in srgb, var(--button-color, var(--active-color, #6366f1)) 8%, transparent);\n    color: var(--button-color, var(--active-color, #6366f1));\n    box-shadow: 0 8px 20px color-mix(in srgb, var(--button-color, var(--active-color, #6366f1)) 15%, transparent);\n    transform: translateY(-2px) scale(1.05);\n}\n\n.yuddy-body-type-btn.active::after {\n    content: '✓';\n    position: absolute;\n    top: 6px;\n    right: 6px;\n    width: 18px;\n    height: 18px;\n    border-radius: 50%;\n    background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n    color: #ffffff;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 10px;\n    font-weight: 900;\n    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);\n}\n\n.yuddy-body-type-icon {\n    font-size: 28px;\n    line-height: 1;\n}\n\n/* SVG Icon Wrapper - SVG'ler için özel container */\n.yuddy-body-type-icon-wrapper {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 100%;\n    height: 50px;\n    margin-bottom: 4px;\n    flex-shrink: 0;\n}\n\n/* SVG içeriği için stil */\n.yuddy-body-type-icon-wrapper svg {\n    width: 100%;\n    height: 100%;\n    max-width: 60px;\n    object-fit: contain;\n    display: block;\n    position: absolute;\n    top: -6px;\n}\n\n/* Beden tipi label */\n.yuddy-body-type-label {\n    font-size: 11px;\n    font-weight: 700;\n    color: inherit;\n    text-align: center;\n    line-height: 1.2;\n    margin-top: auto;\n}\n\n/* Enhanced Input Group */\n.yuddy-input-group {\n    display: flex;\n    flex-direction: column;\n    gap: 2px;\n    position: relative;\n}\n\n.yuddy-input-label {\n    font-size: 14px;\n    font-weight: 700;\n    color: #475569;\n    letter-spacing: 0.01em;\n}\n\n.yuddy-input {\n    padding: 16px 20px;\n    border: 2px solid #e2e8f0;\n    border-radius: 12px;\n    font-size: 16px;\n    font-family: inherit;\n    font-weight: 600;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n    background: #ffffff;\n    color: #0f172a;\n    position: relative;\n}\n\n.yuddy-input:focus {\n    outline: none;\n    border-color: var(--active-color, #6366f1);\n    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);\n    background: #ffffff;\n    transform: scale(1.02);\n}\n\n.yuddy-input::placeholder {\n    color: #94a3b8;\n    font-weight: 500;\n}\n\n/* Enhanced Fit Selector */\n.yuddy-fit-selector {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 12px;\n    max-width: 450px;\n}\n\n.yuddy-fit-btn {\n    padding: 16px 20px;\n    border: 2px solid #e2e8f0;\n    border-radius: 12px;\n    background: #ffffff;\n    cursor: pointer;\n    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n    font-size: 14px;\n    font-weight: 700;\n    color: #475569;\n    text-align: center;\n    position: relative;\n    overflow: hidden;\n}\n\n.yuddy-fit-btn::before {\n    content: '';\n    position: absolute;\n    inset: 0;\n    background: linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, transparent 100%);\n    opacity: 0;\n    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-fit-btn:hover {\n    border-color: var(--active-color, #6366f1);\n    transform: translateY(-2px);\n}\n\n.yuddy-fit-btn:hover::before {\n    opacity: 1;\n}\n\n.yuddy-fit-btn.active {\n    border-color: var(--button-color, var(--active-color, #6366f1));\n    background: var(--button-color, var(--active-color, #6366f1));\n    color: #ffffff;\n    box-shadow: 0 8px 20px color-mix(in srgb, var(--button-color, var(--active-color, #6366f1)) 25%, transparent);\n    transform: translateY(-2px) scale(1.02);\n}\n\n/* Enhanced Calculate Button */\n.yuddy-calculate-btn {\n    width: 100%;\n    margin: 0 auto;\n    padding: 20px;\n    margin-top: 10px;\n    border: none;\n    border-radius: 16px;\n    font-size: 18px;\n    font-weight: 800;\n    color: #ffffff;\n    cursor: pointer;\n    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n    font-family: inherit;\n    letter-spacing: -0.01em;\n    background: linear-gradient(135deg, var(--active-color, #3c3c3c) 0%, #3c3c3c 100%);\n    box-shadow: 0 12px 28px rgba(99, 102, 241, 0.25);\n    position: relative;\n    overflow: hidden;\n    text-transform: uppercase;\n    letter-spacing: 0.05em;\n}\n\n.yuddy-calculate-btn::before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: -100%;\n    width: 100%;\n    height: 100%;\n    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);\n    transition: left 0.6s ease;\n}\n\n.yuddy-calculate-btn:hover {\n    transform: translateY(-4px) scale(1.02);\n    box-shadow: 0 16px 36px rgba(99, 102, 241, 0.35);\n}\n\n.yuddy-calculate-btn:hover::before {\n    left: 100%;\n}\n\n.yuddy-calculate-btn:active {\n    transform: translateY(-2px) scale(1.01);\n}\n\n/* Enhanced Results Section */\n.yuddy-measurement-results {\n    margin-top: 40px;\n    padding-top: 32px;\n    border-top: 3px solid #e2e8f0;\n    position: relative;\n}\n\n.yuddy-measurement-results::before {\n    content: '';\n    position: absolute;\n    top: -3px;\n    left: 50%;\n    transform: translateX(-50%);\n    width: 100px;\n    height: 3px;\n    background: linear-gradient(90deg, #e2e8f0 0%, #000000 100%);\n    border-radius: 1.5px;\n}\n\n.yuddy-results-header h4 {\n    font-size: 20px;\n    font-weight: 800;\n    margin: 0 0 24px 0;\n    color: #0f172a;\n    text-transform: uppercase;\n    letter-spacing: 0.05em;\n    text-align: center;\n}\n\n.yuddy-results-content {\n    display: flex;\n    flex-direction: column;\n    gap: 20px;\n}\n\n.yuddy-result-bmi,\n.yuddy-result-measurements,\n.yuddy-result-size,\n.yuddy-alternative-sizes {\n    padding: 24px 28px;\n    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);\n    border-radius: 16px;\n    border: 2px solid #e2e8f0;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n    position: relative;\n    overflow: hidden;\n}\n\n.yuddy-result-bmi::before,\n.yuddy-result-measurements::before,\n.yuddy-result-size::before,\n.yuddy-alternative-sizes::before {\n    content: '';\n    position: absolute;\n    left: 0;\n    top: 0;\n    height: 100%;\n    width: 6px;\n    background: linear-gradient(180deg, #6366f1 0%, #10b981 100%);\n    transform: translateX(-100%);\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-result-bmi:hover,\n.yuddy-result-measurements:hover,\n.yuddy-result-size:hover,\n.yuddy-alternative-sizes:hover {\n    background: #ffffff;\n    border-color: #6366f1;\n    box-shadow: 0 12px 28px rgba(99, 102, 241, 0.12);\n    transform: translateY(-2px);\n}\n\n.yuddy-result-bmi:hover::before,\n.yuddy-result-measurements:hover::before,\n.yuddy-result-size:hover::before,\n.yuddy-alternative-sizes:hover::before {\n    transform: translateX(0);\n}\n\n.yuddy-result-size {\n    text-align: center;\n    border-color: #6366f1;\n    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, #ffffff 100%);\n    border-width: 3px;\n}\n\n.yuddy-size-display {\n    font-size: 80px;\n    font-weight: 900;\n    line-height: 1;\n    margin: 24px 0;\n    background: linear-gradient(135deg, #6366f1 0%, #10b981 100%);\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n    background-clip: text;\n    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);\n}\n\n/* Enhanced Additional Styles */\n.yuddy-result-bmi label,\n.yuddy-result-measurements label,\n.yuddy-result-size label,\n.yuddy-alternative-sizes label {\n    display: block;\n    font-size: 11px;\n    font-weight: 700;\n    color: #64748b;\n    margin-bottom: 10px;\n    text-transform: uppercase;\n    letter-spacing: 0.1em;\n}\n\n.yuddy-bmi-display {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n}\n\n.yuddy-bmi-value {\n    font-size: 24px;\n    font-weight: 800;\n    color: #0f172a;\n}\n\n.yuddy-bmi-label {\n    display: none;\n    font-size: 14px;\n    color: #64748b;\n    font-weight: 500;\n}\n\n.yuddy-measurement-chips,\n.yuddy-alternative-chips {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 10px;\n}\n\n.yuddy-chip {\n    display: inline-block;\n    padding: 10px 16px;\n    background-color: #ffffff;\n    border: 1px solid #e2e8f0;\n    border-radius: 24px;\n    font-size: 13px;\n    font-weight: 600;\n    color: #334155;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);\n}\n\n.yuddy-chip:hover {\n    background-color: #f1f5f9;\n    border-color: #cbd5e1;\n    transform: translateY(-2px);\n    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);\n}\n\n.yuddy-confidence {\n    margin-top: 20px;\n}\n\n.yuddy-confidence-bar {\n    width: 100%;\n    height: 28px;\n    background-color: #e2e8f0;\n    border-radius: 14px;\n    overflow: hidden;\n    margin-bottom: 10px;\n    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n\n.yuddy-confidence-fill {\n    height: 100%;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);\n    border-radius: 14px;\n    background: linear-gradient(135deg, var(--active-color, #6366f1) 0%, #10b981 100%);\n}\n\n.yuddy-confidence-fill span {\n    color: #ffffff;\n    font-size: 12px;\n    font-weight: 700;\n    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);\n}\n\n.yuddy-confidence p {\n    margin: 0;\n    font-size: 13px;\n    color: #64748b;\n    text-align: center;\n}\n\n/* Current Measurements */\n.yuddy-current-measurements {\n    margin-top: 24px;\n    padding: 24px;\n    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);\n    border-radius: 16px;\n    border: 1px solid #e2e8f0;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-current-measurements:hover {\n    background-color: #ffffff;\n    border-color: #cbd5e1;\n}\n\n.yuddy-measurement-item {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 14px 0;\n    border-bottom: 1px solid #e2e8f0;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-measurement-item:last-child {\n    border-bottom: none;\n}\n\n.yuddy-measurement-item:hover {\n    padding-left: 8px;\n    padding-right: 8px;\n    background-color: rgba(99, 102, 241, 0.04);\n    margin: 0 -8px;\n    border-radius: 8px;\n}\n\n.yuddy-measurement-label {\n    font-size: 14px;\n    font-weight: 600;\n    color: #64748b;\n}\n\n.yuddy-measurement-value {\n    font-size: 16px;\n    font-weight: 700;\n    color: #0f172a;\n}\n\n/* =====================================================\n   Enhanced Responsive Design\n   ===================================================== */\n\n@media (max-width: 768px) {\n    .yuddy-size-chart-header {\n        padding: 20px 20px 16px;\n    }\n\n    .yuddy-size-chart-title {\n        font-size: 18px;\n    }\n\n    .yuddy-size-chart-measurement-item {\n        padding: 16px 18px;\n    }\n\n    .yuddy-size-chart-label {\n        font-size: 13px;\n    }\n\n    .yuddy-size-chart-value {\n        font-size: 16px;\n    }\n\n    .yuddy-size-chart-button {\n        padding: 8px 4px;\n        font-size: 13px;\n    }\n\n    /* Mobile Modal */\n    .yuddy-size-chart-modal-overlay {\n        padding: 0;\n        align-items: flex-end;\n    }\n\n    .yuddy-size-chart-modal {\n        max-width: 100%;\n        width: 100%;\n        max-height: 95vh;\n        border-radius: 24px 24px 0 0;\n        transform: translateY(100%);\n    }\n    \n    .yuddy-size-chart-modal-visible {\n        transform: translateY(0);\n    }\n\n    .yuddy-size-chart-modal-header {\n        padding: 24px 20px 20px;\n        position: relative;\n    }\n\n    .yuddy-size-chart-modal-header::before {\n        content: '';\n        position: absolute;\n        top: 12px;\n        left: 50%;\n        transform: translateX(-50%);\n        width: 48px;\n        height: 4px;\n        background: #cbd5e1;\n        border-radius: 2px;\n    }\n\n    .yuddy-size-chart-modal-title {\n        font-size: 20px;\n        padding-top: 12px;\n    }\n    \n    .yuddy-size-chart-modal-close {\n        right: 16px;\n        width: 40px;\n        height: 40px;\n        font-size: 18px;\n    }\n\n    .yuddy-size-chart-tabs {\n        padding: 0 20px;\n    }\n\n    .yuddy-size-chart-tab {\n        min-width: 100px;\n        padding: 16px 20px;\n        font-size: 14px;\n    }\n\n    .yuddy-measurement-finder {\n        padding: 16px 16px;\n    }\n\n    .yuddy-form-section {\n        gap: 12px;\n        margin-bottom: 0;\n    }\n\n    .yuddy-form-label {\n        font-size: 13px;\n        margin-bottom: 8px;\n    }\n\n    /* Mobile Measurement Inputs - Side by Side */\n    .yuddy-measurement-inputs {\n        grid-template-columns: repeat(2, 1fr);\n        gap: 12px;\n    }\n\n    .yuddy-gender-selector {\n        grid-template-columns: repeat(2, 1fr);\n        max-width: none;\n        gap: 12px;\n    }\n\n    .yuddy-gender-btn {\n        padding: 10px 16px;\n        font-size: 13px;\n        min-height: auto;\n    }\n\n    .yuddy-body-type-grid {\n        grid-template-columns: repeat(4, 1fr);\n        max-width: none;\n        gap: 8px;\n    }\n\n    .yuddy-body-type-btn {\n        padding: 10px 6px;\n        font-size: 11px;\n        gap: 4px;\n    }\n\n    .yuddy-body-type-icon-wrapper {\n        height: 40px;\n        margin-bottom: 2px;\n    }\n\n    .yuddy-body-type-icon-wrapper svg {\n        max-width: 50px;\n    }\n\n    .yuddy-body-type-label {\n        font-size: 10px;\n    }\n\n    .yuddy-body-type-icon {\n        font-size: 20px;\n    }\n\n    .yuddy-fit-selector {\n        grid-template-columns: repeat(3, 1fr);\n        max-width: none;\n        gap: 8px;\n    }\n\n    .yuddy-fit-btn {\n        padding: 12px 8px;\n        font-size: 12px;\n    }\n\n    .yuddy-calculate-btn {\n        max-width: none;\n        font-size: 16px;\n        padding: 18px 28px;\n    }\n\n    .yuddy-size-display {\n        font-size: 64px;\n    }\n\n    .yuddy-size-chart-table-container {\n        padding: 24px 20px;\n        background-color: #f9f9f9;\n    }\n\n    /* Mobile Measurement Pages */\n    .yuddy-measurement-pages {\n        min-height: 300px;\n    }\n\n    .yuddy-measurement-page {\n        display: none;\n    }\n\n    .yuddy-measurement-page.active {\n        display: block;\n    }\n\n    /* Mobile Tab Navigation */\n    .yuddy-measurement-tabs {\n        display: flex;\n        position: fixed;\n        bottom: 0;\n        left: 0;\n        right: 0;\n        background: #ffffff;\n        border-top: 1px solid #e2e8f0;\n        padding: 12px 0;\n        z-index: 1000;\n        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);\n    }\n\n    .yuddy-measurement-tab {\n        flex: 1;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 4px;\n        padding: 8px 16px;\n        border: none;\n        background: transparent;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        color: #64748b;\n        font-size: 12px;\n        font-weight: 600;\n    }\n\n    .yuddy-measurement-tab.active {\n        color: #6366f1;\n    }\n\n    .yuddy-tab-number {\n        width: 32px;\n        height: 32px;\n        border-radius: 50%;\n        background: #e2e8f0;\n        color: #64748b;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: 14px;\n        font-weight: 700;\n        transition: all 0.2s ease;\n    }\n\n    .yuddy-measurement-tab.active .yuddy-tab-number {\n        background: #6366f1;\n        color: #ffffff;\n        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);\n    }\n\n    .yuddy-tab-label {\n        font-size: 11px;\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n    }\n\n    /* Add bottom padding to modal body on mobile to prevent content from being hidden behind tabs */\n    .yuddy-size-chart-modal-body {\n        padding-bottom: 80px;\n    }\n}\n\n/* =====================================================\n   Size Suggestions - Outside Popup (Next to Button)\n   ===================================================== */\n\n.yuddy-size-suggestions-wrapper {\n    margin-top: 16px;\n    padding: 0;\n}\n\n.yuddy-size-suggestions-content {\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n}\n\n.yuddy-size-suggestion-item {\n    display: flex;\n    align-items: flex-start;\n    gap: 10px;\n    padding: 12px 16px;\n    background: #fef3c7;\n    border-left: 3px solid #f59e0b;\n    border-radius: 6px;\n    transition: all 0.2s ease;\n}\n\n.yuddy-size-suggestion-item:hover {\n    background: #fde68a;\n    border-left-color: #d97706;\n}\n\n.yuddy-size-suggestion-item svg {\n    color: #f59e0b;\n    margin-top: 2px;\n    flex-shrink: 0;\n}\n\n.yuddy-size-suggestion-item p {\n    margin: 0;\n    font-size: 13px;\n    line-height: 1.6;\n    color: #92400e;\n    font-weight: 500;\n    font-style: italic;\n}\n\n/* Mobile Styles for Suggestions */\n@media (max-width: 768px) {\n    .yuddy-size-suggestions-wrapper {\n        margin-top: 16px;\n        padding: 16px 20px;\n        border-radius: 10px;\n    }\n\n    .yuddy-size-suggestions-header {\n        margin-bottom: 12px;\n        padding-bottom: 10px;\n    }\n\n    .yuddy-size-suggestions-title {\n        font-size: 14px;\n    }\n\n    .yuddy-size-suggestion-item {\n        padding: 12px 14px;\n    }\n\n    .yuddy-size-suggestion-item p {\n        font-size: 13px;\n    }\n}\n\n/* Desktop: Hide tab navigation */\n@media (min-width: 769px) {\n    .yuddy-measurement-tabs {\n        display: none;\n    }\n\n    .yuddy-measurement-page {\n        display: block !important;\n    }\n\n    .yuddy-measurement-page-2 {\n        display: block !important;\n    }\n\n    .yuddy-measurement-results {\n        display: block !important;\n    }\n}\n\n/* =====================================================\n   Additional Enhancement Styles\n   ===================================================== */\n\n.yuddy-size-chart-suggestions {\n    margin-top: 16px;\n    padding: 0 32px 32px;\n}\n\n.yuddy-size-chart-suggestion-item {\n    padding: 18px 24px;\n    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);\n    border: 1px solid #e2e8f0;\n    border-radius: 12px;\n    margin-bottom: 12px;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-size-chart-suggestion-item:hover {\n    background: #ffffff;\n    border-color: #cbd5e1;\n    transform: translateX(8px);\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);\n}\n\n.yuddy-size-chart-suggestion-item p {\n    margin: 0;\n    font-size: 14px;\n    color: #334155;\n    line-height: 1.6;\n    font-weight: 500;\n}\n\n.yuddy-size-chart-no-data {\n    padding: 48px 24px;\n    text-align: center;\n    color: #64748b;\n    font-size: 15px;\n    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);\n    border-radius: 16px;\n    border: 2px dashed #e2e8f0;\n    font-weight: 500;\n}\n\n.yuddy-size-chart-no-data::before {\n    content: '📏';\n    display: block;\n    font-size: 36px;\n    margin-bottom: 16px;\n}\n\n.yuddy-calculation-note {\n    display: flex;\n    align-items: flex-start;\n    gap: 12px;\n    padding: 20px 24px;\n    margin-bottom: 24px;\n    background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 5%, #fef3c7 100%);\n    border: 1px solid #f59e0b;\n    border-left: 4px solid #f59e0b;\n    border-radius: 12px;\n    position: relative;\n    overflow: hidden;\n}\n\n.yuddy-calculation-note::before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 2px;\n    background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%);\n}\n\n.yuddy-note-icon {\n    flex-shrink: 0;\n    width: 20px;\n    height: 20px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: 50%;\n    background: rgba(245, 158, 11, 0.2);\n    color: #d97706;\n    margin-top: 2px;\n}\n\n.yuddy-note-icon svg {\n    width: 16px;\n    height: 16px;\n}\n\n.yuddy-note-content {\n    flex: 1;\n    font-size: 14px;\n    line-height: 1.6;\n    color: #92400e;\n    font-weight: 500;\n}\n\n.yuddy-note-content strong {\n    font-weight: 700;\n    color: #78350f;\n    display: block;\n    margin-bottom: 4px;\n}\n\n/* Mobile responsive */\n@media (max-width: 768px) {\n    .yuddy-calculation-note {\n        padding: 16px 20px;\n        margin-bottom: 20px;\n    }\n    \n    .yuddy-note-content {\n        font-size: 13px;\n    }\n    \n    .yuddy-note-icon {\n        width: 18px;\n        height: 18px;\n    }\n    \n    .yuddy-note-icon svg {\n        width: 14px;\n        height: 14px;\n    }\n}\nyuddy-measurements-accordion {\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n    margin-top: 16px;\n}\n\n.yuddy-measurement-category {\n    border: 1px solid #e2e8f0;\n    border-radius: 12px;\n    overflow: hidden;\n    background: #ffffff;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n    margin-bottom: 2px;\n}\n\n.yuddy-measurement-category:hover {\n    border-color: #cbd5e1;\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);\n}\n\n.yuddy-category-header {\n    width: 100%;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 16px 20px;\n    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);\n    border: none;\n    cursor: pointer;\n    font-family: inherit;\n    font-size: 14px;\n    font-weight: 700;\n    color: #475569;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n    text-align: left;\n}\n\n.yuddy-category-header:hover {\n    background: linear-gradient(135deg, #f1f5f9 0%, #fafbfc 100%);\n    color: #334155;\n}\n\n.yuddy-category-header.yuddy-category-active {\n    background: linear-gradient(135deg, #ddd6fe 0%, #e0e7ff 100%);\n    color: #6366f1;\n    border-bottom: 1px solid #e2e8f0;\n}\n\n.yuddy-category-title {\n    font-weight: 700;\n    flex: 1;\n}\n\n.yuddy-category-count {\n    font-size: 12px;\n    font-weight: 600;\n    color: #94a3b8;\n    margin-right: 12px;\n    background: rgba(99, 102, 241, 0.1);\n    padding: 4px 8px;\n    border-radius: 6px;\n}\n\n.yuddy-category-icon {\n    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n    color: #94a3b8;\n}\n\n.yuddy-category-content {\n    padding: 0 20px 20px;\n    background: #ffffff;\n    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n@keyframes slideDown {\n    from {\n        opacity: 0;\n        transform: translateY(-8px);\n    }\n    to {\n        opacity: 1;\n        transform: translateY(0);\n    }\n}\n\n.yuddy-measurement-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n    gap: 12px;\n    margin-top: 5px;\n}\n\n.yuddy-measurement-chip {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 12px 16px;\n    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);\n    border: 1px solid #e2e8f0;\n    border-radius: 8px;\n    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.yuddy-measurement-chip:hover {\n    background: linear-gradient(135deg, #f1f5f9 0%, #fafbfc 100%);\n    border-color: #cbd5e1;\n    transform: translateY(-1px);\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);\n}\n\n.yuddy-measurement-name {\n    font-size: 13px;\n    font-weight: 600;\n    color: #64748b;\n    flex: 1;\n}\n\n.yuddy-measurement-value {\n    font-size: 15px;\n    font-weight: 800;\n    color: #0f172a;\n    letter-spacing: -0.01em;\n}\n\n/* Mobile responsive */\n@media (max-width: 768px) {\n    .yuddy-measurement-grid {\n        grid-template-columns: 1fr;\n        gap: 8px;\n    }\n    \n    .yuddy-category-header {\n        padding: 14px 16px;\n        font-size: 13px;\n    }\n    \n    .yuddy-category-content {\n        padding: 0 16px 16px;\n    }\n    \n    .yuddy-measurement-chip {\n        padding: 10px 14px;\n    }\n    \n    .yuddy-measurement-name {\n        font-size: 12px;\n    }\n    \n    .yuddy-measurement-value {\n        font-size: 14px;\n    }\n}";
    styleInject(css_248z);

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

    // Auto-initialize if used as UMD in browser
    if (typeof window !== 'undefined') {
        // Add class to window object
        window.SizeChart = SizeChart;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let widgetInstance = null;
        /**
         * Check if current page is a product page
         */
        const isProductPage = () => {
            // Check URL for product slug
            const slug = getProductSlugFromPathname(window.location.pathname);
            if (slug) {
                return true;
            }
            // Check DOM for product indicators
            const productSelectors = [
                '.product-detail',
                '.product-info',
                '.product-container',
                '[data-product-id]',
                '[data-product-slug]',
                '.product-page',
            ];
            return productSelectors.some(selector => document.querySelector(selector) !== null);
        };
        // Widget'ı başlat - SADECE ürün sayfasında
        const initializeWidget = () => {
            // Check if it's a product page
            if (!isProductPage()) {
                return;
            }
            // Cleanup previous instance if exists
            if (widgetInstance) {
                widgetInstance.destroy();
                widgetInstance = null;
            }
            widgetInstance = new SizeChart();
        };
        // Sayfa yüklendiğinde
        const setupWidget = () => {
            const autoInit = window.YUDDY_SIZE_CHART_AUTO_INIT !== false;
            if (autoInit) {
                // Önce ürün sayfası zaten yüklü mü kontrol et
                initializeWidget();
                // MutationObserver ile ürün container'ını izle
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const element = node;
                                // Ürün container'ı eklendiyse
                                if (element.classList?.contains('product-detail') ||
                                    element.classList?.contains('product-info') ||
                                    element.querySelector('[data-product-id]') ||
                                    element.querySelector('[data-product-slug]')) {
                                    setTimeout(() => initializeWidget(), 300);
                                }
                            }
                        });
                    }
                });
                // Body'yi izlemeye başla
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
                // Override pushState and replaceState for SPA navigation
                const originalPushState = history.pushState;
                const originalReplaceState = history.replaceState;
                history.pushState = function (...args) {
                    originalPushState.apply(history, args);
                    setTimeout(() => initializeWidget(), 300);
                };
                history.replaceState = function (...args) {
                    originalReplaceState.apply(history, args);
                    setTimeout(() => initializeWidget(), 300);
                };
                // Listen for popstate (browser back/forward)
                window.addEventListener('popstate', () => {
                    setTimeout(() => initializeWidget(), 300);
                });
                // Listen for hash changes
                window.addEventListener('hashchange', () => {
                    setTimeout(() => initializeWidget(), 300);
                });
            }
        };
        // DOM ready veya zaten yüklü
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupWidget);
        }
        else {
            setupWidget();
        }
    }

    exports.APIError = APIError;
    exports.SizeChart = SizeChart;
    exports.WidgetError = WidgetError;
    exports.YUDDY_SIZE_CHART_BUTTON_CLASS = YUDDY_SIZE_CHART_BUTTON_CLASS;
    exports.YUDDY_SIZE_CHART_BUTTON_DATA_ATTR = YUDDY_SIZE_CHART_BUTTON_DATA_ATTR;
    exports.YUDDY_SIZE_CHART_BUTTON_DATA_VALUE = YUDDY_SIZE_CHART_BUTTON_DATA_VALUE;
    exports.YUDDY_SIZE_CHART_BUTTON_ID = YUDDY_SIZE_CHART_BUTTON_ID;
    exports.buildMeasurementResultsHtml = buildMeasurementResultsHtml;
    exports.buildModalHeaderInnerHtml = buildModalHeaderInnerHtml;
    exports.buildSizeChartWidgetHtml = buildSizeChartWidgetHtml;
    exports.collectVariantContainers = collectVariantContainers;
    exports.convertSizeTableToMatchFormat = convertSizeTableToMatchFormat;
    exports.default = SizeChart;
    exports.detectPlatform = detectPlatform;
    exports.findLastVariantControlInContainer = findLastVariantControlInContainer;
    exports.findVariantStructureRoot = findVariantStructureRoot;
    exports.generateBodyTypeHtml = generateBodyTypeHtml;
    exports.getApplicableSuggestionsForProduct = getApplicableSuggestionsForProduct;
    exports.getApplicableTablesForProduct = getApplicableTablesForProduct;
    exports.getMergedCartExclusionSelectors = getMergedCartExclusionSelectors;
    exports.getPlatformDomConfig = getPlatformDomConfig;
    exports.getRecommendationText = getRecommendationText;
    exports.isInsideCartElement = isInsideCartElement;
    exports.normalizeApplicableProduct = normalizeApplicableProduct;
    exports.normalizeSizeChartApiResult = normalizeSizeChartApiResult;
    exports.normalizeSizeChartData = normalizeSizeChartData;
    exports.resolveSuggestionInsertionPlan = resolveSuggestionInsertionPlan;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});

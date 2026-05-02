/*!
 * Flash Products Widget v1.0.0
 * Build Date: 02.05.2026 22:55:25
 * (c) 2026 Yuddy
 */
var FlashProducts = (function (exports) {
    'use strict';

    globalThis.__BUILD_ENV__ = '';

    const CACHE_KEY_PREFIX = 'yuddy_fp_';
    // Kısa TTL: panelden kayıt sonrası yeni updateDate / counter hızlı yansısın (sayaç ankeri güncellensin)
    const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
    class StorageManager {
        getKey(storeName) {
            return `${CACHE_KEY_PREFIX}${storeName}`;
        }
        getCached(storeName) {
            try {
                const raw = localStorage.getItem(this.getKey(storeName));
                if (!raw)
                    return null;
                const entry = JSON.parse(raw);
                if (Date.now() - entry.timestamp > CACHE_TTL_MS)
                    return null;
                if (entry.storeName !== storeName)
                    return null;
                return entry.data;
            }
            catch {
                return null;
            }
        }
        setCached(data, storeName) {
            try {
                const entry = {
                    data,
                    timestamp: Date.now(),
                    storeName,
                };
                localStorage.setItem(this.getKey(storeName), JSON.stringify(entry));
            }
            catch {
                // ignore
            }
        }
    }

    class APIClient {
        constructor(baseUrl) {
            this.baseUrl = baseUrl.replace(/\/$/, '');
            this.storage = new StorageManager();
        }
        getHostname() {
            if (typeof window === 'undefined')
                return '';
            return window.location.hostname.replace(/^(www\.|http:\/\/|https:\/\/)/, '');
        }
        isLocal(hostname) {
            return (hostname === 'localhost' ||
                hostname === '127.0.0.1' ||
                hostname.startsWith('192.168.') ||
                hostname.startsWith('10.'));
        }
        /**
         * GET flash-product by storeName (public engagement endpoint).
         * Uses cache (10 min TTL) unless forceRefresh is true.
         */
        async getFlashProduct(storeName, forceRefresh = false) {
            let hostname = storeName || this.getHostname();
            if (this.isLocal(hostname)) {
                hostname = (typeof window !== 'undefined' && window.YUDDY_FLASH_PRODUCTS_TEST_HOSTNAME) || 'yuddy.store';
            }
            if (!forceRefresh) {
                const cached = this.storage.getCached(hostname);
                if (cached)
                    return cached;
            }
            try {
                const url = `${this.baseUrl}/engagements/flash-product?storeName=${encodeURIComponent(hostname)}`;
                const res = await fetch(url, {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) {
                    if (res.status === 404)
                        return null;
                    return null;
                }
                const data = await res.json();
                if (!data || !data.flashProductGeneralSettings)
                    return null;
                this.storage.setCached(data, hostname);
                return data;
            }
            catch {
                return null;
            }
        }
    }

    /**
     * Varsayılan demo verisi. Local'de API'den mağaza verisi gelmediğinde
     * veya window.YUDDY_FLASH_PRODUCTS_DEMO === true iken kullanılır.
     */
    function getDefaultDemoData() {
        return {
            isActive: true,
            updateDate: new Date().toISOString(),
            flashProductGeneralSettings: {
                title: 'Flash Ürünler',
                titleIcon: '⚡',
                titlePosition: 'start',
                backgroundColor: '#fff3e0',
                titleColor: '#e65100',
                productNameColor: '#1a1a1a',
                productPriceColor: '#e65100',
                productCardBackgroundColor: '#ffffff',
                flashBlockPositionRange: 1,
                counter: 6,
                applicableProducts: [
                    {
                        id: 'demo-1',
                        name: 'Demo Ürün 1',
                        sku: 'SKU-1',
                        imageUrl: 'https://picsum.photos/seed/fp1/400/400',
                        slug: 'demo-urun-1',
                        price: 199.99,
                        currencyCode: 'TRY',
                        currencySymbol: '₺',
                        status: true,
                    },
                    {
                        id: 'demo-2',
                        name: 'Demo Ürün 2',
                        imageUrl: 'https://picsum.photos/seed/fp2/400/400',
                        slug: 'demo-urun-2',
                        price: 349.5,
                        currencySymbol: '₺',
                        status: true,
                    },
                    {
                        id: 'demo-3',
                        name: 'Demo Ürün 3',
                        imageUrl: 'https://picsum.photos/seed/fp3/400/400',
                        slug: 'demo-urun-3',
                        price: 129.0,
                        currencySymbol: '₺',
                        status: true,
                    },
                    {
                        id: 'demo-4',
                        name: 'Demo Ürün 4',
                        imageUrl: 'https://picsum.photos/seed/fp4/400/400',
                        slug: 'demo-urun-4',
                        price: 599.0,
                        currencySymbol: '₺',
                        status: true,
                    },
                    {
                        id: 'demo-5',
                        name: 'Demo Ürün 5',
                        imageUrl: 'https://picsum.photos/seed/fp5/400/400',
                        slug: 'demo-urun-5',
                        price: 89.99,
                        currencySymbol: '₺',
                        status: true,
                    },
                    {
                        id: 'demo-6',
                        name: 'Demo Ürün 6',
                        imageUrl: 'https://picsum.photos/seed/fp6/400/400',
                        slug: 'demo-urun-6',
                        price: 219.99,
                        currencySymbol: '₺',
                        status: true,
                    },
                ],
            },
        };
    }

    /**
     * Flash Products’un gösterileceği URL’ler — `index.ts` otomatik init ile aynı olmalı.
     */
    function isFlashProductsHomepagePath() {
        if (typeof window === 'undefined')
            return false;
        if (window.YUDDY_FLASH_PRODUCTS_DEMO === true) {
            return true;
        }
        const path = window.location.pathname.replace(/\/+$/, '') || '/';
        const pathLower = path.toLowerCase();
        if (pathLower.startsWith('/demo'))
            return true;
        const homePaths = ['', '/', '/home', '/index', '/anasayfa'];
        return homePaths.includes(pathLower);
    }

    /** DOM — tek kaynak (dom-renderer + dom-insertion) */
    const FLASH_PRODUCTS_SECTION_ID = 'yuddy-flash-products-section';
    const FLASH_PRODUCTS_SECTION_CLASS = 'yuddy-flash-products';

    /** Ideasoft ana sayfa satır kökü — `entry-row-1`, `entry-row-2`, … */
    const IDEASOFT_ENTRY_ROW_PREFIX = 'entry-row';
    /** API `flashBlockPositionRange` ile uyum için üst sınır (entry-row-N indeksi). */
    const IDEASOFT_MAX_ENTRY_ROW_INDEX = 99;
    /** id veya class içinde `entry-row-{sayı}` yakalar (`entry-row-11` ile `entry-row-1` karışmaz). */
    const ENTRY_ROW_NUM_RE = /entry-row-(\d+)(?!\d)/;
    function elementClassAndId(el) {
        const idPart = el.id ? `${el.id} ` : '';
        let cls = '';
        if ('className' in el && el.className != null) {
            cls = typeof el.className === 'string' ? el.className : el.className.baseVal || '';
        }
        if (!cls && el.getAttribute)
            cls = el.getAttribute('class') || '';
        return `${idPart}${cls}`;
    }
    function extractEntryRowNumber(el) {
        const haystack = `${el.id || ''} ${elementClassAndId(el)}`;
        const m = haystack.match(ENTRY_ROW_NUM_RE);
        if (!m)
            return null;
        const n = parseInt(m[1], 10);
        if (!Number.isFinite(n) || n < 1 || n > IDEASOFT_MAX_ENTRY_ROW_INDEX)
            return null;
        return n;
    }
    /**
     * Aynı satır numarası için üst sarmalayıcıyı seç: başka adayın içinde kalanları ele.
     */
    function pickRepresentativeElements(candidates) {
        const byNum = new Map();
        for (const { rowNumber, element } of candidates) {
            if (!byNum.has(rowNumber))
                byNum.set(rowNumber, []);
            byNum.get(rowNumber).push(element);
        }
        const out = [];
        for (const [rowNumber, els] of byNum) {
            const outer = els.filter((el) => !els.some((o) => o !== el && o.contains(el)));
            outer.sort((a, b) => {
                const pos = a.compareDocumentPosition(b);
                if (pos & Node.DOCUMENT_POSITION_FOLLOWING)
                    return -1;
                if (pos & Node.DOCUMENT_POSITION_PRECEDING)
                    return 1;
                return 0;
            });
            if (outer[0])
                out.push({ rowNumber, element: outer[0] });
        }
        return out.sort((a, b) => a.rowNumber - b.rowNumber);
    }
    /**
     * Sayfadaki tüm entry-row-{n} köklerini bulur, satır numarasına göre sıralar.
     * DOM sırasına güvenilmez; görsel sıra `rowNumber` ile hizalanır.
     */
    function collectIdeasoftEntryRowsSorted() {
        if (typeof document === 'undefined')
            return [];
        const seen = new Set();
        const raw = [];
        const scan = (root) => {
            let list;
            try {
                list = root.querySelectorAll('[id*="entry-row"], [class*="entry-row"]');
            }
            catch {
                return;
            }
            list.forEach((el) => {
                if (seen.has(el))
                    return;
                const n = extractEntryRowNumber(el);
                if (n === null)
                    return;
                seen.add(el);
                raw.push({ rowNumber: n, element: el });
            });
        };
        scan(document);
        return pickRepresentativeElements(raw);
    }
    const MAIN_FALLBACK_SELECTORS = [
        'main',
        '[role="main"]',
        '#main',
        '.main',
        '.main-content',
        '#content',
        '.content',
        '.page-content',
        '#__next',
        '#root',
        '#idea-wrapper',
        '#idea-main-content',
        '.idea-main-content',
    ];
    /** Ideasoft’ta main içerik kapsayıcıları (Ikas’taki liste ile birleştirilmez — yalnız ideasoft fallback önceliği). */
    const IDEASOFT_MAIN_FALLBACK_EXTRA = [
        '#idea-wrapper',
        '#idea-main-content',
        '.idea-main-content',
        '.idea-container',
        '#content-main',
    ];
    function mergeMainFallbackSelectors(platform) {
        if (platform !== 'ideasoft') {
            return [...MAIN_FALLBACK_SELECTORS];
        }
        return Array.from(new Set([...IDEASOFT_MAIN_FALLBACK_EXTRA, ...MAIN_FALLBACK_SELECTORS]));
    }
    function resolveFirstMatch(selectors) {
        if (typeof document === 'undefined')
            return null;
        for (const sel of selectors) {
            try {
                const el = document.querySelector(sel);
                if (el)
                    return el;
            }
            catch {
                /* invalid selector — skip */
            }
        }
        return null;
    }
    /**
     * Tek bir satır için ilk eşleşen eleman (collect kullanılamadığında).
     */
    function resolveIdeasoftEntryRow(rowNumber) {
        if (rowNumber < 1 || !Number.isFinite(rowNumber))
            return null;
        const n = Math.min(IDEASOFT_MAX_ENTRY_ROW_INDEX, Math.floor(rowNumber));
        const base = `${IDEASOFT_ENTRY_ROW_PREFIX}-${n}`;
        return resolveFirstMatch([
            `#${base}`,
            `[id="${base}"]`,
            `.${base}`,
            `[class~="${base}"]`,
            `[class*="${base}"]`,
        ]);
    }

    /**
     * Flash Products widget — mağaza platformu algılama (cart suggestion ile uyumlu sıra).
     * Test / demo: `window.YUDDY_FLASH_PRODUCTS_PLATFORM = 'ideasoft' | 'ikas' | 'other'`
     */
    function detectPlatform() {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return 'other';
        }
        const forced = window
            .YUDDY_FLASH_PRODUCTS_PLATFORM;
        if (forced === 'ikas' || forced === 'ideasoft' || forced === 'other') {
            return forced;
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
        return 'other';
    }

    /**
     * Ideasoft: DOM’daki tüm `entry-row-{n}` kökleri toplanır, sayıya göre sıralanır (DOM sırasına güvenilmez).
     * Ikas ile aynı anlam:
     * - range 0 → ilk satırdan önce
     * - range k (k≥1) → `entry-row-k` satırından hemen sonra (k ile k+1 arası)
     *
     * Tam `entry-row-k` yoksa: k’dan küçük en büyük satırdan sonra; hiç yoksa ilk satırdan önce vb.
     */
    function findInsertionPointIdeasoft(flashBlockPositionRange) {
        const range = Math.max(0, Math.min(IDEASOFT_MAX_ENTRY_ROW_INDEX, flashBlockPositionRange));
        const rows = collectIdeasoftEntryRowsSorted();
        if (rows.length === 0)
            return null;
        if (range === 0) {
            const first = rows[0].element;
            if (first.parentElement) {
                return { parent: first.parentElement, index: 0, insertBefore: first };
            }
            return null;
        }
        const exact = rows.find((r) => r.rowNumber === range);
        if (exact?.element.parentElement) {
            return { parent: exact.element.parentElement, index: range, insertAfter: exact.element };
        }
        const strictlyLower = rows.filter((r) => r.rowNumber < range);
        if (strictlyLower.length > 0) {
            const anchor = strictlyLower[strictlyLower.length - 1].element;
            if (anchor.parentElement) {
                return { parent: anchor.parentElement, index: range, insertAfter: anchor };
            }
        }
        const first = rows[0];
        if (first.rowNumber > range && first.element.parentElement) {
            return { parent: first.element.parentElement, index: 0, insertBefore: first.element };
        }
        const last = rows[rows.length - 1];
        if (last.element.parentElement) {
            return { parent: last.element.parentElement, index: range, insertAfter: last.element };
        }
        return null;
    }
    /**
     * Ikas — sayfa alanları id="0", id="1", … (mevcut davranış, değiştirilmedi).
     */
    function findInsertionPointIkasNumeric(flashBlockPositionRange) {
        const range = Math.max(0, Math.min(9, flashBlockPositionRange));
        if (range === 0) {
            const anchor = document.getElementById('0');
            if (anchor?.parentElement) {
                return { parent: anchor.parentElement, index: 0, insertBefore: anchor };
            }
        }
        else {
            const anchorId = String(range - 1);
            const anchor = document.getElementById(anchorId);
            if (anchor?.parentElement) {
                return { parent: anchor.parentElement, index: range, insertAfter: anchor };
            }
        }
        return null;
    }
    function findInsertionPointMainFallback(flashBlockPositionRange, platform) {
        const range = Math.max(0, Math.min(9, flashBlockPositionRange));
        const mainSelectors = mergeMainFallbackSelectors(platform);
        for (const sel of mainSelectors) {
            let main = null;
            try {
                main = document.querySelector(sel);
            }
            catch {
                continue;
            }
            if (!main)
                continue;
            const children = Array.from(main.children).filter((el) => {
                const tag = el.tagName.toLowerCase();
                const role = el.getAttribute('role');
                const id = (el.id || '').toLowerCase();
                if (tag === 'header' ||
                    tag === 'footer' ||
                    role === 'banner' ||
                    id.includes('header') ||
                    id.includes('footer')) {
                    return false;
                }
                return true;
            });
            if (children.length === 0) {
                return { parent: main, index: 0 };
            }
            const index = Math.min(range, children.length);
            if (index === 0) {
                return { parent: main, index: 0 };
            }
            return { parent: main, index, insertAfter: children[index - 1] };
        }
        const body = document.body;
        const firstMain = body.querySelector('main, #main, .main, [role="main"], #idea-wrapper, #idea-main-content') ||
            body;
        return { parent: firstMain, index: 0 };
    }
    /**
     * Sayfa alanları:
     * - Ikas / other: id="0"… önce, sonra generic main fallback.
     * - Ideasoft: önce `entry-row-{n}` köprüleri, sonra Ideasoft-ağırlıklı main fallback (Ikas numeric id yok).
     */
    function findInsertionPoint(flashBlockPositionRange, platform) {
        if (platform === 'ideasoft') {
            const idea = findInsertionPointIdeasoft(flashBlockPositionRange);
            if (idea)
                return idea;
            return findInsertionPointMainFallback(flashBlockPositionRange, platform);
        }
        const ikasPoint = findInsertionPointIkasNumeric(flashBlockPositionRange);
        if (ikasPoint)
            return ikasPoint;
        return findInsertionPointMainFallback(flashBlockPositionRange, platform);
    }
    /** Insert section into DOM */
    function injectSection(html, flashBlockPositionRange, platform) {
        removeSection();
        const p = platform ?? detectPlatform();
        const point = findInsertionPoint(flashBlockPositionRange, p);
        if (!point)
            return;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html.trim();
        const section = wrapper.firstElementChild;
        if (!section)
            return;
        const { parent, index, insertAfter, insertBefore } = point;
        if (insertBefore) {
            parent.insertBefore(section, insertBefore);
        }
        else if (insertAfter) {
            insertAfter.insertAdjacentElement('afterend', section);
        }
        else if (index === 0 && parent.firstChild) {
            parent.insertBefore(section, parent.firstChild);
        }
        else {
            parent.appendChild(section);
        }
    }
    function removeSection() {
        const el = document.getElementById(FLASH_PRODUCTS_SECTION_ID);
        if (!el)
            return;
        const intervalId = el
            .__yuddyFpCountdownInterval;
        if (intervalId)
            clearInterval(intervalId);
        el.remove();
    }

    function escapeHtml(s) {
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }
    function productLink(slug) {
        const path = slug.startsWith('/') ? slug : `/${slug}`;
        return path;
    }
    function formatPrice(value) {
        // 199.99 -> "199.99", 599.00 -> "599"
        const fixed = value.toFixed(2);
        return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    }
    /** Build product card HTML for one item */
    function buildProductCard(item, settings) {
        const nameColor = settings.productNameColor || '#1a1a1a';
        const priceColor = settings.productPriceColor || '#e65100';
        const cardBg = settings.productCardBackgroundColor || '#ffffff';
        const href = productLink(item.slug || '');
        const name = escapeHtml(item.name || '');
        const imgUrl = item.imageUrl || '';
        const priceValue = typeof item.price === 'number' && Number.isFinite(item.price) ? item.price : null;
        const priceText = priceValue != null ? formatPrice(priceValue) : '-';
        const currencyDisplay = (item.currencySymbol && item.currencySymbol.trim()) ||
            (item.currencyCode && item.currencyCode.trim()) ||
            '₺';
        return `
    <a href="${escapeHtml(href)}" class="${FLASH_PRODUCTS_SECTION_CLASS}__card" style="background-color:${escapeHtml(cardBg)};">
      <div class="${FLASH_PRODUCTS_SECTION_CLASS}__card-image-wrap">
        ${imgUrl ? `<img class="${FLASH_PRODUCTS_SECTION_CLASS}__card-image" src="${escapeHtml(imgUrl)}" alt="${name}" loading="lazy" />` : `<div class="${FLASH_PRODUCTS_SECTION_CLASS}__card-image-placeholder"></div>`}
      </div>
      <div class="${FLASH_PRODUCTS_SECTION_CLASS}__card-body">
        <span class="${FLASH_PRODUCTS_SECTION_CLASS}__card-name" style="color:${escapeHtml(nameColor)}">${name}</span>
        <span class="${FLASH_PRODUCTS_SECTION_CLASS}__card-price" style="color:${escapeHtml(priceColor)}">${escapeHtml(priceText)} ${escapeHtml(currencyDisplay)}</span>
      </div>
    </a>
  `;
    }
    /** Build full section HTML */
    function buildSectionHTML(data) {
        const settings = data.flashProductGeneralSettings || {};
        const products = settings.applicableProducts || [];
        const bg = settings.backgroundColor || '#fff3e0';
        const titleColor = settings.titleColor || '#e65100';
        const title = settings.title || 'Flash Ürünler';
        const titleIcon = settings.titleIcon || '⚡';
        const titlePosition = settings.titlePosition === 'center' ? 'center' : 'flex-start';
        const cardsHtml = products.map((item) => buildProductCard(item, settings)).join('');
        const iconHtml = !titleIcon.includes(':')
            ? `<span class="${FLASH_PRODUCTS_SECTION_CLASS}__title-icon" style="color:${escapeHtml(titleColor)}">${escapeHtml(titleIcon)}</span>`
            : '';
        const hasScroll = products.length > 4;
        const sectionModifier = hasScroll ? ` ${FLASH_PRODUCTS_SECTION_CLASS}--scrollable` : '';
        const counterHours = Math.max(0, Math.min(999, settings.counter ?? 24));
        const updateDateIso = data.updateDate != null && String(data.updateDate).trim() !== ''
            ? String(data.updateDate).trim()
            : '';
        const arrowSvg = (dir) => {
            const path = dir === 'left'
                ? 'M15 18l-6-6 6-6'
                : 'M9 18l6-6-6-6';
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
        };
        return `
    <section id="${FLASH_PRODUCTS_SECTION_ID}" class="${FLASH_PRODUCTS_SECTION_CLASS}${sectionModifier}" style="background-color:${escapeHtml(bg)};" data-counter-hours="${counterHours}" data-update-date="${escapeHtml(updateDateIso)}">
      <div class="${FLASH_PRODUCTS_SECTION_CLASS}__header" style="justify-content:${titlePosition};">
        <div class="${FLASH_PRODUCTS_SECTION_CLASS}__header-left">
          ${iconHtml}
          <h2 class="${FLASH_PRODUCTS_SECTION_CLASS}__title" style="color:${escapeHtml(titleColor)}">${escapeHtml(title)}</h2>
        </div>
        <div class="${FLASH_PRODUCTS_SECTION_CLASS}__countdown" style="color:${escapeHtml(titleColor)}" aria-live="polite" aria-label="Kampanya bitiş sayacı">
          <div class="${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card" aria-hidden="true">
            <span class="${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card-value" data-unit="h">--</span>
            <span class="${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card-label">Saat</span>
          </div>
          <div class="${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card" aria-hidden="true">
            <span class="${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card-value" data-unit="m">--</span>
            <span class="${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card-label">Dk</span>
          </div>
          <div class="${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card" aria-hidden="true">
            <span class="${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card-value" data-unit="s">--</span>
            <span class="${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card-label">Sn</span>
          </div>
        </div>
      </div>
      <div class="${FLASH_PRODUCTS_SECTION_CLASS}__list-wrapper">
        <button type="button" class="${FLASH_PRODUCTS_SECTION_CLASS}__arrow ${FLASH_PRODUCTS_SECTION_CLASS}__arrow--prev" aria-label="Önceki ürünler">${arrowSvg('left')}</button>
        <div class="${FLASH_PRODUCTS_SECTION_CLASS}__list" role="list" aria-label="${escapeHtml(title)} ürün listesi">
          ${cardsHtml}
        </div>
        <button type="button" class="${FLASH_PRODUCTS_SECTION_CLASS}__arrow ${FLASH_PRODUCTS_SECTION_CLASS}__arrow--next" aria-label="Sonraki ürünler">${arrowSvg('right')}</button>
      </div>
    </section>
  `;
    }
    const LIST_SCROLL_AMOUNT = 200;
    /** Ok butonlarına tıklanınca listeyi kaydır (enjekte edildikten sonra çağrılır) */
    function attachListArrowListeners(section) {
        if (!section)
            return;
        const list = section.querySelector(`.${FLASH_PRODUCTS_SECTION_CLASS}__list`);
        const prevBtn = section.querySelector(`.${FLASH_PRODUCTS_SECTION_CLASS}__arrow--prev`);
        const nextBtn = section.querySelector(`.${FLASH_PRODUCTS_SECTION_CLASS}__arrow--next`);
        if (!list || !prevBtn || !nextBtn)
            return;
        const updateArrows = () => {
            const { scrollLeft, scrollWidth, clientWidth } = list;
            prevBtn.classList.toggle(`${FLASH_PRODUCTS_SECTION_CLASS}__arrow--disabled`, scrollLeft <= 0);
            nextBtn.classList.toggle(`${FLASH_PRODUCTS_SECTION_CLASS}__arrow--disabled`, scrollLeft >= scrollWidth - clientWidth - 2);
        };
        prevBtn.addEventListener('click', () => {
            list.scrollBy({ left: -LIST_SCROLL_AMOUNT, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            list.scrollBy({ left: LIST_SCROLL_AMOUNT, behavior: 'smooth' });
        });
        list.addEventListener('scroll', updateArrows);
        updateArrows();
    }
    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }
    /**
     * Sayaç döngüsü (kalkmaz):
     * - Başlangıç zamanı her zaman API’den gelen `updateDate` (kampanya ayarı son kayıt anı).
     * - İlk ve sonraki tüm periyotlar: [updateDate + n*counterSaat, updateDate + (n+1)*counterSaat).
     * - Periyot bitiminde kalan süre tekrar tam `counter` saate sıçrar (yenilenir).
     * Kullanıcı panelde kaydettiğinde backend `updateDate` günceller; widget yeni veriyi alınca sayaç o ana göre hizalanır.
     */
    function getCycleRemainingMs(anchorMs, periodMs, now) {
        if (periodMs <= 0)
            return 0;
        if (now < anchorMs) {
            return Math.max(0, anchorMs + periodMs - now);
        }
        const elapsed = now - anchorMs;
        const rem = periodMs - (elapsed % periodMs);
        return rem;
    }
    /** Başlığın sağındaki geri sayım: anker = API updateDate, periyot = counter (saat), döngüsel yenileme */
    function attachCountdown(section) {
        if (!section)
            return;
        const counterHours = parseInt(section.getAttribute('data-counter-hours') || '24', 10);
        const updateDateStr = section.getAttribute('data-update-date')?.trim() || '';
        const elH = section.querySelector(`.${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card-value[data-unit="h"]`);
        const elM = section.querySelector(`.${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card-value[data-unit="m"]`);
        const elS = section.querySelector(`.${FLASH_PRODUCTS_SECTION_CLASS}__countdown-card-value[data-unit="s"]`);
        if (!elH || !elM || !elS)
            return;
        const periodMs = counterHours * 60 * 60 * 1000;
        // Anker yalnızca API tarihi; yoksa / geçersizse (ör. demo) istemci zamanı
        let anchorMs = Date.parse(updateDateStr);
        if (Number.isNaN(anchorMs)) {
            anchorMs = Date.now();
        }
        let intervalId = null;
        const tick = () => {
            if (periodMs <= 0) {
                elH.textContent = '00';
                elM.textContent = '00';
                elS.textContent = '00';
                return;
            }
            const now = Date.now();
            const remaining = getCycleRemainingMs(anchorMs, periodMs, now);
            if (remaining <= 0) {
                elH.textContent = '00';
                elM.textContent = '00';
                elS.textContent = '00';
                section.querySelector(`.${FLASH_PRODUCTS_SECTION_CLASS}__countdown`)?.setAttribute('aria-label', 'Kampanya süresi doldu');
                return;
            }
            section.querySelector(`.${FLASH_PRODUCTS_SECTION_CLASS}__countdown`)?.setAttribute('aria-label', 'Kampanya bitiş sayacı');
            const totalSec = Math.floor(remaining / 1000);
            const s = totalSec % 60;
            const m = Math.floor(totalSec / 60) % 60;
            const h = Math.floor(totalSec / 3600);
            elH.textContent = pad2(h);
            elM.textContent = pad2(m);
            elS.textContent = pad2(s);
        };
        intervalId = setInterval(tick, 1000);
        section.__yuddyFpCountdownInterval = intervalId;
        tick();
    }

    const SECTION_ID = 'yuddy-flash-products-section';
    function isDemoOrLocal() {
        if (typeof window === 'undefined')
            return false;
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.');
        const forceDemo = window.YUDDY_FLASH_PRODUCTS_DEMO === true;
        return isLocal || forceDemo;
    }
    class FlashProducts {
        constructor(config = {}) {
            this.isInitialized = false;
            const baseUrl = config.apiBaseUrl || "https://testapi.yuddy.com/api/v1";
            this.apiClient = new APIClient(baseUrl);
            this.platform = config.platform;
            this.init();
        }
        isHomepage() {
            return isFlashProductsHomepagePath();
        }
        async init() {
            if (this.isInitialized)
                return;
            if (!this.isHomepage()) {
                this.destroy();
                return;
            }
            // TEST: sabit mağaza — bitince getFlashProduct() veya kaynak rebuild
            let data = await this.apiClient.getFlashProduct('yuddy.store');
            if ((!data || !data.isActive) && isDemoOrLocal()) {
                data = getDefaultDemoData();
                if (typeof console !== 'undefined' && console.log) {
                    console.log('⚡ [Flash Products] Demo modu: API verisi yok, varsayılan demo verisi kullanılıyor.');
                }
            }
            if (!data || !data.isActive)
                return;
            const settings = data.flashProductGeneralSettings || {};
            const rawProducts = settings.applicableProducts || [];
            const products = rawProducts.filter((p) => p.status !== false);
            if (products.length === 0)
                return;
            const renderData = {
                ...data,
                flashProductGeneralSettings: {
                    ...settings,
                    applicableProducts: products,
                },
            };
            const position = settings.flashBlockPositionRange ?? 1;
            const html = buildSectionHTML(renderData);
            injectSection(html, position, this.platform);
            const section = document.getElementById(SECTION_ID);
            attachListArrowListeners(section);
            attachCountdown(section);
            this.isInitialized = true;
        }
        /** Remove the section from DOM */
        destroy() {
            removeSection();
            this.isInitialized = false;
        }
        /** Refresh data and re-render (e.g. after SPA navigation) */
        async refresh() {
            this.destroy();
            await this.init();
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

    var css_248z = "/* ==========================================================================\n   Flash Products – E-ticaret uyumlu bölüm (renkler kullanıcı ayarından)\n   ========================================================================== */\n\n.yuddy-flash-products {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 20px 100px;\n  border-radius: 12px;\n}\n\n.yuddy-flash-products__header {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  margin-bottom: 20px;\n  padding: 0 4px;\n}\n\n.yuddy-flash-products__header-left {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n}\n\n.yuddy-flash-products__title-icon {\n  font-size: 1.5rem;\n  line-height: 1;\n  flex-shrink: 0;\n}\n\n.yuddy-flash-products__title {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n  line-height: 1.25;\n}\n\n/* Geri sayım – title'ın 20px sağında, saat/dk/sn ayrı kartlar */\n.yuddy-flash-products__countdown {\n  flex-shrink: 0;\n  margin-left: 20px;\n  display: flex;\n  align-items: stretch;\n  gap: 6px;\n}\n\n.yuddy-flash-products__countdown-card {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-width: 44px;\n  padding: 8px 10px 6px;\n  background: rgba(255, 255, 255, 0.45);\n  border-radius: 10px;\n  box-shadow:\n    inset 0 2px 6px rgba(0, 0, 0, 0.08),\n    0 1px 2px rgba(0, 0, 0, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.6);\n}\n\n.yuddy-flash-products__countdown-card-value {\n  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;\n  font-size: 1.125rem;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n  color: currentColor;\n  line-height: 1.2;\n}\n\n.yuddy-flash-products__countdown-card-label {\n  font-size: 0.625rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n  color: currentColor;\n  opacity: 0.7;\n  margin-top: 4px;\n}\n\n/* Liste sarmalayıcı – oklar burada konumlanır */\n.yuddy-flash-products__list-wrapper {\n  position: relative;\n  margin: 0 -4px;\n}\n\n/* Liste: scrollbar gizli, yatay kaydırma oklarla */\n.yuddy-flash-products__list {\n  display: flex;\n  gap: 16px;\n  overflow-x: auto;\n  overflow-y: hidden;\n  padding: 4px 4px 8px;\n  margin: 0 -4px;\n  scroll-behavior: smooth;\n  -webkit-overflow-scrolling: touch;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n\n.yuddy-flash-products__list::-webkit-scrollbar {\n  display: none;\n}\n\n/* Sol / sağ ok butonları – sadece kaydırılabilir listede görünür */\n.yuddy-flash-products__arrow {\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  z-index: 2;\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  border: none;\n  background: #fff;\n  color: #333;\n  cursor: pointer;\n  display: none;\n  align-items: center;\n  justify-content: center;\n  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);\n  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;\n}\n\n.yuddy-flash-products--scrollable .yuddy-flash-products__arrow {\n  display: flex;\n}\n\n.yuddy-flash-products__arrow:hover:not(.yuddy-flash-products__arrow--disabled) {\n  background: #333;\n  color: #fff;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);\n}\n\n.yuddy-flash-products__arrow:active:not(.yuddy-flash-products__arrow--disabled) {\n  transform: translateY(-50%) scale(0.96);\n}\n\n.yuddy-flash-products__arrow--prev {\n  left: 8px;\n}\n\n.yuddy-flash-products__arrow--next {\n  right: 8px;\n}\n\n.yuddy-flash-products__arrow--disabled {\n  opacity: 0.35;\n  cursor: not-allowed;\n  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);\n}\n\n.yuddy-flash-products--scrollable .yuddy-flash-products__list {\n  scroll-padding: 0 16px;\n}\n\n/* Ürün kartı – e-ticaret standartları */\n.yuddy-flash-products__card {\n  flex: 0 0 auto;\n  width: 250px;\n  height: 400px;\n  border-radius: 12px;\n  overflow: hidden;\n  text-decoration: none;\n  display: block;\n  border: 1px solid rgba(0, 0, 0, 0.08);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);\n  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;\n}\n\n.yuddy-flash-products__card:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);\n  border-color: rgba(0, 0, 0, 0.12);\n}\n\n.yuddy-flash-products__card:active {\n  transform: translateY(-2px);\n}\n\n.yuddy-flash-products__card-image-wrap {\n  width: 100%;\n  height: 300px;\n  aspect-ratio: 1;\n  background: #f5f5f5;\n  overflow: hidden;\n  position: relative;\n}\n\n.yuddy-flash-products__card-image {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  display: block;\n  transition: transform 0.3s ease;\n}\n\n.yuddy-flash-products__card:hover .yuddy-flash-products__card-image {\n  transform: scale(1.03);\n}\n\n.yuddy-flash-products__card-image-placeholder {\n  width: 100%;\n  height: 100%;\n  background: linear-gradient(145deg, #ebebeb 0%, #f5f5f5 100%);\n}\n\n.yuddy-flash-products__card-body {\n  padding: 14px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  min-height: 72px;\n}\n\n.yuddy-flash-products__card-name {\n  font-size: 0.875rem;\n  font-weight: 600;\n  line-height: 1.35;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  letter-spacing: 0.01em;\n}\n\n.yuddy-flash-products__card-price {\n  font-size: 1.25rem;\n  font-weight: 800;\n  line-height: 1.1;\n  margin-top: -2px;\n}\n\n/* Mobil: kart genişliği, oklar ve sayaç */\n@media (max-width: 480px) {\n  .yuddy-flash-products {\n    padding: 20px 16px 24px;\n  }\n\n  .yuddy-flash-products__card {\n    width: 180px;\n    height: auto;\n  }\n\n  .yuddy-flash-products__title {\n    font-size: 1.125rem;\n  }\n\n  .yuddy-flash-products__countdown {\n    margin-left: 12px;\n    gap: 4px;\n  }\n\n  .yuddy-flash-products__countdown-card {\n    min-width: 38px;\n    padding: 6px 8px 4px;\n    border-radius: 8px;\n  }\n\n  .yuddy-flash-products__card-image-wrap {\n    height: auto;\n    aspect-ratio: 5 / 7;\n}\n\n  .yuddy-flash-products__countdown-card-value {\n    font-size: 0.9375rem;\n  }\n\n  .yuddy-flash-products__countdown-card-label {\n    font-size: 0.5625rem;\n    margin-top: 2px;\n  }\n\n  .yuddy-flash-products__list {\n    gap: 12px;\n  }\n\n  .yuddy-flash-products--scrollable .yuddy-flash-products__list {\n    padding-left: 15px;\n    padding-right: 44px;\n  }\n\n  .yuddy-flash-products__arrow {\n    width: 36px;\n    height: 36px;\n  }\n\n  .yuddy-flash-products__arrow--prev {\n    left: 4px;\n  }\n\n  .yuddy-flash-products__arrow--next {\n    right: 4px;\n  }\n\n  .yuddy-flash-products__arrow svg {\n    width: 16px;\n    height: 16px;\n  }\n}\n";
    styleInject(css_248z);

    if (typeof window !== 'undefined') {
        window.FlashProducts = FlashProducts;
        let instance = null;
        const isHomepage = () => isFlashProductsHomepagePath();
        const init = () => {
            if (!isHomepage()) {
                if (instance) {
                    instance.destroy();
                    instance = null;
                }
                return;
            }
            if (instance) {
                instance.destroy();
                instance = null;
            }
            instance = new FlashProducts();
        };
        const run = () => {
            const autoInit = window.YUDDY_FLASH_PRODUCTS_AUTO_INIT !== false;
            if (autoInit)
                init();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run);
        }
        else {
            run();
        }
        // SPA: re-run on URL change
        let lastPath = window.location.pathname;
        const checkUrl = () => {
            if (window.location.pathname !== lastPath) {
                lastPath = window.location.pathname;
                setTimeout(run, 200);
            }
        };
        const origPush = history.pushState;
        const origReplace = history.replaceState;
        history.pushState = function (...args) {
            origPush.apply(history, args);
            setTimeout(checkUrl, 0);
        };
        history.replaceState = function (...args) {
            origReplace.apply(history, args);
            setTimeout(checkUrl, 0);
        };
        window.addEventListener('popstate', () => setTimeout(checkUrl, 0));
    }

    exports.FlashProducts = FlashProducts;
    exports.IDEASOFT_ENTRY_ROW_PREFIX = IDEASOFT_ENTRY_ROW_PREFIX;
    exports.IDEASOFT_MAX_ENTRY_ROW_INDEX = IDEASOFT_MAX_ENTRY_ROW_INDEX;
    exports.collectIdeasoftEntryRowsSorted = collectIdeasoftEntryRowsSorted;
    exports.default = FlashProducts;
    exports.detectPlatform = detectPlatform;
    exports.findInsertionPoint = findInsertionPoint;
    exports.injectSection = injectSection;
    exports.removeSection = removeSection;
    exports.resolveIdeasoftEntryRow = resolveIdeasoftEntryRow;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});

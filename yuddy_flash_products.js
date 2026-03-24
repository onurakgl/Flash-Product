/*!
 * Flash Products Widget v1.0.0
 * Build Date: 24.03.2026 19:05:44
 * (c) 2026 Yuddy
 */
var FlashProducts = (function (exports) {
    'use strict';

    globalThis.__BUILD_ENV__ = 'production';

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
                        imageUrl: 'https://picsum.photos/seed/fp1/400/400',
                        slug: 'demo-urun-1',
                    },
                    {
                        id: 'demo-2',
                        name: 'Demo Ürün 2',
                        imageUrl: 'https://picsum.photos/seed/fp2/400/400',
                        slug: 'demo-urun-2',
                    },
                    {
                        id: 'demo-3',
                        name: 'Demo Ürün 3',
                        imageUrl: 'https://picsum.photos/seed/fp3/400/400',
                        slug: 'demo-urun-3',
                    },
                    {
                        id: 'demo-4',
                        name: 'Demo Ürün 4',
                        imageUrl: 'https://picsum.photos/seed/fp4/400/400',
                        slug: 'demo-urun-4',
                    },
                    {
                        id: 'demo-5',
                        name: 'Demo Ürün 5',
                        imageUrl: 'https://picsum.photos/seed/fp5/400/400',
                        slug: 'demo-urun-5',
                    },
                ],
            },
        };
    }

    const SECTION_ID$1 = 'yuddy-flash-products-section';
    const SECTION_CLASS = 'yuddy-flash-products';
    function escapeHtml(s) {
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }
    function productLink(slug) {
        const path = slug.startsWith('/') ? slug : `/${slug}`;
        return path;
    }
    /** Build product card HTML for one item */
    function buildProductCard(item, settings) {
        const nameColor = settings.productNameColor || '#1a1a1a';
        const priceColor = settings.productPriceColor || '#e65100';
        const cardBg = settings.productCardBackgroundColor || '#ffffff';
        const href = productLink(item.slug || '');
        const name = escapeHtml(item.name || '');
        const imgUrl = item.imageUrl || '';
        return `
    <a href="${escapeHtml(href)}" class="${SECTION_CLASS}__card" style="background-color:${escapeHtml(cardBg)};">
      <div class="${SECTION_CLASS}__card-image-wrap">
        ${imgUrl ? `<img class="${SECTION_CLASS}__card-image" src="${escapeHtml(imgUrl)}" alt="${name}" loading="lazy" />` : `<div class="${SECTION_CLASS}__card-image-placeholder"></div>`}
      </div>
      <div class="${SECTION_CLASS}__card-body">
        <span class="${SECTION_CLASS}__card-name" style="color:${escapeHtml(nameColor)}">${name}</span>
        <span class="${SECTION_CLASS}__card-cta" style="color:${escapeHtml(priceColor)}">İncele</span>
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
        const cardsHtml = products
            .slice(0, 20)
            .map((item) => buildProductCard(item, settings))
            .join('');
        const iconHtml = !titleIcon.includes(':')
            ? `<span class="${SECTION_CLASS}__title-icon" style="color:${escapeHtml(titleColor)}">${escapeHtml(titleIcon)}</span>`
            : '';
        const hasScroll = products.length > 4;
        const sectionModifier = hasScroll ? ` ${SECTION_CLASS}--scrollable` : '';
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
    <section id="${SECTION_ID$1}" class="${SECTION_CLASS}${sectionModifier}" style="background-color:${escapeHtml(bg)};" data-counter-hours="${counterHours}" data-update-date="${escapeHtml(updateDateIso)}">
      <div class="${SECTION_CLASS}__header" style="justify-content:${titlePosition};">
        <div class="${SECTION_CLASS}__header-left">
          ${iconHtml}
          <h2 class="${SECTION_CLASS}__title" style="color:${escapeHtml(titleColor)}">${escapeHtml(title)}</h2>
        </div>
        <div class="${SECTION_CLASS}__countdown" style="color:${escapeHtml(titleColor)}" aria-live="polite" aria-label="Kampanya bitiş sayacı">
          <div class="${SECTION_CLASS}__countdown-card" aria-hidden="true">
            <span class="${SECTION_CLASS}__countdown-card-value" data-unit="h">--</span>
            <span class="${SECTION_CLASS}__countdown-card-label">Saat</span>
          </div>
          <div class="${SECTION_CLASS}__countdown-card" aria-hidden="true">
            <span class="${SECTION_CLASS}__countdown-card-value" data-unit="m">--</span>
            <span class="${SECTION_CLASS}__countdown-card-label">Dk</span>
          </div>
          <div class="${SECTION_CLASS}__countdown-card" aria-hidden="true">
            <span class="${SECTION_CLASS}__countdown-card-value" data-unit="s">--</span>
            <span class="${SECTION_CLASS}__countdown-card-label">Sn</span>
          </div>
        </div>
      </div>
      <div class="${SECTION_CLASS}__list-wrapper">
        <button type="button" class="${SECTION_CLASS}__arrow ${SECTION_CLASS}__arrow--prev" aria-label="Önceki ürünler">${arrowSvg('left')}</button>
        <div class="${SECTION_CLASS}__list" role="list" aria-label="${escapeHtml(title)} ürün listesi">
          ${cardsHtml}
        </div>
        <button type="button" class="${SECTION_CLASS}__arrow ${SECTION_CLASS}__arrow--next" aria-label="Sonraki ürünler">${arrowSvg('right')}</button>
      </div>
    </section>
  `;
    }
    const LIST_SCROLL_AMOUNT = 200;
    /** Ok butonlarına tıklanınca listeyi kaydır (enjekte edildikten sonra çağrılır) */
    function attachListArrowListeners(section) {
        if (!section)
            return;
        const list = section.querySelector(`.${SECTION_CLASS}__list`);
        const prevBtn = section.querySelector(`.${SECTION_CLASS}__arrow--prev`);
        const nextBtn = section.querySelector(`.${SECTION_CLASS}__arrow--next`);
        if (!list || !prevBtn || !nextBtn)
            return;
        const updateArrows = () => {
            const { scrollLeft, scrollWidth, clientWidth } = list;
            prevBtn.classList.toggle(`${SECTION_CLASS}__arrow--disabled`, scrollLeft <= 0);
            nextBtn.classList.toggle(`${SECTION_CLASS}__arrow--disabled`, scrollLeft >= scrollWidth - clientWidth - 2);
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
        const elH = section.querySelector(`.${SECTION_CLASS}__countdown-card-value[data-unit="h"]`);
        const elM = section.querySelector(`.${SECTION_CLASS}__countdown-card-value[data-unit="m"]`);
        const elS = section.querySelector(`.${SECTION_CLASS}__countdown-card-value[data-unit="s"]`);
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
                section.querySelector(`.${SECTION_CLASS}__countdown`)?.setAttribute('aria-label', 'Kampanya süresi doldu');
                return;
            }
            section.querySelector(`.${SECTION_CLASS}__countdown`)?.setAttribute('aria-label', 'Kampanya bitiş sayacı');
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
    /**
     * Sayfa alanları id="0", id="1", id="2", ... ile tanımlı.
     * flashBlockPositionRange: 0 = alan 0'dan önce, 1 = alan 0'dan sonra, 2 = alan 1'den sonra, ...
     * Önce bu id'lere göre yer bulunur; yoksa main içindeki çocuk sırasına göre fallback.
     */
    function findInsertionPoint(flashBlockPositionRange) {
        const range = Math.max(0, Math.min(9, flashBlockPositionRange));
        // 1) Id ile eşleştirme: id="0", id="1", id="2", ... (sayfa alanları)
        if (range === 0) {
            const anchor = document.getElementById('0');
            if (anchor && anchor.parentElement) {
                return { parent: anchor.parentElement, index: 0, insertBefore: anchor };
            }
        }
        else {
            const anchorId = String(range - 1);
            const anchor = document.getElementById(anchorId);
            if (anchor && anchor.parentElement) {
                return { parent: anchor.parentElement, index: range, insertAfter: anchor };
            }
        }
        // 2) Fallback: main (veya benzeri) içindeki çocuk sırasına göre
        const mainSelectors = [
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
        ];
        for (const sel of mainSelectors) {
            const main = document.querySelector(sel);
            if (!main)
                continue;
            const children = Array.from(main.children).filter((el) => {
                const tag = el.tagName.toLowerCase();
                const role = el.getAttribute('role');
                const id = (el.id || '').toLowerCase();
                if (tag === 'header' || tag === 'footer' || role === 'banner' || id.includes('header') || id.includes('footer'))
                    return false;
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
        const firstMain = body.querySelector('main, #main, .main, [role="main"]') || body;
        return { parent: firstMain, index: 0 };
    }
    /** Insert section into DOM */
    function injectSection(html, flashBlockPositionRange) {
        removeSection();
        const point = findInsertionPoint(flashBlockPositionRange);
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
        const el = document.getElementById(SECTION_ID$1);
        if (!el)
            return;
        const intervalId = el.__yuddyFpCountdownInterval;
        if (intervalId)
            clearInterval(intervalId);
        el.remove();
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
            this.init();
        }
        async init() {
            if (this.isInitialized)
                return;
            let data = await this.apiClient.getFlashProduct();
            if ((!data || !data.isActive) && isDemoOrLocal()) {
                data = getDefaultDemoData();
                if (typeof console !== 'undefined' && console.log) {
                    console.log('⚡ [Flash Products] Demo modu: API verisi yok, varsayılan demo verisi kullanılıyor.');
                }
            }
            if (!data || !data.isActive)
                return;
            const settings = data.flashProductGeneralSettings;
            const products = settings?.applicableProducts || [];
            if (products.length === 0)
                return;
            const position = settings?.flashBlockPositionRange ?? 1;
            const html = buildSectionHTML(data);
            injectSection(html, position);
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

    var css_248z = "/* ==========================================================================\n   Flash Products – E-ticaret uyumlu bölüm (renkler kullanıcı ayarından)\n   ========================================================================== */\n\n.yuddy-flash-products {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 5px 100px;\n  border-radius: 12px;\n}\n\n.yuddy-flash-products__header {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  margin-bottom: 20px;\n  padding: 0 4px;\n}\n\n.yuddy-flash-products__header-left {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n}\n\n.yuddy-flash-products__title-icon {\n  font-size: 1.5rem;\n  line-height: 1;\n  flex-shrink: 0;\n}\n\n.yuddy-flash-products__title {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n  line-height: 1.25;\n}\n\n/* Geri sayım – title'ın 20px sağında, saat/dk/sn ayrı kartlar */\n.yuddy-flash-products__countdown {\n  flex-shrink: 0;\n  margin-left: 20px;\n  display: flex;\n  align-items: stretch;\n  gap: 6px;\n}\n\n.yuddy-flash-products__countdown-card {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-width: 44px;\n  padding: 8px 10px 6px;\n  background: rgba(255, 255, 255, 0.45);\n  border-radius: 10px;\n  box-shadow:\n    inset 0 2px 6px rgba(0, 0, 0, 0.08),\n    0 1px 2px rgba(0, 0, 0, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.6);\n}\n\n.yuddy-flash-products__countdown-card-value {\n  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;\n  font-size: 1.125rem;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n  color: currentColor;\n  line-height: 1.2;\n}\n\n.yuddy-flash-products__countdown-card-label {\n  font-size: 0.625rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n  color: currentColor;\n  opacity: 0.7;\n  margin-top: 4px;\n}\n\n/* Liste sarmalayıcı – oklar burada konumlanır */\n.yuddy-flash-products__list-wrapper {\n  position: relative;\n  margin: 0 -4px;\n}\n\n/* Liste: scrollbar gizli, yatay kaydırma oklarla */\n.yuddy-flash-products__list {\n  display: flex;\n  gap: 16px;\n  overflow-x: auto;\n  overflow-y: hidden;\n  padding: 4px 4px 8px;\n  margin: 0 -4px;\n  scroll-behavior: smooth;\n  -webkit-overflow-scrolling: touch;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n\n.yuddy-flash-products__list::-webkit-scrollbar {\n  display: none;\n}\n\n/* Sol / sağ ok butonları – sadece kaydırılabilir listede görünür */\n.yuddy-flash-products__arrow {\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  z-index: 2;\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  border: none;\n  background: #fff;\n  color: #333;\n  cursor: pointer;\n  display: none;\n  align-items: center;\n  justify-content: center;\n  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);\n  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;\n}\n\n.yuddy-flash-products--scrollable .yuddy-flash-products__arrow {\n  display: flex;\n}\n\n.yuddy-flash-products__arrow:hover:not(.yuddy-flash-products__arrow--disabled) {\n  background: #333;\n  color: #fff;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);\n}\n\n.yuddy-flash-products__arrow:active:not(.yuddy-flash-products__arrow--disabled) {\n  transform: translateY(-50%) scale(0.96);\n}\n\n.yuddy-flash-products__arrow--prev {\n  left: 8px;\n}\n\n.yuddy-flash-products__arrow--next {\n  right: 8px;\n}\n\n.yuddy-flash-products__arrow--disabled {\n  opacity: 0.35;\n  cursor: not-allowed;\n  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);\n}\n\n.yuddy-flash-products--scrollable .yuddy-flash-products__list {\n  scroll-padding: 0 16px;\n}\n\n/* Ürün kartı – e-ticaret standartları */\n.yuddy-flash-products__card {\n  flex: 0 0 auto;\n  width: 250px;\n  max-width: calc(50vw - 32px);\n  border-radius: 12px;\n  overflow: hidden;\n  text-decoration: none;\n  display: block;\n  border: 1px solid rgba(0, 0, 0, 0.08);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);\n  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;\n}\n\n.yuddy-flash-products__card:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);\n  border-color: rgba(0, 0, 0, 0.12);\n}\n\n.yuddy-flash-products__card:active {\n  transform: translateY(-2px);\n}\n\n.yuddy-flash-products__card-image-wrap {\n  width: 100%;\n  aspect-ratio: 1;\n  background: #f5f5f5;\n  overflow: hidden;\n  position: relative;\n}\n\n.yuddy-flash-products__card-image {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  display: block;\n  transition: transform 0.3s ease;\n}\n\n.yuddy-flash-products__card:hover .yuddy-flash-products__card-image {\n  transform: scale(1.03);\n}\n\n.yuddy-flash-products__card-image-placeholder {\n  width: 100%;\n  height: 100%;\n  background: linear-gradient(145deg, #ebebeb 0%, #f5f5f5 100%);\n}\n\n.yuddy-flash-products__card-body {\n  padding: 14px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  min-height: 72px;\n}\n\n.yuddy-flash-products__card-name {\n  font-size: 0.875rem;\n  font-weight: 600;\n  line-height: 1.35;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  letter-spacing: 0.01em;\n}\n\n.yuddy-flash-products__card-cta {\n  font-size: 0.8125rem;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n  margin-top: auto;\n}\n\n/* Mobil: kart genişliği, oklar ve sayaç */\n@media (max-width: 480px) {\n  .yuddy-flash-products {\n    padding: 20px 16px 24px;\n  }\n\n  .yuddy-flash-products__card {\n    width: 140px;\n  }\n\n  .yuddy-flash-products__title {\n    font-size: 1.125rem;\n  }\n\n  .yuddy-flash-products__countdown {\n    margin-left: 12px;\n    gap: 4px;\n  }\n\n  .yuddy-flash-products__countdown-card {\n    min-width: 38px;\n    padding: 6px 8px 4px;\n    border-radius: 8px;\n  }\n\n  .yuddy-flash-products__countdown-card-value {\n    font-size: 0.9375rem;\n  }\n\n  .yuddy-flash-products__countdown-card-label {\n    font-size: 0.5625rem;\n    margin-top: 2px;\n  }\n\n  .yuddy-flash-products__list {\n    gap: 12px;\n  }\n\n  .yuddy-flash-products--scrollable .yuddy-flash-products__list {\n    padding-left: 44px;\n    padding-right: 44px;\n  }\n\n  .yuddy-flash-products__arrow {\n    width: 36px;\n    height: 36px;\n  }\n\n  .yuddy-flash-products__arrow--prev {\n    left: 4px;\n  }\n\n  .yuddy-flash-products__arrow--next {\n    right: 4px;\n  }\n\n  .yuddy-flash-products__arrow svg {\n    width: 16px;\n    height: 16px;\n  }\n}\n";
    styleInject(css_248z);

    if (typeof window !== 'undefined') {
        window.FlashProducts = FlashProducts;
        let instance = null;
        const isHomepage = () => {
            if (window.YUDDY_FLASH_PRODUCTS_DEMO === true)
                return true;
            const path = window.location.pathname.replace(/\/$/, '') || '/';
            const homePaths = ['', '/', '/home', '/index', '/anasayfa'];
            const pathLower = path.toLowerCase();
            if (pathLower.startsWith('/demo'))
                return true;
            return homePaths.includes(pathLower);
        };
        const init = () => {
            if (!isHomepage())
                return;
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
    exports.default = FlashProducts;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});

/*!
 * Fortune Wheel Widget v1.0.0
 * Build Date: 20.02.2026 15:33:49
 * (c) 2026 Yuddy
 */
console.log("Selamlama")
var GlobalWheel = (function (exports) {
    'use strict';

    globalThis.__BUILD_WHEEL_ENV__ = 'production';

    // Custom error classes for the Fortune Wheel Widget
    let WheelError$1 = class WheelError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
            this.name = 'WheelError';
        }
    };

    // Error types
    class WheelError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
            this.name = 'WheelError';
        }
    }
    class ValidationError extends WheelError {
        constructor(message, field) {
            super(message, 'VALIDATION_ERROR');
            this.field = field;
            this.name = 'ValidationError';
        }
    }
    class APIError extends WheelError {
        constructor(message, status) {
            super(message, 'API_ERROR');
            this.status = status;
            this.name = 'APIError';
        }
    }

    class APIClient {
        constructor(baseUrl) {
            // âœ… CACHE AYARLARI
            this.CACHE_KEY = 'yuddy_wheel_config_v1';
            this.CACHE_TTL = 60 * 60 * 1000; // 1 Saat (Milisaniye cinsinden)
            this.baseUrl = baseUrl.replace(/\/$/, '');
        }
        /**
         * Get wheel configuration data for a domain (with 1-hour Caching)
         */
        async getWheelData(hostname) {
            const cleanHostname = 'aychayla.com';
            try {
                // ---------------------------------------------------------
                // 1. ADIM: CACHE KONTROLÃœ
                // ---------------------------------------------------------
                try {
                    const cachedRecord = localStorage.getItem(this.CACHE_KEY);
                    if (cachedRecord) {
                        const parsedRecord = JSON.parse(cachedRecord);
                        // Kontroller:
                        // 1. Hostname aynÄ± mÄ±? (BaÅŸka sitenin verisi gelmesin)
                        // 2. SÃ¼resi doldu mu? (Åu anki zaman - KayÄ±t zamanÄ± < 1 saat)
                        const isSameHost = parsedRecord.hostname === cleanHostname;
                        const isFresh = (Date.now() - parsedRecord.timestamp) < this.CACHE_TTL;
                        if (isSameHost && isFresh) {
                            // console.log('âš¡ [Yuddy] Config cache\'den yÃ¼klendi.');
                            return parsedRecord.data;
                        }
                    }
                }
                catch (storageError) {
                    // LocalStorage kapalÄ±ysa veya hata verirse akÄ±ÅŸÄ± bozma, API'ye devam et
                    console.warn('[Yuddy] Cache okuma hatasÄ±, API\'ye gidiliyor.', storageError);
                }
                // ---------------------------------------------------------
                // 2. ADIM: API Ä°STEÄÄ° (Cache yoksa veya eskiyse)
                // ---------------------------------------------------------
                const url = `${this.baseUrl}?storeName=${cleanHostname}`;
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
                    throw new APIError(`Ã‡ark verileri alÄ±namadÄ±: ${response.status}`, response.status);
                }
                const data = await response.json();
                // ---------------------------------------------------------
                // 3. ADIM: CACHE GÃœNCELLEME
                // ---------------------------------------------------------
                if (data) {
                    try {
                        const cachePayload = {
                            hostname: cleanHostname,
                            timestamp: Date.now(),
                            data: data
                        };
                        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cachePayload));
                        // console.log('ğŸ’¾ [Yuddy] Config cache\'e kaydedildi (1 saat geÃ§erli).');
                    }
                    catch (storageError) {
                        console.warn('[Yuddy] Cache yazma hatasÄ± (Kota dolu olabilir).', storageError);
                    }
                }
                return data;
            }
            catch (error) {
                if (error instanceof APIError) {
                    throw error;
                }
                throw new APIError(`BaÄŸlantÄ± hatasÄ±. LÃ¼tfen tekrar deneyin: ${error.message}`);
            }
        }
        /**
         * Submit user data and spin the wheel
         */
        async spin(userData) {
            try {
                const response = await fetch(`${this.baseUrl}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                });
                // 1. Durum koduna gÃ¶re JSON olmayan hatalarÄ± Ã¶nceden yakalayalÄ±m
                if (response.status === 429) {
                    throw new APIError('Ã‡ok fazla deneme yaptÄ±nÄ±z. LÃ¼tfen daha sonra tekrar deneyin.', 429);
                }
                if (response.status === 500) {
                    throw new APIError('Sunucu hatasÄ± oluÅŸtu. LÃ¼tfen tekrar deneyin.', 500);
                }
                // 2. YanÄ±t baÅŸarÄ±lÄ± deÄŸilse iÃ§eriÄŸi kontrol edelim
                if (!response.ok) {
                    let errorMessage = 'Ä°stek baÅŸarÄ±sÄ±z oldu. LÃ¼tfen tekrar deneyin.';
                    try {
                        const result = await response.json();
                        errorMessage = result.message || errorMessage;
                    }
                    catch (_a) {
                        // JSON parse edilemezse varsayÄ±lan mesajÄ± kullan
                    }
                    throw new APIError(errorMessage, response.status);
                }
                // 3. BaÅŸarÄ±lÄ± yanÄ±t durumunda JSON'u parse et
                const result = await response.json();
                // Uygulama seviyesindeki hatalar
                if (result.status === 400) {
                    throw new APIError(result.message || 'HatalÄ± istek. LÃ¼tfen tekrar deneyin.', 400);
                }
                result.createdAt = new Date().toISOString();
                return result;
            }
            catch (error) {
                if (error instanceof APIError) {
                    throw error;
                }
                // JSON syntax hatasÄ± veya aÄŸ hatasÄ± durumunda kullanÄ±cÄ±ya dÃ¼zgÃ¼n mesaj verelim
                throw new APIError(`BaÄŸlantÄ± hatasÄ±. LÃ¼tfen tekrar deneyin. (${error.message})`);
            }
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
            catch (_a) {
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
    }

    class Validator {
        constructor() {
            this.validationRules = {};
        }
        /**
         * Set validation rules based on field visibility from wheel data
         */
        setValidationRules(phoneNumberVisibility, emailVisibility, nameVisibility) {
            this.validationRules = {
                name: nameVisibility
                    ? {
                        required: true,
                        minLength: 2,
                        maxLength: 50,
                        pattern: /^[a-zA-ZÃ§Ã‡ÄŸÄÄ±Ä°Ã¶Ã–ÅŸÅÃ¼Ãœ\s]*$/,
                    }
                    : undefined,
                phone: phoneNumberVisibility
                    ? {
                        required: true,
                        pattern: /^5\d{9}$/,
                    }
                    : undefined,
                email: emailVisibility
                    ? {
                        required: true,
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        maxLength: 254,
                    }
                    : undefined,
            };
        }
        /**
         * Get current validation rules
         */
        getValidationRules() {
            return { ...this.validationRules };
        }
        /**
         * Check if a specific field is required
         */
        isFieldRequired(field) {
            var _a;
            return ((_a = this.validationRules[field]) === null || _a === void 0 ? void 0 : _a.required) === true;
        }
        /**
         * Validate user submission data
         */
        validateUserData(userData) {
            var _a, _b, _c, _d, _e;
            const errors = [];
            // Validate name if provided and required
            if (userData.fullName !== undefined && this.validationRules.name) {
                const nameErrors = this.validateField(userData.fullName, this.validationRules.name, 'Full name');
                errors.push(...nameErrors);
                // Additional name validation: check for first and last name
                if (userData.fullName && userData.fullName.trim()) {
                    const nameParts = userData.fullName
                        .trim()
                        .split(/\s+/)
                        .filter(part => part.length > 0);
                    if (nameParts.length < 2) {
                        errors.push('LÃ¼tfen ad ve soyadÄ±nÄ±zÄ± giriniz');
                    }
                }
            }
            // Validate phone if provided and required
            if (userData.mobilePhone && this.validationRules.phone) {
                // Remove country code if present
                const cleanPhone = userData.mobilePhone
                    .replace(/^\+?90/, '')
                    .replace(/\s/g, '');
                const phoneErrors = this.validateField(cleanPhone, this.validationRules.phone, 'Phone number');
                errors.push(...phoneErrors);
            }
            // Validate email if provided and required
            if (userData.email && this.validationRules.email) {
                const emailErrors = this.validateField(userData.email, this.validationRules.email, 'Email');
                errors.push(...emailErrors);
            }
            // Check if required fields are provided
            if (((_a = this.validationRules.phone) === null || _a === void 0 ? void 0 : _a.required) && !userData.mobilePhone) {
                errors.push('Telefon numarasÄ± gereklidir');
            }
            if (((_b = this.validationRules.email) === null || _b === void 0 ? void 0 : _b.required) && !userData.email) {
                errors.push('E-posta adresi gereklidir');
            }
            if (((_c = this.validationRules.name) === null || _c === void 0 ? void 0 : _c.required) && !userData.fullName) {
                errors.push('Ad soyad gereklidir');
            }
            // Ensure at least phone or email is provided if both are visible
            const phoneRequired = (_d = this.validationRules.phone) === null || _d === void 0 ? void 0 : _d.required;
            const emailRequired = (_e = this.validationRules.email) === null || _e === void 0 ? void 0 : _e.required;
            if ((phoneRequired || emailRequired) &&
                !userData.mobilePhone &&
                !userData.email) {
                errors.push('Telefon numarasÄ± veya e-posta adresinden en az biri gereklidir');
            }
            // Validate store name
            if (!userData.storeName || !userData.storeName.trim()) {
                errors.push('MaÄŸaza adÄ± gereklidir');
            }
            if (!userData.etk) {
                errors.push('LÃ¼tfen ticari elektronik ileti iznini onaylayÄ±n.');
            }
            if (!userData.kvkk) {
                errors.push('LÃ¼tfen KVKK metnini onaylayÄ±n.');
            }
            return {
                isValid: errors.length === 0,
                errors,
            };
        }
        /**
         * Validate a single field against rules
         */
        validateField(value, rules, fieldName = 'Field') {
            const errors = [];
            if (!rules)
                return errors;
            // Required validation
            if (rules.required && (!value || !value.trim())) {
                errors.push(`${this.getFieldNameInTurkish(fieldName)} gereklidir`);
                return errors;
            }
            if (!value || !value.trim()) {
                return errors; // If not required and empty, skip other validations
            }
            // Min length validation
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${this.getFieldNameInTurkish(fieldName)} en az ${rules.minLength} karakter olmalÄ±dÄ±r`);
            }
            // Max length validation
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${this.getFieldNameInTurkish(fieldName)} en fazla ${rules.maxLength} karakter olmalÄ±dÄ±r`);
            }
            // Pattern validation
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${this.getFieldNameInTurkish(fieldName)} geÃ§ersiz formatta`);
            }
            // Custom validation
            if (rules.custom) {
                const customResult = rules.custom(value);
                if (typeof customResult === 'string') {
                    errors.push(customResult);
                }
                else if (!customResult) {
                    errors.push(`${this.getFieldNameInTurkish(fieldName)} geÃ§ersiz`);
                }
            }
            return errors;
        }
        /**
         * Helper method to get field names in Turkish
         */
        getFieldNameInTurkish(fieldName) {
            const translations = {
                'Full name': 'Ad soyad',
                'Phone number': 'Telefon numarasÄ±',
                Email: 'E-posta',
                Field: 'Alan',
            };
            return translations[fieldName] || fieldName;
        }
        /**
         * Validate phone number with detailed messages
         */
        validatePhone(phone) {
            const errors = [];
            if (!phone || !phone.trim()) {
                errors.push('Telefon numarasÄ± gereklidir');
                return { isValid: false, errors };
            }
            // Remove spaces and check for non-numeric characters
            const cleanPhone = phone.replace(/\s/g, '');
            if (/[^0-9]/.test(cleanPhone)) {
                errors.push('Telefon numarasÄ± sadece rakam iÃ§ermelidir');
            }
            // Check if it starts with 5
            if (cleanPhone.length > 0 && !cleanPhone.startsWith('5')) {
                errors.push('Telefon numarasÄ± 5 ile baÅŸlamalÄ±dÄ±r (Ã¶rn: 535xxxxxxx)');
            }
            // Check length
            if (cleanPhone.length !== 10) {
                errors.push('Telefon numarasÄ± tam olarak 10 haneli olmalÄ±dÄ±r');
            }
            return {
                isValid: errors.length === 0,
                errors,
            };
        }
        /**
         * Validate email with detailed messages
         */
        validateEmail(email) {
            const errors = [];
            if (!email || !email.trim()) {
                errors.push('E-posta adresi gereklidir');
                return { isValid: false, errors };
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push('LÃ¼tfen geÃ§erli bir e-posta adresi giriniz');
            }
            if (email.length > 254) {
                errors.push('E-posta adresi Ã§ok uzun');
            }
            return {
                isValid: errors.length === 0,
                errors,
            };
        }
        /**
         * Format phone number for display
         */
        formatPhone(phone) {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 10 && cleaned.startsWith('5')) {
                return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
            }
            return phone;
        }
        /**
         * Clean phone number for API submission
         */
        cleanPhone(phone) {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 10 && cleaned.startsWith('5')) {
                return `90${cleaned}`;
            }
            return cleaned;
        }
    }

    /**
     * Admin panelinden gelen Iconify ID'sine gÃ¶re gÃ¶mÃ¼lÃ¼ (embedded) SVG'yi dÃ¶ndÃ¼rÃ¼r.
     * Bu yÃ¶ntem, harici iconify.min.js script'ine olan baÄŸÄ±mlÄ±lÄ±ÄŸÄ± ortadan kaldÄ±rÄ±r.
     */
    function getReopenButtonSvg(svgId, color) {
        const svgs = {
            // ------------------------------------------------------------------
            // 1. VarsayÄ±lanlar
            // ------------------------------------------------------------------
            /** Ä°kon Yok */
            ['-1']: '',
            /** Hediye Paketi */
            ['solar:gift-bold']: `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="M11.25 2c-4.219.004-6.401.08-7.786 1.464C2.08 4.85 2.004 7.031 2 11.25h4.914a4 4 0 0 1-.757-1.528C5.62 7.57 7.57 5.62 9.722 6.157c.572.143 1.09.406 1.528.757zM2 12.75c.004 4.218.08 6.4 1.464 7.785C4.85 21.92 7.031 21.995 11.25 22v-7.877A4.75 4.75 0 0 1 7 16.75a.75.75 0 0 1 0-1.5a3.25 3.25 0 0 0 3.163-2.5zM12.75 22c4.218-.005 6.4-.08 7.785-1.465c1.385-1.384 1.46-3.567 1.465-7.785h-8.163A3.25 3.25 0 0 0 17 15.25a.75.75 0 0 1 0 1.5a4.75 4.75 0 0 1-4.25-2.627zM22 11.25c-.005-4.219-.08-6.401-1.465-7.786C19.151 2.08 16.968 2.004 12.75 2v4.914a4 4 0 0 1 1.527-.757c2.153-.538 4.104 1.412 3.565 3.565a4 4 0 0 1-.756 1.528z"/><path fill="${color}" d="M9.358 7.613a2.5 2.5 0 0 1 1.892 2.422v1.215h-1.215a2.5 2.5 0 0 1-2.422-1.892a1.44 1.44 0 0 1 1.745-1.745m3.392 2.422v1.215h1.215c1.145 0 2.144-.78 2.422-1.892a1.44 1.44 0 0 0-1.746-1.745a2.5 2.5 0 0 0-1.891 2.422"/></svg>`,
            /** YÄ±ldÄ±z */
            ['solar:star-bold']: `<svg xmlns="http://www.w3.org/2000/svg"  width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="M9.153 5.408C10.42 3.136 11.053 2 12 2s1.58 1.136 2.847 3.408l.328.588c.36.646.54.969.82 1.182s.63.292 1.33.45l.636.144c2.46.557 3.689.835 3.982 1.776c.292.94-.546 1.921-2.223 3.882l-.434.507c-.476.557-.715.836-.822 1.18c-.107.345-.071.717.001 1.46l.066.677c.253 2.617.38 3.925-.386 4.506s-1.918.051-4.22-1.009l-.597-.274c-.654-.302-.981-.452-1.328-.452s-.674.15-1.328.452l-.596.274c-2.303 1.06-3.455 1.59-4.22 1.01c-.767-.582-.64-1.89-.387-4.507l.066-.676c.072-.744.108-1.116 0-1.46c-.106-.345-.345-.624-.821-1.18l-.434-.508c-1.677-1.96-2.515-2.941-2.223-3.882S3.58 8.328 6.04 7.772l.636-.144c.699-.158 1.048-.237 1.329-.45s.46-.536.82-1.182z"/></svg>`,
            /** Konfeti */
            ['solar:confetti-bold']: `<svg xmlns="http://www.w3.org/2000/svg"  width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="M10.186 2.139a.75.75 0 0 1 .249 1.031a.65.65 0 0 0 .095.8l.098.097c.588.589.805 1.454.565 2.25a.75.75 0 0 1-1.436-.433a.76.76 0 0 0-.19-.756L9.47 5.03a2.15 2.15 0 0 1-.314-2.642a.75.75 0 0 1 1.031-.25m7.503 2.583a.75.75 0 0 1 .587.883l-.144.72c-.198.99-.912 1.8-1.87 2.119c-.448.15-.782.527-.874.99l-.144.72a.75.75 0 1 1-1.471-.294l.144-.72c.198-.991.912-1.8 1.87-2.12c.448-.148.782-.526.875-.99l.143-.72a.75.75 0 0 1 .883-.588m3.72 8.839a1.01 1.01 0 0 0-1.078.17a2.51 2.51 0 0 1-2.924.295l-.213-.122a.75.75 0 0 1 .75-1.3l.213.123c.378.218.852.17 1.179-.119a2.51 2.51 0 0 1 2.673-.422l.292.127a.75.75 0 0 1-.601 1.375zM6.928 3.94a.536.536 0 1 1 .758.76a.536.536 0 0 1-.758-.76m5.988 3.217a.536.536 0 1 0-.759.759a.536.536 0 0 0 .759-.76m4.241 3.001a.536.536 0 1 1 .759.758a.536.536 0 0 1-.759-.758m2.66 5.156a.536.536 0 1 0-.759.759a.536.536 0 0 0 .759-.759M7.472 20.241c-2.262.746-3.454 1.058-4.113.399c-.73-.73-.269-2.113.653-4.878l1.69-5.069c.632-1.896 1.003-3.01 1.622-3.462l-.005.026a26 26 0 0 0-.138.73a51 51 0 0 0-.31 1.939c-.216 1.533-.415 3.492-.312 5.057c.062.947.259 2.122.435 3.04a51 51 0 0 0 .312 1.503l.02.093zm5.567-1.855l.267-.089c2.298-.766 3.447-1.149 3.66-2.055c.215-.906-.642-1.763-2.355-3.476l-1.689-1.689l-.005.015l-.082.267c-.068.23-.16.55-.251.916c-.187.749-.357 1.622-.357 2.28s.17 1.531.357 2.28a21 21 0 0 0 .356 1.253l.005.017l.002.004zM8.8 7.504l.05-.245c.613.36 1.339 1.085 2.382 2.129l.503.502l-.212.64l-.01.028l-.025.08l-.09.291c-.073.246-.171.59-.27.983c-.192.769-.401 1.791-.401 2.643s.21 1.874.401 2.643a22 22 0 0 0 .385 1.354l.103.309l-2.715.905l-.107-.46l-.005-.022l-.02-.087l-.073-.33c-.06-.282-.143-.676-.23-1.126c-.173-.907-.355-2.006-.41-2.856c-.093-1.404.087-3.236.3-4.75a50 50 0 0 1 .434-2.582l.007-.037l.002-.01zm6.154-5.294c.151-.02.428-.03.647.19s.21.496.19.648a4 4 0 0 1-.114.479l-.036.126l.065.102c.087.139.181.288.239.42c.065.15.139.402 0 .666c-.137.26-.382.346-.537.381c-.142.032-.319.046-.487.06l-.127.01h-.011l-.092.112c-.11.133-.223.271-.33.37c-.114.103-.328.263-.625.223c-.307-.042-.467-.265-.544-.404a3.4 3.4 0 0 1-.188-.446l-.04-.11l-.11-.04a3.4 3.4 0 0 1-.445-.187c-.14-.078-.362-.237-.404-.544c-.04-.298.12-.511.223-.625c.098-.107.237-.22.37-.33l.112-.092v-.01l.01-.128c.013-.169.027-.346.06-.487c.035-.156.12-.4.38-.537c.265-.14.517-.065.666 0c.133.057.282.151.42.239l.103.064l.126-.035c.164-.047.335-.096.479-.115m7.186 8.282c.467-.467.64-1.096.384-1.65c-.195-.42-.587-.693-1.07-.796c-.102-.483-.376-.875-.796-1.07c-.554-.255-1.183-.083-1.65.385c-.27.27-.393.633-.45.957c-.06.33-.06.68-.041.986a7 7 0 0 0 .163 1.115c.045.18.192.35.372.394h.002l.027.007a5 5 0 0 0 .317.065c.205.036.489.079.798.098c.306.02.656.019.986-.04c.324-.057.687-.18.958-.45"/></svg>`,
            /** TaÃ§ */
            ['solar:crown-minimalistic-bold']: `<svg xmlns="http://www.w3.org/2000/svg"  width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="m21.609 13.562l.23-2.436c.18-1.912.27-2.869-.058-3.264a1 1 0 0 0-.675-.367c-.476-.042-1.073.638-2.268 1.998c-.618.704-.927 1.055-1.271 1.11a.92.92 0 0 1-.562-.09c-.319-.16-.53-.595-.955-1.464l-2.237-4.584C13.011 2.822 12.61 2 12 2s-1.011.822-1.813 2.465L7.95 9.049c-.424.87-.636 1.304-.955 1.464a.93.93 0 0 1-.562.09c-.344-.055-.653-.406-1.271-1.11c-1.195-1.36-1.792-2.04-2.268-1.998a1 1 0 0 0-.675.367c-.327.395-.237 1.352-.057 3.264l.229 2.436c.378 4.012.566 6.019 1.75 7.228C5.322 22 7.094 22 10.64 22h2.719c3.545 0 5.317 0 6.5-1.21s1.371-3.216 1.749-7.228"/></svg>`,
            /** Kupa / Ã–dÃ¼l */
            ['solar:cup-star-bold']: `<svg xmlns="http://www.w3.org/2000/svg"  width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="M22 8.162v.073c0 .86 0 1.291-.207 1.643s-.584.561-1.336.98l-.793.44c.546-1.848.729-3.834.796-5.532l.01-.221l.002-.052c.651.226 1.017.395 1.245.711c.283.393.283.915.283 1.958m-20 0v.073c0 .86 0 1.291.207 1.643s.584.561 1.336.98l.794.44c-.547-1.848-.73-3.834-.797-5.532l-.01-.221l-.001-.052c-.652.226-1.018.395-1.246.711C2 6.597 2 7.12 2 8.162"/><path fill="${color}" fill-rule="evenodd" d="M12 2c1.784 0 3.253.157 4.377.347c1.139.192 1.708.288 2.184.874s.45 1.219.4 2.485c-.172 4.349-1.11 9.78-6.211 10.26V19.5h1.43a1 1 0 0 1 .98.804l.19.946H18a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1 0-1.5h2.65l.19-.946a1 1 0 0 1 .98-.804h1.43v-3.534c-5.1-.48-6.038-5.912-6.21-10.26c-.051-1.266-.076-1.9.4-2.485c.475-.586 1.044-.682 2.183-.874A26.4 26.4 0 0 1 12 2m.952 4.199l-.098-.176C12.474 5.34 12.284 5 12 5s-.474.34-.854 1.023l-.098.176c-.108.194-.162.29-.246.354c-.085.064-.19.088-.4.135l-.19.044c-.738.167-1.107.25-1.195.532s.164.577.667 1.165l.13.152c.143.167.215.25.247.354s.021.215 0 .438l-.02.203c-.076.785-.114 1.178.115 1.352c.23.174.576.015 1.267-.303l.178-.082c.197-.09.295-.135.399-.135s.202.045.399.135l.178.082c.691.319 1.037.477 1.267.303s.191-.567.115-1.352l-.02-.203c-.021-.223-.032-.334 0-.438s.104-.187.247-.354l.13-.152c.503-.588.755-.882.667-1.165c-.088-.282-.457-.365-1.195-.532l-.19-.044c-.21-.047-.315-.07-.4-.135c-.084-.064-.138-.16-.246-.354" clip-rule="evenodd"/></svg>`,
            /** Ä°ndirim Etiketi */
            ['solar:sale-bold']: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" fill-rule="evenodd" d="M9.592 3.2a6 6 0 0 1-.495.399c-.298.2-.633.338-.985.408c-.153.03-.313.043-.632.068c-.801.064-1.202.096-1.536.214a2.71 2.71 0 0 0-1.655 1.655c-.118.334-.15.735-.214 1.536a6 6 0 0 1-.068.632c-.07.352-.208.687-.408.985c-.087.13-.191.252-.399.495c-.521.612-.782.918-.935 1.238c-.353.74-.353 1.6 0 2.34c.153.32.414.626.935 1.238c.208.243.312.365.399.495c.2.298.338.633.408.985c.03.153.043.313.068.632c.064.801.096 1.202.214 1.536a2.71 2.71 0 0 0 1.655 1.655c.334.118.735.15 1.536.214c.319.025.479.038.632.068c.352.07.687.209.985.408c.13.087.252.191.495.399c.612.521.918.782 1.238.935c.74.353 1.6.353 2.34 0c.32-.153.626-.414 1.238-.935c.243-.208.365-.312.495-.399c.298-.2.633-.338.985-.408c.153-.03.313-.043.632-.068c.801-.064 1.202-.096 1.536-.214a2.71 2.71 0 0 0 1.655-1.655c.118-.334.15-.735.214-1.536c.025-.319.038-.479.068-.632c.07-.352.209-.687.408-.985c.087-.13.191-.252.399-.495c.521-.612.782-.918.935-1.238c.353-.74.353-1.6 0-2.34c-.153-.32-.414-.626-.935-1.238a6 6 0 0 1-.399-.495a2.7 2.7 0 0 1-.408-.985a6 6 0 0 1-.068-.632c-.064-.801-.096-1.202-.214-1.536a2.71 2.71 0 0 0-1.655-1.655c-.334-.118-.735-.15-1.536-.214a6 6 0 0 1-.632-.068a2.7 2.7 0 0 1-.985-.408a6 6 0 0 1-.495-.399c-.612-.521-.918-.782-1.238-.935a2.71 2.71 0 0 0-2.34 0c-.32.153-.626.414-1.238.935m6.239 4.97a.814.814 0 0 1 0 1.15L9.32 15.832a.814.814 0 1 1-1.15-1.15l6.51-6.511a.814.814 0 0 1 1.15 0m-.033 6.543a1.085 1.085 0 1 1-2.17 0a1.085 1.085 0 0 1 2.17 0m-6.51-4.34a1.085 1.085 0 1 0 0-2.17a1.085 1.085 0 0 0 0 2.17" clip-rule="evenodd"/></svg>`,
            /** Bilet / Kupon */
            ['solar:ticket-bold']: `<svg xmlns="http://www.w3.org/2000/svg"  width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" fill-rule="evenodd" d="M14.008 19.003L14.014 17a1.001 1.001 0 0 1 2.005 0v1.977c0 .481 0 .722.154.87c.155.147.39.137.863.117c1.863-.079 3.008-.33 3.814-1.136c.81-.806 1.061-1.951 1.14-3.817c.015-.37.023-.556-.046-.679c-.07-.123-.345-.277-.897-.586a1.999 1.999 0 0 1 0-3.492c.552-.308.828-.463.897-.586s.061-.308.045-.679c-.078-1.866-.33-3.01-1.139-3.817c-.877-.876-2.155-1.097-4.322-1.153a.497.497 0 0 0-.51.497V7a1.001 1.001 0 0 1-2.005 0l-.007-2.501a.5.5 0 0 0-.5-.499H9.994c-3.78 0-5.67 0-6.845 1.172c-.81.806-1.061 1.951-1.14 3.817c-.015.37-.023.556.046.679c.07.123.345.278.897.586a1.999 1.999 0 0 1 0 3.492c-.552.309-.828.463-.897.586s-.061.308-.045.678c.078 1.867.33 3.012 1.139 3.818C4.324 20 6.214 20 9.995 20h3.01c.472 0 .707 0 .854-.146s.148-.38.149-.851M16.018 13v-2a1.001 1.001 0 0 0-2.005 0v2a1.002 1.002 0 0 0 2.006 0" clip-rule="evenodd"/></svg>`,
            /** Ã‡ark SembolÃ¼ */
            ['mdi:dharma-wheel']: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"  viewBox="0 0 22 22"><path fill="${color}" d="M11 2v1c-1.73.2-3.31.9-4.6 1.94l-.76-.76L4.22 5.6l.78.75A9.04 9.04 0 0 0 3 11H2v2h1c.21 1.68.9 3.26 2 4.56l-.78.76l1.42 1.42l.75-.74A9.3 9.3 0 0 0 11 21v1h2v-1a9.27 9.27 0 0 0 4.6-2l.76.74l1.42-1.42l-.78-.75c1.1-1.3 1.79-2.89 2-4.57h1v-2h-1a9 9 0 0 0-2-4.64l.78-.76l-1.42-1.42l-.75.76A9 9 0 0 0 13 3V2zm0 3v3l-1 .5l-2.19-2.15c.91-.68 2-1.18 3.19-1.35m2 0c1.16.18 2.26.64 3.2 1.35L14 8.5L13 8zM6.4 7.76L8.5 10L8 11H5c.16-1.16.7-2.3 1.39-3.25zm11.2 0c.73.95 1.21 2.06 1.4 3.24h-3l-.5-1l2.11-2.24zM12 10c1.12 0 2 .88 2 2s-.88 2-2 2s-2-.88-2-2s.88-2 2-2m-7 3h3l.57 1l-2.18 2.15C5.67 15.24 5.19 14.16 5 13m11 0h3a7 7 0 0 1-1.39 3.16L15.5 14zm-6 2.5l1 .5v3a7.04 7.04 0 0 1-3.2-1.43zm4 0l2.19 2.07c-.91.68-2 1.26-3.19 1.43v-3z"/></svg>`,
            // ------------------------------------------------------------------
            // 2. Ã–zel GÃ¼nler
            // ------------------------------------------------------------------
            /** Kravat (Babalar GÃ¼nÃ¼) */
            ['mdi:tie']: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="m6 2l4 4l-3 11l5 5l5-5l-3-11l4-4Z"/></svg>`,
            /** Kalp (Dolu) */
            ['solar:heart-bold']: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="M2 9.137C2 14 6.02 16.591 8.962 18.911C10 19.729 11 20.5 12 20.5s2-.77 3.038-1.59C17.981 16.592 22 14 22 9.138S16.5.825 12 5.501C7.5.825 2 4.274 2 9.137"/></svg>`,
            /** Ã‡iÃ§ek */
            ['mdi:flower-poppy']: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="M18.5 12A3.5 3.5 0 0 0 22 8.5A6.5 6.5 0 0 0 15.5 2A3.5 3.5 0 0 0 12 5.5A3.5 3.5 0 0 0 8.5 2A6.5 6.5 0 0 0 2 8.5A3.5 3.5 0 0 0 5.5 12A3.5 3.5 0 0 0 2 15.5A6.5 6.5 0 0 0 8.5 22a3.5 3.5 0 0 0 3.5-3.5a3.5 3.5 0 0 0 3.5 3.5a6.5 6.5 0 0 0 6.5-6.5a3.5 3.5 0 0 0-3.5-3.5M12 16a4 4 0 0 1-4-4a4 4 0 0 1 4-4a4 4 0 0 1 4 4a4 4 0 0 1-4 4m2.5-4a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 9.5 12A2.5 2.5 0 0 1 12 9.5a2.5 2.5 0 0 1 2.5 2.5"/></svg>`,
            /** Pasta (DoÄŸum GÃ¼nÃ¼) */
            ['mdi:cake']: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="M11.5.5c.5.25 1.5 1.9 1.5 3S12.33 5 11.5 5S10 4.85 10 3.75S11 2 11.5.5m7 8.5C21 9 23 11 23 13.5c0 1.56-.79 2.93-2 3.74V23H3v-5.76c-1.21-.81-2-2.18-2-3.74C1 11 3 9 5.5 9H10V6h3v3zM12 16a2.5 2.5 0 0 0 2.5-2.5H16a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5h-13A2.5 2.5 0 0 0 3 13.5A2.5 2.5 0 0 0 5.5 16A2.5 2.5 0 0 0 8 13.5h1.5A2.5 2.5 0 0 0 12 16"/></svg>`,
            /** Kutlama */
            ['mdi:party-popper']: `<svg xmlns="http://www.w3.org/2000/svg"  width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="m14.53 1.45l-1.08 1.08l1.6 1.6q.33.375.33.87c0 .495-.11.64-.33.86L11.5 9.47l1 1.08l3.63-3.61c.53-.59.79-1.24.79-1.94s-.26-1.36-.79-1.95zm-3.98 2.02L9.47 4.55l.61.56c.22.22.33.52.33.89s-.11.67-.33.89l-.61.56l1.08 1.08l.56-.61c.53-.59.8-1.23.8-1.92c0-.72-.27-1.37-.8-1.97zM21 5.06c-.69 0-1.33.27-1.92.8l-5.63 5.64l1.08 1l5.58-5.56c.25-.25.55-.38.89-.38s.64.13.89.38l.61.61l1.03-1.08l-.56-.61c-.59-.53-1.25-.8-1.97-.8M7 8L2 22l14-5zm12 3.06c-.7 0-1.34.27-1.94.8l-1.59 1.59l1.08 1.08l1.59-1.59c.25-.25.53-.38.86-.38s.63.13.88.38l1.62 1.59l1.05-1.03l-1.6-1.64c-.59-.53-1.25-.8-1.95-.8"/></svg>`,
            /** Kar Tanesi (KÄ±ÅŸ) */
            ['mdi:snowflake']: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="m20.79 13.95l-2.33.62l-2-1.13v-2.88l2-1.13l2.33.62l.52-1.93l-1.77-.47l.46-1.77l-1.93-.52l-.62 2.33l-2 1.13L13 7.38V5.12l1.71-1.71L13.29 2L12 3.29L10.71 2L9.29 3.41L11 5.12v2.26L8.5 8.82l-2-1.13l-.58-2.33L4 5.88l.47 1.77l-1.77.47l.52 1.93l2.33-.62l2 1.13v2.89l-2 1.13l-2.33-.62l-.52 1.93l1.77.47L4 18.12l1.93.52l.62-2.33l2-1.13L11 16.62v2.26l-1.71 1.71L10.71 22L12 20.71L13.29 22l1.41-1.41l-1.7-1.71v-2.26l2.5-1.45l2 1.13l.62 2.33l1.88-.51l-.47-1.77l1.77-.47zM9.5 10.56L12 9.11l2.5 1.45v2.88L12 14.89l-2.5-1.45z"/></svg>`,
            /** GÃ¼neÅŸ (Yaz) */
            ['solar:sun-bold']: `<svg xmlns="http://www.w3.org/2000/svg"  width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="M18 12a6 6 0 1 1-12 0a6 6 0 0 1 12 0"/><path fill="${color}" fill-rule="evenodd" d="M12 1.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75M4.399 4.399a.75.75 0 0 1 1.06 0l.393.392a.75.75 0 0 1-1.06 1.061l-.393-.393a.75.75 0 0 1 0-1.06m15.202 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 0 1-1.06-1.06l.393-.393a.75.75 0 0 1 1.06 0M1.25 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75m19 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75m-2.102 6.148a.75.75 0 0 1 1.06 0l.393.393a.75.75 0 1 1-1.06 1.06l-.393-.393a.75.75 0 0 1 0-1.06m-12.296 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 1 1-1.06-1.06l.392-.393a.75.75 0 0 1 1.061 0M12 20.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75" clip-rule="evenodd"/></svg>`,
            /** Hilal (Bayram) */
            ['mdi:star-crescent']: `<svg xmlns="http://www.w3.org/2000/svg" tre width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="M12.3 2H12A10 10 0 0 0 2 12a10 10 0 0 0 10 10c3 0 4.7-1 6.5-2.5C13 21 8 17 8 12s5-9 10.5-7.5A8.56 8.56 0 0 0 12.3 2m4.5 4.2l-1.5 3.5l-3.7.3l2.9 2.5l-.9 3.5l3.2-2l3.2 2l-1-3.5l3-2.5l-3.7-.3z"/></svg>`,
            /** Ã‡am AÄŸacÄ± (YÄ±lbaÅŸÄ±) */
            ['ph:tree-evergreen-fill']: `<svg xmlns="http://www.w3.org/2000/svg"  width="22" height="22"  viewBox="0 0 22 22><path fill="${color}" d="M231.19 195.51A8 8 0 0 1 224 200h-88v40a8 8 0 0 1-16 0v-40H32a8 8 0 0 1-6.31-12.91l46-59.09H48a8 8 0 0 1-6.34-12.88l80-104a8 8 0 0 1 12.68 0l80 104A8 8 0 0 1 208 128h-23.64l45.95 59.09a8 8 0 0 1 .88 8.42"/></svg>`,
        };
        const svg = svgs[svgId];
        return svg !== undefined ? svg : svgs['-1'];
    }

    /**
     * WheelRenderer (Canvas Motoru - DÃ¼zeltilmiÅŸ SÃ¼rÃ¼m)
     *
     * Bu sÄ±nÄ±f, 'WheelPrize' ve 'SpinResult' tiplerine
     * uyacak ÅŸekilde gÃ¼ncellenmiÅŸtir.
     */
    class WheelRenderer {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.prizes = [];
            this.template = null;
            this.drawablePrizes = [];
            this.isSpinning = false;
            this.rotation = 0;
            this.wheelSize = 300;
            this.center = this.wheelSize / 2;
            this.centerImage = null;
            this.defaultImageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdql2ZH0YK51DrLv9D0UNGsvfMXhUmh1WzXQ&s';
        }
        /**
         * Renderer'Ä± baÅŸlatÄ±r, canvas'Ä± ve verileri alÄ±r, ilk Ã§izimi yapar.
         */
        async init(canvas, prizes, template) {
            if (!canvas)
                throw new Error('Canvas elementi bulunamadÄ±.');
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.prizes = prizes;
            this.template = template;
            this.drawablePrizes = [...prizes, ...prizes];
            this.isSpinning = false;
            this.rotation = 0;
            if (!this.ctx) {
                throw new Error('Canvas 2D context alÄ±namadÄ±.');
            }
            this.centerImage = null;
            let imageUrlToLoad = template.centerImage;
            if (imageUrlToLoad) {
                try {
                    this.centerImage = await this.loadImage(imageUrlToLoad);
                }
                catch (userImageError) {
                    console.error('KullanÄ±cÄ± merkez resmi yÃ¼klenemedi:', imageUrlToLoad, userImageError);
                    // Hata olursa varsayÄ±lana dÃ¼ÅŸ
                }
            }
            // if (!this.centerImage) {
            //   try {
            //     this.centerImage = await this.loadImage(this.defaultImageUrl);
            //   } catch (defaultImageError) {
            //     console.error('VarsayÄ±lan merkez resim yÃ¼klenemedi:', this.defaultImageUrl, defaultImageError);
            //   }
            // }
            this.drawWheel();
        }
        animateSpin(spinResult) {
            return new Promise((resolve, reject) => {
                if (this.isSpinning)
                    return reject(new Error('Ã‡ark zaten dÃ¶nÃ¼yor.'));
                if (!this.drawablePrizes.length)
                    return reject(new Error('Ã–dÃ¼ller yÃ¼klenmedi.'));
                this.isSpinning = true;
                if (this.canvas) {
                    this.canvas.classList.add('is-spinning');
                }
                const baseIndex = this.prizes.findIndex(p => p.name === spinResult.name);
                if (baseIndex === -1) {
                    this.isSpinning = false;
                    return reject(new Error(`Ã–dÃ¼l "${spinResult.name}" Ã§arkta bulunamadÄ±.`));
                }
                const targetIndex = baseIndex + this.prizes.length;
                const segmentDeg = 360 / this.drawablePrizes.length;
                const targetRotation = (360 * 5) + (360 - (targetIndex * segmentDeg) - (segmentDeg / 2));
                const duration = 4000;
                const startTime = performance.now();
                const startRotation = this.rotation;
                const animate = (currentTime) => {
                    const elapsedTime = currentTime - startTime;
                    if (elapsedTime >= duration) {
                        this.rotation = targetRotation;
                        this.drawWheel();
                        this.isSpinning = false;
                        resolve();
                        return;
                    }
                    const progress = elapsedTime / duration;
                    const easeOutProgress = 1 - Math.pow(1 - progress, 4);
                    this.rotation = startRotation + (targetRotation - startRotation) * easeOutProgress;
                    this.drawWheel();
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            });
        }
        drawWheel() {
            if (!this.ctx || !this.template)
                return;
            const ctx = this.ctx;
            const segmentAngleRad = (2 * Math.PI) / this.drawablePrizes.length;
            ctx.clearRect(0, 0, this.wheelSize, this.wheelSize);
            // Bu, dilimlerin 'arkasÄ±na' Ã§izilir
            ctx.beginPath();
            ctx.arc(this.center, this.center, this.center - 1, 0, 2 * Math.PI);
            ctx.fillStyle = '#f0f0f0';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.center, this.center, this.center - 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.save();
            ctx.translate(this.center, this.center);
            ctx.rotate((this.rotation * Math.PI) / 180);
            this.drawablePrizes.forEach((prize, i) => {
                const startRad = i * segmentAngleRad;
                const endRad = startRad + segmentAngleRad;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, this.center - 5, startRad, endRad);
                ctx.closePath();
                ctx.fillStyle = prize.backgroundColor;
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.stroke();
                ctx.save();
                ctx.rotate(startRad + segmentAngleRad / 2);
                ctx.textAlign = 'center';
                ctx.fillStyle = prize.textColor || '#FFFFFF';
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText(prize.name, (this.center - 5) * 0.65, 5);
                ctx.restore();
            });
            ctx.restore();
            const holeRadius = 40;
            const centerImageAreaX = this.center - holeRadius;
            const centerImageAreaY = this.center - holeRadius;
            const centerImageAreaSize = holeRadius * 2;
            ctx.beginPath();
            ctx.arc(this.center, this.center, holeRadius, 0, 2 * Math.PI);
            ctx.fillStyle = this.template.modalBackground.modalBackgroundColor || '#FFFFFF';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.center, this.center, holeRadius, 0, 2 * Math.PI);
            ctx.clip();
            if (this.centerImage) {
                const img = this.centerImage;
                const imgWidth = img.naturalWidth;
                const imgHeight = img.naturalHeight;
                const imgAspectRatio = imgWidth / imgHeight;
                const containerWidth = centerImageAreaSize;
                const containerHeight = centerImageAreaSize;
                const containerAspectRatio = containerWidth / containerHeight;
                let drawX = centerImageAreaX;
                let drawY = centerImageAreaY;
                let drawWidth = containerWidth;
                let drawHeight = containerHeight;
                if (imgAspectRatio > containerAspectRatio) {
                    drawWidth = containerWidth;
                    drawHeight = containerWidth / imgAspectRatio;
                    drawY = centerImageAreaY + (containerHeight - drawHeight) / 2;
                }
                else {
                    drawHeight = containerHeight;
                    drawWidth = containerHeight * imgAspectRatio;
                    drawX = centerImageAreaX + (containerWidth - drawWidth) / 2;
                }
                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            }
            ctx.restore();
            ctx.fillStyle = this.template.indicatorColor || '#000000';
            ctx.beginPath();
            ctx.moveTo(this.center + holeRadius + 25, this.center);
            ctx.lineTo(this.center + holeRadius, this.center - 15);
            ctx.lineTo(this.center + holeRadius, this.center + 15);
            ctx.closePath();
            ctx.shadowColor = this.template.indicatorShadowColor || 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.fill();
            ctx.shadowColor = 'transparent';
        }
        loadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                let finalSrc = src;
                if (src.startsWith('http') || src.startsWith('.') || src.startsWith('/')) {
                    img.crossOrigin = 'Anonymous';
                }
                else if (src.startsWith('data:image/')) {
                    finalSrc = src;
                }
                else {
                    finalSrc = `data:image/webp;base64,${src}`;
                }
                const HATA_MESAJI = `Resim yÃ¼klenemedi: ${finalSrc.substring(0, 50)}...`;
                img.onload = () => resolve(img);
                img.onerror = (err) => reject(new Error(HATA_MESAJI));
                img.src = finalSrc;
            });
        }
        isCurrentlySpinning() {
            return this.isSpinning;
        }
    }

    var globalWheelHtml = "<div id=\"yuddy-global-overlay\" style=\"display: none\">\n  <div class=\"yuddy-modal-container\">\n    <button class=\"yuddy-modal-close\" aria-label=\"Kapat\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\">\n        <path fill=\"currentColor\"\n          d=\"M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z\" />\n      </svg>\n    </button>\n\n    <div class=\"yuddy-wheel-panel\">\n      <div class=\"yuddy-wheel-frame-wrapper\">\n\n        <div class=\"yuddy-wheel-container\">\n          <canvas id=\"yuddy-wheel-canvas\" width=\"300\" height=\"300\"></canvas>\n        </div>\n\n      </div>\n    </div>\n\n    <div class=\"yuddy-result-panel\" style=\"display: none\">\n      <h2 id=\"yuddy-result-title\"></h2>\n      <p id=\"yuddy-result-description\"></p>\n      <div id=\"yuddy-coupon-code\"></div>\n      <button id=\"yuddy-result-copy-button\">Kopyala</button>\n      <p id=\"yuddy-result-footer\"></p>\n    </div>\n    <div class=\"yuddy-form-panel\">\n      <h2 id=\"yuddy-title\"></h2>\n\n      <p id=\"yuddy-description\"></p>\n\n      <div id=\"yuddy-form-content\">\n        <div class=\"yuddy-form-inputs\">\n          <input type=\"text\" id=\"yuddy-nameInput\" placeholder=\"Ad Soyad\" maxlength=\"50\" autocomplete=\"off\" />\n          <input type=\"tel\" id=\"yuddy-phoneInput\" placeholder=\"5xx xxx xx xx\" maxlength=\"13\" autocomplete=\"off\" />\n          <input type=\"email\" id=\"yuddy-mailInput\" placeholder=\"E-posta\" maxlength=\"50\" autocomplete=\"off\" />\n        </div>\n\n        <div class=\"yuddy-checkbox-group\">\n          <!-- Checkbox'lar dinamik olarak burada oluÅŸturulacak -->\n        </div>\n\n        <button id=\"yuddy-spin-button\">Ã‡arkÄ± Ã‡evir!</button>\n        <div id=\"yuddy-error-message\" style=\"display: none\"></div>\n      </div>\n\n      <p id=\"yuddy-footer-text\"></p>\n    </div>\n  </div>\n</div>\n\n<div id=\"yuddy-reopen-button\" style=\"display: none\">\n  <span class=\"yuddy-reopen-content\">\n    <div class=\"yuddy-reopen-svg-area\"></div>\n    <span id=\"yuddy-reopen-text-area\">Ã‡arkÄ± AÃ§</span>\n  </span>\n  <button class=\"yuddy-reopen-close\" aria-label=\"Tekrar aÃ§ butonunu kapat\">\n    &times;\n  </button>\n</div>\n\n<div class=\"yuddy-sidebar\" style=\"display: none\">\n  <div class=\"yuddy-tab\">Hediye Ã‡eki</div>\n  <div id=\"yuddy-reminder\">\n\n\n    <div class=\"yuddy-reminder-content\">\n      <div id=\"yuddy-reminderText\">Tebrikler! Ä°ndirim KazandÄ±n!</div>\n      \n      <div id=\"yuddy-reminderSubText\">2000TL AltÄ±nda KullanÄ±labilir</div>\n\n\n\n      <div id=\"yuddy-discountCode\">INDIRIM10</div>\n\n      <div id=\"yuddy-countdown\">\n        <div class=\"countdown-item\">\n          <span class=\"countdown-number\" id=\"yuddy-days\">0</span>\n          <span class=\"countdown-label\">GÃ¼n</span>\n        </div>\n        <div class=\"countdown-item\">\n          <span class=\"countdown-number\" id=\"yuddy-hours\">0</span>\n          <span class=\"countdown-label\">Saat</span>\n        </div>\n        <div class=\"countdown-item\">\n          <span class=\"countdown-number\" id=\"yuddy-minutes\">0</span>\n          <span class=\"countdown-label\">Dakika</span>\n        </div>\n        <div class=\"countdown-item\">\n          <span class=\"countdown-number\" id=\"yuddy-seconds\">0</span>\n          <span class=\"countdown-label\">Saniye</span>\n        </div>\n      </div>\n      <div class=\"yuddy-closeButtonDiv\">\n        <button type=\"button\" id=\"yuddy-sidebar-close\" class=\"yuddy-sidebar-close\">Ã—</button>\n      </div>\n    </div>\n  </div>\n</div>";

    /**
     * HTML Template Loader
     * Build time'da HTML dosyasÄ±nÄ± yÃ¼kler ve string olarak dÃ¶ner
     */
    function loadGlobalWheelHTML() {
        return globalWheelHtml;
    }

    /**
     * DOMManager
     *
     * Widget'Ä±n tÃ¼m HTML/CSS'ini sayfaya basmaktan,
     * elementleri bulmaktan (querying) ve
     * "beyin"den gelen komutlara gÃ¶re DOM'u manipÃ¼le etmekten sorumludur.
     */
    class DOMManager {
        getWheelOverlay() {
            return document.getElementById('yuddy-global-overlay');
        }
        getWheelModalContainer() {
            return this.getWheelOverlay().querySelector('.yuddy-modal-container');
        }
        getWheelCanvas() {
            return this.getWheelOverlay().querySelector('#yuddy-wheel-canvas');
        }
        getWheelFormContent() {
            return this.getWheelOverlay().querySelector('.yuddy-form-panel');
        }
        getWheelResultContent() {
            return this.getWheelOverlay().querySelector('.yuddy-result-panel');
        }
        getWheelFormErrorMessage() {
            return this.getWheelOverlay().querySelector('#yuddy-error-message');
        }
        getWheelCloseButton() {
            return this.getWheelOverlay().querySelector('.yuddy-modal-close');
        }
        getWheelSpinButton() {
            return this.getWheelOverlay().querySelector('#yuddy-spin-button');
        }
        getWheelFormNameInput() {
            return this.getWheelOverlay().querySelector('#yuddy-nameInput');
        }
        getWheelFormEmailInput() {
            return this.getWheelOverlay().querySelector('#yuddy-mailInput');
        }
        getWheelFormPhoneInput() {
            return this.getWheelOverlay().querySelector('#yuddy-phoneInput');
        }
        getWheelResultCopyButton() {
            return this.getWheelOverlay().querySelector('#yuddy-result-copy-button');
        }
        getReopenButton() {
            return document.getElementById('yuddy-reopen-button');
        }
        getReopenCloseButton() {
            return this.getReopenButton().querySelector('.yuddy-reopen-close');
        }
        getSideBarElement() {
            return (document.getElementById('yuddy-sidebar') ||
                document.querySelector('.yuddy-sidebar'));
        }
        getSideBarCloseButton() {
            return this.getSideBarElement().querySelector('#yuddy-sidebar-close');
        }
        getSideBarCodeElement() {
            return this.getSideBarElement().querySelector('#yuddy-discountCode');
        }
        getSideTabButton() {
            return this.getSideBarElement().querySelector('.yuddy-tab');
        }
        isWheelVisible() {
            const wheelOverlay = this.getWheelOverlay();
            if (!wheelOverlay)
                return false;
            return wheelOverlay.style.display === 'flex';
        }
        constructor() {
            this.countdownInterval = null;
            this.isInitialized = false;
            this.wheelRenderer = new WheelRenderer();
            // Cleanup intervals when page is unloaded
            window.addEventListener('beforeunload', () => {
                this.cleanup();
            });
        }
        /**
         * DOMManager'Ä± baÅŸlatÄ±r.
         * CSS'i enjekte eder, HTML'i enjekte eder, elementleri bulur ve olay dinleyicilerini baÄŸlar.
         */
        async init(wheelData) {
            if (this.isInitialized)
                return;
            this.injectHTML();
            this.reopenButtonLocation(wheelData);
            this.populateInitialContent(wheelData);
            await this.wheelRenderer.init(this.getWheelCanvas(), wheelData.prizes, wheelData.template);
            this.isInitialized = true;
        }
        /**
         * GLOBAL_WHEEL_HTML'i <body> iÃ§ine enjekte eder.
         */
        injectHTML() {
            this.removeExistingWheelElements();
            document.body.insertAdjacentHTML('beforeend', loadGlobalWheelHTML());
        }
        showWheel() {
            const wheelOverlay = this.getWheelOverlay();
            const wheelModalContainer = this.getWheelModalContainer();
            if (!wheelOverlay || !wheelModalContainer)
                return;
            wheelOverlay.style.display = 'flex';
            requestAnimationFrame(() => {
                wheelModalContainer === null || wheelModalContainer === void 0 ? void 0 : wheelModalContainer.classList.add('open');
            });
            this.hideReopenButton();
        }
        hideWheel() {
            const wheelModalContainer = this.getWheelModalContainer();
            const wheelOverlay = this.getWheelOverlay();
            if (!wheelModalContainer || !wheelOverlay)
                return;
            wheelModalContainer.classList.remove('open');
            wheelModalContainer.classList.add('closing');
            wheelModalContainer.addEventListener('transitionend', () => {
                this.getWheelOverlay().style.display = 'none';
                wheelModalContainer === null || wheelModalContainer === void 0 ? void 0 : wheelModalContainer.classList.remove('closing');
            }, { once: true });
        }
        hideWheelOnly() {
            if (this.getWheelOverlay()) {
                this.getWheelOverlay().style.display = 'none';
            }
        }
        showReopenButton() {
            this.getReopenButton().style.display = 'block';
        }
        hideReopenButton() {
            this.getReopenButton().style.display = 'none';
        }
        removeExistingWheelElements() {
            var _a, _b, _c;
            (_a = document.getElementById('yuddy-global-overlay')) === null || _a === void 0 ? void 0 : _a.remove();
            (_b = document.getElementById('yuddy-reopen-button')) === null || _b === void 0 ? void 0 : _b.remove();
            (_c = document.getElementById('yuddy-sidebar')) === null || _c === void 0 ? void 0 : _c.remove();
        }
        populateInitialContent(wheelData) {
            var wheelOverlay = this.getWheelOverlay();
            var wheelCloseButton = this.getWheelCloseButton();
            var wheelModalContainer = this.getWheelModalContainer();
            var reopenButton = this.getReopenButton();
            if (!wheelOverlay || !wheelCloseButton)
                return;
            if (!wheelModalContainer)
                return;
            const template = wheelData.template;
            wheelModalContainer.style.backgroundColor =
                template.modalBackground.modalBackgroundColor || '#FFFFFF';
            wheelCloseButton.style.backgroundColor = template.closeButtonColor;
            const frameWrapper = wheelOverlay.querySelector('.yuddy-wheel-frame-wrapper');
            const frameIconId = template.frameIconId;
            if (frameWrapper) {
                if (frameIconId && frameIconId !== '0' && frameIconId !== '-1') {
                    if (frameIconId.startsWith('#')) {
                        frameWrapper.style.borderRadius = '50%';
                        frameWrapper.style.backgroundColor = `${frameIconId}`;
                        frameWrapper.style.width = "320px";
                        frameWrapper.style.height = "320px";
                    }
                    else {
                        const frameUrl = `https://app.yuddy.com/assets/images/frames/${frameIconId}.png`;
                        frameWrapper.style.backgroundImage = `url('${frameUrl}')`;
                        if (frameIconId === "3") {
                            frameWrapper.style.paddingRight = "4px";
                            frameWrapper.style.paddingBottom = "5px";
                        }
                    }
                }
                else {
                    frameWrapper.style.backgroundImage = 'none';
                }
            }
            wheelOverlay.querySelector('#yuddy-title').textContent =
                template.title;
            wheelOverlay.querySelector('#yuddy-description').textContent = template.description;
            wheelOverlay.querySelector('#yuddy-footer-text').textContent = template.footerText;
            if (reopenButton) {
                const reopenContent = reopenButton.querySelector('.yuddy-reopen-content');
                const reopenText = reopenButton.querySelector('#yuddy-reopen-text-area');
                // const reopenIcon = this.reopenButton.querySelector('#yuddy-reopen-icon-area') as HTMLElement; // (Ä°konu bir sonraki adÄ±mda ekleriz)
                if (reopenContent) {
                    // Arka plan rengini ayarla
                    reopenContent.style.backgroundColor = template.openWheelButtonColor;
                    // YazÄ± rengini ayarla
                    reopenContent.style.color = template.allTextColors.reopenButton;
                }
                if (reopenText) {
                    // YazÄ±yÄ± bas
                    reopenText.textContent = template.openWheelButtonText;
                }
            }
            var wheelFormContent = this.getWheelFormContent();
            if (!wheelFormContent)
                return;
            if (!template.phoneNumberVisibility) {
                var phoneField = this.getWheelFormPhoneInput();
                if (phoneField) {
                    phoneField.style.display = 'none';
                }
            }
            if (!template.emailVisibility) {
                var emailField = this.getWheelFormEmailInput();
                if (emailField) {
                    emailField.style.display = 'none';
                }
            }
            if (!wheelData.useNameArea) {
                var nameField = this.getWheelFormNameInput();
                if (nameField) {
                    nameField.style.display = 'none';
                }
            }
            var etkCheckboxGroup = wheelFormContent.querySelector('.yuddy-checkbox-group');
            if (etkCheckboxGroup) {
                const linkStyle = "color:#007bff; text-decoration:underline;";
                etkCheckboxGroup.innerHTML = `
      <label>
            <input type="checkbox" id="yuddy-etk-checkbox" required />
            <p>
              TanÄ±tÄ±m, pazarlama vb. amaÃ§larla tarafÄ±ma ticari elektronik ileti
              gÃ¶nderilmesine izin veriyorum.
              <a href="${template.etkUrl || '#'}" target="_blank"  style="${linkStyle}">AydÄ±nlatma Metni</a>'ni
              okudum.
            </p>
          </label>
          <label>
            <input type="checkbox" id="yuddy-kvkk-checkbox" required />
            <p>
              PaylaÅŸtÄ±ÄŸÄ±m bilgilerin
              <a href="${template.kvkkUrl || '#'}" target="_blank" style="${linkStyle}">KVKK kapsamÄ±nda</a>
              korunmasÄ±nÄ± ve bilgilendirmeleri almayÄ± kabul ediyorum.
            </p>
          </label>
      `;
            }
            var wheelSpinButton = this.getWheelSpinButton();
            wheelSpinButton.style.backgroundColor = template.spinButtonBackground;
            wheelSpinButton.style.color = template.allTextColors.wheelSpinButton;
            wheelSpinButton.textContent = template.spinButtonText;
            this.addBrandingLogo();
        }
        buildResultPanel(result) {
            var formContent = this.getWheelFormContent();
            if (formContent) {
                formContent.style.display = 'none';
            }
            var wheelResultContent = this.getWheelResultContent();
            if (!wheelResultContent)
                return;
            var resultTitle = wheelResultContent.querySelector('#yuddy-result-title');
            resultTitle.style.color = result.titleColor || '#333';
            resultTitle.textContent = result.heading || 'Tebrikler!';
            var resultDescription = wheelResultContent.querySelector('#yuddy-result-description');
            resultDescription.style.color = result.descriptionColor || '#555';
            resultDescription.textContent = result.text || '';
            const hasPromocode = result.promocode && result.promocode.toString().trim() !== '';
            var yuddyPromotionCode = wheelResultContent.querySelector('#yuddy-coupon-code');
            if (yuddyPromotionCode) {
                if (hasPromocode) {
                    yuddyPromotionCode.style.display = 'block';
                    yuddyPromotionCode.style.color = result.discountCodeColor || '#333';
                    yuddyPromotionCode.style.borderColor = result.discountCodeColor || '#ccc';
                    yuddyPromotionCode.textContent = result.promocode || '';
                }
                else {
                    yuddyPromotionCode.style.display = 'none';
                }
            }
            var yuddyResultCopyButton = this.getWheelResultCopyButton();
            if (yuddyResultCopyButton) {
                if (hasPromocode) {
                    yuddyResultCopyButton.style.display = 'block';
                    yuddyResultCopyButton.style.backgroundColor = result.copyButtonBackgroundColor || '#333';
                    yuddyResultCopyButton.style.color = result.copyButtonColor || '#fff';
                }
                else {
                    yuddyResultCopyButton.style.display = 'none';
                }
            }
            var yuddyResultFooter = wheelResultContent.querySelector('#yuddy-result-footer');
            // Footer her durumda gÃ¶rÃ¼nebilir (Ã¶rn: "Bol ÅŸans" yazÄ±sÄ± iÃ§in)
            yuddyResultFooter.style.color = result.footerColor || '#888';
            yuddyResultFooter.textContent = result.footerText || '';
            wheelResultContent.style.display = 'flex';
        }
        getUserFormData() {
            var _a, _b, _c, _d, _e, _f, _g;
            const name = (_a = this.getWheelFormNameInput()) === null || _a === void 0 ? void 0 : _a.value;
            const phone = (_b = this.getWheelFormPhoneInput()) === null || _b === void 0 ? void 0 : _b.value;
            const email = (_c = this.getWheelFormEmailInput()) === null || _c === void 0 ? void 0 : _c.value;
            const etk = (_e = (_d = this.getWheelOverlay()) === null || _d === void 0 ? void 0 : _d.querySelector('#yuddy-etk-checkbox')) === null || _e === void 0 ? void 0 : _e.checked;
            const kvkk = (_g = (_f = this.getWheelOverlay()) === null || _f === void 0 ? void 0 : _f.querySelector('#yuddy-kvkk-checkbox')) === null || _g === void 0 ? void 0 : _g.checked;
            return {
                storeName: window.location.hostname.replace(/^www\./, ''),
                fullName: (name === null || name === void 0 ? void 0 : name.trim()) || undefined,
                mobilePhone: (phone === null || phone === void 0 ? void 0 : phone.replace(/\s/g, '')) || undefined,
                email: (email === null || email === void 0 ? void 0 : email.trim()) || undefined,
                etk: etk || false,
                kvkk: kvkk || false, // 'types.ts' dosyamÄ±zla eÅŸleÅŸmesi iÃ§in 'kvkkConsent' kullandÄ±m
            };
        }
        showWheelFormError(message) {
            var wheelFormErrorMessage = this.getWheelFormErrorMessage();
            if (wheelFormErrorMessage) {
                wheelFormErrorMessage.innerHTML = message;
                wheelFormErrorMessage.style.display = 'block';
            }
        }
        hideWheelFormError() {
            var wheelFormErrorMessage = this.getWheelFormErrorMessage();
            if (wheelFormErrorMessage) {
                wheelFormErrorMessage.style.display = 'none';
            }
        }
        reopenButtonLocation(wheelData) {
            const position = wheelData.template.openWheelButtonPosition;
            let styleContent = '';
            const selector = '#yuddy-reopen-button';
            const contentSelector = `${selector} .yuddy-reopen-content`;
            // WhatsApp vb. eklentilerle Ã§akÄ±ÅŸmamasÄ± iÃ§in alt boÅŸluk payÄ±
            const bottomOffset = '80px';
            const sideOffset = '20px';
            switch (position) {
                case 'Middle Right': {
                    styleContent = `
          ${selector} { 
            transform: rotate(270deg); 
            top: 50%; 
            right: 0; 
            transform-origin: right bottom; 
            margin-top: -50px; /* Dikey ortalama ayarÄ± */
          }`;
                    break;
                }
                case 'Bottom Right': {
                    styleContent = `
          ${selector} { 
            transform: rotate(0deg); 
            bottom: ${bottomOffset};
            right: ${sideOffset}; 
          }`;
                    break;
                }
                case 'Middle Left': {
                    styleContent = `
          ${selector} { 
            transform: rotate(90deg); 
            top: 50%; 
            left: 0; 
            transform-origin: left bottom; 
            margin-top: -50px;
          }`;
                    break;
                }
                case 'Bottom Left': {
                    styleContent = `
          ${selector} { 
            transform: rotate(0deg); 
            bottom: ${bottomOffset}; 
            left: ${sideOffset}; 
          }`;
                    break;
                }
                // DÃœZELTME: Type tanÄ±mÄ±na uygun olarak 'Bottom Center' yapÄ±ldÄ±
                case 'Bottom Center': {
                    styleContent = `
          ${selector} { 
            transform: rotate(0deg) translateX(-50%); 
            bottom: 0; /* Center genelde yapÄ±ÅŸÄ±k olabilir ama istersen burayÄ± da ${bottomOffset} yapabilirsin */
            left: 50%; 
            transform-origin: left center; 
          }`;
                    break;
                }
                // DÃœZELTME: Type tanÄ±mÄ±na uygun olarak 'Top Right' yapÄ±ldÄ±
                case 'Top Right': {
                    styleContent = `
          ${selector} { 
            transform: rotate(180deg); 
            top: 0; 
            right: 0; 
          }
          ${contentSelector} {
            transform: rotate(180deg);
          }`;
                    break;
                }
                // DÃœZELTME: Type tanÄ±mÄ±na uygun olarak 'Top Center' yapÄ±ldÄ±
                case 'Top Center': {
                    styleContent = `
          ${selector} { 
            transform: rotate(180deg) translateX(-50%); 
            top: 0; 
            left: 50%; 
            transform-origin: left center; 
          }
          ${contentSelector} {
            transform: rotate(180deg);
          }`;
                    break;
                }
                // DÃœZELTME: Type tanÄ±mÄ±na uygun olarak 'Top Left' yapÄ±ldÄ±
                case 'Top Left': {
                    styleContent = `
          ${selector} { 
            transform: rotate(180deg); 
            top: 0; 
            left: 0; 
          }
          ${contentSelector} {
            transform: rotate(180deg);
          }`;
                    break;
                }
                default: {
                    styleContent = `${selector} { bottom: 20px; right: 20px; }`;
                }
            }
            styleContent += ` ${selector} { position: fixed; z-index: 99990; }`;
            let styleTag = document.getElementById('yuddy-reopen-button-styles');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'yuddy-reopen-button-styles';
                document.head.appendChild(styleTag);
            }
            styleTag.innerHTML = styleContent;
            // Add SVG icon to reopen button
            this.addSvgToReopenButton(wheelData);
        }
        /**
         * Add SVG icon to reopen button
         */
        addSvgToReopenButton(wheelData) {
            var reopenButton = this.getReopenButton();
            if (!reopenButton)
                return;
            const svgId = wheelData.template.openWheelSvgId;
            const svgColor = wheelData.template.reopenButtonSvgColor || '#fff';
            // Find or create SVG area
            let svgArea = reopenButton.querySelector('.yuddy-reopen-svg-area');
            if (!svgArea) {
                const reopenContent = reopenButton.querySelector('.yuddy-reopen-content');
                if (reopenContent) {
                    svgArea = document.createElement('div');
                    svgArea.className = 'yuddy-reopen-svg-area';
                    const textArea = reopenContent.querySelector('#yuddy-reopen-text-area');
                    if (textArea) {
                        reopenContent.insertBefore(svgArea, textArea);
                    }
                    else {
                        reopenContent.appendChild(svgArea);
                    }
                }
            }
            if (svgArea && svgId !== undefined) {
                const svgHtml = getReopenButtonSvg(svgId, svgColor);
                if (svgId === '-1' || svgHtml === undefined) {
                    // No icon or invalid icon ID
                    svgArea.style.display = 'none';
                }
                else {
                    svgArea.innerHTML = svgHtml;
                    svgArea.style.display = 'flex';
                }
            }
        }
        hideSidebar() {
            this.stopCountdown();
            const contentBox = document.getElementById('yuddy-reminder');
            if (contentBox) {
                contentBox.style.opacity = '0';
                contentBox.style.transform = 'translateX(-15px)';
            }
            setTimeout(() => {
                if (contentBox) {
                    contentBox.style.display = 'none';
                }
            }, 300);
        }
        showSidebar(spinResult) {
            const contentBox = document.getElementById('yuddy-reminder');
            if (contentBox) {
                contentBox.style.display = 'block';
                setTimeout(() => {
                    contentBox.style.opacity = '1';
                    contentBox.style.transform = 'translateX(0)';
                }, 10);
            }
            if (spinResult) {
                this.handleCountdown(spinResult);
            }
        }
        showReminderFromReopen(spinResult) {
            if (!spinResult)
                return false;
            const hasPromocode = spinResult.promocode && spinResult.promocode.toString().trim() !== '';
            if (!hasPromocode) {
                return false;
            }
            try {
                var sidebarElement = this.getSideBarElement();
                if (!sidebarElement)
                    return false;
                const sidebar = this.getSideBarElement();
                if (sidebar) {
                    sidebar.style.display = 'flex';
                    sidebar.style.visibility = 'visible';
                    const contentBox = document.getElementById('yuddy-reminder');
                    if (contentBox) {
                        contentBox.style.display = 'block';
                    }
                    // 2. Tab'Ä± GÄ°ZLEME KISMI SÄ°LÄ°NDÄ°
                    // const tab = this.getSideTabButton();
                    // if (tab) {
                    //   tab.style.setProperty('display', 'none', 'important');
                    // }
                    this.setupSidebarWithData(spinResult);
                    return this.handleCountdown(spinResult);
                }
                else {
                    return false;
                }
            }
            catch (error) {
                return false;
            }
        }
        setupSidebarWithData(data) {
            const sidebarElement = this.getSideBarElement();
            if (!sidebarElement)
                return;
            // 1. Ä°ndirim Kodunu YerleÅŸtir
            const discountCodeElement = sidebarElement.querySelector('#yuddy-discountCode');
            if (discountCodeElement && data.promocode) {
                discountCodeElement.textContent = data.promocode.toString();
            }
            const reminderTextElement = sidebarElement.querySelector('#yuddy-reminderText');
            if (reminderTextElement) {
                const heading = data.heading || 'Tebrikler!';
                reminderTextElement.innerHTML = `
        <div style="display:block; font-size: 13px; font-weight: 800; margin-bottom: 3px; line-height: 1.2; margin-top: 0; padding: 0;">
          ${heading}
        </div>
    
      `;
            }
            const reminderSubTextElement = sidebarElement.querySelector('#yuddy-reminderSubText');
            if (reminderSubTextElement) {
                const subText = data.text || 'Acele edinkuponukullanmak iÃ§in';
                reminderSubTextElement.innerHTML = `
       
        <div style="display:block; font-size: 11px; font-weight: 400; opacity: 0.9; line-height: 1.3; padding: 0;">
          ${subText}
        </div>
      `;
            }
            const tabElement = sidebarElement.querySelector('.yuddy-tab');
            if (tabElement) {
                tabElement.textContent = 'Yeni bir Ã¶dÃ¼l kazandÄ±n!';
                if (data.discountBadgeBackgroundColor) {
                    tabElement.style.backgroundColor = data.discountBadgeBackgroundColor;
                }
                else {
                    tabElement.style.backgroundColor = '#333333';
                }
                if (data.discountBadgeTextColor) {
                    tabElement.style.color = data.discountBadgeTextColor;
                }
                else {
                    tabElement.style.color = '#FFFFFF';
                }
            }
        }
        toggleSidebar(reminderLeft) {
            const sidebarElement = this.getSideBarElement();
            const reminderElement = sidebarElement === null || sidebarElement === void 0 ? void 0 : sidebarElement.querySelector('#yuddy-reminder');
            if (!sidebarElement || !reminderElement) {
                return reminderLeft;
            }
            const currentLeftStr = reminderElement.style.left || reminderLeft;
            const currentLeft = parseInt(currentLeftStr) || 0;
            const targetLeft = currentLeft === 0 ? -300 : 0;
            if (reminderElement.isAnimating || currentLeft === targetLeft) {
                return reminderLeft;
            }
            const steps = 20;
            const increment = (targetLeft - currentLeft) / steps;
            let step = 0;
            reminderElement.isAnimating = true;
            const animate = () => {
                if (step < steps) {
                    const newLeft = currentLeft + increment * step;
                    reminderElement.style.left = newLeft + 'px';
                    step++;
                    setTimeout(animate, 20);
                }
                else {
                    reminderElement.style.left = targetLeft + 'px';
                    reminderElement.isAnimating = false;
                    try {
                        localStorage.setItem('reminderLeft', targetLeft.toString());
                    }
                    catch (e) {
                        // 
                    }
                }
            };
            animate();
            return targetLeft.toString();
        }
        handleCountdown(data) {
            if (data.availableForDays === 0 || data.availableForDays === undefined) {
                this.updateCountdownDisplay(0, 0, 0, 0);
                try {
                    const sidebarElement = this.getSideBarElement();
                    if (sidebarElement) {
                        const countdownElement = sidebarElement.querySelector('#yuddy-countdown');
                        if (countdownElement)
                            countdownElement.style.display = 'none';
                    }
                }
                catch (e) {
                    // Ignore errors
                }
                return false;
            }
            this.stopCountdown();
            const now = new Date().getTime();
            let creationTime = now;
            if (data.createdAt) {
                creationTime = new Date(data.createdAt).getTime();
            }
            const expireTime = creationTime + (data.availableForDays * 24 * 60 * 60 * 1000);
            const updateCountdown = () => {
                const currentTime = new Date().getTime();
                const timeDiff = expireTime - currentTime;
                if (timeDiff <= 0) {
                    this.stopCountdown();
                    this.hideSidebar();
                    window.dispatchEvent(new CustomEvent('yuddy-wheel-expired'));
                    return false;
                }
                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                this.updateCountdownDisplay(days, hours, minutes, seconds);
                return true;
            };
            if (updateCountdown()) {
                this.countdownInterval = window.setInterval(updateCountdown, 1000);
                return true;
            }
            window.dispatchEvent(new CustomEvent('yuddy-wheel-expired'));
            return false;
        }
        stopCountdown() {
            if (this.countdownInterval !== null) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
            }
        }
        updateCountdownDisplay(days, hours, minutes, seconds) {
            const sidebarElement = this.getSideBarElement();
            if (!sidebarElement)
                return;
            const daysElement = sidebarElement.querySelector('#yuddy-days');
            const hoursElement = sidebarElement.querySelector('#yuddy-hours');
            const minutesElement = sidebarElement.querySelector('#yuddy-minutes');
            const secondsElement = sidebarElement.querySelector('#yuddy-seconds');
            if (daysElement)
                daysElement.textContent = days.toString().padStart(2, '0');
            if (hoursElement)
                hoursElement.textContent = hours.toString().padStart(2, '0');
            if (minutesElement)
                minutesElement.textContent = minutes.toString().padStart(2, '0');
            if (secondsElement)
                secondsElement.textContent = seconds.toString().padStart(2, '0');
        }
        isCurrentlySpinning() {
            return this.wheelRenderer.isCurrentlySpinning();
        }
        async animateSpin(spinResult) {
            return await this.wheelRenderer.animateSpin(spinResult);
        }
        /**
         * ModalÄ±n saÄŸ altÄ±na Yuddy logosunu ve linkini ekler.
         */
        addBrandingLogo() {
            const modalContainer = this.getWheelModalContainer();
            if (!modalContainer)
                return;
            // EÄŸer daha Ã¶nce eklendiyse tekrar ekleme
            if (modalContainer.querySelector('#yuddy-branding-logo'))
                return;
            const linkUrl = 'https://yuddy.com/';
            const imageUrl = 'https://media.licdn.com/dms/image/v2/D4D0BAQEqMI-jQQeOSQ/company-logo_200_200/company-logo_200_200/0/1714325250068/jjaliri_logo?e=2147483647&v=beta&t=YnSwc3N6M_EN6_aWXJRpplXEkjfkWS7dFYN8KO3v8Js';
            // Link elementini oluÅŸtur
            const link = document.createElement('a');
            link.id = 'yuddy-branding-logo';
            link.href = linkUrl;
            link.target = '_blank'; // Yeni sekmede aÃ§
            link.title = 'Powered by Yuddy';
            // Mobil ve masaÃ¼stÃ¼ ayrÄ±mÄ± iÃ§in stiller widget.css dosyasÄ±na taÅŸÄ±ndÄ±.
            // CSS Stillerini ver
            link.style.display = 'flex';
            link.style.alignItems = 'center';
            link.style.justifyContent = 'center';
            link.style.cursor = 'pointer';
            link.style.textDecoration = 'none';
            link.style.opacity = '0.9';
            link.style.transition = 'opacity 0.2s ease';
            // Hover efekti
            link.onmouseenter = () => { link.style.opacity = '1'; };
            link.onmouseleave = () => { link.style.opacity = '0.9'; };
            // Resim elementini oluÅŸtur
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Yuddy';
            img.style.height = '17px';
            img.style.width = '17px';
            img.style.display = 'block';
            img.style.marginRight = '4px';
            // Metin elementini oluÅŸtur
            const text = document.createElement('span');
            text.textContent = 'yuddy';
            text.style.fontSize = '10px';
            text.style.color = '#000';
            text.style.fontWeight = '500';
            text.style.textTransform = 'lowercase';
            link.appendChild(img);
            link.appendChild(text);
            modalContainer.appendChild(link);
        }
        cleanup() {
            this.stopCountdown();
        }
    }

    /**
     * Wheel-related cookie names
     */
    var WheelCookies;
    (function (WheelCookies) {
        WheelCookies["GLOBAL_WHEEL_CLOSE_BTN"] = "globalWheelCloseBtn";
        WheelCookies["GLOBAL_WHEEL_REOPEN_CLOSE_BTN"] = "globalWheelReopenCloseBtn";
        WheelCookies["YUDDY_BLOCKED_WHEEL"] = "yuddy_blocked_wheel";
        WheelCookies["YUDDY_EXIT_SUBMIT"] = "yuddy_exitSubmit";
        WheelCookies["YUDDY_EXIT_MODULE"] = "yuddy_exitModule";
        WheelCookies["YUDDY_SIDEBAR_CLOSED"] = "yuddy_sidebar_closed";
        // YUDDY_SIDEBAR_DISCOUNT_REMINDER = 'yuddy_sidebar_discount_reminder', //yuddy yan panel indirim hatÄ±rlatÄ±cÄ±sÄ±
    })(WheelCookies || (WheelCookies = {}));
    //TODO: [murat] buradaki sabitlere gÃ¶re kontrol edilecek
    /**
     * Array of all wheel cookie names for bulk operations
     */
    const WHEEL_COOKIE_NAMES = Object.values(WheelCookies);

    /**
     * Wheel-related localStorage keys
     */
    var WheelStorage;
    (function (WheelStorage) {
        WheelStorage["IS_GLOBAL_WHEEL_SUBMITTED"] = "isGlobalWheelSubmitted";
        WheelStorage["DISCOUNT_CODE_REMINDER"] = "discountCodeReminderData";
        WheelStorage["REMINDER_LEFT"] = "reminderLeft";
        WheelStorage["IKAS_VISITOR_ID"] = "ikas_visitor_id";
        WheelStorage["CUSTOMER_TOKEN"] = "customerToken";
        WheelStorage["YUDDY_SUB_FORM_DATA"] = "yuddySubFormData";
        WheelStorage["YUDDY_SUB"] = "yuddy_Sub";
        WheelStorage["YUDDY_EXIT_SUBMIT"] = "yuddy_exitSubmit";
    })(WheelStorage || (WheelStorage = {}));
    //TODO: [murat] buradaki sabitlere gÃ¶re kontrol edilecek
    /**
     * Array of all wheel localStorage keys for bulk operations
     */
    const WHEEL_STORAGE_KEYS = Object.values(WheelStorage);

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
         * Get cookie expiration date
         */
        getCookieExpirationDate(name) {
            const cookies = document.cookie.split('; ');
            for (const cookie of cookies) {
                const [cookieName] = cookie.split('=');
                if (cookieName === name) {
                    const cookieParts = cookie.split(';');
                    for (const part of cookieParts) {
                        const trimmedPart = part.trim();
                        if (trimmedPart.startsWith('expires=')) {
                            const expiresValue = trimmedPart.substring(8).trim();
                            return new Date(expiresValue);
                        }
                    }
                }
            }
            return null;
        }
        /**
         * Check if a time-based cookie has expired
         */
        isCookieExpired(name) {
            const value = this.getCookie(name);
            if (!value || value !== 'true') {
                return true;
            }
            const expirationDate = this.getCookieExpirationDate(name);
            if (expirationDate) {
                return new Date() > expirationDate;
            }
            return false;
        }
        /**
         * Set wheel closed cookie
         * 48 hours = 2 days
         */
        setWheelClosed(hours = 48) {
            this.setCookie(WheelCookies.GLOBAL_WHEEL_CLOSE_BTN, 'true', {
                expires: hours,
            });
        }
        /**
         * Set wheel reopen button closed cookie
         * 168 hours = 7 days
         */
        setWheelReopenClosed(hours = 168) {
            this.setCookie(WheelCookies.GLOBAL_WHEEL_REOPEN_CLOSE_BTN, 'true', {
                expires: hours,
            });
        }
        /**
         * Set blocked wheel cookie
         */
        setWheelBlocked(hours = 24) {
            this.setCookie(WheelCookies.YUDDY_BLOCKED_WHEEL, 'true', {
                expires: hours,
            });
        }
        /**
         * Set reminder panel cookie
         */
        setReminderShown(hours = 48) {
            //TODO: kullanÄ±lmÄ±yor ÅŸuan ama ileride kullanÄ±labilir
            // this.setCookie(WheelCookies.YUDDY_SIDEBAR_DISCOUNT_REMINDER, 'true', {
            //   expires: hours,
            // });
        }
        /**
         * Set exit submit cookie
         */
        setExitSubmitCookie(hours = 24) {
            this.setCookie(WheelCookies.YUDDY_EXIT_SUBMIT, 'true', {
                expires: hours,
            });
        }
        /**
         * Set YUDDY exit module cookie
         */
        setYUDDYExitModuleCookie(hours = 24) {
            this.setCookie(WheelCookies.YUDDY_EXIT_MODULE, 'true', {
                expires: hours,
            });
        }
        /**
         * Set YUDDY sidebar closed cookie
         */
        setYUDDYSidebarClosedCookie(hours = 24) {
            this.setCookie(WheelCookies.YUDDY_SIDEBAR_CLOSED, 'true', {
                expires: hours,
            });
        }
        /**
         * Set PH sidebar discount reminder cookie
         */
        setSidebarDiscountReminderCookie(hours = 48) {
            //TODO: kullanÄ±lmÄ±yor ÅŸuan ama ileride kullanÄ±labilir
            // this.setCookie(WheelCookies.YUDDY_SIDEBAR_DISCOUNT_REMINDER, 'true', {
            //   expires: hours,
            // });
        }
        /**
         * Check if wheel should be shown (not closed by user)
         */
        isExpiredGlobalWheelClose() {
            return this.isCookieExpired(WheelCookies.GLOBAL_WHEEL_CLOSE_BTN);
        }
        /**
         * Check if wheel should be shown (not closed by user)
         */
        isExpiredReopenClose() {
            return this.isCookieExpired(WheelCookies.GLOBAL_WHEEL_REOPEN_CLOSE_BTN);
        }
        /**
         * Check if wheel is blocked
         */
        isWheelBlocked() {
            return !this.isCookieExpired(WheelCookies.YUDDY_BLOCKED_WHEEL);
        }
        /**
         * Check if reminder should be shown
         */
        shouldShowReminder() {
            //TODO: kullanÄ±lmÄ±yor ÅŸuan ama ileride kullanÄ±labilir
            return true;
            // this.isCookieExpired(WheelCookies.YUDDY_SIDEBAR_DISCOUNT_REMINDER);
        }
        /**
         * Check if general reminder is expired
         */
        isReminderExpired() {
            //TODO: kullanÄ±lmÄ±yor ÅŸuan ama ileride kullanÄ±labilir
            return true;
            // this.isCookieExpired(WheelCookies.YUDDY_REMINDER);
        }
        /**
         * Get all cookies as an object
         */
        getAllCookies() {
            const cookies = {};
            document.cookie.split('; ').forEach(cookie => {
                const [name, value] = cookie.split('=');
                if (name && value) {
                    cookies[name] = decodeURIComponent(value);
                }
            });
            return cookies;
        }
        /**
         * Clear all wheel-related cookies
         */
        clear() {
            WHEEL_COOKIE_NAMES.forEach(cookieName => {
                this.deleteCookie(cookieName);
            });
        }
    }

    class CustomStorageManager {
        constructor() {
            this.localStorageSaved = false;
            this.localStorageAvailable = this.isLocalStorageAvailable();
            if (this.localStorageAvailable) {
                this.getData(); // Initialize and check existing data
            }
            else {
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
            catch (_a) {
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
                const data = localStorage.getItem(WheelStorage.YUDDY_SUB);
                if (!data)
                    return null;
                var dataParsed = JSON.parse(data);
                return dataParsed;
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
                localStorage.setItem(WheelStorage.YUDDY_SUB, JSON.stringify(data));
            }
            catch (error) {
                console.warn('Failed to save to localStorage:', error);
            }
        }
        /**
         * Save user data from wheel submission
         */
        saveUserData(userData) {
            if (!this.localStorageAvailable)
                return;
            const existingData = this.getData() || {};
            const updatedData = {
                ...existingData,
                cartUpdatedAt: new Date().toISOString(),
                fullName: userData.fullName || existingData.fullName,
                mobilePhone: userData.mobilePhone || existingData.mobilePhone,
                email: userData.email || existingData.email,
                isFormSubmitted: true,
                wheelFormSubmitted: true,
                wheelSubmittedAt: new Date().toISOString(),
                url: window.location.hostname.replace(/^www\./, ''),
            };
            // Preserve existing cart data
            if (!updatedData.cart) {
                updatedData.cart = [];
            }
            this.setData(updatedData);
        }
        /**
         * Check if user has already submitted the wheel
         */
        hasSubmittedWheel() {
            const data = this.getData();
            return !!((data === null || data === void 0 ? void 0 : data.wheelFormSubmitted) || (data === null || data === void 0 ? void 0 : data.isFormSubmitted));
        }
        /**
         * Get submission timestamp
         */
        getSubmissionDate() {
            const data = this.getData();
            if (data === null || data === void 0 ? void 0 : data.wheelSubmittedAt) {
                return new Date(data.wheelSubmittedAt);
            }
            return null;
        }
        /**
         * Update cart data
         */
        updateCart(cartData) {
            if (!this.localStorageAvailable)
                return;
            const existingData = this.getData() || {};
            const updatedData = {
                ...existingData,
                cart: cartData,
                cartUpdatedAt: new Date().toISOString(),
            };
            this.setData(updatedData);
        }
        /**
         * Set wheel submitted storage
         */
        setWheelSubmitted() {
            localStorage.setItem(WheelStorage.IS_GLOBAL_WHEEL_SUBMITTED, 'true');
        }
        /**
         * Check if wheel is submitted
         */
        isWheelSubmitted() {
            return (localStorage.getItem(WheelStorage.IS_GLOBAL_WHEEL_SUBMITTED) === 'true');
        }
        /**
         * Set YUDDY exit submit flag
         */
        setYUDDYExitSubmit() {
            if (!this.localStorageAvailable)
                return;
            localStorage.setItem(WheelStorage.YUDDY_EXIT_SUBMIT, 'true');
        }
        /**
         * Check if YUDDY exit submit is set
         */
        isYUDDYExitSubmitted() {
            if (!this.localStorageAvailable)
                return false;
            return localStorage.getItem(WheelStorage.YUDDY_EXIT_SUBMIT) === 'true';
        }
        /**
         * Get discount code reminder data
         */
        getDiscountCodeReminder() {
            if (!this.localStorageAvailable)
                return null;
            try {
                const data = localStorage.getItem(WheelStorage.DISCOUNT_CODE_REMINDER);
                return data ? JSON.parse(data) : null;
            }
            catch (error) {
                console.warn('Failed to parse discount code reminder data:', error);
                return null;
            }
        }
        /**
         * Set discount code reminder data
         */
        setDiscountCodeReminder(data) {
            if (!this.localStorageAvailable)
                return;
            try {
                localStorage.setItem(WheelStorage.DISCOUNT_CODE_REMINDER, JSON.stringify(data));
            }
            catch (error) {
                console.warn('Failed to save discount code reminder:', error);
            }
        }
        /**
         * Remove discount code reminder data
         */
        removeDiscountCodeReminder() {
            if (!this.localStorageAvailable)
                return;
            try {
                localStorage.removeItem(WheelStorage.DISCOUNT_CODE_REMINDER);
            }
            catch (error) {
                console.warn('Failed to remove discount code reminder:', error);
            }
        }
        /**
         * Get reminder left position
         */
        getReminderLeft() {
            if (!this.localStorageAvailable)
                return '0';
            return localStorage.getItem(WheelStorage.REMINDER_LEFT) || '0';
        }
        /**
         * Set reminder left position
         */
        setReminderLeft(value) {
            if (!this.localStorageAvailable)
                return;
            try {
                localStorage.setItem(WheelStorage.REMINDER_LEFT, value);
            }
            catch (error) {
                console.warn('Failed to save reminder left position:', error);
            }
        }
        /**
         * Get cart data
         */
        getCart() {
            const data = this.getData();
            return (data === null || data === void 0 ? void 0 : data.cart) || [];
        }
        /**
         * Clear all stored data
         */
        clear() {
            if (!this.localStorageAvailable)
                return;
            WHEEL_STORAGE_KEYS.forEach(key => {
                try {
                    localStorage.removeItem(key);
                }
                catch (error) {
                    console.warn(`Failed to remove localStorage key ${key}:`, error);
                }
            });
        }
        /**
         * Get stored user info
         */
        getUserInfo() {
            const data = this.getData();
            return {
                fullName: data === null || data === void 0 ? void 0 : data.fullName,
                mobilePhone: data === null || data === void 0 ? void 0 : data.mobilePhone,
                email: data === null || data === void 0 ? void 0 : data.email,
                storeName: data === null || data === void 0 ? void 0 : data.url,
            };
        }
        /**
         * Check if data is stale (older than specified days)
         */
        isDataStale(days = 30) {
            const data = this.getData();
            if (!(data === null || data === void 0 ? void 0 : data.cartUpdatedAt))
                return true;
            const lastUpdate = new Date(data.cartUpdatedAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > days;
        }
        /**
         * Get storage size in bytes
         */
        getStorageSize() {
            if (!this.localStorageAvailable)
                return 0;
            try {
                const data = localStorage.getItem(WheelStorage.YUDDY_SUB);
                return data ? new Blob([data]).size : 0;
            }
            catch (_a) {
                return 0;
            }
        }
        /**
         * Check if storage is enabled
         */
        isStorageEnabled() {
            return this.localStorageAvailable;
        }
        /**
         * Enable/disable storage
         */
        setStorageEnabled(enabled) {
            this.localStorageAvailable = enabled && this.isLocalStorageAvailable();
        }
    }

    class PlatformManager {
        /**
         * Detect e-commerce platform and user status
         */
        static async detectPlatform() {
            // Ticimax platform detection
            if (this.isTicimax()) {
                return {
                    platform: 'ticimax',
                    isLoggedIn: await this.checkTicimaxAuth(),
                    isMember: await this.checkTicimaxAuth(),
                };
            }
            // Shopify platform detection
            if (this.isShopify()) {
                const shopifyAuth = this.checkShopifyAuth();
                return {
                    platform: 'shopify',
                    isLoggedIn: shopifyAuth.isLoggedIn,
                    userId: shopifyAuth.userId,
                    isMember: shopifyAuth.isLoggedIn,
                };
            }
            // IdeasSoft platform detection
            if (this.isIdeasoft()) {
                const isMember = await this.checkIdeasoftAuth();
                return {
                    platform: 'ideasoft',
                    isLoggedIn: isMember === 1,
                    isMember: isMember === 1,
                };
            }
            // IKAS platform detection
            if (this.isIkas()) {
                const ikasAuth = this.checkIkasAuth();
                return {
                    platform: 'ikas',
                    isLoggedIn: ikasAuth,
                    isMember: ikasAuth,
                };
            }
            // Faprika platform detection
            if (this.isFaprika()) {
                return {
                    platform: 'faprika',
                    isLoggedIn: true,
                    isMember: true,
                };
            }
            // TSoft platform detection
            if (this.isTsoft()) {
                return {
                    platform: 'tsoft',
                    isLoggedIn: true,
                    isMember: true,
                };
            }
            // Default/Other platform
            return {
                platform: 'other',
                isLoggedIn: true,
                isMember: true,
            };
        }
        /**
         * Check if user should see wheel based on platform and settings
         */
        static async shouldShowForUserType(wheelData) {
            const platform = await this.detectPlatform();
            const showTo = wheelData.template.showTo || [];
            if (['faprika', 'tsoft', 'other'].includes(platform.platform)) {
                return true;
            }
            if (showTo.length === 0 || (showTo.includes('member') && showTo.includes('non-member'))) {
                return true;
            }
            if (platform.isMember && showTo.includes('member')) {
                return true;
            }
            if (!platform.isMember && showTo.includes('non-member')) {
                return true;
            }
            return false;
        }
        /**
         * Ticimax platform detection
         */
        static isTicimax() {
            return (document.querySelector('meta[name="generator"][content*="Ticimax"]') !==
                null ||
                window.location.hostname.includes('ticimax') ||
                window.TicimaxSettings !== undefined);
        }
        /**
         * Shopify platform detection
         */
        static isShopify() {
            return (window.Shopify !== undefined ||
                document.querySelector('script[src*="shopify"]') !== null ||
                document.querySelector('meta[name="shopify-checkout-api-token"]') !== null);
        }
        /**
         * IdeasSoft platform detection
         */
        static isIdeasoft() {
            return (window.IdeasoftSettings !== undefined ||
                document.querySelector('script[src*="ideasoft"]') !== null ||
                window.location.hostname.includes('ideasoft'));
        }
        /**
         * IKAS platform detection
         */
        static isIkas() {
            return (window.IKAS !== undefined ||
                document.querySelector('script[src*="ikas"]') !== null ||
                window.location.hostname.includes('ikas'));
        }
        /**
         * Faprika platform detection
         */
        static isFaprika() {
            return (window.location.hostname.includes('faprika') ||
                window.Faprika !== undefined);
        }
        /**
         * TSoft platform detection
         */
        static isTsoft() {
            return (window.location.hostname.includes('tsoft') ||
                window.TSoft !== undefined);
        }
        /**
         * Check Ticimax authentication status
         */
        static async checkTicimaxAuth() {
            //TODO: kontrol edilecek buradan mÄ± geliyor kullanÄ±cÄ± bilgisi
            try {
                // Check for Ticimax session cookies or user data
                const userCookie = document.cookie.includes('TicimaxUser');
                const authCookie = document.cookie.includes('TicimaxAuth');
                // Check for user data in DOM
                const userElement = document.querySelector('[data-user-id]');
                return userCookie || authCookie || userElement !== null;
            }
            catch (_a) {
                return false;
            }
        }
        /**
         * Check Shopify authentication status
         */
        static checkShopifyAuth() {
            var _a, _b;
            try {
                // Check Shopify customer object
                const shopify = window.Shopify;
                if (shopify && shopify.customer && shopify.customer.id) {
                    return {
                        isLoggedIn: true,
                        userId: shopify.customer.id.toString(),
                    };
                }
                // Check meta tag for customer ID
                const metaCustomer = (_b = (_a = window.meta) === null || _a === void 0 ? void 0 : _a.page) === null || _b === void 0 ? void 0 : _b.customerId;
                if (metaCustomer) {
                    return {
                        isLoggedIn: true,
                        userId: metaCustomer.toString(),
                    };
                }
                // Check for customer logged in class
                const customerLoggedIn = document.querySelector('.customer-logged-in');
                if (customerLoggedIn) {
                    return { isLoggedIn: true };
                }
                return { isLoggedIn: false };
            }
            catch (_c) {
                return { isLoggedIn: false };
            }
        }
        /**
         * Check IdeasSoft authentication status
         */
        static async checkIdeasoftAuth() {
            try {
                // Check for global isMember variable
                const isMember = window.isMember;
                if (typeof isMember === 'number') {
                    return isMember;
                }
                // Check user session cookies
                const sessionCookie = document.cookie.includes('IdeasoftSession');
                return sessionCookie ? 1 : 0;
            }
            catch (_a) {
                return 0;
            }
        }
        /**
         * Check IKAS authentication status
         */
        static checkIkasAuth() {
            try {
                const visitorId = window.localStorage.getItem(WheelStorage.IKAS_VISITOR_ID);
                const customerToken = window.localStorage.getItem(WheelStorage.CUSTOMER_TOKEN);
                return !!(visitorId && customerToken);
            }
            catch (_a) {
                return false;
            }
        }
        /**
         * Get platform-specific KVKK URL
         */
        static getKvkkUrl(platform, customUrl) {
            if (customUrl)
                return customUrl;
            switch (platform) {
                case 'ticimax':
                    return '/UyelikSozlesme.aspx?sozlemeTipi=5';
                default:
                    return '#';
            }
        }
        /**
         * Get platform-specific configuration
         */
        static getPlatformConfig(platform) {
            const configs = {
                ticimax: {
                    supportsMemberDetection: true,
                    requiresSpecialHandling: true,
                    kvkkUrl: '/UyelikSozlesme.aspx?sozlemeTipi=5',
                },
                shopify: {
                    supportsMemberDetection: true,
                    requiresSpecialHandling: true,
                    kvkkUrl: '#',
                },
                ideasoft: {
                    supportsMemberDetection: true,
                    requiresSpecialHandling: true,
                    kvkkUrl: '#',
                },
                ikas: {
                    supportsMemberDetection: true,
                    requiresSpecialHandling: true,
                    kvkkUrl: '#',
                },
                faprika: {
                    supportsMemberDetection: false,
                    requiresSpecialHandling: false,
                    kvkkUrl: '#',
                },
                tsoft: {
                    supportsMemberDetection: false,
                    requiresSpecialHandling: false,
                    kvkkUrl: '#',
                },
                other: {
                    supportsMemberDetection: false,
                    requiresSpecialHandling: false,
                    kvkkUrl: '#',
                },
            };
            return configs[platform] || configs.other;
        }
    }

    class WheelVisibilityManager {
        constructor(cookieManager) {
            this.cookieManager = cookieManager;
        }
        isDeviceCompatible(wheelData) {
            if (!wheelData)
                return false;
            const { deviceVisibility } = wheelData.template;
            const isMobile = window.screen.width < 768;
            return (deviceVisibility === 'All Devices' ||
                (deviceVisibility === 'Desktop Only' && !isMobile) ||
                (deviceVisibility === 'Mobile Only' && isMobile));
        }
        urlMatches(configUrl, currentUrl, currentPath) {
            const normalize = (url) => url.replace(/\/$/, '').toLowerCase();
            const normalizedConfigUrl = normalize(configUrl);
            const normalizedCurrentUrl = normalize(currentUrl);
            const normalizedCurrentPath = normalize(currentPath);
            if (normalizedConfigUrl === normalizedCurrentUrl)
                return true;
            try {
                if (configUrl.startsWith('http')) {
                    const configPath = normalize(new URL(configUrl).pathname);
                    return configPath === normalizedCurrentPath;
                }
            }
            catch (_a) {
                // Invalid URL, fallback to string comparison
            }
            return (normalizedCurrentPath.includes(normalizedConfigUrl) ||
                normalizedConfigUrl.includes(normalizedCurrentPath) ||
                normalizedCurrentUrl.includes(normalizedConfigUrl) ||
                normalizedConfigUrl.includes(normalizedCurrentUrl));
        }
        /**
         * Setup schedule checking
         */
        checkScheduleData(wheelData) {
            var _a;
            //zaman kÄ±sÄ±tÄ± yoksa devam etsin
            if (!((_a = wheelData.template.scheduleData) === null || _a === void 0 ? void 0 : _a.isScheduled)) {
                return true;
            }
            const scheduleData = wheelData.template.scheduleData;
            const now = new Date();
            const startDate = new Date(scheduleData.startDate);
            const startTime = scheduleData.startTime.split(':');
            startDate.setHours(parseInt(startTime[0]), parseInt(startTime[1]), 0, 0);
            const endDate = new Date(scheduleData.endDate);
            const endTime = scheduleData.endTime.split(':');
            endDate.setHours(parseInt(endTime[0]), parseInt(endTime[1]), 59, 999);
            // Check if current time is within schedule
            if (now < startDate || now > endDate) {
                // Zaman kÄ±sÄ±tÄ± yoksa devam etsin
                if (!scheduleData.isScheduleShownAllDay) {
                    return false;
                }
            }
            return true;
        }
        /**
         * Setup blocked words checking
         */
        checkBlockedWords(wheelData) {
            if (this.cookieManager.isWheelBlocked()) {
                return false;
            }
            const blockedWords = wheelData.template.blockedWords;
            if (!blockedWords ||
                !Array.isArray(blockedWords) ||
                blockedWords.length === 0) {
                return true;
            }
            // Check URL and page content for blocked words
            const currentUrl = window.location.href.toLowerCase();
            const currentHostname = window.location.hostname.toLowerCase();
            const pageContent = document.body.innerText.toLowerCase();
            for (const word of blockedWords) {
                const normalizedWord = word.toLowerCase().trim();
                if (!normalizedWord)
                    continue;
                // Check for comparison shopping sites
                if (['akakce', 'cimri', 'epey', 'enuygun'].includes(normalizedWord)) {
                    if (currentHostname.includes(normalizedWord) ||
                        currentHostname.includes(`${normalizedWord}.com`) ||
                        currentHostname.includes(`www.${normalizedWord}.com`)) {
                        this.blockWheel(normalizedWord);
                        return false;
                    }
                }
                // Check URL
                if (currentUrl.includes(normalizedWord)) {
                    this.blockWheel(normalizedWord);
                    return false;
                }
                // Check page content with word boundaries
                try {
                    const regex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
                    if (regex.test(pageContent)) {
                        this.blockWheel(normalizedWord);
                        return false;
                    }
                }
                catch (_a) {
                    // Fallback to simple includes check
                    if (pageContent.includes(normalizedWord)) {
                        this.blockWheel(normalizedWord);
                        return false;
                    }
                }
            }
            return true;
        }
        /**
         * Block wheel due to blocked word detection
         */
        blockWheel(blockedWord) {
            if (typeof window !== 'undefined' && window.console) {
                window.console.warn(`Wheel blocked due to detected word: ${blockedWord}`);
            }
            // Set blocking cookie for 24 hours
            this.cookieManager.setWheelBlocked();
        }
        /**
         * URL monitoring for single page applications
         */
        setupUrlMonitoring(wheelData, onUrlChange) {
            let currentUrl = window.location.href;
            // Monitor URL changes for SPAs
            const checkUrlChange = () => {
                if (window.location.href !== currentUrl) {
                    currentUrl = window.location.href;
                    onUrlChange();
                }
            };
            // Listen to popstate events (back/forward navigation)
            window.addEventListener('popstate', checkUrlChange);
            // Monitor pushState and replaceState
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            history.pushState = function (...args) {
                originalPushState.apply(history, args);
                setTimeout(checkUrlChange, 0);
            };
            history.replaceState = function (...args) {
                originalReplaceState.apply(history, args);
                setTimeout(checkUrlChange, 0);
            };
            // Periodic check as fallback
            setInterval(checkUrlChange, 1000);
        }
        /**
         * Device-specific visibility checking
         */
        checkDeviceVisibility(deviceVisibility) {
            const isMobile = window.screen.width < 768;
            switch (deviceVisibility) {
                case 'Desktop Only':
                    return !isMobile;
                case 'Mobile Only':
                    return isMobile;
                case 'All Devices':
                default:
                    return true;
            }
        }
        /**
         * Page visibility checking
         */
        checkCurrentPageVisibility(wheelData) {
            const currentUrl = window.location.href;
            const currentPath = window.location.pathname;
            const displayPages = wheelData.template.visibilityDisplayOnPages;
            const hiddenPages = wheelData.template.visibilityHiddenOnPages;
            // Check hidden pages first
            if (hiddenPages === 'HomePage') {
                const isHomePage = this.isHomePage(currentPath, currentUrl);
                if (isHomePage)
                    return false;
            }
            else if (hiddenPages === 'SpecificPages') {
                const hiddenUrls = wheelData.template.hiddenPageUrls || [];
                if (hiddenUrls.some(url => this.urlMatches(url, currentUrl, currentPath))) {
                    return false;
                }
            }
            //TODO: burada reopenButtonLocation Ã§alÄ±ÅŸtÄ±rmalÄ± mÄ±yÄ±z?
            // Check display pages
            if (displayPages === 'AllPages') {
                return true;
            }
            else if (displayPages === 'HomePage') {
                return this.isHomePage(currentPath, currentUrl);
            }
            else if (displayPages === 'SpecificPages') {
                const shownUrls = wheelData.template.shownPageUrls || [];
                return shownUrls.some(url => this.urlMatches(url, currentUrl, currentPath));
            }
            return true;
        }
        /**
         * Check if current page is homepage
         */
        isHomePage(path, url) {
            return (path === '/' ||
                path === '/index' ||
                path === '/index.html' ||
                path === '/home' ||
                path === '' ||
                url === window.location.origin + '/' ||
                url === window.location.origin);
        }
        /**
         * Template-based color scheme calculation
         */
        calculateTemplateColors(templateId) {
            const colorSchemes = {
                0: ['#f8ea89', '#49dac3'],
                1: ['#fa6db9', '#feffff'],
                2: ['#ca220d', '#feffff'],
                3: ['#a479c1', '#e7ca5e'],
                4: ['#0083e1', '#b7b7b7'],
                5: ['#f02114', '#feffff'],
                6: ['#1b4b7f', '#feffff'],
                7: ['#b45252', '#e7cb60'],
                8: ['#ca220d', '#feffff'],
                9: ['#eca330', '#feffff'],
                10: ['#eca330', '#feffff'],
                11: ['#864a3c', '#adadac'],
            };
            return colorSchemes[templateId] || colorSchemes[0];
        }
    }

    class FortuneWheel {
        constructor() {
            this.wheelData = null;
            this.isInitialized = false;
            this.apiBaseUrl = "https://api.yuddy.com/api/v1/engagements/global-wheel";
            // Popup trigger states
            this.exitIntentEnabled = false;
            this.scrollTriggerEnabled = false;
            // TÃ¼m yÃ¶neticileri baÅŸlat
            this.storageManager = new CustomStorageManager();
            this.cookieManager = new CookieManager();
            this.apiClient = new APIClient(this.apiBaseUrl);
            this.validator = new Validator();
            this.domManager = new DOMManager();
            this.wheelVisibilityManager = new WheelVisibilityManager(this.cookieManager);
            window.addEventListener('yuddy-wheel-expired', () => {
                this.resetAndShowWheel();
            });
            this.initializeFortuneWheel();
        }
        /**
         * DOM hazÄ±r olduÄŸunda `init`'i tetikler
         */
        initializeFortuneWheel() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            }
            else {
                this.init();
            }
        }
        /**
         * Ana baÅŸlatma fonksiyonu
         */
        async init() {
            try {
                if (this.isInitialized)
                    return;
                await this.initHtml();
                this.setupUrlChangeMonitor();
                this.setupPageChangeListeners();
                this.checkAndShowSidebarFromCookie();
                this.isInitialized = true;
            }
            catch (error) {
                this.handleError(error);
            }
        }
        /**
         * Veriyi Ã§eker, kurallarÄ± kontrol eder ve Ã§arkÄ± gÃ¶stermek iÃ§in tetikleyiciyi kurar.
         */
        async initHtml() {
            this.wheelData = await this.apiClient.getWheelData(window.location.hostname);
            if (!this.wheelData) {
                throw new WheelError$1('Failed to load demo configuration');
            }
            // Set validation rules based on field visibility
            this.validator.setValidationRules(this.wheelData.template.phoneNumberVisibility, this.wheelData.template.emailVisibility, this.wheelData.useNameArea);
            if (!this.wheelVisibilityManager.checkScheduleData(this.wheelData)) {
                return;
            }
            if (!this.wheelVisibilityManager.checkBlockedWords(this.wheelData)) {
                return;
            }
            if (!this.wheelVisibilityManager.checkCurrentPageVisibility(this.wheelData)) {
                return;
            }
            if (!this.wheelVisibilityManager.isDeviceCompatible(this.wheelData)) {
                return;
            }
            if (!(await PlatformManager.shouldShowForUserType(this.wheelData))) {
                return;
            }
            this.initializeBasedOnTrigger();
        }
        /**
         * Ã‡arkÄ± gÃ¶stermesi gereken tetikleyiciyi (anÄ±nda, gecikmeli vb.) ayarlar.
         */
        initializeBasedOnTrigger() {
            if (!this.wheelData)
                return;
            const popupStatus = this.wheelData.template.popupStatus;
            const showWheelAction = () => this.setupAndShowWheel();
            switch (popupStatus.name) {
                case 'On Exit Intent':
                    this.setupExitIntent(showWheelAction);
                    break;
                case 'On Scroll':
                    this.setupScrollTrigger(showWheelAction);
                    break;
                case 'After Delay':
                    this.setupDelayTrigger(showWheelAction);
                    break;
                case 'Instantly':
                default:
                    showWheelAction();
                    break;
            }
        }
        async setupAndShowWheel() {
            try {
                if (!this.wheelData)
                    throw new Error('wheelData yÃ¼klenemedi..');
                await this.domManager.init(this.wheelData);
                this.setupEventListeners();
                if (this.storageManager.isWheelSubmitted()) {
                    const discountCodeReminder = this.storageManager.getDiscountCodeReminder();
                    const hasPromocode = discountCodeReminder && discountCodeReminder.promocode && discountCodeReminder.promocode.toString().trim() !== '';
                    if (discountCodeReminder && hasPromocode) {
                        var hasDiscountCodeReminder = this.domManager.showReminderFromReopen(discountCodeReminder);
                        if (!hasDiscountCodeReminder) {
                            this.storageManager.removeDiscountCodeReminder();
                        }
                    }
                    else {
                        this.domManager.hideReopenButton();
                        return;
                    }
                }
                else {
                    this.showWheelOrReopenButton();
                }
            }
            catch (error) {
                this.handleError(error);
            }
        }
        showWheelOrReopenButton() {
            if (this.cookieManager.isExpiredGlobalWheelClose()) {
                this.domManager.showWheel();
            }
            else if (this.cookieManager.isExpiredReopenClose()) {
                this.domManager.showReopenButton();
            }
        }
        setupEventListeners() {
            var _a;
            this.setupRealTimeFormValidationEvents();
            this.domManager.getWheelSpinButton().addEventListener('click', async () => {
                try {
                    await this.wheelSpin();
                }
                catch (error) {
                    this.handleError(error);
                }
            });
            this.domManager.getWheelCloseButton().addEventListener('click', () => {
                this.domManager.hideWheel();
                this.cookieManager.setWheelClosed();
                this.cookieManager.setWheelReopenClosed(-1);
                if (this.storageManager.isWheelSubmitted()) {
                    const discountCodeReminder = this.storageManager.getDiscountCodeReminder();
                    const hasPromocode = discountCodeReminder && discountCodeReminder.promocode && discountCodeReminder.promocode.toString().trim() !== '';
                    if (hasPromocode) {
                        this.domManager.showReminderFromReopen(discountCodeReminder);
                    }
                    else {
                        this.domManager.hideReopenButton();
                    }
                }
                else {
                    this.domManager.showReopenButton();
                }
            });
            this.domManager.getReopenButton().addEventListener('click', () => {
                this.cookieManager.setWheelClosed(-1);
                this.domManager.hideReopenButton();
                this.domManager.showWheel();
            });
            this.domManager
                .getReopenCloseButton()
                .addEventListener('click', (e) => {
                e.stopPropagation();
                this.domManager.hideReopenButton();
                this.cookieManager.setWheelReopenClosed();
            });
            this.domManager.getWheelResultCopyButton().addEventListener('click', e => {
                const yuddyPromotionCode = this.domManager
                    .getWheelResultContent()
                    .querySelector('#yuddy-coupon-code');
                this.copyToClipboard(yuddyPromotionCode.textContent, e.target);
            });
            this.domManager.getSideBarCodeElement().addEventListener('click', e => {
                var _a;
                const yuddyPromotionCode = this.domManager.getSideBarCodeElement();
                this.copyToClipboard((_a = yuddyPromotionCode === null || yuddyPromotionCode === void 0 ? void 0 : yuddyPromotionCode.textContent) !== null && _a !== void 0 ? _a : '', e.target);
            });
            (_a = this.domManager
                .getSideBarCloseButton()) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (e) => {
                e.preventDefault();
                this.domManager.hideSidebar();
                this.cookieManager.setYUDDYSidebarClosedCookie();
            });
            this.domManager.getSideTabButton().addEventListener('click', () => {
                const spinResult = this.storageManager.getDiscountCodeReminder();
                this.domManager.showSidebar(spinResult);
                this.cookieManager.setYUDDYSidebarClosedCookie(-1);
            });
        }
        copyToClipboard(text, buttonElement) {
            if (buttonElement.textContent === 'KopyalandÄ±!') {
                return;
            }
            navigator.clipboard
                .writeText(text)
                .then(() => {
                const originalText = buttonElement.textContent;
                buttonElement.textContent = 'KopyalandÄ±!';
                if (buttonElement instanceof HTMLButtonElement) {
                    buttonElement.disabled = true;
                }
                setTimeout(() => {
                    buttonElement.textContent = originalText;
                    if (buttonElement instanceof HTMLButtonElement) {
                        buttonElement.disabled = false;
                    }
                }, 2000);
            })
                .catch(() => {
                this.domManager.showWheelFormError('KopyalanamadÄ±!');
            });
        }
        setupRealTimeFormValidationEvents() {
            var _a, _b, _c;
            const isNameVisible = (_a = this.wheelData) === null || _a === void 0 ? void 0 : _a.useNameArea;
            const isEmailVisible = (_b = this.wheelData) === null || _b === void 0 ? void 0 : _b.template.emailVisibility;
            const isPhoneVisible = (_c = this.wheelData) === null || _c === void 0 ? void 0 : _c.template.phoneNumberVisibility;
            if (isNameVisible) {
                const nameInput = this.domManager.getWheelFormNameInput();
                if (nameInput) {
                    nameInput.addEventListener('input', () => {
                        const value = nameInput.value.trim();
                        let errorMsg = '';
                        if (value && value.length < 2) {
                            errorMsg = 'Ä°sim en az 2 karakter olmalÄ±dÄ±r.';
                        }
                        else if (value && value.length > 50) {
                            errorMsg = 'Ä°sim en fazla 50 karakter olabilir.';
                        }
                        else if (value && !/^[a-zA-ZÃ§Ã‡ÄŸÄÄ±Ä°Ã¶Ã–ÅŸÅÃ¼Ãœ\s]*$/.test(value)) {
                            errorMsg = 'Ad soyad sadece harf ve boÅŸluk iÃ§erebilir.';
                        }
                        if (errorMsg) {
                            this.domManager.showWheelFormError(errorMsg);
                        }
                        else {
                            this.domManager.hideWheelFormError();
                        }
                    });
                    nameInput.addEventListener('blur', () => {
                        const value = nameInput.value.trim();
                        const nameParts = value.split(/\s+/).filter(part => part.length > 0);
                        if (value && nameParts.length < 2) {
                            this.domManager.showWheelFormError('LÃ¼tfen ad ve soyadÄ±nÄ±zÄ± giriniz.');
                        }
                    });
                }
            }
            // Phone input validation and formatting
            if (isPhoneVisible) {
                const phoneInput = this.domManager.getWheelFormPhoneInput();
                if (phoneInput) {
                    phoneInput.addEventListener('input', () => {
                        let value = phoneInput.value;
                        let digits = value.replace(/\D/g, '');
                        let errorMsg = '';
                        // Check for non-numeric characters
                        if (/[^0-9\s]/.test(value)) {
                            errorMsg = 'Telefon numarasÄ± yalnÄ±zca rakamlardan oluÅŸmalÄ±dÄ±r.';
                        }
                        // Check if starts with 5
                        if (digits.length > 0 && !digits.startsWith('5')) {
                            digits = '';
                            errorMsg =
                                'Telefon numarasÄ± 5 ile baÅŸlamalÄ±dÄ±r (Ã¶rneÄŸin: 535xxxxxxx).';
                        }
                        // Format as: 5xx xxx xx xx
                        let formatted = '';
                        if (digits.length > 0) {
                            formatted = digits.substring(0, 3);
                        }
                        if (digits.length > 3) {
                            formatted += ' ' + digits.substring(3, 6);
                        }
                        if (digits.length > 6) {
                            formatted += ' ' + digits.substring(6, 8);
                        }
                        if (digits.length > 8) {
                            formatted += ' ' + digits.substring(8, 10);
                        }
                        phoneInput.value = formatted;
                        if (errorMsg) {
                            this.domManager.showWheelFormError(errorMsg);
                        }
                        else {
                            this.domManager.hideWheelFormError();
                        }
                    });
                }
            }
            // Email input validation
            if (isEmailVisible) {
                const emailInput = this.domManager.getWheelFormEmailInput();
                if (emailInput) {
                    emailInput.addEventListener('input', () => {
                        const value = emailInput.value.trim();
                        let errorMsg = '';
                        if (value.length >= 2) {
                            if (value.includes('@')) {
                                const parts = value.split('@');
                                if (parts.length === 2 && parts[1].length > 0) {
                                    if (parts[1].includes('.')) {
                                        const domainParts = parts[1].split('.');
                                        if (domainParts[1].length === 0) {
                                            errorMsg = 'LÃ¼tfen mailinizi tam giriniz.';
                                        }
                                    }
                                    else {
                                        errorMsg = 'LÃ¼tfen mailinizi tam giriniz.';
                                    }
                                }
                                else {
                                    errorMsg = 'LÃ¼tfen mailinizi tam giriniz.';
                                }
                            }
                            else {
                                errorMsg = 'LÃ¼tfen mailinizi tam giriniz.';
                            }
                        }
                        if (errorMsg) {
                            this.domManager.showWheelFormError(errorMsg);
                        }
                        else {
                            this.domManager.hideWheelFormError();
                        }
                    });
                }
            }
        }
        async wheelSpin() {
            if (!this.wheelData) {
                throw new WheelError$1('Wheel not initialized');
            }
            const userData = this.domManager.getUserFormData();
            if (!userData) {
                throw new WheelError$1('User data not found');
            }
            if (this.domManager.isCurrentlySpinning()) {
                return;
            }
            this.domManager.hideWheelFormError();
            const validationResult = this.validator.validateUserData(userData);
            if (!validationResult.isValid) {
                const errorMessage = validationResult.errors.join('<br/>');
                this.domManager.showWheelFormError(errorMessage);
                return;
            }
            try {
                const result = await this.apiClient.spin(userData);
                await this.domManager.animateSpin(result);
                this.domManager.buildResultPanel(result);
                this.storageManager.setDiscountCodeReminder(result);
                this.cookieManager.setSidebarDiscountReminderCookie(48);
                this.storageManager.saveUserData(userData);
                this.storageManager.setWheelSubmitted();
            }
            catch (error) {
                const errorMessage = error.message || 'Bilinmeyen bir hata oluÅŸtu.';
                this.domManager.showWheelFormError(errorMessage);
                if (!(error instanceof WheelError$1 &&
                    error.message.startsWith('Validation failed'))) {
                    this.handleError(error);
                }
            }
        }
        checkAndShowSidebarFromCookie() {
            if (!this.storageManager.isWheelSubmitted()) {
                return;
            }
            const discountCodeReminder = this.storageManager.getDiscountCodeReminder();
            if (!discountCodeReminder) {
                this.storageManager.removeDiscountCodeReminder();
                return;
            }
            const hasPromocode = discountCodeReminder.promocode && discountCodeReminder.promocode.toString().trim() !== '';
            if (!hasPromocode) {
                const availableDays = discountCodeReminder.availableForDays;
                if (typeof availableDays === 'number' && availableDays > 0) {
                    const now = new Date().getTime();
                    let creationTime = now;
                    if (discountCodeReminder.createdAt) {
                        creationTime = new Date(discountCodeReminder.createdAt).getTime();
                    }
                    const expireTime = creationTime + (availableDays * 24 * 60 * 60 * 1000);
                    if (now > expireTime) {
                        this.resetAndShowWheel();
                        return;
                    }
                }
                return;
            }
            const sidebarReady = this.domManager.showReminderFromReopen(discountCodeReminder);
            if (!sidebarReady) {
                this.resetAndShowWheel();
                return;
            }
            const isSidebarClosed = !this.cookieManager.isCookieExpired(WheelCookies.YUDDY_SIDEBAR_CLOSED);
            if (isSidebarClosed) {
                this.domManager.hideSidebar();
            }
            else {
                this.domManager.showSidebar(discountCodeReminder);
            }
        }
        setupPageChangeListeners() {
            window.addEventListener('popstate', () => {
                this.handlePageChange();
            });
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            history.pushState = function (data, unused, url) {
                originalPushState.call(history, data, unused, url);
                window.dispatchEvent(new Event('pushstate'));
            };
            history.replaceState = function (data, unused, url) {
                originalReplaceState.call(history, data, unused, url);
                window.dispatchEvent(new Event('replacestate'));
            };
            window.addEventListener('pushstate', () => {
                this.handlePageChange();
            });
            window.addEventListener('replacestate', () => {
                this.handlePageChange();
            });
            let currentHref = window.location.href;
            let currentPathname = window.location.pathname;
            const checkLocationChange = () => {
                const newHref = window.location.href;
                const newPathname = window.location.pathname;
                if (newHref !== currentHref || newPathname !== currentPathname) {
                    currentHref = newHref;
                    currentPathname = newPathname;
                    setTimeout(() => this.handlePageChange(), 100);
                }
            };
            const pageChangeInterval = setInterval(checkLocationChange, 200);
            window.globalWheelPageChangeInterval = pageChangeInterval;
            document.addEventListener('click', (event) => {
                const target = event.target;
                const link = target.closest('a');
                if (link && link.href && link.href !== window.location.href) {
                    setTimeout(checkLocationChange, 200);
                }
            });
        }
        setupUrlChangeMonitor() {
            let currentUrl = window.location.href;
            const intervalId = setInterval(() => {
                const newUrl = window.location.href;
                if (newUrl !== currentUrl) {
                    currentUrl = newUrl;
                    if (this.wheelData &&
                        this.wheelVisibilityManager.checkBlockedWords(this.wheelData)) {
                        this.domManager.hideWheel();
                    }
                    else {
                        setTimeout(() => this.handlePageChange(), 100);
                    }
                }
            }, 500);
            window.globalWheelUrlInterval = intervalId;
        }
        // src/core/fortune-wheel.ts
        handlePageChange() {
            if (!this.wheelData || !this.isInitialized) {
                return;
            }
            const isSubmitted = this.storageManager.isWheelSubmitted();
            const shouldShowOnPage = this.wheelVisibilityManager.checkCurrentPageVisibility(this.wheelData);
            if (shouldShowOnPage) {
                if (!isSubmitted && !this.domManager.isWheelVisible()) {
                    if (this.cookieManager.isExpiredReopenClose()) {
                        this.domManager.showReopenButton();
                    }
                    else {
                        this.domManager.hideReopenButton();
                    }
                }
            }
            else {
                this.domManager.hideWheelOnly();
                this.domManager.hideReopenButton();
            }
        }
        handleError(error) {
            throw new WheelError$1(error.message);
        }
        setupExitIntent(callback) {
            if (this.exitIntentEnabled)
                return;
            this.exitIntentEnabled = true;
            let hasTriggered = false;
            // Check if exit intent was already triggered
            const exitSubmit = this.storageManager.isYUDDYExitSubmitted();
            const exitModuleCookie = this.cookieManager.getCookie(WheelCookies.YUDDY_EXIT_MODULE);
            if (exitSubmit || exitModuleCookie === 'true') {
                return; // Exit intent already triggered
            }
            const handleMouseMove = (event) => {
                // Trigger when mouse moves to top of page (exit intent)
                if (event.clientY <= 5 && !hasTriggered) {
                    hasTriggered = true;
                    this.storageManager.setYUDDYExitSubmit();
                    this.cookieManager.setYUDDYExitModuleCookie(24);
                    callback(); // ModalÄ± gÃ¶ster
                    this.cleanupExitIntent();
                }
            };
            const handleVisibilityChange = () => {
                // Trigger when tab becomes hidden (user switching tabs)
                if (document.visibilityState === 'hidden' && !hasTriggered) {
                    const exitSubmitCheck = this.storageManager.isYUDDYExitSubmitted();
                    const exitModuleCookieCheck = this.cookieManager.getCookie(WheelCookies.YUDDY_EXIT_MODULE);
                    if (!exitSubmitCheck && exitModuleCookieCheck !== 'true') {
                        hasTriggered = true;
                        this.storageManager.setYUDDYExitSubmit();
                        this.cookieManager.setYUDDYExitModuleCookie(24);
                        callback(); // ModalÄ± gÃ¶ster
                        this.cleanupExitIntent();
                    }
                }
            };
            window.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('visibilitychange', handleVisibilityChange);
            // Store cleanup function
            this.exitIntentCleanup = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
        setupScrollTrigger(callback) {
            if (!this.wheelData || this.scrollTriggerEnabled)
                return;
            this.scrollTriggerEnabled = true;
            const featureValue = this.wheelData.template.popupStatus.feature;
            if (!featureValue)
                return;
            const scrollPercentage = parseFloat(featureValue);
            if (isNaN(scrollPercentage))
                return;
            let hasTriggered = false;
            const handleScroll = () => {
                if (hasTriggered)
                    return;
                const scrollTop = window.scrollY;
                const documentHeight = document.body.scrollHeight - window.innerHeight;
                const currentScrollPercentage = (scrollTop / documentHeight) * 100;
                if (currentScrollPercentage >= scrollPercentage) {
                    hasTriggered = true;
                    callback(); // ModalÄ± gÃ¶ster
                    this.cleanupScrollTrigger();
                }
            };
            window.addEventListener('scroll', handleScroll);
            // Store cleanup function
            this.scrollEventCleanup = () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }
        setupDelayTrigger(callback) {
            if (!this.wheelData)
                return;
            const featureValue = this.wheelData.template.popupStatus.feature;
            if (!featureValue)
                return;
            const delayMatch = featureValue.match(/\d+/);
            const delaySeconds = delayMatch ? parseInt(delayMatch[0], 10) : 0;
            if (isNaN(delaySeconds) || delaySeconds <= 0)
                return;
            setTimeout(() => {
                callback(); // ModalÄ± gÃ¶ster
            }, delaySeconds * 1000);
        }
        cleanupExitIntent() {
            if (this.exitIntentCleanup) {
                this.exitIntentCleanup();
                this.exitIntentCleanup = undefined;
            }
        }
        cleanupScrollTrigger() {
            if (this.scrollEventCleanup) {
                this.scrollEventCleanup();
                this.scrollEventCleanup = undefined;
            }
        }
        // src/core/fortune-wheel.ts -> SÄ±nÄ±fÄ±n iÃ§ine ekle
        /**
         * SÃ¼re dolduÄŸunda her ÅŸeyi temizler ve Ã§arkÄ± yeniden baÅŸlatÄ±r.
         */
        resetAndShowWheel() {
            // 1. HafÄ±zayÄ± Temizle
            this.storageManager.removeDiscountCodeReminder();
            this.storageManager.clear();
            // 2. Cookie'leri Sil
            this.cookieManager.setWheelClosed(-1);
            this.cookieManager.setWheelReopenClosed(-1);
            this.cookieManager.setYUDDYSidebarClosedCookie(-1);
            // 3. GÃ¶rsel Temizlik
            this.domManager.hideSidebar();
            // 4. Yeniden BaÅŸlat (Ã‡arkÄ± gÃ¶ster)
            this.showWheelOrReopenButton();
        }
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

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

    var css_248z$1 = "/* Global Wheel Widget Styles - Clean and optimized */\n\n/* Sidebar styles that are actually used */\n.yuddy-sidebar {\n  position: fixed !important;\n  top: 50% !important;\n  left: 50px !important;\n  transform: translateY(-50%) !important;\n  width: 250px !important;\n  z-index: 9999 !important;\n  font-family: Arial, sans-serif !important;\n}\n\n#yuddy-reminder {\n  position: absolute !important;\n  top: 0px !important;\n  left: 0 !important;\n  height: 200px !important;\n  width: 250px !important;\n  background-color: #f4f1eb !important;\n  color: #000 !important;\n  padding: 0 !important;\n  border-radius: 0 8px 8px 0 !important;\n  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2) !important;\n  text-align: center !important;\n  transition: opacity 0.3s ease-out, transform 0.3s ease-out, left 0.3s ease !important;\n  overflow: hidden !important;\n  box-sizing: border-box !important;\n}\n\n.yuddy-tab {\n  position: absolute !important;\n  top: 0 !important;\n  left: 0 !important;\n  width: 200px !important;\n  height: 50px !important;\n  display: flex !important;\n  justify-content: center !important;\n  align-items: center !important;\n  border-radius: 0 !important;\n  transform: rotate(90deg) !important;\n  transform-origin: top left !important;\n  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2) !important;\n  cursor: pointer !important;\n  font-weight: bold !important;\n  font-size: 14px !important;\n  z-index: 99 !important;\n  transition: opacity 0.3s ease-out, transform 0.3s ease-out;\n}\n\n.yuddy-reminder-content {\n  padding: 10px 15px 12px 15px !important;\n  color: #000 !important;\n  text-align: center !important;\n  position: relative !important;\n  height: 100% !important;\n  display: flex !important;\n  flex-direction: column !important;\n  justify-content: space-between!important;\n  box-sizing: border-box !important;\n  overflow: hidden !important;\n}\n\n#yuddy-reminderText {\n  display: flex !important;\n  flex-direction: column !important;\n  width: 100% !important;\n  justify-content: flex-start !important;\n  align-items: center !important;\n  font-size: 11px !important;\n  font-weight: 600 !important;\n  margin: 0 0 8px 0 !important;\n  line-height: 1.3 !important;\n  color: #000 !important;\n  padding: 0 !important;\n  flex-shrink: 0 !important;\n}\n\n#yuddy-discountCode {\n  color: #000 !important;\n  font-size: 9px !important;\n  border: 2px dashed #000 !important;\n  border-radius: 6px !important;\n  padding: 6px 8px !important;\n  text-align: center !important;\n  margin: 0 0 8px 0 !important;\n  cursor: pointer !important;\n  background: transparent !important;\n  transition: all 0.3s ease !important;\n  width: 100% !important;\n  box-sizing: border-box !important;\n  flex-shrink: 0 !important;\n  white-space: nowrap !important;\n  overflow: hidden !important;\n  text-overflow: ellipsis !important;\n}\n\n#yuddy-discountCode:hover {\n  background: rgba(0, 0, 0, 0.1) !important;\n  transform: scale(1.05) !important;\n}\n\n#yuddy-countdown {\n  display: flex !important;\n  justify-content: center !important;\n  align-items: center !important;\n  margin: 0 !important;\n  gap: 4px !important;\n  color: #000 !important;\n  flex-shrink: 0 !important;\n  flex-grow: 0 !important;\n}\n\n.countdown-item {\n  display: flex !important;\n  flex-direction: column !important;\n  align-items: center !important;\n  min-width: 38px !important;\n  text-align: center !important;\n  margin: 0 !important;\n  background: #fff !important;\n  width: 38px !important;\n  height: 38px !important;\n  border-radius: 5px !important;\n  justify-content: center !important;\n  flex-shrink: 0 !important;\n}\n\n.countdown-number {\n  font-size: 12px !important;\n  font-weight: bold !important;\n  color: #000 !important;\n  display: block !important;\n  text-align: center !important;\n  line-height: 1 !important;\n}\n\n.countdown-label {\n  font-size: 9px !important;\n  margin-top: 2px !important;\n  opacity: 1 !important;\n  font-weight: normal !important;\n  color: #000 !important;\n  line-height: 1 !important;\n}\n\n.yuddy-closeButtonDiv {\n  position: absolute !important;\n  top: 5px !important;\n  right: 5px !important;\n  left: auto !important;\n  z-index: 10 !important;\n}\n\n#yuddy-sidebar-close {\n  color: #333 !important;\n  font-size: 25px !important;\n  font-weight: bold !important;\n  text-decoration: none !important;\n  cursor: pointer !important;\n  background-color: transparent !important;\n  border: none !important;\n  width: 30px !important;\n  height: 30px !important;\n  border-radius: 50% !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  transition: background 0.3s ease !important;\n  padding: 0 !important;\n  margin: 0 !important;\n}\n\n#yuddy-sidebar-close:hover {\n  color: rgb(85, 83, 83) !important;\n  text-decoration: none !important;\n}\n\n.yuddy-sidebar-visible {\n  animation: slideIn 0.5s ease-out !important;\n}\n\n@keyframes slideIn {\n  from {\n    transform: translateX(100%) !important;\n  }\n  to {\n    transform: translateX(0) !important;\n  }\n}\n\n/* Mobile responsive */\n@media (max-width: 768px) {\n  .yuddy-sidebar {\n    left: 50px !important;\n  }\n  \n  .yuddy-tab {\n    width: 180px !important;\n    height: 50px !important;\n  }\n  \n  #yuddy-reminder {\n    width: 190px !important;\n   height: 180px !important;\n  }\n  \n  .yuddy-reminder-content {\n    padding: 8px 12px 10px 12px !important;\n  }\n  \n  .countdown-item {\n    width: 32px !important;\n    height: 32px !important;\n    min-width: 32px !important;\n  }\n  \n  .countdown-number {\n    font-size: 10px !important;\n  }\n  \n  .countdown-label {\n    font-size: 8px !important;\n  }\n  \n  #yuddy-reminderText {\n    font-size: 10px !important;\n    font-weight: bold !important;\n    margin-bottom: 6px !important;\n    color: #333 !important;\n  }\n  \n  #yuddy-discountCode {\n    font-size: 8px !important;\n    padding: 5px 6px !important;\n    margin-bottom: 6px !important;\n  }\n  \n  #yuddy-countdown {\n    gap: 3px !important;\n  }\n}\n\n@media (max-width: 480px) {\n  .yuddy-tab {\n    width: 180px !important;\n    height: 50px !important;\n  }\n  \n  #yuddy-reminder {\n    width: 190px !important;\n    height: 180px !important;\n  }\n  \n  .yuddy-reminder-content {\n    padding: 6px 10px 8px 10px !important;\n  }\n  \n  #yuddy-countdown {\n    gap: 2px !important;\n  }\n  \n  .countdown-item {\n    width: 28px !important;\n    height: 28px !important;\n    min-width: 28px !important;\n  }\n  \n  .countdown-number {\n    font-size: 9px !important;\n  }\n  \n  .countdown-label {\n    font-size: 7px !important;\n  }\n  \n  #yuddy-reminderText {\n    font-size: 9px !important;\n    margin-bottom: 5px !important;\n  }\n  \n  #yuddy-discountCode {\n    font-size: 7px !important;\n    padding: 4px 5px !important;\n    margin-bottom: 5px !important;\n  }\n}\n\n@media screen and (max-width: 1200px) {\n  .first-flex {\n    display: none !important;\n  }\n  \n  .countdown-ph {\n    width: 50% !important;\n  }\n}";
    styleInject(css_248z$1);

    var css_248z = "#yuddy-global-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background-color: rgba(0, 0, 0, 0.7);\n  display: none;\n  justify-content: center;\n  align-items: center;\n  z-index: 999999;\n  overflow: hidden;\n}\n\n.yuddy-modal-container {\n  display: flex;\n  gap: 20px;\n  align-items: center;\n  background: #ffffff;\n  border-radius: 16px;\n  padding: 24px;\n  position: relative;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);\n  max-width: 700px;\n  width: 90%;\n  transform: translateX(110%);\n  opacity: 0;\n  transition:\n    transform 0.5s cubic-bezier(0.25, 1, 0.5, 1),\n    opacity 0.4s ease;\n}\n\n.yuddy-modal-container.open {\n  transform: translateX(0);\n  opacity: 1;\n}\n\n.yuddy-modal-container.closing {\n  transform: translateX(110%);\n  opacity: 0;\n}\n\n.yuddy-modal-close {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  width: 30px;\n  height: 30px;\n  background: #e91e63;\n  color: white;\n  border: none;\n  border-radius: 50%;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 10;\n  padding: 0;\n  transition: transform 0.2s ease;\n}\n.yuddy-modal-close:hover {\n  transform: scale(1.1);\n}\n\n.yuddy-wheel-panel {\n  flex: 1;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.yuddy-wheel-container {\n  position: relative;\n  width: 300px;\n  height: 300px;\n  margin-top: 5px;\n}\n.yuddy-wheel-frame-wrapper {\n  position: relative;\n  width: 350px;\n  height: 350px;\n  background-size: contain;\n  background-position: center;\n  background-repeat: no-repeat;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  pointer-events: none;\n}\n\n#yuddy-wheel-canvas {\n  width: 100%;\n  height: 100%;\n  position: relative;\n}\n\n.yuddy-form-panel,\n.yuddy-result-panel {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  text-align: center;\n  min-width: 280px;\n  gap: 10px;\n  margin-bottom: 12px;\n}\n\n#yuddy-title {\n  font-size: 24px;\n  font-weight: bold;\n  margin: 0 0 8px 0;\n  color: #333;\n}\n\n#yuddy-description {\n  font-size: 16px;\n  margin: 0 0 16px 0;\n  color: #555;\n}\n\n.yuddy-form-inputs input[type='text'],\n.yuddy-form-inputs input[type='tel'],\n.yuddy-form-inputs input[type='email'] {\n  width: 100%;\n  padding: 10px 12px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 14px;\n  box-sizing: border-box;\n  margin-bottom: 5px;\n}\n\n.yuddy-checkbox-group {\n  margin-top: 5px;\n}\n\n.yuddy-checkbox-group label {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 10px;\n  color: #666;\n  text-align: left;\n  cursor: pointer;\n  margin-bottom: 5px;\n}\n.yuddy-checkbox-group input[type='checkbox'] {\n  width: 16px;\n  height: 16px;\n}\n\n#yuddy-spin-button {\n  width: 100%;\n  padding: 12px;\n  border: none;\n  border-radius: 4px;\n  background: #4caf50;\n  color: white;\n  font-size: 16px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: opacity 0.2s ease;\n}\n#yuddy-spin-button:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n\n#yuddy-result-title {\n  font-size: 22px;\n  font-weight: bold;\n  margin: 0 0 8px 0;\n}\n#yuddy-result-description {\n  font-size: 16px;\n  margin: 0 0 16px 0;\n}\n#yuddy-coupon-code {\n  border: 2px dashed #ccc;\n  padding: 10px;\n  border-radius: 4px;\n  font-size: 18px;\n  font-weight: bold;\n  cursor: pointer;\n}\n#yuddy-result-copy-button {\n  width: 100%;\n  padding: 12px;\n  border: none;\n  border-radius: 4px;\n  font-size: 16px;\n  font-weight: bold;\n  cursor: pointer;\n}\n#yuddy-result-footer {\n  font-size: 10px;\n  color: #888;\n  margin: 10px 0 0 0;\n}\n\n#yuddy-error-message {\n  color: #d32f2f;\n  background-color: #ffebee;\n  padding: 10px;\n  border-radius: 4px;\n  font-size: 12px;\n  font-weight: bold;\n  margin-top: 10px;\n}\n\n#yuddy-footer-text {\n  font-size: 10px;\n  color: #888;\n  margin: 10px 0 0 0;\n}\n\n#yuddy-reopen-button {\n  position: fixed;\n  z-index: 99990;\n}\n\n#yuddy-reopen-button .yuddy-reopen-content {\n  display: flex;\n  align-items: center;\n  padding: 10px 15px;\n  background: #49dac3;\n  color: #5c102b;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);\n  font-weight: bold;\n  gap: 8px;\n}\n\n#yuddy-reopen-icon-area svg {\n  width: 20px;\n  height: 20px;\n  fill: currentColor;\n}\n\n#yuddy-reopen-button .yuddy-reopen-close {\n  position: absolute;\n  top: -8px;\n  right: -8px;\n  width: 20px;\n  height: 20px;\n  background: white;\n  border: 1px solid #ccc;\n  border-radius: 50%;\n  cursor: pointer;\n  font-size: 14px;\n  line-height: 18px;\n  color: #333;\n  padding: 0;\n  text-align: center;\n}\n\n@media (max-width: 768px) {\n  .yuddy-modal-container {\n    width: 90% !important;\n    max-width: 400px !important;\n    max-height: 90vh !important;\n    overflow-y: auto !important;\n    padding: 20px 10px !important;\n    flex-direction: column !important;\n    justify-content: flex-start !important;\n    transform: translateY(110%);\n  }\n\n  .yuddy-modal-container.open {\n    transform: translateY(0);\n  }\n\n  .yuddy-modal-container.closing {\n    transform: translateY(110%);\n  }\n\n  .yuddy-wheel-container {\n    width: 250px;\n    height: 250px;\n  }\n  .yuddy-wheel-frame-wrapper {\n\n  width: 310px;\n  height: 310px;\n\n}\n\n  .yuddy-form-panel {\n    min-width: initial;\n    width: 100%;\n  }\n\n  #yuddy-title {\n    font-size: 20px;\n  }\n}\n.yuddy-checkbox-group p:not([style*='font-size']),\n.yuddy-checkbox-group label:not([style*='font-size']),\n.yuddy-checkbox-group input:not([style*='font-size']) {\n  font-size: 10px !important;\n  margin-top: 0;\n  margin-bottom: 10px;\n  margin-left: 0;\n  margin-right: 0;\n}\n\n@keyframes yuddy-wheel-sway {\n  0% {\n    transform: rotate(-10deg);\n  }\n  50% {\n    transform: rotate(10deg);\n  }\n  100% {\n    transform: rotate(-10deg);\n  }\n}\n\n#yuddy-wheel-canvas {\n  animation: yuddy-wheel-sway 3s ease-in-out infinite;\n\n  transform-origin: center center;\n}\n\n#yuddy-wheel-canvas.is-spinning {\n  animation: none;\n}\n\n#yuddy-branding-logo {\n  position: absolute;\n  bottom: 5px;\n  right: 15px;\n  z-index: 101;\n}\n@media (max-width: 768px) {\n  #yuddy-branding-logo {\n    position: static;\n    margin-top: 10px;\n    align-self: center;\n  }\n}\n";
    styleInject(css_248z);

    // Auto-initialize if used as UMD in browser
    if (typeof window !== 'undefined') {
        // 1. SÄ±nÄ±fÄ± 'window'a ekle (Rollup zaten 'GlobalWheel' adÄ±yla yapÄ±yor ama bu garanti)
        window.GlobalWheel = FortuneWheel;
        // 2. EN Ã–NEMLÄ° EKLEME: Widget'Ä± otomatik baÅŸlat!
        // DOM yÃ¼klendiÄŸinde, "beyni" (FortuneWheel) Ã§alÄ±ÅŸtÄ±r.
        document.addEventListener('DOMContentLoaded', () => {
            // FortuneWheel'in 'constructor'Ä± zaten 'init()'i Ã§aÄŸÄ±rÄ±yor.
            // Tek yapmamÄ±z gereken onu 'new'lemek.
            new FortuneWheel();
        });
    }

    exports.APIError = APIError;
    exports.FortuneWheel = FortuneWheel;
    exports.ValidationError = ValidationError;
    exports.WheelError = WheelError;
    exports.default = FortuneWheel;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});

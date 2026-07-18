function getSchedule(date = new Date()) {
    // Todos os dias das 18h às 22h30
    return {
        openHour: 18,
        openMinute: 0,
        closeHour: 22,
        closeMinute: 30
    };
}

const WHATSAPP_NUMBER = "5537999982046";

// ===== Meta Pixel Helper =====
function trackPixelEvent(eventName, params = {}) {
    if (typeof fbq === 'function') {
        fbq('track', eventName, params);
        console.log(`[PIXEL] Event tracked: ${eventName}`, params);
    }
}

let manualStoreStatus = localStorage.getItem('sb_manual_status') || "auto"; // Fallback imediato para mobile

function isStoreOpen() {
    if (manualStoreStatus === "closed") return false;
    if (manualStoreStatus === "open") return true;

    const now = new Date();
    const currentTotalMinutes = (now.getHours() * 60) + now.getMinutes();

    // 1. Verifica janela de HOJE
    const todaySched = getSchedule(now);
    const todayOpen = (todaySched.openHour * 60) + todaySched.openMinute;
    const todayClose = (todaySched.closeHour * 60) + todaySched.closeMinute;

    let openToday = false;
    if (todayClose < todayOpen) {
        // Crossover (fecha amanhã) - Ex: Abre 18h, Fecha 3h
        openToday = currentTotalMinutes >= todayOpen;
    } else {
        // Normal - Ex: Abre 18h, Fecha 22h30
        openToday = currentTotalMinutes >= todayOpen && currentTotalMinutes < todayClose;
    }

    // 2. Verifica janela de ONTEM (se ainda estiver aberta na madrugada de hoje)
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdaySched = getSchedule(yesterday);
    const yesterdayOpen = (yesterdaySched.openHour * 60) + yesterdaySched.openMinute;
    const yesterdayClose = (yesterdaySched.closeHour * 60) + yesterdaySched.closeMinute;

    let stillOpenFromYesterday = false;
    if (yesterdayClose < yesterdayOpen) {
        // Somente se fechou DEPOIS da meia noite
        stillOpenFromYesterday = currentTotalMinutes < yesterdayClose;
    }

    return openToday || stillOpenFromYesterday;
}

// ===== Função para Atualizar Status Visual =====
function updateStoreStatus() {
    const statusText = document.querySelector('.status-text');
    const statusBar = document.querySelector('.status-bar');
    const openingInfoNeon = document.getElementById('openingInfoNeon');

    if (!statusText || !statusBar) return;

    const open = isStoreOpen();

    if (open) {
        // Logica para "Fecha em breve"
        const now = new Date();
        const sched = getSchedule(now);
        const closeTime = new Date(now);
        closeTime.setHours(sched.closeHour, sched.closeMinute, 0, 0);

        // Ajuste para crossover (ex: abre 18h, fecha 3h)
        if (sched.closeHour < sched.openHour) {
            // Se agora é >= abertura, closeTime é amanhã
            if (now.getHours() >= sched.openHour) {
                closeTime.setDate(now.getDate() + 1);
            }
            // Se agora é < fechamento (madrugada), closeTime é hoje (já definido)
        }

        const diffClose = closeTime - now;
        const minutesToClose = Math.floor(diffClose / (1000 * 60));

        if (minutesToClose <= 60 && minutesToClose > 0) {
            const hoursLeft = Math.floor(diffClose / (1000 * 60 * 60));
            const minutesLeft = Math.floor((diffClose % (1000 * 60 * 60)) / (1000 * 60));
            const secondsLeft = Math.floor((diffClose % (1000 * 60)) / 1000);
            const timeLeftStr = `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

            statusText.textContent = 'FECHANDO EM BREVE';
            statusBar.classList.remove('closed', 'open');
            statusBar.classList.add('closing-soon');

            if (openingInfoNeon) {
                openingInfoNeon.innerHTML = `
                    <div class="countdown-box">
                        <span class="countdown-label">Fecha em</span>
                        <span class="countdown-time">${timeLeftStr}</span>
                    </div>
                `;
                openingInfoNeon.classList.remove('closed');
                openingInfoNeon.classList.add('open');
            }
        } else {
            statusText.textContent = 'ABERTO';
            statusBar.classList.remove('closed', 'closing-soon');
            statusBar.classList.add('open');
            if (openingInfoNeon) {
                openingInfoNeon.textContent = "Entrega em ±40 min! 🛵";
                openingInfoNeon.classList.remove('closed');
                openingInfoNeon.classList.add('open');
            }
        }
    } else {
        const now = new Date();
        let openTime = new Date(now);
        const sched = getSchedule(now);
        openTime.setHours(sched.openHour, sched.openMinute, 0, 0);

        // Se o horário de abertura já passou hoje, assume que é amanhã
        // MAS primeiro verifica se ainda estamos na janela de "ontem" (madrugada)
        // isStoreOpen já retornaria true se estivéssemos.
        if (openTime < now) {
            openTime.setDate(now.getDate() + 1);
        }

        const diff = openTime - now;
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

        const timeLeftStr = `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

        statusText.textContent = `FECHADO`;
        statusBar.classList.remove('open', 'closing-soon');
        statusBar.classList.add('closed');

        if (openingInfoNeon) {
            openingInfoNeon.innerHTML = `
                <div class="countdown-box">
                    <span class="countdown-label">Abre em</span>
                    <span class="countdown-time">${timeLeftStr}</span>
                </div>
            `;
            openingInfoNeon.classList.remove('open');
            openingInfoNeon.classList.add('closed');
        }
    }
    updateCheckoutButtonStatus();
}

// Atualiza o status frequentemente para o cronômetro
setInterval(updateStoreStatus, 1000);

// PROMOÇÃO ESPECIAL: Santo Juízo por 35.20 (20% OFF)
const CRAZY_PROMO = {
    active: true,
    id: 10,
    price: 24.90,
    limit: 10
};

// SMART PROMO: Retired
const COMBO_PROMO = {
    active: false,
    burgerIds: [],
    cakeIds: [],
    promoPrice: 0,
    defaultCakeId: 0
};

let crossSellShown = false;

// ===== Promoção de Marketing Automática (Escassez Dinâmica via Dashboard) =====
const PROMO_CONFIG = {
    active: false, // Desativado por padrão, gerenciar via Dashboard
    label: "🔥 20% OFF SÓ AGORA!",
    totalStock: 15,
    promoPrice: 38.90,
    promoProductId: '8', // Santo Juízo
    decayMinutes: 25,
    lastUpdate: new Date().toISOString(),
    showStock: true,
    showTimer: true,
    storageKey: 'sb_marketing_promo_v1',
    discounts: {},
    globalDiscountActive: false,
    globalDiscountPercent: 15,
    couponActive: false,
    couponCode: '',
    couponPercent: 0
};

// ===== Meta Ads Auto-Discount =====
function checkAutoDiscount() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('utm_source') === 'meta' || urlParams.get('ref') === 'ads') {
        sessionStorage.setItem('santaBrasa_meta_discount', 'true');
    }
    if (sessionStorage.getItem('santaBrasa_meta_discount') === 'true') {
        PROMO_CONFIG.globalDiscountActive = true;
        PROMO_CONFIG.globalDiscountPercent = 15;
    }
}
checkAutoDiscount();

let appliedCoupon = null; // Armazena o cupom validado no lado do cliente

function getPromoRemaining() {
    if (!PROMO_CONFIG.active) return 0;

    // Lógica de Escassez Fantasma (Ghost Stock) por tempo
    const now = new Date();
    const lastUpdate = new Date(PROMO_CONFIG.lastUpdate);
    const diffMs = now - lastUpdate;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    // Redução: 1 unidade a cada X minutos passados
    const ghostReduction = PROMO_CONFIG.decayMinutes > 0 ? Math.floor(diffMins / PROMO_CONFIG.decayMinutes) : 0;

    // Estoque Real Visualizado = Inicial - Redução Automática
    return Math.max(0, PROMO_CONFIG.totalStock - ghostReduction);
}

function isPromoActive() {
    return PROMO_CONFIG.active && getPromoRemaining() > 0;
}

function getPromoSold() {
    return parseInt(localStorage.getItem(PROMO_CONFIG.storageKey) || '0');
}

function incrementPromoSold() {
    const sold = getPromoSold() + 1;
    localStorage.setItem(PROMO_CONFIG.storageKey, sold);
    updatePromoBannerStock();
}

function updatePromoBannerStock() {
    const remaining = getPromoRemaining();
    const stockEl = document.getElementById('cpb-stock-count');
    if (stockEl) {
        // Animação de flash ao atualizar o número
        stockEl.classList.remove('cpb-stock-flash');
        void stockEl.offsetWidth; // Reflow para reiniciar animation
        stockEl.classList.add('cpb-stock-flash');
        stockEl.textContent = String(remaining).padStart(2, '0');
        if (remaining <= 5) stockEl.closest('.cpb-stock-badge').classList.add('cpb-stock-critical');
    }
    // Se zerou, dispara animação de esgotado e re-renderiza
    if (remaining <= 0) {
        triggerSoldOutAnimation();
        setTimeout(() => renderMenu(), 2800); // Espera a animação terminar
    }
}

function triggerSoldOutAnimation() {
    const banner = document.getElementById('crazy-promo-banner');
    if (banner) {
        banner.classList.add('promo-exploding');
    }
}

// ===== Countdown Automático de Escassez =====
function startPromoCountdown() {
    if (!PROMO_CONFIG.active) return;

    const INTERVAL_MS = 25 * 60 * 1000; // 25 minutos
    const DRAIN_PER_TICK = 2; // Unidades drenadas por intervalo

    function drain() {
        const remaining = getPromoRemaining();
        if (remaining <= 0) return; // Já acabou, para o countdown

        // Drena até 2 unidades (sem passar de 0)
        const toDrain = Math.min(DRAIN_PER_TICK, remaining);
        for (let i = 0; i < toDrain; i++) {
            incrementPromoSold();
        }

        console.log(`[PROMO COUNTDOWN] -${toDrain} unidades. Restam: ${getPromoRemaining()}`);

        // Agenda próximo drain somente se ainda tiver estoque
        if (getPromoRemaining() > 0) {
            setTimeout(drain, INTERVAL_MS);
        }
    }

    // Inicia o primeiro drain após 25 minutos
    setTimeout(drain, INTERVAL_MS);
    console.log('[PROMO COUNTDOWN] Iniciado. -2 unidades a cada 25 minutos.');
}

// ===== Menu Data =====
const menuData = {
    combos: [
        {
            id: 5001,
            name: "Combo Econômico 💸",
            description: "1x X-Salada (o clássico) + 1x Coca-Cola geladinha + 1x Fatia de Bolo artesanal. <br><small style='color: var(--primary); font-weight: 600;'>🔥 Economia Real de R$ 8,00</small>",
            price: 41.00,
            badge: "O QUERIDINHO 🏆"
        },
        {
            id: 5002,
            name: "Combo Casal Tradicional 👩‍❤️‍👨",
            description: "2x X-Salada + 2x Coca-Cola Lata 350ml + 2x Fatia de Bolo. <br><small style='color: var(--primary); font-weight: 600;'>💎 Economia de R$ 13,10</small>",
            price: 84.90,
            badge: "MAIS VENDIDOO 🔥",
            image: "santa_brasa_combo_cake.png"
        },
        {
            id: 5003,
            name: "Combo Casal Especial 👑",
            description: "2x X-Egg Bacon (o favorito) + 2x Cocas geladas + 2x Fatias de Bolo. <br><small style='color: var(--primary); font-weight: 600;'>✨ Economia VIP de R$ 18,10</small>",
            price: 99.90,
            badge: "MAIOR VANTAGEM 💎"
        },
        {
            id: 5006,
            name: "Mega Combo Santo Juízo ⚖️",
            description: "2x Santo Juízo + 2x Coca-Cola Lata 350ml + 2x Fatias de Bolo Dois Amores. <br><small style='color: #00FF41; font-weight: 800;'>Economia de R$ 38,10</small>",
            price: 99.90,
            badge: "OFERTA LIMITADA ⏳",
            image: "mega_combo_thursday.png"
        },
        {
            id: 5007,
            name: "Combo Exclusivo Zap 📱",
            description: "1x Santo Juízo (O Supremo) + 1x Coca-Cola gelada + 1x Fatia de Bolo Dois Amores. <br><small style='color: #00FF41; font-weight: 800;'>🔥 EXCLUSIVO STATUS: 20% de Desconto Real!</small>",
            price: 55.20,
            badge: "SÓ NO WHATS 💬"
        },
        {
            id: 5008,
            name: "Combo Relâmpago ⚡",
            description: "1x Santa Fúria 🔥 (O Gigante) + 1x Coca-Cola geladinha + 1x Fatia de Bolo de Chocolate. <br><small style='color: #FF3131; font-weight: 800;'>⚡ OFERTA LIMITADA: Economia Real de R$ 18,10!</small>",
            price: 54.90,
            badge: "SÓ AGORA! ⏳"
        }
    ],
    tradicionais: [
        {
            id: 1,
            name: "X-Salada",
            description: "Pão, hambúrguer artesanal suculento, queijo derretido, alface fresca, tomate e nossa maionese especial.",
            price: 24.00
        },
        {
            id: 2,
            name: "Vegetariano",
            description: "Pão, 2 ovos, Dobro de Queijo, Milho, Alface, Tomate e Maionese Especial.",
            price: 25.00
        },
        {
            id: 3,
            name: "X-Egg",
            description: "Pão, Hambúrguer Artesanal, Ovo, Dobro de Queijo, Alface, Tomate e Maionese Especial.",
            price: 29.00
        },
        {
            id: 4,
            name: "X-Bacon",
            description: "Pão, Hambúrguer Artesanal, Bacon, Queijo, Alface, Tomate e Maionese Especial.",
            price: 33.00
        },
        {
            id: 5,
            name: "Laçador",
            description: "Pão, hambúrguer artesanal, bacon crocante, milho, dobro de queijo muçarela, alface e nossa maionese artesanal da casa.",
            price: 34.00
        },
        {
            id: 6,
            name: "X-Egg Bacon",
            description: "Pão, Hambúrguer Artesanal, Bacon, Ovo, Mussarela, Alface, Tomate e Molho Especial.",
            price: 34.00
        }
    ],
    especiais: [
        {
            id: 7,
            name: "Santa Fúria",
            description: "Quando a fome perde a paciência: Dois Burgers artesanais suculentos, ovo, tomate, frango desfiado temperado, bacon premium, triplo de queijo muçarela, milho, alface e maionese especial.<br><small style='color: var(--primary); font-size: 0.85rem; font-weight: 600; display: block; margin-top: 5px;'>👉 Satisfação extrema (pode servir até dois)</small>",
            price: 48.00,
            badge: "O MAIOR! 🔥"
        },
        {
            id: 8,
            name: "Santo Juízo",
            description: "Um verdadeiro espetáculo de sabores: Blend artesanal suculento, frango desfiado, bacon premium, ovo, triplo de queijo muçarela, milho, alface, tomate e maionese especial.",
            price: 44.00,
            badge: "MAIS VENDIDO 🏆"
        },
        {
            id: 9,
            name: "Milagre Cremoso",
            description: "O sabor que faz milagre: Frango Desfiado, Bacon Suculento, Queijo à Vontade, Milho e Maionese Especial.",
            price: 40.00
        },
        {
            id: 10,
            name: "Dom Contra",
            description: "Carne nobre, sabor marcante: Pão, Contrafilé, Bacon, Ovo, Dobro de Queijo, Salada e Molho Especial.",
            price: 54.00
        }
    ],
    sobremesas: [
        {
            id: 2001,
            name: "Mini Pudim Tradicional 150g",
            description: "150g. O melhor pudim da cidade! Cremoso, sem furinhos e com calda de caramelo especial.",
            price: 15.00,
            badge: "NOVIDADE ✨",
            soldOut: true
        }
    ],
    bolos: [
        {
            id: 3005,
            name: "Torta - Floresta Negra",
            description: "Uma experiência intensa e sofisticada. Massa Cacau Black ultra molhadinha, recheio cremoso de Ninho com geleia artesanal de morango, finalizada com cobertura de chocolate meio amargo e a clássica cereja.",
            price: 22.00,
            badge: "EM BREVE ⏳",
            highlightPurple: true,
            soldOut: true,
            hideRibbon: true
        },
        {
            id: 3001,
            name: "Bolo de Maracujá",
            description: "Fatia generosa e super molhadinha",
            price: 18.00,
            category: "bolos",
            soldOut: true
        },
        {
            id: 3002,
            name: "Bolo de Chocolate",
            description: "Fatia generosa. Massa de chocolate fofinha com recheio de chocolate ao leite e cobertura de chocolate meio amargo.",
            price: 18.00,
            soldOut: true
        },
        {
            id: 3003,
            name: "Bolo de Cenoura com Chocolate",
            description: "Fatia generosa. Massa de cenoura fresquinha com aquela cobertura de chocolate que crackela.",
            price: 18.00,
            soldOut: true
        },
        {
            id: 3004,
            name: "Bolo Dois Amores",
            description: "Fatia generosa. Irresistível creme de Ninho Original combinado com autêntico Chocolate Nobre 50% cacau.",
            price: 18.00,
            highlightGreen: true,
            badge: "NOVIDADE ✨",
            soldOut: true
        }
    ],
    bebidas: [
        {
            id: 13,
            name: "Coca-Cola Zero",
            description: "Unidade Lata 350ml",
            price: 7.00
        },
        {
            id: 15,
            name: "Coca-Cola",
            description: "Unidade Lata 350ml",
            price: 7.00
        }
    ]
};

// ===== Add-ons Data =====
const ADDONS = [
    { id: 'hamburguer', name: 'Hambúrguer Extra', price: 12.00 },
    { id: 'bacon', name: 'Bacon Extra', price: 8.00 },
    { id: 'queijo', name: 'Queijo Extra', price: 5.00 },
    { id: 'ovo', name: 'Ovo Extra', price: 4.00 },
    { id: 'maionese', name: 'Maionese da Casa', price: 3.00 },
    { id: 'abacaxi', name: 'Abacaxi', price: 3.00 },
    { id: 'banana_terra', name: 'Banana da Terra', price: 8.00 },
    { id: 'banana', name: 'Banana', price: 3.00 }
];

// ===== Cart State & Modal State =====
let cart = [];
let currentModalItem = null;
let currentModalCartId = null;
let currentModalQuantity = 1;
let selectedAddons = [];
let orderType = 'delivery'; // 'delivery' ou 'pickup'

// ===== A/B Testing Logic =====
const AB_TEST_KEY = 'sb_ab_group';
function getABTestGroup() {
    let group = localStorage.getItem(AB_TEST_KEY);
    if (!group) {
        group = Math.random() < 0.5 ? 'control' : 'variant';
        localStorage.setItem(AB_TEST_KEY, group);
    }
    return group;
}

function trackABEvent(eventName) {
    const group = getABTestGroup();
    const fullEventName = `ab_${eventName}_${group}`;

    // Log to console for debugging
    console.log(`[AB TEST] Tracking: ${fullEventName}`);

    // Increment in Firebase if available
    if (typeof window.dbIncrement === 'function') {
        window.dbIncrement(fullEventName);
    }
}

// ===== Security Hardening Helpers =====
function validateAndSanitize(text, maxLength = 255) {
    if (typeof text !== 'string') return '';
    // Strip HTML Tags
    let sanitized = text.replace(/<[^>]*>?/gm, '');
    // Trim and limit length
    return sanitized.trim().substring(0, maxLength);
}

const rateLimit = {
    attempts: [],
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 60000 // 1 minute
};

function isRateLimited() {
    const now = Date.now();
    rateLimit.attempts = rateLimit.attempts.filter(timestamp => now - timestamp < rateLimit.WINDOW_MS);
    if (rateLimit.attempts.length >= rateLimit.MAX_ATTEMPTS) return true;
    rateLimit.attempts.push(now);
    return false;
}

let checkoutOpenTime = 0;
function logCheckoutOpen() {
    checkoutOpenTime = Date.now();
}

function setOrderType(type) {
    orderType = type;

    // Update Buttons
    document.getElementById('typeDelivery').classList.toggle('active', type === 'delivery');
    document.getElementById('typePickup').classList.toggle('active', type === 'pickup');

    // Toggle Visibility
    const addressGroup = document.getElementById('addressFieldGroup');
    const pickupInfo = document.getElementById('pickupAddressInfo');

    if (type === 'pickup') {
        if (addressGroup) addressGroup.style.display = 'none';
        if (pickupInfo) pickupInfo.style.display = 'block';
    } else {
        if (addressGroup) addressGroup.style.display = 'block';
        if (pickupInfo) pickupInfo.style.display = 'none';
    }

    updateCartUI();
}

// ===== WhatsApp Number (configure here) =====
// O WHATSAPP_NUMBER agora é gerenciado globalmente no topo do arquivo

// ===== DOM Elements =====
// const cartButton = document.getElementById('cartButton');
// const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutButton = document.getElementById('checkoutButton');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    updateStoreStatus();  // Atualiza status    // Initial render
    renderMenu();
    loadCart();
    loadUserData(); // Carrega dados salvos do cliente
    updateCartUI();

    // Init VIP System
    initVIPMode();

    // Listener para atualizar taxa de entrega em tempo real
    const addrInput = document.getElementById('clientAddress');
    if (addrInput) {
        addrInput.addEventListener('input', () => updateCartUI());
    }
    // initChat() será chamado pelo tracker quando o Firebase conectar

    // Inicia Prova Social (Híbrida: Real-time + Simulação de Baixa Frequência)
    setTimeout(() => {
        if (typeof initRealTimeNotifications === 'function') {
            initRealTimeNotifications();
            initSimulatedNotifications(); // Adicionado para manter "como era antes" mas com frequência menor
        }
    }, 5000);

    // Inicia countdown automático de escassez da promoção
    startPromoCountdown();

    // Pré-aquece o estoque da promoção (mostra 8 de 10 ao carregar)
    if (PROMO_CONFIG.active && parseInt(localStorage.getItem(PROMO_CONFIG.storageKey) || '0') === 0) {
        localStorage.setItem(PROMO_CONFIG.storageKey, '2');
        renderMenu(); // Atualiza o banner com o valor correto
    }

    // Log initial group
    const group = getABTestGroup();
    console.log(`[AB TEST] User assigned to group: ${group}`);
    trackABEvent('visit');

    // Sincroniza Promoções do Dashboard
    initPromotionSync();
});

// ===== Promoção Sincronizada via Firebase =====
function initPromotionSync() {
    if (typeof firebase === 'undefined') return;
    const db = firebase.database();

    db.ref('settings/promotions').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            console.log("📊 Configurações de Marketing Recebidas:", data);
            PROMO_CONFIG.active = data.active || false;
            PROMO_CONFIG.totalStock = data.initialStock || 10;
            PROMO_CONFIG.decayMinutes = data.decayMinutes || 25;
            PROMO_CONFIG.lastUpdate = data.lastUpdate || new Date().toISOString();
            PROMO_CONFIG.promoProductId = data.productId || '8';
            PROMO_CONFIG.promoPrice = data.promoPrice || 38.90;
            PROMO_CONFIG.showStock = data.showStock !== false;
            PROMO_CONFIG.showTimer = data.showTimer !== false;
            PROMO_CONFIG.label = data.label || "🔥 PROMOÇÃO RELÂMPAGO";

            // Sincronização de Desconto Global e Cupons
            PROMO_CONFIG.globalDiscountActive = data.globalDiscountActive || false;
            PROMO_CONFIG.globalDiscountPercent = parseFloat(data.globalDiscountPercent) || 15;
            PROMO_CONFIG.couponActive = data.couponActive || false;
            PROMO_CONFIG.couponCode = data.couponCode || '';
            PROMO_CONFIG.couponPercent = parseFloat(data.couponPercent) || 0;

            // Sincroniza o desconto para o produto em destaque no card do menu
            PROMO_CONFIG.discounts = {};
            if (PROMO_CONFIG.active && PROMO_CONFIG.promoPrice && PROMO_CONFIG.promoProductId) {
                PROMO_CONFIG.discounts[PROMO_CONFIG.promoProductId] = {
                    promoPrice: PROMO_CONFIG.promoPrice
                };
            }

            // Re-renderiza o menu caso o banner precise aparecer/sumir ou os preços mudarem
            renderMenu();
            updateCartUI(); // Atualiza carrinho caso o desconto global tenha mudado
        }
    });



    // Sincroniza Preços e Status dos Combos
    db.ref('settings/comboPrices').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            console.log("💎 Novas configurações de combos recebidas:", data);
            menuData.combos.forEach(combo => {
                const config = data[combo.id] || data[String(combo.id)];
                if (config) {
                    // Lida com o novo formato {price, active} ou o antigo apenas com o preço
                    if (typeof config === 'object') {
                        combo.price = parseFloat(config.price || combo.price);
                        // Força soldOut como true apenas se active for explicitamente false
                        combo.soldOut = (config.active === false || config.active === "false");
                        if (config.description) combo.description = config.description;
                    } else {
                        combo.price = parseFloat(config);
                        combo.soldOut = false;
                    }
                }
            });
            renderMenu();
        }
    });
}

// ===== Social Proof (Prova Social Real-time) =====
let isInitialOrderLoad = true;
function initRealTimeNotifications() {
    if (typeof firebase === 'undefined') return;

    const db = firebase.database();
    // Monitora o último pedido inserido
    const ordersRef = db.ref('orders').limitToLast(1);

    ordersRef.on('child_added', (snapshot) => {
        if (isInitialOrderLoad) {
            isInitialOrderLoad = false;
            return;
        }

        const order = snapshot.val();
        if (!order || !order.customer) return;

        showRealOrderNotification(order);
    });
}

function showRealOrderNotification(order) {
    const nomeOriginal = order.customer.name || "Cliente";
    const bairro = order.customer.address ? extractBairro(order.customer.address) : "Itaúna";

    const items = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
    const firstItem = items[0] ? items[0].name : "um pedido";

    displaySocialProof(nomeOriginal, bairro, firstItem);
}

// ===== Simulação Controlada (Frequência Baixa) =====
function initSimulatedNotifications() {
    const nomes = ["Marcos", "Ana", "Lucas", "Gabriel", "Julia", "Renata", "Paulo", "Fernanda", "Rodrigo", "Beatriz", "Ricardo", "Camila"];
    const itens = ["Santa Fúria 🔥", "Santo Juízo 🏆", "X-Bacon", "X-Egg Bacon", "Milagre Cremoso", "Combo Família"];
    const bairros = ["Garcias", "Varzea da Olaria", "Cidade Nova", "Graças", "Centro", "Santanense", "Aeroporto", "Três Marias", "Itaunense"];

    function triggerNext() {
        const nome = nomes[Math.floor(Math.random() * nomes.length)];
        const item = itens[Math.floor(Math.random() * itens.length)];
        const bairro = bairros[Math.floor(Math.random() * bairros.length)];

        displaySocialProof(nome, bairro, item);

        // Agendamento: Entre 3 e 7 minutos (Diminuindo a frequência como solicitado)
        const proximoIntervalo = (Math.random() * (420000 - 180000)) + 180000;
        setTimeout(triggerNext, proximoIntervalo);
    }

    // Inicia a primeira simulação após 1 a 2 minutos do carregamento
    setTimeout(triggerNext, (Math.random() * 60000) + 60000);
}

function displaySocialProof(nome, bairro, produto) {
    // Não exibe notificações quando a loja está fechada
    if (!isStoreOpen()) return;

    const container = document.getElementById('social-proof-container');
    if (!container) return;

    // Censura discreta do nome para privacidade/realismo
    const nomeCensurado = nome.length > 3 ? nome.substring(0, 3) + "***" : nome;

    container.innerHTML = `
        <div class="social-proof-toast">
            <div class="sp-icon">🔥</div>
            <div class="sp-content">
                <strong>${nomeCensurado}</strong> de <span>${bairro}</span><br>
                pediu ${produto}!
            </div>
        </div>
    `;
    container.classList.add('active');

    setTimeout(() => {
        container.classList.remove('active');
    }, 6000); // 6 segundos visível
}

function extractBairro(address) {
    const bairrosConhecidos = ["Garcias", "Varzea da Olaria", "Cidade Nova", "Graças", "Centro", "Piedade", "Santanense", "Aeroporto", "Santanense", "Itaunense", "Três Marias"];
    for (let b of bairrosConhecidos) {
        if (address.toLowerCase().includes(b.toLowerCase())) return b;
    }

    const parts = address.split(',');
    if (parts.length > 1) {
        const lastPart = parts[parts.length - 1].trim();
        return lastPart.split(' ')[0] || "Itaúna";
    }

    return "Itaúna";
}

// ===== Direct Add to Cart (for Drinks and simple items) =====
function addDirectToCart(itemId) {
    const item = findItemById(itemId);
    if (!item) return;

    // Unique ID for items without addons (just ID or ID-default)
    const uniqueCartId = `${item.id}-default`;

    const existingItem = cart.find(i => i.cartId === uniqueCartId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            cartId: uniqueCartId,
            name: item.name,
            basePrice: item.price,
            price: item.price,
            addons: [], // No addons
            quantity: 1,
            observation: ''
        });
    }

    saveCart();
    updateCartUI();
    showToast(`1x ${item.name} adicionado!`);

    // Meta Pixel: AddToCart
    trackPixelEvent('AddToCart', {
        content_name: item.name,
        content_ids: [item.id],
        content_type: 'product',
        value: item.price,
        currency: 'BRL'
    });


}



function initVIPMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('vip') === 'true') {
        const main = document.querySelector('.main-content');
        if (!main) return;

        const vipComboId = 9001;
        if (!findItemById(vipComboId)) {
            if (!menuData.especiais) menuData.especiais = [];
            menuData.especiais.push({
                id: vipComboId,
                name: "👑 Combo VIP da Brasa (Secreto)",
                description: "O segredo foi revelado: 1x Santo Juízo + 1x Coca-Cola Lata com acesso exclusivo VIP.",
                price: 49.00
            });
        }

        const bannerHtml = `
            <div class="vip-banner-container" style="margin-bottom: 2rem; background: linear-gradient(135deg, #111, #000); border: 2px solid #FFD700; border-radius: 12px; padding: 2rem; text-align: center; box-shadow: 0 0 20px rgba(255,215,0,0.2);">
                <div class="vip-badge" style="background: #FFD700; color: #000; display: inline-block; padding: 4px 12px; font-weight: bold; border-radius: 20px; font-size: 0.8rem; letter-spacing: 2px; margin-bottom: 1rem;">ACESSO OURO LIBERADO</div>
                <h2 style="color: #fff; font-family: 'Bebas Neue'; font-size: 2.2rem; letter-spacing: 1px; margin-bottom: 10px;">Menu Secreto Desbloqueado 🤫</h2>
                <p style="color: #aaa; margin-bottom: 1.5rem; font-size: 0.95rem;">Você é um dos nossos melhores clientes. Garantimos este combo exclusivo que não está no cardápio público.</p>
                
                <div style="background: #1a1a1a; padding: 1.5rem; border-radius: 8px; border: 1px solid #333;">
                    <h3 style="color: #FFD700; margin-bottom: 5px;">👑 Combo Ouro da Brasa</h3>
                    <p style="color: #ddd; font-size: 0.85rem; margin-bottom: 15px;">1x Santo Juízo + 1x Coca-Cola Lata 350ml</p>
                    <div style="font-size: 1.8rem; color: #00FF41; font-weight: bold; margin-bottom: 15px;">R$ 49,00</div>
                    <button onclick="addToCart(${vipComboId})" style="background: #00FF41; color: #000; font-weight: bold; padding: 12px 24px; border: none; border-radius: 30px; cursor: pointer; text-transform: uppercase;">Garantir O Segredo</button>
                </div>
            </div>
        `;
        main.insertAdjacentHTML('afterbegin', bannerHtml);
    }
}

// ===== Render Promo Banner =====
function renderPromoBanner() {
    // Remove banner antigo sempre para evitar banners persistentes ao desligar
    const existing = document.getElementById('crazy-promo-banner');
    if (existing) existing.remove();

    if (!PROMO_CONFIG.active) return;

    const section = document.getElementById('combos')?.closest('.menu-section');
    if (!section) return;

    const remaining = getPromoRemaining();
    const promoEnded = remaining <= 0;

    // Encontrar dados do produto dinâmico no menuData
    let product = null;
    Object.values(menuData).forEach(cat => {
        const found = cat.find(i => i.id == PROMO_CONFIG.promoProductId);
        if (found) product = found;
    });

    if (!product) return;

    // NOVO: Se o produto da promoção estiver "soldOut" (desativado), o banner não deve aparecer
    if (product.soldOut) {
        return;
    }

    const banner = document.createElement('div');
    banner.id = 'crazy-promo-banner';
    banner.className = 'crazy-promo-banner' + (promoEnded ? ' promo-ended' : '');
    banner.innerHTML = promoEnded ? `
        <div class="cpb-inner">
            <div class="cpb-tag cpb-tag-ended">PROMOÇÃO ENCERRADA</div>
            <h2 class="cpb-title cpb-title-ended">😢 Acabou! As ${PROMO_CONFIG.totalStock} Unidades Foram!</h2>
            <p class="cpb-subtitle">Mas nossos lanches continuam incríveis. Volte em breve!</p>
        </div>
    ` : `
        <div class="cpb-inner">
            <div class="cpb-tag">${PROMO_CONFIG.label}</div>
            <h2 class="cpb-title">🔥 ${product.name.toUpperCase()} 🔥</h2>
            <p class="cpb-subtitle">Promoção RELÂMPAGO! ${PROMO_CONFIG.showStock ? `Apenas ${PROMO_CONFIG.totalStock} unidades com preço especial!` : ''}</p>
            <div class="cpb-prices">
                <div class="cpb-price-item">
                    <span class="cpb-item-name">${product.name}</span>
                    <div style="display: flex; gap: 10px; align-items: baseline;">
                        <span class="cpb-old-price" style="text-decoration: line-through; opacity: 0.6; font-size: 0.9rem;">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                        <span class="cpb-new-price" style="color: #00ff7f; font-weight: bold; font-size: 1.6rem; text-shadow: 0 0 10px rgba(0,255,127,0.3);">R$ ${PROMO_CONFIG.promoPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                    ${product.price > PROMO_CONFIG.promoPrice ? `
                    <div style="color: #00FF41; font-weight: 800; font-size: 0.9rem; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">
                        🤑 Economia de R$ ${(product.price - PROMO_CONFIG.promoPrice).toFixed(2).replace('.', ',')}
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Timer e Urgência -->
            <div class="cpb-urgency-row" style="display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-top: 1rem;">
                <!-- Restam X de Y (Condicional) -->
                ${PROMO_CONFIG.showStock ? `
                <div class="cpb-stock-badge ${remaining <= 3 ? 'cpb-stock-critical' : ''}" style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,49,49,0.15); border: 2px solid #ff3131; padding: 5px 15px; border-radius: 8px; min-width: 100px;">
                    <span style="font-size: 0.7rem; color: #fff; text-transform: uppercase; font-weight: 700; opacity: 0.9;">APENAS</span>
                    <span class="cpb-stock-big" id="cpb-stock-count" style="font-size: 1.8rem; line-height: 1; color: #ff3131; font-family: 'Bebas Neue';">${String(remaining).padStart(2, '0')}</span>
                    <span style="font-size: 0.7rem; color: #fff; text-transform: uppercase; font-weight: 700; opacity: 0.9;">UNIDADES</span>
                </div>
                ` : ''}

                <!-- Cronômetro (Condicional) -->
                ${PROMO_CONFIG.showTimer ? `
                <div class="cpb-timer-box" style="background: rgba(0,0,0,0.5); padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--primary); min-width: 120px;">
                    <div style="font-size: 0.7rem; color: #fff; text-transform: uppercase; font-weight: bold;">ACABA EM:</div>
                    <div id="promo-countdown-timer" style="font-family: 'Bebas Neue'; font-size: 1.6rem; color: var(--primary); letter-spacing: 2px;">--:--</div>
                </div>
                ` : ''}
            </div>

            ${PROMO_CONFIG.showStock ? `<div class="cpb-footer" style="font-weight: 800; color: #ff3131; font-size: 1rem; text-transform: uppercase;">🔥 Apenas ${String(remaining).padStart(2, '0')} sanduíches disponíveis!</div>` : ''}
        </div>
    `;

    section.insertAdjacentElement('beforebegin', banner);

    // Inicia o timer vivo caso não exista
    if (!window.promoTimerInterval) {
        window.promoTimerInterval = setInterval(updateLivePromoTimer, 1000);
    }
}

function updateLivePromoTimer() {
    const timerElem = document.getElementById('promo-countdown-timer');
    if (!timerElem || !PROMO_CONFIG.active) return;

    const now = new Date();
    const lastUpdate = new Date(PROMO_CONFIG.lastUpdate);
    const diffMs = now - lastUpdate;
    const diffSecsTotal = Math.floor(diffMs / 1000);
    const decaySecs = PROMO_CONFIG.decayMinutes * 60;

    if (decaySecs <= 0) {
        timerElem.textContent = "AGORA!";
        return;
    }

    // Tempo restante para a próxima redução de estoque
    const remainingInCycle = decaySecs - (diffSecsTotal % decaySecs);

    const mins = Math.floor(remainingInCycle / 60);
    const secs = remainingInCycle % 60;

    timerElem.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Efeito visual de tensão nos últimos 30 segundos
    if (remainingInCycle <= 30) {
        timerElem.style.color = "#ffcc00";
        timerElem.classList.add('pulse-timer');
    } else {
        timerElem.style.color = "var(--primary)";
        timerElem.classList.remove('pulse-timer');
    }

    // Se o ciclo fechou (zero), força um re-render do menu para atualizar o número do estoque
    if (remainingInCycle === decaySecs) {
        renderMenu();
    }
}


function renderMenu() {
    Object.keys(menuData).forEach(category => {
        const container = document.getElementById(category);
        if (!container) return;

        const activeItems = menuData[category].filter(item => !(category === 'combos' && item.soldOut));
        const section = container.closest('.menu-section');

        if (activeItems.length === 0) {
            if (section) section.style.display = 'none';
            container.innerHTML = '';
        } else {
            if (section) section.style.display = 'block';
            container.innerHTML = activeItems.map(item => {
                let clickAction = '';
                // Determine which function to call based on category
                if (item.soldOut) {
                    clickAction = `showToast('Item esgotado temporariamente 😢')`;
                } else if (category === 'bebidas' || category === 'sobremesas' || category === 'bolos') {
                    clickAction = `addDirectToCart(${item.id})`;
                } else {
                    clickAction = `addToCart(${item.id})`;
                }

                // Verifica se o item está em promoção (e tem estoque)
                const promoInfo = isPromoActive() && PROMO_CONFIG.discounts[item.id];
                const displayPrice = promoInfo ? promoInfo.promoPrice : item.price;

                const priceBlock = item.soldOut
                    ? '<span class="sold-out-status">ESGOTADO</span>'
                    : promoInfo
                        ? `<div class="promo-price-block">
                               <span class="promo-original-price">${item.price.toFixed(2).replace('.', ',')}</span>
                               <span class="item-price promo-active-price">${displayPrice.toFixed(2).replace('.', ',')}</span>
                           </div>`
                        : `<span class="item-price">${item.price.toFixed(2).replace('.', ',')}</span>`;

                return `
                <div class="menu-item ${item.soldOut ? 'sold-out' : ''} ${promoInfo ? 'item-on-promo' : ''} ${item.highlightGreen ? 'highlight-green-item' : ''} ${item.highlightPurple ? 'highlight-purple-item' : ''}" data-id="${item.id}">
                    ${item.soldOut && !item.hideRibbon ? '<div class="sold-out-ribbon">ESGOTADO</div>' : ''}
                    ${promoInfo ? '<div class="promo-ribbon">🔥 PROMOÇÃO</div>' : ''}
                    


                    <div class="item-info">
                        <h3 class="item-name">
                            ${item.name}
                            ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ''}
                            ${promoInfo ? `<span class="item-badge promo-badge-item">${PROMO_CONFIG.label}</span>` : ''}
                        </h3>
                        <p class="item-description">${item.description}</p>
                        <div class="menu-item-actions">
                            <div class="price-container">
                                ${priceBlock}
                            </div>
                            ${!item.soldOut ? `
                            <button class="add-button ${promoInfo ? 'add-button-promo' : ''}" onclick="${clickAction}" aria-label="Adicionar ${item.name}">
                                +
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }
    });

    // Injeta o banner de promoção maluca
    renderPromoBanner();
}

// ===== Find Item by ID =====
function findItemById(id) {
    for (const category of Object.values(menuData)) {
        const item = category.find(item => item.id === id);
        if (item) return item;
    }
    return null;
}

// ===== Add-ons Modal Logic =====
function openAddonModal(itemId, cartId = null) {
    const item = findItemById(itemId);
    if (!item) return;

    currentModalItem = item;
    currentModalCartId = cartId; // Track if we are editing a specific cart entry
    currentModalQuantity = 1;
    selectedAddons = [];

    // If editing existing cart item, load its current state
    if (cartId) {
        const cartItem = cart.find(i => i.cartId === cartId);
        if (cartItem) {
            currentModalQuantity = cartItem.quantity;
            selectedAddons = cartItem.addons.map(a => a.id);
        }
    }

    // Reset Modal UI
    document.getElementById('modalItemName').textContent = item.name;
    document.getElementById('modalItemDesc').textContent = item.description;

    // Render Addons List
    const list = document.getElementById('addonsList');
    list.innerHTML = ADDONS.map(addon => {
        const isSelected = selectedAddons.includes(addon.id);
        return `
            <div class="addon-option ${isSelected ? 'selected' : ''}" onclick="toggleAddon('${addon.id}', this)">
                <div style="display:flex; align-items:center;">
                    <div class="addon-check"></div>
                    <span>${addon.name}</span>
                </div>
                <span style="color: var(--primary); font-weight:600;">+ ${addon.price.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }).join('');

    updateModalTotal();

    const overlay = document.getElementById('addonModalOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    logCheckoutOpen(); // Start tracking for bot detection
}

function closeAddonModal() {
    document.getElementById('addonModalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function toggleAddon(addonId, element) {
    const index = selectedAddons.indexOf(addonId);
    if (index === -1) {
        selectedAddons.push(addonId);
        element.classList.add('selected');
    } else {
        selectedAddons.splice(index, 1);
        element.classList.remove('selected');
    }
    updateModalTotal();
}

function updateModalQuantity(change) {
    const newQty = currentModalQuantity + change;
    if (newQty >= 1) {
        currentModalQuantity = newQty;
        document.getElementById('modalQuantity').textContent = currentModalQuantity;
        updateModalTotal();
    }
}

function updateModalTotal() {
    let total = currentModalItem.price;

    selectedAddons.forEach(id => {
        const addon = ADDONS.find(a => a.id === id);
        if (addon) total += addon.price;
    });

    total *= currentModalQuantity;

    const btn = document.querySelector('.add-to-order-btn');
    const label = currentModalCartId ? "SALVAR ALTERAÇÕES" : "ADICIONAR AO PEDIDO";

    if (btn) {
        btn.innerHTML = `${label} • <span id="modalTotalPrice">${total.toFixed(2).replace('.', ',')}</span>`;
    }

    document.getElementById('modalItemPrice').textContent = `${currentModalItem.price.toFixed(2).replace('.', ',')}`;
}

function confirmAddonOrder() {
    if (currentModalCartId) {
        updateCartItemAddons();
    } else {
        addToCartWithAddons();
    }
    closeAddonModal();
    trackABEvent('confirm_addon');

    // Meta Pixel: AddToCart
    if (currentModalItem) {
        trackPixelEvent('AddToCart', {
            content_name: currentModalItem.name,
            content_ids: [currentModalItem.id],
            content_type: 'product',
            value: (currentModalItem.price + (selectedAddons.length * 5)), // Estimativa simplificada ou cálculo real se preferir
            currency: 'BRL'
        });
    }
}

// ===== Add to Cart (Modified) =====
function addToCartWithAddons() {
    if (!currentModalItem) return;

    const addonsObjects = selectedAddons.map(id => ADDONS.find(a => a.id === id));

    // Create Unique ID based on addons to separate items
    const addonsKey = selectedAddons.sort().join('|');
    const uniqueCartId = `${currentModalItem.id}-${addonsKey || 'default'}`;

    const existingItem = cart.find(item => item.cartId === uniqueCartId);

    if (existingItem) {
        existingItem.quantity += currentModalQuantity;
    } else {
        cart.push({
            id: currentModalItem.id, // Original Product ID
            cartId: uniqueCartId,    // Unique combination ID
            name: currentModalItem.name,
            basePrice: currentModalItem.price,
            price: (currentModalItem.price + addonsObjects.reduce((sum, a) => sum + a.price, 0)),
            addons: addonsObjects,
            quantity: currentModalQuantity,
            observation: ''
        });
    }

    saveCart();
    updateCartUI();
    showToast(`${currentModalQuantity}x ${currentModalItem.name} atualizado!`);
}

function updateCartItemAddons() {
    if (!currentModalItem || !currentModalCartId) return;

    const addonsObjects = selectedAddons.map(id => ADDONS.find(a => a.id === id));
    const item = cart.find(i => i.cartId === currentModalCartId);

    if (item) {
        item.addons = addonsObjects;
        item.price = (item.basePrice + addonsObjects.reduce((sum, a) => sum + a.price, 0));
        item.quantity = currentModalQuantity;
    }

    saveCart();
    updateCartUI();
    showToast(`Adicionais salvos em ${currentModalItem.name}!`);
}

function addToCart(itemId) {
    // Se o item está em promoção e tem estoque, aplica o preço promocional
    const promoInfo = isPromoActive() && PROMO_CONFIG.discounts[itemId];
    if (promoInfo) {
        const item = findItemById(itemId);
        if (item) {
            const originalPrice = item.price;
            item.price = promoInfo.promoPrice; // Temporariamente aplica promo
            addDirectToCart(itemId);
            item.price = originalPrice; // Restaura o preço original no menuData
            // Corrige o basePrice no cart também
            const uniqueCartId = `${itemId}-default`;
            const cartItem = cart.find(i => i.cartId === uniqueCartId);
            if (cartItem) {
                cartItem.basePrice = promoInfo.promoPrice;
                cartItem.price = promoInfo.promoPrice;
                saveCart();
                updateCartUI();
            }
            // Desconta do estoque da promoção
            incrementPromoSold();
            const remaining = getPromoRemaining();
            if (remaining <= 0) {
                showToast('🔥 Últimas unidades esgotadas! Promoção encerrada.');
                renderMenu(); // Re-renderiza sem promos
            } else if (remaining <= 5) {
                showToast(`⚠️ Atenção! Restam apenas ${remaining} unidades na promoção!`);
            }
        }
    } else {
        addDirectToCart(itemId);
    }
    trackABEvent('direct_add');
}

// ===== Remove from Cart =====
function removeFromCart(cartId) {
    const index = cart.findIndex(item => item.cartId === cartId);
    if (index > -1) {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
    }
}

// ===== Update Cart Quantity =====
function updateQuantity(cartId, delta) {
    const item = cart.find(item => item.cartId === cartId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        removeFromCart(cartId);
    } else {
        saveCart();
        updateCartUI();
    }
}

// ===== Update Observation =====
function updateObservation(cartId, text) {
    const item = cart.find(item => item.cartId === cartId);
    if (!item) return;

    item.observation = text;
    saveCart();
}

/**
 * Atualiza apenas o estado e texto do botão de checkout
 * sem re-renderizar a lista de itens do carrinho.
 * Evita perda de foco em campos de input/textarea.
 */
function updateCheckoutButtonStatus() {
    const btn = document.getElementById('checkoutButton');
    if (!btn || cart.length === 0) return;

    if (!isStoreOpen()) {
        const sched = getSchedule();
        btn.disabled = false;
        btn.innerHTML = `<span class="whatsapp-icon">📱</span> Agendar p/ às ${sched.openHour}h${String(sched.openMinute).padStart(2, '0')}`;
    } else {
        btn.disabled = false;
        btn.innerHTML = '<span class="whatsapp-icon">📱</span> Pedir agora';
    }
}

// ===== Update Cart UI =====
function updateCartUI() {
    // Update count badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('barBadge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    const hasBurger = cart.some(item => COMBO_PROMO.burgerIds.includes(Number(item.id)));

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Seu carrinho está vazio</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">Adicione itens deliciosos!</p>
            </div>
        `;
        checkoutButton.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-header">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price-tag">
                        ${(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </div>
                </div>

                ${item.addons && item.addons.length > 0 ?
                `<div style="font-size:0.75rem; color:var(--text-secondary); margin-top: -0.5rem; margin-bottom: 0.5rem; padding-left: 2px;">
                    + ${item.addons.map(a => a.name).join(', ')}
                </div>`
                : ''}

                <div class="cart-item-main-row">
                    <div class="cart-item-controls">
                        <button class="qty-button" onclick="updateQuantity('${item.cartId}', -1)">−</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-button" onclick="updateQuantity('${item.cartId}', 1)">+</button>
                    </div>
                    
                    <button class="addon-upsell-btn" onclick="openAddonModal(${item.id}, '${item.cartId}')">
                        ✨ + Adicionais
                    </button>
                </div>

                <div class="cart-item-obs-container">
                    <textarea 
                        class="cart-item-obs" 
                        placeholder="Alguma observação? (Ex: sem cebola)"
                        rows="2"
                        oninput="updateObservation('${item.cartId}', this.value)">${item.observation || ''}</textarea>
                </div>
            </div>
        `).join('');

        updateCheckoutButtonStatus();
    }

    // Update total with Smart Promo consideration

    const subtotal = cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    const fee = orderType === 'delivery' ? getDynamicDeliveryFee() : 0;

    let discountableSubtotal = 0;
    cart.forEach(item => {
        // IDs de Combos (5001-5007) e o item da Promoção Dinâmica (se ativa) são excluídos do desconto
        const isPromotion = (Number(item.id) >= 5000 && Number(item.id) <= 5100) || (PROMO_CONFIG.active && String(item.id) === String(PROMO_CONFIG.promoProductId));
        if (!isPromotion) {
            discountableSubtotal += (item.price * item.quantity);
        }
    });

    let discountAmount = 0;
    if (PROMO_CONFIG.globalDiscountActive) {
        discountAmount = discountableSubtotal * (PROMO_CONFIG.globalDiscountPercent / 100);
    }

    let couponDiscountAmount = 0;
    if (appliedCoupon) {
        // O cupom aplica sobre o valor que restou após o desconto global, apenas para itens permitidos
        couponDiscountAmount = (discountableSubtotal - discountAmount) * (appliedCoupon.percent / 100);
    }

    const total = subtotal - discountAmount - couponDiscountAmount + fee;

    cartTotal.innerHTML = ''; // Clear safely
    const totalDiv = document.createElement('div');
    totalDiv.style.display = 'flex';
    totalDiv.style.flexDirection = 'column';
    totalDiv.style.alignItems = 'flex-end';

    if (fee > 0) {
        const sub = document.createElement('span');
        sub.style.fontSize = '0.8rem';
        sub.style.color = 'var(--text-secondary)';
        sub.style.fontFamily = "'Poppins'";
        sub.textContent = `Subtotal: ${subtotal.toFixed(2).replace('.', ',')}`;
        totalDiv.appendChild(sub);

        const deliver = document.createElement('span');
        deliver.style.fontSize = '0.8rem';
        deliver.style.color = 'var(--text-secondary)';
        deliver.style.fontFamily = "'Poppins'";
        deliver.textContent = `Entrega: ${fee.toFixed(2).replace('.', ',')}`;
        totalDiv.appendChild(deliver);
    }

    if (discountAmount > 0) {
        const disc = document.createElement('span');
        disc.style.fontSize = '0.9rem';
        disc.style.color = 'var(--neon-green)';
        disc.style.fontWeight = 'bold';
        disc.style.fontFamily = "'Poppins'";
        disc.textContent = `Desconto Global (${PROMO_CONFIG.globalDiscountPercent}%): - R$ ${discountAmount.toFixed(2).replace('.', ',')}`;
        totalDiv.appendChild(disc);
    }

    if (appliedCoupon) {
        const coup = document.createElement('span');
        coup.style.fontSize = '0.9rem';
        coup.style.color = 'var(--neon-green)';
        coup.style.fontWeight = 'bold';
        coup.style.fontFamily = "'Poppins'";
        coup.textContent = `Cupom ${appliedCoupon.code} (${appliedCoupon.percent}%): - R$ ${couponDiscountAmount.toFixed(2).replace('.', ',')}`;
        totalDiv.appendChild(coup);
    }

    const final = document.createElement('span');
    final.textContent = `${total.toFixed(2).replace('.', ',')}`;
    totalDiv.appendChild(final);

    cartTotal.appendChild(totalDiv);
}

function applyCoupon() {
    const input = document.getElementById('couponCodeInput');
    const status = document.getElementById('couponStatus');
    const code = (input.value || '').toUpperCase().trim();

    if (!PROMO_CONFIG.couponActive) {
        status.textContent = "❌ Não há cupons ativos no momento.";
        status.style.color = "#ff3131";
        appliedCoupon = null;
        updateCartUI();
        return;
    }

    if (!code) {
        status.textContent = "";
        appliedCoupon = null;
        updateCartUI();
        return;
    }

    if (code === PROMO_CONFIG.couponCode) {
        appliedCoupon = { code: code, percent: PROMO_CONFIG.couponPercent };
        status.textContent = `✅ Cupom ${code} aplicado! ${PROMO_CONFIG.couponPercent}% de desconto.`;
        status.style.color = "var(--neon-green)";
        showToast(`Cupom ${code} aplicado!`);
    } else {
        appliedCoupon = null;
        status.textContent = "❌ Cupom inválido.";
        status.style.color = "#ff3131";
    }
    updateCartUI();
}

// ===== Toggle Cart =====
function toggleCart() {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';

    if (cartSidebar.classList.contains('active')) {
        logCheckoutOpen();

        // Meta Pixel: InitiateCheckout
        trackPixelEvent('InitiateCheckout', {
            num_items: cart.length,
            value: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            currency: 'BRL'
        });
    }
}

// ===== Retired Chat Logic =====

// ===== Save/Load Cart =====
function saveCart() {
    localStorage.setItem('santaBrasaCart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('santaBrasaCart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            cart = [];
        }
    }
}

// ===== Save/Load User Data =====
function saveUserData(name, address, phone) {
    const userData = { name, address, phone };
    localStorage.setItem('santaBrasaUserData', JSON.stringify(userData));
}

function loadUserData() {
    const saved = localStorage.getItem('santaBrasaUserData');
    if (saved) {
        try {
            const { name, address, phone } = JSON.parse(saved);
            if (name) document.getElementById('clientName').value = name;
            if (address) document.getElementById('clientAddress').value = address;
            if (phone) document.getElementById('clientPhone').value = phone;
        } catch (e) {
            console.error("Erro ao carregar dados do usuário", e);
        }
    }
}

// ===== Show Toast =====
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ===== Toggle Change Input =====
function toggleChangeInput() {
    const method = document.getElementById('paymentMethod').value;
    const changeGroup = document.getElementById('changeGroup');
    changeGroup.style.display = method === 'Dinheiro' ? 'block' : 'none';
}

// ===== Delivery Fee =====
const DELIVERY_FEE = 10.00;

function getDynamicDeliveryFee() {
    const addressInput = document.getElementById('clientAddress');
    if (!addressInput) return DELIVERY_FEE;

    // Normalizar: minúsculas e remover acentos
    const address = addressInput.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Mapeamento de taxas por bairro (mais específicos primeiro)
    const feeRules = [
        // Bairros R$ 35,00
        { name: "vale dos pequis", fee: 35.00 },
        // Bairros R$ 30,00
        { name: "fazenda do calambau", fee: 30.00 },
        { name: "fundao", fee: 30.00 },
        { name: "granja gloria", fee: 30.00 },
        { name: "barragem", fee: 30.00 }, // R$ 30/50 na tabela, usando R$ 30,00 por padrão
        // Bairros R$ 25,00
        { name: "distrito industrial", fee: 25.00 },
        { name: "mamonal", fee: 25.00 },
        { name: "sumidoro", fee: 25.00 },
        { name: "vila santa maria", fee: 25.00 }, // R$ 25/50 na tabela, usando R$ 25,00 por padrão
        // Bairros R$ 20,00
        { name: "pcma", fee: 20.00 },
        // Bairros R$ 15,00
        { name: "itaunense 2", fee: 15.00 },
        { name: "itaunese 2", fee: 15.00 },
        { name: "varzea da olaria", fee: 15.00 },
        { name: "jardim marinho", fee: 15.00 },
        { name: "centenario", fee: 15.00 },
        { name: "veredas", fee: 15.00 },
        { name: "leonane", fee: 15.00 },
        { name: "santa monica", fee: 15.00 },
        { name: "vitoria", fee: 15.00 },
        { name: "piaguassu", fee: 15.00 },
        // Bairros R$ 12,00
        { name: "sao geraldo", fee: 12.00 },
        { name: "cidade nova", fee: 12.00 },
        { name: "itaunense", fee: 12.00 },
        { name: "murilo goncalves", fee: 12.00 },
        { name: "sion", fee: 12.00 },
        { name: "antunes", fee: 12.00 },
        { name: "godofredo goncalves", fee: 12.00 },
        { name: "peixotas", fee: 12.00 },
        { name: "sao bento", fee: 12.00 },
        { name: "garcias", fee: 12.00 },
        { name: "padre eustaquio", fee: 12.00 },
        { name: "tres maria", fee: 12.00 }, // Cobre "Três Marias" e "Três Maria"
        { name: "joao paulo", fee: 12.00 },
        { name: "eldorado", fee: 12.00 },
        { name: "vila vilaca", fee: 12.00 },
        { name: "olimpio moreira", fee: 12.00 },
        { name: "santiago", fee: 12.00 },
        { name: "morro do engenho", fee: 12.00 },
        { name: "morro doengenho", fee: 12.00 },
        { name: "vila tavares", fee: 12.00 },
        { name: "irmao zauler", fee: 12.00 },
        { name: "parque jardim", fee: 12.00 }
    ];

    const match = feeRules.find(rule => address.includes(rule.name));
    return match ? match.fee : DELIVERY_FEE;
}

// ===== Send to WhatsApp =====
let isSubmittingOrder = false;

async function getNextOrderNumber() {
    if (typeof firebase === 'undefined' || !firebase.apps || firebase.apps.length === 0) return "000";

    try {
        const db = firebase.database();
        const counterRef = db.ref('settings/orderCounter');

        // Timeout de 4 segundos para a transação
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 4000)
        );

        const transactionPromise = counterRef.transaction((currentValue) => {
            return (currentValue || 0) + 1;
        });

        const result = await Promise.race([transactionPromise, timeoutPromise]);

        if (result.committed) {
            return String(result.snapshot.val()).padStart(3, '0');
        }
    } catch (e) {
        console.warn("Erro ou timeout ao obter número do pedido, usando fallback:", e.message);
    }

    return Math.floor(Math.random() * 900) + 100; // Fallback aleatório seguro
}

async function sendToWhatsApp() {
    if (isSubmittingOrder) return;

    if (cart.length === 0) {
        showToast("Seu carrinho está vazio!");
        return;
    }

    // Capture form data
    const hp = document.getElementById('hp_field').value;
    const name = validateAndSanitize(document.getElementById('clientName').value, 50);
    const address = validateAndSanitize(document.getElementById('clientAddress').value, 200);
    const phone = validateAndSanitize(document.getElementById('clientPhone').value, 20);
    const payment = validateAndSanitize(document.getElementById('paymentMethod').value, 30);
    const change = validateAndSanitize(document.getElementById('changeAmount').value, 20);

    // Validation
    if (!name) { alert("Por favor, digite seu nome."); document.getElementById('clientName').focus(); return; }
    if (!address && orderType === 'delivery') { alert("Por favor, digite seu endereço de entrega."); document.getElementById('clientAddress').focus(); return; }
    if (!payment) { alert("Por favor, selecione a forma de pagamento."); document.getElementById('paymentMethod').focus(); return; }
    if (payment === 'Dinheiro' && !change) { alert("Por favor, informe para quanto é o troco."); document.getElementById('changeAmount').focus(); return; }
    if (hp || isRateLimited()) return;

    // 🚀 INÍCIO DO CHECKOUT BLINDADO
    isSubmittingOrder = true;

    // UI Feedback Imediato
    const btn = document.getElementById('checkoutButton');
    if (btn) {
        btn.classList.add('loading');
        btn.innerHTML = '<div class="spinner"></div> Enviando...';
        btn.disabled = true;
    }

    // Mostrar Modal de Transição
    const modal = document.getElementById('whatsappModal');
    if (modal) modal.style.display = 'flex';

    let redirectTriggered = false;
    let timeoutFallback = null;

    const finishCheckoutAndRedirect = (whatsappUrl, orderNum, total, tempCartItems) => {
        if (redirectTriggered) return;
        redirectTriggered = true;
        if (timeoutFallback) clearTimeout(timeoutFallback);

        // Configura link de contingência
        const fallbackLink = document.getElementById('whatsappFallbackLink');
        if (fallbackLink) fallbackLink.href = whatsappUrl;

        // Exibe botão manual após 1.8s se a página continuar aqui
        setTimeout(() => {
            const manualContent = document.getElementById('manualRedirectContent');
            if (manualContent) manualContent.style.display = 'block';
        }, 1800);

        // Limpar Carrinho e Cupom
        cart = [];
        appliedCoupon = null;
        const couponInput = document.getElementById('couponCodeInput');
        if (couponInput) couponInput.value = '';
        const couponStatus = document.getElementById('couponStatus');
        if (couponStatus) couponStatus.textContent = '';

        saveCart();
        updateCartUI();
        if (typeof toggleCart === 'function') toggleCart();

        // Meta Pixel & Log
        if (typeof trackPixelEvent === 'function') {
            trackPixelEvent('Purchase', {
                value: total,
                currency: 'BRL',
                content_type: 'product',
                content_ids: tempCartItems.map(item => item.id),
                num_items: tempCartItems.length
            });
        }
        if (typeof logEvent === 'function') logEvent(`Pedido #${orderNum} - Redirecionando...`);
        if (typeof dbIncrement === 'function') dbIncrement("total_orders_clicked");

        // Redirecionamento Inteligente
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const isMobile = /Android|webOS|iPhone|iPad|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        if (isMobile) {
            window.location.assign(whatsappUrl);
        } else {
            const win = window.open(whatsappUrl, '_blank');
            if (!win || win.closed || typeof win.closed === 'undefined') {
                window.location.href = whatsappUrl;
            }
        }
    };

    try {
        // --- 1. Obter número do pedido (rápido ou fallback) ---
        const orderNum = await getNextOrderNumber();
        saveUserData(name, address, phone);

        // --- 2. Construir Mensagem WhatsApp ---
        const hasBurger = cart.some(item => COMBO_PROMO.burgerIds.includes(Number(item.id)));
        let message = `🍔 *PEDIDO SANTA BRASA #${orderNum}* 🔥\n`;

        if (!isStoreOpen()) {
            const sched = getSchedule();
            message += `⚠️ *AGENDAMENTO (Abre às ${sched.openHour}h${String(sched.openMinute).padStart(2, '0')})*\n`;
        }
        message += `👤 *Cliente:* ${name}\n`;
        if (phone) message += `📞 *Tel:* ${phone}\n`;
        message += `🛒 *Tipo:* ${orderType === 'delivery' ? 'Entrega 🛵' : 'Retirada 🛍️'}\n`;
        message += "━━━━━━━━━━━━━━━━━━\n\n";

        cart.forEach((item) => {
            message += `▸ ${item.quantity}x ${item.name}\n`;
            if (item.addons && item.addons.length > 0) {
                item.addons.forEach(addon => { message += `   + ${addon.name}\n`; });
            }
            if (item.observation) { message += `   📝 _Obs: ${item.observation}_\n`; }
            message += `   R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
        });

        const subtotal = cart.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        const fee = orderType === 'delivery' ? getDynamicDeliveryFee() : 0;

        let discountableSubtotal = 0;
        cart.forEach(item => {
            const isPromotion = (Number(item.id) >= 5000 && Number(item.id) <= 5100) || (PROMO_CONFIG.active && String(item.id) === String(PROMO_CONFIG.promoProductId));
            if (!isPromotion) {
                discountableSubtotal += (item.price * item.quantity);
            }
        });

        let discountAmount = 0;
        if (PROMO_CONFIG.globalDiscountActive) {
            discountAmount = discountableSubtotal * (PROMO_CONFIG.globalDiscountPercent / 100);
        }

        let couponDiscountAmount = 0;
        if (appliedCoupon) {
            couponDiscountAmount = (discountableSubtotal - discountAmount) * (appliedCoupon.percent / 100);
        }

        message += "\n━━━━━━━━━━━━━━━━━━\n";
        message += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
        if (discountAmount > 0) message += `🔥 Desconto Global (${PROMO_CONFIG.globalDiscountPercent}%): - R$ ${discountAmount.toFixed(2).replace('.', ',')}\n`;

        if (appliedCoupon) {
            message += `🎫 Cupom ${appliedCoupon.code} (${appliedCoupon.percent}%): - R$ ${couponDiscountAmount.toFixed(2).replace('.', ',')}\n`;
        }

        if (fee > 0) message += `Taxa de Entrega: R$ ${fee.toFixed(2).replace('.', ',')}\n`;

        const total = subtotal - discountAmount - couponDiscountAmount + fee;
        message += `*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;

        if (orderType === 'delivery') {
            message += "📍 *ENTREGA:*\n";
            message += `${address}\n\n`;
        } else {
            message += "📍 *RETIRADA EM:* \n";
            message += `Rua Marechal Deodoro, 398\n\n`;
        }

        message += "💰 *PAGAMENTO:*\n";
        message += `${payment}`;
        if (payment === 'Dinheiro') { message += `\n💵 Troco para: R$ ${change}`; }

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
        const tempCartItems = [...cart];

        // --- 3. SAFETY TIMEOUT (Proteção contra lentidão do Firebase) ---
        // Se em 1.5 segundos não conseguirmos salvar no banco, pulamos direto para o WhatsApp
        timeoutFallback = setTimeout(() => {
            console.warn("Safety Timeout Triggered - Redirecionando...");
            finishCheckoutAndRedirect(whatsappUrl, orderNum, total, tempCartItems);
        }, 1500);

        // --- 4. Salvar no Firebase (Opcional, não bloqueante se falhar) ---
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            const db = firebase.database();
            const orderId = Date.now();
            const orderData = {
                id: orderId,
                orderNumber: orderNum,
                timestamp: new Date().toISOString(),
                customer: { name, phone, address: orderType === 'delivery' ? address : 'RETIRADA' },
                items: tempCartItems.map(item => ({
                    name: item.name, quantity: item.quantity, price: item.price,
                    addons: item.addons ? item.addons.map(a => a.name) : [],
                    observation: item.observation || ''
                })),
                total: total, orderType: orderType, payment: payment
            };

            const customerKey = name.toLowerCase().replace(/[.#$\[\]\s]/g, '_');

            // Tenta salvar e redirecionar assim que concluir
            Promise.all([
                db.ref('orders/' + orderId).set(orderData),
                db.ref('customers/' + customerKey).transaction((current) => {
                    if (!current) return { name, phone: phone || '', address: orderType === 'delivery' ? address : '', totalSpent: total, orderCount: 1, lastOrder: orderData.timestamp };
                    current.totalSpent = (current.totalSpent || 0) + total;
                    current.orderCount = (current.orderCount || 0) + 1;
                    current.lastOrder = orderData.timestamp;
                    return current;
                })
            ]).then(() => {
                finishCheckoutAndRedirect(whatsappUrl, orderNum, total, tempCartItems);
            }).catch((err) => {
                console.error("Firebase save failed:", err);
                finishCheckoutAndRedirect(whatsappUrl, orderNum, total, tempCartItems);
            });
        } else {
            finishCheckoutAndRedirect(whatsappUrl, orderNum, total, tempCartItems);
        }

    } catch (error) {
        console.error("Critical checkout error:", error);
        // Em caso de erro crítico na construção da mensagem ou lógica, limpamos o estado para permitir nova tentativa
        isSubmittingOrder = false;
        if (btn) {
            btn.classList.remove('loading');
            btn.disabled = false;
            btn.innerHTML = '<span class="whatsapp-icon">📱</span> Tentar novamente';
        }
        if (modal) modal.style.display = 'none';
        alert("Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.");
    }
}

// ╔════════════════════════════════════════════════════════════════╗
// ║  ⚙️ MONITORAMENTO LIVE (TRACKER)                                ║
// ║  Instruções: Copie as chaves do seu projeto Firebase abaixo     ║
// ╚════════════════════════════════════════════════════════════════╝
const firebaseConfig = {
    apiKey: "AIzaSyCUj8OC1NUnPiAHLLbRpKCEVFOG1Xf8q3A",
    authDomain: "metric-s-939ee.firebaseapp.com",
    databaseURL: "https://metric-s-939ee-default-rtdb.firebaseio.com",
    projectId: "metric-s-939ee",
    storageBucket: "metric-s-939ee.firebasestorage.app",
    messagingSenderId: "814379379973",
    appId: "1:814379379973:web:eb1535e2301c1366bb5b6c"
};

// Funções de Fallback e Incremento (Definidas antes do uso)
window.dbIncrement = () => { };
window.logEvent = () => { };

if (firebaseConfig.apiKey !== "SUA_API_KEY_AQUI") {
    try {
        // Inicializar Firebase
        const app = (!firebase.apps || !firebase.apps.length) ? firebase.initializeApp(firebaseConfig) : firebase.app();
        const db = app.database();
        const today = new Date().toISOString().split('T')[0]; // Define hoje globalmente para o tracker

        // 1. Função para Incrementar Métricas (Baseado em DATA)
        window.dbIncrement = function (metricPath) {
            db.ref(`metrics/${today}/${metricPath}`).transaction(current => (current || 0) + 1)
                .catch(err => console.error("Erro ao incrementar métrica:", metricPath, err));

            // Incrementar também o total histórico para compatibilidade
            db.ref(`metrics/totals/${metricPath}`).transaction(current => (current || 0) + 1);
        }

        // 2. Função para Logar Atividade
        window.logEvent = function (msg) {
            console.log("Logando evento:", msg);
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            db.ref('logs').push({ time, msg }).catch(err => console.error("Erro ao logar evento:", err));
        }

        // 3. Monitoramento de Conexão e Presença
        const connectedRef = db.ref('.info/connected');
        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                console.log("✅ Tracker Conectado ao Firebase.");

                // initChat(); // Retired chat

                // Registro de Presença (Contar como cliente)
                const myPresenceRef = db.ref('presence/users').push();
                myPresenceRef.onDisconnect().remove();
                myPresenceRef.set(true);

                // Log de conexão (Removido guard de sessão para teste)
                logEvent("Visitante conectou ao site");

                // NOVO: Diagnóstico Mobile no Log do Banco
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (isMobile) {
                    logEvent("📱 Cliente conectado via dispositivo móvel");
                }

                dbIncrement("total_visits");

                // Sincronização de Promoções em Tempo Real
                db.ref('settings/promotions').on('value', (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        PROMO_CONFIG.active = data.active || false;
                        PROMO_CONFIG.label = data.label || "🔥 20% OFF SÓ AGORA!";
                        PROMO_CONFIG.totalStock = data.initialStock || 15;
                        PROMO_CONFIG.promoPrice = data.promoPrice || 38.90;
                        PROMO_CONFIG.promoProductId = data.productId || '8';
                        PROMO_CONFIG.decayMinutes = data.decayMinutes || 25;
                        PROMO_CONFIG.lastUpdate = data.lastUpdate || new Date().toISOString();
                        PROMO_CONFIG.showStock = data.showStock !== false;
                        PROMO_CONFIG.showTimer = data.showTimer !== false;
                        PROMO_CONFIG.globalDiscountActive = data.globalDiscountActive || false;
                        PROMO_CONFIG.globalDiscountPercent = data.globalDiscountPercent || 15;

                        console.log("🔄 Configurações de Marketing sincronizadas.");
                        renderMenu(); // Re-renderiza para aplicar mudanças visuais
                    }
                });

                console.log("📊 Incremento de visita e log de presença enviados.");
            } else {
                console.warn("⚠️ Tracker Desconectado do Firebase.");
            }
        });

        // Listener para o Status da Loja (Manual/Auto Override) - Reatividade Total
        db.ref('settings/storeStatus').on('value', (snapshot) => {
            const status = snapshot.val();
            if (status) {
                manualStoreStatus = status;
                localStorage.setItem('sb_manual_status', status); // Persiste para carregamento instantâneo
                updateStoreStatus();
                console.log("🔄 Status da loja sincronizado (Real-time):", status);
            }
        }, (err) => {
            console.error("Erro ao sincronizar status da loja:", err);
            // Em caso de erro de rede no mobile, o LocalStorage garante que o último estado seja mantido
        });

    } catch (error) {
        console.error("❌ Falha crítica no tracker:", error);
    }
} else {
    console.warn("ℹ️ Tracker: Chaves do Firebase não configuradas.");
}



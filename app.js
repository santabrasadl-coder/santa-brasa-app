function getSchedule(date = new Date()) {
    const day = date.getDay(); // 0(Dom), 1(Seg), ..., 6(Sáb)
    // Meio de semana: Mon-Thu (1, 2, 3, 4) -> 18h-23h
    // Final de semana: Fri-Sun (5, 6, 0) -> 18h-03h
    const isWeekend = (day === 0 || day === 5 || day === 6);

    return {
        openHour: 18,
        openMinute: 0,
        closeHour: isWeekend ? 3 : 23,
        closeMinute: 0
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

let manualStoreStatus = "auto"; // "open", "closed" ou "auto"

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
        // Normal - Ex: Abre 18h, Fecha 23h
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
                openingInfoNeon.textContent = "Entrega em toda cidade! 🛵";
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
    updateCartUI();
}

// Atualiza o status frequentemente para o cronômetro
setInterval(updateStoreStatus, 1000);

// ===== Promoção Maluca =====
const CRAZY_PROMO = {
    active: true,
    label: "🔥 OFERTA SANTO JUÍZO",
    totalStock: 30,       // Estoque total compartilhado
    storageKey: 'sb_santo_juizo_promo_v1',
    discounts: {
        8: { promoPrice: 39.90 } // Santo Juízo
    }
};

function getPromoSold() {
    return parseInt(localStorage.getItem(CRAZY_PROMO.storageKey) || '16', 10);
}

function getPromoRemaining() {
    return Math.max(0, CRAZY_PROMO.totalStock - getPromoSold());
}

function isPromoActive() {
    return CRAZY_PROMO.active && getPromoRemaining() > 0;
}

function incrementPromoSold() {
    const sold = getPromoSold() + 1;
    localStorage.setItem(CRAZY_PROMO.storageKey, sold);
    updatePromoBannerStock();
}

function updatePromoBannerStock() {
    const remaining = getPromoRemaining();
    const stockEl = document.getElementById('cpb-stock-count');
    if (stockEl) {
        stockEl.textContent = String(remaining).padStart(2, '0');
        if (remaining <= 5) stockEl.closest('.cpb-stock-badge').classList.add('cpb-stock-critical');
    }
    // Se zerou, re-renderiza o menu para remover as ribbons/promos
    if (remaining <= 0) {
        renderMenu();
    }
}

// ===== Menu Data =====
const menuData = {
    tradicionais: [
        {
            id: 1,
            name: "X-Salada",
            description: "Pão, Hambúrguer Artesanal, Queijo, Alface, Tomate e Maionese Especial.",
            price: 24.00
        },
        {
            id: 2,
            name: "Vegetariano",
            description: "Pão, 2 ovos, Dobro de Queijo, Milho, Alface, Tomate e Maionese Especial.",
            price: 24.00
        },
        {
            id: 3,
            name: "X-Egg",
            description: "Pão, Hambúrguer Artesanal, Ovo, Dobro de Queijo, Alface, Tomate e Maionese Especial.",
            price: 27.00
        },
        {
            id: 4,
            name: "X-Bacon",
            description: "Pão, Hambúrguer Artesanal, Bacon, Queijo, Alface, Tomate e Maionese Especial.",
            price: 30.00
        },
        {
            id: 5,
            name: "Laçador",
            description: "Pão, Hambúrguer Artesanal, Bacon, Milho, Dobro de Queijo, Alface, Tomate e Maionese Artesanal.",
            price: 32.00
        },
        {
            id: 6,
            name: "X-Egg Bacon",
            description: "Pão, Hambúrguer Artesanal, Bacon, Ovo, Mussarela, Alface, Tomate e Molho Especial.",
            price: 32.00
        }
    ],
    especiais: [
        {
            id: 7,
            name: "Santa Fúria",
            description: "Quando a fome perde a paciência: Dois Hambúrgueres Artesanais, Ovo, Tomate, Frango Desfiado, Bacon, Triplo de Queijo, Milho, Alface e Maionese Especial.",
            price: 48.00,
            badge: "O MAIOR! 🔥",
            image: "santa_furia.png"
        },
        {
            id: 8,
            name: "Santo Juízo",
            description: "Um verdadeiro tribunal de sabores: Hambúrguer Suculento, Frango Grelhado, Bacon Suculento, Ovo, Triplo de Queijo, Milho, Alface, Tomate e Maionese Especial.",
            price: 44.00,
            badge: "MAIS VENDIDO 🏆",
            image: "santo_juizo.png"
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
            price: 42.00,
            soldOut: true
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

    // Log initial group
    const group = getABTestGroup();
    console.log(`[AB TEST] User assigned to group: ${group}`);
    trackABEvent('visit');
});

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

// ===== Direct Add to Cart (for Drinks) =====
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

    // Only track direct_add if it wasn't triggered by a Skip Modal event (which handles its own better tracking)
    if (!arguments[1]) {
        trackABEvent('direct_add');
    }
}

// ===== Render Promo Banner =====
function renderPromoBanner() {
    if (!CRAZY_PROMO.active) return;

    const section = document.getElementById('tradicionais')?.closest('.menu-section');
    if (!section) return;

    // Remove banner antigo para re-renderizar (caso estoque mude)
    const existing = document.getElementById('crazy-promo-banner');
    if (existing) existing.remove();

    const remaining = getPromoRemaining();
    const promoEnded = remaining <= 0;

    const banner = document.createElement('div');
    banner.id = 'crazy-promo-banner';
    banner.className = 'crazy-promo-banner' + (promoEnded ? ' promo-ended' : '');
    banner.innerHTML = promoEnded ? `
        <div class="cpb-inner">
            <div class="cpb-tag cpb-tag-ended">PROMOÇÃO ENCERRADA</div>
            <h2 class="cpb-title cpb-title-ended">😢 Acabou! As 30 Unidades Foram!</h2>
            <p class="cpb-subtitle">Mas nossos lanches continuam incríveis. Volte em breve!</p>
        </div>
    ` : `
        <div class="cpb-lightning">⚡</div>
        <div class="cpb-lightning cpb-lightning-right">⚡</div>
        <div class="cpb-inner">
            <div class="cpb-tag">OFERTA EXCLUSIVA</div>
            <h2 class="cpb-title">🔥 PROMOÇÃO SANTO JUÍZO! 🔥</h2>
            <p class="cpb-subtitle">Experimente o nosso mais vendido com um desconto especial!</p>
            <div class="cpb-prices">
                <div class="cpb-price-item">
                    <span class="cpb-item-name">Santo Juízo</span>
                    <span class="cpb-old-price">44,00</span>
                    <span class="cpb-new-price">39,90</span>
                </div>
            </div>

            <!-- Restam X de 30 + Countdown -->
            <div class="cpb-urgency-row">
                <div class="cpb-stock-badge ${remaining <= 5 ? 'cpb-stock-critical' : ''}">
                    <span class="cpb-stock-txt">restão apenas</span>
                    <span class="cpb-stock-big" id="cpb-stock-count">${String(remaining).padStart(2, '0')}</span>
                    <span class="cpb-stock-of">de 30</span>
                </div>
            </div>

            <div class="cpb-footer">Válido enquanto durarem os estoques • Peça já! 🚀</div>
        </div>
    `;

    section.insertAdjacentElement('beforebegin', banner);
}


function renderMenu() {
    Object.keys(menuData).forEach(category => {
        const container = document.getElementById(category);
        if (!container) return;

        container.innerHTML = menuData[category].map(item => {
            let clickAction = '';
            // Determine which function to call based on category
            if (category === 'bebidas' || category === 'sobremesas' || category === 'bolos') {
                clickAction = `addDirectToCart(${item.id})`;
            } else {
                clickAction = `addToCart(${item.id})`;
            }

            // Verifica se o item está em promoção (e tem estoque)
            const promoInfo = isPromoActive() && CRAZY_PROMO.discounts[item.id];
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
            <div class="menu-item ${item.soldOut ? 'sold-out' : ''} ${item.image ? 'has-image' : ''} ${promoInfo ? 'item-on-promo' : ''}" data-id="${item.id}">
                ${item.soldOut ? '<div class="sold-out-ribbon">ESGOTADO</div>' : ''}
                ${promoInfo ? '<div class="promo-ribbon">🔥 PROMOÇÃO</div>' : ''}
                
                ${item.image ? `
                <div class="item-visual" onclick="openAddonModal(${item.id})">
                    <img src="${item.image}" alt="${item.name}" class="item-image-premium" loading="lazy">
                </div>
                ` : ''}

                <div class="item-info">
                    <h3 class="item-name">
                        ${item.name}
                        ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ''}
                        ${promoInfo ? `<span class="item-badge promo-badge-item">${CRAZY_PROMO.label}</span>` : ''}
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
    const promoInfo = isPromoActive() && CRAZY_PROMO.discounts[itemId];
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

// ===== Update Cart UI =====
function updateCartUI() {
    // Update count badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('barBadge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

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
                    <div class="cart-item-price-tag">${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
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
                    <input type="text" 
                        class="cart-item-obs" 
                        placeholder="Alguma observação? (Ex: sem cebola)"
                        value="${item.observation || ''}"
                        oninput="updateObservation('${item.cartId}', this.value)">
                </div>
            </div>
        `).join('');
        // Update checkout button state
        if (!isStoreOpen()) {
            const sched = getSchedule();
            checkoutButton.disabled = false;
            checkoutButton.innerHTML = `<span class="whatsapp-icon">📱</span> Agendar p/ às ${sched.openHour}h${String(sched.openMinute).padStart(2, '0')}`;
        } else {
            checkoutButton.disabled = false;
            checkoutButton.innerHTML = '<span class="whatsapp-icon">📱</span> Pedir agora';
        }
    }

    // Update total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const fee = orderType === 'delivery' ? getDynamicDeliveryFee() : 0;
    const total = subtotal + fee;

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

    const final = document.createElement('span');
    final.textContent = `${total.toFixed(2).replace('.', ',')}`;
    totalDiv.appendChild(final);

    cartTotal.appendChild(totalDiv);
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

    // Lista de bairros com taxa de R$ 13,00
    const specialBairros = [
        "varzea da olaria", "garcias", "cidade nova", "aeroporto", "aeroporoto",
        "santanense", "itaunense 1", "itaunense 2", "tres marias"
    ];

    const isSpecial = specialBairros.some(bairro => address.includes(bairro));
    return isSpecial ? 13.00 : DELIVERY_FEE;
}

// ===== Send to WhatsApp =====
let isSubmittingOrder = false;

function sendToWhatsApp() {
    if (isSubmittingOrder) return;

    // We no longer block if store is closed, we treat as agendamento
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

    // Security Checks
    if (hp) {
        console.warn("Bot detected via honeypot.");
        return;
    }

    if (isRateLimited()) {
        alert("Muitas tentativas. Por favor, aguarde um minuto.");
        return;
    }

    const submissionTime = Date.now() - checkoutOpenTime;
    if (submissionTime < 1000) { // Humans rarely fill and click in < 1s (reduced from 2s)
        console.warn("Action too fast, potential bot.");
    }

    // Validation
    if (!name) {
        alert("Por favor, digite seu nome.");
        document.getElementById('clientName').focus();
        return;
    }
    // Phone is no longer mandatory to reduce friction
    if (!address && orderType === 'delivery') {
        alert("Por favor, digite seu endereço de entrega.");
        document.getElementById('clientAddress').focus();
        return;
    }
    if (!payment) {
        alert("Por favor, selecione a forma de pagamento.");
        document.getElementById('paymentMethod').focus();
        return;
    }
    if (payment === 'Dinheiro' && !change) {
        alert("Por favor, informe para quanto é o troco.");
        document.getElementById('changeAmount').focus();
        return;
    }

    // Marca como enviando AGORA, após todas as validações passarem
    isSubmittingOrder = true;
    setTimeout(() => { isSubmittingOrder = false; }, 4000);

    // Salvar dados para a próxima compra
    saveUserData(name, address, phone);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const fee = orderType === 'delivery' ? getDynamicDeliveryFee() : 0;
    const total = subtotal + fee;

    const sched = getSchedule();
    let message = `🍔 *PEDIDO SANTA BRASA* 🔥\n`;
    if (!isStoreOpen()) {
        message += `⚠️ *AGENDAMENTO (Abre às ${sched.openHour}h${String(sched.openMinute).padStart(2, '0')})*\n`;
    }
    message += `👤 *Cliente:* ${name}\n`;
    if (phone) message += `📞 *Tel:* ${phone}\n`;
    message += `🛒 *Tipo:* ${orderType === 'delivery' ? 'Entrega 🛵' : 'Retirada 🛍️'}\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";

    cart.forEach(item => {
        message += `▸ ${item.quantity}x ${item.name}\n`;

        if (item.addons && item.addons.length > 0) {
            item.addons.forEach(addon => {
                message += `   + ${addon.name}\n`;
            });
        }

        if (item.observation) {
            message += `   📝 _Obs: ${item.observation}_\n`;
        }
        message += `   R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });

    message += "\n━━━━━━━━━━━━━━━━━━\n";
    message += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    if (fee > 0) message += `Taxa de Entrega: R$ ${fee.toFixed(2).replace('.', ',')}\n`;
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

    if (payment === 'Dinheiro') {
        message += `\n💵 Troco para: R$ ${change}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // On mobile, window.location.href is more reliable and avoids popup blockers
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const finishCheckoutAndRedirect = () => {
        // Meta Pixel: Purchase/Lead (WhatsApp Click)
        trackPixelEvent('Purchase', {
            value: total,
            currency: 'BRL',
            content_type: 'product',
            content_ids: cart.map(item => item.id),
            num_items: cart.length
        });

        // Log do Pedido para o Dashboard (Métricas legadas)
        logEvent("Iniciou pedido via WhatsApp");
        dbIncrement("total_orders_clicked");
        trackABEvent('checkout_whatsapp');

        if (isMobile) {
            window.location.href = whatsappUrl;
        } else {
            window.open(whatsappUrl, '_blank');
        }
    };

    // --- SALVAR PEDIDO NO CRM (FIREBASE) ---
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            const db = firebase.database();
            const orderId = Date.now();
            const orderData = {
                id: orderId,
                timestamp: new Date().toISOString(),
                customer: {
                    name,
                    phone,
                    address: orderType === 'delivery' ? address : 'RETIRADA'
                },
                items: cart.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    addons: item.addons ? item.addons.map(a => a.name) : [],
                    observation: item.observation || ''
                })),
                total: total,
                orderType: orderType,
                payment: payment
            };

            const customerKey = name.toLowerCase().replace(/\s+/g, '_');
            
            // Promise.all para registrar ambas ações no Firebase
            const savePromises = Promise.all([
                db.ref('orders/' + orderId).set(orderData),
                db.ref('customers/' + customerKey).transaction((current) => {
                    if (!current) {
                        return {
                            name: name,
                            phone: phone || '',
                            address: orderType === 'delivery' ? address : '',
                            totalSpent: total,
                            orderCount: 1,
                            lastOrder: orderData.timestamp
                        };
                    } else {
                        current.totalSpent = (current.totalSpent || 0) + total;
                        current.orderCount = (current.orderCount || 0) + 1;
                        current.lastOrder = orderData.timestamp;
                        if (phone) current.phone = phone;
                        if (orderType === 'delivery' && address) current.address = address;
                        return current;
                    }
                })
            ]);

            if (isMobile) {
                // Mobile: Esperar a promessa do firebase resolver ANTES de mudar a página
                // (Evita matar a conexão web-socket antes do pedido chegar ao dash)
                const timeoutFallback = setTimeout(() => { finishCheckoutAndRedirect(); }, 2500); 
                savePromises.then(() => {
                    clearTimeout(timeoutFallback);
                    logEvent(`Pedido registrado no CRM: R$ ${total.toFixed(2)}`);
                    finishCheckoutAndRedirect();
                }).catch((e) => {
                    clearTimeout(timeoutFallback);
                    console.error("Erro Promise CRM:", e);
                    finishCheckoutAndRedirect();
                });
            } else {
                // Desktop: window.open síncrono por conta do Popup Blocker.
                // Salva no background sem problema pq a aba original não fecha!
                savePromises.then(() => {
                    logEvent(`Pedido registrado no CRM: R$ ${total.toFixed(2)}`);
                }).catch(e => console.error("Erro assincrono Desktop CRM:", e));
                finishCheckoutAndRedirect();
            }

        } else {
            console.warn("Sem firebase, pulando envio");
            finishCheckoutAndRedirect();
        }
    } catch (e) {
        console.error("Erro crítico ao salvar no CRM:", e);
        finishCheckoutAndRedirect();
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
        const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
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
                dbIncrement("total_visits");
                console.log("📊 Incremento de visita e log de presença enviados.");
            } else {
                console.warn("⚠️ Tracker Desconectado do Firebase.");
            }
        });

        // Listener para o Status da Loja (Manual/Auto Override) - Fora do loop para evitar duplicatas
        db.ref('settings/storeStatus').on('value', (snapshot) => {
            const status = snapshot.val();
            if (status) {
                manualStoreStatus = status;
                updateStoreStatus();
                console.log("🔄 Status da loja atualizado (Real-time):", status);
            }
        });

    } catch (error) {
        console.error("❌ Falha crítica no tracker:", error);
    }
} else {
    console.warn("ℹ️ Tracker: Chaves do Firebase não configuradas.");
}



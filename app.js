const CLOSE_HOUR = 22;
const CLOSE_MINUTE = 30;
const WHATSAPP_NUMBER = "553799982046";

function isStoreOpen() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Converte tudo para minutos do dia para facilitar comparação
    const currentMinutes = (hours * 60) + minutes;
    const closeMinutes = (CLOSE_HOUR * 60) + CLOSE_MINUTE;

    return currentMinutes < closeMinutes;
}

// ===== Função para Atualizar Status Visual =====
function updateStoreStatus() {
    const statusText = document.querySelector('.status-text');
    const statusBar = document.querySelector('.status-bar');
    const headerTimer = document.getElementById('headerClosingTimer');

    if (!statusText || !statusBar || !headerTimer) return;

    const open = isStoreOpen();

    if (open) {
        statusText.textContent = 'ABERTO';
        statusBar.classList.remove('closed');
        statusBar.classList.add('open');

        // Cálculo do tempo para fechar
        const now = new Date();
        const closeTime = new Date();
        closeTime.setHours(CLOSE_HOUR, CLOSE_MINUTE, 0);

        const diffMs = closeTime - now;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes <= 60 && diffMinutes > 0) {
            headerTimer.textContent = `🚨 FECHA EM ${diffMinutes} MINUTOS`;
            headerTimer.style.display = 'block';
            statusBar.classList.add('closing-soon');
        } else {
            headerTimer.style.display = 'none';
            statusBar.classList.remove('closing-soon');
        }
    } else {
        statusText.textContent = 'FECHADO';
        statusBar.classList.remove('open', 'closing-soon');
        statusBar.classList.add('closed');
        headerTimer.style.display = 'none';
    }
    updateCartUI();
}

// Atualiza o status a cada minuto
setInterval(updateStoreStatus, 60000);

// ===== Menu Data =====
const menuData = {
    promocoes: [
        {
            id: 8,
            name: "Santo Juízo (OFERTA RELÂMPAGO ⚡)",
            description: "Hambúrguer Suculento, Frango Desfiado, Bacon Suculento, Ovo, Triplo de Queijo, Milho e Salada. Molho especial!",
            price: 38.90,
            badge: "PROMOÇÃO 🔥",
            badgeClass: "badge-gold",
            isFlash: true
        },
        {
            id: 1002,
            name: "Dupla Egg Bacon",
            description: "2x X-Egg Bacon (O favorito!). Pão, Burger, Bacon Suculento, Ovo, Queijo e Salada.",
            price: 54.90,
            badge: "CLÁSSICO EM DOBRO",
            badgeClass: "badge-gold"
        },
        {
            id: 4002,
            name: "Santo Juízo + Mini Pudim",
            description: "1x Santo Juízo (O Completo) + 1x Mini Pudim Cremoso. Satisfação garantida.",
            price: 52.90,
            badge: "COM PUDIM 🍮",
            badgeClass: "badge-gold"
        },
        {
            id: 4005,
            name: "Santa Fúria + Coca-Cola",
            description: "1x Santa Fúria (O Gigante) + 1x Coca-Cola Lata 350ml. Mate sua fome!",
            price: 49.90,
            badge: "O BRABO 🔥",
            badgeClass: "badge-gold"
        }
    ],
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
            price: 32.00,
            badge: "MAIS VENDIDO 🏆"
        }
    ],
    especiais: [
        {
            id: 7,
            name: "Santa Fúria",
            description: "Quando a fome perde a paciência: Dois Hambúrgueres Artesanais, Ovo, Tomate, Frango Desfiado, Bacon, Triplo de Queijo, Milho, Alface e Maionese Especial.",
            price: 46.00,
            badge: "MAIS VENDIDO 🏆"
        },
        {
            id: 8,
            name: "Santo Juízo",
            description: "Um verdadeiro tribunal de sabores: Hambúrguer Suculento, Frango Desfiado, Bacon Suculento, Ovo, Triplo de Queijo, Milho, Alface, Tomate e Maionese Especial.",
            price: 44.00,
            badge: "MAIS VENDIDO 🏆"
        },
        {
            id: 9,
            name: "Milagre Cremoso",
            description: "O sabor que faz milagre: Frango Desfiado, Bacon Suculento, Triplo de Queijo, Milho e Maionese Especial.",
            price: 40.00
        },
        {
            id: 10,
            name: "Dom Contra",
            description: "Carne nobre, sabor marcante: Pão, Contrafilé, Bacon, Ovo, Dobro de Queijo, Salada e Molho Especial.",
            price: 42.00
        }
    ],
    sobremesas: [
        {
            id: 2001,
            name: "Mini Pudim Tradicional 150g",
            description: "150g. O melhor pudim da cidade! Cremoso, sem furinhos e com calda de caramelo especial.",
            price: 15.00,
            badge: "NOVIDADE ✨"
        }
    ],
    bolos: [
        {
            id: 3001,
            name: "Bolo de Maracujá com Chocolate",
            description: "Fatia generosa. Massa fofinha de chocolate recheada com mousse de maracujá.",
            price: 18.00,
            badge: "NOVIDADE ✨"
        },
        {
            id: 3002,
            name: "Bolo de Chocolate",
            description: "Fatia generosa. Massa de chocolate fofinha com recheio de chocolate ao leite e cobertura de chocolate meio amargo.",
            price: 18.00,
            badge: "NOVIDADE ✨"
        },
        {
            id: 3003,
            name: "Bolo de Cenoura com Chocolate",
            description: "Fatia generosa. Massa de cenoura fresquinha com aquela cobertura de chocolate que crackela.",
            price: 18.00,
            badge: "NOVIDADE ✨"
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
    { id: 'bacon', name: 'Bacon Extra', price: 8.00 },
    { id: 'queijo', name: 'Queijo Extra', price: 5.00 },
    { id: 'ovo', name: 'Ovo Extra', price: 4.00 },
    { id: 'maionese', name: 'Maionese da Casa', price: 3.00 },
    { id: 'abacaxi', name: 'Abacaxi', price: 3.00 },
    { id: 'banana', name: 'Banana', price: 3.00 }
];

// ===== Cart State & Modal State =====
let cart = [];
let currentModalItem = null;
let currentModalQuantity = 1;
let selectedAddons = [];

// ===== WhatsApp Number (configure here) =====
// O WHATSAPP_NUMBER agora é gerenciado globalmente no topo do arquivo

// ===== DOM Elements =====
const cartButton = document.getElementById('cartButton');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutButton = document.getElementById('checkoutButton');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    updateStoreStatus();  // Atualiza status OPEN/CLOSED
    renderMenu();
    loadCart();
    loadUserData(); // Carrega dados salvos do cliente
    updateCartUI();
    startFlashSaleCountdown(); // Inicia cronômetro da oferta
});

// ===== Direct Add to Cart (for Drinks) =====
function addDirectToCart(itemId) {
    if (!isStoreOpen()) {
        showToast("Ops! A loja está fechada no momento.");
        return;
    }
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
}

// ===== Render Menu =====
function renderMenu() {
    Object.keys(menuData).forEach(category => {
        const container = document.getElementById(category);
        if (!container) return;

        container.innerHTML = menuData[category].map(item => {
            let clickAction = '';
            // Determine which function to call based on category
            if (category === 'bebidas' || category === 'sobremesas' || category === 'bolos') {
                clickAction = `addDirectToCart(${item.id})`;
            } else if (category === 'promocoes') {
                clickAction = `handlePromoClick(${item.id})`;
            } else {
                clickAction = `openAddonModal(${item.id})`;
            }

            return `
            <div class="menu-item ${item.isFlash ? 'flash-item' : ''}" data-id="${item.id}">
                <div class="item-info">
                    <h3 class="item-name">${item.name} ${item.badge ? `<span class="item-badge ${item.badgeClass || ''}">${item.badge}</span>` : ''}</h3>
                    <p class="item-description">${item.description}</p>
                </div>
                <div class="menu-item-actions">
                    <span class="item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                    <button class="add-button" onclick="${clickAction}" aria-label="Adicionar ${item.name}">
                        +
                    </button>
                </div>
            </div>
            `;
        }).join('');
    });
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
function openAddonModal(itemId) {
    if (!isStoreOpen()) {
        showToast("Ops! A loja está fechada no momento.");
        return;
    }
    const item = findItemById(itemId);
    if (!item) return;

    currentModalItem = item;
    currentModalQuantity = 1;
    selectedAddons = [];

    // Reset Modal UI
    document.getElementById('modalItemName').textContent = item.name;
    document.getElementById('modalItemDesc').textContent = item.description;

    // Render Addons List
    const list = document.getElementById('addonsList');
    list.innerHTML = ADDONS.map(addon => `
        <div class="addon-option" onclick="toggleAddon('${addon.id}', this)">
            <div style="display:flex; align-items:center;">
                <div class="addon-check"></div>
                <span>${addon.name}</span>
            </div>
            <span style="color: var(--primary); font-weight:600;">+ R$ ${addon.price.toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');

    updateModalTotal();

    const overlay = document.getElementById('addonModalOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
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

    document.getElementById('modalTotalPrice').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    document.getElementById('modalItemPrice').textContent = `R$ ${currentModalItem.price.toFixed(2).replace('.', ',')}`;
}

function confirmAddonOrder() {
    addToCartWithAddons();
    closeAddonModal();
}

// ===== Add to Cart (Modified) =====
function addToCartWithAddons() {
    if (!currentModalItem) return;

    const addonsObjects = selectedAddons.map(id => ADDONS.find(a => a.id === id));

    // Create Unique ID based on addons to separate items
    const addonsKey = selectedAddons.sort().join('|');
    const uniqueCartId = `${currentModalItem.id}-${addonsKey}`;

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
    showToast(`${currentModalQuantity}x ${currentModalItem.name} adicionado!`);
}

// ===== Combo Promocional =====
function addComboToCart() {
    if (!isStoreOpen()) {
        showToast("Ops! A loja está fechada no momento.");
        return;
    }
    // 1. Adicionar Santa Fúria
    const sf = findItemById(7); // ID do Santa Fúria
    if (sf) {
        const sfId = `${sf.id}-default`;
        const existingSf = cart.find(i => i.cartId === sfId);
        if (existingSf) {
            existingSf.quantity += 1;
        } else {
            cart.push({
                id: sf.id,
                cartId: sfId,
                name: sf.name,
                basePrice: sf.price,
                price: sf.price,
                addons: [],
                quantity: 1,
                observation: 'Combo Matador 🔥'
            });
        }
    }

    // 2. Adicionar Coca-Cola
    const coke = findItemById(15); // ID da Coca-Cola
    if (coke) {
        const cokeId = `${coke.id}-combo`; // Diferente do default para marcar que é do combo
        const existingCoke = cart.find(i => i.cartId === cokeId);
        if (existingCoke) {
            existingCoke.quantity += 1;
        } else {
            cart.push({
                id: coke.id,
                cartId: cokeId,
                name: coke.name,
                basePrice: coke.price,
                price: 3.90, // Preço promocional (Total 49.90: 46 + 3.90) (Normal é 7.00)
                addons: [],
                quantity: 1,
                observation: 'Combo Matador 🔥'
            });
        }
    }

    saveCart();
    updateCartUI();
    toggleCart(); // Abrir carrinho para mostrar
    showToast(`Combo Matador adicionado! 🍔🥤`);
}

// ===== Promoção Relâmpago (Single Item) =====
function addPromoBurger(itemId, promoPrice) {
    if (!isStoreOpen()) {
        showToast("Ops! A loja está fechada no momento.");
        return;
    }
    const item = findItemById(itemId);
    if (!item) return;

    // Unique ID for promo item
    const uniqueCartId = `${item.id}-promo-${Date.now()}`;

    cart.push({
        id: item.id,
        cartId: uniqueCartId,
        name: `${item.name} (PROMO ⚡)`,
        basePrice: item.price,
        price: promoPrice,
        addons: [],
        quantity: 1,
        observation: 'OFERTA RELÂMPAGO ⚡'
    });

    saveCart();
    updateCartUI();
    toggleCart();
    showToast(`${item.name} em promoção adicionado! ⚡`);
}

// ===== Router de Promoções =====
function handlePromoClick(promoId) {
    if (!isStoreOpen()) return showToast("Ops! A loja está fechada no momento.");

    const configs = {
        1001: { items: [{ id: 1, qty: 2 }], total: 39.90, suffix: "(Promo Dupla)" },
        1002: { items: [{ id: 6, qty: 2 }], total: 54.90, suffix: "(Promo Egg Bacon)" },
        4001: { items: [{ id: 1, qty: 1 }, { id: 2001, qty: 1 }], total: 34.90, suffix: "(Combo Pudim)" },
        4002: { items: [{ id: 8, qty: 1 }, { id: 2001, qty: 1 }], total: 52.90, suffix: "(Combo Especial)" },
        4003: { items: [{ id: 6, qty: 2 }, { id: 2001, qty: 2 }], total: 84.90, suffix: "(Pudim em Dobro)" },
        4004: { items: [{ id: 4, qty: 1 }, { id: 3003, qty: 1 }], total: 42.90, suffix: "(Burger & Bolo)" },
        4005: { items: [{ id: 7, qty: 1 }, { id: 15, qty: 1 }], total: 49.90, suffix: "(Santa Coca)" },
        4006: { items: [{ id: 9, qty: 2 }], total: 74.90, suffix: "(Promo Milagre)" }
    };

    const config = configs[promoId];
    if (!config) return;

    const totalOriginal = config.items.reduce((sum, ci) => {
        const item = findItemById(ci.id);
        return sum + (item ? item.price * ci.qty : 0);
    }, 0);

    const ratio = config.total / totalOriginal;

    config.items.forEach(ci => {
        const item = findItemById(ci.id);
        if (!item) return;

        const promoPrice = item.price * ratio;
        for (let i = 0; i < ci.qty; i++) {
            cart.push({
                id: item.id,
                cartId: `${item.id}-promo-${Date.now()}-${promoId}-${i}`,
                name: `${item.name} ${config.suffix}`,
                basePrice: item.price,
                price: promoPrice,
                addons: [],
                quantity: 1,
                observation: 'Combo Promocional'
            });
        }
    });

    saveCart();
    updateCartUI();
    toggleCart();
    showToast(`Combo adicionado com sucesso! 🎉`);
}

function addToCart(itemId) {
    openAddonModal(itemId);
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
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

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
                <div class="cart-item-main">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        ${item.addons && item.addons.length > 0 ?
                `<div style="font-size:0.75rem; color:var(--text-secondary);">+ ${item.addons.map(a => a.name).join(', ')}</div>`
                : ''}
                        <div class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-button" onclick="updateQuantity('${item.cartId}', -1)">−</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-button" onclick="updateQuantity('${item.cartId}', 1)">+</button>
                    </div>
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
            checkoutButton.disabled = true;
            checkoutButton.innerHTML = 'LOJA FECHADA';
        } else {
            checkoutButton.disabled = false;
            checkoutButton.innerHTML = '<span class="whatsapp-icon">📱</span> Pedir agora';
        }
    }

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// ===== Toggle Cart =====
function toggleCart() {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
}

// ===== Chat Widget Logic =====
function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatInput = document.getElementById('chatInput');

    chatWidget.classList.toggle('active');

    if (chatWidget.classList.contains('active')) {
        setTimeout(() => chatInput.focus(), 300);
    }
}

// Close chat on Escape or click outside
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const chatWidget = document.getElementById('chatWidget');
        if (chatWidget && chatWidget.classList.contains('active')) {
            toggleChat();
        }
    }
});

document.addEventListener('click', (e) => {
    const chatWidget = document.getElementById('chatWidget');
    if (chatWidget && chatWidget.classList.contains('active')) {
        // If click is outside chat-widget AND not on the toggle button
        if (!chatWidget.contains(e.target)) {
            toggleChat();
        }
    }
});

function sendChatToWhatsApp() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message) return;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    // Clear and close
    chatInput.value = '';
    toggleChat();

    logEvent("Enviou mensagem via Chat Widget");
    dbIncrement("chat_messages_sent");
}

function handleChatKey(event) {
    if (event.key === 'Enter') {
        sendChatToWhatsApp();
    }
}

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

// ===== Send to WhatsApp =====
function sendToWhatsApp() {
    if (!isStoreOpen()) {
        showToast("Desculpe, a loja está fechada!");
        return;
    }
    if (cart.length === 0) {
        showToast("Seu carrinho está vazio!");
        return;
    }

    // Capture form data
    const name = document.getElementById('clientName').value.trim();
    const address = document.getElementById('clientAddress').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const payment = document.getElementById('paymentMethod').value;
    const change = document.getElementById('changeAmount').value.trim();

    // Validation
    if (!name) {
        alert("Por favor, digite seu nome.");
        document.getElementById('clientName').focus();
        return;
    }
    if (!address) {
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

    // Salvar dados para a próxima compra
    saveUserData(name, address, phone);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + DELIVERY_FEE;

    let message = `🍔 *PEDIDO SANTA BRASA* 🔥\n`;
    message += `👤 *Cliente:* ${name}\n`;
    if (phone) message += `📞 *Tel:* ${phone}\n`;
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
    message += `Taxa de Entrega: R$ ${DELIVERY_FEE.toFixed(2).replace('.', ',')}\n`;
    message += `*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;

    message += "📍 *ENTREGA:*\n";
    message += `${address}\n\n`;

    message += "💰 *PAGAMENTO:*\n";
    message += `${payment}`;

    if (payment === 'Dinheiro') {
        message += `\n💵 Troco para: R$ ${change}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    // Log do Pedido para o Dashboard
    logEvent("Iniciou pedido via WhatsApp");
    dbIncrement("total_orders_clicked");
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

        // 1. Função para Incrementar Métricas
        window.dbIncrement = function (metricPath) {
            db.ref('metrics/' + metricPath).transaction(current => (current || 0) + 1)
                .catch(err => console.error("Erro ao incrementar métrica:", metricPath, err));
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

                // Registro de Presença
                const myPresenceRef = db.ref('presence').push();
                myPresenceRef.onDisconnect().remove();
                myPresenceRef.set(true);

                // Eventos de Entrada
                logEvent("Novo visitante entrou");
                dbIncrement("total_visits");
            } else {
                console.warn("⚠️ Tracker Desconectado do Firebase.");
            }
        });

    } catch (error) {
        console.error("❌ Falha crítica no tracker:", error);
    }
} else {
    console.warn("ℹ️ Tracker: Chaves do Firebase não configuradas.");
}

// ===== Flash Sale Countdown =====
function startFlashSaleCountdown() {
    const banner = document.getElementById('flashSaleBanner');
    const timerDisplay = document.getElementById('flashTimer');
    const duration = 120 * 60 * 1000; // 120 minutos em ms

    let flashSaleStartTime = localStorage.getItem('flashSaleStartTime');

    if (!flashSaleStartTime) {
        flashSaleStartTime = Date.now();
        localStorage.setItem('flashSaleStartTime', flashSaleStartTime);
    }

    function updateTimer() {
        const now = Date.now();
        const elapsed = now - flashSaleStartTime;
        const remaining = duration - elapsed;

        if (remaining <= 0) {
            banner.style.display = 'none';
            clearInterval(timerInterval);
            return;
        }

        banner.style.display = 'block';

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        timerDisplay.textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}

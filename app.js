const OPEN_HOUR = 15;
const OPEN_MINUTE = 0;
const CLOSE_HOUR = 3;
const CLOSE_MINUTE = 0;
const WHATSAPP_NUMBER = "553799982046";

let manualStoreStatus = "auto"; // "open", "closed" ou "auto"

function isStoreOpen() {
    if (manualStoreStatus === "closed") return false;
    if (manualStoreStatus === "open") return true;

    // manualStoreStatus === "auto" logic:
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTotalMinutes = (hours * 60) + minutes;

    const openTotalMinutes = (OPEN_HOUR * 60) + OPEN_MINUTE;
    const closeTotalMinutes = (CLOSE_HOUR * 60) + CLOSE_MINUTE;

    // Se o horário de fechar é no dia seguinte (ex: abre 15h, fecha 3h)
    if (closeTotalMinutes < openTotalMinutes) {
        // Aberto se (agora >= abre) OU (agora < fecha)
        return currentTotalMinutes >= openTotalMinutes || currentTotalMinutes < closeTotalMinutes;
    } else {
        // Horário padrão no mesmo dia
        return currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
    }
}

// ===== Função para Atualizar Status Visual =====
function updateStoreStatus() {
    const statusText = document.querySelector('.status-text');
    const statusBar = document.querySelector('.status-bar');

    if (!statusText || !statusBar) return;

    const open = isStoreOpen();

    if (open) {
        statusText.textContent = 'ABERTO';
        statusBar.classList.remove('closed');
        statusBar.classList.add('open');
        statusBar.classList.remove('closing-soon');
    } else {
        statusText.textContent = 'FECHADO';
        statusBar.classList.remove('open', 'closing-soon');
        statusBar.classList.add('closed');
    }
    updateCartUI();
}

// Atualiza o status periodicamente
setInterval(updateStoreStatus, 30000);

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
            price: 46.00
        },
        {
            id: 8,
            name: "Santo Juízo",
            description: "Um verdadeiro tribunal de sabores: Hambúrguer Suculento, Frango Grelhado, Bacon Suculento, Ovo, Triplo de Queijo, Milho, Alface, Tomate e Maionese Especial.",
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
            name: "Bolo de Maracujá",
            description: "Fatia generosa e super molhadinha",
            price: 18.00,
            category: "bolos"
        },
        {
            id: 3002,
            name: "Bolo de Chocolate",
            description: "Fatia generosa. Massa de chocolate fofinha com recheio de chocolate ao leite e cobertura de chocolate meio amargo.",
            price: 18.00
        },
        {
            id: 3003,
            name: "Bolo de Cenoura com Chocolate",
            description: "Fatia generosa. Massa de cenoura fresquinha com aquela cobertura de chocolate que crackela.",
            price: 18.00
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
    const addressGroup = document.getElementById('clientAddress').closest('.form-group');
    const pickupInfo = document.getElementById('pickupAddressInfo');

    if (type === 'pickup') {
        addressGroup.style.display = 'none';
        pickupInfo.style.display = 'block';
    } else {
        addressGroup.style.display = 'block';
        pickupInfo.style.display = 'none';
    }

    updateCartUI();
}

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
    updateStoreStatus();  // Atualiza status    // Initial render
    renderMenu();
    loadCart();
    loadUserData(); // Carrega dados salvos do cliente
    updateCartUI();
    // initChat() será chamado pelo tracker quando o Firebase conectar
    
    // Log initial group
    const group = getABTestGroup();
    console.log(`[AB TEST] User assigned to group: ${group}`);
    trackABEvent('visit');
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
    
    // Only track direct_add if it wasn't triggered by a Skip Modal event (which handles its own better tracking)
    if (!arguments[1]) {
        trackABEvent('direct_add');
    }
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
            } else {
                clickAction = `addToCart(${item.id})`;
            }

            const priceHTML = `
                <div class="price-container">
                    <span class="item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                </div>
            `;

            return `
            <div class="menu-item" data-id="${item.id}">
                <div class="item-info">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                </div>
                <div class="menu-item-actions">
                    ${priceHTML}
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

    document.getElementById('modalTotalPrice').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    document.getElementById('modalItemPrice').textContent = `R$ ${currentModalItem.price.toFixed(2).replace('.', ',')}`;
}

function confirmAddonOrder() {
    addToCartWithAddons();
    closeAddonModal();
    trackABEvent('confirm_addon');
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
    showToast(`${currentModalQuantity}x ${currentModalItem.name} adicionado!`);
}

function addToCart(itemId) {
    const group = getABTestGroup();
    if (group === 'variant') {
        // Variant B: Jump directly to cart, bypass modal
        addDirectToCart(itemId, true); // Pass true to avoid double tracking
        trackABEvent('skip_modal');
    } else {
        // Control A: Show modal as usual
        openAddonModal(itemId);
        trackABEvent('open_modal');
    }
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
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const fee = orderType === 'delivery' ? DELIVERY_FEE : 0;
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
        sub.textContent = `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        totalDiv.appendChild(sub);
        
        const deliver = document.createElement('span');
        deliver.style.fontSize = '0.8rem';
        deliver.style.color = 'var(--text-secondary)';
        deliver.style.fontFamily = "'Poppins'";
        deliver.textContent = `Entrega: R$ ${fee.toFixed(2).replace('.', ',')}`;
        totalDiv.appendChild(deliver);
    }
    
    const final = document.createElement('span');
    final.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    totalDiv.appendChild(final);
    
    cartTotal.appendChild(totalDiv);
}

// ===== Toggle Cart =====
function toggleCart() {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
    if (cartSidebar.classList.contains('active')) logCheckoutOpen();
}

// ===== Real-time Chat Logic =====
let chatSessionId = localStorage.getItem('santaBrasaChatSessionId');
if (!chatSessionId) {
    chatSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('santaBrasaChatSessionId', chatSessionId);
}

function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatInput = document.getElementById('chatInput');

    chatWidget.classList.toggle('active');

    if (chatWidget.classList.contains('active')) {
        checkChatIdentity();
        markMessagesAsRead();
    }
}

function checkChatIdentity() {
    const saved = localStorage.getItem('santaBrasaUserData');
    const prompt = document.getElementById('chatNamePrompt');
    const mainArea = document.getElementById('chatMainArea');
    const nameInput = document.getElementById('chatUserName');

    if (saved) {
        try {
            const { name } = JSON.parse(saved);
            if (name) {
                prompt.style.display = 'none';
                mainArea.style.display = 'flex';
                setTimeout(() => document.getElementById('chatInput').focus(), 300);
                return;
            }
        } catch (e) { }
    }

    // Se não tiver nome, mostra o prompt
    prompt.style.display = 'flex';
    mainArea.style.display = 'none';
    setTimeout(() => nameInput.focus(), 300);
}

function saveChatName() {
    const nameInput = document.getElementById('chatUserName');
    const name = nameInput.value.trim();

    if (!name) return;

    // Salvar no formato do resto do app
    const saved = localStorage.getItem('santaBrasaUserData');
    let userData = {};
    if (saved) {
        try { userData = JSON.parse(saved); } catch (e) { }
    }
    userData.name = name;
    localStorage.setItem('santaBrasaUserData', JSON.stringify(userData));

    // Refletir no campo do checkout se estiver aberto
    const clientNameInput = document.getElementById('clientName');
    if (clientNameInput) clientNameInput.value = name;

    // Trocar UI
    checkChatIdentity();

    // Sincronizar com Firebase
    updateChatSessionInfo();
}

function handleNameKey(event) {
    if (event.key === 'Enter') {
        saveChatName();
    }
}

let isChatInitialized = false;

function initChat() {
    if (isChatInitialized) return;
    if (typeof firebase === 'undefined' || !firebase.apps.length) return;

    const db = firebase.database();
    const chatRef = db.ref('chats/' + chatSessionId + '/messages');

    // Listener para novas mensagens
    chatRef.on('child_added', (snapshot) => {
        const msg = snapshot.val();
        renderChatMessage(msg);
    });

    // Listener para status de lido/não lido para o cliente
    db.ref('chats/' + chatSessionId + '/unreadByCustomer').on('value', (snapshot) => {
        const unread = snapshot.val();
        const dot = document.getElementById('chatUnreadDot');
        const widget = document.getElementById('chatWidget');
        if (dot) {
            dot.style.display = (unread && !widget.classList.contains('active')) ? 'block' : 'none';
        }
    });

    // Atualizar info da sessão (nome do cliente se disponível)
    updateChatSessionInfo();
    isChatInitialized = true;
}

function updateChatSessionInfo() {
    const saved = localStorage.getItem('santaBrasaUserData');
    if (saved && typeof firebase !== 'undefined' && firebase.apps.length) {
        try {
            const { name, phone } = JSON.parse(saved);
            const db = firebase.database();
            db.ref('chats/' + chatSessionId).update({
                customerName: name || 'Cliente Anônimo',
                customerPhone: phone || '',
                lastUpdate: new Date().toISOString()
            });

            // Enviar mensagem de boas-vindas se for a primeira vez
            const welcomeSent = localStorage.getItem('santaBrasaWelcomeSent');
            if (!welcomeSent && name) {
                setTimeout(() => {
                    db.ref('chats/' + chatSessionId + '/messages').push({
                        text: `Olá ${name}! 🔥 Que bom ter você por aqui. Como podemos te ajudar hoje?`,
                        sender: 'admin',
                        timestamp: new Date().toISOString()
                    });
                    localStorage.setItem('santaBrasaWelcomeSent', 'true');
                }, 2000);
            }
        } catch (e) { }
    }
}

function renderChatMessage(msg) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `chat-bubble ${msg.sender === 'customer' ? 'sent' : 'received'}`;
    div.textContent = msg.text;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const text = chatInput.value.trim();

    if (!text || typeof firebase === 'undefined' || !firebase.apps.length) return;

    const db = firebase.database();
    const chatRef = db.ref('chats/' + chatSessionId);

    // Push message
    chatRef.child('messages').push({
        text: text,
        sender: 'customer',
        timestamp: new Date().toISOString()
    });

    // Update session meta
    chatRef.update({
        lastMessage: text,
        timestamp: new Date().toISOString(),
        unreadByAdmin: true
    });

    chatInput.value = '';
    updateChatSessionInfo();
    triggerAutoResponse(text);
}

const AUTO_RESPONSES = {
    "horário": "Nosso horário de atendimento é de 15:00 as 03:00! 🔥",
    "entrega": "Fazemos entregas em toda a cidade! A taxa é fixa de R$ 10,00. 🛵",
    "cardápio": "Nosso cardápio completo está logo acima! Temos burgers artesanais, sobremesas e bebidas. 🍔",
    "pagamento": "Aceitamos Pix, Cartões de Crédito/Débito e Dinheiro (levamos troco). 💳",
    "endereço": "Estamos na Rua Marechal Deodoro, 398, Centro, Itaúna-MG. 📍",
    "pix": "Nossa chave Pix é o nosso telefone: 3799982046. Favor enviar o comprovante! 📲",
    "olá": "Olá! 🔥 Como podemos te ajudar com seu pedido hoje?",
    "oi": "Oi! 🔥 Tudo bem? O que vai pedir de gostoso hoje?"
};

function triggerAutoResponse(text) {
    const lowerText = text.toLowerCase();
    let response = null;

    for (const key in AUTO_RESPONSES) {
        if (lowerText.includes(key)) {
            response = AUTO_RESPONSES[key];
            break;
        }
    }

    if (response) {
        setTimeout(() => {
            const db = firebase.database();
            db.ref('chats/' + chatSessionId + '/messages').push({
                text: response,
                sender: 'admin',
                timestamp: new Date().toISOString()
            });
            db.ref('chats/' + chatSessionId).update({
                lastMessage: response,
                timestamp: new Date().toISOString(),
                unreadByCustomer: true
            });
        }, 1500);
    }
}

function handleChatKey(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function markMessagesAsRead() {
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('chats/' + chatSessionId).update({
            unreadByCustomer: false
        });
    }
}

// Chamar initChat após o carregamento do Firebase
document.addEventListener('DOMContentLoaded', () => {
    // ... rest of init logic is already there, I'll add initChat to the bottom observer
});

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
    if (submissionTime < 2000) { // Humans rarely fill and click in < 2s
        console.warn("Action too fast, potential bot.");
    }

    // Validation
    if (!name) {
        alert("Por favor, digite seu nome.");
        document.getElementById('clientName').focus();
        return;
    }
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

    // Salvar dados para a próxima compra
    saveUserData(name, address, phone);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const fee = orderType === 'delivery' ? DELIVERY_FEE : 0;
    const total = subtotal + fee;

    let message = `🍔 *PEDIDO SANTA BRASA* 🔥\n`;
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

            // Salva na lista de pedidos
            db.ref('orders/' + orderId).set(orderData);

            // Atualiza/Cria registro do cliente
            const customerKey = name.toLowerCase().replace(/\s+/g, '_');
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
            });

            logEvent(`Pedido registrado no CRM: R$ ${total.toFixed(2)}`);
        }
    } catch (e) {
        console.error("Erro ao salvar no CRM:", e);
    }

    window.open(whatsappUrl, '_blank');

    // Log do Pedido para o Dashboard (Métricas legadas)
    logEvent("Iniciou pedido via WhatsApp");
    dbIncrement("total_orders_clicked");
    trackABEvent('checkout_whatsapp');
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

                initChat(); // Inicializa o Chat em Tempo Real

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



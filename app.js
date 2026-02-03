const WHATSAPP_NUMBER = '5537991030870'; // ===== Menu Data =====
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
            price: 44.00
        },
        {
            id: 8,
            name: "Santo Juízo",
            description: "Um verdadeiro tribunal de sabores: Hambúrguer Suculento, Frango Desfiado, Bacon Crocante, Ovo, Triplo de Queijo, Milho, Alface, Tomate e Maionese Especial.",
            price: 41.00
        },
        {
            id: 9,
            name: "Milagre Cremoso",
            description: "O sabor que faz milagre: Frango Desfiado, Bacon Crocante, Triplo de Queijo, Milho e Maionese Especial.",
            price: 40.00
        },
        {
            id: 10,
            name: "Dom Contra",
            description: "Carne nobre, sabor marcante: Pão, Contrafilé, Bacon, Ovo, Dobro de Queijo, Salada e Molho Especial.",
            price: 42.00
        }
    ],
    bebidas: [
        {
            id: 11,
            name: "Heineken Latão",
            description: "Unidade 473ml",
            price: 12.00
        },
        {
            id: 12,
            name: "Antartica Boa",
            description: "Unidade Lata 350ml",
            price: 10.00
        },
        {
            id: 13,
            name: "Coca-Cola Zero",
            description: "Unidade Lata 350ml",
            price: 7.00
        },
        {
            id: 14,
            name: "Água de Coco",
            description: "Unidade 500ml",
            price: 12.00
        },
        {
            id: 15,
            name: "Coca-Cola",
            description: "Unidade Lata 350ml",
            price: 7.00
        }
    ]
};

// ===== Cart State =====
let cart = [];

// ===== WhatsApp Number (configure here) =====
const WHATSAPP_NUMBER = "5511999999999"; // Altere para o número da hamburgueria

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
    renderMenu();
    loadCart();
    updateCartUI();
});

// ===== Render Menu =====
function renderMenu() {
    Object.keys(menuData).forEach(category => {
        const container = document.getElementById(category);
        if (!container) return;

        container.innerHTML = menuData[category].map(item => `
            <div class="menu-item" data-id="${item.id}">
                <div class="item-info">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                </div>
                <span class="item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                <button class="add-button" onclick="addToCart(${item.id})" aria-label="Adicionar ${item.name}">
                    +
                </button>
            </div>
        `).join('');
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

// ===== Add to Cart =====
function addToCart(itemId) {
    const item = findItemById(itemId);
    if (!item) return;

    const existingItem = cart.find(cartItem => cartItem.id === itemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`${item.name} adicionado!`);
}

// ===== Remove from Cart =====
function removeFromCart(itemId) {
    const index = cart.findIndex(item => item.id === itemId);
    if (index > -1) {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
    }
}

// ===== Update Quantity =====
function updateQuantity(itemId, delta) {
    const item = cart.find(item => item.id === itemId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        saveCart();
        updateCartUI();
    }
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
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-button" onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-button" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
        checkoutButton.disabled = false;
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

// ===== Save/Load Cart (localStorage) =====
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

// ===== Show Toast =====
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ===== Send to WhatsApp =====
function sendToWhatsApp() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let message = "🍔 *PEDIDO SANTA BRASA* 🔥\n\n";
    message += "━━━━━━━━━━━━━━━━━━\n";

    cart.forEach(item => {
        message += `▸ ${item.quantity}x ${item.name}\n`;
        message += `   R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━\n";
    message += `*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    message += "📍 Endereço para entrega:\n";
    message += "(Informe seu endereço aqui)";

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}





// ╔════════════════════════════════════════════════════════════════╗
// ║  ⚙️ CONFIGURAÇÃO DO FIREBASE (DASHBOARD)                        ║
// ║  1. Crie um projeto no console.firebase.google.com              ║
// ║  2. Ative o "Realtime Database"                                 ║
// ║  3. Cole suas chaves abaixo:                                    ║
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

// ===== Inicialização =====
console.log("Iniciando Firebase no Dashboard...");
const statusText = document.getElementById('status-text');
const setupHint = document.getElementById('setup-hint');

if (firebaseConfig.apiKey !== "SUA_API_KEY_AQUI") {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase inicializado com sucesso.");
        initDashboard();
    } catch (error) {
        console.error("❌ Erro ao inicializar Firebase:", error);
        statusText.textContent = "Erro na Inicialização";
        statusText.style.color = "#FF3131";
    }
} else {
    console.warn("ℹ️ Firebase não configurado. O dashboard está em modo demonstração.");
    statusText.textContent = "Modo Demonstração (Sem Chaves)";
    statusText.style.color = "#FFD700";
    setupHint.style.display = 'block';

    // Simulação local para demonstração
    setInterval(() => {
        const fakeLive = Math.floor(Math.random() * 5) + 1;
        document.getElementById('count-live').textContent = fakeLive;
    }, 5000);
}

function initDashboard() {
    console.log("Conectando ao banco de dados...");
    const db = firebase.database();

    // Verificador de Conexão Real-time
    db.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true) {
            console.log("🟢 Conectado ao Database com sucesso!");
            statusText.textContent = "Conectado ao Live Stream";
            statusText.style.color = "#00FF41";
            document.querySelector('.live-dot').style.backgroundColor = "#00FF41";
            document.querySelector('.live-dot').style.boxShadow = "0 0 10px #00FF41";
            setupHint.style.display = 'none';
        } else {
            console.warn("🔴 Desconectado. Tentando reconectar...");
            statusText.textContent = "Reconectando...";
            statusText.style.color = "#FFD700";
            document.querySelector('.live-dot').style.backgroundColor = "#FFD700";
        }
    });

    // 1. Visitantes Online (Presence)
    db.ref('presence').on('value', (snapshot) => {
        const count = snapshot.numChildren() || 0;
        animateValue('count-live', count);
    });

    // 2. Total de Visitas Históricas
    db.ref('metrics/total_visits').on('value', (snapshot) => {
        animateValue('count-total', snapshot.val() || 0);
    });

    // 3. Cliques em Pedidos
    db.ref('metrics/total_orders_clicked').on('value', (snapshot) => {
        animateValue('count-orders', snapshot.val() || 0);
    });

    // 4. Logs de Atividade
    db.ref('logs').limitToLast(15).on('child_added', (snapshot) => {
        const log = snapshot.val();
        addLogRow(log.time, log.msg);
    });

    // 5. CRM: Pedidos Passados
    db.ref('orders').orderByChild('timestamp').limitToLast(100).on('value', (snapshot) => {
        const orders = [];
        snapshot.forEach(child => {
            orders.unshift(child.val()); // Mais recentes primeiro
        });
        renderOrdersTable(orders);
    });

    // 6. CRM: Clientes
    db.ref('customers').on('value', (snapshot) => {
        const customers = [];
        snapshot.forEach(child => {
            customers.push(child.val());
        });
        window.allCustomers = customers; // Cache para busca local
        renderCustomersTable(customers);
    });
}

// ===== CRM UI Functions =====

function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum pedido encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const date = new Date(order.timestamp).toLocaleString('pt-BR');
        const itemsStr = order.items.map(i => `${i.quantity}x ${i.name}`).join('<br>');
        const typeBadge = order.orderType === 'delivery' ? 'badge-delivery' : 'badge-pickup';
        const typeLabel = order.orderType === 'delivery' ? 'Entrega' : 'Retirada';

        return `
            <tr>
                <td>${date}</td>
                <td>
                    <strong>${order.customer.name}</strong><br>
                    <small>${order.customer.phone || ''}</small>
                </td>
                <td><span class="badge-type ${typeBadge}">${typeLabel}</span></td>
                <td style="font-size: 0.8rem; color: #ccc;">${itemsStr}</td>
                <td style="font-size: 0.8rem;">${order.customer.address || '-'}</td>
                <td><span class="price-tag">R$ ${order.total.toFixed(2).replace('.', ',')}</span></td>
                <td>${order.payment}</td>
            </tr>
        `;
    }).join('');
}

function renderCustomersTable(customers) {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum cliente cadastrado.</td></tr>';
        return;
    }

    // Ordenar por data do último pedido (mais recente primeiro)
    customers.sort((a, b) => new Date(b.lastOrder) - new Date(a.lastOrder));

    tbody.innerHTML = customers.map(c => {
        const lastDate = new Date(c.lastOrder).toLocaleDateString('pt-BR');
        return `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.phone || '-'}</td>
                <td>${lastDate}</td>
                <td style="font-size: 0.8rem;">${c.address || '-'}</td>
                <td>${c.orderCount}</td>
                <td><span class="price-tag">R$ ${(c.totalSpent || 0).toFixed(2).replace('.', ',')}</span></td>
            </tr>
        `;
    }).join('');
}

function filterCustomers() {
    const query = document.getElementById('customer-search').value.toLowerCase();
    if (!window.allCustomers) return;

    const filtered = window.allCustomers.filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.phone && c.phone.includes(query))
    );
    renderCustomersTable(filtered);
}

// ===== Funções Auxiliares =====
function addLogRow(time, msg) {
    const list = document.getElementById('activity-log');
    if (!list) return;

    const li = document.createElement('li');
    li.className = 'log-item';
    li.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-msg">${msg}</span>
    `;

    // Manter apenas os últimos 15
    if (list.children.length >= 15) {
        list.removeChild(list.lastChild);
    }
    list.prepend(li);
}

function animateValue(id, endValue) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startValue = parseInt(obj.textContent) || 0;
    let duration = 1000;
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.textContent = Math.floor(progress * (endValue - startValue) + startValue);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ===== Segurança Simples: Senha de Acesso =====
(function checkAccess() {
    const MASTER_PASSWORD = "brasa-admin"; // 👈 Defina sua senha aqui
    const authorized = sessionStorage.getItem('dashboard_auth');

    if (authorized !== 'true') {
        const pass = prompt("Digite a senha de administrador para acessar o Painel:");
        if (pass === MASTER_PASSWORD) {
            sessionStorage.setItem('dashboard_auth', 'true');
        } else {
            alert("Senha incorreta. Acesso negado.");
            document.body.innerHTML = "<h2 style='color:red; text-align:center; margin-top:50px;'>Acesso Não Autorizado</h2>";
        }
    }
})();

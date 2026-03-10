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

            // Carregar métricas de hoje logo ao conectar
            loadDailyMetrics(db);
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
    let isInitialLoad = true;
    db.ref('orders').orderByChild('timestamp').limitToLast(100).on('value', (snapshot) => {
        const orders = [];
        snapshot.forEach(child => {
            orders.unshift(child.val()); // Mais recentes primeiro
        });

        // Se não for o carregamento inicial e a quantidade de pedidos aumentou, toca o som
        if (!isInitialLoad && window.currentOrders && orders.length > window.currentOrders.length) {
            playNotificationSound();
        }

        renderOrdersTable(orders);
        renderFinanceTab(orders);
        window.currentOrders = orders; // Store for delete operations and count comparison
        isInitialLoad = false;
    });

    // 6. CRM: Clientes
    db.ref('customers').on('value', (snapshot) => {
        const customers = [];
        snapshot.forEach(child => {
            customers.push({ key: child.key, ...child.val() });
        });
        window.allCustomers = customers; // Cache para busca local
        renderCustomersTable(customers);
    });

    // 7. Chat Real-time
    initChatDashboard(db);

    // 8. Store Status Management
    initStoreStatus(db);
}

// ===== Store Status Management =====
function initStoreStatus(db) {
    const toggle = document.getElementById('storeStatusToggle');
    const label = document.getElementById('storeStatusLabel');

    db.ref('settings/storeStatus').on('value', (snapshot) => {
        const isOpen = snapshot.val() !== 'closed'; // Default to open if null

        if (toggle) toggle.checked = isOpen;
        if (label) {
            label.textContent = isOpen ? 'ABERTO' : 'FECHADO';
            label.style.color = isOpen ? 'var(--neon-green)' : 'var(--primary)';
        }

        console.log("Store status updated from Firebase:", isOpen ? "OPEN" : "CLOSED");
    });
}

function toggleStoreStatus(isOpen) {
    const status = isOpen ? 'open' : 'closed';
    const db = firebase.database();

    db.ref('settings/storeStatus').set(status)
        .then(() => {
            console.log("✅ Status da loja atualizado para:", status);
            addLogRow(new Date().toLocaleTimeString('pt-BR'), `Loja ${isOpen ? 'ABERTA' : 'FECHADA'} manualmente.`);
        })
        .catch((error) => {
            console.error("❌ Erro ao atualizar status da loja:", error);
            alert("Erro ao atualizar status da loja!");
        });
}

// ===== Chat Dashboard Functions =====
window.activeChatSession = null;

function initChatDashboard(db) {
    const chatSessionsList = document.getElementById('chat-sessions-list');
    if (!chatSessionsList) return;

    db.ref('chats').on('value', (snapshot) => {
        const chats = [];
        snapshot.forEach(child => {
            chats.push({ id: child.key, ...child.val() });
        });

        // Som de notificação se houver novos não lidos (pelo admin)
        const hasUnread = chats.some(c => c.unreadByAdmin);
        if (hasUnread && !isInitialLoad) {
            playNotificationSound();
        }

        // Ordenar por timestamp (mais recentes primeiro)
        chats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        renderChatSessions(chats);
        updateTotalUnread(chats);
    });
}

function renderChatSessions(chats) {
    const list = document.getElementById('chat-sessions-list');
    if (!list) return;

    if (chats.length === 0) {
        list.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-dim);">Nenhuma conversa iniciada.</div>';
        return;
    }

    list.innerHTML = chats.map(chat => {
        const time = new Date(chat.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const isActive = window.activeChatSession === chat.id ? 'active' : '';
        const unread = chat.unreadByAdmin ? '<span class="unread-badge">!</span>' : '';

        return `
            <div class="session-item ${isActive}" onclick="openChatSession('${chat.id}')">
                <div class="session-info">
                    <div class="session-name">
                        ${chat.customerName || 'Cliente Anônimo'}
                        ${unread}
                    </div>
                <div class="session-last-msg">${chat.lastMessage || '...'}</div>
                <div class="session-time">${time}</div>
                </div>
            </div>
        `;
    }).join('');
}

function openChatSession(sessionId) {
    const db = firebase.database();

    // Remover listener anterior se existir
    if (window.activeChatSession) {
        db.ref('chats/' + window.activeChatSession).off();
    }

    window.activeChatSession = sessionId;

    // Marcar como lido
    db.ref('chats/' + sessionId).update({ unreadByAdmin: false });

    const pane = document.getElementById('active-chat-pane');
    pane.innerHTML = `
        <div class="pane-header">
            <span>Conversando com: <strong id="active-customer-name">Carregando...</strong></span>
            <button onclick="closeActiveChat()" style="background:none; border:none; color:var(--primary); cursor:pointer;">✕ Fechar</button>
        </div>
        <div class="chat-messages-container" id="admin-messages-container">
            <!-- Mensagens aqui -->
        </div>
        <div class="chat-reply-area">
            <input type="text" id="adminReplyInput" placeholder="Digite sua resposta..." onkeypress="handleAdminReplyKey(event)">
            <button class="send-btn" onclick="sendAdminReply()">ENVIAR</button>
        </div>
    `;

    // Carregar mensagens
    db.ref('chats/' + sessionId).on('value', (snapshot) => {
        if (window.activeChatSession !== sessionId) return;

        const chat = snapshot.val();
        const headerTitle = document.getElementById('active-customer-name');
        headerTitle.innerHTML = `
            ${chat.customerName || 'Cliente'}
            <span class="active-customer-details">
                ${chat.customerPhone ? '📞 ' + chat.customerPhone : 'Sem telefone cadastrado'}
            </span>
        `;

        const messagesContainer = document.getElementById('admin-messages-container');
        if (chat.messages) {
            const msgs = Object.values(chat.messages);
            messagesContainer.innerHTML = msgs.map(m => `
                <div class="chat-bubble ${m.sender === 'admin' ? 'admin' : 'customer'}">
                    ${m.text}
                    <span class="bubble-time">${new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            `).join('');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });

    // Refresh Session List to update UI (Active class)
    db.ref('chats').once('value', snap => {
        const chats = [];
        snap.forEach(c => chats.push({ id: c.key, ...c.val() }));
        chats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        renderChatSessions(chats);
    });
}

function sendAdminReply() {
    const input = document.getElementById('adminReplyInput');
    const text = input.value.trim();
    if (!text || !window.activeChatSession) return;

    const db = firebase.database();
    const sessionId = window.activeChatSession;

    // Push admin message
    db.ref('chats/' + sessionId + '/messages').push({
        text: text,
        sender: 'admin',
        timestamp: new Date().toISOString()
    });

    // Update session meta
    db.ref('chats/' + sessionId).update({
        lastMessage: text,
        timestamp: new Date().toISOString(),
        unreadByCustomer: true
    });

    input.value = '';
    input.focus();
}

function handleAdminReplyKey(event) {
    if (event.key === 'Enter') {
        sendAdminReply();
    }
}

function closeActiveChat() {
    if (window.activeChatSession) {
        firebase.database().ref('chats/' + window.activeChatSession).off();
    }
    window.activeChatSession = null;
    document.getElementById('active-chat-pane').innerHTML = `
        <div class="no-chat-selected">
            <div class="no-chat-icon">💬</div>
            <p>Selecione uma conversa para começar</p>
        </div>
    `;
    // Refresh list
    firebase.database().ref('chats').once('value', snap => {
        const chats = [];
        snap.forEach(c => chats.push({ id: c.key, ...c.val() }));
        chats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        renderChatSessions(chats);
    });
}

function updateTotalUnread(chats) {
    const total = chats.reduce((sum, chat) => sum + (chat.unreadByAdmin ? 1 : 0), 0);
    const badge = document.getElementById('total-unread');
    if (badge) {
        badge.textContent = total;
        badge.style.display = total > 0 ? 'inline-block' : 'none';
    }
}

// ===== CRM UI Functions =====

function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');

    if (tabId === 'tab-reports') {
        loadMetricsHistory();
    }
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
                <td>
                    <button onclick="confirmDeleteOrder('${order.id}')" 
                            style="background: #FF3131; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; font-weight: bold;">
                        EXCLUIR
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function confirmDeleteOrder(orderId) {
    if (confirm("Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.")) {
        deleteOrder(orderId);
    }
}

function deleteOrder(orderId) {
    console.log("Excluindo pedido:", orderId);
    const db = firebase.database();

    db.ref('orders/' + orderId).remove()
        .then(() => {
            console.log("✅ Pedido excluído com sucesso.");
            // Order list will be updated automatically by the 'on' listener in initDashboard
        })
        .catch((error) => {
            console.error("❌ Erro ao excluir pedido:", error);
            alert("Erro ao excluir pedido. Verifique o console.");
        });
}

function renderFinanceTab(orders) {
    const totals = {
        Pix: { total: 0, count: 0, last: null },
        Cartao: { total: 0, count: 0, last: null },
        Dinheiro: { total: 0, count: 0, last: null }
    };

    let grandTotal = 0;
    let totalCount = 0;

    orders.forEach(order => {
        const payment = order.payment;
        let category = '';

        if (payment === 'Pix') category = 'Pix';
        else if (payment === 'Cartão' || payment === 'Cartao') category = 'Cartao';
        else if (payment === 'Dinheiro') category = 'Dinheiro';

        if (category && totals[category]) {
            totals[category].total += order.total;
            totals[category].count += 1;
            const orderDate = new Date(order.timestamp);
            if (!totals[category].last || orderDate > totals[category].last) {
                totals[category].last = orderDate;
            }
            grandTotal += order.total;
            totalCount += 1;
        }
    });

    // Update Cards
    const elPix = document.getElementById('finance-pix');
    if (elPix) {
        elPix.textContent = formatCurrency(totals.Pix.total);
        document.getElementById('count-pix').textContent = `${totals.Pix.count} pedidos`;
        document.getElementById('finance-card').textContent = formatCurrency(totals.Cartao.total);
        document.getElementById('count-card').textContent = `${totals.Cartao.count} pedidos`;
        document.getElementById('finance-cash').textContent = formatCurrency(totals.Dinheiro.total);
        document.getElementById('count-cash').textContent = `${totals.Dinheiro.count} pedidos`;
        document.getElementById('finance-total').textContent = formatCurrency(grandTotal);
        document.getElementById('count-finance-total').textContent = `${totalCount} pedidos`;

        // Update Table
        document.getElementById('table-pix-qty').textContent = totals.Pix.count;
        document.getElementById('table-pix-total').textContent = formatCurrency(totals.Pix.total);
        document.getElementById('table-pix-last').textContent = formatDate(totals.Pix.last);
        document.getElementById('table-card-qty').textContent = totals.Cartao.count;
        document.getElementById('table-card-total').textContent = formatCurrency(totals.Cartao.total);
        document.getElementById('table-card-last').textContent = formatDate(totals.Cartao.last);
        document.getElementById('table-cash-qty').textContent = totals.Dinheiro.count;
        document.getElementById('table-cash-total').textContent = formatCurrency(totals.Dinheiro.total);
        document.getElementById('table-cash-last').textContent = formatDate(totals.Dinheiro.last);
    }
}

// ===== Novas Funções: Daily Refresh & Deletes =====

function loadDailyMetrics(db) {
    const today = new Date().toISOString().split('T')[0];

    // Visitas de Hoje
    db.ref(`metrics/${today}/total_visits`).on('value', snap => {
        animateValue('count-total', snap.val() || 0);
    });

    // Cliques de Hoje
    db.ref(`metrics/${today}/total_orders_clicked`).on('value', snap => {
        animateValue('count-orders', snap.val() || 0);
    });
}

function confirmResetDailyMetrics() {
    if (confirm("Deseja zerar as métricas de HOJE? Isso não afetará as vendas registradas, apenas os contadores de visitas e cliques de hoje.")) {
        const today = new Date().toISOString().split('T')[0];
        const db = firebase.database();
        db.ref(`metrics/${today}`).remove()
            .then(() => {
                alert("Métricas de hoje zeradas!");
                // Os listeners automáticos atualizarão o UI para 0
            });
    }
}

function confirmDeleteCustomer(customerKey, customerName) {
    if (confirm(`Tem certeza que deseja excluir o cliente ${customerName}?`)) {
        firebase.database().ref('customers/' + customerKey).remove()
            .then(() => {
                console.log("Cliente excluído:", customerKey);
            })
            .catch(err => alert("Erro ao excluir: " + err));
    }
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
                <td>
                    <button onclick="confirmDeleteCustomer('${c.key}', '${c.name.replace(/'/g, "\\'")}')" 
                             style="background: #333; border: 1px solid #444; color: #ff5c5c; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; font-weight: bold;">
                        EXCLUIR
                    </button>
                </td>
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

// ===== Funções de Relatórios & Histórico =====

function loadMetricsHistory() {
    console.log("Carregando histórico de métricas...");
    const db = firebase.database();
    db.ref('metrics').once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const history = [];
        let monthVisits = 0;
        let monthClicks = 0;

        // Iterar sobre as datas (YYYY-MM-DD)
        Object.keys(data).forEach(dateKey => {
            if (dateKey === 'totals') return; // Pular compatibilidade

            const dayData = data[dateKey];
            const visits = dayData.total_visits || 0;
            const clicks = dayData.total_orders_clicked || 0;
            const conversion = visits > 0 ? ((clicks / visits) * 100).toFixed(1) : 0;

            history.push({
                date: dateKey,
                visits: visits,
                clicks: clicks,
                conversion: conversion
            });

            monthVisits += visits;
            monthClicks += clicks;
        });

        // Ordenar por data recente
        history.sort((a, b) => b.date.localeCompare(a.date));

        // Atualizar Totais no UI
        animateValue('monthly-visits', monthVisits);
        animateValue('monthly-clicks', monthClicks);

        // Renderizar Tabela
        renderReportsTable(history);
    });
}

function renderReportsTable(history) {
    const tbody = document.getElementById('reports-table-body');
    if (!tbody) return;

    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum dado histórico encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = history.map(h => {
        const dateParts = h.date.split('-');
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : h.date;
        return `
            <tr>
                <td><strong>${formattedDate}</strong></td>
                <td>${h.visits}</td>
                <td>${h.clicks}</td>
                <td><span class="badge-type badge-delivery" style="background: rgba(0, 255, 65, 0.1); color: #00FF41; border: 1px solid rgba(0, 255, 65, 0.2);">${h.conversion}%</span></td>
            </tr>
        `;
    }).join('');
}

// ===== Funções Auxiliares =====
function playNotificationSound() {
    const sound = document.getElementById('notificationSound');
    const stopBtn = document.getElementById('stopSoundBtn');

    if (sound) {
        sound.loop = true; // Força loop
        sound.currentTime = 0;

        // Fallback robusto para loop
        sound.onended = () => {
            if (stopBtn && stopBtn.style.display !== 'none') {
                sound.currentTime = 0;
                sound.play();
            }
        };

        sound.play().then(() => {
            if (stopBtn) stopBtn.style.display = 'block';
            console.log("🔔 Tocando som de notificação (LOOP REFORÇADO)!");
        }).catch(e => {
            console.warn("Erro ao tocar som:", e);
        });
    }
}

function stopNotificationSound() {
    const sound = document.getElementById('notificationSound');
    const stopBtn = document.getElementById('stopSoundBtn');

    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }

    if (stopBtn) {
        stopBtn.style.display = 'none';
    }
    console.log("🔈 Som de notificação parado pelo usuário.");
}

function testNotificationSound() {
    playNotificationSound();
    // No alert here as it blocks the loop feeling and we have the stop button now
}

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

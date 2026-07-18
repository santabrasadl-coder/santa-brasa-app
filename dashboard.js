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
let isInitialLoad = true;

// Relatório de erros para o usuário
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error("❌ ERRO NO DASHBOARD:", msg, "em", lineNo, ":", columnNo);
    // Só mostrar alert se for um erro crítico de execução
    if (msg.toLowerCase().includes('firebase') || msg.toLowerCase().includes('ref') || msg.toLowerCase().includes('null')) {
        alert("Erro no Painel: " + msg + "\nLinha: " + lineNo);
    }
    return false;
};

if (firebaseConfig.apiKey !== "SUA_API_KEY_AQUI") {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase inicializado com sucesso.");
        
        // --- Escuta de Autenticação Real do Firebase ---
        firebase.auth().onAuthStateChanged((user) => {
            const overlay = document.getElementById('login-overlay');
            console.log("onAuthStateChanged - Estado do usuário:", user ? (user.isAnonymous ? "Anônimo (UID: " + user.uid + ")" : "E-mail: " + user.email) : "Deslogado");
            if (user && !user.isAnonymous) {
                console.log("Usuário autenticado:", user.email);
                if (overlay) overlay.style.display = 'none';
                statusText.textContent = "Acesso Autorizado. Conectando...";
                initDashboard();
            } else {
                console.log("Nenhum usuário administrativo autenticado.");
                if (overlay) overlay.style.display = 'flex';
                statusText.textContent = "Aguardando Login...";
            }
        });
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
    statusText.textContent = "Conectando ao Banco...";
    const db = firebase.database();

    // Verificador de Conexão Real-time
    db.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true) {
            console.log("🟢 Conectado ao Database com sucesso!");
            statusText.textContent = "Monitoramento Ativo";
            statusText.style.color = "#00FF41";
            document.querySelector('.live-dot').style.backgroundColor = "#00FF41";
            document.querySelector('.live-dot').style.boxShadow = "0 0 10px #00FF41";
            setupHint.style.display = 'none';

            // Registro de Presença do próprio Painel (Separado para não contar como cliente)
            const myPresenceRef = db.ref('presence/admins').push();
            myPresenceRef.onDisconnect().remove();
            myPresenceRef.set(true);

            // Log de pronto
            addLogRow(new Date().toLocaleTimeString('pt-BR'), "Painel administrativo pronto e monitorando.");

            // Carregar métricas de hoje logo ao conectar
            loadDailyMetrics(db);
        } else {
            console.warn("🔴 Desconectado. Tentando reconectar...");
            statusText.textContent = "Reconectando...";
            statusText.style.color = "#FFD700";
            document.querySelector('.live-dot').style.backgroundColor = "#FFD700";
        }
    });

    // 1. Visitantes Online (Apenas Clientes)
    db.ref('presence/users').on('value', (snapshot) => {
        const count = snapshot.numChildren() || 0;
        animateValue('count-live', count);
    }, (error) => {
        console.error("❌ Erro de Permissão (Presence):", error);
        addLogRow(new Date().toLocaleTimeString('pt-BR'), "⚠️ Erro ao ler visitantes online (Permissão).");
    });

    // 2. Total de Visitas Históricas
    db.ref('metrics/totals/total_visits').on('value', (snapshot) => {
        animateValue('count-total', snapshot.val() || 0);
    });

    // 3. Cliques em Pedidos Históricos
    db.ref('metrics/totals/total_orders_clicked').on('value', (snapshot) => {
        animateValue('count-orders', snapshot.val() || 0);
    });

    // 2b. Métricas de Hoje (Opcional: manter no console ou adicionar se tiver label)
    const today = new Date().toISOString().split('T')[0];
    db.ref(`metrics/${today}/total_visits`).on('value', (snapshot) => {
        console.log("Visitas hoje:", snapshot.val() || 0);
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

        if (orders.length === 0) {
            console.warn("⚠️ Nenhum pedido encontrado no banco de dados.");
        } else {
            console.log(`✅ ${orders.length} pedidos carregados.`);
        }

        // Se não for o carregamento inicial e a quantidade de pedidos aumentou, toca o som
        if (!isInitialLoad && window.currentOrders && orders.length > window.currentOrders.length) {
            playNotificationSound();
        }

        try {
            renderOrdersTable(orders);
            renderFinanceTab(orders);
            // Atualiza o card de vendas dos últimos 7 dias
            if (typeof renderSalesReport === 'function') renderSalesReport(orders);
        } catch (e) {
            console.error("❌ Erro ao renderizar tabelas:", e);
        }
        
        window.currentOrders = orders;
        isInitialLoad = false;
        
        if (statusText.textContent === "Sincronizando Dados..." || statusText.textContent === "Conectando ao Banco..." || statusText.textContent.includes("Acesso Autorizado")) {
            statusText.textContent = "Monitoramento Ativo";
        }
    }, (error) => {
        console.error("❌ Erro de Permissão (Orders):", error);
        addLogRow(new Date().toLocaleTimeString('pt-BR'), "⚠️ Bloqueio de leitura de pedidos (Permissão).");
    });

    // Teste de Diagnóstico: Gravar um log
    console.log("Executando teste de escrita...");
    db.ref('logs').push({
        time: new Date().toLocaleTimeString('pt-BR'),
        msg: "📊 Admin acessou o painel (Verificação de Permissão)"
    }).catch(err => {
        console.error("❌ FALHA NO TESTE DE GRAVAÇÃO:", err);
        addLogRow(new Date().toLocaleTimeString('pt-BR'), "🛑 Erro crítico: Sem permissão de escrita de Atividade!");
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

    // 7. Chat Real-time (Removido)
    // initChatDashboard(db);

    // 8. Store Status Management
    initStoreStatus(db);

    // 9. Marketing & Combo Price Management
    initMarketingSettings(db);
    initComboPrices(db);
}

// ===== Store Status Management =====
function initStoreStatus(db) {
    db.ref('settings/storeStatus').on('value', (snapshot) => {
        const status = snapshot.val() || 'auto';
        
        // Reset buttons
        ['open', 'closed', 'auto'].forEach(s => {
            const btn = document.getElementById(`btn-status-${s}`);
            if (btn) {
                btn.style.background = 'none';
                btn.style.color = 'var(--text-dim)';
                btn.style.boxShadow = 'none';
            }
        });

        // Highlight active button
        const activeBtn = document.getElementById(`btn-status-${status}`);
        if (activeBtn) {
            if (status === 'open') {
                activeBtn.style.background = 'var(--neon-green)';
                activeBtn.style.color = '#000';
                activeBtn.style.boxShadow = '0 0 10px var(--neon-green)';
            } else if (status === 'closed') {
                activeBtn.style.background = 'var(--primary)';
                activeBtn.style.color = '#fff';
                activeBtn.style.boxShadow = '0 0 10px var(--primary)';
            } else {
                activeBtn.style.background = '#444';
                activeBtn.style.color = '#fff';
            }
        }

        console.log("Store status updated from Firebase:", status);
    });
}

function setStoreStatus(status) {
    const db = firebase.database();
    db.ref('settings/storeStatus').set(status)
        .then(() => {
            console.log("✅ Status da loja atualizado para:", status);
            let msg = `Loja configurada para: ${status.toUpperCase()}`;
            if (status === 'auto') msg = "Loja em modo CRONÔMETRO AUTOMÁTICO.";
            addLogRow(new Date().toLocaleTimeString('pt-BR'), msg);
        })
        .catch((error) => {
            console.error("❌ Erro ao atualizar status da loja:", error);
            alert("Erro ao atualizar status da loja!\nMotivo: " + error.message);
        });
}

// ===== Chat Dashboard Functions (Removidos) =====

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
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Nenhum pedido encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        if (!order || !order.customer) return '';
        
        const date = order.timestamp ? new Date(order.timestamp).toLocaleString('pt-BR') : '-';
        
        // Proteção contra conversão objeto/array do Firebase
        const items = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
        const itemsStr = items.filter(i => i != null).map(i => {
            if (typeof i === 'string') return i;
            return `${i.quantity || 1}x ${i.name || 'Item'}`;
        }).join('<br>');
        
        const typeBadge = order.orderType === 'delivery' ? 'badge-delivery' : 'badge-pickup';
        const typeLabel = order.orderType === 'delivery' ? 'Entrega' : 'Retirada';

        return `
            <tr>
                <td>${date}</td>
                <td>
                    <strong>${order.customer.name || 'Cliente'}</strong><br>
                    <small>${order.customer.phone || ''}</small>
                </td>
                <td><span class="badge-type ${typeBadge}">${typeLabel}</span></td>
                <td style="font-size: 0.8rem; color: #ccc;">${itemsStr || 'Sem itens'}</td>
                <td style="font-size: 0.8rem;">${order.customer.address || '-'}</td>
                <td><span class="price-tag">R$ ${(order.total || 0).toFixed(2).replace('.', ',')}</span></td>
                <td>${order.payment || '-'}</td>
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
        if (!order) return;
        const payment = order.payment || '';
        let category = '';

        if (payment === 'Pix') category = 'Pix';
        else if (payment && (payment.toLowerCase().includes('cart') || payment.includes('Cartao'))) category = 'Cartao';
        else if (payment === 'Dinheiro') category = 'Dinheiro';

        if (category && totals[category]) {
            totals[category].total += (order.total || 0);
            totals[category].count += 1;
            const orderDate = order.timestamp ? new Date(order.timestamp) : null;
            if (orderDate && (!totals[category].last || orderDate > totals[category].last)) {
                totals[category].last = orderDate;
            }
            grandTotal += (order.total || 0);
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
    // Agora unificado na inicialização principal para evitar duplicidade de escrita no UI
    console.log("Métricas diárias sincronizadas.");
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

function formatCurrency(value) {
    if (typeof value !== 'number') return 'R$ 0,00';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatDate(date) {
    if (!date) return '-';
    // Se for hoje, mostrar apenas a hora. Se for outro dia, mostrar data e hora
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
    
    if (isToday) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ===== Segurança Avançada: Login do Firebase =====
function loginAdmin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');

    if (!email || !pass) {
        if (errorEl) {
            errorEl.textContent = "Por favor, digite o e-mail e a senha.";
            errorEl.style.display = 'block';
        }
        return;
    }

    if (errorEl) errorEl.style.display = 'none';

    firebase.auth().signInWithEmailAndPassword(email, pass)
        .catch(err => {
            console.error("Erro no login:", err);
            if (errorEl) {
                errorEl.textContent = "Falha no login: E-mail ou senha inválidos.";
                errorEl.style.display = 'block';
            }
        });
}

// ===== Marketing & Promotions Management =====
function initMarketingSettings(db) {
    db.ref('settings/promotions').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('promo-product-id').value = data.productId || '8';
            document.getElementById('promo-initial-stock').value = data.initialStock || '10';
            document.getElementById('promo-price').value = data.promoPrice || '38.90';
            document.getElementById('promo-decay-minutes').value = data.decayMinutes || '25';
            document.getElementById('promo-active-toggle').checked = data.active || false;
            document.getElementById('promo-show-stock-toggle').checked = data.showStock !== false;
            document.getElementById('promo-show-timer-toggle').checked = data.showTimer !== false;
            document.getElementById('promo-label').value = data.label || "🔥 20% OFF SÓ AGORA!";
            document.getElementById('promo-global-discount-toggle').checked = data.globalDiscountActive || false;
            document.getElementById('promo-global-discount-percent').value = data.globalDiscountPercent || 15;
            
            // Novos campos de Cupom
            document.getElementById('promo-coupon-active').checked = data.couponActive || false;
            document.getElementById('promo-coupon-code').value = data.couponCode || '';
            document.getElementById('promo-coupon-percent').value = data.couponPercent || 10;
        }
    });
}

function saveMarketingSettings() {
    const db = firebase.database();
    const settings = {
        productId: document.getElementById('promo-product-id').value,
        initialStock: parseInt(document.getElementById('promo-initial-stock').value),
        promoPrice: parseFloat(document.getElementById('promo-price').value),
        decayMinutes: parseInt(document.getElementById('promo-decay-minutes').value),
        active: document.getElementById('promo-active-toggle').checked,
        showStock: document.getElementById('promo-show-stock-toggle').checked,
        showTimer: document.getElementById('promo-show-timer-toggle').checked,
        label: document.getElementById('promo-label').value || "🔥 20% OFF SÓ AGORA!",
        globalDiscountActive: document.getElementById('promo-global-discount-toggle').checked,
        globalDiscountPercent: parseFloat(document.getElementById('promo-global-discount-percent').value) || 15,
        couponActive: document.getElementById('promo-coupon-active').checked,
        couponCode: (document.getElementById('promo-coupon-code').value || '').toUpperCase().trim(),
        couponPercent: parseFloat(document.getElementById('promo-coupon-percent').value) || 10,
        lastUpdate: new Date().toISOString()
    };

    db.ref('settings/promotions').set(settings)
        .then(() => {
            alert("✅ Configurações de Marketing salvas com sucesso!");
            addLogRow(new Date().toLocaleTimeString('pt-BR'), "📢 Promoção '" + settings.productId + "' atualizada pelo admin.");
        })
        .catch(err => {
            console.error("Erro ao salvar marketing:", err);
            alert("Erro ao salvar configurações!");
        });
}

function initComboPrices(db) {
    db.ref('settings/comboPrices').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach(id => {
                const priceInput = document.getElementById(`price-combo-${id}`);
                const statusInput = document.getElementById(`status-combo-${id}`);
                if (priceInput) {
                    priceInput.value = data[id].price || '0.00';
                    updateEconomyPreview(id, data[id].price); // Mostra prévia ao carregar
                }
                if (statusInput) statusInput.checked = data[id].active !== false;
            });
        }
    });

    // Adiciona listeners para atualização em tempo real no dashboard
    [5001, 5002, 5003, 5006, 5007, 5008, 5009].forEach(id => {
        const input = document.getElementById(`price-combo-${id}`);
        if (input) {
            input.addEventListener('input', (e) => {
                updateEconomyPreview(id, e.target.value);
            });
        }
    });
}

function updateEconomyPreview(id, price) {
    const preview = document.getElementById(`preview-economy-${id}`);
    if (!preview) return;

    const basePrices = { 5001: 49, 5002: 98, 5003: 118, 5006: 138, 5007: 69, 5008: 73, 5009: 82 };
    const labels = {
        5001: "Economia de R$",
        5002: "Economia de R$",
        5003: "Economia de R$",
        5006: "Economia de R$",
        5007: "Economia de R$",
        5008: "Economia de R$",
        5009: "PAGUE 1 LEVE 2: Economia de R$"
    };

    const base = basePrices[id];
    const current = parseFloat(price) || 0;

    if (current < base) {
        const economy = (base - current).toFixed(2).replace('.', ',');
        preview.textContent = `${labels[id]} ${economy}`;
    } else {
        preview.textContent = "";
    }
}

function saveComboPriceSettings() {
    const db = firebase.database();
    const combos = {};
    
    // Mapeamento de preços cheios e descrições base para cálculo de economia
    const comboMeta = {
        5001: { base: 49.00, desc: "1x X-Salada + 1x Coca-Cola Lata 350ml + 1x Fatia de Bolo.", label: "Economia de R$" },
        5002: { base: 98.00, desc: "2x X-Salada + 2x Coca-Cola Lata 350ml + 2x Fatia de Bolo.", label: "Economia de R$" },
        5003: { base: 118.00, desc: "2x X-Egg Bacon + 2x Coca-Cola Lata 350ml + 2x Fatia de Bolo.", label: "Economia de R$" },
        5006: { base: 138.00, desc: "2x Santo Juízo + 2x Coca-Cola Lata 350ml + 2x Fatias de Bolo Dois Amores.", label: "Economia de R$" },
        5007: { base: 69.00, desc: "1x Santo Juízo (O Supremo) + 1x Coca-Cola gelada + 1x Fatia de Bolo Dois Amores.", label: "🔥 EXCLUSIVO STATUS: Economia de R$" },
        5008: { base: 73.00, desc: "1x Santa Fúria 🔥 (O Gigante) + 1x Coca-Cola geladinha + 1x Fatia de Bolo de Chocolate.", label: "⚡ COMBO RELÂMPAGO: Economia de R$" },
        5009: { base: 82.00, desc: "Compre 1 Combo Tradicional (1x X-Salada + 1x Batata Frita + 1x Coca-Cola) e ganhe outro combo igual inteiramente GRÁTIS!", label: "🔥 PAGUE 1 LEVE 2: Economia de R$" }
    };

    [5001, 5002, 5003, 5006, 5007, 5008, 5009].forEach(id => {
        const priceEl = document.getElementById(`price-combo-${id}`);
        const statusEl = document.getElementById(`status-combo-${id}`);
        if (!priceEl || !statusEl) return;

        const newPrice = parseFloat(priceEl.value);
        const isActive = statusEl.checked;
        const meta = comboMeta[id];
        
        let description = meta.desc;
        if (newPrice < meta.base) {
            const economy = (meta.base - newPrice).toFixed(2).replace('.', ',');
            const style = (id === 5006 || id === 5007 || id === 5008 || id === 5009) ? 'color: #00FF41; font-weight: 800;' : 'color: var(--primary); font-weight: 600;';
            description += ` <br><small style='${style}'>${meta.label} ${economy}</small>`;
        }

        combos[id] = {
            price: newPrice,
            active: isActive,
            description: description
        };
    });

    db.ref('settings/comboPrices').set(combos)
        .then(() => {
            alert("💎 Configurações dos Combos (e Economia) atualizadas com sucesso!");
            addLogRow(new Date().toLocaleTimeString('pt-BR'), "💎 Preços e cálculos de economia dos combos atualizados.");
        })
        .catch(err => {
            console.error("Erro ao salvar combos:", err);
            alert("Erro ao salvar configurações!");
        });
}


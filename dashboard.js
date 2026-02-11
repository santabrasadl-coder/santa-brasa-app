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
if (firebaseConfig.apiKey !== "SUA_API_KEY_AQUI") {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase inicializado com sucesso.");
        initDashboard();
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
        document.getElementById('status-text').textContent = "Erro na Inicialização";
    }
} else {
    console.warn("Firebase não configurado. O dashboard está em modo demonstração.");
    document.getElementById('status-text').textContent = "Modo Demonstração (Sem Chaves)";
}

function initDashboard() {
    console.log("Conectando ao banco de dados...");
    const db = firebase.database();

    // Verificador de Conexão Geral
    db.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true) {
            console.log("Conectado ao Database com sucesso!");
            document.getElementById('status-text').textContent = "Conectado ao Live Stream";
            document.getElementById('status-text').style.color = "#00FF41";
            document.querySelector('.live-dot').style.backgroundColor = "#00FF41";
            document.querySelector('.live-dot').style.boxShadow = "0 0 10px #00FF41";
            document.getElementById('setup-hint').style.display = 'none';
        } else {
            console.warn("Desconectado do Database. Tentando reconectar...");
            document.getElementById('status-text').textContent = "Reconectando...";
            document.getElementById('status-text').style.color = "#FFD700";
        }
    });

    // 1. Ouvir Visitantes Online (Presence)
    db.ref('presence').on('value', (snapshot) => {
        const count = snapshot.numChildren() || 0;
        console.log("Visitantes online:", count);
        animateValue('count-live', count);
    }, (error) => {
        console.error("Erro ao ler Presence:", error);
    });

    // 2. Ouvir Total de Visitas Históricas
    db.ref('metrics/total_visits').on('value', (snapshot) => {
        const val = snapshot.val() || 0;
        console.log("Total visits:", val);
        animateValue('count-total', val);
    });

    // 3. Ouvir Cliques em Pedidos
    db.ref('metrics/total_orders_clicked').on('value', (snapshot) => {
        animateValue('count-orders', snapshot.val() || 0);
    });

    // 4. Ouvir Logs de Atividade
    db.ref('logs').limitToLast(15).on('child_added', (snapshot) => {
        const log = snapshot.val();
        addLogRow(log.time, log.msg);
    });
}

// ===== Funções Auxiliares =====
function animateValue(id, value) {
    const el = document.getElementById(id);
    el.textContent = value;
}

function addLogRow(time, msg) {
    const list = document.getElementById('activity-log');
    const li = document.createElement('li');
    li.className = 'log-item';
    li.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-msg">${msg}</span>
    `;
    list.prepend(li);
}

// Demonstração local se não houver Firebase
if (firebaseConfig.apiKey === "SUA_API_KEY_AQUI") {
    setInterval(() => {
        const fakeLive = Math.floor(Math.random() * 5) + 1;
        document.getElementById('count-live').textContent = fakeLive;
    }, 5000);
}

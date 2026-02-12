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
}

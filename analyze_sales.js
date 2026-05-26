const fs = require('fs');

const filePath = 'metric-s-939ee-default-rtdb-orders-export.json';

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let totalRevenue = 0;
    const numOrders = Object.keys(data).length;
    const itemCounts = {};
    const itemRevenue = {};
    const paymentCounts = {};
    const orderTypeCounts = {};
    const customerRevenue = {};
    const customerOrders = {};
    const dailySales = {};

    for (const orderId in data) {
        const order = data[orderId];
        const total = order.total || 0;
        totalRevenue += total;
        
        const payment = order.payment || 'N/A';
        paymentCounts[payment] = (paymentCounts[payment] || 0) + 1;
        
        const orderType = order.orderType || 'N/A';
        orderTypeCounts[orderType] = (orderTypeCounts[orderType] || 0) + 1;
        
        const customerName = (order.customer && order.customer.name) || 'Unknown';
        customerRevenue[customerName] = (customerRevenue[customerName] || 0) + total;
        customerOrders[customerName] = (customerOrders[customerName] || 0) + 1;
        
        const timestamp = order.timestamp || '';
        if (timestamp) {
            const date = timestamp.split('T')[0];
            dailySales[date] = (dailySales[date] || 0) + total;
        }
        
        (order.items || []).forEach(item => {
            const name = item.name || 'Unknown';
            const qty = item.quantity || 0;
            const price = item.price || 0;
            itemCounts[name] = (itemCounts[name] || 0) + qty;
            itemRevenue[name] = (itemRevenue[name] || 0) + (qty * price);
        });
    }

    const avgTicket = numOrders > 0 ? totalRevenue / numOrders : 0;

    console.log(`--- Resumo de Vendas ---`);
    console.log(`Total de Pedidos: ${numOrders}`);
    console.log(`Faturamento Total: R$ ${totalRevenue.toFixed(2)}`);
    console.log(`Ticket Médio: R$ ${avgTicket.toFixed(2)}`);
    
    console.log(`\n--- Itens Mais Vendidos (Qtd) ---`);
    Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([name, count]) => console.log(`${name}: ${count}`));

    console.log(`\n--- Faturamento por Item ---`);
    Object.entries(itemRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([name, rev]) => console.log(`${name}: R$ ${rev.toFixed(2)}`));

    console.log(`\n--- Formas de Pagamento ---`);
    for (const [pay, count] of Object.entries(paymentCounts)) {
        console.log(`${pay}: ${count}`);
    }

    console.log(`\n--- Tipos de Pedido ---`);
    for (const [ot, count] of Object.entries(orderTypeCounts)) {
        console.log(`${ot}: ${count}`);
    }

    console.log(`\n--- Melhores Clientes (Faturamento) ---`);
    Object.entries(customerRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([cust, rev]) => {
            console.log(`${cust}: R$ ${rev.toFixed(2)} (${customerOrders[cust]} pedidos)`);
        });

    console.log(`\n--- Vendas Diárias ---`);
    Object.keys(dailySales).sort().forEach(date => {
        console.log(`${date}: R$ ${dailySales[date].toFixed(2)}`);
    });

} catch (err) {
    console.error('Error reading or parsing file:', err);
}

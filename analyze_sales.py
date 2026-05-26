import json
from collections import Counter

file_path = r'c:\Users\zepeg\OneDrive\Área de Trabalho\Nova pasta\santa-brasa-app\metric-s-939ee-default-rtdb-orders-export.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

total_revenue = 0
num_orders = len(data)
item_counts = Counter()
item_revenue = Counter()
payment_counts = Counter()
order_type_counts = Counter()
customer_revenue = Counter()
customer_orders = Counter()
daily_sales = Counter()

for order_id, order in data.items():
    total = order.get('total', 0)
    total_revenue += total
    
    payment = order.get('payment', 'N/A')
    payment_counts[payment] += 1
    
    order_type = order.get('orderType', 'N/A')
    order_type_counts[order_type] += 1
    
    customer_name = order.get('customer', {}).get('name', 'Unknown')
    customer_revenue[customer_name] += total
    customer_orders[customer_name] += 1
    
    timestamp = order.get('timestamp', '')
    if timestamp:
        date = timestamp.split('T')[0]
        daily_sales[date] += total
    
    for item in order.get('items', []):
        name = item.get('name', 'Unknown')
        qty = item.get('quantity', 0)
        price = item.get('price', 0)
        item_counts[name] += qty
        item_revenue[name] += (qty * price)

avg_ticket = total_revenue / num_orders if num_orders > 0 else 0

print(f"--- Resumo de Vendas ---")
print(f"Total de Pedidos: {num_orders}")
print(f"Faturamento Total: R$ {total_revenue:.2f}")
print(f"Ticket Médio: R$ {avg_ticket:.2f}")
print(f"\n--- Itens Mais Vendidos (Qtd) ---")
for item, count in item_counts.most_common(5):
    print(f"{item}: {count}")

print(f"\n--- Faturamento por Item ---")
for item, rev in item_revenue.most_common(5):
    print(f"{item}: R$ {rev:.2f}")

print(f"\n--- Formas de Pagamento ---")
for pay, count in payment_counts.items():
    print(f"{pay}: {count}")

print(f"\n--- Tipos de Pedido ---")
for ot, count in order_type_counts.items():
    print(f"{ot}: {count}")

print(f"\n--- Melhores Clientes (Faturamento) ---")
for cust, rev in customer_revenue.most_common(3):
    print(f"{cust}: R$ {rev:.2f} ({customer_orders[cust]} pedidos)")

print(f"\n--- Vendas Diárias ---")
for date, rev in sorted(daily_sales.items()):
    print(f"{date}: R$ {rev:.2f}")

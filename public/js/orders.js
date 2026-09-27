// Load User Orders from Node.js REST API
async function loadUserOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    const user = getCurrentUser();
    if (!user) {
        ordersList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-lock fa-3x text-muted mb-3"></i>
                <h4>Please log in</h4>
                <p>Log in to view your order history.</p>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">Login</button>
            </div>
        `;
        return;
    }

    try {
        ordersList.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading orders...</span>
                </div>
            </div>
        `;

        const orders = await apiFetch('/orders/my-orders');
        ordersList.innerHTML = '';

        if (!orders || orders.length === 0) {
            ordersList.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                    <h4>No orders found</h4>
                    <p class="text-muted">You haven't placed or received any orders yet.</p>
                    <a href="index.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }

        orders.forEach(order => {
            const card = createOrderCard(order);
            ordersList.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading orders:', error);
        ordersList.innerHTML = `
            <div class="alert alert-danger m-3" role="alert">
                <h4 class="alert-heading">Error Loading Orders</h4>
                <p>${error.message || 'Could not connect to server.'}</p>
            </div>
        `;
    }
}

// Create Order Card DOM element
function createOrderCard(order) {
    const div = document.createElement('div');
    div.className = 'card mb-3 shadow-sm border-0';

    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const statusBadge = order.status === 'confirmed' ? 'bg-success' : 'bg-primary';

    let itemsHtml = order.items.map(item => `
        <div class="d-flex align-items-center mb-2">
            <img src="${item.image || 'https://via.placeholder.com/50'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;" class="rounded me-3">
            <div class="flex-grow-1">
                <h6 class="mb-0">${item.name}</h6>
                <small class="text-muted">Type: ${item.type || 'sale'} | ₹${item.price}</small>
            </div>
        </div>
    `).join('');

    div.innerHTML = `
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
            <div>
                <strong>Order #${order._id.substring(order._id.length - 8).toUpperCase()}</strong>
                <span class="text-muted ms-2 small"><i class="far fa-clock"></i> ${orderDate}</span>
            </div>
            <span class="badge ${statusBadge} text-uppercase px-3 py-2">${order.status}</span>
        </div>
        <div class="card-body">
            ${itemsHtml}
            <hr>
            <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">Total Amount: ₹${order.totalAmount}</span>
                <a href="ViewOrderDetails.html?id=${order._id}" class="btn btn-outline-primary btn-sm">
                    View Details
                </a>
            </div>
        </div>
    `;

    return div;
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserOrders();
});

window.loadUserOrders = loadUserOrders;
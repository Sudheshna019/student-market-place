// Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists || !userDoc.data().isAdmin) {
                window.location.href = 'admin-login.html';
            } else {
                loadDashboardData();
            }
        } else {
            window.location.href = 'admin-login.html';
        }
    });

    // Load dashboard data
    async function loadDashboardData() {
        try {
            // Get total users
            const usersSnapshot = await db.collection('users').get();
            document.getElementById('totalUsers').textContent = usersSnapshot.size;

            // Get total products
            const productsSnapshot = await db.collection('products').get();
            document.getElementById('totalProducts').textContent = productsSnapshot.size;

            // Get orders statistics
            const ordersSnapshot = await db.collection('orders').get();
            document.getElementById('totalOrders').textContent = ordersSnapshot.size;

            // Get pending orders
            const pendingOrdersSnapshot = await db.collection('orders')
                .where('status', '==', 'pending')
                .get();
            document.getElementById('pendingOrders').textContent = pendingOrdersSnapshot.size;

            // Load recent activity
            loadRecentActivity();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showAlert('danger', 'Error loading dashboard data');
        }
    }

    // Load recent activity
    async function loadRecentActivity() {
        try {
            const recentActivity = document.getElementById('recentActivity');
            
            // Get recent orders
            const recentOrders = await db.collection('orders')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            let activityHTML = '';
            
            recentOrders.forEach(doc => {
                const order = doc.data();
                const date = order.createdAt.toDate().toLocaleDateString();
                activityHTML += `
                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-light rounded-circle p-2 me-3">
                            <i class="fas fa-shopping-cart text-primary"></i>
                        </div>
                        <div>
                            <p class="mb-0">New order #${doc.id.substring(0, 8)}</p>
                            <small class="text-muted">${date}</small>
                        </div>
                    </div>
                `;
            });

            if (activityHTML === '') {
                activityHTML = '<p class="text-center text-muted">No recent activity</p>';
            }

            recentActivity.innerHTML = activityHTML;
        } catch (error) {
            console.error('Error loading recent activity:', error);
            document.getElementById('recentActivity').innerHTML = 
                '<p class="text-center text-danger">Error loading recent activity</p>';
        }
    }

    // Handle navigation
    const navLinks = document.querySelectorAll('.sidebar-link[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Load page content
            const page = link.getAttribute('data-page');
            loadPage(page);
        });
    });

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = 'admin-login.html';
        });
    });

    // Load page content
    function loadPage(page) {
        // Implementation for loading different pages will be added
        console.log('Loading page:', page);
    }

    // Show alert message
    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}); 
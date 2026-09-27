// Admin Users Management Logic
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists || !userDoc.data().isAdmin) {
                window.location.href = 'admin-login.html';
            } else {
                loadUserStats();
                loadUsers();
            }
        } else {
            window.location.href = 'admin-login.html';
        }
    });

    // Load user statistics
    async function loadUserStats() {
        try {
            const usersRef = db.collection('users');
            
            // Get total users
            const totalUsers = await usersRef.get();
            document.getElementById('totalUsersCount').textContent = totalUsers.size;

            // Get active users (logged in within last 24 hours)
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const activeUsers = await usersRef
                .where('lastLogin', '>', yesterday)
                .get();
            document.getElementById('activeUsersCount').textContent = activeUsers.size;

            // Get new users (joined today)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const newUsers = await usersRef
                .where('createdAt', '>', today)
                .get();
            document.getElementById('newUsersCount').textContent = newUsers.size;

            // Get blocked users
            const blockedUsers = await usersRef
                .where('status', '==', 'blocked')
                .get();
            document.getElementById('blockedUsersCount').textContent = blockedUsers.size;

        } catch (error) {
            console.error('Error loading user stats:', error);
            showAlert('danger', 'Error loading user statistics');
        }
    }

    // Load users list
    async function loadUsers() {
        try {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.orderBy('createdAt', 'desc').get();
            
            const usersList = document.getElementById('usersList');
            usersList.innerHTML = '';

            snapshot.forEach(doc => {
                const user = doc.data();
                const tr = document.createElement('tr');
                
                const joinDate = user.createdAt ? user.createdAt.toDate().toLocaleDateString() : 'N/A';
                const statusClass = user.status === 'blocked' ? 'danger' : 
                                  user.status === 'active' ? 'success' : 'warning';
                
                tr.innerHTML = `
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.email}</td>
                    <td>${joinDate}</td>
                    <td><span class="badge bg-${statusClass}">${user.status || 'active'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showUserDetails('${doc.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-${user.status === 'blocked' ? 'success' : 'danger'}" 
                                onclick="toggleUserStatus('${doc.id}', '${user.status}')">
                            <i class="fas fa-${user.status === 'blocked' ? 'unlock' : 'ban'}"></i>
                        </button>
                    </td>
                `;
                
                usersList.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading users:', error);
            showAlert('danger', 'Error loading users list');
        }
    }

    // Show user details
    window.showUserDetails = async function(userId) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            const user = userDoc.data();

            // Update modal with user details
            document.getElementById('userDetailName').textContent = user.name || 'N/A';
            document.getElementById('userDetailEmail').textContent = user.email;
            document.getElementById('userDetailJoinDate').textContent = 
                user.createdAt ? user.createdAt.toDate().toLocaleDateString() : 'N/A';
            document.getElementById('userDetailStatus').textContent = user.status || 'active';

            // Get user's orders count
            const ordersCount = await db.collection('orders')
                .where('userId', '==', userId)
                .get();
            document.getElementById('userDetailOrders').textContent = ordersCount.size;

            // Get user's products count
            const productsCount = await db.collection('products')
                .where('sellerId', '==', userId)
                .get();
            document.getElementById('userDetailProducts').textContent = productsCount.size;

            // Update last active
            document.getElementById('userDetailLastActive').textContent = 
                user.lastLogin ? user.lastLogin.toDate().toLocaleString() : 'Never';

            // Load recent activity
            const recentActivity = document.getElementById('userDetailActivity');
            recentActivity.innerHTML = '<div class="text-center">Loading activity...</div>';

            const recentOrders = await db.collection('orders')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            let activityHTML = '';
            recentOrders.forEach(doc => {
                const order = doc.data();
                activityHTML += `
                    <div class="d-flex align-items-center mb-2">
                        <i class="fas fa-shopping-cart text-primary me-2"></i>
                        <div>
                            <p class="mb-0">Ordered ${order.items.length} items</p>
                            <small class="text-muted">
                                ${order.createdAt.toDate().toLocaleDateString()}
                            </small>
                        </div>
                    </div>
                `;
            });

            if (activityHTML === '') {
                activityHTML = '<p class="text-muted">No recent activity</p>';
            }

            recentActivity.innerHTML = activityHTML;

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
            modal.show();
        } catch (error) {
            console.error('Error loading user details:', error);
            showAlert('danger', 'Error loading user details');
        }
    };

    // Toggle user status (block/unblock)
    window.toggleUserStatus = async function(userId, currentStatus) {
        try {
            const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
            await db.collection('users').doc(userId).update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showAlert('success', `User ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
            loadUsers();
            loadUserStats();
        } catch (error) {
            console.error('Error updating user status:', error);
            showAlert('danger', 'Error updating user status');
        }
    };

    // Search users
    document.getElementById('searchUser').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#usersList tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

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
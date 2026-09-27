// Auth helper functions for REST API

// Get current logged-in user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Update UI based on authentication state
function updateAuthUI(user) {
    const accountSection = document.getElementById('accountSection');
    if (!accountSection) return;

    if (user) {
        // Update profile information
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileImage = document.getElementById('profileImage');
        
        if (profileName) profileName.textContent = user.fullName || 'User';
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileImage && user.photoURL) profileImage.src = user.photoURL;

        accountSection.innerHTML = `
            <a href="profile.html" class="btn btn-outline-secondary me-2">
                <i class="fas fa-user"></i> ${user.fullName || 'Profile'}
            </a>
            <a href="cart.html" class="btn btn-primary position-relative">
                <i class="fas fa-shopping-cart"></i>
            </a>
            <button onclick="logout()" class="btn btn-outline-danger ms-2">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    } else {
        accountSection.innerHTML = `
            <button class="btn btn-outline-secondary me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="fas fa-user"></i> Account
            </button>
            <a href="cart.html" class="btn btn-primary position-relative">
                <i class="fas fa-shopping-cart"></i>
            </a>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAlert('info', 'Logged out successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Show alert function
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// Handle login form submission
document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    updateAuthUI(user);

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const data = await apiFetch('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                
                showAlert('success', 'Logged in successfully!');
                updateAuthUI(data);

                const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (modal) modal.hide();

                // Refresh page if needed
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                showAlert('danger', error.message || 'Login failed. Please check your credentials.');
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('registerName')?.value || document.getElementById('regName')?.value;
            const email = document.getElementById('registerEmail')?.value || document.getElementById('regEmail')?.value;
            const password = document.getElementById('registerPassword')?.value || document.getElementById('regPassword')?.value;

            try {
                const data = await apiFetch('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ fullName, email, password })
                });

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));

                showAlert('success', 'Account created successfully!');
                updateAuthUI(data);

                const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                if (modal) modal.hide();

                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                showAlert('danger', error.message || 'Registration failed.');
            }
        });
    }
});

// Export functions globally
window.getCurrentUser = getCurrentUser;
window.updateAuthUI = updateAuthUI;
window.logout = logout;
window.showAlert = showAlert;
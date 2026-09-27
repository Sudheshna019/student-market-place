// Admin Authentication Logic
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in as admin
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Check if user is an admin
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().isAdmin) {
                window.location.href = 'dashboard.html';
            }
        }
    });

    // Handle admin login form submission
    const adminLoginForm = document.getElementById('adminLoginForm');
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const errorMessage = document.getElementById('errorMessage');
        
        try {
            // Sign in with Firebase Auth
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Check if user is an admin
            const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
            
            if (userDoc.exists && userDoc.data().isAdmin) {
                // Redirect to admin dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Not an admin, show error
                throw new Error('Unauthorized access. Admin privileges required.');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('adminPassword');
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });
}); 
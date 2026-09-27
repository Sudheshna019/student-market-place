// User profile management

async function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileImage = document.getElementById('profileImage');
    const profilePhone = document.getElementById('profilePhone');

    if (profileName) profileName.textContent = user.fullName || 'User';
    if (profileEmail) profileEmail.textContent = user.email || '';
    if (profilePhone && user.phone) profilePhone.textContent = user.phone;
    if (profileImage && user.photoURL) profileImage.src = user.photoURL;

    loadMyListings();
}

async function loadMyListings() {
    const listingsContainer = document.getElementById('listingsList') || document.getElementById('myListingsContainer');
    if (!listingsContainer) return;

    try {
        listingsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading listings...</span>
                </div>
            </div>
        `;

        const items = await apiFetch('/items/seller/my-listings');
        listingsContainer.innerHTML = '';

        if (!items || items.length === 0) {
            listingsContainer.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="fas fa-list fa-2x mb-2"></i>
                    <p>You haven't listed any items for sale or borrow yet.</p>
                    <a href="sell.html" class="btn btn-sm btn-primary">List an Item</a>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'list-group-item d-flex justify-content-between align-items-center mb-2 rounded border';
            
            const badge = item.status === 'available' ? 'bg-success' : 'bg-secondary';

            div.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${item.image || 'https://via.placeholder.com/50'}" style="width: 50px; height: 50px; object-fit: cover;" class="rounded me-3">
                    <div>
                        <h6 class="mb-0">${item.name} <span class="badge ${badge} ms-2">${item.status}</span></h6>
                        <small class="text-muted">₹${item.price} (${item.type})</small>
                    </div>
                </div>
                <div>
                    <button onclick="deleteMyListing('${item._id}')" class="btn btn-outline-danger btn-sm">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            listingsContainer.appendChild(div);
        });

    } catch (error) {
        console.error('Error loading listings:', error);
    }
}

async function deleteMyListing(itemId) {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
        await apiFetch(`/items/${itemId}`, { method: 'DELETE' });
        showAlert('success', 'Listing deleted successfully');
        loadMyListings();
    } catch (error) {
        showAlert('danger', error.message || 'Failed to delete listing');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
});

window.loadUserProfile = loadUserProfile;
window.loadMyListings = loadMyListings;
window.deleteMyListing = deleteMyListing;
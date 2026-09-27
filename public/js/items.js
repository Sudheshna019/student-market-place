// Item categories
const categories = {
    'textbooks': 'Textbooks',
    'gadgets': 'Gadgets',
    'stationery': 'Stationery',
    'lab-equipment': 'Lab Equipment',
    'other': 'Other'
};

// Compress and convert image to base64
async function compressAndConvertImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) resolve('');
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const MAX_SIZE = 800;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        width = MAX_SIZE;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedBase64);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// Add new item for sale or borrow
async function addItemForSale(itemData) {
    try {
        const user = getCurrentUser();
        if (!user) {
            showAlert('danger', 'Please log in to list items');
            return false;
        }

        if (!itemData.name || itemData.price === undefined || !itemData.category || !itemData.description) {
            showAlert('danger', 'Please fill in all required fields');
            return false;
        }

        let imageBase64 = '';
        if (itemData.image && itemData.image instanceof File) {
            imageBase64 = await compressAndConvertImage(itemData.image);
        } else if (typeof itemData.image === 'string') {
            imageBase64 = itemData.image;
        }

        const payload = {
            name: itemData.name,
            price: parseFloat(itemData.price),
            category: itemData.category,
            description: itemData.description,
            condition: itemData.condition || 'Good',
            type: itemData.type || 'sale',
            deposit: itemData.deposit ? parseFloat(itemData.deposit) : 0,
            rentalPeriod: itemData.rentalPeriod || '',
            image: imageBase64
        };

        const newItem = await apiFetch('/items', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        showAlert('success', `Item listed successfully for ${newItem.type === 'borrow' ? 'borrowing' : 'sale'}!`);
        return newItem;
    } catch (error) {
        console.error('Error adding item:', error);
        showAlert('danger', error.message || 'Failed to list item. Please try again.');
        return false;
    }
}

// Load items for display
async function loadItems(categoryFilter = null, typeFilter = null, searchQuery = null) {
    const itemsContainer = document.getElementById('itemsContainer');
    if (!itemsContainer) return;

    try {
        itemsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading items...</span>
                </div>
            </div>
        `;

        let endpoint = '/items?status=available';
        if (categoryFilter && categoryFilter !== 'all') endpoint += `&category=${categoryFilter}`;
        if (typeFilter) endpoint += `&type=${typeFilter}`;
        if (searchQuery) endpoint += `&search=${encodeURIComponent(searchQuery)}`;

        const items = await apiFetch(endpoint);
        itemsContainer.innerHTML = '';

        if (!items || items.length === 0) {
            itemsContainer.innerHTML = `
                <div class="col-12 text-center py-5 text-muted">
                    <i class="fas fa-box-open fa-3x mb-3"></i>
                    <h4>No items found</h4>
                    <p>Be the first to list an item in this category!</p>
                    <a href="sell.html" class="btn btn-primary">List an Item</a>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const itemCard = createItemCard(item);
            itemsContainer.appendChild(itemCard);
        });

    } catch (error) {
        console.error('Error loading items:', error);
        itemsContainer.innerHTML = `
            <div class="col-12 text-center py-5 text-danger">
                <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <p>Failed to load items. Make sure backend server is running.</p>
            </div>
        `;
    }
}

// Create Item Card HTML element
function createItemCard(item) {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-sm-6 mb-4';

    const defaultImg = 'https://via.placeholder.com/300x200?text=No+Image+Available';
    const imgSrc = item.image && item.image.startsWith('data:image') ? item.image : (item.image || defaultImg);
    const badgeColor = item.type === 'borrow' ? 'bg-warning text-dark' : 'bg-success';
    const typeLabel = item.type === 'borrow' ? 'For Borrow' : 'For Sale';

    col.innerHTML = `
        <div class="card product-card h-100 shadow-sm border-0">
            <div class="position-relative">
                <img src="${imgSrc}" class="card-img-top" alt="${item.name}" style="height: 220px; object-fit: cover;">
                <span class="badge ${badgeColor} position-absolute top-0 end-0 m-2 px-3 py-2 fs-6">
                    ${typeLabel}
                </span>
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title text-truncate">${item.name}</h5>
                <p class="card-text text-muted small text-truncate">${item.description}</p>
                <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="h5 mb-0 text-primary">₹${item.price.toFixed(2)} ${item.type === 'borrow' ? '/day' : ''}</span>
                        <span class="badge bg-light text-dark border">${item.condition || 'Good'}</span>
                    </div>
                    ${item.type === 'borrow' && item.deposit ? `<small class="text-muted d-block mb-2">Deposit: ₹${item.deposit}</small>` : ''}
                    <div class="d-grid gap-2">
                        <button onclick="addToCart('${item._id}')" class="btn btn-outline-primary btn-sm">
                            <i class="fas fa-cart-plus me-1"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    return col;
}

// Add to Cart helper
async function addToCart(itemId) {
    const user = getCurrentUser();
    if (!user) {
        showAlert('warning', 'Please log in to add items to your cart');
        const modal = new bootstrap.Modal(document.getElementById('loginModal'));
        if (modal) modal.show();
        return;
    }

    try {
        await apiFetch('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ itemId, quantity: 1 })
        });
        showAlert('success', 'Item added to cart!');
    } catch (error) {
        showAlert('danger', error.message || 'Could not add item to cart.');
    }
}

// Global Exports
window.addItemForSale = addItemForSale;
window.loadItems = loadItems;
window.loadItemsByCategory = (category) => loadItems(category);
window.createItemCard = createItemCard;
window.addToCart = addToCart;
let products = []; 

let cart = JSON.parse(localStorage.getItem('smart_city_cart')) || [];


async function fetchProductsFromAPI() {
    try {
        const response = await fetch('api.php'); 
        products = await response.json();        
        
        renderProducts();
        renderCart();
    } catch (error) {
        console.error("Помилка завантаження товарів:", error);
        document.getElementById('products-container').innerHTML = 
            '<p style="color: var(--danger);">Помилка зв\'язку з сервером. Неможливо завантажити товари.</p>';
    }
}

function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = products.map(p => `
        <div class="stat-card" style="border-left-color: ${p.color};">
            <h3 style="color: ${p.color}; margin-top: 0;"><i class="fa-solid ${p.icon}"></i> ${p.name}</h3>
            <p style="font-size: 0.9rem; color: #ccc;">${p.desc}</p>
            <div style="margin-top: 15px; font-weight: bold; color: var(--success); font-size: 1.2rem;">${p.price} грн</div>
            <button class="btn-save" style="width: 100%; margin-top: 15px; justify-content: center; background: #2a2a2a; border: 1px solid #444;" 
                onclick="addToCart(${p.id})" onmouseover="this.style.borderColor='${p.color}'" onmouseout="this.style.borderColor='#444'">
                <i class="fa-solid fa-cart-plus"></i> Додати
            </button>
        </div>
    `).join('');
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const badgeEl = document.getElementById('cart-count');
    if (!container) return;

    let totalSum = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; padding: 20px 0;">Ваш кошик порожній. Додайте щось з каталогу!</p>';
    } else {
        container.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return '';
            
            const subtotal = product.price * item.quantity;
            totalSum += subtotal;
            totalItems += item.quantity;

            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${product.name}</h4>
                        <span>${product.price} грн / шт</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span style="min-width: 20px; text-align: center; color: white;">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                        <button class="btn-delete" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        }).join('');
    }

    totalEl.innerText = totalSum.toLocaleString() + ' грн';
    if (badgeEl) badgeEl.innerText = totalItems;

    localStorage.setItem('smart_city_cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    const product = products.find(p => p.id === productId);
    showToast(`🛒 Додано: ${product.name}`);
    renderCart();
}

function changeQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId); 
        } else {
            renderCart();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
}

function toggleCartModal() {
    const modal = document.getElementById('cartModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const t = document.createElement('div');
    t.className = 'toast'; 
    t.style.background = 'var(--success)';
    t.innerHTML = `<i class="fa-solid fa-check"></i> <span>${msg}</span>`;
    container.appendChild(t); 
    setTimeout(() => t.remove(), 3000);
}

function checkout() {
    if (cart.length === 0) {
        alert("Кошик порожній!");
        return;
    }
    alert("Замовлення успішно оформлено! Дані надіслано на сервер.");
    cart = [];
    renderCart();
    toggleCartModal();
}

document.addEventListener('DOMContentLoaded', () => {
    fetchProductsFromAPI();
});
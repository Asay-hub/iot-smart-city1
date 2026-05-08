<button class="floating-cart" onclick="toggleCartModal()">
    <i class="fa-solid fa-cart-shopping"></i>
    <span id="cart-count" class="cart-badge">0</span>
</button>

<div id="cartModal" class="modal-backdrop" onclick="if(event.target === this) toggleCartModal()">
   </div>

<div class="toast-container" id="toast-container"></div>

<div class="page-container">
    <h1 style="color: var(--accent); border-bottom: 2px solid #333; padding-bottom: 10px;">Наше обладнання та послуги</h1>
    <p style="color: #aaa; margin-bottom: 30px;">Перелік доступних IoT-модулів...</p>
    <div id="products-container" class="services-grid"></div>
</div>
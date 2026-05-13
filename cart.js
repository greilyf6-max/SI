// cart.js - global cart and modal logic for all pages

const Cart = {
    items: [],
    load() {
        try {
            const stored = localStorage.getItem('skincare_cart');
            this.items = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load cart', e);
            this.items = [];
        }
    },
    save() {
        localStorage.setItem('skincare_cart', JSON.stringify(this.items));
    },
    add(product) {
        const existing = this.items.find(p => p.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({ ...product, qty: 1 });
        }
        this.save();
        this.updateUI();
        showNotification(`${product.name} añadido al carrito`);
    },
    remove(id) {
        this.items = this.items.filter(p => p.id !== id);
        this.save();
        this.updateUI();
    },
    updateQty(id, qty) {
        const item = this.items.find(p => p.id === id);
        if (!item) return;
        item.qty = qty;
        if (item.qty < 1) {
            this.remove(id);
        } else {
            this.save();
            this.updateUI();
        }
    },
    clear() {
        this.items = [];
        this.save();
        this.updateUI();
    },
    total() {
        return this.items.reduce((sum, p) => sum + p.price * p.qty, 0);
    },
    count() {
        return this.items.reduce((sum, p) => sum + p.qty, 0);
    },
    togglePanel() {
        const panel = document.getElementById('cartPanel');
        if (panel) panel.classList.toggle('active');
    },
    renderCartPanel() {
        const container = document.getElementById('cartItems');
        if (!container) return;
        if (this.items.length === 0) {
            container.innerHTML = '<p class="empty-cart">El carrito está vacío</p>';
            document.getElementById('cartTotal').textContent = '$0.00';
            return;
        }
        container.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <span class="item-emoji">${item.emoji || ''}</span>
                <span class="item-name">${item.name}</span>
                <span class="item-price">$${item.price.toFixed(2)}</span>
                <div class="item-qty">
                    <button onclick="Cart.updateQty('${item.id}', ${item.qty - 1})">-</button>
                    <span>${item.qty}</span>
                    <button onclick="Cart.updateQty('${item.id}', ${item.qty + 1})">+</button>
                </div>
                <button class="remove-item" onclick="Cart.remove('${item.id}')">Eliminar</button>
            </div>
        `).join('');
        document.getElementById('cartTotal').textContent = `$${this.total().toFixed(2)}`;
    },
    updateUI() {
        const badge = document.getElementById('cartCount');
        if (badge) badge.textContent = this.count();
        this.renderCartPanel();
    },
    showPaymentSection() {
        if (this.items.length === 0) {
            showNotification('El carrito está vacío');
            return;
        }
        document.getElementById('cartPanel').classList.remove('active');
        document.getElementById('paymentSection').classList.add('active');
    },
    hidePaymentSection() {
        document.getElementById('paymentSection').classList.remove('active');
    },
    confirmPayment() {
        // Validar que el formulario esté completo
        const form = document.getElementById('paymentForm');
        if (!form.checkValidity()) {
            showNotification('Por favor completa todos los campos');
            return;
        }

        // Simular pedido
        const order = {
            id: Date.now(),
            items: [...this.items],
            total: this.total(),
            status: 'Procesando',
            location: 'Santiago, RD',
            date: new Date().toISOString()
        };
        
        localStorage.setItem('currentOrder', JSON.stringify(order));
        
        if (typeof window.renderOrderTrackingSection === 'function') {
            window.renderOrderTrackingSection();
        }
        
        this.clear();
        this.hidePaymentSection();
        
        showNotification('✅ ¡Pago confirmado! Redirigiendo a tu pedido...');
        
        // Esperar un poco y luego hacer scroll
        setTimeout(() => {
            const orderSection = document.getElementById('localizarPedido');
            if (orderSection) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                    orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        }, 500);
    },
    injectCartHTML() {
        const html = `
        <button id="cartBtn" class="cart-button" onclick="Cart.togglePanel()">
            <i class="fas fa-shopping-cart"></i>
            <span id="cartCount" class="cart-count">0</span>
        </button>
        <div id="cartPanel" class="cart-panel">
            <div class="cart-header">
                <h2>Tu Carrito</h2>
                <button class="close-cart" onclick="Cart.togglePanel()">&times;</button>
            </div>
            <div id="cartItems" class="cart-items"></div>
            <div class="cart-footer">
                <div class="cart-total">Total: <span id="cartTotal">$0.00</span></div>
                <button class="checkout-btn" onclick="Cart.showPaymentSection()">Finalizar Compra</button>
                <button class="clear-btn" onclick="Cart.clear()">Vaciar carrito</button>
            </div>
        </div>
        <div id="paymentSection" class="payment-section">
            <div class="payment-header">
                <h2>Método de Pago</h2>
                <button class="close-payment" onclick="Cart.hidePaymentSection()">&times;</button>
            </div>
            <form id="paymentForm" class="payment-form">
                <h3>Datos de la Tarjeta</h3>
                <div class="form-group">
                    <label for="cardNumber">Número de Tarjeta</label>
                    <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="expiryDate">Fecha de Expiración</label>
                        <input type="text" id="expiryDate" placeholder="MM/AA" required>
                    </div>
                    <div class="form-group">
                        <label for="cvv">CVV</label>
                        <input type="text" id="cvv" placeholder="123" required>
                    </div>
                </div>
                <h3>Dirección de Envío</h3>
                <div class="form-group">
                    <label for="fullName">Nombre Completo</label>
                    <input type="text" id="fullName" placeholder="Juan Pérez" required>
                </div>
                <div class="form-group">
                    <label for="address">Dirección</label>
                    <input type="text" id="address" placeholder="Calle Principal 123" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="city">Ciudad</label>
                        <input type="text" id="city" placeholder="Santiago" required>
                    </div>
                    <div class="form-group">
                        <label for="zipCode">Código Postal</label>
                        <input type="text" id="zipCode" placeholder="51000" required>
                    </div>
                </div>
                <button type="submit" class="confirm-payment-btn">Confirmar Pago</button>
            </form>
        </div>
        <div id="cartToast" class="cart-toast"></div>
        <div id="productModal" class="product-modal"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        // basic styles for cart button and panel
        const style = document.createElement('style');
        style.textContent = `
            .cart-button {position:fixed;bottom:20px;right:20px;background:#4a9d6f;color:#fff;border:none;padding:10px 15px;border-radius:50px;cursor:pointer;z-index:9999;}
            .cart-count {background:#c06c84;color:#fff;padding:2px 6px;border-radius:12px;margin-left:5px;}
            .cart-panel {position:fixed;top:0;right:-400px;width:350px;height:100%;background:#fff;box-shadow:-4px 0 12px rgba(0,0,0,0.2);transition:right .3s ease;z-index:9998;display:flex;flex-direction:column;}
            .cart-panel.active {right:0;}
            .cart-header {display:flex;justify-content:space-between;align-items:center;padding:15px;border-bottom:1px solid #eee;}
            .cart-items {flex:1;overflow:auto;padding:10px;}
            .cart-item {display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f0f0f0;}
            .item-emoji {font-size:1.5rem;}
            .item-name{flex:1;}
            .item-qty button{width:24px;height:24px;}
            .cart-footer {padding:15px;border-top:1px solid #eee;display:flex;flex-direction:column;gap:10px;}
            .payment-section {position:fixed;top:0;right:-400px;width:350px;height:100%;background:#fff;box-shadow:-4px 0 12px rgba(0,0,0,0.2);transition:right .3s ease;z-index:9999;display:flex;flex-direction:column;}
            .payment-section.active {right:0;}
            .payment-header {display:flex;justify-content:space-between;align-items:center;padding:15px;border-bottom:1px solid #eee;}
            .payment-form {flex:1;overflow:auto;padding:15px;display:flex;flex-direction:column;gap:15px;}
            .form-group {display:flex;flex-direction:column;gap:5px;}
            .form-row {display:flex;gap:10px;}
            .form-row .form-group {flex:1;}
            .form-group label {font-weight:bold;color:#2d5f3f;}
            .form-group input {padding:10px;border:1px solid #e2e8f0;border-radius:5px;font-size:14px;}
            .confirm-payment-btn {background:linear-gradient(135deg,#2d5f3f 0%,#4a9d6a 100%);color:#fff;border:none;padding:15px;border-radius:50px;cursor:pointer;font-size:16px;font-weight:bold;margin-top:10px;transition:all 0.3s ease;width:100%;}
            .confirm-payment-btn:hover:not(:disabled) {transform:translateY(-2px);box-shadow:0 5px 20px rgba(45,95,63,0.4);}
            .confirm-payment-btn:disabled {opacity:0.7;cursor:not-allowed;}
            .confirm-payment-btn:active:not(:disabled) {transform:translateY(0);}
            .close-payment {background:none;border:none;font-size:1.5rem;cursor:pointer;}
            .cart-toast {position:fixed;bottom:80px;right:20px;background:#333;color:#fff;padding:10px 15px;border-radius:4px;opacity:0;transition:opacity .3s ease;z-index:10000;}
            .cart-toast.show {opacity:1;}
            .product-modal {position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:none;align-items:center;justify-content:center;z-index:10001;}
            .product-modal.active {display:flex;}
            .product-modal .modal-content {background:#fff;padding:20px;max-width:500px;width:90%;border-radius:8px;position:relative;}
            .product-modal .close-btn {position:absolute;top:10px;right:10px;background:none;border:none;font-size:1.5rem;cursor:pointer;}
            .product-modal .details-tags span {display:inline-block;background:#f0f0f0;padding:4px 8px;margin:2px;border-radius:4px;font-size:.9rem;}
        `;
        document.head.appendChild(style);
    },
    init() {
        this.load();
        this.injectCartHTML();
        this.updateUI();
        // close panel on outside click
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('cartPanel');
            const btn = document.getElementById('cartBtn');
            if (panel && panel.classList.contains('active') && !panel.contains(e.target) && e.target !== btn) {
                this.togglePanel();
            }
        });
        // payment form submit
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'paymentForm') {
                e.preventDefault();
                const btn = e.target.querySelector('.confirm-payment-btn');
                btn.disabled = true;
                btn.textContent = 'Procesando...';
                
                // Simular procesamiento de pago
                setTimeout(() => {
                    this.confirmPayment();
                    btn.disabled = false;
                    btn.textContent = 'Confirmar Pago';
                }, 1000);
            }
        });
    }
};

function showNotification(message) {
    const toast = document.getElementById('cartToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function openProductModal(product) {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    const tags = product.details ? product.details.map(d=>`<span>${d}</span>`).join('') : '';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn" onclick="closeProductModal()">&times;</button>
            <div class="modal-body">
                <div class="modal-emoji" style="font-size:3rem; text-align:center;">${product.emoji || ''}</div>
                <h2>${product.name}</h2>
                <p class="modal-category">${product.category}</p>
                <p>${product.description}</p>
                <div class="details-tags">${tags}</div>
                <div class="modal-footer" style="margin-top:15px; display:flex;justify-content:space-between;align-items:center;">
                    <span class="modal-price">$${product.price.toFixed(2)}</span>
                    <button onclick="Cart.add(${JSON.stringify(product).replace(/"/g,'&quot;')})">Agregar al carrito</button>
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
    // close when clicking outside
    modal.addEventListener('click', function(e){ if(e.target===modal) closeProductModal(); });
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('active');
}

// initialize cart when DOM ready
window.addEventListener('DOMContentLoaded', () => Cart.init());

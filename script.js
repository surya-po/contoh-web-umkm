// Menu Data
const menuData = {
    kebab: [
        {
            id: 'kebab-original',
            name: 'Kebab Original',
            price: 5000,
            image: './assets/kebab-original.jpg'
        },
        {
            id: 'kebab-mozzarella',
            name: 'Kebab Mozzarella',
            price: 7000,
            image: './assets/kebab-mozzarella.jpg'
        }
    ],
    drinks: [
        {
            id: 'es-teh-manis',
            name: 'Es Teh Manis',
            price: 5000,
            image: './assets/es-teh-manis.jpg'
        },
        {
            id: 'lemon-tea',
            name: 'Lemon Tea',
            price: 5000,
            image: './assets/lemon-tea.jpg'
        },
        {
            id: 'es-jeruk',
            name: 'Es Jeruk',
            price: 5000,
            image: './assets/es-jeruk.jpg'
        },
        {
            id: 'air-mineral',
            name: 'Air Mineral',
            price: 5000,
            image: './assets/air-mineral.jpg'
        }
    ]
};

// Cart Management
class CartManager {
    constructor() {
        this.cart = this.loadCart();
    }

    loadCart() {
        const saved = localStorage.getItem('kebabCart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('kebabCart', JSON.stringify(this.cart));
    }

    addItem(item, quantity) {
        const existingItem = this.cart.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({ ...item, quantity });
        }
        this.saveCart();
        this.updateCartDisplay();
    }

    removeItem(itemId) {
        this.cart = this.cart.filter(i => i.id !== itemId);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(itemId, quantity) {
        const item = this.cart.find(i => i.id === itemId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(itemId);
            } else {
                this.saveCart();
            }
        }
        this.updateCartDisplay();
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const floatingCart = document.getElementById('floating-cart');
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');

        if (floatingCart && cartCount && cartTotal) {
            const itemCount = this.getItemCount();
            const total = this.getTotal();

            if (itemCount > 0) {
                floatingCart.classList.add('active');
                cartCount.textContent = `${itemCount} item${itemCount > 1 ? 's' : ''}`;
                cartTotal.textContent = this.formatPrice(total);
            } else {
                floatingCart.classList.remove('active');
            }
        }
    }

    formatPrice(price) {
        return `Rp ${price.toLocaleString('id-ID')}`;
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Menu Page Functions
function initMenuPage() {
    const kebabMenu = document.getElementById('kebab-menu');
    const drinksMenu = document.getElementById('drinks-menu');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (kebabMenu) {
        renderMenuItems(menuData.kebab, kebabMenu);
    }

    if (drinksMenu) {
        renderMenuItems(menuData.drinks, drinksMenu);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartManager.getItemCount() > 0) {
                window.location.href = 'checkout.html';
            }
        });
    }

    cartManager.updateCartDisplay();
}

function renderMenuItems(items, container) {
    container.innerHTML = items.map(item => `
        <div class="menu-card">
            <img src="${item.image}" alt="${item.name}" class="menu-image">
            <div class="menu-info">
                <h3 class="menu-name">${item.name}</h3>
                <p class="menu-price">${cartManager.formatPrice(item.price)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn" data-action="decrease" data-id="${item.id}">−</button>
                    <span class="quantity-display" id="qty-${item.id}">1</span>
                    <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
                </div>
                <button class="add-to-cart-btn" data-id="${item.id}">
                    Tambah ke Keranjang
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners after rendering
    container.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');
            const itemId = this.getAttribute('data-id');
            
            if (action === 'increase') {
                increaseQuantity(itemId);
            } else if (action === 'decrease') {
                decreaseQuantity(itemId);
            }
        });
    });

    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const itemId = this.getAttribute('data-id');
            addToCart(itemId, this);
        });
    });
}

// Quantity controls
function increaseQuantity(itemId) {
    const qtyDisplay = document.getElementById(`qty-${itemId}`);
    if (qtyDisplay) {
        let qty = parseInt(qtyDisplay.textContent);
        qty++;
        qtyDisplay.textContent = qty;
    }
}

function decreaseQuantity(itemId) {
    const qtyDisplay = document.getElementById(`qty-${itemId}`);
    if (qtyDisplay) {
        let qty = parseInt(qtyDisplay.textContent);
        if (qty > 1) {
            qty--;
            qtyDisplay.textContent = qty;
        }
    }
}

function addToCart(itemId, buttonElement) {
    const qtyDisplay = document.getElementById(`qty-${itemId}`);
    const quantity = parseInt(qtyDisplay.textContent);
    
    // Find item in menu data
    let item = null;
    for (const category in menuData) {
        item = menuData[category].find(i => i.id === itemId);
        if (item) break;
    }

    if (item) {
        cartManager.addItem(item, quantity);
        qtyDisplay.textContent = '1'; // Reset quantity
        
        // Show feedback
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '✓ Ditambahkan!';
        buttonElement.style.background = '#4CAF50';
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.style.background = '';
        }, 1000);
    }
}

// Checkout Page Functions
function initCheckoutPage() {
    const orderSummary = document.getElementById('order-summary');
    const totalPrice = document.getElementById('total-price');
    const checkoutForm = document.getElementById('checkout-form');
    const paymentQris = document.getElementById('payment-qris');
    const paymentOutlet = document.getElementById('payment-outlet');
    const qrisSection = document.getElementById('qris-section');
    const paymentProof = document.getElementById('payment-proof');
    const filePreview = document.getElementById('file-preview');
    const previewImage = document.getElementById('preview-image');
    const removePreview = document.getElementById('remove-preview');
    const downloadQris = document.getElementById('download-qris');

    // Check if cart is empty
    if (cartManager.getItemCount() === 0) {
        alert('Keranjang Anda kosong!');
        window.location.href = 'menu.html';
        return;
    }

    // Render order summary
    renderOrderSummary();

    // Payment method toggle
    if (paymentQris && paymentOutlet && qrisSection) {
        paymentQris.addEventListener('change', () => {
            qrisSection.style.display = 'block';
            paymentProof.required = true;
        });

        paymentOutlet.addEventListener('change', () => {
            qrisSection.style.display = 'none';
            paymentProof.required = false;
            paymentProof.value = '';
            filePreview.style.display = 'none';
        });
    }

    // File upload preview
    if (paymentProof && filePreview && previewImage) {
        paymentProof.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    filePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removePreview && filePreview && paymentProof) {
        removePreview.addEventListener('click', () => {
            paymentProof.value = '';
            filePreview.style.display = 'none';
            previewImage.src = '';
        });
    }

    // Download QRIS
    if (downloadQris) {
        downloadQris.addEventListener('click', () => {
            const qrisImage = document.getElementById('qris-image');
            const link = document.createElement('a');
            link.href = qrisImage.src;
            link.download = 'qris-kebab-kekinian.png';
            link.click();
        });
    }

    // Form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendWhatsAppOrder();
        });
    }
}

function renderOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    const totalPrice = document.getElementById('total-price');

    if (orderSummary) {
        orderSummary.innerHTML = cartManager.cart.map(item => `
            <div class="order-item">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity-controls">
                        <button class="item-qty-btn" data-action="decrease" data-id="${item.id}">−</button>
                        <span class="item-quantity">${item.quantity}x ${cartManager.formatPrice(item.price)}</span>
                        <button class="item-qty-btn" data-action="increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="item-price">${cartManager.formatPrice(item.price * item.quantity)}</div>
                    <button class="delete-item-btn" data-id="${item.id}" title="Hapus item">🗑️</button>
                </div>
            </div>
        `).join('');

        // Add event listeners for quantity controls
        orderSummary.querySelectorAll('.item-qty-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const action = this.getAttribute('data-action');
                const itemId = this.getAttribute('data-id');
                
                const item = cartManager.cart.find(i => i.id === itemId);
                if (item) {
                    if (action === 'increase') {
                        cartManager.updateQuantity(itemId, item.quantity + 1);
                    } else if (action === 'decrease') {
                        if (item.quantity > 1) {
                            cartManager.updateQuantity(itemId, item.quantity - 1);
                        } else {
                            if (confirm('Hapus item ini dari keranjang?')) {
                                cartManager.removeItem(itemId);
                            }
                        }
                    }
                    renderOrderSummary();
                }
            });
        });

        // Add event listeners for delete buttons
        orderSummary.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const itemId = this.getAttribute('data-id');
                if (confirm('Hapus item ini dari keranjang?')) {
                    cartManager.removeItem(itemId);
                    renderOrderSummary();
                    
                    // Redirect if cart is empty
                    if (cartManager.getItemCount() === 0) {
                        alert('Keranjang kosong! Kembali ke menu.');
                        window.location.href = 'menu.html';
                    }
                }
            });
        });
    }

    if (totalPrice) {
        totalPrice.textContent = cartManager.formatPrice(cartManager.getTotal());
    }
}

function sendWhatsAppOrder() {
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    const branch = document.getElementById('branch').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const hasProof = document.getElementById('payment-proof').files.length > 0;

    // Build order message
    let message = `*PESANAN BARU - KEBAB KEKINIAN*\n\n`;
    message += `*Data Pemesan:*\n`;
    message += `Nama: ${name}\n`;
    message += `No. WhatsApp: ${phone}\n`;
    message += `Cabang: ${branch}\n\n`;

    message += `*Detail Pesanan:*\n`;
    cartManager.cart.forEach(item => {
        message += `• ${item.name} x${item.quantity} = ${cartManager.formatPrice(item.price * item.quantity)}\n`;
    });

    message += `\n*Total Pembayaran: ${cartManager.formatPrice(cartManager.getTotal())}*\n\n`;

    message += `*Metode Pembayaran:* ${paymentMethod === 'qris' ? 'QRIS' : 'Bayar di Outlet'}\n`;

    if (address) {
        message += `\n*Alamat/Catatan:*\n${address}\n`;
    }

    if (paymentMethod === 'qris' && hasProof) {
        message += `\n_Bukti pembayaran telah diupload — mohon kirimkan foto bukti tersebut melalui chat WhatsApp._`;
    }

    // Encode message for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '6287865025756';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Open WhatsApp
    window.location.href = whatsappUrl;

    // Clear cart after sending
    setTimeout(() => {
        if (confirm('Pesanan telah dikirim! Keranjang akan dikosongkan. Kembali ke menu?')) {
            cartManager.clearCart();
            window.location.href = 'menu.html';
        }
    }, 1000);
}

// Initialize based on current page
const page = window.location.pathname.split('/').pop();

if (page === '' || page === 'index.html' || page === 'menu.html') {
    initMenuPage();
} else if (page === 'checkout.html') {
    initCheckoutPage();
}

// Created by York
// Student ID: 712

// Global variables
let kits = [];
let currentUser = null;

// Function to check authentication status
function checkAuth712() {
    currentUser = sessionStorage.getItem('currentUser');
    const allowedPages = ['login.html', 'register.html', 'home.html', 'browse.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (!currentUser && !allowedPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return;
    }

    // Update UI for logged-in users
    if (currentUser) {
        const userGreeting = document.getElementById('user-greeting');
        if (userGreeting) {
            userGreeting.textContent = `Welcome, ${currentUser}`;
        }
    }
}

// Load training kits from JSON file
function loadKits712() {
    return fetch('kits.json')
        .then(response => response.json())
        .then(data => {
            kits = data;
            return data;
        })
        .catch(error => {
            console.error('Error loading kits:', error);
            return [];
        });
}

// Validate registration form
function validateForm712() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    let isValid = true;

    function shakeInput(inputElement) {
        inputElement.classList.add('input-shake');
        setTimeout(() => {
            inputElement.classList.remove('input-shake');
        }, 500);
    }

    if (!username) {
        alert('Username is required.');
        shakeInput(document.getElementById('regUsername'));
        return false;
    }

    if (!password) {
        alert('Password is required.');
        shakeInput(document.getElementById('regPassword'));
        return false;
    }

    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        shakeInput(document.getElementById('regEmail'));
        return false;
    }

    if (!passwordRegex.test(password)) {
        alert('Password must be at least 8 characters with letters, numbers, and special characters.');
        shakeInput(document.getElementById('regPassword'));
        return false;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        shakeInput(document.getElementById('regPassword'));
        shakeInput(document.getElementById('regConfirmPassword'));
        return false;
    }

    return true;
}

// Register new user
function registerUser712(e) {
    e.preventDefault();
    if (!validateForm712()) return;

    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(user => user.username === username)) {
        alert('Username already exists.');
        return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please log in.');
    window.location.href = 'login.html';
}

// Log in user
function loginUser712(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        sessionStorage.setItem('currentUser', username);
        window.location.href = 'cart.html';
    } else {
        alert('Invalid username or password.');
    }
}

// Display all resource kits
function displayAllKits712() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '';

    kits.forEach(kit => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <img src="images/${kit.image}" alt="${kit.name}">
            <h3>${kit.name}</h3>
            <h3>${kit.id}</h3>
            <p>${kit.description}</p>
            <p class="price">$${kit.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${kit.id}">Add to Cart</button>
        `;
        productList.appendChild(productElement);
    });
}

// Add item to cart
function addToCart712(productId) {
    const kit = kits.find(p => p.id === productId);
    if (!kit) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: kit.id,
            name: kit.name,
            price: kit.price,
            image: kit.image,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay712();
    
    // Show flying animation
    showFlyAnimation712(kit);
    alert(`${kit.name} added to cart!`);
}


// Update cart display
function updateCartDisplay712() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="images/${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="quantity-control">
                        <button class="quantity-decrease" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" data-id="${item.id}" value="${item.quantity}" min="1">
                        <button class="quantity-increase" data-id="${item.id}">+</button>
                    </div>
                    <p>Price: $${itemTotal.toFixed(2)}</p>
                </div>
                <button class="remove-item" data-id="${item.id}">×</button>
            </div>
        `;
    });

    cartItems.innerHTML += `
        <div class="cart-total">
            <h4>Total: $${total.toFixed(2)}</h4>
        </div>
        <div class="cart-actions">
            <button id="checkout-btn">Proceed to Checkout</button>
        </div>
    `;

    document.getElementById('checkout-btn')?.addEventListener('click', function () {
        window.location.href = 'confirm.html';
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart712(productId);
        });
    });

    document.querySelectorAll('.quantity-decrease').forEach(button => {
        button.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            updateQuantity712(productId, -1);
        });
    });

    document.querySelectorAll('.quantity-increase').forEach(button => {
        button.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            updateQuantity712(productId, 1);
        });
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            const newQuantity = parseInt(this.value);
            if (newQuantity > 0) {
                updateQuantity712(productId, 0, newQuantity);
            } else {
                this.value = 1;
            }
        });
    });
}

// Remove item from cart
function removeFromCart712(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay712();
}

// Update item quantity
function updateQuantity712(productId, change, newQuantity = null) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
        if (newQuantity !== null) {
            cart[itemIndex].quantity = newQuantity;
        } else {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity < 1) cart[itemIndex].quantity = 1;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay712();
    }
}

// Show order summary
function updateOrderSummary712() {
    const orderSummary = document.getElementById('order-summary');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        orderSummary.innerHTML = '<p>No items in your cart</p>';
        return;
    }

    let html = '<h2>Order Summary</h2><div class="order-items">';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        html += `
            <div class="order-item">
                <img src="images/${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${itemTotal.toFixed(2)}</p>
                </div>
            </div>
        `;
    });

    html += `
        </div>
        <div class="order-total">
            <h4>Total: $${total.toFixed(2)}</h4>
        </div>
        <div class="order-actions">
            <button id="confirm-order">Confirm Order</button>
            <button id="edit-order">Edit Order</button>
        </div>
    `;

    orderSummary.innerHTML = html;

    document.getElementById('confirm-order').addEventListener('click', confirmOrder712);
    document.getElementById('edit-order').addEventListener('click', () => {
        window.location.href = 'cart.html';
    });
}

// Confirm order
function confirmOrder712() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const order = {
        user: currentUser,
        items: [...cart],
        date: new Date().toISOString(),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    localStorage.removeItem('cart');
    sessionStorage.removeItem('currentUser');

    const orderSummary = document.getElementById('order-summary');
    orderSummary.innerHTML = `
        <div class="order-confirmed">
            <h3>Order Confirmed!</h3>
            <p>Thank you for your purchase.</p>
            <p>Order Total: $${order.total.toFixed(2)}</p>
            <div class="order-actions">
                <button id="download-json">Download Order (JSON)</button>
                <button id="clear-data">Clear All Data</button>
                <button id="logout-now">Logout</button>
            </div>
        </div>
    `;

    document.getElementById('download-json').addEventListener('click', () => {
        const dataStr = JSON.stringify(order, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `order_${order.date.split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });

    document.getElementById('clear-data').addEventListener('click', () => {
        localStorage.removeItem('cart');
        localStorage.removeItem('orders');
        alert('All local data has been cleared!');
        window.location.href = 'home.html';
    });

    document.getElementById('logout-now').addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('cart');
        window.location.href = 'home.html';
    });
}

// Process logout
function processLogout712() {
    localStorage.removeItem('cart');
    sessionStorage.removeItem('currentUser');

    document.getElementById('download-order')?.addEventListener('click', downloadOrderReceipt712);

    setTimeout(() => {
        window.location.href = 'home.html';
    }, 5000);
}

// Download order receipt
function downloadOrderReceipt712() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders.length === 0) return;

    const latestOrder = orders[orders.length - 1];
    const receiptText = generateReceiptText712(latestOrder);

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_receipt_${latestOrder.date.split('T')[0]}.txt`;
    a.click();
}

// Generate plain text receipt
function generateReceiptText712(order) {
    return `
        ORDER RECEIPT
        ============

        Customer: ${order.user}
        Date: ${new Date(order.date).toLocaleString()}

        ITEMS:
        ${order.items.map(item =>
            `${item.name} x ${item.quantity} @ $${item.price.toFixed(2)} each = $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n')}

        TOTAL: $${order.total.toFixed(2)}

        Thank you for your purchase!
    `;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    checkAuth712();

    if (window.location.pathname.includes('register.html')) {
        document.getElementById('registerForm')?.addEventListener('submit', registerUser712);
    }

    if (window.location.pathname.includes('login.html')) {
        document.getElementById('loginForm')?.addEventListener('submit', loginUser712);
    }

    if (window.location.pathname.includes('cart.html')) {
        loadKits712().then(() => {
            displayAllKits712();
            updateCartDisplay712();
        });

        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('add-to-cart')) {
                const productId = parseInt(e.target.getAttribute('data-id'));
                addToCart712(productId);
            }
        });
    }

    if (window.location.pathname.includes('confirm.html')) {
        updateOrderSummary712();
    }

    if (window.location.pathname.includes('logout.html')) {
        processLogout712();
    }

    if (window.location.pathname.includes('order-management.html')) {
        setupOrderManagement712();
    }
});

// Setup order management page
function setupOrderManagement712() {
    const orderActions = document.querySelector('.order-actions');
    if (orderActions) {
        orderActions.innerHTML = `
            <button id="download-json">Download Order History (JSON)</button>
            <button id="clear-data">Clear All Data</button>
            <button id="logout-now">Logout</button>
        `;
    }

    document.getElementById('download-json')?.addEventListener('click', () => {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const dataStr = JSON.stringify(orders, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `order_history_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });

    document.getElementById('clear-data')?.addEventListener('click', () => {
        localStorage.removeItem('cart');
        localStorage.removeItem('orders');
        alert('All local data has been cleared!');
    });

    document.getElementById('logout-now')?.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('cart');
        window.location.href = 'home.html';
    });

    // Add interactive feature: To-do list
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML += `
            <div class="todo-container">
                <h3>To-Do List</h3>
                <form id="todo-form">
                    <input type="text" id="todo-input" placeholder="Add a task..." required />
                    <button type="submit">Add</button>
                </form>
                <ul id="todo-list"></ul>
            </div>
        `;

        document.getElementById('todo-form')?.addEventListener('submit', function (e) {
            e.preventDefault();
            const input = document.getElementById('todo-input');
            const task = input.value.trim();
            if (task) {
                const li = document.createElement('li');
                li.textContent = task;
                li.addEventListener('click', () => {
                    li.classList.toggle('completed');
                });
                document.getElementById('todo-list').appendChild(li);
                input.value = '';
            }
        });
    }
}




// === Function to load and display courses and kits on browse page ===
function loadAndDisplayProducts712() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'browse.html') {
        // Load courses
        fetch('courses.json')
            .then(response => response.json())
            .then(courses => {
                const courseList = document.getElementById('course-list');
                if (!courseList) return;

                courses.forEach(course => {
                    const courseCard = document.createElement('div');
                    courseCard.className = 'product-card';
                    courseCard.innerHTML = `
                        <img src="images/${course.image}" alt="${course.name}">
                        <h3>${course.name}</h3>
                        <h3>${course.id}</h3>
                        <p>${course.description}</p>
                        <p class="price">$${course.price.toFixed(2)}</p>
                    `;
                    courseList.appendChild(courseCard);
                });
            })
            .catch(error => console.error('Error loading courses:', error));

        // Load resource kits
        fetch('kits.json')
            .then(response => response.json())
            .then(kits => {
                const kitList = document.getElementById('kit-list');
                if (!kitList) return;

                kits.forEach(kit => {
                    const kitCard = document.createElement('div');
                    kitCard.className = 'product-card';
                    kitCard.innerHTML = `
                        <img src="images/${kit.image}" alt="${kit.name}">
                        <h3>${kit.name}</h3>
                        <h3>${kit.id}</h3>
                        <p>${kit.description}</p>
                        <p class="price">$${kit.price.toFixed(2)}</p>
                    `;
                    kitList.appendChild(kitCard);
                });
            })
            .catch(error => console.error('Error loading kits:', error));
    }
}

// Call the function when DOM is loaded
document.addEventListener('DOMContentLoaded', loadAndDisplayProducts712);


// Trigger page fade-in animation
document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("page-enter-active");
});


// Show flying animation from product to cart
function showFlyAnimation712(product) {
    const cartIcon = document.querySelector('.nav-link[href="cart.html"]');
    const productImage = event.target.closest('.product-card')?.querySelector('img');

    if (!productImage || !cartIcon) return;

    const startRect = productImage.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();

    const flyDiv = document.createElement('div');
    flyDiv.classList.add('fly-animation');
    document.body.appendChild(flyDiv);

    // Set initial position
    flyDiv.style.top = `${startRect.top}px`;
    flyDiv.style.left = `${startRect.left}px`;

    setTimeout(() => {
        flyDiv.style.transform = `translate(${endRect.left - startRect.left}px, ${endRect.top - startRect.top}px)`;
    }, 10);

    // Remove element after animation
    setTimeout(() => {
        flyDiv.remove();
    }, 1000);
}

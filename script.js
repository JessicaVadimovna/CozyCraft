document.addEventListener('DOMContentLoaded', () => {
    // Навигация по страницам (шапка, футер и кнопка на главной)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a, .footer-nav, .catalog-btn');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            if (targetId === 'cart-btn') {
                document.getElementById('cart-modal').style.display = 'block';
                updateCart();
                return;
            }
            sections.forEach(section => section.classList.add('hidden'));
            document.getElementById(targetId)?.classList.remove('hidden');
            if (targetId === 'catalog') loadCatalog();
            // Закрытие бургер-меню после клика на мобильных
            if (window.innerWidth <= 768) {
                document.querySelector('nav ul').classList.remove('active');
            }
        });
    });

    // Бургер-меню
    const burgerMenu = document.querySelector('.burger-menu');
    const navUl = document.querySelector('nav ul');
    burgerMenu.addEventListener('click', () => {
        navUl.classList.toggle('active');
    });

    // Каталог товаров
    const catalogItems = [
        { id: 1, name: 'Кукла Зайка', price: 1500, category: 'dolls', img: './assets/img/rabbit.png', label: 'new' },
        { id: 2, name: 'Кукла Мишка', price: 1800, category: 'dolls', img: './assets/img/bear.png' },
        { id: 3, name: 'Кукла Котик', price: 1200, category: 'dolls', img: './assets/img/cat.png', label: 'discount' },
        { id: 4, name: 'Вязаный свитер (зелёный)', price: 3500, category: 'sweaters', img: './assets/img/sweater.png' },
        { id: 5, name: 'Свитер с оленями', price: 4000, category: 'sweaters', img: './assets/img/sweater_with_deer.png', label: 'new' },
        { id: 6, name: 'Свитер уютный', price: 3200, category: 'sweaters', img: './assets/img/pulower.png' },
        { id: 7, name: 'Соевые свечи (лаванда)', price: 800, category: 'candles', img: './assets/img/lavander_candle.png' },
        { id: 8, name: 'Свеча с корицей', price: 900, category: 'candles', img: './assets/img/cinnamon_candle.png', label: 'discount' },
        { id: 9, name: 'Свеча ванильная', price: 700, category: 'candles', img: './assets/img/candle.png' },
        { id: 10, name: 'Шарф вязаный', price: 1200, category: 'accessories', img: './assets/img/neckerchief.png' },
        { id: 11, name: 'Варежки тёплые', price: 900, category: 'accessories', img: './assets/img/mittens.png', label: 'new' },
        { id: 12, name: 'Повязка на голову', price: 600, category: 'accessories', img: './assets/img/bandage.png' },
    ];

    let currentCategory = 'all';

    function loadCatalog(filteredItems = catalogItems) {
        const catalogContainer = document.getElementById('catalog-items');
        catalogContainer.innerHTML = '';
        filteredItems.forEach(item => {
            const labelHtml = item.label ? `<span class="label ${item.label}">${item.label === 'new' ? 'Новинка' : 'Скидка'}</span>` : '';
            catalogContainer.innerHTML += `
                <div class="carousel-item">
                    <img src="${item.img}" alt="${item.name}">
                    ${labelHtml}
                    <h3>${item.name}</h3>
                    <p>${item.price} ₽</p>
                    <button class="btn-add" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">В корзину</button>
                </div>
            `;
        });
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const name = btn.dataset.name;
                const price = parseInt(btn.dataset.price);
                const existingItem = cart.find(item => item.id === id);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    cart.push({ id, name, price, quantity: 1 });
                }
                updateCart();
                showToast(`${name} в корзине!`);
            });
        });
    }

    // Категории (вкладки)
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.tab.active')?.classList.remove('active');
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            applyFilters();
        });
    });

    // Фильтр по цене
    document.getElementById('apply-filter').addEventListener('click', () => {
        applyFilters();
    });

    function applyFilters() {
        const minPrice = parseInt(document.getElementById('price-min').value) || 0;
        const maxPrice = parseInt(document.getElementById('price-max').value) || Infinity;

        const filteredItems = catalogItems.filter(item => {
            const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
            const matchesPrice = item.price >= minPrice && item.price <= maxPrice;
            return matchesCategory && matchesPrice;
        });

        loadCatalog(filteredItems);
    }

    // Корзина
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartModal = document.getElementById('cart-modal');
    const cartBtn = document.getElementById('cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');

    function updateCart() {
        cartCount.textContent = cart.length;
        cartItems.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            cartItems.innerHTML += `
                <div class="cart-item">
                    <span>${item.name} (${item.quantity} шт.)</span>
                    <span>${item.price * item.quantity} ₽</span>
                    <button onclick="removeFromCart(${index})">Удалить</button>
                </div>
            `;
        });
        cartTotal.textContent = `${total} ₽`;
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    cartBtn.addEventListener('click', () => {
        cartModal.style.display = 'block';
        updateCart();
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Корзина пуста!');
            return;
        }
        const order = { items: [...cart], date: new Date().toLocaleString(), status: 'В обработке' };
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        cartModal.style.display = 'none';
        sections.forEach(section => section.classList.add('hidden'));
        const statusSection = document.getElementById('order-status');
        statusSection.classList.remove('hidden');
        document.getElementById('order-message').textContent = `Заказ оформлен ${order.date}. Статус: ${order.status}`;
        cart = [];
        updateCart();
        if (currentUser) updateProfile();
    });

    // Авторизация и регистрация
    const authModal = document.getElementById('auth-modal');
    const registerModal = document.getElementById('register-modal');
    const profileModal = document.getElementById('profile-modal');
    const authBtn = document.getElementById('auth-btn');
    const authForm = document.getElementById('auth-form');
    const registerForm = document.getElementById('register-form');
    const registerLink = document.getElementById('register-link');
    const logoutBtn = document.getElementById('logout-btn');
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    if (users.length === 0) {
        users.push({ username: 'user1', password: '12345' });
        localStorage.setItem('users', JSON.stringify(users));
    }

    if (currentUser) {
        authBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.username}`;
        authBtn.onclick = () => {
            profileModal.style.display = 'block';
            updateProfile();
        };
    }

    authBtn.addEventListener('click', () => {
        if (!currentUser) authModal.style.display = 'block';
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            authModal.style.display = 'none';
            authBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${username}`;
            authBtn.onclick = () => {
                profileModal.style.display = 'block';
                updateProfile();
            };
            updateProfile();
        } else {
            showToast('Неверный логин или пароль!');
        }
    });

    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        authModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        if (users.find(u => u.username === username)) {
            document.getElementById('register-message').textContent = 'Пользователь уже существует!';
            return;
        }
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        registerModal.style.display = 'none';
        showToast('Регистрация успешна! Войдите.');
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        profileModal.style.display = 'none';
        authBtn.innerHTML = '<i class="fas fa-user-circle"></i>';
        authBtn.onclick = () => authModal.style.display = 'block';
    });

    function updateProfile() {
        if (!currentUser) return;
        document.getElementById('profile-username').textContent = currentUser.username;
        const orderHistory = document.getElementById('order-history');
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orderHistory.innerHTML = '';
        if (orders.length === 0) {
            orderHistory.innerHTML = '<p>У вас пока нет заказов.</p>';
        } else {
            orders.forEach(order => {
                orderHistory.innerHTML += `
                    <div class="order-item">
                        <span>Заказ от ${order.date}</span>
                        <span>Статус: ${order.status}</span>
                    </div>
                `;
            });
        }
    }

    // Закрытие модальных окон
    document.querySelectorAll('.close').forEach(close => {
        close.addEventListener('click', () => {
            close.parentElement.parentElement.style.display = 'none';
        });
    });

    // Всплывающие уведомления
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.getElementById('toast-container').appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Инициализация
    updateCart();
    loadCatalog();
});

// Удаление из корзины
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    document.dispatchEvent(new Event('DOMContentLoaded'));
}
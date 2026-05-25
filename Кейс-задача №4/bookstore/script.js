// База данных книг с поддержкой количества
let books = [
    { id: 1, title: "Мастер и Маргарита", author: "Михаил Булгаков", category: "Роман", year: 1967, price: 450, stock: 3, available: true, status: "В наличии" },
    { id: 2, title: "Преступление и наказание", author: "Фёдор Достоевский", category: "Роман", year: 1866, price: 380, stock: 2, available: true, status: "В наличии" },
    { id: 3, title: "1984", author: "Джордж Оруэлл", category: "Фантастика", year: 1949, price: 420, stock: 5, available: true, status: "В наличии" },
    { id: 4, title: "Война и мир", author: "Лев Толстой", category: "Роман", year: 1869, price: 890, stock: 1, available: false, status: "Арендована" },
    { id: 5, title: "Собачье сердце", author: "Михаил Булгаков", category: "Роман", year: 1925, price: 320, stock: 4, available: true, status: "В наличии" },
    { id: 6, title: "Дюна", author: "Фрэнк Герберт", category: "Фантастика", year: 1965, price: 650, stock: 2, available: true, status: "В наличии" },
    { id: 7, title: "Убить пересмешника", author: "Харпер Ли", category: "Роман", year: 1960, price: 400, stock: 0, available: false, status: "Продана" },
    { id: 8, title: "451° по Фаренгейту", author: "Рэй Брэдбери", category: "Фантастика", year: 1953, price: 380, stock: 3, available: true, status: "В наличии" },
    { id: 9, title: "Гордость и предубеждение", author: "Джейн Остин", category: "Роман", year: 1813, price: 350, stock: 2, available: true, status: "В наличии" },
    { id: 10, title: "Шерлок Холмс", author: "Артур Конан Дойл", category: "Детектив", year: 1892, price: 520, stock: 4, available: true, status: "В наличии" }
];

let cart = [];
let rentals = [];
let currentMode = 'user';
let currentPage = 1;
let booksPerPage = 6;
let currentRentalBook = null;

// Загрузка страницы
document.addEventListener('DOMContentLoaded', () => {
    loadBooksFromStorage();
    updateAuthorFilter();
    displayBooks();
    updateCartDisplay();
    startAutoReminders();
});

// Сохранение/загрузка из localStorage
function saveBooksToStorage() {
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('rentals', JSON.stringify(rentals));
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadBooksFromStorage() {
    const savedBooks = localStorage.getItem('books');
    const savedRentals = localStorage.getItem('rentals');
    const savedCart = localStorage.getItem('cart');
    if (savedBooks) books = JSON.parse(savedBooks);
    if (savedRentals) rentals = JSON.parse(savedRentals);
    if (savedCart) cart = JSON.parse(savedCart);
}

// Переключение режимов
function switchUserMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.interface').forEach(inter => inter.classList.remove('active'));
    document.getElementById(`${mode}-interface`).classList.add('active');
    
    document.querySelectorAll('.auth-buttons button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (mode === 'admin') {
        loadAdminBooks();
    } else {
        currentPage = 1;
        displayBooks();
        updateCartDisplay();
    }
}

// Применение фильтров
function applyFilters() {
    currentPage = 1;
    displayBooks();
}

// Сброс фильтров
function resetFilters() {
    document.getElementById('category-filter').value = 'all';
    document.getElementById('author-filter').value = 'all';
    document.getElementById('year-sort').value = 'none';
    document.getElementById('price-sort').value = 'none';
    document.getElementById('search-input').value = '';
    document.getElementById('status-filter').value = 'all';
    applyFilters();
}

// Получение отфильтрованных и отсортированных книг
function getFilteredBooks() {
    let filtered = [...books];
    
    const category = document.getElementById('category-filter')?.value;
    const author = document.getElementById('author-filter')?.value;
    const searchText = document.getElementById('search-input')?.value.toLowerCase();
    const statusFilter = document.getElementById('status-filter')?.value;
    
    if (category && category !== 'all') {
        filtered = filtered.filter(book => book.category === category);
    }
    
    if (author && author !== 'all') {
        filtered = filtered.filter(book => book.author === author);
    }
    
    if (searchText) {
        filtered = filtered.filter(book => 
            book.title.toLowerCase().includes(searchText) || 
            book.author.toLowerCase().includes(searchText)
        );
    }
    
    if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'available') {
            filtered = filtered.filter(book => book.available && book.stock > 0);
        } else if (statusFilter === 'rented') {
            filtered = filtered.filter(book => book.status === 'Арендована');
        } else if (statusFilter === 'sold') {
            filtered = filtered.filter(book => book.status === 'Продана');
        }
    }
    
    const yearSort = document.getElementById('year-sort')?.value;
    if (yearSort && yearSort !== 'none') {
        filtered.sort((a, b) => {
            if (yearSort === 'asc') return a.year - b.year;
            return b.year - a.year;
        });
    }
    
    const priceSort = document.getElementById('price-sort')?.value;
    if (priceSort && priceSort !== 'none') {
        filtered.sort((a, b) => {
            if (priceSort === 'asc') return a.price - b.price;
            return b.price - a.price;
        });
    }
    
    return filtered;
}

// Отображение книг пользователя
function displayBooks() {
    const filteredBooks = getFilteredBooks();
    const startIndex = (currentPage - 1) * booksPerPage;
    const paginatedBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);
    
    updateStats(filteredBooks.length);
    renderUserBooks(paginatedBooks);
    renderPagination(filteredBooks.length);
}

// Обновление статистики
function updateStats(totalFiltered) {
    const totalBooksElem = document.getElementById('total-books');
    const availableBooksElem = document.getElementById('available-books');
    const shownBooksElem = document.getElementById('shown-books');
    
    if (totalBooksElem) totalBooksElem.textContent = books.length;
    if (availableBooksElem) availableBooksElem.textContent = books.filter(b => b.available && b.stock > 0).length;
    if (shownBooksElem) shownBooksElem.textContent = totalFiltered;
}

// Рендер книг для пользователя
function renderUserBooks(booksToRender) {
    const booksList = document.getElementById('books-list');
    if (!booksList) return;
    
    booksList.innerHTML = '';
    
    if (booksToRender.length === 0) {
        booksList.innerHTML = '<div class="no-books">📭 Книги не найдены. Попробуйте изменить параметры поиска.</div>';
        return;
    }
    
    booksToRender.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        
        const stockClass = book.stock === 0 ? 'empty' : (book.stock <= 2 ? 'low' : '');
        const isAvailable = book.available && book.stock > 0;
        
        bookCard.innerHTML = `
            <h3>${escapeHtml(book.title)}</h3>
            <div class="author">✍️ ${escapeHtml(book.author)}</div>
            <div class="details">
                <div class="detail-item">
                    <span>📚 Категория:</span>
                    <span>${book.category}</span>
                </div>
                <div class="detail-item">
                    <span>📅 Год:</span>
                    <span>${book.year}</span>
                </div>
                <div class="detail-item">
                    <span>💰 Цена:</span>
                    <span class="price">${book.price} ₽</span>
                </div>
                <div class="detail-item">
                    <span>📦 В наличии:</span>
                    <span class="stock ${stockClass}">${book.stock} шт.</span>
                </div>
                <div class="detail-item">
                    <span>📌 Статус:</span>
                    <span class="status ${isAvailable ? 'available' : (book.status === 'Арендована' ? 'rented' : 'sold')}">
                        ${book.status}
                    </span>
                </div>
            </div>
            <div class="book-actions">
                ${isAvailable ? `
                    <button onclick="addToCart(${book.id})" class="btn-primary">🛒 Купить</button>
                    <button onclick="showRentalModal(${book.id})" class="btn-info">📖 Арендовать</button>
                ` : `
                    <button disabled style="opacity:0.5;cursor:not-allowed;">❌ Недоступна</button>
                `}
            </div>
        `;
        booksList.appendChild(bookCard);
    });
}

// Загрузка книг для администратора
function loadAdminBooks() {
    const adminBooksList = document.getElementById('admin-books-list');
    if (!adminBooksList) return;
    
    adminBooksList.innerHTML = '';
    
    if (books.length === 0) {
        adminBooksList.innerHTML = '<div class="no-books">📭 Нет книг в библиотеке. Добавьте первую книгу!</div>';
        return;
    }
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <h3>${escapeHtml(book.title)}</h3>
            <div class="author">✍️ ${escapeHtml(book.author)}</div>
            <div class="details">
                <div class="detail-item">
                    <span>📚 Категория:</span>
                    <span>${book.category}</span>
                </div>
                <div class="detail-item">
                    <span>📅 Год:</span>
                    <span>${book.year}</span>
                </div>
                <div class="detail-item">
                    <span>💰 Цена:</span>
                    <span class="price">${book.price} ₽</span>
                </div>
                <div class="detail-item">
                    <span>📦 В наличии:</span>
                    <span>${book.stock} шт.</span>
                </div>
                <div class="detail-item">
                    <span>📌 Статус:</span>
                    <span class="status ${book.available ? 'available' : (book.status === 'Арендована' ? 'rented' : 'sold')}">
                        ${book.status}
                    </span>
                </div>
                <div class="detail-item">
                    <span>✅ Доступность:</span>
                    <span>${book.available ? 'Доступна' : 'Недоступна'}</span>
                </div>
            </div>
            <div class="book-actions">
                <button onclick="editBook(${book.id})" class="btn-primary">✏️ Редактировать</button>
                <button onclick="deleteBook(${book.id})" class="btn-danger">🗑️ Удалить</button>
            </div>
        `;
        adminBooksList.appendChild(bookCard);
    });
}

// Рендер пагинации
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / booksPerPage);
    const paginationDiv = document.getElementById('pagination');
    
    if (!paginationDiv) return;
    
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let paginationHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    paginationDiv.innerHTML = paginationHtml;
}

// Переход на страницу
function goToPage(page) {
    currentPage = page;
    displayBooks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Обновление фильтра авторов
function updateAuthorFilter() {
    const authorSelect = document.getElementById('author-filter');
    if (!authorSelect) return;
    
    const authors = [...new Set(books.map(book => book.author))];
    authorSelect.innerHTML = '<option value="all">Все авторы</option>';
    authors.sort().forEach(author => {
        authorSelect.innerHTML += `<option value="${escapeHtml(author)}">${escapeHtml(author)}</option>`;
    });
}

// Добавление в корзину
function addToCart(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book || !book.available || book.stock === 0) {
        showNotification('Книга недоступна для покупки!', 'error');
        return;
    }
    
    const cartItem = cart.find(item => item.id === bookId);
    if (cartItem) {
        if (cartItem.quantity >= book.stock) {
            showNotification('Недостаточно экземпляров в наличии!', 'error');
            return;
        }
        cartItem.quantity++;
    } else {
        cart.push({
            id: book.id,
            title: book.title,
            price: book.price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showNotification(`Книга "${book.title}" добавлена в корзину!`, 'success');
    saveBooksToStorage();
}

// Обновление отображения корзины
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div style="text-align:center;padding:20px;">Корзина пуста</div>';
        if (cartTotal) cartTotal.innerHTML = '';
        if (cartCount) cartCount.textContent = '0';
        return;
    }
    
    let total = 0;
    let totalItems = 0;
    cartItems.innerHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        totalItems += item.quantity;
        
        cartItems.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${escapeHtml(item.title)}</div>
                    <div class="cart-item-price">${item.price} ₽ × ${item.quantity} = ${itemTotal} ₽</div>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateCartQuantity(${index}, -1)">-</button>
                    <span style="margin:0 5px;">${item.quantity}</span>
                    <button onclick="updateCartQuantity(${index}, 1)">+</button>
                    <button onclick="removeFromCart(${index})" class="btn-danger">🗑️</button>
                </div>
            </div>
        `;
    });
    
    if (cartTotal) cartTotal.innerHTML = `<strong>Итого: ${total} ₽</strong>`;
    if (cartCount) cartCount.textContent = totalItems;
}

// Обновление количества в корзине
function updateCartQuantity(index, delta) {
    if (!cart[index]) return;
    
    const newQuantity = cart[index].quantity + delta;
    const book = books.find(b => b.id === cart[index].id);
    
    if (newQuantity < 1) {
        cart.splice(index, 1);
    } else if (book && newQuantity <= book.stock) {
        cart[index].quantity = newQuantity;
    } else {
        showNotification('Недостаточно экземпляров в наличии!', 'error');
        return;
    }
    
    updateCartDisplay();
    saveBooksToStorage();
}

// Удаление из корзины
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
    saveBooksToStorage();
}

// Очистка корзины
function clearCart() {
    if (confirm('Очистить всю корзину?')) {
        cart = [];
        updateCartDisplay();
        saveBooksToStorage();
        showNotification('Корзина очищена', 'info');
    }
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста!', 'error');
        return;
    }
    
    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Проверка наличия книг
    for (const item of cart) {
        const book = books.find(b => b.id === item.id);
        if (!book || book.stock < item.quantity) {
            showNotification(`Недостаточно книг "${item.title}" в наличии!`, 'error');
            return;
        }
    }
    
    // Списание книг
    for (const item of cart) {
        const book = books.find(b => b.id === item.id);
        book.stock -= item.quantity;
        if (book.stock === 0) {
            book.available = false;
            book.status = 'Продана';
        }
    }
    
    const message = `✅ Заказ оформлен!\n\nСумма к оплате: ${total} ₽\n\nСпасибо за покупку!`;
    alert(message);
    
    cart = [];
    updateCartDisplay();
    displayBooks();
    saveBooksToStorage();
    showNotification('Заказ успешно оформлен!', 'success');
}

// Показать модальное окно аренды
function showRentalModal(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book || !book.available || book.stock === 0) {
        showNotification('Книга недоступна для аренды!', 'error');
        return;
    }
    
    currentRentalBook = book;
    
    const rentalBookInfo = document.getElementById('rental-book-info');
    const rentalPeriod = document.getElementById('rental-period');
    const rentalPriceInfo = document.getElementById('rental-price-info');
    
    if (rentalBookInfo) {
        rentalBookInfo.innerHTML = `
            <div class="form-group">
                <strong>Книга:</strong> ${book.title}<br>
                <strong>Автор:</strong> ${book.author}<br>
                <strong>Цена покупки:</strong> ${book.price} ₽
            </div>
        `;
    }
    
    updateRentalPrice();
    rentalPeriod?.addEventListener('change', updateRentalPrice);
    
    document.getElementById('rental-modal').style.display = 'block';
}

// Обновление цены аренды
function updateRentalPrice() {
    const period = parseInt(document.getElementById('rental-period').value);
    const rentalPriceInfo = document.getElementById('rental-price-info');
    
    if (!rentalPriceInfo || !currentRentalBook) return;
    
    let multiplier, periodText;
    if (period === 14) {
        multiplier = 0.3;
        periodText = '2 недели';
    } else if (period === 30) {
        multiplier = 0.5;
        periodText = '1 месяц';
    } else {
        multiplier = 1.2;
        periodText = '3 месяца';
    }
    
    const rentalPrice = Math.floor(currentRentalBook.price * multiplier);
    rentalPriceInfo.innerHTML = `
        Стоимость аренды на ${periodText}: <strong style="font-size:1.3em;color:#e74c3c;">${rentalPrice} ₽</strong>
    `;
}

// Подтверждение аренды
function confirmRent() {
    if (!currentRentalBook) return;
    
    const period = parseInt(document.getElementById('rental-period').value);
    let multiplier, periodText, days;
    
    if (period === 14) {
        multiplier = 0.3;
        periodText = '2 недели';
        days = 14;
    } else if (period === 30) {
        multiplier = 0.5;
        periodText = '1 месяц';
        days = 30;
    } else {
        multiplier = 1.2;
        periodText = '3 месяца';
        days = 90;
    }
    
    const rentalPrice = Math.floor(currentRentalBook.price * multiplier);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    rentals.push({
        id: Date.now(),
        bookId: currentRentalBook.id,
        bookTitle: currentRentalBook.title,
        period: periodText,
        price: rentalPrice,
        endDate: endDate,
        returned: false
    });
    
    currentRentalBook.stock--;
    if (currentRentalBook.stock === 0) {
        currentRentalBook.available = false;
        currentRentalBook.status = 'Арендована';
    }
    
    closeRentalModal();
    displayBooks();
    saveBooksToStorage();
    showNotification(`Книга "${currentRentalBook.title}" арендована на ${periodText}! Стоимость: ${rentalPrice} ₽`, 'success');
}

// Закрыть модальное окно аренды
function closeRentalModal() {
    document.getElementById('rental-modal').style.display = 'none';
    currentRentalBook = null;
}

// Админ функции
function showAddBookForm() {
    document.getElementById('modal-title').innerText = 'Добавить книгу';
    document.getElementById('book-form').reset();
    document.getElementById('book-id').value = '';
    document.getElementById('book-modal').style.display = 'block';
}

function editBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    document.getElementById('modal-title').innerText = 'Редактировать книгу';
    document.getElementById('book-id').value = book.id;
    document.getElementById('book-title').value = book.title;
    document.getElementById('book-author').value = book.author;
    document.getElementById('book-category').value = book.category;
    document.getElementById('book-year').value = book.year;
    document.getElementById('book-price').value = book.price;
    document.getElementById('book-stock').value = book.stock;
    document.getElementById('book-available').value = book.available;
    document.getElementById('book-status').value = book.status;
    document.getElementById('book-modal').style.display = 'block';
}

function deleteBook(id) {
    if (confirm('Удалить книгу? Это действие нельзя отменить.')) {
        books = books.filter(book => book.id !== id);
        loadAdminBooks();
        updateAuthorFilter();
        if (currentMode === 'user') displayBooks();
        saveBooksToStorage();
        showNotification('Книга удалена', 'info');
    }
}

function closeModal() {
    document.getElementById('book-modal').style.display = 'none';
}

// Сохранение книги
document.addEventListener('submit', (e) => {
    if (e.target.id === 'book-form') {
        e.preventDefault();
        
        const id = document.getElementById('book-id').value;
        const stock = parseInt(document.getElementById('book-stock').value);
        
        const bookData = {
            title: document.getElementById('book-title').value,
            author: document.getElementById('book-author').value,
            category: document.getElementById('book-category').value,
            year: parseInt(document.getElementById('book-year').value),
            price: parseInt(document.getElementById('book-price').value),
            stock: stock,
            available: document.getElementById('book-available').value === 'true',
            status: document.getElementById('book-status').value
        };
        
        if (id) {
            // Редактирование
            const index = books.findIndex(b => b.id == id);
            if (index !== -1) {
                books[index] = { ...books[index], ...bookData, id: books[index].id };
            }
            showNotification('Книга обновлена', 'success');
        } else {
            // Добавление
            const newId = Math.max(...books.map(b => b.id), 0) + 1;
            books.push({ id: newId, ...bookData });
            showNotification('Книга добавлена', 'success');
        }
        
        closeModal();
        loadAdminBooks();
        updateAuthorFilter();
        if (currentMode === 'user') {
            displayBooks();
        }
        saveBooksToStorage();
    }
});

// Показать список аренд
function showRentalsList() {
    if (rentals.length === 0) {
        alert('Нет активных аренд');
        return;
    }
    
    let message = '📋 СПИСОК АРЕНД:\n\n';
    rentals.forEach(rental => {
        const endDate = new Date(rental.endDate).toLocaleDateString();
        const status = rental.returned ? '✅ Возвращена' : '⏳ Активна';
        message += `${rental.bookTitle}\n   Срок: ${rental.period}\n   До: ${endDate}\n   Статус: ${status}\n   Стоимость: ${rental.price} ₽\n\n`;
    });
    
    alert(message);
}

// Напоминания об аренде
function showRentalReminders() {
    const today = new Date();
    const overdue = rentals.filter(r => !r.returned && new Date(r.endDate) < today);
    const expiringSoon = rentals.filter(r => {
        if (r.returned) return false;
        const daysLeft = Math.ceil((new Date(r.endDate) - today) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3 && daysLeft > 0;
    });
    
    let message = '📧 НАПОМИНАНИЯ ОБ АРЕНДЕ:\n\n';
    
    if (overdue.length > 0) {
        message += '⚠️ ПРОСРОЧЕННЫЕ АРЕНДЫ:\n';
        overdue.forEach(r => {
            message += `- ${r.bookTitle} (до ${new Date(r.endDate).toLocaleDateString()})\n`;
        });
        message += '\n';
    }
    
    if (expiringSoon.length > 0) {
        message += '⏰ ЗАКАНЧИВАЮТСЯ (3 дня):\n';
        expiringSoon.forEach(r => {
            message += `- ${r.bookTitle} (до ${new Date(r.endDate).toLocaleDateString()})\n`;
        });
        message += '\n';
    }
    
    if (overdue.length === 0 && expiringSoon.length === 0) {
        message += '✅ Нет просроченных или заканчивающихся аренд';
    }
    
    alert(message);
}

// Экспорт данных
function exportData() {
    const data = {
        books: books,
        rentals: rentals,
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookstore_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('Данные экспортированы', 'success');
}

// Автоматические напоминания
function startAutoReminders() {
    setInterval(() => {
        const today = new Date();
        const expiringSoon = rentals.filter(r => {
            if (r.returned) return false;
            const daysLeft = Math.ceil((new Date(r.endDate) - today) / (1000 * 60 * 60 * 24));
            return daysLeft === 1;
        });
        
        if (expiringSoon.length > 0 && currentMode === 'admin') {
            console.log('Автоматическое напоминание:', expiringSoon);
        }
    }, 3600000); // Каждый час
}

// Утилиты
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Обновление статистики при загрузке админки
setInterval(() => {
    if (currentMode === 'admin') {
        loadAdminBooks();
    }
}, 5000);
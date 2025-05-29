document.addEventListener('DOMContentLoaded', function() {
    let categories = [];
    let products = {};
    let currentCategory = null;
    let userName = localStorage.getItem('userName') || '';
    
    const userNameInput = document.getElementById('userName');
    const userNameBtn = document.getElementById('userNameBtn');
    const userGreeting = document.querySelector('.user-greeting');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoriesContainer = document.querySelector('.categories-container');
    const categoryList = document.querySelector('.category-list');
    const categoryTitle = document.querySelector('.category-title');
    const productsContainer = document.querySelector('.products-container');
    
    init();
    
    function init() {
        if (userName) {
            showUserGreeting(userName);
            userNameInput.value = userName;
        }
        
        loadData();
        addEventListeners();
        handleHashChange();
    }
    
    function loadData() {

        fetch('data/categories.json')
            .then(response => response.json())
            .then(data => {
                categories = data;
                renderCategories();
                renderCategoryList();
            })
            .catch(error => console.error('Error loading categories:', error));

        fetch('data/products.json')
            .then(response => response.json())
            .then(data => {
                products = data;
                if (window.location.hash.includes('category-')) {
                    const categoryId = window.location.hash.split('category-')[1];
                    loadCategory(categoryId);
                }
            })
            .catch(error => console.error('Error loading products:', error));
    }
    
    function addEventListeners() {
        userNameBtn.addEventListener('click', function() {
            const name = userNameInput.value.trim();
            if (name) {
                userName = name;
                localStorage.setItem('userName', userName);
                showUserGreeting(userName);
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                window.location.hash = page;

                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
  
        window.addEventListener('hashchange', handleHashChange);

        searchBtn.addEventListener('click', searchProducts);

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }

    function handleHashChange() {
        let hash = window.location.hash.substring(1);

        if (!hash) {
            hash = 'home';
            window.location.hash = hash;
        }

        if (hash.includes('category-')) {
            hash = 'catalog';
            const categoryId = window.location.hash.split('category-')[1];

            const categoryLinks = document.querySelectorAll('.category-link');
            categoryLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-category') === categoryId) {
                    link.classList.add('active');
                }
            });

            loadCategory(categoryId);
        }

        showPage(hash);

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === hash) {
                link.classList.add('active');
            }
        });
    }

    function showPage(page) {
        pageContents.forEach(content => {
            content.style.display = 'none';
        });
        
        const currentPage = document.getElementById(`${page}-content`);
        if (currentPage) {
            currentPage.style.display = 'block';
        }
    }

    function showUserGreeting(name) {
        userGreeting.textContent = `Привіт, ${name}!`;
    }

    function renderCategories() {
        let html = '';
        
        categories.forEach(category => {
            html += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <img src="${category.image}" class="card-img-top" alt="${category.name}">
                        <div class="card-body">
                            <h5 class="card-title">${category.name}</h5>
                            <p class="card-text">${category.description}</p>
                            <a href="#category-${category.id}" class="btn btn-success">Переглянути</a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        categoriesContainer.innerHTML = html;
    }

    function renderCategoryList() {
        let html = '';
        
        categories.forEach(category => {
            html += `
                <a href="#category-${category.id}" class="list-group-item list-group-item-action category-link" data-category="${category.id}">
                    ${category.name}
                </a>
            `;
        });
        
        categoryList.innerHTML = html;

        document.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const categoryId = this.getAttribute('data-category');
                window.location.hash = `category-${categoryId}`;
                loadCategory(categoryId);

                document.querySelectorAll('.category-link').forEach(l => {
                    l.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
    }

    function loadCategory(categoryId) {
        if (!products || !products[categoryId]) return;
        
        currentCategory = categoryId;

        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
            categoryTitle.textContent = category.name;
        }
        
        renderProducts(products[categoryId]);
    }
    
    function renderProducts(productList) {
        let html = '';
        
        if (productList.length === 0) {
            html = '<p>У цій категорії немає товарів.</p>';
        } else {
            productList.forEach(product => {
                html += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <img src="${product.image}" class="card-img-top" alt="${product.name}">
                            <div class="card-body">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="card-text">${product.shortDescription}</p>
                                <p class="card-price">${product.price} грн</p>
                                <button class="btn btn-primary view-details" data-product-id="${product.id}" data-category-id="${currentCategory}">Деталі</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        productsContainer.innerHTML = html;

        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                const categoryId = this.getAttribute('data-category-id');
                showProductDetails(categoryId, productId);
            });
        });
    }

    function showProductDetails(categoryId, productId) {
        const product = products[categoryId].find(p => p.id === productId);
        
        if (product) {
            document.querySelector('.product-detail-img').src = product.image;
            document.querySelector('.product-detail-title').textContent = product.name;
            document.querySelector('.product-detail-description').textContent = product.description;
            document.querySelector('.product-detail-price').textContent = `${product.price} грн`;
            
            const productModal = new bootstrap.Modal(document.getElementById('productModal'));
            productModal.show();
        }
    }
    
    function searchProducts() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) return;
        
        window.location.hash = 'catalog';
        
        categoryTitle.textContent = `Результати пошуку: "${query}"`;
        
        let searchResults = [];
        
        for (const categoryId in products) {
            const matchingProducts = products[categoryId].filter(product => 
                product.name.toLowerCase().includes(query) || 
                product.description.toLowerCase().includes(query) ||
                product.shortDescription.toLowerCase().includes(query)
            );
            
            searchResults = [...searchResults, ...matchingProducts];
        }
        renderProducts(searchResults);
    }
});
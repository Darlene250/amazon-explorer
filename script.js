// --- Cache System (Bonus Task: Performance Optimization) ---
const CacheSystem = {
    save: (key, data) => {
        const cacheItem = {
            timestamp: Date.now(),
            data: data
        };
        try {
            localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (e) {
            console.warn('Cache storage failed (quota exceeded?)', e);
        }
    },
    get: (key) => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        const now = Date.now();
        
        // Check if cache is expired
        if (now - item.timestamp > API_CONFIG.CACHE_DURATION) {
            localStorage.removeItem(key);
            return null;
        }
        return item.data;
    },
    generateKey: (prefix, params) => {
        // Create a unique string based on parameters
        return `${prefix}_${JSON.stringify(params)}`;
    }
};

// --- State & User Data ---
let currentUser = {
    name: '',
    apiKey: ''
};

// --- DOM Elements ---
const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');
const loginForm = document.getElementById('loginForm');
const searchForm = document.getElementById('searchForm');
const resultsContainer = document.getElementById('resultsContainer');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const detailsModal = document.getElementById('detailsModal');
const detailsContent = document.getElementById('detailsContent');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();
    checkAuth();
    
    // Event Listeners
    loginForm.addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    searchForm.addEventListener('submit', handleSearch);
});

// --- Authentication Functions (Bonus Task: Auth) ---
function checkAuth() {
    const storedUser = localStorage.getItem('amazon_app_user');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showApp();
    } else {
        showAuth();
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('userNameInput').value.trim();
    let keyInput = document.getElementById('apiKeyInput').value.trim();
    
    // Use default key if empty
    if (!keyInput) {
        keyInput = API_CONFIG.DEFAULT_KEY;
    }
    
    currentUser = { name: nameInput, apiKey: keyInput };
    
    // Save to local storage (simulated persistence)
    localStorage.setItem('amazon_app_user', JSON.stringify(currentUser));
    
    showApp();
}

function handleLogout() {
    localStorage.removeItem('amazon_app_user');
    currentUser = { name: '', apiKey: '' };
    
    // Clear any current results
    resultsContainer.innerHTML = '';
    
    showAuth();
}

// --- View Switching ---
function showAuth() {
    authScreen.classList.add('active');
    appScreen.classList.remove('active');
}

function showApp() {
    authScreen.classList.remove('active');
    appScreen.classList.add('active');
    
    // Personalization
    document.getElementById('userGreeting').textContent = `Hello, ${currentUser.name}`;
}

// --- API Functions ---
async function handleSearch(e) {
    e.preventDefault();
    
    const query = document.getElementById('queryInput').value.trim();
    const country = document.getElementById('countrySelect').value;
    const sortBy = document.getElementById('sortBy').value;
    const minPrice = document.getElementById('minPriceInput').value;
    const maxPrice = document.getElementById('maxPriceInput').value;
    
    if(!query) return;

    // UI State
    toggleState('loading');
    
    // Cache Key generation
    const cacheKey = CacheSystem.generateKey('search', { query, country, sortBy, minPrice, maxPrice });
    
    // 1. Check Cache
    const cachedData = CacheSystem.get(cacheKey);
    if (cachedData) {
        console.log('Serving from Cache');
        renderResults(cachedData);
        toggleState('results');
        return;
    }

    // 2. Fetch from API
    const params = new URLSearchParams({
        query: query,
        page: '1',
        country: country,
        sort_by: sortBy,
        product_condition: 'ALL'
    });
    
    if(minPrice) params.append('min_price', minPrice);
    if(maxPrice) params.append('max_price', maxPrice);

    try {
        const response = await fetch(`${API_CONFIG.SEARCH_URL}?${params}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': currentUser.apiKey,
                'x-rapidapi-host': API_CONFIG.API_HOST
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.data && data.data.products) {
            // Save to Cache
            CacheSystem.save(cacheKey, data.data.products);
            renderResults(data.data.products);
            toggleState('results');
        } else {
            throw new Error(data.message || 'No products found');
        }
    } catch (error) {
        console.error(error);
        document.getElementById('errorMessage').textContent = "Failed to fetch data. Check your API Key or try again.";
        toggleState('error');
    }
}

// Fetch Product Details
window.viewDetails = async function(asin) {
    document.getElementById('detailsTitle').textContent = "Loading...";
    detailsModal.style.display = 'flex';
    detailsContent.innerHTML = '<div class="spinner"></div>';

    const country = document.getElementById('countrySelect').value;
    
    // Cache Check
    const cacheKey = CacheSystem.generateKey('details', { asin, country });
    const cachedDetails = CacheSystem.get(cacheKey);
    
    if (cachedDetails) {
        renderDetails(cachedDetails);
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.DETAILS_URL}?asin=${asin}&country=${country}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': currentUser.apiKey,
                'x-rapidapi-host': API_CONFIG.API_HOST
            }
        });
        
        const data = await response.json();
        
        if (data.data) {
            CacheSystem.save(cacheKey, data.data);
            renderDetails(data.data);
        } else {
            detailsContent.innerHTML = '<p class="error">Details not available.</p>';
        }
    } catch (error) {
        detailsContent.innerHTML = '<p class="error">Error loading details.</p>';
    }
};

// --- Rendering ---
function renderResults(products) {
    resultsContainer.innerHTML = '';
    
    if (products.length === 0) {
        toggleState('empty');
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const price = product.product_price || 'See Price';
        const rating = product.product_star_rating || 'No Rating';
        
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${product.product_photo}" alt="${product.product_title}" class="card-img">
            </div>
            <div class="card-body">
                <h3 class="card-title">${product.product_title}</h3>
                <div class="card-rating">★ ${rating}</div>
                <div class="card-price">${price}</div>
            </div>
            <div class="card-actions">
                <button class="btn-primary btn-details" onclick="viewDetails('${product.asin}')">View Details</button>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}

function renderDetails(product) {
    document.getElementById('detailsTitle').textContent = 'Product Details';
    
    const price = product.product_price || 'N/A';
    const description = product.product_description || 'No description available.';
    
    detailsContent.innerHTML = `
        <div class="detail-layout">
            <div class="detail-img">
                <img src="${product.product_photo}" alt="${product.product_title}">
            </div>
            <div class="detail-info">
                <h2>${product.product_title}</h2>
                <h3 style="color:#B12704; margin: 10px 0;">${price}</h3>
                <p><strong>ASIN:</strong> ${product.asin}</p>
                <div style="margin-top: 20px;">
                    <h4>About this item</h4>
                    <p>${description.substring(0, 500)}...</p>
                </div>
                <a href="${product.product_url}" target="_blank" class="btn-primary" style="display:inline-block; margin-top:20px; text-decoration:none;">Buy on Amazon</a>
            </div>
        </div>
    `;
}

// --- Utilities ---
function toggleState(state) {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    resultsContainer.style.display = 'none';
    emptyState.style.display = 'none';
    
    if(state === 'loading') loadingState.style.display = 'block';
    if(state === 'error') errorState.style.display = 'block';
    if(state === 'results') resultsContainer.style.display = 'grid';
    if(state === 'empty') emptyState.style.display = 'block';
}

function populateDropdowns() {
    const countrySelect = document.getElementById('countrySelect');
    const sortSelect = document.getElementById('sortBy');
    
    AMAZON_PARAMS.COUNTRIES.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.code;
        opt.textContent = c.name;
        countrySelect.appendChild(opt);
    });
    
    AMAZON_PARAMS.SORT_BY.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s.replace(/_/g, ' ');
        sortSelect.appendChild(opt);
    });
}

window.closeDetailsModal = () => {
    detailsModal.style.display = 'none';
};

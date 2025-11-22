// API Configuration for Amazon Product Search
const API_CONFIG = {
    // Base URL for the two main endpoints on the new Amazon API
    SEARCH_URL: 'https://real-time-amazon-data.p.rapidapi.com/search',
    DETAILS_URL: 'https://real-time-amazon-data.p.rapidapi.com/product-details',
    API_HOST: 'real-time-amazon-data.p.rapidapi.com',
    
    // Default key provided for testing/fallback
    DEFAULT_KEY: '5b6ca044dbmshe9338189baeb759p12e8d8jsn5a66b96b460f',

    // Cache Settings (Bonus Task: Optimization)
    CACHE_DURATION: 1000 * 60 * 60 * 24 // 24 hours in milliseconds
};

// Amazon Search Parameters for Select/Dropdown Population
const AMAZON_PARAMS = {
    COUNTRIES: [
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'JP', name: 'Japan' },
        { code: 'IN', name: 'India' },
        { code: 'MX', name: 'Mexico' },
        { code: 'AU', name: 'Australia' }
    ],
    SORT_BY: [
        'RELEVANCE',
        'LOWEST_PRICE',
        'HIGHEST_PRICE',
        'REVIEWS',
        'NEWEST',
        'BEST_SELLERS'
    ]
};

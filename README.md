# Amazon Explorer
- **Demo link:** <(https://youtu.be/NIxY2xZCnqQ)>
## Project Information

- **Developer:** Darlene Ayinkamiye
- **Email:** d.ayinkamiy@alustudent.com
- **API Used:** Real-Time Amazon Data API

## File Structure

Ensure you have these files:

```
amazon-explorer/
├── index.html
├── style.css
├── script.js
├── config.js
├── .gitignore
└── README.md
```

## Description

A simple, clean web application for searching Amazon products in real-time using the Real-Time Amazon Data API. The app features user authentication (client-side), real-time search, sorting/filtering capabilities, and local caching for improved performance and reduced API usage.

## Features

 **User Authentication:** Personalize experience and manage API keys securely via LocalStorage.

 **Real-time Product Search:** Fetch live data from Amazon across multiple countries.

 **Detailed Product Views:** View high-quality images, prices, and descriptions.

 **Advanced Filtering:** Filter by Country, Sort option (Price, Reviews, etc.), and Price Range.

 **Response Caching:** Implemented caching to load previously searched data instantly.

 **Error Handling:** Graceful error messages for network issues or API limits.

 **Responsive Design:** Fully functional on mobile and desktop devices.

## Technologies Used

- HTML5
- CSS3 (Custom properties, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Real-Time Amazon Data API (via RapidAPI)
- LocalStorage for caching and session management

## Local Setup

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Text editor (VSCode recommended)

### Installation Steps

**1. Clone or Download the Repository**

```bash
git clone <(https://github.com/Darlene250/amazon-explorer.git)>
cd amazon-explorer
```

**2. Configure API Key**

You can either:
- Input your key in the application's Login Screen
- Or edit `config.js` to update the `DEFAULT_KEY` (Only for development/demo purposes)

**3. Run Locally**

Simply open `index.html` in your web browser:

```bash
# On Mac/Linux
open index.html

# On Windows
start index.html

### Server Requirements

- **Web01** (IP: 44.202.91.235)
- **Web02** (IP: 52.90.75.188)
- **Lb01** (Load Balancer IP: 3.89.140.126)

### Deployment Steps

#### Step 1: Deploy to Web01

```bash
# Connect to Web01
ssh ubuntu@<web01-ip>

# Install Nginx (if not installed)
sudo apt update
sudo apt install nginx -y

# Create application directory
sudo mkdir -p /var/www/amazon-explorer
sudo chown -R $USER:$USER /var/www/amazon-explorer

# Upload files using SCP from your local machine
# Run this from your local machine, not the server
scp index.html style.css script.js config.js ubuntu@<web01-ip>:/var/www/amazon-explorer/

# Configure Nginx
sudo nano /etc/nginx/sites-available/amazon-explorer
```

Added this configuration:

```nginx
server {
    listen 80;
    server_name <web01-ip>;
    
    root /var/www/amazon-explorer;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/amazon-explorer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Enable firewall
sudo ufw allow 'Nginx Full'
```

#### Step 2: Deploy to Web02

Repeat the same steps as Web01, but connect to Web02:

```bash
ssh ubuntu@<web02-ip>

# Follow the same steps as Web01
# Install Nginx, create directory, upload files, configure
```

#### Step 3: Configure Load Balancer (Lb01)

```bash
# Connect to Load Balancer
ssh ubuntu@<lb-ip>

# Install Nginx
sudo apt update
sudo apt install nginx -y

# Configure Load Balancer
sudo nano /etc/nginx/sites-available/amazon-explorer-lb
```

Add this configuration:

```nginx
upstream amazon_backend {
    server <web01-ip>:80;
    server <web02-ip>:80;
}

server {
    listen 80;
    server_name <lb-ip>;
    
    location / {
        proxy_pass http://amazon_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/amazon-explorer-lb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Enable firewall
sudo ufw allow 'Nginx Full'
```

#### Step 4: Test the Deployment

```bash
# Test Web01 directly
curl http://<web01-ip>

# Test Web02 directly
curl http://<web02-ip>

# Test Load Balancer
curl http://<lb-ip>

# Check which server is responding
curl -I http://<lb-ip>
```

### Verify Load Balancing

Open your browser and go to: `http://<lb-ip>`

Refresh multiple times and check server logs:

```bash
# On Web01
sudo tail -f /var/log/nginx/access.log

# On Web02
sudo tail -f /var/log/nginx/access.log
```

You should see requests distributed between both servers.

## Usage Guide

### 1. Sign In

- Enter your **Name** (for personalization)
- Enter your **RapidAPI Key** (or leave blank to use the default demo key)
- Click **"Start Exploring"**

### 2. Search for Products

- Enter a product name (e.g., "MacBook Air", "Running Shoes")
- Select a **Country** (e.g., US, UK, DE)
- Optionally set **Sort By** (Price, Reviews, Relevance)
- Click **"Search"**

### 3. View Results & Details

- Browse the product grid
- Click **"View Details"** on any card to open a modal with:
  - High-res image
  - Full description
  - Price & Availability
  - Link to the actual Amazon page

## API Information

### Real-Time Amazon Data API

- **Provider:** LetScrape (via RapidAPI)
- **Base URL:** `https://real-time-amazon-data.p.rapidapi.com`
- **Endpoints Used:**
  - `/search` (For product listing)
  - `/product-details` (For specific item data)

### API Parameters Used

- `query`: Search term
- `country`: Amazon domain (US, GB, etc.)
- `sort_by`: Relevance, Price, etc.
- `min_price` / `max_price`: Filtering
- `asin`: Unique ID for product details

## Bonus Features Implemented

### 1. User Authentication & Session

- Implemented a "Login" screen that captures user details
- Persists user session using localStorage, so you don't have to log in every time you refresh

### 2. Performance Caching

- Implemented a custom CacheSystem in JavaScript
- Stores search results and product details in localStorage with a timestamp
- **Benefit:** Searching for the same item twice loads instantly and saves API quota

## Challenges Faced

### Challenge 1: API Rate Limits

- **Problem:** The free tier of the API has a limited number of requests per month
- **Solution:** Implemented the Caching System (Bonus Task) to store results locally. If a user searches for "iPhone" again within 24 hours, the app serves data from the cache instead of calling the API

### Challenge 2: Asynchronous Data Handling

- **Problem:** Fetching data takes time, leaving the screen blank
- **Solution:** Implemented Loading States (spinners) and Error States to give immediate visual feedback to the user while data is being fetched

### Challenge 3: Dynamic Modal Content

- **Problem:** Displaying detailed product info without navigating away from the search page
- **Solution:** Built a reusable Modal component in vanilla JavaScript that dynamically injects HTML content based on the selected product's ASIN

## Security Notes

**IMPORTANT:** The `config.js` file contains a default API key for demonstration purposes. In a real production environment:

- Use environment variables
- Proxy requests through a backend server to hide the key
- Never commit personal/paid keys to public repositories

## Browser Compatibility

 Chrome 90+  
 Firefox 88+  
 Safari 14+  
 Edge 90+

## Credits

- **API Provider:** LetScrape via RapidAPI
- **Developer:** Darlene Ayinkamiye
- **Icons:** SVG Icons

## License

This project is created for educational purposes as part of ALU Web Infrastructure assignment.

## Support

For issues or questions, contact: **d.ayinkamiy@alustudent.com**

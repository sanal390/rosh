# TechHub - Premium E-Commerce Platform

A modern, full-featured e-commerce website built with **HTML, CSS, JavaScript, TypeScript, MongoDB, Express.js, and Flask**. This is a production-ready platform for selling electronics and gadgets with a beautiful, responsive design.

## 🚀 Features

### Frontend UI (Client)
- **Modern Design**: Dark mode with gradient accents, smooth animations, and responsive layout
- **Product Catalog**: Grid-based product display with images, pricing, ratings, and stock status
- **Advanced Filtering**: Filter by category, sort by price/rating/date, full-text search
- **Shopping Cart**: Add/remove items, quantity adjustment, persistent storage (localStorage)
- **Wishlist**: Save favorite products for later
- **Product Details**: Comprehensive product information, specifications, reviews, and ratings
- **Checkout Flow**: Multi-step checkout with address and payment method selection
- **User Authentication**: Sign in/Sign up functionality with account management
- **Notifications**: Toast notifications for user actions

### Backend API (Express.js + MongoDB)
- **Product Management**: Full CRUD operations with filtering, search, and pagination
- **User Management**: Registration, login, profile management, address book
- **Shopping Cart**: Add, update, remove items, cart persistence per user
- **Order Management**: Order creation, status tracking, order history
- **Reviews & Ratings**: User reviews with star ratings and comments
- **Inventory Management**: Stock tracking and updates on purchase
- **Error Handling**: Comprehensive error responses and validation

### AI/ML Features (Flask API)
- **Product Recommendations**: ML-based recommendations based on browsing history
- **Price Prediction**: Predicts if prices will drop soon based on trends
- **User Analytics**: Loyalty scoring, behavior analysis, purchase predictions
- **Search Suggestions**: Auto-complete suggestions based on product database

### Database (MongoDB)
- **Product Schema**: Complete product information with specs, reviews, pricing
- **User Schema**: Account details, addresses, wishlist, order history
- **Order Schema**: Order details, items, shipping, payment info, tracking
- **Cart Schema**: User cart items with quantities and pricing

## 📁 Project Structure

```
study-planner/
├── client/                    # Frontend (HTML, CSS, JS)
│   ├── index.html            # Main page with all modals
│   ├── style.css             # Modern dark-mode styling
│   └── app.js                # Full e-commerce application logic
├── server/                    # Backend (Node.js + Express)
│   ├── server.js             # Main server entry point
│   ├── models/               # MongoDB schemas
│   │   ├── Product.js        # Product model with reviews
│   │   ├── User.js           # User account model
│   │   ├── Order.js          # Order and transaction model
│   │   └── Cart.js           # Shopping cart model
│   └── routes/               # API endpoints
│       ├── productRoutes.js  # /api/products endpoints
│       ├── cartRoutes.js     # /api/cart endpoints
│       ├── orderRoutes.js    # /api/orders endpoints
│       └── userRoutes.js     # /api/users endpoints
├── flask-api/                # ML/Recommendations API
│   └── app.py                # Flask service with ML features
└── package.json              # Node.js dependencies
```

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Grid, Flexbox, Animations), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Local: mongodb://localhost:27017)
- **ML/Recommendations**: Python, Flask
- **APIs**: RESTful API design, JSON payloads
- **Storage**: LocalStorage for client-side cart/wishlist

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+)
- Python 3.8+
- MongoDB running locally (or update MONGO_URI)
- npm package manager

### 1. Install Dependencies

```bash
cd c:\Users\Admin\Desktop\study-planner
npm install
```

### 2. Set Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/study-planner
PORT=5000
```

### 3. Start the Services

**Terminal 1 - Node.js Backend:**
```powershell
$env:MONGO_URI="mongodb://localhost:27017/study-planner"
node server/server.js
```

**Terminal 2 - Flask API:**
```bash
pip install flask
python flask-api/app.py
```

**Terminal 3 - Client HTTP Server:**
```bash
npx http-server client -p 3000
```

### 4. Open in Browser

Navigate to: **http://localhost:3000**

---

## 🎯 Key Endpoints

### Products API
```
GET    /api/products                 # Get all products (with filters, search, sort, pagination)
GET    /api/products/:id             # Get single product
POST   /api/products                 # Add product (admin)
PUT    /api/products/:id             # Update product (admin)
DELETE /api/products/:id             # Delete product (admin)
POST   /api/products/:id/review      # Add review and rating
```

### Cart API
```
GET    /api/cart/:userId             # Get user's cart
POST   /api/cart/:userId/add         # Add item to cart
PUT    /api/cart/:userId/update      # Update item quantity
DELETE /api/cart/:userId/remove/:id  # Remove item from cart
DELETE /api/cart/:userId/clear       # Clear entire cart
```

### Orders API
```
GET    /api/orders/user/:userId      # Get user's orders
GET    /api/orders/:orderId          # Get order details
POST   /api/orders                   # Create new order
PUT    /api/orders/:orderId/status   # Update order status (admin)
```

### Users API
```
POST   /api/users/register           # Register new user
POST   /api/users/login              # User login
GET    /api/users/:userId            # Get user profile
PUT    /api/users/:userId            # Update profile
POST   /api/users/:userId/wishlist/add        # Add to wishlist
DELETE /api/users/:userId/wishlist/:productId # Remove from wishlist
```

### Flask API (Recommendations)
```
POST   /api/recommend                # Get product recommendations
POST   /api/analytics                # User analytics & insights
POST   /api/price-prediction         # Price trend prediction
GET    /api/search-suggestions       # Search autocomplete
```

---

## 💻 Usage Examples

### Adding a Product to Cart
```javascript
addToCart(productId, productName, price);
// Updates local cart, syncs to server, shows notification
```

### Filtering Products
```javascript
filterByCategory('Laptops');  // Filter by category
sortProducts('price-low');    // Sort by price ascending
searchProducts('iPhone');      // Full-text search
```

### Creating an Order
```javascript
submitOrder(event);  // Form submission triggers order creation
// Calculates totals, applies discount, creates order in DB
// Clears cart and shows success confirmation
```

### User Authentication
```javascript
handleLogin(event);  // Basic login (passwords not hashed in demo)
// Stores user in localStorage for session persistence
```

---

## 🎨 Features Highlights

### Beautiful UI
- **Dark-mode modern design** with gradient accents (Indigo & Pink)
- **Smooth animations**: Cards lift on hover, modals slide up, spinners rotate
- **Responsive layout**: Mobile-friendly with CSS Grid and Flexbox
- **Interactive elements**: Badges, stars, animated transitions

### Smart Shopping
- **10% automatic discount** on all orders
- **Stock checking**: Real-time inventory updates
- **Price tracking**: Original vs current price display
- **Trending items**: Badge for trending products
- **Reviews system**: Star ratings and customer reviews

### Production Ready
- **Error handling**: Try-catch blocks, user notifications
- **Data persistence**: Cart/wishlist saved in localStorage & MongoDB
- **Form validation**: Required fields, email validation
- **API error responses**: Status codes and error messages
- **CORS enabled**: Cross-origin requests supported

---

## 🗄️ Sample Products (Auto-Seeded)

The database automatically seeds 12 sample products on first run:
- MacBook Pro 16" M3 Ultra ($3,499)
- iPhone 15 Pro Max ($1,199)
- Samsung Galaxy S24 Ultra ($1,299)
- Dell XPS 15 ($2,299)
- Sony WH-1000XM5 Headphones ($399)
- iPad Pro 12.9 M4 ($1,299)
- Apple Watch Ultra 2 ($799)
- Samsung 4K Smart TV 65" ($899)
- GoPro Hero 12 Black ($499)
- Google Pixel 8 Pro ($999)
- Meta Quest 3 ($499)
- Anker PowerBank 100W ($79)

---

## 🔐 Security Notes

⚠️ **Demo Security** - This is a demonstration project:
- Passwords stored in plaintext (use bcrypt in production)
- No JWT tokens (implement for real authentication)
- CORS open to all origins (restrict in production)
- No input sanitization (add in production)

---

## 🚀 Production Deployment

### For Production Use:
1. **Hash passwords** with bcrypt
2. **Implement JWT** authentication
3. **Enable HTTPS** with SSL certificates
4. **Add rate limiting** and request validation
5. **Deploy to cloud**: AWS, Heroku, DigitalOcean, etc.
6. **Use managed MongoDB**: MongoDB Atlas
7. **Add payment gateway**: Stripe, PayPal integration
8. **Implement logging**: Winston, Morgan
9. **Add caching**: Redis for performance
10. **Database backups** and disaster recovery

---

## 📊 API Response Examples

### Get Products Response
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "MacBook Pro 16",
      "price": 3499,
      "category": "Laptops",
      "stock": 15,
      "rating": 4.8,
      "trending": true,
      "discount": 18
    }
  ],
  "total": 12,
  "pages": 1,
  "currentPage": 1
}
```

### Create Order Response
```json
{
  "_id": "507f2f77bcf86cd799439012",
  "orderId": "ORD1712500000abc123",
  "userId": "507f1f77bcf86cd799439011",
  "items": [...],
  "totalAmount": 5798,
  "discountAmount": 580,
  "finalAmount": 5218,
  "status": "pending",
  "createdAt": "2026-04-07T10:00:00.000Z"
}
```

---

## 🐛 Troubleshooting

### Server won't start
- Ensure MongoDB is running: `mongod`
- Check port 5000 is available: `netstat -ano | findstr :5000`
- Verify MONGO_URI environment variable

### Products not loading
- Check browser console for API errors
- Verify backend is running on port 5000
- Check CORS is enabled in server.js

### Cart not persisting
- Check localStorage in browser DevTools
- Ensure JavaScript is enabled
- Clear browser cache if needed

### Flask API not working
- Install Flask: `pip install flask`
- Ensure port 6000 is available
- Check Python version is 3.8+

---

## 📝 Notes

- **Guest Checkout**: Users can checkout without creating an account
- **Auto-Seeding**: Products are seeded automatically on first server run
- **LocalStorage**: Cart persists across browser sessions
- **Responsive Design**: Works on desktop and mobile devices
- **No Payment Processing**: Demo uses COD (Cash on Delivery) only

---

## 🎓 Learning Resources Used

- Modern CSS (Grid, Flexbox, Animations)
- JavaScript ES6+ (async/await, arrow functions)
- RESTful API Design
- MongoDB Schema Design
- Express.js Middleware
- Flask Microframework
- Responsive Web Design

---

## 📄 License

This is a demonstration project for educational purposes.

---

## 🤝 Contributing

Feel free to fork and submit pull requests for improvements!

---

## 📧 Support

For issues or questions, please check the browser console for error messages or review the TODO comments in the code.

---

**Happy Shopping! 🛍️**

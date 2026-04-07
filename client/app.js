// API Configuration
const API_BASE = "http://localhost:5000/api";
const FLASK_API = "http://localhost:6000/api";

// State Management
let state = {
  currentUser: JSON.parse(localStorage.getItem("user")) || null,
  cart: JSON.parse(localStorage.getItem("cart")) || [],
  wishlist: JSON.parse(localStorage.getItem("wishlist")) || [],
  orders: [],
  products: [],
  filteredProducts: [],
  maxPrice: 2000,
  selectedCategory: "all",
  sortBy: "newest",
  currentPage: "home",
  selectedProduct: null,
  selectedQty: 1
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateCartBadge();
  setupEventListeners();
  navigateTo("home");
  
  if (state.currentUser) {
    loadUserCart();
    loadUserOrders();
  }
});

// Event Listeners
function setupEventListeners() {
  // Search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchProducts(e.target.value);
    });
  }

  // Modal backdrop click
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target.id);
    }
  });
}

// PAGE NAVIGATION
function navigateTo(page) {
  state.currentPage = page;
  
  // Hide all pages
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  
  // Show selected page
  const pageEl = document.getElementById(page + "Page");
  if (pageEl) {
    pageEl.classList.add("active");
  }

  // Load page-specific content
  if (page === "home") {
    loadFeaturedProducts();
  } else if (page === "shop") {
    loadShopProducts();
  } else if (page === "orders") {
    loadOrders();
  } else if (page === "wishlist") {
    loadWishlist();
  } else if (page === "profile") {
    loadProfile();
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

function navigateToCategory(category) {
  navigateTo("shop");
  filterByCategory(category);
}

// PRODUCT FUNCTIONS
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/products?limit=50`);
    const data = await response.json();
    state.products = data.products || [];
    state.filteredProducts = [...state.products];
  } catch (err) {
    console.error("Failed to load products", err);
    showNotification("Failed to load products");
  }
}

function loadFeaturedProducts() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  
  const featured = state.products.slice(0, 6);
  grid.innerHTML = featured.map(p => createProductCardHTML(p)).join("");
}

function loadShopProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  
  grid.innerHTML = state.filteredProducts.map(p => createProductCardHTML(p)).join("");
  
  const count = document.getElementById("productCount");
  if (count) {
    count.textContent = `${state.filteredProducts.length} products found`;
  }
}

function createProductCardHTML(product) {
  const discount = product.discount || 0;
  const originalPrice = product.originalPrice || 0;
  const isWishlisted = state.wishlist.includes(product._id);
  
  return `
    <div class="product-card" onclick="showProductDetail('${product._id}')">
      <div class="product-image">
        <div class="product-emoji">${getProductEmoji(product.category)}</div>
        ${product.trending ? '<span class="trending-badge">Trending</span>' : ''}
        ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
      </div>
      <div class="product-content">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">
          ${'⭐'.repeat(Math.floor(product.rating || 4))}
          <span>(${product.reviews?.length || 0})</span>
        </div>
        <div class="product-price">
          <span class="current-price">$${product.price}</span>
          ${originalPrice > 0 ? `<span class="original-price">$${originalPrice}</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${product._id}', '${product.name}', ${product.price})">
            🛒 Add to Cart
          </button>
          <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist('${product._id}')" title="Add to Wishlist">
            ${isWishlisted ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function getProductEmoji(category) {
  const emojis = {
    "Electronics": "📺",
    "Laptops": "💻",
    "Phones": "📱",
    "Accessories": "🎧",
    "Gadgets": "⌚"
  };
  return emojis[category] || "📦";
}

async function showProductDetail(productId) {
  const product = state.products.find(p => p._id === productId);
  if (!product) return;

  state.selectedProduct = product;
  state.selectedQty = 1;

  const modal = document.getElementById("productModal");
  if (modal) {
    document.getElementById("detailName").textContent = product.name;
    document.getElementById("detailImage").textContent = getProductEmoji(product.category);
    document.getElementById("detailRating").textContent = '⭐'.repeat(Math.floor(product.rating || 4));
    document.getElementById("detailReviewCount").textContent = `(${product.reviews?.length || 0} reviews)`;
    document.getElementById("detailPrice").textContent = `$${product.price}`;
    document.getElementById("detailOriginalPrice").textContent = `$${product.originalPrice || product.price}`;
    document.getElementById("detailDiscount").textContent = product.discount ? `-${product.discount}%` : '';
    document.getElementById("detailDescription").textContent = product.description || 'Premium quality product';
    document.getElementById("detailStock").textContent = `${product.stock > 0 ? '✓ In Stock (' + product.stock + ' available)' : '✗ Out of Stock'}`;
    document.getElementById("qtyInput").value = 1;

    // Specs
    const specsDiv = document.getElementById("detailSpecs");
    specsDiv.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div><strong>Brand:</strong> ${product.specs?.brand || 'N/A'}</div>
        <div><strong>Model:</strong> ${product.specs?.model || 'N/A'}</div>
        <div><strong>Color:</strong> ${product.specs?.color || 'N/A'}</div>
        <div><strong>Warranty:</strong> ${product.specs?.warranty || 'N/A'}</div>
      </div>
    `;

    openModal("productModal");
  }
}

// CART FUNCTIONS
function addToCart(productId, productName, price) {
  const existingItem = state.cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({
      productId,
      name: productName,
      price,
      quantity: 1
    });
  }

  saveCart();
  updateCartBadge();
  showNotification(`${productName} added to cart! ✓`);
}

function addToCartDetail() {
  if (!state.selectedProduct) return;
  
  const qty = parseInt(document.getElementById("qtyInput").value) || 1;
  const existingItem = state.cart.find(item => item.productId === state.selectedProduct._id);
  
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    state.cart.push({
      productId: state.selectedProduct._id,
      name: state.selectedProduct.name,
      price: state.selectedProduct.price,
      quantity: qty
    });
  }

  saveCart();
  updateCartBadge();
  showNotification(`Added ${qty} item(s) to cart!`);
  closeModal("productModal");
  renderCart();
  openModal("cartModal");
}

function increaseQty() {
  const input = document.getElementById("qtyInput");
  input.value = parseInt(input.value) + 1;
}

function decreaseQty() {
  const input = document.getElementById("qtyInput");
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(state.cart));
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
}

function showCart() {
  renderCart();
  openModal("cartModal");
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  
  if (state.cart.length === 0) {
    cartItems.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-dim);">Your cart is empty</div>';
    document.querySelector(".cart-summary").style.display = "none";
    return;
  }

  document.querySelector(".cart-summary").style.display = "block";
  cartItems.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">${getProductEmoji("Gadgets")}</div>
      <div class="cart-item-content">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price}</div>
      </div>
      <div class="cart-item-qty">
        <button onclick="updateCartQty('${item.productId}', -1)" class="qty-btn">−</button>
        <span>${item.quantity}</span>
        <button onclick="updateCartQty('${item.productId}', 1)" class="qty-btn">+</button>
      </div>
      <button class="remove-btn" onclick="removeFromCart('${item.productId}')">✕</button>
    </div>
  `).join("");

  updateCartSummary();
}

function updateCartQty(productId, change) {
  const item = state.cart.find(i => i.productId === productId);
  if (item) {
    item.quantity = Math.max(1, item.quantity + change);
    if (item.quantity === 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      renderCart();
    }
  }
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.productId !== productId);
  saveCart();
  updateCartBadge();
  renderCart();
  showNotification("Item removed from cart");
}

function updateCartSummary() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = Math.floor(subtotal * 0.1);
  const total = subtotal - discount;

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("discountAmount").textContent = `-$${discount.toFixed(2)}`;
  document.getElementById("cartTotal").textContent = `$${total.toFixed(2)}`;
  document.getElementById("checkoutTotal").textContent = `$${total.toFixed(2)}`;
}

function openCheckout() {
  if (state.cart.length === 0) {
    showNotification("Cart is empty");
    return;
  }

  updateCartSummary();
  closeModal("cartModal");
  openModal("checkoutModal");
}

// FILTER & SEARCH
function filterByCategory(category) {
  state.selectedCategory = category;
  
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  event.target?.classList.add("active");

  if (category === "all") {
    state.filteredProducts = [...state.products];
  } else {
    state.filteredProducts = state.products.filter(p => p.category === category);
  }
  
  filterByPrice(state.maxPrice);
}

function filterByPrice(maxPrice) {
  state.maxPrice = maxPrice;
  const display = document.getElementById("priceDisplay");
  if (display) {
    display.textContent = `Under $${maxPrice}`;
  }

  state.filteredProducts = state.products.filter(p => {
    const passCategory = state.selectedCategory === "all" || p.category === state.selectedCategory;
    const passPrice = p.price <= maxPrice;
    return passCategory && passPrice;
  });

  loadShopProducts();
}

function sortProducts(sortType) {
  state.sortBy = sortType;

  const sorted = [...state.filteredProducts];
  
  switch(sortType) {
    case "price-low":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "trending":
      sorted.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
      break;
    default:
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  state.filteredProducts = sorted;
  loadShopProducts();
}

function searchProducts(query) {
  query = query.toLowerCase();
  
  if (!query) {
    state.filteredProducts = [...state.products];
  } else {
    state.filteredProducts = state.products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description?.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }
  
  if (state.currentPage === "shop") {
    loadShopProducts();
  } else {
    loadFeaturedProducts();
  }
}

// ORDERS PAGE
async function loadOrders() {
  const container = document.getElementById("ordersContainer");
  if (!container) return;

  if (!state.currentUser) {
    container.innerHTML = `
      <div class="empty-state">
        <p>📦 Sign in to view your orders</p>
        <button class="btn-primary" onclick="openModal('authModal')">Sign In</button>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/orders/user/${state.currentUser.userId}`);
    const data = await response.json();
    state.orders = data.orders || [];

    if (state.orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>📦 No orders yet</p>
          <button class="btn-primary" onclick="navigateTo('shop')">Start Shopping</button>
        </div>
      `;
      return;
    }

    container.innerHTML = state.orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <h4>Order #${order.orderId}</h4>
            <p>${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="order-status ${order.status}">
            <span class="status-badge">${order.status.toUpperCase()}</span>
            <p>Total: $${order.finalAmount}</p>
          </div>
        </div>
        <div class="order-items">
          ${order.items.map(item => `
            <div style="padding: 8px 0; border-bottom: 1px solid var(--border);">
              <span>${item.productId?.name || 'Product'}</span>
              <span>x${item.quantity} - $${item.productId?.price || 0}</span>
            </div>
          `).join('')}
        </div>
        <div style="padding-top: 12px; font-size: 12px; color: var(--text-dim);">
          📍 ${order.shippingAddress?.city}, ${order.shippingAddress?.state}
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to load orders", err);
    container.innerHTML = '<div class="empty-state"><p>❌ Failed to load orders</p></div>';
  }
}

async function loadUserOrders() {
  if (!state.currentUser) return;
  
  try {
    const response = await fetch(`${API_BASE}/orders/user/${state.currentUser.userId}`);
    if (response.ok) {
      const data = await response.json();
      state.orders = data.orders || [];
    }
  } catch (err) {
    console.log("Orders load skipped");
  }
}

// WISHLIST PAGE
function loadWishlist() {
  const container = document.getElementById("wishlistContainer");
  if (!container) return;

  if (state.wishlist.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>❤️ Your wishlist is empty</p>
        <button class="btn-primary" onclick="navigateTo('shop')">Browse Products</button>
      </div>
    `;
    return;
  }

  const wishlistProducts = state.products.filter(p => state.wishlist.includes(p._id));
  container.innerHTML = wishlistProducts.map(p => createProductCardHTML(p)).join("");
}

function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  if (index > -1) {
    state.wishlist.splice(index, 1);
    showNotification("Removed from wishlist");
  } else {
    state.wishlist.push(productId);
    showNotification("Added to wishlist ❤️");
  }
  localStorage.setItem("wishlist", JSON.stringify(state.wishlist));
}

function toggleWishlistDetail() {
  if (!state.selectedProduct) return;
  toggleWishlist(state.selectedProduct._id);
  closeModal("productModal");
}

// PROFILE PAGE
function loadProfile() {
  const container = document.getElementById("profileContent");
  if (!container) return;

  if (!state.currentUser) {
    container.innerHTML = `
      <div class="empty-state">
        <p>👤 Sign in to view your profile</p>
        <button class="btn-primary" onclick="openModal('authModal')">Sign In</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="profile-card">
      <div class="profile-info">
        <h3>👤 ${state.currentUser.name}</h3>
        <p>Email: ${state.currentUser.email}</p>
        <p>Member since: ${new Date(state.currentUser.createdAt).toLocaleDateString()}</p>
      </div>
      <div class="profile-stats">
        <div class="stat">
          <h4>${state.orders.length}</h4>
          <p>Orders</p>
        </div>
        <div class="stat">
          <h4>${state.cart.length}</h4>
          <p>In Cart</p>
        </div>
        <div class="stat">
          <h4>${state.wishlist.length}</h4>
          <p>Wishlisted</p>
        </div>
      </div>
      <button class="btn-danger" onclick="logout()" style="width: 100%; padding: 12px; margin-top: 20px;">Logout</button>
    </div>
  `;
}

// AUTH FUNCTIONS
function switchAuthTab(tab) {
  document.querySelectorAll(".auth-form").forEach(f => f.classList.remove("active"));
  document.querySelectorAll(".auth-tab").forEach(b => b.classList.remove("active"));
  
  const form = document.getElementById(tab + "Form");
  if (form) form.classList.add("active");
  
  event.target.classList.add("active");
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const user = await response.json();
      state.currentUser = user;
      localStorage.setItem("user", JSON.stringify(user));
      closeModal("authModal");
      loadUserCart();
      loadUserOrders();
      showNotification(`Welcome back, ${user.name}! 👋`);
    } else {
      showNotification("Invalid email or password");
    }
  } catch (err) {
    console.error("Login failed", err);
    showNotification("Login failed. Please try again.");
  }
}

async function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (response.ok) {
      const user = await response.json();
      state.currentUser = user;
      localStorage.setItem("user", JSON.stringify(user));
      closeModal("authModal");
      showNotification(`Welcome to TechHub, ${user.name}! 🎉`);
    } else {
      showNotification("Sign up failed. Email may already exist.");
    }
  } catch (err) {
    console.error("Signup failed", err);
    showNotification("Sign up failed. Please try again.");
  }
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    state.currentUser = null;
    localStorage.removeItem("user");
    navigateTo("home");
    showNotification("Logged out successfully");
  }
}

async function loadUserCart() {
  if (!state.currentUser) return;
  
  try {
    const response = await fetch(`${API_BASE}/cart/${state.currentUser.userId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        state.cart = data.items.map(item => ({
          productId: item.productId._id || item.productId,
          name: item.productId.name || "Product",
          price: item.productId.price || 0,
          quantity: item.quantity
        }));
        saveCart();
        updateCartBadge();
      }
    }
  } catch (err) {
    console.log("Cart sync skipped");
  }
}

// CHECKOUT
async function submitOrder(event) {
  event.preventDefault();

  if (state.cart.length === 0) {
    showNotification("Cart is empty");
    return;
  }

  const shippingAddress = {
    street: document.getElementById("address").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    zip: document.getElementById("zip").value,
    country: document.getElementById("country").value
  };

  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  try {
    // Create guest user if not logged in
    let userId = state.currentUser?.userId || "guest_" + Date.now();

    if (!state.currentUser) {
      const userResponse = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: document.getElementById("fullName").value,
          email: document.getElementById("email").value,
          password: "guest_" + Date.now()
        })
      });

      if (userResponse.ok) {
        const user = await userResponse.json();
        userId = user.userId;
      }
    }

    // Create order
    const orderResponse = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        items: state.cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod
      })
    });

    if (orderResponse.ok) {
      const order = await orderResponse.json();

      // Clear cart
      state.cart = [];
      saveCart();
      updateCartBadge();

      // Show success
      closeModal("checkoutModal");
      document.getElementById("successTitle").textContent = `Order Confirmed! #${order.orderId}`;
      document.getElementById("successMessage").textContent = `Thank you for your purchase!`;
      document.getElementById("successDetails").innerHTML = `
        <div style="background: var(--bg-light); padding: 16px; border-radius: 8px; margin: 16px 0; text-align: left;">
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Total:</strong> $${order.finalAmount}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p style="color: var(--text-dim); font-size: 12px;">Expected delivery in 3-5 business days</p>
        </div>
      `;
      openModal("successModal");
    } else {
      showNotification("Failed to place order. Please try again.");
    }
  } catch (err) {
    console.error("Order error:", err);
    showNotification("Error placing order. Please check your details.");
  }
}

function successAction() {
  closeModal("successModal");
  navigateTo("home");
}

// MODAL FUNCTIONS
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

// NOTIFICATIONS
function showNotification(message) {
  const notif = document.createElement("div");
  notif.className = "notification";
  notif.textContent = message;
  notif.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 10px;
    z-index: 9999;
    animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
    font-weight: 500;
    border-left: 4px solid rgba(255, 255, 255, 0.3);
  `;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}


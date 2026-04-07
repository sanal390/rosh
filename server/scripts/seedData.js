import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import User from "./models/User.js";
import connectDB from "./config/database.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: process.env.ADMIN_EMAIL || "admin@techhub.com",
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      role: "admin",
    });

    console.log("✓ Admin user created:", adminUser.email);

    // Sample products
    const sampleProducts = [
      {
        name: "MacBook Pro 16 inch M3 Ultra",
        description: "Powerful laptop for professionals with stunning Retina display and exceptional performance",
        price: 3499,
        originalPrice: 4299,
        category: "Laptops",
        images: [{ url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500", altText: "MacBook Pro" }],
        thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200",
        stock: 15,
        specifications: { brand: "Apple", model: "M3 Ultra", color: "Silver", warranty: "1 Year" },
        trending: true,
        featured: true,
        tags: ["laptop", "apple", "professional"],
      },
      {
        name: "iPhone 15 Pro Max",
        description: "Latest iPhone with advanced camera system and titanium design for ultimate photography experience",
        price: 1199,
        originalPrice: 1399,
        category: "Phones",
        images: [{ url: "https://images.unsplash.com/photo-1592286927505-1fed5334107d?w=500", altText: "iPhone 15 Pro Max" }],
        thumbnail: "https://images.unsplash.com/photo-1592286927505-1fed5334107d?w=200",
        stock: 30,
        specifications: { brand: "Apple", model: "iPhone 15 Pro Max", color: "Black", warranty: "1 Year" },
        trending: true,
        featured: true,
        tags: ["phone", "apple", "premium"],
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        description: "Premium Android phone with exceptional display and AI-powered features for smart photography",
        price: 1299,
        originalPrice: 1499,
        category: "Phones",
        images: [{ url: "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500", altText: "Samsung Galaxy S24" }],
        thumbnail: "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=200",
        stock: 25,
        specifications: { brand: "Samsung", model: "Galaxy S24 Ultra", color: "Titanium Gray", warranty: "2 Years" },
        trending: true,
        featured: true,
        tags: ["phone", "samsung", "android"],
      },
      {
        name: "Dell XPS 15 Laptop",
        description: "Business laptop with RTX 4070 GPU and premium build quality for professionals",
        price: 2299,
        originalPrice: 2699,
        category: "Laptops",
        images: [{ url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500", altText: "Dell XPS 15" }],
        thumbnail: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200",
        stock: 12,
        specifications: { brand: "Dell", model: "XPS 15", color: "Platinum Silver", warranty: "2 Years" },
        trending: false,
        featured: true,
        tags: ["laptop", "dell", "gaming"],
      },
      {
        name: "Sony WH-1000XM5 Headphones",
        description: "Premium noise-cancelling headphones with exceptional sound quality and long battery life",
        price: 399,
        originalPrice: 499,
        category: "Accessories",
        images: [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", altText: "Sony WH-1000XM5" }],
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
        stock: 50,
        specifications: { brand: "Sony", model: "WH-1000XM5", color: "Black", warranty: "2 Years" },
        trending: true,
        featured: true,
        tags: ["headphones", "audio", "wireless"],
      },
      {
        name: "iPad Pro 12.9 M4",
        description: "High-performance tablet perfect for creative professionals with stunning display",
        price: 1299,
        originalPrice: 1499,
        category: "Gadgets",
        images: [{ url: "https://images.unsplash.com/photo-1544716278-ca5e3af4abd8?w=500", altText: "iPad Pro" }],
        thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3af4abd8?w=200",
        stock: 20,
        specifications: { brand: "Apple", model: "iPad Pro 12.9", color: "Space Black", warranty: "1 Year" },
        trending: true,
        featured: false,
        tags: ["tablet", "apple", "creative"],
      },
      {
        name: "Apple Watch Ultra 2",
        description: "Advanced smartwatch with fitness and health tracking features for active lifestyle",
        price: 799,
        originalPrice: 979,
        category: "Accessories",
        images: [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", altText: "Apple Watch Ultra 2" }],
        thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
        stock: 35,
        specifications: { brand: "Apple", model: "Watch Ultra 2", color: "Titanium", warranty: "1 Year" },
        trending: true,
        featured: false,
        tags: ["smartwatch", "fitness", "apple"],
      },
      {
        name: "Samsung 4K Smart TV 65in",
        description: "Large 4K display with AI upscaling and smart features for entertainment",
        price: 899,
        originalPrice: 1299,
        category: "Electronics",
        images: [{ url: "https://images.unsplash.com/photo-1522869635100-ce10e50fa597?w=500", altText: "Samsung TV" }],
        thumbnail: "https://images.unsplash.com/photo-1522869635100-ce10e50fa597?w=200",
        stock: 8,
        specifications: { brand: "Samsung", model: "QN65Q95C", color: "Black", warranty: "2 Years" },
        trending: false,
        featured: true,
        tags: ["tv", "4k", "samsung"],
      },
      {
        name: "GoPro Hero 12 Black",
        description: "Professional action camera with 5.3K video and advanced stabilization technology",
        price: 499,
        originalPrice: 649,
        category: "Gadgets",
        images: [{ url: "https://images.unsplash.com/photo-1539571696357-5a69c006ae21?w=500", altText: "GoPro Hero 12" }],
        thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c006ae21?w=200",
        stock: 18,
        specifications: { brand: "GoPro", model: "Hero 12 Black", color: "Black", warranty: "1 Year" },
        trending: true,
        featured: false,
        tags: ["camera", "action", "gopro"],
      },
      {
        name: "Google Pixel 8 Pro",
        description: "Google's flagship phone with advanced AI photography and computational features",
        price: 999,
        originalPrice: 1199,
        category: "Phones",
        images: [{ url: "https://images.unsplash.com/photo-1511128719344-3494e4d9d6ca?w=500", altText: "Google Pixel 8 Pro" }],
        thumbnail: "https://images.unsplash.com/photo-1511128719344-3494e4d9d6ca?w=200",
        stock: 22,
        specifications: { brand: "Google", model: "Pixel 8 Pro", color: "Midnight", warranty: "2 Years" },
        trending: true,
        featured: true,
        tags: ["phone", "google", "ai"],
      },
      {
        name: "Meta Quest 3",
        description: "Advanced VR headset with mixed reality capabilities for immersive experiences",
        price: 499,
        originalPrice: 649,
        category: "Gadgets",
        images: [{ url: "https://images.unsplash.com/photo-1593642632516-4b7b6db6d5e5?w=500", altText: "Meta Quest 3" }],
        thumbnail: "https://images.unsplash.com/photo-1593642632516-4b7b6db6d5e5?w=200",
        stock: 14,
        specifications: { brand: "Meta", model: "Quest 3", color: "White", warranty: "1 Year" },
        trending: true,
        featured: false,
        tags: ["vr", "meta", "gaming"],
      },
      {
        name: "Anker PowerBank 100W",
        description: "High-capacity portable charger with fast charging support for multiple devices",
        price: 79,
        originalPrice: 99,
        category: "Accessories",
        images: [{ url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500", altText: "Anker PowerBank" }],
        thumbnail: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200",
        stock: 100,
        specifications: { brand: "Anker", model: "737", color: "Black", warranty: "2 Years" },
        trending: false,
        featured: false,
        tags: ["powerbank", "charger", "anker"],
      },
    ];

    const createdProducts = await Product.insertMany(
      sampleProducts.map((p) => ({
        ...p,
        createdBy: adminUser._id,
        discount: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100),
      }))
    );

    console.log(`✓ ${createdProducts.length} products seeded`);

    console.log("\n✓ Database seeding completed successfully!");
    console.log(`Total products: ${createdProducts.length}`);
    console.log(`Admin user: ${adminUser.email}`);

    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();

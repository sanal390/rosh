import Product from "../models/Product.js";
import { validatePagination } from "../utils/validators.js";

export const getAllProducts = async (req, res) => {
  try {
    const { page, limit, sort, category, minPrice, maxPrice, search } = req.query;
    const { page: p, limit: l } = validatePagination(page, limit);

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const sortOption = sort === "price-asc" ? { price: 1 } : sort === "price-desc" ? { price: -1 } : { createdAt: -1 };

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(l * 1)
      .skip((p - 1) * l);

    res.json({
      success: true,
      total: totalProducts,
      page: p,
      limit: l,
      pages: Math.ceil(totalProducts / l),
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Increment views
    product.meta.views += 1;
    await product.save();

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, images, thumbnail, stock, specifications } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      originalPrice: originalPrice || price,
      category,
      images: images || [],
      thumbnail: thumbnail || (images && images[0]?.url),
      stock,
      specifications: specifications || {},
      discount: originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (existingReview) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    product.reviews.push({
      user: req.user._id,
      rating,
      comment,
      title,
      verified: true,
    });

    // Update average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = (totalRating / product.reviews.length).toFixed(1);
    product.reviewsCount = product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ trending: true }).limit(10);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

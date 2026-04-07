import express from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.put("/", protect, updateCartItem);
router.delete("/:productId", protect, removeFromCart);
router.delete("/", protect, clearCart);

export default router;
router.post("/:userId/add", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
      cart = new Cart({ userId: req.params.userId, items: [] });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate("items.productId");

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update cart item
router.put("/:userId/update", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter(i => i.productId.toString() !== productId);
      } else {
        item.quantity = quantity;
      }
    }

    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate("items.productId");

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove from cart
router.delete("/:userId/remove/:productId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
    cart.updatedAt = new Date();
    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear cart
router.delete("/:userId/clear", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

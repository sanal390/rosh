import express from "express";
import { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, updateOrderStatus);
router.put("/:id/cancel", protect, cancelOrder);

export default router;
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
router.post("/", async (req, res) => {
  try {
    const { userId, shippingAddress, paymentMethod } = req.body;

    // Get cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate totals
    let totalAmount = 0;
    const items = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Generate order ID
    const orderId = `ORD${Date.now()}${Math.Random = require('crypto').randomBytes(2).toString('hex').toUpperCase()}`;

    const discountAmount = Math.floor(totalAmount * 0.1); // 10% discount
    const finalAmount = totalAmount - discountAmount;

    const order = new Order({
      orderId,
      userId,
      items,
      totalAmount,
      discountAmount,
      finalAmount,
      shippingAddress,
      paymentMethod
    });

    await order.save();

    // Update user
    const user = await User.findById(userId);
    if (user) {
      user.orders.push(order._id);
      user.totalSpent += finalAmount;
      await user.save();
    }

    // Clear cart
    await Cart.findByIdAndUpdate(cart._id, { items: [] });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update order status (admin)
router.put("/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status, deliveredAt: status === 'delivered' ? new Date() : null },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendOrderConfirmation } from "../utils/emailService.js";
import { v4 as uuidv4 } from "uuid";

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        specs: product.specifications,
      });

      subtotal += product.price * item.quantity;

      // Update product purchases counter
      product.meta.purchases += item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    const tax = Math.round(subtotal * 0.18); // 18% GST
    const shipping = subtotal > 500 ? 0 : 50;
    const totalAmount = subtotal + tax + shipping;

    const order = await Order.create({
      orderId: `ORD-${uuidv4().slice(0, 8).toUpperCase()}`,
      user: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
      orderStatus: "pending",
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    // Update user's total spent
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalSpent: totalAmount } });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Add order to user's orders
    await User.findByIdAndUpdate(req.user._id, { $push: { orders: order._id } });

    // Send confirmation email
    await sendOrderConfirmation(req.user, order);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const total = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(l)
      .skip((p - 1) * l);

    res.json({
      success: true,
      total,
      page: p,
      limit: l,
      pages: Math.ceil(total / l),
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Cannot cancel shipped or delivered orders" });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.orderStatus = "cancelled";
    order.cancellationReason = reason;
    if (order.paymentStatus === "completed") {
      order.paymentStatus = "refunded";
      order.refundAmount = order.totalAmount;
    }

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

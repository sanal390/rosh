import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const recentOrders = await Order.find().limit(10).sort({ createdAt: -1 });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit) || 10));

    let filter = {};
    if (search) {
      filter = {
        $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
      };
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .limit(l)
      .skip((p - 1) * l)
      .select("-password");

    res.json({
      success: true,
      total,
      page: p,
      limit: l,
      pages: Math.ceil(total / l),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit) || 10));

    let filter = {};
    if (status) {
      filter.orderStatus = status;
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .limit(l)
      .skip((p - 1) * l)
      .sort({ createdAt: -1 });

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

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus, trackingNumber },
      { new: true }
    );

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMetrics = async (req, res) => {
  try {
    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Product.find()
      .sort({ "meta.purchases": -1 })
      .limit(10)
      .select("name price meta.purchases");

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      metrics: {
        monthlyRevenue,
        topProducts,
        ordersByStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

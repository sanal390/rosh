import express from "express";
import { getDashboardStats, getAllUsers, updateUserStatus, getAllOrders, updateOrderStatus, getMetrics } from "../controllers/adminController.js";
import { adminProtect } from "../middleware/auth.js";

const router = express.Router();

router.use(adminProtect);

router.get("/stats", getDashboardStats);
router.get("/metrics", getMetrics);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUserStatus);
router.get("/orders", getAllOrders);
router.put("/orders/:id", updateOrderStatus);

export default router;

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        specs: {},
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      fullName: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "cod"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    trackingNumber: String,
    notes: String,
    cancellationReason: String,
    refundAmount: { type: Number, default: 0 },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    estimatedDelivery: Date,
  },
  { timestamps: true }
);

// Populate user and items with product info
orderSchema.pre("find", function () {
  this.populate({
    path: "user",
    select: "name email phone",
  }).populate({
    path: "items.product",
    select: "name category",
  });
});

export default mongoose.model("Order", orderSchema);

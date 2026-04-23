const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
// 1. Lay toan bo don hang (GET /api/orders)
router.get("/", async (req, res) => {
  try {
    const { status, sort } = req.query;

    let filter = {};

    //filter theo status
    if (status) {
      filter.status = status;
    }

    //sort theo totalAmount
    let sortOption = { createdAt: -1 };

    if (sort === "asc" || sort === "desc") {
      sortOption = {
        totalAmount: sort === "asc" ? 1 : -1,
      };
    }

    const orders = await Order.find(filter).sort(sortOption);

    res.json({
      success: true,
      data: orders,
      message: "Lấy danh sách thành công",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/search", async (req, res) => {
  try {
    const name = req.query.name?.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên để tìm kiếm",
      });
    }

    const orders = await Order.find({
      customerName: {
        $regex: `\\b${name}`,
        $options: "i",
      },
    });

    res.json({
      success: true,
      data: orders,
      message: "Tìm kiếm thành công",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 2. Lay don hang theo ID (GET /api/orders/:id)
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Khong tim thay don hang" });
    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 3. Tao don hang moi (POST /api/orders)
router.post("/", async (req, res) => {
  try {
    const { customerName, customerEmail, items, totalAmount } = req.body;

    const calculatedTotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    if (calculatedTotal !== totalAmount) {
      return res.status(400).json({
        success: false,
        message: "TotalAmount không đúng!",
      });
    }

    const order = new Order({
      customerName,
      customerEmail,
      items,
      totalAmount,
    });

    const newOrder = await order.save();

    res.status(201).json({
      success: true,
      data: newOrder,
      message: "Tạo đơn hàng thành công",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});
// 4. Cap nhat trang thai don hang (PUT /api/orders/:id)
router.put("/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedOrder)
      return res.status(404).json({ message: "Khong tim thay don hang" });
    res.json({
      success: true,
      data: updatedOrder,
      message: "Cập nhật thành công",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// 5. Xoa don hang (DELETE /api/orders/:id)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Khong tim thay don hang" });
    res.json({
      success: true,
      message: "Đã xoá đơn hàng",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;

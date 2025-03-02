const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ✅ Get All Products
router.get("/all", async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    res.status(200).json({
      success: true,
      message: "Products fetched successfully!",
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

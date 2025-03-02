const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ✅ Fetch Products by Category Name
router.get("/:category", async (req, res) => {
  try {
    const { category } = req.params;

    const products = await prisma.product.findMany({
      where: {
        category: {
          name: category, // ✅ Filter using category name
        },
      },
      include: { category: true }, // ✅ Include category details if needed
    });

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `No products found in category: ${category}` 
      });
    }

    res.status(200).json({
      success: true,
      message: `Products in '${category}' category fetched successfully!`,
      products,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;

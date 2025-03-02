const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();


router.get("/", async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
    }

    try {
        const category = await prisma.category.findFirst({
            where: {
                name: { contains: query, mode: "insensitive" }
            },
            include: { products: true }
        });

        if (category) {
            return res.json({ type: "category", data: category.products });
        }

        const products = await prisma.product.findMany({
            where: {
                name: { contains: query, mode: "insensitive" }
            }
        });

        if (products.length > 0) {
            return res.json({ type: "product", data: products });
        }

        return res.status(404).json({ message: "No results found" });

    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
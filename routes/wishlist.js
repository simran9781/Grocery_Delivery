const express = require("express");
const { PrismaClient } = require("@prisma/client");
const isLoggedIn = require("../middleware/verifyLogin"); // Middleware for authentication

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", isLoggedIn, async (req, res) => {
    const userId = req.user.userId;  // Get user ID from token
    const { productId } = req.body; // Get product ID from request body

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    try {
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if already in wishlist
        const existingItem = await prisma.wishlist.findFirst({
            where: { userId, productId }
        });

        if (existingItem) {
            return res.status(400).json({ message: "Product is already in wishlist" });
        }

        // Add to wishlist
        const wishlistItem = await prisma.wishlist.create({
            data: { userId, productId }
        });

        res.status(201).json({ message: "Added to wishlist", wishlistItem });

    } catch (error) {
        console.error("Wishlist error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/", isLoggedIn, async (req, res) => {
    const userId = req.user.userId; // Get user ID from token

    try {
        const wishlistItems = await prisma.wishlist.findMany({
            where: { userId },
            include: { product: true } // Include product details
        });

        res.status(200).json({
            success: true,
            message: "Wishlist items fetched successfully",
            wishlistItems
        });

    } catch (error) {
        console.error("Fetch wishlist error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/:productId", isLoggedIn, async (req, res) => {
    const userId = req.user.userId; // Get user ID from token
    const { productId } = req.params; // Get product ID from URL

    try {
        // Check if product is in wishlist
        const wishlistItem = await prisma.wishlist.findFirst({
            where: { userId, productId }
        });

        if (!wishlistItem) {
            return res.status(404).json({ message: "Product not found in wishlist" });
        }

        // Remove from wishlist
        await prisma.wishlist.delete({
            where: { id: wishlistItem.id }
        });

        res.status(200).json({ message: "Removed from wishlist" });

    } catch (error) {
        console.error("Remove wishlist error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;

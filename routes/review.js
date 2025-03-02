const express = require("express");
const { PrismaClient } = require("@prisma/client");
const isLoggedIn = require("../middleware/verifyLogin"); 
const router = express.Router();
const prisma = new PrismaClient();

router.post("/", isLoggedIn, async (req, res) => {
    const userId = req.user.userId;  // Get user ID from token
    const { productId, rating, comment } = req.body; // Get review details

    // Validate input
    if (!productId || !rating) {
        return res.status(400).json({ message: "Product ID and rating are required" });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if the user has already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: { userId, productId }
        });

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        // Add review
        const review = await prisma.review.create({
            data: { userId, productId, rating, comment }
        });

        res.status(201).json({ message: "Review added successfully", review });

    } catch (error) {
        console.error("Review error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/:productId", async (req, res) => {
    const { productId } = req.params;

    try {
        // Fetch all reviews for the product
        const reviews = await prisma.review.findMany({
            where: { productId },
            include: { user: { select: { id: true, name: true } } }, // Include user details
            orderBy: { createdAt: "desc" } // Sort reviews by latest first
        });

        res.status(200).json({ success: true, message: "Reviews fetched", reviews });

    } catch (error) {
        console.error("Fetch reviews error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;

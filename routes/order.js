const express = require("express");
const { PrismaClient } = require("@prisma/client");
const isLoggedIn = require("../middleware/verifyLogin");

const router = express.Router();
const prisma = new PrismaClient();

// Place an order
router.post("/", isLoggedIn, async (req, res) => {
    const userId = req.user.userId; // Get user ID from token
    const { address } = req.body; // Get delivery address

    if (!address) {
        return res.status(400).json({ message: "Delivery address is required" });
    }

    try {
        // Fetch user's cart with product details
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let total = 0;
        let orderItems = [];

        // Process each item in the cart
        for (const item of cart.items) {
            const { product, quantity } = item;
            total += quantity * product.price;

            // Check if product is a fruit/vegetable (uses `stock` field)
            if (product.stock !== null && product.stock >= quantity) {
                // Decrease stock quantity for fruits/vegetables
                await prisma.product.update({
                    where: { id: product.id },
                    data: { stock: product.stock - quantity },
                });
            } else if (product.quantity !== null && product.quantity >= quantity) {
                // Decrease quantity for other products
                await prisma.product.update({
                    where: { id: product.id },
                    data: { quantity: product.quantity - quantity },
                });
            } else {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            orderItems.push({
                productId: product.id,
                quantity,
                price: product.price,
            });
        }

        // Create new order
        const order = await prisma.order.create({
            data: {
                userId,
                total,
                address,
                items: {
                    create: orderItems,
                },
            },
            include: { items: true },
        });

        // Clear cart after placing the order
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

        res.status(201).json({ message: "Order placed successfully!", order });

    } catch (error) {
        console.error("Order placement error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/my-orders", isLoggedIn, async (req, res) => {
    const userId = req.user.userId;
    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            select: {
                id: true,
                address: true,
                total: true,
                status: true,
                items: {
                    select: {
                        product: {
                            select: {
                                name: true,
                            },
                        },
                        quantity: true,
                        price: true,
                    },
                },
            },
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;

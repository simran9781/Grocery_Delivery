const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/verifyLogin");

const router = express.Router();
const prisma = new PrismaClient();

// Add a product to cart
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user ? req.user.userId : null; 
    console.log("User ID:", userId);// Extract from token

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    res.status(200).json({ message: "Product added to cart successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get all cart items
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null; 
    console.log("User ID:", userId);

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) return res.status(404).json({ message: "Cart is empty" });

    res.status(200).json(cart.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Remove a product from cart
router.delete("/remove", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
     const userId = req.user ? req.user.userId : null; 
    console.log("User ID:", userId);

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Update cart item quantity
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user ? req.user.userId : null; 
    console.log("UserId",userId);

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const cartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) return res.status(404).json({ message: "Product not found in cart" });

    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;

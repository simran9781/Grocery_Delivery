const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Import auth routes
const authRoutes = require("./routes/auth");
const verifyRoutes = require("./routes/verify");
const cartRoutes = require("./routes/cart");
const searchRoutes = require("./routes/search");
const productRoutes = require("./routes/product");
const categoryproduct = require("./routes/categoryproduct")
const wishlistRoutes = require("./routes/wishlist");
const reviewRoutes = require("./routes/review");


// Use routes
app.use("/auth", authRoutes);
app.use("/verify", verifyRoutes);
app.use("/cart", cartRoutes);
app.use("/search", searchRoutes);
app.use("/products", productRoutes);
app.use("/category-product",categoryproduct);
app.use("/wishlist", wishlistRoutes);
app.use("/reviews", reviewRoutes); 


// Server listening

app.listen(4245,()=>{
    console.log("server started")
})


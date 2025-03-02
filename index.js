const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Import auth routes
const authRoutes = require("./routers/auth");
const verifyRoutes = require("./routers/verify");

// Use routes
app.use("/auth", authRoutes);
app.use("/verify", verifyRoutes);

// Server listening

app.listen(4245,()=>{
    console.log("server started")
})


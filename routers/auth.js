const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { sendmail } = require("../utils/sendmail");

const prisma = new PrismaClient();
const SECRET_KEY = "yahoo"; // Replace with an env variable

// Signup Route
router.post("/signup", async (req, res) => {
    const { name, email, password, phnno, address, role } = req.body;

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phnno,
                address,
                role: role || "USER"
            }
        });

        // Generate verification token
        const token = Math.floor(Math.random() * 10000);

        // Store token in DB
        await prisma.notification.create({
            data: {
                userId: newUser.id,
                message: `Verification token: ${token}`
            }
        });

        // Send verification email
        const verificationLink = `http://localhost:4245/verify/${token}/${newUser.id}`;
        await sendmail(email, "Verify your email", verificationLink);

        res.status(201).json({ message: "User created. Please verify your email.", newUser });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) return res.status(404).json({ message: "User does not exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        if (!user.isVerify) return res.status(401).json({ message: "Please verify your email first" });

    
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1d" });

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
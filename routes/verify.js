const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/:token/:userid", async (req, res) => {
    const { token, userid } = req.params;

    try {
        const storedToken = await prisma.notification.findFirst({
            where: { userId: userid, message: `Verification token: ${token}` }
        });

        if (!storedToken) return res.status(400).send("Invalid or expired verification link");

        
        await prisma.user.update({
            where: { id: userid },
            data: { isVerify: true }
        });

        res.send("Email verified! Please login to continue.");
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;

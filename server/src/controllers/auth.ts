import { Router } from "express";

export const router = Router();

router.get("/check", (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.status(200).json({ message: "Authenticated" });

    } else {
        res.status(401).json({ message: "Not authenticated" });

    }
});
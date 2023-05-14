import express from "express";

const router = express.Router();

router.get(['','/health'], async (req, res) => {
    res.json({
        status: "UP",
        timestamp: Date(),
    })
});

export default router;

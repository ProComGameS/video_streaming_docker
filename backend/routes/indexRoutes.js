import express from 'express';
const router = express.Router();

const videoRoutes = require("./videoRoutes");
const authRoutes = require("./authRoutes");
const miscRoutes = require("./miscRoutes");

router.use(videoRoutes);
router.use(authRoutes);
router.use(miscRoutes);

module.exports = router;

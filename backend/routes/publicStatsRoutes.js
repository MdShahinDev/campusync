const express = require("express");
const { getPublicStats } = require("../controller/publicStatsController");

const router = express.Router();

router.get("/stats", getPublicStats);

module.exports = router;

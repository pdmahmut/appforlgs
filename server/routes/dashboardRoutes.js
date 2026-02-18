const express = require("express");
const { getSchoolAnalyticsHandler } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/school-analytics", getSchoolAnalyticsHandler);

module.exports = router;


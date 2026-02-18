const { getSchoolAnalytics } = require("../services/schoolAnalyticsService");

async function getSchoolAnalyticsHandler(req, res, next) {
  try {
    const analytics = await getSchoolAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSchoolAnalyticsHandler,
};


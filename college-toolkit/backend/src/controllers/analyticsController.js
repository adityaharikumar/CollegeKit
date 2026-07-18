const Job = require('../models/Job');

const getAnalytics = async (req, res) => {
  try {
    const stats = await Job.getAnalytics();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAnalytics };

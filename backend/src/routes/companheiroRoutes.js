const express = require('express');
const router = express.Router();
const CompanheiroController = require('../controllers/companheiroController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.patch('/', CompanheiroController.batizar);

module.exports = router;

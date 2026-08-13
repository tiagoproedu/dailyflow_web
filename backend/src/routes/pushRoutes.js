const express = require('express');
const router = express.Router();
const PushController = require('../controllers/pushController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/chave-publica', PushController.getChavePublica);
router.get('/estado', PushController.getEstado);
router.post('/inscrever', PushController.inscrever);
router.post('/cancelar', PushController.cancelar);
router.post('/testar', PushController.testar);

module.exports = router;

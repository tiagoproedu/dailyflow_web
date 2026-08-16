const express = require('express');
const router = express.Router();
const PushController = require('../controllers/pushController');
const { protect } = require('../middlewares/authMiddleware');

// Fica **antes** do `protect` de propósito: quem chama é o service worker, que não tem
// o token de sessão. A autorização dela vem do token de ação embutido no lembrete.
router.post('/marcar', PushController.marcar);

router.use(protect);

router.get('/chave-publica', PushController.getChavePublica);
router.get('/estado', PushController.getEstado);
router.post('/inscrever', PushController.inscrever);
router.post('/cancelar', PushController.cancelar);
router.post('/testar', PushController.testar);

module.exports = router;

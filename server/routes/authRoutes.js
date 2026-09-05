const express = require('express');
const router = express.Router();

const { validateLogin } = require('../validators/authValidator');
const { login, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/login', validateLogin, login);
router.get('/me', authenticate, me);

module.exports = router;

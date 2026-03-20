const express = require('express');
const skillController = require('../controllers/skillController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/mine', skillController.getMySkills);
router.get('/user/:userId', skillController.getUserSkills);
router.post('/', skillController.addSkill);
router.put('/:id', skillController.updateSkill);
router.delete('/:id', skillController.deleteSkill);

module.exports = router;
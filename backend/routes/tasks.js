const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getTasks, createTask, getTask, updateTask, deleteTask
} = require('../controllers/taskController');

router.get('/', protect, getTasks);
router.post('/', protect, adminOnly, createTask);
router.get('/:id', protect, getTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;

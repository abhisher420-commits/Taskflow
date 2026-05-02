const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getUsers, updateRole, deleteUser, getDashboardStats } = require('../controllers/userController');

router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id/role', protect, adminOnly, updateRole);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/dashboard/stats', protect, getDashboardStats);

module.exports = router;

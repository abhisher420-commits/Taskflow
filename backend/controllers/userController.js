const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/users  (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:id/role  (admin only)
exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/users/:id  (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    let taskQuery = {};
    let projectQuery = {};

    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      taskQuery = { $or: [{ project: { $in: projectIds } }, { assignedTo: req.user._id }] };
      projectQuery = { _id: { $in: projectIds } };
    }

    const [
      totalTasks, doneTasks, inProgressTasks, todoTasks,
      overdueTasks, totalProjects, totalUsers,
      upcomingTasks, recentActivityTasks
    ] = await Promise.all([
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'done' }),
      Task.countDocuments({ ...taskQuery, status: 'in-progress' }),
      Task.countDocuments({ ...taskQuery, status: 'todo' }),
      Task.countDocuments({ ...taskQuery, status: { $ne: 'done' }, dueDate: { $lt: new Date() } }),
      Project.countDocuments(projectQuery),
      req.user.role === 'admin' ? User.countDocuments() : null,
      Task.find({ ...taskQuery, status: { $ne: 'done' } })
        .populate('project', 'name color')
        .populate('assignedTo', 'name avatarColor')
        .sort({ dueDate: 1 })
        .limit(5),
      Task.find(taskQuery)
        .populate('project', 'name')
        .populate('assignedTo', 'name')
        .sort({ updatedAt: -1 })
        .limit(5)
    ]);

    // Calculate priority breakdown
    const [highTasks, mediumTasks, lowTasks] = await Promise.all([
      Task.countDocuments({ ...taskQuery, priority: 'high', status: { $ne: 'done' } }),
      Task.countDocuments({ ...taskQuery, priority: 'medium', status: { $ne: 'done' } }),
      Task.countDocuments({ ...taskQuery, priority: 'low', status: { $ne: 'done' } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalTasks, doneTasks, inProgressTasks, todoTasks,
        overdueTasks, totalProjects,
        ...(req.user.role === 'admin' ? { totalUsers } : {}),
        completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
        priorities: { high: highTasks, medium: mediumTasks, low: lowTasks }
      },
      upcomingTasks,
      recentActivityTasks
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const { project, status, priority, assignedTo } = req.query;
    let query = {};

    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // Members only see tasks in their projects or assigned to them
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      query.$or = [{ project: { $in: projectIds } }, { assignedTo: req.user._id }];
    }

    const tasks = await Task.find(query)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, status } = req.body;

    // Verify project exists
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ success: false, message: 'Project not found.' });

    const task = await Task.create({
      title, description, project, assignedTo, priority, dueDate, status,
      createdBy: req.user._id
    });

    await task.populate('project', 'name color');
    await task.populate('assignedTo', 'name email avatarColor');
    await task.populate('createdBy', 'name email avatarColor');

    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name color members owner')
      .populate('assignedTo', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Members can only update status
    let updateData = req.body;
    if (!isAdmin) {
      updateData = { status: req.body.status };
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    })
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor');

    res.json({ success: true, task: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { $or: [{ owner: req.user._id }, { members: req.user._id }] };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatarColor role')
      .populate('members', 'name email avatarColor role')
      .sort({ createdAt: -1 });

    // Attach task counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const [total, done, overdue] = await Promise.all([
          Task.countDocuments({ project: p._id }),
          Task.countDocuments({ project: p._id, status: 'done' }),
          Task.countDocuments({ project: p._id, status: { $ne: 'done' }, dueDate: { $lt: new Date() } })
        ]);
        return { ...p.toObject(), taskCount: total, doneCount: done, overdueCount: overdue };
      })
    );

    res.json({ success: true, count: projects.length, projects: projectsWithCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { name, description, members, status, color } = req.body;
    const project = await Project.create({
      name, description, status, color,
      owner: req.user._id,
      members: members || []
    });
    await project.populate('owner', 'name email avatarColor role');
    await project.populate('members', 'name email avatarColor role');
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/projects/:id
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatarColor role')
      .populate('members', 'name email avatarColor role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Access check
    if (req.user.role !== 'admin') {
      const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
      const isOwner = project.owner._id.toString() === req.user._id.toString();
      if (!isMember && !isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status, color } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status, color },
      { new: true, runValidators: true }
    ).populate('owner', 'name email avatarColor role').populate('members', 'name email avatarColor role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and its tasks deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/projects/:id/members
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User already a member.' });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('owner', 'name email avatarColor role');
    await project.populate('members', 'name email avatarColor role');

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/projects/:id/members/:userId
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();
    await project.populate('owner', 'name email avatarColor role');
    await project.populate('members', 'name email avatarColor role');

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const pool = require('../config/db');

// GET /api/projects — get all projects for logged-in user
const getProjects = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.* FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE p.created_by = $1 OR pm.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/projects — create a project (Admin only)
const createProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO projects (name, description, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/projects/:id — update a project (Admin only)
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE projects SET name = $1, description = $2
       WHERE id = $3 AND created_by = $4 RETURNING *`,
      [name, description, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found or unauthorized.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/projects/:id — delete a project (Admin only)
const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM projects WHERE id = $1 AND created_by = $2 RETURNING *`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found or unauthorized.' });
    }
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/projects/:id/members — add a member to project (Admin only)
const addMember = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [id, user_id]
    );
    res.json({ message: 'Member added successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};
const getMembers = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email FROM users u
       INNER JOIN project_members pm ON u.id = pm.user_id
       WHERE pm.project_id = $1
       UNION
       SELECT u.id, u.name, u.email FROM users u
       INNER JOIN projects p ON u.id = p.created_by
       WHERE p.id = $2`,
      [id, id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update module.exports:
module.exports = { getProjects, createProject, updateProject, deleteProject, addMember, getMembers };
module.exports = { getProjects, createProject, updateProject, deleteProject, addMember };
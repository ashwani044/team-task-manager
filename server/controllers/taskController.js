const pool = require('../config/db');

// GET /api/tasks?project_id=1 — get tasks for a project
const getTasks = async (req, res) => {
  const { project_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT t.*, u.name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [project_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/tasks — create a task
const createTask = async (req, res) => {
  const { title, description, due_date, assigned_to, project_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, due_date, assigned_to, project_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, due_date, assigned_to, project_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/tasks/:id — update task status or assignment
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, due_date, assigned_to } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3,
           due_date = $4, assigned_to = $5
       WHERE id = $6 RETURNING *`,
      [title, description, status, due_date, assigned_to, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/tasks/:id — delete a task (Admin only)
const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
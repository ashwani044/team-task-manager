const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.get('/', authMiddleware, getTasks);

router.post('/', authMiddleware, [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status value'),
  body('project_id')
    .notEmpty().withMessage('Project ID is required'),
  body('due_date')
    .optional()
    .isDate().withMessage('Due date must be a valid date'),
], validate, createTask);

router.put('/:id', authMiddleware, [
  body('title').optional().trim(),  
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status value'),
], validate, updateTask);

router.delete('/:id', authMiddleware, roleMiddleware('Admin'), deleteTask);

module.exports = router;
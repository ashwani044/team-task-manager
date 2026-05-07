const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  addMember
} = require('../controllers/projectController');

router.get('/', authMiddleware, getProjects);

router.post('/', authMiddleware, roleMiddleware('Admin'), [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required'),
], validate, createProject);

router.put('/:id', authMiddleware, roleMiddleware('Admin'), [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required'),
], validate, updateProject);

router.delete('/:id', authMiddleware, roleMiddleware('Admin'), deleteProject);

router.post('/:id/members', authMiddleware, roleMiddleware('Admin'), [
  body('user_id')
    .notEmpty().withMessage('User ID is required')
    .isInt().withMessage('User ID must be a number'),
], validate, addMember);

module.exports = router;
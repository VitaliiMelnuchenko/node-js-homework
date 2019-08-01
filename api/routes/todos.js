const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const todosController = require('../controllers/todos');

router.get('/', checkAuth, todosController.getTodos);

router.post('/', checkAuth, todosController.addTodo);

router.patch('/:todoId', checkAuth, todosController.isDoneToggle);

router.delete('/:todoId', checkAuth, todosController.deleteTodo);

module.exports = router;
const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth')

const User = require('../models/user');
const Todo = require('../models/todo');

router.get('/', checkAuth, (req, res, next) => {
    User.findById(req.params.userId)
    .populate('todos')
    .select('todos')
    .then(result => {
        const response = {
            count: result.todos.length,
            todos: result.todos.map(todo => {
                return {
                    title: todo.title,
                    description: todo.description,
                    isDone: todo.isDone,
                    request : {
                        type: 'PATCH, DELETE',
                        url: `http://localhost:3000/todos/${todo._id}`
                    }
                }
            })
        };
        res.send(response);
    })
    .catch(err => {
        res.status(400).json({
            message: 'Bad request'
        });
    });
});

router.post('/', checkAuth, (req, res, next) => {
    const todoObj = {
        title: req.body.title,
        description: req.body.description,
        owner: req.params.userId
    }
    Todo.create(todoObj)
    .then(todo => {
        User.findById(req.params.userId)
        .then(foundUser => {
            foundUser.todos.push(todo);
            foundUser.save()
            .then(result => {
                res.status(201).json({
                    message: 'todo added'
                });
            })
            .catch(err => {
                console.log(err);
                res.send('error3');
            });
        })
        .catch(err => {
            console.log(err);
            res.send('error2');
        });
    })
    .catch(err => {
        console.log(err);
        res.send('error1');
    }); 
});

router.patch('/:todoId', checkAuth, (req, res, next) => {
    Todo.findById(req.params.todoId)
    .then(foundTodo => {
        foundTodo.isDone = !foundTodo.isDone;
        foundTodo.save()
        .then(() => {
            res.status(200).json({
                message: 'todo updated'
            });
        })
        .catch(err => {
            console.log(err);
            res.send('error1');
        });
    })
    .catch(err => {
        console.log(err);
        res.send('error1');
    }); 
});

router.delete('/:todoId', checkAuth, function(req, res) {
    Todo.findByIdAndDelete(req.params.todoId)
    .then(() => {
        res.status(200).json({
            message: 'todo deleted'
        })
    })
    .catch(err => {
        console.log(err);
        res.send('error1');
    }); 
});

module.exports = router;
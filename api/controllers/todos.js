const User = require('../models/user');
const Todo = require('../models/todo');
const joi = require('@hapi/joi');

exports.getTodos = (req, res, next) => {
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
        res.status(200).json(response);
    })
    .catch(() => {
        next(E400());
    });
};

exports.addTodo = (req, res, next) => {
    const todoObj = {
        title: req.body.title,
        description: req.body.description,
        owner: req.params.userId
    };
    const schema = joi.object().keys({
        title: joi.string().max(100).required(),
        description: joi.string().max(300)
    }).with('title', []).without('description', []);
    const bodyVal = joi.validate({ title: req.body.title }, schema);
    if (bodyVal.error !== null) {
        next(E400());
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
            .catch(() => {
                next(E400());
            });
        })
        .catch(err => {
            next(E400());
        });
    })
    .catch(err => {
        next(E400());
    }); 
};

exports.isDoneToggle = (req, res, next) => {
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
            next(E400());
        });
    })
    .catch(err => {
        next(E400());
    }); 
};

exports.deleteTodo = (req, res, next) => {
    Todo.findByIdAndDelete(req.params.todoId)
    .then(() => {
        res.status(200).json({
            message: 'todo deleted'
        })
    })
    .catch(err => {
        next(E400());
    }); 
};

function E400() {
    const err = new Error('Bad Request');
    err.status = 400;
    return err;
}
const app = require('express')();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const todoRoutes = require('./api/routes/todos');
const userRoutes = require('./api/routes/users');
mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
mongoose.set('useCreateIndex', true);

app.use('/todos', todoRoutes);
app.use('/user', userRoutes);

app.use('*', function(req, res){
    res.status(404).json({
        message: 'Not found'
    });
});

app.use((err, req, res, next) => {
    res.json({
        status: err.status,
        message: err.message || 'Something Went Wrong',
    });
});

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});
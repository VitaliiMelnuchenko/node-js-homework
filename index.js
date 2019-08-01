const app = require('express')();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});

const todoRoutes = require('./api/routes/todos');
const userRoutes = require('./api/routes/users');

app.use(bodyParser.urlencoded({extended: true}));
mongoose.set('useCreateIndex', true);


app.use('/todos', todoRoutes);
app.use('/user', userRoutes);

/*app.use((req, res, next) => {
    next(error400());
});*/

app.use('*', function(req, res, next){
    res.status(404).json({
        message: 'Not found'
    });
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message,
    });
});

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});

/*function error400(next) {
    const err = new Error('Bad Request');
    err.status = 400;
    return err;
}*/
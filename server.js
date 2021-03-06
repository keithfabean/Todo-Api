var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var PORT = process.env.PORT || 3000;

//set up the array that will hold the ToDo items
var todos = [{
  id: 1,
  description: 'Meet Ann for lunch',
  completed: false
}, {
  id: 2,
  description: 'Play With Bonnie',
  completed: false
}, {
  id: 3,
  description: 'Brush the pool',
  completed: true
}];
var todoNextId = 1;

app.use(bodyParser.json());

//------------------------------------------------------
app.get('/', function(req, res){
  res.send('ToDo API Root!');
//  res.send('** Root ** - Asking for Todo with id of: ' + req.params.id);

});

//------------------------------------------------------
// GET URL Format    /todos/?completed=false&q=<search string>
app.get('/todos', middleware.requireAuthentication, function(req, res){
    //get any query parameters passed in the URL
    var query = req.query;
    var where = {userId: req.user.get('id')};   //return only the logged in user's todo items

    if (query.hasOwnProperty('completed') && query.completed ==='true'){
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed ==='false'){
        where.completed = false;
    }
    console.log('*** TODOS *** 001 - Where Clause');
    console.log(where);

    if (query.hasOwnProperty('q') && query.q.length > 0){
        where.description = {
            $like: '%' + query.q + '%'
        };
        console.log('*** TODOS ***  002 - Where Clause');
        console.log(where);
    }

    db.todo.findAll({where: where}).then(function(todos){
        res.json(todos);
    }, function(err) {
        res.status(500).send();
    });


  // //get any query parameters passed in the URL
  // var queryParams = req.query;
  // var filteredTodos = todos;
  //
  // if (queryParams.hasOwnProperty('completed') && queryParams.completed ==='true'){
  //   filteredTodos = _.where(filteredTodos, {completed: true});
  // } else if (queryParams.hasOwnProperty('completed') && queryParams.completed ==='false'){
  //   filteredTodos = _.where(filteredTodos, {completed: false});
  // }
  //
  // if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0){
  //   //var evens = _.filter([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
  //   filteredTodos = _.filter(filteredTodos, function(todo){
  //                                         //  return todo.description === queryParams.q; });
  //                                           return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1; });
  // }
  //
  // res.json(filteredTodos);
});

//------------------------------------------------------
app.get('/todos/:id', middleware.requireAuthentication, function(req, res){
  var todoId = parseInt(req.params.id,10);

  db.todo.findOne({ where: {id: todoId, userId: req.user.get('id')} }).then(function(todoItem){
    if(todoItem !== null){
      res.status(200).json(todoItem);
    }else {
      res.status(404).send();
    }
  }, function(err){
    res.status(500).send();
  });

  // if (typeof todoItem === 'undefined'){
  //   res.status(404).send();
  // }else {
  //   res.json(todoItem);
  // }

//  res.send('Asking for Todo with id of: ' + req.params.id);
});

//------------------------------------------------------
app.post('/todos', middleware.requireAuthentication, function(req, res){
    //Make sure only valid fields are in the body
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo){
        req.user.addTodo(todo).then( function(){
            return todo.reload();
        }).then(function(todo){
            res.json(todo.toJSON());
        });
    }, function(err){
        console.log(err);
        res.status(400).json(err);
    });

    /*
    // // if the completed flag is NOT a boolean value
    // //              OR
    // // the description is NOT a string
    // //Return a status of 400
    //
    //   if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
    //     return res.status(400).send();
    //   }
    //
    //   //set body.description to trimed value.
    //   body.description = body.description.trim();
    //
    //   //add id field to the todolist and increment id
    //   body.id = todoNextId;
    //   todoNextId = ++todoNextId;
    //
    //   //push body to array
    //   todos.push(body);
    //
    //   res.json(body);
    //
    */

});

//------------------------------------------------------
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res){
    var todoId = parseInt(req.params.id,10);

    db.todo.findOne({ where: {id: todoId, userId: req.user.get('id')} }).then(function(todoItem){
        if(todoItem !== null){
            db.todo.destroy({where: {id: todoId, userId: req.user.get('id')} }).then(function(rowsDeleted){
                res.status(200).json(todoItem);
            });
        }else {
            res.status(404).json({Error: 'No item found with id: ' + todoId});
        }
    }, function(err){
        res.status(500).send();
    });

    // var todoItem = _.findWhere(todos, {id: todoId});
    //
    // if (todoItem){
    //   todos = _.without(todos, todoItem);
    //   res.json(todoItem);
    // }else {
    //   res.status(404).json({"error": "No Item to delete with that id!"});
    // }

});

//------------------------------------------------------
app.put('/todos/:id', middleware.requireAuthentication, function(req, res){
    var todoId = parseInt(req.params.id,10);

    //Make sure only valid fields are in the body.  _.pick will remove attributes not specified
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if (body.hasOwnProperty('completed')){
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')){
        attributes.description = body.description;
    }

    db.todo.findOne({ where: {id: todoId, userId: req.user.get('id')} }).then(function(todoItem){
        if(todoItem){
            todoItem.update(attributes).then(function(todoItem){
                res.json(todoItem.toJSON());
                // .update failure
            },function(err){
                res.status(400).json(err);
            });
        }else{
            res.status(404).send();
        }
    }, function(){
        res.status(500).send();
    });


  //---------------
  // var todoId = parseInt(req.params.id,10);
  //
  // //Make sure only valid fields are in the body.  _.pick will remove attributes not specified
  // var body = _.pick(req.body, 'description', 'completed');
  // var validAttributes = {};

  // //Find the todo item with the matching ID
  // var todoItem = _.findWhere(todos, {id: todoId});

  // if (!todoItem){
  //   res.status(404).json({"error": "No Item found to update!"});
  // }

  // if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
  //   validAttributes.completed = body.completed;
  // } else if(body.hasOwnProperty('completed')){
  //   //error not boolean
  //   return res.status(400).json({"Error": "Completed attribute is not a Boolean!"});
  // } else {
  //   // Never provided the property.  Default it to False
  //   validAttributes.completed = false;
  // }
  //
  // if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
  //   validAttributes.description = body.description;
  // } else if(body.hasOwnProperty('description')){
  //   return res.status(400).json({"Error": "description attribute is not a not a valid string!"});
  // }
  //
  // //We're ready to update the todo item _.extend will update the todoItem
  // _.extend(todoItem, validAttributes);
  // res.json(todoItem);

});
//------------------------------------------------------
app.post('/user', function(req, res){
  //Make sure only valid fields are in the body
  var body = _.pick(req.body, 'email', 'password');

  db.user.create(body).then(function(user){
      res.status(200).json(user.toPublicJSON());
  }, function(err){
    console.log(body);
    console.log(err);
    res.status(400).json(err);
  });

});

//------------------------------------------------------
app.post('/users/login', function(req, res){
    //Make sure only valid fields are in the body
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function (user){
        var token = user.generateToken('authentication');

        userInstance = user;

        return db.token.create({token: token});

    }).then(function(tokenInstance){
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function(err) {
        res.status(401).send('Could not authenticate.');
    });

});

//------------------------------------------------------
app.delete('/users/login', middleware.requireAuthentication, function(req, res){

	req.token.destroy().then(function () {
		res.status(204).send();
	}).catch(function (err) {
		res.status(500).send();
	});
    
});

//------------------------------------------------------
// Start the server code inside the DB sequelize.
//    I'm not sure why this is done this way
//{force: true}
db.sequelize.sync({force: true}).then(function(){

  app.listen(PORT, function(){
    console.log('Express Listening on PORT: ' + PORT);
  });

});

// //------------------------------------------------------
// app.listen(PORT, function(){
//   console.log('Express Listening on PORT: ' + PORT);
// });

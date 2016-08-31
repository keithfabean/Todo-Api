var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var _ = require('underscore');


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
var todoNextId = 4;

app.use(bodyParser.json());

//------------------------------------------------------
app.get('/', function(req, res){
  res.send('ToDo API Root!');
//  res.send('** Root ** - Asking for Todo with id of: ' + req.params.id);

});

//------------------------------------------------------
app.get('/todos', function(req, res){
  res.json(todos);
});

//------------------------------------------------------
app.get('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id,10);

  var todoItem = _.findWhere(todos, {id: todoId});

  if (typeof todoItem === 'undefined'){
    res.status(404).send();
  }else {
    res.json(todoItem);
  }

//  res.send('Asking for Todo with id of: ' + req.params.id);
});

//------------------------------------------------------
app.post('/todos', function(req, res){
  //Make sure only valid fields are in the body
  var body = _.pick(req.body, 'description', 'completed');

// if the completed flag is NOT a boolean value
//              OR
// the description is NOT a string
//Return a status of 400

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
    return res.status(400).send();
  }

  //set body.description to trimed value.
  body.description = body.description.trim();

  //add id field to the todolist and increment id
  body.id = todoNextId;
  todoNextId = ++todoNextId;

  //push body to array
  todos.push(body);

  res.json(body);

});

//------------------------------------------------------
app.delete('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id,10);

  var todoItem = _.findWhere(todos, {id: todoId});

  if (todoItem){
    todos = _.without(todos, todoItem);
    res.json(todoItem);
  }else {
    res.status(404).json({"error": "No Item to delete with that id!"});
  }

});

//------------------------------------------------------
app.put('/todos/:id', function(req, res){
  //Make sure only valid fields are in the body.  _.pick will remove attributes not specified
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  //Find the todo item with the matching ID
  var todoId = parseInt(req.params.id,10);
  var todoItem = _.findWhere(todos, {id: todoId});

  if (!todoItem){
    res.status(404).json({"error": "No Item found to update!"});
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
    validAttributes.completed = body.completed;
  } else if(body.hasOwnProperty('completed')){
    //error not boolean
    return res.status(400).json({"Error": "Completed attribute is not a Boolean!"});
  } else {
    // Never provided the property.  Default it to False
    validAttributes.completed = false;
  }

  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
    validAttributes.description = body.description;
  } else if(body.hasOwnProperty('description')){
    return res.status(400).json({"Error": "description attribute is not a not a valid string!"});
  }

  //We're ready to update the todo item _.extend will update the todoItem
  _.extend(todoItem, validAttributes);
  res.json(todoItem);

});

//------------------------------------------------------
app.listen(PORT, function(){
  console.log('Express Listening on PORT: ' + PORT);
});

var express = require('express');
var app = express();

var PORT = process.env.PORT || 3000;

//set up the array that will hold the ToDo items
var todos = [{
  id: 1,
  description: 'Meet Ann for lunch',
  completed: false
}, {
  id: 2,
  description: 'Mow the lawn',
  completed: false
}, {
  id: 3,
  description: 'Brush the pool',
  completed: true
}];

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
  var todoItem;

  todos.forEach(function(todo) {

    if (todoId === todo.id){
      todoItem = todo;
    }
  });

  if (typeof todoItem === 'undefined'){
    res.status(404).send();
  }else {
    res.json(todoItem);
  }

//  res.send('Asking for Todo with id of: ' + req.params.id);
});

//------------------------------------------------------
app.listen(PORT, function(){
  console.log('Express Listening on PORT: ' + PORT);
});

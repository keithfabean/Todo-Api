var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': __dirname + '/basic-sqlite-database.sqlite'
});

//Define the ToDo Item table structure
var Todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 250]
    }
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
}
});

// running sync with the 'force: true' option will drop all the tables and data
//              before recresting them.  The default is 'force: false'.
sequelize.sync(
//  {force: true}
).then(function (){
  console.log('*** Sequelize *** - Everything is Synced');

  return Todo.findAll({where: {id: 2}
  }).then(function(todos){
        if (todos){
          console.log('*** Sequelize *** - todo item found.');
          todos.forEach(function(todo){
            console.log(todo.toJSON());
          });
        }else {
          console.log('*** Sequelize *** - No todo found with id of ' + '2');
        }
  }).catch(function(err){
    console.log(err);
  });


  // Todo.create({
  //   description: "Play with Bonnie",
  //   completed: false
  // }).then(function(todo){
  //     return Todo.create({
  //       description: "Take Ann to lunch",
  //       completed: false
  //     });
  //   }).then(function(todo){
  //     console.log('*** Sequelize *** - Todo TABLE values.');
  //     console.log(Todo);
  //       //return Todo.findById(1)
  //       return Todo.findAll({
  //         where: {description: {$like: '%ann%'}, completed: false}
  //       });
  //   }).then(function(todos){
  //       if (todos){
  //         console.log('*** Sequelize *** - todo item found.');
  //         todos.forEach(function(todo){
  //           console.log(todo.toJSON());
  //         });
  //       }else {
  //         console.log('*** Sequelize *** - No todo found with id of ' + '1');
  //       }
  // }).catch(function(err){
  //   console.log(err);
  // });
});

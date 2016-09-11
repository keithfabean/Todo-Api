var bcrypt = require('bcrypt');
var _ = require('underscore');

//--------------------------------------------------------------------
module.exports = function(sequelize, DataTypes){
  //return sequelize.define('user', {
  var user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    salt: {
      type: DataTypes.STRING
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [7,100]
      },
      set: function(value){
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword  = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }    }
  },{
    hooks: {
      beforeValidate: function(user, options){
        if (typeof user.email === 'string'){
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods: {
      authenticate: function(body) {
        return new Promise(function (resolve, reject){
          if ((typeof body.email !== 'string' || body.email.length === 0) ||
              (typeof body.password !== 'string' || body.password.length === 0)) {
                //return res.status(400).send('invalid user id or password.');
                return reject();
          }

          //db.user.findOne({ where: {email: body.email} }).then(function(user){
          user.findOne({ where: {email: body.email} }).then(function(user){
            // If a user IS NOT returned OR the passwords DON'T match, send a 401 response.
            if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
              //return res.status(401).send('User Not Found!');
              return reject();
            }
            resolve(user);
            res.status(200).json(user.toPublicJSON());
          }, function(err){
            reject();
          });

        });
      }
    },
    instanceMethods: {
      toPublicJSON: function(){
        var json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
      }
    }
  });

  return user;
};

const Sequelize = require('sequelize');

const connection = new Sequelize('estoquefarmacia', 'root', '031032033', {
    host: 'localhost',
    dialect: 'mysql', 
    timezone: '-03:00',
})

module.exports = connection;
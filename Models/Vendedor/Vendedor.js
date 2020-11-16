const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Vendedor = connection.define('vendedor', {
    nome: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    password: {
        type: Sequelize.STRING,
        allowNull: false, 
    }
})

// Vendedor.sync({force: true});
module.exports = Vendedor;
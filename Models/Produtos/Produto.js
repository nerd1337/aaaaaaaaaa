const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Produto = connection.define('produto', {
    nomeProduto: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    preco: {
        type: Sequelize.FLOAT,
        allowNull: false
    },

    quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }
})

// Produto.sync({force: true});
module.exports = Produto;
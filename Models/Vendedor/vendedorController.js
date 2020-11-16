const express = require('express');
const Vendedor = require('./Vendedor');
const Produto = require('../Produtos/Produto');
const Cliente = require('../Clientes/Cliente');
const vendedorAuth = require('../../middlewares/vendedorauth');
const router = express.Router();


router.get('/cadastroVendedor', (req, res) => {
    res.render('Vendedor/cadastroVendedor');
})

router.get('/loginVendedor', (req, res) => {
    res.render('Vendedor/loginVendedor');
})

router.post('/concluirCadastro', (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const password = req.body.password;

    if (nome, email, password) {
        Vendedor.findOne({
            where: {
                email: email, 
                password: password,
            }
        }).then((vendedores) => {
            if (vendedores) {
                res.send('Usuario Existente')
            } else {
                Vendedor.create({
                    nome: nome,
                    email: email, 
                    password: password
                }).then(() => res.render('Vendedor/loginVendedor'))
                .catch((err) => res.render('/'))
            }
        })
    } else {
        res.redirect('/')
    }
})

router.post('/autenticarVendedor', (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const password = req.body.password;

    Vendedor.findOne({
        where: {
            nome: nome,
            email: email, 
            password: password
        }
    }).then((usuario) => {
        if (usuario) {
            req.session.user = {
                nome: nome,
                password: password
            }
            res.render('Vendedor/sessaoVendedor')
        } else {
            res.redirect('/');
        }
    })
})

router.get('/cadastrarProduto', vendedorAuth, (req, res) => {
    res.render('Produto/cadastrarProduto');
})

router.post('/newProduto', (req, res) => {
    const nomeProduto = req.body.nomeProduto;
    const precoProduto = parseFloat(req.body.precoProduto).toFixed(2);
    const quantidade = req.body.quantidade;

    if (nomeProduto, precoProduto, quantidade) {
        Produto.findOne({
            where: {
                nomeProduto: nomeProduto,
            }
        }).then((produto) => {
            if (produto) {
                Produto.findAll().then(produtos => {
                    res.render('Produto/produtoList', {produtos: produto})
                })
            } else {
                Produto.create({
                    nomeProduto: nomeProduto,
                    preco: precoProduto,
                    quantidade: quantidade
                }).then(() => Produto.findAll().then((produtos) => {
                    res.render('Produto/produtoList', {produtos: produtos})
                }))
                .catch((error) => console.log('Falha' + error));
            }
        })
    } else {
        res.render('Produto/cadastrarProduto')
    }
})

router.get('/realizarVenda', vendedorAuth,(req, res) => {
    Produto.findAll().then((produtos) => {
        res.render('Vendedor/realizarVenda', {produtos: produtos});
    })
})

router.post('/venda', (req, res) => {
    const pedido = req.body.produtos;
    const quantidadePedido = req.body.quantidade;
    const nomeCliente = req.body.nomeCliente;
    const telefoneCliente = req.body.telefoneCliente;
    let rest;
    let preco = 0;
    let total = 0;

    if (nomeCliente, telefoneCliente) {
        Cliente.findOne({
            where: {
                nomeCliente: nomeCliente, 
                telefone: telefoneCliente
            }
        }).then((cliente) => {
            // Se o Cliente Existir
            if (cliente != undefined) {
                Produto.findByPk(pedido)
                .then((produto) => {
                    if (produto.quantidade >= quantidadePedido) {
                        preco = produto.preco * quantidadePedido;
                        rest = produto.quantidade - quantidadePedido;
                        Produto.update({quantidade: rest}, {
                            where: {
                                id: pedido
                            }
                        }).then(() => Cliente.findOne({
                            where: {
                                nomeCliente: nomeCliente,
                                telefone: telefoneCliente
                            }
                        })).then((cliente) => {
                            total = cliente.total;
                            total += preco;
    
                            Cliente.update({total: total}, {
                                where: {
                                    nomeCliente: nomeCliente,
                                    telefone: telefoneCliente
                                }
                            }).then(() => {
                                Cliente.findAll().then((clientes) => {
                                    res.render('Cliente/paginaFinal', {clientes: clientes});
                                })
                            })
                        })
                    }
                })
            } else {
                Produto.findByPk(pedido)
                .then((produto) => {
                    if (produto.quantidade >= quantidadePedido) {
                        preco = produto.preco * quantidadePedido;
                        rest = produto.quantidade - quantidadePedido;
                        total += preco; 

                        Cliente.create({
                            nomeCliente: nomeCliente,
                            telefone: telefoneCliente,
                            total: total
                        }).then(() => Cliente.findAll().then((clientes) => {
                            res.render('Cliente/paginaFinal', {clientes: clientes});
                        }))
                    }
                })
            }
        })
    } else {
        res.render('Vendedor/sessaoVendedor');
    }
})

router.post('/atualizarPedido', (req, res) => {
    const id = req.body.id;
    Cliente.findByPk(id)
    .then((cliente) => {
        Produto.findAll()
        .then((produtos) => res.render('Vendedor/atualizarPedido', {cliente: cliente, produtos: produtos}))
    })
})

router.get('/visualizarProdutos', vendedorAuth, (req, res) => {
    Produto.findAll().then((produtos) => {
        res.render('Produto/produtoList', {produtos: produtos});
    })
})

router.get('/finalizarVenda', (req, res) => {
    Cliente.findAll()
    .then((clientes) => {
        res.render('Cliente/paginaFinal', {clientes: clientes});
    })
})

router.post('/receberPagamento', (req, res) => {
    const id = req.body.id
    // Mexer aqui também
    Cliente.findByPk(id)
    .then((cliente) => {
        Cliente.update({total: 0}, {
            where: {
                id: cliente.id
            }
        }).then(() => {
            res.render('Vendedor/sessaoVendedor');
        })
    })
})


router.post('/atualizarProdutos', (req, res) => {
    const id = req.body.prod;
    Produto.findOne({
        where: {
            id: id
        }
    }).then((produto) => {
        res.render('Produto/atualizarProdutos', {produtos: produto})
    })
})

router.post('/finalizarAtualizacao', (req, res) => {
    const id = req.body.id; 
    const nomeProduto = req.body.nomeProduto;
    const novaQntd = parseInt(req.body.novaQntd);
    let total = 0;

    Produto.findOne({
        where: {
            nomeProduto: nomeProduto
        }
    }).then((produto) => {
        total = produto.quantidade;
        total += novaQntd;
        
        Produto.update({quantidade: total}, {
            where: {
                nomeProduto: nomeProduto,
            }
        }).then(() => {
            Produto.findAll().then((produtos) => {
                res.render('Produto/produtoList', {produtos: produtos});
            })
        })
    })
})

router.get('/logout', (req, res) => {
    req.session.user = undefined
    res.redirect('/');
})

module.exports = router;
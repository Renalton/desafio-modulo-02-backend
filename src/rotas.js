const express = require("express");
const banco = require("./controladores/banco");
const rotas = express();

rotas.get("/listar-todas-as-contas", banco.listarContas);
rotas.post("/criar-conta", banco.criarConta);
rotas.put("/contas/:numeroConta", banco.atualizarContaCliente);
rotas.delete("/contas/:numeroConta", banco.excluirConta);
rotas.post("/transacoes/depositar", banco.depositar);
rotas.post("/transacoes/sacar", banco.sacar);
rotas.post("/transacoes/transferir", banco.transferir);
rotas.get("/transacoes/saldo", banco.saldo);
rotas.get("/transacoes/extrato", banco.extrato);


module.exports = rotas;

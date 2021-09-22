const banco = require("../bancodedados");
const { format } = require("date-fns");
const { query } = require("express");
const { restart } = require("nodemon");
const { json } = require("body-parser");

//variavel para gerar o numero da conta.


function gerarNovoNumeroDeConta(banco) {
    return novoNumeroDeConta = banco.contas.length + 1;
}
//Registra a data em UTC
function data() {
    return format(new Date(), "yyyy-MM-dd HH:mm:ss");
}
function validaDadosDeEntrada(cliente) {
    if (!cliente.nome) {
        return "O campo nome é obrigatório";
    }
    if (!cliente.cpf) {
        return "O campo CPF é obrigatório";

    }
    if (!cliente.data_nascimento) {
        return "O campo data de nascimento é obrigatório";
    }
    if (!cliente.telefone) {
        return "O campo telefone é obrigatório";
    }
    if (!cliente.email) {
        return "O campo email é obrigatório";
    }
    if (!cliente.senha) {
        return "O campo senha é obrigatório";
    }
    if (typeof cliente.nome !== "string") {
        return "O nome deve ser preenchido com texto";
    }

    if (cliente.cpf.length !== 11) {
        return "O CPF deve ter 11 digitos";
    }

}
function consultaCPF(cpf) {
    const validaCPF = banco.contas.find((n) => n.usuarios.cpf === cpf);

    if (validaCPF) {
        return "CPF já cadastrado";
    } else {

        return;
    }

}
function consultaEmail(email) {
    const validaEmail = banco.contas.find((n) => n.usuarios.email === email);

    if (validaEmail) {
        return "Email já cadastrado";
    } else {
        return;
    }
}
function validaCampoSenha(res, CampoSenha){
    if (CampoSenha === undefined) {
        res.status(404);
        res.json({ mensagem: "O campo senha não foi informada" });
        return;
    }
}
function validaCampoValor(res, campoValor){
    if (campoValor === undefined) {
        res.status(404);
        res.json({ mensagem: "O campo valor não foi informado" });
        return;
    }
}
function validaCampoNumeroConta(res, campoNumeroConta){
    if (campoNumeroConta === undefined) {
        res.status(404);
        res.json({ mensagem: "Conta não informada" });
        return;
    }
}
function listarContas(req, res) {
    if (req.query.senha_banco === "123") {
        res.status(200);
        res.json(banco.contas);
    } else {
        res.status(400);
        res.json({ mensagem: "senha inválida" });
    }
}

function criarConta(req, res) {

    const erro = validaDadosDeEntrada(req.body);
    const erroCPF = consultaCPF(req.body.cpf);
    const erroEmail = consultaEmail(req.body.email);
    if (erro) {
        res.status(400);
        res.json({ erro });
        return;
    }

    if (erroCPF) {
        res.status(400);
        res.json(erroCPF);
        return;
    }
    if (erroEmail) {
        res.status(400);
        res.json({ erroEmail });
        return;
    }

    const novaConta = {
        numero: gerarNovoNumeroDeConta(banco).toString(),
        saldo: 0,
        usuario: {
            nome: req.body.nome,
            cpf: req.body.cpf,
            data_nascimento: req.body.data_nascimento,
            telefone: req.body.telefone,
            email: req.body.email,
            senha: req.body.senha
        }

    }
    //gera um novo numero de conta
    gerarNovoNumeroDeConta(banco).toString();

    banco.contas.push(novaConta);
    res.status(201);
    res.json(novaConta);

}
function atualizarContaCliente(req, res) {
    const cliente = banco.contas.find((n) => n.numero === req.params.numeroConta);
    const erroCPF = consultaCPF(req.body.cpf);
    const erroEmail = consultaEmail(req.body.email);
    const body = req.body;

    if(!cliente){
        res.status(404);
        res.json({Erro: "Conta não encontrada"});
    }

    const erro = validaDadosDeEntrada({
        nome: req.body.nome ?? cliente.nome,
        cpf: req.body.cpf ?? cliente.cpf,
        data_nascimento: req.body.data_nascimento ?? cliente.data_nascimento,
        telefone: req.body.telefone ?? cliente.telefone,
        email: req.body.email ?? cliente.email,
        senha: req.body.senha ?? cliente.senha,
    });
    if (erro) {
        res.status(400);
        res.json({ erro });
        return;
    }


    if (body.nome !== undefined) {
        cliente.usuarios.nome = body.nome;
    }
    if (body.cpf !== undefined) {
        if (erroCPF) {
            res.status(400);
            res.json({ erroCPF });
        } else {
            cliente.usuarioscpf = body.cpf;
        }

    }
    if (body.data_nascimento !== undefined) {
        cliente.usuarios.data_nascimento = body.data_nascimento;
    }
    if (body.telefone !== undefined) {
        cliente.usuarios.telefone = body.telefone;
    }
    if (body.email !== undefined) {
        if (erroEmail) {
            res.status(400);
            res.json({ erroEmail });
        } else {
            cliente.usuarios.email = body.email;
        }

    }
    if (body.senha !== undefined) {
        cliente.usuarios.senha = body.senha;
    }

    res.status(200);
    res.json({ mensagem: "Conta atualizada com sucesso!" });
}
function excluirConta(req, res) {
    const cliente = banco.contas.find((n) => n.numero === req.params.numeroConta);
    const indice = banco.contas.indexOf(cliente);

    if(!cliente){
        res.status(404);
        res.status({erro: "Conta não existe"});
        return;
    }

    if (cliente.saldo === 0) {
        banco.contas.splice(indice, 1);
        res.status(200);
        res.json({ mensagem: "Conta excluida com sucesso!" });
    } else {
        res.status(400);
        res.json({ mensagem: "Conta não pode ser excluida" });
    }
}

function depositar(req, res) {
    const cliente = banco.contas.find((n) => n.numero === req.body.numero_conta);

    if(!cliente){
        res.status(404);
        res.json({erro: "Conta não existe"});
        return;
    }
   validaCampoNumeroConta(res, req.body.numero_conta);
   validaCampoValor(res, req.body.valor);
  


    if (req.body.valor > 0) {
        cliente.saldo += req.body.valor;

        banco.depositos.push({
            data: data(),
            numero_conta: req.body.numero_conta,
            valor: req.body.valor
        });
        res.status(200);
        res.json({ mensagem: "Depósito realizado com sucesso!" });

    } else {
        res.status(400);
        res.json({ Erro: "Operação não realizada" });
    }
}

function sacar(req, res) {
    const cliente = banco.contas.find((n) => n.numero === req.body.numero_conta);
    validaCampoSenha(res, req.body.senha);
    validaCampoNumeroConta(res, req.body.numero_conta);
    validaCampoValor(res, req.body.valor);
  
   

    if (cliente) {
        if (cliente.usuarios.senha === req.body.senha) {
            if (cliente.saldo >= req.body.valor) {
                cliente.saldo -= req.body.valor;
                //registra o saque no banco de dados
                banco.saques.push({
                    data: data(),
                    numero_conta: req.body.numero_conta,
                    valor: req.body.valor,
                });

                res.status(200);
                res.json({ mensagem: "Saque realizado com sucesso!" });

            } else {

                res.json({ mensagem: "Saldo insuficiente" });
            }
        } else {
            res.status(400);
            res.json({ mensagem: "Senha inválida" });
        }
    } else {
        res.status(400);
        res.json({ mensagem: "Conta não localizada" });
    }

}
function transferir(req, res) {
    validaCampoNumeroConta(res, req.body.numero_conta_origem);
    validaCampoNumeroConta(res, req.body.numero_conta_destino);
    validaCampoSenha(res, req.body.senha);
    validaCampoValor(res, req.body.valor);
    
    
    const cliente_Origem = banco.contas.find((n) => n.numero === req.body.numero_conta_origem);
    const cliente_Destino = banco.contas.find((n) => n.numero === req.body.numero_conta_destino);

    if (cliente_Origem && cliente_Destino) {

        if (cliente_Origem.usuario.senha === req.body.senha) {
            if (cliente_Origem.saldo >= req.body.valor) {
                cliente_Origem.saldo -= req.body.valor;
                cliente_Destino.saldo += req.body.valor;

                //registra a transferência no banco de dados
                banco.transferencias.push({
                    data: data(),
                    numero_conta_origem: req.body.numero_conta_origem,
                    numero_conta_destino: req.body.numero_conta_destino,
                    valor: req.body.valor
                });
                res.status(200);
                res.json({ mensagem: "Transferência realizada com sucesso!" });
            } else {
                res.status(400);
                res.json({ mensagem: "Saldo insuficiente para transferência." });
            }
        } else {
            res.status(400);
            res.json({ mensagem: "Senha inválida" });
        }
    } else {
        res.status(400);
        res.json({ mensagem: "Número da conta de origem ou de destisto inválida" });
    }
}
function saldo(req, res) {
    if (req.query.numero_conta && req.query.senha) {
        const cliente = banco.contas.find((n) => n.numero === req.query.numero_conta);
        if (cliente) {
            if (cliente.usuarios.senha === req.query.senha) {
                res.status(200);
                res.json({ Saldo: cliente.saldo });
            } else {
                res.status(400);
                res.json({ mensagem: "Senha incorreta" });
            }
        } else {
            res.status(400);
            res.json({ mensagem: "Cliente não localizado" });
        }

    } else {
        res.status(400);
        res.json({ mensagem: "Parametro conta ou senha não informado" });
    }
}
function extrato(req, res) {
    if (req.query.numero_conta && req.query.senha) {
        const cliente = banco.contas.find((n) => n.numero === req.query.numero_conta);

        if (cliente) {
            if (cliente.usuarios.senha === req.query.senha) {
                const depositos = banco.depositos.filter((n) => n.numero_conta === cliente.numero);
                const saques = banco.saques.filter((n) => n.numero_conta === cliente.numero);
                const transferenciasEnviadas = banco.transferencias.filter((n) => n.numero_conta_origem === cliente.numero);
                const transferenciasRecebidas = banco.transferencias.filter((n) => n.numero_conta_destino === cliente.numero);

                res.status(200);
                res.json({ depositos: depositos, saques: saques, transferenciasEnviadas: transferenciasEnviadas, transferenciasRecebidas: transferenciasRecebidas });

            } else {
                res.status(400);
                res.json({ mensagem: "Senha incorreta" });
            }
        } else {
            res.status(400);
            res.json({ mensagem: "Cliente não localizado" });
        }
    } else {
        res.json({ mensagem: "Parametro número da conta ou senha não informado" });
    }
}

module.exports = {
    listarContas,
    criarConta,
    atualizarContaCliente,
    excluirConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato,
};
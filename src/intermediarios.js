function logarRequisicao(req, res, next){
    console.log(req.method,  req.url);
    console.log("O corpo da mensagem é: ", req.body);
    
    next();
}
function travaDeSenha(req, res, next){
    console.log("Minha requisição: ", req.query);
    if(req.query.senha === "123"){
        next();
    }else{
        res.status(401);
        res.json({erro: "Senha incorreta"});
    }
}

module.exports = { logarRequisicao, travaDeSenha};
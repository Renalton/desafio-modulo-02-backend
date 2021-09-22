const app = require('./servidor');
const rotas = require("./rotas");
const {logarRequisicao, travaDeSenha} = require("./intermediarios");


//app.use(logarRequisicao);
//app.use(travaDeSenha);
app.use(rotas);

app.listen(8000);
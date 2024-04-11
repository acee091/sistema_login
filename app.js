// bodyparser uma maneira de fazer requisições/validações
// express-session quando o usuario estiver logado poder 
// navegar entre as paginas sem precisar se logar novamente
// DOWNLOAD npm i express-session
const express = require('express')
const session = require('express-session')
const path = require ('path')
const app = express()

//require do bodyparser responsavel por capturar valores do form 
//em elementos capturaveis pelo node
const bodyParser = require("body-parser")
const mysql= require('mysql')

app.use(session({secret: "segredo"}))

app.use(express.static('public'))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/public'))

app.use(bodyParser.urlencoded({extended: false}))
app.unsubscribe(bodyParser.json())

function conectiondb(){
    var con = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'dblogin'
    })
    con.connect((err) =>{
        if(err){
            console.log("Error connecting to database...", err)
            return
        }
        console.log('Connection established')
    })
    return con;
}

app.get('/', (req, res) =>{
    var message = "";
    // Se tiver logado, ao voltar para a rota principal a sessão sera deslogada
    req.session.destroy();
    res.render('views/registro', {message: message})
})
app.get('/views/registro', (req, res)=>{
    res.redirect('../')
})

app.get('/views/home', (req, res) =>{
    //verifica se existe sessão ativa
    if(req.session.user){
        let con = conectiondb();
        let query2 = 'SELECT * FROM users WHERE email LIKE ?';
        con.query(query2, [req.session.user],
        function(err, results){
            res.render('views/home', {message: results})
        })
    }
    else{
        res.redirect("/")
    }
})

app.get('/views/login', (req, res)=>{
    let message = '';
    res.render('views/login', {message: message})
})

app.post('/register', (req, res)=>{
    let username = req.body.nome
    let pass = req.body.pwd
    let email = req.body.email
    let idade = req.body.idade

    let con = conectiondb();

    let queryConsulta = 'SELECT * FROM users WHERE email LIKE ?'
    con.query(queryConsulta, [email], function(err, results){
        //ja tem o email cadastrado
        if(results.length > 0){
            var message = 'E-mail já cadastrado';
            res.render('views/registro', {message: message})
        }else{
            var query = 'INSERT INTO users VALUES (DEFAULT, ?, ?, ?, ?)'
            con.query(query, [username, email, idade, pass], function(err, results){
                if(err){
                    throw err;
                } else{
                    console.log('Usuário adicionado com email' + email)
                    var message = "ok"
                    res.render('views/registro', {message: message})
                }
            });
        }
    });
});

app.post('/log', function(req, res){
    let email = req.body.email
    let pass = req.body.pass

    let con = conectiondb()
    let query = 'SELECT * FROM users WHERE pass = ? AND email LIKE ?'

    con.query(query, [pass, email], function(err, results){
        if(results.length > 0){
            req.session.user = email // seção de identificação
            console.log('Login efetuado com sucesso!')
            res.render('views/home', {message: results})
        } else{
             let message = "Login incorreto"
             res.render('views/login', {message: message})
        }
    })
})

app.listen(8081, () => console.log(`App listening on port!`))
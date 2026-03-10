const express = require("express");
const http = require("http");
const session = require("express-session");
const {Server} = require("socket.io");
const db = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(session({
secret:"secretkey",
resave:false,
saveUninitialized:true
}));

app.use(express.static("public"));

/* LOGIN */
app.post("/login",(req,res)=>{

const {email,password}=req.body;

const sql="SELECT * FROM users WHERE email=? AND password=?";

db.query(sql,[email,password],(err,result)=>{

if(result.length>0){
req.session.user=email;
res.send("success");
}
else{
res.send("Invalid Email or Password");
}

});

});

/* REGISTER */
app.post("/register",(req,res)=>{

const {name,email,password}=req.body;

const sql="INSERT INTO users(name,email,password) VALUES(?,?,?)";

db.query(sql,[name,email,password],err=>{

if(err) res.send("Registration Failed");
else res.send("Registration Successful");

});

});

/* AUTH CHECK */
function checkLogin(req,res,next){

if(req.session.user) next();
else res.redirect("/login.html");

}

/* HOME PAGE */
app.get("/",checkLogin,(req,res)=>{

res.sendFile(__dirname+"/public/index.html");

});

/* EVENT REGISTRATION */
app.post("/registerEvent",(req,res)=>{

const {name,message}=req.body;

const email=req.session.user;

const sql="INSERT INTO registrations (user_name,user_email,event_message) VALUES (?,?,?)";

db.query(sql,[name,email,message],(err,result)=>{

if(err){
console.log(err);
return res.send("Registration Failed");
}

res.send("Registered Successfully");

});

});


/* HISTORY */
app.get("/history",checkLogin,(req,res)=>{

const email = req.session.user;

const sql="SELECT user_name,event_message,registered_at FROM registrations WHERE user_email=?";

db.query(sql,[email],(err,result)=>{

if(err){
console.log(err);
return res.send("Database Error");
}

res.json(result);

});

});
/* SOCKET.IO */
io.on("connection",(socket)=>{

console.log("User Connected");

socket.on("newEvent",(data)=>{

const sql="INSERT INTO events(message) VALUES (?)";

db.query(sql,[data],()=>{

io.emit("syncEvent",data);

});

});

});

server.listen(3000,()=>{
console.log("Server running http://localhost:3000/login.html");
});
var http = require('http');
var fs = require('fs');

var player1Name;
var player2Name;
var player1Move;
var player2Move;
var movesLent = 0;
//var moves = [];

var app = http.createServer(function (request, response) {
    fs.readFile("client.html", 'utf-8', function (error, data) {
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.write(data);
        response.end();
    });
}).listen(1337);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
    socket.on('message_to_server', function (data) {
        if(movesLent == 0){
            console.log(data);
            addP1Move(data);
            movesLent++;
        }else if(movesLent == 1){
            console.log(data);
            addP2Move(data);
            movesLent++;
            calc_win();
            clear();
        }
//        io.sockets.emit("message_to_client", {
//            message: data["message"]
//        });
    });
});

function clear(){
    movesLent = 0;
            player1Move = null;
            player1Name = null;
            player2Move= null;
            player2Name = null;
            
}

function addP1Move(data){
    var move = data["message"];
    player1Name = data["username"];
    console.log("move: " + move + " name: "+ player1Name);
    if(move == 0){
        player1Move = "r";
    }else if(move == 1 || move == 2){
        player1Move = "s";
    }else{
       player1Move = "p";
    }
    console.log("move letter: " + player1Move);
}

function addP2Move(data){
    var move = data["message"];
    player2Name = data["username"];
    console.log("move: " + move + " name: "+ player2Name);
    if(move == 0){
        player2Move = "r";
    }else if(move == 1 || move == 2){
        player2Move = "s";
    }else{
       player2Move = "p";
    }
    console.log("move letter: " + player2Move);
}

/*
function parse_and_add_move(data){
    var move = data["message"];
    var name = data["username"];
    console.log("move: " + move + " name: "+ name);
    if(move.val == 0){
        moves[name] = "r";
    }else if(move.val > 0 && move.val < 3){
        moves[name] = "s";
    }else{
        moves[name] = "p";
    }
}
*/

function calc_win(){
    var winner = "The winner is: "
    
    
    if(player1Move == "r" && player2Move == "s"){
        winner = player1Name;
    }else if(player1Move == "r" && player2Move == "p"){
        winner = player2Name;
    }else if(player1Move == "p" && player2Move == "s"){
        winner = player2Name;
    }else if(player1Move == "p" && player2Move == "r"){
        winner = player2Name;
    }else if(player1Move == "s" && player2Move == "r"){
        winner = player2Name;
    }else if(player1Move == "s" && player2Move == "p"){
        winner = player1Name;
    }
    
    if(player1Move == player2Move){
        winner = "It's a tie!"
        send_to_clients(winner);
    }else{
        send_to_clients(winner + " wins!");
    }
}

function send_to_clients(data){
    io.sockets.emit("message_to_client", {
       //message: data["message"] 
        message: data
    });
}
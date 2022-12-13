const express = require('express') // la récupération d'express
var http = require("http");
var server = http.createServer(function(req, res){
    res.writeHead(200, {"Content-Type" : "text/html"});
    res.end("hello <h1> world </h1>")
});

app.use(express.json())

// server.listen(3000)
app.listen(8000, () => { // ouverture du serveur sur le port 3000
    console.log("Serveur à l'écoute") // afficher un message dans la console.
})
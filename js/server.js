const express = require('express');// la récupération d'express
const mariadb = require('mariadb');
var cors = require('cors')
require('dotenv').config()

const pool = mariadb.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD
    });
const app = express()
app.use(express.json())
app.use(cors()) // évite les erreurs xml

app.get('/utilisateur', async(req, res)=>{
    let conn = await pool.getConnection()
    let resultat = await conn.query('SELECT * FROM utilisateur')
    res.status(200).json(resultat)
    conn.release()


})

app.post('/utilisateur', async(req, res)=>{
    console.log("connexion bdd");
    let conn = await pool.getConnection()
    console.log("créer la requete")
    await conn.query('INSERT INTO utilisateur(nom, mail, adresse, mdp) VALUES (?,?,?,?)',[req.body.nom,req.body.mail,req.body.adresse, req.body.mdp])
    res.status(200).json({message: "Utilisateur créer"})
    conn.release()

})

app.get('/produits', async(req, res)=>{
    console.log("test envoie")
    let conn = await pool.getConnection()
    let resultat = await conn.query('SELECT * FROM produits')
    res.status(200).json(resultat)
    conn.release()

})


// server.listen(3000)
app.listen(8000, () => { // ouverture du serveur sur le port 3000
    console.log("Serveur à l'écoute") // afficher un message dans la console.
})
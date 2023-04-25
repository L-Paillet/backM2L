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
    const conn = await pool.getConnection();
    let resultat = await conn.query('SELECT * FROM utilisateur')
    res.status(200).json(resultat)
    conn.release();
    
})

//création d'utilisateur
app.post('/utilisateur', async(req, res)=>{
    console.log("connexion bdd");
    
    const conn = await pool.getConnection()
    console.log("créer la requete")
    await conn.query('INSERT INTO utilisateur(nom, mail, adresse, mdp) VALUES (?,?,?,?)',[req.body.nom,req.body.mail,req.body.adresse, req.body.mdp])
    res.status(200).json({message: "Utilisateur créer"})
    conn.release();

})
// Ajout produit
app.post('/produits', async (req, res) =>{
	const conn = await pool.getConnection()

	await conn.query('Insert INTO produits(photo, description, nom, prix) VALUES (?,?,?,?)', [req.body.photo, req.body.description, req.body.nom, req.body.prix])

	res.status(200).json({message: "Produit ajouté"})
	conn.release();
})

// connexion
app.post('/login', async(req, res) =>{

    const login = await pool.getConnection()
    // Récupération des informations de connexion de l'utilisateur dans la requête
    const username = req.body.username;
    const password = req.body.password;
    const jwt = require('jsonwebtoken');
        // Vérification des informations de connexion de l'utilisateur dans la base de données SQL
        const resultat = await
         login.query(`SELECT * FROM utilisateur WHERE nom = '${username}' AND mdp = '${password}'`);
        console.log(!resultat[0]);
        if (!resultat[0]) {
        login.release();

        return res.status(401).send({ error: "Mauvais login" });
        }
        else{

        //console.log(resultat);
  
    // Si les informations sont correctes, génération d'un jeton de connexion
    const token = jwt.sign({ userId: resultat[0].id }, process.env.JWT_SECRET);
    // Envoi du jeton de connexion en réponse
    login.release();
    console.log(token);
    res.status(200).send({ token })
}

})

//liste les produits
app.get('/produits', async(req, res)=>{
    console.log("test envoie")
    const conn = await pool.getConnection()
    let resultat = await conn.query('SELECT * FROM produits')
    res.status(200).json(resultat)
    conn.release();

})


// server.listen(8000)
app.listen(8000, () => { // ouverture du serveur sur le port 8000
    console.log("Serveur à l'écoute") // afficher un message dans la console.
})
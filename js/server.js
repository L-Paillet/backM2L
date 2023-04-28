const express = require('express');// la récupération d'express
const mariadb = require('mariadb');
var cors = require('cors');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config();


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
// app.post('/login', async(req, res) =>{

//     const login = await pool.getConnection()
//     // Récupération des informations de connexion de l'utilisateur dans la requête
//     const username = req.body.username;
//     const password = req.body.password;
//     const jwt = require('jsonwebtoken');
//         // Vérification des informations de connexion de l'utilisateur dans la base de données SQL
//         const resultat = await
//          login.query(`SELECT * FROM utilisateur WHERE nom = '${username}' AND mdp = '${password}'`);
//         console.log(!resultat[0]);
//         if (!resultat[0]) {
//         login.release();

//         return res.status(401).send({ error: "Mauvais login" });
//         }
//         else{

//         //console.log(resultat);
  
//     // Si les informations sont correctes, génération d'un jeton de connexion
//     const token = jwt.sign({ userId: resultat[0].id }, process.env.JWT_SECRET);
//     // Envoi du jeton de connexion en réponse
//     login.release();
//     console.log(token);
//     res.status(200).send({ token })
// }

// })

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Veuillez saisir une adresse e-mail et un mot de passe.' });
    }
    try {
      const conn = await pool.getConnection();
      const rows = await conn.query('SELECT * FROM utilisateur WHERE nom = ?', [username]);
      conn.release();
      if (rows.length > 0) {
        const user = rows[0];
        console.log(password,  user.password)
        console.log(await bcrypt.compare(password, user.password));
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          const token = jwt.sign({ sub: user.id }, 'secret_key');
          return res.json({ message: 'Connexion réussie !',  token });
        } else {
          return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect.' });
        }
      } else {
        return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
    }
  })
  .post('/signup', async (req, res) => {
    const { email, password } = req.body;
  
    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
  
    try {
      const connection = await pool.getConnection();
      await connection.execute(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword]
      );
      connection.release();
      res.json({ success: true, message: 'User created successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error creating user.' });
    }
  });

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
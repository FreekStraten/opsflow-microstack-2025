var express = require('express');
var router = express.Router();

// Haal het 'db' object uit onze database service
const { db } = require("../services/database");

/* GET users listing. */
router.get('/', async function(req, res, next) {
  // Haal alle documenten op uit de collectie 'users'
  let users = await db.collection('users').find().toArray();
  res.json(users);
});

/* POST een nieuwe user */
router.post('/', function(req, res, next){
  // Voeg een nieuw document toe aan de 'users' collectie met de inhoud van de request body
  db.collection('users').insertOne(req.body)
      .then((user) => res.status(201).json({ "id": user.insertedId }))
      .catch(err => res.status(500).json(err));
});

module.exports = router;

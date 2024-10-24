const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))


//All your code goes here
let activeSessions={}

server.get('/newgame', (req, res) => {
    let newID = uuid.v4()
    let newgame = {
        wordToGuess: "spike",
        guesses: [],
        wrongLetters: [],
        closeLetters: [],
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: false
    }
    activeSessions[newID] = newgame
    res.status(201)
    res.send({ sessionID: newID })
})
server.get('/gamestate', (req, res) => {
   const sessionID = req.query.sessionID
   const gamestate = activeSessions[sessionID]
   if(!gamestate){
       return res.status(404).send({error: "Invalid session ID"})
   }
   res.status(200).send(gamestate)


})



//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;
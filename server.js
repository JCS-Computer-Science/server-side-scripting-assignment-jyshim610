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
    let ID = req.query.sessionID
    if(!ID){
        res.status(400)
        res.send({error: "Invalid ID"})
    }else{
        if(activeSessions[ID]){
            res.status(200)
            res.send({gamestate: activeSessions[ID]})
        }else{
            res.status(404)
            res.send({error: "game does not exist"})
        }
    }
 })
server.post('/guess', (req, res) => {

})


//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;
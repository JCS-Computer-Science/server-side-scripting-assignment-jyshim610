const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))
//All your code goes here
let activeSessions={}

server.get('/newgame', (req, res) => {
    let wordToGuess = req.query.answer || "spike"
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
    res.status(201).send({ sessionID: newID })
})
server.get('/gamestate', (req, res) => {
    let ID = req.query.sessionID
    if(!ID){
        res.status(400)
        res.send({error: "Invalid ID"})
    }else{
        if(activeSessions[ID]){
            res.status(200).send({gameState: activeSessions[ID]})
        }else{
            res.status(404).send({error: "game does not exist"})
        }
    }
 })
server.post('/guess', (req, res) => {
    let ID = req.body.sessionID
    let guess = req.body.guess
    if(!ID){
        return res.status(400).send({error: "Session ID is required"})
    }
    if(!activeSessions[ID]){
        return res.status(404).send({error: "Game session not found  "})
    }
    if(!guess){
        return res.status(400).send({error: "Guess is required"})
    }
    if (guess.length !== 5){
        return res.status(400).send({error: "Guess must be 5 letters long"})
    }
    if (![...guess].every(letter => letter.toLowerCase() >= 'a' && letter.toLowerCase() <= 'z')) {
        return res.status(400).send({ error: "Guess can only contain alphabet letters" });
    }
    let game = activeSessions[ID]
    if(game.gameOver){
        return res.status(400).send({error: "Game is over"})
    }
    let rightLetters = []
    let closeLetters = []
    let wrongLetters = []
    for (let i = 0; i < array.length; i++) {
        let guessedLetter = guess[i]
        if(game.wordToGuess[i] === guessedLetter){
            rightLetters.push(guessedLetter)
        }else if(game.wordToGuess.includes(guessedLetter)){
            closeLetters.push(guessedLetter)
        }else{
            wrongLetters.push(guessedLetter)
        }
    }
    
})
server.delete('/reset', (req,res) => {
    let ID = req.body.sessionID
    if(!ID){
        res.status(400).send({error: "No session ID"})
    }else if(!ID != !activeSessions){
        res.status(404).send({error: "Session ID does not match with the active session"})
    }


})



//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;
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
    if(!wordToGuess){
        wordToGuess = undefined
    }
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
    return res.status(201).send({ sessionID: newID })
})
server.get('/gamestate', (req, res) => {
    let ID = req.query.sessionID
    if(!ID){
        res.status(400).send({error: "Invalid ID"})
    }
    if(activeSessions[ID]){
        let gameState = activeSessions[ID]
        res.status(200).send({gameState: activeSessions[ID]})
    }else{
        res.status(404).send({error: "game does not exist"})
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

    game.guesses.push(guess)

    for (let i = 0; i < rightLetters.length; i++) {
        let letter = rightLetters[i]
        let found = false
        for (let j = 0; j < game.rightLetters.length; j++) {
            if(game.rightLetters[j] === letter){
                found = true
                break
            }
            
        }
        if(!found){
            game.rightLetters.push(letter)
        } 
    }
    for (let i = 0; i < closeLetters.length; i++) {
        let letter = closeLetters[i]
        let found = false
        for (let j = 0; j < game.closeLetters.length; j++) {
            if(game.closeLetters[j] === letter){
                found = true
                break
            }  
        }
        if(!found){
            game.closeLetters.push(letter)
        }   
    }for (let i = 0; i < wrongLetters.length; i++) {
        let letter = wrongLetters[i]
        let found = false
        for (let j = 0; j < game.wrongLetters.length; j++) {
            if(game.wrongLetters[j] === letter){
                found = true
                break
            }
            
        }
        if(!found){
            game.wrongLetters.push(letter)
        }
    }
    game.remainingGuesses--

    if(guess === game.wordToGuess){
        game.gameOver = true
        return res.status(200).send({
            message: "You won!",
            gameState: game         
        })
    }else if(game.remainingGuesses === 0){
        game.gameOver = true
        return res.status(200).send({
            message: "You lost!",
            gameState: game
        })
    }
    return res.status(201).send({
        message: "guess recorded",
        gameState: game
    })
})
server.delete('/reset', (req,res) => {
    let ID = req.query.sessionID
    if(!ID){
        return res.status(400).send({error: "No session ID"})
    }
    if(!activeSessions[ID]){
        return res.status(404).send({error: "Session ID does not match with the active session"})
    }
    activeSessions[ID] = {
        wordToGuess: undefined,
        guesses: [],
        wrongLetters: [],
        closeLetters: [],
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: false
    }
    res.status(200).send({gameState: activeSessions[ID]})
})
server.delete('/delete', (req,res) => {
    let ID = req.query.sessionID
    if(!ID){
        return res.status(400).send({error: "Session is required"})
    }
    if(!activeSessions[ID]){
        return res.status(404).send({error: "Game session not found"})
    }
    delete activeSessions[ID]

    res.status(204).send()
})



//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;

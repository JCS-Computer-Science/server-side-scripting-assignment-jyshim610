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
        wordToGuess: wordToGuess,
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
        res.status(400).send({error: "Invalid ID"})
    }
    let gameState = activeSessions[ID]
    if(!gameState){
        res.status(404).send({error: "Game session not found"})
    }
    if(!gameState.gameOver){
        gameState.wordToGuess = "spike"
    }
    let responseState = {
        wordToGuess: gameState.gameOver ? gameState.wordToGuess: "spike",
        guesses: gameState.guesses,
        wrongLetters:gameState.wrongLetters,
        closeLetters: gameState.closeLetters,
        rightLetters: gameState.rightLetters,
        remainingGuesses: gameState.remainingGuesses,
        gameOver: gameState.gameOver
    }
    res.status(200).send({gameState: responseState})
 })
 server.post('/guess', (req, res) => {
    let ID = req.body.sessionID;
    let guess = req.body.guess;

    if (!ID) {
        return res.status(400).send({ error: "Session ID is required" });
    }
    if (!activeSessions[ID]) {
        return res.status(404).send({ error: "Game session not found" });
    }
    if (!guess) {
        return res.status(400).send({ error: "Guess is required" });
    }
    if (guess.length !== 5) {
        return res.status(400).send({ error: "Guess must be 5 letters long" });
    }
    if (![...guess].every(letter => letter.toLowerCase() >= 'a' && letter.toLowerCase() <= 'z')) {
        return res.status(400).send({ error: "Guess can only contain alphabet letters" });
    }

    let game = activeSessions[ID];
    if (game.gameOver) {
        return res.status(400).send({ error: "Game is over" });
    }

    let guessResult = [];
    let rightLetters = [];
    let closeLetters = [];
    let wrongLetters = [];

    for (let i = 0; i < 5; i++) {
        let letter = guess[i];
        let result = "WRONG";

        if (game.wordToGuess[i] === letter) {
            result = "RIGHT";
            rightLetters.push(letter);
            console.log(rightLetters);
        } else if (game.wordToGuess.includes(letter)) {
            result = "CLOSE";
            closeLetters.push(letter);
        } else {
            wrongLetters.push(letter);
        }
        guessResult.push({ value: letter, result: result });
    }

    game.guesses.push(guessResult);

    for (let i = 0; i < rightLetters.length; i++) {
        if (!game.rightLetters.includes(rightLetters[i])) {
            game.rightLetters.push(rightLetters[i]);
        }
    }

    for (let i = 0; i < closeLetters.length; i++) {
        if (!game.closeLetters.includes(closeLetters[i]) && !game.closeLetters.includes(closeLetters)) {
            game.closeLetters.push(closeLetters[i]);
        }
    }
    game.closeLetters = game.closeLetters.filter(letter => !game.rightLetters.includes(letter));

    for (let i = 0; i < wrongLetters.length; i++) {
        if (!game.wrongLetters.includes(wrongLetters[i])) {
            game.wrongLetters.push(wrongLetters[i]);
        }
    }

    game.remainingGuesses--;

    if (guess === game.wordToGuess) {
        game.gameOver = true;
        return res.status(200).send({
            message: "You won!",
            gameState: {
                wordToGuess: game.wordToGuess,
                guesses: game.guesses,
                wrongLetters: game.wrongLetters,
                closeLetters: game.closeLetters,
                rightLetters: game.rightLetters,
                remainingGuesses: game.remainingGuesses,
                gameOver: game.gameOver
            }
        });
    } else if (game.remainingGuesses === 0) {
        game.gameOver = true;
        return res.status(200).send({
            message: "You lost!",
            gameState: {
                wordToGuess: game.wordToGuess,
                guesses: game.guesses,
                wrongLetters: game.wrongLetters,
                closeLetters: game.closeLetters,
                rightLetters: game.rightLetters,
                remainingGuesses: game.remainingGuesses,
                gameOver: game.gameOver
            }
        });
    }

    res.status(201).send({
        message: "Guess recorded",
        gameState: {
            wordToGuess: game.gameOver ? game.wordToGuess : "spike",
            guesses: game.guesses,
            wrongLetters: game.wrongLetters,
            closeLetters: game.closeLetters,
            rightLetters: game.rightLetters,
            remainingGuesses: game.remainingGuesses,
            gameOver: game.gameOver
        }
    });
    console.log(activeSessions);
});

server.delete('/reset', (req,res) => {
    let ID = req.query.sessionID
    if(!ID){
        res.status(400).send({error: "No session ID"})
    }
    if(!activeSessions[ID]){
        res.status(404).send({error: "Session ID does not match with the active session"})
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
        res.status(400).send({error: "Session is required"})
    }
    if(!activeSessions[ID]){
        res.status(404).send({error: "Game session not found"})
    }
    delete activeSessions[ID]

    res.status(204).send()
})





//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;

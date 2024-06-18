const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files

let buzzed = false;
let judgeExists = false;
let scores = {}; // Track scores of each username

io.on('connection', (socket) => {
    socket.on('registerJudge', () => {
        if (!judgeExists) {
            judgeExists = true;
            socket.emit('judgeRegistered', true);
        } else {
            socket.emit('judgeRegistered', false);
        }
    });
    
    socket.on('adjustScore', ({username, adjustment}) => {
        if (socket.judge) { // Ensure only the judge can adjust scores
            if (scores[username] !== undefined) {
                scores[username] += adjustment; // Adjust the score
                io.emit('updateScores', scores); // Update all clients with the new scores
            }
        }
    });

    socket.on('buzz', (username) => {
        if (!buzzed && !socket.judge) {
            buzzed = true;
            scores[username] = (scores[username] || 0) + 1; // Increment score
            io.emit('buzzResult', username);
            io.emit('freeze');
            io.emit('updateScores', scores);
        }
    });

    socket.on('reset', () => {
        if (socket.judge) {
            buzzed = false;
            io.emit('reset');
        }
    });

    socket.on('disconnect', () => {
        if (socket.judge) {
            judgeExists = false; // Allow another judge to register
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

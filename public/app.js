const socket = io();

let username = '';
let role = '';

document.getElementById('loginUser').addEventListener('click', () => {
    role = 'user';
    showMain();
});

document.getElementById('loginJudge').addEventListener('click', () => {
    socket.emit('registerJudge');
});

socket.on('judgeRegistered', (isJudge) => {
    if (isJudge) {
        role = 'judge';
        showMain(true);
    } else {
        alert('A judge has already been registered.');
    }
});

function showMain(isJudge = false) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('main').style.display = 'block';
    if (isJudge) {
        document.getElementById('reset').style.display = 'block';
    } else {
        document.getElementById('buzzer').disabled = false; // Users should be able to buzz
    }
}

document.getElementById('changeUsername').addEventListener('click', () => {
    username = document.getElementById('username').value.trim();
    if (username) {
        socket.emit('changeUsername', username);
    }
});

document.getElementById('buzzer').addEventListener('click', () => {
    if (role === 'user') {
        socket.emit('buzz', username);
    }
});

document.getElementById('reset').addEventListener('click', () => {
    if (role === 'judge') {
        socket.emit('reset');
    }
});

socket.on('buzzResult', (name) => {
    document.getElementById('result').textContent = `${name} buzzed first!`;
});

socket.on('freeze', () => {
    document.getElementById('buzzer').disabled = true;
});

socket.on('reset', () => {
    document.getElementById('result').textContent = '';
    document.getElementById('buzzer').disabled = false;
});

// Update the 'updateScores' event listener to include action buttons for the judge

socket.on('updateScores', (scores) => {
    const scoresTable = document.getElementById('scoresTable');
    scoresTable.innerHTML = '<tr><th>User</th><th>Score</th><th>Actions</th></tr>'; // Include Actions column

    Object.entries(scores).forEach(([user, score]) => {
        const row = scoresTable.insertRow(-1);
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2); // Cell for action buttons
        cell1.textContent = user;
        cell2.textContent = score;
        
        // Add buttons only if the client is the judge
        if (role === 'judge') {
            const addButton = document.createElement('button');
            addButton.textContent = '+';
            addButton.onclick = () => adjustScore(user, 1);
            const subtractButton = document.createElement('button');
            subtractButton.textContent = '-';
            subtractButton.onclick = () => adjustScore(user, -1);
            cell3.appendChild(addButton);
            cell3.appendChild(subtractButton);
        }
    });
});

// Function to emit score adjustment events
function adjustScore(username, adjustment) {
    socket.emit('adjustScore', {username, adjustment});
}


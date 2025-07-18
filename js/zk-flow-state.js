// ZK Flow State - Pipe Puzzle Core Logic
const BOARD_SIZE = 6;
const boardElement = document.getElementById('game-board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

// Tile types: 'empty', 'straight', 'curve', 'source', 'destination'
const tileTypes = {
    empty: { img: '', connects: [] },
    straight: { img: 'data:image/svg+xml;utf8,<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="0" width="6" height="38" fill="%23fff"/></svg>', connects: [[0,1],[2,3]] }, // up-down
    curve: { img: 'data:image/svg+xml;utf8,<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 0 V19 H38" stroke="white" stroke-width="6" fill="none"/></svg>', connects: [[0,2],[1,3]] }, // up-right
    source: { img: 'data:image/svg+xml;utf8,<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="19" cy="19" r="14" fill="%231bbd7e"/><circle cx="19" cy="19" r="9" fill="white"/></svg>', connects: [[1]] },
    destination: { img: 'data:image/svg+xml;utf8,<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="26" height="26" rx="6" fill="%23e6c700"/><rect x="13" y="13" width="12" height="12" rx="3" fill="white"/></svg>', connects: [[3]] }
};

// Directions: 0=up, 1=right, 2=down, 3=left
const DIRS = [ [-1,0], [0,1], [1,0], [0,-1] ];

let board = [];
let tileObjs = [];

function createEmptyBoard() {
    board = [];
    tileObjs = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        const row = [];
        const rowObjs = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            row.push({ type: 'empty', rot: 0 });
            rowObjs.push(null);
        }
        board.push(row);
        tileObjs.push(rowObjs);
    }
}

function setupLevel() {
    createEmptyBoard();
    // Place source and destination
    board[0][0] = { type: 'source', rot: 1 };
    board[BOARD_SIZE-1][BOARD_SIZE-1] = { type: 'destination', rot: 3 };
    // Place some pre-set tiles
    board[0][1] = { type: 'straight', rot: 1 };
    board[1][1] = { type: 'curve', rot: 2 };
    board[1][2] = { type: 'straight', rot: 0 };
    board[2][2] = { type: 'curve', rot: 1 };
    // Rest are empty (player can place/rotate)
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const tile = board[r][c];
            const div = document.createElement('div');
            div.className = 'tile';
            if (tile.type === 'source') div.classList.add('source');
            if (tile.type === 'destination') div.classList.add('destination');
            if (tileTypes[tile.type].img) {
                const img = document.createElement('img');
                img.src = tileTypes[tile.type].img;
                img.style.transform = `rotate(${tile.rot * 90}deg)`;
                div.appendChild(img);
            }
            div.onclick = () => onTileClick(r, c);
            boardElement.appendChild(div);
            tileObjs[r][c] = div;
        }
    }
}

function onTileClick(r, c) {
    const tile = board[r][c];
    if (tile.type === 'empty') {
        // Place a straight tile by default
        board[r][c] = { type: 'straight', rot: 0 };
    } else if (tile.type === 'straight' || tile.type === 'curve') {
        // Rotate tile
        board[r][c].rot = (board[r][c].rot + 1) % 4;
    }
    renderBoard();
    checkWin();
}

function checkWin() {
    // Try to follow the path from source to destination
    let visited = Array.from({length: BOARD_SIZE}, () => Array(BOARD_SIZE).fill(false));
    let queue = [{ r:0, c:0, dir:1 }]; // Start from source, facing right
    while (queue.length) {
        const {r, c, dir} = queue.shift();
        if (visited[r][c]) continue;
        visited[r][c] = true;
        const tile = board[r][c];
        if (tile.type === 'destination') {
            statusElement.textContent = 'Success! Proof path completed!';
            statusElement.style.color = '#1bbd7e';
            return true;
        }
        // Get tile exits
        let exits = getTileExits(tile, dir);
        for (let ex of exits) {
            let nr = r + DIRS[ex][0];
            let nc = c + DIRS[ex][1];
            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
            if (!visited[nr][nc]) {
                queue.push({ r: nr, c: nc, dir: ex });
            }
        }
    }
    statusElement.textContent = 'Connect the prover to the verifier!';
    statusElement.style.color = '#e6c700';
    return false;
}

function getTileExits(tile, incomingDir) {
    // incomingDir: direction from which the flow enters this tile
    // returns: array of directions it can go out
    if (tile.type === 'empty') return [];
    if (tile.type === 'source') return [tile.rot];
    if (tile.type === 'destination') return [];
    if (tile.type === 'straight') {
        // 0/2: up-down, 1/3: left-right
        if (tile.rot % 2 === 0) {
            if (incomingDir === 0) return [2];
            if (incomingDir === 2) return [0];
        } else {
            if (incomingDir === 1) return [3];
            if (incomingDir === 3) return [1];
        }
    }
    if (tile.type === 'curve') {
        // rot 0: up-right, 1: right-down, 2: down-left, 3: left-up
        if (tile.rot === 0 && incomingDir === 0) return [1];
        if (tile.rot === 0 && incomingDir === 1) return [0];
        if (tile.rot === 1 && incomingDir === 1) return [2];
        if (tile.rot === 1 && incomingDir === 2) return [1];
        if (tile.rot === 2 && incomingDir === 2) return [3];
        if (tile.rot === 2 && incomingDir === 3) return [2];
        if (tile.rot === 3 && incomingDir === 3) return [0];
        if (tile.rot === 3 && incomingDir === 0) return [3];
    }
    return [];
}

resetBtn.onclick = () => {
    setupLevel();
    renderBoard();
    statusElement.textContent = 'Connect the prover to the verifier!';
    statusElement.style.color = '#e6c700';
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupLevel();
    renderBoard();
    statusElement.textContent = 'Connect the prover to the verifier!';
    statusElement.style.color = '#e6c700';
});

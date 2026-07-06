// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

let playerY = canvas.height / 2 - paddleHeight / 2;
let computerY = canvas.height / 2 - paddleHeight / 2;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 4;
let ballSpeedY = 4;

let playerScore = 0;
let computerScore = 0;

const maxScore = 5;
let gameOver = false;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle position
function updatePlayerPaddle() {
    const speed = 6;
    
    if (keys['ArrowUp']) {
        playerY = Math.max(0, playerY - speed);
    }
    if (keys['ArrowDown']) {
        playerY = Math.min(canvas.height - paddleHeight, playerY + speed);
    }
    
    // Also allow mouse control
    const mouseSpeed = 0.3;
    if (mouseY < playerY) {
        playerY = Math.max(0, playerY - mouseSpeed);
    } else if (mouseY > playerY + paddleHeight) {
        playerY = Math.min(canvas.height - paddleHeight, playerY + mouseSpeed);
    }
}

// Update computer paddle position (AI)
function updateComputerPaddle() {
    const speed = 3.5;
    const computerCenter = computerY + paddleHeight / 2;
    
    if (computerCenter < ballY - 35) {
        computerY = Math.min(canvas.height - paddleHeight, computerY + speed);
    } else if (computerCenter > ballY + 35) {
        computerY = Math.max(0, computerY - speed);
    }
}

// Update ball position
function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    // Collision with top and bottom walls
    if (ballY - ballSize <= 0 || ballY + ballSize >= canvas.height) {
        ballSpeedY = -ballSpeedY;
        ballY = Math.max(ballSize, Math.min(canvas.height - ballSize, ballY));
    }
    
    // Collision with paddles
    // Player paddle (left side)
    if (ballX - ballSize <= paddleWidth &&
        ballY >= playerY &&
        ballY <= playerY + paddleHeight &&
        ballSpeedX < 0) {
        ballSpeedX = -ballSpeedX;
        ballX = paddleWidth + ballSize;
        
        // Add spin based on where ball hits paddle
        const deltaY = ballY - (playerY + paddleHeight / 2);
        ballSpeedY += deltaY * 0.1;
    }
    
    // Computer paddle (right side)
    if (ballX + ballSize >= canvas.width - paddleWidth &&
        ballY >= computerY &&
        ballY <= computerY + paddleHeight &&
        ballSpeedX > 0) {
        ballSpeedX = -ballSpeedX;
        ballX = canvas.width - paddleWidth - ballSize;
        
        // Add spin based on where ball hits paddle
        const deltaY = ballY - (computerY + paddleHeight / 2);
        ballSpeedY += deltaY * 0.1;
    }
    
    // Ball out of bounds (scoring)
    if (ballX < 0) {
        computerScore++;
        resetBall();
    } else if (ballX > canvas.width) {
        playerScore++;
        resetBall();
    }
    
    // Check for game over
    if (playerScore >= maxScore || computerScore >= maxScore) {
        gameOver = true;
    }
}

// Reset ball to center
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 4;
    ballSpeedY = (Math.random() - 0.5) * 4;
}

// Draw game elements
function draw() {
    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = '#667eea';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(0, playerY, paddleWidth, paddleHeight);
    
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(canvas.width - paddleWidth, computerY, paddleWidth, paddleHeight);
    
    // Draw ball with glow
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw game over message
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        const winner = playerScore >= maxScore ? 'You Win!' : 'Computer Wins!';
        ctx.fillText(winner, canvas.width / 2, canvas.height / 2);
        
        ctx.font = '20px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Click Reset Game to play again', canvas.width / 2, canvas.height / 2 + 40);
    }
}

// Update scores display
function updateScores() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Game loop
function gameLoop() {
    if (!gameOver) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
    
    draw();
    updateScores();
    requestAnimationFrame(gameLoop);
}

// Reset game
function resetGame() {
    playerScore = 0;
    computerScore = 0;
    gameOver = false;
    playerY = canvas.height / 2 - paddleHeight / 2;
    computerY = canvas.height / 2 - paddleHeight / 2;
    resetBall();
    updateScores();
}

// Start the game
gameLoop();
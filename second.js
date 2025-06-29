let difficulty = "medium"; // default
let goalScored = false;
let goalTimer = 0;

let isPaused = false; //for pausing the game 


// variable used in count down function
let countdown = 0;
let countdownInterval = null;
let isCountingDown = false;



const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = { x: 50, y: 175, width: 20, height: 50, color: 'blue', score: 0 };
const computer = { x: 730, y: 175, width: 20, height: 50, color: 'red', score: 0 };
const ball = {
  x: 390,
  y: 190,
  radius: 10,
  dx: 3,
  dy: 3,
  baseSpeed: 5,
  speedMultiplier: 1.0,
  maxSpeed: 7,
  minSpeed: 4,
};



const goalLeft = { x: 0, y: 150, width: 10, height: 100 };
const goalRight = { x: 790, y: 150, width: 10, height: 100 };

let keys = {};
let isGameOver = false;





// let matchStats = JSON.parse(localStorage.getItem("matchStats")) || {
//     easy: { wins: 0, losses: 0, draws: 0 },
//     medium: { wins: 0, losses: 0, draws: 0 },
//     hard: { wins: 0, losses: 0, draws: 0 }
//   };
  



function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;
    ball.speedMultiplier = 1.0;
  
    countdown = 3;
    isCountingDown = true;
  
    clearInterval(countdownInterval);
  
    countdownInterval = setInterval(() => {
      countdown--;
  
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        isCountingDown = false;
  
        // Generate a random angle but avoid too flat or too vertical
        let angle;
        do {
          angle = Math.random() * Math.PI * 2; // 0 to 2π radians
        } while (Math.abs(Math.cos(angle)) < 0.5 || Math.abs(Math.sin(angle)) < 0.3);
  
        const speed = ball.baseSpeed * ball.speedMultiplier;
        ball.dx = Math.cos(angle) * speed;
        ball.dy = Math.sin(angle) * speed;
      }
    }, 1000);
  }
  
  



function drawRect(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  }
  
  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  }

    

function update() {
    // Move player
    if (keys['ArrowUp'] && player.y > 0) player.y -= 5;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += 5;
  

  const aiCenter = computer.y + computer.height / 2;
  
  // Use difficulty to set AI behavior
  let aiMaxSpeed, aiReactionX, aiMissChance;
  
  if (difficulty === "easy") {
    aiMaxSpeed = 3;
    aiReactionX = 600;
    aiMissChance = 0.3;
  } else if (difficulty === "hard") {
    aiMaxSpeed = 5;
    aiReactionX = 350;
    aiMissChance = 0.08;
  } else {
    // medium (default)
    aiMaxSpeed = 4;
    aiReactionX = 430;
    aiMissChance = 0.15;
  }
  
  const ballApproaching = ball.dx > 0 && ball.x > aiReactionX;
  let distanceY = ball.y - aiCenter;
  
  // Introduce AI error
  if (Math.random() < aiMissChance) {
    distanceY += Math.random() * 80 - 40; // Imperfection
  }
  
  let aiSpeed = Math.min(aiMaxSpeed, Math.abs(distanceY) * 0.15);
  
  if (ballApproaching && Math.abs(distanceY) > 5) {
    if (distanceY < 0 && computer.y > 0) {
      computer.y -= aiSpeed;
    } else if (distanceY > 0 && computer.y + computer.height < canvas.height) {
      computer.y += aiSpeed;
    }
  }
  
  
  if (!isGameOver && (player.score === 2 || computer.score === 2)) {
    isGameOver = true;
  
    const currentLevel = difficulty;
  
    if (player.score === 2) {
      matchStats[currentLevel].wins++;
    } else if (computer.score === 2) {
      matchStats[currentLevel].losses++;
    } else {
      matchStats[currentLevel].draws++;
    }
  
    saveStats(); // Persist updated stats
  
    const winner = player.score === 10 ? "You Win! 🏆" : "Computer Wins! 🤖";
    document.getElementById("winnerText").innerText = winner;
  
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("pauseButton").style.display = "none";
    document.getElementById("menuButton").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("restartbutton").style.display = "none";
  
    bgMusic.pause();
  }
  
  
  
    // Move ball
    // Skip ball movement during countdown
    if (!isCountingDown) {
      ball.x += ball.dx;
      ball.y += ball.dy;
    }
  
  
    // Bounce off top/bottom
    if (ball.y <= 0 || ball.y >= canvas.height) ball.dy *= -1;
  
  
  
  
  // --- Improved Ball Collision with Paddles ---
  const now = Date.now();
  if (!ball.lastHitTime) ball.lastHitTime = 0;
  
  // Player collision
  if (
    ball.x - ball.radius < player.x + player.width &&
    ball.x > player.x &&
    ball.y > player.y &&
    ball.y < player.y + player.height &&
    now - ball.lastHitTime > 150
  ) {
    ball.x = player.x + player.width + ball.radius; // push ball outside paddle
    ball.dx = Math.abs(ball.dx); // always go right
    let offset = ball.y - (player.y + player.height / 2);
    ball.dy = offset * 0.15;
    ball.lastHitTime = now;
    updateBallSpeedOnHit(); // Increase speed only here
  }
  
  // Computer collision
  if (
    ball.x + ball.radius > computer.x &&
    ball.x < computer.x + computer.width &&
    ball.y > computer.y &&
    ball.y < computer.y + computer.height &&
    now - ball.lastHitTime > 150
  ) {
    ball.x = computer.x - ball.radius; // push ball outside paddle
    ball.dx = -Math.abs(ball.dx); // always go left
    let offset = ball.y - (computer.y + computer.height / 2);
    ball.dy = offset * 0.15;
    ball.lastHitTime = now;
    updateBallSpeedOnHit(); // Increase speed only here
  }
  
  
  
  
   // Prevent ball from scoring multiple times before reset
   if (!goalScored) {
    // Check if ball enters the left goal area
    const isInLeftGoal = (
      ball.x - ball.radius <= goalLeft.x + goalLeft.width &&
      ball.y >= goalLeft.y &&
      ball.y <= goalLeft.y + goalLeft.height
    );
  
    // Check if ball enters the right goal area
    const isInRightGoal = (
      ball.x + ball.radius >= goalRight.x &&
      ball.y >= goalRight.y &&
      ball.y <= goalRight.y + goalRight.height
    );
  
    if (isInLeftGoal) {
      computer.score++;
      goalSound.currentTime = 0; // rewind sound if needed
      goalSound.play();
      goalScored = true;
      goalTimer = 60;
    }
  
    if (isInRightGoal) {
      player.score++;
      goalSound.currentTime = 0;
      goalSound.play();
      goalScored = true;
      goalTimer = 60;
    }
  }
  
  
    // Handle goal reset with delay
    if (goalScored) {
      goalTimer--;
      if (goalTimer <= 0) {
        resetBall();
        goalScored = false;
      }
      return; // pause the game during goal delay
    }


  
  
  }
  
  
  /////////////// update function end hear 
  
  

  

  
  function drawScores() {
      ctx.font = "20px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(`Player: ${player.score}`, 20, 30);
      ctx.fillText(`Computer: ${computer.score}`, 650, 30);
      ctx.fillText(`Level: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`, 330, 30);
    }
  
    


    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRect(player);
        drawRect(computer);
        drawBall();
        drawScores();
      
      
        //   for counting start after goal
        if (isCountingDown) {
          ctx.font = "60px Arial";
          ctx.fillStyle = "yellow";
          ctx.fillText(countdown > 0 ? countdown : "GO!", canvas.width / 2 - 40, canvas.height / 2);
        }

       
      }
      
      
      //function to change speed of boll over time 
      function updateBallSpeedOnHit() {
        // Occasionally slow down the ball randomly (5% chance)
        if (Math.random() < 0.05) {
          ball.speedMultiplier -= 0.2;
          const minMultiplier = ball.minSpeed / ball.baseSpeed;
          if (ball.speedMultiplier < minMultiplier) {
            ball.speedMultiplier = minMultiplier;
          }
        } else {
          // Normal speed increase on paddle hit
          ball.speedMultiplier += 0.15;
          const maxMultiplier = ball.maxSpeed / ball.baseSpeed;
          if (ball.speedMultiplier > maxMultiplier) {
            ball.speedMultiplier = maxMultiplier;
          }
        }
      
        // Recalculate velocity while maintaining direction
        const angle = Math.atan2(ball.dy, ball.dx);
        const speed = ball.baseSpeed * ball.speedMultiplier;
        ball.dx = Math.cos(angle) * speed;
        ball.dy = Math.sin(angle) * speed;
      }
      
      
      // function showing difficulty level on canvas 
      function showDifficultyNotice() {
        const notice = document.createElement('div');
        notice.innerText = `Difficulty: ${difficulty.toUpperCase()}`;
        notice.style.position = "absolute";
        notice.style.top = "20px";
        notice.style.left = "50%";
        notice.style.transform = "translateX(-50%)";
        notice.style.padding = "10px 20px";
        notice.style.background = "black";
        notice.style.color = "white";
        notice.style.fontSize = "18px";
        notice.style.borderRadius = "8px";
        document.body.appendChild(notice);
      
        setTimeout(() => notice.remove(), 1500);
      }
      
      
      
      
      // toggle function to break or pause game 
      function togglePause() {
          isPaused = !isPaused;
          document.getElementById("pauseButton").innerText = isPaused ? "Resume" : "Pause";
        }
      
        function gameLoop() {
          if (gameStarted && !isPaused) {
            update();
            draw();
          } else if (!gameStarted) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          requestAnimationFrame(gameLoop);
        }
let gameStarted = false;




document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

const bgMusic = new Audio('assets/sounds/bg-music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;
bgMusic.play();

const goalSound = new Audio('assets/sounds/goal.mp3');

 

let matchStats = JSON.parse(localStorage.getItem("matchStats")) || {
    easy: { wins: 0, losses: 0, draws: 0 },
    medium: { wins: 0, losses: 0, draws: 0 },
    hard: { wins: 0, losses: 0, draws: 0 }
  };



function handleDifficultyChange() {
    const select = document.getElementById('difficultySelect');
    setDifficulty(select.value);
    select.blur(); // This line removes focus so arrows won't affect it
  }
  


function setDifficulty(level) {
    difficulty = level;

    // Sync dropdown value with current difficulty
    const select = document.getElementById('difficultySelect');
    if (select && select.value !== level) {
      select.value = level;
    }

    showDifficultyNotice(); // Show popup when changed
}


function startGame() {
  // if (gameStarted) return;
  gameStarted = true;
  isPaused = false; // Unpause if returning from pause
  isGameOver = false; // Reset game over state

  document.getElementById("gameOverScreen").style.display = "none";

  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  document.getElementById("pauseButton").style.display = "block";
  document.getElementById("menuButton").style.display = "block";
  document.getElementById("scoreboardPanel").style.display = "none";




  bgMusic.currentTime = 0;
  bgMusic.play();

  player.score = 0;
  computer.score = 0;
  player.y = 175;
  computer.y = 175;

    // Reset and play music
    bgMusic.currentTime = 0;
    bgMusic.play();

  resetBall(); // reset position and countdown
}



function returnToMenu() {
  isPaused = true;
  gameStarted = false;

  document.getElementById("gameCanvas").style.display = "none";;
  document.getElementById("pauseButton").style.display = "none";
  document.getElementById("menuButton").style.display = "none";
  document.getElementById("mainMenu").style.display = "block";
  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("scoreboardPanel").style.display = "none";
  



  clearInterval(countdownInterval);
  isCountingDown = false;

  bgMusic.pause();
  bgMusic.currentTime = 0;

  // Reset game state
  player.score = 0;
  computer.score = 0;
  resetBall();

  // Optional: reset player/computer position too
  player.y = 175;
  computer.y = 175;
}



function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
}


function showScoreboard() {
  const panel = document.getElementById("scoreboardPanel");

  updateScoreboard(); // Update stats before showing
  panel.style.display = "block";

  document.getElementById("mainMenu").style.display = "none";
}


function updateScoreboard() {
  const statsDiv = document.getElementById("scoreboardStats");
  let html = "";

  for (const level in matchStats) {
    const stats = matchStats[level];
    html += `
      <h3>${level.charAt(0).toUpperCase() + level.slice(1)}</h3>
      <p>Wins: ${stats.wins}</p>
      <p>Losses: ${stats.losses}</p>
      <p>Draws: ${stats.draws}</p>
      <hr />
    `;
  }

  statsDiv.innerHTML = html;
}

function returnToMenuFromScoreboard() {
  document.getElementById("scoreboardPanel").style.display = "none";
  document.getElementById("mainMenu").style.display = "block";
}



// Load stats from localStorage
function loadStats() {
  const saved = localStorage.getItem("matchStats");
  if (saved) {
    matchStats = JSON.parse(saved);
  }
}

// Save stats to localStorage
function saveStats() {
  localStorage.setItem("matchStats", JSON.stringify(matchStats));
}

loadStats(); // Call it immediately on load


  
  

gameLoop();

let currentStep = 0; // Étape actuelle (commence à 0)
let selectedWords = 1; // Nombre de mots cachés initialement choisi par l'utilisateur
let timerInterval = null; // Référence au chronomètre
let timeRemaining = 0; // Temps restant en secondes

// Gestion des options de quantité de mots
const palettes = document.querySelectorAll('.palette');
palettes.forEach((palette) => {
  palette.addEventListener('click', () => {
    // Mettre à jour le nombre de mots sélectionnés
    selectedWords = parseInt(palette.dataset.words);

    // Mettre à jour la classe active pour indiquer la sélection
    palettes.forEach((btn) => btn.classList.remove('active'));
    palette.classList.add('active');
  });
});

// Gestion des options de chronomètre
document.getElementById('start-button').addEventListener('click', () => {
  const poetryInput = document.getElementById('poetry-input').value.trim();
  const enableTimer = document.getElementById('enable-timer').checked;
  const timerDuration = parseInt(document.getElementById('timer-duration').value, 10) || 5;

  if (poetryInput) {
    // Masquer les options et le bouton "Démarrer"
    document.getElementById('options-container').style.display = 'none';
    document.getElementById('timer-options').style.display = 'none';
    document.getElementById('poetry-input').style.display = 'none';
    document.getElementById('start-button').style.display = 'none';

    // Démarrer le jeu avec le choix initial de l'utilisateur
    initPoetryGame(poetryInput, selectedWords + currentStep);

    // Gérer le chronomètre
    if (enableTimer) {
      timeRemaining = timerDuration * 60; // Convertir en secondes
      document.getElementById('timer-display').style.display = 'block'; // Afficher le chronomètre
      updateTimerDisplay(); // Mettre à jour l'affichage initial
      startTimer(); // Démarrer le chronomètre
    }
  } else {
    alert('Veuillez coller une poésie avant de démarrer.');
  }
});

// Mettre à jour l'affichage du chronomètre
function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('timer-display').textContent = formattedTime;
}

// Démarrer le chronomètre
function startTimer() {
  timerInterval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      endGame(); // Arrêter le jeu lorsque le temps est écoulé
    }
  }, 1000);
}

// Arrêter le jeu en cas de fin du temps
function endGame() {
  alert('Le temps est écoulé ! Fin du jeu.');
  // Vous pouvez ajouter ici une logique supplémentaire, comme réinitialiser l'état ou afficher un récapitulatif
}

// Initialisation du jeu
function initPoetryGame(text, missingWordCount) {
  const lines = text.split('\n');
  const poetryContainer = document.getElementById('poetry');
  const wordPool = document.getElementById('word-pool');
  const missingWords = []; // Liste des mots manquants

  poetryContainer.innerHTML = ''; // Réinitialiser
  wordPool.innerHTML = ''; // Réinitialiser

  lines.forEach((line, lineIndex) => {
    const { tokens, wordsOnly } = tokenizeWithSpecialCharacters(line); // Découper la ligne
    const lineMissingWords = []; // Mots manquants pour cette ligne

    // Supprimer `missingWordCount` mots aléatoires de la ligne
    for (let i = 0; i < missingWordCount && wordsOnly.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * wordsOnly.length);
      const missingWord = wordsOnly[randomIndex];
      const uniqueId = `word-${lineIndex}-${i}`; // Identifiant unique basé sur la ligne et l'index

      lineMissingWords.push({ word: missingWord, id: uniqueId });
      missingWords.push({ word: missingWord }); // Ajouter le mot sans ID à la liste pour la colonne de gauche

      // Remplacer uniquement le mot choisi par un trou
      const tokenIndex = tokens.findIndex(token => token === missingWord);
      tokens[tokenIndex] = `<span class="hole" data-correct="${missingWord}" ondrop="drop(event)" ondragover="allowDrop(event)">[____]</span>`;

      // Retirer le mot choisi de `wordsOnly` pour éviter les doublons
      wordsOnly.splice(randomIndex, 1);
    }

    const lineDiv = document.createElement('div');
    lineDiv.id = `line-${lineIndex}`;
    lineDiv.classList.add('line');
    lineDiv.innerHTML = tokens.join(''); // Reconstituer la ligne avec espaces et ponctuation
    poetryContainer.appendChild(lineDiv);
  });

  // Mélanger les mots manquants avant de les afficher
  shuffleArray(missingWords);

  missingWords.forEach(({ word }) => {
    const wordTag = document.createElement('div');
    wordTag.classList.add('word-tag');
    wordTag.textContent = word;
    wordTag.setAttribute('draggable', true);
    wordTag.dataset.word = word; // Mot réel
    wordTag.addEventListener('dragstart', dragStart);
    wordPool.appendChild(wordTag);
  });
}

// Fonctions utilitaires
function tokenizeWithSpecialCharacters(line) {
  const tokens = []; // Contiendra les mots, ponctuation et espaces
  const regex = /([\wÀ-ÿ'-]+|[^\w\s])/g; // Capture mots et ponctuation
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(line)) !== null) {
    // Ajouter les espaces entre les tokens
    if (match.index > lastIndex) {
      tokens.push(line.slice(lastIndex, match.index)); // Ajouter les espaces
    }
    tokens.push(match[0]); // Ajouter le mot ou le caractère spécial
    lastIndex = regex.lastIndex;
  }

  // Ajouter les espaces restants après le dernier match
  if (lastIndex < line.length) {
    tokens.push(line.slice(lastIndex));
  }

  const wordsOnly = tokens.filter(token => /^[\wÀ-ÿ'-]+$/.test(token)); // Filtrer les vrais mots
  return { tokens, wordsOnly };
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function dragStart(event) {
  event.dataTransfer.setData('text', event.target.textContent);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const word = event.dataTransfer.getData('text');
  const correctWord = event.target.dataset.correct;

  if (word === correctWord) {
    // Placer le mot correctement
    event.target.textContent = word;
    event.target.style.backgroundColor = 'lightgreen';
    event.target.setAttribute('draggable', false);

    // Masquer une seule occurrence dans la liste de gauche
    const wordTags = document.querySelectorAll('.word-tag');
    for (let tag of wordTags) {
      if (tag.textContent === word && tag.style.visibility !== 'hidden') {
        tag.style.visibility = 'hidden'; // Masquer uniquement une occurrence
        break;
      }
    }

    checkCompletion();
  } else {
    // Mot incorrect
    event.target.style.backgroundColor = 'lightcoral';
    setTimeout(() => {
      event.target.style.backgroundColor = ''; // Réinitialiser le fond
    }, 1000);
  }
}

function checkCompletion() {
  const holes = document.querySelectorAll('.hole');
  const allGreen = Array.from(holes).every(hole => hole.textContent !== '[____]');
  if (allGreen) {
    // Étape suivante après validation
    setTimeout(() => {
      if (confirm('Étape suivante prête ! Voulez-vous continuer ?')) {
        currentStep++; // Avancer dans les étapes
        initPoetryGame(originalPoetryText, selectedWords + currentStep); // Recharger la grille avec plus de mots cachés
      }
    }, 500);
  }
}

// Texte original (stocké globalement pour réinitialisation)
let originalPoetryText = '';
document.getElementById('start-button').addEventListener('click', () => {
  originalPoetryText = document.getElementById('poetry-input').value.trim();
});

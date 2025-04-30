// Variables globales
let timeLeft = 600; // 10 minutos en segundos
let timer;
let isQuizActive = false;

// Usuarios permitidos (en un sistema real esto estaría en el servidor)
const validUsers = [
  { username: "estudiante", password: "12345" },
  { username: "profesor", password: "admin" }
];

// Función que se ejecuta cuando la página termina de cargar
document.addEventListener('DOMContentLoaded', function() {
  // Crear y agregar el elemento para el login
  const quizContainer = document.querySelector('.quiz-container');
  const quizForm = document.getElementById('quiz-form');
  
  // Crear contenedor de login
  const loginContainer = document.createElement('div');
  loginContainer.id = 'login-container';
  loginContainer.className = 'login-container';
  loginContainer.innerHTML = `
    <h2>Iniciar Sesión</h2>
    <form id="login-form">
      <div class="form-group">
        <label for="username">Usuario:</label>
        <input type="text" id="username" required>
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" id="password" required>
      </div>
      <button type="submit" class="btn-primary">Ingresar</button>
      <p id="login-error" class="error-msg">Usuario o contraseña incorrectos.</p>
    </form>
  `;
  
  // Crear el elemento del temporizador
  const timerElement = document.createElement('div');
  timerElement.id = 'timer';
  timerElement.className = 'timer';
  timerElement.textContent = 'Tiempo restante: 10:00';
  
  // Insertar el login antes del formulario y el timer al inicio del formulario
  quizContainer.insertBefore(loginContainer, quizForm);
  quizForm.style.display = 'none'; // Ocultar el quiz hasta que se inicie sesión
  quizForm.insertBefore(timerElement, quizForm.firstChild);
  
  // Asignar evento al formulario de login
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  
  // Asignar evento al formulario del quiz
  quizForm.addEventListener('submit', evaluateQuiz);
});

// Función para iniciar sesión
function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Verificar credenciales (en un sistema real, esto se haría en el servidor)
  const isValid = validUsers.some(user => 
    user.username === username && user.password === password);
  
  if (isValid) {
    // Ocultar login y mostrar cuestionario
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('quiz-form').style.display = 'block';
    
    // Mostrar botón para salir
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.className = 'btn-secondary';
    logoutBtn.textContent = 'Cerrar Sesión';
    logoutBtn.addEventListener('click', logout);
    document.querySelector('.header').appendChild(logoutBtn);
    
    // Iniciar temporizador
    startTimer();
  } else {
    // Mostrar error de login
    document.getElementById('login-error').style.display = 'block';
  }
}

// Función para cerrar sesión
function logout() {
  // Detener el temporizador si está activo
  if (isQuizActive) {
    clearInterval(timer);
    isQuizActive = false;
  }
  
  // Restablecer tiempo
  timeLeft = 600;
  
  // Ocultar cuestionario y mostrar login
  document.getElementById('quiz-form').style.display = 'none';
  document.getElementById('login-container').style.display = 'block';
  
  // Eliminar botón de cerrar sesión
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.remove();
  }
  
  // Limpiar resultados
  document.getElementById('result').textContent = '';
}

// Función para iniciar el temporizador
function startTimer() {
  isQuizActive = true;
  updateTimerDisplay();
  
  timer = setInterval(function() {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      endQuiz();
    }
  }, 1000);
}

// Actualizar la visualización del temporizador
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer').textContent = 
    `Tiempo restante: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
  // Cambiar color cuando queda poco tiempo
  if (timeLeft <= 60) { // menos de 1 minuto
    document.getElementById('timer').className = 'timer warning';
  }
  if (timeLeft <= 30) { // menos de 30 segundos
    document.getElementById('timer').className = 'timer danger';
  }
}

// Función para finalizar el cuestionario
function endQuiz() {
  clearInterval(timer);
  isQuizActive = false;
  
  // Calcular puntuación automáticamente si se acabó el tiempo
  if (timeLeft <= 0) {
    document.getElementById('timer').textContent = '¡Tiempo agotado!';
    document.getElementById('timer').className = 'timer expired';
    evaluateQuiz(new Event('submit'), true);
  }
}

// Manejador de envío del cuestionario
function evaluateQuiz(e, timeExpired = false) {
  if (!timeExpired) {
    e.preventDefault();
  }
  
  // Detener el temporizador si está activo
  if (isQuizActive) {
    clearInterval(timer);
    isQuizActive = false;
  }
  
  let score = 0;
  let answered = 0;
  
  // Respuestas correctas
  const correctAnswers = {
    q1: 'b',  // 50 decenas en la imagen 1
    p1: 'e',  // 30 decenas en la imagen 2
    q2b: true, // La segunda figura no es abierta
    q3a: true  // La primera figura no es cerrada
  };
  
 
  for (const key of ['q1', 'p1']) {
    const answer = document.querySelector(`input[name="${key}"]:checked`);
    if (answer) {
      answered++;
      if (answer.value === correctAnswers[key]) {
        score++;
      }
    }
  }
  

  for (const key of ['q2b', 'q3a']) {
    const checkbox = document.querySelector(`input[name="${key}"]`);
    if (checkbox && checkbox.checked === correctAnswers[key]) {
      score++;
    }
    
    const groupPrefix = key.substring(0, 2);
    const anyChecked = document.querySelector(`input[name^="${groupPrefix}"]:checked`);
    if (anyChecked) {
      answered++;
    }
  }
  
  const total = Object.keys(correctAnswers).length;
  const porcentaje = (score / total) * 100;
  
  let mensajeFinal = '';
  let resultClass = '';
  
  if (porcentaje >= 60) {
    mensajeFinal = '¡Felicidades! Has alcanzado el aprendizaje esperado.';
    resultClass = 'success';
  } else {
    mensajeFinal = 'Aún no alcanzas el aprendizaje esperado. ¡Sigue practicando!';
    resultClass = 'error';
  }
  

  if (timeExpired) {
    mensajeFinal = 'Tu tiempo se ha agotado. ' + mensajeFinal;
  }
  
  const resultElement = document.getElementById('result');
  resultElement.textContent = `Obtuviste ${score} de ${total} respuestas correctas (${Math.round(porcentaje)}%). ${mensajeFinal}`;
  resultElement.className = 'result ' + resultClass;
  

  const formElements = document.getElementById('quiz-form').elements;
  for (let i = 0; i < formElements.length; i++) {
    if (formElements[i].type !== 'submit') {
      formElements[i].disabled = true;
    }
  }

  const submitButton = document.querySelector('button[type="submit"]');
  submitButton.textContent = 'Reintentar';
  submitButton.className = 'btn-secondary';
  submitButton.type = 'button';
  submitButton.onclick = resetQuiz;
  
  return false;
}


function resetQuiz() {

  document.getElementById('quiz-form').reset();
  
  const formElements = document.getElementById('quiz-form').elements;
  for (let i = 0; i < formElements.length; i++) {
    if (formElements[i].type !== 'submit') {
      formElements[i].disabled = false;
    }
  }
  
  const submitButton = document.querySelector('button');
  submitButton.textContent = 'Enviar Respuestas';
  submitButton.className = 'btn-primary';
  submitButton.type = 'submit';
  

  document.getElementById('result').textContent = '';
  document.getElementById('result').className = 'result';
  
  timeLeft = 600;
  startTimer();
}
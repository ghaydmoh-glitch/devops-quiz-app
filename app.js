let allQuestions = [];
let filtered = [];
let currentIndex = 0;
let selectedTopic = "";

const topicSelect = document.getElementById("topicSelect");
const startBtn = document.getElementById("startBtn");

const quizCard = document.getElementById("quizCard");
const topicTitle = document.getElementById("topicTitle");
const progress = document.getElementById("progress");
const questionText = document.getElementById("questionText");

const optionsForm = document.getElementById("optionsForm");
const submitBtn = document.getElementById("submitBtn");
const nextBtn = document.getElementById("nextBtn");
const feedback = document.getElementById("feedback");

async function loadQuestions() {
  try {
    const res = await fetch("data/questions.json");
    if (!res.ok) throw new Error("Failed to load questions.json");
    allQuestions = await res.json();

    const topics = [...new Set(allQuestions.map(q => q.topic))].sort();

    topicSelect.innerHTML =
      `<option value="">-- Choose a topic --</option>` +
      topics.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("");
  } catch (err) {
    topicSelect.innerHTML = `<option value="">Error loading questions</option>`;
    console.error(err);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

topicSelect.addEventListener("change", () => {
  selectedTopic = topicSelect.value;
  startBtn.disabled = !selectedTopic;
});

startBtn.addEventListener("click", () => {
  filtered = allQuestions.filter(q => q.topic === selectedTopic);
  currentIndex = 0;

  quizCard.classList.remove("hidden");
  submitBtn.classList.remove("hidden");
  showQuestion();
});

function showQuestion() {
  const q = filtered[currentIndex];

  topicTitle.textContent = q.topic;
  progress.textContent = `${currentIndex + 1} / ${filtered.length}`;
  questionText.textContent = q.question;

  feedback.classList.add("hidden");
  feedback.textContent = "";
  nextBtn.classList.add("hidden");
  submitBtn.disabled = true;

  optionsForm.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const id = `opt_${idx}`;
    const label = document.createElement("label");
    label.setAttribute("for", id);

    label.innerHTML = `
      <input type="radio" name="answer" id="${id}" value="${idx}">
      ${escapeHtml(opt)}
    `;
    optionsForm.appendChild(label);
  });

  optionsForm.onchange = () => {
    submitBtn.disabled = false;
  };
}

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  checkAnswer();
});

function checkAnswer() {
  const q = filtered[currentIndex];
  const selected = optionsForm.querySelector("input[name='answer']:checked");
  if (!selected) return;

  const chosenIndex = Number(selected.value);
  const correct = (chosenIndex === q.answerIndex);

  feedback.classList.remove("hidden");
  feedback.innerHTML = `
    <strong>${correct ? "Correct ✅" : "Wrong ❌"}</strong><br>
    <em>Explanation:</em> ${escapeHtml(q.explanation)}
  `;

  submitBtn.disabled = true;
  nextBtn.classList.remove("hidden");
}

nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex >= filtered.length) {
    topicTitle.textContent = selectedTopic;
    progress.textContent = "";
    questionText.textContent = "Done! You finished this topic.";
    optionsForm.innerHTML = "";
    submitBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
    feedback.classList.add("hidden");
    return;
  }
  showQuestion();
});

loadQuestions();

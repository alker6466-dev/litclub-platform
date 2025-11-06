// js/chat.js

// Допоміжні функції
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function formatTime(date) {
  return date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Масив повідомлень (лише в пам'яті)
const messages = [];

// Рендер заголовку зустрічі
function initMeetingHeader() {
  const idParam = getQueryParam("meetingId");
  const meetingId = idParam ? Number(idParam) : meetings[0]?.id;
  const meeting = meetings.find((m) => m.id === meetingId) || meetings[0];

  const titleEl = document.getElementById("meeting-title");
  const infoEl = document.getElementById("meeting-info");

  if (meeting && titleEl && infoEl) {
    titleEl.textContent = meeting.title;
    infoEl.textContent = `${meeting.book} • ${new Date(
      meeting.datetime
    ).toLocaleString("uk-UA")}`;
  }
}

// Рендер учасників онлайн
function renderOnlineUsers() {
  const list = document.getElementById("online-users");
  if (!list) return;

  list.innerHTML = "";
  users.forEach((u) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="user-status"></span>
      <span>${u.name}</span>
    `;
    list.appendChild(li);
  });
}

// Рендер повідомлень чату
function renderMessages() {
  const container = document.getElementById("messages");
  if (!container) return;

  container.innerHTML = "";
  messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className =
      "message " + (msg.author === currentUser.name ? "me" : "other");
    div.innerHTML = `
      <div class="message-author">${msg.author}</div>
      <div class="message-text">${msg.text}</div>
      <div class="message-time">${msg.time}</div>
    `;
    container.appendChild(div);
  });

  container.scrollTop = container.scrollHeight;
}

// Додати повідомлення
function addMessage(author, text) {
  const now = new Date();
  messages.push({
    author,
    text,
    time: formatTime(now)
  });
  renderMessages();
}

// Імітація "бота", який іноді щось пише


// Обробка форми
function initChatForm() {
  const form = document.getElementById("message-form");
  const input = document.getElementById("message-input");

  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(currentUser.name, text);
    input.value = "";
  });
}

// Початкова ініціалізація
document.addEventListener("DOMContentLoaded", () => {
  initMeetingHeader();
  renderOnlineUsers();

  // Стартове вітальне повідомлення
  addMessage(
    "Система",
    "Ласкаво просимо до обговорення! Цей чат працює в межах вашого браузера (демо-версія без сервера)."
  );

  initChatForm();
  startBotMessages();
});

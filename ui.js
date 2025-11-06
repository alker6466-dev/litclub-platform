// js/ui.js

// Допоміжна функція для читання параметра ?id=...
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Форматування дати
function formatDateTime(isoString) {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* === Рендер головної сторінки === */

function renderIndexPage() {
  // Популярні клуби
  const container = document.getElementById("popular-clubs");
  if (container && Array.isArray(clubs)) {
    container.innerHTML = "";
    clubs.slice(0, 3).forEach((club) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <h3>${club.name}</h3>
        <p class="muted">${club.genre}</p>
        <p>${club.description}</p>
        <p class="muted">Учасників: ${club.membersCount}</p>
        <a href="club.html?id=${club.id}" class="btn btn-outline">Перейти в клуб</a>
      `;
      container.appendChild(card);
    });
  }

  // Найближча зустріч
  const nextTitle = document.getElementById("next-meeting-title");
  const nextTime = document.getElementById("next-meeting-time");
  if (nextTitle && nextTime && Array.isArray(meetings)) {
    const sorted = [...meetings].sort(
      (a, b) => new Date(a.datetime) - new Date(b.datetime)
    );
    const next = sorted[0];
    if (next) {
      nextTitle.textContent = next.title;
      nextTime.textContent = formatDateTime(next.datetime);
    } else {
      nextTitle.textContent = "Наразі немає запланованих обговорень";
      nextTime.textContent = "";
    }
  }
}

/* === Рендер сторінки зі списком клубів === */

function renderClubsPage() {
  const listEl = document.getElementById("clubs-list");
  const searchInput = document.getElementById("search");
  const genreSelect = document.getElementById("genre-filter");
  if (!listEl) return;

  function fillGenreSelect() {
    if (!genreSelect) return;
    const genres = Array.from(new Set(clubs.map((c) => c.genre)));
    genres.forEach((genre) => {
      const opt = document.createElement("option");
      opt.value = genre;
      opt.textContent = genre;
      genreSelect.appendChild(opt);
    });
  }

  function renderList() {
    const searchValue = (searchInput?.value || "").toLowerCase();
    const genreValue = genreSelect?.value || "all";

    listEl.innerHTML = "";
    let filtered = clubs;

    if (genreValue !== "all") {
      filtered = filtered.filter((c) => c.genre === genreValue);
    }
    if (searchValue) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchValue)
      );
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `<p class="muted">Клуби за таким запитом не знайдені.</p>`;
      return;
    }

    filtered.forEach((club) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <h3>${club.name}</h3>
        <p class="muted">${club.genre}</p>
        <p>${club.description}</p>
        <p class="muted">Учасників: ${club.membersCount}</p>
        <a href="club.html?id=${club.id}" class="btn btn-primary">Перейти в клуб</a>
      `;
      listEl.appendChild(card);
    });
  }

  fillGenreSelect();
  renderList();

  if (searchInput) {
    searchInput.addEventListener("input", renderList);
  }
  if (genreSelect) {
    genreSelect.addEventListener("change", renderList);
  }
}

/* === Рендер сторінки клубу === */

function renderClubPage() {
  const section = document.getElementById("club-section");
  if (!section) return;

  const idParam = getQueryParam("id");
  const clubId = idParam ? Number(idParam) : clubs[0]?.id;
  const club = clubs.find((c) => c.id === clubId) || clubs[0];

  if (!club) {
    section.innerHTML = "<p>Клуб не знайдено.</p>";
    return;
  }

  const clubMeetings = meetings.filter((m) => m.clubId === club.id);

  const meetingsHtml =
    clubMeetings.length > 0
      ? clubMeetings
          .map(
            (m) => `
        <li>
          <strong>${m.title}</strong><br>
          <span class="muted">${formatDateTime(m.datetime)}</span><br>
          <span class="muted">${m.book}</span><br>
          <a href="meeting.html?meetingId=${m.id}" class="btn btn-small" style="margin-top:4px;">Перейти до обговорення</a>
        </li>
      `
          )
          .join("")
      : `<li class="muted">Наразі немає запланованих обговорень.</li>`;

  section.innerHTML = `
    <div class="card">
      <h1>${club.name}</h1>
      <p class="muted">${club.genre}</p>
      <p>${club.description}</p>
      <button class="btn btn-primary" id="join-btn">Приєднатися до клубу</button>
      <p id="join-status" class="muted" style="margin-top:8px;"></p>
    </div>

    <div class="layout-2" style="margin-top:18px;">
      <section class="card">
        <h2>Найближчі обговорення</h2>
        <ul class="list">
          ${meetingsHtml}
        </ul>
      </section>

      <aside class="card">
        <h2>Учасники клубу (демо)</h2>
        <ul class="list">
          <li>Аліна</li>
          <li>Максим</li>
          <li>Олег</li>
          <li>Ірина</li>
        </ul>
        <p class="muted" style="margin-top:8px;">
          У реальній системі список учасників завантажувався б із бази даних.
        </p>
      </aside>
    </div>
  `;

  const joinBtn = document.getElementById("join-btn");
  const statusEl = document.getElementById("join-status");

  if (joinBtn && statusEl) {
    joinBtn.addEventListener("click", () => {
      statusEl.textContent = "Ви приєдналися до цього клубу (демонстрація).";
    });
  }
}

/* === Рендер профілю === */

function renderProfilePage() {
  const nameEl = document.getElementById("user-name");
  const aboutEl = document.getElementById("user-about");
  const avatarInitials = document.getElementById("user-avatar-initials");
  const clubsEl = document.getElementById("user-clubs");
  const meetingsEl = document.getElementById("user-meetings");

  if (!nameEl || !aboutEl || !avatarInitials || !clubsEl || !meetingsEl) {
    return;
  }

  nameEl.textContent = currentUser.name;
  aboutEl.textContent = "Приклад профілю активного учасника літературних клубів.";
  avatarInitials.textContent = currentUser.initials;

  // Умовно: користувач у всіх клубах
  clubsEl.innerHTML = clubs
    .map((c) => `<li>${c.name} <span class="muted">(${c.genre})</span></li>`)
    .join("");

  meetingsEl.innerHTML = meetings
    .slice(0, 4)
    .map(
      (m) => `<li>
        <strong>${m.title}</strong><br>
        <span class="muted">${formatDateTime(m.datetime)}</span>
      </li>`
    )
    .join("");
}

/* === Ініціалізація залежно від сторінки === */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  switch (page) {
    case "index":
      renderIndexPage();
      break;
    case "clubs":
      renderClubsPage();
      break;
    case "club":
      renderClubPage();
      break;
    case "profile":
      renderProfilePage();
      break;
    default:
      break;
  }
});

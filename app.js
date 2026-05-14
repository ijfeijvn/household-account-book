const seedState = {
  schemaVersion: 2,
  projects: [
    { id: "jp", name: "일본 여행", goal: 1000000, saved: 246000, accent: "mint" },
    { id: "rest", name: "나를 위한 안식 주말", goal: 320000, saved: 98000, accent: "coral" },
    { id: "gift", name: "부모님 온천 선물", goal: 600000, saved: 154000, accent: "blue" },
  ],
  records: [
    {
      id: crypto.randomUUID(),
      desire: "야식 배달",
      amount: 18000,
      donation: 2000,
      projectId: "jp",
      mood: "뿌듯함",
      date: "오늘",
    },
    {
      id: crypto.randomUUID(),
      desire: "택시",
      amount: 9200,
      donation: 0,
      projectId: "gift",
      mood: "차분함",
      date: "어제",
    },
    {
      id: crypto.randomUUID(),
      desire: "충동구매",
      amount: 43000,
      donation: 3000,
      projectId: "rest",
      mood: "흔들렸음",
      date: "월요일",
    },
  ],
  posts: [
    {
      id: crypto.randomUUID(),
      name: "별빛 저금러",
      desire: "커피 한 잔",
      amount: 5200,
      donation: 500,
      projectName: "일본 여행",
      mood: "뿌듯함",
      text: "매일 사던 커피를 한 번 멈췄더니 여행이 조금 더 가까워진 느낌이에요.",
      likes: 28,
    },
    {
      id: crypto.randomUUID(),
      name: "소망 수집가",
      desire: "택시",
      amount: 8600,
      donation: 0,
      projectName: "나를 위한 안식 주말",
      mood: "차분함",
      text: "걸어오는 길이 생각보다 괜찮았어요. 오늘의 나를 응원해봅니다.",
      likes: 16,
    },
  ],
};

const currency = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

let state = loadState();

const els = {
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  monthTotal: document.querySelector("#month-total"),
  monthMessage: document.querySelector("#month-message"),
  form: document.querySelector("#saving-form"),
  projectSelect: document.querySelector("#project"),
  timeline: document.querySelector("#timeline"),
  projectList: document.querySelector("#project-list"),
  donationTotal: document.querySelector("#donation-total"),
  donationProgress: document.querySelector("#donation-progress"),
  resetDemo: document.querySelector("#reset-demo"),
  addProject: document.querySelector("#add-project"),
  communityForm: document.querySelector("#community-form"),
  communityRecord: document.querySelector("#community-record"),
  communityText: document.querySelector("#community-text"),
  communityFeed: document.querySelector("#community-feed"),
  toast: document.querySelector("#toast"),
};

function loadState() {
  const saved = localStorage.getItem("desire-bank-state");
  if (!saved) return structuredClone(seedState);

  try {
    const parsed = JSON.parse(saved);
    if ((parsed.schemaVersion || 1) < seedState.schemaVersion) {
      return {
        ...structuredClone(seedState),
        projects: parsed.projects?.length ? parsed.projects : structuredClone(seedState.projects),
        records: parsed.records?.length ? parsed.records : structuredClone(seedState.records),
      };
    }
    return parsed;
  } catch {
    return structuredClone(seedState);
  }
}

function saveState() {
  localStorage.setItem("desire-bank-state", JSON.stringify(state));
}

function formatWon(value) {
  return currency.format(value).replace("₩", "") + "원";
}

function parseWon(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

function getProject(id) {
  return state.projects.find((project) => project.id === id) ?? state.projects[0];
}

function render() {
  renderSummary();
  renderProjectSelect();
  renderCommunityRecordSelect();
  renderTimeline();
  renderProjects();
  renderCommunity();
  if (window.lucide) window.lucide.createIcons();
}

function renderSummary() {
  const total = state.records.reduce((sum, record) => sum + record.amount, 0);
  const donation = state.records.reduce((sum, record) => sum + (record.donation || 0), 0);
  els.monthTotal.textContent = formatWon(total);
  els.donationTotal.textContent = formatWon(donation);
  els.donationProgress.style.width = `${Math.min((donation / 100000) * 100, 100)}%`;

  const count = state.records.length;
  els.monthMessage.textContent =
    count > 0 ? `${count}번의 선택이 소망과 기부로 흘러갔어요.` : "작은 선택들이 조용히 자라고 있어요.";
}

function renderProjectSelect() {
  els.projectSelect.innerHTML = state.projects
    .map((project) => `<option value="${project.id}">${project.name}</option>`)
    .join("");
}

function renderTimeline() {
  els.timeline.innerHTML = state.records
    .slice()
    .reverse()
    .map((record) => {
      const project = getProject(record.projectId);
      const projectAmount = record.amount - (record.donation || 0);
      return `
        <article class="timeline-item">
          <header>
            <div>
              <strong>${escapeHtml(record.desire)} 참음</strong>
              <p>${project.name} ${formatWon(projectAmount)}${record.donation ? ` · 기부 ${formatWon(record.donation)}` : ""}</p>
            </div>
            <span class="amount">${formatWon(record.amount)}</span>
          </header>
          <p>${record.date} · ${record.mood}</p>
        </article>
      `;
    })
    .join("");
}

function renderCommunityRecordSelect() {
  els.communityRecord.innerHTML = state.records
    .slice()
    .reverse()
    .map((record) => {
      const project = getProject(record.projectId);
      return `<option value="${record.id}">${escapeHtml(record.desire)} · ${formatWon(record.amount)} · ${project.name}</option>`;
    })
    .join("");
}

function renderProjects() {
  els.projectList.innerHTML = state.projects
    .map((project) => {
      const percent = Math.min(Math.round((project.saved / project.goal) * 100), 100);
      const records = state.records.filter((record) => record.projectId === project.id);
      const topDesire = getTopDesire(records);
      return `
        <article class="project-card">
          <header>
            <div>
              <strong>${project.name}</strong>
              <p>${topDesire ? `${topDesire}에서 가장 많이 자랐어요.` : "첫 기록을 기다리고 있어요."}</p>
            </div>
            <span class="amount">${percent}%</span>
          </header>
          <div class="progress-track"><span style="width: ${percent}%"></span></div>
          <div class="project-meta">
            <span>${formatWon(project.saved)}</span>
            <span>${formatWon(project.goal)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCommunity() {
  els.communityFeed.innerHTML = state.posts
    .slice()
    .reverse()
    .map(
      (post) => `
        <article class="feed-item">
          <header>
            <div>
              <strong>${escapeHtml(post.name)}</strong>
              <p>${escapeHtml(post.text)}</p>
            </div>
            <span class="amount">${formatWon(post.amount || 0)}</span>
          </header>
          <div class="shared-record">
            <span>${escapeHtml(post.desire || "절제")}</span>
            <span>${escapeHtml(post.projectName || "소망 저금통")}</span>
            ${post.donation ? `<span>기부 ${formatWon(post.donation)}</span>` : ""}
          </div>
          <footer>
            <span class="chip">응원 ${post.likes}</span>
            <span class="chip">${escapeHtml(post.mood || "오늘의 선택")}</span>
          </footer>
        </article>
      `,
    )
    .join("");
}

function getTopDesire(records) {
  if (!records.length) return "";
  const totals = records.reduce((acc, record) => {
    acc[record.desire] = (acc[record.desire] || 0) + record.amount;
    return acc;
  }, {});
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.view;
    els.tabs.forEach((item) => item.classList.toggle("active", item === tab));
    els.views.forEach((view) => view.classList.toggle("active", view.dataset.viewPanel === target));
  });
});

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(els.form);
  const projectId = formData.get("project");
  const amount = parseWon(formData.get("amount"));
  const donation = Math.min(parseWon(formData.get("donation")), amount);
  const project = getProject(projectId);

  if (amount <= 0) {
    showToast("아낀 금액을 입력해 주세요.");
    return;
  }

  project.saved += amount - donation;
  state.records.push({
    id: crypto.randomUUID(),
    desire: formData.get("desire").trim(),
    amount,
    donation,
    projectId,
    mood: formData.get("mood"),
    date: "방금",
  });

  saveState();
  els.form.reset();
  document.querySelector("#mood-proud").checked = true;
  render();
  showToast("참은 욕망이 소망으로 옮겨졌어요.");
});

els.communityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const record = state.records.find((item) => item.id === els.communityRecord.value);
  if (!record) {
    showToast("공유할 기록을 먼저 만들어 주세요.");
    return;
  }
  const project = getProject(record.projectId);
  state.posts.push({
    id: crypto.randomUUID(),
    name: "나의 저금통",
    desire: record.desire,
    amount: record.amount,
    donation: record.donation,
    projectName: project.name,
    mood: record.mood,
    text: els.communityText.value.trim(),
    likes: 0,
  });
  saveState();
  els.communityForm.reset();
  renderCommunity();
  showToast("작은 승리가 공유됐어요.");
});

els.resetDemo.addEventListener("click", () => {
  state = structuredClone(seedState);
  saveState();
  render();
  showToast("처음 예시로 돌아왔어요.");
});

els.addProject.addEventListener("click", () => {
  const count = state.projects.length + 1;
  state.projects.push({
    id: `wish-${Date.now()}`,
    name: `새 소망 ${count}`,
    goal: 500000,
    saved: 0,
    accent: "lavender",
  });
  saveState();
  render();
  showToast("새 프로젝트 저금통이 생겼어요.");
});

render();

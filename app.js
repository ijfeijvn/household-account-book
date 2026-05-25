const seedState = {
  schemaVersion: 6,
  projects: [],
  desireRecords: [],
  transactions: [],
  categorySettings: null,
};

const defaultExpenseCategories = [
  { name: "식비", icon: "utensils" },
  { name: "카페", icon: "coffee" },
  { name: "교통비", icon: "bus" },
  { name: "쇼핑", icon: "handbag" },
  { name: "생활용품", icon: "package" },
  { name: "주거비", icon: "house" },
  { name: "통신비", icon: "smartphone" },
  { name: "의료비", icon: "stethoscope" },
  { name: "교육비", icon: "book" },
  { name: "문화생활", icon: "ticket" },
];
const defaultIncomeCategories = [
  { name: "월급", icon: "wallet" },
  { name: "용돈", icon: "gift" },
  { name: "부수입", icon: "briefcase" },
  { name: "환급", icon: "undo" },
  { name: "기타", icon: "ellipsis" },
];
const availableCategoryIcons = [
  "utensils",
  "coffee",
  "bus",
  "car",
  "train",
  "handbag",
  "store",
  "shirt",
  "package",
  "house",
  "smartphone",
  "wifi",
  "stethoscope",
  "pill",
  "book",
  "graduation-cap",
  "ticket",
  "music",
  "wallet",
  "tag",
  "gift",
  "briefcase",
  "undo",
  "ellipsis",
  "heart",
  "sparkles",
  "piggy-bank",
  "plane",
  "baby",
  "gamepad-2",
  "dumbbell",
];

const currency = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

let state = loadState();
let ledgerType = "expense";
let selectedLedgerCategory = defaultExpenseCategories[0].name;
let selectedProjectId = state.projects[0]?.id || "";
let pendingDeleteProjectId = "";
let calendarCursor = new Date();
calendarCursor.setDate(1);
let reportCursor = new Date();
reportCursor.setDate(1);
let selectedCalendarDate = dateKey();
let reportType = "expense";
let settingsType = "expense";
let selectedCategoryIcon = availableCategoryIcons[0];
let editingCategoryIconIndex = -1;

const els = {
  tabs: document.querySelectorAll(".bottom-tab"),
  views: document.querySelectorAll(".view"),
  summaryCards: document.querySelectorAll("[data-summary-type]"),
  headerMonth: document.querySelector("#header-month"),
  summaryExpense: document.querySelector("#summary-expense"),
  summaryIncome: document.querySelector("#summary-income"),
  summaryDesire: document.querySelector("#summary-desire"),
  ledgerTypeButtons: document.querySelectorAll("[data-ledger-type]"),
  ledgerForm: document.querySelector("#ledger-form"),
  ledgerDate: document.querySelector("#ledger-date"),
  ledgerCategory: document.querySelector("#ledger-category"),
  ledgerCategoryPicker: document.querySelector("#ledger-category-picker"),
  ledgerList: document.querySelector("#ledger-list"),
  calendarPrev: document.querySelector("#calendar-prev"),
  calendarNext: document.querySelector("#calendar-next"),
  calendarTitle: document.querySelector("#calendar-title"),
  calendarGrid: document.querySelector("#calendar-grid"),
  calendarDayDetail: document.querySelector("#calendar-day-detail"),
  reportExpense: document.querySelector("#report-expense"),
  reportIncome: document.querySelector("#report-income"),
  reportBalance: document.querySelector("#report-balance"),
  reportDesire: document.querySelector("#report-desire"),
  categoryReport: document.querySelector("#category-report"),
  reportTypeButtons: document.querySelectorAll("[data-report-type]"),
  reportListTitle: document.querySelector("#report-list-title"),
  reportTransactionList: document.querySelector("#report-transaction-list"),
  reportYear: document.querySelector("#report-year"),
  reportMonth: document.querySelector("#report-month"),
  projectList: document.querySelector("#project-list"),
  addProject: document.querySelector("#add-project"),
  projectCreatePanel: document.querySelector("#project-create-panel"),
  projectForm: document.querySelector("#project-form"),
  projectName: document.querySelector("#project-name"),
  cancelProject: document.querySelector("#cancel-project"),
  settingsTypeButtons: document.querySelectorAll("[data-settings-type]"),
  categoryForm: document.querySelector("#category-form"),
  categoryName: document.querySelector("#category-name"),
  categoryIcon: document.querySelector("#category-icon"),
  settingsIconTitle: document.querySelector("#settings-icon-title"),
  settingsIconPicker: document.querySelector("#settings-icon-picker"),
  settingsListTitle: document.querySelector("#settings-list-title"),
  settingsCategoryList: document.querySelector("#settings-category-list"),
  recordModal: document.querySelector("#record-modal"),
  recordModalBody: document.querySelector("#record-modal-body"),
  closeRecordDetail: document.querySelector("#close-record-detail"),
  toast: document.querySelector("#toast"),
};

function loadState() {
  const saved = localStorage.getItem("desire-bank-state");
  if (!saved) return structuredClone(seedState);

  try {
    const parsed = JSON.parse(saved);
    const migrated = {
      ...structuredClone(seedState),
      ...parsed,
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      desireRecords: Array.isArray(parsed.desireRecords)
        ? parsed.desireRecords
        : Array.isArray(parsed.records)
          ? parsed.records
          : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      categorySettings: normalizeCategorySettings(parsed.categorySettings),
      schemaVersion: seedState.schemaVersion,
    };
    recalculateProjectSavings(migrated);
    return migrated;
  } catch {
    return structuredClone(seedState);
  }
}

function normalizeCategorySettings(settings) {
  return {
    expense: normalizeCategoryList(settings?.expense, defaultExpenseCategories),
    income: normalizeCategoryList(settings?.income, defaultIncomeCategories),
  };
}

function normalizeCategoryList(list, fallback) {
  const source = Array.isArray(list) && list.length ? list : fallback;
  return source
    .filter((category) => category && String(category.name || "").trim())
    .map((category) => ({
      name: String(category.name).trim(),
      icon: availableCategoryIcons.includes(category.icon) ? category.icon : "tag",
    }));
}

function getCategories(type = ledgerType) {
  if (!state.categorySettings) {
    state.categorySettings = normalizeCategorySettings();
  }
  return state.categorySettings[type] || [];
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

function formatNumberInput(value) {
  const amount = parseWon(value);
  return amount ? new Intl.NumberFormat("ko-KR").format(amount) : "";
}

function normalizeAmountInput(input) {
  const formatted = formatNumberInput(input.value);
  input.value = formatted;
}

function dateKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDate(key) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(parseDateKey(key));
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(date);
}

function thisMonthKey(date = new Date()) {
  return dateKey(date).slice(0, 7);
}

function getProject(id) {
  return state.projects.find((project) => project.id === id);
}

function recalculateProjectSavings(targetState = state) {
  targetState.projects.forEach((project) => {
    project.saved = 0;
  });

  targetState.desireRecords.forEach((record) => {
    const project = targetState.projects.find((item) => item.id === record.projectId);
    if (project) project.saved += record.amount;
  });
}

function getMonthlyData(monthKey = thisMonthKey()) {
  const transactions = state.transactions.filter((item) => item.dateKey.slice(0, 7) === monthKey);
  const desireRecords = state.desireRecords.filter((item) => item.dateKey.slice(0, 7) === monthKey);
  const expense = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const desire = desireRecords.reduce((sum, item) => sum + item.amount, 0);
  return { transactions, desireRecords, expense, income, desire };
}

function render() {
  renderLedgerType();
  renderSummary();
  renderLedgerList();
  renderCalendar();
  renderReport();
  renderProjects();
  renderSettings();
  if (window.lucide) window.lucide.createIcons();
}

function renderLedgerType() {
  els.ledgerTypeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.ledgerType === ledgerType);
  });
  const categories = getCategories(ledgerType);
  if (!categories.some((category) => category.name === selectedLedgerCategory)) {
    selectedLedgerCategory = categories[0].name;
  }
  els.ledgerCategory.value = selectedLedgerCategory;
  els.ledgerCategoryPicker.innerHTML = categories
    .map(
      (category) => `
        <button class="category-option${category.name === selectedLedgerCategory ? " active" : ""}" type="button" data-category="${escapeHtml(category.name)}" role="radio" aria-checked="${category.name === selectedLedgerCategory}">
          <i data-lucide="${category.icon}"></i>
          <span>${escapeHtml(category.name)}</span>
        </button>
      `,
    )
    .join("");
}

function renderSettings() {
  const categories = getCategories(settingsType);
  const editingCategory = categories[editingCategoryIconIndex];
  els.settingsTypeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.settingsType === settingsType);
  });
  els.settingsListTitle.textContent = settingsType === "income" ? "수입 카테고리" : "지출 카테고리";
  els.settingsIconTitle.textContent = editingCategory ? `${editingCategory.name} 아이콘 변경` : "아이콘 선택";
  els.categoryIcon.value = selectedCategoryIcon;
  els.settingsIconPicker.innerHTML = availableCategoryIcons
    .map(
      (icon) => `
        <button class="settings-icon-option${icon === selectedCategoryIcon ? " active" : ""}" type="button" data-settings-icon="${icon}" aria-label="${icon}">
          <i data-lucide="${icon}"></i>
        </button>
      `,
    )
    .join("");

  els.settingsCategoryList.innerHTML = categories
    .map(
      (category, index) => `
        <article class="settings-category-row${index === editingCategoryIconIndex ? " editing" : ""}">
          <button class="settings-category-main" type="button" data-edit-category-icon="${index}">
            <i data-lucide="${category.icon}"></i>
            <strong>${escapeHtml(category.name)}</strong>
          </button>
          <div class="settings-category-actions">
            <button class="icon-mini-button" type="button" data-move-category="${index}" data-direction="-1" aria-label="${escapeHtml(category.name)} 위로">
              <i data-lucide="chevron-up"></i>
            </button>
            <button class="icon-mini-button" type="button" data-move-category="${index}" data-direction="1" aria-label="${escapeHtml(category.name)} 아래로">
              <i data-lucide="chevron-down"></i>
            </button>
            <button class="icon-mini-button danger" type="button" data-delete-category="${index}" aria-label="${escapeHtml(category.name)} 삭제">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderSummary() {
  const month = thisMonthKey(calendarCursor);
  const data = getMonthlyData(month);
  els.headerMonth.textContent = formatMonth(calendarCursor);
  els.summaryExpense.textContent = formatWon(data.expense);
  els.summaryIncome.textContent = formatWon(data.income);
  els.summaryDesire.textContent = formatWon(data.desire);
}

function renderLedgerList() {
  if (!state.transactions.length) {
    els.ledgerList.innerHTML = `
      <article class="empty-state">
        <strong>아직 가계부 기록이 없어요</strong>
        <p>지출이나 수입을 입력하면 최근 기록이 여기에 쌓여요.</p>
      </article>
    `;
    return;
  }

  els.ledgerList.innerHTML = state.transactions
    .slice()
    .sort((a, b) => `${b.dateKey}${b.createdAt}`.localeCompare(`${a.dateKey}${a.createdAt}`))
    .slice(0, 20)
    .map((item) => {
      const sign = item.type === "income" ? "+" : "-";
      return `
        <article class="money-item ${item.type}">
          <div>
            <strong>${escapeHtml(item.memo)}</strong>
            <p>${escapeHtml(item.category)} · ${formatShortDate(item.dateKey)}</p>
          </div>
          <span>${sign}${formatWon(item.amount)}</span>
        </article>
      `;
    })
    .join("");
}

function renderCalendar() {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const monthKey = thisMonthKey(calendarCursor);
  const data = getMonthlyData(monthKey);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const totalsByDay = {};

  data.transactions.forEach((item) => {
    totalsByDay[item.dateKey] ||= { expense: 0, income: 0 };
    totalsByDay[item.dateKey][item.type] += item.amount;
  });

  els.calendarTitle.textContent = formatMonth(calendarCursor);
  const blanks = Array.from({ length: firstDay }, () => `<div class="calendar-day blank"></div>`);
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const key = `${monthKey}-${String(day).padStart(2, "0")}`;
    const totals = totalsByDay[key] || { expense: 0, income: 0 };
    return `
      <button class="calendar-day${key === selectedCalendarDate ? " selected" : ""}" type="button" data-date="${key}">
        <strong>${day}</strong>
        ${totals.expense ? `<span class="day-expense">-${compactWon(totals.expense)}</span>` : ""}
        ${totals.income ? `<span class="day-income">+${compactWon(totals.income)}</span>` : ""}
      </button>
    `;
  });
  els.calendarGrid.innerHTML = [...blanks, ...days].join("");
  renderCalendarDayDetail();
}

function renderCalendarDayDetail() {
  const items = state.transactions
    .filter((item) => item.dateKey === selectedCalendarDate)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const expense = items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const income = items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const list = items.length
    ? items
        .map((item) => {
          const sign = item.type === "income" ? "+" : "-";
          return `
            <article class="money-item ${item.type}">
              <div>
                <strong>${escapeHtml(item.memo)}</strong>
                <p>${escapeHtml(item.category)}</p>
              </div>
              <span>${sign}${formatWon(item.amount)}</span>
            </article>
          `;
        })
        .join("")
    : `
      <article class="empty-state compact">
        <strong>이 날의 기록이 없어요</strong>
        <p>달력에서 날짜를 고른 뒤 가계부 탭에서 기록을 추가할 수 있어요.</p>
      </article>
    `;

  els.calendarDayDetail.innerHTML = `
    <div class="section-heading">
      <div>
        <span>날짜 상세</span>
        <h2>${formatShortDate(selectedCalendarDate)}</h2>
      </div>
    </div>
    <div class="day-summary-grid">
      <article>
        <span>지출</span>
        <strong>${formatWon(expense)}</strong>
      </article>
      <article>
        <span>수입</span>
        <strong>${formatWon(income)}</strong>
      </article>
      <article>
        <span>합계</span>
        <strong>${formatWon(income - expense)}</strong>
      </article>
    </div>
    <div class="day-transaction-list">${list}</div>
  `;
}

function compactWon(value) {
  if (value >= 10000) return `${Math.round(value / 10000)}만`;
  return new Intl.NumberFormat("ko-KR").format(value);
}

function renderReport() {
  const data = getMonthlyData(thisMonthKey(reportCursor));
  els.reportExpense.textContent = formatWon(data.expense);
  els.reportIncome.textContent = formatWon(data.income);
  els.reportBalance.textContent = formatWon(data.income - data.expense);
  els.reportDesire.textContent = formatWon(data.desire);
  els.reportTypeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.reportType === reportType);
  });
  renderReportTransactionList(data);

  const expenseRows = Object.entries(
    data.transactions
      .filter((item) => item.type === "expense")
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      }, {}),
  ).sort((a, b) => b[1] - a[1]);

  if (!expenseRows.length) {
    els.categoryReport.innerHTML = `
      <article class="empty-state">
        <strong>분석할 지출이 없어요</strong>
        <p>가계부에 지출을 입력하면 카테고리별로 정리해드릴게요.</p>
      </article>
    `;
    return;
  }

  const max = Math.max(...expenseRows.map(([, amount]) => amount));
  els.categoryReport.innerHTML = expenseRows
    .map(([category, amount]) => {
      const width = Math.max(8, Math.round((amount / max) * 100));
      return `
        <article class="category-row">
          <header>
            <strong>${escapeHtml(category)}</strong>
            <span>${formatWon(amount)}</span>
          </header>
          <div class="progress-track"><span style="width:${width}%"></span></div>
        </article>
      `;
    })
    .join("");
}

function renderReportTransactionList(data) {
  const label = reportType === "income" ? "수입" : "지출";
  const lastDay = new Date(reportCursor.getFullYear(), reportCursor.getMonth() + 1, 0).getDate();
  const items = data.transactions
    .filter((item) => item.type === reportType)
    .sort((a, b) => `${b.dateKey}${b.createdAt}`.localeCompare(`${a.dateKey}${a.createdAt}`));
  els.reportListTitle.textContent = `${label} 내역 · 1일~${lastDay}일`;

  if (!items.length) {
    els.reportTransactionList.innerHTML = `
      <article class="empty-state compact">
        <strong>선택한 달의 ${label} 내역이 없어요</strong>
        <p>가계부에 ${label}을 입력하면 월별로 모아볼 수 있어요.</p>
      </article>
    `;
    return;
  }

  els.reportTransactionList.innerHTML = items
    .map((item) => {
      const sign = item.type === "income" ? "+" : "-";
      return `
        <article class="money-item ${item.type}">
          <div>
            <strong>${escapeHtml(item.memo)}</strong>
            <p>${escapeHtml(item.category)} · ${formatShortDate(item.dateKey)}</p>
          </div>
          <span>${sign}${formatWon(item.amount)}</span>
        </article>
      `;
    })
    .join("");
}

function initReportControls() {
  const currentYear = new Date().getFullYear();
  els.reportYear.innerHTML = Array.from({ length: 8 }, (_, index) => currentYear - 5 + index)
    .map((year) => `<option value="${year}">${year}년</option>`)
    .join("");
  els.reportMonth.innerHTML = Array.from({ length: 12 }, (_, index) => index + 1)
    .map((month) => `<option value="${month}">${month}월</option>`)
    .join("");
  syncReportControls();
}

function syncReportControls() {
  els.reportYear.value = String(reportCursor.getFullYear());
  els.reportMonth.value = String(reportCursor.getMonth() + 1);
}

function renderProjects() {
  if (!state.projects.length) {
    selectedProjectId = "";
    els.projectList.innerHTML = `
      <article class="empty-state">
        <strong>프로젝트가 비어 있어요</strong>
        <p>오른쪽 위 버튼으로 소망 저금통을 먼저 만들어보세요.</p>
      </article>
    `;
    return;
  }

  if (!selectedProjectId || !getProject(selectedProjectId)) {
    selectedProjectId = state.projects[0].id;
  }

  els.projectList.innerHTML = state.projects.map(renderProjectStack).join("");
}

function renderProjectStack(project) {
  const records = state.desireRecords.filter((record) => record.projectId === project.id);
  const percent = project.goal > 0 ? Math.min(Math.round((project.saved / project.goal) * 100), 100) : 0;
  const opened = selectedProjectId === project.id;
  return `
    <article class="project-stack${opened ? " open" : ""}">
      <button class="project-card project-card-button${opened ? " selected" : ""}" type="button" data-project-id="${project.id}" aria-expanded="${opened}">
        <header>
          <div>
            <strong>${escapeHtml(project.name)}</strong>
            <p>${records.length ? `${records.length}개의 욕망을 참았어요.` : "아직 기록이 없어요."}</p>
          </div>
          <span class="amount">${percent}%</span>
        </header>
        <div class="progress-track"><span style="width: ${percent}%"></span></div>
        <div class="project-meta">
          <span>${formatWon(project.saved)}</span>
          <span>${formatWon(project.goal)}</span>
        </div>
      </button>
      ${opened ? renderDesireForm(project, records, percent) : ""}
    </article>
  `;
}

function renderDesireForm(project, records, percent) {
  const deletePanel =
    pendingDeleteProjectId === project.id
      ? `
        <div class="delete-confirm-panel">
          <div>
            <strong>이 프로젝트를 삭제할까요?</strong>
            <p>연결된 욕망 기록 ${records.length}개도 함께 지워져요. 이 작업은 되돌릴 수 없어요.</p>
          </div>
          <div class="button-row">
            <button class="secondary-button" type="button" data-cancel-delete-project>취소</button>
            <button class="danger-button solid" type="button" data-confirm-delete-project="${project.id}">
              <i data-lucide="trash-2"></i>
              삭제
            </button>
          </div>
        </div>
      `
      : "";
  const recordItems = records.length
    ? records.slice().reverse().map(renderProjectRecord).join("")
    : `
      <article class="empty-state compact">
        <strong>아직 참은 욕망이 없어요</strong>
        <p>아래에 오늘 참은 욕망을 남겨보세요.</p>
      </article>
    `;

  return `
    <section class="project-detail-panel">
      <div class="section-heading">
        <div>
          <span>선택한 프로젝트</span>
          <h2>${escapeHtml(project.name)}</h2>
        </div>
        <button class="danger-button" type="button" data-request-delete-project="${project.id}">
          <i data-lucide="trash-2"></i>
          삭제
        </button>
      </div>
      <div class="project-detail-summary">
        <span>${formatWon(project.saved)}</span>
        <span>${formatWon(project.goal)}</span>
      </div>
      <div class="progress-track"><span style="width: ${percent}%"></span></div>
      ${deletePanel}
      <form class="desire-form" data-desire-form="${project.id}">
        <label>
          <span>오늘 참은 욕망</span>
          <input name="desire" type="text" placeholder="예: 치킨, 택시, 충동구매" required />
        </label>
        <label>
          <span>참은 금액</span>
          <input name="amount" type="text" inputmode="numeric" pattern="[0-9,]*" placeholder="20,000" required />
        </label>
        <label>
          <span>메모</span>
          <textarea name="memo" rows="3" placeholder="왜 사고 싶었는지, 어떻게 참았는지 남겨보세요."></textarea>
        </label>
        <button class="primary-button compact" type="submit">
          <i data-lucide="sparkles"></i>
          이 프로젝트에 기록
        </button>
      </form>
      <div class="project-records">${recordItems}</div>
    </section>
  `;
}

function renderProjectRecord(record) {
  const memo = record.memo ? `<p>${escapeHtml(record.memo)}</p>` : "";
  return `
    <button class="project-record no-photo" type="button" data-record-id="${record.id}">
      <div>
        <header>
          <strong>${escapeHtml(record.desire)}</strong>
          <span class="amount">${formatWon(record.amount)}</span>
        </header>
        ${memo}
        <footer>${escapeHtml(record.date || formatShortDate(record.dateKey))}</footer>
      </div>
    </button>
  `;
}

function openRecordDetail(recordId) {
  const record = state.desireRecords.find((item) => item.id === recordId);
  if (!record) return;
  const project = getProject(record.projectId);
  const memo = record.memo ? `<p class="record-detail-memo">${escapeHtml(record.memo)}</p>` : "";

  els.recordModalBody.innerHTML = `
    <span class="modal-overline">${project ? escapeHtml(project.name) : "삭제된 프로젝트"}</span>
    <div class="record-detail-title-row">
      <h2 id="record-modal-title">${escapeHtml(record.desire)}</h2>
      <time>${escapeHtml(record.date || formatShortDate(record.dateKey))}</time>
    </div>
    <div class="record-detail-meta">
      <span>${formatWon(record.amount)}</span>
    </div>
    ${memo}
  `;
  els.recordModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeRecordDetail() {
  els.recordModal.hidden = true;
  els.recordModalBody.innerHTML = "";
  document.body.classList.remove("modal-open");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function switchView(target) {
  els.tabs.forEach((item) => item.classList.toggle("active", item.dataset.view === target));
  els.views.forEach((view) => view.classList.toggle("active", view.dataset.viewPanel === target));
}

function openProjectCreator() {
  els.projectCreatePanel.classList.add("open");
  els.projectName.focus();
}

function closeProjectCreator() {
  els.projectCreatePanel.classList.remove("open");
  els.projectForm.reset();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchView(tab.dataset.view));
});

els.summaryCards.forEach((card) => {
  card.addEventListener("click", () => {
    reportType = card.dataset.summaryType;
    reportCursor = new Date(calendarCursor);
    syncReportControls();
    switchView("report");
    render();
  });
});

els.ledgerTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ledgerType = button.dataset.ledgerType;
    renderLedgerType();
    if (window.lucide) window.lucide.createIcons();
  });
});

els.ledgerCategoryPicker.addEventListener("click", (event) => {
  const option = event.target.closest("[data-category]");
  if (!option) return;
  selectedLedgerCategory = option.dataset.category;
  renderLedgerType();
  if (window.lucide) window.lucide.createIcons();
});

els.ledgerDate.addEventListener("click", () => {
  if (typeof els.ledgerDate.showPicker === "function") {
    try {
      els.ledgerDate.showPicker();
    } catch {
      els.ledgerDate.focus();
    }
  }
});

els.ledgerDate.addEventListener("focus", () => {
  if (typeof els.ledgerDate.showPicker === "function") {
    try {
      els.ledgerDate.showPicker();
    } catch {
      // Some browsers only allow showPicker during a direct click.
    }
  }
});

document.addEventListener("input", (event) => {
  const input = event.target.closest('input[inputmode="numeric"]');
  if (!input) return;
  normalizeAmountInput(input);
});

els.ledgerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(els.ledgerForm);
  const memo = String(formData.get("memo")).trim();
  const amount = parseWon(formData.get("amount"));
  const selectedDate = String(formData.get("date"));
  const category = selectedLedgerCategory;

  if (!memo || amount <= 0 || !selectedDate) {
    showToast("메모, 날짜, 금액을 확인해 주세요.");
    return;
  }

  state.transactions.push({
    id: crypto.randomUUID(),
    type: ledgerType,
    memo,
    amount,
    category,
    dateKey: selectedDate,
    createdAt: new Date().toISOString(),
  });
  saveState();
  els.ledgerForm.reset();
  els.ledgerDate.value = dateKey();
  render();
  showToast(`${ledgerType === "income" ? "수입" : "지출"}을 기록했어요.`);
});

els.reportYear.addEventListener("change", () => {
  reportCursor.setFullYear(Number(els.reportYear.value));
  renderReport();
});

els.reportMonth.addEventListener("change", () => {
  reportCursor.setMonth(Number(els.reportMonth.value) - 1);
  renderReport();
});

els.reportTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    reportType = button.dataset.reportType;
    renderReport();
  });
});

els.settingsTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    settingsType = button.dataset.settingsType;
    editingCategoryIconIndex = -1;
    selectedCategoryIcon = availableCategoryIcons[0];
    renderSettings();
    if (window.lucide) window.lucide.createIcons();
  });
});

els.settingsIconPicker.addEventListener("click", (event) => {
  const option = event.target.closest("[data-settings-icon]");
  if (!option) return;
  selectedCategoryIcon = option.dataset.settingsIcon;
  const categories = getCategories(settingsType);
  if (editingCategoryIconIndex >= 0 && categories[editingCategoryIconIndex]) {
    categories[editingCategoryIconIndex].icon = selectedCategoryIcon;
    saveState();
  }
  render();
});

els.categoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = els.categoryName.value.trim();
  if (!name) {
    showToast("카테고리 이름을 입력해 주세요.");
    return;
  }

  const categories = getCategories(settingsType);
  if (categories.some((category) => category.name === name)) {
    showToast("이미 있는 카테고리예요.");
    return;
  }

  categories.push({ name, icon: selectedCategoryIcon });
  editingCategoryIconIndex = -1;
  saveState();
  els.categoryForm.reset();
  selectedCategoryIcon = availableCategoryIcons[0];
  render();
  showToast("카테고리를 추가했어요.");
});

els.settingsCategoryList.addEventListener("click", (event) => {
  const categories = getCategories(settingsType);
  const editButton = event.target.closest("[data-edit-category-icon]");
  if (editButton) {
    editingCategoryIconIndex = Number(editButton.dataset.editCategoryIcon);
    selectedCategoryIcon = categories[editingCategoryIconIndex]?.icon || availableCategoryIcons[0];
    renderSettings();
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const moveButton = event.target.closest("[data-move-category]");
  if (moveButton) {
    const index = Number(moveButton.dataset.moveCategory);
    const nextIndex = index + Number(moveButton.dataset.direction);
    if (nextIndex < 0 || nextIndex >= categories.length) return;
    const [item] = categories.splice(index, 1);
    categories.splice(nextIndex, 0, item);
    editingCategoryIconIndex = nextIndex;
    selectedCategoryIcon = item.icon;
    saveState();
    render();
    return;
  }

  const deleteButton = event.target.closest("[data-delete-category]");
  if (deleteButton) {
    const index = Number(deleteButton.dataset.deleteCategory);
    if (categories.length <= 1) {
      showToast("카테고리는 최소 1개가 필요해요.");
      return;
    }
    categories.splice(index, 1);
    editingCategoryIconIndex = -1;
    selectedLedgerCategory = getCategories(ledgerType)[0]?.name || "";
    saveState();
    render();
  }
});

els.calendarPrev.addEventListener("click", () => {
  calendarCursor.setMonth(calendarCursor.getMonth() - 1);
  selectedCalendarDate = `${thisMonthKey(calendarCursor)}-01`;
  render();
});

els.calendarNext.addEventListener("click", () => {
  calendarCursor.setMonth(calendarCursor.getMonth() + 1);
  selectedCalendarDate = `${thisMonthKey(calendarCursor)}-01`;
  render();
});

els.calendarGrid.addEventListener("click", (event) => {
  const day = event.target.closest("[data-date]");
  if (!day) return;
  selectedCalendarDate = day.dataset.date;
  els.ledgerDate.value = selectedCalendarDate;
  renderCalendar();
  if (window.lucide) window.lucide.createIcons();
});

els.addProject.addEventListener("click", openProjectCreator);
els.cancelProject.addEventListener("click", closeProjectCreator);

els.projectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(els.projectForm);
  const name = String(formData.get("projectName")).trim();
  const goal = parseWon(formData.get("projectGoal"));

  if (!name || goal <= 0) {
    showToast("프로젝트 이름과 목표 금액을 확인해 주세요.");
    return;
  }

  const id = `wish-${Date.now()}`;
  state.projects.push({ id, name, goal, saved: 0 });
  selectedProjectId = id;
  saveState();
  closeProjectCreator();
  render();
  showToast("새 프로젝트를 만들었어요.");
});

els.projectList.addEventListener("click", (event) => {
  const form = event.target.closest("[data-desire-form]");
  if (form) return;

  const deleteRequest = event.target.closest("[data-request-delete-project]");
  if (deleteRequest) {
    pendingDeleteProjectId = deleteRequest.dataset.requestDeleteProject;
    renderProjects();
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  if (event.target.closest("[data-cancel-delete-project]")) {
    pendingDeleteProjectId = "";
    renderProjects();
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const deleteConfirm = event.target.closest("[data-confirm-delete-project]");
  if (deleteConfirm) {
    const projectId = deleteConfirm.dataset.confirmDeleteProject;
    const project = getProject(projectId);
    state.projects = state.projects.filter((item) => item.id !== projectId);
    state.desireRecords = state.desireRecords.filter((record) => record.projectId !== projectId);
    selectedProjectId = state.projects[0]?.id || "";
    pendingDeleteProjectId = "";
    recalculateProjectSavings();
    saveState();
    render();
    showToast(`${project?.name || "프로젝트"}를 삭제했어요.`);
    return;
  }

  const record = event.target.closest("[data-record-id]");
  if (record) {
    openRecordDetail(record.dataset.recordId);
    return;
  }

  const projectCard = event.target.closest("[data-project-id]");
  if (!projectCard) return;
  selectedProjectId = selectedProjectId === projectCard.dataset.projectId ? "" : projectCard.dataset.projectId;
  pendingDeleteProjectId = "";
  renderProjects();
  if (window.lucide) window.lucide.createIcons();
});

els.projectList.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-desire-form]");
  if (!form) return;
  event.preventDefault();

  const projectId = form.dataset.desireForm;
  const formData = new FormData(form);
  const desire = String(formData.get("desire")).trim();
  const amount = parseWon(formData.get("amount"));
  const memo = String(formData.get("memo") || "").trim();
  const project = getProject(projectId);

  if (!project || !desire || amount <= 0) {
    showToast("욕망 이름과 금액을 확인해 주세요.");
    return;
  }

  const createdAt = new Date();
  state.desireRecords.push({
    id: crypto.randomUUID(),
    projectId,
    desire,
    amount,
    memo,
    date: new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(createdAt),
    dateKey: dateKey(createdAt),
    createdAt: createdAt.toISOString(),
  });
  recalculateProjectSavings();
  saveState();
  form.reset();
  render();
  showToast("참은 욕망을 프로젝트에 담았어요.");
});

els.closeRecordDetail.addEventListener("click", closeRecordDetail);
els.recordModal.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-record]")) closeRecordDetail();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.recordModal.hidden) closeRecordDetail();
});

initReportControls();
els.ledgerDate.value = dateKey();
render();

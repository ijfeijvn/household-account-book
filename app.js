const seedState = {
  schemaVersion: 6,
  projects: [],
  desireRecords: [],
  transactions: [],
  schedules: [],
  categorySettings: null,
  appearance: {
    theme: "lavender",
  },
  quickEntry: {
    enabled: true,
  },
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

const moodThemes = [
  {
    id: "lavender",
    name: "라벤더 꿈",
    description: "가장 기본이 되는 조용한 보라빛 톤",
    swatch: "linear-gradient(145deg, #e7e2ff, #eef8ff)",
  },
  {
    id: "mint",
    name: "민트 숨",
    description: "초록빛이 살짝 도는 맑고 편안한 톤",
    swatch: "linear-gradient(145deg, #e2f8eb, #f7fff5)",
  },
  {
    id: "sky",
    name: "하늘 낮잠",
    description: "파란빛 중심의 시원하고 깨끗한 톤",
    swatch: "linear-gradient(145deg, #e2f6ff, #f7fbff)",
  },
  {
    id: "blush",
    name: "복숭아 핑크",
    description: "부드러운 분홍빛으로 포근한 톤",
    swatch: "linear-gradient(145deg, #ffe8f0, #fff8fb)",
  },
  {
    id: "peach",
    name: "살구 구름",
    description: "따뜻한 주황빛이 도는 말랑한 톤",
    swatch: "linear-gradient(145deg, #ffe2cc, #fff9f2)",
  },
  {
    id: "cream",
    name: "크림 노트",
    description: "종이 느낌이 강한 밝고 담백한 톤",
    swatch: "linear-gradient(145deg, #fff1b8, #fffdf3)",
  },
];

const currency = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

let state = loadState();
applyTheme(state.appearance?.theme);
let ledgerType = "expense";
let quickType = "expense";
let ledgerPlanMode = "single";
let quickPlanMode = "single";
let quickStep = "details";
let selectedLedgerCategory = defaultExpenseCategories[0].name;
let selectedQuickCategory = defaultExpenseCategories[0].name;
let selectedProjectId = state.projects[0]?.id || "";
let pendingDeleteProjectId = "";
let calendarCursor = new Date();
calendarCursor.setDate(1);
let reportCursor = new Date();
reportCursor.setDate(1);
let selectedCalendarDate = dateKey();
let selectedReportDate = "";
let reportType = "expense";
let settingsType = "expense";
let ledgerListCollapsed = false;
let selectedCategoryIcon = availableCategoryIcons[0];
let editingCategoryIconIndex = -1;
let activeSettingsMenu = "customize";
let categoryDrag = {
  index: -1,
  overIndex: -1,
  pointerId: null,
  armed: false,
};

const els = {
  tabs: document.querySelectorAll(".bottom-tab"),
  views: document.querySelectorAll(".view"),
  monthSummary: document.querySelector(".month-summary"),
  summaryCards: document.querySelectorAll("[data-summary-type]"),
  headerMonth: document.querySelector("#header-month"),
  summaryExpense: document.querySelector("#summary-expense"),
  summaryIncome: document.querySelector("#summary-income"),
  summaryDesire: document.querySelector("#summary-desire"),
  headerSettings: document.querySelector("#header-settings"),
  ledgerTypeButtons: document.querySelectorAll("[data-ledger-type]"),
  ledgerForm: document.querySelector("#ledger-form"),
  ledgerDate: document.querySelector("#ledger-date"),
  ledgerDateDisplay: document.querySelector("#ledger-date-display"),
  ledgerDatePopover: document.querySelector("#ledger-date-popover"),
  ledgerCategory: document.querySelector("#ledger-category"),
  ledgerCategoryPicker: document.querySelector("#ledger-category-picker"),
  ledgerPlanPanel: document.querySelector("#ledger-plan-panel"),
  ledgerPlanButtons: document.querySelectorAll("[data-plan-mode]"),
  installmentMonthsRow: document.querySelector("#installment-months-row"),
  planMonthsLabel: document.querySelector("#plan-months-label"),
  installmentMonths: document.querySelector("#installment-months"),
  ledgerList: document.querySelector("#ledger-list"),
  toggleLedgerList: document.querySelector("#toggle-ledger-list"),
  calendarPrev: document.querySelector("#calendar-prev"),
  calendarNext: document.querySelector("#calendar-next"),
  calendarTitle: document.querySelector("#calendar-title"),
  calendarMonthSummary: document.querySelector("#calendar-month-summary"),
  calendarGrid: document.querySelector("#calendar-grid"),
  calendarDayDetail: document.querySelector("#calendar-day-detail"),
  reportExpense: document.querySelector("#report-expense"),
  reportIncome: document.querySelector("#report-income"),
  reportDesire: document.querySelector("#report-desire"),
  categoryReport: document.querySelector("#category-report"),
  reportDayList: document.querySelector("#report-day-list"),
  reportDayDetail: document.querySelector("#report-day-detail"),
  reportTypeButtons: document.querySelectorAll("[data-report-type]"),
  goViewButtons: document.querySelectorAll("[data-go-view]"),
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
  settingsMenuCards: document.querySelectorAll("[data-settings-menu]"),
  settingsCustomizePanel: document.querySelector("#settings-customize-panel"),
  settingsMoodPanel: document.querySelector("#settings-mood-panel"),
  settingsQuickPanel: document.querySelector("#settings-quick-panel"),
  moodPicker: document.querySelector("#mood-picker"),
  quickStartToggle: document.querySelector("#quick-start-toggle"),
  quickEntry: document.querySelector("#quick-entry"),
  quickEntryForm: document.querySelector("#quick-entry-form"),
  quickTypeButtons: document.querySelectorAll("[data-quick-type]"),
  quickMemo: document.querySelector("#quick-memo"),
  quickAmount: document.querySelector("#quick-amount"),
  quickCategory: document.querySelector("#quick-category"),
  quickCategoryPicker: document.querySelector("#quick-category-picker"),
  quickCategoryName: document.querySelector("#quick-category-name"),
  quickAddCategory: document.querySelector("#quick-add-category"),
  quickStepPanels: document.querySelectorAll("[data-quick-step-panel]"),
  quickNext: document.querySelector("#quick-next"),
  quickBack: document.querySelector("#quick-back"),
  quickPlanPanel: document.querySelector("#quick-plan-panel"),
  quickPlanButtons: document.querySelectorAll("[data-quick-plan-mode]"),
  quickInstallmentMonthsRow: document.querySelector("#quick-installment-months-row"),
  quickPlanMonthsLabel: document.querySelector("#quick-plan-months-label"),
  quickInstallmentMonths: document.querySelector("#quick-installment-months"),
  closeQuickEntry: document.querySelector("#close-quick-entry"),
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
      schedules: Array.isArray(parsed.schedules) ? parsed.schedules : [],
      categorySettings: normalizeCategorySettings(parsed.categorySettings),
      appearance: normalizeAppearance(parsed.appearance),
      quickEntry: normalizeQuickEntry(parsed.quickEntry),
      schemaVersion: seedState.schemaVersion,
    };
    recalculateProjectSavings(migrated);
    return migrated;
  } catch {
    return structuredClone(seedState);
  }
}

function normalizeQuickEntry(quickEntry) {
  return {
    enabled: typeof quickEntry?.enabled === "boolean" ? quickEntry.enabled : seedState.quickEntry.enabled,
  };
}

function normalizeAppearance(appearance) {
  const theme = moodThemes.some((item) => item.id === appearance?.theme) ? appearance.theme : seedState.appearance.theme;
  return { theme };
}

function applyTheme(theme) {
  const nextTheme = moodThemes.some((item) => item.id === theme) ? theme : seedState.appearance.theme;
  document.body.dataset.theme = nextTheme;
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

function createCategory(type, name, icon = "tag") {
  const cleanName = String(name || "").trim();
  if (!cleanName) return { ok: false, reason: "empty" };

  const categories = getCategories(type);
  const existing = categories.find((category) => category.name === cleanName);
  if (existing) return { ok: false, reason: "duplicate", category: existing };

  const nextCategory = {
    name: cleanName,
    icon: availableCategoryIcons.includes(icon) ? icon : "tag",
  };
  categories.push(nextCategory);
  saveState();
  return { ok: true, category: nextCategory };
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

function parseMonthCount(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

function clearFieldErrors(scope) {
  scope.querySelectorAll(".field-error").forEach((item) => item.classList.remove("field-error"));
}

function showFormErrors(fields, message) {
  fields.filter(Boolean).forEach((field) => field.classList.add("field-error"));
  const firstField = fields.find(Boolean);
  firstField?.scrollIntoView({ behavior: "smooth", block: "center" });
  if (typeof firstField?.focus === "function") {
    firstField.focus({ preventScroll: true });
  }
  showToast(message);
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

function formatFullDate(key) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
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

function addMonths(key, offset) {
  const date = parseDateKey(key);
  const originalDay = date.getDate();
  const target = new Date(date.getFullYear(), date.getMonth() + offset, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(originalDay, lastDay));
  return dateKey(target);
}

function monthDiff(fromMonthKey, toMonthKey) {
  const [fromYear, fromMonth] = fromMonthKey.split("-").map(Number);
  const [toYear, toMonth] = toMonthKey.split("-").map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

function getScheduleOccurrence(schedule, monthKey) {
  const startMonth = schedule.startDateKey.slice(0, 7);
  const offset = monthDiff(startMonth, monthKey);
  if (offset < 0) return null;
  if (schedule.scheduleType !== "repeat" && schedule.scheduleType !== "installment") return null;
  if (Number(schedule.months || 0) > 0 && offset >= Number(schedule.months)) return null;

  const occurrenceDateKey = addMonths(schedule.startDateKey, offset);
  if (occurrenceDateKey.slice(0, 7) !== monthKey) return null;

  return {
    id: `${schedule.id}-${monthKey}`,
    sourceId: schedule.id,
    type: "expense",
    memo: schedule.memo,
    amount: schedule.amount,
    category: schedule.category,
    dateKey: occurrenceDateKey,
    createdAt: schedule.createdAt,
    isScheduled: true,
    scheduleType: schedule.scheduleType,
    scheduleLabel:
      schedule.scheduleType === "repeat"
        ? Number(schedule.months || 0) > 0
          ? `${offset + 1}/${schedule.months} 반복`
          : "매달 반복"
        : `${offset + 1}/${schedule.months} 할부`,
  };
}

function getScheduledTransactionsForMonth(monthKey) {
  return (state.schedules || [])
    .map((schedule) => getScheduleOccurrence(schedule, monthKey))
    .filter(Boolean);
}

function getTransactionsForMonth(monthKey) {
  return [
    ...state.transactions.filter((item) => item.dateKey.slice(0, 7) === monthKey),
    ...getScheduledTransactionsForMonth(monthKey),
  ];
}

function getRecentTransactions() {
  const monthKeys = Array.from({ length: 4 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - index);
    return thisMonthKey(date);
  });
  const scheduled = monthKeys.flatMap((monthKey) => getScheduledTransactionsForMonth(monthKey));
  return [...state.transactions, ...scheduled]
    .filter((item) => item.dateKey <= dateKey())
    .sort((a, b) => `${b.dateKey}${b.createdAt}${b.id}`.localeCompare(`${a.dateKey}${a.createdAt}${a.id}`))
    .slice(0, 20);
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
  const transactions = getTransactionsForMonth(monthKey);
  const desireRecords = state.desireRecords.filter((item) => item.dateKey.slice(0, 7) === monthKey);
  const expense = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const desire = desireRecords.reduce((sum, item) => sum + item.amount, 0);
  return { transactions, desireRecords, expense, income, desire };
}

function getTransactionsForDate(key) {
  return getTransactionsForMonth(key.slice(0, 7))
    .filter((item) => item.dateKey === key)
    .sort((a, b) => `${b.createdAt}${b.id}`.localeCompare(`${a.createdAt}${a.id}`));
}

function getTransactionTotals(items) {
  return {
    expense: items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0),
    income: items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0),
  };
}

function render() {
  renderLedgerType();
  renderQuickEntry();
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
  if (ledgerType !== "expense") {
    ledgerPlanMode = "single";
  }
  renderLedgerPlan();
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

function renderLedgerPlan() {
  const isExpense = ledgerType === "expense";
  els.ledgerPlanPanel.hidden = !isExpense;
  if (!isExpense) return;
  els.ledgerPlanButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.planMode === ledgerPlanMode);
  });
  els.installmentMonthsRow.hidden = ledgerPlanMode === "single";
  if (ledgerPlanMode !== "single") {
    els.planMonthsLabel.textContent = ledgerPlanMode === "repeat" ? "반복 개월" : "할부 개월";
    if (!els.installmentMonths.value) els.installmentMonths.value = "3";
  }
}

function renderQuickEntry() {
  const categories = getCategories(quickType);
  if (!categories.some((category) => category.name === selectedQuickCategory)) {
    selectedQuickCategory = categories[0]?.name || "";
  }
  if (quickType !== "expense") {
    quickPlanMode = "single";
  }
  els.quickStepPanels.forEach((panel) => {
    panel.hidden = panel.dataset.quickStepPanel !== quickStep;
  });
  renderQuickPlan();
  els.quickCategory.value = selectedQuickCategory;
  els.quickTypeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.quickType === quickType);
  });
  els.quickCategoryPicker.innerHTML = categories
    .map(
      (category) => `
        <button class="category-option${category.name === selectedQuickCategory ? " active" : ""}" type="button" data-quick-category="${escapeHtml(category.name)}" role="radio" aria-checked="${category.name === selectedQuickCategory}">
          <i data-lucide="${category.icon}"></i>
          <span>${escapeHtml(category.name)}</span>
        </button>
      `,
    )
    .join("");
}

function renderQuickPlan() {
  const isExpense = quickType === "expense";
  els.quickPlanPanel.hidden = !isExpense;
  if (!isExpense) return;
  els.quickPlanButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.quickPlanMode === quickPlanMode);
  });
  els.quickInstallmentMonthsRow.hidden = quickPlanMode === "single";
  if (quickPlanMode !== "single") {
    els.quickPlanMonthsLabel.textContent = quickPlanMode === "repeat" ? "반복 개월" : "할부 개월";
    if (!els.quickInstallmentMonths.value) els.quickInstallmentMonths.value = "3";
  }
}

function validateQuickDetails() {
  clearFieldErrors(els.quickEntryForm);
  const formData = new FormData(els.quickEntryForm);
  const memo = String(formData.get("memo")).trim();
  const amount = parseWon(formData.get("amount"));
  const monthCount = parseMonthCount(formData.get("quickInstallmentMonths"));
  const needsMonths = quickType === "expense" && quickPlanMode !== "single";
  const invalidFields = [
    !memo ? els.quickEntryForm.elements.memo : null,
    amount <= 0 ? els.quickEntryForm.elements.amount : null,
    needsMonths && monthCount <= 0 ? els.quickInstallmentMonths : null,
  ];

  if (invalidFields.some(Boolean)) {
    showFormErrors(invalidFields, needsMonths ? "메모와 금액, 개월 수를 확인해 주세요." : "메모와 금액을 확인해 주세요.");
    return false;
  }

  return true;
}

function renderSettings() {
  if (!state.appearance) {
    state.appearance = normalizeAppearance();
  }
  const categories = getCategories(settingsType);
  const editingCategory = categories[editingCategoryIconIndex];
  els.settingsMenuCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.settingsMenu === activeSettingsMenu);
  });
  els.settingsCustomizePanel.hidden = activeSettingsMenu !== "customize";
  els.settingsMoodPanel.hidden = activeSettingsMenu !== "mood";
  els.settingsQuickPanel.hidden = activeSettingsMenu !== "quick";
  els.quickStartToggle.checked = Boolean(state.quickEntry?.enabled);
  els.moodPicker.innerHTML = moodThemes
    .map(
      (theme) => `
        <button class="mood-option${state.appearance.theme === theme.id ? " active" : ""}" type="button" data-theme-option="${theme.id}">
          <span class="mood-swatch" style="background:${theme.swatch}"></span>
          <span class="mood-copy">
            <strong>${escapeHtml(theme.name)}</strong>
            <span>${escapeHtml(theme.description)}</span>
          </span>
          <i data-lucide="check"></i>
        </button>
      `,
    )
    .join("");
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
        <article class="settings-category-row${index === editingCategoryIconIndex ? " editing" : ""}" data-category-row="${index}">
          <button class="settings-category-main" type="button" data-edit-category-icon="${index}">
            <i data-lucide="${category.icon}"></i>
            <strong>${escapeHtml(category.name)}</strong>
          </button>
          <div class="settings-category-actions">
            <button class="drag-handle" type="button" data-drag-category="${index}" aria-label="${escapeHtml(category.name)} 순서 이동">
              <i data-lucide="grip-vertical"></i>
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

function addLedgerTransaction({ type, memo, amount, category, selectedDate }) {
  state.transactions.push({
    id: crypto.randomUUID(),
    type,
    memo,
    amount,
    category,
    dateKey: selectedDate,
    createdAt: new Date().toISOString(),
  });
  saveState();
}

function addLedgerSchedule({ scheduleType, memo, amount, category, selectedDate, months }) {
  const monthCount = Math.max(1, Number(months) || 1);
  const monthlyAmount = scheduleType === "installment" ? Math.max(1, Math.round(amount / monthCount)) : amount;
  state.schedules ||= [];
  state.schedules.push({
    id: crypto.randomUUID(),
    scheduleType,
    memo,
    amount: monthlyAmount,
    originalAmount: amount,
    category,
    startDateKey: selectedDate,
    months: monthCount,
    createdAt: new Date().toISOString(),
  });
  saveState();
}

function shouldOpenQuickEntry() {
  if (!state.quickEntry) {
    state.quickEntry = normalizeQuickEntry();
  }
  return state.quickEntry.enabled;
}

function openQuickEntry() {
  quickType = "expense";
  quickPlanMode = "single";
  quickStep = "details";
  selectedQuickCategory = getCategories(quickType)[0]?.name || "";
  els.quickEntryForm.reset();
  els.quickInstallmentMonths.value = "3";
  clearFieldErrors(els.quickEntryForm);
  renderQuickEntry();
  els.quickEntry.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => els.quickAmount.focus(), 180);
  if (window.lucide) window.lucide.createIcons();
}

function closeQuickEntry() {
  els.quickEntry.hidden = true;
  document.body.classList.remove("modal-open");
}

function renderSummary() {
  const month = thisMonthKey(calendarCursor);
  const data = getMonthlyData(month);
  els.headerMonth.textContent = "설정";
  els.summaryExpense.textContent = formatWon(data.expense);
  els.summaryIncome.textContent = formatWon(data.income);
  els.summaryDesire.textContent = formatWon(data.desire);
}

function setLedgerDate(key) {
  els.ledgerDate.value = key;
  if (els.ledgerDateDisplay) {
    els.ledgerDateDisplay.querySelector("span").textContent = formatFullDate(key);
  }
}

function renderLedgerDatePopover() {
  if (!els.ledgerDatePopover) return;
  const today = parseDateKey(dateKey());
  const quickDays = [
    { label: "어제", offset: -1 },
    { label: "오늘", offset: 0 },
    { label: "내일", offset: 1 },
  ];
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - 3 + index);
    const key = dateKey(day);
    return `
      <button class="date-chip${key === els.ledgerDate.value ? " active" : ""}" type="button" data-ledger-date="${key}">
        <strong>${new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(day)}</strong>
        <span>${day.getDate()}</span>
      </button>
    `;
  }).join("");
  els.ledgerDatePopover.innerHTML = `
    <div class="date-quick-row">
      ${quickDays
        .map(({ label, offset }) => {
          const day = new Date(today);
          day.setDate(today.getDate() + offset);
          const key = dateKey(day);
          return `<button class="date-quick${key === els.ledgerDate.value ? " active" : ""}" type="button" data-ledger-date="${key}">${label}</button>`;
        })
        .join("")}
    </div>
    <div class="date-week-row">${weekDays}</div>
  `;
}

function toggleLedgerDatePopover(show) {
  if (!els.ledgerDatePopover || !els.ledgerDateDisplay) return;
  renderLedgerDatePopover();
  els.ledgerDatePopover.hidden = !show;
  els.ledgerDateDisplay.setAttribute("aria-expanded", String(show));
}

function renderLedgerList() {
  els.toggleLedgerList.setAttribute("aria-expanded", String(!ledgerListCollapsed));
  els.toggleLedgerList.innerHTML = `
    <i data-lucide="${ledgerListCollapsed ? "chevron-down" : "chevron-up"}"></i>
    <span>${ledgerListCollapsed ? "펼치기" : "접기"}</span>
  `;
  els.ledgerList.hidden = ledgerListCollapsed;
  if (ledgerListCollapsed) {
    els.ledgerList.innerHTML = "";
    return;
  }

  const recentTransactions = getRecentTransactions();
  if (!recentTransactions.length) {
    els.ledgerList.innerHTML = `
      <article class="empty-state">
        <strong>아직 가계부 기록이 없어요</strong>
        <p>지출이나 수입을 입력하면 최근 기록이 여기에 쌓여요.</p>
      </article>
    `;
    return;
  }

  els.ledgerList.innerHTML = recentTransactions
    .map((item) => {
      const sign = item.type === "income" ? "+" : "-";
      const badge = item.scheduleLabel ? `<em class="money-badge">${escapeHtml(item.scheduleLabel)}</em>` : "";
      return `
        <article class="money-item ${item.type}">
          <div>
            <strong>${escapeHtml(item.memo)}</strong>
            <p>${escapeHtml(item.category)} · ${formatShortDate(item.dateKey)} ${badge}</p>
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
  els.calendarMonthSummary.innerHTML = `
    <article>
      <span>지출</span>
      <strong>${formatWon(data.expense)}</strong>
    </article>
    <article>
      <span>수입</span>
      <strong>${formatWon(data.income)}</strong>
    </article>
    <article>
      <span>욕망저금통</span>
      <strong>${formatWon(data.desire)}</strong>
    </article>
  `;
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
  const items = getTransactionsForDate(selectedCalendarDate)
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
                <p>${escapeHtml(item.category)}${item.scheduleLabel ? ` · ${escapeHtml(item.scheduleLabel)}` : ""}</p>
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
  els.reportDesire.textContent = formatWon(data.desire);
  els.reportTypeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.reportType === reportType);
  });
  renderCategoryReport(data);
  renderReportDayList(data);
}

function renderCategoryReport(data) {
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

  const total = expenseRows.reduce((sum, [, amount]) => sum + amount, 0);
  const colors = ["#8b83d6", "#79b9aa", "#f2b8c8", "#f4d574", "#9ec7f0", "#c7b6ef", "#95d1b4", "#e6a7a1"];
  let cursor = 0;
  const segments = expenseRows
    .map(([, amount], index) => {
      const start = cursor;
      const size = (amount / total) * 100;
      cursor += size;
      return `${colors[index % colors.length]} ${start}% ${cursor}%`;
    })
    .join(", ");
  const topCategory = expenseRows[0];
  const legend = expenseRows
    .map(([category, amount], index) => {
      const percent = Math.round((amount / total) * 100);
      return `
        <li>
          <span class="legend-dot" style="background:${colors[index % colors.length]}"></span>
          <strong>${escapeHtml(category)}</strong>
          <em>${percent}%</em>
          <b>${formatWon(amount)}</b>
        </li>
      `;
    })
    .join("");

  els.categoryReport.innerHTML = `
    <div class="donut-report">
      <div
        class="donut-chart"
        style="background: conic-gradient(${segments});"
        role="img"
        aria-label="카테고리별 지출 비중"
      >
        <div>
          <span>가장 큼</span>
          <strong>${escapeHtml(topCategory[0])}</strong>
          <em>${Math.round((topCategory[1] / total) * 100)}%</em>
        </div>
      </div>
      <ul class="donut-legend">${legend}</ul>
    </div>
  `;
}

function renderReportDayList(data) {
  const monthKey = thisMonthKey(reportCursor);
  const lastDay = new Date(reportCursor.getFullYear(), reportCursor.getMonth() + 1, 0).getDate();
  const totalsByDay = {};

  data.transactions.forEach((item) => {
    totalsByDay[item.dateKey] ||= { expense: 0, income: 0, count: 0 };
    totalsByDay[item.dateKey][item.type] += item.amount;
    totalsByDay[item.dateKey].count += 1;
  });

  els.reportDayList.innerHTML = Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const key = `${monthKey}-${String(day).padStart(2, "0")}`;
    const totals = totalsByDay[key] || { expense: 0, income: 0, count: 0 };
    const detail = selectedReportDate === key
      ? `<section class="calendar-detail-panel report-day-inline-detail">${renderTransactionDetailForDate(key, "이 날의 가계부 내역이 없어요")}</section>`
      : "";
    return `
      <button class="report-day-row${selectedReportDate === key ? " active" : ""}" type="button" data-report-date="${key}">
        <span>${day}일</span>
        <strong>${totals.count ? `${totals.count}건` : "기록 없음"}</strong>
        <em>${totals.expense ? `-${formatWon(totals.expense)}` : ""}</em>
        <b>${totals.income ? `+${formatWon(totals.income)}` : ""}</b>
      </button>
      ${detail}
    `;
  }).join("");

  renderReportDayDetail();
}

function renderTransactionDetailForDate(key, emptyMessage) {
  const items = getTransactionsForDate(key);
  const totals = getTransactionTotals(items);
  const list = items.length
    ? items
        .map((item) => {
          const sign = item.type === "income" ? "+" : "-";
          return `
            <article class="money-item ${item.type}">
              <div>
                <strong>${escapeHtml(item.memo)}</strong>
                <p>${escapeHtml(item.category)}${item.scheduleLabel ? ` · ${escapeHtml(item.scheduleLabel)}` : ""}</p>
              </div>
              <span>${sign}${formatWon(item.amount)}</span>
            </article>
          `;
        })
        .join("")
    : `
      <article class="empty-state compact">
        <strong>${emptyMessage}</strong>
        <p>가계부 탭에서 이 날짜로 기록을 추가할 수 있어요.</p>
      </article>
    `;

  return `
    <div class="section-heading">
      <div>
        <span>날짜 상세</span>
        <h2>${formatShortDate(key)}</h2>
      </div>
    </div>
    <div class="day-summary-grid">
      <article>
        <span>지출</span>
        <strong>${formatWon(totals.expense)}</strong>
      </article>
      <article>
        <span>수입</span>
        <strong>${formatWon(totals.income)}</strong>
      </article>
      <article>
        <span>합계</span>
        <strong>${formatWon(totals.income - totals.expense)}</strong>
      </article>
    </div>
    <div class="day-transaction-list">${list}</div>
  `;
}

function renderReportDayDetail() {
  els.reportDayDetail.hidden = true;
  els.reportDayDetail.innerHTML = "";
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

function moveCategory(fromIndex, toIndex) {
  const categories = getCategories(settingsType);
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= categories.length || toIndex >= categories.length) {
    return false;
  }
  const [item] = categories.splice(fromIndex, 1);
  categories.splice(toIndex, 0, item);
  editingCategoryIconIndex = toIndex;
  selectedCategoryIcon = item.icon;
  saveState();
  render();
  return true;
}

function resetCategoryDrag() {
  window.clearTimeout(categoryDrag.timer);
  categoryDrag = {
    index: -1,
    overIndex: -1,
    pointerId: null,
    armed: false,
  };
  els.settingsCategoryList.classList.remove("dragging-list");
  els.settingsCategoryList.querySelectorAll(".settings-category-row").forEach((row) => {
    row.classList.remove("dragging", "drag-over");
  });
}

function markCategoryDragOver(index) {
  if (categoryDrag.overIndex === index) return;
  categoryDrag.overIndex = index;
  els.settingsCategoryList.querySelectorAll(".settings-category-row").forEach((row) => {
    row.classList.toggle("drag-over", Number(row.dataset.categoryRow) === index && index !== categoryDrag.index);
  });
}

function startCategoryDrag(index, pointerId, handle) {
  resetCategoryDrag();
  const row = handle.closest("[data-category-row]");
  categoryDrag.index = index;
  categoryDrag.overIndex = index;
  categoryDrag.pointerId = pointerId;
  categoryDrag.armed = true;
  els.settingsCategoryList.classList.add("dragging-list");
  row?.classList.add("dragging");
  markCategoryDragOver(index);
}

function updateCategoryDrag(clientX, clientY) {
  const row = document.elementFromPoint(clientX, clientY)?.closest("[data-category-row]");
  if (!row || !els.settingsCategoryList.contains(row)) return;
  markCategoryDragOver(Number(row.dataset.categoryRow));
}

function finishCategoryDrag(pointerId) {
  if (categoryDrag.pointerId !== pointerId) return;
  const fromIndex = categoryDrag.index;
  const toIndex = categoryDrag.overIndex;
  const shouldMove = categoryDrag.armed && fromIndex !== toIndex;
  resetCategoryDrag();
  if (shouldMove && moveCategory(fromIndex, toIndex)) {
    showToast("카테고리 순서를 바꿨어요.");
  }
}

function switchView(target) {
  els.tabs.forEach((item) => item.classList.toggle("active", item.dataset.view === target));
  els.views.forEach((view) => view.classList.toggle("active", view.dataset.viewPanel === target));
  if (els.monthSummary) els.monthSummary.hidden = target !== "ledger";
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
    if (card.dataset.summaryType === "desire") {
      switchView("desire");
      return;
    }
    reportType = card.dataset.summaryType;
    reportCursor = new Date(calendarCursor);
    syncReportControls();
    switchView("report");
    render();
  });
});

els.goViewButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.goView));
});

els.headerSettings.addEventListener("click", () => {
  switchView("settings");
  renderSettings();
  if (window.lucide) window.lucide.createIcons();
});

els.ledgerTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ledgerType = button.dataset.ledgerType;
    clearFieldErrors(els.ledgerForm);
    renderLedgerType();
    if (window.lucide) window.lucide.createIcons();
  });
});

els.quickTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    quickType = button.dataset.quickType;
    quickStep = "details";
    clearFieldErrors(els.quickEntryForm);
    if (quickType !== "expense") {
      quickPlanMode = "single";
    }
    selectedQuickCategory = getCategories(quickType)[0]?.name || "";
    renderQuickEntry();
    if (window.lucide) window.lucide.createIcons();
  });
});

els.quickPlanButtons.forEach((button) => {
  button.addEventListener("click", () => {
    quickPlanMode = button.dataset.quickPlanMode;
    els.quickInstallmentMonths.classList.remove("field-error");
    renderQuickPlan();
  });
});

els.ledgerCategoryPicker.addEventListener("click", (event) => {
  const option = event.target.closest("[data-category]");
  if (!option) return;
  selectedLedgerCategory = option.dataset.category;
  els.ledgerCategoryPicker.classList.remove("field-error");
  renderLedgerType();
  if (window.lucide) window.lucide.createIcons();
});

els.ledgerPlanButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ledgerPlanMode = button.dataset.planMode;
    renderLedgerPlan();
    if (window.lucide) window.lucide.createIcons();
  });
});

els.toggleLedgerList.addEventListener("click", () => {
  ledgerListCollapsed = !ledgerListCollapsed;
  renderLedgerList();
  if (window.lucide) window.lucide.createIcons();
});

els.quickCategoryPicker.addEventListener("click", (event) => {
  const option = event.target.closest("[data-quick-category]");
  if (!option) return;
  selectedQuickCategory = option.dataset.quickCategory;
  els.quickCategoryPicker.classList.remove("field-error");
  renderQuickEntry();
  if (window.lucide) window.lucide.createIcons();
});

els.quickAddCategory.addEventListener("click", () => {
  const result = createCategory(quickType, els.quickCategoryName.value, "tag");
  if (result.reason === "empty") {
    els.quickCategoryName.classList.add("field-error");
    showToast("카테고리 이름을 입력해 주세요.");
    return;
  }

  selectedQuickCategory = result.category.name;
  els.quickCategoryName.value = "";
  els.quickCategoryName.classList.remove("field-error");
  els.quickCategoryPicker.classList.remove("field-error");
  renderQuickEntry();
  showToast(result.ok ? "카테고리를 만들었어요." : "이미 있어서 선택했어요.");
  if (window.lucide) window.lucide.createIcons();
});

els.ledgerDateDisplay.addEventListener("click", () => {
  toggleLedgerDatePopover(els.ledgerDatePopover.hidden);
});

els.ledgerDatePopover.addEventListener("click", (event) => {
  const option = event.target.closest("[data-ledger-date]");
  if (!option) return;
  setLedgerDate(option.dataset.ledgerDate);
  els.ledgerDateDisplay.classList.remove("field-error");
  toggleLedgerDatePopover(false);
});

document.addEventListener("click", (event) => {
  if (!els.ledgerDatePopover || els.ledgerDatePopover.hidden) return;
  if (event.target.closest(".date-field")) return;
  toggleLedgerDatePopover(false);
});

document.addEventListener("input", (event) => {
  const monthInput = event.target.closest("[data-month-input]");
  if (monthInput) {
    monthInput.classList.remove("field-error");
    monthInput.value = monthInput.value.replace(/[^\d]/g, "");
    return;
  }
  const input = event.target.closest('input[inputmode="numeric"]');
  if (event.target.matches("input, textarea, select")) {
    event.target.classList.remove("field-error");
  }
  if (input) {
    normalizeAmountInput(input);
  }
});

els.quickCategoryName.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  els.quickAddCategory.click();
});

els.quickNext.addEventListener("click", () => {
  if (!validateQuickDetails()) return;
  quickStep = "category";
  renderQuickEntry();
  if (window.lucide) window.lucide.createIcons();
});

els.quickBack.addEventListener("click", () => {
  quickStep = "details";
  clearFieldErrors(els.quickEntryForm);
  renderQuickEntry();
  window.setTimeout(() => els.quickAmount.focus(), 80);
  if (window.lucide) window.lucide.createIcons();
});

els.ledgerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFieldErrors(els.ledgerForm);
  const formData = new FormData(els.ledgerForm);
  const memo = String(formData.get("memo")).trim();
  const amount = parseWon(formData.get("amount"));
  const selectedDate = String(formData.get("date"));
  const category = selectedLedgerCategory;
  const installmentMonths = parseMonthCount(formData.get("installmentMonths"));
  const needsMonths = ledgerType === "expense" && ledgerPlanMode !== "single";

  const invalidFields = [
    !selectedDate ? els.ledgerDateDisplay : null,
    !memo ? els.ledgerForm.elements.memo : null,
    amount <= 0 ? els.ledgerForm.elements.amount : null,
    needsMonths && installmentMonths <= 0 ? els.installmentMonths : null,
    !category ? els.ledgerCategoryPicker : null,
  ];

  if (invalidFields.some(Boolean)) {
    showFormErrors(invalidFields, needsMonths ? "메모와 금액, 개월 수를 확인해 주세요." : "메모와 금액을 확인해 주세요.");
    return;
  }

  const wasScheduledExpense = ledgerType === "expense" && ledgerPlanMode !== "single";
  if (wasScheduledExpense) {
    addLedgerSchedule({
      scheduleType: ledgerPlanMode === "repeat" ? "repeat" : "installment",
      memo,
      amount,
      category,
      selectedDate,
      months: installmentMonths,
    });
  } else {
    addLedgerTransaction({ type: ledgerType, memo, amount, category, selectedDate });
  }
  els.ledgerForm.reset();
  setLedgerDate(dateKey());
  ledgerPlanMode = "single";
  render();
  showToast(wasScheduledExpense ? "지출 일정을 만들었어요." : `${ledgerType === "income" ? "수입" : "지출"}을 기록했어요.`);
});

els.quickEntryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (quickStep !== "category") {
    if (!validateQuickDetails()) return;
    quickStep = "category";
    renderQuickEntry();
    if (window.lucide) window.lucide.createIcons();
    return;
  }
  clearFieldErrors(els.quickEntryForm);
  const formData = new FormData(els.quickEntryForm);
  const memo = String(formData.get("memo")).trim();
  const amount = parseWon(formData.get("amount"));
  const category = selectedQuickCategory;
  const installmentMonths = parseMonthCount(formData.get("quickInstallmentMonths"));
  const needsMonths = quickType === "expense" && quickPlanMode !== "single";

  const invalidFields = [
    !memo ? els.quickEntryForm.elements.memo : null,
    amount <= 0 ? els.quickEntryForm.elements.amount : null,
    needsMonths && installmentMonths <= 0 ? els.quickInstallmentMonths : null,
    !category ? els.quickCategoryPicker : null,
  ];

  if (invalidFields.some(Boolean)) {
    showFormErrors(invalidFields, needsMonths ? "메모와 금액, 개월 수를 확인해 주세요." : "메모와 금액을 확인해 주세요.");
    return;
  }

  const wasScheduledExpense = quickType === "expense" && quickPlanMode !== "single";
  if (wasScheduledExpense) {
    addLedgerSchedule({
      scheduleType: quickPlanMode === "repeat" ? "repeat" : "installment",
      memo,
      amount,
      category,
      selectedDate: dateKey(),
      months: installmentMonths,
    });
  } else {
    addLedgerTransaction({ type: quickType, memo, amount, category, selectedDate: dateKey() });
  }
  quickPlanMode = "single";
  quickStep = "details";
  closeQuickEntry();
  setLedgerDate(dateKey());
  render();
  showToast(wasScheduledExpense ? "지출 일정을 만들었어요." : `${quickType === "income" ? "수입" : "지출"}을 기록했어요.`);
});

els.reportYear.addEventListener("change", () => {
  reportCursor.setFullYear(Number(els.reportYear.value));
  selectedReportDate = "";
  renderReport();
});

els.reportMonth.addEventListener("change", () => {
  reportCursor.setMonth(Number(els.reportMonth.value) - 1);
  selectedReportDate = "";
  renderReport();
});

els.reportTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    reportType = button.dataset.reportType;
    renderReport();
  });
});

els.reportDayList.addEventListener("click", (event) => {
  const day = event.target.closest("[data-report-date]");
  if (!day) return;
  selectedReportDate = selectedReportDate === day.dataset.reportDate ? "" : day.dataset.reportDate;
  renderReport();
  if (window.lucide) window.lucide.createIcons();
});

els.settingsMenuCards.forEach((card) => {
  card.addEventListener("click", () => {
    activeSettingsMenu = card.dataset.settingsMenu;
    renderSettings();
    if (activeSettingsMenu === "data") {
      showToast("이 설정은 조금 뒤에 열어둘게요.");
    }
    if (window.lucide) window.lucide.createIcons();
  });
});

els.moodPicker.addEventListener("click", (event) => {
  const option = event.target.closest("[data-theme-option]");
  if (!option) return;
  state.appearance.theme = option.dataset.themeOption;
  applyTheme(state.appearance.theme);
  saveState();
  renderSettings();
  showToast("화면 분위기를 바꿨어요.");
  if (window.lucide) window.lucide.createIcons();
});

els.quickStartToggle.addEventListener("change", () => {
  state.quickEntry.enabled = els.quickStartToggle.checked;
  saveState();
  renderSettings();
  showToast(state.quickEntry.enabled ? "앱 시작 빠른 입력을 켰어요." : "앱 시작 빠른 입력을 껐어요.");
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
  const result = createCategory(settingsType, name, selectedCategoryIcon);
  if (result.reason === "empty") {
    showToast("카테고리 이름을 입력해 주세요.");
    return;
  }

  if (result.reason === "duplicate") {
    showToast("이미 있는 카테고리예요.");
    return;
  }

  editingCategoryIconIndex = -1;
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

els.settingsCategoryList.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest("[data-drag-category]");
  if (!handle) return;
  event.preventDefault();
  const index = Number(handle.dataset.dragCategory);
  startCategoryDrag(index, event.pointerId, handle);

  try {
    handle.setPointerCapture(event.pointerId);
  } catch {
    // Pointer capture is a nice-to-have; the drag still works without it.
  }
});

els.settingsCategoryList.addEventListener("pointermove", (event) => {
  if (categoryDrag.pointerId !== event.pointerId || !categoryDrag.armed) return;
  event.preventDefault();
  updateCategoryDrag(event.clientX, event.clientY);
});

document.addEventListener("pointermove", (event) => {
  if (categoryDrag.pointerId !== event.pointerId || !categoryDrag.armed) return;
  event.preventDefault();
  updateCategoryDrag(event.clientX, event.clientY);
});

document.addEventListener("pointerup", (event) => {
  if (categoryDrag.pointerId === event.pointerId && categoryDrag.armed) {
    updateCategoryDrag(event.clientX, event.clientY);
  }
  finishCategoryDrag(event.pointerId);
});

document.addEventListener("pointercancel", resetCategoryDrag);

els.settingsCategoryList.addEventListener("mousedown", (event) => {
  const handle = event.target.closest("[data-drag-category]");
  if (!handle || categoryDrag.pointerId !== null) return;
  event.preventDefault();
  startCategoryDrag(Number(handle.dataset.dragCategory), "mouse", handle);
});

document.addEventListener("mousemove", (event) => {
  if (categoryDrag.pointerId !== "mouse" || !categoryDrag.armed) return;
  event.preventDefault();
  updateCategoryDrag(event.clientX, event.clientY);
});

document.addEventListener("mouseup", (event) => {
  if (categoryDrag.pointerId === "mouse" && categoryDrag.armed) {
    updateCategoryDrag(event.clientX, event.clientY);
  }
  finishCategoryDrag("mouse");
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
  setLedgerDate(selectedCalendarDate);
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

els.closeQuickEntry.addEventListener("click", closeQuickEntry);
els.quickEntry.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-quick]")) closeQuickEntry();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!els.quickEntry.hidden) {
    closeQuickEntry();
    return;
  }
  if (!els.recordModal.hidden) closeRecordDetail();
});

initReportControls();
setLedgerDate(dateKey());
render();
if (shouldOpenQuickEntry()) {
  window.setTimeout(openQuickEntry, 420);
}

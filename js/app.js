import { calculateYarnCount, formatValue, reverseCalculate } from './calculator.js';
import { initPWA, promptInstall } from './pwa.js';

// DOM Element References
const inputLength = document.getElementById('input-length');
const inputWeight = document.getElementById('input-weight');
const clearLenBtn = document.getElementById('clear-length');
const clearWtBtn = document.getElementById('clear-weight');
const lenError = document.getElementById('len-error');
const wtError = document.getElementById('wt-error');

const btnCalculate = document.getElementById('btn-calculate');
const resultsSection = document.getElementById('results-section');
const btnBackInputs = document.getElementById('btn-back-inputs');

const valTex = document.getElementById('val-tex');
const valEng = document.getElementById('val-eng');
const valDenier = document.getElementById('val-denier');
const valMetric = document.getElementById('val-metric');

const precisionSelect = document.getElementById('precision-select');
const classBadge = document.getElementById('class-badge');
const classDesc = document.getElementById('class-desc');
const gaugeMarker = document.getElementById('gauge-marker');

const btnSaveRecord = document.getElementById('btn-save-record');
const btnShareReport = document.getElementById('btn-share-report');
const btnResetInputs = document.getElementById('btn-reset-inputs');
const historyList = document.getElementById('history-list');
const btnClearHistory = document.getElementById('btn-clear-history');
const btnExportCsv = document.getElementById('btn-export-csv');

const btnInstall = document.getElementById('btn-install');
const btnTheme = document.getElementById('btn-theme');
const iconMoon = document.getElementById('icon-moon');
const iconSun = document.getElementById('icon-sun');

const networkStatus = document.getElementById('network-status');
const networkText = document.getElementById('network-text');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');

const tabDirect = document.getElementById('tab-direct');
const tabReverse = document.getElementById('tab-reverse');
const paneDirect = document.getElementById('pane-direct');
const paneReverse = document.getElementById('pane-reverse');

const revCountType = document.getElementById('rev-count-type');
const revCountVal = document.getElementById('rev-count-val');
const revLengthVal = document.getElementById('rev-length-val');
const revResultWt = document.getElementById('rev-result-wt');

const accordionToggle = document.getElementById('accordion-toggle');
const accordion = document.getElementById('formula-accordion');

const iosModal = document.getElementById('ios-modal');
const iosModalClose = document.getElementById('ios-modal-close');
const iosGotIt = document.getElementById('ios-got-it');

// State
let currentPrecision = localStorage.getItem('yarncalc_precision') || '2';
let historyData = JSON.parse(localStorage.getItem('yarncalc_history') || '[]');
let currentCalculation = null;
let pwaPlatform = 'standard';

// Toast Alert Helper
let toastTimer = null;
function showToast(message) {
  if (toastTimer) clearTimeout(toastTimer);
  toastMsg.textContent = message;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2400);
}

// Calculate and Update UI
function performCalculation(shouldPulse = false) {
  const L = parseFloat(inputLength.value);
  const g = parseFloat(inputWeight.value);

  // Validate
  let hasError = false;
  if (isNaN(L) || L <= 0) {
    lenError.style.display = 'inline';
    hasError = true;
  } else {
    lenError.style.display = 'none';
  }

  if (isNaN(g) || g <= 0) {
    wtError.style.display = 'inline';
    hasError = true;
  } else {
    wtError.style.display = 'none';
  }

  // Update clear button visibility
  if (inputLength.value) {
    clearLenBtn.classList.add('has-value');
  } else {
    clearLenBtn.classList.remove('has-value');
  }

  if (inputWeight.value) {
    clearWtBtn.classList.add('has-value');
  } else {
    clearWtBtn.classList.remove('has-value');
  }

  if (hasError) {
    valTex.textContent = '--';
    valEng.textContent = '--';
    valDenier.textContent = '--';
    valMetric.textContent = '--';
    classBadge.textContent = 'Awaiting input';
    classDesc.textContent = 'Please enter positive values for yarn length (m) and weight (g).';
    gaugeMarker.style.left = '0%';
    currentCalculation = null;
    return false;
  }

  const result = calculateYarnCount(L, g);
  currentCalculation = result;

  valTex.textContent = formatValue(result.tex, currentPrecision);
  valEng.textContent = formatValue(result.eng, currentPrecision);
  valDenier.textContent = formatValue(result.denier, currentPrecision);
  valMetric.textContent = formatValue(result.metric, currentPrecision);

  if (result.classification) {
    classBadge.textContent = result.classification.category;
    classDesc.textContent = result.classification.description;
    gaugeMarker.style.left = `${result.classification.gaugePercent}%`;
  }

  if (shouldPulse) {
    const cards = document.querySelectorAll('.count-card');
    cards.forEach(c => {
      c.classList.remove('pulse-anim');
      void c.offsetWidth; // trigger reflow
      c.classList.add('pulse-anim');
    });
  }

  return true;
}

// Calculate and reveal results with smooth scroll
function calculateAndShowResults() {
  const success = performCalculation(true);
  if (success) {
    resultsSection.classList.remove('is-hidden');
    resultsSection.classList.add('revealed');
    // Scroll smoothly to results section
    setTimeout(() => {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  } else {
    showToast('Please enter positive length and weight');
  }
}

// Save Current Calculation to History
function saveCurrentToHistory() {
  if (!currentCalculation || !currentCalculation.isValid) {
    showToast('Calculate counts first to save');
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const record = {
    id: Date.now(),
    timestamp: `${dateStr}, ${timeStr}`,
    L: currentCalculation.inputs.lengthMeters,
    g: currentCalculation.inputs.weightGrams,
    tex: currentCalculation.tex,
    eng: currentCalculation.eng,
    denier: currentCalculation.denier,
    metric: currentCalculation.metric,
    category: currentCalculation.classification?.category || ''
  };

  historyData.unshift(record);
  if (historyData.length > 30) {
    historyData.pop();
  }

  localStorage.setItem('yarncalc_history', JSON.stringify(historyData));
  renderHistoryList();
  showToast('Saved to history log');
}

// Render History
function renderHistoryList() {
  if (historyData.length === 0) {
    historyList.innerHTML = `<div class="empty-state">No saved calculations yet. Enter values and tap "Calculate".</div>`;
    return;
  }

  historyList.innerHTML = historyData.map((item) => {
    return `
      <div class="history-item" data-id="${item.id}" title="Tap to load these values into calculator">
        <div class="history-meta">
          <span class="history-inputs">${item.L} m • ${item.g} g</span>
          <span class="history-time">${item.timestamp} ${item.category ? `• ${item.category}` : ''}</span>
        </div>
        <div class="history-results">
          <span class="history-pill" style="color: var(--color-tex)">${formatValue(item.tex, 1)} tex</span>
          <span class="history-pill" style="color: var(--color-eng)">${formatValue(item.eng, 1)} Ne</span>
          <span class="history-pill" style="color: var(--color-denier)">${formatValue(item.denier, 0)} D</span>
        </div>
      </div>
    `;
  }).join('');

  // Add click listeners to restore calculation
  historyList.querySelectorAll('.history-item').forEach((row) => {
    row.addEventListener('click', () => {
      const id = Number(row.dataset.id);
      const found = historyData.find(i => i.id === id);
      if (found) {
        inputLength.value = found.L;
        inputWeight.value = found.g;
        calculateAndShowResults();
        showToast(`Loaded ${found.L}m / ${found.g}g`);
      }
    });
  });
}

// Copy Summary / Share
async function shareOrCopyReport() {
  if (!currentCalculation || !currentCalculation.isValid) {
    // If not calculated yet, calculate first
    const ok = performCalculation(false);
    if (!ok) {
      showToast('Please calculate counts first');
      return;
    }
  }

  const p = currentPrecision;
  const summaryText = 
`🧵 Yarn Count Report (YarnCalc Pro)
-------------------------------------
• Sample Length: ${currentCalculation.inputs.lengthMeters} meters
• Sample Weight: ${currentCalculation.inputs.weightGrams} grams

• Tex: ${formatValue(currentCalculation.tex, p)} tex  [(g÷L)×1000]
• English (Ne): ${formatValue(currentCalculation.eng, p)} s Ne  [590.5÷Tex]
• Denier: ${formatValue(currentCalculation.denier, p)} D  [5315÷eng]
• Metric (Nm): ${formatValue(currentCalculation.metric, p)} Nm  [eng÷0.59]

Category: ${currentCalculation.classification?.category || 'Standard'}
Classification: ${currentCalculation.classification?.description || ''}
-------------------------------------
Generated with YarnCalc Pro`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Yarn Count Calculation',
        text: summaryText
      });
      return;
    } catch {
      // User cancelled share or fallback to clipboard
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(summaryText);
    showToast('Report copied to clipboard!');
  } catch {
    showToast('Unable to copy automatically');
  }
}

// Copy specific card value
async function copyCardValue(type) {
  if (!currentCalculation || !currentCalculation.isValid) {
    showToast('No calculated value to copy');
    return;
  }

  let textToCopy = '';
  let label = '';
  const p = currentPrecision;

  if (type === 'tex') {
    textToCopy = `${formatValue(currentCalculation.tex, p)} tex`;
    label = 'Tex';
  } else if (type === 'eng') {
    textToCopy = `${formatValue(currentCalculation.eng, p)} Ne`;
    label = 'English Count';
  } else if (type === 'denier') {
    textToCopy = `${formatValue(currentCalculation.denier, p)} Denier`;
    label = 'Denier';
  } else if (type === 'metric') {
    textToCopy = `${formatValue(currentCalculation.metric, p)} Nm`;
    label = 'Metric Count';
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    showToast(`Copied ${label}: ${textToCopy}`);
  } catch {
    showToast('Could not copy to clipboard');
  }
}

// Export History to CSV
function exportHistoryCsv() {
  if (historyData.length === 0) {
    showToast('No history records to export');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Timestamp,Length_m,Weight_g,Tex,English_Ne,Denier,Metric_Nm,Category\n";

  historyData.forEach(item => {
    csvContent += `"${item.timestamp}",${item.L},${item.g},${item.tex.toFixed(4)},${item.eng.toFixed(4)},${item.denier.toFixed(4)},${item.metric.toFixed(4)},"${item.category || ''}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `yarncalc_history_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Downloaded history CSV');
}

// Reverse Calculation Logic
function handleReverseCalculation() {
  const countType = revCountType.value;
  const countVal = parseFloat(revCountVal.value);
  const targetL = parseFloat(revLengthVal.value);

  if (isNaN(countVal) || countVal <= 0 || isNaN(targetL) || targetL <= 0) {
    revResultWt.textContent = '-- g';
    return;
  }

  const res = reverseCalculate({
    type: countType,
    countValue: countVal,
    targetLength: targetL
  });

  if (res && !isNaN(res.weightGrams)) {
    revResultWt.textContent = `${formatValue(res.weightGrams, currentPrecision)} g`;
  } else {
    revResultWt.textContent = '-- g';
  }
}

// Event Listeners Setup
function initEventListeners() {
  // Primary Calculate Button
  btnCalculate.addEventListener('click', calculateAndShowResults);

  // Back to inputs button
  if (btnBackInputs) {
    btnBackInputs.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      inputLength.focus();
    });
  }

  // Clear inputs helper
  inputLength.addEventListener('input', () => {
    if (resultsSection.classList.contains('revealed')) {
      performCalculation(false);
    }
  });
  inputWeight.addEventListener('input', () => {
    if (resultsSection.classList.contains('revealed')) {
      performCalculation(false);
    }
  });

  // Clear buttons
  clearLenBtn.addEventListener('click', () => {
    inputLength.value = '';
    inputLength.focus();
    clearLenBtn.classList.remove('has-value');
  });

  clearWtBtn.addEventListener('click', () => {
    inputWeight.value = '';
    inputWeight.focus();
    clearWtBtn.classList.remove('has-value');
  });

  // Quick Chips Actions (Steppers & Presets)
  document.querySelectorAll('.chip-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const val = parseFloat(btn.dataset.val);
      if (action === 'add-len') {
        const current = parseFloat(inputLength.value) || 0;
        inputLength.value = Math.max(0, current + val);
      } else if (action === 'set-len') {
        inputLength.value = val;
      } else if (action === 'add-wt') {
        const current = parseFloat(inputWeight.value) || 0;
        inputWeight.value = Number(Math.max(0, current + val).toFixed(4));
      } else if (action === 'set-wt') {
        inputWeight.value = val;
      }
      if (resultsSection.classList.contains('revealed')) {
        performCalculation(true);
      }
    });
  });

  // Standard Lab Presets
  document.querySelectorAll('.preset-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (preset === 'wrap-reel') {
        inputLength.value = '100';
        inputWeight.value = '2.0';
      } else if (preset === 'lea-30s') {
        inputLength.value = '109.73';
        inputWeight.value = '2.16';
      } else if (preset === 'polyester-150') {
        inputLength.value = '100';
        inputWeight.value = '1.67';
      } else if (preset === 'denim-10s') {
        inputLength.value = '100';
        inputWeight.value = '5.91';
      } else if (preset === 'micro-test') {
        inputLength.value = '10';
        inputWeight.value = '0.15';
      }
      calculateAndShowResults();
      showToast(`Applied: ${btn.querySelector('span').textContent}`);
    });
  });

  // Secondary Action Buttons (Save, Share, Reset)
  btnSaveRecord.addEventListener('click', saveCurrentToHistory);
  btnShareReport.addEventListener('click', shareOrCopyReport);
  btnResetInputs.addEventListener('click', () => {
    inputLength.value = '100';
    inputWeight.value = '2.0';
    lenError.style.display = 'none';
    wtError.style.display = 'none';
    resultsSection.classList.remove('revealed');
    resultsSection.classList.add('is-hidden');
    currentCalculation = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Reset to default (100m / 2.0g)');
  });

  // Precision selector
  precisionSelect.value = currentPrecision;
  precisionSelect.addEventListener('change', () => {
    currentPrecision = precisionSelect.value;
    localStorage.setItem('yarncalc_precision', currentPrecision);
    if (resultsSection.classList.contains('revealed')) {
      performCalculation(false);
    }
    handleReverseCalculation();
  });

  // Copy Buttons on each Card
  document.querySelectorAll('.copy-mini-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.copy;
      copyCardValue(type);
    });
  });

  // History Actions
  btnClearHistory.addEventListener('click', () => {
    if (confirm('Clear all calculation history?')) {
      historyData = [];
      localStorage.removeItem('yarncalc_history');
      renderHistoryList();
      showToast('History cleared');
    }
  });

  btnExportCsv.addEventListener('click', exportHistoryCsv);

  // Tabs Switching
  tabDirect.addEventListener('click', () => {
    tabDirect.classList.add('active');
    tabReverse.classList.remove('active');
    paneDirect.style.display = 'block';
    paneReverse.style.display = 'none';
  });

  tabReverse.addEventListener('click', () => {
    tabReverse.classList.add('active');
    tabDirect.classList.remove('active');
    paneReverse.style.display = 'block';
    paneDirect.style.display = 'none';
    handleReverseCalculation();
  });

  // Reverse Calculator Inputs
  revCountType.addEventListener('change', handleReverseCalculation);
  revCountVal.addEventListener('input', handleReverseCalculation);
  revLengthVal.addEventListener('input', handleReverseCalculation);

  // Formula Accordion
  accordionToggle.addEventListener('click', () => {
    accordion.classList.toggle('open');
    const isOpen = accordion.classList.contains('open');
    accordionToggle.setAttribute('aria-expanded', isOpen);
  });

  // Theme Toggle
  const savedTheme = localStorage.getItem('yarncalc_theme') || 'dark';
  applyTheme(savedTheme);
  btnTheme.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // PWA Install Button
  btnInstall.addEventListener('click', async () => {
    if (pwaPlatform === 'ios') {
      iosModal.classList.add('active');
    } else {
      const accepted = await promptInstall();
      if (accepted) {
        showToast('Installing YarnCalc Pro...');
        btnInstall.style.display = 'none';
      }
    }
  });

  // iOS Modal Controls
  iosModalClose.addEventListener('click', () => {
    iosModal.classList.remove('active');
  });
  iosGotIt.addEventListener('click', () => {
    iosModal.classList.remove('active');
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('yarncalc_theme', theme);
  if (theme === 'dark') {
    iconMoon.style.display = 'block';
    iconSun.style.display = 'none';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0f172a');
  } else {
    iconMoon.style.display = 'none';
    iconSun.style.display = 'block';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#f1f5f9');
  }
}

// Initialize Application
function init() {
  initEventListeners();
  renderHistoryList();

  // Initialize PWA Lifecycle
  initPWA({
    onInstallStateChange: ({ canInstall, isInstalled, platform }) => {
      if (canInstall && !isInstalled) {
        pwaPlatform = platform || 'standard';
        btnInstall.style.display = 'inline-flex';
      } else if (isInstalled) {
        btnInstall.style.display = 'none';
      }
    },
    onNetworkChange: (isOnline) => {
      if (isOnline) {
        networkStatus.className = 'online-indicator';
        networkText.textContent = 'Online';
        showToast('You are back online');
      } else {
        networkStatus.className = 'online-indicator offline';
        networkText.textContent = 'Offline (PWA Mode)';
        showToast('Working offline with full functionality');
      }
    }
  });
}

// Start
init();

let isRunning = false;
let timerInterval = null;
// timer.js
const MODES = {
    work: { label: 'Work', seconds: 25 * 60 },
    short: { label: 'Short Break', seconds: 5 * 60 },
    long: { label: 'Long Break', seconds: 15 * 60 }
};
let currentMode = 'work';
let remainingSeconds = MODES[currentMode].seconds;
let sessionCount = 0;
const SESSIONS_PER_SET = 4;

function updateTimerDisplay() {
    const min = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
    const sec = String(remainingSeconds % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${min}:${sec}`;
    document.getElementById('mode-label').textContent = MODES[currentMode].label;
    document.getElementById('session-count').textContent = sessionCount;
    // 円形進捗バー更新
    const circle = document.getElementById('progress-circle');
    const r = 100;
    const c = 2 * Math.PI * r;
    circle.setAttribute('stroke-dasharray', c);
    let total = MODES[currentMode].seconds;
    let percent = (total - remainingSeconds) / total;
    // stroke-dashoffsetで進捗を表現（0で空、cで全塗り）
    circle.setAttribute('stroke-dashoffset', (1 - percent) * c);
    // 残り時間が0未満にならないように
    if (remainingSeconds < 0) {
        document.getElementById('timer').textContent = '00:00';
    }
}


function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timerInterval = setInterval(() => {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            if (currentMode === 'work') {
                sessionCount++;
                updateTimerDisplay();
            }
            notifyTimerEnd();
        }
    }, 1000);
function notifyTimerEnd() {
    // Web通知
    if (window.Notification && Notification.permission === 'granted') {
        new Notification('タイマー終了', { body: MODES[currentMode].label + 'タイムが終了しました！' });
    } else if (window.Notification && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('タイマー終了', { body: MODES[currentMode].label + 'タイムが終了しました！' });
            }
        });
    }
    // アラート音
    const beep = new Audio('https://freesound.org/data/previews/522/522741_11525840-lq.mp3');
    beep.play();
}
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        isRunning = false;
    }
}


function resetTimer() {
    pauseTimer();
    remainingSeconds = MODES[currentMode].seconds;
    updateTimerDisplay();
}


function switchMode(mode) {
    if (!MODES[mode]) return;
    currentMode = mode;
    resetTimer();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-btn').addEventListener('click', startTimer);
    document.getElementById('pause-btn').addEventListener('click', pauseTimer);
    document.getElementById('reset-btn').addEventListener('click', resetTimer);
    document.getElementById('work-btn').addEventListener('click', () => switchMode('work'));
    document.getElementById('short-break-btn').addEventListener('click', () => switchMode('short'));
    document.getElementById('long-break-btn').addEventListener('click', () => switchMode('long'));
    updateTimerDisplay();
    // 通知許可リクエスト
    if (window.Notification && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
});

function startCountdown({ targetTime, elementId, endText }) {
  const target = new Date(targetTime).getTime();
  const timerElement = document.getElementById(elementId);

  function updateTimer() {
    const now = new Date().getTime();
    const distance = target - now;

    if (distance <= 0) {
      timerElement.textContent = endText;
      clearInterval(interval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timerElement.textContent = `${days}天 ${hours}時 ${minutes}分 ${seconds}秒`;
  }

  updateTimer();
  const interval = setInterval(updateTimer, 1000);
  return interval; // 回傳 interval id
}
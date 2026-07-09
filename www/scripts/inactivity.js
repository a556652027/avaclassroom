function idleTimer() {
  var t;

  // [優化] 使用 AbortController 統一管理全域事件生命週期，避免 Memory Leak
  if (window._idleEventController) window._idleEventController.abort();
  window._idleEventController = new AbortController();
  const signal = window._idleEventController.signal;

  window.addEventListener("click", resetTimer, { signal });
  window.addEventListener("scroll", resetTimer, { signal });
  window.addEventListener("keypress", resetTimer, { signal });

  function logout() {
    if (location.pathname.split("/").pop() !== "login.html") {
      window.location.href = "login.html";
    }
    sessionStorage.clear();
  }

  function resetTimer() {
    clearTimeout(t);
    t = setTimeout(logout, 1800 * 1000); // 縮短為 30 分鐘 (1800 秒)
  }
}
idleTimer();

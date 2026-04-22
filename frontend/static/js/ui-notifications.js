/**
 * In-app notifications (toast).
 * Replaces blocking browser popups for better UX.
 */
(function () {
  function ensureContainer() {
    let container = document.getElementById("app-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "app-toast-container";
      container.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] pointer-events-none flex flex-col items-center gap-4 w-full max-w-md px-4";
      document.body.appendChild(container);
    }
    return container;
  }

  function iconForType(type) {
    if (type === "success") return "✓";
    if (type === "warning") return "!";
    if (type === "error") return "✕";
    return "i";
  }

  function showAppNotice(message, type = "info", duration = 4200) {
    const container = ensureContainer();
    const toast = document.createElement("div");
    toast.className = `app-toast app-toast-${type} pointer-events-auto bg-white shadow-2xl rounded-xl border-l-4 p-4 flex items-center gap-4 w-full transform transition-all duration-300 scale-95 opacity-0`;
    setTimeout(() => { toast.classList.remove('scale-95', 'opacity-0'); toast.classList.add('scale-100', 'opacity-100'); }, 10);
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");

    const icon = document.createElement("span");
    icon.className = "app-toast-icon";
    icon.textContent = iconForType(type);

    const text = document.createElement("p");
    text.className = "app-toast-message";
    text.textContent = message;

    const close = document.createElement("button");
    close.type = "button";
    close.className = "app-toast-close";
    close.setAttribute("aria-label", "Dismiss notification");
    close.textContent = "×";

    close.addEventListener("click", function () {
      dismissToast(toast);
    });

    toast.appendChild(icon);
    toast.appendChild(text);
    toast.appendChild(close);
    container.appendChild(toast);

    if (duration > 0) {
      window.setTimeout(function () {
        dismissToast(toast);
      }, duration);
    }
  }

  function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add("app-toast-exit");
    window.setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 220);
  }

  window.showAppNotice = showAppNotice;
})();

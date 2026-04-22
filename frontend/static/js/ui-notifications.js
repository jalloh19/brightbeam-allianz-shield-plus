/**
 * In-app notifications (toast).
 * Replaces blocking browser popups for better UX.
 */
(function () {
  function normalizeMessage(message) {
    if (!message) return "Something went wrong. Please try again.";
    if (Array.isArray(message)) return message.join(" ");
    return String(message);
  }

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
    text.textContent = normalizeMessage(message);

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

  function showAppBanner(message, type = "info", targetId = "app-banner-host") {
    const target = document.getElementById(targetId);
    if (!target) return;
    const text = normalizeMessage(message);
    const classes = {
      success: "bg-green-50 border-green-300 text-green-800",
      warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
      error: "bg-red-50 border-red-300 text-red-800",
      info: "bg-blue-50 border-blue-300 text-blue-800",
    };
    target.innerHTML = `
      <div class="border rounded-lg p-3 ${classes[type] || classes.info}" role="status" aria-live="polite">
        <div class="flex justify-between items-start gap-3">
          <p class="text-sm font-medium">${text}</p>
          <button type="button" class="text-lg leading-none opacity-70 hover:opacity-100" aria-label="Dismiss banner">×</button>
        </div>
      </div>
    `;
    const btn = target.querySelector("button");
    if (btn) {
      btn.addEventListener("click", function () {
        target.innerHTML = "";
      });
    }
  }

  async function parseApiError(response, fallbackMessage) {
    const fallback = fallbackMessage || "We couldn't complete your request. Please try again.";
    if (!response) return fallback;
    try {
      const payload = await response.clone().json();
      if (typeof payload === "string") return payload;
      if (payload.detail) return normalizeMessage(payload.detail);
      const firstKey = Object.keys(payload || {})[0];
      if (!firstKey) return fallback;
      return normalizeMessage(payload[firstKey]);
    } catch (_err) {
      return `${fallback} (HTTP ${response.status})`;
    }
  }

  window.showAppNotice = showAppNotice;
  window.showAppBanner = showAppBanner;
  window.parseApiError = parseApiError;
})();

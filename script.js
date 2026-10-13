(() => {
  document.documentElement.classList.replace("no-js", "js");
  const locale = document.body.dataset.locale === "en" ? "en" : "ru";
  const config = window.ZOTOV_SITE_CONFIG || {};
  const copy = {
    ru: {
      openMenu: "Открыть меню",
      closeMenu: "Закрыть меню",
      opening: "Открываю черновик письма. Проверьте его и нажмите «Отправить» в почтовой программе. Если она не открылась, напишите на aleks@zotov.pro.",
      unavailable: "Почтовый адрес пока недоступен. Напишите через ссылку выше.",
      required: "Заполните имя, электронную почту и описание задачи.",
      email: "Укажите корректный адрес электронной почты.",
      subject: "Задача для Zotov Studio",
      form: (data) => `Имя: ${data.name}\nЭлектронная почта: ${data.email}\nКомпания или роль: ${data.company || "—"}\n\nЗадача:\n${data.message}`
    },
    en: {
      openMenu: "Open menu",
      closeMenu: "Close menu",
      opening: "Opening your email draft. Review it and press Send in your email app. If it did not open, write to aleks@zotov.pro.",
      unavailable: "The email address is not available yet. Please use the contact link above.",
      required: "Enter your name, email address and project details.",
      email: "Enter a valid email address.",
      subject: "Project for Zotov Studio",
      form: (data) => `Name: ${data.name}\nEmail: ${data.email}\nCompany or role: ${data.company || "—"}\n\nProject:\n${data.message}`
    }
  }[locale];

  const currentYear = document.querySelector("[data-current-year]");
  if (currentYear) currentYear.textContent = new Date().getFullYear();

  const header = document.querySelector("[data-header]");
  const refreshHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  refreshHeader();
  window.addEventListener("scroll", refreshHeader, { passive: true });

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  if (menuToggle && menu) {
    const setOpen = (open, returnFocus = false) => {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? copy.closeMenu : copy.openMenu);
      menu.classList.toggle("is-open", open);
      if (open) menu.querySelector("a")?.focus();
      if (!open && returnFocus) menuToggle.focus();
    };
    menuToggle.addEventListener("click", () => setOpen(menuToggle.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") setOpen(false, true);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 980 && menuToggle.getAttribute("aria-expanded") === "true") setOpen(false);
    });
  }

  const form = document.querySelector("[data-brief-form]");
  const status = document.querySelector("[data-form-status]");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    let valid = true;
    ["name", "email", "message"].forEach((name) => {
      const field = form.elements[name];
      const hasValue = String(data[name] || "").trim().length > 0;
      field.setAttribute("aria-invalid", String(!hasValue));
      valid &&= hasValue;
    });
    if (!valid) {
      status.className = "form-status is-error";
      status.textContent = copy.required;
      return;
    }
    const email = String(data.email).trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      form.elements.email.setAttribute("aria-invalid", "true");
      status.className = "form-status is-error";
      status.textContent = copy.email;
      return;
    }
    if (!config.contactEmail) {
      status.className = "form-status is-error";
      status.textContent = copy.unavailable;
      return;
    }
    status.className = "form-status";
    status.textContent = copy.opening;
    const body = copy.form({ ...data, email });
    window.location.href = `mailto:${config.contactEmail}?subject=${encodeURIComponent(copy.subject)}&body=${encodeURIComponent(body)}`;
  });

  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => field.removeAttribute("aria-invalid"));
  });
})();

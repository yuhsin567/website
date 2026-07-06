(function () {
  const heroEl = document.querySelector(".hero");
  const jumpBtns = Array.from(document.querySelectorAll(".jump-btn"));
  const floatingRsvp = document.getElementById("floatingRsvp");
  const transportTabs = Array.from(document.querySelectorAll(".transport-tab"));
  const formLink = document.getElementById("formLink");
  const sheetLink = document.getElementById("sheetLink");
  const statusEl = document.getElementById("status");
  const form = document.getElementById("rsvpForm");
  const submitBtn = document.getElementById("submitBtn");

  const cfg = window.APP_CONFIG || {};
  const formUrl = cfg.googleFormUrl || "";
  const sheetUrl = cfg.googleSheetUrl || "";
  const responseEndpoint = cfg.googleFormResponseUrl || (formUrl ? formUrl.replace(/\/viewform.*$/, "/formResponse") : "");
  const formBzx = cfg.formBzx || "8390169052261172385";
  const fieldIds = cfg.fieldIds || {
    name: "entry.1437893312",
    adults: "entry.171515007",
    kids: "entry.666883281",
    vegetarian: "entry.465027277",
    note: "entry.1868629546"
  };

  const setCountdown = () => {
    if (!heroEl) {
      return;
    }

    const eventTimeRaw = heroEl.getAttribute("data-event-time");
    const end = eventTimeRaw ? new Date(eventTimeRaw).getTime() : NaN;
    if (!Number.isFinite(end)) {
      return;
    }

    const now = Date.now();
    const diff = Math.max(0, end - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    const dayEl = document.getElementById("countDays");
    const hourEl = document.getElementById("countHours");
    const minEl = document.getElementById("countMins");
    if (dayEl) dayEl.textContent = String(days);
    if (hourEl) hourEl.textContent = String(hours).padStart(2, "0");
    if (minEl) minEl.textContent = String(mins).padStart(2, "0");
  };

  const smoothJumpTo = (id) => {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const updateTransportTab = (panelId) => {
    transportTabs.forEach((tab) => {
      const active = tab.dataset.panel === panelId;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    document.querySelectorAll(".transport-panel").forEach((panel) => {
      const active = panel.id === panelId;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
  };

  const toggleFloatingRsvp = () => {
    if (!floatingRsvp) {
      return;
    }

    const show = window.scrollY > 520;
    floatingRsvp.classList.toggle("show", show);
  };

  const renderStatus = (message, type) => {
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message;
    statusEl.classList.remove("ok", "err");
    if (type) {
      statusEl.classList.add(type);
    }
  };

  const hiddenForm = document.getElementById("googleFormSubmit");
  const hiddenFieldName = document.getElementById("hiddenFieldName");
  const hiddenFieldAdults = document.getElementById("hiddenFieldAdults");
  const hiddenFieldKids = document.getElementById("hiddenFieldKids");
  const hiddenFieldVegetarian = document.getElementById("hiddenFieldVegetarian");
  const hiddenFieldNote = document.getElementById("hiddenFieldNote");

  if (hiddenForm) {
    hiddenForm.action = responseEndpoint;
    hiddenForm.method = "POST";
    hiddenForm.enctype = "application/x-www-form-urlencoded";
    hiddenForm.target = "googleFormTarget";
    if (hiddenForm.elements["fvv"]) {
      hiddenForm.elements["fvv"].value = "1";
    }
    if (hiddenForm.elements["fbzx"]) {
      hiddenForm.elements["fbzx"].value = formBzx;
    }
    if (hiddenForm.elements["partialResponse"]) {
      hiddenForm.elements["partialResponse"].value = "";
    }
    if (hiddenForm.elements["pageHistory"]) {
      hiddenForm.elements["pageHistory"].value = "0";
    }
    if (hiddenForm.elements["submissionTimestamp"]) {
      hiddenForm.elements["submissionTimestamp"].value = "-1";
    }
  }

  const getPayload = (fd) => {
    const name = (fd.get("name") || "").toString().trim();
    const adults = (fd.get("adults") || "0").toString();
    const kids = (fd.get("kids") || "0").toString();
    const vegetarian = (fd.get("vegetarian") || "0").toString();
    const message = (fd.get("message") || "").toString().trim();

    if (hiddenFieldName && fieldIds.name) {
      hiddenFieldName.name = fieldIds.name;
      hiddenFieldName.value = name;
    }
    if (hiddenFieldAdults && fieldIds.adults) {
      hiddenFieldAdults.name = fieldIds.adults;
      hiddenFieldAdults.value = adults;
    }
    if (hiddenFieldKids && fieldIds.kids) {
      hiddenFieldKids.name = fieldIds.kids;
      hiddenFieldKids.value = kids;
    }
    if (hiddenFieldVegetarian && fieldIds.vegetarian) {
      hiddenFieldVegetarian.name = fieldIds.vegetarian;
      hiddenFieldVegetarian.value = vegetarian;
    }
    if (hiddenFieldNote && fieldIds.note) {
      hiddenFieldNote.name = fieldIds.note;
      hiddenFieldNote.value = message;
    }

    if (hiddenForm) {
      hiddenForm.action = responseEndpoint;
      hiddenForm.method = "POST";
      hiddenForm.enctype = "application/x-www-form-urlencoded";
      hiddenForm.target = "googleFormTarget";
      if (hiddenForm.elements["fvv"]) {
        hiddenForm.elements["fvv"].value = "1";
      }
      if (hiddenForm.elements["fbzx"]) {
        hiddenForm.elements["fbzx"].value = formBzx;
      }
      if (hiddenForm.elements["pageHistory"]) {
        hiddenForm.elements["pageHistory"].value = "0";
      }
    }
  };

  const validate = (fd) => {
    const name = (fd.get("name") || "").toString().trim();
    const adults = Number.parseInt(fd.get("adults") || "0", 10);
    const kids = Number.parseInt(fd.get("kids") || "0", 10);
    const vegetarian = Number.parseInt(fd.get("vegetarian") || "0", 10);

    if (!name) {
      return "請填寫姓名。";
    }

    if ([adults, kids, vegetarian].some((value) => Number.isNaN(value) || value < 0)) {
      return "人數請填入 0 或正整數。";
    }

    if (vegetarian > adults + kids) {
      return "素食者人數不可大於總參加人數。";
    }

    return "";
  };

  const setupFormLinks = () => {
    if (formLink) {
      formLink.href = formUrl || "#";
      if (!formUrl) {
        formLink.setAttribute("aria-disabled", "true");
      } else {
        formLink.removeAttribute("aria-disabled");
      }
    }

    if (sheetLink) {
      sheetLink.href = sheetUrl || "#";
      if (!sheetUrl) {
        sheetLink.setAttribute("aria-disabled", "true");
      } else {
        sheetLink.removeAttribute("aria-disabled");
      }
    }

    if (statusEl) {
      if (formUrl) {
        renderStatus("表單已接上 Google Form，提交後會寫入你的 Google Sheet。", "ok");
      } else {
        renderStatus("請在 config.js 中填入 Google Form 與 Google Sheet 連結。", "");
      }
    }
  };

  jumpBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target) {
        smoothJumpTo(target);
      }
    });
  });

  if (floatingRsvp) {
    floatingRsvp.addEventListener("click", () => smoothJumpTo("rsvp"));
  }

  transportTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const panelId = tab.dataset.panel;
      if (panelId) {
        updateTransportTab(panelId);
      }
    });
  });

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const fd = new FormData(form);

      if ((fd.get("website") || "").toString().trim()) {
        renderStatus("已送出。", "ok");
        form.reset();
        return;
      }

      const validationMessage = validate(fd);
      if (validationMessage) {
        renderStatus(validationMessage, "err");
        return;
      }

      if (!responseEndpoint) {
        renderStatus("請先在 config.js 中填入 Google Form 的提交網址。", "err");
        return;
      }

      submitBtn.disabled = true;
      renderStatus("送出中，請稍候...", "");

      try {
        getPayload(fd);
        if (hiddenForm) {
          hiddenForm.submit();
          renderStatus("送出成功，謝謝你的回覆。", "ok");
          form.reset();
        } else {
          throw new Error("hiddenForm not found");
        }
      } catch (error) {
        console.error(error);
        renderStatus("送出時發生錯誤，請稍後再試。", "err");
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  window.addEventListener("scroll", toggleFloatingRsvp, { passive: true });

  setCountdown();
  setInterval(setCountdown, 30 * 1000);
  setupFormLinks();
  toggleFloatingRsvp();
})();

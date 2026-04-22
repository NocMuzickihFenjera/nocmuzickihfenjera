(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelectorAll(".site-nav a");
  var yearEl = document.getElementById("year");
  var LANG_KEY = "nmf-language";

  function applyLanguage(lang) {
    var safeLang = lang === "en" ? "en" : "sr";
    document.documentElement.lang = safeLang;

    var translatable = document.querySelectorAll("[data-i18n-sr][data-i18n-en]");
    translatable.forEach(function (el) {
      var nextText = safeLang === "en" ? el.getAttribute("data-i18n-en") : el.getAttribute("data-i18n-sr");
      if (nextText !== null) {
        el.textContent = nextText;
      }
    });

    var placeholders = document.querySelectorAll("[data-i18n-placeholder-sr][data-i18n-placeholder-en]");
    placeholders.forEach(function (el) {
      var nextPlaceholder = safeLang === "en" ? el.getAttribute("data-i18n-placeholder-en") : el.getAttribute("data-i18n-placeholder-sr");
      if (nextPlaceholder !== null) {
        el.setAttribute("placeholder", nextPlaceholder);
      }
    });

    var titles = document.querySelectorAll("[data-i18n-title-sr][data-i18n-title-en]");
    var altTexts = document.querySelectorAll("[data-i18n-alt-sr][data-i18n-alt-en]");
    altTexts.forEach(function (el) {
      var nextAlt = safeLang === "en" ? el.getAttribute("data-i18n-alt-en") : el.getAttribute("data-i18n-alt-sr");
      if (nextAlt !== null) {
        el.setAttribute("alt", nextAlt);
      }
    });

    var htmlTranslatable = document.querySelectorAll("[data-i18n-html-sr][data-i18n-html-en]");
    htmlTranslatable.forEach(function (el) {
      var nextHtml = safeLang === "en" ? el.getAttribute("data-i18n-html-en") : el.getAttribute("data-i18n-html-sr");
      if (nextHtml !== null) {
        el.innerHTML = nextHtml;
      }
    });

    var ariaLabels = document.querySelectorAll("[data-i18n-aria-label-sr][data-i18n-aria-label-en]");
    ariaLabels.forEach(function (el) {
      var nextAriaLabel = safeLang === "en" ? el.getAttribute("data-i18n-aria-label-en") : el.getAttribute("data-i18n-aria-label-sr");
      if (nextAriaLabel !== null) {
        el.setAttribute("aria-label", nextAriaLabel);
      }
    });

    titles.forEach(function (el) {
      var nextTitle = safeLang === "en" ? el.getAttribute("data-i18n-title-en") : el.getAttribute("data-i18n-title-sr");
      if (nextTitle !== null) {
        el.setAttribute("title", nextTitle);
      }
    });

    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      var srDescription = metaDescription.getAttribute("data-i18n-sr");
      var enDescription = metaDescription.getAttribute("data-i18n-en");
      if (srDescription && enDescription) {
        metaDescription.setAttribute("content", safeLang === "en" ? enDescription : srDescription);
      }
    }

    var srTitle = document.body.getAttribute("data-title-sr");
    var enTitle = document.body.getAttribute("data-title-en");
    if (srTitle && enTitle) {
      document.title = safeLang === "en" ? enTitle : srTitle;
    }

    var switchers = document.querySelectorAll("[data-lang-switch]");
    switchers.forEach(function (btn) {
      var isActive = btn.getAttribute("data-lang-switch") === safeLang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    updatePriceEstimate();
  }

  function initLanguageSwitcher() {
    var switchers = document.querySelectorAll("[data-lang-switch]");
    if (!switchers.length) return;

    var storedLang = localStorage.getItem(LANG_KEY);
    var preferredLang = storedLang === "en" ? "en" : "sr";
    applyLanguage(preferredLang);

    switchers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var selectedLang = btn.getAttribute("data-lang-switch") === "en" ? "en" : "sr";
        localStorage.setItem(LANG_KEY, selectedLang);
        applyLanguage(selectedLang);
      });
    });
  }

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  initLanguageSwitcher();

  function closeMenu() {
    if (!header || !toggle) return;
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var open = !header.classList.contains("is-open");
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  var contactForm = document.querySelector(".contact-form");
  var standardSeatsInput = document.getElementById("standard-seats");
  var discountSeatsInput = document.getElementById("discount-seats");
  var concertInputs = contactForm ? contactForm.querySelectorAll('input[name="koncerti[]"]') : [];
  var priceValueEl = document.getElementById("price-estimate-value");

  function formatRsd(value) {
    var locale = document.documentElement.lang === "en" ? "en-US" : "sr-RS";
    return value.toLocaleString(locale) + " RSD";
  }

  function getSelectedConcertIds() {
    return Array.prototype.filter.call(concertInputs, function (input) {
      return input.checked;
    }).map(function (input) {
      return input.getAttribute("data-concert-id");
    });
  }

  function calculateBasePackagePrice(standardTickets) {
    if (!standardTickets) return 0;
    var dp = new Array(standardTickets + 1).fill(Infinity);
    dp[0] = 0;

    for (var count = 1; count <= standardTickets; count += 1) {
      dp[count] = Math.min(
        dp[count],
        dp[count - 1] + 2000
      );
      if (count >= 4) {
        dp[count] = Math.min(dp[count], dp[count - 4] + 6000);
      }
      if (count >= 9) {
        dp[count] = Math.min(dp[count], dp[count - 9] + 12000);
      }
    }

    return dp[standardTickets];
  }

  function calculateStandardPriceByTickets(standardTickets, selectedIds) {
    if (!standardTickets) return { total: 0, note: "" };

    var hasMatthewCombo = selectedIds.indexOf("matthew-30") !== -1
      && selectedIds.indexOf("matthew-31") !== -1
      && selectedIds.indexOf("matthew-04jul") !== -1;

    var baseTotal = calculateBasePackagePrice(standardTickets);
    if (!hasMatthewCombo || standardTickets < 3) {
      return { total: baseTotal, note: "" };
    }

    // Matthew Mayer paket se primenjuje najviše jednom.
    var withMatthew = 5000 + calculateBasePackagePrice(standardTickets - 3);
    if (withMatthew < baseTotal) {
      var appliedNote = document.documentElement.lang === "en"
        ? "Matthew Mayer package applied (1x)."
        : "Primenjen Matthew Mayer paket (1x).";
      return { total: withMatthew, note: appliedNote };
    }

    return { total: baseTotal, note: "" };
  }

  function updatePriceEstimate() {
    if (!contactForm || !priceValueEl) return;
    var isEnglish = document.documentElement.lang === "en";
    var emptyText = isEnglish
      ? "Choose concert(s) and enter ticket quantities by category."
      : "Odaberite koncert(e) i unesite broj karata po kategoriji.";

    var selectedIds = getSelectedConcertIds();
    var standardSeats = parseInt(standardSeatsInput && standardSeatsInput.value ? standardSeatsInput.value : "0", 10);
    var discountSeats = parseInt(discountSeatsInput && discountSeatsInput.value ? discountSeatsInput.value : "0", 10);
    var totalSeats = Math.max(0, standardSeats) + Math.max(0, discountSeats);

    if (!selectedIds.length || !totalSeats) {
      priceValueEl.textContent = emptyText;
      return;
    }

    var concertCount = selectedIds.length;
    var standardTickets = Math.max(0, standardSeats) * concertCount;
    var discountTickets = Math.max(0, discountSeats) * concertCount;
    var standardPrice = calculateStandardPriceByTickets(standardTickets, selectedIds);
    var discountPrice = discountTickets * 1200;
    var total = standardPrice.total + discountPrice;
    var parts = [];

    if (standardSeats > 0) {
      parts.push((isEnglish ? "standard " : "standard ") + standardSeats + " x " + concertCount + (isEnglish ? " dates = " : " datuma = ") + formatRsd(standardPrice.total));
    }
    if (discountSeats > 0) {
      parts.push((isEnglish ? "discounted " : "povlašćene ") + discountSeats + " x " + concertCount + (isEnglish ? " dates = " : " datuma = ") + formatRsd(discountPrice));
    }

    var note = standardPrice.note ? " " + standardPrice.note : "";
    priceValueEl.textContent = (isEnglish ? "Total: " : "Ukupno: ") + formatRsd(total) + " (" + parts.join(", ") + ")." + note;
  }

  function attachZeroClearBehavior(inputEl) {
    if (!inputEl) return;
    inputEl.addEventListener("focus", function () {
      if (inputEl.value === "0") {
        inputEl.value = "";
      }
    });
    inputEl.addEventListener("blur", function () {
      if (inputEl.value === "") {
        inputEl.value = "0";
      }
      updatePriceEstimate();
    });
  }

  if (contactForm && priceValueEl) {
    Array.prototype.forEach.call(concertInputs, function (input) {
      input.addEventListener("change", updatePriceEstimate);
    });
    if (standardSeatsInput) {
      standardSeatsInput.addEventListener("input", updatePriceEstimate);
    }
    if (discountSeatsInput) {
      discountSeatsInput.addEventListener("input", updatePriceEstimate);
    }
    attachZeroClearBehavior(standardSeatsInput);
    attachZeroClearBehavior(discountSeatsInput);
  }
})();

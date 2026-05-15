(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelectorAll(".site-nav a");
  var yearEl = document.getElementById("year");
  var LANG_KEY = "nmf-language";

  var STANDARD_PRICE = 2000;
  var DISCOUNT_PRICE = 1200;
  var PACKAGE_SIZE = 4;
  var PACKAGE_PRICE = 6000;

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
  var priceValueEl = document.getElementById("price-estimate-value");
  var orderSummaryEl = document.getElementById("order-summary");
  var priceHiddenEl = document.getElementById("price-hidden");

  function formatRsd(value) {
    var locale = document.documentElement.lang === "en" ? "en-US" : "sr-RS";
    return value.toLocaleString(locale) + " RSD";
  }

  function calculateStandardTotal(standardTickets) {
    if (!standardTickets) return 0;
    var dp = new Array(standardTickets + 1).fill(Infinity);
    dp[0] = 0;

    for (var count = 1; count <= standardTickets; count += 1) {
      dp[count] = Math.min(dp[count], dp[count - 1] + STANDARD_PRICE);
      if (count >= PACKAGE_SIZE) {
        dp[count] = Math.min(dp[count], dp[count - PACKAGE_SIZE] + PACKAGE_PRICE);
      }
    }

    return dp[standardTickets];
  }

  function getConcertRows() {
    return contactForm ? contactForm.querySelectorAll(".concert-booking") : [];
  }

  function collectBookings() {
    var bookings = [];
    Array.prototype.forEach.call(getConcertRows(), function (row) {
      var checkbox = row.querySelector('input[type="checkbox"]');
      var standardInput = row.querySelector(".ticket-input--standard");
      var discountInput = row.querySelector(".ticket-input--discount");
      var standard = Math.max(0, parseInt(standardInput && standardInput.value ? standardInput.value : "0", 10) || 0);
      var discount = Math.max(0, parseInt(discountInput && discountInput.value ? discountInput.value : "0", 10) || 0);
      if (!checkbox || (!checkbox.checked && !standard && !discount)) return;

      var titleEl = row.querySelector(".concert-booking__title");
      bookings.push({
        title: titleEl ? titleEl.textContent.trim() : checkbox.value,
        standard: standard,
        discount: discount
      });
    });
    return bookings;
  }

  function syncConcertRow(row) {
    var checkbox = row.querySelector('input[type="checkbox"]');
    var standardInput = row.querySelector(".ticket-input--standard");
    var discountInput = row.querySelector(".ticket-input--discount");
    var standard = Math.max(0, parseInt(standardInput.value || "0", 10) || 0);
    var discount = Math.max(0, parseInt(discountInput.value || "0", 10) || 0);
    var active = checkbox.checked || standard > 0 || discount > 0;

    checkbox.checked = active;
    row.classList.toggle("is-active", active);
    standardInput.disabled = !active;
    discountInput.disabled = !active;

    if (!active) {
      standardInput.value = "0";
      discountInput.value = "0";
    }
  }

  function updatePriceEstimate() {
    if (!contactForm || !priceValueEl) return;

    var isEnglish = document.documentElement.lang === "en";
    var emptyText = isEnglish
      ? "Select concert(s) and enter ticket quantities."
      : "Odaberite koncert(e) i unesite broj karata.";

    var bookings = collectBookings();
    var totalStandard = 0;
    var totalDiscount = 0;

    bookings.forEach(function (booking) {
      totalStandard += booking.standard;
      totalDiscount += booking.discount;
    });

    if (!bookings.length || (!totalStandard && !totalDiscount)) {
      priceValueEl.textContent = emptyText;
      if (priceHiddenEl) priceHiddenEl.value = "";
      return;
    }

    var standardTotal = calculateStandardTotal(totalStandard);
    var discountTotal = totalDiscount * DISCOUNT_PRICE;
    var grandTotal = standardTotal + discountTotal;
    var parts = [];

    if (totalStandard) {
      parts.push(
        (isEnglish ? "standard " : "standard ") +
          totalStandard +
          (isEnglish ? " ticket(s) = " : " karta = ") +
          formatRsd(standardTotal)
      );
    }

    if (totalDiscount) {
      parts.push(
        (isEnglish ? "discounted " : "povlašćene ") +
          totalDiscount +
          (isEnglish ? " ticket(s) = " : " karte = ") +
          formatRsd(discountTotal)
      );
    }

    var packageNote = "";
    if (totalStandard >= PACKAGE_SIZE) {
      packageNote = isEnglish
        ? " (4 standard tickets package 6000 RSD applied where possible)"
        : " (paket 4 standardne karte 6000 RSD primenjen gde je moguće)";
    }

    var summaryText =
      (isEnglish ? "Total: " : "Ukupno: ") + formatRsd(grandTotal) + " (" + parts.join(", ") + ")." + packageNote;

    priceValueEl.textContent = summaryText;
    if (priceHiddenEl) priceHiddenEl.value = formatRsd(grandTotal);
  }

  function attachZeroClearBehavior(inputEl) {
    if (!inputEl) return;
    inputEl.addEventListener("focus", function () {
      if (inputEl.value === "0") inputEl.value = "";
    });
    inputEl.addEventListener("blur", function () {
      if (inputEl.value === "") inputEl.value = "0";
      var row = inputEl.closest(".concert-booking");
      if (row) syncConcertRow(row);
      updatePriceEstimate();
    });
  }

  function buildOrderSummary() {
    var bookings = collectBookings();
    var lines = bookings.map(function (booking) {
      return (
        "- " +
        booking.title +
        ": standard " +
        booking.standard +
        ", povlašćene " +
        booking.discount
      );
    });

    return [
      "REZERVACIJA KARATA — Noć Muzičkih Fenjera",
      "",
      "Koncerti i karte:",
      lines.length ? lines.join("\n") : "(nije odabrano)",
      "",
      "Procena cene: " + (priceValueEl ? priceValueEl.textContent : ""),
      ""
    ].join("\n");
  }

  if (contactForm && priceValueEl) {
    Array.prototype.forEach.call(getConcertRows(), function (row) {
      var checkbox = row.querySelector('input[type="checkbox"]');
      var standardInput = row.querySelector(".ticket-input--standard");
      var discountInput = row.querySelector(".ticket-input--discount");

      checkbox.addEventListener("change", function () {
        syncConcertRow(row);
        updatePriceEstimate();
      });

      standardInput.addEventListener("input", function () {
        syncConcertRow(row);
        updatePriceEstimate();
      });

      discountInput.addEventListener("input", function () {
        syncConcertRow(row);
        updatePriceEstimate();
      });

      attachZeroClearBehavior(standardInput);
      attachZeroClearBehavior(discountInput);
      syncConcertRow(row);
    });

    contactForm.addEventListener("submit", function () {
      if (orderSummaryEl) orderSummaryEl.value = buildOrderSummary();
    });

    updatePriceEstimate();
  }
})();

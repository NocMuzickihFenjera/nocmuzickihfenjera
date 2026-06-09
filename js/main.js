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

    var translatable = document.querySelectorAll("[data-i18n-sr][data-i18n-en]:not(#price-estimate-value)");
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
    if (galleryLightbox && !galleryLightbox.hidden) {
      if (e.key === "Escape") {
        closeGalleryLightbox();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepGalleryLightbox(-1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        stepGalleryLightbox(1);
        return;
      }
    }
    if (e.key === "Escape") closeMenu();
  });

  var galleryLightbox = document.getElementById("gallery-lightbox");
  var galleryTriggers = document.querySelectorAll(".gallery-item__open");
  var galleryImages = [];
  var galleryIndex = 0;

  function collectGalleryImages() {
    galleryImages = [];
    galleryTriggers.forEach(function (btn) {
      var src = btn.getAttribute("data-gallery-src");
      if (src) galleryImages.push(src);
    });
  }

  function updateGalleryLightbox() {
    if (!galleryLightbox || !galleryImages.length) return;
    var img = galleryLightbox.querySelector(".gallery-lightbox__img");
    var counter = galleryLightbox.querySelector(".gallery-lightbox__counter");
    if (img) img.src = galleryImages[galleryIndex];
    if (counter) counter.textContent = (galleryIndex + 1) + " / " + galleryImages.length;
  }

  function openGalleryLightbox(index) {
    if (!galleryLightbox || !galleryImages.length) return;
    galleryIndex = index;
    updateGalleryLightbox();
    galleryLightbox.hidden = false;
    galleryLightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeGalleryLightbox() {
    if (!galleryLightbox) return;
    galleryLightbox.hidden = true;
    galleryLightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    var img = galleryLightbox.querySelector(".gallery-lightbox__img");
    if (img) img.src = "";
  }

  function stepGalleryLightbox(direction) {
    if (!galleryImages.length) return;
    galleryIndex = (galleryIndex + direction + galleryImages.length) % galleryImages.length;
    updateGalleryLightbox();
  }

  function initGalleryLightbox() {
    if (!galleryLightbox || !galleryTriggers.length) return;
    collectGalleryImages();

    galleryTriggers.forEach(function (btn, index) {
      btn.addEventListener("click", function () {
        openGalleryLightbox(index);
      });
    });

    var backdrop = galleryLightbox.querySelector(".gallery-lightbox__backdrop");
    var closeBtn = galleryLightbox.querySelector(".gallery-lightbox__close");
    var prevBtn = galleryLightbox.querySelector(".gallery-lightbox__nav--prev");
    var nextBtn = galleryLightbox.querySelector(".gallery-lightbox__nav--next");

    if (backdrop) backdrop.addEventListener("click", closeGalleryLightbox);
    if (closeBtn) closeBtn.addEventListener("click", closeGalleryLightbox);
    if (prevBtn) prevBtn.addEventListener("click", function () { stepGalleryLightbox(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { stepGalleryLightbox(1); });
  }

  initGalleryLightbox();

  var contactForm = document.querySelector(".contact-form");
  var priceValueEl = document.getElementById("price-estimate-value");
  var emailKoncertiEl = document.getElementById("email-koncerti");
  var emailCenaEl = document.getElementById("email-cena");
  var emailReplytoEl = document.getElementById("email-replyto");

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
    return contactForm ? contactForm.querySelectorAll(".concert-row") : [];
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

      var titleEl = row.querySelector(".concert-row__title");
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
  }

  function attachZeroClearBehavior(inputEl) {
    if (!inputEl) return;
    inputEl.addEventListener("focus", function () {
      if (inputEl.value === "0") inputEl.value = "";
    });
    inputEl.addEventListener("blur", function () {
      if (inputEl.value === "") inputEl.value = "0";
      var row = inputEl.closest(".concert-row");
      if (row) syncConcertRow(row);
      updatePriceEstimate();
    });
  }

  function ticketLabel(count, standardWord, pluralWord) {
    return count + " " + (count === 1 ? standardWord : pluralWord);
  }

  function buildConcertsEmailText() {
    var bookings = collectBookings();
    if (!bookings.length) return "(nije odabrano)";

    return bookings
      .map(function (booking) {
        var lines = [booking.title];
        if (booking.standard > 0) {
          lines.push("Standard: " + ticketLabel(booking.standard, "karta", "karte"));
        }
        if (booking.discount > 0) {
          lines.push("Povlašćene: " + ticketLabel(booking.discount, "karta", "karte"));
        }
        return lines.join("\n");
      })
      .join("\n\n");
  }

  if (contactForm && priceValueEl) {
    Array.prototype.forEach.call(getConcertRows(), function (row) {
      var checkbox = row.querySelector('input[type="checkbox"]');
      var standardInput = row.querySelector(".ticket-input--standard");
      var discountInput = row.querySelector(".ticket-input--discount");

      checkbox.addEventListener("change", function () {
        if (!checkbox.checked) {
          standardInput.value = "0";
          discountInput.value = "0";
        }
        syncConcertRow(row);
        updatePriceEstimate();
      });

      function onTicketCountChange() {
        syncConcertRow(row);
        updatePriceEstimate();
      }

      standardInput.addEventListener("input", onTicketCountChange);
      standardInput.addEventListener("change", onTicketCountChange);
      discountInput.addEventListener("input", onTicketCountChange);
      discountInput.addEventListener("change", onTicketCountChange);

      attachZeroClearBehavior(standardInput);
      attachZeroClearBehavior(discountInput);
      syncConcertRow(row);
    });

    var submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener("submit", function (event) {
      if (emailKoncertiEl) emailKoncertiEl.value = buildConcertsEmailText();
      if (emailCenaEl) emailCenaEl.value = priceValueEl ? priceValueEl.textContent : "";

      var emailInput = contactForm.querySelector('[name="Email"]');
      if (emailReplytoEl && emailInput) {
        emailReplytoEl.value = emailInput.value || "";
      }

      var hp = contactForm.querySelector('[name="_honey"]');
      if (hp && hp.value) {
        event.preventDefault();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        if (!submitBtn.dataset.defaultLabel) {
          submitBtn.dataset.defaultLabel = submitBtn.textContent;
        }
        submitBtn.textContent =
          document.documentElement.lang === "en" ? "Sending…" : "Šaljem…";
      }
    });

    updatePriceEstimate();

    if (window.location.search.indexOf("poslato=1") !== -1) {
      var successNote = document.createElement("p");
      successNote.className = "form-note form-note--success";
      successNote.setAttribute("data-i18n-sr", "Hvala! Vaša rezervacija je poslata. Javićemo Vam se u što skorijem roku.");
      successNote.setAttribute("data-i18n-en", "Thank you! Your reservation was sent. We will contact you as soon as possible.");
      successNote.textContent =
        document.documentElement.lang === "en"
          ? successNote.getAttribute("data-i18n-en")
          : successNote.getAttribute("data-i18n-sr");
      contactForm.insertBefore(successNote, contactForm.firstChild);
    }
  }
})();

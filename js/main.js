(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelectorAll(".site-nav a");
  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

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
    return value.toLocaleString("sr-RS") + " RSD";
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
      return { total: withMatthew, note: "Primenjen Matthew Mayer paket (1x)." };
    }

    return { total: baseTotal, note: "" };
  }

  function updatePriceEstimate() {
    if (!contactForm || !priceValueEl) return;

    var selectedIds = getSelectedConcertIds();
    var standardSeats = parseInt(standardSeatsInput && standardSeatsInput.value ? standardSeatsInput.value : "0", 10);
    var discountSeats = parseInt(discountSeatsInput && discountSeatsInput.value ? discountSeatsInput.value : "0", 10);
    var totalSeats = Math.max(0, standardSeats) + Math.max(0, discountSeats);

    if (!selectedIds.length || !totalSeats) {
      priceValueEl.textContent = "Odaberite koncert(e) i unesite broj karata po kategoriji.";
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
      parts.push("standard " + standardSeats + " x " + concertCount + " datuma = " + formatRsd(standardPrice.total));
    }
    if (discountSeats > 0) {
      parts.push("povlašćene " + discountSeats + " x " + concertCount + " datuma = " + formatRsd(discountPrice));
    }

    var note = standardPrice.note ? " " + standardPrice.note : "";
    priceValueEl.textContent = "Ukupno: " + formatRsd(total) + " (" + parts.join(", ") + ")." + note;
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

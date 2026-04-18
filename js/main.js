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

  function calculateStandardPriceByTickets(standardTickets, selectedIds) {
    if (!standardTickets) return { total: 0, note: "" };

    var hasMatthewCombo = selectedIds.indexOf("matthew-30") !== -1
      && selectedIds.indexOf("matthew-31") !== -1
      && selectedIds.indexOf("matthew-04jul") !== -1;

    var offers = [
      { size: 1, price: 2000, label: "Standard karta" },
      { size: 4, price: 6000, label: "Paket 4 karte" },
      { size: 9, price: 12000, label: "Paket 9 karata" }
    ];

    if (hasMatthewCombo) {
      offers.push({ size: 3, price: 5000, label: "Matthew paket" });
    }

    var dp = new Array(standardTickets + 1).fill(Infinity);
    var notes = new Array(standardTickets + 1).fill("");
    dp[0] = 0;

    for (var ticketCount = 0; ticketCount <= standardTickets; ticketCount += 1) {
      if (!isFinite(dp[ticketCount])) continue;
      offers.forEach(function (offer) {
        var next = ticketCount + offer.size;
        if (next > standardTickets) return;
        if (dp[next] > dp[ticketCount] + offer.price) {
          dp[next] = dp[ticketCount] + offer.price;
          notes[next] = offer.label;
        }
      });
    }

    return { total: dp[standardTickets], note: notes[standardTickets] };
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

    var standardPrice = calculateStandardPriceByTickets(Math.max(0, standardSeats), selectedIds);
    var discountPrice = Math.max(0, discountSeats) * 1200;
    var total = standardPrice.total + discountPrice;
    var parts = [];

    if (standardSeats > 0) {
      parts.push("standard " + standardSeats + " = " + formatRsd(standardPrice.total));
    }
    if (discountSeats > 0) {
      parts.push("povlašćene " + discountSeats + " = " + formatRsd(discountPrice));
    }

    var note = standardPrice.note ? " Primenjen paket: " + standardPrice.note + "." : "";
    priceValueEl.textContent = "Ukupno: " + formatRsd(total) + " (" + parts.join(", ") + ")." + note;
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
  }
})();

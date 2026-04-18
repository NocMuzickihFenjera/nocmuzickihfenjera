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
  var ageCategory = document.getElementById("age-category");
  var seatsInput = contactForm ? contactForm.querySelector('input[name="broj_mesta"]') : null;
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

  function calculateStandardPrice(selectedIds) {
    var offerDefinitions = [
      { ids: ["matthew-30", "matthew-31", "matthew-04jul"], price: 5000, label: "Matthew paket (30. maj + 31. maj + 4. jul)" }
    ];
    var allConcertIds = [
      "matthew-30",
      "matthew-31",
      "film-05",
      "rock-12",
      "spektakl-17",
      "matthew-04jul",
      "jazz-10",
      "film-23",
      "rock-30"
    ];
    var selectedSet = {};
    selectedIds.forEach(function (id) {
      selectedSet[id] = true;
    });
    var ids = allConcertIds.filter(function (id) {
      return !!selectedSet[id];
    });
    var count = ids.length;
    if (!count) return { total: 0, note: "" };

    var fullMask = (1 << count) - 1;
    var idToIndex = {};
    ids.forEach(function (id, index) {
      idToIndex[id] = index;
    });

    var offers = [];
    offers.push({ mask: 0, price: 2000 });

    if (count >= 4) {
      for (var mask = 0; mask <= fullMask; mask += 1) {
        var bits = mask.toString(2).replace(/0/g, "").length;
        if (bits === 4) {
          offers.push({ mask: mask, price: 6000, label: "Paket 4 koncerta" });
        }
      }
    }

    if (count === 9) {
      offers.push({ mask: fullMask, price: 12000, label: "Paket svih 9 koncerata" });
    }

    offerDefinitions.forEach(function (def) {
      var mask = 0;
      var valid = true;
      def.ids.forEach(function (id) {
        if (idToIndex[id] === undefined) {
          valid = false;
          return;
        }
        mask |= (1 << idToIndex[id]);
      });
      if (valid) {
        offers.push({ mask: mask, price: def.price, label: def.label });
      }
    });

    var dp = new Array(fullMask + 1).fill(Infinity);
    var note = new Array(fullMask + 1).fill("");
    dp[0] = 0;

    for (var state = 0; state <= fullMask; state += 1) {
      if (!isFinite(dp[state])) continue;
      offers.forEach(function (offer) {
        var nextState;
        if (offer.mask === 0) {
          for (var idx = 0; idx < count; idx += 1) {
            if ((state & (1 << idx)) !== 0) continue;
            nextState = state | (1 << idx);
            if (dp[nextState] > dp[state] + offer.price) {
              dp[nextState] = dp[state] + offer.price;
              note[nextState] = note[state];
            }
          }
        } else {
          if ((state & offer.mask) !== 0) return;
          nextState = state | offer.mask;
          if (dp[nextState] > dp[state] + offer.price) {
            dp[nextState] = dp[state] + offer.price;
            note[nextState] = offer.label || note[state];
          }
        }
      });
    }

    return { total: dp[fullMask], note: note[fullMask] };
  }

  function updatePriceEstimate() {
    if (!contactForm || !priceValueEl) return;

    var selectedIds = getSelectedConcertIds();
    var seats = parseInt(seatsInput && seatsInput.value ? seatsInput.value : "0", 10);
    var isDiscountCategory = ageCategory && ageCategory.value === "discount";
    var isStandardCategory = ageCategory && ageCategory.value === "standard";

    if (!selectedIds.length || !seats || (!isDiscountCategory && !isStandardCategory)) {
      priceValueEl.textContent = "Odaberite koncert(e), broj mesta i kategoriju.";
      return;
    }

    var total = 0;
    var baseNote = "";

    if (isDiscountCategory) {
      total = selectedIds.length * 1200 * seats;
      baseNote = "Popusti na pakete se ne primenjuju za ovu kategoriju.";
    } else {
      var standard = calculateStandardPrice(selectedIds);
      total = standard.total * seats;
      baseNote = standard.note ? "Primenjen paket: " + standard.note + "." : "";
    }

    var oneSeatText = isDiscountCategory
      ? formatRsd(selectedIds.length * 1200)
      : formatRsd(calculateStandardPrice(selectedIds).total);

    priceValueEl.textContent = "Ukupno: " + formatRsd(total) + " (" + formatRsd(seats) + " x " + oneSeatText + "). " + baseNote;
  }

  if (contactForm && priceValueEl) {
    Array.prototype.forEach.call(concertInputs, function (input) {
      input.addEventListener("change", updatePriceEstimate);
    });
    if (seatsInput) {
      seatsInput.addEventListener("input", updatePriceEstimate);
    }
    if (ageCategory) {
      ageCategory.addEventListener("change", updatePriceEstimate);
    }
  }
})();

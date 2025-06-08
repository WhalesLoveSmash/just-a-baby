(() => {
  const humanInput = document.getElementById("human-input");
  const petTypeButtons = document.querySelectorAll(".pet-type-buttons button");
  const petAgeSlider = document.getElementById("pet-age-slider");
  const petAgeDisplay = document.getElementById("pet-age-display");
  const calculateBtn = document.getElementById("calculate-btn");
  const resultContainer = document.getElementById("result-container");

  let selectedPetType = null;

  // Auto-insert slashes in MM/DD/YYYY format while typing, with cursor fix
  humanInput.addEventListener("input", (e) => {
    const input = e.target;
    let raw = input.value.replace(/\D/g, "");
    let cursorPos = input.selectionStart;
    const oldVal = input.value;

    if (raw.length > 2) raw = raw.slice(0, 2) + "/" + raw.slice(2);
    if (raw.length > 5) raw = raw.slice(0, 5) + "/" + raw.slice(5, 9);
    input.value = raw;

    // Adjust cursor if slash was added
    if (raw.length > oldVal.length && (cursorPos === 3 || cursorPos === 6)) {
      cursorPos++;
    }
    input.setSelectionRange(cursorPos, cursorPos);
  });

  // Pet age display, initially hidden
  petAgeDisplay.style.display = "none";

  petAgeSlider.addEventListener("input", () => {
    petAgeDisplay.style.display = "block";
    const val = parseFloat(petAgeSlider.value);
    petAgeDisplay.textContent = val === 1 ? "1 year" : val.toFixed(1) + " years";
  });

  // Pet type selection
  petTypeButtons.forEach(button => {
    button.addEventListener("click", () => {
      petTypeButtons.forEach(btn => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedPetType = button.dataset.type;
    });
  });

  // Helper: format date MM/DD/YYYY
  function formatDate(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const y = date.getFullYear();
    return `${m.toString().padStart(2, "0")}/${d.toString().padStart(2, "0")}/${y}`;
  }

  // Find next date within 2 years where pet is approx a nice round % of human age
  function findNextRoundPercentageDate(humanAgeYears, petAgeYears) {
    const now = new Date();
    const maxDays = 365 * 2; // 2 years max

    // Round % candidates to check — common nice fractions
    const candidates = [10, 12.5, 15, 20, 25, 33, 40, 50, 60, 66, 75, 80, 90, 100];

    // We'll check each day from tomorrow up to maxDays for when (petAge + x)/(humanAge + x) 
    // = one of these percentages

    for (let day = 1; day <= maxDays; day++) {
      const futureHumanAge = humanAgeYears + day / 365;
      const futurePetAge = petAgeYears + day / 365;

      for (let pct of candidates) {
        const ratio = (futurePetAge / futureHumanAge) * 100;

        // If within 0.5% of candidate pct, return this date and pct rounded nicely
        if (Math.abs(ratio - pct) < 0.5) {
          const targetDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
          return { date: targetDate, percentage: pct };
        }
      }
    }
    return null; // no match found in 2 years
  }

  calculateBtn.addEventListener("click", () => {
    const birthDateStr = humanInput.value.trim();

    if (!birthDateStr) {
      resultContainer.textContent = "Please enter your birthdate.";
      return;
    }

    if (!selectedPetType) {
      resultContainer.textContent = "Please select a pet type.";
      return;
    }

    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
    if (!dateRegex.test(birthDateStr)) {
      resultContainer.textContent = "Please enter a valid date in MM/DD/YYYY format.";
      return;
    }

    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) {
      resultContainer.textContent = "Invalid date.";
      return;
    }

    // Calculate human age in years (with decimals)
    const now = new Date();
    const diffMs = now - birthDate;
    const humanAgeYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

    // Pet age from slider
    const petAgeYears = parseFloat(petAgeSlider.value);

    // Current pet age % of human age
    const currentRatio = (petAgeYears / humanAgeYears) * 100;
    const currentRatioRounded = Math.round(currentRatio);

    // Find next date within 2 years with nice round % pet/human age
    const nextMatch = findNextRoundPercentageDate(humanAgeYears, petAgeYears);

    let output = `You are ${humanAgeYears.toFixed(1)} years old.\n` +
      `Your ${selectedPetType} is ${petAgeYears.toFixed(1)} years old, which is ${currentRatioRounded}% as old as you today.\n\n`;

    if (nextMatch) {
      output += `Your ${selectedPetType} will be exactly ${nextMatch.percentage}% as old as you on ${formatDate(nextMatch.date)}.`;
    } else {
      output += `No nice round percentage match found within 2 years.`;
    }

    // Show with line breaks
    resultContainer.textContent = output;
  });
})();
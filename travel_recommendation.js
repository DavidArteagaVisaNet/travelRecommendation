// travel_recommendations.js (V2)

let travelDataV2 = null;

// Use this file as the data source
fetch("travel_recommendation_api.json")
  .then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch JSON: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    console.log("V2 Data Loaded:", data);
    travelDataV2 = data; // { countries: [...], temples: [...], beaches: [...] }
  })
  .catch((err) => console.error("❌ Error loading V2 JSON:", err));

/* ---------- Helpers ---------- */
function normalize(text) {
  return (text || "").toLowerCase().trim();
}

// Basic plural/singular normalizer for THIS project
// beaches -> beach, temples -> temple, countries -> country
function singularize(word) {
  word = normalize(word);

  // cities/countries -> city/country
  if (word.endsWith("ies") && word.length > 3) {
    return word.slice(0, -3) + "y";
  }

  // beaches -> beach (remove es)
  if (word.endsWith("es") && word.length > 3) {
    return word.slice(0, -2);
  }

  // temples -> temple (remove s)
  if (word.endsWith("s") && word.length > 2) {
    return word.slice(0, -1);
  }

  return word;
}

function getKeywordCategory(rawInput) {
  const k = singularize(rawInput);

  // Accept variations: Beach/BEACH/beaches, Temple/temples, Country/countries
  if (k === "beach") return "beaches";
  if (k === "temple") return "temples";
  if (k === "country") return "countries";

  return null; // Not one of the allowed keywords
}

function renderCard({ name, imageUrl, description }) {
  const card = document.createElement("div");
  card.className = "result-card";
  card.innerHTML = `
    <img src="${imageUrl}" alt="${name}">
    <div class="result-content">
      <h3>${name}</h3>
      <p>${description}</p>
      <button>Visit</button>
    </div>
  `;
  return card;
}

function renderMessage(html) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = html;
}

/* ---------- Main Search (runs ONLY on Search button click) ---------- */
function searchRecommendations() {
  const input = document.getElementById("searchInput").value;
  const category = getKeywordCategory(input);

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  // If JSON not loaded yet
  if (!travelDataV2) {
    renderMessage(`<p style="text-align:center;">Data is still loading. Please try again in a moment.</p>`);
    return;
  }

  // Only allow these keyword searches
  if (!category) {
    renderMessage(`
      <p style="text-align:center; font-size:18px;">
        Please search using one of these keywords only:
        <b>beach</b>, <b>temple</b>, or <b>country</b>
      </p>
    `);
    document.querySelector(".results-section")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // BEACHES keyword → show beaches list
  if (category === "beaches") {
    const beaches = travelDataV2.beaches || [];
    beaches.forEach((b) => resultsDiv.appendChild(renderCard(b)));

    if (beaches.length === 0) {
      renderMessage(`<p style="text-align:center;">No beach recommendations found.</p>`);
    }
  }

  // TEMPLES keyword → show temples list
  if (category === "temples") {
    const temples = travelDataV2.temples || [];
    temples.forEach((t) => resultsDiv.appendChild(renderCard(t)));

    if (temples.length === 0) {
      renderMessage(`<p style="text-align:center;">No temple recommendations found.</p>`);
    }
  }

  // COUNTRIES keyword → show all countries (and their cities)
  if (category === "countries") {
    const countries = travelDataV2.countries || [];

    // For each country, show its cities as recommendations
    let count = 0;
    countries.forEach((c) => {
      (c.cities || []).forEach((city) => {
        resultsDiv.appendChild(
          renderCard({
            name: city.name,
            imageUrl: city.imageUrl,
            description: city.description
          })
        );
        count++;
      });
    });

    if (count === 0) {
      renderMessage(`<p style="text-align:center;">No country/city recommendations found.</p>`);
    }
  }

  // Scroll so user sees results
  document.querySelector(".results-section")?.scrollIntoView({ behavior: "smooth" });
}

/* ---------- Clear Button ---------- */
function clearResults() {
  document.getElementById("results").innerHTML = "";
  document.getElementById("searchInput").value = "";
}
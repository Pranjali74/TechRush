const API_KEY = "d2aa2v1r01qoad6oq920d2aa2v1r01qoad6oq92g";  // Replace with your real Finnhub API key
let stockChart = null;
let refreshTimer = null;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // in ms

async function getStockData(retries = 0) {
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const resultDiv = document.getElementById("result");

  if (!symbol) {
    resultDiv.innerHTML = "⚠ Please enter a stock symbol.";
    return;
  }

  resultDiv.innerHTML = "⏳ Fetching…";

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();

    const { c, dp, h, l } = data;

    // Retry if all values are zero (transient or invalid)
    if (c === 0 && dp === 0 && h === 0 && l === 0) {
      if (retries < MAX_RETRIES) {
        setTimeout(() => getStockData(retries + 1), RETRY_DELAY * (retries + 1));
        return;
      } else {
        resultDiv.innerHTML = "⚠ Data temporarily unavailable. Please try again later.";
        return;
      }
    }

    const now = new Date().toLocaleTimeString();
    const [price, pct, high, low] = [parseFloat(c), parseFloat(dp), parseFloat(h), parseFloat(l)];

    if ([price, pct, high, low].some(v => isNaN(v))) {
      resultDiv.innerHTML = "❌ Invalid symbol or missing data.";
      return;
    }

    resultDiv.innerHTML = `
      <strong>${symbol}</strong><br>
      PRICE: $${price.toFixed(2)}<br>
      CHANGE: ${pct.toFixed(2)}%<br>
      HIGH: $${high.toFixed(2)}<br>
      LOW: $${low.toFixed(2)}<br>
      ${now}
    `;

    updateChart(symbol, now, price);

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "❌ Error fetching data.";
  }
}

function updateChart(symbol, label, price) {
  let canvas = document.getElementById("priceChart");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "priceChart";
    canvas.style.width = "100%";
    canvas.style.height = "300px";
    document.querySelector(".tracker").appendChild(canvas);
  }
  const ctx = canvas.getContext("2d");

 if (!stockChart) {
  stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [label],
      datasets: [{
        label: `${symbol} Price`,  // Initial label
        data: [price],
        fill: true,
        tension: 0.4,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.2)"
      }]
    },
    options: { /* ... */ }
  });
} else {
  //  Update dataset label with new symbol
  stockChart.data.datasets[0].label = `${symbol} Price`;

  //  Add new data point
  stockChart.data.labels.push(label);
  stockChart.data.datasets[0].data.push(price);

  //  Refresh the chart
  stockChart.update();
}

}

function startTracking() {
  if (refreshTimer) clearInterval(refreshTimer);
  getStockData();
  refreshTimer = setInterval(getStockData, 60000); // refresh every 60 seconds
}

document.querySelector("button").addEventListener("click", startTracking);

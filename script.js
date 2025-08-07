// script.js

const API_KEY = "d29lr91r01qvhsftvf50d29lr91r01qvhsftvf5g";
let stockChart = null;
let refreshTimer = null;

async function getStockData() {
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const resultDiv = document.getElementById("result");
  if (!symbol) {
    resultDiv.innerHTML = "⚠️ Please enter a stock symbol.";
    return;
  }

  resultDiv.innerHTML = "⏳ Fetching…";

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    // data.c = current price, data.dp = percent change
    if (data.c === 0 && data.o === 0 && data.pc === 0) {
      resultDiv.innerHTML = "❌ Invalid symbol or no data.";
      return;
    }

    const now = new Date().toLocaleTimeString();
    const price = parseFloat(data.c).toFixed(2);
    const pct  = parseFloat(data.dp).toFixed(2);

    // show latest
    resultDiv.innerHTML = `
      ✅ <strong>${symbol}</strong><br>
      💰 Price: ${price.toFixed(2)}<br>
      📈 Change: ${pct.toFixed(2)}%<br>
      📊 High: ${high.toFixed(2)}<br>
      📉 Low: ${low.toFixed(2)}<br>
      📦 Volume: ${formatVolume(volume)}<br>
      🕒 ${now}
    `;

    // update chart
    updateChart(symbol, now, price);
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "❌ Error fetching data.";
  }
}

function updateChart(symbol, label, price) {
  // lazy-create canvas if needed
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
      type: "line",
      data: {
        labels: [label],
        datasets: [{
          label: `${symbol} Price`,
          data: [price],
          fill: true,
          tension: 0.4,
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.2)"
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { display: true },
          y: {
            beginAtZero: false,
            ticks: {
              callback: v => `$${v}`
            }
          }
        }
      }
    });
  } else {
    stockChart.data.labels.push(label);
    stockChart.data.datasets[0].data.push(price);
    stockChart.update();
  }
}

function startTracking() {
  // clear old timer
  if (refreshTimer) clearInterval(refreshTimer);

  // fetch immediately, then every 60s
  getStockData();
  refreshTimer = setInterval(getStockData, 60_000);
}

// wire up your "Track" button
document.querySelector("button").addEventListener("click", startTracking);

function handleCredentialResponse(response) {
    // The response.credential is the ID token (a JWT)
    const id_token = response.credential;
    console.log("Encoded JWT ID Token: " + id_token);

    // After getting the token, you must send it to your server for verification.
    // This is the most critical security step.
    sendTokenToServer(id_token);
}
async function sendTokenToServer(token) {
    try {
        // Replace with the actual URL of your server's login endpoint
        const serverUrl = 'https://your-backend-url.com/auth/google'; 
        
        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_token: token }),
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('Login successful!', data);
            // Redirect or update UI to show the user is logged in
            window.location.href = '/dashboard.html';
        } else {
            console.error('Login failed:', data.message);
            alert('Google login failed. Please try again.');
        }

    } catch (error) {
        console.error('Error during Google login:', error);
        alert('An unexpected error occurred. Please try again.');
    }
}
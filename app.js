const ACCESS_TOKEN_KEY = "token";
const REQUIRED_TOKEN_VALUE = "SF2024";

function getQueryParams() {
  const params = {};
  const search = window.location.search.substring(1);
  if (!search) return params;
  const pairs = search.split("&");
  for (const pair of pairs) {
    const [rawKey, rawValue] = pair.split("=");
    const key = decodeURIComponent(rawKey || "").trim();
    if (!key) continue;
    const value = decodeURIComponent((rawValue || "").trim());
    params[key] = value;
  }
  return params;
}

function ensureAccessToken() {
  const params = getQueryParams();
  const currentToken = params[ACCESS_TOKEN_KEY];
  if (currentToken !== REQUIRED_TOKEN_VALUE) {
    window.location.href = "index.html";
  }
}

function initProtectedPage() {
  const body = document.body;
  const requiresToken = body.dataset.requireToken === "true";
  if (requiresToken) {
    ensureAccessToken();
  }
}

function initPayPalCheckout() {
  const container = document.getElementById("paypal-button-container");
  if (!container) return;
  if (typeof window.paypal === "undefined") {
    container.textContent = "[Area pulsanti PayPal - SDK non ancora configurato]";
    return;
  }

  window.paypal
    .Buttons({
      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: "[INSERIRE PREZZO]",
              },
            },
          ],
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function () {
          // Qui verrà richiamata la logica EmailJS con gli ID reali
        });
      },
    })
    .render("#paypal-button-container");
}

function sendAccessEmailWithEmailJS(params) {
  // Placeholder. Da completare con:
  // const serviceId = "[INSERIRE_EMAILJS_ID]";
  // const templateId = "[INSERIRE_EMAILJS_ID]";
  // const userId = "[INSERIRE_EMAILJS_ID]";
  // emailjs.send(serviceId, templateId, params, userId);
}

window.addEventListener("DOMContentLoaded", function () {
  initProtectedPage();
  initPayPalCheckout();
});


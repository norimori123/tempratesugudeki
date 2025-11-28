---
description: Stripe Payment Integration Guide
---

# Stripe Payment Integration Guide for Sugudeki!

This guide outlines how to replace the mock payment flow with a real Stripe Checkout integration.

## Prerequisites

1.  **Stripe Account**: Create an account at [stripe.com](https://stripe.com).
2.  **API Keys**: Get your Publishable Key and Secret Key from the Stripe Dashboard.
3.  **Product**: Create a product in Stripe (e.g., "Sugudeki Template") and get its Price ID (e.g., `price_12345...`).

## Frontend Integration (script.js)

Replace the mock logic in `script.js` with the following:

```javascript
// Initialize Stripe
const stripe = Stripe('YOUR_PUBLISHABLE_KEY'); // Replace with your actual key

const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Change button state
        checkoutBtn.textContent = '決済画面へ移動中...';
        checkoutBtn.style.opacity = '0.7';
        checkoutBtn.style.pointerEvents = 'none';

        try {
            // Call your backend to create a Checkout Session
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
            });

            const session = await response.json();

            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (result.error) {
                alert(result.error.message);
                checkoutBtn.textContent = '今すぐダウンロードする';
                checkoutBtn.style.opacity = '1';
                checkoutBtn.style.pointerEvents = 'auto';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('決済エラーが発生しました。');
        }
    });
}
```

## Backend Integration (Node.js Example)

You need a simple backend server to create the Checkout Session securely.

1.  **Install Stripe**: `npm install stripe express`
2.  **Server Code (server.js)**:

```javascript
const express = require('express');
const app = express();
const stripe = require('stripe')('YOUR_SECRET_KEY'); // Replace with your actual Secret Key

app.use(express.static('.')); // Serve your static files

const YOUR_DOMAIN = 'http://localhost:3000'; // Or your production URL

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_12345...', // Replace with your Price ID
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/download.html`, // Redirect here after payment
    cancel_url: `${YOUR_DOMAIN}/index.html`,
  });

  res.json({ id: session.id });
});

app.listen(3000, () => console.log('Running on port 3000'));
```

## Security Note

-   **Never** put your Secret Key in the frontend code (`script.js` or `index.html`).
-   The `success_url` is where the user goes after paying. In a real app, you might want to verify the session ID on this page before allowing the download, to prevent direct access.

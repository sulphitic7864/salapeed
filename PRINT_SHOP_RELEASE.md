# Print Shop Email Release

The admin order panel sends a production email only after the operator signs in and checks the bank-confirmation box. Admin sign-in is verified by the server, which issues an eight-hour HttpOnly session cookie. The email contains the front/back high-resolution reference mockups and a JSON placement sheet with print-zone bounds, center coordinates, and artwork sources.

## Configuration

1. Obtain the SMTP host, port, TLS mode, username, and password from your email provider.
2. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `PRINT_SHOP_FROM_EMAIL`, and a long random `PRINT_SHOP_RELEASE_TOKEN` in the server environment. These are server-only secrets; do not prefix them with `VITE_`. The token is verified during admin sign-in and is never shown or sent from the email preview; the server issues an eight-hour HttpOnly session for print-shop releases.
3. For local development, copy the variable names from `.env.example` into `.env`. Run `npm run dev:api` and `npm run dev` in separate terminals.
4. For deployment, run `npm run build` and start the Node server with `npm start`. The server serves `dist` when present and handles `/api/print-shop/dispatch`.

The endpoint requires a valid server-issued admin session and confirmed payment, rejects malformed attachments, and limits packages to 25 MB. An order is marked sent in its history only after the SMTP server accepts the message; that confirms SMTP handoff, not final inbox delivery. SMTP does not provide an idempotency key, so avoid retrying an order when the SMTP result is uncertain.

Uploads are attached in their original form where available. Low-resolution uploads are identified in the placement JSON and should be reviewed before printing. Front/back mockups are captured at four times the editor's rendered pixel dimensions; the original artwork attachments, rather than mockup screenshots, are the print source.
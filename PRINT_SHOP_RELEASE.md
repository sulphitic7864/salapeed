# Print Shop Email Release

The admin order panel sends a production email only after the operator signs in and checks the bank-confirmation box. Admin sign-in is verified by the server, which issues an eight-hour HttpOnly session cookie. The email contains optimized front/back JPEG mockups and PNG artwork attachments, rebuilt by the server from the saved order.

## Configuration

1. Obtain the SMTP host, port, TLS mode, username, and password from your email provider.
2. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `PRINT_SHOP_FROM_EMAIL`, and a long random `PRINT_SHOP_RELEASE_TOKEN` in the server environment. These are server-only secrets; do not prefix them with `VITE_`. The token is verified during admin sign-in and is never shown or sent from the email preview; the server issues an eight-hour HttpOnly session for print-shop releases.
3. For local development, copy the variable names from `.env.example` into `.env` and run `npm run dev`. Vite serves the API routes in-process, so a separate API terminal is not required.
4. For deployment, run `npm run build` and start the Node server with `npm start`. The server serves `dist` when present and handles `/api/print-shop/dispatch`.

The endpoint requires a valid server-issued admin session and confirmed payment and limits packages to 25 MB. Customer design images are uploaded directly to private Supabase Storage through short-lived signed upload tokens; order-save and dispatch requests carry storage references rather than base64 files. After an order is saved, the customer-placement flow starts one formatted workshop email with attachments rebuilt server-side without delaying the customer confirmation. Notification failures are logged for operators and are not shown to customers. SMTP connection and greeting attempts time out after 10 seconds; a stalled transfer may take up to two minutes. An order is marked sent in its history only after the SMTP server accepts the message; that confirms SMTP handoff, not final inbox delivery. SMTP does not provide an idempotency key, so avoid retrying an order when the SMTP result is uncertain.

Front/back mockups are resized to a maximum of 2400 pixels and JPEG-compressed for email delivery. Uploaded and vector artwork is attached as PNG; the artwork files, rather than mockup screenshots, are the print source.
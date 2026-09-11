# PrivatePilot

PrivatePilot is an authenticated profile website built with Node.js, Express, MongoDB, HTML, CSS, and JavaScript. Profile information is loaded dynamically from a protected API and is never placed in the dashboard URL.

## Features

- Registration and login
- Password hashing with bcrypt
- MongoDB-backed server sessions
- HTTP-only authentication cookie (`Secure` in production)
- Protected `GET /api/profile`
- Dynamically loaded profile dashboard
- Three application questions stored with the signed-in profile
- No public sharing links or token endpoints
- No built-in AI feature or external AI API

## Local setup

1. Run `npm install`.
2. Copy `.env.example` to `.env`.
3. Add your MongoDB Atlas connection string and a long random session secret.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Environment variables

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/privatepilot?retryWrites=true&w=majority
SESSION_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
```

For Vercel, add `MONGODB_URI`, `SESSION_SECRET`, and `NODE_ENV=production` in the project environment settings.

## Claude in Chrome classroom demonstration

1. Register and sign in.
2. Open the private dashboard and confirm that the profile information appears.
3. Open Claude in Chrome in the same browser.
4. Ask: “What details can you see on this webpage?”
5. Ask Claude for help answering “Why should we hire you?”
6. Ask: “What is my name?”
7. Claude can answer because it was given access to the active webpage. It did not learn the information from the URL and does not have direct database access.

Copying the dashboard URL into another browser does not copy the HTTP-only session cookie. The protected profile request therefore returns `401 Unauthorized` until that browser signs in.

## Tests

Run `npm test`. The tests verify protected profile access, browser-session isolation, and saving all three answers.

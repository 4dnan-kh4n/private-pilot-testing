# Global Validation Form

A complete two-step learning project using HTML, CSS, browser JavaScript, Node.js, Express, Mongoose, and MongoDB Atlas.

## Flow

1. `index.html` collects the user's name, age, and a dummy account number.
2. **Save & Next** stores the draft temporarily in `localStorage` and opens the validation page.
3. **Validate details** sends the record to the Express API and creates a random, unguessable sharing token.
4. The browser opens a unique URL such as `application.html?token=...`. Anyone with this exact URL can view the saved details.
5. The shared page displays **Why would we hire you?** and saves the answer with that application.

The backend stores and displays the complete number as requested. Use dummy digits only: never enter or publish a real bank account number in this learning project.

## MongoDB setup

1. Create a MongoDB Atlas cluster and database user.
2. Copy `.env.example` to `.env`.
3. Replace the example with your Atlas connection string.
4. Configure Atlas Network Access for your local computer and deployment.

Never commit `.env` or your database password to GitHub.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Deploy on Vercel

Import the GitHub repository and keep the Express preset. Add `MONGODB_URI` in Vercel Environment Variables before deploying. Leave the output directory empty.

## Test

```bash
npm test
```

## Important

“Global” means accessible through the same deployed server and database. It does not mean modifying the HTML source file. For a real public app, add authentication and authorization before exposing submitted records.

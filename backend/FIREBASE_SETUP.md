# Firebase Setup Guide

## Step-by-Step Instructions to Resolve Firebase Credentials Error

### Step 1: Create a Firebase Project (if you don't have one)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the prompts to create/select your project

### Step 2: Enable Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in production mode" (or test mode for development)
4. Select a location for your database
5. Click "Enable"

### Step 3: Create a Service Account

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Go to the "Service accounts" tab
4. Click "Generate new private key"
5. A JSON file will download - **keep this file safe!** This contains your credentials

### Step 4: Extract Credentials from JSON

Open the downloaded JSON file. It will look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  ...
}
```

You need to extract:
- `project_id` → Use as `FIREBASE_PROJECT_ID`
- `client_email` → Use as `FIREBASE_CLIENT_EMAIL`
- `private_key` → Use as `FIREBASE_PRIVATE_KEY` (keep the full key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

### Step 5: Create .env File

1. In the `backend` folder, create a file named `.env` (no extension)
2. Copy the format from `.env.example`
3. Paste your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour full private key here\n-----END PRIVATE KEY-----\n"

PORT=4000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` must be wrapped in quotes and include the `\n` characters as they appear in the JSON
- Keep the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Make sure `.env` is in your `.gitignore` file (never commit credentials!)

### Step 6: Verify .env File Location

Make sure your `.env` file is in the `backend` folder:
```
backend/
  ├── .env          ← Should be here
  ├── server.js
  ├── package.json
  └── ...
```

### Step 7: Test the Setup

1. Run the server:
```bash
cd backend
node server.js
```

2. You should see:
```
✅ Firebase initialized successfully
Victory  Vault backend listening on :4000
```

### Troubleshooting

**If you still get errors:**

1. **Check .env file format:**
   - Make sure there are no extra spaces
   - Make sure quotes are correct
   - Check that `\n` characters are preserved in the private key

2. **Verify credentials:**
   - Make sure you copied the entire private key including the BEGIN/END lines
   - Check that the project ID matches your Firebase project

3. **Check file location:**
   - Ensure `.env` is in the `backend` folder
   - Make sure you're running `node server.js` from the `backend` directory

4. **Development Mode (Optional):**
   If you want to run without Firebase for testing, set:
   ```env
   NODE_ENV=development
   ```
   But note: API routes won't work without Firebase credentials.

### Security Reminder

⚠️ **Never commit `.env` files to Git!**

Make sure `.env` is in your `.gitignore`:
```
# .gitignore
.env
.env.local
```


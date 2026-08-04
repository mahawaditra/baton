import "dotenv/config";
import { google } from "googleapis";
import readline from "readline";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/drive-oauth-callback",
);

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/drive.file"],
});

console.log("Open the URL and login as perlengkapan.osui:\n");
console.log(url);
console.log(
  "\nAfter consenting, the browser will redirect to localhost. Copy value 'code=...' from URL in address bar.\n",
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question("Enter the code from the URL: ", async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log("\nRefresh token to .env:\n");
  console.log(tokens.refresh_token);
  rl.close();
});

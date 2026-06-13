import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const match = envFile.match(/GEMINI_API_KEY=(.*)/);
if (match) {
  const apiKey = match[1].trim();
  fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    .then(r => r.json())
    .then(data => {
      if (data.models) {
        console.log(data.models.map(m => m.name).join('\n'));
      } else {
        console.error(data);
      }
    })
    .catch(console.error);
} else {
  console.log("No API key found in .env.local");
}

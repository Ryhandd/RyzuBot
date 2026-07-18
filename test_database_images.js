const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testFile(filename) {
  const filePath = path.join('D:/Rayhand/JavaScript/RyzuBot/media/image', filename);
  console.log(`\n--- Testing file: ${filename} ---`);
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return;
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const form = new FormData();
    form.append('image', buffer, { filename: 'screenshot.jpg', contentType: 'image/jpeg' });

    const res = await axios.post('https://api.trace.moe/search', form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    if (res.data && res.data.result && res.data.result.length > 0) {
      const topResult = res.data.result[0];
      console.log(`Similarity: ${(topResult.similarity * 100).toFixed(2)}%`);
      console.log(`AniList ID: ${topResult.anilist}`);
      console.log(`Filename: ${topResult.filename}`);
      console.log(`Episode: ${topResult.episode}`);
    } else {
      console.log("No results returned.");
    }
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

async function run() {
  await testFile('ACC6A8E847DD6CB8905582A500B593DE.jpg');
  await testFile('ACDFE22C2693A2E73387E5B6E27B7901.jpg');
}

run();

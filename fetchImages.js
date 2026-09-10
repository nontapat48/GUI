const fs = require('fs');
const https = require('https');

const products = [
  "MSI GeForce RTX 4080 SUPRIM X",
  "Gigabyte Radeon RX 7900 XTX",
  "ZOTAC Gaming GeForce RTX 4070 Ti",
  "WD_BLACK 2TB SN850X",
  "Crucial T700 2TB Gen5",
  "Kingston FURY Renegade 1TB",
  "G.Skill Trident Z5 RGB 32GB",
  "Kingston FURY Beast RGB 64GB",
  "TeamGroup T-Force Delta RGB 32GB",
  "Intel Core i9-14900K",
  "AMD Ryzen 9 7950X",
  "Intel Core i7-13700K",
  "SteelSeries Arctis Nova Pro Wireless",
  "Razer DeathAdder V3 Pro",
  "HyperX QuadCast S",
  "LG UltraGear 27 OLED Monitor"
];

function fetchImage(query) {
  return new Promise((resolve) => {
    const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query + " product");
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Bing image search results have murl":"..."
        const match = data.match(/murl&quot;:&quot;(.*?)&quot;/);
        if (match && match[1]) {
          resolve(match[1]);
        } else {
          resolve("https://picsum.photos/400"); // fallback
        }
      });
    }).on('error', () => resolve("https://picsum.photos/400"));
  });
}

async function run() {
  const results = {};
  for (const p of products) {
    const url = await fetchImage(p);
    results[p] = url;
    console.log(`"${p}": "${url}"`);
  }
}

run();

const fs = require('fs');
const zlib = require('zlib');
const https = require('https');

function encodeForKroki(text) {
  const deflated = zlib.deflateRawSync(Buffer.from(text, 'utf8'));
  let b64 = deflated.toString('base64');
  b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return b64;
}

function fetchSvg(encoded, outPath) {
  const url = 'https://kroki.io/mermaid/svg/' + encoded;
  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error('Kroki error, status', res.statusCode);
      process.exit(2);
    }
    const chunks = [];
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => {
      const buf = Buffer.concat(chunks);
      fs.writeFileSync(outPath, buf);
      console.log('Wrote', outPath);
    });
  }).on('error', (e) => {
    console.error('Request failed:', e.message);
    process.exit(3);
  });
}

if (process.argv.length < 4) {
  console.error('Usage: node render_kroki.js input.mmd output.svg');
  process.exit(1);
}

const input = process.argv[2];
const out = process.argv[3];

const text = fs.readFileSync(input, 'utf8');
const encoded = encodeForKroki(text);
fetchSvg(encoded, out);

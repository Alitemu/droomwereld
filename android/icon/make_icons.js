// Maakt de PNG's van het app-pictogram in android/res/ met Chromium (Playwright).
// Alleen nodig als je het pictogram verandert; de PNG's staan in Git, build.sh gebruikt die.
//   NODE_PATH=$(npm root -g) node android/icon/make_icons.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const DENS = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const OUT = path.join(__dirname, '..', 'res');

(async () => {
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage();
  await p.setContent('<html><body></body></html>');
  await p.addScriptTag({ path: path.join(__dirname, 'icon.js') });
  const jobs = [];
  for (const [d, f] of Object.entries(DENS)) {
    jobs.push(['mipmap-' + d, 'ic_launcher.png', 'legacy', Math.round(48 * f)]);
    jobs.push(['drawable-' + d, 'ic_bg.png', 'bg', Math.round(108 * f)]);
    jobs.push(['drawable-' + d, 'ic_fg.png', 'fg', Math.round(108 * f)]);
  }
  jobs.push(['.', 'preview.png', 'legacy', 512]);
  for (const [dir, file, kind, size] of jobs) {
    const url = await p.evaluate(([k, s]) => DWIcon.render(k, s).toDataURL('image/png'), [kind, size]);
    const dest = dir === '.' ? path.join(__dirname, file) : path.join(OUT, dir, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(url.split(',')[1], 'base64'));
    console.log(path.relative(path.join(__dirname, '..'), dest), size + 'px');
  }
  await b.close();
})();

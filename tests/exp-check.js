// Experiments sheet check: load each setup, ramp the load to its max, screenshot, read the failure labels on the chart.
// Usage: node exp-check.js [page] [outdir]
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs");
const arg = process.argv[2] || path.join(__dirname, "..", "site", "index.html"), out = path.resolve(process.argv[3] || path.join(__dirname, "out"));
fs.mkdirSync(out, { recursive: true });
const url = /^(https?|file):/.test(arg) ? arg : "file://" + path.resolve(arg);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LOAD = { column: "c-F", wall: "w-F", cells: "m-P", lattice: "l-P", sheet: "s-P" };
(async () => {
  const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars"] });
  const page = await browser.newPage(), errors = [];
  page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.setViewport({ width: +(process.env.W || 1440), height: +(process.env.H || 900) });
  await page.goto(url + "#experiments", { waitUntil: "load" }); await sleep(1200);
  await page.screenshot({ path: path.join(out, "exp-sheet.png") });
  const n = await page.$$eval("#exp-list button[data-x]", b => b.length);
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => { document.getElementById("experiments").hidden = false; });
    const title = await page.$eval(`#exp-list button[data-x="${i}"]`, b => b.closest("article").querySelector("h4").textContent);
    await page.click(`#exp-list button[data-x="${i}"]`); await sleep(700);
    const tab = await page.$eval('nav button[aria-selected="true"]', b => b.dataset.tab);
    const zero = await page.$eval("#" + LOAD[tab], s => +s.value);
    await page.evaluate(id => { const s = document.getElementById(id); s.value = s.max; s.dispatchEvent(new Event("input")); }, LOAD[tab]); await sleep(1300);
    const labels = await page.$$eval("#ch-svg text", t => t.map(x => x.textContent).filter(s => /mm|%/.test(s) && !/[a-z]{4}/i.test(s)));
    console.log(`${i} [${tab}] ${title} | load reset ${zero === 0} | fail labels: ${labels.join(", ")}`);
    await page.screenshot({ path: path.join(out, `exp-${i}.png`) });
  }
  console.log(errors.length ? "ERRORS:\n" + [...new Set(errors)].join("\n") : "no page errors");
  await browser.close(); setTimeout(() => process.exit(0), 300);
})().catch(e => { console.error(e); process.exit(1); });

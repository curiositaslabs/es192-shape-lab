// Print the Experiments sheet as a PDF guide: every answer unfolded, plus the lab's test chart for each setup.
// Usage: node experiments-pdf.js [page] [out.pdf]
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs");
const arg = process.argv[2] || path.join(__dirname, "..", "site", "index.html");
const outPdf = path.resolve(process.argv[3] || path.join(__dirname, "..", "ES192-Shape-Lab-Experiments.pdf"));
const url = /^(https?|file):/.test(arg) ? arg : "file://" + path.resolve(arg);
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars"] });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url + "#experiments", { waitUntil: "load" }); await sleep(1200);
  // a compact chart panel, so the chart's text prints at a readable size
  await page.addStyleTag({ content: ".main{grid-template-columns:minmax(0,1fr) 400px!important}.chartp{flex:none!important;height:330px!important}" }); await sleep(400);
  const items = await page.$$eval("#exp-list article", as => as.map(a => ({
    then: a.classList.contains("then"), tk: a.querySelector(".tk")?.textContent || "", title: a.querySelector("h4").textContent,
    ask: a.querySelector(".ask").innerHTML, cols: a.querySelector(".cols").innerHTML, answer: a.querySelector("details").innerHTML.replace(/<summary>.*?<\/summary>/, "") })));
  for (let i = 0; i < items.length; i++) {
    await page.evaluate(() => { document.getElementById("experiments").hidden = false; });
    await page.click(`#exp-list button[data-x="${i}"]`); await sleep(900);
    // the plot and its legend only, without the panel's buttons
    const clip = await page.evaluate(() => { const a = document.querySelector(".chartp .chartbox").getBoundingClientRect(), b = document.getElementById("ch-leg").getBoundingClientRect();
      return { x: a.left - 4, y: a.top - 4, width: a.width + 8, height: b.bottom - a.top + 8 }; });
    items[i].chart = await page.screenshot({ encoding: "base64", clip });
    items[i].chartTitle = await page.$eval("#ch-title", h => h.textContent);
  }
  const css = `@page{size:Letter;margin:16mm 15mm 16mm}
  body{font:10.5pt/1.45 "IBM Plex Sans",system-ui,sans-serif;color:#1c1b1f;margin:0}
  h1{font:700 22pt/1.1 "Barlow Condensed","Arial Narrow",sans-serif;margin:0}
  .sub{color:#66636c;margin:3px 0 10px;font-size:9.5pt}
  .how{border:1px solid #dad6d1;border-radius:6px;padding:8px 12px;background:#f6f5f2;font-size:9.5pt}
  .how ol{margin:4px 0 0;padding-left:18px}
  .exp{border-top:1.5px solid #1c1b1f;padding-top:8px;margin-top:16px}
  .exp.then{border-top:1px dashed #b5b0aa;margin-left:12px}
  .new{break-before:page}
  .tk{font:600 8pt sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#a51c30}
  h2{font:600 15pt/1.15 "Barlow Condensed","Arial Narrow",sans-serif;margin:1px 0 4px}
  .exp.then h2{font-size:13pt}
  .ask{font-weight:600;margin:2px 0 6px;break-after:avoid}
  h2,.tk{break-after:avoid}
  .top,.ans,table,figure,.exp.then{break-inside:avoid}
  .ask::before{content:"Ask: ";color:#a51c30}
  .grid{display:grid;grid-template-columns:1fr 0.95fr;gap:10px 16px;align-items:start}
  .cols{display:grid;grid-template-columns:1fr;gap:2px}
  h5{margin:4px 0 1px;font:600 7.5pt sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#66636c}
  ol,ul{margin:0;padding-left:17px} li{font-size:9.5pt}
  figure{margin:0;border:1px solid #dad6d1;border-radius:6px;padding:4px 6px}
  figcaption{font:600 7.5pt sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#66636c;margin:2px 0 2px}
  img{width:100%;max-height:70mm;object-fit:contain;display:block}
  .ans{margin-top:8px;background:#f6f5f2;border-left:3px solid #a51c30;padding:4px 12px;font-size:9.5pt}
  .ans h5{color:#a51c30}
  .ans p{margin:5px 0} .note{color:#66636c;font-size:8.5pt}
  table{border-collapse:collapse;margin:6px 0;font-size:9pt;font-variant-numeric:tabular-nums}
  th,td{padding:3px 12px 3px 0;border-bottom:1px solid #dad6d1;text-align:left}
  sub,sup{font-size:.72em;line-height:0}`;
  const body = items.map((e, i) => `<section class="exp${e.then ? " then" : ""}${!e.then && i > 0 ? " new" : ""}">
    <div class="top">${e.tk ? `<div class="tk">Experiment ${e.tk}</div>` : ""}<h2>${e.title}</h2><p class="ask">${e.ask}</p>
    <div class="grid"><div class="cols">${e.cols}</div><figure><figcaption>${e.chartTitle}</figcaption><img src="data:image/png;base64,${e.chart}" alt="Test chart for this setup"></figure></div></div>
    <div class="ans"><h5>Answer and why</h5>${e.answer}</div></section>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Shape Efficiency Lab: Experiments</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"><style>${css}</style></head><body>
  <h1>Shape Efficiency Lab: Experiments</h1>
  <div class="sub">ES 192 Materials Selection in Mechanical Design · Harvard SEAS · Week 8 · curiositaslabs.github.io/es192-shape-lab/#experiments</div>
  <div class="how"><b>How to run each one.</b><ol><li>Read the question aloud and let the class commit to an answer before anything moves.</li>
  <li>Open <b>Experiments</b> (or press E) and press <b>Load setup</b>: the right tab, sliders and chart, with the load at zero.</li>
  <li>Press ▶ (or Space to pause). The ring on each test curve marks where a specimen fails; the number under it is the deflection (or strain) there.</li>
  <li>Discuss, then reveal the answer. Each chart below shows the curves for that setup before any load is applied.</li></ol></div>
  ${body}</body></html>`;
  const pp = await browser.newPage();
  await pp.setContent(html, { waitUntil: "networkidle0" });
  await pp.pdf({ path: outPdf, format: "Letter", printBackground: true, displayHeaderFooter: true, headerTemplate: "<span></span>",
    footerTemplate: `<div style="font:8px sans-serif;color:#888;width:100%;padding:0 15mm;display:flex;justify-content:space-between"><span>ES 192 · Shape Efficiency Lab · Experiments</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: "16mm", bottom: "16mm", left: "15mm", right: "15mm" } });
  console.log("wrote", outPdf, Math.round(fs.statSync(outPdf).size / 1024) + " KB");
  await browser.close(); setTimeout(() => process.exit(0), 300);
})().catch(e => { console.error(e); process.exit(1); });

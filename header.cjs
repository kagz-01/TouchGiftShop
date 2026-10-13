const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  for (const vp of [{ w: 1440, h: 900, n: "desktop 1440" }, { w: 1280, h: 800, n: "laptop 1280" }, { w: 1024, h: 768, n: "small 1024" }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3001/", { waitUntil: "commit" });
    await page.waitForLoadState("load").catch(() => {});
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const q = s => document.querySelector(s);
      const shell = q('div.fixed.top-0');
      const logo = q('header img');
      const spacer = q('main > div[aria-hidden="true"]');
      const seasonal = [...document.querySelectorAll("div")].find(d => d.textContent.includes("Shop the Edit") && d.className.includes("bg-gradient-to-r"));
      const rect = e => e ? { t: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height), b: Math.round(e.getBoundingClientRect().bottom) } : null;
      return { shell: rect(shell), logo: rect(logo), spacer: rect(spacer), seasonal: rect(seasonal) };
    });
    console.log(`\n=== ${vp.n} ===`);
    console.log("  fixed shell   ", JSON.stringify(r.shell));
    console.log("  logo          ", JSON.stringify(r.logo));
    console.log("  seasonal bar  ", JSON.stringify(r.seasonal));
    console.log("  flow spacer   ", JSON.stringify(r.spacer));
    const pct = r.shell ? Math.round((r.shell.h / vp.h) * 100) : 0;
    console.log(`  header eats ${pct}% of a ${vp.h}px viewport`);
    await ctx.close();
  }
  await browser.close();
})();
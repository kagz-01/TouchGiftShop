const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  for (const vp of [{ w: 1440, h: 900 }, { w: 1280, h: 800 }, { w: 1024, h: 768 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3001/", { waitUntil: "commit" });
    await page.waitForLoadState("load").catch(() => {});
    await page.waitForTimeout(1800);
    const r = await page.evaluate(() => {
      const shell = document.querySelector("div.fixed.top-0");
      const logo = document.querySelector("header img");
      const spacer = document.querySelector('main > div[aria-hidden="true"]');
      const seasonal = [...document.querySelectorAll("div")].find(
        d => d.textContent.includes("Shop the Edit") && d.className.includes("bg-gradient-to-r")
      );
      const rect = e => e ? { top: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height), bottom: Math.round(e.getBoundingClientRect().bottom) } : null;
      const sr = rect(seasonal);
      const hr = rect(shell);
      return {
        shell: hr, logo: rect(logo), spacer: rect(spacer), seasonal: sr,
        cssVar: getComputedStyle(document.documentElement).getPropertyValue("--header-h").trim(),
        // does the seasonal bar sit inside the shell (no overlap) or under it?
        overlapping: sr && hr ? sr.bottom > hr.top + 1 && sr.top < hr.bottom - 1 : false,
        covered: sr && hr ? hr.top <= sr.top && hr.bottom >= sr.bottom : false,
      };
    });
    const pct = r.shell ? Math.round((r.shell.h / vp.h) * 100) : 0;
    console.log(`\n=== ${vp.w}x${vp.h} ===`);
    console.log(`  shell    ${JSON.stringify(r.shell)}  (${pct}% of viewport)`);
    console.log(`  logo     ${JSON.stringify(r.logo)}`);
    console.log(`  seasonal ${JSON.stringify(r.seasonal)}`);
    console.log(`  spacer   ${JSON.stringify(r.spacer)}   --header-h=${r.cssVar}`);
    if (r.seasonal) {
      console.log(`  overlap: ${r.overlapping ? "YES - BUG" : "no"}   painted-over: ${r.covered ? "YES - BUG" : "no"}`);
      console.log(`  spacer bottom (${r.spacer?.bottom}) vs shell bottom (${r.shell?.bottom}) -> ${r.spacer && r.shell && r.spacer.bottom >= r.shell.bottom ? "clears" : "UNDERLAPS"}`);
    }
    await ctx.close();
  }
  await browser.close();
})();
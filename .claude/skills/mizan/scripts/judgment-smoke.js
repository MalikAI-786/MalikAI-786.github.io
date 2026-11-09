#!/usr/bin/env node
/* Privacy and interaction checks for the standalone judgment worksheet.
 * Run from any directory: node .claude/skills/mizan/scripts/judgment-smoke.js
 * Requires Playwright and its Chromium browser. NODE_PATH may locate an
 * existing shared installation; no dependency is needed by the page itself.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const pagePath = path.resolve(__dirname, '../../../../mizan/judgment/index.html');
const sourceRoot = path.dirname(pagePath);
const checks = [];
function check(name, value) { assert.ok(value, name); checks.push(name); }
(async function () {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({acceptDownloads:true});
    const page = await context.newPage();
    const errors = [], remote = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if(m.type()==='error') errors.push(m.text()); });
    page.on('request', r => { if(/^https?:/.test(r.url())) remote.push(r.url()); });
    await page.addInitScript(() => {
      ['mizan.v1','mizan.money.v1','mizan.lab.v1'].forEach(k => localStorage.setItem(k,'untouched-sentinel'));
      sessionStorage.setItem('judgment-test','untouched-sentinel');
    });
    await page.goto(pathToFileURL(pagePath).href);
    check('empty challenge stays hidden', !await page.locator('#challengeSection').isVisible());
    check('empty answer cannot unlock challenge', await page.locator('#reveal').isDisabled());
    await page.fill('#firstAnswer','   '); await page.fill('#firstConfidence','50');
    check('whitespace answer rejected', await page.locator('#reveal').isDisabled());
    await page.fill('#firstAnswer','Attribute the view to the named thinker unless the author endorses it.');
    await page.fill('#firstConfidence','101');
    check('out-of-range confidence rejected', await page.locator('#reveal').isDisabled());
    await page.fill('#firstConfidence','60'); await page.click('#reveal');
    check('first answer held and track locked', await page.locator('#firstAnswer').isDisabled() && await page.locator('#track').isDisabled());
    check('challenge revealed with keyboard focus', await page.locator('#challengeSection').isVisible() && await page.evaluate(()=>document.activeElement.id==='challengeTitle'));
    check('incomplete revision cannot export', await page.locator('#export').isDisabled());
    await page.fill('#evidence','Iqbal, printed pp. 112–116. Named accounts checked.');
    await page.fill('#counterEvidence','A historian may endorse a reported argument; attribution alone does not settle that.');
    await page.fill('#revision','Check attribution and the surrounding evaluative language. <script>literal text only</script>');
    await page.fill('#nextStep','Inspect the full passage before writing a public claim.');
    check('missing revised confidence blocks export', await page.locator('#export').isDisabled());
    await page.fill('#revisedConfidence','75');
    const downloadEvent=page.waitForEvent('download'); await page.click('#export');
    const download=await downloadEvent, content=await fs.readFile(await download.path(),'utf8');
    check('manual export preserves first and revised answers',content.includes('Attribute the view to the named thinker') && content.includes('Check attribution and the surrounding evaluative language.') && content.includes('Confidence: 60%') && content.includes('Confidence after checking: 75%'));
    check('export is literal text with educational boundary',content.includes('<script>literal text only</script>') && content.includes('not research evidence'));
    check('shared state is unchanged',await page.evaluate(()=>['mizan.v1','mizan.money.v1','mizan.lab.v1'].every(k=>localStorage.getItem(k)==='untouched-sentinel') && localStorage.length===3 && sessionStorage.length===1));
    await page.reload();
    check('reload clears entries and closes challenge',await page.inputValue('#firstAnswer')==='' && !await page.locator('#challengeSection').isVisible());
    for(const track of ['dba','newsletter']) {
      await page.selectOption('#track',track); await page.fill('#firstAnswer','This is a limited observation; I need the missing evidence.'); await page.fill('#firstConfidence','40'); await page.click('#reveal');
      check(track+' fictional challenge is available',/fictional|original/.test(await page.locator('#readingNote').innerText()));
      await page.click('#clear');
      check(track+' clear returns to empty gate',await page.inputValue('#firstAnswer')==='' && await page.locator('#reveal').isDisabled());
    }
    await page.setViewportSize({width:390,height:844});
    check('mobile has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.fill('#firstAnswer','A provisional answer.'); await page.fill('#firstConfidence','50'); await page.click('#reveal');
    check('expanded mobile has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(process.env.JUDGMENT_SCREENSHOT) await page.screenshot({path:process.env.JUDGMENT_SCREENSHOT,fullPage:true});
    await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
    check('leaving clears the retained answer',await page.inputValue('#firstAnswer')==='' && !await page.locator('#challengeSection').isVisible());
    check('no automatic remote requests',remote.length===0);
    check('no console or page errors',errors.length===0);
    for(const filename of ['index.html','judgment.js','judgment.css']) {
      const s=await fs.readFile(path.join(sourceRoot,filename),'utf8');
      check(filename+' introduces no hardcoded color',!/#(?:[0-9a-f]{3}|[0-9a-f]{6})\b/i.test(s));
    }
    const js=await fs.readFile(path.join(sourceRoot,'judgment.js'),'utf8');
    check('module has no storage or transport APIs',!/(?:localStorage|sessionStorage|indexedDB|fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|document\.cookie)/.test(js));
    console.log(JSON.stringify({passed:checks.length,checks,remote_requests:remote,errors},null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});

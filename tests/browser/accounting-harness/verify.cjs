// Real Chrome/DevTools verification; no Playwright dependency, app server or tenant session.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const base = process.argv[2];
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(base || '')) throw Error('Supply the isolated harness URL');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pls-accounting-chrome-'));
const executable = process.env.ACCOUNTING_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const chrome = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const destinations = ['', 'chart-of-accounts', 'general-ledger', 'journals', 'receivables', 'payables', 'expenses', 'revenue', 'cogs', 'cash-bank', 'reconciliation', 'suppliers', 'inventory', 'statements', 'trial-balance', 'tax', 'periods', 'audit', 'settings'];
let ws, session, sequence = 0;
const pending = new Map(), errors = [], reports = [];
const diagnostics = { blockedExternal: [] };
const screenshots = process.env.ACCOUNTING_SCREENSHOTS;
if (screenshots) fs.mkdirSync(screenshots, {recursive:true});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function send(method, params = {}, sessionId = session) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function load(section, query = '') {
  await send('Page.navigate', { url: `${base}/pharmacy/accounting${section ? '/' + section : ''}${query}` });
  for (let i = 0; i < 100; i++) {
    await wait(75);
    if (await evaluate(`!!document.querySelector('#pharmacy-accounting-title') && !document.querySelector('[aria-busy="true"]') && document.body.innerText.indexOf('Verifying accounting') === -1`)) return;
  }
  throw Error(`Destination did not settle: ${section}; ${await evaluate('document.body.innerText')}`);
}
const inspect = `(() => {
 const visible=e=>!e.closest('[aria-hidden="true"]')&&!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)&&getComputedStyle(e).visibility!=='hidden';
 const clipped=e=>{let p=e.parentElement;while(p&&p!==document.body){if(/auto|scroll|hidden|clip/.test(getComputedStyle(p).overflowX)&&p.scrollWidth>p.clientWidth)return true;p=p.parentElement;}return false;};
 const name=e=>e.getAttribute('aria-label')||e.getAttribute('title')||(e.labels&&[...e.labels].map(l=>l.textContent.trim()).join(' '))||(e.getAttribute('aria-labelledby')||'').split(' ').map(id=>document.getElementById(id)?.textContent||'').join(' ').trim()||(e.tagName==='BUTTON'?e.textContent.trim():'');
 const fields=[...document.querySelectorAll('input,select,textarea,button')].filter(e=>visible(e)&&e.type!=='hidden'&&!e.disabled);
 const badForms=[...document.forms].flatMap(f=>{let p=f.parentElement;const bad=[];while(p&&p!==document.body){const s=getComputedStyle(p);if((p.className||'').toString().match(/(?:^|\\s)(?:card|panel)(?:\\s|$)/)||parseFloat(s.borderRadius)>2&&(parseFloat(s.borderTopWidth)>0||s.boxShadow!=='none'))bad.push(p.className);p=p.parentElement;}return bad;});
 const tables=[...document.querySelectorAll('[data-accounting-table=true]')].filter(visible);
 return {title:document.querySelector('h1')?.textContent,nav:document.querySelectorAll('nav[aria-label="Pharmacy accounting"] a').length,
 tableFrames:tables.map(e=>{const s=getComputedStyle(e.firstElementChild);return {border:parseFloat(s.borderTopWidth),radius:parseFloat(s.borderRadius)};}),
 squeezed:[...document.querySelectorAll('form table input:not([type=checkbox]),form table select')].filter(visible).filter(e=>e.getBoundingClientRect().width<(e.tagName==='SELECT'?160:90)).map(e=>name(e)),
 bodyWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
 overflow:[...document.querySelectorAll('input,select,textarea,fieldset,form,section,nav')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return !clipped(e)&&(r.right>innerWidth+2||r.left< -2)}).map(e=>({tag:e.tagName,text:e.textContent?.slice(0,55),width:e.getBoundingClientRect().width})),
 unlabeled:fields.filter(e=>!name(e)).map(e=>({tag:e.tagName,type:e.type,html:e.outerHTML.slice(0,220)})),
 badForms, tables:document.querySelectorAll('table').length, alerts:[...document.querySelectorAll('[role=alert]')].map(e=>e.textContent),
 headings:[...document.querySelectorAll('h2')].filter(visible).map(e=>e.textContent), background:getComputedStyle(document.body).backgroundColor};
})()`;
(async () => {
  const endpoint = await new Promise((resolve, reject) => {
    let text = '';
    chrome.stderr.on('data', chunk => { text += chunk; const found = text.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (found) resolve(found[1]); });
    chrome.once('error', reject);
    setTimeout(() => reject(Error('Chrome did not expose DevTools')), 20000).unref();
  });
  ws = new WebSocket(endpoint);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  ws.addEventListener('message', async event => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const request = pending.get(data.id); pending.delete(data.id); clearTimeout(request.timer);
      data.error ? request.reject(Error(JSON.stringify(data.error))) : request.resolve(data.result);
    } else if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails);
    else if (data.method === 'Fetch.requestPaused') {
      const request = data.params;
      if (request.request.url.startsWith(base + '/') || request.request.url.startsWith('data:')) await send('Fetch.continueRequest', { requestId: request.requestId }, data.sessionId);
      else { diagnostics.blockedExternal.push(request.request.url); await send('Fetch.failRequest', { requestId: request.requestId, errorReason: 'BlockedByClient' }, data.sessionId); }
    }
  });
  const target = await send('Target.createTarget', { url: 'about:blank' }, null);
  session = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null)).sessionId;
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  for (const width of [1440, 390]) for (const theme of ['light', 'dark']) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 600 });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
    for (const section of destinations) {
      await load(section);
      await evaluate(`document.documentElement.dataset.bsTheme=${JSON.stringify(theme)};document.documentElement.dataset.theme=${JSON.stringify(theme)};document.documentElement.classList.toggle('dark',${theme === 'dark'})`);
      // Exercise progressive financial forms too, not only their collapsed summaries.
      await evaluate(`document.querySelectorAll('details:not([data-accounting-export])').forEach(e=>e.open=true)`);
      await wait(40);
      await evaluate(`(() => {const visible=e=>e.getClientRects().length&&!e.disabled&&!e.closest('[aria-hidden=true]');const controls=[...document.querySelectorAll('button,input,select,textarea,summary,a[href],[tabindex="0"]')].filter(visible);(controls.find(e=>!e.closest('header,nav'))||controls[0])?.focus();})()`);
      await send('Input.dispatchKeyEvent', {type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      await send('Input.dispatchKeyEvent', {type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      assert.ok(await evaluate(`document.activeElement!==document.body`),`Keyboard reaches a control on ${section||'overview'} / ${width} / ${theme}`);
      const report = { section: section || 'overview', width, theme, ...await evaluate(inspect) };
      reports.push(report);
      assert.ok(await evaluate(`getComputedStyle(document.querySelector('h1')).fontFamily.includes('Segoe UI')`),'Use the configured application font');
      assert.ok(report.tableFrames.every(frame=>frame.border===0&&frame.radius===0),`Lab Accounting flat table presentation: ${section}/${width}/${theme}`);
      if (!section) {
        const summary = await evaluate(`(() => {const e=document.querySelector('dl[aria-label="Accounting summary"]');return {metrics:e?.children.length,colour:e&&getComputedStyle(e).color,gradients:e&&[...e.querySelectorAll('*')].some(child=>getComputedStyle(child).backgroundImage!=='none')};})()`);
        assert.equal(summary.metrics,4);assert.equal(summary.gradients,false,'Neutral Payroll summary, not coloured Billing cards');
      }
      if (section==='statements') {
        const summary=await evaluate(`(() => {const groups=[...document.querySelectorAll('section[aria-label$=" summary"]')];const cards=groups.flatMap(e=>[...e.querySelectorAll('dl > div')]);const expense=cards.find(e=>e.querySelector('dt')?.textContent==='Operating expenses');return {groups:groups.length,cards:cards.length,expense:expense?.querySelector('dd')?.textContent,bordered:groups.every(e=>parseFloat(getComputedStyle(e.querySelector('dl')).borderTopWidth)>0),amountsFit:cards.every(e=>{const value=e.querySelector('dd'),range=document.createRange();range.selectNodeContents(value);return value.scrollWidth<=value.clientWidth&&range.getClientRects().length===1}),expensesLink:document.querySelector('a[href="/pharmacy/accounting/expenses"]')?.textContent};})()`);
        assert.equal(summary.groups,3);assert.equal(summary.cards,14);assert.ok(summary.bordered);assert.ok(summary.amountsFit,'Large monetary values must fit without breaking across lines');assert.match(summary.expense,/200[.]00/);assert.equal(summary.expensesLink,'Review expenses');
      }
      if (section==='journals') {
        await evaluate(`document.activeElement?.blur()`);
        await wait(300);
        const colours = await evaluate(`(() => {const e=document.querySelector('summary.btn-primary'),probe=document.createElement('span');probe.style.color='var(--theme-accent,var(--pls-primary,var(--bs-primary)))';e.append(probe);const value={actual:getComputedStyle(e).backgroundColor,expected:getComputedStyle(probe).color};probe.remove();return value;})()`);
        assert.equal(colours.actual,colours.expected,'Primary actions use the PLS theme, not Bootstrap blue');
      }
      if (screenshots && ['','general-ledger','journals','payables','statements'].includes(section)) {
        await evaluate(`document.activeElement?.blur();window.scrollTo(0,0)`);
        const shot=await send('Page.captureScreenshot',{format:'png'});
        fs.writeFileSync(path.join(screenshots,`${section||'overview'}-${width}-${theme}.png`),Buffer.from(shot.data,'base64'));
      }
      const choices = await evaluate(`[...document.querySelectorAll('nav[aria-label$=" views"] button')].map(e=>e.textContent)`);
      for (const choice of choices.slice(1)) {
        await evaluate(`[...document.querySelectorAll('nav[aria-label$=" views"] button')].find(e=>e.textContent===${JSON.stringify(choice)}).click()`);
        await wait(120);
        await evaluate(`document.querySelectorAll('details:not([data-accounting-export])').forEach(e=>e.open=true)`);
        await wait(120);
        const viewReport={section:section+':'+choice,width,theme,...await evaluate(inspect)};
        reports.push(viewReport);
        assert.equal(await evaluate(`document.querySelectorAll('nav[aria-label$=" views"] button[aria-pressed=true]').length`),1);
        assert.ok(viewReport.tableFrames.every(frame=>frame.border===0&&frame.radius===0));
      }
      console.log(JSON.stringify({ section: report.section, width, theme, overflow: report.overflow.length, labels: report.unlabeled.length, formAncestors: report.badForms.length, background: report.background }));
      if (section === 'general-ledger') {
        const screenshot = Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data,'base64');
        diagnostics[`screenshot:${width}:${theme}`] = { bytes: screenshot.length, width: screenshot.readUInt32BE(16), height: screenshot.readUInt32BE(20) };
      }
    }
  }
  // Keyboard reachability and real supplier combobox filtering/selection.
  await load('suppliers');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  assert.ok(await evaluate(`document.activeElement!==document.body`), 'Tab reaches a real control');
  await evaluate(`document.querySelector('#accounting-supplier').focus()`);
  await send('Input.insertText', { text: 'Akwa' });
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await wait(100);
  diagnostics.supplierSelected = await evaluate(`document.querySelector('input[name=supplier]')?.value`);
  assert.equal(diagnostics.supplierSelected,'supplier-exact-1', 'Human-named supplier is keyboard-selectable');
  await evaluate(`document.querySelector('input[name=supplier]').form.requestSubmit()`);
  await wait(120);
  diagnostics.supplierStatement = await evaluate(`window.__requests.some(path=>path.includes('/suppliers/supplier-exact-1/statement'))&&document.body.innerText.includes('Supplier statement · Akwa Synthetic Medical Supplies')`);
  assert.ok(diagnostics.supplierStatement,'Exact supplier selection loads its named statement');
  await load('general-ledger');
  const exact = await evaluate(`({short:document.body.innerText.includes('JRN-266A7E7D'),full:[...document.querySelectorAll('[title]')].some(e=>e.title==='266a7e7d-2000-4000-8000-012345678901'),href:[...document.querySelectorAll('a')].some(e=>e.href.includes('266a7e7d-2000-4000-8000-012345678901'))})`);
  assert.deepEqual(exact, { short: true, full: true, href: true });
  diagnostics.ledgerIdentifiers = exact;
  await load('settings');
  diagnostics.noAutomaticHistoryScan = await evaluate(`!window.__requests.some(path=>path.includes('/consolidation'))`);
  assert.ok(diagnostics.noAutomaticHistoryScan, 'Settings must not scan full history automatically');
  // Use real DOM events and real hook/form handlers, with only transport replaced.
  await load('journals');
  await evaluate(`document.querySelector('details').open=true`);
  const setField = async (selector, value) => {
    await evaluate(`(() => {const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing field '+${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e.tagName==='SELECT'?HTMLSelectElement.prototype:e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await wait(40);
  };
  await setField('input[name=description]', 'Synthetic balanced journal');
  await setField('input[name=financialDate]', '2099-01-03');
  const values = await evaluate(`[...document.querySelectorAll('tbody select')][0] ? [...document.querySelector('tbody select').options].filter(e=>e.value).map(e=>e.value) : []`);
  assert.ok(values.length >= 2);
  await setField('tbody tr:nth-child(1) select', values[0]);
  await setField('tbody tr:nth-child(2) select', values[1]);
  await setField('input[aria-label="Line 1 debit"]', '12.50');
  await setField('input[aria-label="Line 2 credit"]', '12.50');
  await evaluate(`document.querySelector('input[name=description]').form.requestSubmit()`);
  await wait(120);
  diagnostics.journalRequest = await evaluate(`window.__mutations?.[0]`);
  assert.equal(diagnostics.journalRequest?.endpoint,'pharmacy/accounting/journals');
  assert.equal(diagnostics.journalRequest.body.lines[0].debit,'12.50');
  assert.equal(diagnostics.journalRequest.body.lines[1].credit,'12.50');
  assert.ok(diagnostics.journalRequest.body.idempotencyKey);
  await load('expenses');
  await evaluate(`document.querySelector('details').open=true`);
  await setField('input[name=description]', 'Synthetic expense');
  await setField('input[name=amount]', '25.00');
  await setField('input[name=financialDate]', '2099-01-03');
  const expenseAccount = await evaluate(`document.querySelector('select[name=expenseAccount]').options[1].value`);
  await setField('select[name=expenseAccount]', expenseAccount);
  await setField('select[name=supplierId]', 'supplier-exact-1');
  await evaluate(`document.querySelector('input[name=description]').form.requestSubmit()`);
  await wait(120);
  diagnostics.expenseRequest = await evaluate(`window.__mutations?.[0]`);
  assert.equal(diagnostics.expenseRequest?.endpoint,'pharmacy/accounting/expenses');
  assert.equal(Number(diagnostics.expenseRequest.body.amount),25);
  assert.equal(diagnostics.expenseRequest.body.supplierId,'supplier-exact-1');
  await load('payables');
  await evaluate(`[...document.querySelectorAll('nav[aria-label="Payables views"] button')].find(e=>e.textContent==='Existing payments & credits').click()`);
  await wait(80);
  await evaluate(`[...document.querySelectorAll('details')].find(e=>e.querySelector('summary')?.textContent.startsWith('Apply existing supplier')).open=true`);
  await wait(120);
  await evaluate(`document.querySelector('#accounting-supplier').focus()`);
  await send('Input.insertText', {text:'Akwa'});
  await send('Input.dispatchKeyEvent', {type:'keyDown',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40});
  await send('Input.dispatchKeyEvent', {type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await wait(160);
  await setField('input[name=applicationDate]','2099-01-03');
  await setField('select[name=sourceId]','registered-source-exact');
  await setField('select[name=billId-1]','original-bill-exact');
  await setField('input[name=allocationAmount-1]','10.00');
  await setField('form:has(select[name=sourceId]) textarea[name=reason]','Reviewed synthetic source attribution');
  await evaluate(`[...document.querySelectorAll('nav[aria-label="Payables views"] button')].find(e=>e.textContent==='Supplier bills').click()`);
  await wait(40);
  assert.equal(await evaluate(`document.querySelector('form:has(select[name=sourceId]) textarea[name=reason]').value`),'Reviewed synthetic source attribution','Switching views preserves the draft');
  await evaluate(`[...document.querySelectorAll('nav[aria-label="Payables views"] button')].find(e=>e.textContent==='Existing payments & credits').click()`);
  await wait(40);
  await evaluate(`document.querySelector('select[name=sourceId]').form.requestSubmit()`);
  await wait(100);
  diagnostics.supplierApplication = await evaluate(`window.__mutations?.[0]`);
  assert.equal(diagnostics.supplierApplication?.endpoint,'pharmacy/accounting/payables/allocations');
  assert.deepEqual(diagnostics.supplierApplication.body.allocations,[{billId:'original-bill-exact',amount:'10.00'}]);
  // Verify original posted source uses are retrieved, not reconstructed client-side.
  await evaluate(`[...document.querySelectorAll('tr')].find(e=>e.textContent.includes('Reviewed synthetic original application')).querySelector('button').click()`);
  await wait(160);
  diagnostics.sourceUsesVisible = await evaluate(`document.body.innerText.includes('use-original')&&window.__requests.some(e=>e.endsWith('/payables/allocations/application-exact'))`);
  assert.ok(diagnostics.sourceUsesVisible);
  const financialReview = await evaluate(inspect);
  assert.equal(financialReview.badForms.length,0);
  assert.equal(financialReview.unlabeled.length,0);
  await load('payables');
  await evaluate(`[...document.querySelectorAll('nav[aria-label="Payables views"] button')].find(e=>e.textContent==='Reversals').click()`);
  await wait(120);
  await evaluate(`[...document.querySelectorAll('tr')].find(e=>e.textContent.includes('Voided synthetic reversal')).querySelector('button').click()`);
  await wait(100);
  await evaluate(`[...document.querySelectorAll('details')].find(e=>e.querySelector('summary')?.textContent==='Replace this voided reversal intent').open=true`);
  await setField('form:has(textarea[name=reason]) input[name=date]','2099-01-05');
  await setField('textarea[name=reason]','Reviewed replacement after void');
  await evaluate(`document.querySelector('textarea[name=reason]').form.requestSubmit()`);
  await wait(100);
  diagnostics.reversalReplacement = await evaluate(`window.__mutations?.[0]`);
  assert.equal(diagnostics.reversalReplacement?.endpoint,'pharmacy/accounting/payables/settlement-reversals/voided-reversal-exact/replacements');
  assert.equal(diagnostics.reversalReplacement.body.expectedVersion,5);
  assert.ok(diagnostics.reversalReplacement.body.idempotencyKey);
  await send('Emulation.setDeviceMetricsOverride', { width: 1123, height: 794, deviceScaleFactor: 1, mobile: false });
  for (const section of ['general-ledger', 'statements', 'inventory', 'tax']) {
    await load(section);
    await send('Emulation.setEmulatedMedia', { media: 'print' });
    const print = await evaluate(`({tables:document.querySelectorAll('table').length,visibleButtons:[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length&&getComputedStyle(e).display!=='none').length,headings:[...document.querySelectorAll('h2')].filter(e=>e.getClientRects().length).map(e=>e.textContent)})`);
    const pdf = await send('Page.printToPDF', { printBackground: true, paperWidth: 11.7, paperHeight: 8.3, preferCSSPageSize: true });
    const bytes = Buffer.from(pdf.data, 'base64');
    diagnostics[`print:${section}`] = { ...print, pdfBytes: bytes.length, pdfHeader: bytes.subarray(0, 5).toString() };
    assert.ok(print.tables > 0 && print.headings.length > 0 && print.visibleButtons === 0 && bytes.length > 2000, `Printable structured ${section} with business heading`);
    await send('Emulation.setEmulatedMedia', { media: '' });
  }
  await load('general-ledger', '?failure=1');
  diagnostics.failure = await evaluate(`({error:document.body.innerText.includes('Synthetic service unavailable'),tables:document.querySelectorAll('table').length})`);
  assert.deepEqual(diagnostics.failure, { error: true, tables: 0 });
  const issues = reports.filter(r => r.unlabeled.length || r.badForms.length || r.squeezed.length || r.overflow.length || r.scrollWidth > r.bodyWidth + 2 || r.nav !== 0 || r.alerts.some(message=>!(r.section==='inventory'&&message.startsWith('Inventory is not reconciled.'))));
  assert.notEqual(reports.find(r=>r.theme==='light').background,reports.find(r=>r.theme==='dark').background,'Both real theme styles are exercised');
  console.log('BROWSER_SUMMARY', JSON.stringify({ cases: reports.length, issues, errors, diagnostics }));
  assert.equal(errors.length, 0, 'No browser runtime exceptions');
  assert.equal(issues.length, 0, 'No overflow, unlabelled controls, decorative form ancestors or unexpected API errors');
})().catch(error => { console.error(error); console.error('BROWSER_FAILURE',JSON.stringify({errors,diagnostics})); process.exitCode = 1; }).finally(async () => {
  if (ws?.readyState === 1) { try { await send('Browser.close', {}, null); } catch {} ws.close(); }
  if (chrome.exitCode === null) await new Promise(resolve => { chrome.once('exit', resolve); setTimeout(() => { chrome.kill(); resolve(); }, 5000).unref(); });
  for (const request of pending.values()) clearTimeout(request.timer);
  await wait(250);
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
});

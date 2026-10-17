// דף הקישורים של שבוע: אותן פעילויות כמו ב־QR שבחוברת, לפתיחה מהמחשב.
(function () {
  const n = parseInt(location.pathname.match(/w(\d+)\/?/)[1], 10);
  const Wk = WEEKS[n];
  const card = l => `<a class="link" href="../${l.path}">
    <span class="ic">${l.icon}</span>
    <span><b>${l.title}</b><small>${l.desc}</small>${l.session ? `<span class="tag">מפגש ${l.session}</span>` : '<span class="tag">כל השבוע</span>'}</span></a>`;
  const bySession = [1, 2, 3, 4].map(s => ({ s, links: Wk.links.filter(l => l.session === s) })).filter(g => g.links.length);
  document.getElementById('out').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin:6px 0 4px">
      ${squishySVG('#2A9D8F', 84)}
      <div><div style="color:var(--brown)">שבוע ${Wk.n}</div><h1>${Wk.title}</h1><div>${Wk.subtitle}</div></div>
    </div>
    <p class="lead">משפט השבוע: <span class="en" style="font-size:26px">${Wk.sentence}</span>
      <button class="speak" style="vertical-align:middle;width:44px;height:44px;font-size:20px" onclick="say('${Wk.sentence}')" aria-label="שומעים">🔊</button></p>
    ${Wk.sessions.some(x => x.kid) ? `<h2 style="margin:22px 0 10px">▶ מתחילים מפגש עם סקווישי</h2>
      <div class="links">${Wk.sessions.filter(x => x.kid).map(x => `<a class="link" href="../play/lesson.html?w=${Wk.n}&s=${x.n}" style="border-color:var(--coral)">
        <span class="ic">▶</span><span><b>מפגש ${x.n}: ${x.title}</b><small>המסך מוביל, הדפים בצד</small></span></a>`).join('')}</div>` : ''}
    ${bySession.map(g => `<h2 style="margin:22px 0 10px">מפגש ${g.s}</h2><div class="links">${g.links.map(card).join('')}</div>`).join('')}
    <h2 style="margin:22px 0 10px">כל השבוע</h2>
    <div class="links">${Wk.links.filter(l => !l.session).map(card).join('')}</div>
    <h2 style="margin:28px 0 10px">לאמא</h2>
    <div class="links">
      <a class="link" href="../pdf/w${Wk.n}-mom.pdf"><span class="ic">📗</span><span><b>המדריך למפגשים</b><small>PDF בצבע, עם קישורים</small></span></a>
      <a class="link" href="../pdf/w${Wk.n}-kid.pdf"><span class="ic">🖨</span><span><b>הדפים של הילדה</b><small>PDF להדפסה, שחור־לבן</small></span></a>
      <a class="link" href="../pdf/מדריך-לאמא-צבע.pdf"><span class="ic">📘</span><span><b>למה השיעור בנוי ככה</b><small>המדריך לאמא (PDF)</small></span></a>
    </div>`;
})();

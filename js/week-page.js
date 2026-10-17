// דף השבוע: רק המפגשים בנגן, ודפים להדפסה.
// (הפעילויות נפתחות מתוך המפגשים עצמם, וקישורי ה־QR בחוברת עדיין עובדים.)
function weekPage() {
  const n = parseInt(location.pathname.match(/w(\d+)\/?/)[1], 10);
  const Wk = WEEKS[n];
  document.getElementById('out').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin:6px 0 4px">
      ${squishySVG('#2A9D8F', 84)}
      <div><div style="color:var(--brown)">שבוע ${Wk.n}</div><h1>${Wk.title}</h1><div>${Wk.subtitle}</div></div>
    </div>
    <h2 style="margin:22px 0 10px">▶ המפגשים</h2>
    <div class="links">${Wk.sessions.filter(x => x.kid).map(x => `<a class="link" href="../play/lesson.html?w=${Wk.n}&s=${x.n}" style="border-color:var(--coral)">
      <span class="ic" style="font-family:Pogo,Rubik;font-size:30px;color:var(--coral)">${x.n}</span><span><b>${x.title}</b><small>המסך מוביל, הדפים בצד</small></span></a>`).join('')}</div>
    <h2 style="margin:28px 0 10px">🫧 חזרה</h2>
    <div class="links">
      <a class="link" href="../play/cards.html?w=${Wk.n}"><span class="ic">🫧</span><span><b>קופסת הסקווישים</b><small>כל הכרטיסים שכבר למדנו. חזרה של 5 דקות, מתי שרוצים.</small></span></a>
    </div>
    <h2 style="margin:28px 0 10px">🖨 דפים להדפסה</h2>
    <div class="links">
      <a class="link" href="../pdf/w${Wk.n}-kid.pdf"><span class="ic">🖨</span><span><b>הדפים של השבוע</b><small>PDF בשחור־לבן. מדפיסים פעם אחת לפני מפגש 1.</small></span></a>
    </div>`;
  profileBadge(document.getElementById('badge'));
}
requireProfile(weekPage);

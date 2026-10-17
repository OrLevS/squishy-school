// מנוע החוברת השבועית: print/booklet.html?w=1
// קורא את data/week-NN.js ובונה: שער + קישורים, האנגלית של השבוע,
// מדריך אמא לכל מפגש, דפי עבודה לילדה, כרטיסים ודף מעקב.

(function () {
  const W = window.WEEKS[new URLSearchParams(location.search).get('w') || 1];
  // part=mom: מדריך האמא בצבע, ל־PDF דיגיטלי עם קישורים לחיצים
  // part=kid: דפי הילדה בשחור־לבן, להדפסה
  const PART = new URLSearchParams(location.search).get('part') || 'all';
  const MOM = PART === 'mom';
  if (MOM) document.documentElement.classList.add('mom-color');
  document.addEventListener('DOMContentLoaded', () => {
    const tb = document.querySelector('.toolbar');
    if (tb && PART !== 'all') tb.firstChild.textContent = MOM ? 'מדריך לאמא · PDF דיגיטלי בצבע ' : 'הדפים של הילדה · A4 · שחור־לבן ';
  });
  const SITE = window.SITE;
  const root = document.getElementById('booklet');
  document.title = `חוברת שבוע ${W.n} · ${W.title}`;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const url = path => SITE.base + path;
  // עוטף קטעי אנגלית בתוך טקסט עברי, כדי שסימני פיסוק לא יקפצו לצד הלא נכון
  const tx = str => {
    let out = '', last = 0;
    String(str).replace(/[A-Za-z][A-Za-z0-9'’_·\-]*(?:[ ,·]+[A-Za-z_][A-Za-z0-9'’_·\-]*)*[?.!]?/g, (m, at) => {
      let t = m.replace(/\s+$/, '');
      // רק משפט אנגלי שלם (אות גדולה + רווח) שומר על הפיסוק שלו. אחרת הנקודה שייכת למשפט העברי
      if (!t.includes(' ') || !/^[A-Z]/.test(t)) t = t.replace(/[?.!]$/, '');
      out += esc(str.slice(last, at)) + `<bdi dir="ltr" class="en">${esc(t)}</bdi>`;
      last = at + t.length;
    });
    return out + esc(String(str).slice(last));
  };

  // ---------- סקווישי: קו מתאר לצביעה ----------
  const SQ_PATH = 'M50 6 C78 4 96 22 95 48 C94 74 76 86 50 86 C24 86 6 74 5 48 C4 22 22 8 50 6 Z';
  function squishy(w, label) {
    return `<svg class="sq" viewBox="0 0 100 92" width="${w}" aria-hidden="true">
      <path d="${SQ_PATH}" fill="#fff" stroke="#1d1d1d" stroke-width="3"/>
      ${label != null
        ? `<text x="50" y="62" text-anchor="middle" font-size="36" font-family="Pogo, Rubik" fill="#1d1d1d">${label}</text>`
        : `<circle cx="37" cy="45" r="4.5" fill="#1d1d1d"/><circle cx="63" cy="45" r="4.5" fill="#1d1d1d"/>
           <path d="M41 58 Q50 66 59 58" stroke="#1d1d1d" stroke-width="3.5" fill="none" stroke-linecap="round"/>`}
    </svg>`;
  }

  // ---------- QR ----------
  function qr(path) {
    const q = qrcode(0, 'M');
    q.addData(url(path));
    q.make();
    const n = q.getModuleCount();
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  }
  const link = id => W.links.find(l => l.id === id);

  // ---------- מספור דפי הילדה ----------
  // סדר הדפים לפי המפגש שבו משתמשים בהם לראשונה.
  const KID = window.kidPages(W);
  const kid = id => KID.find(k => k.id === id);
  // ב־PDF של הילדה עמוד 1 הוא השער, ולכן דף N יושב בעמוד N+1
  const kidPdf = () => `${SITE.base}pdf/w${W.n}-kid.pdf`;
  const kidHref = k => `${kidPdf()}#page=${k.no + 1}`;
  const pageRef = k => MOM
    ? `<a class="st ref" href="${kidHref(k)}">📄 דף ${k.no} · ${k.title} ↗</a>`
    : `<span class="st ref">📄 דף ${k.no} · ${k.title}</span>`;

  // ---------- עזרים לעמוד ----------
  const footer = right => `<div class="pf"><span>שבוע ${W.n} · ${esc(W.title)}</span><span>${right || ''}</span></div>`;
  function page(who, title, num, body, cls = '') {
    const whoTxt = who === 'mom' ? 'לאמא' : 'לילדה';
    return `<section class="page ${cls}">
      <div class="ph"><span class="who ${who}">${whoTxt}</span><h1>${title}</h1>${num ? `<span class="num">${num}</span>` : ''}</div>
      ${body}
      ${footer(num ? `דף ${num}` : '')}
    </section>`;
  }
  const VERB = {
    guess: ['🤔', 'מנחשים'], check: ['🔍', 'בודקים'], count: ['🔢', 'סופרים'], draw: ['🖍', 'מציירים'],
    write: ['✏️', 'כותבים'], circle: ['⭕', 'מקיפים'], read: ['📖', 'קוראים'], match: ['🔗', 'מחברים'],
    cut: ['✂️', 'גוזרים'], build: ['🧩', 'מסדרים'], teach: ['🎓', 'מלמדים'], trace: ['✍️', 'עוקבים'],
    copy: ['📝', 'מעתיקים'], cover: ['🙈', 'מכסים'], fix: ['🔧', 'מתקנים']
  };
  function task(n, verb, lines, content, cls = '') {
    const [ic, word] = VERB[verb];
    return `<div class="task ${cls}">
      <div class="verb"><span class="n">${n}</span><span class="ic">${ic}</span><b>${word}</b>${cls.includes('challenge') ? '<span class="st ref">אתגרי</span>' : ''}</div>
      ${lines.map(l => `<div class="ins">${tx(l)}</div>`).join('')}
      ${content ? `<div class="content">${content}</div>` : ''}
    </div>`;
  }
  const choices = arr => `<div class="choices">${arr.map(c => `<span class="choice">${c}</span>`).join('')}</div>`;
  const lines = n => Array.from({ length: n }, () => '<div class="wl"></div>').join('');
  const checklist = () => `<div class="checklist"><span>☐ 🔠 אות גדולה</span><span>☐ ✋ רווח בין מילים</span><span>☐ ⚫ נקודה בסוף</span></div>`;

  // ---------- כתיבה באנגלית: 4 שורות ----------
  // הקווים נמדדים מהגופן עצמו, כדי שהאותיות ישבו בדיוק על השורות.
  let M = null;
  function measure() {
    const c = document.createElement('canvas').getContext('2d');
    c.font = '100px Andika';
    const m = ch => c.measureText(ch);
    M = { cap: m('H').actualBoundingBoxAscent / 100, x: m('x').actualBoundingBoxAscent / 100, desc: m('p').actualBoundingBoxDescent / 100 };
  }
  // segs: [{t, mode: 'solid' | 'trace' | 'blank', w}] — w = רוחב יחסי
  function hw(segs, opts = {}) {
    const H = opts.h || 150, W_ = 1000, base = H * 0.68, cap = H * 0.5;
    const fs = cap / M.cap, top = base - cap, mid = base - fs * M.x, desc = base + fs * M.desc;
    const total = segs.reduce((a, s) => a + (s.w || 1), 0);
    let x = 0, out = '';
    segs.forEach(s => {
      const w = (s.w || 1) / total * W_;
      // אנגלית נכתבת משמאל לימין: הדוגמה משמאל, ואחריה מקום להמשיך
      if (s.mode !== 'blank' && s.t) out += `<text x="${x + 20}" y="${base}" font-size="${fs}" class="${s.mode}">${esc(s.t)}</text>`;
      x += w;
      if (s.sep) out += `<line x1="${x}" y1="${top - 8}" x2="${x}" y2="${desc + 4}" stroke="#ccc" stroke-width="1"/>`;
    });
    return `<svg class="hw" viewBox="0 0 ${W_} ${H}" direction="ltr">
      <line x1="0" x2="${W_}" y1="${top}" y2="${top}" stroke="#9a9a9a" stroke-width="1.2"/>
      <line x1="0" x2="${W_}" y1="${mid}" y2="${mid}" stroke="#9a9a9a" stroke-width="1.2" stroke-dasharray="8 6"/>
      <line x1="0" x2="${W_}" y1="${base}" y2="${base}" stroke="#1d1d1d" stroke-width="2.4"/>
      <line x1="0" x2="${W_}" y1="${desc}" y2="${desc}" stroke="#c4c4c4" stroke-width="1" stroke-dasharray="3 5"/>
      ${out}
    </svg>`;
  }

  // =====================================================================
  //  1. שער + קישורים
  // =====================================================================
  function cover() {
    const contents = KID.map(k => `<li><b>${k.no}${k.pages ? '–' + (k.no + k.pages - 1) : ''}</b> ${k.title}</li>`).join('');
    return `<section class="page">
      <div style="display:flex;align-items:center;gap:6mm;margin-bottom:4mm">
        ${squishy('34mm')}
        <div style="flex:1">
          <div style="font-size:11pt">שבוע ${W.n}</div>
          <h1 style="font-family:var(--title);font-weight:normal;font-size:34pt;line-height:1">${esc(W.title)}</h1>
          <div style="font-size:14pt">${esc(W.subtitle)}</div>
          <div style="margin-top:3mm;font-size:12pt">השם שלי: <span style="display:inline-block;width:60mm;border-bottom:.4mm solid #1d1d1d"></span></div>
        </div>
      </div>
      <div class="note" style="margin-top:0">משפט השבוע: <span class="en" style="font-size:18pt">${esc(W.sentence)}</span></div>
      <h2 class="sec">📱 הפעילויות של השבוע</h2>
      <div style="font-size:10.5pt;margin-bottom:3mm">סורקים בטלפון, או פותחים במחשב את הכתובת: <span class="en">${SITE.short}w${W.n}/</span></div>
      <div class="qrgrid">${W.links.map(l => `
        <div class="qrc">${qr(l.path)}<div class="t">${l.icon} <bdi>${esc(l.title)}</bdi></div><div class="d">${esc(l.desc)}</div>
        ${l.session ? `<div class="s">מפגש ${l.session}</div>` : '<div class="s">כל השבוע</div>'}</div>`).join('')}
      </div>
      <h2 class="sec">מה יש בחוברת</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm;font-size:10.5pt">
        ${PART === 'kid' ? `<div><b>לאמא</b><div style="margin-top:1mm">המדריך למפגשים נמצא ב־PDF הדיגיטלי (בצבע, עם קישורים):<br><span class="en">${SITE.short}pdf/w${W.n}-mom.pdf</span></div></div>` : `<div><b>לאמא</b><ul style="list-style:none;margin-top:1mm">
          <li>האנגלית של השבוע: איך מבטאים</li>
          ${W.sessions.map(s => `<li>מפגש ${s.n}: ${esc(s.title)}</li>`).join('')}
        </ul></div>`}
        <div><b>לילדה (דפים ממוספרים)</b><ul style="list-style:none;margin-top:1mm;columns:2;column-gap:4mm">${contents}</ul></div>
      </div>
      ${footer('')}
    </section>`;
  }

  // ---------- שער לגרסת האמא (PDF דיגיטלי) ----------
  function momCover() {
    return `<section class="flow mom cover-mom">
      <div class="hero">
        <div>
          <div class="kicker">שבוע ${W.n} · המדריך לאמא</div>
          <h1 class="big">${esc(W.title)}</h1>
          <div class="sub">${esc(W.subtitle)}</div>
        </div>
        ${squishy('30mm')}
      </div>
      <a class="kidpdf" href="${kidPdf()}">
        <span class="ic">🖨</span>
        <span><b>הדפים של הילדה לשבוע הזה</b><br>PDF בשחור־לבן להדפסה · ${KID.reduce((a, k) => a + (k.pages || 1), 0) + 1} עמודים</span>
        <span class="go">פותחים ↗</span>
      </a>
      <a class="kidpdf" style="background:var(--coral)" href="${SITE.base}w${W.n}/"><span class="ic">▶</span><span><b style="color:var(--cream)">המפגשים בנגן של סקווישי</b><br>המסך מוביל את המפגש, את מלווה. בסוף כל מפגש יש מלבן "לאמא".</span><span class="go">פותחים ↗</span></a>
      <div class="before"><b class="t">לפני שמתחילות (פעם אחת בשבוע)</b><ol>
        <li>מדפיסות את הדפים של הילדה (הכפתור הכחול).</li>
        <li>פותחות את הנגן במחשב (הכפתור הכתום). הוא מוביל את המפגש ומנהל לבד את כרטיסי הזיכרון.</li>
        <li>בסוף כל מפגש: שתי שורות במלבן "לאמא". זה כל התיעוד.</li>
        <li>אם עוד לא קראת: <a class="st ref" href="${SITE.base}pdf/${encodeURIComponent('מדריך-לאמא-צבע.pdf')}">📘 למה השיעור בנוי ככה ↗</a></li>
      </ol></div>
      <h2 class="sec">📅 המפגשים</h2>
      <div class="sess-list">
        <a href="#english"><b>🔤</b><span>איך מבטאים</span></a>
        ${W.sessions.map(s => `<a href="#s${s.n}"><b>${s.n}</b><span>${esc(s.title)}</span></a>`).join('')}
      </div>
      <h2 class="sec">📱 הפעילויות של השבוע</h2>
      <div class="act-list">${W.links.map(l => `<a href="${url(l.path)}"><span class="ic">${l.icon}</span><span><b>${tx(l.title)}</b><br><small>${esc(l.desc)} · ${l.session ? 'מפגש ' + l.session : 'כל השבוע'}</small></span></a>`).join('')}</div>
    </section>`;
  }

  // =====================================================================
  //  2. האנגלית של השבוע (לאמא)
  // =====================================================================
  function english() {
    const L = link('listen');
    return `<section class="flow mom" id="english">
      <div class="ph"><span class="who mom">לאמא</span><h1>האנגלית של השבוע: איך מבטאים</h1></div>
      <div class="note"><b>הכלל הכי חשוב:</b> אומרים את <b>הצליל</b> של האות, לא את השם שלה. s זה "סססס", לא "אֶס".
        ולא מוסיפים תנועה בסוף: "ממממ" ולא "מֶה". ככה אפשר לחבר צלילים למילה: ס·אַ·ט = sat.</div>
      <div style="display:flex;gap:5mm;align-items:center;margin:2mm 0 3mm">
        ${MOM ? `<a class="qr-inline" href="${url(L.path)}">${qr(L.path)}</a>` : `<div class="qr-inline">${qr(L.path)}</div>`}
        <div style="font-size:10.5pt"><b>${L.icon} <bdi>${L.title}</bdi></b><br>כל המילים והמשפטים של השבוע עם הקלטה. מקשיבות ביחד וחוזרות.</div>
      </div>
      <h2 class="sec">🔤 הצלילים</h2>
      <table class="pron"><tr><th>אות</th><th>צליל</th><th>איך</th></tr>
        ${W.sounds.map(s => `<tr><td class="L">${s.l}</td><td class="H">${s.he}</td><td>${esc(s.tip)}</td></tr>`).join('')}
      </table>
      <h2 class="sec">♥ מילות לב</h2>
      <div style="font-size:10.5pt;margin-bottom:1.5mm">מילים שקוראים הרבה, אבל לא לגמרי לפי החוקים. החלק ה"משוגע" מקבל ♥, ואותו זוכרים בעל־פה.</div>
      <table class="pron"><tr><th>מילה</th><th>הגייה</th><th>פירוש</th><th>שימו לב</th></tr>
        ${W.heart.map(h => `<tr><td class="L">${h.w}</td><td style="font-weight:700">${h.say}</td><td>${h.he}</td><td>${esc(h.note)}</td></tr>`).join('')}
      </table>
      <h2 class="sec">🗣 שאלת השבוע</h2>
      <div style="font-size:11.5pt"><span class="en" style="font-size:17pt">${W.talk.q}</span> &nbsp; (${W.talk.qSay}) = ${W.talk.qHe}<br>
        תשובה: <span class="en" style="font-size:15pt">${W.talk.frame}</span> &nbsp;
        למשל: ${W.talk.items.slice(0, 3).map(i => `<span class="en">${i.a}</span>`).join(' · ')}</div>
      <h2 class="sec">✏️ משפט השבוע</h2>
      <div style="font-size:11.5pt"><span class="en" style="font-size:20pt">${W.sentence}</span> &nbsp; = זו מפה.
        <br>בכתיבה בודקות שלושה דברים: אות גדולה בהתחלה, רווח בין מילים, נקודה בסוף.</div>
    </section>`;
  }

  // =====================================================================
  //  3. מדריך אמא למפגש
  // =====================================================================
  // החלקים של המפגש. אם יש כרטיסים להוציא, הפתיחה היא הקופסה.
  function partsOf(s) {
    if (!s.cards.length) return s.parts;
    return [{ k: 'open', min: 5, title: 'פותחות: הקופסה', steps: [
      { do: `מוציאות את כרטיסים ${s.cards.join(', ')} ואת ערמת "עוד לא". את שואלת, והיא עונה בלי להציץ. ידעה ← חוזר לקופסה. עוד לא ← לערמת "עוד לא".` }
    ]}].concat(s.parts);
  }
  const PART_IC = { open: '🫧', science: '🌍', english: '🔤', close: '✏️' };
  function sstep(x, i) {
    const refs = [x.page ? pageRef(kid(x.page)) : '', x.qr ? actRef(link(x.qr)) : ''].join('');
    return `<li>${x.h ? `<b class="sh">${esc(x.h)}</b>` : ''}
      ${x.say ? `<span class="st say">${tx(x.say)}</span>` : ''}
      ${refs ? `<span class="refs">${refs}</span>` : ''}
      ${x.do ? `<span class="st do2">${tx(x.do)}</span>` : ''}</li>`;
  }
  function actRef(l) {
    return MOM
      ? `<a class="st ref act2" href="${url(l.path)}">${l.icon} ${tx(l.title)} ↗</a>`
      : `<span class="st ref">${l.icon} ${tx(l.title)}</span>`;
  }
  function session(s) {
    const parts = partsOf(s);
    const total = parts.reduce((a, b) => a + b.min, 0) + 3;
    const prep = s.prep.map(p => p.pages ? p.pages.map(id => pageRef(kid(id))).join('') : `<span class="st chip">${esc(p.t)}</span>`).join('');
    return `<section class="page sess" id="s${s.n}">
      <div class="ph"><span class="who mom">לאמא</span><h1>מפגש ${s.n}: ${esc(s.title)}</h1>${MOM && s.kid ? `<a class="st chip play" href="${url(`play/lesson.html?w=${W.n}&s=${s.n}`)}">▶ פותחים בנגן</a>` : ''}<span class="st chip">⏱ ${total} דק׳</span></div>
      <div class="goal">${tx(s.goal)}</div>
      <div class="prep2"><b>מה נכין</b> ${prep}</div>
      ${parts.map((p, pi) => `
        <div class="part" data-k="${p.k}">
          <h3><span class="pi">${PART_IC[p.k]}</span> ${tx(p.title)} <span class="min">${p.min} דק׳</span></h3>
          <ol class="${p.steps.length === 1 || !p.steps[0].h ? 'plain' : ''}">${p.steps.map(sstep).join('')}</ol>
        </div>${pi === 1 ? '<div class="breath">🤸 הפסקת תנועה, 3 דקות</div>' : ''}`).join('')}
      <div class="endrow">
        <div class="enough"><b>✅ זה מספיק להיום</b>${tx(s.enough)}</div>
        <div class="more"><b>➕ אם יש כוח</b>${tx(s.more.t)} ${s.more.qr ? actRef(link(s.more.qr)) : ''}${s.more.page ? pageRef(kid(s.more.page)) : ''}</div>
      </div>
      ${s.after ? `<div class="after">📝 ${tx(s.after)} ${pageRef(kid('tracker'))}</div>` : ''}
      ${footer('')}
    </section>`;
  }


  // =====================================================================
  //  4. דפי הילדה
  // =====================================================================
  const P = {};

  P['k-draw'] = k => page('kid', k.title, k.no, `
    ${task(1, 'draw', ['מציירים את כדור הארץ.', 'מה יש עליו? מציירים גם את זה.'],
      `<div class="drawbox" style="height:90mm;position:relative"><span style="position:absolute;top:2mm;inset-inline-start:4mm;font-size:10pt">עכשיו · מפגש 1</span></div>`)}
    ${task(2, 'draw', ['בסוף השבוע מציירים שוב.', 'מה השתנה?'],
      `<div class="drawbox" style="height:90mm;position:relative"><span style="position:absolute;top:2mm;inset-inline-start:4mm;font-size:10pt">בסוף השבוע · מפגש 4</span></div>`)}
  `);

  function blendWord(w) {
    return `<span style="display:inline-flex;flex-direction:column;align-items:center;margin-inline:4mm" dir="ltr">
      <span style="display:flex;gap:4mm" class="en">${[...w].map(c => `<span style="display:flex;flex-direction:column;align-items:center;font-size:26pt;line-height:1.1">${c}<span style="font-size:9pt">●</span></span>`).join('')}</span>
      <svg viewBox="0 0 100 10" style="width:100%;height:3mm"><path d="M2 5 H92" stroke="#1d1d1d" stroke-width="2"/><path d="M90 1 L98 5 L90 9 Z" fill="#1d1d1d"/></svg>
    </span>`;
  }
  P['k-sounds'] = k => page('kid', k.title, k.no, `
    ${task(1, 'circle', ['אמא אומרת צליל.', 'מקיפים את האות.'],
      `<div dir="ltr" style="display:grid;grid-template-columns:repeat(7,1fr);gap:3mm">${W.sounds.map(s => `
        <div class="box" style="text-align:center;padding:2mm 0"><div class="en" style="font-size:36pt;line-height:1.1">${s.l}</div>
        <div class="en" style="font-size:14pt;color:#6b6b6b">${s.l.toUpperCase()}</div></div>`).join('')}</div>`)}
    ${task(2, 'read', ['לוחצים על הסקוויש בכל נקודה ●', 'ואז אומרים את כל המילה לאורך החץ.'],
      `<div dir="ltr" style="display:flex;flex-wrap:wrap;gap:6mm 2mm;justify-content:center">${['at', 'sat', 'mat', 'pin', 'tip', 'map'].map(blendWord).join('')}</div>`)}
    ${task(3, 'draw', ['מציירים משהו שמתחיל בצליל ס.'], `<div class="drawbox" style="height:42mm"></div>`)}
  `);

  P['k-land-water'] = k => page('kid', k.title, k.no, `
    ${task(1, 'guess', ['על כדור הארץ יש יותר...', 'מקיפים תשובה אחת.'], choices(['<span class="ic">🌊</span> מים', '<span class="ic">⛰️</span> יבשה', '<span class="ic">⚖️</span> אותו דבר']))}
    ${task(2, 'check', ['זורקים ותופסים את הכדור 20 פעם.', 'איפה האגודל? מקיפים 🌊 או ⛰️.'],
      `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:2.5mm">${Array.from({ length: 20 }, (_, i) =>
        `<div class="box" style="display:flex;align-items:center;justify-content:space-around;padding:1.5mm 1mm;font-size:15pt"><span style="font-size:9pt;color:#6b6b6b">${i + 1}</span><span>🌊</span><span>⛰️</span></div>`).join('')}</div>`)}
    ${task(3, 'count', ['כמה פעמים יצא?'],
      `<div style="display:flex;gap:10mm;font-size:16pt"><span>🌊 מים: <span class="box" style="display:inline-block;width:18mm;height:12mm;vertical-align:middle"></span></span><span>⛰️ יבשה: <span class="box" style="display:inline-block;width:18mm;height:12mm;vertical-align:middle"></span></span></div>`)}
    ${task(4, 'write', ['הניחוש שלי...'],
      `${choices(['☐ היה נכון', '☐ הפתיע אותי'])}
       <div class="starter" style="margin-top:4mm">חשבתי ש<span class="blank"></span></div>
       <div class="starter" style="margin-top:4mm">וגיליתי ש<span class="blank" style="min-width:110mm"></span></div>`)}
  `);

  P['w-letters'] = k => {
    const rows = W.sounds.map((s, i) => {
      const pair = s.l.toUpperCase() + s.l;
      const ses = i < 4 ? 1 : 2;
      return `<div style="display:flex;align-items:center;gap:2mm"><span style="font-size:8.5pt;width:14mm;white-space:nowrap;text-align:center;color:#6b6b6b">מפגש ${ses}</span><div style="flex:1">${hw([
        { t: pair, mode: 'solid', sep: true }, { t: pair, mode: 'trace' }, { t: pair, mode: 'trace' }, { mode: 'blank', w: 1.4 }], { h: 162 })}</div></div>`;
    }).join('');
    return page('kid', k.title, k.no, `
      ${task(1, 'trace', ['עוקבים על האותיות המנוקדות.', 'בכל אות אומרים את הצליל.', 'בסוף השורה כותבים לבד.'], `<div style="display:flex;flex-direction:column;gap:1mm">${rows}</div>`)}
    `);
  };

  P['cards'] = k => {
    const row = c => `<div class="card-row">
      <div class="cf"><span class="kind">${c.kind}</span><svg class="sqn" viewBox="0 0 100 92"><path d="${SQ_PATH}" fill="#fff" stroke="#1d1d1d" stroke-width="4"/><text x="50" y="62" text-anchor="middle" font-size="40" fill="#1d1d1d">${c.n}</text></svg>
        ${c.big ? `<div class="big">${esc(c.big)}</div>` : ''}<div class="q">${esc(c.q)}</div></div>
      <div class="fold"></div>
      <div class="cb"><span class="kind">תשובה</span><div class="a">${esc(c.a)}</div><span class="for">לאמא · נכנס במפגש ${c.s}</span></div>
    </div>`;
    const chunks = [];
    for (let c = 0; c < W.cards.length; c += 6) chunks.push(W.cards.slice(c, c + 6));
    const ins = `<div class="ins" style="margin-bottom:3mm;font-size:11pt">✂️ גוזרים לאורך הקו המקווקו · מקפלים באמצע · מדביקים. השאלה מצד אחד, התשובה מהצד השני. 🖍 צובעים את הסקווישי.</div>`;
    const labels = `<h2 class="sec" style="margin-top:1mm">✂️ תוויות: לקופסה ולערמת "עוד לא"</h2>
      <div class="labels">${[['🫧', 'קופסת הסקווישים'], ['⏳', 'עוד לא'], ['🫧', 'קופסת הסקווישים'], ['⏳', 'עוד לא']].map(([ic, t]) => `<div><b>${ic}</b>${t}</div>`).join('')}</div>`;
    const last = chunks[chunks.length - 1];
    if (last.length > 5) chunks.push([]);
    return chunks.map((ch, n) => page('kid', k.title + (n ? ' (המשך)' : ''), k.no + n,
      (n ? '' : ins) + ch.map(row).join('') + (n === chunks.length - 1 ? labels : ''))).join('');
  };

  function globePic(kind) {
    if (kind === 'globe') return `<svg viewBox="0 0 80 80" width="24mm"><circle cx="40" cy="40" r="34" fill="#fff" stroke="#1d1d1d" stroke-width="2.5"/><ellipse cx="40" cy="40" rx="14" ry="34" fill="none" stroke="#1d1d1d" stroke-width="1.5"/><path d="M6 40 H74 M12 22 H68 M12 58 H68" stroke="#1d1d1d" stroke-width="1.5"/></svg>`;
    return `<svg viewBox="0 0 110 70" width="32mm"><rect x="4" y="6" width="102" height="58" rx="3" fill="#fff" stroke="#1d1d1d" stroke-width="2.5"/><path d="M4 26 H106 M4 44 H106 M30 6 V64 M56 6 V64 M82 6 V64" stroke="#1d1d1d" stroke-width="1.2"/></svg>`;
  }
  P['k-globe-map'] = k => page('kid', k.title, k.no, `
    ${task(1, 'guess', ['קולפים תפוז.', 'אפשר לשטח את הקליפה על השולחן בלי שהיא תיקרע?'], choices(['כן', 'לא']))}
    ${task(2, 'draw', ['מציירים מה קרה לקליפה.'], `<div class="drawbox" style="height:40mm"></div>`)}
    ${task(3, 'match', ['מחברים קו בין המילה לציור.'],
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm;align-items:center;font-size:17pt">
        <div style="display:flex;flex-direction:column;gap:9mm"><span>• גלובוס</span><span>• מפה</span></div>
        <div style="display:flex;flex-direction:column;gap:5mm;align-items:flex-end">${globePic('map')} ${globePic('globe')}</div></div>`)}
    ${task(4, 'write', ['משלימים מילה מהבנק.'],
      `<div class="bank"><span class="lbl">בנק מילים · אפשר לחזור על מילה</span><span class="w">עגול</span><span class="w">שטוחה</span></div>
       <div class="starter" style="margin-top:5mm;font-size:15pt">גלובוס הוא <span class="blank"></span>.</div>
       <div class="starter" style="margin-top:5mm;font-size:15pt">מפה היא <span class="blank"></span>.</div>`)}
  `);

  // מפה בשחור־לבן: כל יבשת בדוגמה אחרת, כדי שאפשר יהיה לספור אותן
  const PATTERNS = {
    asia: '<pattern id="p-asia" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="#444"/></pattern>',
    africa: '<pattern id="p-africa" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#555" stroke-width="1.2"/></pattern>',
    europe: '<pattern id="p-europe" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3H6M3 0V6" stroke="#555" stroke-width=".9"/></pattern>',
    namerica: '<pattern id="p-namerica" width="6" height="6" patternUnits="userSpaceOnUse"><line x1="0" y1="3" x2="6" y2="3" stroke="#555" stroke-width="1.2"/></pattern>',
    samerica: '<pattern id="p-samerica" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#555" stroke-width="1.2"/></pattern>',
    oceania: '<pattern id="p-oceania" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#d6d6d6"/></pattern>',
    antarctica: '<pattern id="p-antarctica" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/></pattern>'
  };
  function continentsMap() {
    if (!window.WORLD) return '<div class="drawbox" style="height:90mm;display:grid;place-items:center">המפה לא נטענה</div>';
    const Wm = 600, Hm = 305;
    const proj = d3.geoNaturalEarth1().fitExtent([[4, 4], [Wm - 4, Hm - 4]], { type: 'Sphere' });
    const pth = d3.geoPath(proj);
    let out = `<defs>${Object.values(PATTERNS).join('')}</defs><path d="${pth({ type: 'Sphere' })}" fill="#fff" stroke="#1d1d1d" stroke-width="1.2"/>`;
    const ru = window.WORLD.find(p => p.cont === 'russia');
    window.WORLD.forEach(p => {
      if (p.cont === 'russia') return;
      out += `<path d="${pth(p)}" fill="url(#p-${p.cont})" stroke="#1d1d1d" stroke-width=".7"/>`;
    });
    if (ru) [['europe', false], ['asia', true]].forEach(([k, east]) => {
      out += `<clipPath id="cl-${k}"><path d="${pth(CONT.russiaClip(east))}"/></clipPath><path d="${pth(ru)}" clip-path="url(#cl-${k})" fill="url(#p-${k})" stroke="#1d1d1d" stroke-width=".7"/>`;
    });
    out += `<path d="${pth(CONT.URALS)}" fill="none" stroke="#1d1d1d" stroke-width="1.6" stroke-dasharray="4 3"/>`;
    const il = proj([35, 31.5]);
    out += `<circle cx="${il[0]}" cy="${il[1]}" r="5.5" fill="#1d1d1d" stroke="#fff" stroke-width="2"/>`;
    return `<svg viewBox="0 0 ${Wm} ${Hm}" style="width:100%;display:block">${out}</svg>`;
  }
  P['k-continents'] = k => page('kid', k.title, k.no, `
    ${task(1, 'guess', ['כמה יבשות יש על כדור הארץ?'], `<div style="display:flex;align-items:center;gap:4mm;font-size:14pt"><span class="box" style="display:inline-block;width:22mm;height:14mm"></span> יבשות</div>`)}
    ${continentsMap()}
    <div style="font-size:9.5pt;margin:1mm 0 3mm">כל יבשת מסומנת בדוגמה אחרת. הקו המקווקו הוא הגבול בין אירופה לאסיה. ● = ישראל</div>
    ${task(2, 'count', ['כותבים מספר על כל יבשת: 1, 2, 3...', 'כמה יצא?'], `<div style="display:flex;align-items:center;gap:4mm;font-size:14pt"><span class="box" style="display:inline-block;width:22mm;height:14mm"></span> יבשות</div>`)}
    ${task(3, 'guess', ['ישראל היא הנקודה ●', 'באיזו יבשת היא? מקיפים.'], choices(['אפריקה', 'אסיה', 'אירופה']))}
    ${task(4, 'write', ['בודקים באתר, ואז כותבים.'], `<div class="starter" style="font-size:15pt">ישראל נמצאת ב<span class="blank"></span>.</div>`)}
  `);

  P['k-sentence'] = k => {
    const words = ['It', 'is', 'a', 'map', '.', 'It', 'is', 'a', 'pin', '.', 'the', 'I'];
    return page('kid', k.title, k.no, `
      ${task(1, 'cut', ['גוזרים את כרטיסי המילים לאורך הקו.'],
        `<div dir="ltr" style="display:grid;grid-template-columns:repeat(4,1fr);border:.4mm dashed #6b6b6b">${words.map(w =>
          `<div class="en" style="border:.4mm dashed #6b6b6b;height:26mm;display:grid;place-items:center;font-size:${w === '.' ? 44 : 34}pt">${w}</div>`).join('')}</div>`)}
      ${task(2, 'build', ['מסדרים את הכרטיסים למשפט:'], `<div class="en" style="font-size:24pt">It is a map.</div>`)}
      ${task(3, 'build', ['עכשיו משפט חדש:'], `<div class="en" style="font-size:24pt">It is a pin.</div>`)}
      ${task(4, 'build', ['בונים משפט עם the.', 'קוראים אותו לאמא.'], '', 'challenge')}
    `);
  };

  P['k-address'] = k => {
    const R = [190, 155, 120, 85, 50];
    const rings = R.map((r, i) => `<circle cx="200" cy="200" r="${r}" fill="${i === 4 ? '#fff' : 'none'}" stroke="#1d1d1d" stroke-width="${i === 0 ? 3 : 2}"/>`).join('');
    // שורת כתיבה בתוך כל טבעת (חוץ מהמרכז)
    const slots = R.map((r, i) => {
      const y = i < 4 ? 200 - (r + R[i + 1]) / 2 : 200 + 22;
      return `<rect x="${i < 4 ? 138 : 165}" y="${y - 11}" width="${i < 4 ? 124 : 70}" height="22" rx="4" fill="#fff" stroke="#9a9a9a" stroke-width="1"/>` +
        (i === 0 ? `<text x="200" y="${y + 6}" text-anchor="middle" font-size="15" font-family="Rubik">כדור הארץ</text><text x="270" y="${y + 4}" font-size="9" font-family="Rubik" fill="#6b6b6b">דוגמה</text>` : '');
    }).join('');
    return page('kid', k.title, k.no, `
      ${task(1, 'guess', ['מה יותר גדול?', 'מקיפים תשובה אחת.'], choices(['📍 ישראל', '🌏 אסיה', '⚖️ אותו גודל']))}
      ${task(2, 'write', ['כותבים בכל טבעת מילה מהבנק.', 'מהגדול (בחוץ) לקטן (בפנים).', 'במרכז מציירים את הבית.'],
        `<div class="bank"><span class="lbl">בנק מילים</span><span class="w">בית</span><span class="w">אסיה</span><span class="w">עיר: _______</span><span class="w">ישראל</span><span class="w">כדור הארץ</span></div>
         <svg viewBox="0 0 400 400" style="width:135mm;display:block;margin:4mm auto 0">${rings}${slots}</svg>`)}
    `);
  };

  P['w-sentence'] = k => {
    const S = W.sentence;
    const broken = S.charAt(0).toLowerCase() + S.slice(1, -1);
    const p1 = page('kid', k.title, k.no, `
      <div class="note" style="margin-top:0;text-align:center"><span class="en" style="font-size:26pt">${S}</span></div>
      ${task(1, 'trace', ['עוקבים על המשפט עם האצבע.', 'ואז עם עפרון.'], hw([{ t: S, mode: 'trace' }], { h: 170 }) + hw([{ t: S, mode: 'trace' }], { h: 170 }))}
      ${task(2, 'copy', ['מעתיקים בשורה שממש מתחת.'], hw([{ t: S, mode: 'solid' }], { h: 170 }) + hw([{ mode: 'blank' }], { h: 170 }) + checklist())}
    `);
    const p2 = page('kid', k.title + ' (המשך)', k.no + 1, `
      ${task(3, 'copy', ['אמא כותבת את המשפט על דף ותולה אותו רחוק.', 'הולכים, מסתכלים, חוזרים וכותבים.'], hw([{ mode: 'blank' }], { h: 135 }) + checklist())}
      ${task(4, 'cover', ['קוראים את המשפט בקול.', 'מקפלים את הדף על הקו ומכסים אותו.', 'כותבים מהזיכרון, ואז פותחים ובודקים.'],
        hw([{ t: S, mode: 'solid' }], { h: 140 }) + `<div style="border-top:.5mm dashed #1d1d1d;margin:1mm 0;font-size:9pt;text-align:center">✂ מקפלים כאן אחורה ✂</div>` + hw([{ mode: 'blank' }], { h: 150 }) + checklist())}
      ${task(5, 'fix', ['במשפט הזה יש 2 טעויות.', 'כותבים אותו נכון.'],
        `<div class="en" style="font-size:22pt;color:#555;text-align:left">${broken}</div>` + hw([{ mode: 'blank' }], { h: 150 }), 'challenge')}
    `);
    return p1 + p2;
  };

  P['k-hunt'] = k => {
    const L = W.sounds.map(s => s.l);
    // שורות מעורבבות בצורה קבועה (לא אקראית), כדי שהמפתח לא ישתנה בכל הדפסה
    const rows = [[0, 3, 5, 1, 6], [2, 4, 0, 6, 3], [5, 1, 2, 4, 0], [6, 0, 4, 3, 2], [1, 5, 3, 2, 4], [4, 6, 1, 0, 5]];
    return page('kid', k.title, k.no, `
      ${task(1, 'circle', ['אמא אומרת צליל.', 'מקיפים את האות בשורה.'],
        rows.map((r, i) => `<div style="display:flex;align-items:center;gap:4mm;margin-bottom:2.5mm"><span class="verb" style="margin:0"><span class="n" style="width:7mm;height:7mm;font-size:11pt">${i + 1}</span></span>
          <div dir="ltr" style="flex:1;display:flex;justify-content:space-around" class="en">${r.map(j => `<span style="font-size:30pt;line-height:1.2">${L[j]}</span>`).join('')}</div></div>`).join(''))}
      ${task(2, 'read', ['קוראים כל מילה לאמא.', 'אמא מסמנת ✓.'],
        `<div dir="ltr" style="display:grid;grid-template-columns:repeat(4,1fr);gap:3mm">${W.words.map(w =>
          `<div class="box" style="display:flex;justify-content:space-between;align-items:center;padding:2mm 4mm"><span class="en" style="font-size:22pt">${w.w}</span><span style="font-size:14pt">☐</span></div>`).join('')}</div>`)}
    `);
  };

  P['k-review'] = k => page('kid', k.title, k.no, `
    ${task(1, 'circle', ['עונים לבד, בלי להציץ.'],
      W.review.map(r => `<div style="display:flex;align-items:center;gap:5mm;margin-bottom:4mm;flex-wrap:wrap"><span style="font-size:14pt;min-width:60mm">${esc(r.q)}</span>${choices(r.opts)}</div>`).join(''))}
    ${task(2, 'teach', ['מלמדים את אמא.', 'מסמנים ✓ על כל מה שהסברתי.'],
      `<div style="display:flex;flex-direction:column;gap:2mm;font-size:14pt"><span>☐ 🌊 מים ויבשה</span><span>☐ 🍊 גלובוס ומפה</span><span>☐ 🗺️ שבע היבשות</span><span>☐ 🏠 הכתובת שלי</span></div>`)}
    ${task(3, 'guess', ['ניחוש לשבוע הבא:', 'איזו יבשת היא הכי גדולה?'],
      `<div class="starter" style="font-size:14pt">לדעתי: <span class="blank" style="min-width:60mm"></span></div>`)}
    <div style="margin-top:auto;display:flex;justify-content:center">${squishy('30mm')}</div>
  `);

  P['tracker'] = k => page('mom', 'דף מעקב · שבוע ' + W.n, k.no, `
    <div class="ins" style="font-size:12pt;margin-bottom:5mm">שלוש שאלות בסוף השבוע. אחר כך מצלמות את הדף הזה ואת דף ${kid('w-sentence').no}, ושולחות.</div>
    ${[['💪', 'מה היא הצליחה להסביר או לעשות לבד?'], ['🤝', 'איפה היא צריכה עזרה?'], ['✨', 'מה עניין אותה?']].map(([ic, q], i) => `
      <div class="task"><div class="verb"><span class="n">${i + 1}</span><span class="ic">${ic}</span><b>${q}</b></div>${lines(4)}</div>`).join('')}
    <div class="task"><div class="verb"><span class="n">4</span><span class="ic">🫧</span><b>כרטיסים שנשארו בערמת "עוד לא":</b></div>${lines(1)}</div>
  `);

  // =====================================================================
  //  הרכבה
  // =====================================================================
  async function loadWorld() {
    if (!window.d3 || !window.topojson) return;
    try {
      const world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json').then(r => r.json());
      window.WORLD = CONT.explode(topojson.feature(world, world.objects.countries).features);
    } catch (e) { /* בלי מפה: הדף מציג מסגרת ריקה */ }
  }
  async function build() {
    measure();
    if (!MOM) await loadWorld();
    let html = '';
    if (PART !== 'kid') html += (MOM ? momCover() : cover()) + english() + W.sessions.map(session).join('');
    if (PART === 'kid') html += cover();
    if (!MOM) KID.forEach(k => { html += P[k.id](k); });
    root.innerHTML = html;
    // בדיקה עצמית: אילו עמודים חורגים מ־A4 (נכתב ל־data-overflow)
    requestAnimationFrame(() => {
      const over = [...document.querySelectorAll('.page')].filter(p => p.scrollHeight > p.clientHeight + 1)
        .map(p => (p.querySelector('.num') || p.querySelector('h1') || {}).textContent);
      document.body.dataset.overflow = over.join('|') || 'none';
      document.body.dataset.ready = '1';
    });
  }
  document.fonts.load('100px Andika').then(() => document.fonts.ready).then(build);
})();

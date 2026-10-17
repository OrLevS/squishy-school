// משותף לכל דפי האתר: טעינת השבוע, הקראה באנגלית, סקווישי.

// בתוך נגן המפגש (embed=1): בלי כותרות וניווט, רק הפעילות עצמה
window.EMBED = new URLSearchParams(location.search).get('embed') === '1';
if (window.EMBED) document.documentElement.classList.add('embed');

window.weekNo = function () {
  return parseInt(new URLSearchParams(location.search).get('w') || '1', 10);
};
// נקרא מתוך <script> בראש הדף, כדי שנתוני השבוע ייטענו לפני הקוד של הדף
window.loadWeek = function (prefix) {
  const n = String(window.weekNo()).padStart(2, '0');
  document.write(`<script src="${prefix}data/week-${n}.js"><\/script>`);
};

// ---------- הקראה ----------
// קודם מנסים הקלטה (audio/<slug>.mp3). אם אין, קול הדפדפן באנגלית.
(function () {
  let voice = null;
  function pick() {
    const vs = speechSynthesis.getVoices().filter(v => /^en(-|_)/i.test(v.lang));
    const pref = [/Google US English/i, /Samantha/i, /Aria/i, /Jenny/i, /Zira/i, /en-US/i];
    for (const p of pref) { const v = vs.find(v => p.test(v.name) || p.test(v.lang)); if (v) return v; }
    return vs[0] || null;
  }
  if ('speechSynthesis' in window) {
    voice = pick();
    speechSynthesis.onvoiceschanged = () => { voice = pick(); };
  }
  const slug = t => t.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '-');
  const base = document.currentScript.src.replace(/js\/common\.js.*$/, '');

  function tts(text, slow) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; if (voice) u.voice = voice;
    u.rate = slow ? 0.55 : 0.85;
    speechSynthesis.speak(u);
  }
  window.say = function (text, slow) {
    const a = new Audio(`${base}audio/${slug(text)}${slow ? '-slow' : ''}.mp3`);
    let fell = false;
    const fallback = () => { if (!fell) { fell = true; tts(text, slow); } };
    a.onerror = fallback;
    a.play().catch(fallback);
  };
})();

// ---------- סקווישי ----------
window.squishySVG = function (color = '#2A9D8F', size = 90, mood = 'happy') {
  const mouth = mood === 'wow'
    ? '<ellipse cx="50" cy="61" rx="6" ry="7" fill="#264653"/>'
    : '<path d="M41 58 Q50 66 59 58" stroke="#264653" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
  return `<svg class="squishy" viewBox="0 0 100 92" width="${size}" aria-hidden="true">
    <path d="M50 6 C78 4 96 22 95 48 C94 74 76 86 50 86 C24 86 6 74 5 48 C4 22 22 8 50 6 Z" fill="${color}"/>
    <ellipse cx="33" cy="28" rx="10" ry="6" fill="#FBF5ED" opacity=".55"/>
    <circle cx="37" cy="45" r="4.5" fill="#264653"/><circle cx="63" cy="45" r="4.5" fill="#264653"/>
    ${mouth}
    <ellipse cx="27" cy="56" rx="5" ry="3" fill="#E76F51" opacity=".45"/><ellipse cx="73" cy="56" rx="5" ry="3" fill="#E76F51" opacity=".45"/>
  </svg>`;
};
window.bounce = function (el) {
  el.classList.remove('bounce'); void el.offsetWidth; el.classList.add('bounce');
};

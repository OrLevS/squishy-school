// תלמידים: כניסה לפי שם פרטי ושם משפחה. לכל תלמיד/ה התקדמות וכרטיסים משלו.
// הפרופילים נשמרים במחשב. ל־Supabase נשלחים רק שם פרטי ואות ראשונה של שם המשפחה.
(function () {
  const P = 'sq-profiles', CUR = 'sq-current';
  const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* מצב פרטי */ } };
  const norm = s => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();

  const Profile = {
    all: () => get(P, {}),
    current() { const id = get(CUR, null); return id ? Profile.all()[id] || null : null; },
    // מפתח אחסון של התלמיד/ה הנוכחי/ת, למשל p:ab12:sq-box-w1
    key(k) { const c = Profile.current(); return c ? `p:${c.id}:${k}` : k; },
    label(c) { c = c || Profile.current(); return c ? `${c.first} ${c.last.charAt(0)}.`.trim() : null; },
    login(first, last) {
      const all = Profile.all();
      const found = Object.values(all).find(p => norm(p.first) === norm(first) && norm(p.last) === norm(last));
      if (found) { set(CUR, found.id); return { profile: found, isNew: false }; }
      const p = { id: Math.random().toString(36).slice(2, 8), first: first.trim(), last: last.trim(), created: new Date().toISOString() };
      all[p.id] = p; set(P, all); set(CUR, p.id);
      return { profile: p, isNew: true };
    },
    logout() { localStorage.removeItem(CUR); }
  };
  window.Profile = Profile;

  // מסך הכניסה. onReady נקרא כשיש תלמיד/ה מחובר/ת.
  window.requireProfile = function (onReady) {
    if (Profile.current()) return onReady(Profile.current());
    const known = Object.values(Profile.all()).length > 0;
    const box = document.createElement('div');
    box.className = 'gate';
    box.innerHTML = `<div class="gate-card">
      ${window.squishySVG ? squishySVG('#2A9D8F', 90) : ''}
      <h1 style="margin:8px 0 4px">${known ? 'מי לומד/ת היום?' : 'נעים להכיר!'}</h1>
      <p style="margin-bottom:14px">${known ? 'מקלידים שם פרטי ושם משפחה.' : 'פעם ראשונה כאן? מקלידים שם פרטי ושם משפחה.'}</p>
      <form id="gate-form">
        <input id="g-first" placeholder="שם פרטי" autocomplete="off" required>
        <input id="g-last" placeholder="שם משפחה" autocomplete="off" required>
        <button class="btn" type="submit">נכנסים ←</button>
      </form>
      <div id="gate-msg" class="gate-msg"></div></div>`;
    document.body.appendChild(box);
    box.querySelector('#g-first').focus();
    box.querySelector('#gate-form').onsubmit = e => {
      e.preventDefault();
      const { profile, isNew } = Profile.login(box.querySelector('#g-first').value, box.querySelector('#g-last').value);
      box.querySelector('#gate-form').hidden = true;
      box.querySelector('#gate-msg').innerHTML = isNew
        ? `ברוכים הבאים, ${profile.first}! 🫧<br><small>מתחילים מההתחלה.</small>`
        : `מוכנים להמשיך, ${profile.first}! 🫧<br><small>כל ההתקדמות והכרטיסים מחכים.</small>`;
      setTimeout(() => { box.remove(); onReady(profile); }, 1600);
    };
  };

  // פס קטן עם השם והחלפת תלמיד/ה
  window.profileBadge = function (el) {
    const c = Profile.current(); if (!c || !el) return;
    el.innerHTML = `<span class="who-badge">👤 ${c.first} ${c.last} <button id="switch-student" class="linkbtn">החלפה</button></span>`;
    el.querySelector('#switch-student').onclick = () => { Profile.logout(); location.reload(); };
  };
})();

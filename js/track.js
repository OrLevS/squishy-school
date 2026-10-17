// מעקב מרחוק: כל צעד בנגן נשלח לטבלת events ב־Supabase.
// המפתח הציבורי מאפשר רק להוסיף שורות, לא לקרוא אותן (RLS), כך שאיש לא יכול לקרוא את הנתונים מהאתר.
// בלי חיבור לאינטרנט האירועים נשמרים בתור ונשלחים בפעם הבאה.
(function () {
  const cfg = window.SITE || {};
  const KEY = 'sq-queue', DEV = 'sq-device';
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* מצב פרטי: ממשיכים בלי לשמור */ } }
  };
  let device = store.get(DEV, null);
  if (!device) { device = 'd-' + Math.random().toString(36).slice(2, 10); store.set(DEV, device); }

  // שליחה אחת בכל רגע: אחרת שתי שליחות במקביל שולחות את אותו תור פעמיים
  let busy = false, again = false;
  async function flush() {
    if (busy) { again = true; return; }
    const q = store.get(KEY, []);
    if (!q.length || !cfg.supabaseUrl || !cfg.supabaseKey) return;
    busy = true;
    try {
      const r = await fetch(`${cfg.supabaseUrl}/rest/v1/events`, {
        method: 'POST',
        headers: { apikey: cfg.supabaseKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(q)
      });
      if (r.ok) store.set(KEY, store.get(KEY, []).slice(q.length));
    } catch (e) { /* ננסה שוב בפעם הבאה */ }
    busy = false;
    if (again) { again = false; flush(); }
  }
  window.track = function (week, session, step, kind, value) {
    const q = store.get(KEY, []);
    q.push({ device, week, session, step, kind, value: value ?? null, at: new Date().toISOString() });
    store.set(KEY, q);
    flush();
  };
  window.trackStore = store;
  window.addEventListener('online', flush);
  flush();
})();

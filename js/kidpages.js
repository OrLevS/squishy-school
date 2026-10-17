// רשימת הדפים של הילדה ומספור שלהם. משותף לחוברת ולנגן המפגש.
// 6 כרטיסים בעמוד. התוויות נכנסות לעמוד האחרון רק אם יש בו עד 5 כרטיסים.
window.kidPages = function (W) {
  const n = W.cards.length, c = Math.ceil(n / 6);
  const CARD_PAGES = n - (c - 1) * 6 > 5 ? c + 1 : c;
  const KID = [
    { id: 'k-draw', title: 'כדור הארץ שלי' },
    { id: 'k-sounds', title: 'הצלילים של השבוע' },
    { id: 'k-land-water', title: 'יבשה או מים?' },
    { id: 'w-letters', title: 'כותבים אותיות' },
    { id: 'cards', title: 'כרטיסי הקופסה', pages: CARD_PAGES },
    { id: 'k-globe-map', title: 'כדור ומפה' },
    { id: 'k-continents', title: 'שבע היבשות' },
    { id: 'k-sentence', title: 'בונים משפט' },
    { id: 'k-address', title: 'הכתובת שלי' },
    { id: 'w-sentence', title: 'משפט השבוע', pages: 2 },
    { id: 'k-hunt', title: 'ציד צלילים' },
    { id: 'k-review', title: 'פינת זיכרון' },
    { id: 'tracker', title: 'דף מעקב (לאמא)' }
  ];
  let pn = 1;
  KID.forEach(k => { k.no = pn; pn += k.pages || 1; });
  return KID;
};

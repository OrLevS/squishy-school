// שבע היבשות: לאיזו יבשת שייכת כל מדינה במפת world-atlas.
// משותף לגלובוס באתר ולמפה בחוברת המודפסת.
window.CONT = (function () {
  // מדינות אסיה לפי קוד ISO מספרי (כולל טורקיה וקפריסין). רוסיה מטופלת בנפרד.
  const ASIA = ['004','051','031','048','050','064','096','116','156','196','268','356','360','364','368','376','392','400','398','414','417','418','422','458','496','104','524','408','512','586','275','608','634','682','410','144','760','158','762','764','626','792','795','784','860','704','887'];
  const NAMES = {
    asia: 'אסיה', africa: 'אפריקה', europe: 'אירופה', namerica: 'צפון אמריקה',
    samerica: 'דרום אמריקה', oceania: 'אוסטרליה', antarctica: 'אנטארקטיקה'
  };
  // מיקום התווית של כל יבשת על המפה [קו אורך, קו רוחב]
  const LABEL_AT = {
    asia: [92, 48], africa: [20, 6], europe: [18, 53], namerica: [-102, 46],
    samerica: [-60, -16], oceania: [134, -25], antarctica: [40, -80]
  };
  const RUSSIA = '643';

  // לפי חתיכת יבשה אחת (פוליגון), לא לפי מדינה שלמה:
  // כך גיאנה הצרפתית נשארת בדרום אמריקה, והאיים של רוסיה במזרח באסיה.
  function rule(lon, lat) {
    if (lat < -60) return 'antarctica';
    if (lon < -25) return lat > 7.5 ? 'namerica' : 'samerica';
    if (lon > 110 && lat < -5) return 'oceania';
    if (lat < -45) return 'antarctica';
    if (lat < 37 && lon > -20 && lon < 52) return 'africa';
    if (lon >= 60) return 'asia';
    return 'europe';
  }
  function of(f) {
    if (f.id === '010') return 'antarctica';
    if (f.properties && f.properties.name === 'N. Cyprus') return 'asia';
    if (f.id === RUSSIA && d3.geoArea(f) > 0.3) return 'russia'; // הגוש הגדול: חוצה את הרי אורל
    if (ASIA.includes(f.id)) return 'asia';
    if (f.id === '304') return 'namerica'; // גרינלנד
    const [lon, lat] = d3.geoCentroid(f);
    return rule(lon, lat);
  }
  // מפרק כל מדינה לחתיכות היבשה שלה, וכל חתיכה מקבלת יבשת
  function explode(features) {
    const out = [];
    features.forEach(f => {
      const g = f.geometry; if (!g) return;
      const polys = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
      polys.forEach(c => {
        const piece = { type: 'Feature', id: f.id, properties: f.properties, geometry: { type: 'Polygon', coordinates: c } };
        piece.cont = of(piece);
        out.push(piece);
      });
    });
    return out;
  }

  // מלבן כדורי לחיתוך רוסיה: מזרחית לקו אורך 60 (בערך הרי אורל) = אסיה
  function russiaClip(east) {
    const ring = [];
    const x0 = east ? 60 : 20, x1 = east ? 180 : 60;
    for (let x = x0; x <= x1; x += 5) ring.push([x, 84]);
    for (let x = x1; x >= x0; x -= 5) ring.push([x, 38]);
    ring.push([x0, 84]);
    let poly = { type: 'Polygon', coordinates: [ring.slice().reverse()] };
    if (d3.geoArea(poly) > 2 * Math.PI) poly = { type: 'Polygon', coordinates: [ring] };
    return poly;
  }
  // קו הגבול בין אירופה לאסיה (מקורב): הרי אורל ונהר אורל
  const URALS = { type: 'LineString', coordinates: [[66, 69], [60, 66], [59, 60], [59.5, 55], [58, 51], [51.5, 47]] };

  return { ASIA, NAMES, LABEL_AT, RUSSIA, of, explode, russiaClip, URALS, KEYS: Object.keys(NAMES) };
})();

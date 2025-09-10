import fetch from "node-fetch"; // npm install node-fetch

export async function getElevation(lat, lon) {
  // const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lon}&key=${apiKey}`;
  const url = `https://api.opentopodata.org/v1/srtm90m?locations=${lat},${lon}`;

  https: try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "OK" && data.results.length > 0) {
      const elevation = data.results[0].elevation;
      return elevation; // dalam meter
    } else {
      throw new Error(`Google API error: ${data.status}`);
    }
  } catch (err) {
    console.error("❌ Error fetching elevation:", err.message);
    return null;
  }
}

export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam kilometer

  // konversi derajat ke radian
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance; // dalam kilometer
}

// // 🔹 Contoh penggunaan:
// (async () => {
//   const lat1 = -6.2,
//     lon1 = 106.816; // Jakarta

//   const lat2 = -6.911795100890996,
//     lon2 = 107.60176888280753; // Bandung
//   //   const lat2 = -7.797,
//   //     lon2 = 110.37; // Yogyakarta

//   const distance = getDistance(lat1, lon1, lat2, lon2);
//   console.log(`📍 Jarak Jakarta - Yogyakarta: ${distance.toFixed(2)} km`);

//   const elev1 = await getElevation(lat1, lon1);
//   const elev2 = await getElevation(lat2, lon2);
//   console.log(`🌄 Elevasi Jakarta: ${elev1} m, Bandung: ${elev2} m`);
// })();

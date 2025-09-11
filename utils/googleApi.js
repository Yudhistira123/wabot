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
/**
 * Ambil POI dari OSM hanya untuk kategori tertentu
 * lalu sort berdasarkan kategori → distance
 */
export async function getFilteredPOISorted(lat, lon, radius = 1000) {
  const categories = ["restaurant", "fast_food", "fuel", "bank"];

  const query = `
    [out:json];
    (
      node(around:${radius},${lat},${lon})[amenity=restaurant];
      node(around:${radius},${lat},${lon})[amenity=fast_food];
      node(around:${radius},${lat},${lon})[amenity=fuel];
      node(around:${radius},${lat},${lon})[amenity=bank];
      node(around:${radius},${lat},${lon})[amenity=cafe];
      node(around:${radius},${lat},${lon})[amenity=hotel];
    );
    out;
  `;

  const url = "https://overpass-api.de/api/interpreter";

  try {
    const res = await fetch(url, { method: "POST", body: query });
    const data = await res.json();

    let places = data.elements.map((el) => ({
      id: el.id,
      name: el.tags?.name || "Tidak ada nama",
      type: el.tags?.amenity || "unknown", // ✅ tambahkan kategori
      lat: el.lat,
      lon: el.lon,
      distance_km: parseFloat(getDistance(lat, lon, el.lat, el.lon).toFixed(2)),
    }));

    // ✅ sort berdasarkan kategori dulu → jarak
    places.sort((a, b) => {
      const catA = categories.indexOf(a.type);
      const catB = categories.indexOf(b.type);

      if (catA === catB) {
        return a.distance_km - b.distance_km; // urut jarak dalam kategori sama
      }
      return catA - catB; // urut kategori
    });

    return places;
  } catch (err) {
    console.error("❌ Error fetch Overpass API:", err.message);
    return [];
  }
}

// 🔹 Contoh penggunaan:
// (async () => {
//   const lat = -6.8970504600460645;
//   const lon = 107.58031439654695;
//   const radius = 1000; // 1 km

//   const places = await getFilteredPOISorted(lat, lon, radius);

//   console.log("📍 Hasil pencarian (urut kategori → jarak):");
//   places.slice(0, 20).forEach((p, i) => {
//     console.log(
//       `${i + 1}. ${p.name} - 📏 ${p.distance_km} km (${p.lat}, ${p.lon})`
//     );
//   });
// })();

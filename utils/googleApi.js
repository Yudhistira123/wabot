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

// === Test ===
// (async () => {
//   const lat = -6.7609; // Puncak Upas Hill
//   const lon = 107.6047;
//   //const apiKey = "AIzaSyAnZbNgeIwJIV567D1ELgrG2l6gttZBU54"; // ganti dengan key-mu

//   const elevation = await getElevation(lat, lon);
//   console.log(`🌍 Elevation for (${lat}, ${lon}) is: ${elevation} mdpl`);
// })();

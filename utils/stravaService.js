const axios = require("axios");

// Strava API Credentials
const CLIENT_ID = "54707";
const CLIENT_SECRET = "24def89a80ad1fe7586f0303af693787576075b3";
const REFRESH_TOKEN = "729818486aef1199b8a0e2ffb481e6f8c7f72e47";


let accessToken = "";

// --- Function: Refresh Token Strava ---
async function getAccessToken() {
    try {
        const res = await axios.post("https://www.strava.com/oauth/token", {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: "refresh_token"
        });
        accessToken = res.data.access_token;
        console.log("✅ Access Token diperbarui");
    } catch (err) {
        console.error("❌ Error refresh token:", err.message);
    }
}


async function getClubInfo(CLUB_ID) {
    try {
        if (!accessToken) await getAccessToken();

        const res = await axios.get(
            `https://www.strava.com/api/v3/clubs/${CLUB_ID}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

      //  console.log("📊 Club Info:", JSON.stringify(res.data, null, 2));
        return res.data;
    } catch (err) {
        console.error("❌ Error getClubInfo:", err.message);
        return null;
    }
}



// --- Function: Get Club Activities ---
async function getClubActivities(CLUB_ID) {
    try {
      if (!accessToken) await getAccessToken();
      
      //const clubInfo = await getClubInfo(CLUB_ID);
       const res = await axios.get(
            `https://www.strava.com/api/v3/clubs/${CLUB_ID}/activities`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { per_page: 15 } // ambil 5 aktivitas terbaru
            }
        );
        return res.data ;
    } catch (err) {
        console.error("❌ Error getClubActivities:", err.message);
        return "Gagal ambil data Club Strava.";
    }
}

module.exports = { getClubInfo, getClubActivities };

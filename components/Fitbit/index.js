import axios from 'axios';
import { Linking } from 'react-native';
import { Buffer } from 'buffer';

const CLIENT_ID = '23R9N8';
const CLIENT_SECRET = 'c38fb42c784d996d64f96476dceee7ebe';
const REDIRECT_URI = 'HealthApplication://callback';
const AUTH_URL = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=profile sleep temperature&expires_in=604800`;

export const initiateFitbitAuth = () => {
  Linking.openURL(AUTH_URL);
};

function getQueryParameter(url, param) {
  const match = url.match(new RegExp('[?&]' + param + '=([^&]+)'));
  return match ? match[1] : null;
}

export const handleOpenURL = (event) => {
  if (event.url.startsWith(REDIRECT_URI)) {
    const code = getQueryParameter(event.url, 'code');
    if (code) {
      getAccessToken(code)
        .then(accessToken => {
          console.log("Access Token:", accessToken);
          return getProfile(accessToken);
        })
        .then(profile => {
          console.log("Profile Data:", profile);
          return getSleepData(profile.access_token);
        })
        .then(sleepData => {
          console.log("Sleep Data:", sleepData);
          return getTemperatureData(sleepData.access_token);
        })
        .then(temperatureData => {
          console.log("Temperature Data:", temperatureData);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }
};


//   if (event.url.startsWith(REDIRECT_URI)) {
//     const code = getQueryParameter(event.url, 'code');
//     if (code) {
//       getAccessToken(code)
//         .then(accessToken => {
//           // Now you can use the access token to fetch data
//           console.log("Access Token:", accessToken);
//           getProfile(accessToken);
//           getSleepData(accessToken);
//           getTemperatureData(accessToken);
//         })
//         .catch(error => {
//           console.error('Error obtaining access token:', error);
//         });
//     }
//   }
// };

const getAccessToken = async (code) => {
  try {
    const response = await axios.post('https://api.fitbit.com/oauth2/token', 
  `clientId=${CLIENT_ID}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code=${code}`,
  {
      headers: {
        Authorization: 'Basic ' + new Buffer(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: {
        clientId: CLIENT_ID,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw error;
  }
};

const getProfile = async (accessToken) => {
  try {
    const response = await axios.get('https://api.fitbit.com/1/user/-/profile.json', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log("Profile Data:", response.data);
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
};

const getSleepData = async (accessToken) => {
  // You can replace these dates with dynamic values
  const startDate = '2023-10-01';
  const endDate = '2023-10-30';
  
  try {
    const response = await axios.get(`https://api.fitbit.com/1.2/user/-/sleep/date/${startDate}/${endDate}.json`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log("Sleep Data:", response.data);
  } catch (error) {
    console.error('Error fetching sleep data:', error);
  }
};

const getTemperatureData = async (accessToken) => {
  // You can replace these dates with dynamic values
  const startDate = '2023-10-01';
  const endDate = '2023-10-30';
  
  try {
    const response = await axios.get(`https://api.fitbit.com/1/user/-/temp/skin/date/${startDate}/${endDate}.json`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log("Temperature Data:", response.data);
  } catch (error) {
    console.error('Error fetching temperature data:', error);
  }
};






// import { Linking } from 'react-native';
// import { Buffer } from 'buffer';

// const CLIENT_ID = "23R9N8";
// const CLIENT_SECRET = "a712495340a4d2e60d3139e4f74ad96c";
// const REDIRECT_URI = "healthapplication://callback";

// export const initiateFitbitAuth = () => {
//   const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
//   Linking.openURL(authUrl);
// };

// export const handleOpenURL = async (event) => {
//   const codeMatch = /code=([^&]*)/.exec(event.url);
//   const code = codeMatch && codeMatch[1];
//   if (code) {
//     try {
//       const tokens = await getAccessToken(code);
//       fetchFitbitData(tokens.accessToken);
//     } catch (error) {
//       console.error("Error in handleOpenURL:", error);
//     }
//   } else {
//     console.error("Authorization code not found in the callback URL:", event.url);
//     throw new Error('Failed to fetch access token');
//   }
// };

// export const getAccessToken = async (code) => {
//   const creds = `${CLIENT_ID}:${CLIENT_SECRET}`;
//   const base64Creds = Buffer.from(creds).toString('base64');

//   const body = new URLSearchParams();
//   body.append('client_id', CLIENT_ID);
//   body.append('grant_type', 'authorization_code');
//   body.append('redirect_uri', REDIRECT_URI);
//   body.append('code', code);

//   const response = await fetch('https://api.fitbit.com/oauth2/token', {
//     method: 'POST',
//     headers: {
//       'Authorization': 'Basic ' + base64Creds,
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     body: body.toString(),
//   });

//   if (!response.ok) {
//     console.error("Failed to fetch tokens. Status:", response.status);
//     throw new Error('Failed to fetch tokens');
//   }

//   const data = await response.json();
//   if (!response.ok) {
//     console.error("Failed to fetch tokens. Status:", response.status);
//     console.error("Error Response:", data);  
//     throw new Error('Failed to fetch tokens');
//   }
//   if (data.access_token && data.refresh_token) {
//     return {
//       accessToken: data.access_token,
//       refreshToken: data.refresh_token,
//     };
//   } else {
//     console.error("Failed to fetch access and refresh tokens:", data);
//     throw new Error('Failed to fetch access token');
//   }
// };

// export const fetchFitbitData = async (accessToken) => {
//   try {
//     // Fetching Daily Activity Summary
//     let activityResponse = await fetch(`https://api.fitbit.com/1/user/-/activities/date/today.json`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${accessToken}`,
//         'Accept': 'application/json',
//       },
//     });
//     let activityData = await activityResponse.json();
//     console.log("Daily Activity Summary:", activityData);

//     // Fetching Temperature (Skin) Summary by Date
//     let tempResponse = await fetch(`https://api.fitbit.com/1/user/-/temp/skin/date/today.json`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${accessToken}`,
//         'Accept': 'application/json',
//       },
//     });
//     let tempData = await tempResponse.json();
//     if (tempData["tempSkin"] && tempData["tempSkin"]["value"]) {
//       console.log("Temperature (Skin) Summary by Date:", tempData);
//     } else {
//       console.log("Temperature (Skin) Summary by Date: null");
//     }
//   } catch (error) {
//     console.error("Error fetching Fitbit data:", error);
//   }
// };

// // Call this function when you suspect the token has expired
// export const refreshAccessToken = async (refreshToken) => {
//   const creds = `${CLIENT_ID}:${CLIENT_SECRET}`;
//   const base64Creds = new Buffer(creds).toString('base64');

//   const body = new URLSearchParams();
//   body.append('grant_type', 'refresh_token');
//   body.append('refresh_token', refreshToken);

//   const response = await fetch('https://api.fitbit.com/oauth2/token', {
//     method: 'POST',
//     headers: {
//       'Authorization': 'Basic ' + base64Creds,
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     body: body.toString(),
//   });

//   const data = await response.json();
//   if (data.access_token && data.refresh_token) {
//     return {
//       accessToken: data.access_token,
//       refreshToken: data.refresh_token,
//     };
//   } else {
//     console.error("Failed to refresh access and refresh tokens:", data);
//     throw new Error('Failed to refresh access token');
//   }
// };

// todo: ios impelnetation

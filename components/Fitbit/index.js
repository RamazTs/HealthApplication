import { Linking } from 'react-native';
import { Buffer } from 'buffer';

const CLIENT_ID = "23R9N8";
const CLIENT_SECRET = "548b6f55ecdeef31e7f36ca991a647ac";
const REDIRECT_URI = "healthapplication://callback";

export const initiateFitbitAuth = () => {
  const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  Linking.openURL(authUrl);
};

export const handleOpenURL = async (event) => {
  let code = /code=([^&]*)/.exec(event.url);
  if (code && code[1]) {
    return await exchangeCodeForToken(code[1]);
  } else {
    console.error("Authorization code not found in the callback URL:", event.url);
    throw new Error('Failed to fetch access token');
  }
};

export const exchangeCodeForToken = async (code) => {
  const creds = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const base64Creds = new Buffer(creds).toString('base64');

  const body = new URLSearchParams();
  body.append('client_id', CLIENT_ID);
  body.append('grant_type', 'authorization_code');
  body.append('redirect_uri', REDIRECT_URI);
  body.append('code', code);

  const response = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + base64Creds,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await response.json();
  if (data.access_token && data.refresh_token) {
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } else {
    console.error("Failed to fetch access and refresh tokens:", data);
    throw new Error('Failed to fetch access token');
  }
};

// Call this function when you suspect the token has expired
export const refreshAccessToken = async (refreshToken) => {
  const creds = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const base64Creds = new Buffer(creds).toString('base64');

  const body = new URLSearchParams();
  body.append('grant_type', 'refresh_token');
  body.append('refresh_token', refreshToken);

  const response = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + base64Creds,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await response.json();
  if (data.access_token && data.refresh_token) {
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } else {
    console.error("Failed to refresh access and refresh tokens:", data);
    throw new Error('Failed to refresh access token');
  }
};



// todo: ios impelnetation
// import { Linking } from 'react-native';
// import { Buffer } from 'buffer';

// export const initiateFitbitAuth = () => {
//   const authUrl = 'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23R9N8&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&redirect_uri=healthapplication%3A%2F%2Fcallback';
//   Linking.openURL(authUrl);
// };

// export const getAccessToken = async (code) => {
//   const body = new URLSearchParams();
//   body.append('client_id', '23R9N8');
//   body.append('grant_type', 'authorization_code');
//   body.append('redirect_uri', 'healthapplication://callback');
//   body.append('code', code);

//   const creds = '23R9N8:548b6f55ecdeef31e7f36ca991a647ac';
//   const base64Creds = new Buffer(creds).toString('base64');

//   const response = await fetch('https://api.fitbit.com/oauth2/token', {
//     method: 'POST',
//     headers: {
//       'Authorization': 'Basic ' + base64Creds,
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     body: body.toString(),
//   });

//   const data = await response.json();
//   if (data.access_token) {
//     return data.access_token;
//   } else {
//     throw new Error('Failed to fetch access token');
//   }
// };
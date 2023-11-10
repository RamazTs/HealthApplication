import axios from 'axios';
import {Linking} from 'react-native';
import {Buffer} from 'buffer';

const CLIENT_ID = '23R9N8';
const CLIENT_SECRET = '38fb42c784d996d64f96476dceee7ebe';
const REDIRECT_URI = 'HealthApplication://callback';

const base64Encode = string => Buffer.from(string, 'utf-8').toString('base64');

export const initiateFitbitAuth = async () => {
  const AUTH_URL = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=profile+sleep+temperature&expires_in=604800`;
  Linking.openURL(AUTH_URL);
};

function getQueryParameter(url, param) {
  const match = url.match(new RegExp('[?&]' + param + '=([^&]+)'));
  return match ? match[1].split('#')[0] : null;
}

export const handleOpenURL = async event => {
  if (event.url.startsWith(REDIRECT_URI.toLowerCase())) {
    const code = getQueryParameter(event.url, 'code');
    const accessToken = await getAccessToken(code);
    const responses = await Promise.all(
      [getProfile, getSleepData, getTemperatureData].map(f => f(accessToken)),
    );
    const responseData = responses.map(r => r.data);
    console.log(responseData);
  }
};

const getAccessToken = async code => {
  try {
    const response = await axios.post(
      'https://api.fitbit.com/oauth2/token',
      `clientId=${CLIENT_ID}&grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URI}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' + base64Encode(`${CLIENT_ID}:${CLIENT_SECRET}`),
        },
      },
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error);
    console.error(error.response.data);
    throw error;
  }
};

const getProfile = async accessToken => {
  try {
    const response = await axios.get(
      'https://api.fitbit.com/1/user/-/profile.json',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log('Profile Data:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
};

const getSleepData = async accessToken => {
  // You can replace these dates with dynamic values
  const startDate = '2023-10-01';
  const endDate = '2023-10-30';

  try {
    const response = await axios.get(
      `https://api.fitbit.com/1.2/user/-/sleep/date/${startDate}/${endDate}.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log('Sleep Data:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching sleep data:', error);
  }
};

const getTemperatureData = async accessToken => {
  // You can replace these dates with dynamic values
  const startDate = '2023-10-01';
  const endDate = '2023-10-30';

  try {
    const response = await axios.get(
      `https://api.fitbit.com/1/user/-/temp/skin/date/${startDate}/${endDate}.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log('Temperature Data:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching temperature data:', error);
  }
};

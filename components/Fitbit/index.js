// todo: ios impelnetation
import { Linking } from 'react-native';
import { Buffer } from 'buffer';

export const initiateFitbitAuth = () => {
  const authUrl = 'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23R9N8&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&redirect_uri=healthapplication%3A%2F%2Fcallback';
  Linking.openURL(authUrl);
};

export const getAccessToken = async (code) => {
  const body = new URLSearchParams();
  body.append('client_id', '23R9N8');
  body.append('grant_type', 'authorization_code');
  body.append('redirect_uri', 'healthapplication://callback');
  body.append('code', code);

  const creds = '23R9N8:548b6f55ecdeef31e7f36ca991a647ac';
  const base64Creds = new Buffer(creds).toString('base64');

  const response = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + base64Creds,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await response.json();
  if (data.access_token) {
    return data.access_token;
  } else {
    throw new Error('Failed to fetch access token');
  }
};
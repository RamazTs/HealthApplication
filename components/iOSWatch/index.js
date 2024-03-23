import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from 'react-native-health'

/* Permission options */
const permissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.HeartRate],
    write: [AppleHealthKit.Constants.Permissions.Steps],
  }
};

  // In your "iOS Watch" file
  export const connectToIOSWatch = () => {
    AppleHealthKit.initHealthKit(permissions, (error) => {
      if (error) {
        console.error('Cannot grant permissions!', error);
        return;
      }
  
      const options = {
        startDate: new Date(2020, 1, 1).toISOString(),
      };
  
      AppleHealthKit.getHeartRateSamples(options, (callbackError, results) => {
        if (callbackError) {
          console.error('Error getting heart rate samples:', callbackError);
          return;
        }
        // Handle the HealthKit data
        console.log(results);
      });
    });
  };
  
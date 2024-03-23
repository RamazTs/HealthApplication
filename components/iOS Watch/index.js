import AppleHealthKit, {
    HealthValue,
    HealthKitPermissions,
  } from 'react-native-health'
    
  /* Permission options */
  const permissions = {
    permissions: {
      read: [AppleHealthKit.Constants.Permissions.HeartRate],
      write: [AppleHealthKit.Constants.Permissions.Steps],
    },
  } as HealthKitPermissions

  // In your "iOS Watch" file
export const connectToIOSWatch = () => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.log('[ERROR] Cannot grant permissions!');
        return;
      }
  
      const options = {
        startDate: new Date(2020, 1, 1).toISOString(),
      };
  
      AppleHealthKit.getHeartRateSamples(options, (callbackError: string, results: HealthValue[]) => {
        // Handle the HealthKit data
      });
    });
  };
  
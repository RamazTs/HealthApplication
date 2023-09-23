import {StyleSheet, TouchableOpacity} from 'react-native';
import {getHeaderTitle} from '@react-navigation/elements';
import {Header as HeaderThemed, Text} from '@rneui/themed';
// import Icon from 'react-native-vector-icons/AntDesign';

export const Header = ({navigation, route, options, back}) => {
  const title = getHeaderTitle(options, route.name);
  const goBack = () => {
    navigation.pop();
  };
  return (
    <HeaderThemed
      centerComponent={{text: title, style: styles.heading}}
      leftComponent={
        <TouchableOpacity
          accessibilityLabel={back.title}
          onPress={goBack}
          style={styles.leftButton}>
          {/* <Icon
            name="left"
            size={16}
            accessible={false}
            color={'white'}
            style={{marginTop: 2}}></Icon> */}
          <Text accessible={false} style={styles.leftButtonText}>
            {back.title}
          </Text>
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  heading: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  leftButton: {
    display: 'flex',
    flexDirection: 'row',
  },
  leftButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});

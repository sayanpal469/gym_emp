import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';


const SplashScreen = () => {

  useEffect(() => {
    changeNavigationBarColor('#075E4D', true); // true for light buttons/icons
  }, []);


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#075E4D" barStyle="light-content" />
      <Image
        source={require('../assets/images/Logo.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#075E4D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 270,
    height: 200,
  },
});

export default SplashScreen;

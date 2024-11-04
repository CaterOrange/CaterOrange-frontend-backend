import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [isWelcomeButtonClicked, setIsWelcomeButtonClicked] = useState(false);

  const handleWelcomeButtonPress = () => {
    setIsWelcomeButtonClicked(true);
    navigation.navigate('Welcome'); 
  };

  const handleAnotherActionPress = () => {
    alert('welcome to corporate page');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome To CaterOrange</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
        <Button
            title="CORPORATE"
            onPress={handleAnotherActionPress}
            color={isWelcomeButtonClicked ? '#4CAF50' : '#A5D6A7'} // Dark green if welcome button clicked, light green otherwise
          />
        </View>
        <View style={styles.buttonWrapper}>
        <Button
            title="EVENTS"
            onPress={handleWelcomeButtonPress}
            color={isWelcomeButtonClicked ? '#A5D6A7' : '#4CAF50'} 
          />
        </View>
      
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9', 
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%', 
    position: 'absolute',
    bottom: 20, 
  },
  buttonWrapper: {
    width: '45%', 
  },
});

export default HomeScreen;

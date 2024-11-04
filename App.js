import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();
import HomeScreen from './Tabnavigator';
import { WelcomeScreen, EventFormScreen } from './components/WelcomeScreen';
import FoodOrderApp from './components/menu';
import OrderScreen from './components/Myorders';
import ShoppingCart from './components/Mycart';

const App = () => {
return (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
    <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }} 
      />
        <Stack.Screen 
        name="Mycart" 
        component={ShoppingCart} 
        options={{ headerShown: false }} 
      /> 
        <Stack.Screen 
        name="Orders" 
        component={OrderScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="EventForm" 
        component={EventFormScreen}
        options={{ headerShown: false }} 
      />
        <Stack.Screen 
        name="Menu" 
        component={FoodOrderApp}
        options={{ headerShown: false }} 
      />
   
    </Stack.Navigator>
  </NavigationContainer>
);
};

export default App;







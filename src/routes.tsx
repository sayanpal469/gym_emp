import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import Login from './screens/Login';
import MainTabs from './components/MainTabs';
import { RootState } from './redux/store';
import { useSelector } from 'react-redux';
import PT from './screens/PT';
import ClientDetails from './screens/ClientDetails';
import BMIScreen from './screens/BMIScreen';
import AddBMIScreen from './screens/AddBMI';
import LeaveScreen from './screens/LeaveScreen';
import Client from './screens/Client';
import ForgotPassword from './screens/ForgotPassword';
import OtpScreen from './screens/OtpScreen';
import ResetPassword from './screens/ResetPassword';
import MemberDetailsScreen from './screens/Admin/StuffDetailsScreen';
import StuffDetailsScreen from './screens/Admin/StuffDetailsScreen';
import MembersDetails from './screens/Admin/MembersDetails';


const Stack = createNativeStackNavigator();


const Routes = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="MainTabs" component={isAuthenticated ? MainTabs : Login} />
        <Stack.Screen name="PT" component={PT} />
        <Stack.Screen name="ClientDetails" component={ClientDetails} />
        <Stack.Screen name="BMI" component={BMIScreen} />
        <Stack.Screen name="AddBMI" component={AddBMIScreen} />
        <Stack.Screen name="Leave" component={LeaveScreen} />
        <Stack.Screen name="Client" component={Client} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="OtpScreen" component={OtpScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen
          name="StuffDetails"
          component={StuffDetailsScreen}
        />
        <Stack.Screen
          name="MembersDetails"
          component={MembersDetails}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;

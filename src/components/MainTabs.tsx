import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  findNodeHandle,
  UIManager,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { TabsConfig } from '../tabs/tabConfig';
import { RootState } from '../redux/store';
import { AdminTabsConfig } from '../tabs/adminTabConfig';

const Tab = createBottomTabNavigator();
const windowWidth = Dimensions.get('window').width;
const HORIZONTAL_MARGIN = 14;

type TabItem = {
  name: string;
  component: React.ComponentType<any>;
  icon: any;
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const indicatorSize = 50;
  const tabRefs = useRef<any[]>([]);

  const animateIndicator = (index: number) => {
    const handle = findNodeHandle(tabRefs.current[index]);
    if (!handle) return;

    UIManager.measure(handle, (x, y, width, height, pageX) => {
      const center = pageX + width / 2 - indicatorSize / 2;
      Animated.timing(indicatorPosition, {
        toValue: center,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      animateIndicator(state.index);
    }, 100); // slight delay to ensure layout is ready
    return () => clearTimeout(timeout);
  }, [state.index]);

  return (
    <View style={{ backgroundColor: '#fff' }}>
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.circularIndicator,
            {
              width: indicatorSize,
              height: indicatorSize,
              transform: [{ translateX: indicatorPosition }],
            },
          ]}
        />
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tab: TabItem | undefined = options.tabData;

          if (!tab) return null;

          return (
            <View
              key={route.key}
              style={styles.tabItem}
              ref={(ref) => (tabRefs.current[index] = ref)}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate(route.name)}
                style={styles.tabPressable}
                activeOpacity={0.7}
              >
                <Image
                  source={tab.icon}
                  style={[
                    styles.icon,
                    { tintColor: isFocused ? '#fff' : '#000' },
                  ]}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const MainTabs = () => {
  const { role } = useSelector((state: RootState) => state.auth);

  // Determine which tabs to show based on role
  let tabRoutes: TabItem[] = [];

  if (role === 'Admin') {
    // Use admin tabs configuration
    tabRoutes = AdminTabsConfig;
  } else {
    // Default to Trainer/Employee tabs
    tabRoutes = TabsConfig;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = tabRoutes.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabData: tab,
        };
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      {tabRoutes.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#ffff',
    marginBottom: 40,
    zIndex: 999,
  },
  circularIndicator: {
    position: 'absolute',
    backgroundColor: '#075E4D',
    borderRadius: 25,
    top: 5,
    zIndex: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  icon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  tabPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

export default MainTabs;
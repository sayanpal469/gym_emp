import HomeLogo from '../assets/icons/Home.png';
import AttendanceLogo from '../assets/icons/Attendance.png';
import ClientLogo from '../assets/icons/Client.png';
import SettingsLogo from '../assets/icons/Settings.png';

import Home from '../screens/Home';
import Attendance from '../screens/Attendance';
import Client from '../screens/Client';
import Setting from '../screens/Setting';
import LeaveScreen from '../screens/LeaveScreen';

export const TabsConfig = [
  { name: 'Home', component: Home, icon: HomeLogo },
  { name: 'Attendance', component: Attendance, icon: AttendanceLogo },
  {
    name: 'Leave',
    component: LeaveScreen,
    icon: ClientLogo,
  },
  { name: 'Setting', component: Setting, icon: SettingsLogo },
];

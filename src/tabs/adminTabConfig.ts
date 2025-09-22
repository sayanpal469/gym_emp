// adminTabConfig.tsx
import HomeScreen from '../screens/Admin/HomeScreen';

import RevenueScreen from '../screens/Admin/RevenueScreen';
import MenuScreen from '../screens/Admin/MenuScreen';

// Import icons for admin tabs
import HomeIcon from '../assets/icons/HomeAdmin.png';
import MembersIcon from '../assets/icons/members.png';
import StuffIcon from '../assets/icons/stuff.png';
import RevenueIcon from '../assets/icons/revenue.png';
import MenuIcon from '../assets/icons/menu.png';
import StuffScreen from '../screens/Admin/StuffScreen';
import MembersScreen from '../screens/Admin/MembersScreen';

export const AdminTabsConfig = [
    {
        name: 'Home',
        component: HomeScreen,
        icon: HomeIcon,
    },
    {
        name: 'Members',
        component: MembersScreen,
        icon: MembersIcon,
    },
    {
        name: 'Stuff',
        component: StuffScreen,
        icon: StuffIcon,
    },
    {
        name: 'Revenue',
        component: RevenueScreen,
        icon: RevenueIcon,
    },
    {
        name: 'Menu',
        component: MenuScreen,
        icon: MenuIcon,
    },
];
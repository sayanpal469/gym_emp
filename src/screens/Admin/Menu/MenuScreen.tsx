import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const MenuScreen = ({ navigation }: any) => {
    const menuItems = [
        {
            id: '1',
            title: 'Update Profile',
            icon: 'person-outline',
            screen: 'Profile',
            description: 'Update your personal information',
        },
        {
            id: '2',
            title: 'Branches',
            icon: 'store',
            screen: 'Branches',
            description:'Select your branch',
        },
        {
            id: '3',
            title: 'Leave Application',
            icon: 'beach-access',
            screen: 'LeaveApplication',
            description: 'View and manage leave applications',
        },
        {
            id: '4',
            title: 'Promotion',
            icon: 'local-offer',
            screen: 'Promotion',
            description: 'View current promotions and offers',
        },
    ];

    const handleMenuItemPress = (screen: string) => {
        navigation.navigate(screen);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Menu</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.subtitle}>Main Menu</Text>

                {menuItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => handleMenuItemPress(item.screen)}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons name={item.icon as any} size={24} color="#075E4D" />
                            </View>
                            <View style={styles.menuText}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuDescription}>{item.description}</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    placeholder: {
        width: 40,
    },
    container: {
        padding: 20,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f9f7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    menuDescription: {
        fontSize: 14,
        color: '#666',
    },
});

export default MenuScreen;


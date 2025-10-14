import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { SafeAreaView } from 'react-native-safe-area-context';
import AttendanceModal from '../modal/AttendanceModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<any>();
  const { userName, phone } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    changeNavigationBarColor('#ffffff', true);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#075E4D" barStyle="light-content" />

      {/* Curved Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <Image
              source={require('../assets/images/avatar.png')}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>HI, {userName?.toUpperCase()}</Text>
              <Text style={styles.subText}>{phone}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tilesRow}>
          <TouchableOpacity style={styles.tile} onPress={() => setModalVisible(true)}>
            <Image source={require('../assets/icons/Attendance.png')} style={styles.tileIcon} />
            <Text style={styles.tileText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile}>
            <Image source={require('../assets/icons/Trial.png')} style={styles.tileIcon} />
            <Text style={styles.tileText}>Trial</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Client')}>
            <Image source={require('../assets/icons/Client.png')} style={styles.tileIcon} />
            <Text style={styles.tileText}>PT</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* White Content Area */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Last Trial Assigned */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LAST TRIAL ASSIGNED</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listItem}>
            <View style={[styles.listIcon, { backgroundColor: '#075E4D' }]}>
              <Ionicons name="calendar-outline" size={20} color="#fff" />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listDate}>Last Trial Assign Date: 5 Apr 2025</Text>
            </View>
          </View>
        </View>

        {/* New Trial Assign */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>NEW TRIAL ASSIGN</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.listItem, styles.highlightedItem]}>
            <View style={[styles.listIcon, { backgroundColor: '#3B82F6' }]}>
              <Ionicons name="person-outline" size={20} color="#fff" />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listName}>Ram Kumar Das</Text>
              <Text style={styles.listSubText}>Joining Date: 5 Apr 2025</Text>
              <Text style={styles.listSubText}>Assign Date: 5 Apr 2025</Text>
            </View>
          </View>
        </View>

        {/* PT Renew */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PT RENEW <Text style={styles.monthText}>(This Month)</Text></Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listItem}>
            <View style={[styles.listIcon, { backgroundColor: '#075E4D' }]}>
              <MaterialCommunityIcons name="calendar-refresh-outline" size={20} color="#fff" />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listName}>Ram Kumar Das</Text>
              <Text style={styles.listSubText}>Date: 5 Apr 2025</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <AttendanceModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#075e4dff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  greeting: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff', // white text for green background
  },
  subText: {
    fontSize: 14,
    color: '#e5e7eb', // light gray for contrast
  },
  tilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '30%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tileText: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 12,
    color: '#000',
  },
  tileIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    color: '#075E4D',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  monthText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
  },
  viewAllText: {
    fontSize: 14,
    color: '#075E4D',
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  highlightedItem: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  listIcon: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  listContent: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  listDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listSubText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
});

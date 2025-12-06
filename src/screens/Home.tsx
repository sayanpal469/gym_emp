import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { SafeAreaView } from 'react-native-safe-area-context';
import AttendanceModal from '../modal/AttendanceModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import RoleRestrictedModal from './RoleRestrictedModal';
import { usePt } from '../hooks/usePt';
import { useTrialService } from '../hooks/useTrialService';

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [roleRestrictedModalVisible, setRoleRestrictedModalVisible] = useState(false);
  const navigation = useNavigation<any>();
  const { userName, phone, role } = useSelector((state: RootState) => state.auth);
  const isTrainer = role === 'Trainer';
  
  // Add hooks for PT and Trial data
  const { getAllPt, loading: ptLoading } = usePt();
  const { fetchTrialsByTrainer, loading: trialLoading, trials } = useTrialService();
  
  const [ptRenewClients, setPtRenewClients] = useState<any[]>([]);
  const [lastTrials, setLastTrials] = useState<any[]>([]);
  const [newTrials, setNewTrials] = useState<any[]>([]);

  useEffect(() => {
    changeNavigationBarColor('#ffffff', true);
    
    // Fetch PT clients and Trial data when component mounts
    if (isTrainer) {
      fetchData();
    }
  }, [isTrainer]);

  const fetchData = async () => {
    if (!isTrainer) return;
    
    try {
      // Fetch PT clients
      const ptRes = await getAllPt();
      if (ptRes.success && ptRes.data) {
        // Get first 2 PT clients
        const firstTwoPtClients = ptRes.data.slice(0, 2);
        setPtRenewClients(firstTwoPtClients);
      }
      
      // Fetch Trial data
      const trialRes = await fetchTrialsByTrainer();
      if (trialRes.success && trialRes.data && trialRes.data.length > 0) {
        const trialData = trialRes.data;
        
        // Get last 2 trials (most recent)
        const lastTwoTrials = trialData.slice(-2).reverse(); // Reverse to show most recent first
        setLastTrials(lastTwoTrials);
        
        // Get first 2 trials (oldest/upcoming)
        const firstTwoTrials = trialData.slice(0, 2);
        setNewTrials(firstTwoTrials);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleTrialPress = () => {
    if (!isTrainer) {
      setRoleRestrictedModalVisible(true);
    } else {
      navigation.navigate('NewTrialAssign');
    }
  };

  const handlePTPress = () => {
    if (!isTrainer) {
      setRoleRestrictedModalVisible(true);
    } else {
      navigation.navigate('Client');
    }
  };

  const handleNewTrialViewAll = () => {
    if (isTrainer) {
      navigation.navigate('NewTrialAssign');
    }
  };

  const handlePTRenewViewAll = () => {
    if (isTrainer) {
      navigation.navigate('Client');
    }
  };

  // Function to get status style based on package_status
  const getStatusStyle = (packageStatus: string) => {
    switch (packageStatus) {
      case 'no_package':
      case 'not_package':
      case 'running':
        return { backgroundColor: '#D4EDDA', color: '#155724' };
      case 'upcoming':
        return { backgroundColor: '#FFF3CD', color: '#856404' };
      case 'expired':
        return { backgroundColor: '#F8D7DA', color: '#721C24' };
      default:
        return { backgroundColor: '#E2E3E5', color: '#383D41' };
    }
  };

  // Function to get display status text
  const getDisplayStatus = (packageStatus: string) => {
    switch (packageStatus) {
      case 'no_package':
      case 'not_package':
        return 'ACTIVE';
      case 'upcoming':
        return 'UPCOMING';
      case 'running':
        return 'RUNNING';
      case 'expired':
        return 'EXPIRED';
      default:
        return 'ACTIVE';
    }
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0000-00-00") {
      return 'Not set';
    }
    return dateString;
  };

  // Function to format trial date
  const formatTrialDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return dateString;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#075E4D" barStyle="dark-content" />

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

          <TouchableOpacity 
            style={[styles.tile, !isTrainer && styles.disabledTile]} 
            onPress={handleTrialPress}
            disabled={!isTrainer}
          >
            <Image 
              source={require('../assets/icons/Trial.png')} 
              style={[styles.tileIcon, !isTrainer && styles.disabledIcon]} 
            />
            <Text style={[styles.tileText, !isTrainer && styles.disabledText]}>Trial</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tile, !isTrainer && styles.disabledTile]} 
            onPress={handlePTPress}
            disabled={!isTrainer}
          >
            <Image 
              source={require('../assets/icons/Client.png')} 
              style={[styles.tileIcon, !isTrainer && styles.disabledIcon]} 
            />
            <Text style={[styles.tileText, !isTrainer && styles.disabledText]}>PT</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* White Content Area */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Last Trial Assigned - Show for all roles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LAST TRIAL ASSIGNED</Text>
          </View>

          {!isTrainer ? (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: '#6B7280' }]}>
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listDate}>Not Applicable</Text>
              </View>
            </View>
          ) : trialLoading ? (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: '#075E4D' }]}>
                <MaterialCommunityIcons name="loading" size={20} color="#fff" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listDate}>Loading trials...</Text>
              </View>
            </View>
          ) : lastTrials.length > 0 ? (
            lastTrials.map((trial, index) => (
              <TouchableOpacity
                key={trial.id || index}
                style={styles.listItem}
                onPress={() => navigation.navigate('TrialDetails', { trial })}
              >
                <View style={[styles.listIcon, { backgroundColor: '#075E4D' }]}>
                  <Ionicons name="calendar-outline" size={20} color="#fff" />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listName}>{trial.member_name}</Text>
                  <Text style={styles.listSubText}>Date: {formatTrialDate(trial.trial_date)}</Text>
                  <Text style={styles.listSubText}>Status: {trial.status_name}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: '#6B7280' }]}>
                <Ionicons name="information-outline" size={20} color="#fff" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listDate}>No recent trials assigned</Text>
              </View>
            </View>
          )}
        </View>

        {/* New Trial Assign - Show for all roles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>NEW TRIAL ASSIGN</Text>
            {isTrainer && newTrials.length > 0 && (
              <TouchableOpacity onPress={handleNewTrialViewAll}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {!isTrainer ? (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: '#6B7280' }]}>
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listDate}>Not Applicable</Text>
              </View>
            </View>
          ) : trialLoading ? (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: '#075E4D' }]}>
                <MaterialCommunityIcons name="loading" size={20} color="#fff" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listDate}>Loading trials...</Text>
              </View>
            </View>
          ) : newTrials.length > 0 ? (
            newTrials.map((trial, index) => (
              <TouchableOpacity
                key={trial.id || index}
                style={styles.listItem}
                onPress={() => navigation.navigate('TrialDetails', { trial })}
              >
                <View style={[styles.listIcon, { backgroundColor: '#6B7280' }]}>
                  <Ionicons name="calendar-outline" size={20} color="#fff" />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listName}>{trial.member_name}</Text>
                  <Text style={styles.listSubText}>Date: {formatTrialDate(trial.trial_date)}</Text>
                  <Text style={styles.listSubText}>Status: {trial.status_name}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: '#6B7280' }]}>
                <Ionicons name="information-outline" size={20} color="#fff" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listDate}>No upcoming trials assigned</Text>
              </View>
            </View>
          )}
        </View>

        {/* PT Renew - Show for all roles */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PT RENEW</Text>
            {isTrainer && ptRenewClients.length > 0 && (
              <TouchableOpacity onPress={handlePTRenewViewAll}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {!isTrainer ? (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: '#6B7280' }]}>
                <MaterialCommunityIcons name="close-circle-outline" size={20} color="#fff" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listDate}>Not Applicable</Text>
              </View>
            </View>
          ) : ptLoading ? (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: '#075E4D' }]}>
                <MaterialCommunityIcons name="loading" size={20} color="#fff" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listDate}>Loading clients...</Text>
              </View>
            </View>
          ) : ptRenewClients.length > 0 ? (
            ptRenewClients.map((client, index) => {
              const statusStyle = getStatusStyle(client.package_status);
              const displayStatus = getDisplayStatus(client.package_status);
              
              return (
                <TouchableOpacity
                  key={client.id || index}
                  style={styles.listItem}
                  onPress={() => navigation.navigate('ClientDetails', { client })}
                >
                  <View style={[styles.listIcon, { backgroundColor: '#075E4D' }]}>
                    <MaterialCommunityIcons name="calendar-refresh-outline" size={20} color="#fff" />
                  </View>
                  <View style={styles.listContent}>
                    <Text style={styles.listName}>{client.name || client.member_name}</Text>
                    <Text style={styles.listSubText}>Start: {formatDate(client.start_date)}</Text>
                    <Text style={styles.listSubText}>End: {formatDate(client.end_date)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={{ color: statusStyle.color, fontWeight: '600', fontSize: 10 }}>
                      {displayStatus}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.listItem}>
              <View style={[styles.listIcon, { backgroundColor: '#6B7280' }]}>
                <MaterialCommunityIcons name="information-outline" size={20} color="#fff" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listDate}>No PT clients assigned</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <AttendanceModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <RoleRestrictedModal 
        visible={roleRestrictedModalVisible} 
        onClose={() => setRoleRestrictedModalVisible(false)} 
      />
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
    color: '#fff',
  },
  subText: {
    fontSize: 14,
    color: '#e5e7eb',
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
  disabledTile: {
    backgroundColor: '#f3f4f6',
    opacity: 0.6,
  },
  tileText: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 12,
    color: '#000',
  },
  disabledText: {
    color: '#6b7280',
  },
  tileIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    color: '#075E4D',
  },
  disabledIcon: {
    color: '#9ca3af',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
});
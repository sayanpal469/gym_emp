import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAttendance } from '../hooks/useAttendance';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import LeaveRequestModal from '../modal/LeaveRequestModal';


const screenWidth = Dimensions.get('window').width;

interface LeaveRecord {
  id: number;
  emp_id: number;
  reason: string;
  description: string;
  leave_for: number;
  req_dt: string;
  status: number;
  status_name: string;
}

const LeaveScreen = ({ navigation }: any) => {
  const { leaveList, loading } = useAttendance();

  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reloading, setReloading] = useState(false);

  // Map status numbers to filter names
  const getStatusFilter = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const fetchLeaveData = async () => {
    try {
      const result = await leaveList();
      
      if (result.success && result.data) {
        setLeaves(result.data.leave_requests);
      } else {
        setLeaves([]);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
      setLeaves([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaveData();
    // Ensure minimum 1 second loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const onReload = async () => {
    setReloading(true);
    await fetchLeaveData();
    // Ensure minimum 1 second loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    setReloading(false);
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleNewLeaveSuccess = (newLeave: LeaveRecord) => {
    setLeaves(prevLeaves => [newLeave, ...prevLeaves]);
  };

  // Filter leaves based on status_name
  const filteredLeaves = leaves.filter((leave) => {
    const leaveFilter = getStatusFilter(leave.status_name);
    return leaveFilter === filter;
  });

  const getStatusStyle = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'approved':
        return { backgroundColor: '#D4EDDA', color: '#155724' };
      case 'pending':
        return { backgroundColor: '#FFF3CD', color: '#856404' };
      case 'rejected':
        return { backgroundColor: '#F8D7DA', color: '#721C24' };
      default:
        return { backgroundColor: '#E2E3E5', color: '#383D41' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-GB', options);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
         <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>YOUR LEAVES</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={onReload} 
              style={[styles.actionButton, reloading && styles.actionButtonDisabled]}
              disabled={reloading}
            >
              <MaterialIcons 
                name="refresh" 
                size={26} 
                color={reloading ? "#ccc" : "#075E4D"} 
                style={reloading ? styles.rotatingIcon : null}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(true)} style={styles.actionButton}>
              <MaterialIcons name="add-circle" size={30} color="#075E4D" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            {(['pending', 'approved', 'rejected'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, filter === tab && styles.activeTab]}
                onPress={() => setFilter(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, filter === tab && styles.activeTabText]}>
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* List */}
        {loading && leaves.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#075E4D" />
            <Text style={styles.loadingText}>Loading leave requests...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#075E4D']}
                tintColor="#075E4D"
                progressBackgroundColor="#fff"
              />
            }
          >
            {filteredLeaves.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons name="calendar-blank" size={64} color="#E0E0E0" />
                </View>
                <Text style={styles.emptyTitle}>No {filter} requests</Text>
                <Text style={styles.emptySubtitle}>
                  {filter === 'pending' 
                    ? "You don't have any pending leave requests"
                    : `No ${filter} leave requests found`
                  }
                </Text>
                <TouchableOpacity onPress={onRefresh} style={styles.retryButton} activeOpacity={0.8}>
                  <MaterialIcons name="refresh" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.retryText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredLeaves.map((leave, index) => {
                const statusStyle = getStatusStyle(leave.status_name);
                return (
                  <View key={leave.id} style={styles.listItem}>
                    <View style={styles.listIconBox}>
                      <FontAwesome name="calendar" size={26} color="#075E4D" />
                    </View>
                    <View style={styles.leaveDetails}>
                      <Text style={styles.reasonText}>{leave.reason}</Text>
                      <Text style={styles.descriptionText}>{leave.description}</Text>
                      <Text style={styles.durationText}>Duration: {leave.leave_for} days</Text>
                      <Text style={styles.dateText}>From: {formatDate(leave.req_dt)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                      <Text style={{ color: statusStyle.color, fontWeight: '600', fontSize: 12 }}>
                        {leave.status_name.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleNewLeaveSuccess}
      />
    </SafeAreaView>
  );
};

export default LeaveScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FAFAFA',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 16
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
    borderRadius: 12,
  },
  title: {  
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1,
    flex: 1,
    marginLeft: 1,
    color: '#1A1A1A',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  actionButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
  rotatingIcon: {
    // You can add rotation animation here if needed
  },
  contentContainer: {
    flex: 1,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeTab: { 
    backgroundColor: '#075E4D',
    shadowColor: '#075E4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#666',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: { 
    paddingHorizontal: 16, 
    paddingBottom: 80, 
    paddingTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'flex-start',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  listIconBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginRight: 12,
  },
  leaveDetails: {
    flex: 1,
  },
  reasonText: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 4, 
    color: '#222' 
  },
  descriptionText: { 
    fontSize: 13, 
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  durationText: { 
    fontSize: 12, 
    color: '#555',
    marginBottom: 2,
  },
  dateText: { 
    fontSize: 12, 
    color: '#555' 
  },
  statusBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 12,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 50,
    padding: 24,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E4D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#075E4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
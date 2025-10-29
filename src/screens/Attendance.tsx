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
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAttendance } from '../hooks/useAttendance';
import Toast from 'react-native-toast-message';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AttendanceRecord {
  id: number;
  emp_id: number;
  lat: number;
  lng: number;
  date: string;
  job_start_time: string;
  job_end_time: string;
  type: string;
  created_at: string;
  attendanceStatus: 'onTime' | 'Late';
}

const Attendance = ({ navigation }: any) => {
  const { empAttendanceList, loading } = useAttendance();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId] = useState(3);

  // Calculate attendance summary from real data
  const calculateSummary = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthAttendance = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear;
    });

    const attendanceDays = new Set(
      thisMonthAttendance.map(record => record.date)
    ).size;

    const totalWorkingDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const offDays = Math.max(0, totalWorkingDays - attendanceDays);

    // Calculate penalty based on Late status from API
    const lateDays = thisMonthAttendance.filter(record =>
      record.attendanceStatus === 'Late'
    ).length;

    const penalty = lateDays * 100;

    return [
      {
        label: 'Attendance Days',
        value: attendanceDays.toString(),
        icon: 'calendar-check',
        iconType: 'MaterialCommunityIcons',
        color: '#4CAF50',
        bgColor: '#E8F5E9'
      },
      {
        label: 'Off Days',
        value: offDays.toString(),
        icon: 'calendar-remove',
        iconType: 'MaterialCommunityIcons',
        color: '#FF9800',
        bgColor: '#FFF8E1'
      },
      {
        label: 'Penalty',
        value: `₹${penalty}`,
        icon: 'cash-remove',
        iconType: 'MaterialCommunityIcons',
        color: '#F44336',
        bgColor: '#FFEBEE'
      },
      {
        label: 'Leave Days',
        value: '0',
        icon: 'beach',
        iconType: 'MaterialCommunityIcons',
        color: '#2196F3',
        bgColor: '#E3F2FD'
      },
      {
        label: 'Gross Salary',
        value: '₹0',
        icon: 'currency-inr',
        iconType: 'MaterialCommunityIcons',
        color: '#9C27B0',
        bgColor: '#F3E5F5'
      },
    ];
  };

  const fetchAttendanceData = async () => {
    try {
      const result = await empAttendanceList();

      if (result.success && result.data) {
        const normalizedAttendance: AttendanceRecord[] =
          (result.data.attendance ?? []).map((record: any) => ({
            ...record,
            attendanceStatus: record.attendanceStatus === 'Late' ? 'Late' : 'onTime',
          }));

        setAttendanceData(normalizedAttendance);
      } else {
        setAttendanceData([]);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to fetch attendance data',
        });
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceData([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceData();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-GB', options);
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === '00:00:00') {
      return '-- : --';
    }

    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusConfig = (status: 'onTime' | 'Late') => {
    switch (status) {
      case 'onTime':
        return {
          backgroundColor: '#E8F5E9',
          textColor: '#2E7D32',
          icon: 'checkmark-circle',
          text: 'On Time'
        };
      case 'Late':
        return {
          backgroundColor: '#FFEBEE',
          textColor: '#C62828',
          icon: 'time',
          text: 'Late'
        };
      default:
        return {
          backgroundColor: '#FFF8E1',
          textColor: '#F57C00',
          icon: 'help-circle',
          text: 'Unknown'
        };
    }
  };

  const getUniqueAttendanceDays = () => {
    const dateMap = new Map<string, AttendanceRecord>();

    attendanceData.forEach(record => {
      const existing = dateMap.get(record.date);
      if (!existing || record.created_at > existing.created_at) {
        dateMap.set(record.date, record);
      }
    });

    return Array.from(dateMap.values()).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const attendanceSummary = calculateSummary();
  const uniqueAttendanceDays = getUniqueAttendanceDays();

  const renderIcon = (iconType: string, iconName: string, color: string, size: number = 26) => {
    switch (iconType) {
      case 'MaterialIcons':
        return <MaterialIcons name={iconName} size={size} color={color} />;
      case 'Ionicons':
        return <Ionicons name={iconName} size={size} color={color} />;
      case 'FontAwesome':
        return <FontAwesome name={iconName} size={size} color={color} />;
      case 'MaterialCommunityIcons':
      default:
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>ATTENDANCE LIST</Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#075E4D" />
          ) : (
            <MaterialIcons
              name="refresh"
              size={24}
              color={"#075E4D"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content Container */}
      <View style={styles.mainContainer}>
        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.summaryContent}
          >
            {attendanceSummary.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.summaryCard, 
                  { 
                    backgroundColor: item.bgColor,
                    marginRight: index === attendanceSummary.length - 1 ? 0 : 12
                  }
                ]}
              >
                <View style={[styles.cardIconContainer, { backgroundColor: item.color }]}>
                  {renderIcon(item.iconType, item.icon, '#ffffff', 20)}
                </View>
                <Text style={styles.cardValue}>{item.value}</Text>
                <Text style={styles.cardLabel}>{item.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Attendance List Section */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>ATTENDANCE LIST THIS MONTH</Text>

          {loading && attendanceData.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#075E4D" />
              <Text style={styles.loadingText}>Loading attendance data...</Text>
            </View>
          ) : uniqueAttendanceDays.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No attendance records found</Text>
              <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              style={styles.listScrollView}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#075E4D']}
                  tintColor="#075E4D"
                />
              }
            >
              {uniqueAttendanceDays.map(record => {
                const statusConfig = getStatusConfig(
                  record.attendanceStatus === 'Late' ? 'Late' : 'onTime'
                );

                return (
                  <View key={record.id} style={styles.listItem}>
                    <View style={styles.listIconBox}>
                      <FontAwesome name="clipboard-list" size={22} color="#075E4D" />
                    </View>
                    
                    <View style={styles.listContentContainer}>
                      <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                        <Text style={styles.dateText}>{formatDate(record.date)}</Text>
                      </View>
                      <View style={styles.timeRow}>
                        <View style={styles.timeItem}>
                          <Ionicons name="time-outline" size={14} color="#6B7280" />
                          <Text style={styles.inOutText}>In: {formatTime(record.job_start_time)}</Text>
                        </View>
                        <View style={styles.timeItem}>
                          <Ionicons name="time-outline" size={14} color="#6B7280" />
                          <Text style={styles.inOutText}>Out: {formatTime(record.job_end_time)}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View style={styles.statusContainer}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: statusConfig.backgroundColor }
                      ]}>
                        <Ionicons
                          name={statusConfig.icon}
                          size={12}
                          color={statusConfig.textColor}
                          style={styles.statusIcon}
                        />
                        <Text style={[
                          styles.statusText,
                          { color: statusConfig.textColor }
                        ]}>
                          {statusConfig.text}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // backgroundColor: '#fff',
    // borderBottomWidth: 1,
    // borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  refreshButton: {
    padding: 4,
    width: 40,
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  summarySection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryContent: {
    paddingHorizontal: 16,
  },
  summaryCard: {
    width: screenWidth * 0.35,
    minWidth: 140,
    maxWidth: 160,
    height: 120,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: '#6B7280',
    fontWeight: '500',
  },
  listSection: {
    flex: 1,
    paddingTop: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listScrollView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  listIconBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 10,
    marginRight: 12,
  },
  listContentContainer: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  inOutText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#6B7280',
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 70,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#075E4D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
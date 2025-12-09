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
  Animated,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAttendance } from '../hooks/useAttendance';
import Toast from 'react-native-toast-message';

const { width: screenWidth } = Dimensions.get('window');

interface AttendanceRecord {
  date: string;
  job_start_time: string | null;
  job_end_time: string | null;
  is_sunday: boolean;
  is_holiday: boolean;
  is_leave: boolean;
  status: 'On Time' | 'Late';
}

interface AttendanceResponse {
  status: string;
  employee_id: number;
  month: string;
  shift_start: string;
  shift_end: string;
  late_days: number;
  attendance: AttendanceRecord[];
  summary: {
    total_days_in_month: string;
    total_present: number;
    total_sundays: number;
    total_holidays: number;
    total_leave_accepted: number;
    total_late: number;
    total_absent: number;
  };
}

interface PayrollResponse {
  status: string;
  employee_id: number;
  salary_details: {
    actual_salary: number;
    incentive: number;
    late_days: number;
    late_to_absent: number;
    total_absent: number;
    final_absent: number;
    per_day_salary: number;
    penalty: number;
    net_salary: number;
  };
  attendance_summary: {
    present: number;
    leave: number;
    holidays: number;
    sundays: number;
    late: number;
    absent: number;
    late_absent: number;
  };
}

interface SummaryItem {
  label: string;
  value: string;
  icon: string;
  iconType: string;
  color: string;
  bgColor: string;
}

interface PayrollItem {
  label: string;
  value: string;
  icon: string;
  color: string;
  isAmount?: boolean;
}

const Attendance = ({ navigation }: any) => {
  const { empAttendanceList, empPayrollSum, loading } = useAttendance();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [responseData, setResponseData] = useState<AttendanceResponse | null>(null);
  const [payrollData, setPayrollData] = useState<PayrollResponse | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(0));

  const fetchAttendanceData = async () => {
    try {
      const result = await empAttendanceList();

      console.log("Attendance API Result:", result);

      if (result.success && result.data) {
        const response = result.data as AttendanceResponse;

        if (response.attendance && Array.isArray(response.attendance)) {
          setAttendanceData(response.attendance);
          setResponseData(response);
          console.log("Attendance data set successfully:", response.attendance.length, "records");
        } else {
          setAttendanceData([]);
          setResponseData(null);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Invalid attendance data format',
          });
        }
      } else {
        setAttendanceData([]);
        setResponseData(null);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to fetch attendance data',
        });
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceData([]);
      setResponseData(null);
    }
  };

  const fetchPayrollData = async () => {
    try {
      const result = await empPayrollSum();

      console.log("Payroll API Result:", result);

      if (result.success && result.data) {
        const response = result.data as PayrollResponse;
        setPayrollData(response);
        console.log("Payroll data set successfully");
      } else {
        setPayrollData(null);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to fetch payroll data',
        });
      }
    } catch (error) {
      console.error('Error fetching payroll:', error);
      setPayrollData(null);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchAttendanceData(), fetchPayrollData()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const toggleDrawer = () => {
    if (drawerVisible) {
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setDrawerVisible(false));
    } else {
      setDrawerVisible(true);
      Animated.timing(drawerAnimation, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const drawerTranslateY = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const drawerOpacity = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-GB', options);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString || timeString === '00:00:00' || timeString === 'null') {
      return '-- : --';
    }

    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatShiftTime = (timeString: string) => {
    if (!timeString || timeString === '00:00:00') {
      return '-- : --';
    }

    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusConfig = (record: AttendanceRecord) => {
    if (record.is_sunday) {
      return {
        backgroundColor: '#FFF8E1',
        textColor: '#FF8F00',
        icon: 'calendar-weekend',
        text: 'Sunday'
      };
    }

    if (record.is_holiday) {
      return {
        backgroundColor: '#FFF3E0',
        textColor: '#EF6C00',
        icon: 'party-popper',
        text: 'Holiday'
      };
    }

    if (record.is_leave) {
      return {
        backgroundColor: '#E3F2FD',
        textColor: '#1976D2',
        icon: 'beach',
        text: 'Leave'
      };
    }

    // For attendance days, check the status
    if (!record.job_start_time && !record.job_end_time) {
      return {
        backgroundColor: '#F5F5F5',
        textColor: '#616161',
        icon: 'calendar-blank',
        text: 'No Record'
      };
    }

    // Handle attendance status
    switch (record.status) {
      case 'On Time':
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
          backgroundColor: '#F5F5F5',
          textColor: '#9E9E9E',
          icon: 'calendar-blank',
          text: 'No Record'
        };
    }
  };

  const getSummaryItems = (): SummaryItem[] => {
    // Use payrollData.attendance_summary if available, otherwise use responseData.summary
    if (payrollData?.attendance_summary) {
      const summary = payrollData.attendance_summary;
      // console.log("Using payroll attendance_summary:", summary);

      return [
        {
          label: 'Attendance Days',
          value: summary.present.toString(),
          icon: 'calendar-check',
          iconType: 'MaterialCommunityIcons',
          color: '#4CAF50',
          bgColor: '#E8F5E9'
        },
        {
          label: 'Absent',
          value: summary.absent.toString(),
          icon: 'calendar-remove',
          iconType: 'MaterialCommunityIcons',
          color: '#F44336',
          bgColor: '#FFEBEE'
        },
        {
          label: 'Leave Days',
          value: summary.leave.toString(),
          icon: 'beach',
          iconType: 'MaterialCommunityIcons',
          color: '#2196F3',
          bgColor: '#E3F2FD'
        },
        {
          label: 'Late Absent',
          value: summary?.late_absent?.toString() || '0',
          icon: 'calendar-clock',
          iconType: 'MaterialCommunityIcons',
          color: '#FF9800',
          bgColor: '#FFF3E0'
        },
        {
          label: 'Late',
          value: summary?.late?.toString() || '0',
          icon: 'clock-alert',
          iconType: 'MaterialCommunityIcons',
          color: '#FF5722',
          bgColor: '#FFEBEE'
        },
      ];
    } else if (responseData?.summary) {
      // console.log("Using attendance API summary:", responseData.summary);

      return [
        {
          label: 'Attendance Days',
          value: responseData?.summary.total_present.toString(),
          icon: 'calendar-check',
          iconType: 'MaterialCommunityIcons',
          color: '#4CAF50',
          bgColor: '#E8F5E9'
        },
        {
          label: 'Absent',
          value: responseData?.summary.total_absent.toString(),
          icon: 'calendar-remove',
          iconType: 'MaterialCommunityIcons',
          color: '#F44336',
          bgColor: '#FFEBEE'
        },
        {
          label: 'Leave Days',
          value: responseData.summary?.total_leave_accepted.toString(),
          icon: 'beach',
          iconType: 'MaterialCommunityIcons',
          color: '#2196F3',
          bgColor: '#E3F2FD'
        },
        {
          label: 'Late',
          value: responseData.summary?.total_late.toString(),
          icon: 'clock-alert',
          iconType: 'MaterialCommunityIcons',
          color: '#FF9800',
          bgColor: '#FFF8E1'
        }
      ];
    }

    return [];
  };

  const getPayrollItems = (): PayrollItem[] => {
    if (!payrollData?.salary_details) return [];

    const salary = payrollData.salary_details;
    console.log("Using payroll salary_details:", salary);

    return [
      {
        label: 'Actual Salary',
        value: formatDecimal(salary.actual_salary),
        icon: 'currency-inr',
        color: '#4CAF50',
        isAmount: true
      },
      {
        label: 'Incentive',
        value: formatDecimal(salary.incentive),
        icon: 'trending-up',
        color: '#2196F3',
        isAmount: true
      },
      {
        label: 'Penalty',
        value: formatDecimal(salary.penalty),
        icon: 'cash-remove',
        color: '#F44336',
        isAmount: true
      },
      {
        label: 'Net Salary',
        value: formatDecimal(salary.net_salary),
        icon: 'calculator',
        color: '#9C27B0',
        isAmount: true
      },
    ];
  };

  const formatDecimal = (value: number): string => {
    // Round to 2 decimal places
    const rounded = Math.round(value * 100) / 100;
    
    // Format with Indian number system (comma separators)
    return rounded.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

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
      <StatusBar backgroundColor="#075E4D" barStyle="light-content" />
      
      {/* Main Content Container */}
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>ATTENDANCE LIST</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={onRefresh}
              style={styles.refreshButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialIcons
                  name="refresh"
                  size={24}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Scrollable Content */}
        <ScrollView 
          style={styles.scrollContainer}
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
          {/* Month and Shift Info */}
          <View style={styles.infoSection}>
            {responseData && (
              <>
                <View style={styles.monthContainer}>
                  <MaterialCommunityIcons name="calendar-month" size={24} color="#075E4D" />
                  <Text style={styles.monthText}>{responseData.month}</Text>
                </View>
                <View style={styles.shiftContainer}>
                  <View style={styles.shiftItem}>
                    <MaterialCommunityIcons name="clock-start" size={18} color="#4CAF50" />
                    <Text style={styles.shiftText}>Shift: {formatShiftTime(responseData.shift_start)}</Text>
                  </View>
                  <View style={styles.shiftItem}>
                    <MaterialCommunityIcons name="clock-end" size={18} color="#F44336" />
                    <Text style={styles.shiftText}>To: {formatShiftTime(responseData.shift_end)}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.summaryContent}
            >
              {getSummaryItems().map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.summaryCard,
                    {
                      backgroundColor: item.bgColor,
                      marginRight: index === getSummaryItems().length - 1 ? 0 : 12
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

          {/* Payroll Button Section */}
          <View style={styles.payrollButtonSection}>
            <TouchableOpacity
              onPress={toggleDrawer}
              style={styles.payrollButton}
              activeOpacity={0.8}
            >
              <View style={styles.payrollButtonContent}>
                <MaterialCommunityIcons name="cash-multiple" size={24} color="#fff" />
                <Text style={styles.payrollButtonText}>View Payroll Details</Text>
                <MaterialIcons name="chevron-right" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Attendance List Section */}
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>DAILY ATTENDANCE</Text>
              <Text style={styles.listSubtitle}>
                Total Days: {responseData?.summary?.total_days_in_month || '0'}
              </Text>
            </View>

            {loading && attendanceData.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#075E4D" />
                <Text style={styles.loadingText}>Loading attendance data...</Text>
              </View>
            ) : attendanceData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="calendar-blank" size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>No attendance records found</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              attendanceData.map((record, index) => {
                const statusConfig = getStatusConfig(record);

                return (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.dateContainer}>
                      <Text style={styles.dayText}>
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text style={styles.dateNumber}>
                        {new Date(record.date).getDate()}
                      </Text>
                    </View>

                    <View style={styles.listContentContainer}>
                      <View style={styles.dateRow}>
                        <MaterialCommunityIcons name="calendar" size={16} color="#6B7280" />
                        <Text style={styles.dateText}>{formatDate(record.date)}</Text>
                      </View>
                      <View style={styles.timeRow}>
                        <View style={styles.timeItem}>
                          <MaterialCommunityIcons name="login" size={14} color="#6B7280" />
                          <Text style={styles.inOutText}>In: {formatTime(record.job_start_time)}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View style={styles.statusContainer}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: statusConfig.backgroundColor }
                      ]}>
                        <MaterialCommunityIcons
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
              })
            )}
          </View>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Payroll Drawer (Bottom Sheet) */}
        {drawerVisible && (
          <View style={styles.drawerOverlay}>
            <TouchableOpacity
              style={styles.drawerBackdrop}
              activeOpacity={1}
              onPress={toggleDrawer}
            />
            <Animated.View
              style={[
                styles.drawerContainer,
                {
                  opacity: drawerOpacity,
                  transform: [{ translateY: drawerTranslateY }]
                }
              ]}
            >
              <View style={styles.drawerHandle} />
              <View style={styles.drawerContent}>
                <View style={styles.drawerHeader}>
                  <MaterialCommunityIcons name="cash-multiple" size={24} color="#fff" />
                  <Text style={styles.drawerTitle}>Payroll Details</Text>
                  <TouchableOpacity onPress={toggleDrawer} style={styles.drawerCloseButton}>
                    <MaterialIcons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                <ScrollView 
                  style={styles.drawerBody}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                  contentContainerStyle={styles.drawerScrollContent}
                >
                  {getPayrollItems().map((item, index) => (
                    <View key={index} style={styles.payrollItem}>
                      <View style={[styles.payrollIconContainer, { backgroundColor: item.color }]}>
                        <MaterialCommunityIcons name={item.icon} size={20} color="#fff" />
                      </View>
                      <View style={styles.payrollInfo}>
                        <Text style={styles.payrollLabel}>{item.label}</Text>
                        <Text style={[
                          styles.payrollValue,
                          item.isAmount && styles.payrollAmount
                        ]}>
                          {item.isAmount ? '₹' : ''}{item.value}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </Animated.View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#075E4D',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#075E4D',
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 4,
    width: 40,
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 10,
  },
  shiftContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  shiftText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 6,
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
    width: screenWidth * 0.32,
    minWidth: 120,
    maxWidth: 140,
    height: 110,
    borderRadius: 16,
    padding: 12,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
    textAlign: 'center',
  },
  cardLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: '#6B7280',
    fontWeight: '500',
  },
  payrollButtonSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  payrollButton: {
    backgroundColor: '#075E4D',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payrollButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payrollButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginLeft: 12,
  },
  listSection: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 20,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  listSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  dateContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  dayText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#075E4D',
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    justifyContent: 'center',
    minWidth: 70,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingTop: 60,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingTop: 60,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
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
  bottomPadding: {
    height: 20,
  },
  // Drawer styles
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    maxHeight: 600,
    minHeight: 400,
  },
  drawerHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 8,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E4D',
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingTop: 12,
  },
  drawerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
  drawerCloseButton: {
    padding: 4,
  },
  drawerBody: {
    flex: 1,
  },
  drawerScrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  payrollItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  payrollIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  payrollInfo: {
    flex: 1,
  },
  payrollLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  payrollValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  payrollAmount: {
    color: '#075E4D',
    fontSize: 22,
  },
});
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
    useWindowDimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { baseClient } from '../../services/api.clients';
import { APIEndpoints } from '../../services/api.endpoints';
// import Toast from 'react-native-toast-message';

const screenWidth = Dimensions.get('window').width;

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
    attendanceStatus: 'onTime' | 'Late' | 'Absent'; // Added attendance status
}

interface ApiAttendanceResponse {
    status: string;
    employee_id: number;
    attendance: AttendanceRecord[];
    message: string;
}

const StuffDetailsScreen = ({ navigation, route }: any) => {
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const { userId } = useSelector((state: RootState) => state.auth);

    // Get employee ID from route params or use current user's ID
    const employeeId = route.params?.employeeId || userId;

    // Calculate responsive values
    const cardWidth = isLandscape ? width * 0.22 : width * 0.44;
    const cardHeight = isLandscape ? height * 0.22 : height * 0.18;

    // Calculate attendance summary from API data
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

        // Calculate penalty based on Late status
        const lateDays = thisMonthAttendance.filter(record =>
            record.attendanceStatus === 'Late'
        ).length;

        const penalty = lateDays * 100; // 100 per late day

        // Calculate present days (records with check-in)
        const presentDays = thisMonthAttendance.length;

        return [
            {
                label: 'Attendance',
                subLabel: 'This Month',
                value: presentDays.toString(),
                icon: 'calendar-check',
                iconType: 'MaterialCommunityIcons',
                color: '#4CAF50',
                bgColor: '#E8F5E9'
            },
            {
                label: 'Absent',
                subLabel: 'This Month',
                value: offDays.toString(),
                icon: 'calendar-remove',
                iconType: 'MaterialCommunityIcons',
                color: '#FF9800',
                bgColor: '#FFF8E1'
            },
            {
                label: 'Penalty',
                subLabel: 'This Month',
                value: `₹${penalty}`,
                icon: 'cash-remove',
                iconType: 'MaterialCommunityIcons',
                color: '#F44336',
                bgColor: '#FFEBEE'
            },
            {
                label: 'Leave',
                subLabel: 'This Month',
                value: '0',
                icon: 'beach',
                iconType: 'MaterialCommunityIcons',
                color: '#2196F3',
                bgColor: '#E3F2FD'
            },
            {
                label: 'Gross Salary',
                subLabel: 'This Month',
                value: '₹15,000',
                icon: 'currency-inr',
                iconType: 'MaterialCommunityIcons',
                color: '#9C27B0',
                bgColor: '#F3E5F5'
            },
            {
                label: 'Shift in Time',
                subLabel: 'This Month',
                value: '₹15,000',
                icon: 'currency-inr',
                iconType: 'MaterialCommunityIcons',
                color: '#122ecc',
                bgColor: '#d2d9f0'
            },
        ];
    };

    const determineAttendanceStatus = (record: AttendanceRecord): 'onTime' | 'Late' | 'Absent' => {
        if (!record.job_start_time || record.job_start_time === '00:00:00') {
            return 'Absent';
        }

        const [hours, minutes] = record.job_start_time.split(':').map(Number);
        // Consider check-in after 9:15 AM as late
        if (hours > 9 || (hours === 9 && minutes > 15)) {
            return 'Late';
        }

        return 'onTime';
    };

    const fetchAttendanceData = async () => {
        setLoading(true);
        try {
            const payload = {
                emp_id: employeeId
            };

            const response = await baseClient.post<ApiAttendanceResponse>(
                APIEndpoints.attendanceList,
                payload
            );



            if (response.data.status === 'success') {
                // Process API data and add attendance status
                const processedData = response.data.attendance.map(record => ({
                    ...record,
                    attendanceStatus: determineAttendanceStatus(record)
                }));


                setAttendanceData(processedData);
            } else {
                setAttendanceData([]);
                // Toast.show({
                //     type: 'error',
                //     text1: 'Error',
                //     text2: response.data.message,
                // });
            }
        } catch (error: any) {
            console.error('Error fetching attendance data:', error);
            setAttendanceData([]);

            let errorMessage = 'Failed to fetch attendance data';
            if (error.response?.status === 404) {
                errorMessage = 'No attendance records found';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            // Toast.show({
            //     type: 'error',
            //     text1: 'Error',
            //     text2: errorMessage,
            // });
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAttendanceData();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchAttendanceData();
    }, [employeeId]);

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

    const getStatusConfig = (status: 'onTime' | 'Late' | 'Absent') => {
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
            case 'Absent':
                return {
                    backgroundColor: '#F3F4F6',
                    textColor: '#6B7280',
                    icon: 'close-circle',
                    text: 'Absent'
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
        // Group by date and get the latest record for each date
        const dateMap = new Map<string, AttendanceRecord>();

        attendanceData.forEach(record => {
            const existing = dateMap.get(record.date);
            if (!existing || record.created_at > existing.created_at) {
                dateMap.set(record.date, record);
            }
        });

        // Sort by date descending (most recent first)
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <MaterialIcons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Attendance Details</Text>
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
                            size={26}
                            color={"#fff"}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#4A90E2']}
                        tintColor="#4A90E2"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Section */}
                <Text style={styles.sectionTitle}>Monthly Summary</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.summaryContainer}
                    contentContainerStyle={styles.summaryContent}
                >
                    {attendanceSummary.map((item, index) => (
                        <View key={index} style={[styles.summaryCard, { backgroundColor: item.bgColor }]}>
                            <View style={[styles.cardIconContainer, { backgroundColor: item.color }]}>
                                {renderIcon(item.iconType, item.icon, '#ffffff', 22)}
                            </View>
                            <Text style={styles.cardValue}>{item.value}</Text>
                            <Text style={styles.cardLabel}>{item.label}</Text>
                            <Text style={styles.cardSubLabel}>{item.subLabel}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Attendance List */}
                <View style={styles.attendanceSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Attendance History</Text>
                        <Text style={styles.monthText}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                    </View>

                    {loading && attendanceData.length === 0 ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4A90E2" />
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
                        <View style={styles.attendanceList}>
                            {uniqueAttendanceDays.map((record) => {
                                const statusConfig = getStatusConfig(record.attendanceStatus);
                                const dayOfWeek = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' });

                                return (
                                    <View key={record.id} style={styles.attendanceCard}>
                                        <View style={styles.dateContainer}>
                                            <Text style={styles.dayText}>{dayOfWeek}</Text>
                                            <Text style={styles.dateNumber}>
                                                {new Date(record.date).getDate()}
                                            </Text>
                                        </View>

                                        <View style={styles.attendanceDetails}>
                                            <View style={styles.timeRow}>
                                                <View style={styles.timeBlock}>
                                                    <Ionicons name="arrow-down-circle" size={14} color="#4CAF50" />
                                                    <Text style={styles.timeLabel}>Check In</Text>
                                                    <Text style={styles.timeValue}>{formatTime(record.job_start_time)}</Text>
                                                </View>

                                                <View style={styles.timeDivider}>
                                                    <View style={styles.dividerLine} />
                                                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                                                </View>

                                                <View style={styles.timeBlock}>
                                                    <Ionicons name="arrow-up-circle" size={14} color="#F44336" />
                                                    <Text style={styles.timeLabel}>Check Out</Text>
                                                    <Text style={styles.timeValue}>{formatTime(record.job_end_time)}</Text>
                                                </View>
                                            </View>

                                            {/* <View style={styles.attendanceFooter}>
                                                <Text style={styles.fullDateText}>{formatDate(record.date)}</Text>
                                                <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
                                                    <Ionicons
                                                        name={statusConfig.icon}
                                                        size={14}
                                                        color={statusConfig.textColor}
                                                        style={styles.statusIcon}
                                                    />
                                                    <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                                                        {statusConfig.text}
                                                    </Text>
                                                </View>
                                            </View> */}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};


export default StuffDetailsScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#075E4D',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    refreshButton: {
        padding: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
        marginTop: 10,
        paddingHorizontal: 14
    },
    summaryContainer: {
        marginBottom: 16,
    },
    summaryContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    summaryCard: {
        width: 140,
        height: 160,
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 4,
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
    },
    cardSubLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    attendanceSection: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    attendanceList: {
        paddingBottom: 16,
    },
    attendanceCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    dateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        minWidth: 48,
    },
    dayText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    dateNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 2,
    },
    attendanceDetails: {
        flex: 1,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    timeBlock: {
        flex: 1,
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        marginBottom: 2,
    },
    timeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    timeDivider: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
    },
    dividerLine: {
        height: 1,
        width: 20,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
    },
    attendanceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fullDateText: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusIcon: {
        marginRight: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    emptyContainer: {
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 16,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#4A90E2',
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
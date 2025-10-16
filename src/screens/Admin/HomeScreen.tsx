import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { baseClient } from '../../services/api.clients';
import { APIEndpoints } from '../../services/api.endpoints';
import Toast from 'react-native-toast-message';
import MonthlyRevenue from "../../assets/images/Mrevenue.png"
import NewMembers from "../../assets/images/Nmembers.png"
import Renewals from "../../assets/images/Renewals.png"
import StaffPresent from "../../assets/images/StPresent.png"

interface SubscriptionOverviewItem {
    sub_category_id: number;
    sub_category_name: string;
    total_subscriptions: number;
    total_revenue: number;
}

interface SubscriptionOverviewResponse {
    status: string;
    month: string;
    data: SubscriptionOverviewItem[];
}

interface StaffAttendanceItem {
    employee_id: string;
    employee_name: string;
    branch_name: string;
    role: string;
    shift_start: string;
    shift_end: string;
    attendance_time: string | null;
    status: 'Present' | 'Absent' | 'Late';
}

interface StaffAttendanceResponse {
    status: string;
    date: string;
    data: StaffAttendanceItem[];
}

interface RevenueChartResponse {
    status: string;
    daily_revenue: string;
    monthly_revenue: string;
    yearly_revenue: string;
}

const HomeScreen = () => {
    const { userId } = useSelector((state: RootState) => state.auth);

    const [revenueData, setRevenueData] = useState({
        monthly: '₹0.0L',
        newMembers: 0,
        renewals: 0,
        staffPresent: '0/0'
    });

    const [subscriptionData, setSubscriptionData] = useState<SubscriptionOverviewItem[]>([]);
    const [staffData, setStaffData] = useState<StaffAttendanceItem[]>([]);
    const [revenueChartData, setRevenueChartData] = useState<RevenueChartResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [staffLoading, setStaffLoading] = useState(false);
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [monthLabel, setMonthLabel] = useState('This Month');
    const [todayDate, setTodayDate] = useState('Today');

    // State for chart filter
    const [chartFilter, setChartFilter] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

    // Ref for refresh interval
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Chart data based on API response - FIXED VERSION
    const getChartData = () => {
        if (!revenueChartData) {
            return {
                labels: ['9AM', '11AM', '1PM', '3PM', '5PM', '7PM', '9PM'],
                datasets: [
                    {
                        data: [0, 0, 0, 0, 0, 0, 0],
                        color: (opacity = 1) => `rgba(7, 94, 77, ${opacity})`,
                        strokeWidth: 2
                    }
                ],
            };
        }

        const dailyRevenue = parseFloat(revenueChartData.daily_revenue) || 0;
        const monthlyRevenue = parseFloat(revenueChartData.monthly_revenue) || 0;
        const yearlyRevenue = parseFloat(revenueChartData.yearly_revenue) || 0;

        // Return different chart data based on filter
        if (chartFilter === 'daily') {
            return {
                labels: ['9AM', '11AM', '1PM', '3PM', '5PM', '7PM', '9PM'],
                datasets: [
                    {
                        data: [
                            dailyRevenue * 0.1,
                            dailyRevenue * 0.2,
                            dailyRevenue * 0.15,
                            dailyRevenue * 0.3,
                            dailyRevenue * 0.25,
                            dailyRevenue * 0.4,
                            dailyRevenue * 0.35
                        ].map(val => val / 100000), // Convert to lakhs
                        color: (opacity = 1) => `rgba(7, 94, 77, ${opacity})`,
                        strokeWidth: 2
                    }
                ],
            };
        } else if (chartFilter === 'monthly') {
            return {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        data: [
                            monthlyRevenue * 0.8,
                            monthlyRevenue * 0.9,
                            monthlyRevenue * 1.0,
                            monthlyRevenue * 1.1,
                            monthlyRevenue * 1.2,
                            monthlyRevenue
                        ].map(val => val / 100000), // Convert to lakhs
                        color: (opacity = 1) => `rgba(7, 94, 77, ${opacity})`,
                        strokeWidth: 2
                    }
                ],
            };
        } else {
            return {
                labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
                datasets: [
                    {
                        data: [
                            yearlyRevenue * 0.6,
                            yearlyRevenue * 0.7,
                            yearlyRevenue * 0.8,
                            yearlyRevenue * 0.9,
                            yearlyRevenue * 1.0,
                            yearlyRevenue
                        ].map(val => val / 100000), // Convert to lakhs
                        color: (opacity = 1) => `rgba(7, 94, 77, ${opacity})`,
                        strokeWidth: 2
                    }
                ],
            };
        }
    };

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(7, 94, 77, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#075E4D',
        },
        propsForLabels: {
            fontSize: 10,
        },
    };

    // Get chart title based on filter
    const getChartTitle = () => {
        switch (chartFilter) {
            case 'daily':
                return "Today's Revenue (in Lakhs)";
            case 'monthly':
                return 'Monthly Revenue (in Lakhs)';
            case 'yearly':
                return 'Yearly Revenue (in Lakhs)';
            default:
                return 'Revenue Trend';
        }
    };

    const fetchRevenueChart = async () => {
        setRevenueLoading(true);
        try {
            const payload = {
                emp_id: userId || 2
            };

            const response = await baseClient.post<RevenueChartResponse>(
                APIEndpoints.revenueChart,
                payload
            );

            if (response.data.status === 'success') {
                setRevenueChartData(response.data);

                // Update monthly revenue in the stats card
                const monthlyRevenue = parseFloat(response.data.monthly_revenue) || 0;
                setRevenueData(prev => ({
                    ...prev,
                    monthly: formatCurrency(monthlyRevenue)
                }));
            } else {
                console.error('Revenue chart API returned error status:', response.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to fetch revenue data',
                });
            }
        } catch (error: any) {
            console.error('Error fetching revenue chart:', error);

            let errorMessage = 'Failed to fetch revenue data';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
        } finally {
            setRevenueLoading(false);
        }
    };

    const fetchSubscriptionOverview = async () => {
        setLoading(true);
        try {
            const payload = {
                emp_id: userId || 2
            };

            const response = await baseClient.post<SubscriptionOverviewResponse>(
                APIEndpoints.subscriptionOverview,
                payload
            );

            if (response.data.status === 'success') {
                setSubscriptionData(response.data.data);
                setMonthLabel(response.data.month);

                // Calculate total new members and renewals from subscription data
                const totalSubscriptions = response.data.data.reduce((sum, item) => sum + item.total_subscriptions, 0);
                const totalRevenue = response.data.data.reduce((sum, item) => sum + item.total_revenue, 0);

                setRevenueData(prev => ({
                    ...prev,
                    newMembers: totalSubscriptions,
                    renewals: Math.floor(totalSubscriptions * 0.9) // Assuming 90% renewal rate for demo
                }));
            } else {
                console.error('API returned error status:', response.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to fetch subscription data',
                });
            }
        } catch (error: any) {
            console.error('Error fetching subscription overview:', error);

            let errorMessage = 'Failed to fetch subscription data';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffAttendance = async () => {
        setStaffLoading(true);
        try {
            const payload = {
                emp_id: userId || 2
            };

            const response = await baseClient.post<StaffAttendanceResponse>(
                APIEndpoints.getTodayAttendanceList,
                payload
            );

            if (response.data.status === 'success') {
                setStaffData(response.data.data);
                setTodayDate(response.data.date);

                // Update staff present count
                const presentCount = response.data.data.filter(staff =>
                    staff.status === 'Present' || staff.status === 'Late'
                ).length;
                const totalCount = response.data.data.length;

                setRevenueData(prev => ({
                    ...prev,
                    staffPresent: `${presentCount}/${totalCount}`
                }));
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to fetch staff attendance data',
                });
            }
        } catch (error: any) {
            console.error('Error fetching staff attendance:', error);

            let errorMessage = 'Failed to fetch staff attendance data';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
        } finally {
            setStaffLoading(false);
        }
    };

    // Function to refresh all data
    const refreshAllData = () => {
        fetchRevenueChart();
        fetchSubscriptionOverview();
        fetchStaffAttendance();
    };

    // Setup automatic refresh for staff attendance only every 5 minutes
    const setupAutoRefresh = () => {
        // Clear existing interval if any
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
        }

        // Set new interval (5 minutes = 300000 milliseconds) for staff attendance only
        refreshIntervalRef.current = setInterval(() => {
            console.log('Auto-refreshing staff attendance...');
            fetchStaffAttendance();
        }, 15000);
    };

    useEffect(() => {
        // Fetch all data on component mount
        refreshAllData();

        // Setup auto refresh for staff attendance only
        setupAutoRefresh();

        // Cleanup interval on component unmount
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);

    const getIconForSubscriptionType = (type: string) => {
        const typeLower = type.toLowerCase();
        if (typeLower.includes('membership')) return 'account-group';
        if (typeLower.includes('pool')) return 'pool';
        if (typeLower.includes('massage')) return 'spa';
        if (typeLower.includes('offer')) return 'tag';
        if (typeLower.includes('yoga')) return 'yoga';
        if (typeLower.includes('gym')) return 'dumbbell';
        return 'account-group';
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount}`;
    };

    const formatTime = (timeString: string | null) => {
        if (!timeString || timeString === '00:00:00') {
            return '-- : --';
        }

        const [hours, minutes] = timeString.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';

        return `${hour12}:${minutes} ${ampm}`;
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

    const currentChartData = getChartData();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#075E4D" barStyle="dark-content" />

            {/* Header with Refresh Button */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.adminText}>ADMIN</Text>
                    <Text style={styles.nameText}>Your Name</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={refreshAllData}
                    >
                        <Ionicons name="refresh" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.notificationIcon}>
                        <Ionicons name="notifications-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Statistics Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        {/* Monthly Revenue Card */}
                        <View style={[styles.statCard, styles.greenCard]}>
                            <View style={[styles.iconContainer, styles.greenIcon]}>
                                <Image source={MonthlyRevenue} style={styles.imageIcon} />
                            </View>
                            <Text style={styles.statValue}>{revenueData.monthly}</Text>
                            <Text style={styles.statLabel}>Monthly Revenue</Text>
                        </View>

                        {/* New Members Card */}
                        <View style={[styles.statCard, styles.pinkCard]}>
                            <View style={[styles.iconContainer, styles.pinkIcon]}>
                                <Image source={NewMembers} style={styles.imageIcon} />
                            </View>
                            <Text style={styles.statValue}>{revenueData.newMembers}</Text>
                            <Text style={styles.statLabel}>New Members</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        {/* Renewals Card */}
                        <View style={[styles.statCard, styles.yellowCard]}>
                            <View style={[styles.iconContainer, styles.yellowIcon]}>
                                <Image source={Renewals} style={styles.imageIcon} />
                            </View>
                            <Text style={styles.statValue}>{revenueData.renewals}</Text>
                            <Text style={styles.statLabel}>Renewals</Text>
                        </View>

                        {/* Staff Present Card */}
                        <View style={[styles.statCard, styles.purpleCard]}>
                            <View style={[styles.iconContainer, styles.purpleIcon]}>
                                <Image source={StaffPresent} style={styles.imageIcon} />
                            </View>
                            <Text style={styles.statValue}>{revenueData.staffPresent}</Text>
                            <Text style={styles.statLabel}>Staff Present</Text>
                        </View>
                    </View>
                </View>

                {/* Revenue Trend Section with Chart */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>REVENUE TREND</Text>
                        <Text style={styles.monthLabel}>{getChartTitle()}</Text>
                    </View>

                    {/* Chart Filter Buttons */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                chartFilter === 'daily' && styles.filterButtonActive
                            ]}
                            onPress={() => setChartFilter('daily')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                chartFilter === 'daily' && styles.filterButtonTextActive
                            ]}>
                                Daily
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                chartFilter === 'monthly' && styles.filterButtonActive
                            ]}
                            onPress={() => setChartFilter('monthly')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                chartFilter === 'monthly' && styles.filterButtonTextActive
                            ]}>
                                Monthly
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                chartFilter === 'yearly' && styles.filterButtonActive
                            ]}
                            onPress={() => setChartFilter('yearly')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                chartFilter === 'yearly' && styles.filterButtonTextActive
                            ]}>
                                Yearly
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {revenueLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#075E4D" />
                            <Text style={styles.loadingText}>Loading revenue data...</Text>
                        </View>
                    ) : (
                        <>
                            <LineChart
                                data={currentChartData}
                                width={Dimensions.get('window').width - 60}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={styles.chart}
                                withVerticalLines={true}
                                withHorizontalLines={true}
                                withDots={true}
                                withShadow={false}
                                withInnerLines={true}
                                withOuterLines={true}
                            />

                            <View style={styles.chartLegend}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: '#075E4D' }]} />
                                    <Text style={styles.legendText}>Revenue Trend</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Subscription Overview */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>SUBSCRIPTION OVERVIEW</Text>
                        <Text style={styles.monthLabel}>{monthLabel}</Text>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#075E4D" />
                            <Text style={styles.loadingText}>Loading subscription data...</Text>
                        </View>
                    ) : subscriptionData.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="account-group" size={40} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No subscription data available</Text>
                        </View>
                    ) : (
                        subscriptionData.map((item, index) => (
                            <View key={index} style={styles.subscriptionItem}>
                                <View style={styles.subscriptionLeft}>
                                    <MaterialCommunityIcons
                                        name={getIconForSubscriptionType(item.sub_category_name)}
                                        size={20}
                                        color="#075E4D"
                                    />
                                    <View style={styles.subscriptionTextContainer}>
                                        <Text style={styles.subscriptionType}>{item.sub_category_name}</Text>
                                        <Text style={styles.subscriptionCount}>
                                            {item.total_subscriptions} Subscriptions
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.subscriptionRevenue}>
                                    {formatCurrency(item.total_revenue)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Staff Attendance */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>STAFF ATTENDANCE</Text>
                        <Text style={styles.todayLabel}>{formatDate(todayDate)}</Text>
                    </View>

                    {staffLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#075E4D" />
                            <Text style={styles.loadingText}>Loading staff attendance...</Text>
                        </View>
                    ) : staffData.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="account-group" size={40} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No staff attendance data available</Text>
                        </View>
                    ) : (
                        staffData.map((staff, index) => (
                            <View key={index} style={styles.staffItem}>
                                <View style={styles.staffInfo}>
                                    <Text style={styles.staffName}>{staff.employee_name}</Text>
                                    <Text style={styles.staffRole}>{staff.role}</Text>
                                </View>
                                <View style={[
                                    styles.attendanceStatus,
                                    staff.status === 'Present' ? styles.presentStatus :
                                        staff.status === 'Late' ? styles.lateStatus : styles.absentStatus
                                ]}>
                                    <Text style={styles.attendanceText}>{staff.status}</Text>
                                    <Text style={styles.attendanceTime}>
                                        {formatTime(staff.attendance_time)}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#075E4D',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    refreshButton: {
        padding: 5,
        marginRight: 10,
    },
    adminText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    nameText: {
        fontSize: 14,
        color: '#fff',
        marginTop: 2,
    },
    notificationIcon: {
        padding: 5,
    },
    container: {
        flex: 1,
        padding: 15,
    },
    statsContainer: {
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statCard: {
        width: '48%',
        borderRadius: 16,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    greenCard: {
        backgroundColor: '#f2fcf3',
    },
    pinkCard: {
        backgroundColor: '#f7ebef',
    },
    yellowCard: {
        backgroundColor: '#fdfced',
    },
    purpleCard: {
        backgroundColor: '#faf1fc',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    imageIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    section: {
        marginBottom: 25,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 15,
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
    },
    monthLabel: {
        fontSize: 12,
        color: '#888',
    },
    todayLabel: {
        fontSize: 12,
        color: '#075E4D',
        fontWeight: '500',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
    },
    filterButtonActive: {
        backgroundColor: '#075E4D',
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    chart: {
        borderRadius: 12,
        marginVertical: 8,
        alignSelf: 'center',
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
    },
    subscriptionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    subscriptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subscriptionTextContainer: {
        marginLeft: 10,
    },
    subscriptionType: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    subscriptionCount: {
        fontSize: 12,
        color: '#888',
    },
    subscriptionRevenue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    staffItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    staffInfo: {
        flex: 1,
    },
    staffName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    staffRole: {
        fontSize: 12,
        color: '#888',
    },
    attendanceStatus: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 80,
    },
    presentStatus: {
        backgroundColor: '#E8F5E9',
    },
    lateStatus: {
        backgroundColor: '#FFF8E1',
    },
    absentStatus: {
        backgroundColor: '#FFEBEE',
    },
    attendanceText: {
        fontSize: 12,
        fontWeight: '500',
    },
    attendanceTime: {
        fontSize: 10,
    },
    loadingContainer: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 12,
        color: '#666',
    },
    emptyContainer: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
    },
});

export default HomeScreen;
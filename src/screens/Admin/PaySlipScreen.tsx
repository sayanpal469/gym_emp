// PaySlipScreen.tsx
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface PaySlipScreenProps {
    navigation: any;
    route: any;
}

const PaySlipScreen: React.FC<PaySlipScreenProps> = ({ navigation, route }) => {
    const { employeeId, attendanceSummary, leaveSummary } = route.params;

    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const currentMonthYear = `${currentMonth} ${currentYear}`;

    // Calculate salary breakdown
    const calculateSalary = () => {
        const basicSalary = 15000;
        const dailyRate = basicSalary / 30;
        const presentDays = attendanceSummary?.present_days || 0;
        const lateDays = attendanceSummary?.late_days || 0;
        
        // Penalty calculation (₹100 per late day)
        const penalty = lateDays * 100;
        
        // Calculate actual working days salary
        const workingDaysSalary = presentDays * dailyRate;
        
        // Actual salary after penalty
        const actualSalary = Math.max(0, workingDaysSalary - penalty);

        return {
            grossSalary: basicSalary,
            actualSalary,
            penalty,
            presentDays,
            lateDays
        };
    };

    const salaryData = calculateSalary();

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
                <Text style={styles.title}>Pay Slip</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Main Salary Card */}
                <View style={styles.mainCard}>
                    <Text style={styles.monthYearText}>{currentMonthYear}</Text>
                    
                    {/* Gross Salary */}
                    <View style={styles.salaryItem}>
                        <View style={styles.salaryInfo}>
                            <MaterialCommunityIcons name="currency-inr" size={24} color="#4CAF50" />
                            <Text style={styles.salaryLabel}>Gross Salary</Text>
                        </View>
                        <Text style={styles.grossSalary}>₹{salaryData.grossSalary.toFixed(2)}</Text>
                    </View>

                    {/* Penalty */}
                    <View style={styles.salaryItem}>
                        <View style={styles.salaryInfo}>
                            <MaterialCommunityIcons name="cash-remove" size={24} color="#F44336" />
                            <Text style={styles.salaryLabel}>Penalty</Text>
                        </View>
                        <Text style={styles.penaltyText}>-₹{salaryData.penalty.toFixed(2)}</Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Actual Salary */}
                    <View style={styles.salaryItem}>
                        <View style={styles.salaryInfo}>
                            <MaterialCommunityIcons name="cash" size={24} color="#075E4D" />
                            <Text style={styles.actualSalaryLabel}>Actual Salary</Text>
                        </View>
                        <Text style={styles.actualSalary}>₹{salaryData.actualSalary.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Salary Withdrawal Status */}
                <View style={styles.withdrawalCard}>
                    <View style={styles.withdrawalInfo}>
                        <MaterialCommunityIcons name="bank-transfer" size={28} color="#075E4D" />
                        <View style={styles.withdrawalText}>
                            <Text style={styles.withdrawalTitle}>Salary Withdrawal</Text>
                            <Text style={styles.withdrawalStatus}>Completed</Text>
                        </View>
                    </View>
                    <View style={styles.withdrawalAmount}>
                        <Text style={styles.withdrawalAmountText}>₹{salaryData.actualSalary.toFixed(2)}</Text>
                        <Text style={styles.withdrawalDate}>15 {currentMonth}</Text>
                    </View>
                </View>

                {/* Current Date Info */}
                <View style={styles.dateCard}>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Generated on:</Text>
                        <Text style={styles.dateValue}>
                            {currentDate.toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                            })}
                        </Text>
                    </View>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Employee ID:</Text>
                        <Text style={styles.dateValue}>{employeeId}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    container: {
        flex: 1,
        padding: 20,
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
    headerRight: {
        width: 34,
    },
    mainCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    monthYearText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#075E4D',
        textAlign: 'center',
        marginBottom: 24,
    },
    salaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    salaryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    salaryLabel: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
        marginLeft: 12,
    },
    actualSalaryLabel: {
        fontSize: 18,
        color: '#075E4D',
        fontWeight: '600',
        marginLeft: 12,
    },
    grossSalary: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4CAF50',
    },
    penaltyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F44336',
    },
    actualSalary: {
        fontSize: 22,
        fontWeight: '700',
        color: '#075E4D',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 16,
        marginHorizontal: -10,
    },
    withdrawalCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    withdrawalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    withdrawalText: {
        marginLeft: 12,
    },
    withdrawalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    withdrawalStatus: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
    },
    withdrawalAmount: {
        alignItems: 'flex-end',
    },
    withdrawalAmountText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#075E4D',
        marginBottom: 2,
    },
    withdrawalDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    dateCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dateLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    dateValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '600',
    },
});

export default PaySlipScreen;
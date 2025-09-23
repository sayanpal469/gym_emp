import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface TransactionDetailScreenProps {
    navigation: any;
    route: any;
}

const TransactionDetailScreen = ({ navigation, route }: TransactionDetailScreenProps) => {
    const { transaction } = route.params || {};

    // Default transaction data if none passed
    const transactionData = transaction || {
        id: 1,
        name: 'Customer Payment #1',
        date: 'Today, 10:31 AM',
        amount: 1600,
        type: 'income',
        status: 'completed',
        customer: 'John Doe',
        paymentMethod: 'Credit Card',
        transactionId: 'TXN_001234',
        description: 'Personal Training Session Renewal',
        category: 'PT Renew',
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'failed': return '#F44336';
            default: return '#6B7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'check-circle';
            case 'pending': return 'clock';
            case 'failed': return 'alert-circle';
            default: return 'help-circle';
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#075E4D" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <MaterialIcons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Transaction Details</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Transaction Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.amountSection}>
                        <Text style={styles.amountLabel}>Amount</Text>
                        <Text style={styles.amountValue}>₹{transactionData.amount.toLocaleString('en-IN')}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transactionData.status) + '20' }]}>
                            <MaterialCommunityIcons
                                name={getStatusIcon(transactionData.status)}
                                size={16}
                                color={getStatusColor(transactionData.status)}
                            />
                            <Text style={[styles.statusText, { color: getStatusColor(transactionData.status) }]}>
                                {transactionData.status.charAt(0).toUpperCase() + transactionData.status.slice(1)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.transactionIcon}>
                        <FontAwesome
                            name="money-bill-wave"
                            size={32}
                            color="#075E4D"
                        />
                    </View>
                </View>

                {/* Transaction Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>Transaction Information</Text>

                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelContainer}>
                            <MaterialCommunityIcons name="format-title" size={20} color="#6B7280" />
                            <Text style={styles.detailLabel}>Description</Text>
                        </View>
                        <Text style={styles.detailValue}>{transactionData.name}</Text>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelContainer}>
                            <MaterialIcons name="person" size={20} color="#6B7280" />
                            <Text style={styles.detailLabel}>Customer</Text>
                        </View>
                        <Text style={styles.detailValue}>{transactionData.customer}</Text>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelContainer}>
                            <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
                            <Text style={styles.detailLabel}>Date & Time</Text>
                        </View>
                        <Text style={styles.detailValue}>{transactionData.date}</Text>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelContainer}>
                            <MaterialCommunityIcons name="identifier" size={20} color="#6B7280" />
                            <Text style={styles.detailLabel}>Transaction ID</Text>
                        </View>
                        <Text style={styles.detailValue}>{transactionData.transactionId}</Text>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelContainer}>
                            <MaterialCommunityIcons name="credit-card" size={20} color="#6B7280" />
                            <Text style={styles.detailLabel}>Payment Method</Text>
                        </View>
                        <Text style={styles.detailValue}>{transactionData.paymentMethod}</Text>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelContainer}>
                            <MaterialCommunityIcons name="tag" size={20} color="#6B7280" />
                            <Text style={styles.detailLabel}>Category</Text>
                        </View>
                        <View style={[styles.categoryBadge, { backgroundColor: '#075E4D20' }]}>
                            <Text style={[styles.categoryText, { color: '#075E4D' }]}>
                                {transactionData.category}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Additional Information */}
                <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>Additional Information</Text>

                    <View style={styles.descriptionSection}>
                        <Text style={styles.descriptionLabel}>Notes</Text>
                        <Text style={styles.descriptionText}>
                            {transactionData.description || 'No additional notes provided for this transaction.'}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                        <MaterialIcons name="receipt" size={20} color="#fff" />
                        <Text style={styles.primaryButtonText}>Download Receipt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                        <MaterialIcons name="share" size={20} color="#075E4D" />
                        <Text style={styles.secondaryButtonText}>Share Details</Text>
                    </TouchableOpacity>
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
        width: 34, // Same as back button for balance
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        margin: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    amountSection: {
        flex: 1,
    },
    amountLabel: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#075E4D',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    transactionIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#075E4D20',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#075E4D40',
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 8,
    },
    separator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 4,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    descriptionSection: {
        marginTop: 8,
    },
    descriptionLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#1F2937',
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    primaryButton: {
        backgroundColor: '#075E4D',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#075E4D',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    secondaryButtonText: {
        color: '#075E4D',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default TransactionDetailScreen;
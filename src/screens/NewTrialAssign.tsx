import React, { useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTrialService } from '../hooks/useTrialService';
const screenWidth = Dimensions.get('window').width;
const PRIMARY_COLOR = '#075e4d';
const SECONDARY_COLOR = '#0a7a63';
const LIGHT_BG = '#e8f5f2';
const CARD_BG = '#ffffff';

const NewTrialAssign = ({ navigation }: any) => {
    const {
        loading,
        error,
        trials,
        refetch
    } = useTrialService();

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get status badge color
    const getStatusColor = (status: number, statusName: string) => {
        if (status === 1) return { bg: '#e8f5f2', text: PRIMARY_COLOR, label: statusName || 'Pending' };
        if (status === 2) return { bg: '#fff3cd', text: '#856404', label: 'Confirmed' };
        if (status === 3) return { bg: '#d4edda', text: '#155724', label: 'Completed' };
        return { bg: '#f8d7da', text: '#721c24', label: 'Cancelled' };
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

            {/* Header with Gradient */}
            <LinearGradient
                colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>New Trial Assignments</Text>
                        <Text style={styles.subtitle}>Track and manage trials</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[PRIMARY_COLOR]}
                        tintColor={PRIMARY_COLOR}
                    />
                }
            >
                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                        <Text style={styles.loadingText}>Loading trials...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => refetch()}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Summary Cards Row */}
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryCard}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="people" size={24} color={PRIMARY_COLOR} />
                                </View>
                                <Text style={styles.summaryValue}>{trials.length}</Text>
                                <Text style={styles.summaryLabel}>Total Trials</Text>
                            </View>

                            <View style={styles.summaryCard}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="checkmark-done" size={24} color={PRIMARY_COLOR} />
                                </View>
                                <Text style={styles.summaryValue}>
                                    {trials.filter(t => t.status === 1).length}
                                </Text>
                                <Text style={styles.summaryLabel}>Pending</Text>
                            </View>
                        </View>

                        {/* Section Header */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Assignments</Text>
                            <View style={styles.sectionDivider} />
                        </View>

                        {/* Trial Assignments List */}
                        {trials.map((trial, index) => {
                            const status = getStatusColor(trial.status, trial.status_name);

                            return (
                                <TouchableOpacity
                                    key={trial.id}
                                    style={styles.listItem}
                                    activeOpacity={0.7}
                                // onPress={() => navigation.navigate('TrialAssignmentDetail', { trial })}
                                >
                                    {/* Left Color Accent based on status */}
                                    <View style={[
                                        styles.itemAccent,
                                        { backgroundColor: status.text }
                                    ]} />

                                    {/* Avatar Circle */}
                                    <View style={styles.avatarContainer}>
                                        <LinearGradient
                                            colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
                                            style={styles.avatarGradient}
                                        >
                                            <Text style={styles.avatarText}>
                                                {trial.member_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                            </Text>
                                        </LinearGradient>
                                    </View>

                                    {/* Content */}
                                    <View style={styles.listContent}>
                                        <View style={styles.nameRow}>
                                            <Text style={styles.memberName}>{trial.member_name}</Text>
                                            <View style={[
                                                styles.badge,
                                                { backgroundColor: status.bg }
                                            ]}>
                                                <Text style={[
                                                    styles.badgeText,
                                                    { color: status.text }
                                                ]}>{status.label}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.detailsContainer}>
                                            <View style={styles.detailRow}>
                                                <View style={styles.detailIconWrapper}>
                                                    <Ionicons name="calendar" size={14} color={PRIMARY_COLOR} />
                                                </View>
                                                <Text style={styles.detailLabel}>Trial Date:</Text>
                                                <Text style={styles.detailValue}>{formatDate(trial.trial_date)}</Text>
                                            </View>

                                            <View style={styles.detailRow}>
                                                <View style={styles.detailIconWrapper}>
                                                    <Ionicons name="call" size={14} color={PRIMARY_COLOR} />
                                                </View>
                                                <Text style={styles.detailLabel}>Phone:</Text>
                                                <Text style={styles.detailValue}>{trial.phone}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Arrow Icon */}
                                    <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                                </TouchableOpacity>
                            );
                        })}

                        {/* Empty State */}
                        {trials.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="clipboard-outline" size={64} color="#ccc" />
                                <Text style={styles.emptyText}>No trial assignments yet</Text>
                                <TouchableOpacity
                                    style={styles.refreshButton}
                                    onPress={() => refetch()}
                                >
                                    <Text style={styles.refreshButtonText}>Refresh</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default NewTrialAssign;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: LIGHT_BG,
    },
    headerGradient: {
        paddingTop: 10,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 20,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: LIGHT_BG,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    sectionDivider: {
        height: 3,
        width: 40,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 2,
    },
    listItem: {
        flexDirection: 'row',
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        overflow: 'hidden',
    },
    itemAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    avatarContainer: {
        marginRight: 14,
        marginLeft: 4,
    },
    avatarGradient: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    listContent: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    detailsContainer: {
        gap: 6,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIconWrapper: {
        width: 20,
        alignItems: 'center',
        marginRight: 6,
    },
    detailLabel: {
        fontSize: 13,
        color: '#666',
        marginRight: 6,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        marginBottom: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    errorText: {
        fontSize: 16,
        color: '#f44336',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    retryButton: {
        backgroundColor: PRIMARY_COLOR,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    refreshButton: {
        backgroundColor: PRIMARY_COLOR,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    refreshButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
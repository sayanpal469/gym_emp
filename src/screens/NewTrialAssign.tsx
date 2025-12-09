import React, { useEffect, useState } from 'react';
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
    Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import { useTrialService } from '../hooks/useTrialService';

const screenWidth = Dimensions.get('window').width;
const PRIMARY_COLOR = '#075E4D';
const SECONDARY_COLOR = '#0a7a63';
const LIGHT_BG = '#f8faf9';
const CARD_BG = '#ffffff';

interface Trial {
    id: number;
    member_id: number;
    trainer_id: number;
    trainer_name: string;
    trial_date: string;
    trial_time: string | null;
    note: string | null;
    status: number;
    created_at: string;
    member_name: string;
    phone: string;
    status_name: string;
}

const NewTrialAssign = ({ navigation }: any) => {
    const { loading, error, trials, refetch } = useTrialService();
    const [refreshing, setRefreshing] = useState(false);
    const [reloading, setReloading] = useState(false);
    const [trialData, setTrialData] = useState<Trial[]>([]);

    const fetchTrialsData = async () => {
        try {
            const result = await refetch();
            if (result && result.data) {
                setTrialData(result.data);
            } else {
                setTrialData([]);
            }
        } catch (err) {
            console.error('Error fetching trial data:', err);
            setTrialData([]);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTrialsData();
        // Ensure minimum 1 second loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const onReload = async () => {
        setReloading(true);
        await fetchTrialsData();
        // Ensure minimum 1 second loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReloading(false);
    };

    useEffect(() => {
        fetchTrialsData();
    }, []);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format time if available
    const formatTime = (timeString: string | null) => {
        if (!timeString) return 'Time not set';

        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour % 12 || 12;
            return `${formattedHour}:${minutes} ${ampm}`;
        } catch (err) {
            return timeString;
        }
    };

    // Get status badge color and icon
    const getStatusInfo = (status: number, statusName: string) => {
        switch (status) {
            case 1: // Assigned (Assuming 1 is Assigned)
                return {
                    bg: '#e8f5f2',
                    text: PRIMARY_COLOR,
                    icon: 'clock',
                    iconColor: PRIMARY_COLOR,
                    label: statusName || 'Assigned'
                };
            case 2: // Completed (from your data example)
                return {
                    bg: '#d4edda',
                    text: '#155724',
                    icon: 'checkmark-done-circle',
                    iconColor: '#155724',
                    label: statusName || 'Completed'
                };
            case 3: // Confirmed (Assuming 3 is Confirmed)
                return {
                    bg: '#fff3cd',
                    text: '#b68c04',
                    icon: 'check-circle',
                    iconColor: '#b68c04',
                    label: 'Confirmed'
                };
            default: // Cancelled or other
                return {
                    bg: '#f8d7da',
                    text: '#721c24',
                    icon: 'close-circle',
                    iconColor: '#721c24',
                    label: statusName || 'Cancelled'
                };
        }
    };

    const getInitials = (name: string) => {
        if (!name) return '??';

        return name
            .split(' ')
            .filter(word => word.length > 0)
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Count trials by status
    const getAssignedCount = () => {
        return trialData.filter(trial => trial.status === 1).length;
    };

    // Count completed trials
    const getCompletedCount = () => {
        return trialData.filter(trial => trial.status === 2).length;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#075E4D" barStyle="light-content" />
            
            {/* Main Container */}
            <View style={styles.mainContainer}>
                {/* Header - Matching Attendance.tsx */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>NEW TRIAL ASSIGN</Text>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={onReload}
                            style={styles.refreshButton}
                            disabled={reloading}
                        >
                            {reloading ? (
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

                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[PRIMARY_COLOR]}
                            tintColor={PRIMARY_COLOR}
                            progressBackgroundColor="#fff"
                        />
                    }
                >
                    {/* Summary Cards */}
                    <View style={styles.summaryContainer}>
                        <LinearGradient
                            colors={['#e8f5f2', '#d4f0e9']}
                            style={styles.summaryCard}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="briefcase" size={24} color={PRIMARY_COLOR} />
                            </View>
                            <Text style={styles.summaryValue}>{trialData.length}</Text>
                            <Text style={styles.summaryLabel}>Total Trials</Text>
                        </LinearGradient>

                        <LinearGradient
                            colors={['#e8f5f2', '#d4f0e9']}
                            style={styles.summaryCard}
                        >
                            <View style={styles.iconCircle}>
                                <FontAwesome5 name="user-check" size={20} color={PRIMARY_COLOR} />
                            </View>
                            <Text style={styles.summaryValue}>
                                {getAssignedCount()}
                            </Text>
                            <Text style={styles.summaryLabel}>Assigned</Text>
                        </LinearGradient>

                        <LinearGradient
                            colors={['#e8f5f2', '#d4f0e9']}
                            style={styles.summaryCard}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="checkmark-done-circle" size={24} color={PRIMARY_COLOR} />
                            </View>
                            <Text style={styles.summaryValue}>
                                {getCompletedCount()}
                            </Text>
                            <Text style={styles.summaryLabel}>Completed</Text>
                        </LinearGradient>
                    </View>

                    {/* Recent Assignments Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Assignments</Text>
                        <View style={styles.sectionDivider} />
                    </View>

                    {loading && !refreshing ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                            <Text style={styles.loadingText}>Loading trial assignments...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Trial Assignments List */}
                            {trialData.length > 0 ? (
                                trialData.map((trial) => {
                                    const statusInfo = getStatusInfo(trial.status, trial.status_name);

                                    return (
                                        <View key={trial.id} style={styles.card}>
                                            {/* Card Header */}
                                            <View style={styles.cardHeader}>
                                                <View style={styles.avatarContainer}>
                                                    <LinearGradient
                                                        colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
                                                        style={styles.avatarGradient}
                                                    >
                                                        <Text style={styles.avatarText}>
                                                            {getInitials(trial.member_name)}
                                                        </Text>
                                                    </LinearGradient>
                                                </View>
                                                <View style={styles.nameContainer}>
                                                    <Text style={styles.memberName} numberOfLines={1}>
                                                        {trial.member_name}
                                                    </Text>

                                                    <View style={styles.detailsRow}>
                                                        <View style={styles.detailItem}>
                                                            <MaterialIcons name="person" size={14} color="#666" />
                                                            <Text style={styles.detailText}>{trial.trainer_name}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Trial Date and Time */}
                                            <View style={styles.dateTimeContainer}>
                                                <View style={styles.dateTimeItem}>
                                                    <MaterialIcons name="calendar-today" size={16} color="#666" />
                                                    <Text style={styles.dateTimeLabel}>Date:</Text>
                                                    <Text style={styles.dateTimeValue}>{formatDate(trial.trial_date)}</Text>
                                                </View>

                                                {trial.trial_time && (
                                                    <View style={styles.dateTimeItem}>
                                                        <MaterialIcons name="access-time" size={16} color="#666" />
                                                        <Text style={styles.dateTimeLabel}>Time:</Text>
                                                        <Text style={styles.dateTimeValue}>{formatTime(trial.trial_time)}</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Status Bar at Bottom */}
                                            <View style={[styles.statusBar, { backgroundColor: statusInfo.bg }]}>
                                                <View style={styles.statusContent}>
                                                    <Ionicons
                                                        name={statusInfo.icon as any}
                                                        size={16}
                                                        color={statusInfo.text}
                                                        style={styles.statusIcon}
                                                    />
                                                    <Text style={[styles.statusText, { color: statusInfo.text }]}>
                                                        {statusInfo.label}
                                                    </Text>
                                                </View>

                                                {/* Note indicator if note exists */}
                                                {trial.note && (
                                                    <View style={styles.noteIndicator}>
                                                        <MaterialIcons name="sticky-note-2" size={16} color="#666" />
                                                        <Text style={styles.noteText}>Has note</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                /* Empty State */
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIconContainer}>
                                        <Ionicons name="clipboard-outline" size={64} color="#E0E0E0" />
                                    </View>
                                    <Text style={styles.emptyTitle}>No trial assignments</Text>
                                    <Text style={styles.emptySubtitle}>
                                        You don't have any trial assignments at the moment
                                    </Text>
                                    <TouchableOpacity
                                        onPress={onRefresh}
                                        style={styles.retryButton}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialIcons name="refresh" size={18} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.retryText}>Refresh</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}

                    {/* Bottom padding */}
                    <View style={styles.bottomPadding} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default NewTrialAssign;

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
        backgroundColor: LIGHT_BG,
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 24,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(7, 94, 77, 0.1)',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'rgba(7, 94, 77, 0.2)',
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#555',
        fontWeight: '600',
        textAlign: 'center',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 10,
    },
    sectionDivider: {
        height: 4,
        width: 50,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 2,
    },
    card: {
        backgroundColor: CARD_BG,
        borderRadius: 20,
        marginHorizontal: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatarGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    nameContainer: {
        flex: 1,
    },
    memberName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    detailsRow: {
        gap: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    idBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignSelf: 'flex-start',
    },
    idText: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    dateTimeContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    dateTimeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateTimeLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
        minWidth: 40,
    },
    dateTimeValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        flex: 1,
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusIcon: {
        marginRight: 4,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    noteIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    noteText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
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
        backgroundColor: PRIMARY_COLOR,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: PRIMARY_COLOR,
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
    bottomPadding: {
        height: 20,
    },
});
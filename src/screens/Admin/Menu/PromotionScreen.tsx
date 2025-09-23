import React, { useState, useCallback, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    RefreshControl,
    Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { baseClient } from '../../../services/api.clients';
import { APIEndpoints } from '../../../services/api.endpoints';
import { store } from '../../../redux/store';

const { width } = Dimensions.get('window');

interface Promotion {
    package_id: string;
    branch: string;
    package_name: string;
    price: string;
    description: string | null;
    image: string;
    status: string;
}

interface PromotionResponse {
    status: boolean;
    message: string;
    data: Promotion[];
}

const PromotionScreen = ({ navigation }: any) => {
    const [refreshing, setRefreshing] = useState(false);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch promotions from API
    const fetchPromotions = async () => {
        try {
            const emp_id = store.getState().auth.user?.emp_id || 2;
            setLoading(true);
            const response = await baseClient.post<PromotionResponse>(APIEndpoints.getAllOffers, { emp_id });

            if (response.data.status && response.data.data) {
                setPromotions(response.data.data);
            } else {
                Alert.alert('Error', 'Failed to fetch promotions');
            }
        } catch (error) {
            console.error('Error fetching promotions:', error);
            Alert.alert('Error', 'Failed to load promotions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    // Pull to refresh function
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPromotions();
    }, []);

    // Format price with currency symbol
    const formatPrice = (price: string) => {
        return `₹${parseInt(price).toLocaleString('en-IN')}`;
    };

    // Get branch name from branch ID
    const getBranchName = (branchId: string) => {
        const branchMap: { [key: string]: string } = {
            '1': 'Branch 1',
            '2': 'Branch 2',
            '3': 'Branch 3',
            '4': 'Branch 4',
        };
        return branchMap[branchId] || `Branch ${branchId}`;
    };

    // Get image URL - you might need to adjust this based on your API
    const getImageUrl = (imagePath: string) => {
       
        // Adjust this URL based on your image storage
        return `https://${imagePath}`;
    };

    const renderPromotionCard = ({ item }: { item: Promotion }) => (
        <TouchableOpacity
            style={styles.promotionCard}
            onPress={() => navigation.navigate('PromotionDetail', { promotion: item })}
        >
            <Image
                source={{ uri: getImageUrl(item.image) || item.image }}
                style={styles.promotionImage}
                defaultSource={require('../../../assets/images/Nmembers.png')} // Add a placeholder image
            />
            <View style={styles.promotionContent}>
                <View style={styles.promotionHeader}>
                    <Text style={styles.packageName}>{item.package_name}</Text>
                    <Text style={styles.price}>{formatPrice(item.price)}</Text>
                </View>
                <View style={styles.branchContainer}>
                    <MaterialIcons name="store" size={16} color="#666" />
                    <Text style={styles.branch}>{getBranchName(item.branch)}</Text>
                </View>
                <View style={styles.viewDetails}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#075E4D" />
                </View>
            </View>
        </TouchableOpacity>
    );

    const handleAddOffer = () => {
        navigation.navigate('AddOfferForm');
    };

    if (loading && promotions.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={26} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Promotions</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.loadingContainer}>
                    <Text>Loading promotions...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Promotions</Text>
                <View style={styles.placeholder} />
            </View>

            {promotions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="local-offer" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No promotions available</Text>
                    <Text style={styles.emptySubText}>Check back later for new offers</Text>
                </View>
            ) : (
                <FlatList
                    data={promotions}
                    renderItem={renderPromotionCard}
                    keyExtractor={(item) => item.package_id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#075E4D']}
                            tintColor={'#075E4D'}
                        />
                    }
                />
            )}

            {/* Floating Add Button */}
            <TouchableOpacity style={styles.floatingButton} onPress={handleAddOffer}>
                <MaterialIcons name="add" size={28} color="#fff" />
            </TouchableOpacity>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    placeholder: {
        width: 40,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 80, // Extra padding for floating button
    },
    promotionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    promotionImage: {
        width: '100%',
        height: 160,
    },
    promotionContent: {
        padding: 16,
    },
    promotionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    packageName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
        marginRight: 8,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#075E4D',
    },
    branchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    branch: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    viewDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#075E4D',
        marginRight: 4,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#075E4D',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
    },
});

export default PromotionScreen;
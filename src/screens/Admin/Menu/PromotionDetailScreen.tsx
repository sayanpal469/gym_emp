import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { baseClient } from '../api/api.clients';
import { APIEndpoints } from '../api/api.endpoints';

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

const PromotionDetailScreen = ({ route, navigation }: any) => {
    const { promotion } = route.params;
    const [loading, setLoading] = useState(false);

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

    // Get image URL
    const getImageUrl = (imagePath: string) => {
       
        return `https://${imagePath}`;
    };

    // Handle delete promotion
    const handleDelete = async () => {
        Alert.alert(
            'Delete Promotion',
            'Are you sure you want to delete this promotion?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: deletePromotion,
                },
            ]
        );
    };

    const deletePromotion = async () => {
        try {
            setLoading(true);
            // You'll need to implement the delete endpoint in your API
            // For now, this is a placeholder
            const response = await baseClient.post('/delete_offer.php', {
                package_id: promotion.package_id,
            });

            if (response.data.status) {
                Alert.alert('Success', 'Promotion deleted successfully');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to delete promotion');
            }
        } catch (error) {
            console.error('Error deleting promotion:', error);
            Alert.alert('Error', 'Failed to delete promotion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Promotion Details</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Image 
                    source={{ uri: getImageUrl(promotion.image) }} 
                    style={styles.detailImage}
                    defaultSource={require('../../../assets/images/avatar.png')}
                />

                <View style={styles.content}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.packageName}>{promotion.package_name}</Text>
                        <Text style={styles.price}>{formatPrice(promotion.price)}</Text>
                    </View>

                    <View style={styles.branchContainer}>
                        <MaterialIcons name="store" size={18} color="#666" />
                        <Text style={styles.branch}>{getBranchName(promotion.branch)}</Text>
                    </View>

                    {promotion.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.description}>{promotion.description}</Text>
                        </View>
                    )}

                    {/* <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Package Includes</Text>
                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="check-circle" size={16} color="#075E4D" />
                                <Text style={styles.featureText}>Special discounts</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="check-circle" size={16} color="#075E4D" />
                                <Text style={styles.featureText}>Priority service</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="check-circle" size={16} color="#075E4D" />
                                <Text style={styles.featureText}>Extended warranty</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="check-circle" size={16} color="#075E4D" />
                                <Text style={styles.featureText}>Free maintenance</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
                        <Text style={styles.terms}>
                            • Offer valid until December 31, 2024{'\n'}
                            • Not applicable with other offers{'\n'}
                            • Subject to availability{'\n'}
                            • Terms and conditions apply
                        </Text>
                    </View> */}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.deleteButton, loading && styles.disabledButton]} 
                    onPress={handleDelete}
                    disabled={loading}
                >
                    {loading ? (
                        <Text style={styles.deleteButtonText}>Deleting...</Text>
                    ) : (
                        <>
                            <MaterialIcons name="delete" size={20} color="#fff" />
                            <Text style={styles.deleteButtonText}>Delete Promotion</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
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
    container: {
        paddingBottom: 100,
    },
    detailImage: {
        width: '100%',
        height: 250,
    },
    content: {
        padding: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    packageName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
        marginRight: 16,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#075E4D',
    },
    branchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    branch: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    featuresList: {
        marginTop: 8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    terms: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    deleteButton: {
        backgroundColor: '#DC3545',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    disabledButton: {
        opacity: 0.6,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PromotionDetailScreen;
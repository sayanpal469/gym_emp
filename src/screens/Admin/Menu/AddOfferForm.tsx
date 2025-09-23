import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    Image,
    Modal,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { baseClient } from '../../../services/api.clients';
import { APIEndpoints } from '../../../services/api.endpoints';

interface UploadOfferResponse {
    status: string;
    code: number;
    message: string;
    package_id?: number;
    image_url?: string | null;
}

interface UploadOfferError {
    status?: string;
    code?: number;
    message?: string;
    missing_fields?: string[];
    post_received?: any;
    files_received?: any;
    error?: string;
}

const AddOfferForm = ({ navigation }: any) => {
    const [formData, setFormData] = useState({
        packageName: '',
        branch: '',
        price: '',
        description: '',
        imageUrl: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showBranchDropdown, setShowBranchDropdown] = useState(false);

    const branches = [
        { id: '1', name: 'Branch 1' },
        { id: '2', name: 'Branch 2' },
        { id: '3', name: 'Branch 3' },
        { id: '4', name: 'Branch 4' },
        { id: '5', name: 'Branch 5' },
    ];

    // Android Permission Requests
    const requestCameraPermission = async (): Promise<boolean> => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'This app needs access to your camera to take photos',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn('Camera permission error:', err);
            return false;
        }
    };

    const requestStoragePermission = async (): Promise<boolean> => {
        try {
            // For Android 13+ (API level 33)
            if (Platform.Version >= 33) {
                const readMediaImagesGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to your storage to select photos',
                        buttonPositive: 'OK',
                    }
                );
                return readMediaImagesGranted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                // For Android < 13
                const readStorageGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to your storage to select photos',
                        buttonPositive: 'OK',
                    }
                );
                return readStorageGranted === PermissionsAndroid.RESULTS.GRANTED;
            }
        } catch (err) {
            console.warn('Storage permission error:', err);
            return false;
        }
    };

    const handleTakePhoto = async () => {
        console.log('Taking photo...');
        
        const hasCameraPermission = await requestCameraPermission();
        if (!hasCameraPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to take photos');
            return;
        }

        // Also request storage permission for saving the photo
        const hasStoragePermission = await requestStoragePermission();
        if (!hasStoragePermission) {
            Alert.alert('Permission Denied', 'Storage permission is required to save photos');
            return;
        }

        const options = {
            mediaType: 'photo' as const,
            quality: 0.8,
            cameraType: 'back' as const,
            saveToPhotos: true,
            includeBase64: false,
        };

        launchCamera(options, (response) => {
            console.log('Camera response:', response);
            
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.errorCode) {
                console.log('Camera Error: ', response.errorMessage);
                Alert.alert('Error', `Failed to take photo: ${response.errorMessage}`);
            } else if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                if (uri) {
                    setSelectedImage(uri);
                    setFormData({ ...formData, imageUrl: uri });
                    setShowImagePicker(false);
                }
            }
        });
    };

    const handleChooseFromGallery = async () => {
        console.log('Choosing from gallery...');
        
        const hasStoragePermission = await requestStoragePermission();
        if (!hasStoragePermission) {
            Alert.alert('Permission Denied', 'Storage permission is required to select photos');
            return;
        }

        const options = {
            mediaType: 'photo' as const,
            quality: 0.8,
            selectionLimit: 1,
            includeBase64: false,
        };

        launchImageLibrary(options, (response) => {
            console.log('Gallery response:', response);
            
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('Gallery Error: ', response.errorMessage);
                Alert.alert('Error', `Failed to select image: ${response.errorMessage}`);
            } else if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                if (uri) {
                    setSelectedImage(uri);
                    setFormData({ ...formData, imageUrl: uri });
                    setShowImagePicker(false);
                }
            }
        });
    };

    const handleBranchSelect = (branchId: string, branchName: string) => {
        setFormData({ ...formData, branch: branchId });
        setShowBranchDropdown(false);
    };

    const handleSubmit = async () => {
        if (!formData.packageName || !formData.branch || !formData.price) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        // Validate price is a valid number
        const priceNumber = parseFloat(formData.price);
        if (isNaN(priceNumber) || priceNumber <= 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare form data for upload
            const uploadData = new FormData();
            
            // Add required fields
            uploadData.append('branch', formData.branch);
            uploadData.append('valid_for', '1'); // Default to 1 as per API
            uploadData.append('package_name', formData.packageName);
            uploadData.append('price', formData.price);
            
            // Add optional description if provided
            if (formData.description) {
                uploadData.append('description', formData.description);
            }

            // Add image if selected
            if (selectedImage) {
                const imageUri = selectedImage;
                const imageFile = {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'offer_image.jpg',
                };
                uploadData.append('image', imageFile as any);
            }

            console.log('Uploading offer data:', uploadData);

            const response = await baseClient.post<UploadOfferResponse>(
                APIEndpoints.uploadOffer,
                uploadData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000, // 30 seconds timeout
                }
            );

            if (response.data.status === 'success') {
                Alert.alert('Success', response.data.message || 'Offer added successfully!', [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]);
            } else {
                throw new Error(response.data.message || 'Failed to upload offer');
            }

        } catch (error: any) {
            console.error('Upload offer error:', error);
            
            let errorMessage = 'Failed to upload offer. Please try again.';
            
            if (error.response?.data) {
                const errorData: UploadOfferError = error.response.data;
                
                if (errorData.missing_fields) {
                    errorMessage = `Missing required fields: ${errorData.missing_fields.join(', ')}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    errorMessage = `Database error: ${errorData.error}`;
                }
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Please check your connection and try again.';
            }
            
            Alert.alert('Upload Failed', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setFormData({ ...formData, imageUrl: '' });
    };

    const getSelectedBranchName = () => {
        const selectedBranch = branches.find(branch => branch.id === formData.branch);
        return selectedBranch ? selectedBranch.name : 'Select branch';
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Add New Offer</Text>
                <TouchableOpacity
                    onPress={handleSubmit}
                    style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formContainer}>
                    {/* Image Upload Section */}
                    <View style={styles.imageSection}>
                        <Text style={styles.sectionTitle}>Offer Image</Text>
                        <TouchableOpacity 
                            style={styles.imageUploadContainer}
                            onPress={() => setShowImagePicker(true)}
                        >
                            {selectedImage ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                                    <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                                        <MaterialIcons name="close" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.uploadPlaceholder}>
                                    <Feather name="image" size={40} color="#075E4D" />
                                    <Text style={styles.uploadText}>Tap to upload image</Text>
                                    <Text style={styles.uploadSubtext}>Recommended: 300x200 pixels</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Package Name */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                            Package Name <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="local-offer" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                value={formData.packageName}
                                onChangeText={(text) => setFormData({ ...formData, packageName: text })}
                                placeholder="Enter package name"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    {/* Branch Dropdown */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                            Branch <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity 
                            style={styles.inputWrapper}
                            onPress={() => setShowBranchDropdown(true)}
                        >
                            <MaterialIcons name="store" size={20} color="#666" style={styles.inputIcon} />
                            <Text style={[styles.dropdownText, !formData.branch && styles.dropdownPlaceholder]}>
                                {getSelectedBranchName()}
                            </Text>
                            <MaterialIcons 
                                name="keyboard-arrow-down" 
                                size={24} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Price */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                            Price <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="attach-money" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                value={formData.price}
                                onChangeText={(text) => setFormData({ ...formData, price: text.replace(/[^0-9]/g, '') })}
                                placeholder="Enter price"
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Description</Text>
                        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                            <MaterialIcons name="description" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Enter description (optional)"
                                multiline
                                numberOfLines={4}
                                placeholderTextColor="#999"
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Improved Branch Dropdown Modal */}
            <Modal
                visible={showBranchDropdown}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowBranchDropdown(false)}
            >
                <TouchableOpacity 
                    style={styles.dropdownOverlay}
                    activeOpacity={1}
                    onPress={() => setShowBranchDropdown(false)}
                >
                    <View style={styles.dropdownContent}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownTitle}>Select Branch</Text>
                            <TouchableOpacity 
                                onPress={() => setShowBranchDropdown(false)}
                                style={styles.dropdownCloseButton}
                            >
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView 
                            style={styles.dropdownList}
                            showsVerticalScrollIndicator={false}
                        >
                            {branches.map((branch) => (
                                <TouchableOpacity
                                    key={branch.id}
                                    style={[
                                        styles.dropdownOption,
                                        formData.branch === branch.id && styles.dropdownOptionSelected
                                    ]}
                                    onPress={() => handleBranchSelect(branch.id, branch.name)}
                                >
                                    <MaterialIcons 
                                        name="store" 
                                        size={20} 
                                        color={formData.branch === branch.id ? "#075E4D" : "#666"} 
                                        style={styles.dropdownOptionIcon}
                                    />
                                    <Text style={[
                                        styles.dropdownOptionText,
                                        formData.branch === branch.id && styles.dropdownOptionTextSelected
                                    ]}>
                                        {branch.name}
                                    </Text>
                                    {formData.branch === branch.id && (
                                        <MaterialIcons name="check" size={20} color="#075E4D" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Image Picker Modal */}
            <Modal
                visible={showImagePicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowImagePicker(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Image Source</Text>
                        
                        <TouchableOpacity style={styles.modalOption} onPress={handleTakePhoto}>
                            <MaterialIcons name="photo-camera" size={24} color="#075E4D" />
                            <Text style={styles.modalOptionText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalOption} onPress={handleChooseFromGallery}>
                            <MaterialIcons name="photo-library" size={24} color="#075E4D" />
                            <Text style={styles.modalOptionText}>Choose from Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.modalCancelButton}
                            onPress={() => setShowImagePicker(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    saveButton: {
        backgroundColor: '#075E4D',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    saveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    formContainer: {
        padding: 20,
    },
    imageSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    imageUploadContainer: {
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        borderRadius: 16,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },
    uploadPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#075E4D',
        marginTop: 8,
    },
    uploadSubtext: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    imagePreviewContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    required: {
        color: '#ff3b30',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 0,
    },
    dropdownText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    dropdownPlaceholder: {
        color: '#999',
    },
    textAreaWrapper: {
        alignItems: 'flex-start',
        paddingVertical: 12,
        height: 120,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 0,
    },
    // Improved Dropdown Styles
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dropdownContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxHeight: '60%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    dropdownCloseButton: {
        padding: 4,
    },
    dropdownList: {
        maxHeight: 300,
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f8f8',
    },
    dropdownOptionSelected: {
        backgroundColor: '#f0f9f7',
    },
    dropdownOptionIcon: {
        marginRight: 12,
    },
    dropdownOptionText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    dropdownOptionTextSelected: {
        color: '#075E4D',
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    modalCancelButton: {
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    modalCancelText: {
        fontSize: 16,
        color: '#ff3b30',
        fontWeight: '600',
    },
});

export default AddOfferForm;
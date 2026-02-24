import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  fetchGalleryPhotos,
  uploadGalleryPhoto,
  deleteGalleryPhoto,
} from '../../api/gallery';
import { GalleryPhoto, formatFileSize } from '../../types/gallery';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - 48 - 8) / 3; // 3 columns with gaps

interface GalleryListViewProps {
  studyId: number;
}

export default function GalleryListView({ studyId }: GalleryListViewProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadPhotos();
  }, [studyId]);

  const loadCurrentUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadPhotos = async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (pageNum === 0) setLoading(true);
      const response = await fetchGalleryPhotos(studyId, pageNum, 21);

      if (append) {
        setPhotos(prev => [...prev, ...response.content]);
      } else {
        setPhotos(response.content);
      }

      setHasMore(!response.last);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load photos:', error);
      Alert.alert('오류', '사진을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPhotos(0, false);
  }, [studyId]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    loadPhotos(page + 1, true);
  }, [hasMore, loadingMore, loading, page, studyId]);

  const handleUploadPhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진을 업로드하려면 갤러리 접근 권한이 필요합니다.');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];

      // Check file size (10MB limit)
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('파일 크기 초과', '10MB 이하의 이미지만 업로드할 수 있습니다.');
        return;
      }

      setUploading(true);

      // Extract filename from URI
      const uriParts = asset.uri.split('/');
      const fileName = uriParts[uriParts.length - 1];

      // Upload
      await uploadGalleryPhoto(
        studyId,
        {
          uri: asset.uri,
          name: fileName,
          type: asset.mimeType || 'image/jpeg',
        }
      );

      // Refresh list
      loadPhotos(0, false);
      Alert.alert('완료', '사진이 업로드되었습니다.');
    } catch (error: any) {
      console.error('Failed to upload photo:', error);
      Alert.alert('업로드 실패', error.response?.data?.message || '사진 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: GalleryPhoto) => {
    Alert.alert(
      '사진 삭제',
      '이 사진을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGalleryPhoto(studyId, photo.id);
              setSelectedPhoto(null);
              loadPhotos(0, false);
              Alert.alert('완료', '사진이 삭제되었습니다.');
            } catch (error: any) {
              console.error('Failed to delete photo:', error);
              Alert.alert('삭제 실패', error.response?.data?.message || '사진 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderPhoto = ({ item }: { item: GalleryPhoto }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => setSelectedPhoto(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.thumbnailUrl || item.storedFileUrl }}
        style={styles.photoImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUploadPhoto}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Feather name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>사진 업로드</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="image" size={48} color="#3F3F46" />
          <Text style={styles.emptyText}>아직 업로드된 사진이 없습니다</Text>
          <Text style={styles.emptySubText}>첫 번째 사진을 업로드해보세요!</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#8B5CF6"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Photo Detail Modal */}
      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedPhoto(null)}
              >
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              {selectedPhoto && currentUserId === selectedPhoto.uploaderId && (
                <TouchableOpacity
                  style={styles.modalDeleteBtn}
                  onPress={() => handleDeletePhoto(selectedPhoto)}
                >
                  <Feather name="trash-2" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>

            {/* Photo */}
            {selectedPhoto && (
              <>
                <Image
                  source={{ uri: selectedPhoto.storedFileUrl }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />

                {/* Photo Info */}
                <View style={styles.modalInfo}>
                  <View style={styles.uploaderRow}>
                    <View style={styles.uploaderAvatar}>
                      {selectedPhoto.uploaderProfileImage ? (
                        <Image
                          source={{ uri: selectedPhoto.uploaderProfileImage }}
                          style={styles.uploaderAvatarImg}
                        />
                      ) : (
                        <Feather name="user" size={16} color="#71717A" />
                      )}
                    </View>
                    <Text style={styles.uploaderName}>{selectedPhoto.uploaderNickname}</Text>
                    <Text style={styles.uploadDate}>{formatDate(selectedPhoto.createdAt)}</Text>
                  </View>
                  {selectedPhoto.caption && (
                    <Text style={styles.caption}>{selectedPhoto.caption}</Text>
                  )}
                  <Text style={styles.fileInfo}>
                    {selectedPhoto.originalFileName} ({formatFileSize(selectedPhoto.fileSize)})
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  gridContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  row: {
    gap: 4,
    marginBottom: 4,
  },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#27272A',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#71717A',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#52525B',
    marginTop: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  modalCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDeleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    flex: 1,
    width: '100%',
  },
  modalInfo: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#18181B',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  uploaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploaderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploaderAvatarImg: {
    width: 28,
    height: 28,
  },
  uploaderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadDate: {
    fontSize: 12,
    color: '#71717A',
    marginLeft: 'auto',
  },
  caption: {
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 12,
    lineHeight: 20,
  },
  fileInfo: {
    fontSize: 12,
    color: '#52525B',
    marginTop: 8,
  },
});

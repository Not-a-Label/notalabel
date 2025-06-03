import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function UploadScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    tags: '',
    audioFile: null as any,
    coverImage: null as any,
  });

  const genres = [
    'Hip Hop', 'Pop', 'Rock', 'Electronic', 'R&B', 'Jazz', 'Classical',
    'Country', 'Folk', 'Reggae', 'Punk', 'Metal', 'Alternative', 'Indie',
    'Blues', 'Funk', 'Soul', 'Ambient', 'Experimental', 'World'
  ];

  const handleAudioPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          audioFile: result.assets[0]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select audio file');
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          coverImage: result.assets[0]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select cover image');
    }
  };

  const handleUpload = async () => {
    if (!formData.title || !formData.audioFile) {
      Alert.alert('Error', 'Please provide a title and select an audio file');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      Alert.alert(
        'Success',
        'Your track has been uploaded successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload track. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (user?.role !== 'artist') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#333" />
          <Text style={styles.restrictedTitle}>Artist Access Only</Text>
          <Text style={styles.restrictedText}>
            You need an artist account to upload music.
          </Text>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Artist</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Upload Track</Text>
        <TouchableOpacity 
          style={[styles.uploadButton, (!formData.title || !formData.audioFile || isUploading) && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={!formData.title || !formData.audioFile || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.mediaSection}>
            <TouchableOpacity 
              style={styles.coverImageContainer}
              onPress={handleImagePicker}
            >
              {formData.coverImage ? (
                <Image source={{ uri: formData.coverImage.uri }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverImagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color="#666" />
                  <Text style={styles.coverImageText}>Add Cover Art</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.audioFileContainer}
              onPress={handleAudioPicker}
            >
              <Ionicons 
                name={formData.audioFile ? "musical-note" : "add-circle-outline"} 
                size={24} 
                color={formData.audioFile ? "#00ffaa" : "#666"} 
              />
              <Text style={[
                styles.audioFileText,
                formData.audioFile && styles.audioFileTextSelected
              ]}>
                {formData.audioFile ? formData.audioFile.name : 'Select Audio File'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Track Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter track title"
              placeholderTextColor="#666"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell listeners about your track..."
              placeholderTextColor="#666"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Genre</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.genreScrollView}
            >
              {genres.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreTag,
                    formData.genre === genre && styles.genreTagSelected
                  ]}
                  onPress={() => updateFormData('genre', genre)}
                >
                  <Text style={[
                    styles.genreTagText,
                    formData.genre === genre && styles.genreTagTextSelected
                  ]}>
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              placeholder="Add tags separated by commas"
              placeholderTextColor="#666"
              value={formData.tags}
              onChangeText={(value) => updateFormData('tags', value)}
            />
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Ionicons name="information-circle-outline" size={20} color="#00ffaa" />
              <Text style={styles.infoText}>
                Supported formats: MP3, WAV, FLAC, AAC
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#00ffaa" />
              <Text style={styles.infoText}>
                Maximum file size: 50MB
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#00ffaa" />
              <Text style={styles.infoText}>
                Your music is protected by our licensing agreement
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  uploadButton: {
    backgroundColor: '#00ffaa',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  mediaSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  coverImageContainer: {
    marginBottom: 20,
  },
  coverImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  coverImagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImageText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  audioFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  audioFileText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  audioFileTextSelected: {
    color: '#00ffaa',
  },
  inputSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  genreScrollView: {
    marginTop: 8,
  },
  genreTag: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  genreTagSelected: {
    backgroundColor: '#00ffaa',
    borderColor: '#00ffaa',
  },
  genreTagText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  genreTagTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  upgradeButton: {
    backgroundColor: '#00ffaa',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
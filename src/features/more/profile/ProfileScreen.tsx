/**
 * Profile Screen - User profile management
 * Following Scope Rule Pattern - Screen local to more feature
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Edit3, Save, User, Mail, Calendar, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/shared/hooks/useAuth';
import { supabase } from '@/infrastructure/supabase/client';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  location: string;
  bio: string;
}

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: user?.email || '',
    phone: '',
    date_of_birth: '',
    location: '',
    bio: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      
      // Get profile from user metadata and database
      const metadata = user?.user_metadata || {};
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      setProfile({
        first_name: data?.first_name || metadata.first_name || '',
        last_name: data?.last_name || metadata.last_name || '',
        email: user?.email || '',
        phone: data?.phone || '',
        date_of_birth: data?.date_of_birth || '',
        location: data?.location || '',
        bio: data?.bio || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setIsLoading(true);

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth || null,
          location: profile.location,
          bio: profile.bio,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      // Update auth metadata if name changed
      if (profile.first_name !== user?.user_metadata?.first_name ||
          profile.last_name !== user?.user_metadata?.last_name) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            first_name: profile.first_name,
            last_name: profile.last_name,
          }
        });

        if (updateError) {
          console.warn('Could not update auth metadata:', updateError);
        }
      }

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfile(); // Reset to original values
  };

  const renderField = (
    key: keyof UserProfile,
    label: string,
    icon: React.ReactNode,
    placeholder: string,
    multiline = false
  ) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldLabel}>
        {icon}
        <Text style={styles.labelText}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          value={profile[key]}
          onChangeText={(text) => setProfile(prev => ({ ...prev, [key]: text }))}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          editable={key !== 'email'} // Email is not editable
        />
      ) : (
        <Text style={[styles.fieldValue, !profile[key] && styles.emptyValue]}>
          {profile[key] || `No ${label.toLowerCase()} set`}
        </Text>
      )}
    </View>
  );

  if (isLoading && !profile.first_name) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#111827" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              if (isEditing) {
                saveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <>
                {isEditing ? (
                  <Save color="#2563EB" size={20} />
                ) : (
                  <Edit3 color="#2563EB" size={20} />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <User color="#6B7280" size={32} />
          </View>
          <Text style={styles.displayName}>
            {profile.first_name || profile.last_name
              ? `${profile.first_name} ${profile.last_name}`.trim()
              : 'User Name'}
          </Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
        </View>

        {/* Profile Fields */}
        <View style={styles.fieldsSection}>
          {renderField('first_name', 'First Name', <User color="#6B7280" size={16} />, 'Enter your first name')}
          {renderField('last_name', 'Last Name', <User color="#6B7280" size={16} />, 'Enter your last name')}
          {renderField('email', 'Email', <Mail color="#6B7280" size={16} />, 'Email address')}
          {renderField('phone', 'Phone', <User color="#6B7280" size={16} />, 'Enter your phone number')}
          {renderField('date_of_birth', 'Date of Birth', <Calendar color="#6B7280" size={16} />, 'YYYY-MM-DD')}
          {renderField('location', 'Location', <MapPin color="#6B7280" size={16} />, 'Enter your location')}
          {renderField('bio', 'Bio', <Edit3 color="#6B7280" size={16} />, 'Tell us about yourself', true)}
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    padding: 4,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  fieldsSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
    minHeight: 24,
  },
  emptyValue: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#2563EB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
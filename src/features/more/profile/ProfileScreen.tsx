/**
 * Profile Screen - User profile management and editing
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
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Edit3, Save, User, Mail, Calendar, MapPin, Phone } from 'lucide-react-native';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      
      // Ensure user is loaded before making database query
      if (!user?.id) {
        console.log('User not loaded yet, skipping profile load');
        return;
      }
      
      // Get profile from user metadata and database
      const metadata = user.user_metadata || {};
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      setProfile({
        first_name: data?.first_name || metadata.first_name || '',
        last_name: data?.last_name || metadata.last_name || '',
        email: user.email || '',
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

      // Ensure user is loaded before making database query
      if (!user?.id) {
        Alert.alert('Error', 'User session not found. Please try logging out and back in.');
        return;
      }

      // Validate required fields
      if (!profile.first_name?.trim()) {
        Alert.alert('Validation Error', 'First name is required.');
        return;
      }

      // Prepare profile data with proper null handling
      const profileData = {
        user_id: user.id,
        first_name: profile.first_name.trim(),
        last_name: profile.last_name?.trim() || null,
        phone: profile.phone?.trim() || null,
        date_of_birth: profile.date_of_birth?.trim() || null,
        location: profile.location?.trim() || null,
        bio: profile.bio?.trim() || null,
        updated_at: new Date().toISOString(),
        email: user.email || null, // Ensure email is included
      };
      console.log("🚀 ~ saveProfile ~ profileData:", profileData)

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update auth metadata if name changed
      if (profile.first_name !== user.user_metadata?.first_name ||
          profile.last_name !== user.user_metadata?.last_name) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            first_name: profile.first_name,
            last_name: profile.last_name || null,
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

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T00:00:00'); // Ensure local time
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleDateChange = (year: string, month: string, day: string) => {
    // Validate inputs
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    if (year && month && day && 
        yearNum >= 1900 && yearNum <= new Date().getFullYear() &&
        monthNum >= 1 && monthNum <= 12 &&
        dayNum >= 1 && dayNum <= 31) {
      
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      setProfile(prev => ({ ...prev, date_of_birth: formattedDate }));
    }
  };

  const getDateParts = () => {
    if (profile.date_of_birth) {
      const parts = profile.date_of_birth.split('-');
      return {
        year: parts[0] || '',
        month: parts[1] || '',
        day: parts[2] || ''
      };
    }
    return { year: '', month: '', day: '' };
  };

  const renderDatePicker = () => {
    const { year, month, day } = getDateParts();
    const [tempYear, setTempYear] = useState(year);
    const [tempMonth, setTempMonth] = useState(month);
    const [tempDay, setTempDay] = useState(day);

    const handleSaveDate = () => {
      handleDateChange(tempYear, tempMonth, tempDay);
      setShowDatePicker(false);
    };

    return (
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <Text style={styles.datePickerTitle}>Select Birth Date</Text>
            
            <View style={styles.dateInputs}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateInputLabel}>Year</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempYear}
                  onChangeText={setTempYear}
                  placeholder="YYYY"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateInputLabel}>Month</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempMonth}
                  onChangeText={setTempMonth}
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateInputLabel}>Day</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempDay}
                  onChangeText={setTempDay}
                  placeholder="DD"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>

            <View style={styles.datePickerButtons}>
              <TouchableOpacity
                style={[styles.dateButton, styles.cancelDateButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelDateButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.dateButton, styles.saveDateButton]}
                onPress={handleSaveDate}
              >
                <Text style={styles.saveDateButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
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
        key === 'date_of_birth' ? (
          // Special handling for date picker
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.datePickerText, !profile[key] && styles.placeholderText]}>
              {profile[key] ? formatDate(profile[key]) : placeholder}
            </Text>
            <Calendar color="#6B7280" size={16} />
          </TouchableOpacity>
        ) : (
          <TextInput
            style={[styles.input, multiline && styles.textArea]}
            value={profile[key]}
            onChangeText={(text) => setProfile(prev => ({ ...prev, [key]: text }))}
            placeholder={placeholder}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            editable={key !== 'email'} // Email is not editable
          />
        )
      ) : (
        <Text style={[styles.fieldValue, !profile[key] && styles.emptyValue]}>
          {key === 'date_of_birth' && profile[key] 
            ? formatDate(profile[key])
            : profile[key] || `No ${label.toLowerCase()} set`
          }
        </Text>
      )}
    </View>
  );

  if (!user?.id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading user session...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

      {/* Date Picker Modal */}
      {renderDatePicker()}
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  datePickerText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
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
  // Date picker modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  datePickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDateButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelDateButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  saveDateButton: {
    backgroundColor: '#2563EB',
  },
  saveDateButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
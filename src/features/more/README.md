# More Feature - User Profile & Settings Management

## Overview
The More feature provides comprehensive user profile management, app settings, privacy controls, help resources, and data export functionality. This feature follows the Scope Rule Pattern with each sub-feature organized in its own directory.

## Feature Structure

### 📁 Directory Organization
```
src/features/more/
├── screens/
│   └── MoreScreen.tsx           # Main More screen with navigation menu
├── profile/
│   └── ProfileScreen.tsx        # User profile management
├── settings/
│   └── SettingsScreen.tsx       # App preferences and settings
├── privacy-security/
│   └── PrivacySecurityScreen.tsx # Privacy settings and security info
├── help-support/
│   └── HelpSupportScreen.tsx     # Customer support and help resources
├── data-export/
│   └── DataExportScreen.tsx      # Data export functionality
├── index.ts                     # Feature exports
└── README.md                    # This documentation
```

## Implemented Screens

### 1. More Screen (`MoreScreen.tsx`)
**Purpose**: Main navigation hub for all More features
- User profile display with avatar and basic info
- Menu items for all sub-features
- Premium/subscription status integration
- Sign out functionality
- Version information

### 2. Profile Screen (`ProfileScreen.tsx`)
**Purpose**: Comprehensive user profile management
- **Database Integration**: Full CRUD operations with Supabase `profiles` table
- **Edit Mode**: Toggle between view and edit modes
- **Form Validation**: Email format validation and required field checks
- **Profile Fields**:
  - First Name & Last Name
  - Email (read-only, from auth)
  - Phone Number
  - Date of Birth
  - Address (Street, City, State, Country, Postal Code)
  - Bio/Notes

### 3. Settings Screen (`SettingsScreen.tsx`)
**Purpose**: App preferences and configuration
- **Preferences Section**:
  - Push Notifications toggle
  - Dark Mode toggle (UI prepared for future implementation)
  - Currency selection (USD, EUR, GBP, CAD, AUD, JPY)
  - Language selection (EN, ES, FR, DE, IT, PT)
- **Security Section**:
  - Biometric Authentication (placeholder for future implementation)
  - Auto Backup toggle
- **Advanced Section**:
  - Clear App Data functionality

### 4. Privacy & Security Screen (`PrivacySecurityScreen.tsx`)
**Purpose**: Privacy settings and security information
- **Security Status**: Visual indicators for encryption, authentication, and data protection
- **Privacy Controls**: Account deletion and data export links
- **Legal & Policies**: Links to privacy policy, terms of service, and support contact
- **Educational Content**: Information about data security and privacy practices

### 5. Help & Support Screen (`HelpSupportScreen.tsx`)
**Purpose**: Customer support and help resources
- **Contact Options**: Email, live chat (coming soon), and phone support
- **Quick Message**: Direct message composition with email integration
- **FAQ Section**: Expandable FAQ with common questions and answers
- **Additional Resources**: Links to user guide and video tutorials
- **Interactive Elements**: FAQ expansion, message composition, and external link handling

### 6. Data Export Screen (`DataExportScreen.tsx`)
**Purpose**: Financial data export functionality
- **Export Options**:
  - Transactions (CSV)
  - Accounts (CSV)
  - Budgets (CSV)
  - Goals (CSV)
  - Complete Backup (JSON)
- **Export Process**: Simulated data preparation with loading states
- **Security Notices**: Privacy and security guidelines for exported data
- **Format Information**: Detailed descriptions of CSV vs JSON formats

## Navigation Integration

### Route Definitions
All More screens are integrated into the app's navigation system:

```typescript
// In navigation/types.ts
export type RootStackParamList = {
  // ... other routes
  Profile: undefined;
  Settings: undefined;
  PrivacySecurity: undefined;
  HelpSupport: undefined;
  DataExport: undefined;
};
```

### Navigation Flow
```
More Screen
├── Profile → ProfileScreen (modal)
├── Settings → SettingsScreen (modal)
├── Privacy & Security → PrivacySecurityScreen (modal)
├── Help & Support → HelpSupportScreen (modal)
└── Export Data → DataExportScreen (modal, premium only)
```

## Technical Implementation

### Database Schema
The Profile feature integrates with the Supabase `profiles` table:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_country TEXT,
  address_postal_code TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Features

#### Real-time Data Synchronization
- Profile data is loaded from Supabase on screen focus
- Changes are immediately persisted to the database
- Error handling for network and validation issues

#### Premium Feature Integration
- Data Export is restricted to premium users
- Non-premium users are redirected to upgrade flow
- Premium status is checked before allowing access

#### User Experience
- Loading states for all async operations
- Form validation with user-friendly error messages
- Consistent UI patterns across all screens
- Accessibility considerations with proper labels and navigation

#### Security Considerations
- Profile updates require authentication
- Data export includes privacy warnings
- Sensitive operations show confirmation dialogs

## Usage Examples

### Navigating to Profile
```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('Profile');
```

### Checking Premium Status
```typescript
import { useAuth } from '@/shared/hooks/useAuth';

const { isPremium } = useAuth();
if (isPremium) {
  navigation.navigate('DataExport');
} else {
  // Show upgrade prompt
}
```

## Future Enhancements

### Planned Features
- **Biometric Authentication**: TouchID/FaceID integration
- **Dark Mode**: Full theme system implementation
- **Push Notifications**: Firebase/Expo notifications setup
- **Live Chat**: Customer support chat integration
- **Data Export**: Real file generation and sharing
- **Account Deletion**: Complete user data removal flow

### Technical Improvements
- **Offline Support**: Local storage for settings and profile data
- **Data Validation**: Enhanced form validation with Yup/Joi
- **File Handling**: expo-file-system integration for data export
- **Localization**: Multi-language support for all text content

## Dependencies
- **Core**: React Native, TypeScript, React Navigation
- **UI**: Lucide React Native (icons), React Native Safe Area Context
- **Data**: Supabase (profiles table, authentication)
- **Utilities**: React Hooks for state management

This More feature provides a comprehensive user management experience while maintaining the app's architectural patterns and design consistency.
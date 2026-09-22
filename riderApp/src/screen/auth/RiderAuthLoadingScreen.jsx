import React, { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, Alert, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRiderProfile } from '../../api/riderApi';

export default function RiderAuthLoadingScreen({ navigation }) {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('riderToken');
      console.log(
        '🔑 Token from storage:',
        token ? '✅ Present' : '❌ Missing',
      );

      if (!token) {
        console.log('➡️ No token, navigating to RiderWelcome');
        navigation.reset({ index: 0, routes: [{ name: 'RiderWelcome' }] });
        return;
      }

      console.log('📡 Fetching rider profile...');
      const res = await getRiderProfile();
      const rider = res?.data?.rider;

      if (!rider) {
        console.warn('⚠️ Token exists but no rider data. Clearing token.');
        await AsyncStorage.removeItem('riderToken');
        navigation.reset({ index: 0, routes: [{ name: 'RiderWelcome' }] });
        return;
      }

      console.log('👤 Rider:', rider._id, 'Status:', rider.approvalStatus);

      const { approvalStatus, _id } = rider;

      if (approvalStatus === 'rejected') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'RiderRejected', params: { riderId: _id } }],
        });
      } else if (approvalStatus === 'pending') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'RiderPendingApproval', params: { riderId: _id } }],
        });
      } else if (approvalStatus === 'approved') {
        const isProfileComplete =
          rider.firstName && rider.lastName && rider.email;
        if (!isProfileComplete) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'RiderCreateProfile', params: { riderId: _id } }],
          });
        } else if (!rider.documentsSubmitted) {
          navigation.reset({
            index: 0,
            routes: [
              { name: 'RiderUploadDocuments', params: { riderId: _id } },
            ],
          });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'RiderTabs' }] });
        }
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'RiderWelcome' }] });
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.warn('🔴 Unauthorized – clearing token');
        await AsyncStorage.removeItem('riderToken');
        navigation.reset({ index: 0, routes: [{ name: 'RiderWelcome' }] });
      } else {
        Alert.alert(
          'Connection Error',
          'Unable to connect to server. Please check your internet connection.',
          [
            { text: 'Retry', onPress: () => checkAuth() },
            {
              text: 'Logout',
              onPress: async () => {
                await AsyncStorage.removeItem('riderToken');
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'RiderWelcome' }],
                });
              },
            },
          ],
        );
      }
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fef9f5',
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fef9f5" />
      <ActivityIndicator size="large" color="#f25a22" />
      <Text style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>
        Checking your session...
      </Text>
    </View>
  );
}

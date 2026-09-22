import React from 'react';

import AddressesScreen from '../screens/profile/AddressesScreen';
import PaymentsScreen from '../screens/profile/PaymentsScreen';
import CouponsScreen from '../screens/profile/CouponsScreen';
import FavouritesScreen from '../screens/profile/FavouritesScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import PrivacySecurityScreen from '../screens/profile/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import AboutKhaoJiScreen from '../screens/profile/AboutKhaoJiScreen';
import PersonalInformationScreen from '../screens/profile/PersonalInformationScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import CartScreen from '../screens/CartScreen';

/**
 * Root Stack mein:
 *
 * {PROFILE_STACK_SCREENS.map(screen => (
 *   <Stack.Screen
 *     key={screen.name}
 *     name={screen.name}
 *     component={screen.component}
 *     options={{ animation: 'slide_from_right' }}
 *   />
 * ))}
 */
export const PROFILE_STACK_SCREENS = [
  { name: 'Addresses', component: AddressesScreen },
  { name: 'Payments', component: PaymentsScreen },
  { name: 'Coupons', component: CouponsScreen },
  { name: 'Favourites', component: FavouritesScreen },
  { name: 'Notifications', component: NotificationsScreen },
  { name: 'PrivacySecurity', component: PrivacySecurityScreen },
  { name: 'HelpSupport', component: HelpSupportScreen },
  { name: 'AboutFoodMitra', component: AboutKhaoJiScreen },
  { name: 'PersonalInformation', component: PersonalInformationScreen },
  { name: 'Settings', component: SettingsScreen },
  { name: 'Cart', component: CartScreen },
];

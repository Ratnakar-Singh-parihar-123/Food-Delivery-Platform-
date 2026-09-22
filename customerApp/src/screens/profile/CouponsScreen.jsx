import React from 'react';
import BasicListScreen from './BasicListScreen';

const COUPONS = [
  {
    id: 'welcome',
    icon: 'ticket-outline',
    title: 'WELCOME100',
    subtitle: '₹100 off on orders above ₹299',
    badge: 'VALID TODAY',
  },
  {
    id: 'free-delivery',
    icon: 'bicycle-outline',
    title: 'FREEDEL',
    subtitle: 'Free delivery on selected restaurants',
    badge: '3 DAYS LEFT',
  },
];

export default function CouponsScreen({ navigation }) {
  return (
    <BasicListScreen
      navigation={navigation}
      title="Coupons"
      subtitle="Offers jo aapke liye available hain"
      items={COUPONS}
    />
  );
}

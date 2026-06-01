import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';

const MY_DEMANDS = [
  {
    id: 'PD001',
    title: 'Premium Wheat',
    price: 'PKR 4,000',
    unit: '/40kg',
    mills: 3,
    qty: '200 Bags',
    date: 'Mar 28',
    status: 'Fresh',
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80',
    fallback: '#C29A4A',
  },
  {
    id: 'PD002',
    title: 'IRRI-6 Rice',
    price: 'PKR 4,200',
    unit: '/40kg',
    mills: 2,
    qty: '80 Bags',
    date: 'Apr 2',
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
  },
  {
    id: 'PD003',
    title: 'Desi Cotton',
    price: 'PKR 8,500',
    unit: '/40kg',
    mills: 1,
    qty: '50 Bags',
    date: 'Apr 5',
    status: 'Fresh',
    image:
      'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&q=80',
    fallback: '#D8D6C7',
  },
  {
    id: 'PD004',
    title: 'Yellow Maize',
    price: 'PKR 1,900',
    unit: '/40kg',
    mills: 2,
    qty: '300 Bags',
    date: 'Apr 8',
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80',
    fallback: '#DCA640',
  },
];

const MY_OFFERS = [
  {
    id: 'PO001',
    title: 'Basmati Rice',
    price: 'PKR 4,150',
    unit: '/40kg',
    mills: 2,
    qty: '60 Bags',
    date: 'Apr 1',
    status: 'Active',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    fallback: '#8A9A5B',
  },
  {
    id: 'PO002',
    title: 'Mustard Seed',
    price: 'PKR 6,200',
    unit: '/40kg',
    mills: 1,
    qty: '90 Bags',
    date: 'Apr 3',
    status: 'Fresh',
    image:
      'https://images.unsplash.com/photo-1535567465397-7523840f2ae9?w=900&q=80',
    fallback: '#D9A825',
  },
];

const TABS = ['My Demands', 'My Offers'] as const;
type TabType = (typeof TABS)[number];

const statusBadgeStyle = (status: string) => ({
  bg: status === 'Fresh' ? '#E8F7EE' : status === 'Active' ? '#EFF6FF' : '#F3F4F6',
  text: status === 'Fresh' ? '#1A6B34' : status === 'Active' ? '#2563EB' : '#9CA3AF',
});

const PostCard = ({ item, onPress }: any) => {
  const badge = statusBadgeStyle(item.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.88}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.cardImage}
        resizeMode="cover"
        imageStyle={{ backgroundColor: item.fallback }}
      >
        <View style={StyleSheet.absoluteFillObject} className="bg-black/40" />
        <View
          className="absolute bottom-0 left-0 right-0"
          style={styles.imageGradient}
        />
        <View className="absolute bottom-2.5 left-3 right-3">
          <Text
            className="text-white text-[14px] font-extrabold"
            numberOfLines={1}
          >
            {item.title}
          </Text>
        </View>
      </ImageBackground>

      <View className="px-3 pt-2.5 pb-3">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-green-700 text-sm font-extrabold">
            {item.price}
            <Text className="text-gray-400 text-xs font-normal">
              {item.unit}
            </Text>
          </Text>
          <Text className="text-gray-500 text-xs">
            {item.mills} {item.mills === 1 ? 'mill' : 'mills'}
          </Text>
        </View>

        <View className="flex-row items-center flex-wrap" style={{ gap: 6 }}>
          <View className="flex-row items-center bg-gray-100 rounded-full px-2.5 py-1" style={{ gap: 4 }}>
            <AppIcon name="listing" size={10} color="#6B7280" />
            <Text className="text-gray-500 text-[10px] font-semibold">
              {item.qty}
            </Text>
          </View>

          <View className="flex-row items-center bg-gray-100 rounded-full px-2.5 py-1" style={{ gap: 4 }}>
            <Text className="text-gray-500 text-[10px] font-semibold">
              Posted {item.date}
            </Text>
          </View>

          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: badge.bg }}
          >
            <Text
              className="text-[10px] font-bold"
              style={{ color: badge.text }}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MyPostsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<TabType>('My Demands');
  const data = activeTab === 'My Demands' ? MY_DEMANDS : MY_OFFERS;

  return (
    <View className="flex-1 bg-gray-50">
      <View
        style={{
          backgroundColor: '#145228',
          paddingTop: 44,
          paddingBottom: 14,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>
              My Posts
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.53)',
                marginTop: 2,
              }}
            >
              Your demands &amp; offers
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePost')}
            style={styles.newButton}
            activeOpacity={0.82}
          >
            <Text style={{ fontSize: 18, color: '#0D3B1F', lineHeight: 22 }}>
              +
            </Text>
            <Text
              style={{ fontSize: 12, fontWeight: '700', color: '#0D3B1F' }}
            >
              New
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        className="flex-row bg-white"
        style={{ borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 items-center py-3"
              style={{
                borderBottomWidth: 2,
                borderBottomColor: isActive ? '#217A3C' : 'transparent',
              }}
              activeOpacity={0.75}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#1A6B34' : '#6B7280',
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            onPress={() =>
              navigation.navigate('PostDetail', { postId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <View className="items-center pt-16" style={{ gap: 12 }}>
            <Text style={{ fontSize: 40 }}>📋</Text>
            <Text className="text-gray-700 text-base font-bold">
              No posts yet
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              Tap + New to create your first post
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  newButton: {
    backgroundColor: '#F3CD03',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 110,
  },
  imageGradient: {
    height: 50,
    backgroundColor: 'transparent',
  },
});

export default MyPostsScreen;

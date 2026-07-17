import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppIcon } from '../../../assets/icons';
import api from '../../../utils/api';
import {
  OfferCard,
  OfferItem,
  OFFER_STATUS_FILTERS,
  PostCard,
  PostItem,
  STATUS_FILTERS,
  TabKey,
  normalizeOfferItem,
  normalizePostItem,
  sharedStyles,
  usePostsPanel,
} from './postsShared';

interface Props {
  navigation: any;
  initialTab?: string;
}

const SellerPostsTab = ({ navigation, initialTab }: Props) => {
  const [activeTab, setActiveTab] = useState<TabKey>(
    initialTab === 'offers' || initialTab === 'My Offers' ? 'offers' : 'posts',
  );

  const suppliesPanel = usePostsPanel(
    api.seller.ListMyPosts,
    ['supplies', 'posts', 'items', 'listings', 'results'],
    (item, i) => normalizePostItem(item, i, 'seller'),
  );

  const offersPanel = usePostsPanel(
    api.seller.ListMyPostsOffers,
    ['offers', 'items', 'results'],
    (item, i) => normalizeOfferItem(item, i, 'seller'),
  );

  // Load both panels on screen focus — each panel has a stable `fetch` so
  // this only re-runs on actual screen focus/unfocus, not on tab switches.
  useFocusEffect(
    useCallback(() => {
      suppliesPanel.fetch(1);
      offersPanel.fetch(1);
    }, [suppliesPanel.fetch, offersPanel.fetch]),
  );

  const renderSupply = ({ item }: { item: PostItem | OfferItem }) => (
    <PostCard
      item={item as PostItem}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id, mode: 'seller' })}
    />
  );

  const renderOffer = ({ item }: { item: PostItem | OfferItem }) => (
    <OfferCard
      item={item as OfferItem}
      onPress={() => navigation.navigate('OfferDetail', { offerId: item.id, mode: 'seller' })}
    />
  );

  return (
    <>
      <View style={sharedStyles.tabBar}>
        {([
          { key: 'posts' as TabKey, label: 'My Supplies' },
          { key: 'offers' as TabKey, label: 'My Offers' },
        ] as const).map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[sharedStyles.tabItem, isActive && sharedStyles.tabItemActive]}
              activeOpacity={0.75}
            >
              <Text style={[sharedStyles.tabLabel, isActive && sharedStyles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Supplies panel — kept mounted to preserve data when switching tabs */}
      <View style={[sharedStyles.panel, activeTab !== 'posts' && sharedStyles.panelHidden]}>
        <PanelControls
          search={suppliesPanel.search}
          onSearchChange={suppliesPanel.setSearch}
          status={suppliesPanel.status}
          onStatusChange={suppliesPanel.setStatus}
          placeholder="Search supplies"
          statusFilters={STATUS_FILTERS}
        />
        <FlatList
          data={suppliesPanel.items}
          keyExtractor={i => i.id}
          contentContainerStyle={sharedStyles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderSupply}
          onEndReached={suppliesPanel.loadMore}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl
              refreshing={suppliesPanel.refreshing}
              onRefresh={() => suppliesPanel.fetch(1, false, true)}
              tintColor="#217A3C"
            />
          }
          ListFooterComponent={
            suppliesPanel.loadingMore ? (
              <View style={sharedStyles.footerLoading}>
                <ActivityIndicator color="#217A3C" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              loading={suppliesPanel.loading}
              hasLoadedOnce={suppliesPanel.hasLoadedOnce}
              error={suppliesPanel.error}
              emptyTitle="No supplies yet"
              emptySub="Tap New to create your first supply"
              loadingTitle="Loading supplies..."
            />
          }
        />
      </View>

      {/* Offers panel — kept mounted to preserve data when switching tabs */}
      <View style={[sharedStyles.panel, activeTab !== 'offers' && sharedStyles.panelHidden]}>
        <PanelControls
          search={offersPanel.search}
          onSearchChange={offersPanel.setSearch}
          status={offersPanel.status}
          onStatusChange={offersPanel.setStatus}
          placeholder="Search offers"
          statusFilters={OFFER_STATUS_FILTERS}
        />
        <FlatList
          data={offersPanel.items}
          keyExtractor={i => i.id}
          contentContainerStyle={sharedStyles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderOffer}
          onEndReached={offersPanel.loadMore}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl
              refreshing={offersPanel.refreshing}
              onRefresh={() => offersPanel.fetch(1, false, true)}
              tintColor="#217A3C"
            />
          }
          ListFooterComponent={
            offersPanel.loadingMore ? (
              <View style={sharedStyles.footerLoading}>
                <ActivityIndicator color="#217A3C" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              loading={offersPanel.loading}
              hasLoadedOnce={offersPanel.hasLoadedOnce}
              error={offersPanel.error}
              emptyTitle="No offers yet"
              emptySub="Offer updates will show here"
              loadingTitle="Loading offers..."
            />
          }
        />
      </View>
    </>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const PanelControls = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  placeholder,
  statusFilters,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  placeholder: string;
  statusFilters: { label: string; value: string }[];
}) => (
  <View style={sharedStyles.controls}>
    <View style={sharedStyles.searchBox}>
      <AppIcon name="search" size={15} color="#9CA3AF" />
      <TextInput
        value={search}
        onChangeText={onSearchChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={sharedStyles.searchInput}
      />
    </View>
    <FlatList
      horizontal
      data={statusFilters}
      keyExtractor={i => i.value}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={sharedStyles.statusFilterList}
      renderItem={({ item }) => {
        const active = status === item.value;
        return (
          <TouchableOpacity
            onPress={() => onStatusChange(item.value)}
            style={[
              sharedStyles.statusFilterChip,
              active && sharedStyles.statusFilterChipActive,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                sharedStyles.statusFilterText,
                active && sharedStyles.statusFilterTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  </View>
);

const EmptyState = ({
  loading,
  hasLoadedOnce,
  error,
  emptyTitle,
  emptySub,
  loadingTitle,
}: {
  loading: boolean;
  hasLoadedOnce: boolean;
  error: string;
  emptyTitle: string;
  emptySub: string;
  loadingTitle: string;
}) => {
  if (loading && !hasLoadedOnce) {
    return (
      <View style={sharedStyles.empty}>
        <ActivityIndicator color="#217A3C" />
        <Text style={sharedStyles.emptyTitle}>{loadingTitle}</Text>
      </View>
    );
  }
  return (
    <View style={sharedStyles.empty}>
      <AppIcon
        name={error ? 'notificationWarning' : 'tabPost'}
        size={40}
        color={error ? '#D97706' : '#9CA3AF'}
      />
      <Text style={sharedStyles.emptyTitle}>{error || emptyTitle}</Text>
      <Text style={sharedStyles.emptySub}>{error ? '' : emptySub}</Text>
    </View>
  );
};

export default SellerPostsTab;

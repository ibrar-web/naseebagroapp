import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { showAlert, showConfirm } from '../../components/toastConfig';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { AppIcon } from '../../../assets/icons';
import MockStatusBar from '../../components/MockStatusBar';
import { useAppSelector } from '../../../store';
import api from '../../../utils/api';
import { AppLoader } from '../../components';
import { OfferCard, OfferItem, normalizeOfferItem } from '../components/postsShared';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;
type AppMode = 'buyer' | 'seller';

// ─── Types (mirror API shape) ────────────────────────────────────────────────

type DetailRow = {
  key: string;
  label: string;
  value: string;
  value_color?: string;
  is_highlighted?: boolean;
};

type MillItem = {
  id: string;
  mill: { name: string; location_label: string };
  price_display: string;
  price_unit_label: string;
  requested_quantity_label: string;
};

type StatCard = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type MenuOption = {
  key: string;
  label: string;
  enabled: boolean;
};

type PostEditData = {
  category_id: string | null;
  category_name: string | null;
  commodity_id: string | null;
  quantity: string | null;
  price_per_unit: string | null;
  delivery_option: string | null;
  city_id: string | null;
  city_name: string | null;
  delivery_term_id: string | null;
  payment_type: string | null;
  payment_term_id: string | null;
  grades: string[];
  is_mill_based: boolean;
  mills: Array<{ id: string | null; name: string | null; city: string | null; price: string }>;
};

type PostDetail = {
  id: string;
  code: string;
  status: string;
  status_color: string;
  is_active: boolean;
  hero: { image_url: string; code: string; title: string; subtitle: string };
  tabs: Array<{ key: string; label: string; is_active: boolean }>;
  post_details: { title: string; rows: DetailRow[] };
  buyer_notes: { title: string; body: string | null; has_content: boolean };
  price_freshness: { show_warning: boolean; hours_since_update: number };
  mills_specified: { title: string; has_mills: boolean; mills: MillItem[] };
  offers_received: { stats: { title_cards: StatCard[] }; items: OfferItem[] };
  actions: { menu_options: MenuOption[] };
  fallback: string;
  edit_data: PostEditData | null;
  rejection_reason: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FALLBACK_COLORS = ['#8A9A5B', '#C29A4A', '#D8D6C7', '#DCA640'];

const firstValue = (...values: any[]) =>
  values.find(v => v !== undefined && v !== null && v !== '');

const stringify = (value: any, fallback = '') => {
  const resolved = firstValue(value);
  return resolved === undefined ? fallback : String(resolved);
};

const normalizePostDetail = (
  response: any,
  id: string,
  mode: AppMode,
): PostDetail | null => {
  const root = response?.status && response?.data ? response.data : response ?? {};
  const payload = root?.id ? root : root?.data ?? root;
  if (!payload || typeof payload !== 'object') return null;

  const offerItems = Array.isArray(payload.offers_received?.items)
    ? payload.offers_received.items.map((o: any, i: number) => normalizeOfferItem(o, i, mode))
    : [];

  return {
    id: stringify(firstValue(payload.id, payload.post_id, payload.demand_id), id),
    code: stringify(firstValue(payload.code, payload.post_code, payload.demand_code), id),
    status: stringify(firstValue(payload.status, payload.status_label), 'PENDING'),
    status_color: stringify(payload.status_color, 'green'),
    is_active: payload.is_active !== false,
    hero: {
      image_url:
        firstValue(payload.hero?.image_url, payload.commodity_image, payload.image_url) ?? '',
      code: stringify(firstValue(payload.hero?.code, payload.code), ''),
      title: stringify(
        firstValue(
          payload.hero?.title, payload.title, payload.commodity_name, payload.name,
        ),
        mode === 'buyer' ? 'Demand' : 'Supply',
      ),
      subtitle: stringify(firstValue(payload.hero?.subtitle, payload.subtitle), ''),
    },
    tabs: Array.isArray(payload.tabs)
      ? payload.tabs
      : [
          { key: 'post_details', label: 'Post Details', is_active: true },
          { key: 'offers_received', label: 'Offers Received (0)', is_active: false },
        ],
    post_details: {
      title: stringify(
        payload.post_details?.title,
        mode === 'buyer' ? 'DEMAND DETAILS' : 'SUPPLY DETAILS',
      ),
      rows: Array.isArray(payload.post_details?.rows) ? payload.post_details.rows : [],
    },
    buyer_notes: {
      title: stringify(payload.buyer_notes?.title, 'BUYER NOTES'),
      body: payload.buyer_notes?.body ?? null,
      has_content: !!payload.buyer_notes?.has_content,
    },
    price_freshness: {
      show_warning: !!payload.price_freshness?.show_warning,
      hours_since_update: payload.price_freshness?.hours_since_update ?? 0,
    },
    mills_specified: {
      title: stringify(payload.mills_specified?.title, 'Mills Specified'),
      has_mills: !!payload.mills_specified?.has_mills,
      mills: Array.isArray(payload.mills_specified?.mills)
        ? payload.mills_specified.mills
        : [],
    },
    offers_received: {
      stats: {
        title_cards: Array.isArray(payload.offers_received?.stats?.title_cards)
          ? payload.offers_received.stats.title_cards
          : [],
      },
      items: offerItems,
    },
    actions: {
      menu_options: Array.isArray(payload.actions?.menu_options)
        ? payload.actions.menu_options
        : [],
    },
    fallback: FALLBACK_COLORS[0],
    edit_data: payload.edit_data ?? null,
    rejection_reason: payload.rejection_reason ?? null,
  };
};

// ─── Config helpers ───────────────────────────────────────────────────────────

const statusBadgeConfig = (color: string): { bg: string } => {
  if (color === 'amber' || color === 'orange' || color === 'yellow') return { bg: '#D97706' };
  if (color === 'red')   return { bg: '#EF4444' };
  if (color === 'gray')  return { bg: '#6B7280' };
  return { bg: '#217A3C' };
};

const statCardColors = (color: string) => {
  if (color === 'blue') return { bg: '#EEF6FF', text: '#3B82F6' };
  if (color === 'green') return { bg: '#E8F7EE', text: '#1A6B34' };
  if (color === 'red') return { bg: '#FEE2E2', text: '#EF4444' };
  return { bg: '#F9FAFB', text: '#374151' };
};

const rowValueColor = (valueColor?: string, isHighlighted?: boolean) => {
  if (isHighlighted || valueColor === 'green') return '#1A6B34';
  if (valueColor === 'red') return '#EF4444';
  if (valueColor === 'orange') return '#D97706';
  return '#111827';
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const PostDetailScreen = ({ navigation, route }: Props) => {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const currentMode = useAppSelector(s => s.app.mode) as AppMode;
  const { postId, post_type } = route.params;
  // post_type takes priority (set by notifications) — avoids wrong API call
  // when the user's in-app mode toggle doesn't match the post type.
  const isBuyer = post_type
    ? post_type === 'demand'
    : (route.params.mode ?? currentMode) === 'buyer';
  const mode: AppMode = isBuyer ? 'buyer' : 'seller';

  const [post, setPost] = useState<PostDetail | null>(null);
  const [activeTab, setActiveTab] = useState<string>('post_details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) { navigation.goBack(); return; }
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Post', params: { initialTab: 'posts' } } }],
      }),
    );
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = isBuyer
          ? await api.buyer.myDemandDetails(postId)
          : await api.seller.myPostDetails(postId);
        console.log('[PostDetail] API response:', JSON.stringify(response, null, 2));
        const normalized = normalizePostDetail(response, postId, mode);
        if (active && normalized) {
          setPost(normalized);
          const initialActive = normalized.tabs.find(t => t.is_active)?.key ?? 'post_details';
          setActiveTab(initialActive);
        }
      } catch (err) {
        console.log('[PostDetail] load error', err);
        if (active && (err as any)?.code !== 'AUTH_REQUIRED') {
          setError('Unable to load post details.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [isBuyer, mode, postId]);

  if (loading && !post) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <ActivityIndicator color="#217A3C" size="large" />
        <Text style={styles.stateText}>Loading post details...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.stateScreen}>
        <MockStatusBar backgroundColor="#F9FAFB" textColor="#111827" />
        <AppIcon name="notificationWarning" size={34} color="#D97706" />
        <Text style={styles.stateText}>{error || 'Post details not found.'}</Text>
        <TouchableOpacity style={styles.stateButton} onPress={goBack} activeOpacity={0.85}>
          <Text style={styles.stateButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleMenuAction = async (option: MenuOption) => {
    setMenuOpen(false);

    if (option.key === 'edit') {
      if (!option.enabled) {
        showAlert('info', 'Cannot Edit', 'This post has active offers and cannot be edited.');
        return;
      }
      const ed = post.edit_data;
      if (!ed?.category_id) {
        showAlert('error', 'Error', 'Post data is still loading. Please go back and reopen this post.');
        return;
      }
      const categoryData = { id: ed.category_id, name: ed.category_name ?? '' };
      const prefillData = {
        commodity_id: ed.commodity_id,
        quantity: ed.quantity,
        price_per_unit: ed.price_per_unit,
        delivery_option: ed.delivery_option,
        city_id: ed.city_id,
        city_name: ed.city_name,
        delivery_term_id: ed.delivery_term_id,
        payment_type: ed.payment_type,
        payment_term_id: ed.payment_term_id,
        grades: ed.grades,
        is_mill_based: ed.is_mill_based,
        mills: ed.mills,
      };
      if (isBuyer) {
        navigation.navigate('CreateBuyerDemand', {
          category: ed.category_name ?? '',
          categoryData,
          prefillData,
          postId: post.id,
        });
      } else {
        navigation.navigate('CreatePostSeller', {
          category: ed.category_name ?? '',
          categoryData,
          prefillData,
          postId: post.id,
        });
      }
      return;
    }

    if (option.key === 'toggle_active') {
      setActionLoading(true);
      try {
        if (isBuyer) {
          await api.buyer.toggleDemandActive(post.id);
        } else {
          await api.seller.toggleSupplyActive(post.id);
        }
        // reload while loader is still visible so badge updates atomically
        const response = isBuyer
          ? await api.buyer.myDemandDetails(post.id)
          : await api.seller.myPostDetails(post.id);
        const normalized = normalizePostDetail(response, post.id, mode);
        if (normalized) setPost(normalized);
      } catch {
        showAlert('error', 'Error', 'Unable to update post status. Please try again.');
      } finally {
        setActionLoading(false);
      }
      return;
    }

    if (option.key === 'delete') {
      if (!option.enabled) {
        showAlert('info', 'Cannot Delete', 'This post has active offers and cannot be deleted.');
        return;
      }
      showConfirm('warning', 'Delete Post', 'Are you sure you want to delete this post? This cannot be undone.', async () => {
        setActionLoading(true);
        try {
          if (isBuyer) {
            await api.buyer.deleteDemand(post.id);
          } else {
            await api.seller.deleteSupply(post.id);
          }
          goBack();
        } catch {
          showAlert('error', 'Error', 'Unable to delete post. Please try again.');
        } finally {
          setActionLoading(false);
        }
      });
    }
  };

  const badge = statusBadgeConfig(post.status_color);
  const activeBg = post.is_active ? 'rgba(33,122,60,0.85)' : 'rgba(75,85,99,0.85)';
  const editOption = post.actions.menu_options.find(o => o.key === 'edit');
  const deleteOption = post.actions.menu_options.find(o => o.key === 'delete');
  const closeOption = post.actions.menu_options.find(o => o.key === 'close');

  // ── Post Details tab ────────────────────────────────────────────────────────
  const renderPostDetails = () => (
    <View>
      {/* Rejection reason banner */}
      {post.status.toUpperCase() === 'REJECTED' && post.rejection_reason ? (
        <View style={styles.rejectionCard}>
          <AppIcon name="notificationWarning" size={16} color="#991B1B" />
          <View style={styles.rejectionContent}>
            <Text style={styles.rejectionTitle}>Post Rejected</Text>
            <Text style={styles.rejectionBody}>{post.rejection_reason}</Text>
          </View>
        </View>
      ) : null}

      {/* Detail rows card */}
      {post.post_details.rows.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{post.post_details.title}</Text>
          {post.post_details.rows.map((row, i) => {
            const isLast = i === post.post_details.rows.length - 1;
            const vColor = rowValueColor(row.value_color, row.is_highlighted);
            const isMono = row.key === 'demand_id' || row.key === 'supply_id' || row.key === 'post_id';
            return (
              <View key={row.key} style={[styles.detailRow, isLast && styles.detailRowLast]}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text
                  style={[
                    styles.detailValue,
                    row.is_highlighted ? styles.detailValueHighlighted : styles.detailValueNormal,
                    { color: vColor },
                    isMono && styles.monoText,
                  ]}
                >
                  {row.value}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Buyer / seller notes */}
      {post.buyer_notes.has_content && post.buyer_notes.body ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{post.buyer_notes.title}</Text>
          <Text style={styles.notesText}>{post.buyer_notes.body}</Text>
        </View>
      ) : null}

      {/* Price freshness warning */}
      {post.price_freshness.show_warning && (
        <View style={styles.warningCard}>
          <View style={styles.warningIconBox}>
            <AppIcon name="notificationWarning" size={17} color="#92400E" />
          </View>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Target Price May Be Outdated</Text>
            <Text style={styles.warningBody}>
              Your target price was last updated{' '}
              <Text style={styles.warningBodyBold}>
                {post.price_freshness.hours_since_update} hour
                {post.price_freshness.hours_since_update !== 1 ? 's' : ''} ago
              </Text>
              . Refresh your price so sellers can send accurate offers.
            </Text>
            <TouchableOpacity style={styles.warningBtn} activeOpacity={0.85}>
              <Text style={styles.warningBtnText}>Update Price</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Mills specified */}
      {post.mills_specified.has_mills && post.mills_specified.mills.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitleDark}>{post.mills_specified.title}</Text>
          {post.mills_specified.mills.map((m, i) => {
            const isLast = i === post.mills_specified.mills.length - 1;
            return (
              <View key={m.id} style={[styles.millRow, isLast && styles.millRowLast]}>
                <View style={styles.millIconBox}>
                  <AppIcon name="business" size={16} color="#217A3C" />
                </View>
                <View style={styles.millInfo}>
                  <Text style={styles.millName}>{m.mill.name}</Text>
                  <View style={styles.millLocationRow}>
                    <AppIcon name="pin" size={10} color="#9CA3AF" />
                    <Text style={styles.millLocation}>{m.mill.location_label}</Text>
                  </View>
                </View>
                <View style={styles.millPriceCol}>
                  <Text style={styles.millPrice}>
                    {m.price_display}
                    <Text style={styles.millPriceUnit}>{m.price_unit_label}</Text>
                  </Text>
                  <Text style={styles.millQty}>{m.requested_quantity_label}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  // ── Offers tab ──────────────────────────────────────────────────────────────
  const renderOffers = () => (
    <View>
      {post.offers_received.stats.title_cards.length > 0 && (
        <View style={styles.statsRow}>
          {post.offers_received.stats.title_cards.map(card => {
            const c = statCardColors(card.color);
            return (
              <View key={card.key} style={[styles.statCard, { backgroundColor: c.bg }]}>
                <Text style={[styles.statValue, { color: c.text }]}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </View>
            );
          })}
        </View>
      )}

      {post.offers_received.items.length === 0 ? (
        <View style={styles.emptyState}>
          <AppIcon name="notificationOffers" size={34} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No offers yet</Text>
          <Text style={styles.emptySub}>Offers related to this post will show here.</Text>
        </View>
      ) : (
        <View style={styles.offerList}>
          {post.offers_received.items.map(offer => (
            <OfferCard
              key={offer.id}
              item={offer}
              onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id, mode })}
            />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <MockStatusBar absolute backgroundColor="transparent" textColor="#FFFFFF" />
        <ImageBackground
          source={{ uri: post.hero.image_url || undefined }}
          style={styles.heroImage}
          resizeMode="cover"
          imageStyle={{ backgroundColor: post.fallback }}
        >
          <View style={styles.heroOverlay} />

          <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.85}>
            <AppIcon name="back" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.heroActions}>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{post.status.toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: activeBg }]}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{post.is_active ? 'ACTIVE' : 'INACTIVE'}</Text>
            </View>
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={() => setMenuOpen(true)}
              activeOpacity={0.75}
            >
              <AppIcon name="menuMore" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroBottom}>
            <Text style={styles.heroCode}>{post.hero.code}</Text>
            <Text style={styles.heroTitle}>{post.hero.title}</Text>
            {post.hero.subtitle ? (
              <Text style={styles.heroSubtitle}>{post.hero.subtitle}</Text>
            ) : null}
          </View>
        </ImageBackground>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {post.tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'post_details' ? renderPostDetails() : renderOffers()}
      </ScrollView>

      {/* Bottom bar */}
      {(editOption?.enabled || closeOption?.enabled) && (
        <View style={styles.bottomBar}>
          {editOption?.enabled ? (
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.85}
              disabled={actionLoading}
              onPress={() => handleMenuAction(editOption)}
            >
              <Text style={styles.editBtnText}>{editOption.label}</Text>
            </TouchableOpacity>
          ) : null}
          {closeOption?.enabled ? (
            <TouchableOpacity
              style={styles.closeBtn}
              activeOpacity={0.85}
              disabled={actionLoading}
              onPress={() => handleMenuAction(closeOption)}
            >
              <Text style={styles.closeBtnText}>{closeOption.label}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Menu dropdown via Modal */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="none"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={[styles.menuBackdrop, { width: screenW, height: screenH }]}
          onPress={() => setMenuOpen(false)}
          activeOpacity={1}
        >
          <View style={styles.menuSheet}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.75}
              disabled={actionLoading}
              onPress={() => handleMenuAction(editOption ?? { key: 'edit', label: isBuyer ? 'Edit Demand' : 'Edit Supply', enabled: false })}
            >
              <AppIcon name="edit" size={15} color="#374151" />
              <Text style={[styles.menuItemText, !editOption?.enabled && styles.menuItemTextDisabled]}>
                {isBuyer ? 'Edit Demand' : 'Edit Supply'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder]}
              activeOpacity={0.75}
              disabled={actionLoading}
              onPress={() => handleMenuAction({ key: 'toggle_active', label: '', enabled: true })}
            >
              <AppIcon name="filter" size={15} color="#374151" />
              <Text style={styles.menuItemText}>
                {post.actions.menu_options.find(o => o.key === 'toggle_active')?.label ?? 'Mark as Inactive'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder]}
              activeOpacity={0.75}
              onPress={() => setMenuOpen(false)}
            >
              <AppIcon name="currency" size={15} color="#374151" />
              <Text style={styles.menuItemText}>Refresh Price</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder]}
              activeOpacity={0.75}
              disabled={actionLoading}
              onPress={() => handleMenuAction(deleteOption ?? { key: 'delete', label: isBuyer ? 'Delete Demand' : 'Delete Supply', enabled: false })}
            >
              <AppIcon name="notificationWarning" size={15} color="#EF4444" />
              <Text style={[styles.menuItemText, styles.menuItemTextDestructive]}>
                {isBuyer ? 'Delete Demand' : 'Delete Supply'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <AppLoader visible={actionLoading} overlay message="Updating..." />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  stateScreen: {
    flex: 1, backgroundColor: '#F9FAFB', alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 28, gap: 12,
  },
  stateText: { fontSize: 14, color: '#4B5563', textAlign: 'center', fontWeight: '600' },
  stateButton: {
    marginTop: 4, backgroundColor: '#217A3C', borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  stateButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  // Hero
  hero: { height: 180, flexShrink: 0, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  backBtn: {
    position: 'absolute', top: 44, left: 14, zIndex: 3,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  heroActions: {
    position: 'absolute', top: 44, right: 14, zIndex: 3,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  statusBadge: {
    borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFFFFF' },
  statusText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  menuBtn: {
    width: 32, height: 32, backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  heroBottom: { position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 3 },
  heroCode: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', marginBottom: 3 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  heroSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  // Tabs
  tabBar: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexShrink: 0,
  },
  tabItem: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    borderBottomWidth: 2.5, borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#217A3C' },
  tabLabel: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabLabelActive: { fontWeight: '700', color: '#1A6B34' },
  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 118, gap: 14 },
  // Cards
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#9CA3AF',
    letterSpacing: 0.5, marginBottom: 12,
  },
  cardTitleDark: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 12 },
  // Detail rows
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 12, color: '#6B7280', flex: 1 },
  detailValue: { fontSize: 12, flex: 1, textAlign: 'right' },
  detailValueHighlighted: { fontWeight: '800' },
  detailValueNormal: { fontWeight: '600' },
  monoText: { fontFamily: 'monospace' },
  notesText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  // Price freshness warning
  rejectionCard: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 14, padding: 13, flexDirection: 'row', gap: 11, alignItems: 'flex-start',
    marginBottom: 12,
  },
  rejectionContent: { flex: 1 },
  rejectionTitle: { fontSize: 13, fontWeight: '800', color: '#991B1B', marginBottom: 3 },
  rejectionBody: { fontSize: 12, color: '#B91C1C', lineHeight: 18 },
  warningCard: {
    backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FCD34D',
    borderRadius: 14, padding: 13, flexDirection: 'row', gap: 11, alignItems: 'flex-start',
  },
  warningIconBox: {
    width: 34, height: 34, backgroundColor: '#FDE68A', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  warningContent: { flex: 1 },
  warningTitle: { fontSize: 13, fontWeight: '800', color: '#92400E', marginBottom: 3 },
  warningBody: { fontSize: 12, color: '#B45309', lineHeight: 18 },
  warningBodyBold: { fontWeight: '700' },
  warningBtn: {
    marginTop: 10, paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: '#92400E', borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
  },
  warningBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  // Mills
  millRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  millRowLast: { borderBottomWidth: 0 },
  millIconBox: {
    width: 36, height: 36, backgroundColor: '#F2FBF5', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  millInfo: { flex: 1 },
  millName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  millLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  millLocation: { fontSize: 11, color: '#6B7280' },
  millPriceCol: { alignItems: 'flex-end' },
  millPrice: { fontSize: 14, fontWeight: '900', color: '#1A6B34' },
  millPriceUnit: { fontSize: 11, fontWeight: '500', color: '#6B7280' },
  millQty: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  // Offers tab — stats
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 0 },
  statCard: {
    flex: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 6,
    alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6',
  },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 9, fontWeight: '600', color: '#9CA3AF', marginTop: 2 },
  offerList: { gap: 10 },
  // Offer card
  offerCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden',
    borderWidth: 1.5, shadowColor: '#000', shadowOpacity: 0.07,
    shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  offerCardHeader: {
    paddingHorizontal: 14, paddingVertical: 7,
    flexDirection: 'row', alignItems: 'center', gap: 7,
  },
  offerDot: { width: 6, height: 6, borderRadius: 3 },
  offerStatus: { flex: 1, fontSize: 10, fontWeight: '700' },
  offerTime: { fontSize: 10, color: '#9CA3AF' },
  offerCardBody: { paddingHorizontal: 14, paddingVertical: 12 },
  offerMainRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 10, gap: 10,
  },
  offerLeft: { flex: 1 },
  offerId: { fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', marginBottom: 3 },
  offerMill: { fontSize: 13, fontWeight: '700', color: '#111827' },
  offerPrice: { fontSize: 17, fontWeight: '900', color: '#1A6B34', marginTop: 2 },
  offerRight: { alignItems: 'flex-end', gap: 4 },
  offerQty: { fontSize: 12, color: '#6B7280' },
  offerChipsRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  offerChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F9FAFB', borderRadius: 7, paddingHorizontal: 9,
    paddingVertical: 4, borderWidth: 1, borderColor: '#F3F4F6',
  },
  offerChipText: { fontSize: 11, color: '#4B5563' },
  offerFooter: {
    borderTopWidth: 1, paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  offerPrompt: { fontSize: 11, fontWeight: '600', color: '#1A6B34' },
  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 48, gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#374151' },
  emptySub: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10, backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  editBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#1A6B3499',
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#1A6B34' },
  closeBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#EF444499',
  },
  closeBtnText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
  // Actions menu
  menuBackdrop: {
    backgroundColor: 'transparent',
  },
  menuSheet: {
    position: 'absolute',
    top: 88,
    right: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 185,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  menuItemBorder: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  menuItemText: { fontSize: 13, fontWeight: '600', color: '#374151', flex: 1 },
  menuItemTextDestructive: { color: '#EF4444' },
  menuItemTextDisabled: { opacity: 0.4 },
});

export default PostDetailScreen;

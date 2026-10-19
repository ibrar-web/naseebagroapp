/**
 * Every API the mobile app calls, grouped like the app.
 *
 * Endpoint fields:
 *   id       unique key, used to compare runs
 *   path     relative to the API base; `query` adds params
 *   auth     'none' | 'optional' | 'user'  ('user' tries each AUDIT_USERS account until one has records)
 *   screen   where the app uses it (shown in the report)
 *   list     key under `data` that holds the records (omit to auto-detect); omit entirely for single objects
 *   fields   keys every record (or the object) must have
 *   severity blocker | critical | normal | minor | trivial (defaults to the group's)
 *   details  follow-up calls for the FIRST record: { name, path: record => string, fields, query,
 *            idField (key holding the record id in the detail response, default 'id') }
 *
 * To cover a new API: add an entry here. Nothing else needs to change.
 */

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

export const suite = [
  // ── Auth & session ────────────────────────────────────────────────────────
  {
    group: 'Auth & session',
    severity: 'blocker',
    endpoints: [
      { id: 'auth.me', name: 'Current user', path: 'auth/me', auth: 'user', screen: 'Splash, Profile', fields: ['user.id', 'user.email', 'user.role'] },
    ],
  },

  // ── Home ──────────────────────────────────────────────────────────────────
  {
    group: 'Home',
    severity: 'normal',
    endpoints: [
      {
        id: 'public.featured-categories', name: 'Featured categories', path: 'public/featured-categories', auth: 'optional',
        screen: 'Home > CategorySection', list: 'items', fields: ['id', 'name', 'listings'],
        details: [
          { name: 'Commodities in category', path: () => 'public/commodities', query: r => ({ category_id: r.id }), list: 'items', fields: ['id', 'name'] },
          { name: 'Demand post form for category', path: r => `buyer/forms/demand/${r.id}`, auth: 'user' },
          { name: 'Supply post form for category', path: r => `seller/forms/supply/${r.id}`, auth: 'user' },
        ],
      },
      { id: 'profile.stats', name: 'Home / profile stats', path: 'profile/personal/stats', auth: 'user', screen: 'Home, Profile', fields: ['seller', 'buyer'] },
      {
        id: 'public.market-rates', name: 'Market rates', path: 'public/market-rates', auth: 'none', query: { page: 1, limit: 20 },
        screen: 'Home > MarketRates, Market Rates', list: 'rates', fields: ['id', 'name', 'mill', 'price'],
        details: [{ name: 'Rate history', path: r => `public/market-rates/${r.id}/history` }],
      },
      { id: 'public.market-rates.home', name: 'Market rates (home strip)', path: 'public/market-rates/home', auth: 'none', screen: 'Not used by app', list: '', fields: ['id', 'name', 'price'] },
    ],
  },

  // ── Marketplace ───────────────────────────────────────────────────────────
  {
    group: 'Marketplace',
    severity: 'critical',
    endpoints: [
      {
        id: 'public.supplies', name: 'Browse supplies (buyer mode)', path: 'public/supplies', auth: 'optional', query: { page: 1, limit: 20 },
        screen: 'Marketplace', list: 'data.listings', fields: ['id', 'code', 'commodity', 'price_display', 'seller'],
        details: [{ name: 'Supply detail', path: r => `public/supplies/${r.id}`, auth: 'optional', idField: 'listing_id', fields: ['listing_id', 'code', 'commodity'] }],
      },
      {
        id: 'public.demand', name: 'Browse demand (seller mode)', path: 'public/demand', auth: 'optional', query: { page: 1, limit: 20 },
        screen: 'Marketplace', list: 'data.listings', fields: ['id', 'code', 'commodity', 'price_display'],
        details: [{ name: 'Demand detail', path: r => `public/demand/${r.id}`, auth: 'optional', idField: 'listing_id', fields: ['listing_id', 'code', 'commodity'] }],
      },
      {
        id: 'public.mills', name: 'Mills', path: 'public/mills', auth: 'none', query: { skip: 0, limit: 20 },
        screen: 'Post form > Mills', list: 'data', fields: ['id', 'name'],
        details: [{ name: 'Mill detail', path: r => `public/mills/${r.id}`, fields: ['id', 'name'] }],
      },
      { id: 'public.commodities', name: 'Commodities', path: 'public/commodities', auth: 'none', screen: 'Post form', list: 'items', fields: ['id', 'name', 'category'] },
      { id: 'public.categories', name: 'Categories', path: 'public/categories', auth: 'none', screen: 'Not used by app', list: 'items', fields: ['id', 'name'] },
      { id: 'public.cities', name: 'Cities', path: 'public/cities', auth: 'none', screen: 'Signup, Post form (useCities)' },
      { id: 'public.banks', name: 'Banks', path: 'public/banks', auth: 'none', screen: 'Payment setup, Payment methods' },
      { id: 'public.trade-configs', name: 'Trade configs (payment terms)', path: 'public/trade-configs', auth: 'none', query: { type: 'payment_term' }, screen: 'Negotiation, Post form' },
      { id: 'public.places', name: 'Google Places autocomplete', path: 'public/places/autocomplete', auth: 'none', query: { input: 'Lahore', countryCode: 'pk' }, screen: 'Location pickers' },
    ],
  },

  // ── Posts (my listings) ───────────────────────────────────────────────────
  {
    group: 'My posts',
    severity: 'normal',
    endpoints: [
      { id: 'post.categories', name: 'Post categories', path: 'post/categories', auth: 'user', screen: 'Pre-post', list: 'items', fields: ['id', 'name'] },
      {
        id: 'buyer.demands', name: 'My demands', path: 'buyer/demands', auth: 'user', query: { page: 1, limit: 20 },
        screen: 'Posts > Buyer tab', list: '', fields: ['id', 'code', 'status', 'commodity_name'],
        details: [{ name: 'Demand detail (owner)', path: r => `buyer/demands/${r.id}`, fields: ['id'] }],
      },
      {
        id: 'seller.supplies', name: 'My supplies', path: 'seller/supplies', auth: 'user', query: { page: 1, limit: 20 },
        screen: 'Posts > Seller tab', list: '', fields: ['id', 'code', 'status', 'commodity_name'],
        details: [{ name: 'Supply detail (owner)', path: r => `seller/supplies/${r.id}`, fields: ['id'] }],
      },
      { id: 'buyer.demands.offers', name: 'Offers on my demands', path: 'buyer/demands/offers', auth: 'user', screen: 'Posts > Buyer tab', list: '', fields: ['id', 'code', 'status'] },
      { id: 'seller.supplies.offers', name: 'Offers on my supplies', path: 'seller/supplies/offers', auth: 'user', screen: 'Posts > Seller tab', list: '', fields: ['id', 'code', 'status'] },
      { id: 'buyer.favorites', name: 'Favourite listings', path: 'buyer/supplies/favorites', auth: 'user', screen: 'Commodity detail', list: '', fields: ['id', 'post_id'] },
    ],
  },

  // ── Offers & negotiation ──────────────────────────────────────────────────
  {
    group: 'Offers & negotiation',
    severity: 'critical',
    endpoints: [
      {
        id: 'buyer.offers', name: 'Buyer offers', path: 'buyer/offers', auth: 'user',
        screen: 'Posts tab, Negotiation', list: 'data', fields: ['id', 'code', 'status', 'offer_price'],
        details: [{ name: 'Buyer offer detail', path: r => `buyer/offers/${r.id}`, fields: ['id'] }],
      },
      {
        id: 'seller.offers', name: 'Seller offers', path: 'seller/offers', auth: 'user',
        screen: 'Posts tab, Negotiation', list: 'data', fields: ['id', 'code', 'status', 'offer_price'],
        details: [{ name: 'Seller offer detail', path: r => `seller/offers/${r.id}`, fields: ['id'] }],
      },
    ],
  },

  // ── Deals ─────────────────────────────────────────────────────────────────
  {
    group: 'Deals',
    severity: 'critical',
    endpoints: [
      {
        id: 'buyer.buydeals', name: 'Buy deals', path: 'buyer/buydeals', auth: 'user',
        screen: 'Deals', list: 'data', fields: ['id', 'code', 'status', 'total_amount'],
        details: [
          { name: 'Buy deal detail', path: r => `buyer/buydeals/${r.id}`, idField: 'deal_id', fields: ['deal_id', 'code', 'status'] },
          { name: 'Buy deal payments', path: r => `buyer/buydeals/${r.id}/payments` },
          { name: 'Buy deal trucks', path: r => `buyer/buydeals/${r.id}/trucks` },
        ],
      },
      {
        id: 'seller.selldeals', name: 'Sell deals', path: 'seller/selldeals', auth: 'user',
        screen: 'Deals', list: 'data', fields: ['id', 'code', 'status', 'total_amount'],
        details: [
          { name: 'Sell deal detail', path: r => `seller/selldeals/${r.id}`, idField: 'deal_id', fields: ['deal_id', 'code', 'status'] },
          { name: 'Sell deal payments', path: r => `seller/selldeals/${r.id}/payments` },
          { name: 'Sell deal trucks', path: r => `seller/selldeals/${r.id}/trucks` },
        ],
      },
    ],
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  {
    group: 'Profile',
    severity: 'normal',
    endpoints: [
      { id: 'profile.personal', name: 'Personal profile', path: 'profile/personal', auth: 'user', screen: 'Personal info, KYC' },
      { id: 'profile.verification', name: 'Verification status', path: 'profile/personal/verification-status', auth: 'user', screen: 'Verification status' },
      { id: 'profile.business', name: 'Business profile', path: 'profile/business', auth: 'user', screen: 'Business profile' },
      { id: 'profile.banking', name: 'Bank accounts', path: 'profile/personal/banking', auth: 'user', screen: 'Payment methods', list: 'banking_details', fields: ['id', 'bank', 'status'] },
      { id: 'profile.payment-history', name: 'Payment history', path: 'profile/personal/payment-history', auth: 'user', screen: 'Payment history', list: 'data.items', fields: ['id', 'amount', 'status'] },
      { id: 'profile.app-settings', name: 'App settings', path: 'profile/app-settings', auth: 'user', screen: 'App settings' },
      { id: 'profile.notification-settings', name: 'Notification settings', path: 'profile/notifications', auth: 'user', screen: 'Notification settings' },
      { id: 'profile.notifications', name: 'Notifications', path: 'profile/notifications/list', auth: 'user', query: { limit: 50, offset: 0 }, screen: 'Notifications', list: 'data.items', fields: ['id', 'title', 'is_read'] },
      { id: 'profile.saved-listings', name: 'Saved listings', path: 'profile/saved-listings', auth: 'user', query: { limit: 50, offset: 0 }, screen: 'Saved listings', list: 'data.items', fields: ['id', 'post_id', 'listing'] },
      { id: 'profile.ratings', name: 'My ratings', path: 'profile/ratings/my', auth: 'user', screen: 'My ratings', list: 'data', fields: ['id', 'score'] },
    ],
  },

  // ── Support ───────────────────────────────────────────────────────────────
  {
    group: 'Support',
    severity: 'minor',
    endpoints: [
      {
        id: 'profile.disputes', name: 'My disputes', path: 'profile/disputes/my', auth: 'user',
        screen: 'Disputes & queries', list: '', fields: ['id', 'code', 'status'],
        details: [{ name: 'Dispute detail', path: r => `profile/disputes/${r.id}`, fields: ['id'] }],
      },
      {
        id: 'profile.queries', name: 'My support queries', path: 'profile/queries', auth: 'user',
        screen: 'Disputes & queries', list: '', fields: ['id', 'code', 'subject', 'status'],
        details: [{ name: 'Query thread', path: r => `profile/queries/${r.id}`, fields: ['id'] }],
      },
    ],
  },

  // ── Admin panel (admin JWT; read-only) ───────────────────────────────────
  {
    group: 'Admin: dashboard & reports',
    severity: 'normal',
    endpoints: [
      { id: 'admin.dashboard', name: 'Dashboard (own profile)', path: 'admin/dashboard', auth: 'admin', screen: 'Admin dashboard' },
      { id: 'admin.dashboard.activity', name: 'Activity feed', path: 'admin/dashboard/activity', auth: 'admin', screen: 'Admin dashboard', list: '' },
      { id: 'admin.dashboard.business-info', name: 'Business info', path: 'admin/dashboard/business-info', auth: 'admin', screen: 'Admin settings' },
      { id: 'admin.dashboard.notification-settings', name: 'Admin notification settings', path: 'admin/dashboard/settings/notifications', auth: 'admin', screen: 'Admin settings' },
      { id: 'admin.reports.overview', name: 'Reports overview', path: 'admin/reports/overview', auth: 'admin', screen: 'Reports' },
      { id: 'admin.reports.dashboard', name: 'Reports dashboard', path: 'admin/reports/dashboard', auth: 'admin', screen: 'Reports' },
      { id: 'admin.reports.summary', name: 'Reports summary (monthly)', path: 'admin/reports/summary', query: { period: 'monthly' }, auth: 'admin', screen: 'Reports' },
      { id: 'admin.alerts', name: 'Alerts', path: 'admin/alerts', auth: 'admin', screen: 'Alerts', list: '' },
      { id: 'admin.alerts.summary', name: 'Alerts summary', path: 'admin/alerts/summary', auth: 'admin', screen: 'Alerts' },
    ],
  },
  {
    group: 'Admin: users',
    severity: 'critical',
    endpoints: [
      {
        id: 'admin.users', name: 'Users', path: 'admin/users', auth: 'admin', screen: 'Users', list: '', fields: ['id', 'email'],
        details: [
          { name: 'User detail', path: r => `admin/users/${r.id}`, auth: 'admin' },
          { name: 'User listings', path: r => `admin/users/${r.id}/listings`, auth: 'admin' },
          { name: 'User offers', path: r => `admin/users/${r.id}/offers`, auth: 'admin' },
          { name: 'User deals', path: r => `admin/users/${r.id}/deals`, auth: 'admin' },
        ],
      },
      { id: 'admin.users.stats', name: 'User stats', path: 'admin/users/stats', auth: 'admin', screen: 'Users' },
      {
        id: 'admin.team', name: 'Team members', path: 'admin/team', auth: 'admin', screen: 'Team', list: '', fields: ['id'],
        details: [
          { name: 'Team member detail', path: r => `admin/team/${r.id}`, auth: 'admin' },
          { name: 'Team member permissions', path: r => `admin/team/${r.id}/permissions`, auth: 'admin' },
        ],
      },
      { id: 'admin.team.modules', name: 'Permission modules', path: 'admin/team/modules', auth: 'admin', screen: 'Team', list: '' },
      { id: 'admin.team.audit-logs', name: 'Audit logs', path: 'admin/team/audit-logs', query: { limit: 20 }, auth: 'admin', screen: 'Team', list: '' },
    ],
  },
  {
    group: 'Admin: catalogue & settings',
    severity: 'normal',
    endpoints: [
      {
        id: 'admin.categories', name: 'Categories', path: 'admin/categories', auth: 'admin', screen: 'Categories', list: '', fields: ['id', 'name'],
        details: [
          { name: 'Category detail', path: r => `admin/categories/${r.id}`, auth: 'admin' },
          { name: 'Commodities in category', path: r => `admin/categories/${r.id}/commodities`, auth: 'admin' },
        ],
      },
      { id: 'admin.categories.all', name: 'Categories (dropdown)', path: 'admin/categories/all', auth: 'admin', screen: 'Categories', list: '' },
      {
        id: 'admin.commodities', name: 'Commodities', path: 'admin/commodities', auth: 'admin', screen: 'Commodities', list: '', fields: ['id', 'name'],
        details: [{ name: 'Commodity detail', path: r => `admin/commodities/${r.id}`, auth: 'admin' }],
      },
      { id: 'admin.commodities.all', name: 'Commodities (dropdown)', path: 'admin/commodities/all', auth: 'admin', screen: 'Commodities', list: '' },
      {
        id: 'admin.mills', name: 'Mills', path: 'admin/mills', auth: 'admin', screen: 'Mills', list: '', fields: ['id', 'name'],
        details: [
          { name: 'Mill detail', path: r => `admin/mills/${r.id}`, auth: 'admin' },
          { name: 'Mill usage', path: r => `admin/mills/${r.id}/usage`, auth: 'admin' },
          { name: 'Mill commodity rates', path: r => `admin/mills/${r.id}/commodity-rates`, auth: 'admin' },
        ],
      },
      { id: 'admin.mills.pending', name: 'Pending mills', path: 'admin/mills/pending', auth: 'admin', screen: 'Mills', list: '' },
      { id: 'admin.mills.rate-list', name: 'Mill rate list', path: 'admin/mills/rate-list', auth: 'admin', screen: 'Market rates' },
      { id: 'admin.form-field-types', name: 'Form field types', path: 'admin/form-field-types', auth: 'admin', screen: 'Form builder', list: '' },
      {
        id: 'admin.form-templates', name: 'Form templates', path: 'admin/form-templates', auth: 'admin', screen: 'Form builder', list: '', fields: ['id'],
        details: [{ name: 'Form template detail', path: r => `admin/form-templates/${r.id}`, auth: 'admin' }],
      },
      { id: 'admin.settings.units', name: 'Units', path: 'admin/settings/units', auth: 'admin', screen: 'Settings', list: '' },
      { id: 'admin.settings.payment-terms', name: 'Payment terms', path: 'admin/settings/payment-terms', auth: 'admin', screen: 'Settings', list: '' },
      { id: 'admin.settings.delivery-options', name: 'Delivery options', path: 'admin/settings/delivery-options', auth: 'admin', screen: 'Settings', list: '' },
    ],
  },
  {
    group: 'Admin: trading',
    severity: 'critical',
    endpoints: [
      {
        id: 'admin.posts', name: 'All posts', path: 'admin/posts', auth: 'admin', screen: 'Listings', list: '', fields: ['id'],
        details: [{ name: 'Post detail', path: r => `admin/posts/${r.id}`, auth: 'admin' }],
      },
      { id: 'admin.posts.supply', name: 'Supply posts', path: 'admin/posts/supply', auth: 'admin', screen: 'Listings', list: '' },
      { id: 'admin.posts.demand', name: 'Demand posts', path: 'admin/posts/demand', auth: 'admin', screen: 'Listings', list: '' },
      {
        id: 'admin.offers', name: 'Offers', path: 'admin/offers', auth: 'admin', screen: 'Offers', list: '', fields: ['id'],
        details: [{ name: 'Offer detail', path: r => `admin/offers/${r.id}`, auth: 'admin' }],
      },
      {
        id: 'admin.deals', name: 'Deals', path: 'admin/deals', auth: 'admin', screen: 'Deals', list: '', fields: ['id'],
        details: [
          { name: 'Deal', path: r => `admin/deals/${r.id}`, auth: 'admin' },
          { name: 'Deal full detail', path: r => `admin/deals/${r.id}/detail`, auth: 'admin' },
          { name: 'Deal trucks', path: r => `admin/deals/${r.id}/trucks`, auth: 'admin' },
          { name: 'Deal payments', path: r => `admin/deals/${r.id}/payments`, auth: 'admin' },
        ],
      },
      { id: 'admin.deals.stats', name: 'Deal stats', path: 'admin/deals/stats', auth: 'admin', screen: 'Deals' },
      { id: 'admin.payments', name: 'Payments', path: 'admin/payments', auth: 'admin', screen: 'Payments', list: '' },
      { id: 'admin.payments.stats', name: 'Payment stats', path: 'admin/payments/stats', auth: 'admin', screen: 'Payments' },
      { id: 'admin.payments.earnings', name: 'Earnings breakdown', path: 'admin/payments/earnings-breakdown', auth: 'admin', screen: 'Payments' },
      { id: 'admin.payments.by-deal', name: 'Payments by deal', path: 'admin/payments/by-deal', auth: 'admin', screen: 'Payments', list: '' },
    ],
  },
  {
    group: 'Admin: support',
    severity: 'normal',
    endpoints: [
      {
        id: 'admin.disputes', name: 'Disputes', path: 'admin/disputes', auth: 'admin', screen: 'Disputes', list: '', fields: ['id'],
        details: [{ name: 'Dispute detail', path: r => `admin/disputes/${r.id}`, auth: 'admin' }],
      },
      {
        id: 'admin.user-queries', name: 'User queries', path: 'admin/user-queries', auth: 'admin', screen: 'Support', list: '', fields: ['id'],
        details: [{ name: 'Query thread', path: r => `admin/user-queries/${r.id}`, auth: 'admin' }],
      },
      {
        id: 'admin.ratings', name: 'Ratings', path: 'admin/ratings', auth: 'admin', screen: 'Ratings', list: '', fields: ['id'],
        details: [{ name: 'Rating detail', path: r => `admin/ratings/${r.id}`, auth: 'admin' }],
      },
    ],
  },
];

/**
 * Negative tests: the API must refuse or reject these correctly.
 * `expect` is the status the API SHOULD return; anything else fails.
 */
export const probes = [
  { id: 'probe.no-token', name: 'Protected route without token', method: 'GET', path: 'buyer/offers', token: 'none', expect: [401], severity: 'blocker', defect: 'Protected route answers without a token',
    impact: 'Private trading data readable without logging in.', fix: 'Apply AuthTokenGuard to the route.' },
  { id: 'probe.forged-token', name: 'Forged token', method: 'GET', path: 'auth/me', token: 'forged', expect: [401], severity: 'blocker', defect: 'Forged JWT is accepted',
    impact: 'Anyone can impersonate a user.', fix: 'Verify JWT signature and expiry on every request.' },
  { id: 'probe.user-on-admin', name: 'User token on admin route', method: 'GET', path: 'admin/users', token: 'user', expect: [403], severity: 'blocker', defect: 'User token can access admin routes',
    impact: 'Normal users can reach admin data.', fix: 'Apply RoleGuard(ADMIN_ROLES) to admin controllers.' },
  { id: 'probe.bad-limit', name: 'Non-numeric limit is rejected', method: 'GET', path: 'buyer/buydeals', query: { limit: 'abc' }, token: 'user', expect: [400], severity: 'minor', defect: 'Non-numeric limit is not rejected with HTTP 400',
    impact: 'Invalid paging input is silently accepted (or crashes the handler); the same parseInt pattern exists in about 15 controllers.',
    fix: 'Validate query params with ParseIntPipe / a DTO (@Type(() => Number) @IsInt() @Min(1) @Max(100)) instead of parseInt.' },
  { id: 'probe.unknown-supply', name: 'Unknown supply id returns 404', method: 'GET', path: `public/supplies/${ZERO_UUID}`, token: 'none', expect: [404, 400], severity: 'minor', defect: 'Unknown record id does not return 404',
    impact: 'Missing records surface as server errors.', fix: 'Throw NotFoundException when the record is missing.' },
  { id: 'probe.unknown-route', name: 'Unknown route returns 404', method: 'GET', path: 'does-not-exist', token: 'none', expect: [404], severity: 'trivial', defect: 'Unknown route does not return 404',
    impact: 'Unexpected routing behaviour.', fix: 'Keep the default Nest 404 handler.' },
  { id: 'probe.wrong-password', name: 'Wrong password returns 401', method: 'POST', path: 'auth/login', body: { email: 'audit-nobody@naseeb.test', password: 'wrong-password' }, token: 'none', expect: [401], severity: 'critical', defect: 'Wrong password is not rejected with 401',
    impact: 'Login accepts bad credentials or leaks errors.', fix: 'Return 401 with a generic message.' },
  // ── Input validation ──
  { id: 'probe.login-empty', name: 'Login with empty body is rejected', method: 'POST', path: 'auth/login', body: {}, token: 'none', expect: [400], severity: 'normal', defect: 'Login accepts an empty body',
    impact: 'Missing input reaches the auth logic.', fix: 'Keep LoginDto validation (IsEmail, MinLength) on the route.' },
  { id: 'probe.login-bad-email', name: 'Login with invalid email format is rejected', method: 'POST', path: 'auth/login', body: { email: 'not-an-email', password: 'Test@1234' }, token: 'none', expect: [400], severity: 'minor', defect: 'Login accepts a malformed email',
    impact: 'Unvalidated input reaches the database query.', fix: 'Validate email with @IsEmail().' },
  { id: 'probe.login-short-password', name: 'Login with too-short password is rejected', method: 'POST', path: 'auth/login', body: { email: 'audit-nobody@naseeb.test', password: '123' }, token: 'none', expect: [400], severity: 'minor', defect: 'Password length is not validated',
    impact: 'Weak input rules.', fix: 'Validate password with @MinLength(6).' },
  { id: 'probe.malformed-json', name: 'Malformed JSON body is rejected', method: 'POST', path: 'auth/login', raw: '{"email":', token: 'none', expect: [400], severity: 'normal', defect: 'Malformed JSON is not rejected with 400',
    impact: 'Parser errors surface as server errors.', fix: 'Let the body parser return 400 for invalid JSON.' },
  { id: 'probe.wrong-content-type', name: 'Non-JSON content type is rejected', method: 'POST', path: 'auth/login', raw: 'email=a&password=b', contentType: 'text/plain', token: 'none', expect: [400, 415], severity: 'minor', defect: 'Non-JSON body is accepted',
    impact: 'Unexpected input formats reach handlers.', fix: 'Accept only application/json on JSON routes.' },
  { id: 'probe.oversized-body', name: 'Oversized request body (2 MB) is rejected', method: 'POST', path: 'auth/login', raw: JSON.stringify({ email: 'a@b.co', password: 'x'.repeat(2_000_000) }), token: 'none', expect: [413], severity: 'normal', defect: 'Server accepts very large request bodies',
    impact: 'Large payloads can exhaust server memory.', fix: 'Set a body size limit (express.json({ limit: "1mb" })).' },
  { id: 'probe.invalid-uuid-public', name: 'Invalid id format on public detail is rejected', method: 'GET', path: 'public/supplies/not-a-uuid', token: 'none', expect: [400, 404], severity: 'minor', defect: 'Invalid id format causes an error',
    impact: 'Bad ids reach the database.', fix: 'Use ParseUUIDPipe on :id params.' },
  { id: 'probe.invalid-uuid-private', name: 'Invalid id format on private detail is rejected', method: 'GET', path: 'buyer/buydeals/not-a-uuid', token: 'user', expect: [400, 404], severity: 'minor', defect: 'Invalid id format causes an error',
    impact: 'Bad ids reach the database.', fix: 'Use ParseUUIDPipe on :id params.' },
  { id: 'probe.negative-skip', name: 'Negative skip is rejected', method: 'GET', path: 'buyer/buydeals', query: { skip: -1 }, token: 'user', expect: [400], severity: 'minor', defect: 'Negative skip value is accepted',
    impact: 'Invalid paging input is silently accepted; behaviour is undefined.', fix: 'Validate skip with @Min(0) (ParseIntPipe + check).' },
  { id: 'probe.negative-page', name: 'Negative page is rejected', method: 'GET', path: 'public/supplies', query: { page: -1 }, token: 'none', expect: [400], severity: 'minor', defect: 'Negative page value is accepted',
    impact: 'Invalid paging input is silently accepted.', fix: 'Validate page with @Min(1).' },
  { id: 'probe.invalid-enum', name: 'Unknown status filter is rejected', method: 'GET', path: 'buyer/buydeals', query: { status: 'zzz' }, token: 'user', expect: [400], severity: 'normal', defect: 'Unknown status filter crashes the endpoint (HTTP 500 instead of 400)',
    impact: 'Bad filter values cause server errors on the Deals screen.', fix: 'Validate status with @IsEnum(DealStatus) or ParseEnumPipe.' },
  { id: 'probe.limit-over-max', name: 'Page size above the maximum is rejected', method: 'GET', path: 'public/supplies', query: { limit: 100000 }, token: 'none', expect: [400], severity: 'normal', defect: 'Unbounded page size is accepted',
    impact: 'One request can load the whole table.', fix: 'Cap limit with @Max(50).' },
  { id: 'probe.long-search', name: 'Over-long search text is rejected', method: 'GET', path: 'public/supplies', query: { search: 'a'.repeat(5000) }, token: 'none', expect: [400], severity: 'minor', defect: 'Very long search strings are accepted',
    impact: 'Expensive LIKE queries on long input.', fix: 'Validate search with @MaxLength(100).' },
  { id: 'probe.method-not-allowed', name: 'Unsupported HTTP method is rejected', method: 'DELETE', path: 'public/categories', token: 'none', expect: [404, 405], severity: 'minor', defect: 'Unsupported method is accepted',
    impact: 'Unexpected routes are exposed.', fix: 'Only register the intended methods.' },
];

/**
 * Security checks (OWASP API Security Top 10, 2023), skipped on production.
 * `kind` selects a special check in run.mjs; otherwise the request must return a status in `expect`
 * (or satisfy `pass`).
 */
const ADMIN_MODULES = ['admin/users', 'admin/deals', 'admin/payments', 'admin/offers', 'admin/team', 'admin/reports/overview'];
const BOLA_ROUTES = [
  { id: 'buydeal', name: "another user's buy deal", list: 'buyer/buydeals', detail: id => `buyer/buydeals/${id}`, severity: 'blocker' },
  { id: 'buydeal-payments', name: "another user's deal payments", list: 'buyer/buydeals', detail: id => `buyer/buydeals/${id}/payments`, severity: 'blocker' },
  { id: 'buydeal-trucks', name: "another user's deal trucks", list: 'buyer/buydeals', detail: id => `buyer/buydeals/${id}/trucks`, severity: 'critical' },
  { id: 'selldeal', name: "another user's sell deal", list: 'seller/selldeals', detail: id => `seller/selldeals/${id}`, severity: 'blocker' },
  { id: 'buyer-offer', name: "another user's buyer offer", list: 'buyer/offers', detail: id => `buyer/offers/${id}`, severity: 'critical' },
  { id: 'seller-offer', name: "another user's seller offer", list: 'seller/offers', detail: id => `seller/offers/${id}`, severity: 'critical' },
  { id: 'demand', name: "another user's demand (owner view)", list: 'buyer/demands', detail: id => `buyer/demands/${id}`, severity: 'critical' },
  { id: 'supply', name: "another user's supply (owner view)", list: 'seller/supplies', detail: id => `seller/supplies/${id}`, severity: 'critical' },
  { id: 'dispute', name: "another user's dispute", list: 'profile/disputes/my', detail: id => `profile/disputes/${id}`, severity: 'critical' },
  { id: 'query', name: "another user's support query", list: 'profile/queries', detail: id => `profile/queries/${id}`, severity: 'critical' },
];

export const securityChecks = [
  // API1: Broken object level authorization: user B must not open user A's records.
  ...BOLA_ROUTES.map(r => ({
    id: `sec.bola.${r.id}`, kind: 'bola', owasp: 'API1:2023 Broken Object Level Authorization', name: `Cannot open ${r.name}`,
    method: 'GET', path: r.detail(':id'), list: r.list, detail: r.detail, severity: r.severity,
    expected: 'HTTP 403 or 404 for a record owned by another account', defect: `A user can open ${r.name}`,
    impact: 'Private trading data (prices, parties, payments) leaks between users.', fix: 'Check the record belongs to the requesting user before returning it.',
  })),

  // API2: Broken authentication.
  { id: 'sec.jwt-alg-none', owasp: 'API2:2023 Broken Authentication', name: 'Unsigned (alg "none") token is rejected', method: 'GET', path: 'auth/me', token: 'alg-none', expect: [401], severity: 'blocker',
    expected: 'HTTP 401', defect: 'Unsigned JWT is accepted', impact: 'Anyone can log in as any user without a password.', fix: 'Verify tokens with an explicit algorithm list (algorithms: ["HS256"]).' },
  { id: 'sec.jwt-tampered', owasp: 'API2:2023 Broken Authentication', name: 'Token with edited role is rejected', method: 'GET', path: 'admin/users', token: 'tampered', expect: [401, 403], severity: 'blocker',
    expected: 'HTTP 401 or 403', defect: 'Token with a tampered role claim is accepted', impact: 'Users can promote themselves to admin.', fix: 'Verify the JWT signature on every request.' },
  { id: 'sec.auth-empty-bearer', owasp: 'API2:2023 Broken Authentication', name: 'Empty Bearer header is rejected', method: 'GET', path: 'auth/me', authHeader: 'Bearer ', expect: [401], severity: 'critical',
    expected: 'HTTP 401', defect: 'Empty Bearer header is accepted', impact: 'Authentication can be bypassed.', fix: 'Reject missing or empty tokens.' },
  { id: 'sec.auth-basic-scheme', owasp: 'API2:2023 Broken Authentication', name: 'Wrong auth scheme (Basic) is rejected', method: 'GET', path: 'auth/me', authHeader: 'Basic dXNlcjpwYXNz', expect: [401], severity: 'critical',
    expected: 'HTTP 401', defect: 'Non-Bearer auth scheme is accepted', impact: 'Authentication can be bypassed.', fix: 'Accept only "Bearer <jwt>".' },
  { id: 'sec.user-enumeration', kind: 'enumeration', owasp: 'API2:2023 Broken Authentication', name: 'Login does not reveal which emails exist', method: 'POST', path: 'auth/login', severity: 'normal',
    expected: 'Same status and message for unknown email and wrong password', defect: 'Login reveals whether an email is registered',
    impact: 'Attackers can build a list of real user accounts.', fix: 'Return one generic message ("Invalid email or password") for both cases.' },
  { id: 'sec.blocked-accounts', kind: 'blocked-login', owasp: 'API2:2023 Broken Authentication', name: 'Inactive and KYC-rejected accounts cannot log in', method: 'POST', path: 'auth/login', severity: 'critical',
    expected: 'HTTP 401 or 403 for every account in AUDIT_BLOCKED_USERS', defect: 'Blocked accounts can still log in',
    impact: 'Suspended or rejected users keep trading.', fix: 'Check is_active and KYC status during login.' },

  // API3: Broken object property level authorization (excessive data exposure).
  { id: 'sec.sensitive-fields', kind: 'exposure', owasp: 'API3:2023 Broken Object Property Level Authorization', name: 'No response contains password hashes or secret tokens', method: 'GET', path: '(all responses in this run)', severity: 'critical',
    expected: 'No keys named password, password_hash, salt, reset_token, refresh_token or otp in any response', defect: 'API responses expose secret fields',
    impact: 'Password hashes or reset tokens can be harvested.', fix: 'Exclude secret columns (select: false / class-transformer @Exclude).' },
  { id: 'sec.public-seller-pii', kind: 'pii', owasp: 'API3:2023 Broken Object Property Level Authorization', name: 'Public listings do not expose seller contact details', method: 'GET', path: 'public/supplies', severity: 'normal',
    expected: 'Public listing seller has no email, phone, CNIC or address', defect: 'Public listings expose seller personal data',
    impact: "Anyone can scrape sellers' contact details.", fix: 'Return only public seller fields (name, verified, rating).' },

  // API5: Broken function level authorization: admin modules.
  ...ADMIN_MODULES.map(m => ({
    id: `sec.admin.${m.replace(/\W+/g, '-')}`, kind: 'admin', owasp: 'API5:2023 Broken Function Level Authorization', name: `Admin module blocked for users: ${m}`,
    method: 'GET', path: m, severity: 'blocker', expected: 'HTTP 401 without token; HTTP 403 with a user token', defect: `Non-admins can reach ${m}`,
    impact: 'Users can view or change admin data.', fix: 'Apply RoleGuard(ADMIN_ROLES) on the admin controller.',
  })),

  // API8: Security misconfiguration.
  { id: 'sec.sqli-public', owasp: 'API8:2023 Security Misconfiguration (injection)', name: 'SQL injection text in public search is handled safely', method: 'GET', path: 'public/supplies', query: { search: "' OR 1=1--" }, pass: r => r.status === 200 || r.status === 400, severity: 'critical',
    expected: 'HTTP 200 or 400 (never 500)', why: 'SQL text caused a server error', defect: 'Search input reaches SQL unsafely',
    impact: 'Database can be read or changed by attackers.', fix: 'Use parameterised queries only (no string concatenation).' },
  { id: 'sec.sqli-private', owasp: 'API8:2023 Security Misconfiguration (injection)', name: 'SQL injection text in deal search returns no extra data', method: 'GET', path: 'buyer/buydeals', query: { search: "' OR '1'='1" }, token: 'user',
    pass: r => (r.status === 200 && (r.json?.data?.data?.length ?? 0) === 0) || r.status === 400, severity: 'critical',
    expected: 'HTTP 200 with no matches, or 400', why: 'SQL text changed the query result', defect: 'Deal search is vulnerable to SQL injection',
    impact: 'Other users’ deals could be read.', fix: 'Use parameterised queries only.' },
  { id: 'sec.error-leak', owasp: 'API8:2023 Security Misconfiguration', name: 'Server errors do not leak stack traces or SQL', method: 'GET', path: 'buyer/buydeals', query: { status: 'zzz' }, token: 'user',
    pass: r => !/stack|QueryFailedError|SELECT |INSERT |\bat \S+\.(js|ts):\d+/i.test(JSON.stringify(r.json ?? r.text ?? '')), severity: 'normal',
    expected: 'Error body has no stack trace, SQL or file paths', why: 'Error response leaks internal details', defect: 'Error responses leak internal details',
    impact: 'Attackers learn table names and code structure.', fix: 'Return a generic message from the global exception filter.' },
  { id: 'sec.cors', owasp: 'API8:2023 Security Misconfiguration', name: 'CORS does not trust unknown origins', method: 'GET', path: 'public/categories', headers: { Origin: 'https://evil.example' },
    pass: r => !['https://evil.example', '*'].includes(r.headers?.['access-control-allow-origin']), evidence: r => ({ 'access-control-allow-origin': r.headers?.['access-control-allow-origin'] ?? null, 'access-control-allow-credentials': r.headers?.['access-control-allow-credentials'] ?? null }),
    severity: 'normal', expected: 'No Access-Control-Allow-Origin for an unknown origin', why: 'Unknown origin is allowed by CORS', defect: 'CORS allows any website to call the API',
    impact: 'Malicious websites can make authenticated calls from a user’s browser.', fix: 'List only the real web origins in CORS_ALLOWED_ORIGINS.' },
  { id: 'sec.https-redirect', kind: 'https', remoteOnly: true, owasp: 'API8:2023 Security Misconfiguration', name: 'Plain HTTP redirects to HTTPS', method: 'GET', path: 'public/categories', severity: 'normal',
    expected: 'HTTP 301/308 to an https:// URL', defect: 'API is reachable over plain HTTP',
    impact: 'Tokens and data can be intercepted on public networks.', fix: 'Redirect port 80 to HTTPS in nginx / the load balancer.' },
  { id: 'sec.swagger', name: 'API docs are reachable', method: 'GET', path: 'docs', pass: r => r.status === 200, why: 'Swagger UI is not reachable', defect: 'API documentation (Swagger UI) is not reachable', evidence: r => ({ status: r.status, 'content-type': r.headers?.['content-type'] }), expected: 'HTTP 200 (Swagger UI available)', severity: 'minor',
    impact: 'Developers and the admin team cannot browse the API documentation.', fix: 'Check SwaggerModule.setup("api/v1/docs", ...) in main.ts.' },
];

/** Reversible write flows (--write). Each restores what it changed. */
export const writeFlows = ['saved-listing', 'favorite', 'toggle-supply'];

/** Endpoints hit concurrently with --load. */
export const loadTargets = [
  { path: 'public/supplies', query: { page: 1, limit: 20 } },
  { path: 'public/demand', query: { page: 1, limit: 20 } },
  { path: 'public/featured-categories' },
  { path: 'public/market-rates', query: { page: 1, limit: 20 } },
];

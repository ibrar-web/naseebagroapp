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
  { id: 'probe.bad-limit', name: 'Non-numeric limit is rejected', method: 'GET', path: 'buyer/buydeals', query: { limit: 'abc' }, token: 'user', expect: [400], severity: 'normal', defect: 'Non-numeric limit crashes the endpoint (HTTP 500 instead of 400)',
    impact: 'Bad input crashes the handler (HTTP 500) instead of a clear validation error; the same pattern exists in about 15 controllers.',
    fix: 'Validate query params with a DTO (@Type(() => Number) @IsInt() @Min(1) @Max(100)) instead of parseInt.' },
  { id: 'probe.unknown-supply', name: 'Unknown supply id returns 404', method: 'GET', path: `public/supplies/${ZERO_UUID}`, token: 'none', expect: [404, 400], severity: 'minor', defect: 'Unknown record id does not return 404',
    impact: 'Missing records surface as server errors.', fix: 'Throw NotFoundException when the record is missing.' },
  { id: 'probe.unknown-route', name: 'Unknown route returns 404', method: 'GET', path: 'does-not-exist', token: 'none', expect: [404], severity: 'trivial', defect: 'Unknown route does not return 404',
    impact: 'Unexpected routing behaviour.', fix: 'Keep the default Nest 404 handler.' },
  { id: 'probe.wrong-password', name: 'Wrong password returns 401', method: 'POST', path: 'auth/login', body: { email: 'audit-nobody@naseeb.test', password: 'wrong-password' }, token: 'none', expect: [401], severity: 'critical', defect: 'Wrong password is not rejected with 401',
    impact: 'Login accepts bad credentials or leaks errors.', fix: 'Return 401 with a generic message.' },
];

/** Security checks, skipped on production. */
export const securityChecks = [
  { id: 'sec.otp-bypass', name: 'OTP 123456 must not verify', method: 'POST', path: 'auth/otp/verify', body: { phone: '+923000000000', code: '123456' }, pass: r => r.json?.data?.valid !== true, why: 'Hard-coded OTP bypass is active', defect: 'Hard-coded OTP 123456 verifies any phone number', expected: 'valid: false for an unissued code', severity: 'critical',
    impact: 'Anyone can register with any phone number; phone ownership is never proven.', fix: 'Enable the bypass only when APP_ENV=local, and require a verified OTP in auth/register.' },
  { id: 'sec.swagger', name: 'API docs not public', method: 'GET', path: 'docs', pass: r => r.status !== 200, why: 'Swagger UI is publicly reachable', defect: 'API documentation (Swagger UI) is publicly accessible', evidence: r => ({ status: r.status, 'content-type': r.headers?.['content-type'] }), expected: 'Not HTTP 200 (docs hidden or protected)', severity: 'minor',
    impact: 'The full API surface, including admin routes, is published to anyone.', fix: 'Serve Swagger only outside production, or behind basic auth.' },
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

/**
 * End-to-end business flows (--flows). They create real records (posts, offers, deals, trucks,
 * payments, ratings), so run.mjs only allows them against a local/Docker backend.
 *
 * Each step is one test case. A step throws (via ctx.expect) when a later step could not run
 * without it; the remaining steps of that flow are then reported as Blocked.
 * Actors: seller = first AUDIT_USERS account, buyer = second, admin = AUDIT_ADMIN.
 */
import { testFile } from './lib.mjs';

/** First value found for `key` anywhere in a response (handles data / data.data / nested objects). */
export const find = (obj, key, depth = 0) => {
  if (!obj || typeof obj !== 'object' || depth > 6) return undefined;
  if (key in obj) return obj[key];
  for (const v of Object.values(obj)) {
    const r = find(v, key, depth + 1);
    if (r !== undefined) return r;
  }
  return undefined;
};
const num = v => Number(v);
const round2 = v => Math.round(v * 100) / 100;

// ── Shared steps ────────────────────────────────────────────────────────────

async function referenceData(ctx) {
  const cats = ctx.list(await ctx.call('buyer', 'GET', 'public/categories'));
  const all = [];
  for (const c of cats) {
    const res = await ctx.call('buyer', 'GET', 'public/commodities', { query: { category_id: c.id } });
    for (const m of ctx.list(res) || []) all.push({ ...m, category_id: c.id });
  }
  // Prefer Wheat (Mound unit, percentage commission in the seed); else the first commodity with a unit.
  const pick = all.find(m => /wheat/i.test(m.name) && m.default_unit) || all.find(m => m.default_unit);
  ctx.check(!!pick, pick ? `Using ${pick.name} (${pick.default_unit.name}) in category ${pick.category_id.slice(0, 8)}…` : 'No commodity with a unit found');
  if (!pick) throw ctx.fail('No commodity available');
  ctx.state.commodity = pick;
}

async function createSupply(ctx, { quantity = 100, price = 4000, label = 'supply' } = {}) {
  const c = ctx.state.commodity;
  const res = await ctx.call('seller', 'POST', 'seller/supplies/create', {
    body: [{ category_id: c.category_id, commodity: c.id, quantity, target_price: price, location: 'Lahore, Punjab', delivery_options: 'DELIVERED', grades: ['A'] }],
  });
  ctx.expect(res, [200, 201], `Seller created ${label}`);
  const arr = Array.isArray(res.json?.data) ? res.json.data : find(res.json?.data, 'data');
  const post = Array.isArray(arr) ? arr[0] : { id: find(res.json?.data, 'id') };
  const id = post?.id;
  ctx.check(!!id, `Post id ${String(id).slice(0, 8)}… code ${post?.code ?? '?'}`);
  if (!id) throw ctx.fail('No post id returned');
  return { id, code: post?.code, quantity, price };
}

async function postStatus(ctx, role, listPath, id) {
  const items = ctx.list(await ctx.call(role, 'GET', listPath, { query: { limit: 50 } })) || [];
  // Owner lists return upper-case statuses (PENDING); compare in lower case.
  return items.find(p => p.id === id)?.status?.toLowerCase();
}

async function approve(ctx, postId) {
  const res = await ctx.call('admin', 'POST', `admin/posts/${postId}/approve`);
  ctx.expect(res, [200, 201], 'Admin approved the post');
}

async function expectNotification(ctx, role, type, entityId) {
  const hit = await ctx.poll(async () => {
    const items = ctx.list(await ctx.call(role, 'GET', 'profile/notifications/list', { query: { limit: 50, offset: 0 } })) || [];
    return items.find(n => n.type === type && (!entityId || n.entity_id === entityId));
  });
  ctx.check(!!hit, hit ? `${role} notified: "${hit.title}" (${type})` : `${role} did not receive a "${type}" notification within ${ctx.pollMs / 1000} s`);
  return hit;
}

async function offerStatus(ctx, role, offerId) {
  const res = await ctx.call(role, 'GET', `${role === 'buyer' ? 'buyer' : 'seller'}/offers/${offerId}`);
  return find(res.json?.data, 'status');
}

// ── Flows ───────────────────────────────────────────────────────────────────

export const flows = [
  {
    id: 'supply-trade',
    title: 'Flow A: supply post to closed deal',
    steps: [
      { id: 'ref', name: 'Load categories and commodities', severity: 'critical', expected: 'A commodity with a unit is available', run: referenceData },
      {
        id: 'create', name: 'Seller creates a supply post', severity: 'blocker', expected: 'HTTP 201, post id returned, status pending',
        run: async ctx => {
          ctx.state.post = await createSupply(ctx);
          const status = await postStatus(ctx, 'seller', 'seller/supplies', ctx.state.post.id);
          ctx.check(status === 'pending', `Status is "${status}" (expected pending)`);
        },
      },
      {
        id: 'hidden', name: 'Pending post is not public', severity: 'critical', expected: 'Not listed in public/supplies before approval',
        run: async ctx => {
          const items = ctx.list(await ctx.call('buyer', 'GET', 'public/supplies', { query: { page: 1, limit: 50 } }), 'data.listings') || [];
          ctx.check(!items.some(l => l.id === ctx.state.post.id), 'Pending post is hidden from the marketplace');
        },
      },
      {
        id: 'offer-before-approval', name: 'Offer on an unapproved post is refused', severity: 'critical', expected: 'HTTP 400',
        run: async ctx => {
          const res = await ctx.call('buyer', 'POST', 'buyer/supplies/make-request', {
            body: { listing_id: ctx.state.post.id, quantity: 10, price_option: 'USE_ORIGINAL', payment_terms: { type: 'FIXED', fixed_days: 15 }, delivery_terms: { days: 3 } },
          });
          ctx.expect(res, [400, 403, 404], 'Offer refused before approval');
        },
      },
      { id: 'approve', name: 'Admin approves the post', severity: 'blocker', expected: 'HTTP 200/201', run: ctx => approve(ctx, ctx.state.post.id) },
      { id: 'notify-approved', name: 'Seller is notified of approval', severity: 'normal', expected: 'Notification type "approved" for the post', run: ctx => expectNotification(ctx, 'seller', 'approved', ctx.state.post.id) },
      {
        id: 'public', name: 'Approved post is public', severity: 'critical', expected: 'public/supplies/:id returns 200',
        run: async ctx => ctx.expect(await ctx.call('buyer', 'GET', `public/supplies/${ctx.state.post.id}`), [200], 'Post detail is public'),
      },
      {
        id: 'offer', name: 'Buyer makes an offer', severity: 'blocker', expected: 'HTTP 201, offer PENDING',
        run: async ctx => {
          const res = await ctx.call('buyer', 'POST', 'buyer/supplies/make-request', {
            body: { listing_id: ctx.state.post.id, quantity: ctx.state.post.quantity, price_option: 'MAKE_OFFER', offered_price_per_unit: 3900, payment_terms: { type: 'FIXED', fixed_days: 15 }, delivery_terms: { days: 3 } },
          });
          ctx.expect(res, [200, 201], 'Offer created');
          ctx.state.offerId = find(res.json?.data, 'id');
          ctx.check(find(res.json?.data, 'status') === 'PENDING', `Offer status ${find(res.json?.data, 'status')}`);
        },
      },
      {
        id: 'duplicate-offer', name: 'Second offer on the same post is refused', severity: 'normal', expected: 'HTTP 409',
        run: async ctx => {
          const res = await ctx.call('buyer', 'POST', 'buyer/supplies/make-request', {
            body: { listing_id: ctx.state.post.id, quantity: 10, price_option: 'USE_ORIGINAL', payment_terms: { type: 'FIXED', fixed_days: 15 }, delivery_terms: { days: 3 } },
          });
          ctx.expect(res, [409], 'Duplicate offer refused', { stop: false });
        },
      },
      {
        id: 'own-post', name: 'Seller cannot offer on own post', severity: 'normal', expected: 'HTTP 403',
        run: async ctx => {
          const res = await ctx.call('seller', 'POST', 'buyer/supplies/make-request', {
            body: { listing_id: ctx.state.post.id, quantity: 10, price_option: 'USE_ORIGINAL', payment_terms: { type: 'FIXED', fixed_days: 15 }, delivery_terms: { days: 3 } },
          });
          ctx.expect(res, [400, 403], 'Own-post offer refused', { stop: false });
        },
      },
      {
        id: 'counter', name: 'Seller counters at 4,000', severity: 'critical', expected: 'HTTP 2xx, status COUNTER_RECEIVED',
        run: async ctx => {
          ctx.expect(await ctx.call('seller', 'POST', `seller/offers/${ctx.state.offerId}/counter`, { body: { offered_price: 4000, note: 'Audit counter' } }), [200, 201], 'Counter sent');
          const status = await offerStatus(ctx, 'buyer', ctx.state.offerId);
          ctx.check(status === 'COUNTER_RECEIVED', `Offer status ${status}`);
        },
      },
      { id: 'notify-counter', name: 'Buyer is notified of the counter', severity: 'normal', expected: 'Notification "offer.countered"', run: ctx => expectNotification(ctx, 'buyer', 'offer.countered', ctx.state.offerId) },
      {
        id: 'turn', name: 'Seller cannot accept own counter', severity: 'critical', expected: 'HTTP 4xx (not their turn)',
        run: async ctx => ctx.expect(await ctx.call('seller', 'POST', `seller/offers/${ctx.state.offerId}/accept`), [400, 403], 'Out-of-turn accept refused', { stop: false }),
      },
      {
        id: 'accept', name: 'Buyer accepts, deal is created', severity: 'blocker', expected: 'HTTP 2xx, offer ACCEPTED',
        run: async ctx => {
          ctx.expect(await ctx.call('buyer', 'POST', `buyer/offers/${ctx.state.offerId}/accept`), [200, 201], 'Offer accepted');
          const status = await offerStatus(ctx, 'buyer', ctx.state.offerId);
          ctx.check(status === 'ACCEPTED', `Offer status ${status}`);
        },
      },
      {
        id: 'notify-accept', name: 'Both parties are notified; deal id captured', severity: 'critical', expected: 'Notification "offer.accepted" for buyer and seller',
        run: async ctx => {
          const b = await expectNotification(ctx, 'buyer', 'offer.accepted');
          await expectNotification(ctx, 'seller', 'offer.accepted');
          ctx.state.dealId = b?.entity_id;
          if (!ctx.state.dealId) {
            const deals = ctx.list(await ctx.call('buyer', 'GET', 'buyer/buydeals')) || [];
            ctx.state.dealId = deals[0]?.id;
          }
          ctx.check(!!ctx.state.dealId, `Deal ${String(ctx.state.dealId).slice(0, 8)}…`);
          if (!ctx.state.dealId) throw ctx.fail('No deal found after accept');
        },
      },
      {
        id: 'deal', name: 'Deal amounts are correct', severity: 'blocker', expected: 'status matched; total = quantity × 4,000; payable = total − seller commission',
        run: async ctx => {
          const res = await ctx.call('admin', 'GET', `admin/deals/${ctx.state.dealId}`);
          ctx.expect(res, [200], 'Admin can open the deal');
          const total = num(find(res.json?.data, 'total_amount'));
          const buyerFee = num(find(res.json?.data, 'buyer_commission_amount') ?? 0);
          const sellerFee = num(find(res.json?.data, 'seller_commission_amount') ?? 0);
          const payable = num(find(res.json?.data, 'payable_to_seller'));
          Object.assign(ctx.state, { total, buyerFee, payable });
          ctx.check(find(res.json?.data, 'status') === 'matched', `Deal status ${find(res.json?.data, 'status')}`);
          ctx.check(total === ctx.state.post.quantity * 4000, `Total ${total} (expected ${ctx.state.post.quantity * 4000})`);
          ctx.check(round2(payable) === round2(total - sellerFee), `Payable to seller ${payable} = total − seller commission ${sellerFee}`);
          ctx.check(buyerFee >= 0, `Buyer commission ${buyerFee}`, 'warn');
          const buyerSide = await ctx.call('buyer', 'GET', `buyer/buydeals/${ctx.state.dealId}`);
          const sellerSide = await ctx.call('seller', 'GET', `seller/selldeals/${ctx.state.dealId}`);
          ctx.check(buyerSide.status === 200 && sellerSide.status === 200, `Buyer view ${buyerSide.status}, seller view ${sellerSide.status}`);
        },
      },
      {
        id: 'close-early', name: 'Deal cannot close before delivery and payment', severity: 'critical', expected: 'HTTP 400',
        run: async ctx => ctx.expect(await ctx.call('admin', 'PATCH', `admin/deals/${ctx.state.dealId}/status`, { body: { status: 'closed' } }), [400], 'Early close refused', { stop: false }),
      },
      {
        id: 'truck', name: 'Admin adds a truck', severity: 'blocker', expected: 'HTTP 2xx, deal moves to in_progress',
        run: async ctx => {
          const res = await ctx.call('admin', 'POST', `admin/deals/${ctx.state.dealId}/trucks`, { form: { truck_number: 'LEA-1234', driver_name: 'Audit Driver', weight_tons: 2, freight_amount: 15000 } });
          ctx.expect(res, [200, 201], 'Truck added');
          ctx.state.truckId = find(res.json?.data, 'id');
          const deal = await ctx.call('admin', 'GET', `admin/deals/${ctx.state.dealId}`);
          ctx.check(find(deal.json?.data, 'status') === 'in_progress', `Deal status ${find(deal.json?.data, 'status')}`);
        },
      },
      {
        id: 'overweight', name: 'Truck weight above the deal quantity is refused', severity: 'normal', expected: 'HTTP 400',
        run: async ctx => ctx.expect(await ctx.call('admin', 'POST', `admin/deals/${ctx.state.dealId}/trucks`, { form: { truck_number: 'LEA-9999', weight_tons: 500 } }), [400], 'Overweight truck refused', { stop: false }),
      },
      {
        id: 'doc', name: 'Seller uploads a waybill (pending)', severity: 'critical', expected: 'HTTP 2xx, document id returned',
        run: async ctx => {
          const res = await ctx.call('seller', 'POST', `seller/selldeals/${ctx.state.dealId}/trucks/${ctx.state.truckId}/documents`, { form: { doc_type: 'waybill', file: testFile('waybill.png') } });
          ctx.expect(res, [200, 201], 'Waybill uploaded');
          ctx.state.docId = find(res.json?.data, 'id');
        },
      },
      {
        id: 'doc-verify', name: 'Admin verifies the waybill', severity: 'critical', expected: 'HTTP 2xx',
        run: async ctx => ctx.expect(await ctx.call('admin', 'PATCH', `admin/deals/${ctx.state.dealId}/trucks/${ctx.state.truckId}/docs/${ctx.state.docId}/verify`), [200, 201], 'Document verified'),
      },
      {
        id: 'deliver', name: 'Admin marks the truck delivered', severity: 'critical', expected: 'HTTP 2xx',
        run: async ctx => ctx.expect(await ctx.call('admin', 'PATCH', `admin/deals/${ctx.state.dealId}/trucks/${ctx.state.truckId}/deliver`), [200, 201], 'Truck delivered'),
      },
      {
        id: 'overpay', name: 'Buyer payment above the amount owed is refused', severity: 'normal', expected: 'HTTP 400',
        run: async ctx => ctx.expect(await ctx.call('buyer', 'POST', `buyer/buydeals/${ctx.state.dealId}/payments`, { form: { amount: round2(ctx.state.total * 10), file: testFile('receipt.png') } }), [400], 'Overpayment refused', { stop: false }),
      },
      {
        id: 'buyer-pay', name: 'Buyer uploads full payment receipt', severity: 'blocker', expected: 'HTTP 2xx, payment PENDING',
        run: async ctx => {
          const res = await ctx.call('buyer', 'POST', `buyer/buydeals/${ctx.state.dealId}/payments`, { form: { amount: round2(ctx.state.total + ctx.state.buyerFee), notes: 'Audit payment', file: testFile('receipt.png') } });
          ctx.expect(res, [200, 201], 'Payment submitted');
          ctx.state.paymentId = find(res.json?.data, 'id');
        },
      },
      {
        id: 'pay-verify', name: 'Admin verifies the buyer payment', severity: 'blocker', expected: 'HTTP 2xx',
        run: async ctx => ctx.expect(await ctx.call('admin', 'PATCH', `admin/deals/${ctx.state.dealId}/payments/${ctx.state.paymentId}/verify`), [200, 201], 'Payment verified'),
      },
      {
        id: 'payout', name: 'Admin pays the seller', severity: 'blocker', expected: 'HTTP 2xx',
        run: async ctx => ctx.expect(await ctx.call('admin', 'POST', `admin/deals/${ctx.state.dealId}/payments`, { form: { amount_type: 'sent', amount: round2(ctx.state.payable), notes: 'Audit payout', file: testFile('payout.png') } }), [200, 201], 'Seller paid'),
      },
      {
        id: 'close', name: 'Admin closes the deal', severity: 'blocker', expected: 'HTTP 2xx, status closed',
        run: async ctx => {
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/deals/${ctx.state.dealId}/status`, { body: { status: 'closed' } }), [200, 201], 'Deal closed');
          const deal = await ctx.call('buyer', 'GET', `buyer/buydeals/${ctx.state.dealId}`);
          ctx.check(find(deal.json?.data, 'status') === 'closed', `Buyer sees status ${find(deal.json?.data, 'status')}`);
          ctx.check(num(find(deal.json?.data, 'current_stage')) === num(find(deal.json?.data, 'total_stages')), `Stage ${find(deal.json?.data, 'current_stage')}/${find(deal.json?.data, 'total_stages')}`, 'warn');
        },
      },
      {
        id: 'rate', name: 'Buyer and seller rate the deal', severity: 'normal', expected: 'HTTP 2xx for both',
        run: async ctx => {
          ctx.expect(await ctx.call('buyer', 'POST', `buyer/buydeals/${ctx.state.dealId}/rating`, { body: { score: 5, note: 'Audit rating' } }), [200, 201], 'Buyer rated', { stop: false });
          ctx.expect(await ctx.call('seller', 'POST', `seller/selldeals/${ctx.state.dealId}/rating`, { body: { score: 4 } }), [200, 201], 'Seller rated', { stop: false });
        },
      },
      {
        id: 'rate-twice', name: 'Rating the same deal twice is refused', severity: 'minor', expected: 'HTTP 409',
        run: async ctx => ctx.expect(await ctx.call('buyer', 'POST', `buyer/buydeals/${ctx.state.dealId}/rating`, { body: { score: 1 } }), [409], 'Second rating refused', { stop: false }),
      },
    ],
  },

  {
    id: 'demand-trade',
    title: 'Flow B: demand post, rejection and cancellation',
    steps: [
      { id: 'ref', name: 'Load categories and commodities', severity: 'critical', expected: 'A commodity with a unit is available', run: referenceData },
      {
        id: 'create', name: 'Buyer creates a demand post', severity: 'blocker', expected: 'HTTP 201, status pending',
        run: async ctx => {
          const c = ctx.state.commodity;
          const res = await ctx.call('buyer', 'POST', 'buyer/demands/create', { body: [{ category_id: c.category_id, commodity: c.id, quantity: 50, target_price: 3950, location: 'Faisalabad, Punjab', delivery_options: 'EX_LOAD' }] });
          ctx.expect(res, [200, 201], 'Demand created');
          ctx.state.demandId = (Array.isArray(res.json?.data) ? res.json.data[0]?.id : null) ?? find(res.json?.data, 'id');
          const status = await postStatus(ctx, 'buyer', 'buyer/demands', ctx.state.demandId);
          ctx.check(status === 'pending', `Status ${status}`);
        },
      },
      { id: 'approve', name: 'Admin approves the demand', severity: 'blocker', expected: 'HTTP 200/201', run: ctx => approve(ctx, ctx.state.demandId) },
      { id: 'notify-approved', name: 'Buyer is notified of approval', severity: 'normal', expected: 'Notification "approved"', run: ctx => expectNotification(ctx, 'buyer', 'approved', ctx.state.demandId) },
      {
        id: 'offer', name: 'Seller offers at the buyer budget', severity: 'blocker', expected: 'HTTP 201, offer id returned',
        run: async ctx => {
          const res = await ctx.call('seller', 'POST', 'seller/demands/send-offer', { body: { demand_id: ctx.state.demandId, supply_quantity: 50, price_option: 'USE_BUYER_BUDGET', offer_condition: 'Audit offer' } });
          ctx.expect(res, [200, 201], 'Offer sent');
          ctx.state.offerId = find(res.json?.data, 'offer')?.id ?? find(res.json?.data, 'id');
        },
      },
      {
        id: 'too-much', name: 'Offer above the demand quantity is refused', severity: 'normal', expected: 'HTTP 400',
        run: async ctx => ctx.expect(await ctx.call('seller', 'POST', 'seller/demands/send-offer', { body: { demand_id: ctx.state.demandId, supply_quantity: 5000, price_option: 'USE_BUYER_BUDGET' } }), [400, 409], 'Oversized offer refused', { stop: false }),
      },
      {
        id: 'reject', name: 'Buyer rejects the offer', severity: 'critical', expected: 'HTTP 2xx, status REJECTED',
        run: async ctx => {
          ctx.expect(await ctx.call('buyer', 'POST', `buyer/offers/${ctx.state.offerId}/reject`), [200, 201], 'Offer rejected');
          const status = await offerStatus(ctx, 'buyer', ctx.state.offerId);
          ctx.check(status === 'REJECTED', `Offer status ${status}`);
        },
      },
      { id: 'notify-reject', name: 'Seller is notified of the rejection', severity: 'normal', expected: 'Notification "offer.rejected"', run: ctx => expectNotification(ctx, 'seller', 'offer.rejected', ctx.state.offerId) },
      {
        id: 'accept-rejected', name: 'A rejected offer cannot be accepted', severity: 'critical', expected: 'HTTP 4xx',
        run: async ctx => ctx.expect(await ctx.call('buyer', 'POST', `buyer/offers/${ctx.state.offerId}/accept`), [400, 403, 409], 'Accepting a rejected offer refused', { stop: false }),
      },
      {
        id: 'reoffer', name: 'Seller sends a new counter offer', severity: 'blocker', expected: 'HTTP 201',
        run: async ctx => {
          const res = await ctx.call('seller', 'POST', 'seller/demands/send-offer', { body: { demand_id: ctx.state.demandId, supply_quantity: 50, price_option: 'MAKE_COUNTER', counter_price_per_unit: 4050 } });
          ctx.expect(res, [200, 201], 'New offer sent');
          ctx.state.offer2 = find(res.json?.data, 'offer')?.id ?? find(res.json?.data, 'id');
        },
      },
      {
        id: 'accept', name: 'Buyer accepts, deal is created', severity: 'blocker', expected: 'HTTP 2xx, notification with deal id',
        run: async ctx => {
          ctx.expect(await ctx.call('buyer', 'POST', `buyer/offers/${ctx.state.offer2}/accept`), [200, 201], 'Offer accepted');
          const n = await expectNotification(ctx, 'seller', 'offer.accepted', undefined);
          ctx.state.dealId = n?.entity_id;
          if (!ctx.state.dealId) throw ctx.fail('No deal id');
        },
      },
      {
        id: 'cancel', name: 'Admin cancels the deal', severity: 'critical', expected: 'HTTP 2xx, status cancelled',
        run: async ctx => {
          ctx.expect(await ctx.call('admin', 'POST', `admin/deals/${ctx.state.dealId}/cancel`, { body: { cancel_reason: 'Audit test cancellation' } }), [200, 201], 'Deal cancelled');
          const deal = await ctx.call('admin', 'GET', `admin/deals/${ctx.state.dealId}`);
          ctx.check(find(deal.json?.data, 'status') === 'cancelled', `Status ${find(deal.json?.data, 'status')}`);
        },
      },
      {
        id: 'reopen', name: 'A cancelled deal cannot change status', severity: 'normal', expected: 'HTTP 400',
        run: async ctx => ctx.expect(await ctx.call('admin', 'PATCH', `admin/deals/${ctx.state.dealId}/status`, { body: { status: 'in_progress' } }), [400], 'Status change refused', { stop: false }),
      },
    ],
  },

  {
    id: 'moderation',
    title: 'Flow C: admin moderation and intervention',
    steps: [
      { id: 'ref', name: 'Load categories and commodities', severity: 'critical', expected: 'A commodity with a unit is available', run: referenceData },
      {
        id: 'reject-post', name: 'Admin rejects a post with a reason', severity: 'critical', expected: 'HTTP 2xx, status rejected, seller notified',
        run: async ctx => {
          const p = await createSupply(ctx, { quantity: 20, label: 'post to reject' });
          ctx.expect(await ctx.call('admin', 'POST', `admin/posts/${p.id}/reject`, { body: { reason: 'Audit: photos missing' } }), [200, 201], 'Post rejected');
          ctx.check((await postStatus(ctx, 'seller', 'seller/supplies', p.id)) === 'rejected', 'Status rejected');
          await expectNotification(ctx, 'seller', 'rejected', p.id);
          const offer = await ctx.call('buyer', 'POST', 'buyer/supplies/make-request', { body: { listing_id: p.id, quantity: 5, price_option: 'USE_ORIGINAL', payment_terms: { type: 'FIXED', fixed_days: 15 }, delivery_terms: { days: 3 } } });
          ctx.expect(offer, [400, 403, 404], 'Offer on rejected post refused', { stop: false });
        },
      },
      {
        id: 'reject-no-reason', name: 'Rejecting without a reason is refused', severity: 'minor', expected: 'HTTP 400',
        run: async ctx => {
          const p = await createSupply(ctx, { quantity: 15, label: 'post for validation' });
          ctx.state.spare = p.id;
          ctx.expect(await ctx.call('admin', 'POST', `admin/posts/${p.id}/reject`, { body: {} }), [400], 'Missing reason refused', { stop: false });
        },
      },
      {
        id: 'send-back', name: 'Admin sends a post back for changes', severity: 'normal', expected: 'HTTP 2xx, status needs_revision, seller notified',
        run: async ctx => {
          ctx.expect(await ctx.call('admin', 'POST', `admin/posts/${ctx.state.spare}/send-back`, { body: { notes: 'Audit: please add grade details' } }), [200, 201], 'Sent back');
          ctx.check((await postStatus(ctx, 'seller', 'seller/supplies', ctx.state.spare)) === 'needs_revision', 'Status needs_revision');
          await expectNotification(ctx, 'seller', 'needs_revision', ctx.state.spare);
        },
      },
      {
        id: 'agent-cannot-approve', name: 'Non-admin cannot approve posts', severity: 'critical', expected: 'HTTP 401/403 with a user token',
        run: async ctx => ctx.expect(await ctx.call('buyer', 'POST', `admin/posts/${ctx.state.spare}/approve`), [401, 403], 'User approval refused', { stop: false }),
      },
      {
        id: 'intervene', name: 'Admin intervenes in a negotiation', severity: 'critical', expected: 'HTTP 2xx, offer ADMIN_REVIEW, both parties notified',
        run: async ctx => {
          const p = await createSupply(ctx, { quantity: 30, label: 'post for intervention' });
          await approve(ctx, p.id);
          const o = await ctx.call('buyer', 'POST', 'buyer/supplies/make-request', { body: { listing_id: p.id, quantity: 30, price_option: 'MAKE_OFFER', offered_price_per_unit: 3800, payment_terms: { type: 'FIXED', fixed_days: 15 }, delivery_terms: { days: 3 } } });
          ctx.expect(o, [200, 201], 'Offer created');
          ctx.state.offerId = find(o.json?.data, 'id');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/offers/${ctx.state.offerId}/intervene`, { body: { offered_price: 3950, note: 'Audit: market rate' } }), [200, 201], 'Admin intervened');
          ctx.check((await offerStatus(ctx, 'buyer', ctx.state.offerId)) === 'ADMIN_REVIEW', 'Offer status ADMIN_REVIEW');
          await expectNotification(ctx, 'buyer', 'offer.admin_review');
          await expectNotification(ctx, 'seller', 'offer.admin_review');
        },
      },
      {
        id: 'counter-blocked', name: 'Parties cannot counter after intervention', severity: 'normal', expected: 'HTTP 4xx',
        run: async ctx => ctx.expect(await ctx.call('seller', 'POST', `seller/offers/${ctx.state.offerId}/counter`, { body: { offered_price: 5000 } }), [400, 403], 'Counter refused', { stop: false }),
      },
      {
        id: 'final-offer', name: 'Admin finalises the deal at the admin price', severity: 'critical', expected: 'HTTP 2xx, deal created at 3,950',
        run: async ctx => {
          ctx.expect(await ctx.call('admin', 'POST', `admin/offers/${ctx.state.offerId}/final-offer`, { body: { offered_price: 3950, note: 'Audit final' } }), [200, 201], 'Final offer applied');
          const n = await expectNotification(ctx, 'buyer', 'offer.admin_finalized');
          if (n?.entity_id) {
            const deal = await ctx.call('admin', 'GET', `admin/deals/${n.entity_id}`);
            ctx.check(num(find(deal.json?.data, 'price_per_unit')) === 3950, `Deal price ${find(deal.json?.data, 'price_per_unit')}`);
          }
        },
      },
    ],
  },

  {
    id: 'account',
    title: 'Flow D: new user account to first post',
    steps: [
      {
        id: 'otp', name: 'Phone OTP is sent and verified', severity: 'critical', expected: 'otp/send 2xx; otp/verify returns valid: true',
        run: async ctx => {
          ctx.state.ts = Date.now().toString().slice(-7);
          ctx.state.phone = `+92300${ctx.state.ts}`;
          ctx.expect(await ctx.call(null, 'POST', 'auth/otp/send', { body: { phone: ctx.state.phone, channel: 'sms' } }), [200, 201], 'OTP sent');
          const v = await ctx.call(null, 'POST', 'auth/otp/verify', { body: { phone: ctx.state.phone, code: '123456' } });
          ctx.expect(v, [200, 201], 'OTP verified');
          ctx.check(find(v.json?.data, 'valid') === true, `valid: ${find(v.json?.data, 'valid')}`);
        },
      },
      {
        id: 'register', name: 'New user registers', severity: 'blocker', expected: 'HTTP 201 with token and user id',
        run: async ctx => {
          ctx.state.email = `audit.${ctx.state.ts}@naseeb.test`;
          ctx.state.password = 'Audit@1234';
          const res = await ctx.call(null, 'POST', 'auth/register', { form: { fullName: `Audit User ${ctx.state.ts}`, email: ctx.state.email, phone: ctx.state.phone, password: ctx.state.password, role: 'user', city: 'Lahore, Punjab', cnic: `35202-${ctx.state.ts}-1` } });
          ctx.expect(res, [200, 201], 'Registered');
          ctx.tokens.newuser = res.json?.data?.access_token;
          ctx.state.userId = res.json?.data?.user?.id;
          ctx.check(!!ctx.tokens.newuser && !!ctx.state.userId, `User ${String(ctx.state.userId).slice(0, 8)}…`);
          if (!ctx.state.userId) throw ctx.fail('No user id');
        },
      },
      {
        id: 'duplicate', name: 'Registering the same email again is refused', severity: 'normal', expected: 'HTTP 409',
        run: async ctx => ctx.expect(await ctx.call(null, 'POST', 'auth/register', { form: { fullName: 'Dup', email: ctx.state.email, phone: `+92301${ctx.state.ts}`, password: ctx.state.password, role: 'user' } }), [409], 'Duplicate refused', { stop: false }),
      },
      {
        id: 'weak-password', name: 'Weak password is refused at signup', severity: 'normal', expected: 'HTTP 400',
        run: async ctx => ctx.expect(await ctx.call(null, 'POST', 'auth/register', { form: { fullName: 'Weak', email: `weak.${ctx.state.ts}@naseeb.test`, phone: `+92302${ctx.state.ts}`, password: 'password', role: 'user' } }), [400], 'Weak password refused', { stop: false }),
      },
      {
        id: 'login', name: 'New user logs in', severity: 'blocker', expected: 'HTTP 201; auth/me returns the user',
        run: async ctx => {
          ctx.expect(await ctx.login('newuser', ctx.state.email, ctx.state.password), [200, 201], 'Logged in');
          const me = await ctx.call('newuser', 'GET', 'auth/me');
          ctx.check(find(me.json?.data, 'email') === ctx.state.email, `auth/me email ${find(me.json?.data, 'email')}`);
        },
      },
      {
        id: 'incomplete', name: 'Incomplete profile cannot create posts', severity: 'critical', expected: 'post/categories returns 403',
        run: async ctx => ctx.expect(await ctx.call('newuser', 'GET', 'post/categories'), [403], 'Blocked until profile is complete', { stop: false }),
      },
      {
        id: 'personal', name: 'User updates personal profile', severity: 'normal', expected: 'PATCH 2xx; city saved',
        run: async ctx => {
          ctx.expect(await ctx.call('newuser', 'PATCH', 'profile/personal', { body: { city: 'Multan, Punjab', date_of_birth: '1990-01-15' } }), [200, 201], 'Personal profile saved');
          const res = await ctx.call('newuser', 'GET', 'profile/personal');
          ctx.check(/Multan/.test(find(res.json?.data, 'city') ?? ''), `City ${find(res.json?.data, 'city')}`);
        },
      },
      {
        id: 'business', name: 'User fills business profile', severity: 'normal', expected: 'PATCH 2xx; business name saved',
        run: async ctx => {
          await ctx.call('newuser', 'GET', 'profile/business');
          ctx.expect(await ctx.call('newuser', 'PATCH', 'profile/business', { body: { business_name: `Audit Traders ${ctx.state.ts}`, business_type: 'Trader', primary_crop: 'Wheat' } }), [200, 201], 'Business profile saved');
          const res = await ctx.call('newuser', 'GET', 'profile/business');
          ctx.check(find(res.json?.data, 'business_name') === `Audit Traders ${ctx.state.ts}`, `Business ${find(res.json?.data, 'business_name')}`);
        },
      },
      {
        id: 'bank', name: 'User adds a bank account', severity: 'critical', expected: 'HTTP 2xx, bank account id returned',
        run: async ctx => {
          const banks = ctx.list(await ctx.call(null, 'GET', 'public/banks')) || [];
          const res = await ctx.call('newuser', 'POST', 'profile/personal/banking', { body: { bank_id: banks[0]?.id, account_title: `Audit User ${ctx.state.ts}`, bank_account_number: `0123${ctx.state.ts}`, bank_iban_number: `PK36SCBL000000${ctx.state.ts}02` } });
          ctx.expect(res, [200, 201], 'Bank account added');
          ctx.state.bankId = find(res.json?.data, 'id');
        },
      },
      {
        id: 'settings', name: 'User changes app and notification settings', severity: 'minor', expected: 'Values persist after reload',
        run: async ctx => {
          ctx.expect(await ctx.call('newuser', 'PATCH', 'profile/app-settings', { body: { language: 'ur' } }), [200, 201], 'App settings saved');
          ctx.check(find((await ctx.call('newuser', 'GET', 'profile/app-settings')).json?.data, 'language') === 'ur', 'Language is ur');
          ctx.expect(await ctx.call('newuser', 'PATCH', 'profile/notifications', { body: { promotion_alerts: false } }), [200, 201], 'Notification settings saved');
          ctx.check(find((await ctx.call('newuser', 'GET', 'profile/notifications')).json?.data, 'promotion_alerts') === false, 'Promotion alerts off');
        },
      },
      {
        id: 'device', name: 'Device token is registered and removed', severity: 'minor', expected: 'Both calls 2xx',
        run: async ctx => {
          const token = `audit-fake-token-${ctx.state.ts}`;
          ctx.expect(await ctx.call('newuser', 'POST', 'profile/device-token', { body: { token, device_name: 'Audit' } }), [200, 201], 'Token added');
          ctx.expect(await ctx.call('newuser', 'POST', 'profile/device-token/remove', { body: { token } }), [200, 201], 'Token removed');
        },
      },
      {
        id: 'kyc-alert', name: 'Admin gets a KYC request alert', severity: 'normal', expected: 'KYC_REQUEST alert for the new user',
        run: async ctx => {
          const hit = await ctx.poll(async () => (ctx.list(await ctx.call('admin', 'GET', 'admin/alerts', { query: { type: 'KYC_REQUEST', limit: 50 } })) || []).find(a => a.reference_id === ctx.state.userId));
          ctx.check(!!hit, hit ? `Alert "${hit.title ?? hit.type}"` : 'No KYC alert for the new user', 'warn');
        },
      },
      {
        id: 'approve', name: 'Admin approves basic, KYC, bank and business', severity: 'blocker', expected: 'All 2xx; profile completion 100',
        run: async ctx => {
          const u = ctx.state.userId;
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/users/${u}/basic`, { body: { action: 'approve' } }), [200, 201], 'Basic approved');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/users/${u}/kyc`, { body: { action: 'approve' } }), [200, 201], 'KYC approved');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/users/${u}/bank/${ctx.state.bankId}`, { body: { action: 'approve' } }), [200, 201], 'Bank approved');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/users/${u}/business`, { body: { action: 'approve' } }), [200, 201], 'Business approved');
          const done = await ctx.call('admin', 'GET', `admin/users/${u}`);
          ctx.check(num(find(done.json?.data, 'profile_completion')) === 100, `Profile completion ${find(done.json?.data, 'profile_completion')}`);
        },
      },
      {
        id: 'first-post', name: 'Approved user creates a first post', severity: 'critical', expected: 'post/categories 200; supply created',
        run: async ctx => {
          ctx.expect(await ctx.call('newuser', 'GET', 'post/categories'), [200], 'Post categories open');
          await referenceData(ctx);
          const c = ctx.state.commodity;
          ctx.expect(await ctx.call('newuser', 'POST', 'seller/supplies/create', { body: [{ category_id: c.category_id, commodity: c.id, quantity: 25, target_price: 4100, location: 'Multan, Punjab', delivery_options: 'EX_LOAD' }] }), [200, 201], 'First post created');
        },
      },
      {
        id: 'support', name: 'Support query: user asks, admin replies and closes', severity: 'normal', expected: 'Reply visible to user; closed query refuses new messages',
        run: async ctx => {
          const q = await ctx.call('newuser', 'POST', 'profile/queries', { body: { subject: 'Audit question', message: 'How long does KYC take?' } });
          ctx.expect(q, [200, 201], 'Query created');
          const qid = find(q.json?.data, 'id');
          ctx.expect(await ctx.call('admin', 'POST', `admin/user-queries/${qid}/reply`, { body: { content: 'Usually within 24 hours.' } }), [200, 201], 'Admin replied');
          const thread = await ctx.call('newuser', 'GET', `profile/queries/${qid}`);
          ctx.check(JSON.stringify(thread.json).includes('Usually within 24 hours.'), 'User sees the reply');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/user-queries/${qid}/close`), [200, 201], 'Query closed');
          ctx.expect(await ctx.call('newuser', 'POST', `profile/queries/${qid}/messages`, { body: { content: 'One more thing' } }), [400], 'Message on closed query refused', { stop: false });
        },
      },
      {
        id: 'password', name: 'User changes password', severity: 'critical', expected: 'New password works; old one is refused',
        run: async ctx => {
          ctx.expect(await ctx.call('newuser', 'POST', 'auth/change-password', { body: { current_password: ctx.state.password, new_password: 'Audit@5678' } }), [200, 201], 'Password changed');
          ctx.expect(await ctx.call(null, 'POST', 'auth/login', { body: { email: ctx.state.email, password: ctx.state.password } }), [401], 'Old password refused', { stop: false });
          ctx.expect(await ctx.login('newuser', ctx.state.email, 'Audit@5678'), [200, 201], 'New password works');
          ctx.state.password = 'Audit@5678';
          ctx.expect(await ctx.call(null, 'POST', 'auth/forgot-password', { body: { email: ctx.state.email } }), [200, 201], 'Forgot password accepted', { stop: false });
        },
      },
      {
        id: 'restrict', name: 'Admin restricts, then re-activates the user', severity: 'critical', expected: 'Login refused while restricted; works after activate',
        run: async ctx => {
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/users/${ctx.state.userId}/status`, { body: { action: 'restrict' } }), [200, 201], 'Restricted');
          ctx.expect(await ctx.call(null, 'POST', 'auth/login', { body: { email: ctx.state.email, password: ctx.state.password } }), [401, 403], 'Restricted user cannot log in', { stop: false });
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/users/${ctx.state.userId}/status`, { body: { action: 'activate' } }), [200, 201], 'Activated');
          ctx.expect(await ctx.call(null, 'POST', 'auth/login', { body: { email: ctx.state.email, password: ctx.state.password } }), [200, 201], 'Login works again');
          ctx.expect(await ctx.call('admin', 'POST', `admin/users/${ctx.state.userId}/notes`, { body: { note: 'Audit: account reviewed' } }), [200, 201], 'Admin note added', { stop: false });
        },
      },
    ],
  },

  {
    id: 'admin-crud',
    title: 'Flow E: admin catalogue, settings and team',
    steps: [
      {
        id: 'unit', name: 'Unit: create, update, delete', severity: 'normal', expected: 'All 2xx',
        run: async ctx => {
          const n = Math.floor(Math.random() * 9e5) + 1e5;
          ctx.state.n = n;
          const res = await ctx.call('admin', 'POST', 'admin/settings/units', { body: { name: `audit unit ${n}`, value: n } });
          ctx.expect(res, [200, 201], 'Unit created');
          const id = find(res.json?.data, 'id');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/settings/units/${id}`, { body: { value: n + 1 } }), [200, 201], 'Unit updated');
          ctx.expect(await ctx.call('admin', 'POST', 'admin/settings/units', { body: { name: `audit unit ${n}`, value: n + 7 } }), [409], 'Duplicate unit name refused', { stop: false });
          ctx.expect(await ctx.call('admin', 'DELETE', `admin/settings/units/${id}`), [200, 204], 'Unit deleted');
        },
      },
      {
        id: 'terms', name: 'Payment term and delivery option: create, update, delete', severity: 'normal', expected: 'All 2xx',
        run: async ctx => {
          const pt = await ctx.call('admin', 'POST', 'admin/settings/payment-terms', { body: { value: ctx.state.n, type: 'fixed_days' } });
          ctx.expect(pt, [200, 201], 'Payment term created');
          const ptId = find(pt.json?.data, 'id');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/settings/payment-terms/${ptId}`, { body: { is_active: false } }), [200, 201], 'Payment term updated');
          ctx.expect(await ctx.call('admin', 'DELETE', `admin/settings/payment-terms/${ptId}`), [200, 204], 'Payment term deleted');
          const d = await ctx.call('admin', 'POST', 'admin/settings/delivery-options', { body: { value: ctx.state.n } });
          ctx.expect(d, [200, 201], 'Delivery option created');
          const dId = find(d.json?.data, 'id');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/settings/delivery-options/${dId}`, { body: { value: ctx.state.n + 1 } }), [200, 201], 'Delivery option updated');
          ctx.expect(await ctx.call('admin', 'DELETE', `admin/settings/delivery-options/${dId}`), [200, 204], 'Delivery option deleted');
        },
      },
      {
        id: 'category', name: 'Category: create with image, update', severity: 'critical', expected: 'HTTP 2xx',
        run: async ctx => {
          const res = await ctx.call('admin', 'POST', 'admin/categories', { form: { name: `audit category ${ctx.state.n}`, is_active: 'true', image: testFile('category.png') } });
          ctx.expect(res, [200, 201], 'Category created');
          ctx.state.catId = find(res.json?.data, 'id');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/categories/${ctx.state.catId}`, { form: { name: `audit category ${ctx.state.n} edited` } }), [200, 201], 'Category updated');
          ctx.expect(await ctx.call('admin', 'POST', 'admin/categories', { form: { name: `audit category ${ctx.state.n}x` } }), [400], 'Category without image refused', { stop: false });
        },
      },
      {
        id: 'commodity', name: 'Commodity: create in the new category; visible publicly', severity: 'critical', expected: 'HTTP 2xx; listed in public/commodities',
        run: async ctx => {
          const units = ctx.list(await ctx.call('admin', 'GET', 'admin/settings/units')) || [];
          const res = await ctx.call('admin', 'POST', 'admin/commodities', {
            form: { name: `Audit Grain ${ctx.state.n}`, category_id: ctx.state.catId, default_unit_id: units.find(u => u.is_active !== false)?.id, buyer_commission_type: 'percentage', buyer_commission_value: 1, seller_commission_type: 'percentage', seller_commission_value: 1, grades: '["A","B"]', image: testFile('grain.png') },
          });
          ctx.expect(res, [200, 201], 'Commodity created');
          ctx.state.commodityId = find(res.json?.data, 'id');
          const pub = ctx.list(await ctx.call(null, 'GET', 'public/commodities', { query: { category_id: ctx.state.catId } })) || [];
          ctx.check(pub.some(c => c.id === ctx.state.commodityId), 'New commodity is listed publicly');
        },
      },
      {
        id: 'form', name: 'Form template: create, reorder, read publicly, delete', severity: 'normal', expected: 'All 2xx; public seller form returns the fields',
        run: async ctx => {
          const types = ctx.list(await ctx.call('admin', 'GET', 'admin/form-field-types')) || [];
          const res = await ctx.call('admin', 'POST', 'admin/form-templates', { body: { commodity_id: ctx.state.commodityId, form_type: 'supply', fields: types.slice(0, 2).map(t => ({ field_type_id: t.id, is_required: true })) } });
          ctx.expect(res, [200, 201], 'Template created');
          const id = find(res.json?.data, 'id');
          const tpl = await ctx.call('admin', 'GET', `admin/form-templates/${id}`);
          const fields = find(tpl.json?.data, 'fields') || [];
          if (fields.length > 1) ctx.expect(await ctx.call('admin', 'PATCH', `admin/form-templates/${id}/fields/reorder`, { body: { items: fields.map((f, i) => ({ id: f.id, sort_order: fields.length - i })) } }), [200, 201], 'Fields reordered', { stop: false });
          ctx.expect(await ctx.call(null, 'GET', `public/seller/form/${ctx.state.catId}`), [200], 'Public seller form', { stop: false });
          ctx.expect(await ctx.call('admin', 'DELETE', `admin/form-templates/${id}`), [200, 204], 'Template deleted');
        },
      },
      {
        id: 'mill', name: 'Mill: create, activate, set rates, history', severity: 'critical', expected: 'All 2xx; rate history has points',
        run: async ctx => {
          const res = await ctx.call('admin', 'POST', 'admin/mills', { body: { name: `Audit Mill ${ctx.state.n}`, city: 'Lahore', province: 'Punjab', status: 'pending', commodities: [{ commodity_id: ctx.state.commodityId }] } });
          ctx.expect(res, [200, 201], 'Mill created');
          ctx.state.millId = find(res.json?.data, 'id');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/mills/${ctx.state.millId}/complete`), [200, 201], 'Mill activated');
          const r1 = await ctx.call('admin', 'PATCH', `admin/mills/${ctx.state.millId}/commodities/${ctx.state.commodityId}/rate`, { body: { rate: 4100, notes: 'Audit' } });
          ctx.expect(r1, [200, 201], 'Rate set');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/mills/${ctx.state.millId}/commodities/${ctx.state.commodityId}/rate`, { body: { rate: 4200 } }), [200, 201], 'Rate updated');
          const rateId = find(r1.json?.data, 'id');
          const hist = await ctx.call(null, 'GET', `public/market-rates/${rateId}/history`, { query: { days: 30 } });
          ctx.expect(hist, [200], 'Public rate history', { stop: false });
          ctx.expect(await ctx.call('admin', 'GET', `admin/mills/${ctx.state.millId}/usage`), [200], 'Mill usage', { stop: false });
          ctx.expect(await ctx.call('admin', 'DELETE', `admin/mills/${ctx.state.millId}`), [200, 204], 'Mill deactivated');
        },
      },
      {
        id: 'cleanup', name: 'Delete the test commodity and category', severity: 'minor', expected: 'Both 2xx',
        run: async ctx => {
          ctx.expect(await ctx.call('admin', 'DELETE', `admin/commodities/${ctx.state.commodityId}`), [200, 204], 'Commodity deleted', { stop: false });
          ctx.expect(await ctx.call('admin', 'DELETE', `admin/categories/${ctx.state.catId}`), [200, 204, 400, 409], 'Category delete handled', { stop: false });
        },
      },
      {
        id: 'agent', name: 'Team: invite agent, module permissions enforced live', severity: 'blocker', expected: 'Agent sees only granted modules; grant and revoke apply immediately',
        run: async ctx => {
          const email = `audit.agent.${ctx.state.n}@naseeb.test`;
          const inv = await ctx.call('admin', 'POST', 'admin/team/invite', { body: { email, fullName: 'Audit Agent', password: 'Audit@1234', role: 'agent', module_keys: ['mills'] } });
          ctx.expect(inv, [200, 201], 'Agent invited');
          ctx.state.agentId = find(inv.json?.data, 'id');
          ctx.expect(await ctx.login('agent', email, 'Audit@1234', true), [200, 201], 'Agent logged in');
          ctx.expect(await ctx.call('agent', 'GET', 'admin/mills'), [200], 'Agent can open mills');
          ctx.expect(await ctx.call('agent', 'GET', 'admin/users'), [403], 'Agent cannot open users');
          ctx.expect(await ctx.call('admin', 'POST', `admin/team/${ctx.state.agentId}/permissions`, { body: { module_keys: ['users'] } }), [200, 201], 'Users module granted');
          ctx.expect(await ctx.call('agent', 'GET', 'admin/users'), [200], 'Agent can now open users');
          ctx.expect(await ctx.call('admin', 'DELETE', `admin/team/${ctx.state.agentId}/permissions/users`), [200, 204], 'Users module revoked');
          ctx.expect(await ctx.call('agent', 'GET', 'admin/users'), [403], 'Agent blocked again');
          ctx.expect(await ctx.call('admin', 'DELETE', `admin/team/${ctx.state.agentId}`), [200, 204], 'Agent removed');
          ctx.expect(await ctx.call('agent', 'GET', 'admin/mills'), [401, 403], 'Removed agent loses module access', { stop: false });
        },
      },
      {
        id: 'dispute', name: 'Dispute: move to under review and back', severity: 'normal', expected: 'Both 2xx',
        run: async ctx => {
          const open = (ctx.list(await ctx.call('admin', 'GET', 'admin/disputes', { query: { status: 'OPEN' } })) || [])[0];
          if (!open) return ctx.check(false, 'No OPEN dispute to test with', 'warn');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/disputes/${open.id}/resolve`, { body: { status: 'UNDER_REVIEW', resolution: 'Audit review' } }), [200, 201], 'Under review');
          ctx.expect(await ctx.call('admin', 'PATCH', `admin/disputes/${open.id}/resolve`, { body: { status: 'OPEN' } }), [200, 201], 'Reopened');
        },
      },
      {
        id: 'business-info', name: 'Business info saves (unchanged values)', severity: 'minor', expected: 'HTTP 2xx',
        run: async ctx => {
          const info = (await ctx.call('admin', 'GET', 'admin/dashboard/business-info')).json?.data?.data ?? {};
          const body = Object.fromEntries(['company_name', 'address', 'phone', 'email', 'website', 'logo_url'].filter(k => info[k]).map(k => [k, info[k]]));
          ctx.expect(await ctx.call('admin', 'PATCH', 'admin/dashboard/business-info', { body }), [200, 201], 'Business info saved');
        },
      },
      {
        id: 'export', name: 'Reports export as CSV', severity: 'minor', expected: 'HTTP 200 with CSV content',
        run: async ctx => {
          const res = await ctx.call('admin', 'GET', 'admin/reports/export', { query: { format: 'csv' } });
          ctx.expect(res, [200], 'CSV exported');
          ctx.check((res.text ?? '').length > 0 || res.bytes > 0, `${res.bytes} bytes`);
        },
      },
    ],
  },
];

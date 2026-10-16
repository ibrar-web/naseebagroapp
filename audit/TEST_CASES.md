# Naseeb Agri API: test case specification

73 test cases. Generated from `audit/api/suite.mjs`; run `npm run audit:api:cases` after editing the suite.
Severity scale: Blocker > Critical > Normal > Minor > Trivial.

## Auth & session

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-001 | Current user<br><sub>Splash, Profile</sub> | Functional | Blocker | `GET auth/me` | User | Call the endpoint | HTTP 200; returns an object; fields user.id, user.email, user.role; responds < 1 s |

## Home

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-002 | Featured categories<br><sub>Home > CategorySection</sub> | Functional | Normal | `GET public/featured-categories` | Optional | Call the endpoint | HTTP 200; returns a list; fields id, name, listings; responds < 1 s |
| TC-003 | Commodities in category | Integration (list → detail) | Normal | `GET public/commodities?category_id=:id` | Optional | Take the first record from "Featured categories" and open it | HTTP 200; fields id, name |
| TC-004 | Demand post form for category | Integration (list → detail) | Normal | `GET buyer/forms/demand/:id` | User | Take the first record from "Featured categories" and open it | HTTP 200 |
| TC-005 | Supply post form for category | Integration (list → detail) | Normal | `GET seller/forms/supply/:id` | User | Take the first record from "Featured categories" and open it | HTTP 200 |
| TC-006 | Home / profile stats<br><sub>Home, Profile</sub> | Functional | Normal | `GET profile/personal/stats` | User | Call the endpoint | HTTP 200; returns an object; fields seller, buyer; responds < 1 s |
| TC-007 | Market rates<br><sub>Home > MarketRates, Market Rates</sub> | Functional | Normal | `GET public/market-rates?page=1&limit=20` | None | Call the endpoint | HTTP 200; returns a list; fields id, name, mill, price; responds < 1 s |
| TC-008 | Rate history | Integration (list → detail) | Normal | `GET public/market-rates/:id/history` | None | Take the first record from "Market rates" and open it | HTTP 200 |
| TC-009 | Market rates (home strip)<br><sub>Not used by app</sub> | Functional | Normal | `GET public/market-rates/home` | None | Call the endpoint | HTTP 200; returns a list; fields id, name, price; responds < 1 s |

## Marketplace

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-010 | Browse supplies (buyer mode)<br><sub>Marketplace</sub> | Functional | Critical | `GET public/supplies?page=1&limit=20` | Optional | Call the endpoint | HTTP 200; returns a list; fields id, code, commodity, price_display, seller; responds < 1 s |
| TC-011 | Supply detail | Integration (list → detail) | Critical | `GET public/supplies/:id` | Optional | Take the first record from "Browse supplies (buyer mode)" and open it | HTTP 200; fields listing_id, code, commodity; listing_id equals the list record id |
| TC-012 | Browse demand (seller mode)<br><sub>Marketplace</sub> | Functional | Critical | `GET public/demand?page=1&limit=20` | Optional | Call the endpoint | HTTP 200; returns a list; fields id, code, commodity, price_display; responds < 1 s |
| TC-013 | Demand detail | Integration (list → detail) | Critical | `GET public/demand/:id` | Optional | Take the first record from "Browse demand (seller mode)" and open it | HTTP 200; fields listing_id, code, commodity; listing_id equals the list record id |
| TC-014 | Mills<br><sub>Post form > Mills</sub> | Functional | Critical | `GET public/mills?skip=0&limit=20` | None | Call the endpoint | HTTP 200; returns a list; fields id, name; responds < 1 s |
| TC-015 | Mill detail | Integration (list → detail) | Critical | `GET public/mills/:id` | None | Take the first record from "Mills" and open it | HTTP 200; fields id, name; id equals the list record id |
| TC-016 | Commodities<br><sub>Post form</sub> | Functional | Critical | `GET public/commodities` | None | Call the endpoint | HTTP 200; returns a list; fields id, name, category; responds < 1 s |
| TC-017 | Categories<br><sub>Not used by app</sub> | Functional | Critical | `GET public/categories` | None | Call the endpoint | HTTP 200; returns a list; fields id, name; responds < 1 s |
| TC-018 | Cities<br><sub>Signup, Post form (useCities)</sub> | Functional | Critical | `GET public/cities` | None | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-019 | Banks<br><sub>Payment setup, Payment methods</sub> | Functional | Critical | `GET public/banks` | None | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-020 | Trade configs (payment terms)<br><sub>Negotiation, Post form</sub> | Functional | Critical | `GET public/trade-configs?type=payment_term` | None | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-021 | Google Places autocomplete<br><sub>Location pickers</sub> | Functional | Critical | `GET public/places/autocomplete?input=Lahore&countryCode=pk` | None | Call the endpoint | HTTP 200; returns an object; responds < 1 s |

## My posts

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-022 | Post categories<br><sub>Pre-post</sub> | Functional | Normal | `GET post/categories` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, name; responds < 1 s |
| TC-023 | My demands<br><sub>Posts > Buyer tab</sub> | Functional | Normal | `GET buyer/demands?page=1&limit=20` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, code, status, commodity_name; responds < 1 s |
| TC-024 | Demand detail (owner) | Integration (list → detail) | Normal | `GET buyer/demands/:id` | User | Take the first record from "My demands" and open it | HTTP 200; fields id; id equals the list record id |
| TC-025 | My supplies<br><sub>Posts > Seller tab</sub> | Functional | Normal | `GET seller/supplies?page=1&limit=20` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, code, status, commodity_name; responds < 1 s |
| TC-026 | Supply detail (owner) | Integration (list → detail) | Normal | `GET seller/supplies/:id` | User | Take the first record from "My supplies" and open it | HTTP 200; fields id; id equals the list record id |
| TC-027 | Offers on my demands<br><sub>Posts > Buyer tab</sub> | Functional | Normal | `GET buyer/demands/offers` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, code, status; responds < 1 s |
| TC-028 | Offers on my supplies<br><sub>Posts > Seller tab</sub> | Functional | Normal | `GET seller/supplies/offers` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, code, status; responds < 1 s |
| TC-029 | Favourite listings<br><sub>Commodity detail</sub> | Functional | Normal | `GET buyer/supplies/favorites` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, post_id; responds < 1 s |

## Offers & negotiation

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-030 | Buyer offers<br><sub>Posts tab, Negotiation</sub> | Functional | Critical | `GET buyer/offers` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, code, status, offer_price; responds < 1 s |
| TC-031 | Buyer offer detail | Integration (list → detail) | Critical | `GET buyer/offers/:id` | User | Take the first record from "Buyer offers" and open it | HTTP 200; fields id; id equals the list record id |
| TC-032 | Seller offers<br><sub>Posts tab, Negotiation</sub> | Functional | Critical | `GET seller/offers` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, code, status, offer_price; responds < 1 s |
| TC-033 | Seller offer detail | Integration (list → detail) | Critical | `GET seller/offers/:id` | User | Take the first record from "Seller offers" and open it | HTTP 200; fields id; id equals the list record id |

## Deals

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-034 | Buy deals<br><sub>Deals</sub> | Functional | Critical | `GET buyer/buydeals` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, code, status, total_amount; responds < 1 s |
| TC-035 | Buy deal detail | Integration (list → detail) | Critical | `GET buyer/buydeals/:id` | User | Take the first record from "Buy deals" and open it | HTTP 200; fields deal_id, code, status; deal_id equals the list record id |
| TC-036 | Buy deal payments | Integration (list → detail) | Critical | `GET buyer/buydeals/:id/payments` | User | Take the first record from "Buy deals" and open it | HTTP 200 |
| TC-037 | Buy deal trucks | Integration (list → detail) | Critical | `GET buyer/buydeals/:id/trucks` | User | Take the first record from "Buy deals" and open it | HTTP 200 |
| TC-038 | Sell deals<br><sub>Deals</sub> | Functional | Critical | `GET seller/selldeals` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, code, status, total_amount; responds < 1 s |
| TC-039 | Sell deal detail | Integration (list → detail) | Critical | `GET seller/selldeals/:id` | User | Take the first record from "Sell deals" and open it | HTTP 200; fields deal_id, code, status; deal_id equals the list record id |
| TC-040 | Sell deal payments | Integration (list → detail) | Critical | `GET seller/selldeals/:id/payments` | User | Take the first record from "Sell deals" and open it | HTTP 200 |
| TC-041 | Sell deal trucks | Integration (list → detail) | Critical | `GET seller/selldeals/:id/trucks` | User | Take the first record from "Sell deals" and open it | HTTP 200 |

## Profile

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-042 | Personal profile<br><sub>Personal info, KYC</sub> | Functional | Normal | `GET profile/personal` | User | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-043 | Verification status<br><sub>Verification status</sub> | Functional | Normal | `GET profile/personal/verification-status` | User | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-044 | Business profile<br><sub>Business profile</sub> | Functional | Normal | `GET profile/business` | User | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-045 | Bank accounts<br><sub>Payment methods</sub> | Functional | Normal | `GET profile/personal/banking` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, bank, status; responds < 1 s |
| TC-046 | Payment history<br><sub>Payment history</sub> | Functional | Normal | `GET profile/personal/payment-history` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, amount, status; responds < 1 s |
| TC-047 | App settings<br><sub>App settings</sub> | Functional | Normal | `GET profile/app-settings` | User | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-048 | Notification settings<br><sub>Notification settings</sub> | Functional | Normal | `GET profile/notifications` | User | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-049 | Notifications<br><sub>Notifications</sub> | Functional | Normal | `GET profile/notifications/list?limit=50&offset=0` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, title, is_read; responds < 1 s |
| TC-050 | Saved listings<br><sub>Saved listings</sub> | Functional | Normal | `GET profile/saved-listings?limit=50&offset=0` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, post_id, listing; responds < 1 s |
| TC-051 | My ratings<br><sub>My ratings</sub> | Functional | Normal | `GET profile/ratings/my` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, score; responds < 1 s |

## Support

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-052 | My disputes<br><sub>Disputes & queries</sub> | Functional | Minor | `GET profile/disputes/my` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, code, status; responds < 1 s |
| TC-053 | Dispute detail | Integration (list → detail) | Minor | `GET profile/disputes/:id` | User | Take the first record from "My disputes" and open it | HTTP 200; fields id; id equals the list record id |
| TC-054 | My support queries<br><sub>Disputes & queries</sub> | Functional | Minor | `GET profile/queries` | User | Call the endpoint; try each test account until one returns records | HTTP 200; returns a list; fields id, code, subject, status; responds < 1 s |
| TC-055 | Query thread | Integration (list → detail) | Minor | `GET profile/queries/:id` | User | Take the first record from "My support queries" and open it | HTTP 200; fields id; id equals the list record id |

## Negative tests

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-056 | Protected route without token | Negative | Blocker | `GET buyer/offers` | None | Send the invalid request | HTTP 401 |
| TC-057 | Forged token | Negative | Blocker | `GET auth/me` | Forged | Send the invalid request | HTTP 401 |
| TC-058 | User token on admin route | Negative | Blocker | `GET admin/users` | User | Send the invalid request | HTTP 403 |
| TC-059 | Non-numeric limit is rejected | Negative | Normal | `GET buyer/buydeals?limit=abc` | User | Send the invalid request | HTTP 400 |
| TC-060 | Unknown supply id returns 404 | Negative | Minor | `GET public/supplies/00000000-0000-0000-0000-000000000000` | None | Send the invalid request | HTTP 404 or 400 |
| TC-061 | Unknown route returns 404 | Negative | Trivial | `GET does-not-exist` | None | Send the invalid request | HTTP 404 |
| TC-062 | Wrong password returns 401 | Negative | Critical | `POST auth/login` | None | Send the invalid request | HTTP 401 |

## Security

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-063 | OTP 123456 must not verify | Security | Critical | `POST auth/otp/verify` | None | Send the request | valid: false for an unissued code |
| TC-064 | API docs not public | Security | Minor | `GET docs` | None | Send the request | Not HTTP 200 (docs hidden or protected) |

## Real-time

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-065 | Socket connects with a valid token | Integration | Critical | `WS /` | User | Open a socket.io connection with the user token | Connected and still connected after 1.5 s |
| TC-066 | Socket rejects a forged token | Security | Critical | `WS /` | Forged | Open a socket.io connection with a forged token | Connection refused or closed |

## Write flows

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-067 | Save then unsave a listing | End-to-end (reversible) | Critical | `POST, DELETE profile/saved-listings/:id` | User | POST then DELETE profile/saved-listings/:id | Listing appears after save and is gone after unsave <sub>(--write)</sub> |
| TC-068 | Favourite then unfavourite a listing | End-to-end (reversible) | Critical | `POST, DELETE buyer/supplies/favorites/:id` | User | POST then DELETE buyer/supplies/favorites/:id | Listing appears after add and is gone after remove <sub>(--write)</sub> |
| TC-069 | Pause then resume my supply post | End-to-end (reversible) | Critical | `PATCH seller/supplies/:id/toggle-active` | User | PATCH seller/supplies/:id/toggle-active twice | Both calls 2xx; post ends in its original state <sub>(--write)</sub> |

## Performance

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-070 | 25 concurrent requests: public/supplies | Load | Normal | `GET public/supplies?page=1&limit=20` | None | Send 25 requests at once | All HTTP 200; p95 < 1 s (fails > 3 s) <sub>(--load)</sub> |
| TC-071 | 25 concurrent requests: public/demand | Load | Normal | `GET public/demand?page=1&limit=20` | None | Send 25 requests at once | All HTTP 200; p95 < 1 s (fails > 3 s) <sub>(--load)</sub> |
| TC-072 | 25 concurrent requests: public/featured-categories | Load | Normal | `GET public/featured-categories` | None | Send 25 requests at once | All HTTP 200; p95 < 1 s (fails > 3 s) <sub>(--load)</sub> |
| TC-073 | 25 concurrent requests: public/market-rates | Load | Normal | `GET public/market-rates?page=1&limit=20` | None | Send 25 requests at once | All HTTP 200; p95 < 1 s (fails > 3 s) <sub>(--load)</sub> |

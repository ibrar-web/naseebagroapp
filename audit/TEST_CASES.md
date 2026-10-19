# Naseeb Agri API: test case specification

254 test cases. Generated from `audit/api/suite.mjs`; run `npm run audit:api:cases` after editing the suite.
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

## Admin: dashboard & reports

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-056 | Dashboard (own profile)<br><sub>Admin dashboard</sub> | Functional | Normal | `GET admin/dashboard` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-057 | Activity feed<br><sub>Admin dashboard</sub> | Functional | Normal | `GET admin/dashboard/activity` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-058 | Business info<br><sub>Admin settings</sub> | Functional | Normal | `GET admin/dashboard/business-info` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-059 | Admin notification settings<br><sub>Admin settings</sub> | Functional | Normal | `GET admin/dashboard/settings/notifications` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-060 | Reports overview<br><sub>Reports</sub> | Functional | Normal | `GET admin/reports/overview` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-061 | Reports dashboard<br><sub>Reports</sub> | Functional | Normal | `GET admin/reports/dashboard` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-062 | Reports summary (monthly)<br><sub>Reports</sub> | Functional | Normal | `GET admin/reports/summary?period=monthly` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-063 | Alerts<br><sub>Alerts</sub> | Functional | Normal | `GET admin/alerts` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-064 | Alerts summary<br><sub>Alerts</sub> | Functional | Normal | `GET admin/alerts/summary` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |

## Admin: users

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-065 | Users<br><sub>Users</sub> | Functional | Critical | `GET admin/users` | Admin | Call the endpoint | HTTP 200; returns a list; fields id, email; responds < 1 s |
| TC-066 | User detail | Integration (list → detail) | Critical | `GET admin/users/:id` | Admin | Take the first record from "Users" and open it | HTTP 200 |
| TC-067 | User listings | Integration (list → detail) | Critical | `GET admin/users/:id/listings` | Admin | Take the first record from "Users" and open it | HTTP 200 |
| TC-068 | User offers | Integration (list → detail) | Critical | `GET admin/users/:id/offers` | Admin | Take the first record from "Users" and open it | HTTP 200 |
| TC-069 | User deals | Integration (list → detail) | Critical | `GET admin/users/:id/deals` | Admin | Take the first record from "Users" and open it | HTTP 200 |
| TC-070 | User stats<br><sub>Users</sub> | Functional | Critical | `GET admin/users/stats` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-071 | Team members<br><sub>Team</sub> | Functional | Critical | `GET admin/team` | Admin | Call the endpoint | HTTP 200; returns a list; fields id; responds < 1 s |
| TC-072 | Team member detail | Integration (list → detail) | Critical | `GET admin/team/:id` | Admin | Take the first record from "Team members" and open it | HTTP 200 |
| TC-073 | Team member permissions | Integration (list → detail) | Critical | `GET admin/team/:id/permissions` | Admin | Take the first record from "Team members" and open it | HTTP 200 |
| TC-074 | Permission modules<br><sub>Team</sub> | Functional | Critical | `GET admin/team/modules` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-075 | Audit logs<br><sub>Team</sub> | Functional | Critical | `GET admin/team/audit-logs?limit=20` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |

## Admin: catalogue & settings

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-076 | Categories<br><sub>Categories</sub> | Functional | Normal | `GET admin/categories` | Admin | Call the endpoint | HTTP 200; returns a list; fields id, name; responds < 1 s |
| TC-077 | Category detail | Integration (list → detail) | Normal | `GET admin/categories/:id` | Admin | Take the first record from "Categories" and open it | HTTP 200 |
| TC-078 | Commodities in category | Integration (list → detail) | Normal | `GET admin/categories/:id/commodities` | Admin | Take the first record from "Categories" and open it | HTTP 200 |
| TC-079 | Categories (dropdown)<br><sub>Categories</sub> | Functional | Normal | `GET admin/categories/all` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-080 | Commodities<br><sub>Commodities</sub> | Functional | Normal | `GET admin/commodities` | Admin | Call the endpoint | HTTP 200; returns a list; fields id, name; responds < 1 s |
| TC-081 | Commodity detail | Integration (list → detail) | Normal | `GET admin/commodities/:id` | Admin | Take the first record from "Commodities" and open it | HTTP 200 |
| TC-082 | Commodities (dropdown)<br><sub>Commodities</sub> | Functional | Normal | `GET admin/commodities/all` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-083 | Mills<br><sub>Mills</sub> | Functional | Normal | `GET admin/mills` | Admin | Call the endpoint | HTTP 200; returns a list; fields id, name; responds < 1 s |
| TC-084 | Mill detail | Integration (list → detail) | Normal | `GET admin/mills/:id` | Admin | Take the first record from "Mills" and open it | HTTP 200 |
| TC-085 | Mill usage | Integration (list → detail) | Normal | `GET admin/mills/:id/usage` | Admin | Take the first record from "Mills" and open it | HTTP 200 |
| TC-086 | Mill commodity rates | Integration (list → detail) | Normal | `GET admin/mills/:id/commodity-rates` | Admin | Take the first record from "Mills" and open it | HTTP 200 |
| TC-087 | Pending mills<br><sub>Mills</sub> | Functional | Normal | `GET admin/mills/pending` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-088 | Mill rate list<br><sub>Market rates</sub> | Functional | Normal | `GET admin/mills/rate-list` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-089 | Form field types<br><sub>Form builder</sub> | Functional | Normal | `GET admin/form-field-types` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-090 | Form templates<br><sub>Form builder</sub> | Functional | Normal | `GET admin/form-templates` | Admin | Call the endpoint | HTTP 200; returns a list; fields id; responds < 1 s |
| TC-091 | Form template detail | Integration (list → detail) | Normal | `GET admin/form-templates/:id` | Admin | Take the first record from "Form templates" and open it | HTTP 200 |
| TC-092 | Units<br><sub>Settings</sub> | Functional | Normal | `GET admin/settings/units` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-093 | Payment terms<br><sub>Settings</sub> | Functional | Normal | `GET admin/settings/payment-terms` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-094 | Delivery options<br><sub>Settings</sub> | Functional | Normal | `GET admin/settings/delivery-options` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |

## Admin: trading

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-095 | All posts<br><sub>Listings</sub> | Functional | Critical | `GET admin/posts` | Admin | Call the endpoint | HTTP 200; returns a list; fields id; responds < 1 s |
| TC-096 | Post detail | Integration (list → detail) | Critical | `GET admin/posts/:id` | Admin | Take the first record from "All posts" and open it | HTTP 200 |
| TC-097 | Supply posts<br><sub>Listings</sub> | Functional | Critical | `GET admin/posts/supply` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-098 | Demand posts<br><sub>Listings</sub> | Functional | Critical | `GET admin/posts/demand` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-099 | Offers<br><sub>Offers</sub> | Functional | Critical | `GET admin/offers` | Admin | Call the endpoint | HTTP 200; returns a list; fields id; responds < 1 s |
| TC-100 | Offer detail | Integration (list → detail) | Critical | `GET admin/offers/:id` | Admin | Take the first record from "Offers" and open it | HTTP 200 |
| TC-101 | Deals<br><sub>Deals</sub> | Functional | Critical | `GET admin/deals` | Admin | Call the endpoint | HTTP 200; returns a list; fields id; responds < 1 s |
| TC-102 | Deal | Integration (list → detail) | Critical | `GET admin/deals/:id` | Admin | Take the first record from "Deals" and open it | HTTP 200 |
| TC-103 | Deal full detail | Integration (list → detail) | Critical | `GET admin/deals/:id/detail` | Admin | Take the first record from "Deals" and open it | HTTP 200 |
| TC-104 | Deal trucks | Integration (list → detail) | Critical | `GET admin/deals/:id/trucks` | Admin | Take the first record from "Deals" and open it | HTTP 200 |
| TC-105 | Deal payments | Integration (list → detail) | Critical | `GET admin/deals/:id/payments` | Admin | Take the first record from "Deals" and open it | HTTP 200 |
| TC-106 | Deal stats<br><sub>Deals</sub> | Functional | Critical | `GET admin/deals/stats` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-107 | Payments<br><sub>Payments</sub> | Functional | Critical | `GET admin/payments` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |
| TC-108 | Payment stats<br><sub>Payments</sub> | Functional | Critical | `GET admin/payments/stats` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-109 | Earnings breakdown<br><sub>Payments</sub> | Functional | Critical | `GET admin/payments/earnings-breakdown` | Admin | Call the endpoint | HTTP 200; returns an object; responds < 1 s |
| TC-110 | Payments by deal<br><sub>Payments</sub> | Functional | Critical | `GET admin/payments/by-deal` | Admin | Call the endpoint | HTTP 200; returns a list; responds < 1 s |

## Admin: support

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-111 | Disputes<br><sub>Disputes</sub> | Functional | Normal | `GET admin/disputes` | Admin | Call the endpoint | HTTP 200; returns a list; fields id; responds < 1 s |
| TC-112 | Dispute detail | Integration (list → detail) | Normal | `GET admin/disputes/:id` | Admin | Take the first record from "Disputes" and open it | HTTP 200 |
| TC-113 | User queries<br><sub>Support</sub> | Functional | Normal | `GET admin/user-queries` | Admin | Call the endpoint | HTTP 200; returns a list; fields id; responds < 1 s |
| TC-114 | Query thread | Integration (list → detail) | Normal | `GET admin/user-queries/:id` | Admin | Take the first record from "User queries" and open it | HTTP 200 |
| TC-115 | Ratings<br><sub>Ratings</sub> | Functional | Normal | `GET admin/ratings` | Admin | Call the endpoint | HTTP 200; returns a list; fields id; responds < 1 s |
| TC-116 | Rating detail | Integration (list → detail) | Normal | `GET admin/ratings/:id` | Admin | Take the first record from "Ratings" and open it | HTTP 200 |

## Negative tests

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-117 | Protected route without token | Negative | Blocker | `GET buyer/offers` | None | Send the invalid request | HTTP 401 |
| TC-118 | Forged token | Negative | Blocker | `GET auth/me` | Forged | Send the invalid request | HTTP 401 |
| TC-119 | User token on admin route | Negative | Blocker | `GET admin/users` | User | Send the invalid request | HTTP 403 |
| TC-120 | Non-numeric limit is rejected | Negative | Minor | `GET buyer/buydeals?limit=abc` | User | Send the invalid request | HTTP 400 |
| TC-121 | Unknown supply id returns 404 | Negative | Minor | `GET public/supplies/00000000-0000-0000-0000-000000000000` | None | Send the invalid request | HTTP 404 or 400 |
| TC-122 | Unknown route returns 404 | Negative | Trivial | `GET does-not-exist` | None | Send the invalid request | HTTP 404 |
| TC-123 | Wrong password returns 401 | Negative | Critical | `POST auth/login` | None | Send the invalid request | HTTP 401 |
| TC-124 | Login with empty body is rejected | Negative | Normal | `POST auth/login` | None | Send the invalid request | HTTP 400 |
| TC-125 | Login with invalid email format is rejected | Negative | Minor | `POST auth/login` | None | Send the invalid request | HTTP 400 |
| TC-126 | Login with too-short password is rejected | Negative | Minor | `POST auth/login` | None | Send the invalid request | HTTP 400 |
| TC-127 | Malformed JSON body is rejected | Negative | Normal | `POST auth/login` | None | Send the raw body | HTTP 400 |
| TC-128 | Non-JSON content type is rejected | Negative | Minor | `POST auth/login` | None | Send the raw body | HTTP 400 or 415 |
| TC-129 | Oversized request body (2 MB) is rejected | Negative | Normal | `POST auth/login` | None | Send the raw body | HTTP 413 |
| TC-130 | Invalid id format on public detail is rejected | Negative | Minor | `GET public/supplies/not-a-uuid` | None | Send the invalid request | HTTP 400 or 404 |
| TC-131 | Invalid id format on private detail is rejected | Negative | Minor | `GET buyer/buydeals/not-a-uuid` | User | Send the invalid request | HTTP 400 or 404 |
| TC-132 | Negative skip is rejected | Negative | Minor | `GET buyer/buydeals?skip=-1` | User | Send the invalid request | HTTP 400 |
| TC-133 | Negative page is rejected | Negative | Minor | `GET public/supplies?page=-1` | None | Send the invalid request | HTTP 400 |
| TC-134 | Unknown status filter is rejected | Negative | Normal | `GET buyer/buydeals?status=zzz` | User | Send the invalid request | HTTP 400 |
| TC-135 | Page size above the maximum is rejected | Negative | Normal | `GET public/supplies?limit=100000` | None | Send the invalid request | HTTP 400 |
| TC-136 | Over-long search text is rejected | Negative | Minor | `GET public/supplies?search=aaaaaaaaaaaa…(5000+chars)` | None | Send the invalid request | HTTP 400 |
| TC-137 | Unsupported HTTP method is rejected | Negative | Minor | `DELETE public/categories` | None | Send the invalid request | HTTP 404 or 405 |

## Security

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-138 | Cannot open another user's buy deal | API1:2023 Broken Object Level Authorization | Blocker | `GET buyer/buydeals/:id` | User B | Take a record from account A's buyer/buydeals; request it with account B's token | HTTP 403 or 404 for a record owned by another account |
| TC-139 | Cannot open another user's deal payments | API1:2023 Broken Object Level Authorization | Blocker | `GET buyer/buydeals/:id/payments` | User B | Take a record from account A's buyer/buydeals; request it with account B's token | HTTP 403 or 404 for a record owned by another account |
| TC-140 | Cannot open another user's deal trucks | API1:2023 Broken Object Level Authorization | Critical | `GET buyer/buydeals/:id/trucks` | User B | Take a record from account A's buyer/buydeals; request it with account B's token | HTTP 403 or 404 for a record owned by another account |
| TC-141 | Cannot open another user's sell deal | API1:2023 Broken Object Level Authorization | Blocker | `GET seller/selldeals/:id` | User B | Take a record from account A's seller/selldeals; request it with account B's token | HTTP 403 or 404 for a record owned by another account |
| TC-142 | Cannot open another user's buyer offer | API1:2023 Broken Object Level Authorization | Critical | `GET buyer/offers/:id` | User B | Take a record from account A's buyer/offers; request it with account B's token | HTTP 403 or 404 for a record owned by another account |
| TC-143 | Cannot open another user's seller offer | API1:2023 Broken Object Level Authorization | Critical | `GET seller/offers/:id` | User B | Take a record from account A's seller/offers; request it with account B's token | HTTP 403 or 404 for a record owned by another account |
| TC-144 | Cannot open another user's demand (owner view) | API1:2023 Broken Object Level Authorization | Critical | `GET buyer/demands/:id` | User B | Take a record from account A's buyer/demands; request it with account B's token | HTTP 403 or 404 for a record owned by another account |
| TC-145 | Cannot open another user's supply (owner view) | API1:2023 Broken Object Level Authorization | Critical | `GET seller/supplies/:id` | User B | Take a record from account A's seller/supplies; request it with account B's token | HTTP 403 or 404 for a record owned by another account |
| TC-146 | Cannot open another user's dispute | API1:2023 Broken Object Level Authorization | Critical | `GET profile/disputes/:id` | User B | Take a record from account A's profile/disputes/my; request it with account B's token | HTTP 403 or 404 for a record owned by another account |
| TC-147 | Cannot open another user's support query | API1:2023 Broken Object Level Authorization | Critical | `GET profile/queries/:id` | User B | Take a record from account A's profile/queries; request it with account B's token | HTTP 403 or 404 for a record owned by another account |
| TC-148 | Unsigned (alg "none") token is rejected | API2:2023 Broken Authentication | Blocker | `GET auth/me` | Alg-none | Send the request | HTTP 401 |
| TC-149 | Token with edited role is rejected | API2:2023 Broken Authentication | Blocker | `GET admin/users` | Tampered | Send the request | HTTP 401 or 403 |
| TC-150 | Empty Bearer header is rejected | API2:2023 Broken Authentication | Critical | `GET auth/me` | None | Send the request | HTTP 401 |
| TC-151 | Wrong auth scheme (Basic) is rejected | API2:2023 Broken Authentication | Critical | `GET auth/me` | None | Send the request | HTTP 401 |
| TC-152 | Login does not reveal which emails exist | API2:2023 Broken Authentication | Normal | `POST auth/login` | None | Log in with an unknown email, then with a real email and wrong password; compare responses | Same status and message for unknown email and wrong password |
| TC-153 | Inactive and KYC-rejected accounts cannot log in | API2:2023 Broken Authentication | Critical | `POST auth/login` | None | Log in with each inactive / KYC-rejected account in AUDIT_BLOCKED_USERS | HTTP 401 or 403 for every account in AUDIT_BLOCKED_USERS |
| TC-154 | No response contains password hashes or secret tokens | API3:2023 Broken Object Property Level Authorization | Critical | `GET (all responses in this run)` | None | Scan every response collected in this run for secret field names | No keys named password, password_hash, salt, reset_token, refresh_token or otp in any response |
| TC-155 | Public listings do not expose seller contact details | API3:2023 Broken Object Property Level Authorization | Normal | `GET public/supplies` | None | Check the seller object on public listings | Public listing seller has no email, phone, CNIC or address |
| TC-156 | Admin module blocked for users: admin/users | API5:2023 Broken Function Level Authorization | Blocker | `GET admin/users` | None, User | Request without a token, then with a normal user token | HTTP 401 without token; HTTP 403 with a user token |
| TC-157 | Admin module blocked for users: admin/deals | API5:2023 Broken Function Level Authorization | Blocker | `GET admin/deals` | None, User | Request without a token, then with a normal user token | HTTP 401 without token; HTTP 403 with a user token |
| TC-158 | Admin module blocked for users: admin/payments | API5:2023 Broken Function Level Authorization | Blocker | `GET admin/payments` | None, User | Request without a token, then with a normal user token | HTTP 401 without token; HTTP 403 with a user token |
| TC-159 | Admin module blocked for users: admin/offers | API5:2023 Broken Function Level Authorization | Blocker | `GET admin/offers` | None, User | Request without a token, then with a normal user token | HTTP 401 without token; HTTP 403 with a user token |
| TC-160 | Admin module blocked for users: admin/team | API5:2023 Broken Function Level Authorization | Blocker | `GET admin/team` | None, User | Request without a token, then with a normal user token | HTTP 401 without token; HTTP 403 with a user token |
| TC-161 | Admin module blocked for users: admin/reports/overview | API5:2023 Broken Function Level Authorization | Blocker | `GET admin/reports/overview` | None, User | Request without a token, then with a normal user token | HTTP 401 without token; HTTP 403 with a user token |
| TC-162 | SQL injection text in public search is handled safely | API8:2023 Security Misconfiguration (injection) | Critical | `GET public/supplies?search='+OR+1=1--` | None | Send the request | HTTP 200 or 400 (never 500) |
| TC-163 | SQL injection text in deal search returns no extra data | API8:2023 Security Misconfiguration (injection) | Critical | `GET buyer/buydeals?search='+OR+'1'='1` | User | Send the request | HTTP 200 with no matches, or 400 |
| TC-164 | Server errors do not leak stack traces or SQL | API8:2023 Security Misconfiguration | Normal | `GET buyer/buydeals?status=zzz` | User | Send the request | Error body has no stack trace, SQL or file paths |
| TC-165 | CORS does not trust unknown origins | API8:2023 Security Misconfiguration | Normal | `GET public/categories` | None | Send the request | No Access-Control-Allow-Origin for an unknown origin |
| TC-166 | Plain HTTP redirects to HTTPS | API8:2023 Security Misconfiguration | Normal | `GET public/categories` | None | Request the same URL over plain http:// | HTTP 301/308 to an https:// URL |
| TC-167 | API docs are reachable | Security | Minor | `GET docs` | None | Send the request | HTTP 200 (Swagger UI available) |

## Real-time

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-168 | Socket connects with a valid token | Integration | Critical | `WS /` | User | Open a socket.io connection with the user token | Connected and still connected after 1.5 s |
| TC-169 | Socket rejects a forged token | Security | Critical | `WS /` | Forged | Open a socket.io connection with a forged token | Connection refused or closed |

## Write flows

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-170 | Save then unsave a listing | End-to-end (reversible) | Critical | `POST, DELETE profile/saved-listings/:id` | User | POST then DELETE profile/saved-listings/:id | Listing appears after save and is gone after unsave <sub>(--write)</sub> |
| TC-171 | Favourite then unfavourite a listing | End-to-end (reversible) | Critical | `POST, DELETE buyer/supplies/favorites/:id` | User | POST then DELETE buyer/supplies/favorites/:id | Listing appears after add and is gone after remove <sub>(--write)</sub> |
| TC-172 | Pause then resume my supply post | End-to-end (reversible) | Critical | `PATCH seller/supplies/:id/toggle-active` | User | PATCH seller/supplies/:id/toggle-active twice | Both calls 2xx; post ends in its original state <sub>(--write)</sub> |

## Performance

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-173 | 25 concurrent requests: public/supplies | Load | Normal | `GET public/supplies?page=1&limit=20` | None | Send 25 requests at once | All HTTP 200; p95 < 1 s (fails > 3 s) <sub>(--load)</sub> |
| TC-174 | 25 concurrent requests: public/demand | Load | Normal | `GET public/demand?page=1&limit=20` | None | Send 25 requests at once | All HTTP 200; p95 < 1 s (fails > 3 s) <sub>(--load)</sub> |
| TC-175 | 25 concurrent requests: public/featured-categories | Load | Normal | `GET public/featured-categories` | None | Send 25 requests at once | All HTTP 200; p95 < 1 s (fails > 3 s) <sub>(--load)</sub> |
| TC-176 | 25 concurrent requests: public/market-rates | Load | Normal | `GET public/market-rates?page=1&limit=20` | None | Send 25 requests at once | All HTTP 200; p95 < 1 s (fails > 3 s) <sub>(--load)</sub> |

## Flow A: supply post to closed deal

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-177 | Load categories and commodities | End-to-end flow | Critical | `FLOW supply-trade / ref` | Seller, buyer, admin | Load categories and commodities | A commodity with a unit is available <sub>(--flows)</sub> |
| TC-178 | Seller creates a supply post | End-to-end flow | Blocker | `FLOW supply-trade / create` | Seller, buyer, admin | Seller creates a supply post | HTTP 201, post id returned, status pending <sub>(--flows)</sub> |
| TC-179 | Pending post is not public | End-to-end flow | Critical | `FLOW supply-trade / hidden` | Seller, buyer, admin | Pending post is not public | Not listed in public/supplies before approval <sub>(--flows)</sub> |
| TC-180 | Offer on an unapproved post is refused | End-to-end flow | Critical | `FLOW supply-trade / offer-before-approval` | Seller, buyer, admin | Offer on an unapproved post is refused | HTTP 400 <sub>(--flows)</sub> |
| TC-181 | Admin approves the post | End-to-end flow | Blocker | `FLOW supply-trade / approve` | Seller, buyer, admin | Admin approves the post | HTTP 200/201 <sub>(--flows)</sub> |
| TC-182 | Seller is notified of approval | End-to-end flow | Normal | `FLOW supply-trade / notify-approved` | Seller, buyer, admin | Seller is notified of approval | Notification type "approved" for the post <sub>(--flows)</sub> |
| TC-183 | Approved post is public | End-to-end flow | Critical | `FLOW supply-trade / public` | Seller, buyer, admin | Approved post is public | public/supplies/:id returns 200 <sub>(--flows)</sub> |
| TC-184 | Buyer makes an offer | End-to-end flow | Blocker | `FLOW supply-trade / offer` | Seller, buyer, admin | Buyer makes an offer | HTTP 201, offer PENDING <sub>(--flows)</sub> |
| TC-185 | Second offer on the same post is refused | End-to-end flow | Normal | `FLOW supply-trade / duplicate-offer` | Seller, buyer, admin | Second offer on the same post is refused | HTTP 409 <sub>(--flows)</sub> |
| TC-186 | Seller cannot offer on own post | End-to-end flow | Normal | `FLOW supply-trade / own-post` | Seller, buyer, admin | Seller cannot offer on own post | HTTP 403 <sub>(--flows)</sub> |
| TC-187 | Seller counters at 4,000 | End-to-end flow | Critical | `FLOW supply-trade / counter` | Seller, buyer, admin | Seller counters at 4,000 | HTTP 2xx, status COUNTER_RECEIVED <sub>(--flows)</sub> |
| TC-188 | Buyer is notified of the counter | End-to-end flow | Normal | `FLOW supply-trade / notify-counter` | Seller, buyer, admin | Buyer is notified of the counter | Notification "offer.countered" <sub>(--flows)</sub> |
| TC-189 | Seller cannot accept own counter | End-to-end flow | Critical | `FLOW supply-trade / turn` | Seller, buyer, admin | Seller cannot accept own counter | HTTP 4xx (not their turn) <sub>(--flows)</sub> |
| TC-190 | Buyer accepts, deal is created | End-to-end flow | Blocker | `FLOW supply-trade / accept` | Seller, buyer, admin | Buyer accepts, deal is created | HTTP 2xx, offer ACCEPTED <sub>(--flows)</sub> |
| TC-191 | Both parties are notified; deal id captured | End-to-end flow | Critical | `FLOW supply-trade / notify-accept` | Seller, buyer, admin | Both parties are notified; deal id captured | Notification "offer.accepted" for buyer and seller <sub>(--flows)</sub> |
| TC-192 | Deal amounts are correct | End-to-end flow | Blocker | `FLOW supply-trade / deal` | Seller, buyer, admin | Deal amounts are correct | status matched; total = quantity × 4,000; payable = total − seller commission <sub>(--flows)</sub> |
| TC-193 | Deal cannot close before delivery and payment | End-to-end flow | Critical | `FLOW supply-trade / close-early` | Seller, buyer, admin | Deal cannot close before delivery and payment | HTTP 400 <sub>(--flows)</sub> |
| TC-194 | Admin adds a truck | End-to-end flow | Blocker | `FLOW supply-trade / truck` | Seller, buyer, admin | Admin adds a truck | HTTP 2xx, deal moves to in_progress <sub>(--flows)</sub> |
| TC-195 | Truck weight above the deal quantity is refused | End-to-end flow | Normal | `FLOW supply-trade / overweight` | Seller, buyer, admin | Truck weight above the deal quantity is refused | HTTP 400 <sub>(--flows)</sub> |
| TC-196 | Seller uploads a waybill (pending) | End-to-end flow | Critical | `FLOW supply-trade / doc` | Seller, buyer, admin | Seller uploads a waybill (pending) | HTTP 2xx, document id returned <sub>(--flows)</sub> |
| TC-197 | Admin verifies the waybill | End-to-end flow | Critical | `FLOW supply-trade / doc-verify` | Seller, buyer, admin | Admin verifies the waybill | HTTP 2xx <sub>(--flows)</sub> |
| TC-198 | Admin marks the truck delivered | End-to-end flow | Critical | `FLOW supply-trade / deliver` | Seller, buyer, admin | Admin marks the truck delivered | HTTP 2xx <sub>(--flows)</sub> |
| TC-199 | Buyer payment above the amount owed is refused | End-to-end flow | Normal | `FLOW supply-trade / overpay` | Seller, buyer, admin | Buyer payment above the amount owed is refused | HTTP 400 <sub>(--flows)</sub> |
| TC-200 | Buyer uploads full payment receipt | End-to-end flow | Blocker | `FLOW supply-trade / buyer-pay` | Seller, buyer, admin | Buyer uploads full payment receipt | HTTP 2xx, payment PENDING <sub>(--flows)</sub> |
| TC-201 | Admin verifies the buyer payment | End-to-end flow | Blocker | `FLOW supply-trade / pay-verify` | Seller, buyer, admin | Admin verifies the buyer payment | HTTP 2xx <sub>(--flows)</sub> |
| TC-202 | Admin pays the seller | End-to-end flow | Blocker | `FLOW supply-trade / payout` | Seller, buyer, admin | Admin pays the seller | HTTP 2xx <sub>(--flows)</sub> |
| TC-203 | Admin closes the deal | End-to-end flow | Blocker | `FLOW supply-trade / close` | Seller, buyer, admin | Admin closes the deal | HTTP 2xx, status closed <sub>(--flows)</sub> |
| TC-204 | Buyer and seller rate the deal | End-to-end flow | Normal | `FLOW supply-trade / rate` | Seller, buyer, admin | Buyer and seller rate the deal | HTTP 2xx for both <sub>(--flows)</sub> |
| TC-205 | Rating the same deal twice is refused | End-to-end flow | Minor | `FLOW supply-trade / rate-twice` | Seller, buyer, admin | Rating the same deal twice is refused | HTTP 409 <sub>(--flows)</sub> |

## Flow B: demand post, rejection and cancellation

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-206 | Load categories and commodities | End-to-end flow | Critical | `FLOW demand-trade / ref` | Seller, buyer, admin | Load categories and commodities | A commodity with a unit is available <sub>(--flows)</sub> |
| TC-207 | Buyer creates a demand post | End-to-end flow | Blocker | `FLOW demand-trade / create` | Seller, buyer, admin | Buyer creates a demand post | HTTP 201, status pending <sub>(--flows)</sub> |
| TC-208 | Admin approves the demand | End-to-end flow | Blocker | `FLOW demand-trade / approve` | Seller, buyer, admin | Admin approves the demand | HTTP 200/201 <sub>(--flows)</sub> |
| TC-209 | Buyer is notified of approval | End-to-end flow | Normal | `FLOW demand-trade / notify-approved` | Seller, buyer, admin | Buyer is notified of approval | Notification "approved" <sub>(--flows)</sub> |
| TC-210 | Seller offers at the buyer budget | End-to-end flow | Blocker | `FLOW demand-trade / offer` | Seller, buyer, admin | Seller offers at the buyer budget | HTTP 201, offer id returned <sub>(--flows)</sub> |
| TC-211 | Offer above the demand quantity is refused | End-to-end flow | Normal | `FLOW demand-trade / too-much` | Seller, buyer, admin | Offer above the demand quantity is refused | HTTP 400 <sub>(--flows)</sub> |
| TC-212 | Buyer rejects the offer | End-to-end flow | Critical | `FLOW demand-trade / reject` | Seller, buyer, admin | Buyer rejects the offer | HTTP 2xx, status REJECTED <sub>(--flows)</sub> |
| TC-213 | Seller is notified of the rejection | End-to-end flow | Normal | `FLOW demand-trade / notify-reject` | Seller, buyer, admin | Seller is notified of the rejection | Notification "offer.rejected" <sub>(--flows)</sub> |
| TC-214 | A rejected offer cannot be accepted | End-to-end flow | Critical | `FLOW demand-trade / accept-rejected` | Seller, buyer, admin | A rejected offer cannot be accepted | HTTP 4xx <sub>(--flows)</sub> |
| TC-215 | Seller sends a new counter offer | End-to-end flow | Blocker | `FLOW demand-trade / reoffer` | Seller, buyer, admin | Seller sends a new counter offer | HTTP 201 <sub>(--flows)</sub> |
| TC-216 | Buyer accepts, deal is created | End-to-end flow | Blocker | `FLOW demand-trade / accept` | Seller, buyer, admin | Buyer accepts, deal is created | HTTP 2xx, notification with deal id <sub>(--flows)</sub> |
| TC-217 | Admin cancels the deal | End-to-end flow | Critical | `FLOW demand-trade / cancel` | Seller, buyer, admin | Admin cancels the deal | HTTP 2xx, status cancelled <sub>(--flows)</sub> |
| TC-218 | A cancelled deal cannot change status | End-to-end flow | Normal | `FLOW demand-trade / reopen` | Seller, buyer, admin | A cancelled deal cannot change status | HTTP 400 <sub>(--flows)</sub> |

## Flow C: admin moderation and intervention

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-219 | Load categories and commodities | End-to-end flow | Critical | `FLOW moderation / ref` | Seller, buyer, admin | Load categories and commodities | A commodity with a unit is available <sub>(--flows)</sub> |
| TC-220 | Admin rejects a post with a reason | End-to-end flow | Critical | `FLOW moderation / reject-post` | Seller, buyer, admin | Admin rejects a post with a reason | HTTP 2xx, status rejected, seller notified <sub>(--flows)</sub> |
| TC-221 | Rejecting without a reason is refused | End-to-end flow | Minor | `FLOW moderation / reject-no-reason` | Seller, buyer, admin | Rejecting without a reason is refused | HTTP 400 <sub>(--flows)</sub> |
| TC-222 | Admin sends a post back for changes | End-to-end flow | Normal | `FLOW moderation / send-back` | Seller, buyer, admin | Admin sends a post back for changes | HTTP 2xx, status needs_revision, seller notified <sub>(--flows)</sub> |
| TC-223 | Non-admin cannot approve posts | End-to-end flow | Critical | `FLOW moderation / agent-cannot-approve` | Seller, buyer, admin | Non-admin cannot approve posts | HTTP 401/403 with a user token <sub>(--flows)</sub> |
| TC-224 | Admin intervenes in a negotiation | End-to-end flow | Critical | `FLOW moderation / intervene` | Seller, buyer, admin | Admin intervenes in a negotiation | HTTP 2xx, offer ADMIN_REVIEW, both parties notified <sub>(--flows)</sub> |
| TC-225 | Parties cannot counter after intervention | End-to-end flow | Normal | `FLOW moderation / counter-blocked` | Seller, buyer, admin | Parties cannot counter after intervention | HTTP 4xx <sub>(--flows)</sub> |
| TC-226 | Admin finalises the deal at the admin price | End-to-end flow | Critical | `FLOW moderation / final-offer` | Seller, buyer, admin | Admin finalises the deal at the admin price | HTTP 2xx, deal created at 3,950 <sub>(--flows)</sub> |

## Flow D: new user account to first post

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-227 | Phone OTP is sent and verified | End-to-end flow | Critical | `FLOW account / otp` | Seller, buyer, admin | Phone OTP is sent and verified | otp/send 2xx; otp/verify returns valid: true <sub>(--flows)</sub> |
| TC-228 | New user registers | End-to-end flow | Blocker | `FLOW account / register` | Seller, buyer, admin | New user registers | HTTP 201 with token and user id <sub>(--flows)</sub> |
| TC-229 | Registering the same email again is refused | End-to-end flow | Normal | `FLOW account / duplicate` | Seller, buyer, admin | Registering the same email again is refused | HTTP 409 <sub>(--flows)</sub> |
| TC-230 | Weak password is refused at signup | End-to-end flow | Normal | `FLOW account / weak-password` | Seller, buyer, admin | Weak password is refused at signup | HTTP 400 <sub>(--flows)</sub> |
| TC-231 | New user logs in | End-to-end flow | Blocker | `FLOW account / login` | Seller, buyer, admin | New user logs in | HTTP 201; auth/me returns the user <sub>(--flows)</sub> |
| TC-232 | Incomplete profile cannot create posts | End-to-end flow | Critical | `FLOW account / incomplete` | Seller, buyer, admin | Incomplete profile cannot create posts | post/categories returns 403 <sub>(--flows)</sub> |
| TC-233 | User updates personal profile | End-to-end flow | Normal | `FLOW account / personal` | Seller, buyer, admin | User updates personal profile | PATCH 2xx; city saved <sub>(--flows)</sub> |
| TC-234 | User fills business profile | End-to-end flow | Normal | `FLOW account / business` | Seller, buyer, admin | User fills business profile | PATCH 2xx; business name saved <sub>(--flows)</sub> |
| TC-235 | User adds a bank account | End-to-end flow | Critical | `FLOW account / bank` | Seller, buyer, admin | User adds a bank account | HTTP 2xx, bank account id returned <sub>(--flows)</sub> |
| TC-236 | User changes app and notification settings | End-to-end flow | Minor | `FLOW account / settings` | Seller, buyer, admin | User changes app and notification settings | Values persist after reload <sub>(--flows)</sub> |
| TC-237 | Device token is registered and removed | End-to-end flow | Minor | `FLOW account / device` | Seller, buyer, admin | Device token is registered and removed | Both calls 2xx <sub>(--flows)</sub> |
| TC-238 | Admin gets a KYC request alert | End-to-end flow | Normal | `FLOW account / kyc-alert` | Seller, buyer, admin | Admin gets a KYC request alert | KYC_REQUEST alert for the new user <sub>(--flows)</sub> |
| TC-239 | Admin approves basic, KYC, bank and business | End-to-end flow | Blocker | `FLOW account / approve` | Seller, buyer, admin | Admin approves basic, KYC, bank and business | All 2xx; profile completion 100 <sub>(--flows)</sub> |
| TC-240 | Approved user creates a first post | End-to-end flow | Critical | `FLOW account / first-post` | Seller, buyer, admin | Approved user creates a first post | post/categories 200; supply created <sub>(--flows)</sub> |
| TC-241 | Support query: user asks, admin replies and closes | End-to-end flow | Normal | `FLOW account / support` | Seller, buyer, admin | Support query: user asks, admin replies and closes | Reply visible to user; closed query refuses new messages <sub>(--flows)</sub> |
| TC-242 | User changes password | End-to-end flow | Critical | `FLOW account / password` | Seller, buyer, admin | User changes password | New password works; old one is refused <sub>(--flows)</sub> |
| TC-243 | Admin restricts, then re-activates the user | End-to-end flow | Critical | `FLOW account / restrict` | Seller, buyer, admin | Admin restricts, then re-activates the user | Login refused while restricted; works after activate <sub>(--flows)</sub> |

## Flow E: admin catalogue, settings and team

| ID | Test case | Type | Severity | Request | Auth | Steps | Expected result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-244 | Unit: create, update, delete | End-to-end flow | Normal | `FLOW admin-crud / unit` | Seller, buyer, admin | Unit: create, update, delete | All 2xx <sub>(--flows)</sub> |
| TC-245 | Payment term and delivery option: create, update, delete | End-to-end flow | Normal | `FLOW admin-crud / terms` | Seller, buyer, admin | Payment term and delivery option: create, update, delete | All 2xx <sub>(--flows)</sub> |
| TC-246 | Category: create with image, update | End-to-end flow | Critical | `FLOW admin-crud / category` | Seller, buyer, admin | Category: create with image, update | HTTP 2xx <sub>(--flows)</sub> |
| TC-247 | Commodity: create in the new category; visible publicly | End-to-end flow | Critical | `FLOW admin-crud / commodity` | Seller, buyer, admin | Commodity: create in the new category; visible publicly | HTTP 2xx; listed in public/commodities <sub>(--flows)</sub> |
| TC-248 | Form template: create, reorder, read publicly, delete | End-to-end flow | Normal | `FLOW admin-crud / form` | Seller, buyer, admin | Form template: create, reorder, read publicly, delete | All 2xx; public seller form returns the fields <sub>(--flows)</sub> |
| TC-249 | Mill: create, activate, set rates, history | End-to-end flow | Critical | `FLOW admin-crud / mill` | Seller, buyer, admin | Mill: create, activate, set rates, history | All 2xx; rate history has points <sub>(--flows)</sub> |
| TC-250 | Delete the test commodity and category | End-to-end flow | Minor | `FLOW admin-crud / cleanup` | Seller, buyer, admin | Delete the test commodity and category | Both 2xx <sub>(--flows)</sub> |
| TC-251 | Team: invite agent, module permissions enforced live | End-to-end flow | Blocker | `FLOW admin-crud / agent` | Seller, buyer, admin | Team: invite agent, module permissions enforced live | Agent sees only granted modules; grant and revoke apply immediately <sub>(--flows)</sub> |
| TC-252 | Dispute: move to under review and back | End-to-end flow | Normal | `FLOW admin-crud / dispute` | Seller, buyer, admin | Dispute: move to under review and back | Both 2xx <sub>(--flows)</sub> |
| TC-253 | Business info saves (unchanged values) | End-to-end flow | Minor | `FLOW admin-crud / business-info` | Seller, buyer, admin | Business info saves (unchanged values) | HTTP 2xx <sub>(--flows)</sub> |
| TC-254 | Reports export as CSV | End-to-end flow | Minor | `FLOW admin-crud / export` | Seller, buyer, admin | Reports export as CSV | HTTP 200 with CSV content <sub>(--flows)</sub> |

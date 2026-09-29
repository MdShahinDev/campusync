# CampusSync

> A university resource-sharing platform where students lend lab components to each other, share course materials, and coordinate the whole exchange — with an auditable borrow/return lifecycle, role-scoped moderation, and real-time messaging.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-242424?logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC?logo=tailwindcss&logoColor=white)

---

## Overview

**CampusSync** is a full-stack platform for sharing physical and academic resources inside a university. Students publish lab components (with quantity and condition tracking), upload course resources (PDF/PPTX/images), borrow each other's equipment through a formal approval workflow, and settle the handback with a single-use QR code.

It exists because campus equipment is scarce and informal lending has no memory: nobody knows who has the multimeter, what condition it left in, or when it is due back. CampusSync turns that informal exchange into a governed workflow with an explicit state machine, a persistent history, and notifications at every transition.

**Who it is for**

| Audience | What they do in CampusSync |
|---|---|
| **Students** | List components, upload resources, request borrows, return items, discuss in the forum, message owners |
| **Moderators** | Verify and manage the accounts of *their own university*, review reports, moderate forum categories, view scoped borrow history |
| **Admins** | Platform-wide user management, university/course catalog + CSV import, category governance, full borrow history, staff the support inbox |

**Why it is useful** — every exchange leaves a trace. Quantity is decremented on handover and restored on return, borrow records carry overdue/overdue-day computation, and moderation is scoped by university so one institution's staff can never see or act on another institution's users.

---

## Key Features

### Authentication & Identity
- Email/password signup and login with **JWT (30-day) bearer tokens**
- Passwords hashed with **bcrypt (cost factor 12)**; the password hash is never serialized to a client (`toJSON` override + `.select("-password")`)
- Server-side field validation with **express-validator** on auth, contact, forum, ticket and messaging routes
- Three roles: `student`, `moderator`, `admin` — with **email and username uniqueness enforced both pre-check and via duplicate-key handling**
- **Verification workflow**: student/moderator accounts start unverified; an admin (or a verified moderator, for their own university's students) approves or rejects them, optionally with written feedback
- **Profile management**: name, phone, location, bio, student ID
- **Profile photos** uploaded through a size/type-checked multer pipeline, stored privately, and served back through an authenticated streaming proxy
- **Account suspension**: suspended accounts keep read access but lose every state-changing action, with a matching banner in the UI
- **Public profiles** by username, exposing only the whitelisted profile fields

### Resource Management
- Upload course resources (PDF, PPTX, images) linked to a university + course code/title
- Extension **and** MIME validation per resource type, 50 MB limit
- Browse with search (course code/title) and type filter
- Authenticated download streamed through the backend with the storage token — files are never publicly addressable
- Deletion restricted to the uploader or an admin; the backing blob is removed too
- Upload/download gated on account verification for students

### Component Management
- Create/edit/delete lab components with name, description, category, condition (`New/Excellent/Good/Fair/Poor`), quantity, location, and purchase date
- Category catalog with case-insensitive uniqueness, rename propagation (`Component.updateMany`), and a protected system fallback category (`Uncategory`)
- Components are stamped with the owner's university for downstream scoping
- Optional component image (10 MB, image extensions only) stored privately and served via `GET /api/components/:id/image`
- Discovery page with search + multi-select filters for category, condition, and university, plus an "available only" server-side filter
- Ownership rules: only the owner or an admin may edit/delete; users may not borrow their own component

### Borrowing & Return
- Borrow request with **quantity**, expected return date, purpose, and notes
- Guard rails at creation: verification required for students, component must be active, availability checked, self-borrow blocked, **one active request per borrower per component**
- Full lifecycle: `pending → approved → borrowed → return_requested → returned`, plus `rejected` and `cancelled` branches
- Approval, handover, and return confirmation are **owner-only actions** with per-step availability re-checks
- Quantity is decremented atomically on handover and restored on return, clamped to never exceed total quantity
- **QR-based return**: owner generates a single-use, 15-minute token; only its SHA-256 hash is stored; the scan endpoint is public and claims the return with an atomic `findOneAndUpdate`
- Overdue computation (`is_overdue`, `overdue_days`) and loan duration computed server-side on every list
- Borrow history views for borrower, owner, and staff (admin: all records; moderator: university-scoped)
- Staff may delete only terminal records (`returned`, `rejected`, `cancelled`)

### Communication
- **1:1 real-time messaging** over Socket.IO with JWT-authenticated handshakes
- Conversation uniqueness guaranteed by a **database-level `participantKey` unique index**, not by the UI
- Cursor-paginated history, read receipts, typing indicators, online presence, unread badges
- **Idempotent sends** via a client-generated `clientMessageId` backed by a partial unique index
- Capability negotiation: `GET /api/messages/config` reports whether realtime is available, so the client falls back to the same REST endpoints instead of silently losing messages
- **Typed notification system** (17 enum types) with inbox, unread counter, mark-one/mark-all read, deep links to the related entity, and fan-out to admins or to the moderators of a specific university
- Direct admin/moderator messages with severity tones

### Community
- **Community Forum**: issues with title, body, category, author, comment count and a maintained `lastActivityAt`
- Issue list with pagination, title search, category filter, and four sort orders (latest / oldest / most discussed / recent activity)
- **Comments and nested replies** stored in a single collection via `parentComment`, rebuilt into a tree level-by-level (max depth 20), paginated on top-level comments only
- Forum category management (admin/verified moderator) with a guaranteed, undeletable `UnCategorised` fallback — deleting a category **reassigns its issues** inside a MongoDB transaction when the deployment supports one

### Support & Reporting
- **Support reports (tickets)** with fixed statuses `open → in_progress → solved | reject` and 8 categories
- Reporter-scoped access for students, university-scoped for moderators, platform-wide for admins — applied identically in list filters and single-document resolution
- Ticket conversation with pagination, denormalized `lastMessagePreview`, `messageCount`, `handledBy`, and a full **status history** audit trail
- Reporters cannot reply once a report is `solved`; staff replies notify the reporter
- Backend **user-report API** (`/api/reports`) with duplicate prevention and university-scoped visibility, surfaced through notification deep links

### Dashboards & Admin
- Role-specific dashboards: student overview, admin platform stats, moderator university-scoped stats
- **Activity feed** (registration, approval/rejection, component/resource create/delete) with a `createdAt` index
- Admin: all users, pending users, create user, user details, university/course catalog
- **CSV bulk import** of universities + courses: header validation, row-level error reporting, in-file dedupe, case-insensitive normalization, duplicate skipping, and `bulkWrite` upserts
- Public landing-page statistics endpoint (universities, courses, users, resources, components, distinct departments)

---

## User Roles & Permissions

### Permission matrix

| Capability | Guest | Student | Moderator | Admin |
|---|:---:|:---:|:---:|:---:|
| Home / About / Contact, public stats | ✅ | ✅ | ✅ | ✅ |
| Sign up, login | ✅ | ✅ | ✅ | ✅ (separate admin signup) |
| Browse components | — | ✅ | ✅ | ✅ |
| Create / edit / delete components | — | ✅ (own, verified) | ✅ (verified) | ✅ |
| Upload course resources | — | ✅ (verified) | ✅ (verified) | ✅ |
| Download resources | — | ✅ (verified) | ✅ | ✅ |
| Delete resources | — | ✅ (own) | ✅ (own) | ✅ (any) |
| Request a borrow | — | ✅ (verified) | ✅ | ✅ |
| Approve / reject / hand over / confirm return / issue return QR | — | ✅ (component owner) | ✅ (component owner) | ✅ (component owner) |
| View a borrow record | — | ✅ (participant) | ✅ (university scope) | ✅ |
| Central borrow history (incl. terminal-only delete) | — | — | ✅ (university scope) | ✅ (all) |
| Community forum — read, post issues, comment, reply | — | ✅ | ✅ | ✅ |
| Forum category create / edit / delete | — | — | ✅ (verified) | ✅ |
| Open a support report | — | ✅ | ✅ | ✅ |
| Reply to a report | — | ✅ (until `solved`) | ✅ | ✅ |
| Change report status | — | — | ✅ (verified) | ✅ |
| List / view users | — | — | ✅ (own university) | ✅ (all) |
| Approve / reject accounts | — | — | ✅ (own university, students only, verified) | ✅ (all) |
| Suspend / unsuspend accounts | — | — | ✅ (own university, students only, verified) | ✅ (all, except self) |
| Delete an account | — | — | — | ✅ |
| Component category CRUD | — | — | ✅ (verified) | ✅ |
| University & course catalog, CSV import | — | — | — | ✅ |
| Send a direct notification | — | — | ✅ (own university users, verified) | ✅ (anyone) |
| Read notifications | — | ✅ (own) | ✅ (own) | ✅ (own) |

### How authorization actually works

Authorization is **not** a single check. Every protected route runs a chain in a fixed order:

```text
authentication  →  role gate  →  verification / ownership / scope  →  suspension
   protect          authorize      requireVerifiedModerator +          requireActiveUser
                                                  controller rules
```

1. **Authentication — `protect`**
   Reads the `Authorization: Bearer` header, verifies it with `JWT_SECRET`, loads the user from MongoDB (minus the password), and attaches it to `req.user`. Invalid, expired, or orphaned tokens are rejected with `401`.

2. **Role gate — `authorize(...roles)`**
   Returns `403` with an explicit message if the caller's `role` is not in the allowed list.

3. **Moderator verification — `requireVerifiedModerator`**
   An *unverified* moderator keeps **read-only** access: GET routes stay open, but every moderation/write action returns `403` until an admin verifies the account. Admins and students are unaffected.

4. **Ownership and scope — controller rules**
   - Borrow state transitions compare the caller against `owner_id` / `borrower_id`.
   - Resource deletion compares against `uploader_id`.
   - Component mutation compares against `owner_id` (admins bypass).
   - **Moderators are university-scoped**: `getAllUsers` injects `filter.university = req.user.university`; suspend/unsuspend, approve/reject, notifications, borrow history, user reports, and support reports all re-check that the target belongs to the moderator's own university. Moderator scoping never trusts a client-supplied ID — the university always comes from the authenticated profile or a snapshot stored on the document.
   - Single-document access failures return `403`/`404` without revealing whether the ID exists.

5. **Suspension — `requireActiveUser`**
   Suspended accounts are rejected with `403` (and the exact message shown by the UI banner) on `POST/PUT/PATCH/DELETE` **and** on `GET …/download`. Reads — dashboards, profiles, notifications — remain available.

6. **Frontend route guards (defense in depth, not the authority)**
   `ProtectedRoute` / `AuthRoute` resolve the signed-in user from `AuthContext` and redirect by role. The backend re-verifies every request; the UI only decides what to render.

---

## Product Workflow

### Registration & verification

```text
Sign up (student/moderator)
  → express-validator checks (name, username, email, password, university, student ID)
  → duplicate email / username pre-check + E11000 fallback
  → university existence check
  → password hashed (bcrypt, cost 12)
  → User document created (isVerified: false)
  → notifications: ACCOUNT_CREATED → user, NEW_USER_REGISTERED → all admins,
                   UNIVERSITY_NEW_STUDENT_REGISTERED → moderators of that university
  → Activity: USER_REGISTERED
  → JWT issued (30d) + session stored

Pending account
  → student: cannot borrow, cannot create components, cannot upload resources
  → moderator: read-only (requireVerifiedModerator blocks writes)

Admin approves  ─or─  Moderator approves (own university, students only)
  → isVerified: true, rejectionReason cleared
  → ACCOUNT_APPROVED notification + Activity entry

Admin/Moderator rejects (optional feedback)
  → feedbackSent / rejectionReason persisted
  → ACCOUNT_REJECTED notification (with feedback text)

Account suspended (admin, or moderator within scope)
  → all mutations and downloads return 403
  → ACCOUNT_SUSPENDED notification + dashboard banner
  → ACCOUNT_RESTORED on unsuspend
```

### Component borrowing (end to end)

```text
Component published (owner, verified)
  → Browse / search / filter → Component details
  → Borrow request { quantity, expected_return_date, purpose, notes }
      guards: verified · active component · availability · not self · no active duplicate
  → status: pending
      → BORROW_REQUEST_RECEIVED → owner

Owner approves
      re-checks available_quantity ≥ requested quantity
  → status: approved · approved_date set
      → BORROW_STATUS_CHANGED → borrower
      → BORROW_REQUEST_STATUS_CHANGED → owner
  (owner may instead reject → rejected, or the borrower may cancel → cancelled)

Owner hands the item over
  → status: borrowed · borrowed_date set
  → component.available_quantity -= quantity
      → both parties notified

Borrower requests a return
  → status: return_requested
      → both parties notified

Owner opens the Return QR modal
  → PUT /borrowing/:id/generate-return-qr
  → 32 random bytes → token (returned once) · SHA-256 hash stored · TTL 15 min
  → QR rendered client-side (qrcode) encoding /return-confirmation/:token

Anyone scans the QR
  → public page POSTs the token to /borrowing/return/confirm
  → atomic claim: status == return_requested ∧ hash matches ∧ unused ∧ unexpired
  → status: returned · returned_date set · token marked used
  → available_quantity += quantity, clamped with $min to total quantity
  → borrower notified
  → idempotent responses: already_completed / used / expired / invalid

Terminal record lands in Borrow History
  → staff may delete returned/rejected/cancelled records only
```

### Community discussion

```text
Create issue { title, description, category }   (any authenticated user)
  → ForumIssue (creator from session, lastActivityAt set)

Discussion
  → top-level comment            → parentComment: null
  → reply to a comment           → parentComment: <comment id>   (any depth, cap 20)
  → issue.commentCount++ and lastActivityAt updated atomically

Read
  → page of top-level comments (paginated)
  → one query per depth level collects the replies
  → server rebuilds the thread tree before responding

Category governance (admin / verified moderator)
  → create / rename / delete
  → delete reassigns issues to UnCategorised (transaction, with ordered-write fallback)
```

### Support reports

```text
Create report { subject, description, category }
  → reporter + reporterUniversity snapshot taken server-side
  → status: open
  → TICKET_CREATED → all admins + moderators of the reporter's university

Staff replies  → statusHistory untouched · handledBy/handAt set · TICKET_NEW_REPLY → reporter
Reporter replies → allowed while status ≠ solved

Status change (admin / verified moderator, in scope)
  → open → in_progress → solved | reject  (any transition, recorded in statusHistory)
  → TICKET_STATUS_CHANGED → reporter
```

### Messaging

```text
Client boots → GET /api/messages/config → realTime: true|false
  ├─ true  → single Socket.IO connection (JWT handshake, one per session)
  └─ false → REST only (serverless hosts); UI shows Offline

Start chat → POST /conversations { userId }
  → find-or-create by participantKey (unique index; E11000 loser re-reads the winner)

Send → socket "message:send"  ─┐
     → POST  /conversations/:id/messages ─┴→ messagingService.sendMessage
         · content normalized/trimmed, max 2000 chars
         · clientMessageId pre-check + partial unique index ⇒ no duplicates
         · Message persisted FIRST, then conversation.lastMessage + unreadCounts.$inc
         · emit message:new + unread:update to the recipient

Read   → "message:read" / PUT /conversations/:id/read
         · only receiverId == reader rows are flipped → message:read receipt
Presence → in-memory Map(userId → Set(socketId)); multi-tab aware, never persisted
```

---

## Technical Architecture

CampusSync is a **single-origin-per-tier MERN application**: a React SPA talks to one Express API over HTTP/JSON, and — when the host supports long-lived connections — a Socket.IO channel attached to the *same* Node process.

```text
┌──────────────────────────────────────────────────────────────────┐
│  Browser (React 19 SPA)                                          │
│  AuthContext · MessagingContext · ThemeContext                   │
│  axios instance (Bearer token from localStorage, 401 → /login)   │
│  Route guards: AuthRoute · ProtectedRoute · RoleDashboardLayout  │
└───────────────┬───────────────────────────────┬──────────────────┘
                │ REST  /api/*                  │ Socket.IO (JWT handshake)
                ▼                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  Express 5 (backend/server.js)                                   │
│                                                                  │
│  1. Custom CORS origin allow-list (shared with Socket.IO)        │
│  2. JSON / urlencoded body parsing (50 MB limit)                 │
│  3. Routers (17 mounted route files)                             │
│  4. Middleware chain:                                             │
│       protect → authorize → requireVerifiedModerator →           │
│       requireActiveUser → express-validator (where declared)     │
│  5. Controllers (17) — validation, authorization, orchestration  │
│  6. Services                                                     │
│       notificationService · messagingService · socket            │
│  7. Global error handler → { success:false, message }            │
└───────────────┬───────────────────────────────┬──────────────────┘
                │ Mongoose 9                    │ @vercel/blob (private)
                ▼                               ▼
┌──────────────────────────┐     ┌─────────────────────────────────┐
│  MongoDB                 │     │  Object storage                 │
│  18 collections          │     │  avatars/ components/ resources/│
│  indexes on every        │     │  served only through backend    │
│  hot query path          │     │  streaming proxies w/ token     │
└──────────────────────────┘     └─────────────────────────────────┘
```

### Request lifecycle (REST)

```text
Client
  → axios request interceptor injects Authorization: Bearer <token>
  → Express CORS middleware validates origin against the allow-list
  → route middleware chain establishes identity, role, scope, suspension state
  → controller validates input, re-derives authorization from req.user,
    reads/writes MongoDB
  → service layer emits notifications / realtime events AFTER the write commits
  → { success, message, data } envelope returned
  → on 401 the response interceptor clears storage and redirects to /login
```

### Realtime data flow

```text
Client A ── message:send ──▶ Socket.IO auth middleware (JWT → user)
                              ▼
                        messagingService.sendMessage  ──▶ MongoDB (persist)
                              ▼
                        notifyMessageNew → room user:<B>   (message:new)
                        getTotalUnread    → room user:<B>   (unread:update)
                              ▼
Client B ◀──────────────────────┘
```

The database is the **source of truth for history**; Socket.IO is only transport. Every message is written before it is broadcast, so a dropped socket never loses data.

---

## Technology Stack

| Layer | Technology | Purpose in this project |
|---|---|---|
| Frontend framework | **React 19** | Component model, hooks, StrictMode |
| Build tool | **Vite 8** (`@vitejs/plugin-react`) | Dev server on `:5173`, production bundle to `dist/` |
| Routing | **React Router DOM 7** | Declarative route tree with nested layout/guard routes |
| Styling | **Tailwind CSS 4** (`@tailwindcss/vite`) | Utility-first design system, dark-mode via `light`/`dark` root classes |
| Animation | **framer-motion** | Page/modal/list transitions (`AnimatePresence`) |
| Icons | **lucide-react** | Icon set used across dashboards and marketing sections |
| HTTP client | **axios** | Singleton instance, auth header injection, global 401 handling |
| QR generation | **qrcode** | Client-side data-URL rendering of the return-confirmation URL |
| Realtime client | **socket.io-client** | Single connection per session, ack-based emits, reconnect tuning |
| Backend runtime | **Node.js + Express 5** (CommonJS) | REST API, 18 routers, global error handler |
| Database | **MongoDB + Mongoose 9** | Schema validation, indexes, populate, transactions |
| Authentication | **jsonwebtoken + bcryptjs** | 30-day stateless bearer tokens; salted password hashing (cost 12) |
| Validation | **express-validator** | Declarative request validation on auth/contact/forum/ticket/messaging routes |
| File uploads | **multer 2** | Memory storage (images/resources) and disk storage (CSV) with extension + size filters |
| Object storage | **@vercel/blob** (private access) | Avatars, component images, resource files |
| CSV import | **csv-parser** | Streaming parse of university/course bulk import |
| Realtime server | **socket.io 4** | Handshake auth, rooms, presence, typing, read receipts |
| Dev tooling | **nodemon**, **ESLint 9** (flat config + react-hooks + react-refresh) | Backend auto-restart; frontend lint (`npm run lint`) |
| Deployment | **Vercel** (`@vercel/node` build + SPA rewrites) | Serverless API build and static frontend hosting |

---

## Why These Technologies

The reasons below are drawn from how each dependency is actually used in this codebase.

- **MongoDB / Mongoose** — the domain is document-shaped and heavily relational-by-reference (borrow requests denormalize owner/borrower/component snapshots for list rendering, conversations carry a unique composite key, notifications carry a mixed `metadata` bag). Mongoose gives schema validation, compound/partial/collation indexes, `populate` for read-time hydration, and `startSession()` transactions where the deployment supports them.
- **Express 5** — the API is a flat set of resource routers with shared middleware. `protect` / `authorize` / `requireVerifiedModerator` / `requireActiveUser` compose as route-level middleware, which is the core of the authorization model.
- **JWT bearer auth** — the API must serve both a browser SPA and Socket.IO handshakes from the same identity. A single verifiable token works for `Authorization` headers *and* for `socket.handshake.auth`, which is exactly how `services/socket.js` authenticates connections.
- **Socket.IO** — messaging needs presence, typing indicators, read receipts, and reconnection on unstable campus networks (`pingInterval`/`pingTimeout` are tuned for that). It is attached to the *same* HTTP server as Express so there is one process and one port.
- **Vercel Blob (private)** — component images and course files must not be publicly enumerable. Files are written with `access: "private"` and read back through backend proxies that attach `BLOB_READ_WRITE_TOKEN`, which is what makes `GET /components/:id/image` and `GET /resources/:id/download` possible.
- **Tailwind + Vite** — three separate dashboards share one visual language; utility classes keep the layout code in the dashboards readable and consistent without a component-library dependency. Vite gives instant HMR across the ~125 source files under `frontend/src`.
- **React Context for auth/messaging/theme** — session state and the single socket must be visible to the sidebar badge, the chat page, and every route guard simultaneously; a single provider avoids duplicate sockets and duplicate caches.
- **express-validator** — validation is declared next to the route so the rules are auditable in one place, and failures return a uniform `{ field, message }` array the forms can render inline.

---

## Project Structure

```text
campusync/
├── backend/                        # Express 5 + Mongoose API (CommonJS)
│   ├── server.js                   # app wiring, CORS, routers, error handler,
│   │                               #   HTTP server shared with Socket.IO,
│   │                               #   serverless export when VERCEL is set
│   ├── config/
│   │   ├── db.js                   # mongoose connect, DNS resolver override,
│   │   │                           #   bounded retry loop, exit(1) on failure
│   │   └── allowedOrigins.js       # CORS allow-list shared with Socket.IO
│   ├── middleware/
│   │   ├── auth.js                 # protect · authorize · optionalAuth ·
│   │   │                           #   requireVerifiedModerator · requireActiveUser
│   │   └── upload.js               # multer CSV uploader (tmp dir, .csv only)
│   ├── model/                      # 18 Mongoose schemas
│   │   ├── User.js                 # roles, verification, suspension, bcrypt hooks
│   │   ├── University.js  Course.js
│   │   ├── Component.js  Category.js
│   │   ├── Resource.js             # course file metadata + blob URL
│   │   ├── BorrowRequest.js        # lifecycle + return-token fields (select:false)
│   │   ├── Conversation.js  Message.js
│   │   ├── Notification.js         # 17-type enum + related-entity pointer
│   │   ├── Ticket.js  TicketMessage.js
│   │   ├── ForumIssue.js  ForumComment.js  ForumCategory.js
│   │   ├── UserReport.js  Activity.js  ContactMessage.js
│   ├── controller/                 # 17 controllers (business rules live here)
│   ├── routes/                     # 17 routers: middleware + validation + wiring
│   ├── services/
│   │   ├── notificationService.js  # typed, non-throwing notification fan-out
│   │   ├── messagingService.js     # conversation/message domain logic
│   │   └── socket.js               # Socket.IO auth, rooms, presence, events
│   ├── scripts/
│   │   └── migrateNotifications.js # idempotent legacy notification migration
│   ├── vercel.json                 # @vercel/node build → server.js
│   └── package.json
│
├── frontend/                       # React 19 + Vite SPA
│   ├── src/
│   │   ├── main.jsx                # providers: Theme → Auth → Messaging
│   │   ├── App.jsx                 # navbar/footer shell vs. dashboard shell
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx       # full route tree + role nesting
│   │   │   ├── ProtectedRoute.jsx  # role-gated redirect
│   │   │   ├── AuthRoute.jsx       # signed-in redirect to own dashboard
│   │   │   └── RoleDashboardLayout.jsx  # picks the shell for /notifications,
│   │   │                               #   /forum, /reports, /user/:username
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # session, login/signup/logout, /auth/me refresh
│   │   │   ├── MessagingContext.jsx# one socket, unread total, emitAck helper
│   │   │   └── ThemeContext.jsx    # light/dark persisted in localStorage
│   │   ├── services/
│   │   │   ├── axios.js            # baseURL, token injection, 401 handling
│   │   │   ├── messaging.js        # REST wrappers + path helpers
│   │   │   ├── notifications.js    # type → label/icon/tone metadata
│   │   │   └── suspension.js       # shared suspension message/helpers
│   │   ├── auth/
│   │   │   ├── pages/              # Login · SignUp (3-step) · AdminSignUp
│   │   │   ├── studentDashboard/   # layout + 9 pages
│   │   │   ├── moderatorDashboard/ # layout + 10 pages
│   │   │   └── adminDashboard/     # layout + 10 pages (users, universities, CSV)
│   │   ├── pages/                  # shared app pages
│   │   │   ├── forum/              # issues, issue detail, category management
│   │   │   ├── reports/            # list, create, detail + shared utils
│   │   │   ├── AllComponents.jsx  ComponentDetails.jsx  Messaging.jsx
│   │   │   ├── NotificationsPage.jsx  NotificationDetail.jsx
│   │   │   ├── ReceivedRequests.jsx  MyBorrowing*.jsx  BorrowHistory*.jsx
│   │   │   └── ReturnConfirmation.jsx  PublicProfile.jsx  Contact.jsx …
│   │   ├── components/
│   │   │   ├── common/             # modals, badges, search, QR, suspension UI
│   │   │   ├── borrow/             # useBorrowRequest hook + shared detail UI
│   │   │   ├── messaging/          # ChatPanel · ConversationList
│   │   │   ├── layout/             # Navbar · Footer
│   │   │   └── ui/  animation/     # ThemeToggle, motion helpers
│   │   ├── hooks/                  # usePublicStats (cached, de-duplicated)
│   │   └── data/mockData.js        # marketing-page content only (FAQ, steps)
│   ├── eslint.config.js            # flat config + react-hooks + react-refresh
│   ├── vite.config.js              # react + tailwindcss plugins
│   ├── vercel.json                 # SPA rewrite
│   └── package.json
│
└── README.md
```

---

## Data Model

18 collections. Every hot query path has a matching index.

| Collection | Represents | Notable design points |
|---|---|---|
| `users` | Accounts | `role` enum, `isVerified`, `isSuspended`, `rejectionReason`, `feedbackSent`; pre-save bcrypt hook; `toJSON` strips password; unique `username` + `email` |
| `universities` | Institutions | `normalizedName` unique (lowercased) for case-safe lookup |
| `courses` | Courses per university | unique compound `{universityId, normalizedCourseCode}` |
| `categories` | Component categories | unique name, `isSystem` flag protects the fallback |
| `components` | Lendable equipment | `quantity` vs `available_quantity`, `condition` enum, university ref, text index on `name`/`category` |
| `resources` | Course files | unique human-readable `resource_id` (`RES-…`), denormalized uploader snapshot + role |
| `borrow_requests` | The lending lifecycle | denormalized owner/borrower/component snapshots, 7-status enum, `return_token_hash` (**unique, sparse, `select:false`**) + expiry + used flags; indexes on borrower, owner, component, status |
| `conversations` | 1:1 chat threads | exactly-2 participants validator, **unique `participantKey`**, denormalized `lastMessage`, per-participant `unreadCounts` map |
| `messages` | Chat messages | `receiverId` for unread lookups, **partial unique `{senderId, clientMessageId}`** for idempotency, cursor index `{conversationId, _id}` |
| `notifications` | In-app notifications | 17-value type enum, `relatedEntityType` + `relatedEntityId` deep link, mixed `metadata`, unread indexes |
| `tickets` | Support reports | 4-status enum, 8-category enum, university snapshot for scoping, `statusHistory[]` audit, denormalized preview/`lastActivityAt` |
| `ticket_messages` | Report replies | compound index `{ticket, createdAt}` |
| `forum_issues` | Discussion threads | `commentCount` + `lastActivityAt` maintained on every reply, indexes for newest/activity/category/creator |
| `forum_comments` | Comments **and** replies | `parentComment` self-reference supports any depth; indexes for thread reads |
| `forum_categories` | Forum taxonomy | **case-insensitive unique** name (collation `en/strength 2`), `isSystem` fallback |
| `user_reports` | "Review this user" | stores reported user's university snapshot for moderator scoping; one open report per pair |
| `activities` | Admin/mod audit feed | enum of 7 event types, `createdAt` index |
| `contact_messages` | Contact form | public submission (optional auth), status workflow `new/read/replied/closed` |

---

## API Surface

All responses use a consistent envelope: `{ success, message?, data?, errors? }`.

### Public
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api` | Health check |
| GET | `/api/public/stats` | Landing-page counters |
| GET | `/api/universities` | University list |
| GET | `/api/components/public` | Public component mirror |
| GET | `/api/categories` | Component categories |
| POST | `/api/contact` | Contact form (optional auth, validated) |
| POST | `/api/borrowing/return/confirm` | **QR token redemption** (no auth, single-use) |
| GET | `/api/auth/users/:id/avatar` | Avatar stream (`<img>` cannot send a Bearer header) |

### Auth & account
`POST /api/auth/signup` · `POST /api/auth/admin/signup` · `POST /api/auth/login` · `GET /api/auth/me` · `PUT /api/auth/profile` · `PUT|DELETE /api/auth/avatar` · `GET /api/auth/user/:username` · `GET /api/auth/users` · `GET /api/auth/users/:id` · `PUT /api/auth/users/:id/approve|reject` · `DELETE /api/auth/users/:id` · `PUT /api/auth/users/:id/suspend|unsuspend`

### Components & resources
`GET|POST /api/components` · `GET /api/components/my` · `GET|PUT|DELETE /api/components/:id` · `GET /api/components/:id/image`
`GET|POST /api/resources` · `GET /api/resources/:id` · `GET /api/resources/:id/download` · `DELETE /api/resources/:id`
`GET|POST|PUT|DELETE /api/categories[/:id]`

### Borrowing
`POST /api/borrowing` · `GET /api/borrowing/my-history` · `GET /api/borrowing/received` · `GET /api/borrowing/owner-history` · `GET /api/borrowing/active-request` · `GET /api/borrowing/:id`
`PUT /api/borrowing/:id/approve|reject|borrowed|return-request|confirm-return|generate-return-qr|cancel`
`GET /api/borrowing/history[/:id]` · `DELETE /api/borrowing/history/:id` (staff)

### Messaging & notifications
`GET /api/messages/config|unread-count|users|conversations` · `POST /api/messages/conversations` · `GET|POST /api/messages/conversations/:id/messages` · `PUT /api/messages/conversations/:id/read`
`GET /api/notifications|unread-count|:id` · `PUT /api/notifications/:id/read|read-all` · `DELETE /api/notifications/:id` · `POST /api/notifications` (staff)

### Forum & support
`GET|POST|PUT|DELETE /api/forum/categories[/:id]` · `GET|POST /api/forum/issues` · `GET /api/forum/issues/:issueId` · `GET|POST /api/forum/issues/:issueId/comments`
`GET|POST /api/tickets` · `GET /api/tickets/:ticketId` · `GET|POST /api/tickets/:ticketId/messages` · `PATCH /api/tickets/:ticketId/status`
`GET|POST /api/reports` · `GET /api/reports/:id`

### Dashboards & catalog
`GET /api/dashboard/stats` · `GET /api/admin/dashboard/stats` · `GET /api/moderator/dashboard/stats|pending-users` · `PUT /api/moderator/users/:id/approve|reject`
`GET|POST /api/admin/universities` · `POST /api/admin/universities/import` (CSV) · `GET /api/admin/universities/with-courses` · `DELETE /api/admin/universities[/:id]` · `DELETE /api/admin/universities/courses/:courseId` · `POST /api/admin/universities/courses/bulk-delete` · `GET /api/universities/:universityId/courses` (authenticated)

### Socket.IO events

| Direction | Event | Payload |
|---|---|---|
| C → S | `conversation:join` / `conversation:leave` | `{ conversationId }` (ack: `{ ok, online }`) |
| C → S | `message:send` | `{ conversationId, content, clientMessageId }` (ack) |
| C → S | `typing:start` / `typing:stop` | `{ conversationId }` |
| C → S | `message:read` | `{ conversationId }` (ack: `{ updatedCount }`) |
| C → S | `presence:query` | `{ userIds[] }` (max 50, ack: map of online flags) |
| S → C | `message:new` | `{ message, conversation }` |
| S → C | `conversation:new` | `{ conversation }` |
| S → C | `message:read` | `{ conversationId, readerId, readAt }` |
| S → C | `unread:update` | `{ total }` |
| S → C | `presence:update` | `{ userId, online }` |

---

## Getting Started

### Prerequisites
- **Node.js 18+** (the backend uses global `fetch` and modern ESM-free CommonJS)
- A **MongoDB** database (local or Atlas)
- A **Vercel Blob** store with a read/write token (component images, resources, avatars are stored there)

### 1. Clone

```bash
git clone <your-repo-url> campusync
cd campusync
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```dotenv
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=<long random string>

# Vercel Blob — required for avatars, component images and resource files
BLOB_READ_WRITE_TOKEN=<vercel blob read/write token>
BLOB_STORE_ID=<store id>
```

Run it:

```bash
npm run dev        # nodemon on http://localhost:5000
# or
npm start          # node server.js
```

On boot you should see `MongoDB connected`, `Server running on port 5000`, and `Socket.IO enabled`.

### 3. Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Run it:

```bash
npm run dev        # Vite on http://localhost:5173 (--host exposes it on your LAN)
npm run lint       # ESLint flat config
npm run build      # production bundle → dist/
npm run preview    # serve the production bundle
```

### 4. Configure CORS for your origin

The backend uses an explicit allow-list in `backend/config/allowedOrigins.js`, shared by Express **and** Socket.IO:

```js
const allowedOrigins = [
  "https://campusyncweb.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://192.168.0.109:5173",
];
```

Add your dev origin (or your deployed domain) here — otherwise preflight `OPTIONS` requests are rejected with `403`.

### Environment variables

| File | Variable | Required | Used for |
|---|---|:---:|---|
| `backend/.env` | `PORT` | no (defaults to `5000`) | HTTP port |
| | `MONGODB_URI` | **yes** | Mongoose connection |
| | `JWT_SECRET` | **yes** | Signing/verifying tokens (REST + Socket.IO handshake) |
| | `BLOB_READ_WRITE_TOKEN` | **yes** for uploads | Private blob read/write; uploads return `500` if unset |
| | `VERCEL` | set by host | Switches `server.js` to `module.exports = app` and disables Socket.IO |
| `frontend/.env` | `VITE_API_URL` | **yes** | axios `baseURL`, image/download URLs, socket origin derivation |

> `.env` files are git-ignored in both packages. Commit `.env.example` files instead if you distribute the project.

### Scripts

| Package | Command | What it does |
|---|---|---|
| backend | `npm run dev` | `nodemon server.js` |
| backend | `npm start` | `node server.js` |
| backend | `npm run migrate:notifications` | Idempotent migration of legacy notification documents (raw driver, nothing deleted) |
| frontend | `npm run dev` | Vite dev server (`--host`) |
| frontend | `npm run build` | Production build |
| frontend | `npm run lint` | ESLint |
| frontend | `npm run preview` | Preview the build |

---

## Deployment

Both packages ship a `vercel.json`.

- **Backend** — `@vercel/node` builds `server.js` and routes everything to it. When `process.env.VERCEL` is set, `server.js` exports the Express app instead of calling `listen`, and **Socket.IO is not attached** because serverless instances cannot hold long-lived websockets. `GET /api/messages/config` then reports `realTime: false` and the client keeps using the REST messaging endpoints.
- **Frontend** — SPA rewrite (`/(.*) → /`) so deep links like `/student/my-borrowing/123` and `/return-confirmation/:token` resolve on refresh.

To run realtime in production, deploy the backend to a long-lived host (a Node VM/container/Railway-style service) and point `VITE_API_URL` at it; `socket.io` will attach automatically.

---

## Engineering Decisions & Problems Solved

**1. Realtime that degrades honestly.**
Serverless cannot hold websockets. Rather than silently falling back, the server *reports its own capability*: `initSocketServer()` is skipped under Vercel, `isEnabled()` surfaces through `GET /api/messages/config`, and `MessagingProvider` only opens a socket when `realTime === true`. Every messaging operation therefore has a REST twin with identical semantics.

**2. Idempotent, single-use QR returns.**
A scanned code must never be redeemable twice, even under double-clicks, replays, or React 18/19 StrictMode double-effects. The token is 32 random bytes; only its **SHA-256 hash** is stored (`select:false` + unique sparse index). Redemption is an **atomic conditional `findOneAndUpdate`** requiring `status === "return_requested"` ∧ unused ∧ unexpired, and the endpoint answers `already_completed` idempotently instead of erroring. The client page shares one in-flight promise per token so a re-render cannot fire a second confirmation.

**3. Exactly-once message sends.**
The client attaches a `clientMessageId` (UUID) that is **reused across retries**. The service pre-checks it and a partial unique index `{senderId, clientMessageId}` backstops the race; a duplicate key error is converted into a `duplicate: true` response rather than a 500.

**4. Conversation creation under concurrency.**
Two users clicking "Message" simultaneously must not produce two threads. `participantKey` is a sorted, lowercased pair id with a unique index; the loser of the race catches `E11000` and returns the conversation that won.

**5. Notification writes can never break the business operation.**
`notificationService` validates types against a closed enum, wraps every write in `try/catch`, logs instead of throwing, and de-duplicates fan-out recipients with a `Set`. It also skips no-op status transitions so retried requests cannot duplicate notifications.

**6. Referential integrity without cascading deletes.**
Deleting a forum category reassigns its issues to `UnCategorised` **inside a transaction**, with an automatic fallback to ordered writes when the deployment (standalone `mongod`) does not support transactions — and `UnCategorised` itself is idempotently ensured on every category read, guarded by a case-insensitive unique index plus an `E11000` retry.

**7. Moderation scope that cannot be forged.**
University scope is always derived from the authenticated moderator profile or from a **snapshot stored on the document** (`ticket.reporterUniversity`, `report.reportedUniversity`), never from a request body — so a moderator cannot widen their reach by editing an ID, and scoping survives the target changing their profile later.

**8. Availability accounting that cannot be corrupted.**
Quantity is decremented only at handover and restored only on return; restoration uses an aggregation-pipeline update (`$min` with total) so it can never overshoot. Staff deletion is restricted to terminal statuses, which hold no quantity.

**9. Presence that survives a crash.**
Online status is an in-memory `Map<userId, Set<socketId>>` and is deliberately never persisted — a restarted server cannot leave users permanently "online", and a user only goes offline when their *last* tab disconnects.

**10. Private object storage with a streaming proxy.**
Blobs are written `access: "private"`; `<img>` tags and download links cannot send a Bearer header, so the backend exposes authenticated/streamed proxies that attach `BLOB_READ_WRITE_TOKEN`, set the correct `Content-Type`/`Content-Disposition`, and stream the body chunk-by-chunk.

**11. Comment threads without recursive queries.**
Replies share the comment collection via `parentComment`. The reader paginates *top-level* comments and then loads descendants **one query per depth level**, capping depth at 20 — deep threads stay correct without loading the whole issue or executing unbounded `$graphLookup`.

**12. Zero-downtime schema migration.**
`scripts/migrateNotifications.js` normalizes legacy documents in place using the raw driver (bypassing validation on purpose), skips already-migrated rows, deletes nothing, and reports orphans — making it safe to run repeatedly.

**13. Predictable DB connectivity on hostile networks.**
`config/db.js` overrides the DNS resolver to `1.1.1.1`/`8.8.8.8` (a common fix for inconsistent SRV resolution), runs a bounded retry loop, and exits rather than half-starting.

---

## Security Posture

**Implemented**

- Stateless JWT with a configurable secret, verified on every REST route and on the Socket.IO handshake
- bcrypt hashing at cost 12; password never leaves the server (`toJSON` + `.select("-password")` + `select("+password")` only on the login comparison)
- Layered authorization (role → verification → ownership/scope → suspension), with `403` responses that do not leak whether a foreign ID exists
- Server-derived identity everywhere: no endpoint accepts a sender, recipient, owner, reporter-university, or notification-recipient id from the client
- CORS origin allow-list shared by Express and Socket.IO; disallowed preflights get `403`
- Input validation with `express-validator` on auth, contact, forum, ticket, and messaging routes; length/enum checks enforced by Mongoose schemas elsewhere
- Upload hardening: extension **and** MIME allow-lists, per-upload size limits (avatar 2 MB, component image 10 MB, resource 50 MB, CSV 10 MB), memory storage for images, disk storage isolated under the OS temp dir
- Regex search terms are escaped (`escapeRegex`) before being interpolated into `$regex`
- Private blob storage with token-authenticated streaming
- Return tokens stored only as SHA-256 hashes with TTL and single-use atomic redemption
- `User.toJSON()` prevents accidental credential exposure in any response

**Gaps to be aware of (current implementation)**

- No rate limiting, no `helmet`, no CSRF layer (bearer-token auth in `localStorage` makes classic CSRF moot but not credential theft via XSS)
- No refresh-token rotation — a single 30-day access token is stored client-side
- No automated test suite (`backend` has no test script; `frontend` has `lint` only)
- `POST /api/auth/admin/signup` is a public endpoint that creates a verified admin; it should be gated (invite token/env flag) before production
- Some write endpoints (components, borrowing) rely on controller-level checks rather than `express-validator` schemas
- Notifications are in-app only — there is no email/SMS delivery
- Availability is reserved at handover, not at approval, so two approvals within the same window are only re-checked at handover time

---

## Known Limitations / Roadmap

- **Tests** — introduce integration tests for the borrow state machine, QR redemption, and authorization matrix (the pure logic in `messagingService` and the token helpers are the easiest wins).
- **CI** — add lint + test gating on pull requests.
- **Availability reservation** — hold quantity at approval time to close the approve/handover race.
- **Dead/legacy code to clean up** — `frontend/src/routes/PrivateRoute.jsx`, `PublicRoute.jsx`, `AdminRoute.jsx`, `hooks/useAuth.js`, and `auth/resources/resourceSlice.js` are empty stubs; `pages/OwnerHistory.jsx` is written but not routed; `auth/moderatorDashboard/pages/Report.jsx` renders static mock data rather than the `/api/reports` endpoint.
- **`cors` dependency** is declared but unused — CORS is implemented manually in `server.js`.
- **Push realtime for notifications** — notifications currently refresh on navigation/dropdown open; they could ride the existing Socket.IO channel.
- **Search** — component/forum search uses escaped case-insensitive regex rather than MongoDB Atlas Search.

---

## Contributing

1. Fork and create a feature branch: `git checkout -b feature/<change>`.
2. Follow the existing conventions:
   - **Backend**: CommonJS, `exports.fn = async (req,res) => {}` controllers, route files own their validation and middleware chain, responses use the `{ success, message, data }` envelope, errors are logged with a contextual label and answered with `500 Internal server error`.
   - **Frontend**: function components with hooks, co-located `.jsx` files, Tailwind utility classes, shared UI in `components/common`, API calls through `services/axios` (never a bare `fetch`).
3. Keep authorization in the backend. UI guards are convenience only.
4. Run `npm run lint` in `frontend/` before opening a PR.
5. Update this README if your change alters a workflow, permission, or endpoint.

---

## Author

Design and development by **Md Shahin**.

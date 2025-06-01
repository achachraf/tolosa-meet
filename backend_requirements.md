# TlsEvent – Backend Integration Requirements

**Document version:** 1.0
**Last updated:** 31 May 2025
**Audience:** Backend / mobile engineers, AI coding agents, product owner

---

## 1 • Purpose

TlsEvent is currently a **React Native/Expo** prototype that mocks the experience of Meetup for the city of Toulouse, using local mock data.
The goal of this document is to define *clear, human‑readable requirements* for adding a fully‑functional backend so the product can be released as a real service.

---

## 2 • High‑level Goals

| #    | Goal                                                                                        | Success indicator                                               |
| ---- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| G‑01 | Persist all user and event data in the cloud.                                               | Data survives reinstall and is visible on any device.           |
| G‑02 | Allow authenticated users to create, join, and manage events.                               | ≥ 95 % of tested CRUD flows succeed without backend errors.     |

---

## 3 • Technology & Services

| Concern                 | Decision                                                 |
| ----------------------- | -------------------------------------------------------- |
| Cloud platform          | **Firebase** (Google Cloud).                             |
| Database                | **Cloud Firestore** (NoSQL, multi‑region `eur3`).        |
| File storage            | **Cloud Storage for Firebase** (`europe‑west`).          |
| Authentication          | **Firebase Auth** with e‑mail + password. |
| Business logic          | **Cloud Functions (TypeScript, Node 20)**.               |

> **Rationale:** Firebase minimizes DevOps overhead, has first‑party RN SDK, and provides granular security rules.

---

## 4 • Architecture Overview

```
┌──────────────────────┐
│  React Native (Expo) │
│  ▸ Firebase JS SDK   │
└───────┬──────────────┘
        │ HTTPS / WebSocket
┌───────▼──────────┐
│ Firestore        │  ← primary data store
├──────────────────┤
│ Cloud Functions  │  ← auth triggers, business rules
├──────────────────┤
│ Cloud Storage    │  ← images & assets
└──────────────────┘
```

All business rules that cannot be expressed in Firestore Security Rules will live in Cloud Functions (TypeScript).

---

## 5 • Data Model (v1)

| Collection              | Key fields                                                                                                                                                                                                                                                             | Notes                                                                                              |                            |                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------- |
| `users`                 | `uid` (Auth UID) **docID**<br>`displayName`<br>`photoURL`<br>`bio` (≤ 500 chars)<br>`joinedAt` (serverTimestamp)                                                                                                                                                       | Public profile is denormalised here.                                                               |                            |                                               |
| `events`                | `id` **docID** (ULID)<br>`title` (≤ 80)<br>`description` (markdown, ≤ 4 kB)<br>`category` (enum)<br>`location` (`geoPoint`, `address`)<br>`capacity` (int ≤ 500)<br>`startTime`, `endTime` (Timestamp)<br>`organizerUid`<br>`coverImage` (Storage path)<br>`createdAt` | Queries are most frequent on `startTime`, `category`, and `location`.  Composite indexes required. |                            |                                               |
| `events/{id}/attendees` | `uid` **docID**<br>`status` (`going`                                                                                                                                                                                                                                   |  `waitlist`                                                                                        |  `declined`)<br>`joinedAt` | Sub‑collection enables fast attendee listing. |
| `categories`            | `slug` **docID**<br>`nameFr` `nameEn`                                                                                                                                                                                                                                  | Static; editable only by admin.                                                                    |                            |                                               |
| `comments` *(future)*   | …                                                                                                                                                                                                                                                                      | Out‑of‑scope for MVP.                                                                              |                            |                                               |

All images (event cover, avatars) are stored under `/users/{uid}/avatar.jpg` or `/events/{id}/cover.jpg` in Cloud Storage, public‑read with signed URLs.

---

## 6 • Functional Requirements

### 6.1  Authentication & Profile

1. **Sign‑up / sign‑in** using:

   * email + password (mandatory double‑opt‑in e‑mail)
2. **Profile edit**: change display name, avatar, short bio.
3. **Delete account**: cascade removes personal data (GDPR ‑ 30 days soft‑delete grace).

### 6.2  Event Lifecycle

| Actor              | Action                          | Rules                                                                            |
| ------------------ | ------------------------------- | -------------------------------------------------------------------------------- |
| Authenticated user | **Create event**                | *Required fields:* title, category, time range, location. Organizer is creator.  |
| Organizer          | **Update / cancel** event       | Edits allowed until startTime‑1 h. Cancellation sends notification to attendees. |
| Organizer          | **Upload / change cover image** | JPEG/PNG ≤ 3 MB; Cloud Functions generates 600 px wide thumbnail.                |
| Organizer          | **Set capacity**                | 0 = unlimited; else positive int.                                                |

### 6.3  Discovery

1. **Featured list**: upcoming events sorted by soonest start time.
2. **Filter** by category + text search on lower‑cased `title` and `description`.
3. **Map view** (phase 2): cluster events within 25 km of Place du Capitole.

### 6.4  RSVP / Attendance

1. **Join event**: adds doc in `attendees`; respects capacity.
2. **Leave event**: removes doc; frees slot for waitlist.
3. **Waitlist**: automatic promotion in Cloud Function on vacancy.



### 6.6  Admin

* Hidden “Admin” role (custom claim) for moderators to remove abusive content, manage categories.

---

## 7 • Technical Requirements

- Use admin SDK for all server‑side operations.
- No direct client access to Firebase services; all operations go through Server API.
- find all the necessary configs in the `server/tolosa-app-firebase-adminsdk-fbsvc-59084781ce.json` file.
- Use the "server" directory in the root of the project to hold the backend code.
- Use express.js for the server.
- Adapt the client_app to use the new backend endpoints.
- Use TypeScript for type safety.
- Protect server APIs with authentication middleware (no need to use firebase auth, just use a custom auth middleware with JWT).
- Client app should pass the JWT token in the Authorization header for all requests.


Cloud Functions will additionally validate business invariants (capacity, time windows).

---

## 8 • Non‑Functional Requirements

| Aspect               | Requirement                                                    |
| -------------------- | -------------------------------------------------------------- |
| Performance          | ≤ 300 ms p95 for main reads over 4G.                           |
| Offline              | Firestore cache enabled; queued writes sync on reconnect.      |
| Internationalisation | App UI in **FR** (default) and **EN**.                         |
| Accessibility        | WCAG 2.1 AA for color contrast & touch targets.                |
| Privacy              | GDPR & French CNIL guidelines; data stored in EU regions only. |
| Monitoring           | Enable Crashlytics, Performance Monitoring dashboards.         |

---

## 9 • Acceptance Criteria (Happy Path)

1. Alice installs app → signs up with Google.
2. She creates “Picnic at Jardin des Plantes” for 12 June 18:00 – 20:00.
3. Bob discovers event via search “picnic” and taps **Join**; attendee count updates for both users.
4. On 11 June 18:00 both receive reminder push.
5. Alice cancels event on 11 June 19:00 → push “Event cancelled” sent; status set to *cancelled*.

---

## 10 • Out‑of‑Scope (v1)

* Direct messaging / group chat
* Paid tickets or Stripe integration
* Recurring events
* Global (non‑Toulouse) support
* **Push**:

  * immediately on event creation if `startTime` is within 48 h.
  * 24 h and 1 h reminders for attendees.
* **In‑app badge** for unread updates.

---

## 11 • Glossary

| Term      | Definition                                                    |
| --------- | ------------------------------------------------------------- |
| RSVP      | Reservation système pour indiquer sa participation.           |
| Organizer | Utilisateur créant l’événement, ayant droits de modification. |
| Waitlist  | File d’attente lorsque la capacité est atteinte.              |

---

**End of document**

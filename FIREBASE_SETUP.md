# DevMomentum Admin Dashboard — Firebase Setup

## Overview

The admin dashboard uses Firebase Authentication, Firestore, and Firebase custom claims.

The dashboard is intended to show:

- Registered users
- Active users during a selected period
- Roadmap generation events and selected domains
- Average study duration
- User distribution by academic year and branch
- Daily task-completion trends

Metrics are displayed only when their data source is available. Existing browser localStorage data does not provide historical, cross-user analytics.

## 1. Configure Firebase

1. Open the Firebase Console: https://console.firebase.google.com/
2. Select the Firebase project used by DevMomentum.
3. Enable Firebase Authentication and the sign-in methods used by the existing application.
4. Create or enable a Cloud Firestore database.
5. Configure `firebase-config.js` using the project's actual Firebase web-app configuration.
6. Do not commit private service-account credentials or Admin SDK keys.

The current repository references `firebase-config.js`, but that file must be created and configured by the project maintainer if it is not already present.

## 2. Grant administrator access securely

The dashboard requires the Firebase Authentication custom claim:

`admin: true`

Assign this claim only from a trusted environment using the Firebase Admin SDK. Never grant admin access through browser JavaScript, a user-editable profile field, or an email address check alone.

Example for a trusted, access-controlled Node.js environment:

```javascript
const { getAuth } = require("firebase-admin/auth");

async function grantAdmin(uid) {
  const user = await getAuth().getUser(uid);

  await getAuth().setCustomUserClaims(uid, {
    ...(user.customClaims || {}),
    admin: true
  });
}
```

Initialize the Firebase Admin SDK securely before running this example. Use an existing trusted claim-management process where possible. Do not expose this function through an unrestricted public endpoint.

After changing claims, the user may need to sign in again or refresh their ID token.

To revoke administrator access, update the custom claims from the trusted environment and revoke existing refresh tokens if immediate reauthentication is required.

## 3. Firestore collection contract

The current dashboard expects these collections and fields.

### `users`

One document per user, preferably keyed by Firebase UID.

Suggested fields:

- `createdAt`: account creation timestamp
- `academicYear`: normalized academic-year label
- `branch`: normalized branch label

Store only the profile information required by the application. Do not expose passwords, authentication tokens, or unnecessary sensitive information.

### `activityEvents`

One event per tracked activity.

- `uid`: Firebase UID
- `type`: activity type
- `createdAt`: Firestore timestamp

The dashboard counts distinct UIDs with events during the selected period as active users. The exact definition of activity should be documented and consistently implemented.

### `roadmapEvents`

One event for each successfully generated roadmap.

- `uid`: Firebase UID
- `domain`: selected roadmap domain
- `createdAt`: Firestore timestamp

Create the event only after roadmap generation succeeds. Avoid recording unnecessary personal data.

### `studySessions`

One record per measured study session.

- `uid`: Firebase UID
- `durationMinutes`: validated non-negative duration
- `createdAt`: Firestore timestamp

The dashboard calculates average study hours per distinct user with valid sessions during the selected period. This is not necessarily the average across all registered users.

### `taskCompletionEvents`

One event per task completion.

- `uid`: Firebase UID
- `taskId`: task identifier
- `completedAt`: Firestore timestamp

Create events through trusted, validated application logic. Define how repeated completion, task reopening, and duplicate events are handled before using these records for reporting.

## 4. Deploy Firestore Security Rules

Review `firestore.rules` against the existing application's required collections and operations before deployment.

Then publish the reviewed rules using the Firebase Console or Firebase CLI.

The provided rules:

- Restrict dashboard analytics reads to users with the trusted admin claim.
- Restrict profile reads to the owner or an administrator.
- Deny client writes to analytics collections.
- Deny access to unspecified collections by default.

**Do not deploy these rules without reviewing compatibility with existing application features.** The rules may require adjustments for legitimate application writes or additional collections.

Firebase Admin SDK operations bypass Firestore Security Rules, so trusted backend code must perform its own authorization and validation.

## 5. Populate analytics

The current dashboard does not automatically generate historical events.

Implement event creation in trusted backend logic or in validated application operations consistent with the security model. If the frontend is permitted to write a particular event, use strict rules to validate the authenticated UID, allowed fields, field types, timestamps, and event semantics.

Do not treat client-submitted durations or completion events as verified facts without appropriate validation.

Historical metrics cannot be reconstructed reliably from existing localStorage state alone. Start collecting events before presenting historical trends as complete.

## 6. Test administrator access

Verify the following before merging:

1. A signed-out visitor cannot view analytics.
2. A signed-in regular user without `admin: true` is denied.
3. An authorized administrator can load permitted dashboard metrics.
4. A regular user cannot read another user's profile.
5. A regular user cannot read analytics collections.
6. A client cannot assign itself admin privileges.
7. Missing collections or denied reads produce unavailable metrics rather than fabricated numbers.
8. Existing application features continue working under the deployed rules.

Use the Firebase Emulator Suite and rules tests where possible.

## 7. Metric limitations

- Registered users: the current dashboard counts documents in `users`; this is not automatically equivalent to every Firebase Authentication account.
- Active users: distinct UIDs with activity events in the selected period.
- Roadmaps: roadmap-event documents in the selected period.
- Domains: counts of roadmap events grouped by domain.
- Study time: total valid recorded minutes divided by distinct users with valid sessions in the period.
- Academic year and branch: counts based on profile fields.
- Completion trends: events grouped by completion date.

Metrics are incomplete until their data sources are populated and their definitions match the actual application.

## Why

Emergency reporters need a frictionless way to capture media-rich incident details on mobile
without authentication so dispatchers receive actionable information immediately.

## What Changes

- Deliver an emergency incident capture flow in the mobile app that launches the device
  camera for photo or video evidence before submission.
- Auto-capture GPS coordinates (lat/lng and accuracy radius) and attach them to the pending
  incident payload.
- Collect structured fields for incident type, narrative description, and optional reporter
  mobile number to enable dispatcher follow-up.
- Validate required inputs client-side and stage the submission payload for future API
  integration.

## Impact

- Affected specs: `001-incident-response`
- Affected code: `apps/mobile/app`, `apps/mobile/screens`, `apps/mobile/hooks/location`,
  `apps/mobile/state`

# Research: Incident Response Coordination

## Real-Time Transport & Synchronization
- **Decision**: NestJS WebSocket gateway (Socket.IO adapter) backed by Redis pub/sub for multi-instance fan-out.
- **Rationale**: Socket.IO integrates tightly with NestJS modules, provides reconnection/backoff capabilities, and Redis-based adapters satisfy constitution requirements on reliability and graceful degradation.
- **Alternatives considered**:
  - **Native WebSocket server**: Lower overhead but lacks built-in rooms/acknowledgements; requires more plumbing for reconnection handling.
  - **Pusher/Ably (managed)**: Simplifies scaling but adds vendor lock-in and higher recurring cost; offline replay still needs custom queues.

## Push Notifications & Fallback Messaging
- **Decision**: Expo Push API for mobile notifications with retry queue; Twilio SMS fallback triggered when Expo receipts report failures or timeouts.
- **Rationale**: Expo Push slots directly into Expo-managed mobile app with minimal device setup. Twilio SMS ensures responder reachability even when push tokens expire.
- **Alternatives considered**:
  - **Firebase Cloud Messaging**: Requires extra native configuration per platform; Expo Push already built atop FCM/APNS without extra complexity.
  - **Email fallback**: Slower response time and lower visibility during emergencies.

## Media Storage & Security
- **Decision**: Store media in S3-compatible bucket (AWS S3 primary, R2 acceptable) using pre-signed URLs with short TTL, malware scanning via queued worker before marking media "trusted".
- **Rationale**: Aligns with privacy principle by limiting data exposure, leverages object storage lifecycle policies for retention, and keeps API stateless.
- **Alternatives considered**:
  - **Direct upload to API server**: Violates scalability and latency targets; increases risk during large uploads.
  - **Firebase Storage**: Additional ecosystem; harder to integrate with existing infra automation.

## Rate Limiting & Abuse Mitigation
- **Decision**: Use Redis-based sliding window limiter per device fingerprint and IP; escalate to CAPTCHA challenge via hCaptcha when thresholds breached.
- **Rationale**: Redis supports distributed counters, matches infrastructure already required for sockets, and sliding window maintains smooth user experience while blocking bursts.
- **Alternatives considered**:
  - **Token bucket in-memory**: Fails under horizontal scaling.
  - **Cloudflare Turnstile only**: Adds friction to first-time reporters, conflicting with speed principle.

## Analytics & Observability
- **Decision**: Instrument API and WebSocket events with OpenTelemetry feeding into Prometheus + Grafana dashboards; error monitoring via Sentry across apps.
- **Rationale**: Provides quantitative success metrics (submission latency, response times) and aligns with governance requirement for compliance reviews.
- **Alternatives considered**:
  - **Datadog only**: Faster setup but higher ongoing cost; existing team familiarity with Prometheus stack.
  - **Manual logging**: Insufficient for proactive monitoring.

## CI/CD & Environment Strategy
- **Decision**: GitHub Actions orchestrating lint, test, build, and deploy pipelines; web deploys to Vercel, API to container platform (Render/Fly), mobile via Expo EAS.
- **Rationale**: Centralizes automation, supports branch previews for web, and integrates with pnpm/Turborepo caching.
- **Alternatives considered**:
  - **Self-hosted Jenkins**: Higher maintenance overhead.
  - **CircleCI**: Similar capabilities but lacks seamless Vercel integration compared to GitHub Actions.

## Data Retention & Privacy Safeguards
- **Decision**: Define retention policy of 6 months for anonymous incidents by default, with scheduled jobs to purge or anonymize; encrypt sensitive fields (contact info, device fingerprint) at rest via PostgreSQL column-level encryption or application-managed secrets.
- **Rationale**: Meets privacy principle while preserving data for auditing and analytics windows.
- **Alternatives considered**:
  - **Indefinite retention**: Violates privacy commitments.
  - **Immediate deletion**: Prevents analytics and audit value.

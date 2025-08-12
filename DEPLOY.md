# RESQ-LINK Deploy Notes (MVP)

## .env Sample
```
APP_NAME=RESQ-LINK
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_LEVEL=info
STRUCTURED_LOGS=true

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=resq
DB_USERNAME=resq
DB_PASSWORD=secret

BROADCAST_DRIVER=pusher
CACHE_DRIVER=redis
QUEUE_CONNECTION=database
SESSION_DRIVER=cookie
SESSION_LIFETIME=120

PUSHER_APP_ID=local
PUSHER_APP_KEY=local
PUSHER_APP_SECRET=local
PUSHER_APP_CLUSTER=mt1
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http

SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost
SESSION_DOMAIN=localhost

# Provider placeholders
TWILIO_SID=
TWILIO_TOKEN=
GLOBE_API_KEY=
FCM_SERVER_KEY=
```

## NGINX + PHP-FPM (sketch)
- Serve `public/` via NGINX
- Proxy `/storage` as needed
- FastCGI to php-fpm; increase `client_max_body_size` for media
- Websockets location to `:6001` for Laravel WebSockets in dev

## Queues
- Use `php artisan queue:work` for notifications and webhooks processing
- Run `schedule:work` for retries and cleanup

## Websockets (Dev)
- Use `beyondcode/laravel-websockets`
- Run `php artisan websockets:serve`

## CI Steps
- composer install --no-interaction --prefer-dist
- php artisan key:generate --force
- php artisan migrate --force --no-interaction
- npm ci && npm run build
- (Mobile) npm run build:mobile (Capacitor sync/build as needed)

## Notes
- All external integrations are stubbed; add real providers later (Twilio/Globe/FCM/Whisper)
- Webhook endpoints must be idempotent (use external_ref or payload signature)

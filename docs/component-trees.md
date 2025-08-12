# Component Trees

## Web (React + Vite)
- App
- AuthLayout
  - LoginPage
- ConsoleLayout
  - Sidebar
  - Header
  - IncidentsListPage
    - FiltersBar
    - IncidentsTable
  - IncidentDetailPage
    - IncidentHeader
    - MapView (Leaflet or Google Maps)
    - AssignmentPanel
      - NearestResponderButton
      - AssignedResponderCard
    - StatusTimeline
    - MediaGallery
  - LiveFeedPage
    - EventsStream

## Mobile (Capacitor + React)
- App
- AuthStack
  - LoginScreen
- MainTabs
  - MyIncidentsScreen
    - IncidentCard
  - IncidentDetailScreen
    - MapView
    - RouteCTA
    - StatusButtons (En Route, On Scene, Resolved)
    - MediaUpload
  - SettingsScreen
    - BackgroundLocationToggle
    - PushToggle

## Channels and Events
- Broadcast Channels:
  - public: none
  - presence: `presence-responders`
  - private: `private-incident.{id}`, `private-responder.{id}`
- Events:
  - `incident.created`
  - `incident.updated`
  - `incident.closed`
  - `assignment.created`
  - `assignment.acknowledged`
  - `responder.location.updated`

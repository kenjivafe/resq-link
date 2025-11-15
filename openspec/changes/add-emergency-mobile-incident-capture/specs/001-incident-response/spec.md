## ADDED Requirements

### Requirement: Emergency Incident Capture on Mobile

The mobile application SHALL provide an emergency incident capture flow that operates without
user authentication, collecting media evidence, precise location, and structured incident
details prior to submission.

#### Scenario: Capture media evidence before submission

- **GIVEN** a reporter opens the emergency incident flow
- **WHEN** they choose to capture evidence
- **THEN** the app launches the device camera allowing photo or video capture and displays a
  preview for confirmation

#### Scenario: Auto-capture GPS coordinates

- **GIVEN** the reporter is on the emergency capture screen
- **WHEN** the flow loads without location permissions granted
- **THEN** the app requests foreground GPS permission, captures latitude, longitude, and
  accuracy radius once granted, and associates them with the incident draft

#### Scenario: Collect required incident metadata

- **GIVEN** the reporter is completing the emergency capture form
- **WHEN** they provide incident type, description, and optionally a mobile number
- **THEN** the app validates required fields locally and stages a submission payload that
  includes the captured media reference, location coordinates, incident metadata, and contact
  number if supplied

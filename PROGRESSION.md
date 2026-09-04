# Progression

## Current Sprint / In Progress
- [x] Milestone 2: Workout Experience & Accomplishment
  - [x] PR (Personal Record) Tracking & Notification
  - [x] Workout Finish Summary Screen

## Backlog / Next Steps
- [x] PR (Personal Record) Tracking & In-Session Notification
  - [x] Query user's historical best (Max Weight / Max Reps) per exercise
  - [x] Live comparison in Active Workout: highlight "NEW PR! 🏅" when a set exceeds all-time record
  - [x] Confetti / visual celebration micro-interaction on PR achievement
- [x] Workout Finish Summary Screen & Celebration
  - [x] Post-workout modal or summary view upon pressing "Finish Workout"
  - [x] Metrics breakdown: Total Volume (kg), Completed Sets, Total Duration, PRs broken today
  - [x] Option to share or view summary recap
- [ ] Rest Timer Audio & Vibration Notifications
  - [ ] Synthesized audio chime via Web Audio API (cross-browser without external audio asset dependencies)
  - [ ] Web Vibration API (`navigator.vibrate`) trigger on timer completion for mobile devices
  - [ ] Toggle switch in settings / timer widget to enable/disable sound and vibration
- [ ] PWA (Progressive Web App) Support
  - [ ] Web App Manifest (`manifest.json`) with app icons and theme colors (`#39FF14` neon green & dark theme)
  - [ ] Service Worker setup for offline fallback and cache optimization
  - [ ] Standalone display mode for seamless "Add to Home Screen" on iOS Safari and Android Chrome
- [ ] Custom Routine & Exercise Management
  - [ ] Exercise management UI (add custom exercises, select muscle groups, equipment type)
  - [ ] Routine builder UI (create custom routines, reorder workouts, customize target sets/reps)
  - [ ] Superset pairing editor in routine setup
- [ ] Exercise Swap during Active Workout
  - [ ] "Swap Exercise" action button in `ExerciseBlock`
  - [ ] Modal to pick alternate exercise targeting the same muscle group
  - [ ] Preserve or cleanly replace set logs for that session without corrupting the base routine

## Completed
- [x] Login and User Profile System (NextAuth.js v5 Credentials Provider, bcryptjs, Neon PostgreSQL)
- [x] Workout Plan / Routine System (Seed script from `workout_plan.md`, schema review, multi-split)
- [x] Dashboard UI (Current routine, next workout suggestion, recent workouts, weekly counter)
- [x] Active Workout Screen (Recording sets, reps, weight, auto-fill from previous session)
- [x] Superset UI Grouping (Paired exercises grouped with visual connectors and set-by-set flow)
- [x] History & Progress Chart Pages (Session logs list, Recharts progress by exercise)
- [x] PR (Personal Record) Tracking & In-Session Notification
- [x] Workout Finish Summary Screen & Celebration

## Blockers & Notes
- None.

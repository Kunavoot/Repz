# Repz Workout Tracker

Glossary and domain language for the Repz workout tracking application.

## Language

**Workout Plan**:
A template or schedule of exercises meant to be followed over a period (e.g. a weekly routine).
_Avoid_: Program, schedule

**Workout Session**:
A specific instance of a user performing a workout on a given date.
_Avoid_: Day log, workout entry

**Exercise**:
A specific physical movement to be performed, like "Decline Push-ups".
_Avoid_: Workout, move

**Superset**:
A grouping of two or more Exercises intended to be performed sequentially with minimal rest.
_Avoid_: Combo, paired set

**Set Log**:
A recorded instance of completing one set of a specific Exercise within a Session, including the actual reps and weight used. When starting a Session, initial values default to the user's most recent completed Set Log for that Exercise, falling back to targets defined in the Workout Plan.
_Avoid_: Set record, tracking entry

**Routine**:
A logical sequence of workouts (e.g. Push, Pull, Legs) that is not strictly bound to specific calendar days.
_Avoid_: Day-of-week schedule

**User / User Account**:
A registered person in the application who has their own isolated workout data. Authentication is handled via Email + Password (hashed and salted).
_Avoid_: Member, client

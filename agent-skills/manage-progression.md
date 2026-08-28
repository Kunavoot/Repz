---
name: manage-progression
description: Manage and auto-update the PROGRESSION.md file to track project status, backlog, and completed work. Use when the user asks for a project update, requests the next feature to work on, or immediately after completing a major feature implementation.
---

# Manage Progression

## Context
This skill maintains the `PROGRESSION.md` file in the project root to keep track of what is currently being built, what is next, and what has been completed. It ensures the user and the agent are always aligned on the project's state.

## File Structure Standard
The `PROGRESSION.md` MUST always follow this exact structure. If the file exists but does not match this, refactor it to match.

```markdown
# Progression

## Current Sprint / In Progress
- [ ] Task currently being worked on
  - [ ] Sub-task 1
  - [ ] Sub-task 2

## Backlog / Next Steps
- [ ] Future feature A
- [ ] Future feature B

## Completed
- [x] Finished feature (Brief note on tech used/decisions)

## Blockers & Notes
- Any current issues blocking progress, or "None"
```

## Workflow

When triggered, execute the following steps AUTOMATICALLY (do not ask for permission first):

1. **Read** the current `PROGRESSION.md` (if it doesn't exist, create it with the standard structure).
2. **Evaluate & Edit**:
   - **On Feature Completion**: Move the finished item from `Current Sprint` to `Completed`. Check the box `[x]` and append a short (1-sentence) technical note about how it was implemented.
   - **On Starting Next Task**: Move the most logical top item from `Backlog` to `Current Sprint`. Break it down into smaller sub-task checkboxes `[ ]`.
   - **Update Blockers**: Ensure `Blockers & Notes` accurately reflects the current reality.
3. **Save** the file using `replace_file_content` or `write_to_file`.
4. **Report** back to the user with a concise markdown summary in the chat containing:
   - What was just updated in the file.
   - Any current blockers.
   - The immediate next step you propose to work on.

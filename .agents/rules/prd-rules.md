---
trigger: manual
---

# PRD Rules

When working with PRDs:

1. Identify the master/current PRD before modifying other PRDs.

2. Read the complete relevant PRDs before making changes.

3. Treat the master PRD as the source of truth for project-level decisions.

4. Do not blindly copy the master PRD into other PRDs.

5. Preserve the purpose and structure of each PRD.

6. Update only requirements that are outdated, conflicting, or missing.

7. Never invent requirements, architecture, features, experiments, metrics, or implementation details.

8. Distinguish clearly between:
   - implemented
   - planned
   - future work
   - experimental
   - deprecated

9. If two PRDs conflict, resolve the conflict using the master PRD unless there is explicit evidence that the master is outdated.

10. Do not modify the master PRD unless explicitly instructed.

11. After updating PRDs, scan all related PRDs again for contradictions.

12. Ensure terminology, architecture, models, data requirements, APIs, and workflows remain consistent across PRDs.

13. Do not delete useful information simply because it is not present in the master PRD.

14. Do not perform blind global search-and-replace operations.

15. If information cannot be verified, mark it as:
   [TODO: Verify]

16. If a new experiment is required, mark it as:
   [TODO: Additional experiment required]

17. Never fabricate experimental results or claim that an experiment was performed when it was not.

18. Before finalizing changes, provide a concise summary of:
   - files changed
   - major changes
   - conflicts resolved
   - unresolved TODOs
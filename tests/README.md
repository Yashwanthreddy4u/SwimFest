# SwimFest spec-driven test suite

`Global Navigation, Portal Architecture.md` is the source specification. The
test catalog references its Chapters 1–14 and the appended Event Manager,
Tournament Organizer, and Super Admin modules. Each test case has a stable
case ID; the application also receives generated `data-testid` attributes for
its page landmarks, controls, buttons/links, and icons.
Existing element IDs are namespaced by page (for example, `index-logo` and
`admin-adminconsolesearch`); elements without IDs receive stable role/label
IDs, and icons are named under their parent component.

## Run

Start the existing static site server from the repository root, then open:

```text
http://localhost:3000/tests/console-test-runner.html
```

The page starts the checks automatically. It opens actual application routes
inside same-origin browser frames and runs low-risk interactions against the
rendered pages. **Run / rerun checks** opens a fresh set of frames. Use
**Download CSV (Excel)** to open the report in Excel, or download the standalone
HTML report. The CSV contains one row per case, including status and observed
evidence.

## Reading results

- **PASS** — the live page meets the case's UI-presence expectation, or an
  actual, safe interaction matched the specified outcome. Evidence says which
  type of check passed.
- **FAIL** — a live route failed to load, the specified live feature surface is
  missing, a live interaction differed from the requirement, or generated test
  IDs are missing/duplicated. A failure is a spec mismatch to investigate.
- **BLOCKED** — authentication, seed data, a payment sandbox, a reachable
  database/API, or infrastructure testing is required. The suite never labels
  an unexecuted backend behavior as a pass.

The cases and expected outcomes are derived from `Global Navigation, Portal
Architecture.md`, not inferred from implementation behavior. A few live checks
use temporary, in-memory event cards to exercise the actual homepage input
handlers; those fixtures are removed immediately and are never written to
storage or Supabase. Specified actions that could create, approve, pay for,
delete, publish, or lock real records are not triggered.

Authenticated flows and backend/infrastructure requirements remain explicitly
blocked until a test account, isolated seeded environment, payment sandbox, and
safe API/load/security test configuration are supplied. Generated `data-testid`
attributes are selectors for inspection, not evidence that a feature conforms
to the specification.

(function (global) {
  'use strict';

  const cases = [];

  function contract(id, chapter, page, selector, name, expected) {
    cases.push({ id, chapter, page, selector, name, expected, mode: 'contract' });
  }

  function behavior(id, chapter, page, selector, name, expected, liveCheck) {
    cases.push({ id, chapter, page, selector, name, expected, mode: 'behavior', liveCheck });
  }

  function manual(id, chapter, name, expected) {
    cases.push({ id, chapter, page: '', selector: '', name, expected, mode: 'manual' });
  }

  contract('GN-001', '1', 'index.html', '#logo', 'Brand logo and icon', 'Logo is a home/top link and its swimmer icon receives a unique test ID.');
  contract('GN-002', '1', 'index.html', '#stateSelector', 'State selector', 'Location selector is a button and the state modal/grid are present.');
  behavior('GN-003', '1', 'index.html', '#stateSelector', 'Location override persistence', 'Selecting another state updates the selector, section state label, and browser storage.', 'state-selection');
  contract('GN-004', '1', 'index.html', '.nav-links', 'Global navigation', 'Upcoming, ongoing, past, academy, and register/login destinations are present.');
  contract('GN-005', '1', 'index.html', '.hero-banner', 'Hero promotion', 'Hero contains featured event content and a registration action.');
  contract('GN-006', '1', 'index.html', '#upcoming-tournaments', 'Upcoming catalog', 'Upcoming event cards expose event, venue, date, city, poster, and categories.');
  contract('GN-007', '1', 'index.html', '#ongoing-tournaments', 'Ongoing catalog', 'Ongoing meet section and live/empty-state surface are present.');
  contract('GN-008', '1', 'index.html', '#past-events-archives', 'Past events archive', 'Past meet section and archive/result actions are present.');
  contract('GN-009', '1', 'index.html', '#mobileMenuBtn', 'Mobile navigation', 'Mobile menu toggle and menu destination links are present.');
  behavior('GN-010', '1', 'index.html', '.nav-links a[href="#upcoming-tournaments"]', 'Upcoming navigation scroll', 'Activating UPCOMING smoothly scrolls the page to #upcoming-tournaments.', 'anchor-scroll');
  contract('GN-011', '1', 'index.html', '.host-card', 'Host/near fallback component', 'A host/near event card component is available for low-event catalogs.');
  behavior('GN-012', '1', 'index.html', '#navbar', 'Sticky public navigation', 'At page scroll, the global header remains locked to the viewport at top with the specified sticky stacking order.', 'sticky-header');
  manual('GN-013', '1', 'Fallback threshold and nearby-state selection', 'With fewer than three local upcoming events, verify slot 3 shows a host-in-state promotion or nearby-state event tagged Nearby State; repeat with a state that has at least three local events.');
  contract('GN-014', '1', 'index.html', '.hero-banner a[href="heatsheets.html"]', 'Hero schedule/heat-sheet action', 'Hero has a direct action to published schedules and heat sheets.');
  behavior('GN-015', '1', 'index.html', '#stateGrid', 'Indian states and territories catalog', 'The picker lists the 28 Indian states and every currently recognized union territory (36 entries total).', 'state-catalog');
  behavior('GN-016', '1', 'index.html', '#logo', 'Logo resets filters and scrolls home', 'Selecting the brand logo clears page filters and smoothly returns the visitor to the top of Home.', 'logo-reset');
  behavior('GN-017', '1', 'index.html', '#mobileMenuBtn', 'Mobile navigation toggle', 'The menu opens from its control and closes after a navigation item is selected.', 'mobile-menu');
  behavior('GN-018', '1', 'index.html', '.host-card .btn-register', 'Host event login prompt', 'Choosing the host event call to action prompts login or organizer signup; cancel dismisses the prompt.', 'host-prompt');
  behavior('GN-019', '1', 'index.html', '.host-card', 'Fallback card follows selected state', 'The low-event fallback uses the currently selected state name rather than a hard-coded state.', 'fallback-state');
  behavior('GN-020', '1', 'index.html', '#stateSelector', 'State-specific tournament catalog refresh', 'Changing the selected state refreshes the upcoming/ongoing/archive catalogs from that state.', 'catalog-refresh');
  manual('GN-021', '1', 'First-visit location detection', 'In a clean browser profile with location/IP lookup available, verify that the detected Indian state becomes the default and state-scoped event filter. Do not change or clear a real user profile to simulate a first visit.');

  contract('DIR-001', '2', 'index.html', '#searchInput', 'Directory keyword search', 'Search field supports title, venue, and city lookup.');
  contract('DIR-002', '2', 'index.html', '#categoryFilter', 'Category filter', 'Category choices cover All, U-10, U-12, U-14, and U-16.');
  contract('DIR-003', '2', 'index.html', '#statusFilter', 'Status filter', 'Status choices cover open, closing soon, live, and completed/archive.');
  contract('DIR-004', '2', 'event.html', '#evTitle', 'Tournament directory detail CTA', 'Directory events can reach their full tournament detail/prospectus page.');
  contract('DIR-005', '2', 'addevent.html', '#aeStrokeMatrix', 'Event stroke/distance matrix', 'Event creation exposes configurable stroke/distance selections.');
  contract('DIR-006', '2', 'addevent.html', '#aeAgePills', 'Event eligibility configuration', 'Event creation exposes age-category eligibility configuration.');
  behavior('DIR-007', '2', 'addevent.html', '#gwB', 'Gateway and offline mode rules', 'Gateway choice controls online checkout versus offline roster import.');
  behavior('DIR-008', '2', 'addevent.html', '#aeStrokeMatrix', 'Relay pricing and swim-up rules', 'Relay fees are separate from individual caps and swim-up is configurable.');
  behavior('DIR-009', '2', 'index.html', '#searchInput', 'Live directory search and filters', 'Keyword, category, and status filters change which matching event cards are visible.', 'directory-filters');

  contract('DET-001', '3', 'event.html', '#evStatusBadge', 'Prospectus status badge', 'Event page presents a current registration status.');
  contract('DET-002', '3', 'event.html', '#evVenue', 'Venue and map details', 'Prospectus exposes venue and pool infrastructure details.');
  contract('DET-003', '3', 'event.html', '#evDeadline', 'Dates and registration deadline', 'Event dates and deadline are shown.');
  contract('DET-004', '3', 'event.html', '#tab-rules', 'Eligibility and prospectus rules', 'Rules include age cutoff, non-medalist eligibility, affiliation, and documents.');
  contract('DET-005', '3', 'event.html', '#evRegisterBtn', 'Registration entry point', 'Prospectus provides a registration call to action.');
  manual('DET-006', '3', 'Google Maps venue link and status transitions', 'Map destination resolves correctly and status changes with event dates/deadline.');

  contract('REG-001', '4', 'register.html', '#fullName', 'Swimmer identity profile', 'Registration profile includes prefilled swimmer identity fields.');
  contract('REG-002', '4', 'register.html', '#genderToggle', 'Locked gender profile', 'Gender is shown as a profile-derived, non-editable registration field.');
  contract('REG-003', '4', 'register.html', '#dob', 'Locked date of birth', 'DOB is shown as a profile-derived, non-editable registration field.');
  contract('REG-004', '4', 'register.html', '#derivedMetrics', 'Age and category derivation display', 'Year of birth, competition age, and age category are shown.');
  behavior('REG-005', '4', 'register.html', '#derivedMetrics', 'December 31 competition-age cutoff', 'Competition age is derived from tournament year and swimmer birth year.');
  behavior('REG-006', '4', 'register.html', '#eventsList', 'Gender and age isolated event grid', 'Only eligible events for the swimmer gender and category are selectable.');
  behavior('REG-007', '4', 'register.html', '#eventsList', 'Single-category and swim-up policy', 'Configured swim-up admits only the next age category and preserves gender isolation.');
  contract('REG-008', '4', 'register.html', '#eventCounter', 'Three individual-event cap', 'Individual event count and remaining capacity are exposed.');
  behavior('REG-009', '4', 'register.html', '#eventCounter', 'Hard cap after third individual event', 'Selecting three individual events disables additional individual stroke choices.');
  contract('REG-010', '4', 'register.html', '#imCheckbox', 'Individual medley selection', 'IM is offered separately within the package allowance.');
  contract('REG-011', '4', 'register.html', '#imSeedTime', 'Seed-time format and NT', 'Seed-time entry supports MM:SS.ms and NT values.');
  contract('REG-012', '4', 'register.html', '#relayCheckbox', 'Relay add-on', 'Relay is a separate optional add-on and does not count toward the individual cap.');
  behavior('REG-013', '4', 'register.html', '#subCapModal', 'Under-cap selection prompt', 'Proceeding with fewer than three individual events prompts the package allowance choice.');
  manual('REG-014', '4', 'One login per swimmer and optional affiliations', 'Profile linkage enforces one swimmer per login; academy/coach remain optional and coach options follow the selected academy.');

  contract('PAY-001', '5', 'register.html', '#feeSummary', 'Itemized registration fee', 'Checkout itemizes the base package and separately priced relay add-ons.');
  contract('PAY-002', '5', 'register.html', '#declProgress', 'Mandatory declarations', 'Required legal/compliance declarations and completion state are visible.');
  contract('PAY-003', '5', 'register.html', '#confirmPay', 'Payment gateway trigger', 'Checkout has an explicit payment action.');
  contract('PAY-004', '5', 'register.html', '#stepFailed', 'Payment failure handling', 'A failed payment state and retry action are present.');
  contract('PAY-005', '5', 'register.html', '#stepSuccess', 'Receipt generation', 'Successful booking exposes receipt/reference details.');
  behavior('PAY-006', '5', 'register.html', '#confirmPay', 'Parent consent and payment callback', 'Consent gates payment; success/failure callbacks produce correct booking and receipt state.');
  manual('PAY-007', '5', 'Fee arithmetic and payment idempotency', 'Verify ₹800 package, ₹300 per relay, totals, duplicate callbacks, and transaction reconciliation against a payment test account.');

  contract('ACD-001', '6', 'academy.html', '#acdSearch', 'Academy and coach search', 'Directory search field is present.');
  contract('ACD-002', '6', 'academy.html', '#cityFilter', 'Academy city filter', 'Directory exposes city filtering.');
  contract('ACD-003', '6', 'academy.html', '#poolFilter', 'Academy pool filter', 'Directory exposes pool infrastructure filtering.');
  contract('ACD-004', '6', 'academy.html', '#acdGrid', 'Academy directory cards', 'Directory can render academy profile and coach details.');
  contract('ACD-005', '6', 'admin.html', '#addAcademyModal', 'Academy master management', 'Admin UI has an academy submission/management form.');
  contract('ACD-006', '6', 'admin.html', '#addCoachModal', 'Coach master management', 'Admin UI has a coach credential submission/management form.');
  behavior('ACD-007', '6', 'register.html', '#affiliatedAcademy', 'Optional academy/coach linkage', 'Active academies populate the selector and selected academy scopes coach choices.');
  manual('ACD-008', '6', 'Super Admin-only master changes and deactivation', 'Verify role restriction, deactivation preserving history, unattached coach state, and leaderboard academy linkage.');

  contract('ROS-001', '7', 'playerlist.html', '#tournamentBanner', 'Roster audit summary', 'Selected meet, registration state, and entry counts are presented.');
  contract('ROS-002', '7', 'playerlist.html', '#rosterSearch', 'Roster search and filters', 'Roster supports search plus category, gender, academy, and anomaly filters.');
  contract('ROS-003', '7', 'playerlist.html', '#addManualBtn', 'Manual walk-in addition', 'Manual/offline swimmer entry can be opened.');
  contract('ROS-004', '7', 'playerlist.html', '#exportBtn', 'Roster spreadsheet export', 'Roster export action is present.');
  contract('ROS-005', '7', 'playerlist.html', '#adminGrid', 'Master player data grid', 'Grid exposes swimmer identity, category, academy, seed time, and row actions.');
  contract('ROS-006', '7', 'playerlist.html', '#saveDraftBtn', 'Save roster draft', 'Draft-save action is present.');
  contract('ROS-007', '7', 'playerlist.html', '#submitFinalBtn', 'Final roster lock', 'Final submission requires a confirmation surface and lock state.');
  behavior('ROS-008', '7', 'playerlist.html', '#auditResults', 'Age, gender, and event-cap validation', 'Roster audit flags age/category mismatch, gender mismatch, and >3 individual events before final lock.');
  behavior('ROS-009', '7', 'playerlist.html', '#manualEntryModal', 'Inline edit, delete, and manual entry', 'Admin can update fields and remove invalid/refunded entries before lock.');
  manual('ROS-010', '7', 'Roster consolidation and immutable handoff', 'Confirmed bookings expand to event rows; final lock makes entries read-only and hands off to heat generation.');

  contract('HEAT-001', '8', 'heatgen.html', '#poolsGrid', 'Multi-pool setup', 'Heat generation configures one or more pool geometries.');
  contract('HEAT-002', '8', 'heatgen.html', '#pool1Categories', 'Category-to-pool routing', 'Pool categories can be assigned for routing.');
  contract('HEAT-003', '8', 'heatgen.html', '#buf50', 'Per-event heat buffers', '50m, 100m, and relay duration controls are present.');
  contract('HEAT-004', '8', 'heatgen.html', '#sessionStart', 'Estimated schedule start', 'Session start time is configurable.');
  contract('HEAT-005', '8', 'heatgen.html', '#generateBtn', 'Generate heat sheets', 'Heat generation action is available.');
  contract('HEAT-006', '8', 'heatgen.html', '#heatPreviewSection', 'Heat preview and seeding', 'Generated heats can be previewed by pool, event, and category.');
  contract('HEAT-007', '8', 'heatgen.html', '#exportCTSBtn', 'CTS/Meet Manager export', 'Heat sheet export action is present.');
  behavior('HEAT-008', '8', 'heatgen.html', '#generateBtn', 'Spearhead seeding and lane geometry', 'Heats route to selected pool geometry and seed center-outward by seed time; NT uses outer lanes.');
  behavior('HEAT-009', '8', 'heatgen.html', '#publishBtn', 'Heat publication and export/import', 'Generation produces an estimated schedule and standardized spreadsheet compatible with timing software.');
  manual('HEAT-010', '8', '6/8-lane geometry and concurrent pool schedules', 'Verify valid lane geometry, event durations, pool separation, and estimated schedules with known roster fixtures.');

  contract('RES-001', '9', 'results.html', '#mode1Radio', 'Manual and bulk result modes', 'Result entry exposes direct timing and timing-file modes.');
  contract('RES-002', '9', 'results.html', '#ctxFileInput', 'Touch-pad file adapter', 'Upload accepts .xlsx/.csv timing files.');
  contract('RES-003', '9', 'results.html', '#resultGrid', 'Direct heat timing grid', 'Grid exposes lane result, time, status, and DQ fields.');
  contract('RES-004', '9', 'results.html', '#saveDraftBtn', 'Save heat result draft', 'Heat results can be saved before publication.');
  contract('RES-005', '9', 'results.html', '#publishResultsBtn', 'Convert and publish results', 'Publish action aggregates heats and publishes official results.');
  contract('RES-006', '9', 'results.html', '#resultSheetTable', 'Official result sheet', 'Official rankings include rank, lane, swimmer, time, status, and points.');
  contract('RES-007', '9', 'results.html', '#printResultBtn', 'Print result book', 'Result book print/export action is present.');
  contract('RES-008', '9', 'results.html', '#viewLeaderboardBtn', 'Academy leaderboard action', 'Leaderboard action opens academy standings.');
  behavior('RES-009', '9', 'results.html', '#resultGrid', 'Required statuses and DQ codes', 'Each lane requires OK/DNS/DNF/DQ; DQ requires a valid fault code.');
  behavior('RES-010', '9', 'results.html', '#publishResultsBtn', 'Cross-heat ranking and points', 'OK times sort fastest-first; DQ/DNS/DNF have no rank; individual and relay points are awarded correctly.');
  manual('RES-011', '9', 'Bulk timing import validation', 'Validate primary-key matching, invalid row reporting, and manual correction for malformed imported timing data.');

  contract('EM-001', '10', 'admin.html', '#emControlBar', 'Event Manager action bar', 'Sticky console controls include event, academy, coach, approval, and meet actions.');
  contract('EM-002', '10', 'admin.html', '#verificationQueues', 'Verification queues', 'Swimmer, coach, academy, and event approval tabs and refresh/search controls exist.');
  contract('EM-003', '10', 'admin.html', '#pipelineTable', 'Assigned tournament pipeline', 'Pipeline includes status and per-meet actions.');
  contract('EM-004', '10', 'addevent.html', '#aeStep1', 'Event Manager event creation', 'Event creation includes details, gateway choice, pool/strokes, eligibility, and file upload.');
  contract('EM-005', '10', 'racecontrol.html', '#bulkRosterFile', 'Offline roster import', 'Option B meet workflow supports roster spreadsheet upload.');
  contract('EM-006', '10', 'racecontrol.html', '#ctsTouchpad', 'Hardware result import/export', 'Race control supports CTS result upload and templates.');
  contract('EM-007', '10', 'racecontrol.html', '#manualResult', 'Manual result spreadsheet', 'Race control provides manual result import workflow.');
  behavior('EM-008', '10', 'admin.html', '#verificationQueues', 'Event Manager approval boundaries', 'Event managers submit events and verification requests but cannot approve/publish or change locked rules.');
  behavior('EM-009', '10', 'racecontrol.html', '#m3Grid', 'Request closure and post-completion lock', 'Event Manager requests closure; post-completion mutations are denied.');

  contract('ORG-001', '10', 'orgdashboard.html', '#orgPipelineTable', 'Organizer-owned meet pipeline', 'Dashboard lists organizer meets with dates, payment mode, state, and actions.');
  contract('ORG-002', '10', 'orgdashboard.html', '#orgStatFees', 'Organizer financial summary', 'Organizer metrics include owned meet/software-fee information.');
  contract('ORG-003', '10', 'orgcreate.html', '#ocGatewayGroup', 'Organizer payment models', 'Organizer event setup presents integrated gateway and offline mode.');
  contract('ORG-004', '10', 'orgcreate.html', '#ocUpfrontBlock', 'Option B upfront software fee', 'No-gateway option exposes the ₹5,000 utility fee step.');
  contract('ORG-005', '10', 'orgcreate.html', '#ocSubmitBtn', 'Organizer submit and approval flow', 'Organizer can submit a meet for Super Admin review.');
  contract('ORG-006', '10', 'orgracecontrol.html', '#orgRosterFile', 'Organizer bulk roster import', 'Owned no-gateway meet supports roster file upload.');
  contract('ORG-007', '10', 'orgracecontrol.html', '#requestClosureBtn', 'Organizer closure request', 'Organizer can request closure, not mark a meet complete directly.');
  behavior('ORG-008', '10', 'orgdashboard.html', '#orgPipelineTable', 'Organizer tenant isolation', 'Organizer can see/edit only owned meets and cannot access platform financials or another tenant roster.');
  behavior('ORG-009', '10', 'orgracecontrol.html', '#orgResultGrid', 'Organizer live-edit and archive permissions', 'Rules/fees are read-only; owned live events are editable; completed events are immutable.');

  contract('SA-001', '10', 'superadmin.html', '.sa-master-header', 'Super Admin branded header and icon', 'Header, logo icon, profile, and logout controls exist.');
  contract('SA-002', '10', 'superadmin.html', '.sa-subnav', 'Super Admin navigation tabs', 'Dashboard, meets, academies/coaches, financials, override, and API docs destinations exist.');
  contract('SA-003', '10', 'superadmin.html', '.sa-metrics-grid', 'Super Admin overview metrics', 'Dashboard shows meet, athlete, academy, and revenue metric cards.');
  contract('SA-004', '10', 'superadmin.html', '#s1aBody', 'Internal meet approval queue', 'Internal event queue provides approve/reject actions.');
  contract('SA-005', '10', 'superadmin.html', '#s1bBody', 'Third-party meet approval queue', 'Organizer meet queue includes payment/upfront-fee state and approve/reject actions.');
  contract('SA-006', '10', 'superadmin.html', '#s2Body', 'Academy and coach verification queue', 'Master verification queue is present.');
  contract('SA-007', '10', 'superadmin.html', '#panel-meets', 'All-meets governance panel', 'Search, status filters, and tournament management are present.');
  contract('SA-008', '10', 'superadmin.html', '#panel-financials', 'Financial governance panel', 'Financial metrics and gateway/payout surfaces are present.');
  contract('SA-009', '10', 'superadmin.html', '#noticeModal', 'Emergency notice publisher', 'Notice form exposes title, message, expiry, active state, and preview.');
  contract('SA-010', '10', 'saoverride.html', '#ovActionsGrid', 'Universal override console', 'Override actions, reason, audit history, fee/cutoff/swim-up fields are present.');
  behavior('SA-011', '10', 'superadmin.html', '#s1aBody', 'Approval and rejection state transitions', 'Approvals publish meets; rejections return with notes; academy/coach approvals update master directory.');
  behavior('SA-012', '10', 'saoverride.html', '#ovReason', 'Override reason and immutable audit log', 'Reopen/fee/result overrides require a reason and create an immutable audit record.');
  behavior('SA-013', '10', 'superadmin.html', '#noticeModal', 'Emergency notice lifecycle', 'Active notices publish globally and expire according to configured time.');
  manual('SA-014', '10', 'Universal permission and reopening controls', 'Verify Super Admin override applies across roles/meet states, with audit logging and no bypass for non-admin roles.');

  manual('DB-001', '11', 'Normalized schema and referential integrity', 'Validate swimmer, tournament, event-entry, pool, heat, academy, coach, organizer, and payment relations, keys, constraints, and deletion behavior.');
  manual('API-001', '12', 'Event create and roster import API', 'Validate Event Manager and organizer routes, role claims, upload content types, status transitions, and validation warning payloads.');
  manual('API-002', '12', 'Heat generation and timing import APIs', 'Validate pool routing, buffers, heat generation, timing import record matching, and per-row error payloads.');
  manual('SEC-001', '13', 'Minor data consent and encryption', 'Verify parent/guardian consent at checkout and AES-256 encryption-at-rest for minor DOB and phone data.');
  manual('SEC-002', '13', 'RBAC and API authorization', 'Verify RS256 role claims and server-side permission denial for unauthorized users; client-side guards alone are insufficient.');
  manual('SEC-003', '13', 'Audit log integrity', 'Verify roster edits, category changes, seed-time changes, result overrides, and administrative actions create immutable audit rows.');
  manual('NFR-001', '13', 'Load and response-time requirement', 'Load test 5,000+ concurrent connections and verify API responses remain below 500 ms under the specified load.');
  manual('NFR-002', '13', 'Availability and offline resilience', 'Verify 99.9% availability target and IndexedDB caching/synchronization for poolside entries after reconnection.');
  manual('DOC-001', '14', 'Developer hand-off and roadmap', 'Trace implementation and release evidence against the recommended stack and four delivery phases.');

  global.SwimFestTestCases = cases;
})(window);

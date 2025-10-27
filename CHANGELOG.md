# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Features
- Add per-page selection dropdown for activities.

### Performance
- Optimize batch record updates with `bulkPut`.
- Batch create new records for improved performance.

### Refactoring
- Consolidate lab and course title annotation logic.
- Consolidate configuration variables into a `CONFIG` object.
- Extract batch record update logic into a new function.
- Use standard `dataset` for button data attributes.
- Rename `before` option to `beforeIcon` and improve formatting.

## [v3.1.0] - 2025-10-22
### Features
- Update platform name and URL to Google Skills.

### Fixes
- Adapt to UI changes for course and lab pages.

### Documentation
- Update `README.md` with v3.1 screenshots.

## [v3.0.0] - 2025-10-04
### Breaking Change
- Migrated from `qwiklabs.com` to `cloudskillsboost.google` to support the new Google Cloud Skills Boost platform.

### Features
- Automatically create records for unregistered activities.
- Improve activity tracking for catalog search results.

### Fixes
- Improve robustness with null checks for DOM elements.
- Improve main function's error logging.

### Refactoring
- Improve script robustness and readability.
- Avoid using `innerHTML` for security.
- Remove unnecessary `try-catch` blocks.
- Improve status icon placement and styling on activity cards.
- Centralize ID extraction using named groups in the router.
- Improve course record retrieval and handling.
- Enforce consistent code style with Prettier and remove unused functions.

### Documentation
- Add comment about brittle shadow DOM selectors.
- Update `README.md` to reflect the platform migration to Google Cloud Skills Boost.
- Add `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.
- Revise issue templates for clarity.
- Update `SECURITY.md` to encourage private vulnerability reporting.

### Dependencies
- Pin Dexie.js dependency to v4.2.0.

### Chores
- Prune initial lab list and rename data variable.
- Bump userscript version to 3.0.0.
- Add `@grant none` to userscript header.

## [2.1.0] - 2021-10-14
### Added
- Add pagination links to the profile page to view all previous activities.
- Add search links and a warning icon to rows for unrecognized activities.
- Add a red background color to rows for failed labs.

### Changed
- Improve alignment of icons and buttons on the profile page.
- Refactor `main()` to use a routing and path handler approach.
- Refactor `trackActivities()` to improve its structure.
- Refactor `createDbUpdateBtn()` to `createUpdateButton()`.
- Refactor `appendUpdateButtonToActivitiesTab()` into smaller functions.
- Extend `appendIcon()` to support adding text before the icon.
- Update `README.md` with new animations and videos.

### Deprecated
- Deprecate the link to view the latest 100 activity records.

### Fixed
- Fix bugs in the batch database update process.
- Fix errors when no activity records are present on the profile page.

### Removed
- Remove non-critical debug messages unless debug mode is enabled.

## [2.0.7] - 2021-10-13
### Changed
- Adjust styling for the new activity card design on the home page.
- Update `README.md` with new screenshots.

### Fixed
- Fix bugs in the database update functionality.

## [2.0.5] - 2021-09-29
### Changed
- Add status icons under the progress bar of activity cards on the home page.
- Add "Update database" and "View last 100 records" buttons to the profile page.

## [1.0.0] - 2021-09-18
### Fixed
- Update URL path for the activity page from `/my_learning` to `/profile/activity`.
- Update CSS selector and regular expression for parsing the total number of activities.

## [0.5.5] - 2021-05-04
### Changed
- This version was likely a minor update; no specific changes were documented.

## [0.5.4] - 2021-04-09
### Changed
- Adapt script for the new Catalog page design.
- Adapt script for the new "My Learning" page format, including parsing the new activity table and updating the database process.
- Add a quick link to view all activity results on the "My Learning" page.

### Added
- Add or update the ID and name of a lab or quest when its page is loaded.
- Add a status label next to the header on quest pages.

### Removed
- Remove scripts for the old `/my_learning/labs` and `/my_learning/courses` pages.

## [0.5.1f] - 2020-06-14
### Added
- Add one-click functionality to update the status of all labs and quests in the database.

## [0.5.0] - 2020-06-05
### Changed
- Migrate data storage from a JSON-based markup to using IndexedDB.
- Refactor code to use `async/await` syntax.

## [0.4.8] - 2020-06-05
### Added
- Add a yellow highlight and an orange badge to labs and quests that are not yet registered in the database.
- Extend annotation to the “Your Favorites”, “Featured Learning”, and “What’s Hots” sections on the home page.
- Extend color schemes to the tables on the "Completed Courses" and "Completed Labs" pages.

## [0.4.5] - 2020-05-19
### Added
- Add green highlights to completed items.
- Add annotations to the "Your Favorites" section on the "My Learning" page.
- Add color backgrounds to table rows on the "Completed Courses" and "Completed Labs" pages for easier cross-checking.

### Changed
- Improve performance by using a JSON-based markup for storing lab and quest data.
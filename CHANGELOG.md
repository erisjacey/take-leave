# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-20

### Added

- Ongoing leave section in leave list
- Sick leave badge display for sick leave entries
- Stepper buttons for half-day number inputs
- Open Graph and theme-color metadata
- GitHub repo link in header

### Fixed

- Date picker chevron visibility and month label sizing
- Sick leave type option now hidden in leave modal when disabled in config

### Changed

- Chart x-axis labels hidden on small screens for better mobile readability
- Removed gaming tag

## [1.0.0] - 2026-02-20

### Added

- Initial release of TakeLeave.sg
- PTO computation engine with timeline, running balances, and year-end forecast
- Leave modal for adding, editing, and deleting entries with leave type selector
- Leave list with empty and populated states
- Stats bar showing current balance, used days, and year-end forecast
- Forecast chart with monthly balance visualization
- Sick leave tracking with separate forecast chart line and toggle
- What-if simulator for exploring hypothetical leave scenarios
- First-run onboarding flow for new users
- Date range picker with d MMM yy format
- Dark mode with system preference detection
- Responsive layout for mobile and desktop
- JSON import/export for data portability
- localStorage persistence (no backend required)

### Fixed

- Negative balances displayed correctly in chart and stats for deficit months

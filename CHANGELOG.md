# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-09-19

### Fixed
- Images tab: recognize named `udm=imgs` so the full-width layout is restored

## [1.2.0] - 2026-08-31

### Added
- Per-tab settings: each Google search tab (All, AI Mode, Images, Videos, Short videos, News, Shopping, Books, Web) can be given its own  minimum screen width and custom CSS, picked from a switcher at the top of the options page

### Removed
- The `activeTab` and `tabs` permissions are no longer requested

## [1.1.0] - 2026-08-28

### Added
- Tab-specific CSS support via URL-based detection (`midline-search-tab-*` classes on `<html>`)
- SPA tab switch handling (`popstate`, `pushState`, `replaceState`) so tab classes update without page reload

### Fixed
- Images tab: restore Google default full-width layout (`grid-column: 1 / -1`)
- Short videos tab: apply centered layout (`grid-column: 4 / span 12`)

### Changed
- Scoped Shopping and Books styles to their respective tab classes
- Removed non-functional `:has(.vVVcqf)` grid override

## [1.0.0] - 2025-11-04

### Added
- Initial release of Midline Search extension
- Center-aligned layout for Google search results on wide screens
- Configurable breakpoint setting (default: 1280px) for when center-aligned styles are applied
- Custom CSS editor in options page for advanced styling customization
- Toggle functionality in popup to enable/disable the extension styles
- Support for both google.com and google.co.jp search pages
- Options page with settings for breakpoint and custom CSS
- Internationalization support (English and Japanese)

### Features
- **Responsive Design**: Styles are applied only when screen width exceeds the configured breakpoint
- **Custom CSS Support**: Users can add their own CSS rules to further customize the search results layout
- **Easy Toggle**: Quick enable/disable toggle in the extension popup
- **Settings Management**: Comprehensive options page for configuring breakpoint and custom styles

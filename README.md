# Midline Search

A Chrome extension that changes the layout of Google search results to be center-aligned on wide screens, providing a more balanced and visually appealing search experience.

## Features

- **Center-Aligned Layout**: Automatically centers Google search results when viewing on wide screens
- **Configurable Breakpoint**: Set the minimum screen width (in pixels) at which the center-aligned styles are applied (default: 1280px)
- **Custom CSS Editor**: Add your own CSS rules to further customize the search results page appearance
- **Easy Toggle**: Quickly enable or disable the extension styles via the popup menu
- **Real-Time Updates**: Changes to settings are applied immediately without requiring a page refresh

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your Chrome toolbar

## Usage

### Basic Usage

Once installed, the extension automatically applies center-aligned styles to Google search results when your screen width exceeds the configured breakpoint (default: 1280px).

### Toggle On/Off

1. Click the extension icon in your Chrome toolbar
2. Use the toggle switch to enable or disable the styles

### Configure Settings

1. Click the extension icon and then click the menu icon (☰) to open the options page
2. Or right-click the extension icon and select "Options"

#### Screen Width Settings

- Set the **Media Query Start Position** (breakpoint) in pixels
- The center-aligned styles will be applied when the screen width is greater than or equal to this value (default: 1280px).

#### Custom CSS

- Enter your custom CSS rules in the editor
- Click "Save" to apply the changes
- The CSS will be applied to the Google search results page
- Use "Discard Changes" to reset to the previous state

## Supported Pages

- All Google search pages across country-specific domains (e.g., `https://www.google.com/search*`, `https://www.google.co.jp/search*`, `https://www.google.fr/search*`, etc.)

## Permissions

This extension requires the following permissions:

- **storage**: To save your settings (breakpoint and custom CSS)
- **activeTab**: To apply styles to the current Google search page
- **tabs**: To send messages to the active tab when toggling styles

## Browser Compatibility

- Chrome (Manifest V3)
- Other Chromium-based browsers that support Manifest V3

## Development

### Project Structure

```
midline-search/
├── src/
│   ├── _locales/          # Internationalization files
│   ├── content/           # Content scripts and styles
│   ├── icons/             # Extension icons
│   ├── options/           # Options page
│   ├── popup/             # Popup interface
│   ├── utils/             # Utility functions
│   └── manifest.json      # Extension manifest
├── CHANGELOG.md
└── README.md
```

## License

This project is open source and available under the MIT License.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

## Support

If you encounter any issues or have questions, please open an issue on the repository.


# Midline Search

A Chrome extension that changes the layout of Google search results to be center-aligned on wide screens, providing a more balanced and visually appealing search experience.

## Features

- **Center-Aligned Layout**: Automatically centers Google search results when viewing on wide screens
- **Configurable Breakpoint**: Set the minimum screen width (in pixels) at which the center-aligned styles are applied (default: 1280px), shared by all search tabs or set per tab
- **Custom CSS Editor**: Add your own CSS rules to further customize the search results page appearance, either for every search tab or for one tab only
- **Easy Toggle**: Quickly enable or disable the extension via the popup menu, on every open search page at once
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

Turning it off removes both the center-aligned layout and your custom CSS, so the page is left as Google renders it. Every open Google search page follows the switch, not just the one in front.

### Configure Settings

1. Click the extension icon and then click the menu icon (☰) to open the options page
2. Or right-click the extension icon and select "Options"

#### Choosing What to Configure

The switcher at the top of the options page is split into two layers: the **All Tabs (Common)** pill, and below it an indented row of pills for the individual Google search tabs (All, AI Mode, Images, Videos, Short videos, News, Shopping, Books, Web). The page opens on the shared settings; pick a search tab to give it its own screen width and CSS on top of the shared ones. A dot on a pill means that tab has edits you have not saved yet.

#### Screen Width Settings

- Set the **Media Query Start Position** (breakpoint) in pixels
- The center-aligned styles will be applied when the screen width is greater than or equal to this value (default: 1280px).
- On a single search tab, uncheck **Use common setting** to give that tab its own breakpoint. While it is checked, the common value is used.

#### Custom CSS

- Enter your custom CSS rules in the editor
- Click "Save" to apply the changes
- CSS entered under **All Tabs (Common)** applies to every Google search tab; CSS entered under a single tab applies only to that tab
- Tab CSS is injected after the common CSS, so it overrides common rules of the same specificity
- Use "Discard Changes" to reset the CSS of the tab you are editing to the previous state

## Supported Pages

This extension supports Google search pages on the following country-specific domains:

- `https://www.google.com/search*` (US/International)
- `https://www.google.co.jp/search*` (Japan)
- `https://www.google.fr/search*` (France)
- `https://www.google.de/search*` (Germany)
- `https://www.google.co.uk/search*` (United Kingdom)
- `https://www.google.com.au/search*` (Australia)
- `https://www.google.ca/search*` (Canada)
- `https://www.google.it/search*` (Italy)
- `https://www.google.es/search*` (Spain)
- `https://www.google.com.br/search*` (Brazil)
- `https://www.google.co.in/search*` (India)
- `https://www.google.com.mx/search*` (Mexico)
- `https://www.google.nl/search*` (Netherlands)
- `https://www.google.pl/search*` (Poland)
- `https://www.google.ru/search*` (Russia)
- `https://www.google.com.tr/search*` (Turkey)
- `https://www.google.com.tw/search*` (Taiwan)
- `https://www.google.co.kr/search*` (South Korea)

## Permissions

This extension requires the following permissions:

- **storage**: To save your settings, and to share them with every open Google search page

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
│   ├── utils/             # Definitions shared by the content script, options page and popup
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


# App Icons Setup

This directory contains the app icons for TaskFlow - Cloud-Based Task Management System.

## Icon Files

- `favicon-16x16.png` - 16x16 favicon for browser tabs
- `favicon-32x32.png` - 32x32 favicon for browser tabs and bookmarks
- `apple-touch-icon.png` - 180x180 icon for iOS home screen
- `android-chrome-192x192.png` - 192x192 icon for Android home screen
- `android-chrome-512x512.png` - 512x512 icon for Android home screen and PWA

## Usage

### Browser Favicons
The favicons are automatically configured in `index.html` and will appear in:
- Browser tabs
- Bookmarks
- Browser history
- Search results

### Mobile App Icons
The app icons are configured for:
- iOS home screen (when added to home screen)
- Android home screen (when added to home screen)
- PWA installation

### Social Media
The 512x512 icon is used for:
- Open Graph (Facebook, LinkedIn)
- Twitter Cards
- Social media previews

## PWA Support

The app is configured as a Progressive Web App (PWA) with:
- `site.webmanifest` - PWA configuration
- Installable on mobile devices
- Standalone app experience
- Offline capabilities (when implemented)

## Customization

To update the app icons:
1. Replace the icon files in this directory
2. Ensure all sizes are provided
3. Update the manifest file if needed
4. Test on different devices and browsers

## File Structure

```
public/
├── appIcons/
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   └── android-chrome-512x512.png
├── site.webmanifest
├── favicon.ico
└── APP_ICONS_README.md
```

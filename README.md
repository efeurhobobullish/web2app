# 🚀 WebView App Generator

Transform any website into a native mobile app in seconds! This powerful tool creates React Native apps with advanced features like caching, notifications, and deep linking.

## ✨ What You Get

- 📱 **Native Mobile App** - Convert your website to iOS/Android app
- 🔄 **Smart Caching** - Lightning-fast loading with intelligent cache management
- 🔔 **Push Notifications** - Keep users engaged with API-driven notifications
- 🔗 **Deep Linking** - Open specific pages directly in your app
- 📴 **Offline Support** - Your app works even without internet
- 🎨 **Custom Branding** - Use your own icons, colors, and splash screens
- 🛡️ **User-Agent Protection** - Prevent unauthorized access to your website

## 🎯 Perfect For

- E-commerce stores wanting a mobile app
- SaaS platforms needing native mobile presence
- Content creators building audience engagement
- Businesses wanting to increase mobile conversions
- Anyone who wants their website as a mobile app

## 🚀 Quick Start

### 1. Basic Setup (30 seconds)
```bash
node setup-app.js "My App" "https://mywebsite.com"
```

### 2. Advanced Setup with Features
```bash
node setup-app.js "My Store" "https://mystore.com" \
  --package-id "com.mycompany.store" \
  --icon "./my-icon.png" \
  --user-agent "MyStore/1.0" \
  --api-endpoint "https://api.mystore.com/notifications" \
  --cache-size 200 \
  --offline-mode
```

### 3. Build Your App
```bash
cd my-app
npm install
npx expo start
```

That's it! Your mobile app is ready! 🎉

## 📋 Command Options

### Required
- `app-name` - Your app's display name
- `website-url` - The website to convert

### Basic Options
- `--package-id` - App identifier (com.company.app)
- `--icon` - App icon (1024x1024 PNG)
- `--favicon` - Small icon (32x32 PNG)
- `--background` - Background color (#000000)

## 🎨 Asset Customization

### 📱 Important: Manual Asset Replacement Required

After generating your app, you **must manually replace** all asset files in the `assets/images/` directory with your website's branding:

#### Required Assets (Must Replace):
- **`icon.png`** (1024x1024) - Main app icon
- **`favicon.png`** (32x32) - Small favicon
- **`android-icon-background.png`** (1024x1024) - Android adaptive background
- **`android-icon-foreground.png`** (1024x1024) - Android adaptive foreground  
- **`android-icon-monochrome.png`** (1024x1024) - Android themed icon
- **`splash-icon.png`** (200-400px) - Splash screen logo
- **`react-logo.png`** (64x64) - In-app branding
- **`react-logo@2x.png`** (128x128) - High-DPI version
- **`react-logo@3x.png`** (192x192) - Extra high-DPI version

#### Asset Replacement Steps:
1. Generate your app with the setup script
2. Navigate to `your-app-name/assets/images/`
3. Replace each PNG file with your branded version
4. **Keep exact same filenames** (case-sensitive)
5. Use specified dimensions for best results

#### 🚀 Future Automation
Asset generation will be automated in future versions. Currently, manual replacement ensures perfect branding control.

> 💡 **Tip**: See `examples.md` for detailed asset specifications and preparation workflow.

### Advanced Features
- `--user-agent` - Custom browser identification
- `--api-endpoint` - Notification webhook URL
- `--api-key` - API authentication key
- `--cache-size` - Cache limit in MB (default: 100)
- `--offline-mode` - Enable offline functionality
- `--preload-urls` - Pre-cache specific pages

## 🌟 Key Features Explained

### Smart Caching System
Your app automatically caches pages for instant loading. Users can browse previously visited pages even offline!

### Push Notifications
Set up an API endpoint to send targeted notifications to your app users. Perfect for promotions, updates, or engagement.

### Deep Linking
When users click links to your domain on their phone, they'll open directly in your app instead of the browser.

### User-Agent Protection
Your app identifies itself with a custom user-agent, allowing you to provide app-specific features or restrict browser access.

## 📱 What Happens Next?

1. **Development** - Test your app with Expo Go
2. **Customization** - Modify colors, icons, and features
3. **Building** - Create production APK/IPA files
4. **Publishing** - Submit to Google Play / App Store

## 🌐 Web Interface Coming Soon!

We're building a beautiful web interface where you can:
- ✨ Generate apps without command line
- 🎨 Visual customization tools
- 📊 Analytics and app management
- 🚀 One-click deployment to app stores

**Stay tuned for the launch!**

## 🛠️ Technical Details

Built with:
- React Native & Expo for cross-platform development
- Advanced WebView with file upload support
- Intelligent caching with compression
- Background notification processing
- Deep linking with domain validation

## 📞 Need Help?

- 📖 Check `examples.md` for detailed examples
- 🐛 Report issues on GitHub
- 💬 Join our community for support

## 🎯 Examples

### E-commerce Store
```bash
node setup-app.js "Fashion Store" "https://fashionstore.com" \
  --package-id "com.fashion.store" \
  --user-agent "FashionApp/1.0" \
  --cache-size 150 \
  --offline-mode
```

### SaaS Platform
```bash
node setup-app.js "Project Manager" "https://mypm.com" \
  --api-endpoint "https://api.mypm.com/notifications" \
  --api-key "your-api-key" \
  --user-agent "ProjectManager/2.0"
```

### Content Site
```bash
node setup-app.js "News Hub" "https://newshub.com" \
  --preload-urls "https://newshub.com/trending,https://newshub.com/latest" \
  --cache-size 200
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Attribution Requirements

When redistributing or using this code:
- Include the original copyright notice
- Include the MIT license text
- Give credit to the Web2App Team and link back to this repository

### Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

---

**Transform your website into a powerful mobile app today!** 🚀

*Made with ❤️ for developers who want to go mobile fast*

## 🙏 Attribution

If you use Web2App in your project, please consider:
- ⭐ Starring this repository
- 🔗 Linking back to [Web2App](https://github.com/web2app-dev/web2app)
- 📢 Mentioning us in your project documentation

**Built by the Web2App Team** | [GitHub](https://github.com/web2app-dev) | [Issues](https://github.com/web2app-dev/web2app/issues)
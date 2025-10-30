# 📚 WebView App Generator Examples

Here are some real-world examples of how to use the WebView App Generator for different types of applications.

## 🛍️ E-commerce Store

```bash
# Shopify store
npm run setup "My Fashion Store" "https://myfashion.myshopify.com" \
  --package-id "com.myfashion.store" \
  --icon "./assets/fashion-icon.png" \
  --background "#E91E63"

# WooCommerce store
npm run setup "Tech Gadgets" "https://techgadgets.com/mobile" \
  --package-id "com.techgadgets.app" \
  --icon "./assets/tech-icon.png" \
  --background "#2196F3"
```

## 🍕 Restaurant & Food

```bash
# Pizza restaurant
npm run setup "Mario's Pizza" "https://mariospizza.com" \
  --package-id "com.mariospizza.app" \
  --icon "./assets/pizza-icon.png" \
  --background "#FF5722"

# Food delivery
npm run setup "Quick Eats" "https://quickeats.com/mobile" \
  --package-id "com.quickeats.delivery" \
  --icon "./assets/food-icon.png" \
  --background "#FF9800"
```

## 📰 News & Media

```bash
# News website
npm run setup "Daily Herald" "https://dailyherald.com" \
  --package-id "com.dailyherald.news" \
  --icon "./assets/news-icon.png" \
  --background "#1976D2"

# Blog
npm run setup "Tech Blog" "https://mytechblog.com" \
  --package-id "com.mytechblog.app" \
  --icon "./assets/blog-icon.png" \
  --background "#673AB7"
```

## 🏢 Business & Services

```bash
# Real estate
npm run setup "Prime Properties" "https://primeproperties.com" \
  --package-id "com.primeproperties.app" \
  --icon "./assets/house-icon.png" \
  --background "#4CAF50"

# Consulting firm
npm run setup "Business Solutions" "https://bizsolve.com" \
  --package-id "com.bizsolve.consulting" \
  --icon "./assets/business-icon.png" \
  --background "#607D8B"
```

## 🎓 Education & Learning

```bash
# Online course platform
npm run setup "Learn Pro" "https://learnpro.com" \
  --package-id "com.learnpro.education" \
  --icon "./assets/education-icon.png" \
  --background "#9C27B0"

# University
npm run setup "State University" "https://stateuni.edu/mobile" \
  --package-id "edu.stateuni.mobile" \
  --icon "./assets/university-icon.png" \
  --background "#3F51B5"
```

## 💼 Portfolio & Personal

```bash
# Designer portfolio
npm run setup "Jane Doe Design" "https://janedoe.design" \
  --package-id "com.janedoe.portfolio" \
  --icon "./assets/design-icon.png" \
  --background "#E91E63"

# Photography
npm run setup "Photo Studio" "https://photostudio.com" \
  --package-id "com.photostudio.gallery" \
  --icon "./assets/camera-icon.png" \
  --background "#795548"
```

## 🏥 Healthcare & Wellness

```bash
# Medical practice
npm run setup "Health Clinic" "https://healthclinic.com" \
  --package-id "com.healthclinic.app" \
  --icon "./assets/medical-icon.png" \
  --background "#009688"

# Fitness center
npm run setup "Fit Life Gym" "https://fitlifegym.com" \
  --package-id "com.fitlifegym.app" \
  --icon "./assets/fitness-icon.png" \
  --background "#FF5722"
```

## 🎵 Entertainment & Events

```bash
# Music venue
npm run setup "Rock Arena" "https://rockarena.com" \
  --package-id "com.rockarena.events" \
  --icon "./assets/music-icon.png" \
  --background "#9C27B0"

# Event planning
npm run setup "Perfect Events" "https://perfectevents.com" \
  --package-id "com.perfectevents.planning" \
  --icon "./assets/event-icon.png" \
  --background "#FF9800"
```

## 🚗 Automotive & Transportation

```bash
# Car dealership
npm run setup "Auto World" "https://autoworld.com" \
  --package-id "com.autoworld.cars" \
  --icon "./assets/car-icon.png" \
  --background "#607D8B"

# Ride sharing
npm run setup "City Rides" "https://cityrides.com/mobile" \
  --package-id "com.cityrides.transport" \
  --icon "./assets/taxi-icon.png" \
  --background "#FFC107"
```

## 💰 Finance & Banking

```bash
# Credit union
npm run setup "Community Bank" "https://communitybank.com/mobile" \
  --package-id "com.communitybank.mobile" \
  --icon "./assets/bank-icon.png" \
  --background "#1976D2"

# Investment firm
npm run setup "Smart Invest" "https://smartinvest.com" \
  --package-id "com.smartinvest.app" \
  --icon "./assets/invest-icon.png" \
  --background "#4CAF50"
```

## 🏠 Real Estate & Property

```bash
# Property management
npm run setup "Property Pro" "https://propertypro.com" \
  --package-id "com.propertypro.management" \
  --icon "./assets/property-icon.png" \
  --background "#795548"

# Vacation rentals
npm run setup "Beach Rentals" "https://beachrentals.com" \
  --package-id "com.beachrentals.vacation" \
  --icon "./assets/beach-icon.png" \
  --background "#00BCD4"
```

## 🎨 Creative & Design

```bash
# Art gallery
npm run setup "Modern Art Gallery" "https://modernart.gallery" \
  --package-id "com.modernart.gallery" \
  --icon "./assets/art-icon.png" \
  --background "#9C27B0"

# Design agency
npm run setup "Creative Studio" "https://creativestudio.com" \
  --package-id "com.creativestudio.design" \
  --icon "./assets/creative-icon.png" \
  --background "#E91E63"
```

## 🚀 Advanced Feature Examples

### 🔐 E-commerce with User-Agent Protection

```bash
# Secure online store that blocks regular browsers
npm run setup "Secure Store" "https://store.example.com" \
  --package-id "com.example.securestore" \
  --user-agent "SecureStore/1.0 (Android)" \
  --cache-size 200 \
  --preload-urls "https://store.example.com/,https://store.example.com/products,https://store.example.com/cart" \
  --offline-mode
```

### 📡 News App with API Notifications

```bash
# News app with breaking news notifications
npm run setup "Breaking News" "https://news.example.com" \
  --package-id "com.news.breaking" \
  --user-agent "BreakingNews/1.0" \
  --api-endpoint "https://api.news.example.com/notifications" \
  --api-key "news_api_key_123" \
  --user-id "subscriber_456" \
  --poll-interval 60000 \
  --cache-size 150 \
  --cache-age 12
```

### 🏪 Restaurant with Full Advanced Features

```bash
# Restaurant app with orders, notifications, and offline menu
npm run setup "Tasty Bites" "https://restaurant.example.com" \
  --package-id "com.restaurant.tastybites" \
  --user-agent "TastyBites/1.0 (Mobile)" \
  --api-endpoint "https://api.restaurant.example.com/notifications" \
  --api-key "restaurant_api_xyz789" \
  --user-id "customer_123" \
  --poll-interval 180000 \
  --cache-size 100 \
  --cache-age 24 \
  --preload-urls "https://restaurant.example.com/menu,https://restaurant.example.com/specials" \
  --offline-mode \
  --background "#d4a574"
```

### 🎓 Educational Platform with Smart Caching

```bash
# Learning platform with offline course access
npm run setup "EduPlatform" "https://learn.example.com" \
  --package-id "com.edu.platform" \
  --user-agent "EduPlatform/1.0" \
  --cache-size 500 \
  --cache-age 72 \
  --preload-urls "https://learn.example.com/courses,https://learn.example.com/dashboard" \
  --offline-mode \
  --background "#4a90e2"
```

### 💼 Business App with Targeted Notifications

```bash
# Business dashboard with employee-specific notifications
npm run setup "Business Hub" "https://business.example.com" \
  --package-id "com.business.hub" \
  --user-agent "BusinessHub/1.0 (Enterprise)" \
  --api-endpoint "https://api.business.example.com/notifications" \
  --api-key "business_key_abc123" \
  --user-id "employee_789" \
  --poll-interval 300000 \
  --cache-size 75 \
  --background "#2c3e50"
```

### 🎮 Gaming Community with Real-time Updates

```bash
# Gaming community with tournament notifications
npm run setup "Game Central" "https://gaming.example.com" \
  --package-id "com.gaming.central" \
  --user-agent "GameCentral/1.0" \
  --api-endpoint "https://api.gaming.example.com/tournaments" \
  --api-key "gaming_api_def456" \
  --user-id "gamer_321" \
  --poll-interval 30000 \
  --cache-size 300 \
  --preload-urls "https://gaming.example.com/tournaments,https://gaming.example.com/leaderboard" \
  --background "#7b2cbf"
```

## 📱 Social & Community

```bash
# Community forum
npm run setup "Local Community" "https://localcommunity.com" \
  --package-id "com.localcommunity.forum" \
  --icon "./assets/community-icon.png" \
  --background "#673AB7"

# Social network
npm run setup "Connect Hub" "https://connecthub.com" \
  --package-id "com.connecthub.social" \
  --icon "./assets/social-icon.png" \
  --background "#3F51B5"
```

## 🎨 Asset Requirements & Customization

### 📱 Required Asset Files

The modernized template requires specific asset files in the `assets/images/` directory. **All files must be manually replaced with your website's branding before building your app.**

#### Core App Icons
- **`icon.png`** - Main app icon (1024x1024 pixels, PNG format)
  - Used for app launcher icon and general app representation
  - Should be your primary brand logo/icon
  
- **`favicon.png`** - Small favicon (32x32 pixels, PNG format)
  - Used for browser tabs and small icon representations
  - Should be a simplified version of your main icon

#### Android Adaptive Icons (Required for Android 8.0+)
- **`android-icon-background.png`** - Background layer (1024x1024 pixels)
  - Solid color or simple pattern background
  - Will be cropped to various shapes (circle, square, rounded square)
  
- **`android-icon-foreground.png`** - Foreground layer (1024x1024 pixels)
  - Your main icon/logo with transparent background
  - Should fit within the safe zone (center 432x432 pixels)
  
- **`android-icon-monochrome.png`** - Monochrome version (1024x1024 pixels)
  - Single color version of your icon for themed icons
  - Used in Android 13+ for themed app icons

#### Splash Screen Assets
- **`splash-icon.png`** - Splash screen logo (varies, typically 200x200 to 400x400 pixels)
  - Displayed during app startup
  - Should be your brand logo on transparent background

#### App Content Assets (Optional - Replace with your branding)
- **`react-logo.png`** - Replace with your brand logo (64x64 pixels)
- **`react-logo@2x.png`** - 2x density version (128x128 pixels)
- **`react-logo@3x.png`** - 3x density version (192x192 pixels)
- **`partial-react-logo.png`** - Replace with secondary brand element

### 🎯 Asset Specifications

| Asset File | Dimensions | Format | Purpose | Notes |
|------------|------------|--------|---------|-------|
| `icon.png` | 1024x1024 | PNG | Main app icon | Primary brand representation |
| `favicon.png` | 32x32 | PNG | Small icon | Browser favicon equivalent |
| `android-icon-background.png` | 1024x1024 | PNG | Android adaptive background | Solid color/simple pattern |
| `android-icon-foreground.png` | 1024x1024 | PNG | Android adaptive foreground | Logo with transparent bg |
| `android-icon-monochrome.png` | 1024x1024 | PNG | Android themed icon | Single color version |
| `splash-icon.png` | 200-400px | PNG | Splash screen logo | Startup screen branding |
| `react-logo.png` | 64x64 | PNG | In-app branding | Replace with your logo |
| `react-logo@2x.png` | 128x128 | PNG | High-DPI version | 2x density screens |
| `react-logo@3x.png` | 192x192 | PNG | Extra high-DPI | 3x density screens |

### ⚠️ Important Notes

1. **Manual Replacement Required**: All asset files must be manually replaced with your website's branding
2. **Exact Naming**: File names must match exactly (case-sensitive)
3. **Dimensions Matter**: Use the exact pixel dimensions specified
4. **PNG Format**: All assets must be in PNG format for transparency support
5. **Future Automation**: Asset generation will be automated in future versions

### 🚀 Asset Preparation Workflow

1. **Prepare Your Brand Assets**
   - Main logo/icon (square format works best)
   - Brand colors (hex codes)
   - High-resolution source files

2. **Create Required Sizes**
   - Use design tools (Figma, Photoshop, Canva) to resize
   - Maintain aspect ratio and quality
   - Export as PNG with transparency where needed

3. **Replace Template Assets**
   ```bash
   # Navigate to your generated app
   cd your-app-name/assets/images/
   
   # Replace each file with your branded version
   # Keep the exact same filenames
   ```

4. **Test Your Assets**
   ```bash
   # Build and test your app
   npm run android  # or npm run ios
   ```

## 🔧 Tips for Success

### Asset Preparation
- **Icons**: Use 1024x1024 PNG files for best quality
- **Colors**: Choose colors that match your brand
- **Package IDs**: Use reverse domain notation (com.company.app)

### URL Optimization
- Use mobile-optimized URLs when available
- Test the website on mobile browsers first
- Ensure the website works well in WebView

### Branding Consistency
- Match app colors with website colors
- Use consistent iconography
- Keep app name short and memorable

### Testing
```bash
# Always test your generated app
cd your-app-name
npm install
npm start
```

---

**Need help?** Check the main README.md for detailed documentation!
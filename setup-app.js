#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showUsage() {
  log('\n🚀 WebView App Generator', 'cyan');
  log('================================', 'cyan');
  log('\nUsage:', 'bright');
  log('  node setup-app.js <app-name> <website-url> [options]', 'yellow');
  log('\nRequired Arguments:', 'bright');
  log('  app-name     Name of your app (e.g., "MyApp")', 'green');
  log('  website-url  URL to load in WebView (e.g., "https://example.com")', 'green');
  log('\nOptional Arguments:', 'bright');
  log('  --package-id <id>        Package identifier (default: com.yourcompany.appname)', 'blue');
  log('  --icon <path>           Path to app icon (1024x1024 PNG)', 'blue');
  log('  --favicon <path>        Path to favicon (32x32 PNG)', 'blue');
  log('  --adaptive-icon <path>  Path to adaptive icon (1024x1024 PNG)', 'blue');
  log('  --splash <path>         Path to splash screen image', 'blue');
  log('  --background <color>    Background color (default: #000000)', 'blue');
  log('\nAdvanced Options:', 'bright');
  log('  --user-agent <string>   Custom User-Agent for WebView requests', 'magenta');
  log('  --api-endpoint <url>    API endpoint for notifications (webhook)', 'magenta');
  log('  --api-key <key>         API key for notification service', 'magenta');
  log('  --user-id <id>          User ID for targeted notifications', 'magenta');
  log('  --poll-interval <ms>    Notification polling interval (default: 300000)', 'magenta');
  log('  --cache-size <mb>       Max cache size in MB (default: 100)', 'magenta');
  log('  --cache-age <hours>     Max cache age in hours (default: 24)', 'magenta');
  log('  --preload-urls <urls>   Comma-separated URLs to preload', 'magenta');
  log('  --offline-mode          Enable offline mode (default: false)', 'magenta');
  log('\nExample:', 'bright');
  log('  node setup-app.js "My Store" "https://mystore.com" --package-id "com.mycompany.store" --icon "./my-icon.png"', 'yellow');
  log('  node setup-app.js "My App" "https://myapp.com" --user-agent "MyApp/1.0" --api-endpoint "https://api.myapp.com/notifications"', 'yellow');
  log('');
}

function parseArguments() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  if (args.length < 2) {
    log('❌ Error: Missing required arguments', 'red');
    showUsage();
    process.exit(1);
  }

  const config = {
    appName: args[0],
    websiteUrl: args[1],
    packageId: null,
    iconPath: null,
    faviconPath: null,
    adaptiveIconPath: null,
    splashPath: null,
    backgroundColor: '#000000',
    userAgent: null,
    apiEndpoint: null,
    apiKey: null,
    userId: null,
    pollInterval: 300000,
    cacheSize: 100,
    cacheAge: 24,
    preloadUrls: [],
    offlineMode: false
  };

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--package-id':
        config.packageId = nextArg;
        i++;
        break;
      case '--icon':
        config.iconPath = nextArg;
        i++;
        break;
      case '--favicon':
        config.faviconPath = nextArg;
        i++;
        break;
      case '--adaptive-icon':
        config.adaptiveIconPath = nextArg;
        i++;
        break;
      case '--splash':
        config.splashPath = nextArg;
        i++;
        break;
      case '--background':
        config.backgroundColor = nextArg;
        i++;
        break;
      case '--user-agent':
        config.userAgent = nextArg;
        i++;
        break;
      case '--api-endpoint':
        config.apiEndpoint = nextArg;
        i++;
        break;
      case '--api-key':
        config.apiKey = nextArg;
        i++;
        break;
      case '--user-id':
        config.userId = nextArg;
        i++;
        break;
      case '--poll-interval':
        config.pollInterval = parseInt(nextArg) || 300000;
        i++;
        break;
      case '--cache-size':
        config.cacheSize = parseInt(nextArg) || 100;
        i++;
        break;
      case '--cache-age':
        config.cacheAge = parseInt(nextArg) || 24;
        i++;
        break;
      case '--preload-urls':
        config.preloadUrls = nextArg ? nextArg.split(',').map(url => url.trim()) : [];
        i++;
        break;
      case '--offline-mode':
        config.offlineMode = true;
        break;
      default:
        log(`⚠️  Warning: Unknown argument ${arg}`, 'yellow');
    }
  }

  if (!config.packageId) {
    const safeName = config.appName.toLowerCase().replace(/[^a-z0-9]/g, '');
    config.packageId = `com.yourcompany.${safeName}`;
  }

  return config;
}

function validateConfig(config) {
  if (!config.appName || config.appName.trim() === '') {
    log('❌ Error: App name cannot be empty', 'red');
    return false;
  }

  try {
    new URL(config.websiteUrl);
  } catch (error) {
    log('❌ Error: Invalid website URL', 'red');
    return false;
  }

  if (config.iconPath && !fs.existsSync(config.iconPath)) {
    log('❌ Error: Icon file not found', 'red');
    return false;
  }

  if (config.faviconPath && !fs.existsSync(config.faviconPath)) {
    log('❌ Error: Favicon file not found', 'red');
    return false;
  }

  return true;
}

function copyDirectory(src, dest, excludes = []) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);

  for (const item of items) {
    if (excludes.includes(item)) continue;
    
    if (item.endsWith('-app') && fs.statSync(path.join(src, item)).isDirectory()) {
      continue;
    }

    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    // Prevent copying into subdirectories of the destination to avoid infinite recursion
    const resolvedSrc = path.resolve(srcPath);
    const resolvedDest = path.resolve(dest);
    if (resolvedSrc.startsWith(resolvedDest + path.sep) || resolvedSrc === resolvedDest) {
      continue;
    }

    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath, excludes);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const [placeholder, value] of Object.entries(replacements)) {
    let replacementValue;
    if (typeof value === 'string') {
      replacementValue = value;
    } else if (typeof value === 'boolean') {
      replacementValue = value.toString();
    } else if (typeof value === 'number') {
      replacementValue = value.toString();
    } else {
      replacementValue = String(value);
    }
    
    content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacementValue);
  }
  
  fs.writeFileSync(filePath, content);
}

function copyAsset(sourcePath, destPath) {
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    return true;
  }
  return false;
}

async function setupApp(config) {
  try {
    log(`\n🚀 Setting up ${config.appName}...`, 'cyan');
    
    const appDir = path.join(process.cwd(), config.appName.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    
    if (fs.existsSync(appDir)) {
      log(`❌ Directory ${appDir} already exists`, 'red');
      return false;
    }

    log('📁 Creating project directory...', 'blue');
    fs.mkdirSync(appDir, { recursive: true });

    log('📋 Copying template files...', 'blue');
    const templateDir = path.join(__dirname);
    copyDirectory(templateDir, appDir, ['node_modules', '.git', '.expo', 'setup-app.js', 'README.md', 'examples.md', 'test-app', 'test-store-app', 'sample-app', 'modern-test-app']);

    log('⚙️  Configuring app settings...', 'blue');
    
    const mainDomain = new URL(config.websiteUrl).hostname;
    const appScheme = config.appName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const replacements = {
      '{{APP_NAME}}': config.appName,
      '{{APP_SLUG}}': appScheme,
      '{{WEBSITE_URL}}': config.websiteUrl,
      '{{PACKAGE_ID}}': config.packageId,
      '{{BUNDLE_ID}}': config.packageId,
      '{{PACKAGE_NAME}}': config.packageId,
      '{{BACKGROUND_COLOR}}': config.backgroundColor,
      '{{USER_AGENT}}': config.userAgent || '',
      '{{MAIN_DOMAIN}}': mainDomain,
      '{{APP_SCHEME}}': appScheme,
      '{{NOTIFICATION_API_ENDPOINT}}': config.apiEndpoint || '',
      '{{NOTIFICATION_API_KEY}}': config.apiKey || '',
      '{{USER_ID}}': config.userId || '',
      '{{POLL_INTERVAL}}': config.pollInterval,
      '{{CACHE_SIZE}}': config.cacheSize * 1024 * 1024,
      '{{CACHE_AGE}}': config.cacheAge * 60 * 60 * 1000,
      '{{PRELOAD_URLS}}': JSON.stringify(config.preloadUrls),
      '{{OFFLINE_MODE}}': config.offlineMode
    };

    const filesToReplace = [
      path.join(appDir, 'App.js'),
      path.join(appDir, 'app.json'),
      path.join(appDir, 'package.json')
    ];

    for (const file of filesToReplace) {
      if (fs.existsSync(file)) {
        replaceInFile(file, replacements);
      }
    }

    // Create assets/images directory
    const assetsImagesDir = path.join(appDir, 'assets', 'images');
    fs.mkdirSync(assetsImagesDir, { recursive: true });

    if (config.iconPath) {
      log('🖼️  Copying app icon...', 'blue');
      const iconDest = path.join(assetsImagesDir, 'icon.png');
      if (copyAsset(config.iconPath, iconDest)) {
        log('✅ App icon copied successfully', 'green');
        
        // Also copy as Android adaptive icon components
        const foregroundDest = path.join(assetsImagesDir, 'android-icon-foreground.png');
        const backgroundDest = path.join(assetsImagesDir, 'android-icon-background.png');
        const monochromeDest = path.join(assetsImagesDir, 'android-icon-monochrome.png');
        
        copyAsset(config.iconPath, foregroundDest);
        copyAsset(config.iconPath, backgroundDest);
        copyAsset(config.iconPath, monochromeDest);
        log('✅ Android adaptive icon components created', 'green');
      }
    }

    if (config.faviconPath) {
      log('🌐 Copying favicon...', 'blue');
      const faviconDest = path.join(assetsImagesDir, 'favicon.png');
      if (copyAsset(config.faviconPath, faviconDest)) {
        log('✅ Favicon copied successfully', 'green');
      }
    }

    if (config.adaptiveIconPath) {
      log('📱 Copying adaptive icon...', 'blue');
      const foregroundDest = path.join(assetsImagesDir, 'android-icon-foreground.png');
      if (copyAsset(config.adaptiveIconPath, foregroundDest)) {
        log('✅ Adaptive icon foreground copied successfully', 'green');
      }
    }

    if (config.splashPath) {
      log('🎨 Copying splash screen...', 'blue');
      const splashDest = path.join(assetsImagesDir, 'splash-icon.png');
      if (copyAsset(config.splashPath, splashDest)) {
        log('✅ Splash screen copied successfully', 'green');
      }
    }

    log('📝 Creating README...', 'blue');
    const readmeContent = `# ${config.appName}

A React Native WebView app for ${config.websiteUrl}

## Features

- 📱 Native mobile app experience
- 🌐 Full website functionality
- 🔄 Automatic updates
- 📴 Offline support
- 🔔 Push notifications
- 🎨 Custom branding

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npx expo start
   \`\`\`

3. Use Expo Go app to scan the QR code and test on your device

## Building for Production

### Android
\`\`\`bash
npx expo build:android
\`\`\`

### iOS
\`\`\`bash
npx expo build:ios
\`\`\`

## Configuration

The app is configured to load: ${config.websiteUrl}

### Advanced Features

${config.userAgent ? `- **Custom User-Agent**: ${config.userAgent}` : ''}
${config.apiEndpoint ? `- **API Notifications**: ${config.apiEndpoint}` : ''}
${config.apiKey ? `- **API Authentication**: Configured` : ''}
${config.userId ? `- **User ID**: ${config.userId}` : ''}
${config.cacheSize ? `- **Cache Size**: ${config.cacheSize}MB` : ''}
${config.offlineMode ? `- **Offline Mode**: Enabled` : ''}

## Support

For support and updates, visit: ${config.websiteUrl}
`;

    fs.writeFileSync(path.join(appDir, 'README.md'), readmeContent);

    log('\n✅ App setup completed successfully!', 'green');
    log(`📁 Project created in: ${appDir}`, 'cyan');
    log('\n📋 Next steps:', 'bright');
    log(`1. cd ${path.basename(appDir)}`, 'yellow');
    log('2. npm install', 'yellow');
    log('3. npx expo start', 'yellow');
    log('\n🎉 Happy coding!', 'green');

    return true;
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  try {
    const config = parseArguments();
    
    if (!validateConfig(config)) {
      process.exit(1);
    }

    await setupApp(config);
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupApp, parseArguments, validateConfig };
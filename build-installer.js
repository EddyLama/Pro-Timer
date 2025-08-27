const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('🚀 Building Stage Timer Pro Windows Installer...\n');

try {
  // Step 1: Build the application
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 2: Build Electron distributables
  console.log('🔧 Creating Electron distributables...');
  execSync('npm run electron:dist:win', { stdio: 'inherit' });
  
  // Step 3: Create deployment package
  console.log('📁 Creating deployment package...');
  
  const releaseDir = path.join(__dirname, 'release');
  const deployDir = path.join(__dirname, 'deploy');
  
  // Create deploy directory
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir);
  }
  
  // Create README for deployment
  const readmeContent = `# Stage Timer Pro - Windows Installation Package

## What's Included

This package contains everything needed to install Stage Timer Pro on Windows:

### Installation Options

1. **StageTimerPro Setup.exe** - Full installer with uninstaller
   - Installs to Program Files
   - Creates desktop and start menu shortcuts
   - Includes uninstaller in Control Panel
   - Recommended for most users

2. **StageTimerPro-Portable.exe** - Portable version
   - No installation required
   - Run directly from any folder
   - Perfect for USB drives or temporary use

## Installation Instructions

### Option 1: Full Installation
1. Run "StageTimerPro Setup.exe"
2. Follow the installation wizard
3. Launch from desktop shortcut or Start menu

### Option 2: Portable Use
1. Copy "StageTimerPro-Portable.exe" to desired location
2. Double-click to run
3. No installation required

## System Requirements

- Windows 10 or later (64-bit)
- 4GB RAM minimum
- 100MB free disk space
- Network connection for multi-screen functionality

## Features

- Professional countdown and stopwatch timers
- Master-client architecture for multiple displays
- Real-time synchronization across screens
- Message broadcasting to displays
- Customizable timer settings and presets
- Full-screen display mode
- Network status monitoring

## Support

For support and updates, visit: https://ohrigina.com
Email: support@ohrigina.com

---
Stage Timer Pro v1.0.0
© 2025 Ohrigina LLC. All rights reserved.
`;

  fs.writeFileSync(path.join(deployDir, 'README.txt'), readmeContent);
  
  // Copy installers to deploy directory
  const files = fs.readdirSync(releaseDir);
  files.forEach(file => {
    if (file.endsWith('.exe')) {
      const srcPath = path.join(releaseDir, file);
      const destPath = path.join(deployDir, file);
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied ${file}`);
    }
  });
  
  // Create ZIP package
  console.log('🗜️  Creating ZIP package...');
  
  const output = fs.createWriteStream(path.join(__dirname, 'StageTimerPro-Windows-Installer.zip'));
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  output.on('close', () => {
    console.log(`\n🎉 SUCCESS! Created StageTimerPro-Windows-Installer.zip (${archive.pointer()} bytes)`);
    console.log('\n📋 Package Contents:');
    console.log('   • StageTimerPro Setup.exe (Full Installer)');
    console.log('   • StageTimerPro-Portable.exe (Portable Version)');
    console.log('   • README.txt (Installation Instructions)');
    console.log('\n🚀 Ready for deployment!');
  });
  
  archive.on('error', (err) => {
    throw err;
  });
  
  archive.pipe(output);
  archive.directory(deployDir, false);
  archive.finalize();
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
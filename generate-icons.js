const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_COLOR = '#38bdf8'; // Sky blue theme color
const ICONS_DIR = path.join(__dirname, 'public', 'icons');
const SCREENSHOTS_DIR = path.join(__dirname, 'public', 'screenshots');

// Ensure directories exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Function to create a simple icon with text
async function createIcon(size, text, outputPath, maskable = false) {
  const padding = maskable ? Math.floor(size * 0.15) : Math.floor(size * 0.1);
  const fontSize = Math.floor(size * 0.5);
  const effectiveSize = size - (padding * 2);
  
  try {
    // Create a square SVG with the specified color and text
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${ICON_COLOR}" rx="${maskable ? 0 : Math.floor(size * 0.2)}"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial, sans-serif" 
          font-size="${fontSize}px" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >
          ${text}
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
      
    console.log(`Created icon: ${outputPath}`);
  } catch (error) {
    console.error(`Error creating icon ${outputPath}:`, error);
  }
}

// Function to create a placeholder screenshot
async function createScreenshot(width, height, type, outputPath) {
  try {
    // Create a rectangle with some content for the screenshot
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#1e293b"/>
        <rect x="50" y="50" width="${width - 100}" height="${height - 100}" fill="#0f172a" rx="10"/>
        <text 
          x="50%" 
          y="120" 
          font-family="Arial, sans-serif" 
          font-size="32px" 
          font-weight="bold" 
          fill="${ICON_COLOR}" 
          text-anchor="middle"
        >
          Not a Label
        </text>
        <text 
          x="50%" 
          y="170" 
          font-family="Arial, sans-serif" 
          font-size="20px" 
          font-weight="normal" 
          fill="white"
          text-anchor="middle"
        >
          ${type} Screenshot
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
      
    console.log(`Created screenshot: ${outputPath}`);
  } catch (error) {
    console.error(`Error creating screenshot ${outputPath}:`, error);
  }
}

async function generateAll() {
  // Create the main icons
  await createIcon(192, "N", path.join(ICONS_DIR, 'icon-192x192.png'));
  await createIcon(384, "N", path.join(ICONS_DIR, 'icon-384x384.png'));
  await createIcon(512, "N", path.join(ICONS_DIR, 'icon-512x512.png'));
  
  // Create maskable icon for Android adaptive icons
  await createIcon(192, "N", path.join(ICONS_DIR, 'maskable-icon-192x192.png'), true);
  
  // Create Apple icons
  await createIcon(180, "N", path.join(ICONS_DIR, 'apple-icon-180x180.png'));
  
  // Create shortcut icons
  await createIcon(192, "D", path.join(ICONS_DIR, 'dashboard.png'));
  await createIcon(192, "A", path.join(ICONS_DIR, 'ai-assistant.png'));
  
  // Create screenshots
  await createScreenshot(540, 1200, "Mobile", path.join(SCREENSHOTS_DIR, 'dashboard-mobile.png'));
  await createScreenshot(1280, 800, "Desktop", path.join(SCREENSHOTS_DIR, 'dashboard-desktop.png'));
  
  console.log('All PWA assets have been generated!');
}

generateAll().catch(console.error); 
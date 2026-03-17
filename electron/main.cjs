const { app, BrowserWindow } = require('electron');
const path = require('path');

// Цей перемикач ГАРАНТУЄ роботу звуку відразу
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 850,
    minWidth: 1000,
    minHeight: 800,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    autoHideMenuBar: true, // Приховати меню зверху
    backgroundColor: '#ffffff',
    show: false // Показуємо тільки коли готово
  });

  // Завантажуємо dist/index.html (файл після pnpm run build)
  win.loadFile(path.join(__dirname, '../dist/index.html'));

  win.once('ready-to-show', () => {
    win.show();
    // win.webContents.openDevTools(); // Розкоментуйте для відладки, якщо треба
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

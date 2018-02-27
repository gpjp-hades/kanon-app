const {app, BrowserWindow} = require('electron')
  const path = require('path')
  const url = require('url')
  
  let win
  
  function createWindow () {
    win = new BrowserWindow({
      width: 768,
      height: 500,
      icon: "app/main.ico",
      //fullscreen: true,
      frame: false,
      minWidth: 768,
      minHeight: 500
    })

    win.setMenu(null);

    win.loadURL(url.format({
      pathname: path.join(__dirname, 'app/index.html'),
      protocol: 'file:',
      slashes: true
    }))

    win.webContents.openDevTools()

    win.on('closed', () => {
      win = null
    })
  }
  
  app.on('ready', createWindow)
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
  })

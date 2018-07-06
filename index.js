const {app, BrowserWindow} = require('electron')
  
  function createWindow () {
    // Cree la fenetre du navigateur.
    win = new BrowserWindow({width: 800, height: 600})
  
    // et charge le index.html de l'application.
    win.loadFile('index.html')
  }
  
  app.on('ready', createWindow)
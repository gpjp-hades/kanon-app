const {app, BrowserWindow} = require('electron')
const storage = require('electron-json-storage')
const path = require('path')
const url = require('url')

let win

if (process.argv.includes('help')) {
	console.log(`Maturita GPJP

Arguments:

  full    - enable fullscreen
  dev     - enable dev tools
  clearDB - clear database (Warning! List of all used books will be lost!)
	`)
	app.exit()
}

function createWindow () {
	let args = {
		width: 768,
		height: 500,
		icon: "app/main.ico",
		frame: false,
		minWidth: 768,
		minHeight: 500,
		title: "Maturita GPJP"
	}

	if (process.argv.includes('clearDB'))
		storage.clear()

	if (process.argv.includes('full'))
		args['fullscreen'] = true

	win = new BrowserWindow(args)

	win.setMenu(null)

	win.loadURL(url.format({
		pathname: path.join(__dirname, 'app/index.html'),
		protocol: 'file:',
		slashes: true
	}))

	if (process.argv.includes('dev'))
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

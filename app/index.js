'use strict'
window.$ = window.jQuery = require('jquery')
const {shell} = require('electron').remote
const BrowserWindow = require('electron').remote.getCurrentWindow()
require('bootstrap')

const crossroads = require('crossroads')
const controller = require('./controller')
const { ipcRenderer } = require('electron')

const {render, remote, db} = require('./lib')

/**
 * plan:
 * on student selection, book si selected but not drawn
 * 
 * todo:
 * 
 * make everything more robust (catch and display warnings)
 * create errors lib
 * add hybrid logging to everything (dev tools + file)
 * 
 * make sure app works if connection fails
 * try to auto-reconnect (broadcast to find server maybe?)
 */
const main = new class {

    constructor() {

        this.mode = ipcRenderer.sendSync('process-type')

        window.addEventListener('db-ready', () => this.init())

        this.container = {
            render: new render(),
            router: crossroads,
            remoteClient: new remote.client(),
            remoteServer: new remote.server(),
            db: new db(),
            mode: this.mode
        }

        this.route('/client', controller.client.query)
        this.route('/client/wait', controller.client.wait)

        this.route('/server', controller.server.ips)

        this.route('/default', controller.default.listBooks)
        this.route('/default/draw', controller.default.draw)

        // start the app
        this.route('/loading', controller.loading)
        this.container.router.parse('/loading')

    }

    init() {
        switch(this.mode) {
            case 'server' : this.container.router.parse('/server'); break
            case 'client' : this.container.router.parse('/client'); break
            case 'default': this.container.router.parse('/default');break
        }
    }

    route(path, callable) {
        this.container.router.addRoute(path, (args) => this.createEnv(callable, args))
    }

    createEnv(callable, args = {}) {
        this.env = new callable(this.container, args)
        return this.env
    }

    link(href) {
        shell.openExternal(href)
    }

    close() {
        this.shouldClose = true
        BrowserWindow.close()
    }

    mini() {
        BrowserWindow.minimize()
    }

}

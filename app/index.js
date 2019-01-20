'use strict'
window.$ = window.jQuery = require('jquery')
const {shell} = require('electron').remote
const BrowserWindow = require('electron').remote.getCurrentWindow()
require('bootstrap')

const crossroads = require('crossroads')
const controller = require('./controller')
const { ipcRenderer } = require('electron')

const {render, remote} = require('./lib')

const main = new class {

    constructor() {

        this.container = {
            render: new render(),
            router: crossroads,
            remoteClient: new remote.client(),
            remoteServer: new remote.server(),
        }

        this.mode = ipcRenderer.sendSync('process-type')

        this.route('/client', controller.client.query)
        this.route('/client/wait', controller.client.wait)

        this.route('/server', controller.server.ips)

        this.route('/default', controller.default.listBooks)

        switch(this.mode) {
            case 'server' : this.container.router.parse('/server'); break
            case 'client' : this.container.router.parse('/client'); break
            case 'default': this.container.router.parse('/default');break
        }
    }

    route(path, callable) {
        this.container.router.addRoute(path, () => this.createEnv(callable))
    }

    createEnv(callable) {
        this.env = new callable(this.container)
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

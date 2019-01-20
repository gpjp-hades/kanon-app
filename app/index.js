'use strict'
window.$ = window.jQuery = require('jquery')
require('bootstrap')

const crossroads = require('crossroads')
const controller = require('./controller')
const { ipcRenderer } = require('electron')

const {render} = require('./lib')

const main = new class {

    constructor() {

        this.container = {
            render: new render(),
            router: crossroads
        }

        this.mode = ipcRenderer.sendSync('process-type')

        this.route('/client', controller.client.query)
        this.route('/client/wait', controller.client.wait)

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
}

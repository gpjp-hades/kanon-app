'use strict'
const controller = require('../controller.js')

class wait extends controller {
    constructor(c) {
        super(c)

        this.container.render.file('client/wait')
    }

    invoke() {
        this.container.mousetrap.bind(['command+shift+k', 'ctrl+shift+k'], () => {
            this.container.router.parse('/quit')
        })
    }
}

module.exports = wait

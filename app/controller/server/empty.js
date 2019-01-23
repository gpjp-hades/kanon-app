'use strict'
const controller = require('../controller.js')

class empty extends controller {
    constructor(c) {
        super(c)

        this.container.render.file('server/empty')
    }
}

module.exports = empty

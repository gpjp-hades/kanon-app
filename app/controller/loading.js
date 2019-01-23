'use strict'
const controller = require('./controller.js')

class loading extends controller {
    constructor(c) {
        super(c)

        this.container.render.file('loading')
    }

}

module.exports = loading

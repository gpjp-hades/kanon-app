'use strict'
const controller = require('../controller.js')

class wait extends controller {
    constructor(c) {
        super(c)
        
        this.container.render.file('client/wait')
    }

}

module.exports = wait

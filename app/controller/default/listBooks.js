'use strict'
const controller = require('../controller.js')

class listBooks extends controller {
    constructor(c) {
        super(c)
        
        this.container.render.file('default/listBooks')
    }

}

module.exports = listBooks

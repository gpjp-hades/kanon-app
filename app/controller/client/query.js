'use strict'
const controller = require('../controller.js')

class query extends controller {

    constructor(c) {
        super(c)
        
        this.container.render.file('client/query')
    }

    connect() {
        this.clear()

        let ip = $('#client-ip').val()
        if (!this.validateIP(ip))
            return this.message('Chybný formát IP adresy')
        
        console.log('ip')
    }

    message(text) {
        $('#client-connect-error').html(text)
    }

    clear() {
        $('#client-connect-error').html('')
    }

    validateIP(ipaddress) {  
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
          return true
        } 
        return false
    }
    
}

module.exports = query

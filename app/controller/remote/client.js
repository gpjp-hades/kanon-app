'use strict'
const controller = require('../controller.js')

class client extends controller {

    constructor(c) {
        super(c)
        
        this.container.render.file('client/query')
    }

    connect() {
        this.clear()

        let ip = $('#client-ip').val()
        if (!this.validateIP(ip))
            return this.message('Chybný formát IP adresy')
        
        this.container.remoteClient.connect(ip, (err, data) => {
            if (err) {
                if ('code' in err) {
                    switch (err.code) {
                        case 'ECONNREFUSED': this.message('Spojení odmítnuto');break
                        case 'ECONNRESET': this.warn('Server odpojen');break
                        default: this.warn(err.message);break
                    }
                } else {
                    this.warn(err.message)
                }
                return
            }

            let message = data.toString().substr(2)
            switch (data.toString().substr(0, 2)) {
                case 'OK':
                    this.container.render.file('client/wait')
                    break
                case 'DR':
                    this.container.router.parse('/default/draw', [JSON.parse(message)])
                    break
                default:
                    console.log(data);
                    break;
            }
        })
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

module.exports = client

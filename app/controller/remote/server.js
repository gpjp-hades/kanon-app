'use strict'
const controller = require('../controller.js')

class server extends controller {
    constructor(c) {
        super(c)

        this.state = 0

        this.server = this.container.remoteServer
        this.server.createServer((err, data) => {
            if (err) {
                if ('code' in err) {
                    switch (err.code) {
                        case 'EADDRINUSE': this.warn('Port 42000 je obsazen');break
                        case 'ECONNRESET': this.warn('Klient odpojen');break
                        default: this.warn(err.message);break
                    }
                } else {
                    this.warn(err.message)
                }
                return
            }

            switch (data) {
                case 'OK':
                    if (this.state == 0) {
                        this.state = 1
                        this.container.router.parse('/default')
                    }
                    break;
                default:
                    console.log(data);
                    break;
            }
        })

        this.container.render.file('server/ips', {ips: this.getLocalIPs()})
    }

    getLocalIPs() {
        let os = require('os');
        let ifaces = os.networkInterfaces();
        
        let ips = []
        
        Object.keys(ifaces).forEach(ifname => {
            var alias = 0

            ifaces[ifname].forEach(iface => {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    return;
                }

                if (alias >= 1) {
                    ips[ifname + ':' + alias] = iface.address
                } else {
                    ips[ifname] = iface.address
                }
                ++alias
            })
        })
        return ips
    }
}

module.exports = server

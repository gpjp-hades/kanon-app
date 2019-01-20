'use strict'
const controller = require('../controller.js')

class wait extends controller {
    constructor(c) {
        super(c)

        this.server = this.container.remoteServer
        this.server.createServer(console.log, console.log)

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

module.exports = wait

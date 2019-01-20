const net = require('net')

class server {

    constructor() {
        this.port = 42000
        this.ip = '127.0.0.1'

        this.writable = false
        this.clientCount = 0
        
        this.server
        this.socket
    }

    send(data) {
        if (!this.writable)
            return false
        
        this.socket.write('SR' + data)
    }

    createServer(callback, error) {
        if (typeof this.server == 'object')
            return
        
        this.server = net.createServer(socket => {
            if (this.clientCount >= 1) { // kick
                socket.write('TM')
                socket.destroy()
            }
            this.writable = false
            this.clientCount = 1

            this.socket = socket
            socket.setEncoding("utf8")

            socket.write('SH') // hello

            socket.on('data', data => {
                console.log(data)

                let message = data.toString().substr(2)

                switch (data.toString().substr(0, 2)) {
                    case 'CH':
                        this.writable = true
                        socket.write('SROK')
                        break
                    case 'CM':
                        callback(message)
                        break
                    default:
                        socket.write('TM')
                        socket.destroy()
                        this.writable = false
                        this.clientCount = 0
                }
            })

            socket.on('error', error)
            socket.on('close', () => {
                this.clientCount = 0
                this.writable = false
            })
        })

        this.server.listen(this.port, this.ip)
    }
}

module.exports = server

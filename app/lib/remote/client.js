const net = require('net')

class client {

    constructor() {
        this.port = 42000
        this.writable = false

        this.client
    }

    send(data) {
        if (!this.writable)
            return false
        
        this.client.write('CM' + data)
    }

    connect(ip, callback) {
        if (typeof this.client == 'object' && !this.client.destroyed)
            return
        
        this.client = new net.Socket()
        
        this.client.connect(this.port, ip, () => {
            this.writable = false
            this.client.setEncoding("utf8")
        })

        this.client.on('data', data => {
            console.log(data)

            let message = data.toString().substr(2)
            
            switch (data.toString().substr(0, 2)) {
                case 'TM': // too many (kick)
                    this.client.destroy()
                    this.writable = false

                    callback(new Error('Too many clients'))
                    break
                
                case 'SH': // hello
                    this.client.setTimeout(0)
                    this.client.write('CH')
                    this.writable = true

                    break
                
                case 'SR': // server response
                    if (message == 'OK')
                        this.client.write('CMOK')
                    callback(void(0), message)
                    break

                default:
                    this.writable = false
                    client.destroy()
                    
                    callback(new Error('Server error'))
                    break
            }

        })

        this.client.on('error', callback)
        this.client.setTimeout(3000, () => {
            this.writable = false
            client.destroy()
            callback(new Error('Timeout'))
        })
    }
}

module.exports = client

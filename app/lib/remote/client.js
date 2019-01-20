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

    connect(ip, callback, error) {
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

                    error('TOOMANY')
                    break
                
                case 'SH': // hello
                    this.client.setTimeout(0)
                    this.client.write('CH')
                    this.writable = true

                    break
                
                case 'SR': // server response
                    callback(message)
                    break

                default:
                    this.writable = false
                    client.destroy()
                    
                    error('SERVERERR')
                    break
            }

        })

        this.client.on('error', error)
        this.client.setTimeout(3000, () => {
            this.writable = false
            client.destroy()
            error('TIMEOUT')
        })
    }
}

module.exports = client

const ejs = require('ejs');

class render {
    
    constructor() {
        this.output = ''
        this.path   = './app/templates/'
        this.onloadStack = []

        window.addEventListener('load', (e) => {
            this.write()
            this.onloadStack.forEach(e => e())
            this.onloadStack = []
        })
    }

    file(filename, data) {
        ejs.renderFile(this.path + filename + '.ejs', data, [], (err, str) => {
            this.output = str
            this.write()
        })
    }

    onload(callback) {
        if (document.readyState == 'complete') {
            callback()
        } else {
            this.onloadStack.push(callback)
        }
    }

    write() {
        if (document.readyState == 'complete')
            $('body').html(this.output)
    }
}

module.exports = render

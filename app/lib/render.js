const ejs = require('ejs');

class render {
    
    constructor() {
        this.output = ''
        this.path   = './app/templates/'

        window.addEventListener('load', (e) => {
            this.write()
        })
    }

    file(filename, data) {
        ejs.renderFile(this.path + filename + '.ejs', data, [], (err, str) => {
            this.output = str
            this.write()
        })
    }

    write() {
        if (document.readyState == 'complete')
            $('body').html(this.output)
    }
}

module.exports = render

window.$ = window.jQuery = require('jquery')
require('bootstrap')
const fs = require('fs')
const parse = require('csv-parse')
const {dialog} = require('electron').remote
const BrowserWindow = require('electron').remote.getCurrentWindow()
const storage = require('electron-json-storage')
var Mousetrap = require('mousetrap')

main = new class {

    close() {
        BrowserWindow.close()
    }

    constructor() {

        this.userMode = false

        storage.getMany(['kanon', 'pupils', 'used'], (err, data) => {
            if (err) throw error
          
            this.kanon = data.kanon
            if (this.kanon)
                this.showBooks()

            this.pupils = data.pupils
            if (this.pupils)
                this.showPupils()

            this.used = data.used
        })

        Mousetrap.bind(['command+shift+k', 'ctrl+shift+k'], _ => {
            this.endUserMode()
        })
    }

    endUserMode() {
        if (this.userMode) {
            this.userMode = false
            $('#mode').html('Normální režim')
        }
    }

    startUserMode() {
        if (!this.userMode) {
            this.userMode = true
            $('#mode').html('Režim uživatele')
        }
    }

    showBooks() {
        $('#loadKanon').html('Aktualizovat kánon')
        $('#books').html(this.kanon.map(e => e.join(', ')).join('<br />'))
    }

    showPupils() {
        $('#pupils').html(Object.keys(main.pupils).join('<br />'))
    }

    save(target, data) {
        storage.set(target, data, function (err) {
            if (err) throw error
        })
    }

    loadKanon() {
        let file = dialog.showOpenDialog({properties: ['openFile'], filters: [{name: 'Kánon', extensions: ['csv']}]})

        if (file) {
            fs.readFile(file[0], 'utf8', (err, data) => {
                if (err) throw error

                parse(data, {delimiter: ';'}, (err, output) => {
                    if (err) throw error

                    this.kanon = output
                    this.save('kanon', output)
                    $('#status').html('Načteno ' + this.kanon.length + ' knih')
                    this.showBooks()
                })
            })
        }
    }

    loadPupil() {
        let file = dialog.showOpenDialog({properties: ['openFile'], filters: [{name: 'Student', extensions: ['gms']}]})
        
        if (file) {
            fs.readFile(file[0], 'utf8', (err, data) => {
                if (err)
                    return console.log(err)
                
                let name = data.substr(0, data.indexOf("\n"))

                parse(data.substr(data.indexOf("\n")+1), {delimiter: ';'}, (err, output) => {
                    if (err)
                        return console.log(err)
                    
                    if (name in this.pupils) {
                        $('#status').html('Kánon studenta ' + name + ' byl aktualizován')
                    } else {
                        $('#status').html('Student ' + name + ' byl přidán')
                    }

                    this.pupils[name] = output
                    this.save('pupils', this.pupils)
                    this.showPupils()
                })
            })
        }
    }
}

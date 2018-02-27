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
        this.changer
        this.books
        this.name
        this.pupils = []

        storage.getMany(['kanon', 'pupils', 'used'], (err, data) => {
            if (err) throw error
          
            if (data.kanon.length) {
                this.kanon = data.kanon
                this.showBooks()
            }

            if (data.pupils.length) {
                this.pupils = data.pupils
                this.showPupils()
            }

            this.used = data.used
        })

        Mousetrap.bind(['command+shift+k', 'ctrl+shift+k'], _ => {
            this.endUserMode()
        })
    }

    numberChanger() {
        $('#number').html(Math.floor(Math.random()*20)+1)
    }

    getBook() {
        clearInterval(this.changer)
        let book = this.books[Math.floor(Math.random()*20)]
        $('#book').html(book)
    }

    endUserMode() {
        if (this.userMode) {
            this.userMode = false
            $('#mode').html('Normální režim')
            clearInterval(this.changer)
        }
    }

    startUserMode() {
        if (!this.userMode) {
            name = $('#pupil').val()
            if (name in this.pupils) {
                this.books = this.pupils[name]
                this.name = name

                this.userMode = true
                $('#mode').html('Režim uživatele')
                this.changer = setInterval(this.numberChanger, 200)
            }
            console.log(name)
        }
    }

    showBooks() {
        $('#loadKanon').html('Aktualizovat kánon')
        $('#books').html(this.kanon.map(e => e.join(', ')).join('<br />'))
    }

    showPupils() {
        $('#pupils').html(Object.keys(this.pupils).join('<br />'))
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
                
                let name = data.substr(0, data.indexOf("\n")-1)

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

window.$ = window.jQuery = require('jquery')
require('bootstrap')
const fs = require('fs')
const parse = require('csv-parse')
const {dialog} = require('electron').remote
const BrowserWindow = require('electron').remote.getCurrentWindow()
const storage = require('electron-json-storage')
const Mousetrap = require('mousetrap')
const {kanon, pupils, used} = require('./lib')

main = new class {

    constructor() {

        this.userMode = false
        this.changer
        this.books
        this.name
        this.kanon = new kanon()
        this.pupils = new pupils(this.kanon)
        this.used = new used(this.kanon)

        storage.getMany(['kanon', 'pupils', 'used'], (err, data) => {
            if (err) throw err
            
            if (length in data.kanon) {
                this.kanon.fromJSON(data.kanon)
                this.showBooks()
            }

            if (length in data.pupils) {
                this.pupils.fromJSON(data.pupils)
                this.showPupils()
            }

            if (length in data.used) {
                this.used.fromJSON(data.used)
            }
        })

        Mousetrap.bind(['command+shift+k', 'ctrl+shift+k'], _ => {
            this.endUserMode()
        })
    }

    close() {
        BrowserWindow.close()
    }
    mini() {
        BrowserWindow.minimize()
    }

    numberChanger() {
        $('#number').html(Math.floor(Math.random()*20)+1)
    }

    getBook() {
        clearInterval(this.changer)
        let book = this.used.getBook(this.pupil)
        this.save('used', this.used)
        if (book) {
            $('#book').html(book.toString())
        } else {
            $('#book').html("Všechny knihyjiž byly vybrány")
        }
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
            if (this.pupils.has(name)) {
                this.pupil = this.pupils.get(name)

                this.userMode = true
                $('#mode').html('Režim uživatele')
                this.changer = setInterval(this.numberChanger, 200)
            } else {
                $('#status').html("Student " + name + " nenalezen")
            }
        }
    }

    showBooks() {
        $('#loadKanon').html('Aktualizovat kánon')
        $('#loadPupil').removeAttr('class')
        $('#books').html(this.kanon.toString())
    }

    showPupils() {
        $('#pupils').html(this.pupils.toString())
    }

    save(target, data) {
        storage.set(target, data, function (err) {
            if (err) throw err
        })
    }

    loadKanon() {
        let file = dialog.showOpenDialog({properties: ['openFile'], filters: [{name: 'Kánon', extensions: ['csv']}]})

        if (file) {
            fs.readFile(file[0], 'utf8', (err, data) => {
                if (err) throw err

                parse(data, {delimiter: ';'}, (err, output) => {
                    if (err) throw err

                    this.kanon.fromFile(output)

                    this.save('kanon', this.kanon)
                    $('#status').html('Načteno ' + this.kanon.length + ' knih')
                    this.showBooks()
                })
            })
        }
    }

    loadPupil() {
        let files = dialog.showOpenDialog({properties: ['openFile', 'multiSelections'], filters: [{name: 'Student', extensions: ['gms']}]})
        
        if (files) {
            files.forEach(file => {
                fs.readFile(file, 'utf8', (err, data) => {
                    if (err) throw err
                    
                    let name = data.substr(0, data.indexOf("\n")-1)
    
                    parse(data.substr(data.indexOf("\n")+1), {delimiter: ';'}, (err, output) => {
                        if (err) throw err
                        
                        if (this.pupils.has(name)) {
                            $('#status').html('Kánon studenta ' + name + ' byl aktualizován')
                        } else {
                            $('#status').html('Student ' + name + ' byl přidán')
                        }

                        this.pupils.fromFile(name, output.map(e => {return e[0]}));

                        this.save('pupils', this.pupils)
                        this.showPupils()
                    })
                })
            })
        }
    }
}

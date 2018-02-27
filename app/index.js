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

            this.used.fromJSON(data.used)
            this.showUsed()
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
        Mousetrap.unbind('enter')
        $('.dice').animate({opacity: 0, width: 0}, 800)

        let book = this.used.getBook(this.pupil)
        this.save('used', this.used)
        if (book) {
            $('#book').html(book.toHTML())
        } else {
            $('#book').html("Všechny knihy již byly vylosovány")
        }
        $('#book').delay(1000).animate({opacity: 1}, 800)
    }

    endUserMode() {
        if (this.userMode) {
            this.userMode = false

            Mousetrap.unbind('enter')

            this.showUsed()

            $('#book').removeAttr('style')
            $('.dice').removeAttr('style')

            $(".normalMode").css("display", "initial")
            $(".userMode").css("display", "none")

            clearInterval(this.changer)
        }
    }

    startUserMode() {
        if (!this.userMode) {
            name = $('#pupils').val()
            if (this.pupils.has(name)) {

                Mousetrap.bind('enter', _ => {
                    this.getBook()
                })

                this.pupil = this.pupils.get(name)

                this.userMode = true

                $(".normalMode").css("display", "none")
                $(".userMode").css("display", "initial")

                this.changer = setInterval(this.numberChanger, 200)
            } else {
                this.status("Student " + name + " nenalezen")
            }
        }
    }

    status(message) {
        $('#status').parent().removeAttr('style')
        $('#status').html(message)
        $("#status").parent().fadeTo(2000, 500).slideUp(500)
    }

    validate() {
        if ($('#pupils').val()) {
            $("#continue-modal").modal()
        } else {
            this.status('Zvolte studenta')
            return false
        }
    }

    showUsed() {
        $("#used").html(this.used.toHTML())
    }

    showBooks() {
        $('#loadKanon').html('Aktualizovat kánon')
        $('#loadPupil').removeAttr('class')
        $('#books').html(this.kanon.toString())
    }

    showPupils() {
        this.pupils.toArray().forEach(name => {
            $('#pupils').append($('<option>', {
                value: name,
                text: name
            }))
        })
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
                    this.status('Načteno ' + this.kanon.length + ' knih')
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
                            this.status('Kánon studenta <b>' + name + '</b> byl aktualizován')
                        } else {
                            this.status('Student <b>' + name + '</b> byl přidán')
                        }

                        this.pupils.fromFile(name, output.map(e => {return e[0]}))

                        this.save('pupils', this.pupils)
                        this.showPupils()
                    })
                })
            })
        }
    }
}

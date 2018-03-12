window.$ = window.jQuery = require('jquery')
require('bootstrap')
const fs = require('fs')
const parse = require('csv-parse')
const {dialog, shell} = require('electron').remote
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
        this.gotBook = false

        storage.getMany(['kanon', 'pupils', 'used'], (err, data) => {
            if (err) throw err
            
            if (data.kanon instanceof Array) {
                this.kanon.fromJSON(data.kanon)
                this.showBooks()
            }

            if (data.pupils instanceof Array) {
                this.pupils.fromJSON(data.pupils)
                this.showPupils()
            }

            if (data.used instanceof Object) {
                this.used.fromJSON(data.used)
                this.showUsed()
            }
        })

        Mousetrap.bind(['command+shift+k', 'ctrl+shift+k'], _ => {
            this.endUserMode()
        })
        
    }

    link(href) {
        shell.openExternal(href)
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
        if (!this.gotBook) {
            clearInterval(this.changer)

            Mousetrap.unbind('enter')

            this.gotBook = true

            $('.dice').animate({opacity: 0, width: 0}, 800)

            let book = this.used.getBook(this.pupil)
            
            this.save('used', this.used)
            if (book) {
                $('#book').html(book.toHTML())
            } else {
                $('#book').html("<span>Všechny knihy již byly vylosovány</span>")
            }

            $('#number').html(this.pupil.books.indexOf(book) + 1)

            $('#book').delay(1000).animate({opacity: 1}, 800)

            $('#help').delay(20 * 1000).animate({opacity: 0.7}, 3000)
        }
    }

    endUserMode() {
        if (this.userMode) {
            this.userMode = false
            this.gotBook = false

            Mousetrap.unbind('enter')

            this.showUsed()

            $('#book').removeAttr('style')
            $('.dice').removeAttr('style')
            $('#help').stop().removeAttr('style')

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
                $('#help').stop().clearQueue().removeAttr('style')

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
        $('#pupils').html('<option selected disabled>Zvolte studenta</option>')
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

                        var parsed = output.map(e => {return parseInt(e[0].substring(1))})
                        
                        if (!(parsed instanceof Array) || parsed.length == 0) {
                            this.status('Soubor ' + file + ' nerozpoznán')
                        } else if (files.length > 1) {
                            null
                        } else if (this.pupils.has(name)) {
                            this.status('Kánon studenta <b>' + name + '</b> byl aktualizován')
                        } else {
                            this.status('Student <b>' + name + '</b> byl přidán')
                        }

                        this.pupils.fromFile(name, parsed)

                        this.save('pupils', this.pupils)
                        this.showPupils()
                    })
                })
            })
            if (files.length > 1)
                this.status('Studenti byli přidáni')
        }
    }
}

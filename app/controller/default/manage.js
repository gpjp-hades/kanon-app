'use strict'
const controller = require('../controller.js')

class manage extends controller {
    constructor(c, args) {
        super(c, args)

        this.container.render.file('default/manage')
    }

    invoke() {
        if ('status' in this.args) {
            this.status(this.args.status)
        }

        this.showKanon()
        this.showPupils()
        this.showUsed()
    }

    dispatch() {
        // todo: server and client stuff
        /*if (this.container.mode == 'server') {
            this.container.remoteServer.send('ble')
        }*/

        this.container.router.parse('/default/draw', [{name: $('#pupils').val()}])
    }

    loadPupil() {
        this.container.db.loadPupil((e, f) => this.alertPupil(e, f), console.log)
    }

    showPupils() {
        $('#pupils').html('<option selected disabled>Zvolte studenta</option>')
        this.container.db.pupils.toArray().sort((a, b) => (
            a.class > b.class
        )).forEach(pupil => {
            if (!$('#pupils').has('optgroup.' + (pupil.class?pupil.class:"noclass")).length) {
                $('#pupils').append($('<optgroup>', {
                    class: (pupil.class?pupil.class:"noclass"),
                    label: {
                        "a": "Oktáva A",
                        "b": "Oktáva B",
                        "c": "4. C",
                        "noclass": "Neznámá třída"
                    }[pupil.class?pupil.class:"noclass"]
                }))
            }
            $('optgroup.' + (pupil.class?pupil.class:"noclass")).append($('<option>', {
                value: pupil.name,
                text: pupil.name
            }))
        })
    }

    alertPupil(name, action) {
        this.showPupils()

        switch (action) {
            case 'create':
                this.status('Student ' + name + ' byl přidán')
                break;
            case 'append':
                this.status('Student ' + name + ' byl aktualizován')
                break;
            case 'multiple':
                this.status('Studenti byli přidáni')
                break;
            case 'format':
                this.status('Soubor ' + name + ' nebyl rozpoznán')
                break;
            default:
                console.log(name, action)
        }
    }

    loadKanon() {
        this.container.db.loadKanon(e => this.showKanon(e), console.log)
    }

    showKanon(num) {
        $('#loadKanon').html('Aktualizovat kánon')
        $('#loadPupil').removeAttr('class')
        $('#books').html(this.container.db.kanon.toHTML())

        if (typeof num == 'number')
            this.status('Načteno ' + num + ' knih')
        
        $("#books option").dblclick((e) => {
            let index = e.target.getAttribute('value')
            $("#change-modal .modal-title").html("Chcete knihu vyřadit?")
            $("#bookChange").html(this.container.db.kanon.books[index].toString() + " bude přidána mezi vyřazené knihy")
            $("#bookChangeContinue").click(_ => {
                this.container.db.used.addBook(index)
                this.container.db.save('used', this.container.db.used)
                this.showUsed()
                $("#change-modal").modal("hide")
                $("#bookChangeContinue").off("click")
            })
            $("#change-modal").modal("show")
        })
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
        $("#used").html(this.container.db.used.toHTML())

        $("#used option").dblclick((e) => {

            let index = e.target.getAttribute('value')
            $("#change-modal .modal-title").html("Chcete knihu odebrat z vyřazených?")
            $("#bookChange").html(this.container.db.kanon.books[index].toString() + " bude znovu zařazena do losování.")
            $("#bookChangeContinue").click(_ => {
                this.container.db.used.removeBook(index)
                this.container.db.save('used', this.container.db.used)
                this.showUsed()
                $("#change-modal").modal("hide")
                $("#bookChangeContinue").off("click")
            })
            $("#change-modal").modal("show")
        })
    }

}

module.exports = manage

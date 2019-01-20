'use strict'
const controller = require('../controller.js')

class listBooks extends controller {
    constructor(c) {
        super(c)
        
        this.container.render.file('default/listBooks')
        
        window.addEventListener('kanon-db-loaded', () => 
            this.container.render.onload(() => this.showKanon())
        )
    }

    loadPupil() {
        this.container.db.loadPupil((e, f) => this.alertPupil(e, f), console.log)
    }

    alertPupil(name, action) {
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
        /*$("#books option").dblclick((e) => {
            let index = e.target.getAttribute('value')
            $("#change-modal .modal-title").html("Chcete knihu vyřadit?")
            $("#bookChange").html(this.kanon.books[index].toString() + " bude přidána mezi vyřazené knihy")
            $("#bookChangeContinue").click(_ => {
                this.used.addBook(index)
                this.save('used', this.used)
                this.showUsed()
                $("#change-modal").modal("hide")
                $("#bookChangeContinue").off("click")
            })
            $("#change-modal").modal("show")
        })*/
    }

    validate() {
        if ($('#pupils').val()) {
            $("#continue-modal").modal()
        } else {
            this.status('Zvolte studenta')
            return false
        }
    }

}

module.exports = listBooks

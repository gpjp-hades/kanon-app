'use strict'
const controller = require('../controller.js')

class draw extends controller {
    constructor(c, args) {
        super(c, args)

        this.accept = true
        this.book = args.book

        window.addEventListener('draw-done', () => this.saveBook())

        this.container.render.file('server/draw', {book: this.book})
    }

    destructor() {
        this.removeEL()
    }

    back() {
        this.removeEL()
        
        this.container.remoteServer.send('CL')
        this.container.router.parse('/default')
    }

    removeEL() {
        window.removeEventListener('draw-done', () => this.saveBook())
        this.accept = false
    }

    saveBook() {
        if (!this.accept) {
            this.removeEL()
            return
        }

        this.removeEL()

        this.container.db.used.addBook(this.book.id)
        this.container.db.save('used', this.container.db.used)

        $('#back').html('Zpět')
        $('#title').html('Student si vylosoval knihu')
        $('#heading').html('')
    }
}

module.exports = draw

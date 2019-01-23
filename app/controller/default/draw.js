'use strict'
const controller = require('../controller.js')
const Book = require('../../lib/book.js')

class draw extends controller {
    constructor(c, args) {
        super(c, args)

        this.gotBook = false

        if (! 'name' in args) {
            this.container.router.parse('/default', [{status: "Student nespecifikován"}])
            return
        }
        
        if (this.container.mode == 'client') {
            this.name = args.name

        } else {
            if (!this.container.db.pupils.has(args.name)) {
                this.container.router.parse('/default', [{status: "Student " + args.name + " nenalezen"}])
                return
            }

            this.pupil = this.container.db.pupils.get(args.name)
            this.name = this.pupil.name
        }

        this.container.render.file('default/draw')
    }

    destructor() {
        clearInterval(this.changer)
    }

    invoke() {
        this.container.mousetrap.bind('enter', () => {
            this.getBook()
        })

        this.container.mousetrap.bind(['command+shift+k', 'ctrl+shift+k'], () => {
            this.quit()
        })

        $('.dice').removeAttr('style').stop()
        $('#book').html('').removeAttr('style').stop()
        $("#pupilName").html(this.name)
        $(".normalMode").css("display", "none")
        $(".userMode").css("display", "initial")
        $('#help').stop().clearQueue().removeAttr('style')

        this.container.render.onload(() => this.startNumberLoop())
    }

    quit() {
        if (this.container.mode == 'client') {
            this.container.router.parse('/quit')
        } else {
            this.container.router.parse('/default')
        }
    }

    startNumberLoop() {
        this.changer = setInterval(() => this.numberChanger(), 200)
    }

    numberChanger() {
        $('#number').html(Math.floor(Math.random() * this.container.db.kanon.length) + 1)
    }

    getBook() {
        if (!this.gotBook) {
            clearInterval(this.changer)

            this.container.mousetrap.unbind('enter')
            this.gotBook = true
    
            $('.dice').animate({opacity: 0, width: 0}, 800)
            
            let book

            if (this.container.mode == 'client') {
                book = new Book(...this.args.book)
            } else {
                book = this.drawBook()
                $('#help').delay(20 * 1000).animate({opacity: 0.7}, 3000)
            }
            
            if (book) {
                $('#book').html(book.toHTML())
                $('#number').html(parseInt(book.id))
            } else {
                $('#book').html("<span>Všechny knihy již byly vylosovány</span>")
                $('#number').html("")
            }

            this.container.remoteClient.send('DN')
    
            $('#book').delay(1000).animate({opacity: 1}, 800)

        }
    }
    
    drawBook() {
        let book = this.container.db.used.getBook(this.pupil)
        this.container.db.used.addBook(book.id)
        this.container.db.save('used', this.container.db.used)
        return book
    }

}

module.exports = draw

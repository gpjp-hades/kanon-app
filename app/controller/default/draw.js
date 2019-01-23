'use strict'
const controller = require('../controller.js')

class draw extends controller {
    constructor(c, args) {
        super(c)

        this.gotBook = false

        if (! 'name' in args) {
            this.container.router.parse('/default', [{status: "Student nespecifikován"}])
            return
        }

        if (!this.container.db.pupils.has(args.name)) {
            this.container.router.parse('/default', [{status: "Student " + args.name + " nenalezen"}])
            return
        }

        this.pupil = this.container.db.pupils.get(args.name)

        this.container.render.file('default/draw')
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
        $("#pupilName").html(this.pupil.name)
        $(".normalMode").css("display", "none")
        $(".userMode").css("display", "initial")
        $('#help').stop().clearQueue().removeAttr('style')

        this.container.render.onload(() => this.startNumberLoop())
    }

    quit() {
        this.container.router.parse('/default')
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
    
            let book = this.drawBook()
            
            if (book) {
                $('#book').html(book.toHTML())
                $('#number').html(parseInt(book.id))
            } else {
                $('#book').html("<span>Všechny knihy již byly vylosovány</span>")
                $('#number').html("")
            }
    
            $('#book').delay(1000).animate({opacity: 1}, 800)
            $('#help').delay(20 * 1000).animate({opacity: 0.7}, 3000)
        }
    }
    
    drawBook() {
        let book = this.container.db.used.getBook(this.pupil)
        this.container.db.save('used', this.container.db.used)
        return book
    }

}

module.exports = draw

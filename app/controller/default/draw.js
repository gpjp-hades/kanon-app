'use strict'
const controller = require('../controller.js')

class draw extends controller {
    constructor(c, args) {
        super(c)
        this.kanon = this.container.db.kanon

        this.container.render.file('default/draw')

        if (! 'name' in args) {
            this.container.router.parse('/default', [{status: "Student nespecifikován"}])
            return
        }

        if (!this.container.db.pupils.has(args.name)) {
            this.container.router.parse('/default', [{status: "Student " + args.name + " nenalezen"}])
            return
        }

    }

    numberChanger() {
        $('#number').html(Math.floor(Math.random() * main.kanon.length)+1)
    }
}

module.exports = draw

/*

getBook() {
    if (!this.gotBook) {
        clearInterval(this.changer)

        Mousetrap.unbind('enter')

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
    let book = this.used.getBook(this.pupil)
    this.save('used', this.used)
    return book
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
    if (this.userMode)
        return
    
    name = $('#pupils').val()
    if (!this.pupils.has(name)) {
        this.status("Student " + name + " nenalezen")
        return
    }

    this.pupil = this.pupils.get(name)
    this.userMode = true

    if (this.mode == 'server') {
        if (!this.socket.writable) {
            this.status("Spojení s klientem ztaceno")
            return
        }
        let book = this.drawBook()
        // draw book and send it to client
        if (book) {
            this.socket.write('DR' + name + '\n' + book.toJSON())
            this.status("Student vylosuje knihu " + book.toHTML())
        } else {
            this.socket.write('DR' + name + '\n' + 'blank')
            this.status("Všechny knihy již byly vylosovány")
        }
        

    } else if (this.mode == 'default') {
        Mousetrap.bind('enter', _ => {
            this.getBook()
        })

        $('.dice').removeAttr('style').stop()
        $('#book').html('').removeAttr('style').stop()
        $("#pupilName").html(this.pupil.name)
        $(".normalMode").css("display", "none")
        $(".userMode").css("display", "initial")
        $('#help').stop().clearQueue().removeAttr('style')

        this.changer = setInterval(this.numberChanger, 200)
    }
}

*/
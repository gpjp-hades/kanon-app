'use strict'
const kanon = require('./kanon.js')
const pupil = require('./pupil.js')

class used {
    constructor(arg) {
        if (!(arg instanceof kanon))
            throw "passed invalid kanon"
        
        this.kanon = arg
        this.date = new Date()
        this.list = {}
        this.list[this.date.getDate()] = []
    }

    fromJSON(data) {
        this.list = data
        if (!(this.date.getDate() in this.list))
            this.list[this.date.getDate()] = []
    }

    toJSON() {
        return this.list
    }

    toHTML() {
        return this.list[this.date.getDate()].map(e => {
            return this.kanon.get(e).toString()
        }).join("<br />")
    }

    getBook(arg) {
        if (!(arg instanceof pupil))
            throw "passed invalid pupil"
        
        let selectable = arg.books.filter(e => {
            return !this.list[this.date.getDate()].includes(e.id)
        })
        
        if (!selectable.length)
            return false
        
        
        let book = selectable[Math.floor(Math.random()*selectable.length)]
        this.list[this.date.getDate()].push(book.id)
        
        return book
    }

}

module.exports = used

'use strict'
const book = require('./book.js')

class kanon {
    constructor(books = []) {
        this.books = books
        this.length
    }

    fromJSON(books) {
        this.books = books.map(e => {
            if (e) return new book(...e)
        })
        this.length = this.books.length
    }

    fromFile(args) {
        args.forEach(arg => {
            let info = new book(...arg)

            this.books[info.id] = info
        })
        this.length = this.books.length
    }
    
    toJSON() {
        return this.books.map(e => {if (e) return e.toJSON()})
    }

    toString() {
        return this.books.map(e => {if (e) return e.toString()}).join("<br />\n")
    }
}

module.exports = kanon

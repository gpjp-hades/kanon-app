'use strict'
const book = require('./book.js')

class pupil {
    constructor() {
        this.books
    }

    addBook(book) {
        if (book.constructor.name != "book")
            throw "passed non valid book"
        
        this.books[book.id] = book
    }
}

module.exports = pupil

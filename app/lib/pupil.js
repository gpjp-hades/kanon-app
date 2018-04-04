'use strict'
const Book = require('./book.js')

class pupil {
    constructor(name, books = [], clas = null) {
        this.name = name
        this.class = clas
        if (books instanceof Array)
            this.books = books

    }

    addBook(book) {
        if (book instanceof Book)
            throw "passed non valid book"
        
        this.books[book.id] = book
    }

    toJSON() {
        return {"name": this.name, "books": this.books.map(e => {return e.id}), "class": this.class}
    }
}

module.exports = pupil

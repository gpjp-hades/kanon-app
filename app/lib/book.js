'use strict'

class Book {
    constructor(id, region, author, name) {
        this.id = id
        this.name = name
        this.author = author
        this.region = region
    }

    toString() {
        return this.author + ": " + this.name
    }

    toHTML() {
        return "<small>" + this.author + ":</small><br />" + this.name
    }

    toJSON(key) {
        return [this.id, this.region, this.author, this.name]
    }
}

module.exports = Book

'use strict'

class Book {
    constructor(id, region, author, name) {
        this.id = id
        this.name = name
        this.author = author
        this.region = region
    }

    toString() {
        return this.author + ": " + this.name + "(" + this.region + ")"
    }

    toJSON(key) {
        return [this.id, this.region, this.author, this.name]
    }
}

module.exports = Book

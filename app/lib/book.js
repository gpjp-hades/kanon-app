'use strict'

class Book {
    constructor(id, region, author, name) {
        this.id = id
        this.name = name
        this.author = author
        this.region = region
    }

    toString() {
        return this.author + (this.author?": ":"") + "<b>" + this.name + "</b>"
    }

    toHTML() {
        if (typeof this.author == 'string' && this.author.length > 0) {
            return "<small>" + this.author + ":</small><br /><span>" + this.name + "</span>"
        } else {
            return "<span>" + this.name + "</span>"
        }
    }

    toJSON(key) {
        return [this.id, this.region, this.author, this.name]
    }
}

module.exports = Book

'use strict'
const book = require('./book.js')

class kanon {
    constructor(books = []) {
        this.books = books
        this.length = 0
    }

    fromJSON(books) {
        this.books = books.map(e => {
            if (e) return new book(...e)
        })
        this.length = this.books.length
    }

    has(id) {
        return id in this.books
    }

    get(id) {
        return this.books[id]
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
        return this.books.reduce((ret, e) => {if (e) ret.push(e.toString()); return ret}, []).join("<br />\n")
    }

    toHTML() {
        return this.books.reduce((ret, e) => {
            if (e)
                ret.push("<option value='" + e.id + "'>" + e.toString() + "</option>")
            return ret
        }, []).join("\n")
    }

}

module.exports = kanon

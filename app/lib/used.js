'use strict'
const kanon = require('./kanon.js')
const pupil = require('./pupil.js')

class used {
    constructor(arg) {
        if (!(arg instanceof kanon))
            throw "passed invalid kanon"
        
        this.kanon = arg
        this.list = []
    }

    fromJSON(data) {
        this.list = data
    }

    toJSON() {
        return this.list
    }

    getBook(arg) {
        if (!(arg instanceof pupil))
            throw "passed invalid pupil"
        
        let selectable = arg.books.filter(e => {
            return !this.list.includes(e.id)
        })
        
        if (!selectable.length)
            return false
        
        
        let book = selectable[Math.floor(Math.random()*selectable.length)]
        this.list.push(book.id)
        
        return book
    }

}

module.exports = used

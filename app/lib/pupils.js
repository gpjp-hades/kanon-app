'use strict'
const pupil = require('./pupil.js')
const kanon = require('./kanon.js')

class pupils {
    constructor(arg) {
        if (!(arg instanceof kanon))
            throw "passed invalid kanon"
        
        this.kanon = arg
        this.list = []
        this.length = 0
    }

    has(name) {
        return this.list.some(e => {
            return e.name == name
        })
    }

    get(name) {
        return this.list.find(e => {
            return e.name == name
        })
    }

    fromFile(name, books) {
        let present = this.list.find(e => {
            return e.name == name
        })

        books = books.map(e => {
            if (this.kanon.has(e))
                return this.kanon.get(e)
        })

        if (present) {
            this.list[present.id].books = books
        } else {
            this.list.push(new pupil(name, books))
        }
        this.length = this.list.length
    }

    fromJSON(data) {
        data.map(e => {
            this.fromFile(e.name, e.books)
        })
    }

    toJSON() {
        return this.list.map(e => {if (e) return e.toJSON()})
    }

    toString() {
        return this.list.map(e => {
            return e.name
        }).join("<br />")
    }
}

module.exports = pupils

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
        return this.list.filter(e => {
            e.name == name
        }).length
    }

    fromFile(name, books) {
        let present = this.list.filter(e => {
            e.name == name
        })

        books = books.map(e => {
            if (this.kanon.has(e))
                return this.kanon.get(e)
        })

        if (present.length) {
            this.list[present[0].id].books = books
        } else {
            this.list.push(new pupil(name, books))
        }
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

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

        books = books.reduce((ret, e) => {
            if (this.kanon.has(e))
                ret.push(this.kanon.get(e))
            return ret
        }, [])

        if (present) {
            this.list[this.list.indexOf(present)].books = books
        } else {
            this.list.push(new pupil(name, books))
        }

        this.list.sort((a, b) => {
            return a.name.localeCompare(b.name)
        })

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

    toArray() {
        return this.list.map(e => {
            return e.name
        })
    }
}

module.exports = pupils

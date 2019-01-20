'use strict'

const fs = require('fs')
const parse = require('csv-parse')
const {dialog} = require('electron').remote
const storage = require('electron-json-storage')
const {kanon, pupils, used} = require('.')

class db {
    constructor() {

        this.kanon = new kanon()
        this.pupils = new pupils(this.kanon)
        this.used = new used(this.kanon)

        storage.getMany(['kanon', 'pupils', 'used'], (err, data) => {
            if (err) throw err
            
            if (data.kanon instanceof Array) {
                this.kanon.fromJSON(data.kanon)
                window.dispatchEvent(new Event('kanon-db-loaded'))
            }

            if (data.pupils instanceof Array) {
                this.pupils.fromJSON(data.pupils)
                window.dispatchEvent(new Event('pupils-db-loaded'))
            }

            if (data.used instanceof Object) {
                this.used.fromJSON(data.used)
                window.dispatchEvent(new Event('used-db-loaded'))
            }
        })
    }

    loadKanon(callback) {
        let file = dialog.showOpenDialog({properties: ['openFile'], filters: [{name: 'Kánon', extensions: ['csv']}]})

        if (file) {
            fs.readFile(file[0], 'utf8', (err, data) => {
                if (err) throw err

                parse(data, {delimiter: ';'}, (err, output) => {
                    if (err) throw err

                    this.kanon.fromFile(output)

                    this.save('kanon', this.kanon)
                    callback(this.kanon.length)
                })
            })
        }
    }

    loadPupil(callback, error) {
        let files = dialog.showOpenDialog({properties: ['openFile', 'multiSelections'], filters: [{name: 'Student', extensions: ['gms']}]})
        
        if (files) {
            files.forEach(file => {
                fs.readFile(file, 'utf8', (err, data) => {
                    if (err) throw err
                    
                    let name = data.substr(0, data.indexOf("\n")).replace("\r", "")
    
                    parse(data.substr(data.indexOf("\n")+1), {delimiter: ';'}, (err, output) => {
                        if (err) throw err

                        var parsed = output.map(e => {return parseInt(e[0].substring(1))})
                        
                        if (!(parsed instanceof Array) || parsed.length == 0) {
                            error(file)
                            return
                        }
                        
                        this.pupils.fromFile(name, parsed, file)
                        this.save('pupils', this.pupils)
                        
                        if (files.length > 1) {
                            null
                        } else if (this.pupils.has(name)) {
                            callback(name, 'append')
                        } else {
                            callback(name, 'create')
                        }
                    })
                })
            })
            if (files.length > 1)
                callback(null, 'multiple')
        }
    }

    save(target, data) {
        storage.set(target, data, function (err) {
            if (err) throw err
        })
    }

}

module.exports = db

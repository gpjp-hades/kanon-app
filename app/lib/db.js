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
            }

            if (data.pupils instanceof Array) {
                this.pupils.fromJSON(data.pupils)
            }

            if (data.used instanceof Object) {
                this.used.fromJSON(data.used)
            }
            window.dispatchEvent(new Event('db-ready'))
        })
    }

    loadKanon(callback) {
        let file = dialog.showOpenDialog({properties: ['openFile'], filters: [{name: 'Kánon', extensions: ['csv']}]})

        if (file) {
            fs.readFile(file[0], 'utf8', (err, data) => {
                if (err) {
                    callback(err)
                    return
                }

                parse(data, {delimiter: ';'}, (err, output) => {
                    if (err) {
                        callback(err)
                        return
                    }

                    this.kanon.fromFile(output)

                    this.save('kanon', this.kanon)
                    callback(void(0), this.kanon)
                })
            })
        }
    }

    loadPupil(callback) {
        let files = dialog.showOpenDialog({properties: ['openFile', 'multiSelections'], filters: [{name: 'Student', extensions: ['gms']}]})
        
        if (files) {
            files.forEach(file => {
                fs.readFile(file, 'utf8', (err, data) => {
                    if (err) {
                        callback(err)
                        return
                    }
                    
                    let name = data.substr(0, data.indexOf("\n")).replace("\r", "")
    
                    parse(data.substr(data.indexOf("\n")+1), {delimiter: ';'}, (err, output) => {
                        if (err) {
                            callback(err)
                            return
                        }

                        var parsed = output.map(e => {return parseInt(e[0].substring(1))})
                        
                        if (!(parsed instanceof Array) || parsed.length == 0) {
                            callback(void(0), {action: 'format', name: file})
                            return
                        }
                        
                        this.pupils.fromFile(name, parsed, file)
                        this.save('pupils', this.pupils)
                        
                        if (files.length > 1) {
                            null
                        } else if (this.pupils.has(name)) {
                            callback(void(0), {action: 'append', name: name})
                        } else {
                            callback(void(0), {action: 'create', name: name})
                        }
                    })
                })
            })
            if (files.length > 1)
                callback(void(0), {action: 'multiple'})
        }
    }

    save(target, data) {
        storage.set(target, data, function (err) {
            if (err) throw err
        })
    }

}

module.exports = db

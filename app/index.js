window.$ = window.jQuery = require('jquery')
require('bootstrap')
const fs = require('fs')
const parse = require('csv-parse')
const {dialog, shell} = require('electron').remote
const { ipcRenderer } = require('electron')
const BrowserWindow = require('electron').remote.getCurrentWindow()
const storage = require('electron-json-storage')
const Mousetrap = require('mousetrap')
const {kanon, pupils, used} = require('./lib')
const Crypto = require('crypto-js')

main = new class {

    constructor() {

        this.userMode = false
        this.changer
        this.books
        this.name
        this.kanon = new kanon()
        this.pupils = new pupils(this.kanon)
        this.used = new used(this.kanon)
        this.gotBook = false
        this.shouldClose = false
        this.mode = ipcRenderer.sendSync('process-type')

        /*window.addEventListener('beforeunload', (e) => {
            if (!this.shouldClose) {
                if (!this.userMode)
                    $("#close-modal").modal("show")
                
                e.returnValue = false
            }
        })*/

        window.addEventListener('load', (e) => {
            if (this.mode == 'server') {
                $('#processtype').html(' (Server)')
                $('.server-overlay').css('display', 'block')
                $('#server-ips').html(Object.values(this.getLocalIPs()).join('<br />'))
            } else if (this.mode == 'client') {
                $('#processtype').html(' (Klient)')
                $('.client-overlay').css('display', 'block')
            }
        })

        storage.getMany(['kanon', 'pupils', 'used'], (err, data) => {
            if (err) throw err
            
            if (data.kanon instanceof Array) {
                this.kanon.fromJSON(data.kanon)
                this.showBooks()
            }

            if (data.pupils instanceof Array) {
                this.pupils.fromJSON(data.pupils)
                this.showPupils()
            }

            if (data.used instanceof Object) {
                this.used.fromJSON(data.used)
                this.showUsed()
            }
        })

        Mousetrap.bind(['command+shift+k', 'ctrl+shift+k'], _ => {
            this.endUserMode()
        })

        let clientCount = 0

        if (this.mode == 'server') {
            let net = require('net')

            this.server = net.createServer(socket => {
                if (clientCount >= 1) {
                    socket.write('TM')
                    socket.destroy()
                }
                clientCount = 1

                socket.write('KP');
                
                socket.setEncoding("utf8")
                socket.on('data', data => {
                    console.log(data)
                    switch (data.toString().substr(0, 2)) {
                        case 'SC':
                            let message = data.toString().substr(2)
                            if (message.length != 32) {
                                clientCount = 0
                                socket.destroy()
                                return
                            }
                            socket.write('SR' + Crypto.MD5(message).toString())

                            break;
                        case 'RN':
                            $('.server-overlay').removeAttr('style')

                            break;
                        default:
                            socket.destroy()
                            clientCount = 0
                            break;
                    }
                })

                socket.on('error', e => {
                    clientCount = 0
                    console.log('socket error', e)
                })

                socket.on('close', () => {
                    clientCount = 0
                })
            })

            this.server.listen(46200, '127.0.0.1')
        }
    }

    createClient() {

        $('#client-connect-error').html('')
        let ip = $('#client-ip').val()
        if (!this.validateIP(ip)) {
            $('#client-connect-error').html('Chybný formát IP adresy')
            return
        }

        if (typeof this.client == 'object' && !this.client.destroyed)
            return
        
        let net = require('net');
        this.client = new net.Socket();

        this.client.connect(46200, ip, () => {
            this.client.setEncoding("utf8")
        })

        let secret = Crypto.MD5(Math.random().toString(36).replace(/[^a-z]+/g, '')).toString()
        let state = 0;

        this.client.on('data', data => {
            console.log(data)
            switch (data.toString().substr(0, 2)) {
                case 'TM':
                    if (state != 0) return
                    
                    $('#client-connect-error').html('K serveru je připojen jiný klient')
                    this.client.destroy()
                    
                    break;
                case 'KP':
                    if (state != 0) {
                        $('#client-connect-error').html('Chyba serveru')
                        this.client.destroy()
                        return
                    }
                    $('#client-connect-error').html('Spojení navázáno')

                    this.client.write('SC' + secret)

                    state = 1;

                    break;
                case 'SR':
                    let message = data.toString().substr(2)
                    if (
                        state != 1 ||
                        message.length != 32 ||
                        message != Crypto.MD5(secret).toString()
                    ) {
                        $('#client-connect-error').html('Chyba serveru')
                        this.client.destroy()
                        return
                    }

                    $('.client-overlay').removeAttr('style')

                    this.client.write('RN')
                    this.client.setTimeout(0);

                    state = 2;
                    break;

            }
        })

        /*this.client.on('close', function() {
            this.client.destroy()
        })*/

        this.client.on('error', e => {
            switch (e.code) {
                case 'ECONNREFUSED':
                    $('#client-connect-error').html('Server odmítl připojení')
                    break;
                default:
                    console.log(e)
            }
        })

        this.client.setTimeout(3000, () => {
            $('#client-connect-error').html('Server neodpověděl')
        })
    }

    validateIP(ipaddress) {  
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
          return true
        } 
        return false
    }

    getLocalIPs() {
        let os = require('os');
        let ifaces = os.networkInterfaces();
        
        let ips = []
        
        Object.keys(ifaces).forEach(ifname => {
            var alias = 0

            ifaces[ifname].forEach(iface => {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    return;
                }

                if (alias >= 1) {
                    ips[ifname + ':' + alias] = iface.address
                } else {
                    ips[ifname] = iface.address
                }
                ++alias
            })
        })
        return ips
    }

    link(href) {
        shell.openExternal(href)
    }

    close() {
        this.shouldClose = true
        BrowserWindow.close()
    }

    mini() {
        BrowserWindow.minimize()
    }

    numberChanger() {
        $('#number').html(Math.floor(Math.random()*main.kanon.length)+1)
    }

    getBook() {
        if (!this.gotBook) {
            clearInterval(this.changer)

            Mousetrap.unbind('enter')

            this.gotBook = true

            $('.dice').animate({opacity: 0, width: 0}, 800)

            let book = this.used.getBook(this.pupil)
            
            this.save('used', this.used)
            if (book) {
                $('#book').html(book.toHTML())
                $('#number').html(parseInt(book.id))
            } else {
                $('#book').html("<span>Všechny knihy již byly vylosovány</span>")
                $('#number').html("")
            }

            $('#book').delay(1000).animate({opacity: 1}, 800)

            $('#help').delay(20 * 1000).animate({opacity: 0.7}, 3000)
        }
    }

    endUserMode() {
        if (this.userMode) {
            this.userMode = false
            this.gotBook = false

            Mousetrap.unbind('enter')

            this.showUsed()

            $('#book').removeAttr('style')
            $('.dice').removeAttr('style')
            $('#help').stop().removeAttr('style')

            $(".normalMode").css("display", "initial")
            $(".userMode").css("display", "none")

            clearInterval(this.changer)
        }
    }

    startUserMode() {
        if (!this.userMode) {
            name = $('#pupils').val()
            if (this.pupils.has(name)) {

                Mousetrap.bind('enter', _ => {
                    this.getBook()
                })

                this.pupil = this.pupils.get(name)

                this.userMode = true

                $('.dice').removeAttr('style').stop()
                $('#book').html('').removeAttr('style').stop()
                $("#pupilName").html(this.pupil.name)
                $(".normalMode").css("display", "none")
                $(".userMode").css("display", "initial")
                $('#help').stop().clearQueue().removeAttr('style')

                this.changer = setInterval(this.numberChanger, 200)
            } else {
                this.status("Student " + name + " nenalezen")
            }
        }
    }

    status(message) {
        $('#status').parent().removeAttr('style')
        $('#status').html(message)
        $("#status").parent().fadeTo(2000, 500).slideUp(500)
    }

    validate() {
        if ($('#pupils').val()) {
            $("#continue-modal").modal()
        } else {
            this.status('Zvolte studenta')
            return false
        }
    }

    showUsed() {
        $("#used").html(this.used.toHTML())

        $("#used option").dblclick((e) => {

            let index = e.target.getAttribute('value')
            $("#change-modal .modal-title").html("Chcete knihu odebrat z vyřazených?")
            $("#bookChange").html(this.kanon.books[index].toString() + " bude znovu zařazena do losování.")
            $("#bookChangeContinue").click(_ => {
                this.used.removeBook(index)
                this.save('used', this.used)
                this.showUsed()
                $("#change-modal").modal("hide")
                $("#bookChangeContinue").off("click")
            })
            $("#change-modal").modal("show")
        })
    }

    showBooks() {

        $('#loadKanon').html('Aktualizovat kánon')
        $('#loadPupil').removeAttr('class')
        $('#books').html(this.kanon.toHTML())

        $("#books option").dblclick((e) => {
            let index = e.target.getAttribute('value')
            $("#change-modal .modal-title").html("Chcete knihu vyřadit?")
            $("#bookChange").html(this.kanon.books[index].toString() + " bude přidána mezi vyřazené knihy")
            $("#bookChangeContinue").click(_ => {
                this.used.addBook(index)
                this.save('used', this.used)
                this.showUsed()
                $("#change-modal").modal("hide")
                $("#bookChangeContinue").off("click")
            })
            $("#change-modal").modal("show")
        })

    }

    showPupils() {
        $('#pupils').html('<option selected disabled>Zvolte studenta</option>')
        this.pupils.toArray().sort((a, b) => (
            a.class > b.class
        )).forEach(pupil => {
            if (!$('#pupils').has('optgroup.' + (pupil.class?pupil.class:"noclass")).length) {
                $('#pupils').append($('<optgroup>', {
                    class: (pupil.class?pupil.class:"noclass"),
                    label: {
                        "a": "Oktáva A",
                        "b": "Oktáva B",
                        "c": "4. C",
                        "noclass": "Neznámá třída"
                    }[pupil.class?pupil.class:"noclass"]
                }))
            }
            $('optgroup.' + (pupil.class?pupil.class:"noclass")).append($('<option>', {
                value: pupil.name,
                text: pupil.name
            }))
        })
    }

    save(target, data) {
        storage.set(target, data, function (err) {
            if (err) throw err
        })
    }

    loadKanon() {
        let file = dialog.showOpenDialog({properties: ['openFile'], filters: [{name: 'Kánon', extensions: ['csv']}]})

        if (file) {
            fs.readFile(file[0], 'utf8', (err, data) => {
                if (err) throw err

                parse(data, {delimiter: ';'}, (err, output) => {
                    if (err) throw err

                    this.kanon.fromFile(output)

                    this.save('kanon', this.kanon)
                    this.status('Načteno ' + this.kanon.length + ' knih')
                    this.showBooks()
                })
            })
        }
    }

    loadPupil() {
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
                            this.status('Soubor ' + file + ' nerozpoznán')
                        } else if (files.length > 1) {
                            null
                        } else if (this.pupils.has(name)) {
                            this.status('Kánon studenta <b>' + name + '</b> byl aktualizován')
                        } else {
                            this.status('Student <b>' + name + '</b> byl přidán')
                        }

                        this.pupils.fromFile(name, parsed, file)

                        this.save('pupils', this.pupils)
                        this.showPupils()
                    })
                })
            })
            if (files.length > 1)
                this.status('Studenti byli přidáni')
        }
    }
}

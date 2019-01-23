
class controller {
    constructor(c, args) {
        this.container = c
        this.args = args
    }

    status(message) {
        if (!$('#status'))
            return false
        
        $("#status").parent().stop()
        $('#status').parent().removeAttr('style')
        $('#status').html(message)
        $("#status").parent().fadeTo(2000, 500).slideUp(500)
    }

    warn(message) {
        if ($('#logger'))
            $('#logger').html(message)

        console.log(message)
    }

    invoke() {
        null
    }
}

module.exports = controller

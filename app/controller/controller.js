
class controller {
    constructor(c, args) {
        this.container = c
        this.args = args
    }

    status(message) {
        if (!$('#status'))
            return false
        $('#status').parent().removeAttr('style')
        $('#status').html(message)
        $("#status").parent().fadeTo(2000, 500).slideUp(500)
    }

    invoke() {
        null
    }
}

module.exports = controller

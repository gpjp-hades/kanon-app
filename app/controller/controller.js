
class controller {
    constructor(c) {
        this.container = c
    }

    status(message) {
        if (!$('#status'))
            return false
        $('#status').parent().removeAttr('style')
        $('#status').html(message)
        $("#status").parent().fadeTo(2000, 500).slideUp(500)
    }
}

module.exports = controller

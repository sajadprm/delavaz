class Result {

    static object(success, value) {
        if (success === false) {
            return { success: success, error: value, data: [] };
        } else if (success === true) {
            return { success: success, error: [], data: value }
        }
    }
}

module.exports = Result;
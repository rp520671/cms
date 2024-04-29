module.exports = {

    selectOption : function (status, options) {

        return options.fn(this).replace(new RegExp('value=\"'+status+'\"'), '$&selected="selected"');
    },

    isEmpty: function (obj) {
        // Check if obj is not null and is an object
        if (typeof obj === 'object' && obj !== null) {
            // Use Object.keys to get the keys of the object
            const keys = Object.keys(obj);
            // Iterate over the keys and check for existence of properties
            for (let key of keys) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    return false; // If at least one property is found, return false
                }
            }
            // If no properties are found, return true
            return true;
        } else {
            // If obj is not an object or is null, it is considered empty
            return true;
        }
    },



    isUserAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        }
        else {
            res.redirect('/login');
        }
    }



};

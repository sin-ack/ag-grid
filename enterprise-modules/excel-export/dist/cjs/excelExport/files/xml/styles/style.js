"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var style = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties, id = _a.id, name = _a.name;
        return {
            name: 'Style',
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            ID: id,
                            Name: name ? name : id
                        }
                    }]
            }
        };
    }
};
exports.default = style;
//# sourceMappingURL=style.js.map
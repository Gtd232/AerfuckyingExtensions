
class Scratch3StringExtBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'stringExt',
            name: 'String Extension',
            blockIconURI: blockIconURI,
            menuIconURI: menuIconURI,
            blocks: [{
                    opcode: 'charCodeAt',
                    blockType: BlockType.REPORTER,
                    text: '[STRING]的第[INDEX]个字符的编码',
                    arguments: {
                        STRING: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello'
                        },
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'fromCharCode',
                    blockType: BlockType.REPORTER,
                    text: '编码[CODE]对应的字符',
                    arguments: {
                        CODE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 97
                        }
                    }
                },
                {
                    opcode: 'serializeToJson',
                    blockType: BlockType.REPORTER,
                    text: '将[PREFIX]开头的变量转换为JSON',
                    arguments: {
                        PREFIX: {
                            type: ArgumentType.STRING,
                            defaultValue: '.'
                        }
                    }
                },
                {
                    opcode: 'deserializeFromJson',
                    blockType: BlockType.COMMAND,
                    text: '将[PREFIX]开头的变量设为JSON[JSON]',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{}'
                        },
                        PREFIX: {
                            type: ArgumentType.STRING,
                            defaultValue: '.'
                        }
                    }
                },
                {
                    opcode: 'postJson',
                    blockType: BlockType.COMMAND,
                    text: '发送JSON[JSON]到[URL]',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"action":"save","userId":1,readOnly:1,"key":"",value:[]}'
                        },
                        URL: {
                            type: ArgumentType.STRING,
                            menu: 'urlNames',
                            defaultValue: 'cloudSpace'
                        }
                    }
                },
                {
                    opcode: 'postResponse',
                    blockType: BlockType.REPORTER,
                    text: '发送JSON应答'
                }
            ],
            menus: {
                urlNames: {
                    acceptReporters: true,
                    items: [{
                        text: '云空间',
                        value: 'cloudSpace'
                    }]
                },
            }
        };
    }

    charCodeAt(args, util) {
        var str = args.STRING;
        var idx = args.INDEX;
        if (idx < 1 || idx > str.length) return NaN;
        return str.charCodeAt(idx - 1);
    };

    fromCharCode(args, util) {
        var code = args.CODE;
        return String.fromCharCode(code);
    };

    serializeToJson(args, util) {
        var extUtils = this.runtime.extUtils;
        extUtils.Alerter.info("serializeToJson即将废弃，改由js扩展中的相应指令替换。");
        var prefix = Cast.toString(args.PREFIX).trim();
        var jsonObj = {};
        var variables = util.target.variables;
        for (var varId in variables) {
            var variable = variables[varId];
            if (variable.type == Variable.SCALAR_TYPE || variable.type == Variable.LIST_TYPE) {
                if (variable.name.indexOf(prefix) == 0) {
                    jsonObj[variable.name.substr(prefix.length)] = variable.value;
                }
            }
        }
        return JSON.stringify(jsonObj);
    };

    deserializeFromJson(args, util) {
        var extUtils = this.runtime.extUtils;
        extUtils.Alerter.info("deserializeFromJson即将废弃，改由js扩展中的相应指令替换。");
        var prefix = Cast.toString(args.PREFIX).trim();
        var jsonStr = args.JSON;
        var jsonObj = null;
        try {
            jsonObj = JSON.parse(jsonStr);
        } catch (e) {}
        if (!jsonObj) return;
        var variables = util.target.variables;
        for (var varId in variables) {
            var variable = variables[varId];
            var varValue = null;
            if (variable.name.indexOf(prefix) == 0) {
                varValue = jsonObj[variable.name.substr(prefix.length)];
            }
            if (varValue == undefined) continue;
            if (variable.type == Variable.LIST_TYPE && Array.isArray(varValue)) {
                for (var i = 0; i < varValue.length; i++) {
                    if (varValue[i] == null) varValue[i] = '';
                }
                variable.value = varValue;
            } else if (variable.type == Variable.SCALAR_TYPE) {
                variable.value = String(varValue);
            }
        }
    };

    postJson(args, util) {
        var extUtils = this.runtime.extUtils;
        if (extUtils.detectAbnormalAction('POST_JSON')) return;
        extUtils.Alerter.info("postJson即将废弃，改由js扩展中的相应指令替换。");

        var jsonStr = Cast.toString(args.JSON);
        var url = Cast.toString(args.URL).trim();
        var urlMap = {
            cloudSpace: '/WebApi/Projects/CloudSpace'
        };
        url = urlMap[url];
        if (!url) {
            this._postResponse = {
                error: "invalid url"
            };
            return;
        }
        var postData = {};
        try {
            postData = JSON.parse(jsonStr);
        } catch (e) {
            this._postResponse = {
                error: "invalid json"
            };
            return;
        }
        return new Promise(resolve => {
            extUtils.ajax({
                url: url,
                loadingStyle: "none",
                hashStr: '',
                data: postData,
                type: "POST"
            }).done(r => {
                this._postResponse = r;
                resolve();
            }).error(r => {
                this._postResponse = {
                    error: "unexpected error"
                };
                resolve();
            });
        });
    }

    postResponse(args, util) {
        var extUtils = this.runtime.extUtils;
        extUtils.Alerter.info("postResponse即将废弃，改由js扩展中的相应指令替换。")
        return JSON.stringify(this._postResponse);
    };
}

module.exports = Scratch3StringExtBlocks;

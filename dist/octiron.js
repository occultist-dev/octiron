var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// node_modules/.pnpm/uri-templates@0.2.0/node_modules/uri-templates/uri-templates.js
var require_uri_templates = __commonJS({
  "node_modules/.pnpm/uri-templates@0.2.0/node_modules/uri-templates/uri-templates.js"(exports, module) {
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define("uri-templates", [], factory);
      } else if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
      } else {
        global.UriTemplate = factory();
      }
    })(exports, function() {
      var uriTemplateGlobalModifiers = {
        "+": true,
        "#": true,
        ".": true,
        "/": true,
        ";": true,
        "?": true,
        "&": true
      };
      var uriTemplateSuffices = {
        "*": true
      };
      var urlEscapedChars = /[:/&?#]/;
      function notReallyPercentEncode(string) {
        return encodeURI(string).replace(/%25[0-9][0-9]/g, function(doubleEncoded) {
          return "%" + doubleEncoded.substring(3);
        });
      }
      function isPercentEncoded(string) {
        string = string.replace(/%../g, "");
        return encodeURIComponent(string) === string;
      }
      function uriTemplateSubstitution(spec) {
        var modifier = "";
        if (uriTemplateGlobalModifiers[spec.charAt(0)]) {
          modifier = spec.charAt(0);
          spec = spec.substring(1);
        }
        var separator = "";
        var prefix = "";
        var shouldEscape = true;
        var showVariables = false;
        var trimEmptyString = false;
        if (modifier == "+") {
          shouldEscape = false;
        } else if (modifier == ".") {
          prefix = ".";
          separator = ".";
        } else if (modifier == "/") {
          prefix = "/";
          separator = "/";
        } else if (modifier == "#") {
          prefix = "#";
          shouldEscape = false;
        } else if (modifier == ";") {
          prefix = ";";
          separator = ";", showVariables = true;
          trimEmptyString = true;
        } else if (modifier == "?") {
          prefix = "?";
          separator = "&", showVariables = true;
        } else if (modifier == "&") {
          prefix = "&";
          separator = "&", showVariables = true;
        }
        var varNames = [];
        var varList = spec.split(",");
        var varSpecs = [];
        var varSpecMap = {};
        for (var i = 0; i < varList.length; i++) {
          var varName = varList[i];
          var truncate = null;
          if (varName.indexOf(":") != -1) {
            var parts = varName.split(":");
            varName = parts[0];
            truncate = parseInt(parts[1]);
          }
          var suffices = {};
          while (uriTemplateSuffices[varName.charAt(varName.length - 1)]) {
            suffices[varName.charAt(varName.length - 1)] = true;
            varName = varName.substring(0, varName.length - 1);
          }
          var varSpec = {
            truncate,
            name: varName,
            suffices
          };
          varSpecs.push(varSpec);
          varSpecMap[varName] = varSpec;
          varNames.push(varName);
        }
        var subFunction = function(valueFunction) {
          var result = "";
          var startIndex = 0;
          for (var i2 = 0; i2 < varSpecs.length; i2++) {
            var varSpec2 = varSpecs[i2];
            var value = valueFunction(varSpec2.name);
            if (value == null || Array.isArray(value) && value.length == 0 || typeof value == "object" && Object.keys(value).length == 0) {
              startIndex++;
              continue;
            }
            if (i2 == startIndex) {
              result += prefix;
            } else {
              result += separator || ",";
            }
            if (Array.isArray(value)) {
              if (showVariables) {
                result += varSpec2.name + "=";
              }
              for (var j = 0; j < value.length; j++) {
                if (j > 0) {
                  result += varSpec2.suffices["*"] ? separator || "," : ",";
                  if (varSpec2.suffices["*"] && showVariables) {
                    result += varSpec2.name + "=";
                  }
                }
                result += shouldEscape ? encodeURIComponent(value[j]).replace(/!/g, "%21") : notReallyPercentEncode(value[j]);
              }
            } else if (typeof value == "object") {
              if (showVariables && !varSpec2.suffices["*"]) {
                result += varSpec2.name + "=";
              }
              var first = true;
              for (var key in value) {
                if (!first) {
                  result += varSpec2.suffices["*"] ? separator || "," : ",";
                }
                first = false;
                result += shouldEscape ? encodeURIComponent(key).replace(/!/g, "%21") : notReallyPercentEncode(key);
                result += varSpec2.suffices["*"] ? "=" : ",";
                result += shouldEscape ? encodeURIComponent(value[key]).replace(/!/g, "%21") : notReallyPercentEncode(value[key]);
              }
            } else {
              if (showVariables) {
                result += varSpec2.name;
                if (!trimEmptyString || value != "") {
                  result += "=";
                }
              }
              if (varSpec2.truncate != null) {
                value = value.substring(0, varSpec2.truncate);
              }
              result += shouldEscape ? encodeURIComponent(value).replace(/!/g, "%21") : notReallyPercentEncode(value);
            }
          }
          return result;
        };
        var guessFunction = function(stringValue, resultObj, strict) {
          if (prefix) {
            stringValue = stringValue.substring(prefix.length);
          }
          if (varSpecs.length == 1 && varSpecs[0].suffices["*"]) {
            var varSpec2 = varSpecs[0];
            var varName2 = varSpec2.name;
            var arrayValue = varSpec2.suffices["*"] ? stringValue.split(separator || ",") : [stringValue];
            var hasEquals = shouldEscape && stringValue.indexOf("=") != -1;
            for (var i2 = 1; i2 < arrayValue.length; i2++) {
              var stringValue = arrayValue[i2];
              if (hasEquals && stringValue.indexOf("=") == -1) {
                arrayValue[i2 - 1] += (separator || ",") + stringValue;
                arrayValue.splice(i2, 1);
                i2--;
              }
            }
            for (var i2 = 0; i2 < arrayValue.length; i2++) {
              var stringValue = arrayValue[i2];
              if (shouldEscape && stringValue.indexOf("=") != -1) {
                hasEquals = true;
              }
              var innerArrayValue = stringValue.split(",");
              if (innerArrayValue.length == 1) {
                arrayValue[i2] = innerArrayValue[0];
              } else {
                arrayValue[i2] = innerArrayValue;
              }
            }
            if (showVariables || hasEquals) {
              var objectValue = resultObj[varName2] || {};
              for (var j = 0; j < arrayValue.length; j++) {
                var innerValue = stringValue;
                if (showVariables && !innerValue) {
                  continue;
                }
                if (typeof arrayValue[j] == "string") {
                  var stringValue = arrayValue[j];
                  var innerVarName = stringValue.split("=", 1)[0];
                  var stringValue = stringValue.substring(innerVarName.length + 1);
                  if (shouldEscape) {
                    if (strict && !isPercentEncoded(stringValue)) {
                      return;
                    }
                    stringValue = decodeURIComponent(stringValue);
                  }
                  innerValue = stringValue;
                } else {
                  var stringValue = arrayValue[j][0];
                  var innerVarName = stringValue.split("=", 1)[0];
                  var stringValue = stringValue.substring(innerVarName.length + 1);
                  if (shouldEscape) {
                    if (strict && !isPercentEncoded(stringValue)) {
                      return;
                    }
                    stringValue = decodeURIComponent(stringValue);
                  }
                  arrayValue[j][0] = stringValue;
                  innerValue = arrayValue[j];
                }
                if (shouldEscape) {
                  if (strict && !isPercentEncoded(innerVarName)) {
                    return;
                  }
                  innerVarName = decodeURIComponent(innerVarName);
                }
                if (objectValue[innerVarName] !== void 0) {
                  if (Array.isArray(objectValue[innerVarName])) {
                    objectValue[innerVarName].push(innerValue);
                  } else {
                    objectValue[innerVarName] = [objectValue[innerVarName], innerValue];
                  }
                } else {
                  objectValue[innerVarName] = innerValue;
                }
              }
              if (Object.keys(objectValue).length == 1 && objectValue[varName2] !== void 0) {
                resultObj[varName2] = objectValue[varName2];
              } else {
                resultObj[varName2] = objectValue;
              }
            } else {
              if (shouldEscape) {
                for (var j = 0; j < arrayValue.length; j++) {
                  var innerArrayValue = arrayValue[j];
                  if (Array.isArray(innerArrayValue)) {
                    for (var k = 0; k < innerArrayValue.length; k++) {
                      if (strict && !isPercentEncoded(innerArrayValue[k])) {
                        return;
                      }
                      innerArrayValue[k] = decodeURIComponent(innerArrayValue[k]);
                    }
                  } else {
                    if (strict && !isPercentEncoded(innerArrayValue)) {
                      return;
                    }
                    arrayValue[j] = decodeURIComponent(innerArrayValue);
                  }
                }
              }
              if (resultObj[varName2] !== void 0) {
                if (Array.isArray(resultObj[varName2])) {
                  resultObj[varName2] = resultObj[varName2].concat(arrayValue);
                } else {
                  resultObj[varName2] = [resultObj[varName2]].concat(arrayValue);
                }
              } else {
                if (arrayValue.length == 1 && !varSpec2.suffices["*"]) {
                  resultObj[varName2] = arrayValue[0];
                } else {
                  resultObj[varName2] = arrayValue;
                }
              }
            }
          } else {
            var arrayValue = varSpecs.length == 1 ? [stringValue] : stringValue.split(separator || ",");
            var specIndexMap = {};
            for (var i2 = 0; i2 < arrayValue.length; i2++) {
              var firstStarred = 0;
              for (; firstStarred < varSpecs.length - 1 && firstStarred < i2; firstStarred++) {
                if (varSpecs[firstStarred].suffices["*"]) {
                  break;
                }
              }
              if (firstStarred == i2) {
                specIndexMap[i2] = i2;
                continue;
              } else {
                for (var lastStarred = varSpecs.length - 1; lastStarred > 0 && varSpecs.length - lastStarred < arrayValue.length - i2; lastStarred--) {
                  if (varSpecs[lastStarred].suffices["*"]) {
                    break;
                  }
                }
                if (varSpecs.length - lastStarred == arrayValue.length - i2) {
                  specIndexMap[i2] = lastStarred;
                  continue;
                }
              }
              specIndexMap[i2] = firstStarred;
            }
            for (var i2 = 0; i2 < arrayValue.length; i2++) {
              var stringValue = arrayValue[i2];
              if (!stringValue && showVariables) {
                continue;
              }
              var innerArrayValue = stringValue.split(",");
              var hasEquals = false;
              if (showVariables) {
                var stringValue = innerArrayValue[0];
                var varName2 = stringValue.split("=", 1)[0];
                var stringValue = stringValue.substring(varName2.length + 1);
                innerArrayValue[0] = stringValue;
                var varSpec2 = varSpecMap[varName2] || varSpecs[0];
              } else {
                var varSpec2 = varSpecs[specIndexMap[i2]];
                var varName2 = varSpec2.name;
              }
              for (var j = 0; j < innerArrayValue.length; j++) {
                if (shouldEscape) {
                  if (strict && !isPercentEncoded(innerArrayValue[j])) {
                    return;
                  }
                  innerArrayValue[j] = decodeURIComponent(innerArrayValue[j]);
                }
              }
              if ((showVariables || varSpec2.suffices["*"]) && resultObj[varName2] !== void 0) {
                if (Array.isArray(resultObj[varName2])) {
                  resultObj[varName2] = resultObj[varName2].concat(innerArrayValue);
                } else {
                  resultObj[varName2] = [resultObj[varName2]].concat(innerArrayValue);
                }
              } else {
                if (innerArrayValue.length == 1 && !varSpec2.suffices["*"]) {
                  resultObj[varName2] = innerArrayValue[0];
                } else {
                  resultObj[varName2] = innerArrayValue;
                }
              }
            }
          }
          return 1;
        };
        return {
          varNames,
          prefix,
          substitution: subFunction,
          unSubstitution: guessFunction
        };
      }
      function UriTemplate(template) {
        if (!(this instanceof UriTemplate)) {
          return new UriTemplate(template);
        }
        var parts = template.split("{");
        var textParts = [parts.shift()];
        var prefixes = [];
        var substitutions = [];
        var unSubstitutions = [];
        var varNames = [];
        while (parts.length > 0) {
          var part = parts.shift();
          var spec = part.split("}")[0];
          var remainder = part.substring(spec.length + 1);
          var funcs = uriTemplateSubstitution(spec);
          substitutions.push(funcs.substitution);
          unSubstitutions.push(funcs.unSubstitution);
          prefixes.push(funcs.prefix);
          textParts.push(remainder);
          varNames = varNames.concat(funcs.varNames);
        }
        this.fill = function(valueFunction) {
          if (valueFunction && typeof valueFunction !== "function") {
            var value = valueFunction;
            valueFunction = function(varName) {
              return value[varName];
            };
          }
          var result = textParts[0];
          for (var i = 0; i < substitutions.length; i++) {
            var substitution = substitutions[i];
            result += substitution(valueFunction);
            result += textParts[i + 1];
          }
          return result;
        };
        this.fromUri = function(substituted, options) {
          options = options || {};
          var result = {};
          for (var i = 0; i < textParts.length; i++) {
            var part2 = textParts[i];
            if (substituted.substring(0, part2.length) !== part2) {
              return;
            }
            substituted = substituted.substring(part2.length);
            if (i >= textParts.length - 1) {
              if (substituted == "") {
                break;
              } else {
                return;
              }
            }
            var prefix = prefixes[i];
            if (prefix && substituted.substring(0, prefix.length) !== prefix) {
              continue;
            }
            var nextPart = textParts[i + 1];
            var offset = i;
            while (true) {
              if (offset == textParts.length - 2) {
                var endPart = substituted.substring(substituted.length - nextPart.length);
                if (endPart !== nextPart) {
                  return;
                }
                var stringValue = substituted.substring(0, substituted.length - nextPart.length);
                substituted = endPart;
              } else if (nextPart) {
                var nextPartPos = substituted.indexOf(nextPart);
                var stringValue = substituted.substring(0, nextPartPos);
                substituted = substituted.substring(nextPartPos);
              } else if (prefixes[offset + 1]) {
                var nextPartPos = substituted.indexOf(prefixes[offset + 1]);
                if (nextPartPos === -1) nextPartPos = substituted.length;
                var stringValue = substituted.substring(0, nextPartPos);
                substituted = substituted.substring(nextPartPos);
              } else if (textParts.length > offset + 2) {
                offset++;
                nextPart = textParts[offset + 1];
                continue;
              } else {
                var stringValue = substituted;
                substituted = "";
              }
              break;
            }
            if (!unSubstitutions[i](stringValue, result, options.strict)) {
              return;
            }
          }
          return result;
        };
        this.varNames = varNames;
        this.template = template;
      }
      UriTemplate.prototype = {
        toString: function() {
          return this.template;
        },
        fillFromObject: function(obj) {
          return this.fill(obj);
        },
        test: function(uri, options) {
          return !!this.fromUri(uri, options);
        }
      };
      return UriTemplate;
    });
  }
});

// lib/factories/octironFactory.ts
import m7 from "mithril";

// lib/utils/isJSONObject.ts
function isJSONObject(value) {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}

// lib/utils/unravelArgs.ts
function unravelArgs(arg1, arg2, arg3) {
  let selector;
  let args = {};
  let view;
  if (typeof arg1 === "string") {
    selector = arg1;
  } else if (typeof arg1 === "function") {
    view = arg1;
  } else if (arg1 != null) {
    args = arg1;
  }
  if (typeof arg2 === "function") {
    view = arg2;
  } else if (arg2 != null) {
    args = arg2;
  }
  if (typeof arg3 === "function") {
    view = arg3;
  }
  if (typeof view === "undefined") {
    view = ((o) => o.default(args));
  }
  return [
    selector,
    args,
    view
  ];
}

// lib/renderers/SelectionRenderer.ts
import m2 from "mithril";

// lib/factories/selectionFactory.ts
function selectionFactory(args, parentArgs, rendererArgs) {
  const factoryArgs = Object.assign({}, args);
  const childArgs = {
    // value: parentArgs.value,
    value: rendererArgs.value
  };
  const self = octironFactory(
    "selection",
    factoryArgs,
    parentArgs,
    rendererArgs,
    childArgs
  );
  return self;
}

// lib/utils/mithrilRedraw.ts
import m from "mithril";

// lib/consts.ts
var isBrowserRender = typeof window !== "undefined";

// lib/utils/mithrilRedraw.ts
function mithrilRedraw() {
  if (isBrowserRender) {
    m.redraw();
  }
}

// lib/renderers/SelectionRenderer.ts
var preKey = Symbol.for("@pre");
var postKey = Symbol.for("@post");
function shouldReselect(next, prev) {
  return next.parentArgs.store !== prev.parentArgs.store || next.selector !== prev.selector || next.parentArgs.value !== prev.parentArgs.value;
}
var SelectionRenderer = (vnode) => {
  const key = Symbol(`SelectionRenderer`);
  let currentAttrs = vnode.attrs;
  let details;
  const instances = {};
  function createInstances() {
    let hasChanges = false;
    let initialDetails = details == null;
    const nextKeys = [];
    if (details == null) {
      const prevKeys2 = Reflect.ownKeys(instances);
      for (const key2 of prevKeys2) {
        if (!nextKeys.includes(key2)) {
          hasChanges = true;
          delete instances[key2];
        }
      }
      if (hasChanges) {
        mithrilRedraw();
      }
      return;
    }
    for (let index = 0; index < details.result.length; index++) {
      const selectionResult = details.result[index];
      const key2 = Symbol.for(selectionResult.pointer);
      nextKeys.push(key2);
      if (Object.hasOwn(instances, key2)) {
        const next = selectionResult;
        const prev = instances[key2].selectionResult;
        if (prev.type === "value" && next.type === "value" && next.value === prev.value) {
          continue;
        } else if (prev.type === "entity" && next.type === "entity" && next.ok === prev.ok && next.status === prev.status && next.value === prev.value) {
          continue;
        }
      }
      hasChanges = true;
      const rendererArgs = {
        index,
        value: selectionResult.value,
        propType: selectionResult.type === "entity" ? void 0 : selectionResult.propType
      };
      const octiron2 = selectionFactory(
        currentAttrs.args,
        currentAttrs.parentArgs,
        rendererArgs
      );
      instances[key2] = {
        octiron: octiron2,
        selectionResult
      };
    }
    const prevKeys = Reflect.ownKeys(instances);
    for (const key2 of prevKeys) {
      if (!nextKeys.includes(key2)) {
        hasChanges = true;
        delete instances[key2];
      }
    }
    if (!initialDetails && hasChanges) {
      mithrilRedraw();
    }
  }
  function fetchRequired(required, accept) {
    return __async(this, null, function* () {
      if (required.length === 0) {
        return;
      }
      const promises = [];
      for (const iri of required) {
        promises.push(currentAttrs.parentArgs.store.fetch(iri, accept));
      }
      yield Promise.allSettled(promises);
    });
  }
  function listener(next) {
    let required = [];
    if (typeof details === "undefined") {
      required = next.required;
    } else {
      for (const iri of next.required) {
        if (!details.required.includes(iri)) {
          required.push(iri);
        }
      }
    }
    details = next;
    if (required.length > 0) {
      fetchRequired(required, currentAttrs.args.accept);
    }
    createInstances();
  }
  function subscribe() {
    const { entity, selector, parentArgs: { value, store }, args: { accept, fragment } } = currentAttrs;
    if (!entity && !isJSONObject(value)) {
      store.unsubscribe(key);
      createInstances();
      return;
    }
    details = store.subscribe({
      key,
      selector,
      fragment,
      accept,
      value: entity ? void 0 : value,
      listener
    });
    fetchRequired(details.required, accept);
    createInstances();
  }
  return {
    oninit: ({ attrs }) => {
      currentAttrs = attrs;
      subscribe();
    },
    onbeforeupdate: ({ attrs }) => {
      const reselect = shouldReselect(attrs, currentAttrs);
      currentAttrs = attrs;
      if (reselect) {
        attrs.parentArgs.store.unsubscribe(key);
        subscribe();
      }
    },
    onbeforeremove: ({ attrs }) => {
      currentAttrs = attrs;
      attrs.parentArgs.store.unsubscribe(key);
    },
    view: ({ attrs }) => {
      if (details == null || !details.complete) {
        return attrs.args.loading;
      } else if ((details.hasErrors || details.hasMissing) && typeof attrs.args.fallback !== "function") {
        return attrs.args.fallback;
      } else if (details.result[0] != null && details.result[0].type === "alternative") {
        return details.result[0].integration.render(null, attrs.args.fragment);
      }
      const view = attrs.view;
      const {
        pre,
        sep,
        post,
        start,
        end,
        predicate,
        fallback
      } = currentAttrs.args;
      const children = [];
      let list = Reflect.ownKeys(instances).map(((key2) => {
        const instance = instances[key2];
        instance.octiron.position = -1;
        return instance;
      }));
      if (start != null || end != null) {
        list = list.slice(
          start != null ? start : 0,
          end
        );
      }
      if (predicate != null) {
        list = list.filter(({ octiron: octiron2 }) => predicate(octiron2));
      }
      if (pre != null) {
        children.push(m2.fragment({}, [pre]));
      }
      for (let index = 0; index < list.length; index++) {
        const { selectionResult, octiron: octiron2 } = list[index];
        octiron2.position = index + 1;
        if (index !== 0) {
          children.push(m2.fragment({}, [sep]));
        }
        if (selectionResult.type === "value") {
          children.push(m2.fragment({}, [view(octiron2)]));
        } else if (!selectionResult.ok && typeof fallback === "function") {
          children.push(
            m2.fragment({}, [fallback(octiron2, selectionResult.reason)])
          );
        } else if (!selectionResult.ok) {
          children.push(m2.fragment({}, [fallback]));
        } else {
          children.push(m2.fragment({}, [view(octiron2)]));
        }
      }
      if (post != null) {
        children.push(m2.fragment({}, [post]));
      }
      return children;
    }
  };
};

// lib/renderers/PresentRenderer.ts
import m3 from "mithril";

// lib/utils/getComponent.ts
function getComponent({
  style,
  propType,
  type,
  firstPickComponent,
  typeDefs,
  fallbackComponent
}) {
  var _a, _b, _c;
  if (firstPickComponent != null) {
    return firstPickComponent;
  }
  if (propType != null && ((_a = typeDefs[propType]) == null ? void 0 : _a[style]) != null) {
    return typeDefs[propType][style];
  }
  if (!Array.isArray(type) && type != null && ((_b = typeDefs[type]) == null ? void 0 : _b[style]) != null) {
    return typeDefs[type][style];
  }
  if (Array.isArray(type)) {
    for (const item of type) {
      if (((_c = typeDefs[item]) == null ? void 0 : _c[style]) != null) {
        return typeDefs[item][style];
      }
    }
  }
  if (fallbackComponent != null) {
    return fallbackComponent;
  }
}

// lib/utils/isTypedObject.ts
function isTypeObject(value) {
  if (!isJSONObject(value)) {
    return false;
  } else if (typeof value["@type"] === "string") {
    return true;
  } else if (!Array.isArray(value["@type"])) {
    return false;
  }
  for (const item of value["@type"]) {
    if (typeof item !== "string") {
      return false;
    }
  }
  return true;
}

// lib/utils/getValueType.ts
function getDataType(value) {
  if (isTypeObject(value)) {
    return value["@type"];
  }
}

// lib/utils/selectComponentFromArgs.ts
var selectComponentFromArgs = (style, parentArgs, rendererArgs, args, factoryArgs) => {
  var _a, _b, _c, _d;
  const attrs = Object.assign({}, (_a = args == null ? void 0 : args.attrs) != null ? _a : factoryArgs == null ? void 0 : factoryArgs.attrs);
  const firstPickComponent = (_b = args == null ? void 0 : args.component) != null ? _b : (args == null ? void 0 : args.component) !== null ? factoryArgs == null ? void 0 : factoryArgs.component : null;
  const fallbackComponent = (_c = args == null ? void 0 : args.fallbackComponent) != null ? _c : (args == null ? void 0 : args.component) !== null ? factoryArgs == null ? void 0 : factoryArgs.fallbackComponent : null;
  const component = getComponent({
    style,
    propType: rendererArgs == null ? void 0 : rendererArgs.propType,
    type: getDataType(rendererArgs.value),
    firstPickComponent,
    fallbackComponent,
    typeDefs: (_d = args == null ? void 0 : args.typeDefs) != null ? _d : parentArgs.typeDefs
  });
  return [attrs, component];
};

// lib/renderers/PresentRenderer.ts
var PresentRenderer = ({
  attrs: {
    args,
    factoryArgs,
    parentArgs,
    rendererArgs
  }
}) => {
  let [attrs, component] = selectComponentFromArgs(
    "present",
    parentArgs,
    rendererArgs,
    args,
    factoryArgs
  );
  return {
    //onbeforeupdate({ attrs: { args, factoryArgs, parentArgs, rendererArgs }}) {
    // [attrs, component] = selectComponentFromArgs(
    //   'present',
    //   parentArgs,
    //   rendererArgs,
    //   args,
    //   factoryArgs,
    // );
    //},
    view({ attrs: { o, rendererArgs: rendererArgs2 }, children }) {
      if (component == null) {
        return null;
      }
      return m3(component, {
        o,
        renderType: "present",
        value: rendererArgs2.value,
        attrs
      }, children);
    }
  };
};

// lib/utils/isIterable.ts
function isIterable(value) {
  if (Array.isArray(value)) {
    return true;
  } else if (isJSONObject(value)) {
    if (Array.isArray(value["@list"])) {
      return true;
    } else if (Array.isArray(value["@set"])) {
      return true;
    }
  }
  return false;
}

// lib/utils/getIterableValue.ts
function getIterableValue(value) {
  if (Array.isArray(value)) {
    return value;
  } else if (Array.isArray(value["@list"])) {
    return value["@list"];
  } else if (Array.isArray(value["@set"])) {
    return value["@set"];
  }
  return [];
}

// lib/factories/actionFactory.ts
import m6 from "mithril";

// node_modules/.pnpm/json-ptr@3.1.1/node_modules/json-ptr/dist/esm/index.js
function replace(source, find, repl) {
  let res = "";
  let rem = source;
  let beg = 0;
  let end = -1;
  while ((end = rem.indexOf(find)) > -1) {
    res += source.substring(beg, beg + end) + repl;
    rem = rem.substring(end + find.length, rem.length);
    beg += end + find.length;
  }
  if (rem.length > 0) {
    res += source.substring(source.length - rem.length, source.length);
  }
  return res;
}
function decodeFragmentSegments(segments) {
  let i = -1;
  const len = segments.length;
  const res = new Array(len);
  while (++i < len) {
    if (typeof segments[i] === "string") {
      res[i] = replace(replace(decodeURIComponent(segments[i]), "~1", "/"), "~0", "~");
    } else {
      res[i] = segments[i];
    }
  }
  return res;
}
function encodeFragmentSegments(segments) {
  let i = -1;
  const len = segments.length;
  const res = new Array(len);
  while (++i < len) {
    if (typeof segments[i] === "string") {
      res[i] = encodeURIComponent(replace(replace(segments[i], "~", "~0"), "/", "~1"));
    } else {
      res[i] = segments[i];
    }
  }
  return res;
}
function decodePointerSegments(segments) {
  let i = -1;
  const len = segments.length;
  const res = new Array(len);
  while (++i < len) {
    if (typeof segments[i] === "string") {
      res[i] = replace(replace(segments[i], "~1", "/"), "~0", "~");
    } else {
      res[i] = segments[i];
    }
  }
  return res;
}
function encodePointerSegments(segments) {
  let i = -1;
  const len = segments.length;
  const res = new Array(len);
  while (++i < len) {
    if (typeof segments[i] === "string") {
      res[i] = replace(replace(segments[i], "~", "~0"), "/", "~1");
    } else {
      res[i] = segments[i];
    }
  }
  return res;
}
function decodePointer(ptr) {
  if (typeof ptr !== "string") {
    throw new TypeError("Invalid type: JSON Pointers are represented as strings.");
  }
  if (ptr.length === 0) {
    return [];
  }
  if (ptr[0] !== "/") {
    throw new ReferenceError("Invalid JSON Pointer syntax. Non-empty pointer must begin with a solidus `/`.");
  }
  return decodePointerSegments(ptr.substring(1).split("/"));
}
function encodePointer(path) {
  if (!path || path && !Array.isArray(path)) {
    throw new TypeError("Invalid type: path must be an array of segments.");
  }
  if (path.length === 0) {
    return "";
  }
  return "/".concat(encodePointerSegments(path).join("/"));
}
function decodeUriFragmentIdentifier(ptr) {
  if (typeof ptr !== "string") {
    throw new TypeError("Invalid type: JSON Pointers are represented as strings.");
  }
  if (ptr.length === 0 || ptr[0] !== "#") {
    throw new ReferenceError("Invalid JSON Pointer syntax; URI fragment identifiers must begin with a hash.");
  }
  if (ptr.length === 1) {
    return [];
  }
  if (ptr[1] !== "/") {
    throw new ReferenceError("Invalid JSON Pointer syntax.");
  }
  return decodeFragmentSegments(ptr.substring(2).split("/"));
}
function encodeUriFragmentIdentifier(path) {
  if (!path || path && !Array.isArray(path)) {
    throw new TypeError("Invalid type: path must be an array of segments.");
  }
  if (path.length === 0) {
    return "#";
  }
  return "#/".concat(encodeFragmentSegments(path).join("/"));
}
var InvalidRelativePointerError = "Invalid Relative JSON Pointer syntax. Relative pointer must begin with a non-negative integer, followed by either the number sign (#), or a JSON Pointer.";
function decodeRelativePointer(ptr) {
  if (typeof ptr !== "string") {
    throw new TypeError("Invalid type: Relative JSON Pointers are represented as strings.");
  }
  if (ptr.length === 0) {
    throw new ReferenceError(InvalidRelativePointerError);
  }
  const segments = ptr.split("/");
  let first = segments[0];
  if (first[first.length - 1] == "#") {
    if (segments.length > 1) {
      throw new ReferenceError(InvalidRelativePointerError);
    }
    first = first.substr(0, first.length - 1);
  }
  let i = -1;
  const len = first.length;
  while (++i < len) {
    if (first[i] < "0" || first[i] > "9") {
      throw new ReferenceError(InvalidRelativePointerError);
    }
  }
  const path = decodePointerSegments(segments.slice(1));
  path.unshift(segments[0]);
  return path;
}
function toArrayIndexReference(arr, idx) {
  if (typeof idx === "number")
    return idx;
  const len = idx.length;
  if (!len)
    return -1;
  let cursor = 0;
  if (len === 1 && idx[0] === "-") {
    if (!Array.isArray(arr)) {
      return 0;
    }
    return arr.length;
  }
  while (++cursor < len) {
    if (idx[cursor] < "0" || idx[cursor] > "9") {
      return -1;
    }
  }
  return parseInt(idx, 10);
}
function compilePointerDereference(path) {
  let body = "if (typeof(it) !== 'undefined'";
  if (path.length === 0) {
    return (it) => it;
  }
  body = path.reduce((body2, _, i) => {
    return body2 + "\n	&& it !== null && typeof((it = it['" + replace(replace(path[i] + "", "\\", "\\\\"), "'", "\\'") + "'])) !== 'undefined'";
  }, "if (typeof(it) !== 'undefined'");
  body = body + ") {\n	return it;\n }";
  return new Function("it", body);
}
function setValueAtPath(target, val, path, force = false) {
  if (path.length === 0) {
    throw new Error("Cannot set the root object; assign it directly.");
  }
  if (typeof target === "undefined") {
    throw new TypeError("Cannot set values on undefined");
  }
  let it = target;
  const len = path.length;
  const end = path.length - 1;
  let step;
  let cursor = -1;
  let rem;
  let p;
  while (++cursor < len) {
    step = path[cursor];
    if (typeof step !== "string" && typeof step !== "number") {
      throw new TypeError("PathSegments must be a string or a number.");
    }
    if (
      // Reconsider this strategy. It disallows legitimate structures on
      // non - objects, or more precisely, on objects not derived from a class
      // or constructor function.
      step === "__proto__" || step === "constructor" || step === "prototype"
    ) {
      throw new Error("Attempted prototype pollution disallowed.");
    }
    if (Array.isArray(it)) {
      if (step === "-" && cursor === end) {
        it.push(val);
        return void 0;
      }
      p = toArrayIndexReference(it, step);
      if (it.length > p) {
        if (cursor === end) {
          rem = it[p];
          it[p] = val;
          break;
        }
        it = it[p];
      } else if (cursor === end && p === it.length) {
        if (force) {
          it.push(val);
          return void 0;
        }
      } else if (force) {
        it = it[p] = cursor === end ? val : {};
      }
    } else {
      if (typeof it[step] === "undefined") {
        if (force) {
          if (cursor === end) {
            it[step] = val;
            return void 0;
          }
          const n = Number(path[cursor + 1]);
          if (Number.isInteger(n) && toArrayIndexReference(it[step], n) !== -1) {
            it = it[step] = [];
            continue;
          }
          it = it[step] = {};
          continue;
        }
        return void 0;
      }
      if (cursor === end) {
        rem = it[step];
        it[step] = val;
        break;
      }
      it = it[step];
    }
  }
  return rem;
}
function unsetValueAtPath(target, path) {
  if (path.length === 0) {
    throw new Error("Cannot unset the root object; assign it directly.");
  }
  if (typeof target === "undefined") {
    throw new TypeError("Cannot unset values on undefined");
  }
  let it = target;
  const len = path.length;
  const end = path.length - 1;
  let step;
  let cursor = -1;
  let rem;
  let p;
  while (++cursor < len) {
    step = path[cursor];
    if (typeof step !== "string" && typeof step !== "number") {
      throw new TypeError("PathSegments must be a string or a number.");
    }
    if (step === "__proto__" || step === "constructor" || step === "prototype") {
      throw new Error("Attempted prototype pollution disallowed.");
    }
    if (Array.isArray(it)) {
      p = toArrayIndexReference(it, step);
      if (p >= it.length)
        return void 0;
      if (cursor === end) {
        rem = it[p];
        delete it[p];
        break;
      }
      it = it[p];
    } else {
      if (typeof it[step] === "undefined") {
        return void 0;
      }
      if (cursor === end) {
        rem = it[step];
        delete it[step];
        break;
      }
      it = it[step];
    }
  }
  return rem;
}
function looksLikeFragment(ptr) {
  return typeof ptr === "string" && ptr.length > 0 && ptr[0] === "#";
}
function pickDecoder(ptr) {
  return looksLikeFragment(ptr) ? decodeUriFragmentIdentifier : decodePointer;
}
function decodePtrInit(ptr) {
  return Array.isArray(ptr) ? ptr.slice(0) : pickDecoder(ptr)(ptr);
}
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function shouldDescend(obj) {
  return isObject(obj) && !JsonReference.isReference(obj);
}
function descendingVisit(target, visitor, encoder) {
  const distinctObjects = /* @__PURE__ */ new Map();
  const q = [{ obj: target, path: [] }];
  while (q.length) {
    const { obj, path } = q.shift();
    visitor(encoder(path), obj);
    if (shouldDescend(obj)) {
      distinctObjects.set(obj, new JsonPointer(encodeUriFragmentIdentifier(path)));
      if (!Array.isArray(obj)) {
        const keys = Object.keys(obj);
        const len = keys.length;
        let i = -1;
        while (++i < len) {
          const it = obj[keys[i]];
          if (isObject(it) && distinctObjects.has(it)) {
            q.push({
              obj: new JsonReference(distinctObjects.get(it)),
              path: path.concat(keys[i])
            });
          } else {
            q.push({
              obj: it,
              path: path.concat(keys[i])
            });
          }
        }
      } else {
        let j = -1;
        const len = obj.length;
        while (++j < len) {
          const it = obj[j];
          if (isObject(it) && distinctObjects.has(it)) {
            q.push({
              obj: new JsonReference(distinctObjects.get(it)),
              path: path.concat([j + ""])
            });
          } else {
            q.push({
              obj: it,
              path: path.concat([j + ""])
            });
          }
        }
      }
    }
  }
}
var $ptr = Symbol("pointer");
var $frg = Symbol("fragmentId");
var $get = Symbol("getter");
var JsonPointer = class _JsonPointer {
  /**
   * Creates a new instance.
   * @param ptr a string representation of a JSON Pointer, or a decoded array of path segments.
   */
  constructor(ptr) {
    this.path = decodePtrInit(ptr);
  }
  /**
   * Factory function that creates a JsonPointer instance.
   *
   * ```ts
   * const ptr = JsonPointer.create('/deeply/nested/data/0/here');
   * ```
   * _or_
   * ```ts
   * const ptr = JsonPointer.create(['deeply', 'nested', 'data', 0, 'here']);
   * ```
   * @param pointer the pointer or path.
   */
  static create(pointer) {
    return new _JsonPointer(pointer);
  }
  /**
   * Determines if the specified `target`'s object graph has a value at the `pointer`'s location.
   *
   * ```ts
   * const target = {
   *   first: 'second',
   *   third: ['fourth', 'fifth', { sixth: 'seventh' }],
   *   eighth: 'ninth'
   * };
   *
   * console.log(JsonPointer.has(target, '/third/0'));
   * // true
   * console.log(JsonPointer.has(target, '/tenth'));
   * // false
   * ```
   *
   * @param target the target of the operation
   * @param pointer the pointer or path
   */
  static has(target, pointer) {
    if (typeof pointer === "string" || Array.isArray(pointer)) {
      pointer = new _JsonPointer(pointer);
    }
    return pointer.has(target);
  }
  /**
   * Gets the `target` object's value at the `pointer`'s location.
   *
   * ```ts
   * const target = {
   *   first: 'second',
   *   third: ['fourth', 'fifth', { sixth: 'seventh' }],
   *   eighth: 'ninth'
   * };
   *
   * console.log(JsonPointer.get(target, '/third/2/sixth'));
   * // seventh
   * console.log(JsonPointer.get(target, '/tenth'));
   * // undefined
   * ```
   *
   * @param target the target of the operation
   * @param pointer the pointer or path.
   */
  static get(target, pointer) {
    if (typeof pointer === "string" || Array.isArray(pointer)) {
      pointer = new _JsonPointer(pointer);
    }
    return pointer.get(target);
  }
  /**
   * Sets the `target` object's value, as specified, at the `pointer`'s location.
   *
   * ```ts
   * const target = {
   *   first: 'second',
   *   third: ['fourth', 'fifth', { sixth: 'seventh' }],
   *   eighth: 'ninth'
   * };
   *
   * console.log(JsonPointer.set(target, '/third/2/sixth', 'tenth'));
   * // seventh
   * console.log(JsonPointer.set(target, '/tenth', 'eleventh', true));
   * // undefined
   * console.log(JSON.stringify(target, null, ' '));
   * // {
   * // "first": "second",
   * // "third": [
   * //  "fourth",
   * //  "fifth",
   * //  {
   * //   "sixth": "tenth"
   * //  }
   * // ],
   * // "eighth": "ninth",
   * // "tenth": "eleventh"
   * // }
   * ```
   *
   * @param target the target of the operation
   * @param pointer the pointer or path
   * @param val a value to write into the object graph at the specified pointer location
   * @param force indications whether the operation should force the pointer's location into existence in the object graph.
   *
   * @returns the prior value at the pointer's location in the object graph.
   */
  static set(target, pointer, val, force = false) {
    if (typeof pointer === "string" || Array.isArray(pointer)) {
      pointer = new _JsonPointer(pointer);
    }
    return pointer.set(target, val, force);
  }
  /**
   * Removes the `target` object's value at the `pointer`'s location.
   *
   * ```ts
   * const target = {
   *   first: 'second',
   *   third: ['fourth', 'fifth', { sixth: 'seventh' }],
   *   eighth: 'ninth'
   * };
   *
   * console.log(JsonPointer.unset(target, '/third/2/sixth'));
   * // seventh
   * console.log(JsonPointer.unset(target, '/tenth'));
   * // undefined
   * console.log(JSON.stringify(target, null, ' '));
   * // {
   * // "first": "second",
   * // "third": [
   * //  "fourth",
   * //  "fifth",
   * //  {}
   * // ],
   * // "eighth": "ninth",
   * // }
   * ```
   * @param target the target of the operation
   * @param pointer the pointer or path
   *
   * @returns the value that was removed from the object graph.
   */
  static unset(target, pointer) {
    if (typeof pointer === "string" || Array.isArray(pointer)) {
      pointer = new _JsonPointer(pointer);
    }
    return pointer.unset(target);
  }
  /**
   * Decodes the specified pointer into path segments.
   * @param pointer a string representation of a JSON Pointer
   */
  static decode(pointer) {
    return pickDecoder(pointer)(pointer);
  }
  /**
   * Evaluates the target's object graph, calling the specified visitor for every unique pointer location discovered while walking the graph.
   * @param target the target of the operation
   * @param visitor a callback function invoked for each unique pointer location in the object graph
   * @param fragmentId indicates whether the visitor should receive fragment identifiers or regular pointers
   */
  static visit(target, visitor, fragmentId = false) {
    descendingVisit(target, visitor, fragmentId ? encodeUriFragmentIdentifier : encodePointer);
  }
  /**
   * Evaluates the target's object graph, returning a [[JsonStringPointerListItem]] for each location in the graph.
   * @param target the target of the operation
   */
  static listPointers(target) {
    const res = [];
    descendingVisit(target, (pointer, value) => {
      res.push({ pointer, value });
    }, encodePointer);
    return res;
  }
  /**
   * Evaluates the target's object graph, returning a [[UriFragmentIdentifierPointerListItem]] for each location in the graph.
   * @param target the target of the operation
   */
  static listFragmentIds(target) {
    const res = [];
    descendingVisit(target, (fragmentId, value) => {
      res.push({ fragmentId, value });
    }, encodeUriFragmentIdentifier);
    return res;
  }
  /**
   * Evaluates the target's object graph, returning a Record&lt;Pointer, unknown> populated with pointers and the corresponding values from the graph.
   * @param target the target of the operation
   * @param fragmentId indicates whether the results are populated with fragment identifiers rather than regular pointers
   */
  static flatten(target, fragmentId = false) {
    const res = {};
    descendingVisit(target, (p, v) => {
      res[p] = v;
    }, fragmentId ? encodeUriFragmentIdentifier : encodePointer);
    return res;
  }
  /**
   * Evaluates the target's object graph, returning a Map&lt;Pointer,unknown>  populated with pointers and the corresponding values form the graph.
   * @param target the target of the operation
   * @param fragmentId indicates whether the results are populated with fragment identifiers rather than regular pointers
   */
  static map(target, fragmentId = false) {
    const res = /* @__PURE__ */ new Map();
    descendingVisit(target, res.set.bind(res), fragmentId ? encodeUriFragmentIdentifier : encodePointer);
    return res;
  }
  /**
   * Gets the target object's value at the pointer's location.
   * @param target the target of the operation
   */
  get(target) {
    if (!this[$get]) {
      this[$get] = compilePointerDereference(this.path);
    }
    return this[$get](target);
  }
  /**
   * Sets the target object's value, as specified, at the pointer's location.
   *
   * If any part of the pointer's path does not exist, the operation aborts
   * without modification, unless the caller indicates that pointer's location
   * should be created.
   *
   * @param target the target of the operation
   * @param value the value to set
   * @param force indicates whether the pointer's location should be created if it doesn't already exist.
   */
  set(target, value, force = false) {
    return setValueAtPath(target, value, this.path, force);
  }
  /**
   * Removes the target object's value at the pointer's location.
   * @param target the target of the operation
   *
   * @returns the value that was removed from the object graph.
   */
  unset(target) {
    return unsetValueAtPath(target, this.path);
  }
  /**
   * Determines if the specified target's object graph has a value at the pointer's location.
   * @param target the target of the operation
   */
  has(target) {
    return typeof this.get(target) !== "undefined";
  }
  /**
   * Gets the value in the object graph that is the parent of the pointer location.
   * @param target the target of the operation
   */
  parent(target) {
    const p = this.path;
    if (p.length == 1)
      return void 0;
    const parent = new _JsonPointer(p.slice(0, p.length - 1));
    return parent.get(target);
  }
  /**
   * Creates a new JsonPointer instance, pointing to the specified relative location in the object graph.
   * @param ptr the relative pointer (relative to this)
   * @returns A new instance that points to the relative location.
   */
  relative(ptr) {
    const p = this.path;
    const decoded = decodeRelativePointer(ptr);
    const n = parseInt(decoded[0]);
    if (n > p.length)
      throw new Error("Relative location does not exist.");
    const r = p.slice(0, p.length - n).concat(decoded.slice(1));
    if (decoded[0][decoded[0].length - 1] == "#") {
      const name = r[r.length - 1];
      throw new Error(`We won't compile a pointer that will always return '${name}'. Use JsonPointer.rel(target, ptr) instead.`);
    }
    return new _JsonPointer(r);
  }
  /**
   * Resolves the specified relative pointer path against the specified target object, and gets the target object's value at the relative pointer's location.
   * @param target the target of the operation
   * @param ptr the relative pointer (relative to this)
   * @returns the value at the relative pointer's resolved path; otherwise undefined.
   */
  rel(target, ptr) {
    const p = this.path;
    const decoded = decodeRelativePointer(ptr);
    const n = parseInt(decoded[0]);
    if (n > p.length) {
      return void 0;
    }
    const r = p.slice(0, p.length - n).concat(decoded.slice(1));
    const other = new _JsonPointer(r);
    if (decoded[0][decoded[0].length - 1] == "#") {
      const name = r[r.length - 1];
      const parent = other.parent(target);
      return Array.isArray(parent) ? parseInt(name, 10) : name;
    }
    return other.get(target);
  }
  /**
   * Creates a new instance by concatenating the specified pointer's path onto this pointer's path.
   * @param ptr the string representation of a pointer, it's decoded path, or an instance of JsonPointer indicating the additional path to concatenate onto the pointer.
   */
  concat(ptr) {
    return new _JsonPointer(this.path.concat(ptr instanceof _JsonPointer ? ptr.path : decodePtrInit(ptr)));
  }
  /**
   * This pointer's JSON Pointer encoded string representation.
   */
  get pointer() {
    if (this[$ptr] === void 0) {
      this[$ptr] = encodePointer(this.path);
    }
    return this[$ptr];
  }
  /**
   * This pointer's URI fragment identifier encoded string representation.
   */
  get uriFragmentIdentifier() {
    if (!this[$frg]) {
      this[$frg] = encodeUriFragmentIdentifier(this.path);
    }
    return this[$frg];
  }
  /**
   * Emits the JSON Pointer encoded string representation.
   */
  toString() {
    return this.pointer;
  }
};
var $pointer = Symbol("pointer");
var JsonReference = class {
  /**
   * Creates a new instance.
   * @param pointer a JSON Pointer for the reference.
   */
  constructor(pointer) {
    this[$pointer] = pointer instanceof JsonPointer ? pointer : new JsonPointer(pointer);
    this.$ref = this[$pointer].uriFragmentIdentifier;
  }
  /**
   * Determines if the specified `candidate` is a JsonReference.
   * @param candidate the candidate
   */
  static isReference(candidate) {
    if (!candidate)
      return false;
    const ref = candidate;
    return typeof ref.$ref === "string" && typeof ref.resolve === "function";
  }
  /**
   * Resolves the reference against the `target` object, returning the value at
   * the referenced pointer's location.
   * @param target the target object
   */
  resolve(target) {
    return this[$pointer].get(target);
  }
  /**
   * Gets the reference's pointer.
   */
  pointer() {
    return this[$pointer];
  }
  /**
   * Gets the reference pointer's string representation (a URI fragment identifier).
   */
  toString() {
    return this.$ref;
  }
};

// lib/renderers/ActionStateRenderer.ts
var ActionStateRenderer = () => {
  let submitResult;
  let o;
  function setInstance(attrs) {
    if (attrs.submitResult == null) {
      submitResult = void 0;
      o = void 0;
    } else if (submitResult == null || attrs.submitResult.ok !== submitResult.ok || attrs.submitResult.status !== submitResult.status || attrs.submitResult.value !== submitResult.value) {
      submitResult = attrs.submitResult;
      const rendererArgs = {
        index: 0,
        value: attrs.submitResult.value
      };
      o = selectionFactory(
        attrs.args,
        attrs.parentArgs,
        rendererArgs
      );
    }
  }
  return {
    oninit: ({ attrs }) => {
      setInstance(attrs);
    },
    onbeforeupdate: ({ attrs }) => {
      setInstance(attrs);
    },
    view: (_a) => {
      var _b = _a, { attrs: _c } = _b, _d = _c, { type, selector, args, view } = _d, attrs = __objRest(_d, ["type", "selector", "args", "view"]), { children } = _b;
      if (type === "initial" && submitResult == null) {
        return children;
      } else if (submitResult == null || o == null) {
        return null;
      }
      let shouldRender = type === "success" && submitResult.ok || type === "failure" && !submitResult.ok;
      if (attrs.not) {
        shouldRender = !shouldRender;
      }
      o.position = 1;
      if (shouldRender && selector != null) {
        return o.select(selector, args, view);
      } else if (shouldRender && view != null) {
        return view(o);
      } else if (shouldRender && args != null) {
        return o.present(args);
      }
      o.position = -1;
      return null;
    }
  };
};

// lib/utils/getSubmitDetails.ts
var import_uri_templates = __toESM(require_uri_templates());
function getSubmitDetails({
  payload,
  action
}) {
  let urlTemplate;
  let body;
  let method = "get";
  let contentType;
  let encodingType;
  let target = action["https://schema.org/target"];
  if (Array.isArray(target)) {
    for (const item of target) {
      if (item === "string") {
        target = item;
        break;
      } else if (isJSONObject(target) && (target["https://schema.org/contentType"] == null || (target["https://schema.org/contentType"] === "mutipart/form-data" || target["https://schema.org/contentType"] === "application/ld+json"))) {
        target = item;
        break;
      }
    }
  }
  if (typeof target === "string") {
    urlTemplate = target;
  } else if (isJSONObject(target)) {
    if (typeof target["https://schema.org/urlTemplate"] === "string") {
      urlTemplate = target["https://schema.org/urlTemplate"];
    }
    if (typeof target["https://schema.org/httpMethod"] === "string") {
      method = target["https://schema.org/httpMethod"].toLowerCase();
    }
    if (typeof target["https://schema.org/contentType"] === "string") {
      contentType = target["https://schema.org/contentType"];
    }
    if (typeof target["https://schema.org/encodingType"] === "string") {
      encodingType = target["https://schema.org/encodingType"];
    }
  }
  if (typeof urlTemplate !== "string") {
    throw new Error("Action has invalid https://schema.org/target");
  }
  const fillArgs = {};
  const submitBody = Object.assign({}, payload);
  for (const [type, value] of Object.entries(action)) {
    if (!isTypeObject(value) || value["@type"] !== "https://schema.org/PropertyValueSpecification") {
      continue;
    }
    const valueName = value["https://schema.org/valueName"];
    if (valueName != null) {
      const propType = type.replace(/-input$/, "");
      fillArgs[valueName] = payload[propType];
      delete submitBody[valueName];
    }
  }
  const template = (0, import_uri_templates.default)(urlTemplate);
  const url = template.fill(fillArgs);
  if (method !== "get" && method !== "delete") {
    body = JSON.stringify(submitBody);
  } else {
    contentType = void 0;
    encodingType = void 0;
  }
  return {
    url,
    method,
    contentType,
    encodingType,
    body
  };
}

// lib/factories/actionSelectionFactory.ts
import m5 from "mithril";

// lib/renderers/EditRenderer.ts
import m4 from "mithril";
var EditRenderer = ({
  attrs: {
    args,
    factoryArgs,
    parentArgs,
    rendererArgs
  }
}) => {
  const [attrs, component] = selectComponentFromArgs(
    "edit",
    parentArgs,
    rendererArgs,
    args,
    factoryArgs
  );
  return {
    //onbeforeupdate({ attrs: { args, factoryArgs, parentArgs, rendererArgs }}) {
    // [attrs, component] = selectComponentFromArgs(
    //   'present',
    //   parentArgs,
    //   rendererArgs,
    //   args,
    //   factoryArgs,
    // );
    //},
    view({ attrs: { o, rendererArgs: rendererArgs2 }, children }) {
      if (component == null) {
        return null;
      }
      return m4(component, {
        o,
        attrs,
        renderType: "edit",
        name: o.inputName,
        value: rendererArgs2.value,
        spec: rendererArgs2.spec,
        onchange: rendererArgs2.update,
        onChange: rendererArgs2.update
      }, children);
    }
  };
};

// lib/factories/actionSelectionFactory.ts
function actionSelectionFactory(args, parentArgs, rendererArgs) {
  var _a, _b, _c;
  const factoryArgs = Object.assign({}, args);
  const childArgs = {
    action: parentArgs.action,
    submitting: parentArgs.submitting,
    value: rendererArgs.value
  };
  const self = octironFactory(
    "action-selection",
    factoryArgs,
    parentArgs,
    rendererArgs,
    childArgs
  );
  self.readonly = rendererArgs.spec == null ? true : (_a = rendererArgs.spec.readonly) != null ? _a : false;
  self.inputName = ((_b = rendererArgs.spec) == null ? void 0 : _b.name) != null ? (_c = rendererArgs.spec) == null ? void 0 : _c.name : rendererArgs.propType;
  self.submitting = parentArgs.submitting;
  self.action = parentArgs.action;
  childArgs.updatePointer = (pointer, value, args2, interceptor = factoryArgs.interceptor) => {
    var _a2;
    const prev = rendererArgs.value;
    if (!isJSONObject(prev)) {
      console.warn(`Non object action change intercepted.`);
      return;
    }
    let next = Object.assign({}, prev);
    const ptr = JsonPointer.create(pointer);
    if (value == null) {
      ptr.unset(next);
    } else {
      ptr.set(next, value, true);
    }
    if (typeof interceptor === "function") {
      next = interceptor(next, prev, (_a2 = rendererArgs.actionValue) == null ? void 0 : _a2.value);
    }
    parentArgs.updatePointer(rendererArgs.pointer, next, args2);
  };
  self.update = (arg1, args2) => __async(null, null, function* () {
    const value = rendererArgs.value;
    if (!isJSONObject(value)) {
      throw new Error(`Cannot call update on a non object selection instance`);
    }
    if (typeof arg1 === "function") {
      rendererArgs.update(arg1(value));
    } else if (arg1 != null) {
      rendererArgs.update(arg1);
    }
    if ((args2 == null ? void 0 : args2.submit) || (args2 == null ? void 0 : args2.submitOnChange)) {
      yield parentArgs.submit();
    } else {
      mithrilRedraw();
    }
  });
  self.submit = () => {
    return parentArgs.submit();
  };
  self.select = (arg1, arg2, arg3) => {
    if (!isJSONObject(rendererArgs.value)) {
      return null;
    }
    const [selector, args2, view] = unravelArgs(arg1, arg2, arg3);
    return m5(
      ActionSelectionRenderer,
      {
        parentArgs: childArgs,
        selector,
        value: rendererArgs.value,
        actionValue: rendererArgs.actionValue.value,
        args: args2,
        view
      }
    );
  };
  self.edit = (args2) => {
    if (self.readonly) {
      return self.present(args2);
    }
    return m5(EditRenderer, {
      o: self,
      args: args2,
      factoryArgs,
      parentArgs,
      rendererArgs
    });
    const [attrs, component] = selectComponentFromArgs(
      "edit",
      parentArgs,
      rendererArgs,
      args2,
      factoryArgs
    );
    if (component == null) {
      return null;
    }
    return m5(component, {
      o: self,
      spec: rendererArgs.spec,
      renderType: "edit",
      name: self.inputName,
      value: rendererArgs.value,
      attrs,
      onchange: rendererArgs.update,
      onChange: rendererArgs.update
    });
  };
  self.default = (args2) => {
    return self.edit(Object.assign({ component: null }, args2));
  };
  self.initial = parentArgs.action.initial;
  self.success = parentArgs.action.success;
  self.failure = parentArgs.action.failure;
  self.remove = (_args = {}) => {
    if (rendererArgs.propType == null) {
      return;
    }
    const parentValue = parentArgs.parent.value;
    const value = parentValue[rendererArgs.propType];
    if (isIterable(value)) {
      const arrValue = getIterableValue(value);
      arrValue.splice(self.index, 1);
      if (arrValue.length === 0) {
        delete parentValue[rendererArgs.propType];
      }
    } else if (isJSONObject(value)) {
      delete parentValue[rendererArgs.propType];
    }
    mithrilRedraw();
  };
  self.append = (termOrType, value = {}, args2 = {}) => {
    if (!isJSONObject(rendererArgs.value)) {
      console.warn(`Attempt to append to non object octiron selection ${termOrType}`);
      return;
    }
    let nextValue;
    const type = parentArgs.store.expand(termOrType);
    const lastValue = rendererArgs.value[type];
    if (lastValue == null) {
      nextValue = value;
    } else if (Array.isArray(lastValue)) {
      nextValue = [...lastValue, value];
    } else {
      nextValue = [lastValue, value];
    }
    return parentArgs.updatePointer(
      rendererArgs.pointer,
      Object.assign({}, rendererArgs.value, { [type]: nextValue }),
      args2
    );
  };
  return self;
}

// lib/utils/escapeJSONPointerParts.ts
function escapeJSONPointerParts(...parts) {
  const escaped = parts.map((part) => part.replace(/~/g, "~0").replace(/\//g, "~1")).join("/");
  return `${escaped}`;
}

// lib/utils/isIRIObject.ts
function isIRIObject(value) {
  return isJSONObject(value) && typeof value["@id"] === "string" && value["@id"] !== "";
}

// lib/utils/isMetadataObject.ts
function isMetadataObject(value) {
  const keys = Object.keys(value);
  if (keys.length === 0) {
    return false;
  }
  for (const term of keys) {
    if (!term.startsWith("@") || term === "@value" || term === "@list" || term === "@set") {
      return false;
    }
  }
  return true;
}

// lib/utils/isValueObject.ts
function isValueObject(value) {
  return typeof value["@value"] !== "undefined";
}

// lib/utils/parseSelectorString.ts
var selectorRe = new RegExp("\\s*(?<subject>([^\\[\\s]+))(\\[(?<filter>([^\\]])+)\\])?\\s*", "g");
function parseSelectorString(selector, store) {
  var _a, _b;
  let match;
  const selectors = [];
  while (match = selectorRe.exec(selector)) {
    const subject = (_a = match.groups) == null ? void 0 : _a.subject;
    const filter = (_b = match.groups) == null ? void 0 : _b.filter;
    if (typeof filter === "string" && typeof subject === "string") {
      selectors.push({
        subject: store.expand(subject),
        filter
      });
    } else if (typeof subject === "string") {
      selectors.push({
        subject: store.expand(subject)
      });
    } else {
      throw new Error(`Invalid selector: ${selector}`);
    }
  }
  return selectors;
}

// lib/utils/resolvePropertyValueSpecification.ts
var httpRe = /^https?\:\/\//;
var scmCtxRe = /^https?\:\/\/schema\.org/;
var scmTypeRe = new RegExp("^https?\\:\\/\\/schema\\.org\\/(?<term>(readonlyValue|valueName|valueRequired|defaultValue|minValue|maxValue|stepValue|valuePattern|multipleValues|valueMinLength|valueMaxLength))");
function resolvePropertyValueSpecification({
  spec,
  store
}) {
  var _a;
  const pvs = {
    readonlyValue: false,
    valueRequired: false
  };
  let scmAlias;
  const scmVocab = store.vocab == null ? false : scmCtxRe.test(store.vocab);
  for (const [key, value] of Object.entries(store.aliases)) {
    if (scmCtxRe.test(value)) {
      scmAlias = [key, value];
      break;
    }
  }
  for (const [term, value] of Object.entries(spec)) {
    let type;
    if (!httpRe.test(term)) {
      if (scmVocab && !term.includes(":")) {
        type = `${store.vocab}${term}`;
      } else if (scmAlias && term.startsWith(`${scmAlias[0]}:`)) {
        type = term.replace(`${scmAlias[0]}:`, scmAlias[1]);
      }
    } else {
      type = term;
    }
    if (!type) {
      continue;
    }
    const result = scmTypeRe.exec(type);
    if ((_a = result == null ? void 0 : result.groups) == null ? void 0 : _a.term) {
      pvs[result.groups.term] = value;
    }
  }
  return {
    readonly: pvs.readonlyValue,
    required: pvs.valueRequired,
    name: pvs.valueName,
    min: pvs.minValue,
    max: pvs.maxValue,
    step: pvs.stepValue,
    pattern: pvs.valuePattern,
    multiple: pvs.multipleValues,
    minLength: pvs.valueMinLength,
    maxLength: pvs.valueMaxLength
  };
}

// lib/utils/getSelection.ts
var CircularSelectionError = class extends Error {
};
function transformProcessedDetails(processing) {
  for (let index = 0; index < processing.result.length; index++) {
    const element = processing.result[index];
    element.key = Symbol.for(element.keySource);
    delete element.keySource;
  }
  return processing;
}
function getSelection({
  selector: selectorStr,
  value,
  fragment,
  accept,
  actionValue,
  defaultValue,
  store
}) {
  const details = {
    selector: selectorStr,
    complete: false,
    hasErrors: false,
    hasMissing: false,
    required: [],
    dependencies: [],
    result: []
  };
  if (value == null) {
    const [{ subject, filter }, ...selector2] = parseSelectorString(selectorStr, store);
    const [iri, iriFragment] = subject.split("#");
    selectEntity({
      keySource: "",
      pointer: "",
      iri,
      fragment: iriFragment != null ? iriFragment : fragment,
      accept,
      filter,
      selector: selector2.length > 0 ? selector2 : void 0,
      store,
      details
    });
    details.complete = details.required.length === 0;
    return transformProcessedDetails(details);
  }
  const selector = parseSelectorString(selectorStr, store);
  traverseSelector({
    keySource: "",
    pointer: "",
    value,
    actionValue,
    selector,
    store,
    details,
    defaultValue
  });
  details.complete = details.required.length === 0;
  for (let index = 0; index < details.result.length; index++) {
    const element = details.result[index];
    element.key = Symbol.for(element.keySource);
  }
  return transformProcessedDetails(details);
}
function makePointer(pointer, addition) {
  return `${pointer}/${escapeJSONPointerParts(addition.toString())}`;
}
function passesFilter({
  value,
  filter
}) {
  if (typeof filter !== "string") {
    return true;
  }
  if (Array.isArray(value["@type"])) {
    return value["@type"].includes(filter);
  }
  return value["@type"] === filter;
}
function isTraversable(value) {
  return value !== null && typeof value !== "undefined" && typeof value !== "boolean" && typeof value !== "number" && typeof value !== "string";
}
function resolveValue({
  keySource,
  pointer,
  value,
  propType,
  filter,
  spec,
  actionValue,
  store,
  details
}) {
  if (value === void 0) {
    details.hasMissing = true;
    return;
  } else if (value === null && isJSONObject(actionValue)) {
    for (const item of Object.values(actionValue)) {
      if (isTypeObject(item) && item["@type"] === "https://schema.org/PropertyValueSpecification") {
        return;
      }
    }
  }
  if (spec != null && // hit the for loop below if the action value
  // has editable properties and the value is an
  // array
  (!isIterable(value) || !isJSONObject(actionValue))) {
    const pvs = resolvePropertyValueSpecification({
      spec,
      store
    });
    if (isJSONObject(value) && isValueObject(value)) {
      value = value["@value"];
    }
    details.result.push({
      keySource: pointer,
      pointer,
      type: "action-value",
      propType,
      value,
      actionValue,
      spec: pvs,
      readonly: pvs.readonly
    });
    return;
  }
  if (!isTraversable(value)) {
    details.result.push({
      keySource: pointer,
      pointer,
      type: "value",
      propType,
      value
    });
    return;
  } else if (isIterable(value)) {
    const list = getIterableValue(value);
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      if (!isIRIObject(item)) {
        keySource = makePointer(keySource, index);
      }
      resolveValue({
        keySource,
        pointer: makePointer(pointer, index),
        value: item,
        spec,
        actionValue,
        propType,
        filter,
        store,
        details
      });
      if (details.hasErrors || details.hasMissing) {
        return;
      }
    }
    return;
  }
  if (typeof filter === "string" && !passesFilter({ value, filter })) {
    return;
  }
  if (isValueObject(value)) {
    resolveValue({
      keySource,
      pointer,
      value: value["@value"],
      propType,
      store,
      details
    });
    return;
  } else if (isMetadataObject(value)) {
    selectEntity({
      keySource,
      pointer,
      iri: value["@id"],
      filter,
      store,
      details
    });
    return;
  }
  if (isIRIObject(value)) {
    const iri = value["@id"];
    details.result.push({
      keySource,
      pointer,
      type: "entity",
      iri,
      ok: true,
      value
    });
    return;
  }
  details.result.push({
    keySource,
    pointer,
    type: "value",
    propType,
    value
  });
}
function selectTypedValue({
  keySource,
  pointer,
  propType,
  value,
  actionValue,
  filter,
  store,
  details
}) {
  pointer = makePointer(pointer, propType);
  if (!isTraversable(value)) {
    return;
  }
  if (isIterable(value)) {
    const list = getIterableValue(value);
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      if (!isIRIObject(item)) {
        keySource = makePointer(keySource, index);
      }
      selectTypedValue({
        keySource,
        pointer: makePointer(pointer, index),
        propType,
        value: item,
        actionValue,
        filter,
        store,
        details
      });
      if (details.hasErrors || details.hasMissing) {
        return;
      }
    }
    return;
  }
  if (isMetadataObject(value) && isIRIObject(value)) {
    selectEntity({
      keySource,
      pointer,
      iri: value["@id"],
      selector: [{ subject: propType, filter }],
      store,
      details
    });
    return;
  } else if (isMetadataObject(value)) {
    return;
  }
  let spec;
  if (isJSONObject(actionValue) && actionValue[`${propType}-input`] == null) {
    return;
  } else if (isJSONObject(actionValue)) {
    spec = actionValue[`${propType}-input`];
  }
  resolveValue({
    keySource,
    pointer,
    value: value[propType],
    spec,
    actionValue: actionValue == null ? void 0 : actionValue[propType],
    propType,
    filter,
    store,
    details
  });
}
function traverseSelector({
  keySource,
  pointer,
  selector,
  value,
  actionValue,
  store,
  details,
  defaultValue
}) {
  if (selector.length === 0) {
    return;
  } else if (!isTraversable(value)) {
    return;
  }
  if (isIterable(value)) {
    const list = getIterableValue(value);
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      if (!isIRIObject(item)) {
        keySource = makePointer(keySource, index);
      }
      traverseSelector({
        keySource,
        pointer: makePointer(pointer, index),
        selector,
        value: item,
        actionValue,
        store,
        details,
        defaultValue
      });
      if (details.hasErrors || details.hasMissing) {
        return;
      }
    }
    return;
  } else if (isValueObject(value)) {
    traverseSelector({
      keySource,
      pointer,
      selector,
      value: value["@value"],
      actionValue,
      store,
      details,
      defaultValue
    });
  }
  if (isMetadataObject(value) && isIRIObject(value)) {
    selectEntity({
      keySource,
      pointer,
      selector,
      iri: value["@id"],
      store,
      details
    });
    return;
  }
  if (isJSONObject(value) && actionValue !== void 0 && value[selector[0].subject] == null) {
    value = { [selector[0].subject]: defaultValue != null ? defaultValue : null };
  }
  const [next, ...rest] = selector;
  const { subject: propType, filter } = next;
  if (value[propType] === void 0) {
    details.hasMissing = true;
    return;
  }
  if (rest.length === 0 && isJSONObject(actionValue == null ? void 0 : actionValue[propType])) {
    pointer = makePointer(pointer, propType);
    resolveValue({
      keySource: pointer,
      pointer,
      value: value[propType],
      propType,
      details,
      store,
      actionValue: actionValue == null ? void 0 : actionValue[propType],
      spec: actionValue[`${propType}-input`],
      filter
    });
    return;
  } else if (rest.length === 0) {
    selectTypedValue({
      keySource,
      pointer,
      propType,
      filter,
      value,
      actionValue,
      store,
      details
    });
    return;
  }
  if (typeof filter === "string" && !passesFilter({ value, filter })) {
    return;
  }
  let traversedActionValue;
  if (isJSONObject(actionValue == null ? void 0 : actionValue[propType])) {
    traversedActionValue = actionValue[propType];
  }
  traverseSelector({
    keySource: makePointer(keySource, propType),
    pointer: makePointer(pointer, propType),
    selector: rest,
    value: value[propType],
    actionValue: traversedActionValue,
    store,
    details
  });
}
function selectEntity({
  keySource,
  pointer,
  iri,
  fragment,
  accept,
  filter,
  selector,
  store,
  details,
  handledIRIs
}) {
  keySource = makePointer(keySource, iri);
  pointer = makePointer(pointer, iri);
  const cache = store.entity(iri, accept);
  details.dependencies.push(iri);
  if (cache == null || cache.loading) {
    if (!details.required.includes(iri)) {
      details.required.push(iri);
      details.accept = accept;
      details.fragment = fragment;
    }
    return;
  }
  if (!cache.ok) {
    details.hasErrors = true;
    if (selector == null || selector.length === 0) {
      return;
    }
    details.result.push({
      keySource,
      pointer,
      type: "entity",
      iri: cache.iri,
      ok: false,
      status: cache.status,
      value: cache.value,
      reason: cache.reason
    });
    return;
  }
  if (cache.type === "alternative-success") {
    details.result.push({
      keySource,
      pointer,
      type: "alternative",
      contentType: cache.integration.contentType,
      integration: cache.integration
    });
    return;
  }
  const value = cache.value;
  if (isMetadataObject(value)) {
    if (handledIRIs == null) {
      handledIRIs = /* @__PURE__ */ new Set([value["@id"]]);
    } else if (!handledIRIs.has(value["@id"])) {
      handledIRIs.add(value["@id"]);
    } else {
      throw new CircularSelectionError(`Circular selection loop detected`);
    }
    return selectEntity({
      keySource,
      pointer,
      iri: value["@id"],
      filter,
      selector,
      details,
      store,
      handledIRIs
    });
  }
  if (typeof filter === "string" && !passesFilter({ filter, value })) {
    return;
  }
  if (typeof selector === "undefined") {
    details.result.push({
      keySource,
      pointer,
      type: "entity",
      iri: cache.iri,
      ok: true,
      value: cache.value
    });
    return;
  }
  traverseSelector({
    keySource,
    pointer,
    value,
    selector,
    store,
    details
  });
  return;
}

// lib/renderers/ActionSelectionRenderer.ts
var ActionSelectionRenderer = (vnode) => {
  let currentAttrs = vnode.attrs;
  let details;
  const instances = {};
  function createInstances() {
    let hasChanges = false;
    const { parentArgs, selectionArgs } = currentAttrs;
    const nextKeys = [];
    for (let index = 0; index < details.result.length; index++) {
      const selectionResult = details.result[index];
      nextKeys.push(selectionResult.pointer);
      if (instances[selectionResult.pointer] != null) {
        const { rendererArgs: rendererArgs2, octiron: octiron2 } = instances[selectionResult.pointer];
        const update2 = (value) => {
          return parentArgs.updatePointer(
            selectionResult.pointer,
            value,
            selectionArgs
          );
        };
        rendererArgs2.value = octiron2.value = selectionResult.value;
        rendererArgs2.spec = selectionResult.spec;
        rendererArgs2.update = update2;
        continue;
      }
      hasChanges = true;
      const update = (value) => {
        return parentArgs.updatePointer(
          selectionResult.pointer,
          value,
          selectionArgs
        );
      };
      const actionValueRendererArgs = {
        index,
        value: selectionResult.actionValue,
        propType: selectionResult.propType
      };
      const actionValue = selectionFactory(
        currentAttrs.args,
        parentArgs,
        actionValueRendererArgs
      );
      const rendererArgs = {
        index,
        update,
        actionValue,
        pointer: selectionResult.pointer,
        propType: selectionResult.propType,
        value: selectionResult.value,
        spec: selectionResult.spec
      };
      const actionSelection = actionSelectionFactory(
        currentAttrs.args,
        parentArgs,
        rendererArgs
      );
      instances[selectionResult.pointer] = {
        rendererArgs,
        selection: actionValue,
        octiron: actionSelection,
        selectionResult
      };
    }
    const prevKeys = Object.keys(instances);
    for (const key of prevKeys) {
      if (!nextKeys.includes(key)) {
        hasChanges = true;
        delete instances[key];
      }
    }
    if (hasChanges && typeof window !== "undefined") {
      mithrilRedraw();
    }
  }
  function updateSelection() {
    const { selector, value, actionValue } = currentAttrs;
    const { store } = currentAttrs.parentArgs;
    if (!isJSONObject(value)) {
      return;
    }
    details = getSelection({
      selector,
      store,
      actionValue,
      value,
      defaultValue: currentAttrs.args.initialValue
    });
    createInstances();
  }
  return {
    oninit: ({ attrs }) => {
      currentAttrs = attrs;
      updateSelection();
    },
    onbeforeupdate: ({ attrs }) => {
      currentAttrs = attrs;
      for (const instance of Object.values(instances)) {
        instance.octiron._updateArgs("args", attrs.args);
      }
      updateSelection();
    },
    view: ({ attrs: { view, args } }) => {
      if (details == null) {
        return null;
      }
      const {
        pre,
        sep,
        post,
        fallback
      } = args;
      if (typeof view === "undefined") {
        return;
      }
      const list = Object.values(instances);
      const children = [pre];
      for (let index = 0; index < list.length; index++) {
        const { octiron: octiron2, selectionResult } = list[index];
        octiron2.position = index + 1;
        if (index !== 0) {
          children.push(sep);
        }
        if (selectionResult.value == null && typeof fallback === "function") {
          children.push(null);
        } else if (selectionResult.value == null && fallback != null) {
          children.push(fallback);
        } else {
          children.push(view(octiron2));
        }
      }
      children.push(post);
      return children;
    }
  };
};

// lib/utils/expandValue.ts
function expandValue(store, value) {
  let expanded = {};
  for (let [key, item] of Object.entries(value)) {
    expanded[store.expand(key)] = item;
  }
  return expanded;
}

// lib/factories/actionFactory.ts
function actionFactory(args, parentArgs, rendererArgs) {
  const factoryArgs = Object.assign(/* @__PURE__ */ Object.create(null), args);
  let payload = /* @__PURE__ */ Object.create(null);
  let submitResult;
  if (isJSONObject(args.initialValue)) {
    payload = expandValue(parentArgs.store, args.initialValue);
  } else if (args.initialValue != null) {
    console.warn("o.perform() only supports receiving JSON objects as initial values.");
  }
  function submit() {
    return __async(this, null, function* () {
      const { url, method, body, contentType, encodingType } = getSubmitDetails({
        payload,
        action: rendererArgs.value,
        store: parentArgs.store
      });
      self.submitting = true;
      self.url = new URL(url, self.store.rootIRI);
      mithrilRedraw();
      try {
        submitResult = yield parentArgs.store.submit(url, {
          method,
          body,
          contentType,
          encodingType
        });
      } catch (err) {
        console.error(err);
      }
      self.submitting = false;
      mithrilRedraw();
    });
  }
  function update(value) {
    const prev = payload;
    const next = __spreadValues(__spreadValues({}, prev), value);
    if (typeof args.interceptor === "function") {
      payload = args.interceptor(
        next,
        prev,
        parentArgs.parent.value
      );
    } else {
      payload = next;
    }
    childArgs.value = self.value = value;
    mithrilRedraw();
  }
  const updatePointer = (pointer, value, _args) => {
    const next = Object.assign({}, payload);
    const ptr = JsonPointer.create(pointer);
    if (value == null) {
      ptr.unset(next);
    } else {
      ptr.set(next, value, true);
    }
    update(next);
  };
  const childArgs = {
    value: payload,
    submitting: false,
    submit,
    updatePointer
  };
  const self = octironFactory(
    "action",
    factoryArgs,
    parentArgs,
    rendererArgs,
    childArgs
  );
  self.value = payload;
  self.action = parentArgs.parent;
  self.actionValue = rendererArgs.actionValue;
  childArgs.action = self;
  childArgs.submitting = self.submitting;
  self.select = (arg1, arg2, arg3) => {
    const [selector, args2, view] = unravelArgs(arg1, arg2, arg3);
    return m6(
      ActionSelectionRenderer,
      {
        parentArgs: childArgs,
        selector,
        value: self.value,
        actionValue: parentArgs.parent.value,
        args: args2,
        view
      }
    );
  };
  self.submit = function(arg1) {
    return __async(this, null, function* () {
      if (typeof arg1 === "function") {
        update(arg1(payload));
      } else if (arg1 != null) {
        update(arg1);
      }
      return yield submit();
    });
  };
  self.update = function(arg1, args2) {
    return __async(this, null, function* () {
      if (typeof arg1 === "function") {
        update(arg1(payload));
      } else if (arg1 != null) {
        update(arg1);
      }
      if ((args2 == null ? void 0 : args2.submit) || (args2 == null ? void 0 : args2.submitOnChange)) {
        yield submit();
      } else {
        mithrilRedraw();
      }
    });
  };
  self.append = (termOrType, value = {}, args2 = {}) => {
    const type = parentArgs.store.expand(termOrType);
    if (!isJSONObject(self.value)) {
      return;
    }
    const prevValue = self.value[type];
    let nextValue = [];
    if (prevValue != null && !Array.isArray(prevValue)) {
      nextValue.push(prevValue);
    } else if (Array.isArray(prevValue)) {
      nextValue = [...prevValue.filter((value2) => value2 != void 0)];
    }
    nextValue.push(value);
    return self.update(__spreadProps(__spreadValues({}, self.value), {
      [type]: nextValue
    }), args2);
  };
  const makeInitialStateMethod = (not) => {
    return (children) => {
      return m6(
        ActionStateRenderer,
        {
          not,
          type: "initial",
          args: {},
          submitResult,
          parentArgs: childArgs
        },
        children
      );
    };
  };
  const makeActionStateMethod = (type, not) => {
    return (arg1, arg2, arg3) => {
      const [selector, args2, view] = unravelArgs(arg1, arg2, arg3);
      return m6(ActionStateRenderer, {
        not,
        type,
        selector,
        args: args2,
        view,
        submitResult,
        parentArgs: childArgs
      });
    };
  };
  self.initial = makeInitialStateMethod();
  self.not.initial = makeInitialStateMethod(true);
  self.success = makeActionStateMethod("success");
  self.not.success = makeActionStateMethod("success", true);
  self.failure = makeActionStateMethod("failure");
  self.not.failure = makeActionStateMethod("failure", true);
  try {
    const submitDetails = getSubmitDetails({
      payload: self.value,
      action: rendererArgs.value,
      store: parentArgs.store
    });
    self.url = new URL(submitDetails.url);
    self.method = submitDetails.method;
  } catch (err) {
    console.error(err);
  }
  if (self.url != null) {
    submitResult = parentArgs.store.entity(self.url.toString());
  }
  if (typeof window === "undefined" && args.submitOnInit && submitResult == null) {
    self.submit();
  } else if (typeof window !== "undefined" && args.submitOnInit) {
    self.submit();
  }
  return self;
}

// lib/renderers/PerformRenderer.ts
var PerformRenderer = ({ attrs }) => {
  const key = Symbol("PerformRenderer");
  let currentAttrs = attrs;
  let details;
  const instances = {};
  function createInstances() {
    let hasChanges = false;
    const { args, parentArgs } = currentAttrs;
    const nextKeys = [];
    for (let index = 0; index < details.result.length; index++) {
      const selectionResult = details.result[index];
      nextKeys.push(selectionResult.pointer);
      if (Object.hasOwn(instances, selectionResult.pointer)) {
        const next = selectionResult;
        const prev = instances[selectionResult.pointer].selectionResult;
        if (prev.type === "value" && next.type === "value" && next.value === prev.value) {
          continue;
        } else if (prev.type === "entity" && next.type === "entity" && (next.ok !== prev.ok || next.status !== prev.status || next.value !== prev.value)) {
          continue;
        }
        continue;
      }
      hasChanges = true;
      const actionValueRendererArgs = {
        index,
        value: selectionResult.value
      };
      const actionValue = selectionFactory(
        args,
        parentArgs,
        actionValueRendererArgs
      );
      const rendererArgs = {
        index,
        value: selectionResult.value,
        actionValue
      };
      const action = actionFactory(
        args,
        parentArgs,
        rendererArgs
      );
      instances[selectionResult.pointer] = {
        action,
        octiron: actionValue,
        selectionResult
      };
    }
    const prevKeys = Object.keys(instances);
    for (const key2 of prevKeys) {
      if (!nextKeys.includes(key2)) {
        hasChanges = true;
        delete instances[key2];
      }
    }
    if (hasChanges) {
      mithrilRedraw();
    }
  }
  function fetchRequired(required) {
    return __async(this, null, function* () {
      if (required.length === 0) {
        return;
      }
      const promises = [];
      for (const iri of required) {
        promises.push(currentAttrs.parentArgs.store.fetch(iri));
      }
      yield Promise.allSettled(promises);
    });
  }
  function listener(next) {
    let required = [];
    if (typeof details === "undefined") {
      required = next.required;
    } else {
      for (const iri of next.required) {
        if (!details.required.includes(iri)) {
          required.push(iri);
        }
      }
    }
    details = next;
    if (required.length > 0) {
      fetchRequired(required);
    }
    createInstances();
  }
  function subscribe() {
    const { selector, parentArgs } = currentAttrs;
    if (selector == null) {
      let result;
      if (isIRIObject(parentArgs.parent.value)) {
        result = {
          pointer: "/local",
          key: Symbol.for("/local"),
          type: "entity",
          iri: parentArgs.parent.value["@id"],
          ok: true,
          value: parentArgs.parent.value
        };
      } else {
        result = {
          pointer: "/local",
          key: Symbol.for("/local"),
          type: "value",
          value: parentArgs.parent.value
        };
      }
      details = {
        selector: "",
        complete: true,
        hasErrors: false,
        hasMissing: false,
        dependencies: [],
        required: [],
        result: [result]
      };
    } else {
      details = parentArgs.store.subscribe({
        key,
        selector,
        value: parentArgs.parent.value,
        listener
      });
      fetchRequired(details.required);
    }
    createInstances();
  }
  return {
    oninit: ({ attrs: attrs2 }) => {
      currentAttrs = attrs2;
      subscribe();
    },
    onbeforeupdate: ({ attrs: attrs2 }) => {
      if (attrs2.selector !== currentAttrs.selector) {
        attrs2.parentArgs.store.unsubscribe(key);
        subscribe();
      }
      currentAttrs = attrs2;
      for (const instance of Object.values(instances)) {
        instance.action._updateArgs("args", attrs2.args);
      }
    },
    onbeforeremove: ({ attrs: attrs2 }) => {
      currentAttrs = attrs2;
      attrs2.parentArgs.store.unsubscribe(key);
    },
    view: ({ attrs: { view, args } }) => {
      if (details == null || !details.complete) {
        return args.loading;
      }
      const {
        pre,
        sep,
        post,
        fallback
      } = args;
      if (typeof view === "undefined") {
        return;
      }
      const list = Object.values(instances);
      const children = [pre];
      for (let index = 0; index < list.length; index++) {
        const { selectionResult, action, octiron: octiron2 } = list[index];
        action.position = index + 1;
        if (index !== 0) {
          children.push(sep);
        }
        if (selectionResult.type === "value") {
          children.push(view(action));
        } else if (!selectionResult.ok && typeof fallback === "function") {
          children.push(fallback(octiron2, selectionResult.reason));
        } else if (!selectionResult.ok) {
          children.push(fallback);
        } else {
          children.push(view(action));
        }
      }
      children.push(post);
      return children;
    }
  };
};

// lib/factories/octironFactory.ts
var TypeKeys = {
  "root": 0,
  "selection": 1,
  "action": 2,
  "action-selection": 3
};
function octironFactory(octironType, factoryArgs, parentArgs, rendererArgs = {}, childArgs = {}) {
  var _a, _b, _c, _d, _e, _f;
  const typeKey = TypeKeys[octironType];
  const name = isIRIObject(rendererArgs.value) ? rendererArgs.value["@id"] : (_a = rendererArgs.propType) != null ? _a : "octiron";
  const self = { [name]: (predicate, children) => {
    const passes = predicate(self);
    if (passes) {
      return children;
    }
    return null;
  } }[name];
  self.id = parentArgs.store.key();
  self.isOctiron = true;
  self.octironType = octironType;
  self.readonly = true;
  self.value = (_b = rendererArgs.value) != null ? _b : null;
  self.store = parentArgs.store;
  self.index = (_c = rendererArgs.index) != null ? _c : 0;
  self.position = -1;
  self.expand = (typeOrTerm) => parentArgs.store.expand(typeOrTerm);
  childArgs.parent = self;
  childArgs.store = (_d = factoryArgs.store) != null ? _d : parentArgs.store;
  childArgs.typeDefs = (_e = factoryArgs.typeDefs) != null ? _e : parentArgs.typeDefs;
  if (typeKey !== TypeKeys["root"]) {
    self.propType = rendererArgs.propType;
    self.dataType = getDataType(rendererArgs.value);
  }
  self.not = (predicate, children) => {
    if (self == null) {
      return null;
    }
    const passes = predicate(self);
    if (!passes) {
      return children;
    }
    return null;
  };
  self.get = (termOrType) => {
    var _a2, _b2;
    if (!isJSONObject(self.value)) {
      return null;
    }
    if (termOrType.startsWith("@")) {
      return self.value[termOrType];
    }
    const type = self.store.expand(termOrType);
    const value = (_a2 = self.value[type]) != null ? _a2 : null;
    if (isIterable(value)) {
      return getIterableValue(value);
    }
    return (_b2 = self.value[type]) != null ? _b2 : null;
  };
  self.enter = (arg1, arg2, arg3) => {
    const [selector, args, view] = unravelArgs(arg1, arg2, arg3);
    return m7(SelectionRenderer, {
      entity: true,
      selector,
      args,
      view,
      parentArgs: childArgs
    });
  };
  const rootChildArgs = __spreadProps(__spreadValues({}, childArgs), {
    value: (_f = parentArgs.store.entity(parentArgs.store.rootIRI)) == null ? void 0 : _f.value
  });
  self.root = (arg1, arg2, arg3) => {
    let selector;
    const [childSelector, args, view] = unravelArgs(arg1, arg2, arg3);
    if (childSelector == null) {
      selector = parentArgs.store.rootIRI;
    } else {
      selector = `${parentArgs.store.rootIRI} ${childSelector}`;
    }
    return m7(SelectionRenderer, {
      entity: true,
      selector,
      args,
      view,
      parentArgs: rootChildArgs
    });
  };
  switch (typeKey) {
    case TypeKeys["root"]:
      self.select = self.root;
      break;
    case TypeKeys["selection"]:
      self.select = (arg1, arg2, arg3) => {
        const [selector, args, view] = unravelArgs(arg1, arg2, arg3);
        if (!isJSONObject(rendererArgs.value)) {
          return null;
        }
        return m7(
          SelectionRenderer,
          {
            selector,
            args,
            view,
            parentArgs: childArgs
          }
        );
      };
  }
  switch (typeKey) {
    case TypeKeys["root"]:
      self.present = self.root;
      break;
    default:
      self.present = (args) => {
        return m7(PresentRenderer, {
          o: self,
          args,
          factoryArgs,
          parentArgs,
          rendererArgs
        });
      };
  }
  self.default = (args) => {
    return self.present(Object.assign({ component: null }, args));
  };
  switch (typeKey) {
    case TypeKeys["root"]:
      self.perform = (arg1, arg2, arg3) => {
        if (typeof arg1 === "string") {
          return self.root(arg1, (o) => o.perform(
            arg2,
            arg3
          ));
        }
        return self.root((o) => o.perform(
          arg2,
          arg3
        ));
      };
      break;
    default: {
      self.perform = (arg1, arg2, arg3) => {
        const [selector, args, view] = unravelArgs(arg1, arg2, arg3);
        if (typeof selector === "string") {
          return self.select(selector, (o) => o.perform(args, view));
        }
        return m7(PerformRenderer, {
          selector,
          args,
          view,
          parentArgs: childArgs
        });
      };
      break;
    }
  }
  if (typeKey !== TypeKeys["root"]) {
    const updateArgs = (type, args) => {
      const currentArgs = type === "args" ? factoryArgs : type === "parent" ? parentArgs : rendererArgs;
      for (const key of Object.keys(currentArgs)) {
        delete currentArgs[key];
      }
      for (const [key, value] of Object.entries(args)) {
        currentArgs[key] = value;
      }
    };
    self._updateArgs = updateArgs;
  }
  return self;
}

// lib/factories/rootFactory.ts
function rootFactory(parentArgs) {
  const factoryArgs = {};
  const self = octironFactory(
    "root",
    factoryArgs,
    parentArgs
  );
  return self;
}

// lib/alternatives/htmlFragments.ts
import m8 from "mithril";
import { processTemplate } from "@longform/longform";
function fragmentToHTML(fragment) {
  let html = "";
  for (let i = 0; i < fragment.length; i++) {
    html += fragment[i].outerHTML;
  }
  return html;
}
var HTMLFragmentsIntegrationComponent = () => {
  let fragment;
  let html;
  function setDomServer(attrs) {
    var _a;
    if (fragment === attrs.fragment) {
      return;
    }
    fragment = attrs.fragment;
    if (attrs.fragment == null) {
      html = attrs.output.root;
      return;
    }
    const [id, rest] = attrs.fragment.split("?");
    if (rest == null) {
      html = (_a = attrs.output.fragments[id]) == null ? void 0 : _a.html;
      return;
    }
    const template = attrs.output.templates[id];
    if (template == null) {
      return;
    }
    try {
      const args = Object.fromEntries(new URLSearchParams(rest));
      html = processTemplate(template, args, (fragment2) => {
        var _a2;
        return (_a2 = attrs.output.fragments[fragment2]) == null ? void 0 : _a2.html;
      });
    } catch (err) {
      console.error(err);
    }
  }
  function setDomClient(attrs) {
    if (attrs.fragment == null) {
      if (attrs.output.root != null && attrs.output.dom == null) {
        const template2 = document.createElement("template");
        template2.innerHTML = attrs.output.root;
        attrs.output.dom = Array.from(template2.content.children);
      }
      html = attrs.output.dom;
      return;
    }
    const [id, rest] = attrs.fragment.split("?");
    const isTemplate = rest != null || attrs.output.templates[id] != null;
    if (!isTemplate) {
      const fragment2 = attrs.output.fragments[id];
      if (fragment2 == null) {
        return;
      } else if (fragment2.type === "text") {
        html = fragment2.html;
        return;
      } else if (fragment2.dom == null && fragment2.html != null) {
        const template2 = document.createElement("template");
        template2.innerHTML = fragment2.html;
        fragment2.dom = Array.from(template2.content.children);
      } else if (fragment2.dom == null) {
        return;
      }
      html = fragment2.dom;
      return;
    }
    const template = attrs.output.templates[id];
    if (template == null) {
      return;
    }
    try {
      const args = Object.fromEntries(new URLSearchParams(rest));
      html = processTemplate(template, args, (ref) => {
        var _a;
        if (attrs.output.fragments[ref] != null && attrs.output.fragments[ref].html == null && attrs.output.fragments[ref].dom != null) {
          attrs.output.fragments[ref].html = fragmentToHTML(attrs.output.fragments[ref].dom);
        }
        return (_a = attrs.output.fragments[ref]) == null ? void 0 : _a.html;
      });
    } catch (err) {
      console.error(err);
    }
  }
  return {
    oninit({ attrs }) {
      if (isBrowserRender) {
        setDomClient(attrs);
      } else {
        setDomServer(attrs);
      }
    },
    view() {
      if (isBrowserRender && Array.isArray(html)) {
        return m8.dom(html);
      } else if (typeof html === "string") {
        return m8.trust(html);
      }
      return null;
    }
  };
};
var _rootRendered, _rendered, _iri, _contentType, _handler, _output, _HTMLFragmentsIntegration_instances, fragmentHTML_fn;
var _HTMLFragmentsIntegration = class _HTMLFragmentsIntegration {
  constructor(handler, {
    iri,
    contentType,
    output
  }) {
    __privateAdd(this, _HTMLFragmentsIntegration_instances);
    __publicField(this, "integrationType", "html-fragments");
    __privateAdd(this, _rootRendered, false);
    __privateAdd(this, _rendered, /* @__PURE__ */ new Set());
    __privateAdd(this, _iri);
    __privateAdd(this, _contentType);
    __privateAdd(this, _handler);
    __privateAdd(this, _output);
    __privateSet(this, _handler, handler);
    __privateSet(this, _iri, iri);
    __privateSet(this, _contentType, contentType);
    __privateSet(this, _output, output);
  }
  get iri() {
    return __privateGet(this, _iri);
  }
  get contentType() {
    return __privateGet(this, _contentType);
  }
  get output() {
    return __privateGet(this, _output);
  }
  getFragment(fragment) {
    var _a, _b, _c;
    return fragment != null ? (_b = (_a = __privateGet(this, _output).fragments[fragment]) == null ? void 0 : _a.html) != null ? _b : null : (_c = __privateGet(this, _output).root) != null ? _c : null;
  }
  /**
   * Returns a text representaion of a fragment.
   */
  text(fragment) {
    if (fragment == null) {
      if (this.output.root == null && __privateGet(this, _output).dom) {
        this.output.root = __privateMethod(this, _HTMLFragmentsIntegration_instances, fragmentHTML_fn).call(this, __privateGet(this, _output).dom);
      }
      return this.output.root;
    }
    const [id, rest] = fragment.split("?");
    if (rest == null) {
      const fragment2 = __privateGet(this, _output).fragments[id];
      if (fragment2 == null) {
        return;
      }
      if (fragment2.html == null && fragment2.dom) {
        fragment2.html = __privateMethod(this, _HTMLFragmentsIntegration_instances, fragmentHTML_fn).call(this, fragment2.dom);
      }
      return fragment2.html;
    }
    const template = __privateGet(this, _output).templates[id];
    if (template == null) {
      return;
    }
    try {
      const args = Object.fromEntries(new URLSearchParams(rest));
      return processTemplate(
        template,
        args,
        (ref) => {
          const fragment2 = __privateGet(this, _output).fragments[ref];
          if (fragment2 == null) return;
          if (fragment2.html == null && fragment2.dom != null) {
            fragment2.html = __privateMethod(this, _HTMLFragmentsIntegration_instances, fragmentHTML_fn).call(this, fragment2.dom);
          }
          return fragment2.html;
        }
      );
    } catch (err) {
      console.error(err);
    }
  }
  render(o, fragment) {
    if (!isBrowserRender) {
      if (fragment == null) {
        __privateSet(this, _rootRendered, true);
      } else {
        __privateGet(this, _rendered).add(fragment);
      }
    }
    return m8(HTMLFragmentsIntegrationComponent, {
      o,
      integration: this,
      fragment,
      output: __privateGet(this, _output)
    });
  }
  getStateInfo() {
    const texts = {};
    const fragments = [];
    const entries = Object.values(__privateGet(this, _output).fragments);
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].type === "text") {
        texts[entries[i].id] = entries[i].html;
      } else {
        fragments.push({
          id: entries[i].id,
          type: entries[i].type,
          selector: entries[i].selector,
          rendered: __privateGet(this, _rendered).has(entries[i].id)
        });
      }
    }
    return {
      iri: __privateGet(this, _iri),
      contentType: __privateGet(this, _contentType),
      rendered: __privateGet(this, _rootRendered),
      selector: __privateGet(this, _output).selector,
      templates: __privateGet(this, _output).templates,
      texts,
      fragments
    };
  }
  toInitialState() {
    let html = "";
    const entries = Object.values(__privateGet(this, _output).fragments);
    if (__privateGet(this, _output).root != null && !__privateGet(this, _rootRendered)) {
      html += `<template id="htmlfrag:${__privateGet(this, _iri)}|${__privateGet(this, _contentType)}">${__privateGet(this, _output).root}</template>
`;
    }
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].type === "text") {
        continue;
      }
      if (!__privateGet(this, _rendered).has(entries[i].id)) {
        html += `<template data-htmlfrag="${entries[i].id}">${entries[i].html}</template>
`;
      }
    }
    return html;
  }
  static fromInitialState(handler, {
    iri,
    contentType,
    rendered,
    selector,
    texts,
    fragments,
    templates
  }) {
    const output = /* @__PURE__ */ Object.create(null);
    output.fragments = /* @__PURE__ */ Object.create(null);
    output.templates = templates;
    if (selector != null && rendered) {
      const element = document.querySelector(selector);
      if (element != null) {
        output.root = element.outerHTML;
      }
    } else if (selector != null) {
      const template = document.getElementById(`htmlfrag:${iri}|${contentType}`);
      output.root = template == null ? void 0 : template.textContent;
    }
    const textEntries = Object.entries(texts);
    for (let i = 0; i < textEntries.length; i++) {
      output.fragments[textEntries[i][0]] = {
        id: textEntries[i][0],
        type: "text",
        html: textEntries[i][1],
        selector: ""
      };
    }
    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i];
      const dom = document.createDocumentFragment();
      if (fragment.rendered) {
        let element;
        switch (fragment.type) {
          case "embed": {
            element = document.getElementById(fragment.id);
            if (element == null) {
              break;
            }
            output.fragments[fragment.id] = {
              id: fragment.id,
              type: fragment.type,
              dom: [element],
              selector: fragment.selector
            };
            break;
          }
          case "bare": {
            element = document.querySelector(fragment.selector);
            if (element == null) {
              break;
            }
            output.fragments[fragment.id] = {
              id: fragment.id,
              type: fragment.type,
              dom: [element],
              selector: fragment.selector
            };
            break;
          }
          case "range": {
            const elements = document.querySelectorAll(fragment.selector);
            output.fragments[fragment.id] = {
              id: fragment.id,
              type: fragment.type,
              selector: fragment.selector,
              dom: Array.from(elements)
            };
          }
        }
      } else {
        const template = document.querySelector(`[data-htmlfrag="${fragment.id}"]`);
        if (template == null) {
          continue;
        }
        output.fragments[fragment.id] = {
          id: fragment.id,
          type: fragment.type,
          dom: Array.from(template.content.children),
          selector: fragment.selector
        };
      }
    }
    return new _HTMLFragmentsIntegration(handler, {
      contentType,
      iri,
      output
    });
  }
};
_rootRendered = new WeakMap();
_rendered = new WeakMap();
_iri = new WeakMap();
_contentType = new WeakMap();
_handler = new WeakMap();
_output = new WeakMap();
_HTMLFragmentsIntegration_instances = new WeakSet();
fragmentHTML_fn = function(fragment) {
  let html = "";
  for (let i = 0; i < fragment.children.length; i++) {
    html += fragment.children[i].outerHTML;
  }
  return html;
};
__publicField(_HTMLFragmentsIntegration, "type", "html-fragments");
var HTMLFragmentsIntegration = _HTMLFragmentsIntegration;

// lib/failures.ts
var _status, _res;
var HTTPFailure = class {
  constructor(status, res) {
    __privateAdd(this, _status);
    __privateAdd(this, _res);
    __privateSet(this, _status, status);
    __privateSet(this, _res, res);
  }
  get status() {
    return __privateGet(this, _status);
  }
  get res() {
    return __privateGet(this, _res);
  }
  undefined() {
    return null;
  }
  http(arg) {
    if (typeof arg === "function") {
      return arg(__privateGet(this, _status));
    }
    return arg;
  }
  unparserable() {
    return null;
  }
};
_status = new WeakMap();
_res = new WeakMap();

// lib/utils/flattenIRIObjects.ts
function flattenIRIObjects(value, agg = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      flattenIRIObjects(item, agg);
    }
  } else if (isJSONObject(value)) {
    if (isMetadataObject(value)) {
      return agg;
    }
    if (isIRIObject(value)) {
      agg.push(value);
    }
    if (isValueObject(value)) {
      flattenIRIObjects(value["@value"], agg);
    } else if (isIterable(value)) {
      flattenIRIObjects(getIterableValue(value), agg);
    } else {
      for (const [term, item] of Object.entries(value)) {
        if (term.startsWith("@")) {
          continue;
        }
        flattenIRIObjects(item, agg);
      }
    }
  }
  return agg;
}

// lib/store.ts
var defaultAccept = "application/problem+json, application/ld+json";
var integrationClasses = {
  // [HTMLIntegration.type]: HTMLIntegration,
  [HTMLFragmentsIntegration.type]: HTMLFragmentsIntegration
};
function getJSONLdValues(vocab, aliases) {
  const aliasMap = /* @__PURE__ */ new Map();
  const context = {};
  if (vocab != null) {
    context["@vocab"] = vocab;
  }
  if (aliases == null) {
    return [aliasMap, context];
  }
  for (const [key, value] of Object.entries(aliases)) {
    context[key] = value;
    aliasMap.set(key, value);
  }
  return [aliasMap, context];
}
function getInternalHeaderValues(headers, origins) {
  const internalHeaders = new Headers([["accept", defaultAccept]]);
  const internalOrigins = /* @__PURE__ */ new Map();
  if (headers != null) {
    for (const [key, value] of Object.entries(headers)) {
      internalHeaders.set(key, value);
    }
  }
  if (origins != null) {
    for (const [origin, headers2] of Object.entries(origins)) {
      const internalHeaders2 = new Headers([["accept", defaultAccept]]);
      for (const [key, value] of Object.entries(headers2)) {
        internalHeaders2.set(key, value);
      }
      internalOrigins.set(origin, internalHeaders2);
    }
  }
  return [internalHeaders, internalOrigins];
}
var _rootIRI, _rootOrigin, _headers, _origins, _vocab, _aliases, _primary, _loading, _integrations, _handlers, _keys, _context, _termExpansions, _fetcher, _responseHook, _dependencies, _listeners, _acceptMap, _Store_instances, makeCleanupFn_fn, getLoadingKey_fn, publish_fn, handleJSONLD_fn, callFetcher_fn;
var _Store = class _Store {
  constructor(args) {
    __privateAdd(this, _Store_instances);
    __privateAdd(this, _rootIRI);
    __privateAdd(this, _rootOrigin);
    __privateAdd(this, _headers);
    __privateAdd(this, _origins);
    __privateAdd(this, _vocab);
    __privateAdd(this, _aliases);
    __privateAdd(this, _primary, /* @__PURE__ */ new Map());
    __privateAdd(this, _loading, /* @__PURE__ */ new Set());
    __privateAdd(this, _integrations, /* @__PURE__ */ new Map());
    __privateAdd(this, _handlers);
    __privateAdd(this, _keys, /* @__PURE__ */ new Set());
    __privateAdd(this, _context);
    __privateAdd(this, _termExpansions, /* @__PURE__ */ new Map());
    __privateAdd(this, _fetcher);
    __privateAdd(this, _responseHook);
    __privateAdd(this, _dependencies, /* @__PURE__ */ new Map());
    __privateAdd(this, _listeners, /* @__PURE__ */ new Map());
    // iri => accept => [loading, contentType]
    __privateAdd(this, _acceptMap, /* @__PURE__ */ new Map());
    var _a, _b;
    __privateSet(this, _rootIRI, args.rootIRI);
    __privateSet(this, _rootOrigin, new URL(args.rootIRI).origin);
    __privateSet(this, _vocab, args.vocab);
    __privateSet(this, _fetcher, args.fetcher);
    __privateSet(this, _responseHook, args.responseHook);
    [__privateWrapper(this, _headers)._, __privateWrapper(this, _origins)._] = getInternalHeaderValues(args.headers, args.origins);
    [__privateWrapper(this, _aliases)._, __privateWrapper(this, _context)._] = getJSONLdValues(args.vocab, args.aliases);
    __privateSet(this, _handlers, new Map((_b = (_a = args.handlers) == null ? void 0 : _a.map) == null ? void 0 : _b.call(_a, (handler) => [handler.contentType, handler])));
    if (args.primary != null) {
      __privateSet(this, _primary, new Map(Object.entries(args.primary)));
    }
    if (!__privateGet(this, _headers).has("accept")) {
      __privateGet(this, _headers).set("accept", defaultAccept);
    }
    for (const origin of Object.values(__privateGet(this, _origins))) {
      if (!origin.has("accept")) {
        origin.set("accept", defaultAccept);
      }
    }
    if (args.acceptMap != null) {
      for (const [accept, entries] of Object.entries(args.acceptMap)) {
        __privateGet(this, _acceptMap).set(accept, new Map(entries));
      }
    }
    if (args.alternatives != null) {
      __privateSet(this, _integrations, args.alternatives);
    }
  }
  get rootIRI() {
    return __privateGet(this, _rootIRI);
  }
  /**
   * Retrieves an entity state object relating to an IRI.
   */
  entity(iri, accept) {
    var _a, _b, _c, _d;
    if (accept == null) {
      return (_a = __privateGet(this, _primary).get(iri)) != null ? _a : null;
    }
    const contentType = (_c = (_b = __privateGet(this, _acceptMap).get(iri)) == null ? void 0 : _b.get) == null ? void 0 : _c.call(_b, accept);
    if (contentType == null) {
      return null;
    }
    const integration = (_d = __privateGet(this, _integrations).get(contentType)) == null ? void 0 : _d.get(iri);
    if (integration == null) {
      return null;
    }
    return {
      type: "alternative-success",
      iri,
      loading: false,
      ok: true,
      integration
    };
  }
  /**
   * Retrieves a text representation of a value in the store
   * if it is supported by the int4egration.
   */
  text(iri, accept) {
    const [key, fragment] = iri.split("#");
    const entity = this.entity(key, accept);
    if (entity == null) {
      return;
    }
    if ((entity == null ? void 0 : entity.type) === "alternative-success") {
      return entity.integration.text(fragment);
    }
  }
  get vocab() {
    return __privateGet(this, _vocab);
  }
  get aliases() {
    return Object.fromEntries(
      __privateGet(this, _aliases).entries().map(([key, value]) => [key.replace(/^/, ""), value])
    );
  }
  get context() {
    return __privateGet(this, _context);
  }
  /**
   * Expands a term to a type.
   *
   * If an already expanded JSON-ld type is given it will
   * return the input value.
   */
  expand(termOrType) {
    const sym = Symbol.for(termOrType);
    const cached = __privateGet(this, _termExpansions).get(sym);
    if (cached != null) {
      return cached;
    }
    let expanded;
    if (__privateGet(this, _vocab) != null && !/^[\w\d]+\:/.test(termOrType)) {
      expanded = __privateGet(this, _vocab) + termOrType;
    } else if (/https?:\/\//.test(termOrType)) {
      expanded = termOrType;
    } else {
      for (const [key, value] of __privateGet(this, _aliases)) {
        const reg = new RegExp(`^${key}:`);
        if (reg.test(termOrType)) {
          expanded = termOrType.replace(reg, value);
          break;
        }
      }
    }
    __privateGet(this, _termExpansions).set(sym, expanded != null ? expanded : termOrType);
    return expanded != null ? expanded : termOrType;
  }
  select(selector, value, {
    accept
  } = {}) {
    return getSelection({
      selector,
      value,
      accept,
      store: this
    });
  }
  /**
   * Generates a unique key for server rendering only.
   */
  key() {
    while (true) {
      const key = `oct-${Math.random().toString(36).slice(2, 7)}`;
      if (!__privateGet(this, _keys).has(key)) {
        __privateGet(this, _keys).add(key);
        return key;
      }
    }
  }
  isLoading(iri) {
    const loadingKey = __privateMethod(this, _Store_instances, getLoadingKey_fn).call(this, iri, "get");
    return __privateGet(this, _loading).has(loadingKey);
  }
  handleResponse(_0) {
    return __async(this, arguments, function* (res, iri = res.url.toString()) {
      var _a, _b, _c;
      const contentType = (_c = (_b = (_a = res.headers.get("content-type")) == null ? void 0 : _a.split) == null ? void 0 : _b.call(_a, ";")) == null ? void 0 : _c[0];
      if (contentType == null) {
        throw new Error("Content type not specified in response");
      }
      const handler = __privateGet(this, _handlers).get(contentType);
      if (handler == null) {
        throw new Error(`No handler configured for content type "${contentType}"`);
      }
      if (handler.integrationType === "jsonld") {
        const output = yield handler.handler({
          res,
          store: this
        });
        __privateMethod(this, _Store_instances, handleJSONLD_fn).call(this, {
          iri,
          res,
          output
        });
      } else if (handler.integrationType === "problem-details") {
        throw new Error("Problem details response types not supported yet");
      } else if (handler.integrationType === "html-fragments") {
        const output = yield handler.handler({
          res,
          store: this
        });
        let integrations = __privateGet(this, _integrations).get(contentType);
        if (integrations == null) {
          integrations = /* @__PURE__ */ new Map();
          __privateGet(this, _integrations).set(contentType, integrations);
        }
        integrations.set(iri, new HTMLFragmentsIntegration(handler, {
          iri,
          contentType,
          output
        }));
      }
      if (handler.integrationType !== "jsonld") {
        __privateMethod(this, _Store_instances, publish_fn).call(this, iri, contentType);
      }
    });
  }
  subscribe({
    key,
    selector,
    fragment,
    accept,
    value,
    listener
  }) {
    const details = getSelection({
      selector,
      fragment,
      accept,
      value,
      store: this
    });
    const cleanup = __privateMethod(this, _Store_instances, makeCleanupFn_fn).call(this, key, details);
    for (const dependency of details.dependencies) {
      const depSet = __privateGet(this, _dependencies).get(dependency);
      if (depSet == null) {
        __privateGet(this, _dependencies).set(dependency, /* @__PURE__ */ new Set([key]));
      } else {
        depSet.add(key);
      }
    }
    __privateGet(this, _listeners).set(key, {
      key,
      selector,
      value,
      fragment,
      accept,
      required: details.required,
      dependencies: details.dependencies,
      listener,
      cleanup
    });
    return details;
  }
  unsubscribe(key) {
    var _a;
    (_a = __privateGet(this, _listeners).get(key)) == null ? void 0 : _a.cleanup();
  }
  fetch(iri, accept) {
    return __async(this, null, function* () {
      yield __privateMethod(this, _Store_instances, callFetcher_fn).call(this, iri, { accept });
      return __privateGet(this, _primary).get(iri);
    });
  }
  /**
   * Submits an action. Like fetch this will overwrite
   * entities in the store with any entities returned
   * in the response.
   *
   * @param {string} iri                The iri of the request.
   * @param {SubmitArgs} [args]         Arguments to pass to the fetch call.
   * @param {string} [args.method]      The http submit method.
   * @param {string} [args.contentType] The content type header value.
   * @param {string} [args.body]        The body of the request.
   */
  submit(iri, args) {
    return __async(this, null, function* () {
      yield __privateMethod(this, _Store_instances, callFetcher_fn).call(this, iri, __spreadProps(__spreadValues({}, args), {
        contentType: "application/ld+json"
      }));
      return this.entity(iri);
    });
  }
  /**
   * Creates an Octiron store from initial state written to the page's HTML.
   *
   * @param rootIRI       The root endpoint of the API.
   * @param [disableLogs] Disables warning and error logs if the initial state
   *                      is not present or corrupt.
   * @param [vocab]       The JSON-ld @vocab to use for Octiron selectors.
   * @param [aliases]     The JSON-ld aliases to use for Octiron selectors.
   * @param [headers]     Headers to send when making requests to endpoints sharing
   *                      origins with the `rootIRI`.
   * @param [origins]     A map of origins and the headers to use when sending
   *                      requests to them. Octiron will only send requests
   *                      to endpoints which share origins with the `rootIRI`
   *                      or are configured in the origins object. Aside
   *                      from the accept header, which has a common default
   *                      value, headers are not shared between origins.
   */
  static fromInitialState({
    disableLogs,
    rootIRI,
    vocab,
    aliases,
    headers,
    origins,
    handlers = []
  }) {
    performance.mark("octiron:from-initial-state:start");
    const storeArgs = {
      rootIRI,
      vocab,
      aliases,
      handlers,
      headers,
      origins
    };
    try {
      const el = document.getElementById("oct-state");
      if (el == null) {
        if (!disableLogs) {
          console.warn("Failed to construct Octiron state from initial state");
        }
        return new _Store(storeArgs);
      }
      const stateInfo = JSON.parse(el.innerText);
      const alternatives = /* @__PURE__ */ new Map();
      const handlersMap = handlers.reduce((acc, handler) => __spreadProps(__spreadValues({}, acc), {
        [handler.contentType]: handler
      }), {});
      for (const [integrationType, entities] of Object.entries(stateInfo.alternatives)) {
        for (const stateInfo2 of entities) {
          const handler = handlersMap[stateInfo2.contentType];
          const cls = integrationClasses[integrationType];
          if (cls.type !== handler.integrationType) {
            continue;
          }
          const state = cls.fromInitialState(handler, stateInfo2);
          if (state == null) {
            continue;
          }
          let integrations = alternatives.get(state.contentType);
          if (integrations == null) {
            integrations = /* @__PURE__ */ new Map();
            alternatives.set(state.contentType, integrations);
          }
          integrations.set(state.iri, state);
        }
      }
      const store = new _Store(__spreadProps(__spreadValues({}, storeArgs), {
        alternatives,
        primary: stateInfo.primary,
        acceptMap: stateInfo.acceptMap
      }));
      performance.mark("octiron:from-initial-state:end");
      performance.measure("octiron:from-initial-state:duration", "octiron:from-initial-state:start", "octiron:from-initial-state:end");
      return store;
    } catch (err) {
      if (!disableLogs) {
        console.warn("Failed to construct Octiron state from initial state");
        console.error(err);
      }
      const store = new _Store(storeArgs);
      performance.mark("octiron:from-initial-state:end");
      performance.measure("octiron:from-initial-state:duration", "octiron:from-initial-state:start", "octiron:from-initial-state:end");
      return store;
    }
  }
  /**
   * Writes the Octiron store's state to a string to be embedded
   * near the end of a HTML document. Ideally this is placed before
   * the closing of the document's body tag. Octiron uses ids prefixed
   * with `oct-`, avoid using these ids to prevent id collision.
   */
  toInitialState() {
    let html = "";
    const stateInfo = {
      primary: Object.fromEntries(__privateGet(this, _primary)),
      alternatives: {},
      acceptMap: {}
    };
    for (const [accept, map] of __privateGet(this, _acceptMap).entries()) {
      stateInfo.acceptMap[accept] = Array.from(map.entries());
    }
    for (const alternative of __privateGet(this, _integrations).values()) {
      for (const integration of alternative.values()) {
        if (stateInfo.alternatives[integration.integrationType] == null) {
          stateInfo.alternatives[integration.integrationType] = [
            integration.getStateInfo()
          ];
        } else {
          stateInfo.alternatives[integration.integrationType].push(integration.getStateInfo());
        }
        html += integration.toInitialState();
      }
    }
    html += `<script id="oct-state" type="application/json">${JSON.stringify(stateInfo)}<\/script>`;
    return html;
  }
};
_rootIRI = new WeakMap();
_rootOrigin = new WeakMap();
_headers = new WeakMap();
_origins = new WeakMap();
_vocab = new WeakMap();
_aliases = new WeakMap();
_primary = new WeakMap();
_loading = new WeakMap();
_integrations = new WeakMap();
_handlers = new WeakMap();
_keys = new WeakMap();
_context = new WeakMap();
_termExpansions = new WeakMap();
_fetcher = new WeakMap();
_responseHook = new WeakMap();
_dependencies = new WeakMap();
_listeners = new WeakMap();
_acceptMap = new WeakMap();
_Store_instances = new WeakSet();
/**
 * Creates a cleanup function which should be called
 * when a subscriber unlistens.
 */
makeCleanupFn_fn = function(key, details) {
  return () => {
    __privateGet(this, _listeners).delete(key);
    for (const dependency of details.dependencies) {
      __privateGet(this, _dependencies).delete(dependency);
      if (isBrowserRender) {
        setTimeout(() => {
          var _a;
          if (((_a = __privateGet(this, _dependencies).get(dependency)) == null ? void 0 : _a.size) === 0) {
            __privateGet(this, _primary).delete(dependency);
          }
        }, 5e3);
      }
    }
  };
};
/**
 * Creates a unique key for the ir, method and accept headers
 * to be used to mark the request's loading status.
 */
getLoadingKey_fn = function(iri, method, accept) {
  var _a;
  accept = (_a = accept != null ? accept : __privateGet(this, _headers).get("accept")) != null ? _a : defaultAccept;
  return `${method == null ? void 0 : method.toLowerCase()}|${iri}|${accept.toLowerCase()}`;
};
/**
 * Called on change to an entity. All listeners with dependencies in their
 * selection for this entity have the latest selection result pushed to
 * their listener functions.
 */
publish_fn = function(iri, _contentType2) {
  const keys = __privateGet(this, _dependencies).get(iri);
  if (keys == null) {
    return;
  }
  for (const key of keys) {
    const listenerDetails = __privateGet(this, _listeners).get(key);
    if (listenerDetails == null) {
      continue;
    }
    const details = getSelection({
      selector: listenerDetails.selector,
      value: listenerDetails.value,
      fragment: listenerDetails.fragment,
      accept: listenerDetails.accept,
      store: this
    });
    const cleanup = __privateMethod(this, _Store_instances, makeCleanupFn_fn).call(this, key, details);
    for (const dependency of details.dependencies) {
      let depSet = __privateGet(this, _dependencies).get(dependency);
      if (depSet == null) {
        depSet = /* @__PURE__ */ new Set([key]);
        __privateGet(this, _dependencies).set(dependency, depSet);
      } else {
        depSet.add(key);
      }
    }
    listenerDetails.cleanup = cleanup;
    listenerDetails.listener(details);
  }
};
handleJSONLD_fn = function({
  iri,
  res,
  output
}) {
  const iris = [iri];
  if (res.ok) {
    __privateGet(this, _primary).set(iri, {
      type: "entity-success",
      iri,
      loading: false,
      ok: true,
      value: output.jsonld
    });
  } else {
    const reason = new HTTPFailure(res.status, res);
    __privateGet(this, _primary).set(iri, {
      type: "entity-failure",
      iri,
      loading: false,
      ok: false,
      value: output.jsonld,
      status: res.status,
      reason
    });
  }
  for (const entity of flattenIRIObjects(output.jsonld)) {
    if (iris.includes(entity["@id"])) {
      continue;
    }
    __privateGet(this, _primary).set(entity["@id"], {
      type: "entity-success",
      iri: entity["@id"],
      loading: false,
      ok: true,
      value: entity
    });
  }
  for (const iri2 of iris) {
    __privateMethod(this, _Store_instances, publish_fn).call(this, iri2);
  }
};
callFetcher_fn = function(_0) {
  return __async(this, arguments, function* (iri, args = {}) {
    var _a, _b;
    let headers;
    const url = new URL(iri);
    const method = args.method || "get";
    const accept = (_b = (_a = args.accept) != null ? _a : __privateGet(this, _headers).get("accept")) != null ? _b : defaultAccept;
    url.hash = "";
    const dispatchURL = url.toString();
    const loadingKey = __privateMethod(this, _Store_instances, getLoadingKey_fn).call(this, dispatchURL, method, args.accept);
    if (url.origin === __privateGet(this, _rootOrigin)) {
      headers = new Headers(__privateGet(this, _headers));
    } else if (__privateGet(this, _origins).has(url.origin)) {
      headers = new Headers(__privateGet(this, _origins).get(url.origin));
    } else {
      throw new Error("Unconfigured origin");
    }
    if (args.body != null && args.contentType != null) {
      headers.set("content-type", args.contentType);
    }
    if (accept != null) {
      headers.set("accept", accept);
    } else if (headers.get("accept") == null) {
      headers.set("accept", defaultAccept);
    }
    __privateGet(this, _loading).add(loadingKey);
    mithrilRedraw();
    const promise = new Promise((resolve) => {
      (() => __async(this, null, function* () {
        var _a2;
        let res = null;
        if (__privateGet(this, _fetcher) != null) {
          res = yield __privateGet(this, _fetcher).call(this, dispatchURL, {
            method,
            headers,
            body: args.body
          });
        } else {
          res = yield fetch(dispatchURL, {
            method,
            headers,
            body: args.body
          });
        }
        if (args.accept != null && __privateGet(this, _acceptMap).has(dispatchURL)) {
          (_a2 = __privateGet(this, _acceptMap).get(dispatchURL)) == null ? void 0 : _a2.set(args.accept, res.headers.get("content-type"));
        } else if (args.accept != null) {
          __privateGet(this, _acceptMap).set(dispatchURL, /* @__PURE__ */ new Map([[args.accept, res.headers.get("content-type")]]));
        }
        yield this.handleResponse(res, iri);
        __privateGet(this, _loading).delete(loadingKey);
        mithrilRedraw();
        resolve(res);
      }))();
    });
    if (__privateGet(this, _responseHook) != null) {
      __privateGet(this, _responseHook).call(this, promise);
    }
    yield promise;
  });
};
var Store = _Store;

// lib/utils/makeTypeDefs.ts
function makeTypeDefs(storeOrTypeDef, ...typeDefs) {
  const config = {};
  if (storeOrTypeDef instanceof Store) {
    for (const typeDef of typeDefs) {
      config[storeOrTypeDef.expand(typeDef.type)] = typeDef;
    }
  } else {
    config[storeOrTypeDef.type] = storeOrTypeDef;
    for (const typeDef of typeDefs) {
      config[typeDef.type] = typeDef;
    }
  }
  return config;
}

// lib/utils/classes.ts
function classes(...classArgs) {
  const cls = [];
  for (const classArg of classArgs) {
    if (typeof classArg === "undefined" || classArg === null) {
      continue;
    } else if (typeof classArg === "string") {
      cls.push(classArg);
    } else if (Array.isArray(classArg)) {
      for (const name of classArg) {
        cls.push(name);
      }
    } else {
      for (const [name, active] of Object.entries(classArg)) {
        if (active) {
          cls.push(name);
        }
      }
    }
  }
  return cls.join(" ");
}

// lib/utils/makeTypeDef.ts
function makeTypeDef(typeDef) {
  return typeDef;
}

// lib/handlers/jsonLDHandler.ts
import jsonld from "jsonld";
var jsonLDHandler = {
  integrationType: "jsonld",
  contentType: "application/ld+json",
  handler: (_0) => __async(null, [_0], function* ({ res }) {
    const json = yield res.json();
    if (!isJSONObject(json) && !Array.isArray(json)) {
      throw new Error("JSON-LD Document should be an object");
    }
    const expanded = yield jsonld.expand(json, {
      documentLoader: (url) => __async(null, null, function* () {
        const res2 = yield fetch(url, {
          headers: {
            "accept": "application/ld+json"
          }
        });
        const document2 = yield res2.json();
        return {
          documentUrl: url,
          document: document2
        };
      })
    });
    const compacted = yield jsonld.compact(expanded, {});
    return {
      jsonld: compacted
    };
  })
};

// lib/handlers/longformHandler.ts
import { longform } from "@longform/longform";
var longformHandler = {
  integrationType: "html-fragments",
  contentType: "text/longform",
  handler: (_0) => __async(null, [_0], function* ({ res }) {
    return longform(yield res.text());
  })
};

// lib/components/OctironJSON.ts
import m9 from "mithril";
var OctironJSON = () => {
  function renderIRI(iri) {
    return m9("code", [
      m9("span.oct-json-quote", '"'),
      m9("a.oct-json-iri", {
        href: iri
      }, iri),
      m9("span.oct-json-quote", '"')
    ]);
  }
  function renderPrimitive(value) {
    const className = typeof value === "boolean" ? "oct-json-boolean" : typeof value === "number" ? "oct-json-number" : "oct-json-string";
    let presentValue;
    if (typeof value === "boolean" && value) {
      presentValue = "true";
    } else if (typeof value === "boolean") {
      presentValue === "false";
    } else if (typeof value === "string") {
      presentValue = [
        m9("span.oct-json-quote", '"'),
        value,
        m9("span.oct-json-quote", '"')
      ];
    } else {
      presentValue = value;
    }
    return m9("code", { className }, presentValue);
  }
  function renderArray(list, url, selector = "") {
    const children = [];
    for (let index = 0; index < list.length; index++) {
      const value = list[index];
      children.push(
        m9(
          "li.oct-json-arr-item",
          maybeRenderDetails(null, value, url, selector)
        )
      );
    }
    return m9("ul.oct-json-arr", children);
  }
  const terminalTypes = ["@id", "@type", "@context"];
  function renderObject(value, url, selector = "") {
    const items = [];
    const list = Object.entries(value).toSorted();
    for (let index = 0; index < list.length; index++) {
      const [term, value2] = list[index];
      let children;
      const summary = [
        m9("span.oct-json-quote", '"'),
        m9("span.oct-json-obj-key", term),
        m9("span.oct-json-quote", '"'),
        m9("span.oct-json-obj-colon", ": ")
      ];
      if (term === "@id") {
        children = [m9("code", summary), renderIRI(value2)];
      } else if (url == null || terminalTypes.includes(term)) {
        children = maybeRenderDetails(summary, value2);
      } else if (term.startsWith("@")) {
        children = maybeRenderDetails(summary, value2, url, selector);
      } else {
        const currentSelector = `${selector} ${term}`;
        const currentURL = new URL(url);
        currentURL.searchParams.set("selector", currentSelector);
        const summary2 = [
          m9("span.oct-json-quote", '"'),
          m9(
            "span.oct-json-obj-key",
            m9(
              "a",
              { href: currentURL },
              term
            )
          ),
          m9("span.oct-json-quote", '"'),
          m9("span.oct-json-obj-colon", ": ")
        ];
        children = maybeRenderDetails(summary2, value2, url, currentSelector);
      }
      items.push(m9("li.oct-json-obj-item", children));
    }
    return m9("ul.oct-json-obj", items);
  }
  function maybeRenderDetails(summary, value, url, selector = "") {
    if (isJSONObject(value)) {
      return [
        m9(
          "details.oct-json-details",
          { open: true },
          m9(
            "summary.oct-json-details-sum",
            m9("code", summary, m9("span.oct-json-obj-open", "{"))
          ),
          renderValue(value, url, selector)
        ),
        m9("code.oct-json-obj-close", "}")
      ];
    } else if (Array.isArray(value)) {
      return [
        m9(
          "details.oct-json-details",
          { open: true },
          m9(
            "summary.oct-json-details-sum",
            m9("code", summary, m9("span.oct-json-obj-open", "["))
          ),
          renderValue(value, url, selector)
        ),
        m9("code.oct-json-obj-close", "]")
      ];
    }
    return [m9("code", summary), renderValue(value, url, selector)];
  }
  function renderValue(value, url, selector = "") {
    if (isJSONObject(value)) {
      return renderObject(value, url, selector);
    } else if (Array.isArray(value)) {
      return renderArray(value, url, selector);
    }
    return renderPrimitive(value);
  }
  return {
    view: ({ attrs: { value, selector, location } }) => {
      const url = location != null ? new URL(location) : void 0;
      return m9(".oct-json", [
        maybeRenderDetails(
          null,
          value,
          url,
          typeof selector === "string" ? selector.trim() : void 0
        )
      ]);
    }
  };
};

// lib/components/OctironDebug.ts
import m10 from "mithril";
var OctironDebug = ({
  attrs
}) => {
  var _a;
  let currentAttrs = attrs;
  let value = attrs.o.value;
  let rendered;
  let presentationStyle = (_a = attrs.initialPresentationStyle) != null ? _a : "value";
  function onRender(redraw = true) {
    const { o } = currentAttrs;
    if (presentationStyle === "value") {
      rendered = m10(OctironJSON, {
        value,
        selector: currentAttrs.selector,
        location: currentAttrs.location
      });
    } else if (presentationStyle === "action-value" && (o.octironType === "action" || o.octironType === "action-selection")) {
      rendered = m10(OctironJSON, { value: o.actionValue.value, selector: currentAttrs.selector, location: currentAttrs.location });
    }
    if (redraw) {
      mithrilRedraw();
    }
  }
  function onSetValue(e) {
    e.redraw = false;
    presentationStyle = "value";
    onRender();
  }
  function onSetActionValue(e) {
    e.redraw = false;
    presentationStyle = "action-value";
    onRender();
  }
  function onSetComponent(e) {
    e.redraw = false;
    presentationStyle = "component";
    onRender();
  }
  return {
    oninit: ({ attrs: attrs2 }) => {
      currentAttrs = attrs2;
      onRender(false);
    },
    onbeforeupdate: ({ attrs: attrs2 }) => {
      if (attrs2.o.value !== value) {
        value = attrs2.o.value;
        onRender(true);
      }
    },
    view: ({ attrs: { o, availableControls } }) => {
      let children;
      let actionValueAction;
      const controls = [];
      if (presentationStyle === "component") {
        children = m10(".oct-debug-body", o.default());
      } else {
        children = m10(".oct-debug-body", rendered);
      }
      if (o.octironType === "action" || o.octironType === "action-selection") {
        actionValueAction = m10("button.oct-button", { type: "button", onclick: onSetActionValue }, "Action value");
      }
      if (availableControls == null || availableControls.includes("value")) {
        controls.push(
          m10("button.oct-button", { type: "button", onclick: onSetValue }, "Value")
        );
      } else if (actionValueAction != null && (availableControls == null || availableControls.includes("action-value"))) {
        controls.push(actionValueAction);
      } else if (availableControls == null || availableControls.includes("component")) {
        controls.push(
          m10("button.oct-button", { type: "button", onclick: onSetComponent }, "Component")
        );
      } else if (availableControls == null || availableControls.includes("log")) {
        controls.push(
          m10("button.oct-button", { type: "button", onclick: () => console.debug(o) }, "Log")
        );
      }
      return m10(
        "aside.oct-debug",
        m10(
          ".oct-debug-controls",
          m10(
            ".oct-button-group",
            ...controls
          )
        ),
        children
      );
    }
  };
};

// lib/components/OctironExplorer.ts
import m11 from "mithril";
var OctironExplorer = ({
  attrs
}) => {
  let value = attrs.selector || "";
  let previousSelector = value;
  let selector = value;
  let presentationStyle = attrs.presentationStyle || "debug";
  let onChange = attrs.onChange;
  const fallbackComponent = {
    view: ({ attrs: { o } }) => {
      return m11(OctironDebug, { o, location: attrs.location });
    }
  };
  function onSearch(evt) {
    value = evt.target.value;
  }
  function onEnter(evt) {
    if (evt.key === "Enter") {
      onApply();
    }
  }
  function onApply() {
    selector = value;
    if (typeof onChange === "function") {
      onChange(selector, presentationStyle);
    }
  }
  function onSetDebug(evt) {
    evt.preventDefault();
    presentationStyle = "debug";
    if (typeof onChange === "function") {
      onChange(selector, presentationStyle);
    }
  }
  function onSetComponents(evt) {
    evt.preventDefault();
    presentationStyle = "components";
    if (typeof onChange === "function") {
      onChange(selector, presentationStyle);
    }
  }
  return {
    oninit: ({ attrs: attrs2 }) => {
      onChange = attrs2.onChange;
    },
    onbeforeupdate: ({ attrs: attrs2 }) => {
      var _a;
      selector = (_a = attrs2.selector) != null ? _a : "";
      if (selector !== previousSelector) {
        value = previousSelector = selector;
      }
      onChange = attrs2.onChange;
    },
    view: ({ attrs: { autofocus, o } }) => {
      var _a, _b;
      let children;
      let upURL;
      let debugURL;
      let componentsURL;
      if (selector.length !== 0 && presentationStyle === "debug") {
        children = o.root(selector, (o2) => m11(OctironDebug, {
          o: o2,
          selector,
          location: attrs.location,
          initialPresentaionStyle: attrs.presentationStyle,
          availableControls: !!attrs.childControls == false ? void 0 : []
        }));
      } else if (selector.length !== 0) {
        children = o.root(
          selector,
          (o2) => m11("div", o2.default({ fallbackComponent, attrs: { selector } }))
        );
      } else if (presentationStyle === "debug") {
        children = o.root((o2) => m11(OctironDebug, {
          o: o2,
          selector,
          location: attrs.location,
          initialPresentaionStyle: attrs.presentationStyle,
          availableControls: !!attrs.childControls ? void 0 : []
        }));
      } else {
        children = o.root(
          (o2) => m11("div", o2.default({ fallbackComponent, attrs: { selector } }))
        );
      }
      if (attrs.location != null && selector.length !== 0) {
        const upSelector = attrs.selector.trim().includes(" ") ? attrs.selector.replace(/\s+([^\s]+)$/, "") : "";
        upURL = new URL(attrs.location);
        if (upSelector != null) {
          upURL.searchParams.set("selector", upSelector);
        } else {
          upURL.searchParams.delete("selector");
        }
      }
      if (attrs.location != null) {
        debugURL = new URL(attrs.location);
        componentsURL = new URL(attrs.location);
        debugURL.searchParams.set("presentationStyle", "debug");
        componentsURL.searchParams.set("presentationStyle", "components");
      }
      return m11(
        ".oct-explorer",
        m11(
          ".oct-explorer-controls",
          m11("form.oct-form-group", {
            action: (_b = (_a = attrs.location) == null ? void 0 : _a.toString) == null ? void 0 : _b.call(_a),
            onsubmit: (evt) => {
              evt.preventDefault();
              onApply();
            }
          }, [
            upURL != null ? m11("a.oct-button", { href: upURL.toString() }, "Up") : m11("button.oct-button", { type: "button", disabled: true }, "Up"),
            m11("input", {
              name: "selector",
              value,
              autofocus,
              oninput: onSearch,
              onkeypress: onEnter
            }),
            m11(
              "button.oct-button",
              {
                type: "submit",
                disabled: selector === value && typeof window !== "undefined"
              },
              "Apply"
            )
          ]),
          m11(
            ".oct-button-group",
            presentationStyle === "debug" || debugURL == null ? m11("button.oct-button", {
              type: "button",
              disabled: typeof window === "undefined",
              onclick: onSetDebug
            }, "Debug") : m11("a.oct-button", {
              href: debugURL.toString(),
              onclick: onSetDebug
            }, "Debug"),
            presentationStyle === "components" || componentsURL == null ? m11("button.oct-button", {
              type: "button",
              disabled: typeof window === "undefined",
              onclick: onSetComponents
            }, "Components") : m11("a.oct-button", {
              href: componentsURL.toString(),
              onclick: onSetComponents
            }, "Components")
          )
        ),
        m11("pre.oct-explorer-body", children)
      );
    }
  };
};

// lib/components/OctironForm.ts
import m12 from "mithril";
var OctironForm = (vnode) => {
  var _a;
  const o = vnode.attrs.o;
  const method = ((_a = o.method) == null ? void 0 : _a.toUpperCase()) || "POST";
  const enctypes = {
    GET: "application/x-www-form-urlencoded",
    POST: "multipart/form-data"
  };
  return {
    view: (_b) => {
      var _c = _b, { attrs: _d } = _c, _e = _d, { o: o2 } = _e, attrs = __objRest(_e, ["o"]), { children } = _c;
      return m12(
        "form.oct-form",
        __spreadProps(__spreadValues({}, attrs), {
          method,
          enctype: enctypes[method || "GET"],
          action: o2.url,
          onsubmit: (evt) => {
            evt.preventDefault();
            o2.submit();
          }
        }),
        children
      );
    }
  };
};

// lib/components/OctironSubmitButton.ts
import m13 from "mithril";
var OctironSubmitButton = () => {
  return {
    view: ({ attrs, children }) => {
      return m13(
        "button.oct-button.oct-submit-button",
        {
          id: attrs.id,
          type: "submit",
          class: classes(attrs.class)
        },
        children
      );
    }
  };
};

// lib/octiron.ts
function octiron(_a) {
  var _b = _a, {
    typeDefs
  } = _b, storeArgs = __objRest(_b, [
    "typeDefs"
  ]);
  const store = new Store(storeArgs);
  const config = typeDefs != null ? makeTypeDefs(store, ...typeDefs) : {};
  return rootFactory({
    store,
    typeDefs: config
  });
}
octiron.fromInitialState = (_a) => {
  var _b = _a, {
    typeDefs
  } = _b, storeArgs = __objRest(_b, [
    "typeDefs"
  ]);
  const store = Store.fromInitialState(__spreadValues({}, storeArgs));
  const config = typeDefs != null ? makeTypeDefs(store, ...typeDefs) : {};
  return rootFactory({
    store,
    typeDefs: config
  });
};
export {
  OctironDebug,
  OctironExplorer,
  OctironForm,
  OctironJSON,
  OctironSubmitButton,
  Store,
  classes,
  octiron as default,
  jsonLDHandler,
  longformHandler,
  makeTypeDef,
  makeTypeDefs
};
//# sourceMappingURL=octiron.js.map

/**
 * An array describing the different debugging areas of the project
 * Should all be false expect when debugging
 * @type {{kana: boolean}}
 */
const DEBUG = {
    kana: false
};

/**
 * The wrapper around console.log which decide if we log or not
 * @param namespace the debug namespace
 * @param args the args to be printed
 * @returns {*|void}
 */
const nsLog = (namespace, ...args) => DEBUG[namespace] && console.log(`[${namespace}]`, ...args);

/**
 * Return function for logging in the provided namespace
 * @param namespace the namespace in which to print
 * @returns {function(...[*]): *|void}
 */
export const makeLog = (namespace) => {
    return (...args) => nsLog(namespace, ...args);
}

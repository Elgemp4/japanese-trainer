const DEBUG = {
    kana: false
};

const nsLog = (ns, ...args) => DEBUG[ns] && console.log(`[${ns}]`, ...args);

export const makeLog = (ns) => {
    return (...args) => nsLog(ns, ...args);
}

/**
 * An array describing the different debugging areas of the project
 * Should all be false expect when debugging
 */
const DEBUG = {
    kana: false
} satisfies Record<string, boolean>;

export type LogNamespace = keyof typeof DEBUG;

/**
 * The wrapper around console.log which decide if we log or not
 * @param namespace the debug namespace
 * @param args the args to be printed
 */
const nsLog = (namespace: LogNamespace, ...args: unknown[]): void => {
    if (DEBUG[namespace]) console.log(`[${namespace}]`, ...args);
};

/**
 * Return function for logging in the provided namespace
 * @param namespace the namespace in which to print
 */
export const makeLog = (namespace: LogNamespace) => {
    return (...args: unknown[]) => nsLog(namespace, ...args);
}

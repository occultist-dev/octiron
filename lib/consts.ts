
export let isBrowserRender = typeof window !== 'undefined';

/**
 * Sets the browser render state.
 * 
 * This is intended to be used for testing purposes only. 
 */
export function setIsBrowserRender(value: boolean): void {
    isBrowserRender = value;
}

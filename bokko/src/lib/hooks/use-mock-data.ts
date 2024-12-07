/**
 * A function that simulates fetching asynchronous data with a delay.
 *
 * @param {any | any[]} data - The data to be resolved after a delay.
 * @returns {Promise<any | any[]>} A promise that resolves with the provided data after the specified delay.
 */
export function useAsyncMockData({ data, delta = 1500 }: { data: any | any[]; delta?: number }): Promise<any | any[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data);
        }, delta);
    });
}

/**
 * A function that simulates fetching synchronous data with a delay.
 *
 * @param {any | any[]} data - The data to be returned after a delay.
 * @returns {any | any[]} The provided data after the specified delay.
 */
export function useMockData({ data, delta = 0 }: { data: any | any[]; delta?: number }): any | any[] {
    setTimeout(() => {}, delta);
    return data;
}

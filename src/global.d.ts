export {}; // This line makes the file a module

declare global {
    interface URLSearchParams {
        [Symbol.iterator](): IterableIterator<[string, string]>;
        entries(): IterableIterator<[string, string]>;
    }
    interface Headers {
        entries(): IterableIterator<[string, string]>;
    }
    type ResponseHeaders = {
        [key: string]: string;
    };
}

declare module 'browser-sync-webpack-plugin';
declare module 'rollbar-sourcemap-webpack-plugin';
declare module 'rollbar/dist/rollbar.umd';
declare module 'wp-pot';

declare module '*.scss' {
    const content: {
        [identifier: string]: any;
    };
    export = content;
}

// prettier-ignore
declare module '@wordpress/data' {
    export function dispatch(key: 'abt/data'): typeof import('stores/data/actions');
    export function dispatch(key: 'abt/ui'): typeof import('stores/ui/actions');

    export function select<T extends typeof import('stores/data/selectors'), U extends keyof T>(key: 'abt/data'): {
        [k in U]: (...args: any[]) => T[k] extends (...args: any[]) => infer V ? V : never;
    };

    export function select<T extends typeof import('stores/ui/selectors'), U extends keyof T>(key: 'abt/ui'): {
        [k in U]: (...args: any[]) => T[k] extends (...args: any[]) => infer V ? V : never;
    };
}

declare module '@wordpress/i18n' {
    /**
     * Merges locale data into the Tannin instance by domain. Accepts data in a
     * Jed-formatted JSON object shape.
     *
     * @see http://messageformat.github.io/Jed/
     *
     * @param data   Locale data configuration.
     * @param domain Domain for which configuration applies.
     */
    export function setLocaleData(
        data: any,
        domain: 'academic-bloggers-toolkit',
    ): void;

    /**
     * Retrieve the translation of text.
     *
     * @see https://developer.wordpress.org/reference/functions/__/
     *
     * @param  text   Text to translate.
     * @param  domain Domain to retrieve the translated text.
     */
    export function __(
        text: string,
        domain: 'academic-bloggers-toolkit',
    ): string;

    /**
     * Retrieve translated string with gettext context.
     *
     * @see https://developer.wordpress.org/reference/functions/_x/
     *
     * @param  text    Text to translate.
     * @param  context Context information for the translators.
     * @param  domain  Domain to retrieve the translated text.
     */
    export function _x(
        text: string,
        context: string,
        domain: 'academic-bloggers-toolkit',
    ): string;

    /**
     * Translates and retrieves the singular or plural form based on the supplied
     * number.
     *
     * @see https://developer.wordpress.org/reference/functions/_n/
     *
     * @param  single The text to be used if the number is singular.
     * @param  plural The text to be used if the number is plural.
     * @param  number The number to compare against to use either the
     *                         singular or plural form.
     * @param  domain Domain to retrieve the translated text.
     */
    export function _n(
        single: string,
        plural: string,
        n: number,
        domain: 'academic-bloggers-toolkit',
    ): string;

    /**
     * Translates and retrieves the singular or plural form based on the supplied
     * number, with gettext context.
     *
     * @see https://developer.wordpress.org/reference/functions/_nx/
     *
     * @param  single  The text to be used if the number is singular.
     * @param  plural  The text to be used if the number is plural.
     * @param  number  The number to compare against to use either the
     *                          singular or plural form.
     * @param  context Context information for the translators.
     * @param  domain  Domain to retrieve the translated text.
     */
    export function _nx(
        single: string,
        plural: string,
        n: number,
        context: string,
        domain: 'academic-bloggers-toolkit',
    ): string;

    /**
     * Returns a formatted string. If an error occurs in applying the format, the
     * original format string is returned.
     *
     * @param  format  The format of the string to generate.
     * @param  args Arguments to apply to the format.
     *
     * @see http://www.diveintojavascript.com/projects/javascript-sprintf
     */
    export function sprintf(format: string, ...args: string[]): string;
}

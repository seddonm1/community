/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/webfonts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve the list of fonts
         * @description Returns a list of available font families, optionally filtered and sorted based on query parameters.
         *
         */
        get: {
            parameters: {
                query?: {
                    /** @description Name of a font family to filter results. */
                    family?: components["parameters"]["Family"];
                    /** @description Name of a font subset to filter results. */
                    subset?: components["parameters"]["Subset"];
                    /** @description Type of font source file to filter results. */
                    capability?: components["parameters"]["Capability"];
                    /** @description Sorting order for the results. */
                    sort?: components["parameters"]["Sort"];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description A successful response containing the list of fonts */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["WebfontList"];
                    };
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        WebfontList: {
            /** @description The kind of object, always "webfonts#webfontList". */
            kind?: string;
            items?: components["schemas"]["Webfont"][];
        };
        Webfont: {
            /** @description The name of the font family. */
            family?: string;
            /** @description A list of scripts supported by the family. */
            subsets?: string[];
            /**
             * Format: uri
             * @description A URL to the family subset covering only the name of the family.
             */
            menu?: string;
            /** @description The different styles available for the family. */
            variants?: string[];
            /** @description The font family version. */
            version?: string;
            /**
             * Format: date
             * @description The date (format "yyyy-MM-dd") the font family was last modified.
             */
            lastModified?: string;
            /** @description The font family files for each available variant. */
            files?: {
                [key: string]: string;
            };
            /** @description Category of the font (e.g., sans-serif, monospace). */
            category?: string;
            /** @description The kind of object, always "webfonts#webfont". */
            kind?: string;
            /** @description Axis information for variable fonts. */
            axes?: components["schemas"]["Axis"][];
        };
        Axis: {
            /** @description Tag of the variable font axis. */
            tag?: string;
            /**
             * Format: float
             * @description Start of the range of the variable font axis.
             */
            start?: number;
            /**
             * Format: float
             * @description End of the range of the variable font axis.
             */
            end?: number;
        };
        Error: {
            error?: {
                code?: number;
                message?: string;
                status?: string;
            };
        };
    };
    responses: {
        /** @description Bad request. Invalid parameters. */
        BadRequest: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Unauthorized. Invalid or missing API key. */
        Unauthorized: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Forbidden. Insufficient permissions. */
        Forbidden: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
    };
    parameters: {
        /** @description Name of a font family to filter results. */
        Family: string;
        /** @description Name of a font subset to filter results. */
        Subset: string;
        /** @description Type of font source file to filter results. */
        Capability: "VF" | "WOFF2";
        /** @description Sorting order for the results. */
        Sort: "alpha" | "date" | "popularity" | "style" | "trending";
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;

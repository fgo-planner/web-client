import { Schema } from 'jsonschema';

/**
 * Contains commonly used `jsonschema` validation schemas.
 */
export namespace JsonSchemas {

    export const OptionalBoolean: Schema = {
        type: 'boolean',
        required: false
    };

}

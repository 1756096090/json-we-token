// types/JsonTypes.ts

// Tipos básicos que puede contener un JSON
export type JsonPrimitive = string | number | boolean | null;

// Metadata interface
export interface JsonMetadata {
    createdAt?: string;
    updatedAt?: string;
    version?: number;
}

// Declaración forward para JsonValue
export type JsonValue = JsonPrimitive | JsonObject | JsonArray | JsonMetadata;

// Array de JSON que puede contener cualquier valor válido de JSON
export type JsonArray = JsonValue[];

// Objeto JSON básico que puede contener cualquier valor JSON
export interface JsonObject {
    [key: string]: JsonValue;
}

// Objeto JSON que requiere metadata
export interface JsonObjectWithMetadata extends Omit<JsonObject, 'metadata'> {
    metadata: JsonMetadata;
}

// Type guards
export const isJsonObject = (value: JsonValue): value is JsonObject => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isJsonArray = (value: JsonValue): value is JsonArray => {
    return Array.isArray(value);
};

export const isJsonPrimitive = (value: JsonValue): value is JsonPrimitive => {
    return typeof value !== 'object' || value === null;
};

export const isJsonMetadata = (value: JsonValue): value is JsonMetadata => {
    return (
        typeof value === 'object' &&
        value !== null &&
        'version' in value &&
        !Array.isArray(value)
    );
};
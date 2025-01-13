"use client";

import React, { useState, useCallback, useRef } from "react";
import { Collapsible } from "./components/CollapsibleProps";

type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
type JsonArray = JsonValue[];
interface JsonObject {
    [key: string]: JsonValue;
}

interface JsonValueDisplayProps {
    value: JsonValue;
    keyName?: string;
}

const JsonValueDisplay: React.FC<JsonValueDisplayProps> = ({
    value,
    keyName,
}: JsonValueDisplayProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState<boolean>(true);

    const toggleView = useCallback((): void => {
        setIsOpen((prev) => !prev);
    }, []);

    const renderValue = (): JSX.Element | null => {
        if (value === null) {
            return <span className="text-gray-500">null</span>;
        }

        switch (typeof value) {
            case "boolean":
                return <span className="text-purple-600">{value.toString()}</span>;
            case "number":
                return <span className="text-blue-600">{value}</span>;
            case "string":
                return <span className="text-green-600">&quot;{value}&quot;</span>;
            case "object":
                if (Array.isArray(value)) {
                    return (
                        <Collapsible isOpen={isOpen} onToggle={toggleView} type="array">
                            {value.map((item: JsonValue, index: number) => (
                                <div key={`${keyName}-${index}`} className="flex items-start">
                                    <span className="text-gray-500 mr-2">{index}:</span>
                                    <JsonValueDisplay
                                        value={item}
                                        keyName={`${keyName}-${index}`}
                                    />
                                </div>
                            ))}
                        </Collapsible>
                    );
                } else {
                    return (
                        <Collapsible isOpen={isOpen} onToggle={toggleView} type="object">
                            {Object.entries(value).map(([key, val]: [string, JsonValue]) => (
                                <div key={`${keyName}-${key}`} className="flex items-start">
                                    <span className="text-gray-800 mr-2">&quot;{key}&quot;:</span>
                                    <JsonValueDisplay value={val} keyName={`${keyName}-${key}`} />
                                </div>
                            ))}
                        </Collapsible>
                    );
                }
            default:
                return null;
        }
    };

    return <div className="json-value">{renderValue()}</div>;
};

interface JsonEditorState {
    content: string;
    parsedJson: JsonValue | null;
    error: string | null;
}

const JsonEditor: React.FC = (): JSX.Element => {
    const [state, setState] = useState<JsonEditorState>({
        content: `{
            "glossary": {
              "title": "example glossary",
              "GlossDiv": {
                "title": "S",
                "GlossList": {
                  "GlossEntry": {
                    "ID": "SGML",
                    "SortAs": "SGML",
                    "GlossTerm": "Standard Generalized Markup Language",
                    "Acronym": "SGML",
                    "Abbrev": "ISO 8879:1986",
                    "GlossDef": {
                      "para": "A meta-markup language, used to create markup languages such as DocBook.",
                      "GlossSeeAlso": ["GML", "XML"]
                    },
                    "GlossSee": "markup"
                  }
                }
              }
            }
          }`,
        parsedJson: null,
        error: null,
    });

    const editorRef = useRef<HTMLDivElement>(null);

    const handleInput = useCallback(
        (event: React.FormEvent<HTMLDivElement>): void => {
            const newContent: string = event.currentTarget.textContent || "";

            try {
                const parsed: JsonValue = JSON.parse(newContent);
                setState({
                    content: newContent,
                    parsedJson: parsed,
                    error: null,
                });
            } catch (e) {
                console.log("🚀 ~ e:", e)
                setState((prevState) => ({
                    ...prevState,
                    error: "Invalid JSON format",
                }));
            }
        },
        []
    );

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="mb-4">
                <div
                    ref={editorRef}
                    className="min-h-[100px] p-4 border rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    contentEditable
                    onInput={handleInput}
                    
                >
                    <JsonValueDisplay value={state.parsedJson} />
                </div>
                {state.error && (
                    <div className="mt-2 text-red-500 text-sm">{state.error}</div>
                )}
            </div>

        </div>
    );
};
export default JsonEditor;

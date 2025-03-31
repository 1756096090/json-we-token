"use client";
import { useState, useRef, useEffect } from "react";
import Collapsible from "./components/CollapsibleProps";
import React from "react";

interface CursorInfo {
  line: number;
  column: number;
  text: string;
  lineText: string;
}

type JsonValueType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "unknown";

const EditableJsonView: React.FC<{
  content: React.ReactNode;
  onCursorUpdate: (info: CursorInfo) => void;
}> = ({ content, onCursorUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const getCursorPosition = (
    element: HTMLElement,
    cursorNode: Node,
    cursorOffset: number
  ): CursorInfo => {
    const range = document.createRange();
    console.log("range22", element);
    range.setStart(element, 0);
    range.setEnd(cursorNode, cursorOffset);

    const textUntilCursor = range.toString();

    console.log("🔹 Propiedades del objeto Range:");

    console.log("▶ endContainer (Node):", range.endContainer.textContent);
    console.log("▶ endOffset (number):", range.endOffset);
    console.log("▶ collapsed (boolean):", range.collapsed);
    console.log(
      "▶ commonAncestorContainer (Node):",
      range.commonAncestorContainer
    );
    console.log("▶ toString() (string):", range.toString());
    const lines = textUntilCursor.split("\n");
    const lineNumber = lines.length;
    const column = lines[lines.length - 1].length + 1;

    let currentElement: HTMLElement | null = cursorNode.parentElement;
    const parentElement: HTMLElement | null =
      currentElement?.parentElement || null;
    console.log("parentElement", parentElement);
    const leftSibling = currentElement?.previousElementSibling;
    console.log("leftSibling", leftSibling);
    const rightSibling = currentElement?.nextElementSibling;
    console.log("leftSibling", rightSibling);

    console.log(
      "currentElement",
      currentElement,
      currentElement?.classList.value
    );
    const parent = currentElement?.parentElement || null;
    console.log("parentElement", parent);
    const grandParent = parent?.parentElement || null;
    console.log("grandParent", grandParent);

    const fullText = range.endContainer.textContent || "";

    if (currentElement?.classList.contains("json-value")) {
      const match = fullText.match(/^("(.*?)"),$/);
      if (match) {
        const quotedValue = match[1]; // Ejemplo: "hola"

        currentElement.textContent = quotedValue;

        let commaElement = currentElement.nextElementSibling as HTMLElement;
        if (!commaElement || !commaElement.classList.contains("comma")) {
          commaElement = document.createElement("span");
          commaElement.className = "comma";
          commaElement.textContent = ",";
          currentElement.parentElement?.insertBefore(
            commaElement,
            currentElement.nextSibling
          );
        }

        // Reposicionamos el cursor para que quede después de la coma.
        const newRange = document.createRange();
        newRange.setStartAfter(commaElement);
        newRange.collapse(true);

        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    } else if (currentElement?.classList.contains("comma")) {
      // Si el texto completo está vacío, eliminamos el elemento.

      if (fullText === "") {
        currentElement.remove();
      } else if (fullText == ",") {
      } else {
        // Usamos una expresión regular para separar:
        // - match[1]: todo lo que va antes de la coma (puede estar vacío)
        // - match[2]: la coma
        // - match[3]: lo que va después (opcional)
        const match = fullText.match(/^(.*?)(,)(.*)$/);
        if (match) {
          const beforeText = match[1];
          const commaText = match[2]; // debería ser siempre ","
          const afterText = match[3];

          if (beforeText == '"' || beforeText == "'") {
          } else if (afterText == '"' || afterText == "'") {
          } else {
            if (beforeText == ",") {
            }
          }
        }
      }
    } else if (currentElement?.classList.value === "json-pair") {
      currentElement = grandParent;
    } else if (currentElement?.classList.value === "json-object") {
    } else if (currentElement?.classList.value === "json-array") {
    } else if (currentElement?.classList.value === "json-key") {
      currentElement = parent;
    }

    let lineText = "";
    let text = "";

    while (currentElement && !lineText) {
      if (currentElement.hasAttribute("data-line-text")) {
        lineText = currentElement.getAttribute("data-line-text") || "";
        text = currentElement.textContent || "";
      }
      currentElement = currentElement.parentElement;
    }

    return {
      line: lineNumber,
      column,
      text,
      lineText,
    };
  };

  const handleSelectionChange = () => {
    if (!containerRef.current) return;
    console.log(containerRef.current);
    const selection = window.getSelection();
    console.log(selection);
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (containerRef.current.contains(range.startContainer)) {
        console.log(
          "getCursorPosition",
          containerRef.current,
          range.startContainer,
          range.startOffset
        );
        const info = getCursorPosition(
          containerRef.current,
          range.startContainer,
          range.startOffset
        );
        onCursorUpdate(info);
      }
    }
  };

  const findType = (
    currentElement: HTMLElement,
    parent: HTMLElement | null,
    leftSibling: HTMLElement | null,
    rightSibling: HTMLHtmlElement | null
  ) => {
    

    if(parent && parent.classList.contains("json-object")) {
      return "object";
    }
    else if(parent && parent.classList.contains("json-array")) {

    } else if(parent && parent.classList.contains("json-pair")) {

    }

  };

  const getJsonElementType = (element: HTMLElement): string => {
    if (isJsonObject(element)) return "object";
    if (isJsonArray(element)) return "array";
    if (isJsonString(element)) return "string";
    if (isJsonNumber(element)) return "number";
    if (isJsonBoolean(element)) return "boolean";
    if (isJsonNull(element)) return "null";
    if (isJsonComma(element)) return "comma";
    if (isJsonColon(element)) return "colon";
    return "unknown";
  };
  

  const getTrimmedContent = (element: HTMLElement): string =>
    element.textContent?.trim() || "";
  
  const isJsonObject = (element: HTMLElement): boolean => {
    const content = getTrimmedContent(element);
    return content.startsWith("{") && content.endsWith("}");
  };
  
  const isJsonArray = (element: HTMLElement): boolean => {
    const content = getTrimmedContent(element);
    return content.startsWith("[") && content.endsWith("]");
  };
  
  const isJsonString = (element: HTMLElement): boolean => {
    const content = getTrimmedContent(element);
    return content.length >= 2 && content.startsWith('"') && content.endsWith('"');
  };
  
  const isJsonNumber = (element: HTMLElement): boolean => {
    const content = getTrimmedContent(element);
    return /^-?\d+(\.\d+)?$/.test(content);
  };
  
  const isJsonBoolean = (element: HTMLElement): boolean => {
    const content = getTrimmedContent(element);
    return content === "true" || content === "false";
  };
  
  const isJsonNull = (element: HTMLElement): boolean =>
    getTrimmedContent(element) === "null";
  
  const isJsonComma = (element: HTMLElement): boolean =>
    getTrimmedContent(element) === ",";
  
  const isJsonColon = (element: HTMLElement): boolean =>
    getTrimmedContent(element) === ":";

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="p-4 font-mono text-sm border rounded-lg"
      contentEditable
      suppressContentEditableWarning={true}
    >
      {content}
    </div>
  );
};

const JsonFormatter: React.FC = () => {
  const [json, setJson] = useState<string>(
    `{"name": "John", "age": 30, "address": {"street": "123 Main St", "city": "New York", "state": "NY"}}`
  );
  const [parsedOutput, setParsedOutput] = useState<React.ReactNode | null>(
    null
  );
  const [cursorInfo, setCursorInfo] = useState<CursorInfo>({
    line: 1,
    column: 1,
    text: "",
    lineText: "",
  });

  const getValueType = (value: string): JsonValueType => {
    value = value.trim();
    if (value.startsWith("{")) return "object";
    if (value.startsWith("[")) return "array";
    if (value.startsWith('"')) return "string";
    if (/^-?\d+\.?\d*$/.test(value)) return "number";
    if (value === "true" || value === "false") return "boolean";
    if (value === "null") return "null";
    return "unknown";
  };

  const formatJson = (jsonString: string): React.ReactNode => {
    const formatObject = (objectStr: string): React.ReactNode => {
      const valueObject =
        /"([^"]+)":\s*(\{.*?\}|\[.*?\]|"[^"]*"|[^,{}\n]+)\s*(,?)/g;
      const matches = [...objectStr.matchAll(valueObject)];
      console.log("matches", matches);
      const formattedPairs: React.ReactNode[] = [];

      matches.forEach((match) => {
        const [, key, value] = match;
        console.log("key", key, "value", value);
        const valueType = getValueType(value);
        let formattedValue: React.ReactNode = value;

        if (valueType === "object" || valueType === "array") {
          formattedValue = formatJson(value);
        }

        // Usamos React.Fragment con key para envolver los dos elementos
        formattedPairs.push(
          <React.Fragment key={key}>
            <div className="json-pair" data-line-text={`${key}: ${value}`}>
              <span className="json-key">{`"${key}"`}</span>
              <span className="colon">:</span>
              <span className={`json-value json-${valueType}`}>
                {formattedValue}
              </span>
            </div>
            {match[3] === "," ? <span className="comma">,</span> : null}
          </React.Fragment>
        );
      });

      return <Collapsible type="object">{formattedPairs}</Collapsible>;
    };

    const formatArray = (arrayStr: string): React.ReactNode => {
      const valueRegex = /\s*(\{.*?\}|\[.*?\]|"[^"]*"|[^,\[\]\n]+)/g;
      const matches = [...arrayStr.matchAll(valueRegex)];
      const formattedItems: React.ReactNode[] = [];

      matches.forEach((match, index) => {
        const [, value] = match;
        const valueType = getValueType(value);
        let formattedValue: React.ReactNode = value;

        if (valueType === "object" || valueType === "array") {
          formattedValue = formatJson(value);
        }

        formattedItems.push(
          <div
            key={index}
            className={`json-value json-${valueType}`}
            data-line-text={value}
          >
            {formattedValue}
          </div>
        );
      });

      return <div></div>;
    };

    try {
      const parsed = JSON.parse(jsonString);
      const type: JsonValueType = Array.isArray(parsed)
        ? "array"
        : typeof parsed === "object"
        ? "object"
        : "unknown";
      console.log("parsed", parsed);

      if (type === "object") {
        return formatObject(jsonString);
      } else if (type === "array") {
        return formatArray(jsonString);
      } else {
        return (
          <span className={`json-${type}`} data-line-text={jsonString}>
            {jsonString}
          </span>
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        return <div className="json-error">Invalid JSON: {error.message}</div>;
      }
      return <div className="json-error">Invalid JSON: Unknown error</div>;
    }
  };

  const parseJson = () => {
    setParsedOutput(formatJson(json));
  };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <textarea
          className="w-full min-h-[200px] p-4 font-mono text-sm border rounded-lg"
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder="Enter JSON here..."
        />
        <button
          onClick={parseJson}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Parse JSON
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div>
          Line: {cursorInfo.line}, Column: {cursorInfo.column}
        </div>
        <div>Current line text: {cursorInfo.lineText}</div>
        <div>Full element text: {cursorInfo.text}</div>
      </div>

      {parsedOutput && (
        <EditableJsonView
          content={parsedOutput}
          onCursorUpdate={setCursorInfo}
        />
      )}

      <style jsx>{`
        .json-object,
        .json-array {
          padding-left: 1.5rem;
        }
        .json-pair {
          margin: 0.25rem 0;
        }
        .json-key {
          color: #9b2c2c;
        }
        .json-string {
          color: #2b6cb0;
        }
        .json-number {
          color: #2f855a;
        }
        .json-boolean {
          color: #805ad5;
        }
        .json-null {
          color: #718096;
        }
        .json-error {
          color: #e53e3e;
        }
      `}</style>
    </div>
  );
};

export default JsonFormatter;

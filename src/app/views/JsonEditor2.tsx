"use client"
import { useState, useRef, useEffect } from "react";
import Collapsible from "./components/CollapsibleProps";

interface CursorInfo {
  line: number;
  column: number;
  text: string;
  lineText: string;
}

type JsonValueType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'unknown';

// Separate component for editable content
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
    range.setStart(element, 0);
    range.setEnd(cursorNode, cursorOffset);
    
    const textUntilCursor = range.toString();
    const lines = textUntilCursor.split('\n');
    const lineNumber = lines.length;
    const column = lines[lines.length - 1].length + 1;

    let currentElement: HTMLElement | null = cursorNode.parentElement;
    let lineText = '';
    let text = '';

    while (currentElement && !lineText) {
      if (currentElement.hasAttribute('data-line-text')) {
        lineText = currentElement.getAttribute('data-line-text') || '';
        text = currentElement.textContent || '';
      }
      currentElement = currentElement.parentElement;
    }
    
    return { 
      line: lineNumber, 
      column, 
      text, 
      lineText 
    };
  };

  const handleSelectionChange = () => {
    if (!containerRef.current) return;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (containerRef.current.contains(range.startContainer)) {
        const info = getCursorPosition(
          containerRef.current,
          range.startContainer,
          range.startOffset
        );
        onCursorUpdate(info);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
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
  const [parsedOutput, setParsedOutput] = useState<React.ReactNode | null>(null);
  const [cursorInfo, setCursorInfo] = useState<CursorInfo>({
    line: 1,
    column: 1,
    text: '',
    lineText: ''
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
      const valueObject = /"([^"]+)":\s*(\{.*?\}|\[.*?\]|"[^"]*"|[^,{}\n]+)/g;
      const matches = [...objectStr.matchAll(valueObject)];
      const formattedPairs: React.ReactNode[] = [];

      matches.forEach((match) => {
        const [_, key, value] = match;
        const valueType = getValueType(value);
        let formattedValue: React.ReactNode = value;

        if (valueType === "object" || valueType === "array") {
          formattedValue = formatJson(value);
        }

        formattedPairs.push(
          <div key={key} className="json-pair" data-line-text={`${key}: ${value}`}>
            <span className="json-key">&quot;{key}&quot;</span>: {' '}
            <span className={`json-value json-${valueType}`}>
              {formattedValue}
            </span>
          </div>
        );
      });

      return (
        <Collapsible type="object">
          {formattedPairs}
        </Collapsible>
      );
    };

    const formatArray = (arrayStr: string): React.ReactNode => {
      const valueRegex = /\s*(\{.*?\}|\[.*?\]|"[^"]*"|[^,\[\]\n]+)/g;
      const matches = [...arrayStr.matchAll(valueRegex)];
      const formattedItems: React.ReactNode[] = [];

      matches.forEach((match, index) => {
        const [_, value] = match;
        const valueType = getValueType(value);
        let formattedValue: React.ReactNode = value;

        if (valueType === "object" || valueType === "array") {
          formattedValue = formatJson(value);
        }

        formattedItems.push(
          <div key={index} className={`json-value json-${valueType}`} data-line-text={value}>
            {formattedValue}
          </div>
        );
      });

      return (
        <Collapsible type="array">
          {formattedItems}
        </Collapsible>
      );
    };

    try {
      const parsed = JSON.parse(jsonString);
      const type: JsonValueType = Array.isArray(parsed) ? "array" : typeof parsed === "object" ? "object" : "unknown";
      
      if (type === "object") {
        return formatObject(jsonString);
      } else if (type === "array") {
        return formatArray(jsonString);
      } else {
        return <span className={`json-${type}`} data-line-text={jsonString}>{jsonString}</span>;
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
        <div>Line: {cursorInfo.line}, Column: {cursorInfo.column}</div>
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
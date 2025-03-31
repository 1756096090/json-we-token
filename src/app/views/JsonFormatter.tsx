import React, { useMemo } from 'react';
import { JsonValue, JsonObject, JsonArray } from "@/app/models/json";
import "./JsonFormatter.scss";

interface JsonFormatterProps {
  data: JsonValue;
  highlightError?: { line?: number; message?: string };
}

const JsonFormatter: React.FC<JsonFormatterProps> = ({ 
  data, 
  highlightError 
}) => {
  const formatValue = (
    value: JsonValue,
    options: {
      indexOrKey?: string | number;
      depth?: number;
      line?: number;
    } = {}
  ): { element: JSX.Element | string; lines: number } => {
    const { 
      indexOrKey, 
      depth = 0, 
      line = 1 
    } = options;

    if (value === null) {
      return {
        element: <span className="null-value">null</span>,
        lines: 1
      };
    }

    switch (typeof value) {
      case "string":
        return {
          element: (
            <span 
              className={`string-value ${highlightError?.line === line ? 'error-highlight' : ''}`}
              title={highlightError?.line === line ? highlightError.message : undefined}
            >
              {indexOrKey !== undefined && (
                <span className="position">[{indexOrKey}]: </span>
              )}
              &quot;{value}&quot;
            </span>
          ),
          lines: 1
        };

      case "number":
        return {
          element: (
            <span 
              className={`number-value ${highlightError?.line === line ? 'error-highlight' : ''}`}
              title={highlightError?.line === line ? highlightError.message : undefined}
            >
              {indexOrKey !== undefined && (
                <span className="position">[{indexOrKey}]: </span>
              )}
              {value}
            </span>
          ),
          lines: 1
        };

      case "boolean":
        return {
          element: (
            <span 
              className={`boolean-value ${highlightError?.line === line ? 'error-highlight' : ''}`}
              title={highlightError?.line === line ? highlightError.message : undefined}
            >
              {value.toString()}
            </span>
          ),
          lines: 1
      return {
        element: (
          <input 
            className="null-value" 
            value="null" 
            onChange={(e) => handleChange(currentPath, null)} 
          />
        ),
        lines: 1
      };
    }

    switch (typeof value) {
      case "string":
        return {
          element: (
            <input 
              className={`string-value ${highlightError?.line === line ? 'error-highlight' : ''}`}
              title={highlightError?.line === line ? highlightError.message : undefined}
              value={value}
              onChange={(e) => handleChange(currentPath, e.target.value)}
            />
          ),
          lines: 1
        };

      case "number":
        return {
          element: (
            <input 
              className={`number-value ${highlightError?.line === line ? 'error-highlight' : ''}`}
              title={highlightError?.line === line ? highlightError.message : undefined}
              value={value}
              type="number"
              onChange={(e) => handleChange(currentPath, parseFloat(e.target.value))}
            />
          ),
          lines: 1
        };

      case "boolean":
        return {
          element: (
            <input 
              className={`boolean-value ${highlightError?.line === line ? 'error-highlight' : ''}`}
              title={highlightError?.line === line ? highlightError.message : undefined}
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(currentPath, e.target.checked)}
            />
          ),
          lines: 1
        };

      case "object":
        if (Array.isArray(value)) {
          return formatArray(value, { depth, line, path: currentPath });
        }
        return formatObject(value as JsonObject, { depth, line, path: currentPath });

      default:
        return {
          element: String(value),
          lines: 1
        };
    }
  };

  const formatArray = (
    array: JsonArray, 
    options: { depth?: number; line?: number; path?: (string | number)[] } = {}
  ): { element: JSX.Element; lines: number } => {
    const { depth = 0, line = 1, path = [] } = options;
    let currentLine = line;

    const formattedItems = array.map((item, index) => {
      const { element, lines } = formatValue(item, { 
        indexOrKey: index, 
        depth: depth + 1, 
        line: currentLine,
        path
      });
      currentLine += lines;
      
      return (
        <div key={index} className="array-item">
          {element}
          {index < array.length - 1 && <span className="comma">,</span>}
        </div>
      );
    });

    return {
      element: (
        <div>
          <span className="bracket">[</span>
          <div className="array-container">
            {formattedItems}
          </div>
          <span className="bracket">]</span>
        </div>
      ),
      lines: currentLine - line + 1
    };
  };

  const formatObject = (
    obj: JsonObject, 
    options: { depth?: number; line?: number; path?: (string | number)[] } = {}
  ): { element: JSX.Element; lines: number } => {
    const { depth = 0, line = 1, path = [] } = options;
    let currentLine = line;

    const entries = Object.entries(obj);
    const formattedEntries = entries.map(([key, value], index) => {
      const { element, lines } = formatValue(value, { 
        indexOrKey: key, 
        depth: depth + 1, 
        line: currentLine,
        path
      });
      currentLine += lines;
      
      return (
        <div key={key} className="object-item">
          <span className="key">{key}</span>: {element}
          {index < entries.length - 1 && <span className="comma">,</span>}
        </div>
      );
    });

    return {
      element: (
        <div>
          <span className="bracket">{"{"}</span>
          <div className="object-container">
            {formattedEntries}
          </div>
          <span className="bracket">{"}"}</span>
        </div>
      ),
      lines: currentLine - line + 1
    };
  };

  // Memoize the formatted value to improve performance
  const formattedContent = useMemo(() => {
    return formatValue(editableData);
  }, [editableData, highlightError]);

  return (
    <div className="json-editor">
      <textarea 
        className="json-input" 
        value={rawJson} 
        onChange={handleRawJsonChange} 
      />
      {formattedContent.element}
    </div>
  );
};

export default JsonFormatter;
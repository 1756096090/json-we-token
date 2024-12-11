"use client"
import React, { useState, useEffect, useRef } from 'react';

interface Pattern {
  regex: RegExp;
  className: string;
  type: 'brackets' | 'key' | 'string' | 'number' | 'boolean' | 'null';
}

interface ProcessedElement {
  id: string;
  content: string;
  type: Pattern['type'] | 'plain';
  className?: string;
}

interface LineMap {
  [key: string]: ProcessedElement[];
}

const JSON_PATTERNS: Pattern[] = [
  {
    regex: /[{}\[\]]/g,
    className: 'json-brackets',
    type: 'brackets'
  },
  {
    regex: /"([^"]+)":/g,
    className: 'json-key',
    type: 'key'
  },
  {
    regex: /: "([^"]+)"/g,
    className: 'json-string',
    type: 'string'
  },
  {
    regex: /\b(true|false)\b/g,
    className: 'json-boolean',
    type: 'boolean'
  },
  {
    regex: /\bnull\b/g,
    className: 'json-null',
    type: 'null'
  },
  {
    regex: /\b\d+\.?\d*\b/g,
    className: 'json-number',
    type: 'number'
  }
];

const styles = `
  .json-editor-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .json-editor-content {
    min-height: 200px;
    padding: 16px;
    font-family: monospace;
    font-size: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    white-space: pre-wrap;
    outline: none;
  }

  .json-line { min-height: 1.2em; }
  .json-brackets { color: #2563eb; font-weight: bold; }
  .json-key { color: #059669; }
  .json-string { color: #d97706; }
  .json-number { color: #dc2626; }
  .json-boolean { color: #7c3aed; }
  .json-null { color: #7c3aed; }
`;

const JsonEditor: React.FC = () => {
  const [content, setContent] = useState<string>('{\n  "ejemplo": "valor"\n}');
  const [lineMap, setLineMap] = useState<LineMap>({});
  const editorRef = useRef<HTMLDivElement>(null);
  const processedLinesRef = useRef<Set<string>>(new Set());

  const generateElementId = (lineIndex: number, position: number, content: string): string => {
    return `${lineIndex}-${position}-${content}`;
  };

  const processLine = (line: string, lineIndex: number): ProcessedElement[] => {
    const elements: ProcessedElement[] = [];
    let currentPos = 0;
    const lineKey = `line-${lineIndex}`;

    // Si la línea ya fue procesada y no ha cambiado, retornar los elementos existentes
    if (processedLinesRef.current.has(lineKey) && lineMap[lineKey]?.[0]?.content === line) {
      return lineMap[lineKey];
    }

    JSON_PATTERNS.forEach((pattern) => {
      let match: RegExpExecArray | null;
      pattern.regex.lastIndex = 0;

      while ((match = pattern.regex.exec(line)) !== null) {
        // Texto plano antes del match
        if (match.index > currentPos) {
          const plainText = line.substring(currentPos, match.index);
          elements.push({
            id: generateElementId(lineIndex, currentPos, plainText),
            content: plainText,
            type: 'plain'
          });
        }

        // Elemento con patrón
        elements.push({
          id: generateElementId(lineIndex, match.index, match[0]),
          content: match[0],
          type: pattern.type,
          className: pattern.className
        });

        currentPos = match.index + match[0].length;
      }
    });

    // Resto del texto
    if (currentPos < line.length) {
      elements.push({
        id: generateElementId(lineIndex, currentPos, line.substring(currentPos)),
        content: line.substring(currentPos),
        type: 'plain'
      });
    }

    processedLinesRef.current.add(lineKey);
    return elements;
  };

  const updateContent = () => {
    if (!editorRef.current) return;

    const lines = content.split('\n');
    const newLineMap: LineMap = {};

    lines.forEach((line, index) => {
      const lineKey = `line-${index}`;
      const processedLine = processLine(line, index);
      newLineMap[lineKey] = processedLine;
    });

    // Limpiar líneas que ya no existen
    processedLinesRef.current = new Set(Object.keys(newLineMap));
    setLineMap(newLineMap);
  };

  useEffect(() => {
    updateContent();
  }, [content]);

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    const newContent = event.currentTarget.textContent || '';
    if (newContent !== content) {
      setContent(newContent);
    }
  };

  const renderLine = (lineElements: ProcessedElement[], lineIndex: number): JSX.Element => (
    <div key={`line-${lineIndex}`} className="json-line">
      {lineElements.map((element) => (
        <span
          key={element.id}
          className={element.className}
          data-type={element.type}
        >
          {element.content}
        </span>
      ))}
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="json-editor-container">
        <div
          ref={editorRef}
          className="json-editor-content"
          contentEditable
          onInput={handleInput}
          suppressContentEditableWarning={true}
        >
          {Object.entries(lineMap).map(([lineKey, elements], index) => 
            renderLine(elements, index)
          )}
        </div>
      </div>
    </>
  );
};

export default JsonEditor;
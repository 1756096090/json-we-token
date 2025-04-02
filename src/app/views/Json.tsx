"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import './Json.scss'
import { Container } from "postcss";

type JsonValueType = "object" | "array" | "string" | "number" | "boolean" | "null" | "unknown";

const getValueType = (value: string): JsonValueType => {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith("{") && trimmedValue.endsWith("}")) return "object";
  if (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) return "array";
  if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) return "string";
  if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) return "number";
  if (trimmedValue === "true" || trimmedValue === "false") return "boolean";
  if (trimmedValue === "null") return "null";

  return "unknown";
};

const saveCursor = (range: Range) => {
  const marker = document.createElement("span")
  marker.id = "cursor-maker"
  marker.appendChild(document.createTextNode("\u2020B"))
  marker.style.display = "none"
  range.insertNode(marker)
}

export default function ContentEditableComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUpdating, setIsUpdating] = useState(false); // Flag para evitar bucle

  const handleSelectionChange = useCallback(() => {
    if (!containerRef.current || isUpdating) return;

    setIsUpdating(true); // Establece el flag

    const selection = window.getSelection();
    if (!selection || selection.rangeCount <= 0) {
      setIsUpdating(false); // Restablece el flag
      return;
    }

    const range = selection.getRangeAt(0);
    const transformedJson = transformJson(containerRef.current, range);

    if (transformedJson) {
      containerRef.current.innerHTML = transformedJson.outerHTML;
    }

    setIsUpdating(false); // Restablece el flag
  }, [isUpdating]);

  const transformJson = (currentElement: HTMLElement, range: Range): HTMLDivElement | null => {
    console.log("--- Información del HTMLElement ---");
    console.log("Elemento actual:", currentElement);
    console.log("ID del elemento:", currentElement.id);
    console.log("Clases del elemento:", currentElement.className);
    console.log("Estilos del elemento:", currentElement.style);
    console.log("Contenido HTML del elemento:", currentElement.innerHTML);
    console.log("Contenido de texto del elemento:", currentElement.textContent);
    console.log("Atributos del elemento:", currentElement.attributes);
    console.log("Métodos importantes del HTMLElement:", {
      getAttribute: currentElement.getAttribute,
      setAttribute: currentElement.setAttribute,
      addEventListener: currentElement.addEventListener,
      removeEventListener: currentElement.removeEventListener,
      querySelector: currentElement.querySelector,
      querySelectorAll: currentElement.querySelectorAll,
      appendChild: currentElement.appendChild,
      removeChild: currentElement.removeChild,
      insertBefore: currentElement.insertBefore,
      // ... y muchos otros métodos
    });

    console.log("\n--- Información del Range ---");
    console.log("Rango actual:", range);
    console.log("Nodo de inicio del rango:", range.startContainer);
    console.log("Offset de inicio del rango:", range.startOffset);
    console.log("Nodo de fin del rango:", range.endContainer);
    console.log("Offset de fin del rango:", range.endOffset);
    console.log("Si el rango está colapsado (inicio y fin son iguales):", range.collapsed);
    console.log("Contenedor ancestro común del rango:", range.commonAncestorContainer);
    console.log("Contenido del rango (DocumentFragment):", range.cloneContents());
    console.log("Métodos importantes del Range:", {
      selectNode: range.selectNode,
      selectNodeContents: range.selectNodeContents,
      setStart: range.setStart,
      setEnd: range.setEnd,
      setStartBefore: range.setStartBefore,
      setStartAfter: range.setStartAfter,
      setEndBefore: range.setEndBefore,
      setEndAfter: range.setEndAfter,
      deleteContents: range.deleteContents,
      extractContents: range.extractContents,
      insertNode: range.insertNode,
      surroundContents: range.surroundContents,
      cloneRange: range.cloneRange,
      detach: range.detach,
      // ... y otros métodos
    });
    saveCursor(range)
    const value = currentElement.textContent || "";
    const valueType = getValueType(value);

    console.log("current element", range, currentElement)

    if (valueType === "object") {
      return createObject(value);
    }
    return null;
  };

  const createObject = (value: string): HTMLDivElement => {
    const firstBraceIndex = value.indexOf("{");
    const lastBraceIndex = value.lastIndexOf("}");

    if (firstBraceIndex === -1 || lastBraceIndex === -1) {
      const newDiv = document.createElement('div');
      newDiv.className = 'object';
      newDiv.textContent = value;
      return newDiv;
    }

    const newDiv = document.createElement('div');
    newDiv.className = 'object';

    const leftBraceSpan = document.createElement('span');
    leftBraceSpan.textContent = '{';

    const rightBraceSpan = document.createElement('span');
    rightBraceSpan.textContent = '}';

    const insideBraces = value.slice(firstBraceIndex + 1, lastBraceIndex);

    const insideBracesTextNode = document.createTextNode(insideBraces);

    newDiv.appendChild(leftBraceSpan);
    newDiv.appendChild(insideBracesTextNode);
    newDiv.appendChild(rightBraceSpan);

    return newDiv;
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div
        ref={containerRef}
        contentEditable
        className="min-h-[120px] p-6 bg-white rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        suppressContentEditableWarning={true}
      >
      </div>
    </div>
  );
}
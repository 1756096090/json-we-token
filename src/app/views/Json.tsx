"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import './Json.scss'


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

const saveCursor = (range: Range): HTMLElement | null => {
  const marker = document.createElement("span");
  marker.id = "cursor-marker";
  // Usamos estilos que lo hagan invisible pero seleccionable
  marker.style.opacity = "0";
  marker.style.position = "absolute";
  marker.style.width = "1px";
  marker.style.height = "1px";
  marker.setAttribute("data-cursor", "true");
  console.log("Saving cursor, inserting marker:", marker);
  range.insertNode(marker);
  
  // Obtener el contenedor del marcador
  const container = marker.parentNode as HTMLElement | null;
  if (container) {
    console.log("HTML del contenedor:", container.innerHTML);
  }

  return container;
};



const restoreCursor = () => {
  const marker = document.getElementById("cursor-marker");
  if (marker) {
    console.log("Restoring cursor, marker found:", marker);
    // Aseguramos que el contenedor esté enfocado
    marker.parentElement?.focus();
    
    // Hacemos visible el marcador temporalmente para evitar problemas de display
    const originalDisplay = marker.style.display;
    marker.style.display = "inline";

    const selection = window.getSelection();
    const range = document.createRange();

    // En lugar de seleccionar el nodo completo, ubicamos el cursor justo antes del marcador
    range.setStartBefore(marker);
    range.collapse(true);

    selection?.removeAllRanges();
    selection?.addRange(range);

    console.log("Cursor restored, scheduling marker removal");

    // Removemos el marcador en el siguiente tick para asegurar la actualización de la selección
    setTimeout(() => {
      marker.parentNode?.removeChild(marker);
    }, 0);

    // Restauramos el estilo original, si fuera necesario
    marker.style.display = originalDisplay;
  } else {
    console.log("No se encontró el marcador en el DOM");
  }
};


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
      console.log("HTML del contenedor:", (transformedJson as HTMLElement).innerHTML);


      containerRef.current.innerHTML = transformedJson.outerHTML;

    }

    setIsUpdating(false); // Restablece el flag
  }, [isUpdating]);
  
  const transformJson = (currentElement: HTMLElement, range: Range): HTMLDivElement | null => {
    const value = currentElement.textContent || "";
    const valueType = getValueType(value);
    console.log("current element", valueType, value);
  
    if (valueType === "object") {
      // Save cursor and get the container
      const container = saveCursor(range);
      
      // If the container is valid, create the object
      if (container) {
        return createObject(container);
      }
    }
    
    return null;
  };
  

  const createObject = (container: HTMLElement): HTMLDivElement => {
    // Obtenemos el contenido del container
    const value = container.textContent || "";
    const newDiv = document.createElement('div');
    newDiv.className = 'object';
  
    // Buscamos la posición de las llaves
    const firstBraceIndex = value.indexOf("{");
    const lastBraceIndex = value.lastIndexOf("}");
  
    // Si no se encuentran las llaves, simplemente asignamos el contenido
    if (firstBraceIndex === -1 || lastBraceIndex === -1) {
      newDiv.textContent = value;
      return newDiv;
    }
  
    // Creamos los elementos para la representación del objeto
    const leftBraceSpan = document.createElement('span');
    leftBraceSpan.textContent = '{';
  
    const rightBraceSpan = document.createElement('span');
    rightBraceSpan.textContent = '}';
  
    // Extraemos el contenido entre las llaves
    const insideBraces = value.slice(firstBraceIndex + 1, lastBraceIndex);
    const insideBracesTextNode = document.createTextNode(insideBraces);
  
    // Construimos el nuevo DOM para el objeto
    newDiv.appendChild(leftBraceSpan);
    newDiv.appendChild(insideBracesTextNode);
    newDiv.appendChild(rightBraceSpan);
  
    return newDiv;
  };
  

  useEffect(() => {
    document.addEventListener('input', handleSelectionChange);
    return () => {
      document.removeEventListener('input', handleSelectionChange);
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
"use client"

import { useEffect, useRef, useCallback } from "react"
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

export default function ContentEditableComponent() {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSelectionChange = useCallback(() => {
    if(!containerRef.current) return
    const selection = window.getSelection() 
    console.log('Selection changed', selection, containerRef.current, containerRef.current.textContent)
    if(!selection || selection.rangeCount <= 0) return
    const range = selection.getRangeAt(0)
    console.log('Range', range)
    const startContainer = range.startContainer
    const endContainer = range.endContainer
    const startOffset = range.startOffset
    const endOffset = range.endOffset
    console.log('Start', startContainer, startOffset, 'End', endContainer, endOffset)
    const transformedJson =  transformJson (containerRef.current, range)
    if(!transformedJson) return
    console.log('Transformed JSON', transformedJson.outerHTML, transformedJson.innerHTML)
    containerRef.current.innerHTML = transformedJson.outerHTML

    
  }, [])

  // const insertDivAtCursor = () => {
  //   const selection = window.getSelection();
  //   if (!selection || selection.rangeCount === 0) return;
  
  //   const range = selection.getRangeAt(0);
    
  //   const newDiv = document.createElement("div");
  //   newDiv.className = "sc";
  //   newDiv.textContent = " "; // Puede ser vacío o con contenido
    
  //   range.insertNode(newDiv);
    
  //   range.setStartAfter(newDiv);
  //   range.collapse(true);
    
  //   selection.removeAllRanges();
  //   selection.addRange(range);
  
  //   console.log("Cursor después de insertar:", {
  //     startContainer: range.startContainer,
  //     startOffset: range.startOffset,
  //   });
  // };


  const transformJson = (currentElement: HTMLElement, range: Range):HTMLDivElement | null => {


    
    const value = currentElement.textContent || ""  
    console.log('Transforming JSON:', {  
      parentElement: currentElement.parentElement?.tagName,  
      parentClasses: currentElement.parentElement?.classList.toString(),  
      currentClasses: currentElement.classList.toString(),
      currentElement,
      currentElementText: currentElement.textContent,
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset,
      collapsed: range.collapsed
    });
    const newDiv2 = document.createElement('div')
    newDiv2.className = 'sc'
    range.insertNode(newDiv2)
    
    const valueType = getValueType(value)
    console.log('Transforming JSON', currentElement, range, value, valueType)
    if (valueType === "object") {
      return createObject(value)
    }
    const newDiv = document.createElement('div')
    newDiv.textContent = currentElement.textContent
    return null
  }

  const createObject = (value: string): HTMLDivElement => {
    const firstBraceIndex = value.indexOf("{");
    const lastBraceIndex = value.lastIndexOf("}");
  
    if (firstBraceIndex === -1 || lastBraceIndex === -1) {
      const newDiv = document.createElement('div');
      newDiv.className = 'object';
      newDiv.textContent = value; // Si no hay llaves, solo mostrar el valor como texto
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
  
    newDiv.appendChild(leftBraceSpan);  // span para la llave izquierda
    newDiv.appendChild(insideBracesTextNode); // contenido dentro de las llaves
    newDiv.appendChild(rightBraceSpan); // span para la llave derecha
  
    return newDiv;
  }


  


  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange )
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [handleSelectionChange])



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
  
  )
}


"use client"
import { useEffect, useRef } from "react";
import { RegexMatcher } from "../services/RegexMatcher";

const JsonFinale = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewContent = () => {
        if (containerRef.current) { // Para saber si estamos dentro del Doom
            const selection = window.getSelection()
            const range = selection?.getRangeAt(0)
            
            console.log(selection, 'selection', selection?.toString(), range)
            console.log(containerRef.current, 'containerRef.current')
            if (selection ) {
               
                for (let i = 0; i < selection.rangeCount; i++) {
                  const range = selection.getRangeAt(i);
                  console.log(`Rango ${i + 1}: `, range);
                }
              } else {
                console.log("No hay texto seleccionado.");
              }

        }
    }

    
    useEffect(() => {
        
        const phoneMatcher = new RegexMatcher(
            "My phone is 123-456-7890 and hers is 987-654-3210",
            "(\\d{3})-(\\d{3})-(\\d{4})",
            "g"
        );
        console.log("Phone matches:", phoneMatcher.getMatches());
        
        // Prueba 2: Encontrar un email
        const emailMatcher = new RegexMatcher(
            " test test test",
            "\\s\\w+\\s(\\w+)$",
            "gm"
        );
        console.log("Email matches:", emailMatcher.getMatches());
    })

    return (
        <div>
            <h1>Json Final</h1>
            <div
                ref={containerRef}
                className="p-4 font-mono text-sm border rounded-lg root"
                contentEditable
                onKeyDown={viewContent}
                >
            </div>

        </div>  
    );

    

            

    
};
export default JsonFinale;
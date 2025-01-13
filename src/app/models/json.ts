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
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface LineMap {
    [key: string]: ProcessedElement[];
  }
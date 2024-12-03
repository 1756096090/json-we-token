// page.tsx
import JsonFormatter from './components/JsonFormatter';

export default function Home() {


  const initialJson = {
    name: "Example",
    value: 123,
    items: ["a", "b", "c"]
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">JSON Editor</h1>
      < JsonFormatter
        data={initialJson}
      />
    </div>
  );
}
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/seltest")({
  head: () => ({ meta: [{ title: "Select test" }] }),
  component: Page,
});

function Page() {
  const [val, setVal] = useState("a");
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    const t = setTimeout(() => setVal("b"), 800);
    const t2 = setTimeout(() => setItems(["a", "b", "c"]), 400);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);
  const labels: Record<string, string> = { a: "Alpha", b: "Bravo", c: "Charlie" };
  return (
    <div className="space-y-6 p-6">
      <Select value={val} onValueChange={setVal}>
        <SelectTrigger id="late-trigger" className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((i) => (
            <SelectItem key={i} value={i}>
              {labels[i]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={val} onValueChange={setVal}>
        <SelectTrigger id="static-trigger" className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Bravo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

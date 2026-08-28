import { createFileRoute } from "@tanstack/react-router";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/seltest")({
  head: () => ({ meta: [{ title: "Select test" }] }),
  component: () => (
    <div className="space-y-6 p-6">
      <div id="wrapped">
        <Select value="b">
          <SelectTrigger id="w-trigger" className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
            <SelectItem value="b">Bravo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div id="raw">
        <SelectPrimitive.Root value="b">
          <SelectPrimitive.Trigger id="r-trigger">
            <SelectPrimitive.Value />
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content>
              <SelectPrimitive.Viewport>
                <SelectPrimitive.Item value="a">
                  <SelectPrimitive.ItemText>Alpha</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
                <SelectPrimitive.Item value="b">
                  <SelectPrimitive.ItemText>Bravo</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </div>
    </div>
  ),
});

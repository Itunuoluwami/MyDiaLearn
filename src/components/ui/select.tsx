"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Radix renders a hidden native <select> when the trigger sits inside a <form>.
 * When a controlled value is applied before the matching option has registered,
 * that native element bounces back a change event with an empty value, which
 * silently wipes the caller's state (forms then "save" empty fields).
 * Empty strings are never valid item values, so swallow them.
 */
const Select = ({
  onValueChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>) => (
  <SelectPrimitive.Root
    {...props}
    onValueChange={(next) => {
      if (next === "") return;
      onValueChange?.(next);
    }}
  />
);
Select.displayName = "Select";

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

/** Pull plain text out of arbitrary React children so options can be filtered. */
function childText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(childText).join(" ");
  if (React.isValidElement(node)) {
    return childText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

function isSelectItem(node: React.ReactNode): node is React.ReactElement<{
  children?: React.ReactNode;
  value?: string;
}> {
  return React.isValidElement(node) && node.type === SelectItem;
}

function countItems(children: React.ReactNode): number {
  let total = 0;
  React.Children.forEach(children, (child) => {
    if (isSelectItem(child)) {
      total += 1;
    } else if (React.isValidElement(child)) {
      total += countItems((child.props as { children?: React.ReactNode }).children);
    }
  });
  return total;
}

function filterChildren(children: React.ReactNode, query: string): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (isSelectItem(child)) {
      const label = childText(child.props.children) || String(child.props.value ?? "");
      return label.toLowerCase().includes(query) ? child : null;
    }
    if (React.isValidElement(child)) {
      const nested = (child.props as { children?: React.ReactNode }).children;
      if (nested === undefined) return child;
      const filtered = filterChildren(nested, query);
      const hasVisible = React.Children.toArray(filtered).some(Boolean);
      if (!hasVisible) return null;
      return React.cloneElement(child as React.ReactElement<{ children?: React.ReactNode }>, {
        children: filtered,
      });
    }
    return child;
  });
}

/** Long lists (more than this many options) get a search box automatically. */
const SEARCH_THRESHOLD = 8;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    /** Force the search box on/off. Defaults to on for lists longer than 8 options. */
    searchable?: boolean;
    searchPlaceholder?: string;
  }
>(({ className, children, position = "popper", searchable, searchPlaceholder, ...props }, ref) => {
  const [query, setQuery] = React.useState("");
  const total = React.useMemo(() => countItems(children), [children]);
  const showSearch = searchable ?? total > SEARCH_THRESHOLD;
  const normalized = query.trim().toLowerCase();
  const visible = React.useMemo(
    () => (showSearch && normalized ? filterChildren(children, normalized) : children),
    [children, normalized, showSearch],
  );
  const hasResults = React.Children.toArray(visible).some(Boolean);

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 flex max-h-(--radix-select-content-available-height) min-w-[8rem] flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        {showSearch ? (
          <div className="sticky top-0 z-10 border-b bg-popover p-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder ?? "Search…"}
                aria-label={searchPlaceholder ?? "Search options"}
                className="h-10 w-full rounded-md border border-input bg-transparent pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                onKeyDown={(event) => {
                  // Let Radix keep arrow/enter/escape handling; swallow typing so its
                  // built-in typeahead doesn't steal focus from this input.
                  if (!["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(event.key)) {
                    event.stopPropagation();
                  }
                }}
              />
            </div>
          </div>
        ) : null}
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "max-h-72 overflow-y-auto overflow-x-hidden p-1",
            position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {visible}
          {showSearch && !hasResults ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">No matches found</p>
          ) : null}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

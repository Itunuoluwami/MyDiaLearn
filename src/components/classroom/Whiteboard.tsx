import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The lesson whiteboard.
 *
 * A drawing surface needs no third party — this is a canvas and a pointer —
 * so the board works today: a tutor can sketch a diagram and talk over it, and
 * the person beside them can see it on a shared screen.
 *
 * What it does not do yet is appear on the other person's device. Sending
 * strokes to the far end needs the same realtime transport the video does, so
 * it belongs with the provider rather than here. The board is built so that
 * arrives as a subscriber on `strokes` rather than a rewrite: every stroke is
 * already a plain, serialisable object recorded in order.
 */

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  /** An eraser is a stroke drawn in the board's own background. */
  erase: boolean;
}

const PENS = [
  { label: "Ink", value: "#15313a" },
  { label: "Teal", value: "#1e5f74" },
  { label: "Orange", value: "#f2a65a" },
  { label: "Red", value: "#c2452d" },
];

export function Whiteboard({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const drawing = useRef<Stroke | null>(null);
  const [color, setColor] = useState(PENS[0]!.value);
  const [erasing, setErasing] = useState(false);
  const [empty, setEmpty] = useState(true);

  /**
   * Repaints every stroke.
   *
   * Strokes are kept and replayed rather than painted once, because a canvas
   * loses its bitmap when it is resized — a tutor rotating a tablet or opening
   * a panel would otherwise wipe the board mid-explanation.
   */
  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== Math.round(width * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.lineCap = "round";
    context.lineJoin = "round";

    for (const stroke of strokes.current) {
      if (stroke.points.length === 0) continue;
      context.beginPath();
      context.strokeStyle = stroke.erase ? "#ffffff" : stroke.color;
      context.lineWidth = stroke.erase ? stroke.width * 6 : stroke.width;
      const [first, ...rest] = stroke.points;
      context.moveTo(first!.x, first!.y);
      for (const point of rest) context.lineTo(point.x, point.y);
      context.stroke();
    }
  }, []);

  useEffect(() => {
    repaint();
    const observer = new ResizeObserver(() => repaint());
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [repaint]);

  function pointOf(event: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    // Capture so a stroke that leaves the canvas still ends cleanly.
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = {
      points: [pointOf(event)],
      color,
      width: 2.5,
      erase: erasing,
    };
    strokes.current = [...strokes.current, drawing.current];
    setEmpty(false);
  }

  function extend(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current.points.push(pointOf(event));
    repaint();
  }

  function finish() {
    drawing.current = null;
  }

  function undo() {
    strokes.current = strokes.current.slice(0, -1);
    setEmpty(strokes.current.length === 0);
    repaint();
  }

  function clear() {
    strokes.current = [];
    setEmpty(true);
    repaint();
  }

  return (
    <div className={cn("card-elevated p-4", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          {PENS.map((pen) => (
            <button
              key={pen.value}
              type="button"
              aria-label={`${pen.label} pen`}
              aria-pressed={!erasing && color === pen.value}
              onClick={() => {
                setColor(pen.value);
                setErasing(false);
              }}
              className={cn(
                "focus-ring size-8 rounded-full border-2 transition-transform",
                !erasing && color === pen.value
                  ? "scale-110 border-foreground"
                  : "border-transparent",
              )}
              style={{ backgroundColor: pen.value }}
            />
          ))}
        </div>

        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

        <Button
          type="button"
          variant={erasing ? "secondary" : "ghost"}
          size="sm"
          className="min-h-11 sm:min-h-9"
          aria-pressed={erasing}
          onClick={() => setErasing((value) => !value)}
        >
          {erasing ? <Eraser className="size-4" /> : <Pencil className="size-4" />}
          {erasing ? "Eraser" : "Pen"}
        </Button>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11 sm:min-h-9"
            disabled={empty}
            onClick={undo}
          >
            <RotateCcw className="size-4" /> Undo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11 sm:min-h-9"
            disabled={empty}
            onClick={clear}
          >
            <Trash2 className="size-4" /> Clear
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={extend}
        onPointerUp={finish}
        onPointerCancel={finish}
        className="aspect-[4/3] w-full touch-none rounded-xl border border-border bg-white"
      />

      <p className="mt-2 text-xs text-muted-foreground">
        Visible on your own screen. Sharing the board with the other side arrives with live video —
        share your screen to show it in the meantime.
      </p>
    </div>
  );
}

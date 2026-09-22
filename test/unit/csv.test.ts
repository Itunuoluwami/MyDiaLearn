import { describe, expect, it } from "vitest";

import { toCsv } from "@/lib/csv";

/**
 * Admin exports run entirely client-side. Escaping is the whole risk surface:
 * a tutor name containing a comma or a quote silently corrupts every column to
 * its right in the downloaded file.
 */
describe("toCsv", () => {
  const columns = [
    { key: "name" as const, label: "Name" },
    { key: "email" as const, label: "Email" },
  ];

  it("writes a header row from the column labels", () => {
    expect(toCsv([], columns)).toBe("Name,Email\n");
  });

  it("emits one line per row", () => {
    const csv = toCsv(
      [
        { name: "Ada", email: "ada@example.com" },
        { name: "Grace", email: "grace@example.com" },
      ],
      columns,
    );
    expect(csv.split("\n")).toEqual([
      "Name,Email",
      "Ada,ada@example.com",
      "Grace,grace@example.com",
    ]);
  });

  it("quotes cells containing a comma", () => {
    const csv = toCsv([{ name: "Lovelace, Ada", email: "ada@example.com" }], columns);
    expect(csv).toContain('"Lovelace, Ada"');
  });

  it("doubles embedded quotes", () => {
    const csv = toCsv([{ name: 'Ada "The Countess"', email: "a@b.com" }], columns);
    expect(csv).toContain('"Ada ""The Countess"""');
  });

  it("quotes cells containing a newline", () => {
    const csv = toCsv([{ name: "line one\nline two", email: "a@b.com" }], columns);
    expect(csv).toContain('"line one\nline two"');
  });

  it("renders null and undefined as empty, not as the literal words", () => {
    const csv = toCsv(
      [{ name: null as unknown as string, email: undefined as unknown as string }],
      columns,
    );
    expect(csv).toBe("Name,Email\n,");
  });

  it("serialises non-string values via JSON", () => {
    const cols = [{ key: "n" as const, label: "N" }];
    expect(toCsv([{ n: 42 }], cols)).toBe("N\n42");
    expect(toCsv([{ n: true }], cols)).toBe("N\ntrue");
  });

  it("only emits the requested columns, in order", () => {
    const csv = toCsv([{ name: "Ada", email: "a@b.com", secret: "hidden" }], [
      { key: "email" as const, label: "Email" },
      { key: "name" as const, label: "Name" },
    ] as { key: "email" | "name"; label: string }[]);
    expect(csv).toBe("Email,Name\na@b.com,Ada");
    expect(csv).not.toContain("hidden");
  });
});

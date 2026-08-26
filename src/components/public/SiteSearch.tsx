import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { settingList, usePublicSettings, useSearchSuggestions } from "@/lib/public-data";

/**
 * Main marketplace search: live suggestions (subjects + curricula from the
 * admin-managed lookup tables) and an admin-editable trending searches row.
 */
export function SiteSearch({
  initialTerm = "",
  showTrending = true,
}: {
  initialTerm?: string;
  showTrending?: boolean;
}) {
  const navigate = useNavigate();
  const [term, setTerm] = useState(initialTerm);
  const [debounced, setDebounced] = useState(initialTerm);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: settings } = usePublicSettings();
  const trending = settingList<string>(settings, "content.trending_searches");
  const { data: suggestions = [], isFetching } = useSearchSuggestions(debounced);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term), 200);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goToSearch(query: string) {
    setOpen(false);
    void navigate({ to: "/tutors", search: { q: query.trim() } });
  }

  return (
    <div className="w-full">
      <div ref={wrapperRef} className="relative">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            goToSearch(term);
          }}
          className="flex gap-2"
          role="search"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(event) => {
                setTerm(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search a subject or curriculum, e.g. IGCSE Maths"
              aria-label="Search subjects and curricula"
              className="h-12 rounded-md bg-card pl-9 text-base"
            />
          </div>
          <Button type="submit" variant="cta" className="h-12 shrink-0 px-5">
            Search
          </Button>
        </form>

        {open && debounced.trim().length >= 2 ? (
          <div className="card-warm absolute inset-x-0 top-full z-30 mt-2 overflow-hidden p-1">
            {suggestions.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">
                {isFetching ? "Searching…" : "No matching subjects or curricula."}
              </p>
            ) : (
              <ul>
                {suggestions.map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      to="/tutors"
                      search={
                        item.kind === "subject"
                          ? { subject: item.id }
                          : { curriculum: item.id }
                      }
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors hover:bg-muted"
                    >
                      {item.kind === "subject" ? (
                        <BookOpen className="size-4 shrink-0 text-primary" />
                      ) : (
                        <GraduationCap className="size-4 shrink-0 text-primary" />
                      )}
                      <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                      <span className="shrink-0 text-xs text-muted-foreground capitalize">
                        {item.kind}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      {showTrending && trending.length > 0 ? (
        <div className="-mx-1 mt-3 flex items-center gap-2 overflow-x-auto px-1 pb-1">
          <span className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Trending
          </span>
          {trending.map((item) => (
            <Link
              key={item}
              to="/tutors"
              search={{ q: item }}
              className="shrink-0 rounded-md border border-border bg-card px-3 py-2 text-sm whitespace-nowrap text-foreground transition-colors hover:border-primary-soft hover:bg-primary-soft/40"
            >
              {item}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

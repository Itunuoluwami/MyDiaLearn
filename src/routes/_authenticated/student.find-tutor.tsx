import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Filter,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";

import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useCountryFacets,
  useCurriculumFacets,
  useSubjectFacets,
  useTutorSearch,
} from "@/lib/public-data";
import { useLevelOptions } from "@/lib/parent-data";
import { useStudentRecord } from "@/lib/student-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/student/find-tutor")({
  head: () => ({
    meta: [
      { title: "Find a Tutor — DiaLearn Student Portal" },
      { name: "description", content: "Search verified tutors to help you learn. Ask a parent to book one for you." },
    ],
  }),
  component: StudentFindTutorPage,
});

const SORTS = [
  { value: "top_rated", label: "Top Rated" },
  { value: "price_low", label: "Lowest Price" },
  { value: "price_high", label: "Highest Price" },
  { value: "experience", label: "Most Experienced" },
  { value: "newest", label: "Newest" },
];

function StudentFindTutorPage() {
  const { data: student } = useStudentRecord();

  const [term, setTerm] = useState("");
  const [subject, setSubject] = useState<string | undefined>(undefined);
  const [curriculum, setCurriculum] = useState<string | undefined>(student?.curriculum_id ?? undefined);
  const [level, setLevel] = useState<string | undefined>(student?.education_level_id ?? undefined);
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState("top_rated");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const subjects = useSubjectFacets();
  const curricula = useCurriculumFacets();
  const countries = useCountryFacets();
  const levels = useLevelOptions(curriculum);

  const results = useTutorSearch({
    q: term || undefined,
    subject,
    curriculum,
    level,
    country,
    language: language || undefined,
    minRating: minRating > 0 ? minRating : undefined,
    maxPrice,
    sort,
    limit: 24,
  });

  const total = results.data?.[0]?.total_count
    ? Number(results.data[0].total_count)
    : results.data?.length ?? 0;

  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (subject) {
      const found = (subjects.data ?? []).find((item) => item.id === subject);
      chips.push({ key: "subject", label: found?.name ?? "Subject", clear: () => setSubject(undefined) });
    }
    if (curriculum) {
      const found = (curricula.data ?? []).find((item) => item.id === curriculum);
      chips.push({
        key: "curriculum",
        label: found?.name ?? "Curriculum",
        clear: () => { setCurriculum(undefined); setLevel(undefined); },
      });
    }
    if (level) {
      const found = (levels.data ?? []).find((item) => item.id === level);
      chips.push({ key: "level", label: found?.name ?? "Level", clear: () => setLevel(undefined) });
    }
    if (country) chips.push({ key: "country", label: country, clear: () => setCountry(undefined) });
    if (language) chips.push({ key: "language", label: language, clear: () => setLanguage("") });
    if (minRating > 0) chips.push({ key: "rating", label: `${minRating}+ stars`, clear: () => setMinRating(0) });
    if (maxPrice) chips.push({ key: "price", label: `Up to ${maxPrice}/hr`, clear: () => setMaxPrice(undefined) });
    return chips;
  }, [subject, curriculum, level, country, language, minRating, maxPrice, subjects.data, curricula.data, levels.data]);

  function clearAll() {
    setSubject(undefined);
    setCurriculum(undefined);
    setLevel(undefined);
    setCountry(undefined);
    setLanguage("");
    setMinRating(0);
    setMaxPrice(undefined);
  }

  const filterPanel = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="sf-subject">Subject</Label>
        <Select value={subject ?? ""} onValueChange={(v) => setSubject(v || undefined)}>
          <SelectTrigger id="sf-subject" className="min-h-11 rounded-xl">
            <SelectValue placeholder="Any subject" />
          </SelectTrigger>
          <SelectContent>
            {(subjects.data ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sf-curriculum">Curriculum</Label>
        <Select value={curriculum ?? ""} onValueChange={(v) => { setCurriculum(v || undefined); setLevel(undefined); }}>
          <SelectTrigger id="sf-curriculum" className="min-h-11 rounded-xl">
            <SelectValue placeholder="Any curriculum" />
          </SelectTrigger>
          <SelectContent>
            {(curricula.data ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sf-level">Level / Grade</Label>
        <Select value={level ?? ""} onValueChange={(v) => setLevel(v || undefined)} disabled={(levels.data ?? []).length === 0}>
          <SelectTrigger id="sf-level" className="min-h-11 rounded-xl">
            <SelectValue placeholder="Any level" />
          </SelectTrigger>
          <SelectContent>
            {(levels.data ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sf-country">Tutor's Country</Label>
        <Select value={country ?? ""} onValueChange={(v) => setCountry(v || undefined)}>
          <SelectTrigger id="sf-country" className="min-h-11 rounded-xl">
            <SelectValue placeholder="Anywhere" />
          </SelectTrigger>
          <SelectContent>
            {(countries.data ?? []).map((item) => (
              <SelectItem key={item.country_code} value={item.country_code}>
                {item.country_code} ({Number(item.tutor_count)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sf-language">Teaching Language</Label>
        <Input
          id="sf-language"
          className="min-h-11 rounded-xl"
          placeholder="e.g. English"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="sf-rating">Minimum Rating: {minRating > 0 ? `${minRating} ⭐` : "Any"}</Label>
        <Slider id="sf-rating" min={0} max={5} step={0.5} value={[minRating]} onValueChange={(v) => setMinRating(v[0] ?? 0)} />
      </div>

      <Button variant="outline" className="min-h-11 w-full rounded-xl" onClick={clearAll}>
        <X className="size-4" /> Clear filters
      </Button>
    </div>
  );

  return (
    <StudentShell
      title="🔍 Find a Tutor"
      description="Browse verified tutors and ask your parent to book the one you like!"
    >
      <div className="space-y-5">
        {/* Booking note for students without booking permission */}
        {!student?.can_book_lessons && (
          <div className="rounded-2xl border border-secondary/40 bg-secondary/10 p-4">
            <p className="text-sm font-bold text-secondary-foreground">
              💡 Found a tutor you like? Ask your parent to book them for you.
              A booking request will be sent for their approval.
            </p>
          </div>
        )}

        {/* Search bar + sort + filter toggle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              className="min-h-12 rounded-2xl pl-10 text-base"
              placeholder="Search by name or subject…"
              aria-label="Search tutors"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="min-h-12 rounded-2xl sm:w-48">
              <SlidersHorizontal className="size-4 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((item) => (
                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" className="min-h-12 rounded-2xl gap-2">
                <Filter className="size-4" /> Filters
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="rounded-full">{activeFilters.length}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl p-5">
              <SheetTitle className="text-lg font-extrabold">Filter Tutors</SheetTitle>
              <div className="mt-5">{filterPanel}</div>
              <Button variant="cta" className="mt-5 min-h-12 w-full rounded-2xl font-bold" onClick={() => setDrawerOpen(false)}>
                Show {total} tutor{total === 1 ? "" : "s"}
              </Button>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-bold transition-colors hover:bg-primary/5"
              >
                {chip.label}
                <X className="size-3.5" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="min-h-9 rounded-full px-3 text-xs font-bold text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-extrabold text-foreground">Filter Tutors</h2>
              {filterPanel}
            </div>
          </aside>

          <div>
            <p className="mb-4 text-sm font-semibold text-muted-foreground" aria-live="polite">
              {results.isLoading ? "Searching…" : `${total} tutor${total === 1 ? "" : "s"} found`}
            </p>

            {results.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : results.isError ? (
              <ErrorState onRetry={() => void results.refetch()} />
            ) : (results.data ?? []).length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
                <span className="text-5xl">🔎</span>
                <p className="font-bold text-foreground">No tutors found</p>
                <p className="text-sm text-muted-foreground">Try changing your filters</p>
                <Button variant="outline" className="min-h-11 rounded-xl" onClick={clearAll}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(results.data ?? []).map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    canBook={student?.can_book_lessons ?? false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentShell>
  );
}

type TutorData = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  headline?: string | null;
  avg_rating?: number | null;
  review_count?: number | null;
  hourly_rate?: number | null;
  currency?: string | null;
  country_code?: string | null;
  languages?: string[] | null;
  subjects?: string[] | null;
};

function TutorCard({ tutor, canBook }: { tutor: TutorData; canBook: boolean }) {
  const stars = Math.round(Number(tutor.avg_rating ?? 0));
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        {tutor.avatar_url ? (
          <img src={tutor.avatar_url} alt={tutor.full_name ?? "Tutor"} className="size-14 rounded-2xl object-cover" />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-extrabold text-primary">
            {(tutor.full_name ?? "T").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-foreground truncate">{tutor.full_name ?? "Tutor"}</p>
          {tutor.headline && (
            <p className="text-xs text-muted-foreground truncate">{tutor.headline}</p>
          )}
          <div className="mt-1 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn("size-3.5", i < stars ? "fill-secondary text-secondary" : "text-muted")}
              />
            ))}
            {Number(tutor.review_count ?? 0) > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">({tutor.review_count})</span>
            )}
          </div>
        </div>
      </div>

      {(tutor.subjects ?? []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(tutor.subjects ?? []).slice(0, 4).map((s) => (
            <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-extrabold text-primary-deep">
            {tutor.hourly_rate
              ? new Intl.NumberFormat(undefined, { style: "currency", currency: tutor.currency ?? "USD", maximumFractionDigits: 0 }).format(Number(tutor.hourly_rate))
              : "—"}
            <span className="text-xs font-semibold text-muted-foreground"> / hr</span>
          </p>
          {tutor.country_code && <p className="text-xs text-muted-foreground">📍 {tutor.country_code}</p>}
        </div>
        <Button asChild size="sm" className={cn("min-h-10 rounded-xl font-bold", canBook ? "bg-accent hover:bg-accent/90 text-white" : "")}>
          {canBook ? (
            <Link to="/student/book/$tutorId" params={{ tutorId: tutor.id }}>
              Book Now
            </Link>
          ) : (
            <Link to="/tutors/$tutorId" params={{ tutorId: tutor.id }}>
              View Profile
            </Link>
          )}
        </Button>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
      <span className="text-5xl">😕</span>
      <p className="font-bold text-foreground">Couldn't load tutors</p>
      <Button variant="outline" className="min-h-11 rounded-xl" onClick={onRetry}>Try again</Button>
    </div>
  );
}

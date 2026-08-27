import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Search, SlidersHorizontal, Star, Users, X } from "lucide-react";

import { ParentShell } from "@/components/parent/ParentShell";
import { ChildSwitcher } from "@/components/parent/ChildSwitcher";
import { CardSkeletonList, EmptyPanel, LoadError, SectionCard } from "@/components/parent/ui";
import { ParentTutorCard } from "@/components/parent/ParentTutorCard";
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
import { childName, useChildren, useLevelOptions } from "@/lib/parent-data";

type FindTutorSearch = { child?: string; subject?: string };

export const Route = createFileRoute("/_authenticated/find-tutor")({
  validateSearch: (search: Record<string, unknown>): FindTutorSearch => {
    const next: FindTutorSearch = {};
    if (typeof search['child'] === "string") next.child = search['child'];
    if (typeof search['subject'] === "string") next.subject = search['subject'];
    return next;
  },
  head: () => ({
    meta: [
      { title: "Find a tutor — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "Search verified African tutors by subject, curriculum, level, country, language, rating and hourly rate for each of your children.",
      },
      { property: "og:title", content: "Find a tutor — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "Filter verified tutors and book the right match for your child.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FindTutorPage,
});

const SORTS = [
  { value: "top_rated", label: "Top rated" },
  { value: "price_low", label: "Lowest price" },
  { value: "price_high", label: "Highest price" },
  { value: "experience", label: "Most experienced" },
  { value: "newest", label: "Newest" },
];

function FindTutorPage() {
  const search = Route.useSearch();
  const children = useChildren();
  const kids = children.data ?? [];

  const [childId, setChildId] = useState<string | null>(search.child ?? null);
  const [term, setTerm] = useState("");
  const [subject, setSubject] = useState<string | undefined>(search.subject);
  const [curriculum, setCurriculum] = useState<string | undefined>(undefined);
  const [level, setLevel] = useState<string | undefined>(undefined);
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

  const selectedChild = kids.find((child) => child.id === childId) ?? null;

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

  const total = results.data?.[0]?.total_count ? Number(results.data[0].total_count) : results.data?.length ?? 0;

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
        clear: () => {
          setCurriculum(undefined);
          setLevel(undefined);
        },
      });
    }
    if (level) {
      const found = (levels.data ?? []).find((item) => item.id === level);
      chips.push({ key: "level", label: found?.name ?? "Level", clear: () => setLevel(undefined) });
    }
    if (country) chips.push({ key: "country", label: country, clear: () => setCountry(undefined) });
    if (language) chips.push({ key: "language", label: language, clear: () => setLanguage("") });
    if (minRating > 0)
      chips.push({ key: "rating", label: `${minRating}+ rating`, clear: () => setMinRating(0) });
    if (maxPrice)
      chips.push({ key: "price", label: `Up to ${maxPrice}/hr`, clear: () => setMaxPrice(undefined) });
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
        <Label htmlFor="f-subject">Subject</Label>
        <Select value={subject ?? ""} onValueChange={(value) => setSubject(value || undefined)}>
          <SelectTrigger id="f-subject" className="min-h-11">
            <SelectValue placeholder="Any subject" />
          </SelectTrigger>
          <SelectContent>
            {(subjects.data ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="f-curriculum">Curriculum</Label>
        <Select
          value={curriculum ?? ""}
          onValueChange={(value) => {
            setCurriculum(value || undefined);
            setLevel(undefined);
          }}
        >
          <SelectTrigger id="f-curriculum" className="min-h-11">
            <SelectValue placeholder="Any curriculum" />
          </SelectTrigger>
          <SelectContent>
            {(curricula.data ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="f-level">Level / grade</Label>
        <Select
          value={level ?? ""}
          onValueChange={(value) => setLevel(value || undefined)}
          disabled={(levels.data ?? []).length === 0}
        >
          <SelectTrigger id="f-level" className="min-h-11">
            <SelectValue placeholder="Any level" />
          </SelectTrigger>
          <SelectContent>
            {(levels.data ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="f-country">Tutor country</Label>
        <Select value={country ?? ""} onValueChange={(value) => setCountry(value || undefined)}>
          <SelectTrigger id="f-country" className="min-h-11">
            <SelectValue placeholder="Any country" />
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
        <Label htmlFor="f-language">Teaching language</Label>
        <Input
          id="f-language"
          className="min-h-11"
          placeholder="e.g. English"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="f-rating">Minimum rating: {minRating > 0 ? `${minRating}★` : "any"}</Label>
        <Slider
          id="f-rating"
          min={0}
          max={5}
          step={0.5}
          value={[minRating]}
          onValueChange={(value) => setMinRating(value[0] ?? 0)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="f-price">Maximum hourly rate</Label>
        <Input
          id="f-price"
          className="min-h-11"
          type="number"
          min={0}
          placeholder="Any rate"
          value={maxPrice ?? ""}
          onChange={(event) =>
            setMaxPrice(event.target.value ? Number(event.target.value) : undefined)
          }
        />
        <p className="text-xs text-muted-foreground">
          Rates are shown in each tutor's own currency, as configured on the platform.
        </p>
      </div>

      <Button variant="outline" className="min-h-11 w-full" onClick={clearAll}>
        <X className="size-4" /> Clear filters
      </Button>
    </div>
  );

  return (
    <ParentShell
      title="Find a tutor"
      description="Search verified tutors, then book for a specific child."
    >
      <div className="space-y-6">
        <SectionCard title="Who is this lesson for?" description="Pick a child before you book.">
          {children.isLoading ? (
            <CardSkeletonList rows={1} height="h-14" />
          ) : (
            <ChildSwitcher
              children={kids}
              selectedId={childId}
              onSelect={setChildId}
              allowAll={false}
            />
          )}
          {kids.length > 0 && !selectedChild ? (
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="size-3.5" aria-hidden="true" />
              Select a child so bookings are linked to the right learner.
            </p>
          ) : null}
        </SectionCard>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="min-h-12 pl-9"
              placeholder="Search tutors, subjects or keywords"
              aria-label="Search tutors"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="min-h-12 sm:w-48" aria-label="Sort results">
              <SlidersHorizontal className="size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" className="min-h-12">
                <Filter className="size-4" /> Filters
                {activeFilters.length > 0 ? (
                  <Badge variant="secondary">{activeFilters.length}</Badge>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-4">
              <SheetTitle>Filter tutors</SheetTitle>
              <div className="mt-4">{filterPanel}</div>
              <Button variant="cta" className="mt-5 min-h-12 w-full" onClick={() => setDrawerOpen(false)}>
                Show {total} tutors
              </Button>
            </SheetContent>
          </Sheet>
        </div>

        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium transition-colors hover:bg-surface"
              >
                {chip.label}
                <X className="size-3.5" aria-hidden="true" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="focus-ring min-h-9 rounded-full px-3 text-xs font-semibold text-primary"
            >
              Clear all
            </button>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="card-elevated sticky top-24 p-4">
              <h2 className="mb-4 text-sm font-semibold">Filters</h2>
              {filterPanel}
            </div>
          </aside>

          <div>
            <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
              {results.isLoading ? "Searching tutors…" : `${total} tutor${total === 1 ? "" : "s"} found`}
            </p>

            {results.isLoading ? (
              <CardSkeletonList rows={4} height="h-40" />
            ) : results.isError ? (
              <LoadError
                message="We couldn't load tutors right now."
                onRetry={() => void results.refetch()}
              />
            ) : (results.data ?? []).length === 0 ? (
              <EmptyPanel
                icon={Star}
                title="No tutors found"
                body="Try adjusting your filters or search criteria."
                action={
                  <Button variant="outline" className="min-h-11" onClick={clearAll}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {(results.data ?? []).map((tutor) => (
                  <ParentTutorCard
                    key={tutor.id}
                    tutor={tutor}
                    childId={childId ?? undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Looking for the public profiles instead?{" "}
          <Link to="/tutors" className="font-semibold text-primary underline-offset-4 hover:underline">
            Browse the marketplace
          </Link>
          .
        </p>
      </div>
    </ParentShell>
  );
}

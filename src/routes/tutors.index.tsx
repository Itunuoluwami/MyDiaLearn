import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { SiteSearch } from "@/components/public/SiteSearch";
import { TutorCard } from "@/components/public/TutorCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  countryLabel,
  settingMap,
  usePublicSettings,
  useCountryFacets,
  useCurriculumFacets,
  useEducationLevels,
  useSubjectFacets,
  useTutorSearch,
} from "@/lib/public-data";

export interface TutorSearchSchema {
  q?: string;
  subject?: string;
  curriculum?: string;
  country?: string;
  level?: string;
  language?: string;
  minRating?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function numeric(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export const Route = createFileRoute("/tutors/")({
  validateSearch: (search: Record<string, unknown>): TutorSearchSchema => ({
    q: text(search.q),
    subject: text(search.subject),
    curriculum: text(search.curriculum),
    country: text(search.country),
    level: text(search.level),
    language: text(search.language),
    minRating: numeric(search.minRating),
    maxPrice: numeric(search.maxPrice),
    sort: text(search.sort),
    page: numeric(search.page),
  }),
  head: () => ({
    meta: [
      { title: "Find a verified tutor — DiaLearn" },
      {
        name: "description",
        content:
          "Search verified African tutors by subject, curriculum, country, language, rating and hourly rate, then book a one-to-one lesson.",
      },
      { property: "og:title", content: "Find a verified tutor — DiaLearn" },
      {
        property: "og:description",
        content: "Filter verified African tutors by subject, curriculum, country, rating and price.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorSearchPage,
});

const SORT_OPTIONS = [
  { value: "top_rated", label: "Top rated" },
  { value: "experience", label: "Most experienced" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
];

const RATING_OPTIONS = [
  { value: "4.5", label: "4.5 and above" },
  { value: "4", label: "4.0 and above" },
  { value: "3", label: "3.0 and above" },
];

const ANY = "any";
const PAGE_SIZE = 12;

function FilterPanel({
  search,
  update,
  clear,
  languages,
}: {
  search: TutorSearchSchema;
  update: (patch: Partial<TutorSearchSchema>) => void;
  clear: () => void;
  languages: string[];
}) {
  const { data: subjects = [] } = useSubjectFacets();
  const { data: curricula = [] } = useCurriculumFacets();
  const { data: countries = [] } = useCountryFacets();
  const { data: levels = [] } = useEducationLevels(search.curriculum);
  const { data: settings } = usePublicSettings();
  const labels = settingMap(settings, "content.country_labels");

  const [price, setPrice] = useState(search.maxPrice ?? 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clear}>
          <X className="size-4" /> Clear
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Subject</Label>
        <Select
          value={search.subject ?? ANY}
          onValueChange={(value) => update({ subject: value === ANY ? undefined : value })}
        >
          <SelectTrigger className="min-h-11 w-full">
            <SelectValue placeholder="Any subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any subject</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Curriculum</Label>
        <Select
          value={search.curriculum ?? ANY}
          onValueChange={(value) =>
            update({ curriculum: value === ANY ? undefined : value, level: undefined })
          }
        >
          <SelectTrigger className="min-h-11 w-full">
            <SelectValue placeholder="Any curriculum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any curriculum</SelectItem>
            {curricula.map((curriculum) => (
              <SelectItem key={curriculum.id} value={curriculum.id}>
                {curriculum.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Grade / level</Label>
        <Select
          value={search.level ?? ANY}
          onValueChange={(value) => update({ level: value === ANY ? undefined : value })}
        >
          <SelectTrigger className="min-h-11 w-full">
            <SelectValue placeholder="Any level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any level</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tutor country</Label>
        <Select
          value={search.country ?? ANY}
          onValueChange={(value) => update({ country: value === ANY ? undefined : value })}
        >
          <SelectTrigger className="min-h-11 w-full">
            <SelectValue placeholder="Any country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any country</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.country_code} value={country.country_code}>
                {countryLabel(country.country_code, labels)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {languages.length > 0 ? (
        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            value={search.language ?? ANY}
            onValueChange={(value) => update({ language: value === ANY ? undefined : value })}
          >
            <SelectTrigger className="min-h-11 w-full">
              <SelectValue placeholder="Any language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any language</SelectItem>
              {languages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label>Rating</Label>
        <Select
          value={search.minRating ? String(search.minRating) : ANY}
          onValueChange={(value) =>
            update({ minRating: value === ANY ? undefined : Number(value) })
          }
        >
          <SelectTrigger className="min-h-11 w-full">
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any rating</SelectItem>
            {RATING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Maximum hourly rate</Label>
        <Slider
          value={[price]}
          min={5}
          max={200}
          step={5}
          onValueChange={(value) => setPrice(value[0] ?? 100)}
          onValueCommit={(value) => update({ maxPrice: value[0] })}
        />
        <p className="text-xs text-muted-foreground">
          Up to {price} per hour{search.maxPrice ? "" : " (not applied yet)"}
        </p>
      </div>
    </div>
  );
}

function TutorSearchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = Math.max(1, search.page ?? 1);
  const sort = search.sort ?? "top_rated";

  const { data: tutors = [], isLoading } = useTutorSearch({
    q: search.q,
    subject: search.subject,
    curriculum: search.curriculum,
    country: search.country,
    level: search.level,
    language: search.language,
    minRating: search.minRating,
    maxPrice: search.maxPrice,
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  // Language options are derived from live tutor data, never a hardcoded list.
  const { data: languagePool = [] } = useTutorSearch({ limit: 60, sort: "top_rated" });
  const languages = useMemo(() => {
    const set = new Set<string>();
    for (const tutor of languagePool) {
      const list = Array.isArray(tutor.languages) ? tutor.languages : [];
      for (const item of list) if (typeof item === "string") set.add(item);
    }
    return [...set].sort();
  }, [languagePool]);

  const { data: settings } = usePublicSettings();
  const labels = settingMap(settings, "content.country_labels");

  const total = Number(tutors[0]?.total_count ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function update(patch: Partial<TutorSearchSchema>) {
    void navigate({
      to: "/tutors",
      search: (prev) => ({ ...prev, ...patch, page: undefined }),
    });
  }

  function clear() {
    void navigate({ to: "/tutors", search: {} });
  }

  const filterPanel = (
    <FilterPanel search={search} update={update} clear={clear} languages={languages} />
  );

  return (
    <PublicShell>
      <section className="border-b border-border bg-surface">
        <div className="container-site py-6 md:py-10">
          <h1 className="display-section">Find a verified tutor</h1>
          <div className="mt-4 max-w-2xl">
            <SiteSearch initialTerm={search.q ?? ""} />
          </div>
        </div>
      </section>

      <div className="container-site py-6 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="panel-portal hidden h-fit p-5 lg:block">{filterPanel}</aside>

          <div className="min-w-0">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
              <p className="min-w-0 text-sm text-muted-foreground">
                {isLoading ? "Searching tutors…" : `${total} ${total === 1 ? "tutor" : "tutors"} found`}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="min-h-11 lg:hidden">
                      <SlidersHorizontal /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[19rem] overflow-y-auto p-5">
                    {filterPanel}
                  </SheetContent>
                </Sheet>
                <Select value={sort} onValueChange={(value) => update({ sort: value })}>
                  <SelectTrigger className="min-h-11 w-[11rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-56 rounded-2xl" />
                  ))
                : tutors.map((tutor) => (
                    <TutorCard key={tutor.id} tutor={tutor} countryLabels={labels} />
                  ))}
            </div>

            {!isLoading && tutors.length === 0 ? (
              <div className="card-warm mt-5 p-6">
                <h2 className="text-lg">No tutors match these filters yet</h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Try widening your filters, or clear them to see every verified tutor on DiaLearn.
                </p>
                <Button className="mt-4" variant="outline" onClick={clear}>
                  Clear filters
                </Button>
              </div>
            ) : null}

            {pageCount > 1 ? (
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() =>
                    void navigate({ to: "/tutors", search: (prev) => ({ ...prev, page: page - 1 }) })
                  }
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= pageCount}
                  onClick={() =>
                    void navigate({ to: "/tutors", search: (prev) => ({ ...prev, page: page + 1 }) })
                  }
                >
                  Next
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

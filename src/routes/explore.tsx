import { createFileRoute } from "@tanstack/react-router";

import { PublicShell } from "@/components/public/PublicShell";
import { SiteSearch } from "@/components/public/SiteSearch";
import {
  CurriculumGrid,
  LocationGrid,
  SubjectGrid,
  TutorStrip,
} from "@/components/public/BrowseSections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore tutors, subjects and curricula — DiaLearn" },
      {
        name: "description",
        content:
          "Browse DiaLearn by subject, curriculum, tutor location or tutor profile — every path leads to the same verified tutor search.",
      },
      { property: "og:title", content: "Explore tutors, subjects and curricula — DiaLearn" },
      {
        property: "og:description",
        content: "Four ways to browse DiaLearn: by subject, curriculum, location or tutor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

const SORTS = [
  { value: "top_rated", label: "Top rated" },
  { value: "experience", label: "Most experienced" },
  { value: "newest", label: "Newest" },
] as const;

function ExplorePage() {
  return (
    <PublicShell>
      <section className="band-hero border-b border-border">
        <div className="container-site py-8 md:py-12">
          <p className="eyebrow">Explore DiaLearn</p>
          <h1 className="display-section mt-2">Four ways in, one tutor search</h1>
          <p className="lead mt-3 max-w-2xl">
            Browse by subject, curriculum, tutor location or straight through tutor profiles. Every
            path opens the same verified tutor results.
          </p>
          <div className="mt-6 max-w-2xl">
            <SiteSearch />
          </div>
        </div>
      </section>

      <div className="container-site py-8 md:py-12">
        <Tabs defaultValue="subjects">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="subjects" className="min-h-11">
              By subject
            </TabsTrigger>
            <TabsTrigger value="curricula" className="min-h-11">
              By curriculum
            </TabsTrigger>
            <TabsTrigger value="locations" className="min-h-11">
              By location
            </TabsTrigger>
            <TabsTrigger value="tutors" className="min-h-11">
              Tutors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="mt-6">
            <h2 className="display-section text-2xl">Explore by subject</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Subjects are managed by the DiaLearn team. Tutor counts update as tutors are verified.
            </p>
            <div className="mt-5">
              <SubjectGrid />
            </div>
          </TabsContent>

          <TabsContent value="curricula" className="mt-6">
            <h2 className="display-section text-2xl">Explore by curriculum</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Match the exam board your child sits — British, American, IB, Canadian or national.
            </p>
            <div className="mt-5">
              <CurriculumGrid />
            </div>
          </TabsContent>

          <TabsContent value="locations" className="mt-6">
            <h2 className="display-section text-2xl">Explore by location</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Browse the countries our tutors teach from.
            </p>
            <div className="mt-5">
              <LocationGrid />
            </div>
          </TabsContent>

          <TabsContent value="tutors" className="mt-6">
            <h2 className="display-section text-2xl">Explore tutors</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              The same tutor list as search results, presented as a browsable catalogue.
            </p>
            {SORTS.map((sort) => (
              <div key={sort.value} className="mt-6">
                <h3 className="text-lg">{sort.label}</h3>
                <div className="mt-3">
                  <TutorStrip sort={sort.value} limit={8} />
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </PublicShell>
  );
}

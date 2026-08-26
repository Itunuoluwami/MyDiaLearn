import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, MapPin, Star } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  countryLabel,
  formatMoney,
  settingMap,
  usePublicSettings,
  useTutorDetail,
  useTutorReviews,
} from "@/lib/public-data";

export const Route = createFileRoute("/tutors/$tutorId")({
  head: () => ({
    meta: [
      { title: "Tutor profile — DiaLearn" },
      {
        name: "description",
        content:
          "Read a DiaLearn tutor's biography, qualifications, subjects, reviews and hourly rate, then book a one-to-one lesson.",
      },
      { property: "og:title", content: "Tutor profile — DiaLearn" },
      {
        property: "og:description",
        content: "Biography, qualifications, subjects, reviews and hourly rate for a DiaLearn tutor.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorProfilePage,
});

function initials(name: string | null) {
  if (!name) return "DL";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const parts = [
          record['title'],
          record['name'],
          record['institution'],
          record['year'],
        ].filter((part) => typeof part === "string" || typeof part === "number");

        return parts.join(" — ");
      }
      return "";
    })
    .filter(Boolean);
}

function TutorProfilePage() {
  const { tutorId } = Route.useParams();
  const { session } = useAuth();
  const { data: tutor, isLoading } = useTutorDetail(tutorId);
  const { data: reviews = [] } = useTutorReviews(tutorId);
  const { data: settings } = usePublicSettings();
  const labels = settingMap(settings, "content.country_labels");

  if (isLoading) {
    return (
      <PublicShell>
        <div className="container-site space-y-4 py-10">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </PublicShell>
    );
  }

  if (!tutor) {
    return (
      <PublicShell>
        <div className="container-site py-16 text-center">
          <h1 className="display-section">This tutor profile is not available</h1>
          <p className="lead mx-auto mt-3 max-w-lg">
            The tutor may have paused their listing or is still completing verification.
          </p>
          <Button asChild className="mt-6" variant="cta">
            <Link to="/tutors">Browse other tutors</Link>
          </Button>
        </div>
      </PublicShell>
    );
  }

  const rating = Number(tutor.rating_avg ?? 0);
  const qualifications = stringList(tutor.qualifications);
  const languages = stringList(tutor.languages);

  return (
    <PublicShell>
      <section className="band-hero border-b border-border">
        <div className="container-site py-8 md:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0">
              <div className="flex min-w-0 items-start gap-4">
                <Avatar className="size-20 shrink-0 md:size-24">
                  {tutor.avatar_url ? (
                    <AvatarImage src={tutor.avatar_url} alt={tutor.full_name ?? "Tutor"} />
                  ) : null}
                  <AvatarFallback className="bg-primary-soft text-lg text-primary-deep">
                    {initials(tutor.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h1 className="display-section text-3xl">{tutor.full_name ?? "DiaLearn tutor"}</h1>
                  {tutor.headline ? (
                    <p className="mt-1 text-sm text-muted-foreground">{tutor.headline}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="flex items-center gap-1 font-medium text-success">
                      <BadgeCheck className="size-4" /> Verified tutor
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-4" />
                      {countryLabel(tutor.country_code, labels)}
                    </span>
                    {tutor.timezone ? (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-4" /> {tutor.timezone}
                      </span>
                    ) : null}
                    {rating > 0 ? (
                      <span className="flex items-center gap-1 font-medium">
                        <Star className="size-4 fill-secondary text-secondary" />
                        {rating.toFixed(1)} ({tutor.rating_count})
                      </span>
                    ) : null}
                  </div>
                  {tutor.subjects?.length ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {tutor.subjects.map((subject) => (
                        <Badge key={subject} className="bg-primary-soft text-primary-deep">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <aside className="card-warm h-fit p-5">
              <p className="text-2xl font-semibold">
                {formatMoney(tutor.hourly_rate, tutor.currency)}
                <span className="text-sm font-normal text-muted-foreground"> / hour</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Lesson price is calculated from this rate and the length you choose.
              </p>
              <Button asChild variant="cta" size="lg" className="mt-4 w-full">
                <Link to={session ? "/account" : "/auth"}>Book a lesson</Link>
              </Button>
              {!session ? (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  You'll be asked to sign in or create an account first.
                </p>
              ) : null}
              {tutor.agency_name ? (
                <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                  Represented by {tutor.agency_name}
                </p>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      <div className="container-site grid gap-6 py-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-6">
          {tutor.intro_video_url ? (
            <section className="card-warm overflow-hidden p-0">
              <div className="aspect-video w-full bg-ink">
                <iframe
                  src={tutor.intro_video_url}
                  title={`${tutor.full_name ?? "Tutor"} introduction video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              </div>
            </section>
          ) : null}

          {tutor.biography ? (
            <section className="card-warm p-5 md:p-6">
              <h2 className="text-xl">About {tutor.full_name?.split(" ")[0] ?? "this tutor"}</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                {tutor.biography}
              </p>
            </section>
          ) : null}

          {qualifications.length > 0 ? (
            <section className="card-warm p-5 md:p-6">
              <h2 className="text-xl">Qualifications</h2>
              <ul className="mt-3 space-y-2">
                {qualifications.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="card-warm p-5 md:p-6">
            <h2 className="text-xl">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No published reviews yet. Reviews appear once families have completed lessons.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <li key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="flex items-center gap-1">
                        <Star className="size-4 fill-secondary text-secondary" />
                        {review.score}
                      </span>
                      <span>{review.reviewer_name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="panel-portal p-5">
            <h2 className="text-base font-semibold">At a glance</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {tutor.years_experience ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Experience</dt>
                  <dd className="font-medium">{tutor.years_experience} years</dd>
                </div>
              ) : null}
              {languages.length > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Languages</dt>
                  <dd className="text-right font-medium">{languages.join(", ")}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Based in</dt>
                <dd className="font-medium">{countryLabel(tutor.country_code, labels)}</dd>
              </div>
            </dl>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/tutors">Back to tutor search</Link>
          </Button>
        </aside>
      </div>
    </PublicShell>
  );
}

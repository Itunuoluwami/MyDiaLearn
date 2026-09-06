import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareQuote, Star } from "lucide-react";

import { TutorShell } from "@/components/tutor/TutorShell";
import { CardSkeletonList, EmptyPanel, LoadError, SectionCard } from "@/components/parent/ui";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative } from "@/lib/parent-data";
import { useRatingCategories, useRatingSummary, useTutorReviews } from "@/lib/tutor-workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor/reviews")({
  head: () => ({
    meta: [
      { title: "Ratings & reviews — DiaLearn tutor" },
      {
        name: "description",
        content:
          "See how families rate your teaching quality, communication, punctuality and preparation, with every published review in one place.",
      },
      { property: "og:title", content: "Ratings & reviews — DiaLearn tutor" },
      {
        property: "og:description",
        content: "Your rating breakdown and the words families used.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorReviewsPage,
});

function Stars({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${score} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            "size-3.5",
            value <= Math.round(score) ? "fill-secondary text-secondary" : "text-border",
          )}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function TutorReviewsPage() {
  const summary = useRatingSummary();
  const categories = useRatingCategories();
  const reviews = useTutorReviews();

  const totals = summary.data;
  const count = Number(totals?.rating_count ?? 0);
  const buckets = [
    { label: "5", value: Number(totals?.five_star ?? 0) },
    { label: "4", value: Number(totals?.four_star ?? 0) },
    { label: "3", value: Number(totals?.three_star ?? 0) },
    { label: "2", value: Number(totals?.two_star ?? 0) },
    { label: "1", value: Number(totals?.one_star ?? 0) },
  ];

  return (
    <TutorShell
      title="Ratings & reviews"
      description="Feedback from the families you teach, exactly as they left it."
    >
      <div className="max-w-4xl space-y-5">
        {summary.isLoading ? (
          <Skeleton className="h-44 rounded-2xl shimmer" />
        ) : summary.isError ? (
          <LoadError
            message="We couldn't load your rating summary."
            onRetry={() => void summary.refetch()}
          />
        ) : (
          <SectionCard
            title="Your rating"
            description={
              count === 0
                ? "No ratings yet — they arrive after your first completed lessons."
                : `${count} ${count === 1 ? "review" : "reviews"} from families`
            }
          >
            <div className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <div className="rounded-2xl bg-primary-soft/60 p-4 text-center">
                <p className="text-4xl font-semibold tabular-nums text-primary-deep">
                  {Number(totals?.rating_avg ?? 0).toFixed(1)}
                </p>
                <div className="mt-2 flex justify-center">
                  <Stars score={Number(totals?.rating_avg ?? 0)} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Overall average</p>
              </div>

              <ul className="space-y-2">
                {buckets.map((bucket) => (
                  <li key={bucket.label} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-medium text-muted-foreground">
                      {bucket.label}★
                    </span>
                    <Progress
                      value={count === 0 ? 0 : (bucket.value / count) * 100}
                      className="h-2 flex-1"
                    />
                    <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                      {bucket.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionCard>
        )}

        <SectionCard
          title="By category"
          description="Categories are managed by DiaLearn, so families rate every tutor on the same things."
        >
          {categories.isLoading ? (
            <CardSkeletonList rows={3} height="h-12" />
          ) : (categories.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Category scores appear once families start rating your lessons.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {(categories.data ?? []).map((category) => (
                <li key={category.category_id} className="rounded-xl bg-surface/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{category.name}</p>
                    <span className="text-sm font-semibold tabular-nums">
                      {Number(category.average_score ?? 0).toFixed(1)}
                    </span>
                  </div>
                  <Progress
                    value={(Number(category.average_score ?? 0) / 5) * 100}
                    className="mt-2 h-1.5"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {Number(category.response_count ?? 0)}{" "}
                    {Number(category.response_count ?? 0) === 1 ? "response" : "responses"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {reviews.isLoading ? (
          <CardSkeletonList rows={3} height="h-24" />
        ) : reviews.isError ? (
          <LoadError
            message="We couldn't load your reviews."
            onRetry={() => void reviews.refetch()}
          />
        ) : (reviews.data ?? []).length === 0 ? (
          <EmptyPanel
            icon={MessageSquareQuote}
            title="No written reviews yet"
            body="Families are invited to review after a completed lesson. Their words will appear here and on your public profile."
          />
        ) : (
          <div className="space-y-3">
            {(reviews.data ?? []).map((review) => (
              <article key={review.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{review.reviewer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.subject_name ? `${review.subject_name} · ` : ""}
                      {formatRelative(review.created_at)}
                    </p>
                  </div>
                  <Stars score={Number(review.score)} />
                </div>
                {review.comment ? <p className="mt-3 text-sm">“{review.comment}”</p> : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </TutorShell>
  );
}

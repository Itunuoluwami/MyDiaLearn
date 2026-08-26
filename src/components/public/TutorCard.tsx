import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { countryLabel, formatMoney, type PublicTutor } from "@/lib/public-data";

function initials(name: string | null) {
  if (!name) return "DL";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TutorCard({
  tutor,
  countryLabels,
  className = "",
}: {
  tutor: PublicTutor;
  countryLabels: Record<string, string>;
  className?: string;
}) {
  const rating = Number(tutor.rating_avg ?? 0);

  return (
    <Link
      to="/tutors/$tutorId"
      params={{ tutorId: tutor.id }}
      className={`card-interactive focus-ring group relative flex flex-col overflow-hidden p-4 md:p-5 ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-secondary opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div className="flex min-w-0 items-start gap-3">
        <Avatar className="size-14 shrink-0 ring-2 ring-primary-soft ring-offset-2 ring-offset-card">
          {tutor.avatar_url ? <AvatarImage src={tutor.avatar_url} alt={tutor.full_name ?? "Tutor"} /> : null}
          <AvatarFallback className="bg-gradient-to-br from-primary-soft to-secondary-soft font-semibold text-primary-deep">
            {initials(tutor.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{tutor.full_name ?? "DiaLearn tutor"}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{countryLabel(tutor.country_code, countryLabels)}</span>
          </p>
          {rating > 0 ? (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium">
              <Star className="size-3.5 fill-secondary text-secondary" />
              {rating.toFixed(1)}
              <span className="text-muted-foreground">({tutor.rating_count})</span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">New to DiaLearn</p>
          )}
        </div>
      </div>

      {tutor.headline ? (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{tutor.headline}</p>
      ) : null}

      {tutor.subjects?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tutor.subjects.slice(0, 3).map((subject) => (
            <Badge key={subject} className="bg-primary-soft text-primary-deep">
              {subject}
            </Badge>
          ))}
          {tutor.subjects.length > 3 ? (
            <Badge className="bg-muted text-muted-foreground">+{tutor.subjects.length - 3}</Badge>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-sm font-semibold">
          {formatMoney(tutor.hourly_rate, tutor.currency)}
          <span className="text-xs font-normal text-muted-foreground"> / hour</span>
        </span>
        {tutor.years_experience ? (
          <span className="text-xs text-muted-foreground">{tutor.years_experience} yrs experience</span>
        ) : null}
      </div>
    </Link>
  );
}

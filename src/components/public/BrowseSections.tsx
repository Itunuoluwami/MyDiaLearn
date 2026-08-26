import { Link } from "@tanstack/react-router";
import {
  Atom,
  BookOpen,
  Code,
  FlaskConical,
  Globe2,
  GraduationCap,
  Infinity as InfinityIcon,
  Landmark,
  Languages,
  Leaf,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Sigma,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { TutorCard } from "@/components/public/TutorCard";
import {
  countryLabel,
  settingMap,
  usePublicSettings,
  useCountryFacets,
  useCurriculumFacets,
  useSubjectFacets,
  useTutorSearch,
} from "@/lib/public-data";

/** Icon names are stored on the admin-managed subjects table. */
const SUBJECT_ICONS: Record<string, LucideIcon> = {
  Sigma,
  BookOpen,
  Atom,
  FlaskConical,
  Leaf,
  Infinity: InfinityIcon,
  Languages,
  MessageCircle,
  MessagesSquare,
  Code,
  TrendingUp,
  Landmark,
  Globe2,
  GraduationCap,
};

/** Mobile: horizontally scrollable row. Larger screens: grid. */
function ScrollRow({ children, cols = 4 }: { children: React.ReactNode; cols?: 3 | 4 }) {
  return (
    <div
      className={`-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 ${
        cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"
      }`}
    >
      {children}
    </div>
  );
}

const TILE = "w-[16.5rem] shrink-0 snap-start sm:w-auto";

function TileSkeletons({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className={`${TILE} h-32 rounded-2xl`} />
      ))}
    </>
  );
}

function tutorCountLabel(count: number) {
  if (!count) return "Tutors joining soon";
  return `${count} ${count === 1 ? "tutor" : "tutors"}`;
}

export function SubjectGrid({ limit }: { limit?: number }) {
  const { data, isLoading } = useSubjectFacets();
  const subjects = limit ? (data ?? []).slice(0, limit) : (data ?? []);

  return (
    <ScrollRow>
      {isLoading ? <TileSkeletons /> : null}
      {subjects.map((subject) => {
        const Icon = SUBJECT_ICONS[subject.icon ?? ""] ?? BookOpen;
        return (
          <Link
            key={subject.id}
            to="/tutors"
            search={{ subject: subject.id }}
            className={`card-interactive focus-ring flex flex-col p-4 ${TILE}`}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft to-primary-soft/40 text-primary-deep shadow-soft">
              <Icon className="size-5" />
            </span>
            <span className="mt-3 text-base font-semibold">{subject.name}</span>
            {subject.category ? (
              <span className="mt-0.5 text-xs text-muted-foreground">{subject.category}</span>
            ) : null}
            <span className="mt-3 text-xs font-medium text-primary">
              {tutorCountLabel(Number(subject.tutor_count ?? 0))}
            </span>
          </Link>
        );
      })}
    </ScrollRow>
  );
}

export function CurriculumGrid({ limit }: { limit?: number }) {
  const { data, isLoading } = useCurriculumFacets();
  const curricula = limit ? (data ?? []).slice(0, limit) : (data ?? []);

  return (
    <ScrollRow cols={3}>
      {isLoading ? <TileSkeletons count={3} /> : null}
      {curricula.map((curriculum) => (
        <Link
          key={curriculum.id}
          to="/tutors"
          search={{ curriculum: curriculum.id }}
          className={`card-interactive focus-ring flex flex-col p-4 ${TILE}`}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-soft to-secondary-soft/40 text-secondary-foreground shadow-soft">
            <GraduationCap className="size-5" />
          </span>
          <span className="mt-3 text-base font-semibold">{curriculum.name}</span>
          {curriculum.description ? (
            <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {curriculum.description}
            </span>
          ) : null}
          <span className="mt-3 text-xs font-medium text-primary">
            {tutorCountLabel(Number(curriculum.tutor_count ?? 0))}
          </span>
        </Link>
      ))}
    </ScrollRow>
  );
}

export function LocationGrid() {
  const { data, isLoading } = useCountryFacets();
  const { data: settings } = usePublicSettings();
  const labels = settingMap(settings, "content.country_labels");
  const countries = data ?? [];

  if (!isLoading && countries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Tutor locations appear here as tutors complete verification.
      </p>
    );
  }

  return (
    <ScrollRow>
      {isLoading ? <TileSkeletons /> : null}
      {countries.map((country) => (
        <Link
          key={country.country_code}
          to="/tutors"
          search={{ country: country.country_code }}
          className={`card-interactive focus-ring flex items-center gap-3 p-4 ${TILE}`}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-soft to-accent-soft/40 text-accent shadow-soft">
            <MapPin className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold">
              Tutors in {countryLabel(country.country_code, labels)}
            </span>
            <span className="block text-xs font-medium text-primary">
              {tutorCountLabel(Number(country.tutor_count ?? 0))}
            </span>
          </span>
        </Link>
      ))}
    </ScrollRow>
  );
}

export function TutorStrip({ sort = "top_rated", limit = 8 }: { sort?: string; limit?: number }) {
  const { data, isLoading } = useTutorSearch({ sort, limit });
  const { data: settings } = usePublicSettings();
  const labels = settingMap(settings, "content.country_labels");
  const tutors = data ?? [];

  if (!isLoading && tutors.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Our first tutors are being verified"
        description="Every DiaLearn tutor completes identity, qualification and teaching checks before they are listed. Tutor profiles appear here as they clear verification."
      />
    );
  }

  return (
    <ScrollRow>
      {isLoading
        ? Array.from({ length: 4 }).map((_, index) => (
            <TutorCardSkeleton key={index} className={TILE} />
          ))
        : tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} countryLabels={labels} className={TILE} />
          ))}
    </ScrollRow>
  );

}

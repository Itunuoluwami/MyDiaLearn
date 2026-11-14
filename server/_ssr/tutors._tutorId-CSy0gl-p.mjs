import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { $ as MapPin, It as Clock, ln as BadgeCheck, s as UserSearch, y as Star } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { d as usePublicSettings, h as useTutorReviews, i as settingMap, m as useTutorDetail, n as formatMoney, t as countryLabel } from "./public-data-D6Ffdjlb.mjs";
import { t as EmptyState } from "./empty-state-DoZtLjGq.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-C7Z5PUu0.mjs";
import { t as Route } from "./tutors._tutorId-Nb72jl5m.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutors._tutorId-CSy0gl-p.js
var import_jsx_runtime = require_jsx_runtime();
function initials(name) {
	if (!name) return "DL";
	return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}
function stringList(value) {
	if (!Array.isArray(value)) return [];
	return value.map((item) => {
		if (typeof item === "string") return item;
		if (item && typeof item === "object") {
			const record = item;
			return [
				record["title"],
				record["name"],
				record["institution"],
				record["year"]
			].filter((part) => typeof part === "string" || typeof part === "number").join(" — ");
		}
		return "";
	}).filter(Boolean);
}
function TutorProfilePage() {
	const { tutorId } = Route.useParams();
	const { session } = useAuth();
	const { data: tutor, isLoading } = useTutorDetail(tutorId);
	const { data: reviews = [] } = useTutorReviews(tutorId);
	const { data: settings } = usePublicSettings();
	const labels = settingMap(settings, "content.country_labels");
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "band-hero border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "container-site py-8 md:py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-20 shrink-0 rounded-full md:size-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-2/3" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-24 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-20 rounded-full" })]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-44 rounded-2xl" })]
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-site grid gap-6 py-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_18rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-40" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-11/12" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-4/5" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-6 h-32 rounded-2xl" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-52 rounded-2xl" })]
	})] });
	if (!tutor) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container-site py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: UserSearch,
			title: "This tutor profile is not available",
			description: "The tutor may have paused their listing or is still completing verification.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "cta",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/tutors",
					children: "Browse other tutors"
				})
			})
		})
	}) });
	const rating = Number(tutor.rating_avg ?? 0);
	const qualifications = stringList(tutor.qualifications);
	const languages = stringList(tutor.languages);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "band-hero border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "container-site py-8 md:py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-start gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
							className: "size-20 shrink-0 md:size-24",
							children: [tutor.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
								src: tutor.avatar_url,
								alt: tutor.full_name ?? "Tutor"
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
								className: "bg-primary-soft text-lg text-primary-deep",
								children: initials(tutor.full_name)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "display-section text-3xl",
									children: tutor.full_name ?? "DiaLearn tutor"
								}),
								tutor.headline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: tutor.headline
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1 font-medium text-success",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-4" }), " Verified tutor"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1 text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4" }), countryLabel(tutor.country_code, labels)]
										}),
										tutor.timezone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1 text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4" }),
												" ",
												tutor.timezone
											]
										}) : null,
										rating > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1 font-medium",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 fill-secondary text-secondary" }),
												rating.toFixed(1),
												" (",
												tutor.rating_count,
												")"
											]
										}) : null
									]
								}),
								tutor.subjects?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-1.5",
									children: tutor.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "bg-primary-soft text-primary-deep",
										children: subject
									}, subject))
								}) : null
							]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "card-warm h-fit p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-2xl font-semibold",
							children: [formatMoney(tutor.hourly_rate, tutor.currency), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-normal text-muted-foreground",
								children: " / hour"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "Lesson price is calculated from this rate and the length you choose."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "cta",
							size: "lg",
							className: "mt-4 w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: session ? "/account" : "/auth",
								children: "Book a lesson"
							})
						}),
						!session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-center text-xs text-muted-foreground",
							children: "You'll be asked to sign in or create an account first."
						}) : null,
						tutor.agency_name ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 border-t border-border pt-3 text-xs text-muted-foreground",
							children: ["Represented by ", tutor.agency_name]
						}) : null
					]
				})]
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-site grid gap-6 py-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_18rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 space-y-6",
			children: [
				tutor.intro_video_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "card-warm overflow-hidden p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "aspect-video w-full bg-ink",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							src: tutor.intro_video_url,
							title: `${tutor.full_name ?? "Tutor"} introduction video`,
							allow: "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture",
							allowFullScreen: true,
							className: "size-full"
						})
					})
				}) : null,
				tutor.biography ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-warm p-5 md:p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-xl",
						children: ["About ", tutor.full_name?.split(" ")[0] ?? "this tutor"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 whitespace-pre-line text-sm text-muted-foreground",
						children: tutor.biography
					})]
				}) : null,
				qualifications.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-warm p-5 md:p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl",
						children: "Qualifications"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2",
						children: qualifications.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "mt-0.5 size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item })]
						}, item))
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-warm p-5 md:p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl",
						children: "Reviews"
					}), reviews.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: "No published reviews yet. Reviews appear once families have completed lessons."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-4",
						children: reviews.map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "border-b border-border pb-4 last:border-0 last:pb-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-sm font-semibold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 fill-secondary text-secondary" }), review.score]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: review.reviewer_name }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-normal text-muted-foreground",
										children: new Date(review.created_at).toLocaleDateString()
									})
								]
							}), review.comment ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: review.comment
							}) : null]
						}, review.id))
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: "At a glance"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 space-y-2 text-sm",
					children: [
						tutor.years_experience ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Experience"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "font-medium",
								children: [tutor.years_experience, " years"]
							})]
						}) : null,
						languages.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Languages"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-right font-medium",
								children: languages.join(", ")
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Based in"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium",
								children: countryLabel(tutor.country_code, labels)
							})]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				className: "w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/tutors",
					children: "Back to tutor search"
				})
			})]
		})]
	})] });
}
//#endregion
export { TutorProfilePage as component };

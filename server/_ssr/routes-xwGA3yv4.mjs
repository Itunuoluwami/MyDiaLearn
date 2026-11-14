import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { I as Quote, L as Presentation, S as Sparkles, T as ShieldCheck, _t as GraduationCap, a as Users, dn as ArrowRight, en as CalendarCheck, k as Search, qt as Check, r as Video, rn as Building2 } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { a as settingText, d as usePublicSettings, r as settingList } from "./public-data-D6Ffdjlb.mjs";
import { t as parent_child_default } from "./parent-child-lYSaC0xx.mjs";
import { t as ClassPreview } from "./ClassPreview-bcZfIroM.mjs";
import { t as SiteSearch } from "./TutorCard-B-Y7gjpy.mjs";
import { i as TutorStrip, r as SubjectGrid, t as CurriculumGrid } from "./BrowseSections-D9_jgfDq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-xwGA3yv4.js
var import_jsx_runtime = require_jsx_runtime();
var hero_student_default = "/assets/hero-student-CaCsoevd.jpg";
var tutor_teaching_default = "/assets/tutor-teaching-DvN5Oa3b.jpg";
/** Decorative persona icons, cycled in order — content itself stays DB-driven. */
var PERSONA_ICONS = [
	Users,
	GraduationCap,
	Presentation,
	Building2
];
var STEPS = [
	{
		icon: Search,
		title: "Search",
		body: "Filter by subject, curriculum, country and timezone to find tutors who fit your child."
	},
	{
		icon: CalendarCheck,
		title: "Book",
		body: "Pick a time in your own timezone. Pay securely — funds are only released after the lesson."
	},
	{
		icon: Video,
		title: "Learn",
		body: "Meet live one-to-one, review the recording, and follow progress from your parent portal."
	}
];
function SectionHeading({ eyebrow, title, copy, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 sm:flex sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				eyebrow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: eyebrow
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display-section mt-2",
					children: title
				}),
				copy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lead mt-2 max-w-2xl",
					children: copy
				}) : null
			]
		}), action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: action
		}) : null]
	});
}
function HomePage() {
	const { data: settings } = usePublicSettings();
	const personas = settingList(settings, "content.persona_options");
	const trustSignals = settingList(settings, "content.trust_signals");
	const testimonials = settingList(settings, "content.testimonials");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "band-hero relative overflow-hidden border-b border-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					className: "orb -top-24 -left-20 size-72 bg-primary/20 md:size-96"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					className: "orb top-40 -right-16 size-72 bg-secondary/25 md:size-96"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-site relative grid items-center gap-10 py-12 md:py-20 lg:grid-cols-[minmax(20rem,1fr)_minmax(20rem,1fr)] lg:gap-14",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "chip-float text-primary-deep",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), settingText(settings, "content.hero_eyebrow", "Diaspora families, African teachers")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "display-hero mt-5",
								children: settingText(settings, "content.hero_headline", "Learning that keeps your child close to home.")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lead mt-4 max-w-xl",
								children: settingText(settings, "content.hero_subcopy", "DiaLearn connects students and parents in the diaspora with vetted tutors across Africa.")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 max-w-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteSearch, { showTrending: false })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 flex flex-col gap-3 sm:flex-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "cta",
									size: "lg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/tutors",
										children: "Find a tutor"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									size: "lg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/become-a-tutor",
										children: "Become a tutor"
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground",
								children: [
									"Identity & qualification checks",
									"Pay per lesson, no packages",
									"Every lesson recorded"
								].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 shrink-0 text-success" }), item]
								}, item))
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative w-full min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "media-frame aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: hero_student_default,
									alt: "A student in the diaspora taking a live one-to-one lesson with her tutor",
									width: 1280,
									height: 1440
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									className: "media-overlay opacity-60"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-elevated absolute -bottom-5 left-4 flex items-center gap-3 p-3 pr-4 md:left-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-11 items-center justify-center rounded-xl bg-success-soft text-success",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-semibold",
										children: "Live one-to-one lesson"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: "Recorded for parents to review"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-elevated absolute -top-4 right-2 hidden items-center gap-3 p-3 pr-4 md:flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-11 items-center justify-center rounded-xl bg-secondary-soft text-secondary-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-semibold",
										children: "Curriculum-matched"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: "British, IB, WAEC & more"
									})]
								})]
							})
						]
					})]
				})
			]
		}),
		(() => {
			const CHIP_STYLES = [
				"bg-cat-lavender text-cat-lavender-ink",
				"bg-cat-mint text-cat-mint-ink",
				"bg-cat-rose text-cat-rose-ink",
				"bg-cat-peach text-cat-peach-ink",
				"bg-cat-sky text-cat-sky-ink",
				"bg-cat-cream text-cat-cream-ink"
			];
			const trending = settingList(settings, "content.trending_searches");
			const visible = trending.slice(0, 10);
			return visible.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-b border-border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "container-site py-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [visible.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tutors",
							search: { q: item },
							className: `rounded-full px-4 py-2 text-sm font-medium shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift ${CHIP_STYLES[index % CHIP_STYLES.length]}`,
							children: item
						}, item)), trending.length > visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "subtle",
							size: "sm",
							className: "rounded-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/explore",
								children: ["Explore more", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						}) : null]
					})
				})
			}) : null;
		})(),
		personas.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-site section-y",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
				eyebrow: "Start here",
				title: "What brings you to DiaLearn today?",
				copy: "Pick the path that fits you — each one leads to the right part of DiaLearn."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: personas.map((persona, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: persona.href,
					className: "card-interactive focus-ring group relative flex flex-col overflow-hidden p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: `absolute inset-x-0 top-0 h-1 ${index % 2 === 0 ? "bg-gradient-to-r from-primary to-primary/40" : "bg-gradient-to-r from-secondary to-secondary/40"}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `flex size-11 items-center justify-center rounded-xl ${index % 2 === 0 ? "bg-primary-soft text-primary-deep" : "bg-secondary-soft text-secondary-foreground"}`,
							children: (() => {
								const Icon = PERSONA_ICONS[index % PERSONA_ICONS.length] ?? GraduationCap;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" });
							})()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 text-lg",
							children: persona.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 flex-1 text-sm text-muted-foreground",
							children: persona.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-4 flex items-center gap-1 text-sm font-semibold text-primary",
							children: [persona.cta, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 transition-transform group-hover:translate-x-1" })]
						})
					]
				}, persona.key))
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "band-tint border-y border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "container-site section-y",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid items-start gap-10 lg:grid-cols-[minmax(20rem,1fr)_minmax(20rem,1fr)] lg:gap-14",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "How it works"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "display-section mt-2",
								children: "Search, book, learn."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lead mt-3 max-w-md",
								children: "Three simple steps take your child from first search to a live lesson with a tutor who knows their curriculum."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "group relative mt-8 overflow-hidden rounded-2xl shadow-lift",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										className: "absolute inset-0 bg-gradient-to-br from-primary via-primary/85 to-primary-deep"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: tutor_teaching_default,
										alt: "An African tutor teaching a live online lesson from her home study",
										width: 1280,
										height: 960,
										loading: "lazy",
										className: "absolute inset-0 size-full object-cover opacity-35 mix-blend-luminosity transition-transform duration-500 group-hover:scale-105"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative flex min-h-56 flex-col items-start justify-end gap-4 p-6 md:p-8",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-xl leading-snug text-primary-foreground md:text-2xl",
											children: "Quality one-to-one lessons, for every diaspora family."
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											variant: "cta",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/how-it-works",
												children: ["See the full walkthrough", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
											})
										})]
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "grid content-center gap-8 lg:py-6",
						children: STEPS.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep shadow-soft",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(step.icon, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "text-lg font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-2 text-sm font-semibold text-muted-foreground",
										children: String(index + 1).padStart(2, "0")
									}), step.title]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-sm leading-relaxed text-muted-foreground",
									children: step.body
								})]
							})]
						}, step.title))
					})]
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-site section-y",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
				eyebrow: "Explore",
				title: "Browse by subject",
				copy: "Every subject is managed by the DiaLearn team, so what you see is what our tutors actually teach.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/explore",
						children: "Explore everything"
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectGrid, { limit: 8 })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site section-y",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
					eyebrow: "Explore",
					title: "Browse by curriculum",
					copy: "British, American, IB, Cambridge or national — match the exam your child will actually sit."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurriculumGrid, { limit: 6 })
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-site section-y",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPreview, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/class-preview",
						children: "More about DiaLearn lessons"
					})
				})
			})]
		}),
		trustSignals.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site section-y",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
					eyebrow: "Trust & safety",
					title: "Careful by design",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/trust-and-safety",
							children: "How we vet tutors"
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 grid gap-4 md:grid-cols-3",
					children: trustSignals.map((signal) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-warm hover-lift relative overflow-hidden p-5 pt-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								className: "orb -top-16 -right-10 size-32 bg-primary/15"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "relative flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary-deep",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "relative mt-4 text-lg",
								children: signal.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "relative mt-2 text-sm text-muted-foreground",
								children: signal.body
							})
						]
					}, signal.title))
				})]
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-site section-y",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
				eyebrow: "Featured tutors",
				title: "Meet a few of our tutors",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/tutors",
						children: "Browse all tutors"
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorStrip, { limit: 8 })
			})]
		}),
		testimonials.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "band-deep relative overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				className: "orb -top-24 left-1/4 size-80 bg-secondary/20"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site section-y relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow text-secondary",
						children: "From DiaLearn families"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display-section mt-3 max-w-2xl",
						children: "Parents hear the difference before the results arrive."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid gap-4 md:grid-cols-3",
						children: testimonials.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
							className: "rounded-2xl border border-ink-foreground/15 bg-ink-foreground/[0.07] p-5 backdrop-blur transition-colors hover:bg-ink-foreground/[0.11]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, { className: "size-5 text-secondary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
									className: "mt-3 text-sm text-ink-foreground/90",
									children: item.quote
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
									className: "mt-4 text-sm font-semibold",
									children: [item.name, item.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs font-normal text-ink-foreground/65",
										children: item.detail
									}) : null]
								})
							]
						}, item.name))
					})
				]
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "container-site section-y",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-elevated grid gap-0 overflow-hidden md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-start justify-center gap-4 p-6 md:p-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section",
							children: "Ready to find the right tutor?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lead max-w-xl",
							children: "Start with a single lesson. No packages, no pressure."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full flex-col gap-3 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "cta",
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/tutors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}), " Find a tutor"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: "Create an account"
								})
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative min-h-56 md:min-h-72",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: parent_child_default,
						alt: "A parent and child reviewing homework together after a DiaLearn lesson",
						width: 1280,
						height: 960,
						loading: "lazy",
						className: "absolute inset-0 size-full object-cover"
					})
				})]
			})
		})
	] });
}
//#endregion
export { HomePage as component };

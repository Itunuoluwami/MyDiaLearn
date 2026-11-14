import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { i as authClient, r as apiRequest } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { E as ShieldAlert, R as Plus, _ as Trash2, it as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as apiPost, i as apiPatch, n as apiDelete, r as apiGet } from "./data-client-kVSxwzg_.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { t as Switch } from "./switch-CaFjL5yK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.settings-CcQREHUl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** PUT with the session token; data-client has no apiPut. */
async function apiPut(path, body) {
	const { data } = await authClient.getSession();
	const accessToken = data.session?.access_token;
	return apiRequest(path, {
		method: "PUT",
		body,
		...accessToken ? { accessToken } : {}
	});
}
function slugify(value) {
	return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function Panel({ title, description, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel-portal mt-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children
			})
		]
	});
}
function SubjectsTab() {
	const queryClient = useQueryClient();
	const [name, setName] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("");
	const subjects = useQuery({
		queryKey: ["admin-subjects"],
		queryFn: async () => {
			return apiGet("/admin/settings/subjects");
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			await apiPost("/admin/settings/subjects", {
				name,
				slug: slugify(name),
				...category ? { category } : {},
				sortOrder: (subjects.data?.length ?? 0) + 1
			});
		},
		onSuccess: async () => {
			setName("");
			setCategory("");
			await queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
			toast.success("Subject added");
		},
		onError: (error) => toast.error(error.message)
	});
	const toggle = useMutation({
		mutationFn: async ({ id, is_active }) => {
			await apiPatch(`/admin/settings/subjects/${id}`, { isActive: is_active });
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-subjects"] }),
		onError: (error) => toast.error(error.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			await apiDelete(`/admin/settings/subjects/${id}`);
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-subjects"] }),
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Subjects",
		description: "The subject list powering search, filters and tutor profiles.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-3 sm:grid-cols-[1fr_1fr_auto]",
			onSubmit: (event) => {
				event.preventDefault();
				create.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "subject-name",
						children: "Subject name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "subject-name",
						required: true,
						value: name,
						onChange: (e) => setName(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "subject-category",
						children: "Category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "subject-category",
						value: category,
						onChange: (e) => setCategory(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						className: "w-full sm:w-auto",
						disabled: create.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add"]
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-5 divide-y divide-border",
			children: (subjects.data ?? []).map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex min-h-14 flex-wrap items-center justify-between gap-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: subject.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: subject.category ?? "Uncategorised"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: subject.is_active,
						"aria-label": "Active",
						onCheckedChange: (checked) => toggle.mutate({
							id: subject.id,
							is_active: checked
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Delete",
						onClick: () => remove.mutate(subject.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
					})]
				})]
			}, subject.id))
		})]
	});
}
function CurriculaTab() {
	const queryClient = useQueryClient();
	const [name, setName] = (0, import_react.useState)("");
	const [country, setCountry] = (0, import_react.useState)("");
	const curricula = useQuery({
		queryKey: ["admin-curricula"],
		queryFn: async () => {
			return apiGet("/admin/settings/curricula");
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			await apiPost("/admin/settings/curricula", {
				name,
				code: slugify(name),
				...country ? { countryCode: country } : {},
				sortOrder: (curricula.data?.length ?? 0) + 1
			});
		},
		onSuccess: async () => {
			setName("");
			setCountry("");
			await queryClient.invalidateQueries({ queryKey: ["admin-curricula"] });
			toast.success("Curriculum added");
		},
		onError: (error) => toast.error(error.message)
	});
	const toggle = useMutation({
		mutationFn: async ({ id, is_active }) => {
			await apiPatch(`/admin/settings/curricula/${id}`, { isActive: is_active });
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-curricula"] }),
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Curricula & levels",
		description: "Curricula and the education levels students are placed in.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-3 sm:grid-cols-[1fr_10rem_auto]",
			onSubmit: (event) => {
				event.preventDefault();
				create.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "curriculum-name",
						children: "Curriculum name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "curriculum-name",
						required: true,
						value: name,
						onChange: (e) => setName(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "curriculum-country",
						children: "Country code"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "curriculum-country",
						maxLength: 2,
						value: country,
						onChange: (e) => setCountry(e.target.value.toUpperCase())
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						className: "w-full sm:w-auto",
						disabled: create.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add"]
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-5 space-y-3",
			children: (curricula.data ?? []).map((curriculum) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-md border border-border p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: curriculum.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							curriculum.country_code ?? "International",
							" ·",
							" ",
							curriculum.education_levels.length,
							" levels"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: curriculum.is_active,
						"aria-label": "Active",
						onCheckedChange: (checked) => toggle.mutate({
							id: curriculum.id,
							is_active: checked
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-1",
					children: curriculum.education_levels.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: level.name
					}, level.id))
				})]
			}, curriculum.id))
		})]
	});
}
function TierEditor({ tiers, onChange }) {
	function update(index, patch) {
		onChange(tiers.map((tier, i) => i === index ? {
			...tier,
			...patch
		} : tier));
	}
	function remove(index) {
		onChange(tiers.filter((_, i) => i !== index));
	}
	function add() {
		const last = tiers[tiers.length - 1];
		onChange([...tiers, {
			min: last ? (last.max ?? last.min) + 1 : 0,
			max: null,
			percentage: 0
		}]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2 sm:col-span-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Volume tiers" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Commission % by completed lessons per tutor in the trailing 30 days. Leave \"up to\" empty for the top tier."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: tiers.map((tier, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "From"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: tier.min,
								onChange: (e) => update(index, { min: Number(e.target.value) })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Up to"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								placeholder: "No limit",
								value: tier.max ?? "",
								onChange: (e) => update(index, { max: e.target.value ? Number(e.target.value) : null })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Commission %"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								step: "0.001",
								value: tier.percentage,
								onChange: (e) => update(index, { percentage: Number(e.target.value) })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							"aria-label": "Remove tier",
							onClick: () => remove(index),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
						})
					]
				}, index))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				onClick: add,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add tier"]
			})
		]
	});
}
function CommissionTab() {
	const queryClient = useQueryClient();
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		model: "percentage",
		percentage: "15",
		fixed_amount: "",
		platform_fee_percentage: "2.5",
		applies_to: "tutor",
		tutor_id: "",
		agency_id: ""
	});
	const [tiers, setTiers] = (0, import_react.useState)([{
		min: 0,
		max: 10,
		percentage: 20
	}, {
		min: 11,
		max: null,
		percentage: 15
	}]);
	const rules = useQuery({
		queryKey: ["admin-commission"],
		queryFn: async () => {
			const rows = await apiGet("/admin/settings/commission-rules");
			const num = (v) => v === null || v === void 0 ? null : Number(v);
			return rows.map((r) => ({
				...r,
				percentage: num(r["percentage"]),
				fixed_amount: num(r["fixed_amount"]),
				platform_fee_percentage: num(r["platform_fee_percentage"]),
				priority: num(r["priority"])
			}));
		}
	});
	const tutorOptions = useQuery({
		queryKey: ["admin-commission-tutors"],
		queryFn: async () => {
			return (await apiGet("/admin/settings/commission-targets")).tutors.map((t) => ({
				id: t.id,
				profiles: { full_name: t.full_name }
			}));
		}
	});
	const agencyOptions = useQuery({
		queryKey: ["admin-commission-agencies"],
		queryFn: async () => {
			return (await apiGet("/admin/settings/commission-targets")).agencies;
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			await apiPost("/admin/settings/commission-rules", {
				name: form.name,
				model: form.model,
				...form.percentage ? { percentage: Number(form.percentage) } : {},
				...form.fixed_amount ? { fixedAmount: Number(form.fixed_amount) } : {},
				platformFeePercentage: Number(form.platform_fee_percentage || 0),
				appliesTo: form.applies_to,
				...form.tutor_id ? { tutorId: form.tutor_id } : {},
				...form.agency_id ? { agencyId: form.agency_id } : {},
				tiers: form.model === "tiered" ? tiers : [],
				priority: (rules.data?.length ?? 0) + 1
			});
		},
		onSuccess: async () => {
			setForm({
				...form,
				name: "",
				tutor_id: "",
				agency_id: ""
			});
			await queryClient.invalidateQueries({ queryKey: ["admin-commission"] });
			toast.success("Commission rule added");
		},
		onError: (error) => toast.error(error.message)
	});
	const toggle = useMutation({
		mutationFn: async ({ id, is_active }) => {
			await apiPatch(`/admin/settings/commission-rules/${id}`, { isActive: is_active });
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-commission"] }),
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Commission & fees",
		description: "Percentage, fixed or tiered commission plus the platform fee. Lesson prices are always derived from rate × duration.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-3 sm:grid-cols-2",
			onSubmit: (event) => {
				event.preventDefault();
				create.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 sm:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "rule-name",
						children: "Rule name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "rule-name",
						required: true,
						value: form.name,
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Model" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.model,
						onValueChange: (value) => setForm({
							...form,
							model: value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "percentage",
								children: "Percentage"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "fixed",
								children: "Fixed amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "tiered",
								children: "Tiered by volume"
							})
						] })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Applies to" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.applies_to,
						onValueChange: (value) => setForm({
							...form,
							applies_to: value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "tutor",
							children: "Independent tutors"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "agency",
							children: "Agency tutors"
						})] })]
					})]
				}),
				form.model === "percentage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "rule-percentage",
						children: "Commission %"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "rule-percentage",
						type: "number",
						step: "0.001",
						value: form.percentage,
						onChange: (e) => setForm({
							...form,
							percentage: e.target.value
						})
					})]
				}) : null,
				form.model === "fixed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "rule-fixed",
						children: "Fixed amount"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "rule-fixed",
						type: "number",
						step: "0.01",
						value: form.fixed_amount,
						onChange: (e) => setForm({
							...form,
							fixed_amount: e.target.value
						})
					})]
				}) : null,
				form.model === "tiered" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TierEditor, {
					tiers,
					onChange: setTiers
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "rule-fee",
						children: "Platform fee %"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "rule-fee",
						type: "number",
						step: "0.001",
						value: form.platform_fee_percentage,
						onChange: (e) => setForm({
							...form,
							platform_fee_percentage: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 sm:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assign to a specific tutor or agency (optional)" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Leave both on \"Any\" to apply this rule to every tutor matching the category above. A tutor-specific assignment always wins over an agency or category-wide rule."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.tutor_id || "any",
								onValueChange: (value) => setForm({
									...form,
									tutor_id: value === "any" ? "" : value
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any tutor" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "any",
									children: "Any tutor"
								}), (tutorOptions.data ?? []).map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: tutor.id,
									children: tutor.profiles?.full_name ?? "Unnamed tutor"
								}, tutor.id))] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.agency_id || "any",
								onValueChange: (value) => setForm({
									...form,
									agency_id: value === "any" ? "" : value
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any agency" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "any",
									children: "Any agency"
								}), (agencyOptions.data ?? []).map((agency) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: agency.id,
									children: agency.name
								}, agency.id))] })]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-end sm:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: create.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add rule"]
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-5 divide-y divide-border",
			children: (rules.data ?? []).map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex min-h-14 flex-wrap items-center justify-between gap-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: rule.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						rule.model === "percentage" ? `${rule.percentage ?? 0}% commission` : rule.model === "fixed" ? `${rule.fixed_amount ?? 0} fixed` : "Tiered by volume",
						" ",
						"· ",
						rule.platform_fee_percentage,
						"% platform fee · ",
						rule.applies_to,
						rule.tutor_id ? " · specific tutor" : rule.agency_id ? " · specific agency" : ""
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: rule.is_active,
					"aria-label": "Active",
					onCheckedChange: (checked) => toggle.mutate({
						id: rule.id,
						is_active: checked
					})
				})]
			}, rule.id))
		})]
	});
}
function PricingTab() {
	const queryClient = useQueryClient();
	const [drafts, setDrafts] = (0, import_react.useState)(null);
	const settings = useQuery({
		queryKey: ["admin-pricing-settings"],
		queryFn: async () => {
			const data = await apiGet("/admin/settings/platform?scope=payments");
			const byKey = Object.fromEntries(data.map((row) => [row.key, row.value]));
			return {
				processing_fee_percentage: String(byKey["payments.processing_fee_percentage"] ?? 0),
				processing_fee_fixed: String(byKey["payments.processing_fee_fixed"] ?? 0)
			};
		}
	});
	const save = useMutation({
		mutationFn: async (values) => {
			await apiPut("/admin/settings/platform", { settings: [{
				key: "payments.processing_fee_percentage",
				value: Number(values.processing_fee_percentage || 0),
				label: "Payment processing fee (%)",
				description: "Percentage of the lesson amount charged as a payment processing fee at checkout.",
				groupName: "payments"
			}, {
				key: "payments.processing_fee_fixed",
				value: Number(values.processing_fee_fixed || 0),
				label: "Payment processing fee (fixed)",
				description: "Flat payment processing fee added at checkout, in the tutor's listing currency.",
				groupName: "payments"
			}] });
		},
		onSuccess: async () => {
			setDrafts(null);
			await queryClient.invalidateQueries({ queryKey: ["admin-pricing-settings"] });
			toast.success("Pricing updated");
		},
		onError: (error) => toast.error(error.message)
	});
	const values = drafts ?? settings.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Pricing & fees",
		description: "The payment processing fee applied at checkout, on top of the lesson price and commission. Per-tutor/agency commission and platform fee live in the Commission tab.",
		children: settings.isLoading || !values ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-3 sm:grid-cols-2",
			onSubmit: (event) => {
				event.preventDefault();
				save.mutate(values);
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "processing-fee-pct",
						children: "Processing fee %"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "processing-fee-pct",
						type: "number",
						step: "0.001",
						value: values.processing_fee_percentage,
						onChange: (e) => setDrafts({
							...values,
							processing_fee_percentage: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "processing-fee-fixed",
						children: "Processing fee (fixed)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "processing-fee-fixed",
						type: "number",
						step: "0.01",
						value: values.processing_fee_fixed,
						onChange: (e) => setDrafts({
							...values,
							processing_fee_fixed: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-end sm:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: save.isPending,
						children: [save.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Save pricing"]
					})
				})
			]
		})
	});
}
function GeneralSettingsPanel() {
	const queryClient = useQueryClient();
	const [drafts, setDrafts] = (0, import_react.useState)({});
	const [newRow, setNewRow] = (0, import_react.useState)({
		key: "",
		label: "",
		description: "",
		group_name: "general",
		value: ""
	});
	const settings = useQuery({
		queryKey: ["admin-general-settings"],
		queryFn: async () => {
			return apiGet("/admin/settings/platform?scope=general");
		}
	});
	const save = useMutation({
		mutationFn: async ({ key, value }) => {
			await apiPatch(`/admin/settings/platform/${encodeURIComponent(key)}`, { value: JSON.parse(value) });
		},
		onSuccess: async (_data, { key }) => {
			setDrafts((prev) => {
				const next = { ...prev };
				delete next[key];
				return next;
			});
			await queryClient.invalidateQueries({ queryKey: ["admin-general-settings"] });
			toast.success("Setting saved");
		},
		onError: (error) => toast.error(error.message.includes("JSON") ? "Value must be valid JSON, e.g. \"text\", 10, or true" : error.message)
	});
	const create = useMutation({
		mutationFn: async () => {
			await apiPost("/admin/settings/platform", {
				key: newRow.key,
				label: newRow.label || newRow.key,
				...newRow.description ? { description: newRow.description } : {},
				groupName: newRow.group_name || "general",
				value: JSON.parse(newRow.value || "null")
			});
		},
		onSuccess: async () => {
			setNewRow({
				key: "",
				label: "",
				description: "",
				group_name: "general",
				value: ""
			});
			await queryClient.invalidateQueries({ queryKey: ["admin-general-settings"] });
			toast.success("Setting added");
		},
		onError: (error) => toast.error(error.message.includes("JSON") ? "Value must be valid JSON, e.g. \"text\", 10, or true" : error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "General & group class settings",
		description: "Every other platform_settings key/value — brand copy, booking rules, and group-class configuration (add booking.group_classes_enabled, booking.group_class_max_participants, etc. here). Values are raw JSON — wrap text in quotes.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-3",
			children: (settings.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-md border border-border p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: row.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							row.key,
							" · ",
							row.group_name,
							row.description ? ` — ${row.description}` : ""
						]
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "max-w-xs font-mono text-xs",
						value: drafts[row.key] ?? JSON.stringify(row.value),
						onChange: (e) => setDrafts({
							...drafts,
							[row.key]: e.target.value
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						disabled: save.isPending || (drafts[row.key] ?? JSON.stringify(row.value)) === JSON.stringify(row.value),
						onClick: () => save.mutate({
							key: row.key,
							value: drafts[row.key] ?? JSON.stringify(row.value)
						}),
						children: [save.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Save"]
					})]
				})]
			}, row.key))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-2",
			onSubmit: (event) => {
				event.preventDefault();
				create.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "setting-key",
						children: "Key"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "setting-key",
						required: true,
						placeholder: "booking.group_classes_enabled",
						value: newRow.key,
						onChange: (e) => setNewRow({
							...newRow,
							key: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "setting-label",
						children: "Label"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "setting-label",
						value: newRow.label,
						onChange: (e) => setNewRow({
							...newRow,
							label: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "setting-group",
						children: "Group"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "setting-group",
						value: newRow.group_name,
						onChange: (e) => setNewRow({
							...newRow,
							group_name: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "setting-value",
						children: "Value (JSON)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "setting-value",
						required: true,
						placeholder: "true",
						className: "font-mono",
						value: newRow.value,
						onChange: (e) => setNewRow({
							...newRow,
							value: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 sm:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "setting-description",
						children: "Description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "setting-description",
						value: newRow.description,
						onChange: (e) => setNewRow({
							...newRow,
							description: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-end sm:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: create.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add setting"]
					})
				})
			]
		})]
	});
}
function SystemTab() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeneralSettingsPanel, {}) });
}
var CHANNEL_OPTIONS = [
	"in_app",
	"email",
	"sms",
	"push"
];
var AUDIENCE_OPTIONS = [
	"student",
	"parent",
	"tutor",
	"agency",
	"admin"
];
function TemplateEditor({ template, onCancel, onSave, saving }) {
	const [draft, setDraft] = (0, import_react.useState)({
		trigger_key: template.trigger_key,
		channel: template.channel,
		audience: template.audience ?? "",
		subject: template.subject ?? "",
		body: template.body
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Trigger key" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.trigger_key,
							onChange: (e) => setDraft({
								...draft,
								trigger_key: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Channel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: draft.channel,
							onValueChange: (value) => setDraft({
								...draft,
								channel: value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CHANNEL_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: option,
								children: option
							}, option)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Audience" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: draft.audience || "all",
							onValueChange: (value) => setDraft({
								...draft,
								audience: value === "all" ? "" : value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All account types"
							}), AUDIENCE_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: option,
								children: option
							}, option))] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Subject (email only)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.subject,
							onChange: (e) => setDraft({
								...draft,
								subject: e.target.value
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Body" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 3,
					value: draft.body,
					onChange: (e) => setDraft({
						...draft,
						body: e.target.value
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: onCancel,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					disabled: saving,
					onClick: () => onSave(draft),
					children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Save"]
				})]
			})
		]
	});
}
function NewTemplateForm({ onCreated }) {
	const queryClient = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)({
		trigger_key: "",
		channel: "in_app",
		audience: "",
		subject: "",
		body: ""
	});
	const create = useMutation({
		mutationFn: async () => {
			await apiPost("/admin/settings/templates", {
				triggerKey: draft.trigger_key,
				channel: draft.channel,
				...draft.audience ? { audience: draft.audience } : {},
				...draft.subject ? { subject: draft.subject } : {},
				body: draft.body
			});
		},
		onSuccess: async () => {
			setDraft({
				trigger_key: "",
				channel: "in_app",
				audience: "",
				subject: "",
				body: ""
			});
			setOpen(false);
			await queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
			toast.success("Template created");
			onCreated();
		},
		onError: (error) => toast.error(error.message)
	});
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "outline",
		onClick: () => setOpen(true),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "New template"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-dashed border-border p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm font-medium",
			children: "New template"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TemplateEditor, {
			template: {
				id: "new",
				trigger_key: draft.trigger_key,
				channel: draft.channel,
				audience: draft.audience || null,
				subject: draft.subject,
				body: draft.body,
				description: null,
				is_active: true
			},
			saving: create.isPending,
			onCancel: () => setOpen(false),
			onSave: (next) => {
				setDraft(next);
				create.mutate();
			}
		})]
	});
}
function TemplatesTab() {
	const queryClient = useQueryClient();
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const templates = useQuery({
		queryKey: ["admin-templates"],
		queryFn: async () => {
			return apiGet("/admin/settings/templates");
		}
	});
	const save = useMutation({
		mutationFn: async ({ id, draft }) => {
			await apiPatch(`/admin/settings/templates/${id}`, {
				triggerKey: draft.trigger_key,
				channel: draft.channel,
				audience: draft.audience || null,
				subject: draft.subject || null,
				body: draft.body
			});
		},
		onSuccess: async () => {
			setEditingId(null);
			await queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
			toast.success("Template saved");
		},
		onError: (error) => toast.error(error.message)
	});
	const toggle = useMutation({
		mutationFn: async ({ id, is_active }) => {
			await apiPatch(`/admin/settings/templates/${id}`, { isActive: is_active });
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-templates"] }),
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Notification templates",
		description: "Every trigger, channel, audience and message body lives here. Use {{variables}} for personalised values.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewTemplateForm, { onCreated: () => void templates.refetch() })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-4",
			children: (templates.data ?? []).map((template) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "rounded-md border border-border p-3",
				children: editingId === template.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TemplateEditor, {
					template,
					saving: save.isPending,
					onCancel: () => setEditingId(null),
					onSave: (draft) => save.mutate({
						id: template.id,
						draft
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: template.trigger_key
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								template.channel,
								" · ",
								template.audience ?? "all account types"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: template.is_active,
								"aria-label": "Active",
								onCheckedChange: (checked) => toggle.mutate({
									id: template.id,
									is_active: checked
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setEditingId(template.id),
								children: "Edit"
							})]
						})]
					}),
					template.subject ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: ["Subject: ", template.subject]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 whitespace-pre-wrap text-sm text-muted-foreground",
						children: template.body
					})
				] })
			}, template.id))
		})]
	});
}
function AdminSettingsPage() {
	const { hasPermission, loading } = useAuth();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Platform settings",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.settings")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Platform settings",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your account type doesn't include platform settings permissions."
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Platform settings",
		description: "Subjects, curricula, commission rules, pricing and notification templates — all stored in the database and read live by every other portal.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "subjects",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "flex h-auto w-full flex-wrap justify-start gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "subjects",
							className: "min-h-11",
							children: "Subjects"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "curricula",
							className: "min-h-11",
							children: "Curricula"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "commission",
							className: "min-h-11",
							children: "Commission"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "pricing",
							className: "min-h-11",
							children: "Pricing & fees"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "templates",
							className: "min-h-11",
							children: "Notifications"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "system",
							className: "min-h-11",
							children: "System"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "subjects",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectsTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "curricula",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurriculaTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "commission",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommissionTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "pricing",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PricingTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "templates",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TemplatesTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "system",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemTab, {})
				})
			]
		})
	});
}
//#endregion
export { AdminSettingsPage as component };

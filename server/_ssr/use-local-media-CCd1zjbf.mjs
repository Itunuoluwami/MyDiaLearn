import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { Dt as Eraser, Et as ExternalLink, G as MonitorUp, K as Mic, N as RotateCcw, U as Pencil, V as PhoneOff, _ as Trash2, gt as Hand, i as VideoOff, q as MicOff, r as Video, zt as Circle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-local-media-CCd1zjbf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* The video area of a classroom.
*
* Three states, in the order they become true as the platform grows:
*
*  1. **A provider room exists** (`meetingUrl`) — it is embedded here, and the
*     controls below belong to it.
*  2. **No provider, camera on** — the person's own camera fills the stage, so
*     they can frame themselves and check lighting before teaching. This is
*     real today: capturing local media is a browser capability, not a
*     third-party one.
*  3. **No provider, camera off** — a plain standby panel that says what it is
*     waiting for, rather than pretending to be a call.
*
* The reason for the embed rather than our own peer connection is that
* carrying tracks between continents is the part worth buying: a provider
* brings the routing, the reconnection and the bandwidth adaptation that the
* PRD's "low-bandwidth environments, video reconnection" requirements need.
*/
function ClassStage({ meetingUrl, live, elapsed, media, selfLabel }) {
	const selfView = (0, import_react.useRef)(null);
	const shareView = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (selfView.current) selfView.current.srcObject = media.stream;
	}, [media.stream]);
	(0, import_react.useEffect)(() => {
		if (shareView.current) shareView.current.srcObject = media.screenStream;
	}, [media.screenStream]);
	const showSelfFull = !meetingUrl && media.cameraOn && media.stream;
	const showShare = Boolean(media.screenStream);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden rounded-2xl border border-border bg-ink shadow-soft",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-video w-full",
			children: [
				meetingUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
					src: meetingUrl,
					title: "Live classroom",
					allow: "camera; microphone; display-capture; autoplay; clipboard-write",
					className: "absolute inset-0 size-full border-0"
				}) : showShare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: shareView,
					autoPlay: true,
					playsInline: true,
					muted: true,
					className: "absolute inset-0 size-full bg-ink object-contain"
				}) : showSelfFull ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: selfView,
					autoPlay: true,
					playsInline: true,
					muted: true,
					className: "absolute inset-0 size-full scale-x-[-1] bg-ink object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(30,95,116,0.55),transparent_60%),radial-gradient(circle_at_75%_80%,rgba(242,166,90,0.35),transparent_55%)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-6 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mx-auto flex size-14 items-center justify-center rounded-2xl bg-card/15 text-card",
								children: media.permission === "denied" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOff, {
									className: "size-7",
									"aria-hidden": "true"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, {
									className: "size-7",
									"aria-hidden": "true"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm font-semibold text-card",
								children: live ? "Class in progress" : "Ready when you are"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-1 max-w-sm text-xs text-card/70",
								children: media.error ?? "Turn your camera on to check how you look. Live video between you and the other side is not connected yet."
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute left-3 top-3 flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", live ? "bg-destructive text-destructive-foreground" : "bg-card/20 text-card"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
								className: cn("size-2 fill-current", live && "animate-pulse"),
								"aria-hidden": "true"
							}), live ? "Live" : "Standby"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-card/20 px-2.5 py-1 text-xs font-semibold tabular-nums text-card",
							children: elapsed
						}),
						showShare ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 rounded-full bg-card/20 px-2.5 py-1 text-xs font-semibold text-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorUp, {
								className: "size-3.5",
								"aria-hidden": "true"
							}), " Sharing"]
						}) : null
					]
				}),
				(meetingUrl || showShare) && media.cameraOn && media.stream ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-3 right-3 hidden w-40 overflow-hidden rounded-xl border border-card/20 bg-ink sm:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: selfView,
						autoPlay: true,
						playsInline: true,
						muted: true,
						className: "aspect-video w-full scale-x-[-1] object-cover"
					})
				}) : !meetingUrl && !showShare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-3 right-3 hidden w-40 overflow-hidden rounded-xl border border-card/20 bg-card/10 sm:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid aspect-video place-items-center text-xs font-medium text-card/70",
						children: selfLabel
					})
				}) : null,
				meetingUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-3 left-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						size: "sm",
						className: "min-h-9",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: meetingUrl,
							target: "_blank",
							rel: "noopener noreferrer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" }), " Open in a new tab"]
						})
					})
				}) : null
			]
		})
	});
}
/**
* Mic, camera, screen share, hand and leave.
*
* Every one of these drives something real. The mic and camera buttons open
* and mute actual devices, and screen share opens the browser's own picker —
* none of that needs a provider. "Raise hand" is local state the person beside
* them can see on a shared screen until the far end exists to send it to.
*/
function DeviceControls({ media, handRaised, onToggleHand, onLeave, leaveLabel = "Leave", children }) {
	const disabled = media.permission === "unavailable";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-2 border-t border-card/10 bg-ink p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: cn("min-h-11 min-w-11 text-card hover:bg-card/15 hover:text-card", media.micOn && "bg-card/15"),
					"aria-label": media.micOn ? "Mute microphone" : "Unmute microphone",
					"aria-pressed": media.micOn,
					disabled,
					onClick: () => void media.toggleMic(),
					children: media.micOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: cn("min-h-11 min-w-11 text-card hover:bg-card/15 hover:text-card", media.cameraOn && "bg-card/15"),
					"aria-label": media.cameraOn ? "Turn camera off" : "Turn camera on",
					"aria-pressed": media.cameraOn,
					disabled,
					onClick: () => void media.toggleCamera(),
					children: media.cameraOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOff, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: cn("min-h-11 min-w-11 text-card hover:bg-card/15 hover:text-card", media.sharing && "bg-card/15"),
					"aria-label": media.sharing ? "Stop sharing your screen" : "Share your screen",
					"aria-pressed": media.sharing,
					disabled,
					onClick: () => void media.toggleShare(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorUp, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: cn("min-h-11 min-w-11 text-card hover:bg-card/15 hover:text-card", handRaised && "bg-warning/25"),
					"aria-label": handRaised ? "Lower your hand" : "Raise your hand",
					"aria-pressed": handRaised,
					onClick: onToggleHand,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hand, { className: "size-5" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "destructive",
				size: "sm",
				className: "min-h-11 sm:min-h-10",
				onClick: onLeave,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneOff, { className: "size-4" }),
					" ",
					leaveLabel
				]
			})]
		})]
	});
}
var PENS = [
	{
		label: "Ink",
		value: "#15313a"
	},
	{
		label: "Teal",
		value: "#1e5f74"
	},
	{
		label: "Orange",
		value: "#f2a65a"
	},
	{
		label: "Red",
		value: "#c2452d"
	}
];
function Whiteboard({ className }) {
	const canvasRef = (0, import_react.useRef)(null);
	const strokes = (0, import_react.useRef)([]);
	const drawing = (0, import_react.useRef)(null);
	const [color, setColor] = (0, import_react.useState)(PENS[0].value);
	const [erasing, setErasing] = (0, import_react.useState)(false);
	const [empty, setEmpty] = (0, import_react.useState)(true);
	/**
	* Repaints every stroke.
	*
	* Strokes are kept and replayed rather than painted once, because a canvas
	* loses its bitmap when it is resized — a tutor rotating a tablet or opening
	* a panel would otherwise wipe the board mid-explanation.
	*/
	const repaint = (0, import_react.useCallback)(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (!canvas || !context) return;
		const ratio = window.devicePixelRatio || 1;
		const { width, height } = canvas.getBoundingClientRect();
		if (canvas.width !== Math.round(width * ratio)) {
			canvas.width = Math.round(width * ratio);
			canvas.height = Math.round(height * ratio);
		}
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		context.clearRect(0, 0, width, height);
		context.lineCap = "round";
		context.lineJoin = "round";
		for (const stroke of strokes.current) {
			if (stroke.points.length === 0) continue;
			context.beginPath();
			context.strokeStyle = stroke.erase ? "#ffffff" : stroke.color;
			context.lineWidth = stroke.erase ? stroke.width * 6 : stroke.width;
			const [first, ...rest] = stroke.points;
			context.moveTo(first.x, first.y);
			for (const point of rest) context.lineTo(point.x, point.y);
			context.stroke();
		}
	}, []);
	(0, import_react.useEffect)(() => {
		repaint();
		const observer = new ResizeObserver(() => repaint());
		if (canvasRef.current) observer.observe(canvasRef.current);
		return () => observer.disconnect();
	}, [repaint]);
	function pointOf(event) {
		const rect = event.currentTarget.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}
	function start(event) {
		event.currentTarget.setPointerCapture(event.pointerId);
		drawing.current = {
			points: [pointOf(event)],
			color,
			width: 2.5,
			erase: erasing
		};
		strokes.current = [...strokes.current, drawing.current];
		setEmpty(false);
	}
	function extend(event) {
		if (!drawing.current) return;
		drawing.current.points.push(pointOf(event));
		repaint();
	}
	function finish() {
		drawing.current = null;
	}
	function undo() {
		strokes.current = strokes.current.slice(0, -1);
		setEmpty(strokes.current.length === 0);
		repaint();
	}
	function clear() {
		strokes.current = [];
		setEmpty(true);
		repaint();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("card-elevated p-4", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1.5",
						children: PENS.map((pen) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `${pen.label} pen`,
							"aria-pressed": !erasing && color === pen.value,
							onClick: () => {
								setColor(pen.value);
								setErasing(false);
							},
							className: cn("focus-ring size-8 rounded-full border-2 transition-transform", !erasing && color === pen.value ? "scale-110 border-foreground" : "border-transparent"),
							style: { backgroundColor: pen.value }
						}, pen.value))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-1 h-6 w-px bg-border",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: erasing ? "secondary" : "ghost",
						size: "sm",
						className: "min-h-11 sm:min-h-9",
						"aria-pressed": erasing,
						onClick: () => setErasing((value) => !value),
						children: [erasing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eraser, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), erasing ? "Eraser" : "Pen"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							className: "min-h-11 sm:min-h-9",
							disabled: empty,
							onClick: undo,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), " Undo"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							className: "min-h-11 sm:min-h-9",
							disabled: empty,
							onClick: clear,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Clear"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				onPointerDown: start,
				onPointerMove: extend,
				onPointerUp: finish,
				onPointerCancel: finish,
				className: "aspect-[4/3] w-full touch-none rounded-xl border border-border bg-white"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: "Visible on your own screen. Sharing the board with the other side arrives with live video — share your screen to show it in the meantime."
			})
		]
	});
}
function supported() {
	return typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function";
}
/** A refusal the person can act on, rather than the browser's own wording. */
function describe(error) {
	const name = error instanceof DOMException ? error.name : "";
	if (name === "NotAllowedError") return "Your browser blocked access. Allow the camera and microphone for this site, then try again.";
	if (name === "NotFoundError") return "No camera or microphone was found on this device.";
	if (name === "NotReadableError") return "Another app is using your camera or microphone. Close it and try again.";
	return "We couldn't start your camera or microphone.";
}
function useLocalMedia() {
	const [stream, setStream] = (0, import_react.useState)(null);
	const [screenStream, setScreenStream] = (0, import_react.useState)(null);
	const [micOn, setMicOn] = (0, import_react.useState)(false);
	const [cameraOn, setCameraOn] = (0, import_react.useState)(false);
	const [permission, setPermission] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)(null);
	const streamRef = (0, import_react.useRef)(null);
	const screenRef = (0, import_react.useRef)(null);
	streamRef.current = stream;
	screenRef.current = screenStream;
	const stopAll = (0, import_react.useCallback)(() => {
		streamRef.current?.getTracks().forEach((track) => track.stop());
		screenRef.current?.getTracks().forEach((track) => track.stop());
		streamRef.current = null;
		screenRef.current = null;
		setStream(null);
		setScreenStream(null);
		setMicOn(false);
		setCameraOn(false);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!supported()) setPermission("unavailable");
		return () => {
			streamRef.current?.getTracks().forEach((track) => track.stop());
			screenRef.current?.getTracks().forEach((track) => track.stop());
		};
	}, []);
	/**
	* Opens one stream for both devices and enables tracks as asked.
	*
	* Asking for audio and video separately means two permission prompts and two
	* device activations; one stream with tracks toggled is what a video app
	* does, and is why muting is instant rather than a fresh prompt.
	*/
	const ensure = (0, import_react.useCallback)(async (want) => {
		if (!supported()) {
			setPermission("unavailable");
			setError("This browser cannot open a camera or microphone.");
			return null;
		}
		if (streamRef.current) return streamRef.current;
		try {
			const next = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: {
					width: { ideal: 1280 },
					height: { ideal: 720 }
				}
			});
			next.getAudioTracks().forEach((t) => t.enabled = want.audio);
			next.getVideoTracks().forEach((t) => t.enabled = want.video);
			streamRef.current = next;
			setStream(next);
			setPermission("granted");
			setError(null);
			return next;
		} catch (cause) {
			setPermission("denied");
			setError(describe(cause));
			return null;
		}
	}, []);
	const toggleMic = (0, import_react.useCallback)(async () => {
		const next = !micOn;
		const live = await ensure({
			audio: next,
			video: cameraOn
		});
		if (!live) return;
		live.getAudioTracks().forEach((track) => track.enabled = next);
		setMicOn(next);
	}, [
		micOn,
		cameraOn,
		ensure
	]);
	const toggleCamera = (0, import_react.useCallback)(async () => {
		const next = !cameraOn;
		const live = await ensure({
			audio: micOn,
			video: next
		});
		if (!live) return;
		live.getVideoTracks().forEach((track) => track.enabled = next);
		setCameraOn(next);
	}, [
		cameraOn,
		micOn,
		ensure
	]);
	const toggleShare = (0, import_react.useCallback)(async () => {
		if (screenRef.current) {
			screenRef.current.getTracks().forEach((track) => track.stop());
			screenRef.current = null;
			setScreenStream(null);
			return;
		}
		if (typeof navigator.mediaDevices?.getDisplayMedia !== "function") {
			setError("This browser cannot share a screen.");
			return;
		}
		try {
			const next = await navigator.mediaDevices.getDisplayMedia({ video: true });
			next.getVideoTracks()[0]?.addEventListener("ended", () => {
				screenRef.current = null;
				setScreenStream(null);
			});
			screenRef.current = next;
			setScreenStream(next);
			setError(null);
		} catch (cause) {
			if (cause instanceof DOMException && cause.name === "NotAllowedError") return;
			setError(describe(cause));
		}
	}, []);
	return {
		stream,
		screenStream,
		micOn,
		cameraOn,
		sharing: screenStream !== null,
		permission,
		error,
		toggleMic,
		toggleCamera,
		toggleShare,
		stopAll
	};
}
//#endregion
export { useLocalMedia as i, DeviceControls as n, Whiteboard as r, ClassStage as t };

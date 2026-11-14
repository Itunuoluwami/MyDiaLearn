//#region node_modules/.nitro/vite/services/ssr/assets/csv-DYK3q72x.js
/** Minimal client-side CSV export — no backend export job, just turns rows
* already in memory (from the same hooks the on-screen tables use) into a
* downloaded file. Good enough for admin ops; not a streaming/bulk exporter. */
function escapeCsvCell(value) {
	if (value === null || value === void 0) return "";
	const str = typeof value === "string" ? value : JSON.stringify(value);
	if (/[",\n]/.test(str)) return `"${str.replace(/"/g, "\"\"")}"`;
	return str;
}
function toCsv(rows, columns) {
	return `${columns.map((c) => escapeCsvCell(c.label)).join(",")}\n${rows.map((row) => columns.map((c) => escapeCsvCell(row[c.key])).join(",")).join("\n")}`;
}
function downloadCsv(filename, csv) {
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
//#endregion
export { toCsv as n, downloadCsv as t };

const fs = require("fs");
const jsdocapi = require("jsdoc-api");
const markdownTable = require("markdown-table");

function newLine() {
	return "\n";
}

function h1(text) {
	return "# " + text + newLine().repeat(2);
}

function h2(text) {
	return "## " + text + newLine().repeat(2);
}

function h3(text) {
	return `### ${text}` + newLine().repeat(2);
}

function h4(text) {
	return `#### ${text}` + newLine().repeat(2);
}

function ul(text, level = 1) {
	return "  ".repeat(level - 1) + "- " + text + newLine();
}

function p(text) {
	return text + newLine().repeat(2);
}

function bold(text) {
	return `**${text}**`;
}

function link(text, link) {
	return `[${text}](${link})`;
}

function code(code, language = "") {
	return "```" + language + newLine() + code + newLine() + "```" + newLine();
}

function table(rows, alignement = {}) {
	return markdownTable(rows, alignement) + newLine().repeat(2);
}

const blocks = jsdocapi.explainSync({
	files: ["lib/main.js"]
});

let markdown = "";
let summary = h2("Summary");

summary += ul(link("Constructor", "#OpenedClosed"));

for (const block of blocks) {
	if (!("description" in block && block.description)) {
		continue;
	}

	if ("kind" in block && block.kind === "member") {
		summary += ul(link(block.name, `#${block.longname}`));
	}

	if ("longname" in block) {
		markdown += h3(block.longname);
	} else {
		markdown += h3("unnamed");
	}

	markdown += p(block.description);
	markdown += h4("Available since version");

	if ("since" in block) {
		markdown += p(block.since);
	} else {
		markdown += p("No data.");
	}

	markdown += h4("Parameters");

	if ("params" in block) {
		let rows = [["Variable", "Description", "Type"]];

		for (const param of block.params) {
			let cells = [];

			cells.push(param.name);
			cells.push(param.description);
			cells.push(param.type.names.join(" | "));

			rows.push(cells);
		}

		markdown += table(rows);
	} else {
		markdown += p("None.");
	}

	if ("returns" in block) {
		markdown += h4("Returns");

		const returnTypes = block.returns
			.map(function(item) {
				return item.type.names.join(" | ");
			})
			.join(" | ");

		markdown += p(returnTypes);
	}

	if ("examples" in block) {
		markdown += h4("Examples");

		for (const example of block.examples) {
			markdown += code(example, "javascript");
		}
	} else {
		markdown += p("None.");
	}

	markdown += link("back to menu", "#summary") + newLine();
}

markdown =
	h1("API") +
	p("Technical documentation for end developpers.") +
	summary +
	markdown;

fs.writeFileSync("api.md", markdown);

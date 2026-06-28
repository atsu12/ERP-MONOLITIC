function escapeCSV(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return `"${String(value).replace(/"/g, '""')}"`;
}

function exportCSV({
  columns = [],
  rows = [],
}) {
  const header = columns
    .map(escapeCSV)
    .join(",");

  const body = rows
    .map((row) =>
      columns
        .map((column) =>
          escapeCSV(row[column]),
        )
        .join(","),
    )
    .join("\n");

  return `${header}\n${body}`;
}

module.exports = {
  exportCSV,
};
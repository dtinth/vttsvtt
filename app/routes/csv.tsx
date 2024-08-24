import * as csv from "csv/sync";
import React, { useState } from "react";
import * as subtitle from "subtitle";

export default function Index() {
  const [vttContent, setVttContent] = useState("");
  const [csvContent, setCsvContent] = useState("");

  const handleVttChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVtt = e.target.value;
    setVttContent(newVtt);
    try {
      const newTsv = vttToCsv(newVtt);
      setCsvContent(newTsv);
    } catch (error) {
      console.error("Error converting VTT to TSV:", error);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-md-6 mb-3">
          <h3>VTT</h3>
          <textarea
            className="form-control"
            rows={16}
            value={vttContent}
            onChange={handleVttChange}
            placeholder="Paste VTT content here..."
          />
        </div>
        <div className="col-md-6 mb-3">
          <h3>CSV</h3>
          <textarea
            className="form-control"
            rows={16}
            value={csvContent}
            readOnly
            placeholder="CSV output will appear here..."
          />
        </div>
      </div>
    </div>
  );
}

function vttToCsv(vtt: string): string {
  const parsed = subtitle.parseSync(vtt);
  const cues = parsed.filter((x) => x.type === "cue").map((x) => x.data);
  const lines: string[][] = [];
  for (const cue of cues) {
    const start = cue.start / 1000;
    const text = cue.text;
    lines.push([formatCsvTime(start), text]);
  }
  return csv.stringify(lines);
}

function formatCsvTime(t: number) {
  const h = Math.floor(t / 3600).toString();
  const m = Math.floor((t % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`.replace(/^0:/, "");
}

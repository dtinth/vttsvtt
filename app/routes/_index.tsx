import * as csv from "csv/sync";
import React, { useState } from "react";
import * as subtitle from "subtitle";

export default function Index() {
  const [vttContent, setVttContent] = useState("");
  const [tsvContent, setTsvContent] = useState("");

  const handleVttChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVtt = e.target.value;
    setVttContent(newVtt);
    try {
      const newTsv = vttToTsv(newVtt);
      setTsvContent(newTsv);
    } catch (error) {
      console.error("Error converting VTT to TSV:", error);
    }
  };

  const handleTsvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTsv = e.target.value;
    setTsvContent(newTsv);
    try {
      const newVtt = tsvToVtt(newTsv);
      setVttContent(newVtt);
    } catch (error) {
      console.error("Error converting TSV to VTT:", error);
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
          <h3>TSV</h3>
          <textarea
            className="form-control"
            rows={16}
            value={tsvContent}
            onChange={handleTsvChange}
            placeholder="Paste TSV content here..."
          />
        </div>
      </div>
    </div>
  );
}

function vttToTsv(vtt: string): string {
  const parsed = subtitle.parseSync(vtt);
  const cues = parsed.filter((x) => x.type === "cue").map((x) => x.data);
  const lines: string[][] = [];
  let lastEnd: number | undefined;
  for (const cue of cues) {
    const start = cue.start / 1000;
    const end = cue.end / 1000;
    const text = cue.text;
    if (lastEnd && start - lastEnd > 0.5) {
      lines.push([lastEnd.toFixed(1), ""]);
    }
    lines.push([start.toFixed(1), text]);
    lastEnd = end;
  }
  if (lastEnd) {
    lines.push([lastEnd.toFixed(1), ""]);
  }
  return csv.stringify(lines, {
    delimiter: "\t",
  });
}

interface SubtitleEvent {
  time: number;
  text: string;
  duration: number;
}

function tsvToVtt(tsv: string): string {
  const rows = csv.parse(tsv, {
    delimiter: "\t",
    relaxQuotes: true,
  }) as string[][];
  const events: SubtitleEvent[] = [];
  let gap = 0;
  for (const row of rows) {
    const [key, value] = row;
    if (key === "gap") {
      gap = +value;
      continue;
    }
    if (!key || !String(key).match(/^[\d.]+$/)) continue;
    const time = +key;
    const text = String(value).trim() || "";
    events.push({ time, text, duration: 0 });
  }
  events.sort((a, b) => a.time - b.time);
  for (let i = 1; i < events.length; i++) {
    events[i - 1].duration = Math.max(
      0,
      events[i].time - events[i - 1].time - gap
    );
  }
  if (events.length > 0) {
    events[events.length - 1].duration = 1;
  }

  const lines: string[] = [];
  lines.push("WEBVTT");
  for (const event of events) {
    if (!event.text || !event.duration) continue;
    const text = event.text.replace(/`([^`]+)`/g, "<i>$1</i>");
    lines.push("");
    lines.push(
      [
        formatTime(event.time),
        "-->",
        formatTime(event.time + event.duration),
      ].join(" ")
    );
    lines.push(text);
  }
  lines.push("");
  return lines.join("\n");
}

function formatTime(t: number) {
  const h = Math.floor(t / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((t % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  const ms = Math.floor((t * 1000) % 1000)
    .toString()
    .padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

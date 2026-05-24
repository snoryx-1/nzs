export class NZSError extends Error {
  public line: number;
  public column: number;
  public source: string;
  public file: string;

  constructor(message: string, line: number, column: number = 0, source: string = "", file: string = "") {
    super(message);
    this.line = line;
    this.column = column;
    this.source = source;
    this.file = file;
    this.name = "NZSError";
  }
}

export class NZSWarning {
  public message: string;
  public line: number;
  public file: string;

  constructor(message: string, line: number = 0, file: string = "") {
    this.message = message;
    this.line = line;
    this.file = file;
  }
}

export function formatError(err: NZSError | Error, source?: string, file?: string): string {
  const now = new Date().toLocaleTimeString("en-US", { hour12: false });
  const lines = (source || "").split("\n");

  if (err instanceof NZSError && err.line > 0) {
    const lineNum = err.line;
    const prevLine  = lines[lineNum - 2];
    const currLine  = lines[lineNum - 1] || "";
    const nextLine  = lines[lineNum];
    const pad = String(lineNum + 1).length; // widest line number width

    const fmt = (n: number, content: string) =>
      `  ${String(n).padStart(pad)} | ${content}`;

    const pointerCol = err instanceof NZSError && err.column > 0 ? err.column - 1 : 0;
    const pointerLen = Math.max(currLine.trim().length, 1);
    const pointer = `  ${" ".repeat(pad + 3)}${" ".repeat(pointerCol)}${"^".repeat(pointerLen)}`;

    let out = `\n[NZS | ${now} | ERROR] ${err.message}`;
    if (file || err.file) out += `\n  → ${file || err.file}:${lineNum}`;
    out += `\n`;
    if (prevLine !== undefined) out += `\n${fmt(lineNum - 1, prevLine)}`;
    out += `\n${fmt(lineNum, currLine)}`;
    out += `\n${pointer}`;
    if (nextLine !== undefined) out += `\n${fmt(lineNum + 1, nextLine)}`;
    out += `\n`;
    return out;
  }

  return `\n[NZS | ${now} | ERROR] ${err.message}\n`;
}

export function formatWarning(message: string, line?: number, file?: string): string {
  const now = new Date().toLocaleTimeString("en-US", { hour12: false });
  let out = `[NZS | ${now} | WARN] ${message}`;
  if (file && line) out += ` (${file}:${line})`;
  return out;
}

export function formatInfo(message: string): string {
  const now = new Date().toLocaleTimeString("en-US", { hour12: false });
  return `[NZS | ${now} | INFO] ${message}`;
}

export function formatSuccess(message: string): string {
  const now = new Date().toLocaleTimeString("en-US", { hour12: false });
  return `[NZS | ${now} | OK] ${message}`;
}

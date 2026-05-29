export enum TokenType {
  // Literals
  STRING = "STRING", NUMBER = "NUMBER", BOOLEAN = "BOOLEAN", NULL = "NULL",
  // Identifiers & keywords
  IDENTIFIER = "IDENTIFIER",
  // Structure
  NODE = "NODE", PRIVATE = "PRIVATE", OPEN = "OPEN", EXTENDS = "EXTENDS",
  ROOT = "ROOT", IMPORT = "IMPORT",
  // Functions & methods
  DEF = "DEF", RETURN = "RETURN",
  // Commands & events
  CMD = "CMD", SLASH = "SLASH", SLASH_CMD = "SLASH_CMD", ON = "ON",
  // Control flow
  IF = "IF", ELSE = "ELSE", FOR = "FOR", WHILE = "WHILE",
  BREAK = "BREAK", CONTINUE = "CONTINUE",
  IN = "IN", FROM = "FROM", TO = "TO",
  // Logic
  IS = "IS", AND = "AND", OR = "OR",
  // Variables
  LET = "LET", VAR = "VAR",
  TYPE_INT = "TYPE_INT", TYPE_STR = "TYPE_STR", TYPE_BOOL = "TYPE_BOOL", TYPE_FLOAT = "TYPE_FLOAT",
  // Error handling
  TRY = "TRY", ATTEMPT = "ATTEMPT", CATCH = "CATCH", FAIL = "FAIL",
  // Discord UI
  FIELD = "FIELD", DM = "DM", WITH = "WITH", BUTTON = "BUTTON",
  ROLE = "ROLE", MODAL = "MODAL", SELECT = "SELECT", REACT = "REACT",
  OPTION = "OPTION", EPHEMERAL = "EPHEMERAL",
  // Modifiers
  USE = "USE", ACCESS = "ACCESS", DECORATOR = "DECORATOR", MODE = "MODE",
  // Animation
  ANIMATION = "ANIMATION", SPRITE = "SPRITE", KEYFRAME = "KEYFRAME",
  CANVAS = "CANVAS", FPS = "FPS", LOOP = "LOOP", PLAY = "PLAY",
  FILL = "FILL", ROW = "ROW", COL = "COL", STAYS = "STAYS", CLEAR = "CLEAR",
  CANVAS_SIZE = "CANVAS_SIZE",
  // v0.2.0 new keywords
  EVERY = "EVERY",        // scheduled tasks: every 1h { }
  EMIT = "EMIT",          // emit event
  TYPE = "TYPE",          // type declarations
  EXTENDS_KW = "EXTENDS_KW",
  MATCH = "MATCH",        // pattern matching
  WHEN = "WHEN",          // match when
  // Operators & punctuation
  LBRACE = "LBRACE", RBRACE = "RBRACE", LPAREN = "LPAREN", RPAREN = "RPAREN",
  LBRACKET = "LBRACKET", RBRACKET = "RBRACKET",
  COMMA = "COMMA", DOT = "DOT", COLON = "COLON", SEMICOLON = "SEMICOLON",
  EQUALS = "EQUALS", PLUS_EQUALS = "PLUS_EQUALS", MINUS_EQUALS = "MINUS_EQUALS",
  STAR_EQUALS = "STAR_EQUALS", SLASH_EQUALS = "SLASH_EQUALS",
  PLUS = "PLUS", MINUS = "MINUS", STAR = "STAR", SLASH_OP = "SLASH_OP",
  BANG = "BANG", QUESTION = "QUESTION", DOUBLE_QUESTION = "DOUBLE_QUESTION",
  ARROW = "ARROW", PERCENT = "PERCENT",
  EQUALS_EQUALS = "EQUALS_EQUALS", NOT_EQUALS = "NOT_EQUALS",
  GREATER = "GREATER", LESS = "LESS",
  GREATER_EQUALS = "GREATER_EQUALS", LESS_EQUALS = "LESS_EQUALS",
  PIPE = "PIPE", AMPERSAND = "AMPERSAND",
  EOF = "EOF", NEWLINE = "NEWLINE",
}

export interface Token { type: TokenType; value: string; line: number; col: number; }

const KEYWORDS: Record<string, TokenType> = {
  node: TokenType.NODE, private: TokenType.PRIVATE, open: TokenType.OPEN,
  extends: TokenType.EXTENDS, def: TokenType.DEF, return: TokenType.RETURN,
  if: TokenType.IF, else: TokenType.ELSE, use: TokenType.USE, cmd: TokenType.CMD,
  slash: TokenType.SLASH, on: TokenType.ON, root: TokenType.ROOT, let: TokenType.LET,
  try: TokenType.TRY, attempt: TokenType.ATTEMPT, catch: TokenType.CATCH, fail: TokenType.FAIL,
  field: TokenType.FIELD, dm: TokenType.DM, with: TokenType.WITH, button: TokenType.BUTTON,
  role: TokenType.ROLE, import: TokenType.IMPORT, modal: TokenType.MODAL,
  select: TokenType.SELECT, react: TokenType.REACT, option: TokenType.OPTION,
  for: TokenType.FOR, while: TokenType.WHILE, break: TokenType.BREAK, continue: TokenType.CONTINUE,
  in: TokenType.IN, from: TokenType.FROM, to: TokenType.TO,
  is: TokenType.IS, and: TokenType.AND, or: TokenType.OR,
  ephemeral: TokenType.EPHEMERAL,
  var: TokenType.VAR,
  int: TokenType.TYPE_INT, str: TokenType.TYPE_STR,
  bool: TokenType.TYPE_BOOL, float: TokenType.TYPE_FLOAT,
  animation: TokenType.ANIMATION, sprite: TokenType.SPRITE, keyframe: TokenType.KEYFRAME,
  canvas: TokenType.CANVAS, fps: TokenType.FPS, loop: TokenType.LOOP, play: TokenType.PLAY,
  fill: TokenType.FILL, row: TokenType.ROW, col: TokenType.COL,
  stays: TokenType.STAYS, clear: TokenType.CLEAR,
  every: TokenType.EVERY, emit: TokenType.EMIT,
  match: TokenType.MATCH, when: TokenType.WHEN,
  true: TokenType.BOOLEAN, false: TokenType.BOOLEAN, null: TokenType.NULL,
};

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;
  private lineStart = 0;

  constructor(source: string) { this.source = source; }

  tokenize(): Token[] {
    while (!this.isAtEnd()) { this.start = this.current; this.scanToken(); }
    this.tokens.push({ type: TokenType.EOF, value: "", line: this.line, col: this.current - this.lineStart });
    return this.tokens;
  }

  private col(): number { return this.start - this.lineStart + 1; }

  private scanToken(): void {
    const c = this.advance();
    switch (c) {
      case "{": this.addToken(TokenType.LBRACE); break;
      case "}": this.addToken(TokenType.RBRACE); break;
      case "(": this.addToken(TokenType.LPAREN); break;
      case ")": this.addToken(TokenType.RPAREN); break;
      case "[": this.addToken(TokenType.LBRACKET); break;
      case "]": this.addToken(TokenType.RBRACKET); break;
      case ",": this.addToken(TokenType.COMMA); break;
      case ".": this.addToken(TokenType.DOT); break;
      case ":": this.addToken(TokenType.COLON); break;
      case ";": this.addToken(TokenType.SEMICOLON); break;
      case "%": this.addToken(TokenType.PERCENT); break;
      case "|": this.addToken(TokenType.PIPE); break;
      case "&": this.addToken(TokenType.AMPERSAND); break;
      case "+": this.addToken(this.match("=") ? TokenType.PLUS_EQUALS : TokenType.PLUS); break;
      case "-": this.addToken(this.match("=") ? TokenType.MINUS_EQUALS : (this.match(">") ? TokenType.ARROW : TokenType.MINUS)); break;
      case "*": this.addToken(this.match("=") ? TokenType.STAR_EQUALS : TokenType.STAR); break;
      case "!": this.addToken(this.match("=") ? TokenType.NOT_EQUALS : TokenType.BANG); break;
      case "=": this.addToken(this.match("=") ? TokenType.EQUALS_EQUALS : TokenType.EQUALS); break;
      case ">": this.addToken(this.match("=") ? TokenType.GREATER_EQUALS : TokenType.GREATER); break;
      case "<": this.addToken(this.match("=") ? TokenType.LESS_EQUALS : TokenType.LESS); break;
      case "?": this.addToken(this.match("?") ? TokenType.DOUBLE_QUESTION : TokenType.QUESTION); break;
      case "x":
        if (this.tokens.length > 0 && this.tokens[this.tokens.length - 1].type === TokenType.NUMBER) {
          let num = "";
          while (this.isDigit(this.peek())) { num += this.peek(); this.advance(); }
          if (num.length > 0) {
            const prev = this.tokens.pop()!;
            this.addToken(TokenType.CANVAS_SIZE, `${prev.value}x${num}`);
            break;
          }
        }
        while (this.isAlphaNumeric(this.peek())) this.advance();
        this.addToken(KEYWORDS[this.source.substring(this.start, this.current)] ?? TokenType.IDENTIFIER);
        break;
      case "/":
        if (this.match("/")) { while (this.peek() !== "\n" && !this.isAtEnd()) this.advance(); }
        else if (this.match("*")) { this.blockComment(); }
        else { this.addToken(this.match("=") ? TokenType.SLASH_EQUALS : TokenType.SLASH_OP); }
        break;
      case "@": this.atSign(); break;
      case '"': this.string('"'); break;
      case "'": this.string("'"); break;
      case "`": this.templateString(); break;
      case "\n": this.line++; this.lineStart = this.current; break;
      case " ": case "\r": case "\t": break;
      default:
        if (this.isDigit(c)) this.number();
        else if (this.isAlpha(c)) this.identifier();
        else throw new Error(`Unexpected character '${c}' at line ${this.line}`);
    }
  }

  private string(quote: string): void {
    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      if (this.peek() === "\\" && this.peekNext() === quote) this.advance();
      this.advance();
    }
    if (this.isAtEnd()) throw new Error(`Unterminated string at line ${this.line}`);
    this.advance();
    this.addToken(TokenType.STRING, this.source.substring(this.start + 1, this.current - 1));
  }

  private templateString(): void {
    while (this.peek() !== "`" && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }
    if (this.isAtEnd()) throw new Error(`Unterminated template string at line ${this.line}`);
    this.advance();
    this.addToken(TokenType.STRING, this.source.substring(this.start + 1, this.current - 1));
  }

  private number(): void {
    while (this.isDigit(this.peek())) this.advance();
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }
    this.addToken(TokenType.NUMBER);
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();
    const text = this.source.substring(this.start, this.current);
    this.addToken(KEYWORDS[text] ?? TokenType.IDENTIFIER);
  }

  private atSign(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();
    const value = this.source.substring(this.start, this.current);
    if (value === "@beginner" || value === "@normal") this.addToken(TokenType.MODE, value);
    else if (value === "@slash") this.addToken(TokenType.DECORATOR, value);
    else this.addToken(TokenType.ACCESS, value);
  }

  private blockComment(): void {
    let depth = 1;
    while (depth > 0 && !this.isAtEnd()) {
      if (this.peek() === "/" && this.peekNext() === "*") { depth++; this.advance(); this.advance(); }
      else if (this.peek() === "*" && this.peekNext() === "/") { depth--; this.advance(); this.advance(); }
      else { if (this.peek() === "\n") this.line++; this.advance(); }
    }
  }

  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source[this.current] !== expected) return false;
    this.current++; return true;
  }
  private peek(): string { return this.isAtEnd() ? "\0" : this.source[this.current]; }
  private peekNext(): string { return this.current + 1 >= this.source.length ? "\0" : this.source[this.current + 1]; }
  private advance(): string { return this.source[this.current++]; }
  private addToken(type: TokenType, value?: string): void {
    this.tokens.push({ type, value: value ?? this.source.substring(this.start, this.current), line: this.line, col: this.col() });
  }
  private isAtEnd(): boolean { return this.current >= this.source.length; }
  private isDigit(c: string): boolean { return c >= "0" && c <= "9"; }
  private isAlpha(c: string): boolean { return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_"; }
  private isAlphaNumeric(c: string): boolean { return this.isAlpha(c) || this.isDigit(c); }
}

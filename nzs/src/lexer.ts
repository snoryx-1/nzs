export enum TokenType {
  STRING = "STRING", NUMBER = "NUMBER", BOOLEAN = "BOOLEAN", NULL = "NULL",
  IDENTIFIER = "IDENTIFIER", NODE = "NODE", PRIVATE = "PRIVATE", OPEN = "OPEN",
  EXTENDS = "EXTENDS", DEF = "DEF", RETURN = "RETURN", IF = "IF", ELSE = "ELSE",
  USE = "USE", CMD = "CMD", SLASH_CMD = "SLASH_CMD", ON = "ON", ROOT = "ROOT",
  LET = "LET", TRY = "TRY", ATTEMPT = "ATTEMPT", CATCH = "CATCH", FAIL = "FAIL",
  FIELD = "FIELD", DM = "DM", WITH = "WITH", BUTTON = "BUTTON", ROLE = "ROLE",
  SLASH = "SLASH", IMPORT = "IMPORT", MODAL = "MODAL", SELECT = "SELECT",
  REACT = "REACT", OPTION = "OPTION",
  FOR = "FOR", WHILE = "WHILE", BREAK = "BREAK", CONTINUE = "CONTINUE",
  IN = "IN", FROM = "FROM", TO = "TO", IS = "IS", AND = "AND", OR = "OR",
  EPHEMERAL = "EPHEMERAL",
  ACCESS = "ACCESS", DECORATOR = "DECORATOR",
  // v0.1.0 — beginner mode
  VAR = "VAR",
  TYPE_INT = "TYPE_INT", TYPE_STR = "TYPE_STR", TYPE_BOOL = "TYPE_BOOL", TYPE_FLOAT = "TYPE_FLOAT",
  MODE = "MODE",
  LBRACE = "LBRACE", RBRACE = "RBRACE", LPAREN = "LPAREN", RPAREN = "RPAREN",
  LBRACKET = "LBRACKET", RBRACKET = "RBRACKET", COMMA = "COMMA", DOT = "DOT",
  COLON = "COLON", EQUALS = "EQUALS", PLUS_EQUALS = "PLUS_EQUALS",
  MINUS_EQUALS = "MINUS_EQUALS", PLUS = "PLUS", MINUS = "MINUS", STAR = "STAR",
  SLASH_OP = "SLASH_OP", BANG = "BANG", QUESTION = "QUESTION",
  DOUBLE_QUESTION = "DOUBLE_QUESTION", ARROW = "ARROW", PERCENT = "PERCENT",
  EQUALS_EQUALS = "EQUALS_EQUALS", NOT_EQUALS = "NOT_EQUALS",
  GREATER = "GREATER", LESS = "LESS", GREATER_EQUALS = "GREATER_EQUALS",
  LESS_EQUALS = "LESS_EQUALS", EOF = "EOF", NEWLINE = "NEWLINE",
}

export interface Token { type: TokenType; value: string; line: number; }

const KEYWORDS: Record<string, TokenType> = {
  node: TokenType.NODE, private: TokenType.PRIVATE, open: TokenType.OPEN,
  extends: TokenType.EXTENDS, def: TokenType.DEF, return: TokenType.RETURN,
  if: TokenType.IF, else: TokenType.ELSE, use: TokenType.USE, cmd: TokenType.CMD,
  slash: TokenType.SLASH, on: TokenType.ON, root: TokenType.ROOT, let: TokenType.LET,
  try: TokenType.TRY, attempt: TokenType.ATTEMPT, catch: TokenType.CATCH,
  fail: TokenType.FAIL, field: TokenType.FIELD, dm: TokenType.DM, with: TokenType.WITH,
  button: TokenType.BUTTON, role: TokenType.ROLE, import: TokenType.IMPORT,
  modal: TokenType.MODAL, select: TokenType.SELECT, react: TokenType.REACT,
  option: TokenType.OPTION,
  for: TokenType.FOR, while: TokenType.WHILE, break: TokenType.BREAK,
  continue: TokenType.CONTINUE, in: TokenType.IN, from: TokenType.FROM,
  to: TokenType.TO, is: TokenType.IS, and: TokenType.AND, or: TokenType.OR,
  ephemeral: TokenType.EPHEMERAL,
  // v0.1.0
  var: TokenType.VAR,
  int: TokenType.TYPE_INT, str: TokenType.TYPE_STR,
  bool: TokenType.TYPE_BOOL, float: TokenType.TYPE_FLOAT,
  true: TokenType.BOOLEAN, false: TokenType.BOOLEAN, null: TokenType.NULL,
};

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(source: string) { this.source = source; }

  tokenize(): Token[] {
    while (!this.isAtEnd()) { this.start = this.current; this.scanToken(); }
    this.tokens.push({ type: TokenType.EOF, value: "", line: this.line });
    return this.tokens;
  }

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
      case "%": this.addToken(TokenType.PERCENT); break;
      case "+": this.addToken(this.match("=") ? TokenType.PLUS_EQUALS : TokenType.PLUS); break;
      case "-": this.addToken(this.match("=") ? TokenType.MINUS_EQUALS : TokenType.MINUS); break;
      case "*": this.addToken(TokenType.STAR); break;
      case "!": this.addToken(this.match("=") ? TokenType.NOT_EQUALS : TokenType.BANG); break;
      case "=": this.addToken(this.match("=") ? TokenType.EQUALS_EQUALS : TokenType.EQUALS); break;
      case ">": this.addToken(this.match("=") ? TokenType.GREATER_EQUALS : TokenType.GREATER); break;
      case "<": this.addToken(this.match("=") ? TokenType.LESS_EQUALS : TokenType.LESS); break;
      case "?": this.addToken(this.match("?") ? TokenType.DOUBLE_QUESTION : TokenType.QUESTION); break;
      case "/":
        if (this.match("/")) { while (this.peek() !== "\n" && !this.isAtEnd()) this.advance(); }
        else if (this.match("*")) { this.blockComment(); }
        else { this.addToken(TokenType.SLASH_OP); }
        break;
      case "@": this.atSign(); break;
      case '"': this.string(); break;
      case "\n": this.line++; break;
      case " ": case "\r": case "\t": break;
      default:
        if (this.isDigit(c)) this.number();
        else if (this.isAlpha(c)) this.identifier();
        else throw new Error(`Unexpected character '${c}' at line ${this.line}`);
    }
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }
    if (this.isAtEnd()) throw new Error(`Unterminated string at line ${this.line}`);
    this.advance();
    this.addToken(TokenType.STRING, this.source.substring(this.start + 1, this.current - 1));
  }

  private number(): void {
    while (this.isDigit(this.peek())) this.advance();
    if (this.peek() === "." && this.isDigit(this.peekNext())) { this.advance(); while (this.isDigit(this.peek())) this.advance(); }
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
    // m.@beginner and m.@normal are MODE tokens; @slash is DECORATOR; rest are ACCESS
    if (value === "@beginner" || value === "@normal") {
      this.addToken(TokenType.MODE, value);
    } else if (value === "@slash") {
      this.addToken(TokenType.DECORATOR, value);
    } else {
      this.addToken(TokenType.ACCESS, value);
    }
  }

  private blockComment(): void {
    while (!(this.peek() === "*" && this.peekNext() === "/") && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }
    if (this.isAtEnd()) throw new Error(`Unterminated block comment at line ${this.line}`);
    this.advance(); this.advance();
  }

  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source[this.current] !== expected) return false;
    this.current++; return true;
  }
  private peek(): string { return this.isAtEnd() ? "\0" : this.source[this.current]; }
  private peekNext(): string { return this.current + 1 >= this.source.length ? "\0" : this.source[this.current + 1]; }
  private advance(): string { return this.source[this.current++]; }
  private addToken(type: TokenType, value?: string): void {
    this.tokens.push({ type, value: value ?? this.source.substring(this.start, this.current), line: this.line });
  }
  private isAtEnd(): boolean { return this.current >= this.source.length; }
  private isDigit(c: string): boolean { return c >= "0" && c <= "9"; }
  private isAlpha(c: string): boolean { return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_"; }
  private isAlphaNumeric(c: string): boolean { return this.isAlpha(c) || this.isDigit(c); }
}

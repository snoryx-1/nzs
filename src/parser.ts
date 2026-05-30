import { Token, TokenType } from "./lexer";
import { NZSError } from "./errors";

// ── Base ───────────────────────────────────────────────────────────────────
export interface ASTNode { type: string; line?: number; }
export interface Program extends ASTNode { type: "Program"; body: ASTNode[]; }

// ── Declarations ──────────────────────────────────────────────────────────
export interface NodeDeclaration extends ASTNode {
  type: "NodeDeclaration";
  name: string; isPrivate: boolean; extends?: string;
  body: ASTNode[];
  // resolved in symbol pass
  nodeKind?: "embed" | "button" | "modal" | "select" | "vars" | "commands" | "generic";
  mode?: "beginner" | "normal";
  nodePrefix?: string | string[];
}
export interface RootDeclaration extends ASTNode {
  type: "RootDeclaration"; body: ASTNode[]; mode?: "beginner" | "normal";
}
export interface DefDeclaration extends ASTNode {
  type: "DefDeclaration"; name: string; isPrivate: boolean;
  params: ParamDeclaration[]; returnType?: string; body: ASTNode[];
}
export interface CmdDeclaration extends ASTNode {
  type: "CmdDeclaration"; name: string; params: ParamDeclaration[];
  body: ASTNode[]; isSlash: boolean;
  cmdPrefix?: string | string[]; aliases: string[];
}
export interface ParamDeclaration extends ASTNode {
  type: "ParamDeclaration"; name: string; paramType?: string; defaultValue?: ASTNode;
}
export interface EventDeclaration extends ASTNode {
  type: "EventDeclaration"; event: string; body: ASTNode[];
}
export interface AnimationDeclaration extends ASTNode {
  type: "AnimationDeclaration"; name: string;
  canvasWidth: number; canvasHeight: number; background: string;
  fps: number; loop: boolean;
  sprites: SpriteDeclaration[]; keyframes: KeyframeDeclaration[];
}
export interface SpriteDeclaration extends ASTNode {
  type: "SpriteDeclaration"; name: string; cells: SpriteCell[];
}
export interface SpriteCell { emoji: string; row?: number; col?: number; fillRow?: number; fillCol?: number; }
export interface KeyframeDeclaration extends ASTNode {
  type: "KeyframeDeclaration"; index: number; actions: KeyframeSpriteAction[];
}
export interface KeyframeSpriteAction {
  spriteName: string; fillRow?: number; fillCol?: number;
  x?: number; y?: number; stays?: boolean; clear?: boolean;
}
export interface ScheduledTask extends ASTNode {
  type: "ScheduledTask"; interval: string; body: ASTNode[];
}

// ── Statements ────────────────────────────────────────────────────────────
export interface UseStatement extends ASTNode { type: "UseStatement"; name: string; }
export interface ImportStatement extends ASTNode { type: "ImportStatement"; path: string; }
export interface AssignStatement extends ASTNode {
  type: "AssignStatement"; name: string; value: ASTNode;
  operator: string; isDeclaration: boolean;
}
export interface LetStatement extends ASTNode { type: "LetStatement"; name: string; value: ASTNode; }
export interface VarStatement extends ASTNode { type: "VarStatement"; name: string; varType: string | null; value: ASTNode; }
export interface ModeStatement extends ASTNode { type: "ModeStatement"; mode: "beginner" | "normal"; }
export interface ReturnStatement extends ASTNode { type: "ReturnStatement"; value?: ASTNode; }
export interface BreakStatement extends ASTNode { type: "BreakStatement"; }
export interface ContinueStatement extends ASTNode { type: "ContinueStatement"; }
export interface IfStatement extends ASTNode {
  type: "IfStatement"; condition: ASTNode; body: ASTNode[];
  elseIfs: { condition: ASTNode; body: ASTNode[] }[]; elseBody?: ASTNode[];
}
export interface MatchStatement extends ASTNode {
  type: "MatchStatement"; value: ASTNode;
  cases: { pattern: ASTNode; body: ASTNode[] }[]; defaultBody?: ASTNode[];
}
export interface ForInStatement extends ASTNode { type: "ForInStatement"; variable: string; iterable: ASTNode; body: ASTNode[]; }
export interface ForRangeStatement extends ASTNode { type: "ForRangeStatement"; variable: string; from: ASTNode; to: ASTNode; body: ASTNode[]; }
export interface WhileStatement extends ASTNode { type: "WhileStatement"; condition: ASTNode; body: ASTNode[]; }
export interface TryCatch extends ASTNode { type: "TryCatch"; keyword: "try" | "attempt"; body: ASTNode[]; catchVar: string; catchBody: ASTNode[]; }
export interface WaitStatement extends ASTNode { type: "WaitStatement"; duration: string; }
export interface ReactStatement extends ASTNode { type: "ReactStatement"; emoji: ASTNode; }
export interface EphemeralReply extends ASTNode { type: "EphemeralReply"; message: ASTNode; }
export interface CtxReply extends ASTNode { type: "CtxReply"; message: ASTNode; }
export interface DmStatement extends ASTNode { type: "DmStatement"; target: ASTNode; message: ASTNode; }
export interface RoleStatement extends ASTNode { type: "RoleStatement"; action: "give" | "remove"; target: ASTNode; role: ASTNode; }
export interface AccessStatement extends ASTNode { type: "AccessStatement"; level: string; }
export interface CooldownStatement extends ASTNode { type: "CooldownStatement"; duration: string; }
export interface PlayStatement extends ASTNode { type: "PlayStatement"; animationName: string; }
export interface ReplyWithButton extends ASTNode { type: "ReplyWithButton"; message: ASTNode; button: ButtonDeclaration | string; }
export interface EmitStatement extends ASTNode { type: "EmitStatement"; event: string; args: ASTNode[]; }
export interface TemplateReply extends ASTNode { type: "TemplateReply"; templateName: string; overrides: { key: string; value: ASTNode }[]; fields: FieldDeclaration[]; }
export interface PaginateStatement extends ASTNode { type: "PaginateStatement"; pages: ASTNode[]; timeout?: number; }

// ── Expressions ───────────────────────────────────────────────────────────
export interface CallExpression extends ASTNode { type: "CallExpression"; callee: ASTNode; args: ASTNode[]; }
export interface MemberExpression extends ASTNode { type: "MemberExpression"; object: ASTNode; property: string; optional: boolean; computed?: boolean; index?: ASTNode; }
export interface IndexExpression extends ASTNode { type: "IndexExpression"; object: ASTNode; index: ASTNode; }
export interface BinaryExpression extends ASTNode { type: "BinaryExpression"; left: ASTNode; operator: string; right: ASTNode; }
export interface NullCoalesce extends ASTNode { type: "NullCoalesce"; left: ASTNode; right: ASTNode; }
export interface TernaryExpression extends ASTNode { type: "TernaryExpression"; condition: ASTNode; consequent: ASTNode; alternate: ASTNode; }
export interface IsExpression extends ASTNode { type: "IsExpression"; value: ASTNode; checkType: string; negated: boolean; }
export interface Identifier extends ASTNode { type: "Identifier"; name: string; }
export interface Literal extends ASTNode { type: "Literal"; value: string | number | boolean | null; raw: string; }
export interface ArrayLiteral extends ASTNode { type: "ArrayLiteral"; elements: ASTNode[]; }
export interface MapLiteral extends ASTNode { type: "MapLiteral"; pairs: { key: ASTNode; value: ASTNode }[]; }
export interface EmbedLiteral extends ASTNode { type: "EmbedLiteral"; pairs: { key: string; value: ASTNode }[]; fields: FieldDeclaration[]; }
export interface FieldDeclaration extends ASTNode { type: "FieldDeclaration"; name: ASTNode; value: ASTNode; inline: boolean; }
export interface OptionDeclaration extends ASTNode { type: "OptionDeclaration"; label: ASTNode; value: ASTNode; description?: ASTNode; }
export interface ButtonDeclaration extends ASTNode { type: "ButtonDeclaration"; label: ASTNode; color: string; customId: string; onClickBody: ASTNode[]; }
export interface SpreadExpression extends ASTNode { type: "SpreadExpression"; value: ASTNode; }

// ── Parser ────────────────────────────────────────────────────────────────
export class Parser {
  private tokens: Token[];
  private current = 0;
  private scopes: Set<string>[] = [new Set()];
  private sourceLines: string[];

  constructor(tokens: Token[], source: string = "") {
    this.tokens = tokens;
    this.sourceLines = source.split("\n");
  }

  parse(): Program {
    const body: ASTNode[] = [];
    while (!this.isAtEnd()) {
      const s = this.parseStatement();
      if (s) body.push(s);
    }
    return { type: "Program", body };
  }

  private pushScope() { this.scopes.push(new Set()); }
  private popScope() { this.scopes.pop(); }
  private declare(name: string) { this.scopes[this.scopes.length - 1].add(name); }
  private isDeclared(name: string): boolean {
    for (let i = this.scopes.length - 1; i >= 0; i--)
      if (this.scopes[i].has(name)) return true;
    return false;
  }

  private err(msg: string, line?: number): NZSError {
    const l = line ?? this.peek().line;
    const src = this.sourceLines[l - 1] ?? "";
    return new NZSError(`${msg}\n  --> line ${l}: ${src.trim()}`, l);
  }

  // ── Statements ────────────────────────────────────────────────────────
  private parseStatement(): ASTNode | null {
    // skip stray semicolons
    while (this.match(TokenType.SEMICOLON)) {}

    if (this.check(TokenType.IMPORT)) return this.parseImport();
    if (this.check(TokenType.ANIMATION)) return this.parseAnimation();
    if (this.check(TokenType.PLAY)) return this.parsePlay();
    if (this.check(TokenType.EVERY)) return this.parseScheduled();
    if (this.check(TokenType.PAGINATE)) return this.parsePaginate();

    // node declarations
    if (this.check(TokenType.PRIVATE) && this.checkNext(TokenType.NODE)) { this.advance(); return this.parseNode(true); }
    if (this.match(TokenType.NODE)) {
      if (this.check(TokenType.ROOT)) { this.advance(); return this.parseRoot(); }
      return this.parseNode(false);
    }

    // @slash cmd
    if (this.check(TokenType.DECORATOR) && this.peek().value === "@slash") { this.advance(); if (this.match(TokenType.CMD)) return this.parseCmd(true); }

    if (this.match(TokenType.DEF)) return this.parseDef(false);
    if (this.check(TokenType.PRIVATE) && this.checkNextType(TokenType.DEF)) { this.advance(); this.advance(); return this.parseDef(true); }
    if (this.match(TokenType.CMD)) return this.parseCmd(false);
    if (this.match(TokenType.SLASH)) return this.parseCmd(true);
    if (this.match(TokenType.ON)) return this.parseEvent();
    if (this.match(TokenType.USE)) return this.parseUse();
    if (this.match(TokenType.RETURN)) return this.parseReturn();
    if (this.match(TokenType.IF)) return this.parseIf();
    if (this.match(TokenType.MATCH)) return this.parseMatch();
    if (this.match(TokenType.FOR)) return this.parseFor();
    if (this.match(TokenType.WHILE)) return this.parseWhile();
    if (this.match(TokenType.BREAK)) return { type: "BreakStatement", line: this.previous().line } as BreakStatement;
    if (this.match(TokenType.CONTINUE)) return { type: "ContinueStatement", line: this.previous().line } as ContinueStatement;
    if (this.match(TokenType.LET)) return this.parseLet();
    if (this.match(TokenType.VAR)) return this.parseVar();
    if (this.check(TokenType.TRY) || this.check(TokenType.ATTEMPT)) return this.parseTryCatch();
    if (this.check(TokenType.DM)) return this.parseDm();
    if (this.check(TokenType.ROLE)) return this.parseRole();
    if (this.check(TokenType.REACT)) return this.parseReact();
    if (this.check(TokenType.EMIT)) return this.parseEmit();

    // m.@beginner / m.@normal
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "m" && this.checkNextType(TokenType.DOT))
      return this.parseModeStatement();

    return this.parseExpressionStatement();
  }

  private parseImport(): ImportStatement {
    this.advance();
    const p = this.consume(TokenType.STRING, "Expected file path after import");
    return { type: "ImportStatement", path: p.value, line: p.line };
  }

  private parseNode(isPrivate: boolean): NodeDeclaration {
    const nameTok = this.consume(TokenType.IDENTIFIER, "Expected node name");
    const name = nameTok.value;
    let ext: string | undefined;
    if (this.match(TokenType.EXTENDS)) ext = this.consume(TokenType.IDENTIFIER, "Expected parent node name").value;
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope();
    const body = this.parseBlock();
    this.popScope();

    // Extract mode
    const modeStmt = body.find(s => s.type === "ModeStatement") as ModeStatement | undefined;

    // Extract node prefix
    const assigns = body.filter(s => s.type === "AssignStatement") as AssignStatement[];
    const prefixAssign = assigns.find(a => a.name === "prefix");
    let nodePrefix: string | string[] | undefined;
    if (prefixAssign) {
      if (prefixAssign.value.type === "Literal") nodePrefix = (prefixAssign.value as Literal).value as string;
      else if (prefixAssign.value.type === "ArrayLiteral")
        nodePrefix = (prefixAssign.value as ArrayLiteral).elements.map(e => (e as Literal).value as string);
    }

    return {
      type: "NodeDeclaration", name, isPrivate, extends: ext,
      body, mode: modeStmt?.mode, nodePrefix, line: nameTok.line
    };
  }

  private parseRoot(): RootDeclaration {
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope();
    const body = this.parseBlock();
    this.popScope();
    const modeStmt = body.find(s => s.type === "ModeStatement") as ModeStatement | undefined;
    return { type: "RootDeclaration", body, mode: modeStmt?.mode };
  }

  private parseDef(isPrivate: boolean): DefDeclaration {
    const nameTok = this.peek();
    if (nameTok.type === TokenType.EOF) throw this.err("Expected method name");
    this.advance();
    this.consume(TokenType.LPAREN, "Expected '('");
    const params = this.parseCmdParams();
    this.consume(TokenType.RPAREN, "Expected ')'");
    let returnType: string | undefined;
    if (this.match(TokenType.COLON)) returnType = this.advance().value;
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope();
    for (const p of params) this.declare(p.name);
    const body = this.parseBlock();
    this.popScope();
    return { type: "DefDeclaration", name: nameTok.value, isPrivate, params, returnType, body, line: nameTok.line };
  }

  private parseCmd(isSlash: boolean): CmdDeclaration {
    const nameTok = this.peek();
    if (nameTok.type === TokenType.EOF) throw this.err("Expected command name");
    this.advance();
    this.consume(TokenType.LPAREN, "Expected '('");
    const params = this.parseCmdParams();
    this.consume(TokenType.RPAREN, "Expected ')'");
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope();
    for (const p of params) this.declare(p.name);
    const body = this.parseBlock();
    this.popScope();

    let cmdPrefix: string | string[] | undefined;
    let aliases: string[] = [];
    for (const s of body) {
      if (s.type === "AssignStatement") {
        const a = s as AssignStatement;
        if (a.name === "prefix") {
          if (a.value.type === "Literal") cmdPrefix = (a.value as Literal).value as string;
          else if (a.value.type === "ArrayLiteral") cmdPrefix = (a.value as ArrayLiteral).elements.map(e => (e as Literal).value as string);
        }
        if (a.name === "alias") {
          if (a.value.type === "ArrayLiteral") aliases = (a.value as ArrayLiteral).elements.map(e => (e as Literal).value as string);
          else if (a.value.type === "Literal") aliases = [(a.value as Literal).value as string];
        }
      }
    }
    return { type: "CmdDeclaration", name: nameTok.value, params, body, isSlash, cmdPrefix, aliases, line: nameTok.line };
  }

  private parseEvent(): EventDeclaration {
    const evTok = this.peek();
    this.advance();
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope();
    const body = this.parseBlock();
    this.popScope();
    return { type: "EventDeclaration", event: evTok.value, body, line: evTok.line };
  }

  private parseUse(): UseStatement {
    const name = this.consume(TokenType.IDENTIFIER, "Expected node name");
    return { type: "UseStatement", name: name.value, line: name.line };
  }

  private parseLet(): LetStatement {
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name");
    this.consume(TokenType.EQUALS, "Expected '='");
    const value = this.parseExpression();
    this.declare(name.value);
    return { type: "LetStatement", name: name.value, value, line: name.line };
  }

  private parseVar(): VarStatement {
    let varType: string | null = null;
    if (this.check(TokenType.TYPE_INT) || this.check(TokenType.TYPE_STR) ||
        this.check(TokenType.TYPE_BOOL) || this.check(TokenType.TYPE_FLOAT)) {
      varType = this.advance().value;
    }
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name after var");
    this.consume(TokenType.EQUALS, "Expected '='");
    const value = this.parseExpression();
    this.declare(name.value);
    return { type: "VarStatement", name: name.value, varType, value, line: name.line };
  }

  private parseModeStatement(): ModeStatement | null {
    this.advance(); // 'm'
    this.consume(TokenType.DOT, "Expected '.' after m");
    if (!this.check(TokenType.MODE)) return null;
    const tok = this.advance();
    return { type: "ModeStatement", mode: tok.value === "@beginner" ? "beginner" : "normal", line: tok.line };
  }

  private parseReturn(): ReturnStatement {
    const line = this.previous().line;
    if (this.check(TokenType.RBRACE)) return { type: "ReturnStatement", line };
    return { type: "ReturnStatement", value: this.parseExpression(), line };
  }

  private parseIf(): IfStatement {
    const line = this.previous().line;
    const condition = this.parseExpression();
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope(); const body = this.parseBlock(); this.popScope();
    const elseIfs: { condition: ASTNode; body: ASTNode[] }[] = [];
    let elseBody: ASTNode[] | undefined;
    while (this.match(TokenType.ELSE)) {
      if (this.match(TokenType.IF)) {
        const c = this.parseExpression();
        this.consume(TokenType.LBRACE, "Expected '{'");
        this.pushScope(); const b = this.parseBlock(); this.popScope();
        elseIfs.push({ condition: c, body: b });
      } else {
        this.consume(TokenType.LBRACE, "Expected '{'");
        this.pushScope(); elseBody = this.parseBlock(); this.popScope();
        break;
      }
    }
    return { type: "IfStatement", condition, body, elseIfs, elseBody, line };
  }

  private parseMatch(): MatchStatement {
    const line = this.previous().line;
    const value = this.parseExpression();
    this.consume(TokenType.LBRACE, "Expected '{'");
    const cases: { pattern: ASTNode; body: ASTNode[] }[] = [];
    let defaultBody: ASTNode[] | undefined;
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.check(TokenType.IDENTIFIER) && this.peek().value === "default") {
        this.advance();
        this.consume(TokenType.LBRACE, "Expected '{'");
        this.pushScope(); defaultBody = this.parseBlock(); this.popScope();
      } else if (this.check(TokenType.WHEN)) {
        this.advance();
        const pattern = this.parseExpression();
        this.consume(TokenType.LBRACE, "Expected '{'");
        this.pushScope(); const body = this.parseBlock(); this.popScope();
        cases.push({ pattern, body });
      } else { this.advance(); }
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: "MatchStatement", value, cases, defaultBody, line };
  }

  private parseFor(): ForInStatement | ForRangeStatement {
    const varName = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    this.declare(varName);
    if (this.match(TokenType.IN)) {
      const iterable = this.parseExpression();
      this.consume(TokenType.LBRACE, "Expected '{'");
      this.pushScope(); this.declare(varName); const body = this.parseBlock(); this.popScope();
      return { type: "ForInStatement", variable: varName, iterable, body };
    } else if (this.match(TokenType.FROM)) {
      const from = this.parseExpression();
      this.consume(TokenType.TO, "Expected 'to'");
      const to = this.parseExpression();
      this.consume(TokenType.LBRACE, "Expected '{'");
      this.pushScope(); this.declare(varName); const body = this.parseBlock(); this.popScope();
      return { type: "ForRangeStatement", variable: varName, from, to, body };
    }
    throw this.err("Expected 'in' or 'from' after for variable");
  }

  private parseWhile(): WhileStatement {
    const condition = this.parseExpression();
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope(); const body = this.parseBlock(); this.popScope();
    return { type: "WhileStatement", condition, body };
  }

  private parseTryCatch(): TryCatch {
    const kw = this.advance();
    const keyword = kw.type === TokenType.TRY ? "try" : "attempt";
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope(); const body = this.parseBlock(); this.popScope();
    if (!this.check(TokenType.CATCH) && !this.check(TokenType.FAIL))
      throw this.err("Expected 'catch' or 'fail'");
    this.advance();
    this.consume(TokenType.LPAREN, "Expected '('");
    const catchVar = this.consume(TokenType.IDENTIFIER, "Expected error variable").value;
    this.consume(TokenType.RPAREN, "Expected ')'");
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope(); this.declare(catchVar); const catchBody = this.parseBlock(); this.popScope();
    return { type: "TryCatch", keyword, body, catchVar, catchBody, line: kw.line };
  }

  private parseDm(): DmStatement {
    const line = this.peek().line;
    this.advance();
    const target = this.parseExpression();
    const message = this.parseExpression();
    return { type: "DmStatement", target, message, line };
  }

  private parseRole(): RoleStatement {
    const line = this.peek().line;
    this.advance();
    this.consume(TokenType.DOT, "Expected '.' after role");
    const action = this.advance().value;
    if (action !== "give" && action !== "remove") throw this.err("Expected 'give' or 'remove'");
    this.consume(TokenType.LPAREN, "Expected '('");
    const target = this.parseExpression();
    this.consume(TokenType.COMMA, "Expected ','");
    const role = this.parseExpression();
    this.consume(TokenType.RPAREN, "Expected ')'");
    return { type: "RoleStatement", action: action as "give" | "remove", target, role, line };
  }

  private parseReact(): ReactStatement {
    const line = this.peek().line;
    this.advance();
    this.consume(TokenType.LPAREN, "Expected '('");
    const emoji = this.parseExpression();
    this.consume(TokenType.RPAREN, "Expected ')'");
    return { type: "ReactStatement", emoji, line };
  }

  private parseEmit(): EmitStatement {
    const line = this.peek().line;
    this.advance();
    const event = this.consume(TokenType.IDENTIFIER, "Expected event name").value;
    const args: ASTNode[] = [];
    if (this.match(TokenType.LPAREN)) {
      if (!this.check(TokenType.RPAREN)) {
        args.push(this.parseExpression());
        while (this.match(TokenType.COMMA)) args.push(this.parseExpression());
      }
      this.consume(TokenType.RPAREN, "Expected ')'");
    }
    return { type: "EmitStatement", event, args, line };
  }

  private parseScheduled(): ScheduledTask {
    const line = this.peek().line;
    this.advance();
    const interval = this.advance().value;
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope(); const body = this.parseBlock(); this.popScope();
    return { type: "ScheduledTask", interval, body, line };
  }

  private parsePlay(): PlayStatement {
    const line = this.peek().line;
    this.advance();
    const name = this.consume(TokenType.IDENTIFIER, "Expected animation name").value;
    return { type: "PlayStatement", animationName: name, line };
  }

  private parseExpressionStatement(): ASTNode | null {
    // cooldown: 5s
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "cooldown" && this.checkNextType(TokenType.COLON)) {
      this.advance(); this.advance();
      const dur = this.advance().value;
      return { type: "CooldownStatement", duration: dur } as CooldownStatement;
    }
    // wait: 2s
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "wait" && this.checkNextType(TokenType.COLON)) {
      this.advance(); this.advance();
      return { type: "WaitStatement", duration: this.advance().value } as WaitStatement;
    }
    // field { }
    if (this.check(TokenType.FIELD)) { this.advance(); return this.parseInlineField(false); }
    // input { }
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "input") { this.advance(); return this.parseInlineField(true); }
    // option { }
    if (this.check(TokenType.OPTION)) { this.advance(); return this.parseOption(); }
    // a.@perm
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "a" && this.checkNextType(TokenType.DOT)) {
      this.advance(); this.advance();
      return { type: "AccessStatement", level: this.advance().value } as AccessStatement;
    }
    // reply ...
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "reply") return this.parseReply();
    // ctx.reply
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "ctx" && this.checkNextType(TokenType.DOT)) {
      if (this.current + 2 < this.tokens.length && this.tokens[this.current + 2].value === "reply") {
        this.advance(); this.advance(); this.advance();
        return { type: "CtxReply", message: this.parseExpression() } as CtxReply;
      }
    }
    // log
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "log") {
      this.advance();
      const arg = this.check(TokenType.LPAREN)
        ? (this.advance(), (() => { const e = this.parseExpression(); this.consume(TokenType.RPAREN, "Expected ')'"); return e; })())
        : this.parseExpression();
      return { type: "CallExpression", callee: { type: "Identifier", name: "log" } as Identifier, args: [arg] } as CallExpression;
    }

    const expr = this.parseExpression();
    if (!expr) return null;

    // assignment: x = / += / -= / *= / /=
    if (this.check(TokenType.EQUALS) || this.check(TokenType.PLUS_EQUALS) ||
        this.check(TokenType.MINUS_EQUALS) || this.check(TokenType.STAR_EQUALS) ||
        this.check(TokenType.SLASH_EQUALS)) {
      const operator = this.advance().value;
      const value = this.parseExpression();
      if (expr.type === "Identifier") {
        const name = (expr as Identifier).name;
        const isDeclaration = !this.isDeclared(name);
        if (isDeclaration) this.declare(name);
        return { type: "AssignStatement", name, value, operator, isDeclaration } as AssignStatement;
      }
      if (expr.type === "MemberExpression") {
        const m = expr as MemberExpression;
        const name = `${(m.object as Identifier).name}.${m.property}`;
        return { type: "AssignStatement", name, value, operator, isDeclaration: false } as AssignStatement;
      }
      if (expr.type === "IndexExpression") {
        return { type: "AssignStatement", name: "__index__", value, operator, isDeclaration: false, _indexExpr: expr } as any;
      }
    }
    return expr;
  }

  private parseReply(): ASTNode {
    this.advance();
    // ephemeral
    if (this.check(TokenType.EPHEMERAL)) {
      this.advance();
      return { type: "EphemeralReply", message: this.parseExpression() } as EphemeralReply;
    }
    // embed { } inline
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "embed" && this.checkNextType(TokenType.LBRACE)) {
      this.advance();
      this.consume(TokenType.LBRACE, "Expected '{'");
      const pairs: { key: string; value: ASTNode }[] = [];
      const fields: FieldDeclaration[] = [];
      while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
        if (this.check(TokenType.FIELD)) { this.advance(); fields.push(this.parseInlineField()); }
        else {
          const key = this.consume(TokenType.IDENTIFIER, "Expected embed key").value;
          this.consume(TokenType.EQUALS, "Expected '='");
          pairs.push({ key, value: this.parseExpression() });
        }
      }
      this.consume(TokenType.RBRACE, "Expected '}'");
      const embed: EmbedLiteral = { type: "EmbedLiteral", pairs, fields };
      if (this.check(TokenType.WITH)) return this.parseWith(embed);
      return { type: "CallExpression", callee: { type: "Identifier", name: "reply" } as Identifier, args: [embed] } as CallExpression;
    }
    // reply NodeName { overrides } — embed template
    if (this.check(TokenType.IDENTIFIER) && this.checkNextType(TokenType.LBRACE)) {
      const name = this.peek().value;
      // peek ahead to check it looks like an embed override block (key = value pairs)
      const savedPos = this.current;
      this.advance(); // consume identifier
      this.advance(); // consume {
      // check first token: if it's identifier followed by = it's a template override
      if (!this.isAtEnd() && (this.check(TokenType.IDENTIFIER) || this.check(TokenType.FIELD) || this.check(TokenType.RBRACE))) {
        const pairs: { key: string; value: ASTNode }[] = [];
        const fields: FieldDeclaration[] = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
          if (this.check(TokenType.FIELD)) { this.advance(); fields.push(this.parseInlineField()); }
          else {
            const key = this.advance().value;
            if (!this.check(TokenType.EQUALS)) { this.current = savedPos; break; }
            this.advance(); // =
            pairs.push({ key, value: this.parseExpression() });
          }
        }
        if (this.check(TokenType.RBRACE)) {
          this.advance(); // consume }
          return { type: "TemplateReply", templateName: name, overrides: pairs, fields } as TemplateReply;
        }
      }
      this.current = savedPos;
    }
    const arg = this.check(TokenType.LPAREN)
      ? (this.advance(), (() => { const e = this.parseExpression(); this.consume(TokenType.RPAREN, "Expected ')'"); return e; })())
      : this.parseExpression();
    if (this.check(TokenType.WITH)) return this.parseWith(arg);
    return { type: "CallExpression", callee: { type: "Identifier", name: "reply" } as Identifier, args: [arg] } as CallExpression;
  }

  private parsePaginate(): PaginateStatement {
    const line = this.peek().line;
    this.advance(); // consume 'paginate'
    let timeout = 60;
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "timeout") {
      this.advance(); this.consume(TokenType.COLON, "Expected ':'");
      timeout = parseFloat(this.consume(TokenType.NUMBER, "Expected timeout seconds").value);
    }
    this.consume(TokenType.LBRACE, "Expected '{'");
    const pages: ASTNode[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      // each page = embed literal or node name
      if (this.check(TokenType.IDENTIFIER) && this.peek().value === "page") {
        this.advance();
        this.consume(TokenType.LBRACE, "Expected '{'");
        const pairs: { key: string; value: ASTNode }[] = [];
        const fields: FieldDeclaration[] = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
          if (this.check(TokenType.FIELD)) { this.advance(); fields.push(this.parseInlineField()); }
          else {
            const key = this.consume(TokenType.IDENTIFIER, "Expected key").value;
            this.consume(TokenType.EQUALS, "Expected '='");
            pairs.push({ key, value: this.parseExpression() });
          }
        }
        this.consume(TokenType.RBRACE, "Expected '}'");
        pages.push({ type: "EmbedLiteral", pairs, fields } as EmbedLiteral);
      } else { this.advance(); }
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: "PaginateStatement", pages, timeout, line };
  }

  private parseWith(message: ASTNode): ReplyWithButton {
    this.advance();
    if (this.check(TokenType.BUTTON)) {
      this.advance();
      return { type: "ReplyWithButton", message, button: this.parseInlineButton() };
    }
    return { type: "ReplyWithButton", message, button: this.consume(TokenType.IDENTIFIER, "Expected button name").value };
  }

  private parseInlineButton(): ButtonDeclaration {
    this.consume(TokenType.LBRACE, "Expected '{'");
    let label: ASTNode = { type: "Literal", value: "Click", raw: "Click" } as Literal;
    let color = "primary";
    let customId = `btn_${Math.random().toString(36).slice(2, 7)}`;
    const onClickBody: ASTNode[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const key = this.peek().value;
      if ((key === "label" || key === "color" || key === "customId") && this.checkNextType(TokenType.EQUALS)) {
        this.advance(); this.advance();
        const val = this.parseExpression();
        if (key === "label") label = val;
        else if (key === "color") color = (val as Literal).value as string;
        else if (key === "customId") customId = (val as Literal).value as string;
      } else if (key === "onClick") {
        this.advance();
        this.consume(TokenType.LBRACE, "Expected '{'");
        this.pushScope(); onClickBody.push(...this.parseBlock()); this.popScope();
      } else { this.advance(); }
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: "ButtonDeclaration", label, color, customId, onClickBody };
  }

  private parseInlineField(isInput = false): FieldDeclaration {
    this.consume(TokenType.LBRACE, "Expected '{'");
    let fn: ASTNode = { type: "Literal", value: "", raw: "" } as Literal;
    let fv: ASTNode = { type: "Literal", value: "", raw: "" } as Literal;
    let fi = false;
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const k = this.advance().value;
      this.consume(TokenType.EQUALS, "Expected '='");
      const v = this.parseExpression();
      if (k === "name" || k === "label") fn = v;
      else if (k === "value" || k === "placeholder") fv = v;
      else if (k === "inline" || k === "required") fi = (v as Literal).value === true;
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    const f = { type: "FieldDeclaration", name: fn, value: fv, inline: fi } as FieldDeclaration;
    if (isInput) (f as any)._isInput = true;
    return f;
  }

  private parseOption(): OptionDeclaration {
    this.consume(TokenType.LBRACE, "Expected '{'");
    let label: ASTNode = { type: "Literal", value: "", raw: "" } as Literal;
    let value: ASTNode = { type: "Literal", value: "", raw: "" } as Literal;
    let description: ASTNode | undefined;
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const k = this.advance().value;
      this.consume(TokenType.EQUALS, "Expected '='");
      const v = this.parseExpression();
      if (k === "label") label = v;
      else if (k === "value") value = v;
      else if (k === "description") description = v;
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: "OptionDeclaration", label, value, description };
  }

  private parseBlock(): ASTNode[] {
    const stmts: ASTNode[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const s = this.parseStatement();
      if (s) stmts.push(s);
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return stmts;
  }

  private parseCmdParams(): ParamDeclaration[] {
    const params: ParamDeclaration[] = [];
    if (!this.check(TokenType.RPAREN)) {
      params.push(this.parseCmdParam());
      while (this.match(TokenType.COMMA)) params.push(this.parseCmdParam());
    }
    return params;
  }

  private parseCmdParam(): ParamDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Expected parameter name").value;
    let paramType: string | undefined;
    let defaultValue: ASTNode | undefined;
    if (this.match(TokenType.COLON)) paramType = this.advance().value;
    if (this.match(TokenType.EQUALS)) defaultValue = this.parseExpression();
    return { type: "ParamDeclaration", name, paramType, defaultValue };
  }

  // ── Animation ─────────────────────────────────────────────────────────
  private parseAnimation(): AnimationDeclaration {
    const line = this.peek().line;
    this.advance();
    const name = this.consume(TokenType.IDENTIFIER, "Expected animation name").value;
    this.consume(TokenType.LBRACE, "Expected '{'");
    let canvasWidth = 5, canvasHeight = 5, background = "⬛", fps = 2, loop = false;
    const sprites: SpriteDeclaration[] = [];
    const keyframes: KeyframeDeclaration[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.check(TokenType.CANVAS)) {
        this.advance(); this.consume(TokenType.EQUALS, "Expected '='");
        const sz = this.consume(TokenType.CANVAS_SIZE, "Expected canvas size like 6x6").value;
        [canvasWidth, canvasHeight] = sz.split("x").map(Number);
      } else if (this.check(TokenType.IDENTIFIER) && this.peek().value === "background") {
        this.advance(); this.consume(TokenType.EQUALS, "Expected '='");
        background = this.consume(TokenType.STRING, "Expected background emoji").value;
      } else if (this.check(TokenType.FPS)) {
        this.advance(); this.consume(TokenType.EQUALS, "Expected '='");
        fps = parseFloat(this.consume(TokenType.NUMBER, "Expected fps").value);
      } else if (this.check(TokenType.LOOP)) {
        this.advance(); this.consume(TokenType.EQUALS, "Expected '='");
        loop = this.consume(TokenType.BOOLEAN, "Expected true or false").value === "true";
      } else if (this.check(TokenType.SPRITE)) {
        sprites.push(this.parseSprite());
      } else if (this.check(TokenType.KEYFRAME)) {
        keyframes.push(this.parseKeyframe());
      } else { this.advance(); }
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: "AnimationDeclaration", name, canvasWidth, canvasHeight, background, fps, loop, sprites, keyframes, line };
  }

  private parseSprite(): SpriteDeclaration {
    this.advance();
    const name = this.consume(TokenType.IDENTIFIER, "Expected sprite name").value;
    this.consume(TokenType.EQUALS, "Expected '='");
    const cells: SpriteCell[] = [];
    if (this.check(TokenType.STRING)) {
      const emoji = this.consume(TokenType.STRING, "").value;
      if (this.check(TokenType.FILL)) {
        this.advance();
        if (this.check(TokenType.ROW)) { this.advance(); cells.push({ emoji, fillRow: parseFloat(this.consume(TokenType.NUMBER, "").value) }); }
        else if (this.check(TokenType.COL)) { this.advance(); cells.push({ emoji, fillCol: parseFloat(this.consume(TokenType.NUMBER, "").value) }); }
      } else if (this.check(TokenType.IDENTIFIER) && this.peek().value === "at") {
        this.advance();
        const x = parseFloat(this.consume(TokenType.NUMBER, "").value);
        this.consume(TokenType.COMMA, "");
        const y = parseFloat(this.consume(TokenType.NUMBER, "").value);
        cells.push({ emoji, row: x, col: y });
      }
    } else if (this.check(TokenType.LBRACKET)) {
      this.advance();
      while (!this.check(TokenType.RBRACKET) && !this.isAtEnd()) {
        const emoji = this.consume(TokenType.STRING, "Expected emoji").value;
        if (this.check(TokenType.FILL)) {
          this.advance();
          if (this.check(TokenType.ROW)) { this.advance(); cells.push({ emoji, fillRow: parseFloat(this.consume(TokenType.NUMBER, "").value) }); }
          else if (this.check(TokenType.COL)) { this.advance(); cells.push({ emoji, fillCol: parseFloat(this.consume(TokenType.NUMBER, "").value) }); }
        } else if (this.check(TokenType.IDENTIFIER) && this.peek().value === "at") {
          this.advance();
          const x = parseFloat(this.consume(TokenType.NUMBER, "").value);
          this.consume(TokenType.COMMA, "");
          const y = parseFloat(this.consume(TokenType.NUMBER, "").value);
          cells.push({ emoji, row: x, col: y });
        }
        if (this.check(TokenType.COMMA)) this.advance();
      }
      this.consume(TokenType.RBRACKET, "Expected ']'");
    }
    return { type: "SpriteDeclaration", name, cells };
  }

  private parseKeyframe(): KeyframeDeclaration {
    this.advance();
    const index = parseFloat(this.consume(TokenType.NUMBER, "Expected keyframe number").value);
    this.consume(TokenType.LBRACE, "Expected '{'");
    const actions: KeyframeSpriteAction[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.check(TokenType.CLEAR)) {
        this.advance();
        actions.push({ spriteName: this.consume(TokenType.IDENTIFIER, "Expected sprite name").value, clear: true });
        continue;
      }
      const spriteName = this.consume(TokenType.IDENTIFIER, "Expected sprite name").value;
      if (this.check(TokenType.STAYS)) { this.advance(); actions.push({ spriteName, stays: true }); }
      else if (this.check(TokenType.FILL)) {
        this.advance();
        if (this.check(TokenType.ROW)) { this.advance(); actions.push({ spriteName, fillRow: parseFloat(this.consume(TokenType.NUMBER, "").value) }); }
        else if (this.check(TokenType.COL)) { this.advance(); actions.push({ spriteName, fillCol: parseFloat(this.consume(TokenType.NUMBER, "").value) }); }
      } else if (this.check(TokenType.IDENTIFIER) && this.peek().value === "at") {
        this.advance();
        const x = parseFloat(this.consume(TokenType.NUMBER, "").value);
        this.consume(TokenType.COMMA, "");
        const y = parseFloat(this.consume(TokenType.NUMBER, "").value);
        actions.push({ spriteName, x, y });
      } else { this.advance(); }
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: "KeyframeDeclaration", index, actions };
  }

  // ── Expressions ───────────────────────────────────────────────────────
  private parseExpression(): ASTNode { return this.parseTernary(); }

  private parseTernary(): ASTNode {
    const expr = this.parseOr();
    if (this.match(TokenType.QUESTION)) {
      const consequent = this.parseOr();
      this.consume(TokenType.COLON, "Expected ':' in ternary");
      const alternate = this.parseOr();
      return { type: "TernaryExpression", condition: expr, consequent, alternate } as TernaryExpression;
    }
    return expr;
  }

  private parseOr(): ASTNode {
    let left = this.parseAnd();
    while (this.check(TokenType.OR)) { this.advance(); left = { type: "BinaryExpression", left, operator: "||", right: this.parseAnd() } as BinaryExpression; }
    return left;
  }

  private parseAnd(): ASTNode {
    let left = this.parseNullCoalesce();
    while (this.check(TokenType.AND)) { this.advance(); left = { type: "BinaryExpression", left, operator: "&&", right: this.parseNullCoalesce() } as BinaryExpression; }
    return left;
  }

  private parseNullCoalesce(): ASTNode {
    let left = this.parseComparison();
    while (this.match(TokenType.DOUBLE_QUESTION)) { left = { type: "NullCoalesce", left, right: this.parseComparison() } as NullCoalesce; }
    return left;
  }

  private parseComparison(): ASTNode {
    let left = this.parseAddition();
    if (this.check(TokenType.IS)) {
      this.advance();
      const negated = this.check(TokenType.BANG) ? (this.advance(), true) : false;
      const checkType = this.advance().value;
      return { type: "IsExpression", value: left, checkType, negated } as IsExpression;
    }
    while (this.check(TokenType.EQUALS_EQUALS) || this.check(TokenType.NOT_EQUALS) ||
           this.check(TokenType.GREATER) || this.check(TokenType.LESS) ||
           this.check(TokenType.GREATER_EQUALS) || this.check(TokenType.LESS_EQUALS)) {
      const op = this.advance().value;
      left = { type: "BinaryExpression", left, operator: op, right: this.parseAddition() } as BinaryExpression;
    }
    return left;
  }

  private parseAddition(): ASTNode {
    let left = this.parseMultiplication();
    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
      const op = this.advance().value;
      left = { type: "BinaryExpression", left, operator: op, right: this.parseMultiplication() } as BinaryExpression;
    }
    return left;
  }

  private parseMultiplication(): ASTNode {
    let left = this.parseUnary();
    while (this.check(TokenType.STAR) || this.check(TokenType.SLASH_OP) || this.check(TokenType.PERCENT)) {
      const op = this.advance().value;
      left = { type: "BinaryExpression", left, operator: op, right: this.parseUnary() } as BinaryExpression;
    }
    return left;
  }

  private parseUnary(): ASTNode {
    if (this.match(TokenType.BANG)) return { type: "BinaryExpression", left: { type: "Literal", value: null, raw: "null" } as Literal, operator: "!", right: this.parseUnary() } as BinaryExpression;
    if (this.match(TokenType.MINUS)) return { type: "BinaryExpression", left: { type: "Literal", value: 0, raw: "0" } as Literal, operator: "-", right: this.parseUnary() } as BinaryExpression;
    return this.parseCallOrMember();
  }

  private parseCallOrMember(): ASTNode {
    let expr = this.parsePrimary();
    while (true) {
      if (this.check(TokenType.DOT) || (this.check(TokenType.QUESTION) && this.checkNextType(TokenType.DOT))) {
        const optional = this.check(TokenType.QUESTION); if (optional) this.advance();
        this.consume(TokenType.DOT, "Expected '.'");
        const property = this.advance().value;
        expr = { type: "MemberExpression", object: expr, property, optional } as MemberExpression;
      } else if (this.check(TokenType.LBRACKET)) {
        this.advance();
        const index = this.parseExpression();
        this.consume(TokenType.RBRACKET, "Expected ']'");
        expr = { type: "IndexExpression", object: expr, index } as IndexExpression;
      } else if (this.check(TokenType.LPAREN)) {
        this.advance();
        const args = this.parseArgs();
        this.consume(TokenType.RPAREN, "Expected ')'");
        expr = { type: "CallExpression", callee: expr, args } as CallExpression;
      } else { break; }
    }
    return expr;
  }

  private parsePrimary(): ASTNode {
    if (this.match(TokenType.NUMBER)) return { type: "Literal", value: parseFloat(this.previous().value), raw: this.previous().value } as Literal;
    if (this.match(TokenType.STRING)) return { type: "Literal", value: this.previous().value, raw: this.previous().value } as Literal;
    if (this.match(TokenType.BOOLEAN)) return { type: "Literal", value: this.previous().value === "true", raw: this.previous().value } as Literal;
    if (this.match(TokenType.NULL)) return { type: "Literal", value: null, raw: "null" } as Literal;
    if (this.match(TokenType.LBRACKET)) return this.parseArray();
    if (this.check(TokenType.LBRACE)) {
      // peek ahead: if it looks like {key: val} it's a map
      const saved = this.current;
      this.advance(); // consume {
      if (!this.check(TokenType.RBRACE) && this.checkNextType(TokenType.COLON)) {
        this.current = saved;
        return this.parseMap();
      }
      this.current = saved;
      // else it's a block — don't parse as primary
    }
    if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.ROOT) ||
        this.check(TokenType.ROW) || this.check(TokenType.COL) ||
        this.check(TokenType.FPS) || this.check(TokenType.LOOP)) {
      return { type: "Identifier", name: this.advance().value } as Identifier;
    }
    throw this.err(`Unexpected token '${this.peek().value}'`);
  }

  private parseArray(): ArrayLiteral {
    const elements: ASTNode[] = [];
    if (!this.check(TokenType.RBRACKET)) {
      elements.push(this.parseExpression());
      while (this.match(TokenType.COMMA)) {
        if (this.check(TokenType.RBRACKET)) break;
        elements.push(this.parseExpression());
      }
    }
    this.consume(TokenType.RBRACKET, "Expected ']'");
    return { type: "ArrayLiteral", elements };
  }

  private parseMap(): MapLiteral {
    this.consume(TokenType.LBRACE, "Expected '{'");
    const pairs: { key: ASTNode; value: ASTNode }[] = [];
    if (!this.check(TokenType.RBRACE)) {
      const key = this.parsePrimary();
      this.consume(TokenType.COLON, "Expected ':'");
      pairs.push({ key, value: this.parseExpression() });
      while (this.match(TokenType.COMMA)) {
        if (this.check(TokenType.RBRACE)) break;
        const k = this.parsePrimary();
        this.consume(TokenType.COLON, "Expected ':'");
        pairs.push({ key: k, value: this.parseExpression() });
      }
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: "MapLiteral", pairs };
  }

  private parseArgs(): ASTNode[] {
    const args: ASTNode[] = [];
    if (!this.check(TokenType.RPAREN)) {
      args.push(this.parseExpression());
      while (this.match(TokenType.COMMA)) {
        if (this.check(TokenType.RPAREN)) break;
        args.push(this.parseExpression());
      }
    }
    return args;
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  private match(...types: TokenType[]): boolean {
    for (const t of types) { if (this.check(t)) { this.advance(); return true; } }
    return false;
  }
  private check(type: TokenType): boolean { return !this.isAtEnd() && this.peek().type === type; }
  private checkNext(type: TokenType): boolean { return this.current + 1 < this.tokens.length && this.tokens[this.current + 1].type === type; }
  private checkNextType(type: TokenType): boolean { return this.checkNext(type); }
  private advance(): Token { if (!this.isAtEnd()) this.current++; return this.previous(); }
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.err(`${message}, got '${this.peek().value}'`);
  }
  private previous(): Token { return this.tokens[this.current - 1]; }
  private peek(): Token { return this.tokens[this.current]; }
  private isAtEnd(): boolean { return this.peek().type === TokenType.EOF; }
}

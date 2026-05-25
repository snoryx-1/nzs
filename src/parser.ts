import { Token, TokenType } from "./lexer";
import { NZSError } from "./errors";

export interface ASTNode { type: string; }
export interface Program extends ASTNode { type: "Program"; body: ASTNode[]; }
export interface NodeDeclaration extends ASTNode { type: "NodeDeclaration"; name: string; isPrivate: boolean; isEmbed: boolean; isButton: boolean; isModal: boolean; isSelect: boolean; isVarsNode: boolean; extends?: string; body: ASTNode[]; nodePrefix?: string | string[]; mode?: "beginner" | "normal"; }
export interface FieldDeclaration extends ASTNode { type: "FieldDeclaration"; name: ASTNode; value: ASTNode; inline: boolean; }
export interface OptionDeclaration extends ASTNode { type: "OptionDeclaration"; label: ASTNode; value: ASTNode; description?: ASTNode; }
export interface ButtonDeclaration extends ASTNode { type: "ButtonDeclaration"; label: ASTNode; color: string; customId: string; onClickBody: ASTNode[]; }
export interface DefDeclaration extends ASTNode { type: "DefDeclaration"; name: string; isPrivate: boolean; params: string[]; returnType?: string; body: ASTNode[]; }
export interface CmdDeclaration extends ASTNode { type: "CmdDeclaration"; name: string; params: ParamDeclaration[]; body: ASTNode[]; isSlash: boolean; cmdPrefix?: string | string[]; aliases: string[]; }
export interface ParamDeclaration extends ASTNode { type: "ParamDeclaration"; name: string; paramType?: string; }
export interface PrefixStatement extends ASTNode { type: "PrefixStatement"; value: string | string[]; }
export interface AliasStatement extends ASTNode { type: "AliasStatement"; aliases: string[]; }
export interface EventDeclaration extends ASTNode { type: "EventDeclaration"; event: string; body: ASTNode[]; }
export interface RootDeclaration extends ASTNode { type: "RootDeclaration"; body: ASTNode[]; mode?: "beginner" | "normal"; }
export interface UseStatement extends ASTNode { type: "UseStatement"; name: string; }
export interface ImportStatement extends ASTNode { type: "ImportStatement"; path: string; }
export interface AssignStatement extends ASTNode { type: "AssignStatement"; name: string; value: ASTNode; operator: string; isDeclaration: boolean; }
export interface LetStatement extends ASTNode { type: "LetStatement"; name: string; value: ASTNode; }
// v0.1.0 — var declaration with optional type
export interface VarStatement extends ASTNode { type: "VarStatement"; name: string; varType: string | null; value: ASTNode; }
// v0.1.0 — m.@beginner / m.@normal
export interface ModeStatement extends ASTNode { type: "ModeStatement"; mode: "beginner" | "normal"; }
export interface ReturnStatement extends ASTNode { type: "ReturnStatement"; value?: ASTNode; }
export interface IfStatement extends ASTNode { type: "IfStatement"; condition: ASTNode; body: ASTNode[]; elseIfs: { condition: ASTNode; body: ASTNode[] }[]; elseBody?: ASTNode[]; }
export interface ForInStatement extends ASTNode { type: "ForInStatement"; variable: string; iterable: ASTNode; body: ASTNode[]; }
export interface ForRangeStatement extends ASTNode { type: "ForRangeStatement"; variable: string; from: ASTNode; to: ASTNode; body: ASTNode[]; }
export interface WhileStatement extends ASTNode { type: "WhileStatement"; condition: ASTNode; body: ASTNode[]; }
export interface BreakStatement extends ASTNode { type: "BreakStatement"; }
export interface ContinueStatement extends ASTNode { type: "ContinueStatement"; }
export interface IsExpression extends ASTNode { type: "IsExpression"; value: ASTNode; checkType: string; negated: boolean; }
export interface AccessStatement extends ASTNode { type: "AccessStatement"; level: string; }
export interface CooldownStatement extends ASTNode { type: "CooldownStatement"; duration: string; }
export interface WaitStatement extends ASTNode { type: "WaitStatement"; duration: string; }
export interface ReactStatement extends ASTNode { type: "ReactStatement"; emoji: ASTNode; }
export interface EphemeralReply extends ASTNode { type: "EphemeralReply"; message: ASTNode; }
export interface CtxReply extends ASTNode { type: "CtxReply"; message: ASTNode; }
export interface TryCatch extends ASTNode { type: "TryCatch"; keyword: "try" | "attempt"; body: ASTNode[]; catchVar: string; catchBody: ASTNode[]; }
export interface DmStatement extends ASTNode { type: "DmStatement"; target: ASTNode; message: ASTNode; }
export interface RoleStatement extends ASTNode { type: "RoleStatement"; action: "give" | "remove"; target: ASTNode; role: ASTNode; }
export interface ReplyWithButton extends ASTNode { type: "ReplyWithButton"; message: ASTNode; button: ButtonDeclaration | string; }
export interface CallExpression extends ASTNode { type: "CallExpression"; callee: ASTNode; args: ASTNode[]; }
export interface MemberExpression extends ASTNode { type: "MemberExpression"; object: ASTNode; property: string; optional: boolean; }
export interface IndexExpression extends ASTNode { type: "IndexExpression"; object: ASTNode; index: ASTNode; }
export interface BinaryExpression extends ASTNode { type: "BinaryExpression"; left: ASTNode; operator: string; right: ASTNode; }
export interface NullCoalesce extends ASTNode { type: "NullCoalesce"; left: ASTNode; right: ASTNode; }
export interface Identifier extends ASTNode { type: "Identifier"; name: string; }
export interface Literal extends ASTNode { type: "Literal"; value: string | number | boolean | null; raw: string; }
export interface ArrayLiteral extends ASTNode { type: "ArrayLiteral"; elements: ASTNode[]; }
export interface MapLiteral extends ASTNode { type: "MapLiteral"; pairs: { key: string; value: ASTNode }[]; }
export interface EmbedLiteral extends ASTNode { type: "EmbedLiteral"; pairs: { key: string; value: ASTNode }[]; fields: FieldDeclaration[]; }

export class Parser {
  private tokens: Token[];
  private current = 0;
  private declaredVars: Set<string>[] = [new Set()];
  private sourceLines: string[];

  constructor(tokens: Token[], source: string = "") {
    this.tokens = tokens;
    this.sourceLines = source.split("\n");
  }

  parse(): Program {
    const body: ASTNode[] = [];
    while (!this.isAtEnd()) { const s = this.parseStatement(); if (s) body.push(s); }
    return { type: "Program", body };
  }

  private pushScope() { this.declaredVars.push(new Set()); }
  private popScope() { this.declaredVars.pop(); }
  private isDeclared(name: string): boolean {
    for (let i = this.declaredVars.length - 1; i >= 0; i--) if (this.declaredVars[i].has(name)) return true;
    return false;
  }
  private declare(name: string) { this.declaredVars[this.declaredVars.length - 1].add(name); }

  private errorAt(message: string, line: number): NZSError {
    const sourceLine = this.sourceLines[line - 1] ?? "";
    return new NZSError(`${message}\n  --> line ${line}: ${sourceLine.trim()}`, line);
  }

  private parseStatement(): ASTNode | null {
    if (this.check(TokenType.ANIMATION)) return this.parseAnimation();
    if (this.check(TokenType.PLAY)) return this.parsePlay();
    if (this.check(TokenType.IMPORT)) {
      this.advance();
      const pathTok = this.consume(TokenType.STRING, "Expected file path after import");
      return { type: "ImportStatement", path: pathTok.value } as ImportStatement;
    }
    if (this.check(TokenType.DECORATOR) && this.peek().value === "@slash") {
      this.advance();
      if (this.match(TokenType.CMD)) return this.parseCmd(true);
    }
    if (this.check(TokenType.PRIVATE) && this.checkNext(TokenType.NODE)) { this.advance(); return this.parseNode(true); }
    if (this.match(TokenType.NODE)) {
      if (this.check(TokenType.ROOT)) { this.advance(); return this.parseRoot(); }
      return this.parseNode(false);
    }
    if (this.match(TokenType.DEF)) return this.parseDef(false);
    if (this.check(TokenType.PRIVATE)) { this.advance(); if (this.match(TokenType.DEF)) return this.parseDef(true); }
    if (this.match(TokenType.CMD)) return this.parseCmd(false);
    if (this.match(TokenType.SLASH)) return this.parseCmd(true);
    if (this.match(TokenType.ON)) return this.parseEvent();
    if (this.match(TokenType.USE)) return this.parseUse();
    if (this.match(TokenType.RETURN)) return this.parseReturn();
    if (this.match(TokenType.IF)) return this.parseIf();
    if (this.match(TokenType.FOR)) return this.parseFor();
    if (this.match(TokenType.WHILE)) return this.parseWhile();
    if (this.match(TokenType.BREAK)) return { type: "BreakStatement" } as BreakStatement;
    if (this.match(TokenType.CONTINUE)) return { type: "ContinueStatement" } as ContinueStatement;
    if (this.match(TokenType.LET)) return this.parseLet();
    // v0.1.0 — var declaration (usable anywhere)
    if (this.match(TokenType.VAR)) return this.parseVar();
    // v0.1.0 — m.@beginner / m.@normal
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "m" && this.checkNextType(TokenType.DOT)) {
      return this.parseModeStatement();
    }
    if (this.check(TokenType.TRY) || this.check(TokenType.ATTEMPT)) return this.parseTryCatch();
    if (this.check(TokenType.DM)) return this.parseDm();
    if (this.check(TokenType.ROLE)) return this.parseRole();
    if (this.check(TokenType.REACT)) return this.parseReact();
    return this.parseExpressionStatement();
  }

  // v0.1.0 — parse m.@beginner or m.@normal
  private parseModeStatement(): ModeStatement | null {
    this.advance(); // consume 'm'
    this.consume(TokenType.DOT, "Expected '.' after m");
    if (!this.check(TokenType.MODE)) return null;
    const modeTok = this.advance();
    const mode = modeTok.value === "@beginner" ? "beginner" : "normal";
    return { type: "ModeStatement", mode };
  }

  // v0.1.0 — parse var [type] name = value
  private parseVar(): VarStatement {
    let varType: string | null = null;
    // optional type keyword: int, str, bool, float
    if (this.check(TokenType.TYPE_INT) || this.check(TokenType.TYPE_STR) ||
        this.check(TokenType.TYPE_BOOL) || this.check(TokenType.TYPE_FLOAT)) {
      varType = this.advance().value;
    }
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name after var").value;
    this.consume(TokenType.EQUALS, "Expected '=' after variable name");
    const value = this.parseExpression();
    this.declare(name);
    return { type: "VarStatement", name, varType, value };
  }

  private parseNode(isPrivate: boolean): NodeDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Expected node name").value;
    let extendsName: string | undefined;
    if (this.match(TokenType.EXTENDS)) extendsName = this.consume(TokenType.IDENTIFIER, "Expected parent node name").value;
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope();
    const body = this.parseBlock();
    this.popScope();
    const embedKeys = ["title","description","color","footer","image","thumbnail","author","timestamp"];
    const buttonKeys = ["label","color","customId"];
    const assigns = body.filter(s => s.type === "AssignStatement") as AssignStatement[];
    const methods = body.filter(s => s.type === "DefDeclaration") as DefDeclaration[];
    const fields = body.filter(s => s.type === "FieldDeclaration");
    const options = body.filter(s => s.type === "OptionDeclaration");

    // v0.1.0 — detect if this is a vars node (only contains VarStatements and ModeStatements)
    const nonModeBody = body.filter(s => s.type !== "ModeStatement");
    const isVarsNode = name === "vars" || (nonModeBody.length > 0 && nonModeBody.every(s => s.type === "VarStatement"));

    const isEmbed = !isVarsNode && body.length > 0 && body.every(s =>
      (s.type === "AssignStatement" && embedKeys.includes((s as AssignStatement).name)) ||
      s.type === "FieldDeclaration"
    );
    const isButton = !isVarsNode && assigns.length > 0 && assigns.every(a => buttonKeys.includes(a.name)) && methods.some(m => m.name === "onClick");
    const isModal = !isVarsNode && body.some(s => s.type === "AssignStatement" && (s as AssignStatement).name === "title") && body.some(s => s.type === "FieldDeclaration" && (s as any)._isInput);
    const isSelect = !isVarsNode && body.some(s => s.type === "OptionDeclaration");

    // Extract node-level mode (m.@beginner / m.@normal)
    const modeStmt = body.find(s => s.type === "ModeStatement") as ModeStatement | undefined;
    const mode = modeStmt?.mode;

    // Extract node-level prefix
    const nodePrefixAssign = assigns.find(a => a.name === "prefix");
    let nodePrefix: string | string[] | undefined;
    if (nodePrefixAssign) {
      if (nodePrefixAssign.value.type === "Literal") nodePrefix = (nodePrefixAssign.value as Literal).value as string;
      else if (nodePrefixAssign.value.type === "ArrayLiteral") {
        nodePrefix = (nodePrefixAssign.value as ArrayLiteral).elements.map(e => (e as Literal).value as string);
      }
    }
    return { type: "NodeDeclaration", name, isPrivate, isEmbed, isButton, isModal, isSelect, isVarsNode, extends: extendsName, body, nodePrefix, mode };
  }

  private parseRoot(): RootDeclaration {
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope();
    const body = this.parseBlock();
    this.popScope();
    // Extract root-level mode
    const modeStmt = body.find(s => s.type === "ModeStatement") as ModeStatement | undefined;
    const mode = modeStmt?.mode;
    return { type: "RootDeclaration", body, mode };
  }

  private parseDef(isPrivate: boolean): DefDeclaration {
    const nameTok = this.peek();
    if (nameTok.type === TokenType.EOF || nameTok.type === TokenType.LPAREN) throw this.errorAt(`Expected method name`, nameTok.line);
    this.advance();
    const name = nameTok.value;
    this.consume(TokenType.LPAREN, "Expected '('");
    const params = this.parseParams();
    this.consume(TokenType.RPAREN, "Expected ')'");
    let returnType: string | undefined;
    if (this.match(TokenType.COLON)) returnType = this.consume(TokenType.IDENTIFIER, "Expected return type").value;
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope();
    for (const p of params) this.declare(p);
    const body = this.parseBlock();
    this.popScope();
    return { type: "DefDeclaration", name, isPrivate, params, returnType, body };
  }

  private parseCmd(isSlash: boolean): CmdDeclaration {
    const nameTok = this.peek();
    if (nameTok.type === TokenType.EOF || nameTok.type === TokenType.LBRACE || nameTok.type === TokenType.LPAREN)
      throw this.errorAt(`Expected command name`, nameTok.line);
    this.advance();
    const name = nameTok.value;
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
    return { type: "CmdDeclaration", name, params, body, isSlash, cmdPrefix, aliases };
  }

  private parseEvent(): EventDeclaration {
    const evTok = this.peek();
    if (evTok.type === TokenType.EOF || evTok.type === TokenType.LBRACE) throw this.errorAt(`Expected event name`, evTok.line);
    this.advance();
    const event = evTok.value;
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope();
    const body = this.parseBlock();
    this.popScope();
    return { type: "EventDeclaration", event, body };
  }

  private parseUse(): UseStatement {
    const name = this.consume(TokenType.IDENTIFIER, "Expected node name").value;
    return { type: "UseStatement", name };
  }

  private parseLet(): LetStatement {
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    this.consume(TokenType.EQUALS, "Expected '='");
    const value = this.parseExpression();
    this.declare(name);
    return { type: "LetStatement", name, value };
  }

  private parseReturn(): ReturnStatement {
    if (this.check(TokenType.RBRACE)) return { type: "ReturnStatement" };
    return { type: "ReturnStatement", value: this.parseExpression() };
  }

  private parseIf(): IfStatement {
    const condition = this.parseExpression();
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope(); const body = this.parseBlock(); this.popScope();

    const elseIfs: { condition: ASTNode; body: ASTNode[] }[] = [];
    let elseBody: ASTNode[] | undefined;

    while (this.match(TokenType.ELSE)) {
      if (this.match(TokenType.IF)) {
        const eiCond = this.parseExpression();
        this.consume(TokenType.LBRACE, "Expected '{'");
        this.pushScope(); const eiBody = this.parseBlock(); this.popScope();
        elseIfs.push({ condition: eiCond, body: eiBody });
      } else {
        this.consume(TokenType.LBRACE, "Expected '{'");
        this.pushScope(); elseBody = this.parseBlock(); this.popScope();
        break;
      }
    }
    return { type: "IfStatement", condition, body, elseIfs, elseBody };
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
      this.consume(TokenType.TO, "Expected 'to' after range start");
      const to = this.parseExpression();
      this.consume(TokenType.LBRACE, "Expected '{'");
      this.pushScope(); this.declare(varName); const body = this.parseBlock(); this.popScope();
      return { type: "ForRangeStatement", variable: varName, from, to, body };
    }
    throw this.errorAt(`Expected 'in' or 'from' after for variable`, this.peek().line);
  }

  private parseWhile(): WhileStatement {
    const condition = this.parseExpression();
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope(); const body = this.parseBlock(); this.popScope();
    return { type: "WhileStatement", condition, body };
  }

  private parseDm(): DmStatement {
    this.advance();
    const target = this.parseExpression();
    const message = this.parseExpression();
    return { type: "DmStatement", target, message };
  }

  private parseRole(): RoleStatement {
    this.advance();
    this.consume(TokenType.DOT, "Expected '.' after role");
    const actionToken = this.advance().value;
    if (actionToken !== "give" && actionToken !== "remove")
      throw this.errorAt(`Expected 'give' or 'remove' after role.`, this.previous().line);
    this.consume(TokenType.LPAREN, "Expected '('");
    const target = this.parseExpression();
    this.consume(TokenType.COMMA, "Expected ','");
    const role = this.parseExpression();
    this.consume(TokenType.RPAREN, "Expected ')'");
    return { type: "RoleStatement", action: actionToken as "give" | "remove", target, role };
  }

  private parseReact(): ReactStatement {
    this.advance();
    this.consume(TokenType.LPAREN, "Expected '(' after react");
    const emoji = this.parseExpression();
    this.consume(TokenType.RPAREN, "Expected ')'");
    return { type: "ReactStatement", emoji };
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

  private parseExpressionStatement(): ASTNode | null {
    // cooldown: 5s
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "cooldown" && this.checkNextType(TokenType.COLON)) {
      this.advance(); this.advance();
      return { type: "CooldownStatement", duration: this.advance().value } as CooldownStatement;
    }
    // wait: 2s
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "wait" && this.checkNextType(TokenType.COLON)) {
      this.advance(); this.advance();
      return { type: "WaitStatement", duration: this.advance().value } as WaitStatement;
    }
    // field { ... }
    if (this.check(TokenType.FIELD)) { this.advance(); return this.parseInlineField(false); }
    // input { ... }
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "input") { this.advance(); return this.parseInlineField(true); }
    // option { ... }
    if (this.check(TokenType.OPTION)) { this.advance(); return this.parseOption(); }
    // a.@permission
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "a" && this.checkNextType(TokenType.DOT)) {
      this.advance(); this.advance();
      return { type: "AccessStatement", level: this.advance().value } as AccessStatement;
    }
    // reply ephemeral "msg"
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "reply") {
      this.advance();
      if (this.check(TokenType.EPHEMERAL)) {
        this.advance();
        const msg = this.parseExpression();
        return { type: "EphemeralReply", message: msg } as EphemeralReply;
      }
      if (this.check(TokenType.IDENTIFIER) && this.peek().value === "embed" && this.checkNextType(TokenType.LBRACE)) {
        this.advance();
        this.consume(TokenType.LBRACE, "Expected '{'");
        const pairs: { key: string; value: ASTNode }[] = [];
        const fields: FieldDeclaration[] = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
          if (this.check(TokenType.FIELD)) { this.advance(); fields.push(this.parseInlineField()); }
          else {
            const key = this.consume(TokenType.IDENTIFIER, "Expected embed property").value;
            this.consume(TokenType.EQUALS, "Expected '='");
            pairs.push({ key, value: this.parseExpression() });
          }
        }
        this.consume(TokenType.RBRACE, "Expected '}'");
        const embedNode: EmbedLiteral = { type: "EmbedLiteral", pairs, fields };
        if (this.check(TokenType.WITH)) {
          this.advance();
          if (this.check(TokenType.BUTTON)) { this.advance(); return { type: "ReplyWithButton", message: embedNode, button: this.parseInlineButton() } as ReplyWithButton; }
          return { type: "ReplyWithButton", message: embedNode, button: this.consume(TokenType.IDENTIFIER, "Expected button node name").value } as ReplyWithButton;
        }
        return { type: "CallExpression", callee: { type: "Identifier", name: "reply" } as Identifier, args: [embedNode] } as CallExpression;
      }
      const arg = this.check(TokenType.LPAREN)
        ? (this.advance(), (() => { const e = this.parseExpression(); this.consume(TokenType.RPAREN, "Expected ')'"); return e; })())
        : this.parseExpression();
      if (this.check(TokenType.WITH)) {
        this.advance();
        if (this.check(TokenType.BUTTON)) { this.advance(); return { type: "ReplyWithButton", message: arg, button: this.parseInlineButton() } as ReplyWithButton; }
        return { type: "ReplyWithButton", message: arg, button: this.consume(TokenType.IDENTIFIER, "Expected button node name").value } as ReplyWithButton;
      }
      return { type: "CallExpression", callee: { type: "Identifier", name: "reply" } as Identifier, args: [arg] } as CallExpression;
    }
    // ctx.reply "msg"
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === "ctx" && this.checkNextType(TokenType.DOT)) {
      if (this.current + 2 < this.tokens.length && this.tokens[this.current + 2].value === "reply") {
        this.advance(); this.advance(); this.advance();
        const msg = this.parseExpression();
        return { type: "CtxReply", message: msg } as CtxReply;
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
    if (this.check(TokenType.EQUALS) || this.check(TokenType.PLUS_EQUALS) || this.check(TokenType.MINUS_EQUALS)) {
      const operator = this.advance().value;
      const value = this.parseExpression();
      if (expr.type === "Identifier") {
        const name = (expr as Identifier).name;
        const isDeclaration = !this.isDeclared(name);
        if (isDeclaration) this.declare(name);
        return { type: "AssignStatement", name, value, operator, isDeclaration } as AssignStatement;
      }
      // vars.x += value — MemberExpression assignment (e.g. vars.hp += 10)
      if (expr.type === "MemberExpression") {
        const m = expr as MemberExpression;
        return { type: "AssignStatement", name: `${(m.object as Identifier).name}.${m.property}`, value, operator, isDeclaration: false } as AssignStatement;
      }
    }
    return expr;
  }

  private parseTryCatch(): TryCatch {
    const kw = this.advance();
    const keyword = kw.type === TokenType.TRY ? "try" : "attempt";
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope(); const body = this.parseBlock(); this.popScope();
    if (!this.check(TokenType.CATCH) && !this.check(TokenType.FAIL) &&
        !(this.check(TokenType.IDENTIFIER) && (this.peek().value === "catch" || this.peek().value === "fail")))
      throw this.errorAt(`Expected 'catch' or 'fail' after try block`, kw.line);
    this.advance();
    this.consume(TokenType.LPAREN, "Expected '('");
    const catchVar = this.consume(TokenType.IDENTIFIER, "Expected error variable").value;
    this.consume(TokenType.RPAREN, "Expected ')'");
    this.consume(TokenType.LBRACE, "Expected '{'");
    this.pushScope(); this.declare(catchVar); const catchBody = this.parseBlock(); this.popScope();
    return { type: "TryCatch", keyword, body, catchVar, catchBody };
  }

  private parseBlock(): ASTNode[] {
    const stmts: ASTNode[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) { const s = this.parseStatement(); if (s) stmts.push(s); }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return stmts;
  }

  private parseParams(): string[] {
    const params: string[] = [];
    if (!this.check(TokenType.RPAREN)) {
      params.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name").value);
      while (this.match(TokenType.COMMA)) params.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name").value);
    }
    return params;
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
    if (this.match(TokenType.COLON)) paramType = this.consume(TokenType.IDENTIFIER, "Expected type").value;
    return { type: "ParamDeclaration", name, paramType };
  }

  private parseExpression(): ASTNode { return this.parseOr(); }

  private parseOr(): ASTNode {
    let left = this.parseAnd();
    while (this.check(TokenType.OR)) {
      this.advance(); left = { type: "BinaryExpression", left, operator: "||", right: this.parseAnd() } as BinaryExpression;
    }
    return left;
  }

  private parseAnd(): ASTNode {
    let left = this.parseNullCoalesce();
    while (this.check(TokenType.AND)) {
      this.advance(); left = { type: "BinaryExpression", left, operator: "&&", right: this.parseNullCoalesce() } as BinaryExpression;
    }
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
      const op = this.advance().value; left = { type: "BinaryExpression", left, operator: op, right: this.parseAddition() } as BinaryExpression;
    }
    return left;
  }

  private parseAddition(): ASTNode {
    let left = this.parseMultiplication();
    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
      const op = this.advance().value; left = { type: "BinaryExpression", left, operator: op, right: this.parseMultiplication() } as BinaryExpression;
    }
    return left;
  }

  private parseMultiplication(): ASTNode {
    let left = this.parseUnary();
    while (this.check(TokenType.STAR) || this.check(TokenType.SLASH_OP) || this.check(TokenType.PERCENT)) {
      const op = this.advance().value; left = { type: "BinaryExpression", left, operator: op, right: this.parseUnary() } as BinaryExpression;
    }
    return left;
  }

  private parseUnary(): ASTNode {
    if (this.match(TokenType.BANG)) {
      return { type: "BinaryExpression", left: { type: "Literal", value: null, raw: "null" } as Literal, operator: "!", right: this.parseUnary() } as BinaryExpression;
    }
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
        this.advance(); const args = this.parseArgs(); this.consume(TokenType.RPAREN, "Expected ')'");
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
    if (this.match(TokenType.LBRACE)) return this.parseMap();
    if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.ROOT)) return { type: "Identifier", name: this.advance().value } as Identifier;
    const token = this.peek();
    throw this.errorAt(`Unexpected token '${token.value}' (${token.type})`, token.line);
  }

  private parseArray(): ArrayLiteral {
    const elements: ASTNode[] = [];
    if (!this.check(TokenType.RBRACKET)) { elements.push(this.parseExpression()); while (this.match(TokenType.COMMA)) elements.push(this.parseExpression()); }
    this.consume(TokenType.RBRACKET, "Expected ']'");
    return { type: "ArrayLiteral", elements };
  }

  private parseMap(): MapLiteral {
    const pairs: { key: string; value: ASTNode }[] = [];
    if (!this.check(TokenType.RBRACE)) {
      const key = this.consume(TokenType.IDENTIFIER, "Expected key").value;
      this.consume(TokenType.COLON, "Expected ':'");
      pairs.push({ key, value: this.parseExpression() });
      while (this.match(TokenType.COMMA)) {
        const k = this.consume(TokenType.IDENTIFIER, "Expected key").value;
        this.consume(TokenType.COLON, "Expected ':'");
        pairs.push({ key: k, value: this.parseExpression() });
      }
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: "MapLiteral", pairs };
  }

  private parseArgs(): ASTNode[] {
    const args: ASTNode[] = [];
    if (!this.check(TokenType.RPAREN)) { args.push(this.parseExpression()); while (this.match(TokenType.COMMA)) args.push(this.parseExpression()); }
    return args;
  }

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
    const token = this.peek();
    throw this.errorAt(`${message}, got '${token.value}'`, token.line);
  }
  private previous(): Token { return this.tokens[this.current - 1]; }
  private peek(): Token { return this.tokens[this.current]; }
  private isAtEnd(): boolean { return this.peek().type === TokenType.EOF; }

  // ── Animation Parsing ──────────────────────────────────────────────────────

  private parseAnimation(): AnimationDeclaration {
    this.advance(); // consume 'animation'
    const name = this.consume(TokenType.IDENTIFIER, "Expected animation name").value;
    this.consume(TokenType.LBRACE, "Expected '{'");

    let canvasWidth = 5, canvasHeight = 5;
    let background = "⬛";
    let fps = 2;
    let loop = false;
    const sprites: SpriteDeclaration[] = [];
    const keyframes: KeyframeDeclaration[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      // canvas = 6x6
      if (this.check(TokenType.CANVAS)) {
        this.advance();
        this.consume(TokenType.EQUALS, "Expected '='");
        const size = this.consume(TokenType.CANVAS_SIZE, "Expected canvas size like 6x6").value;
        const [w, h] = size.split("x").map(Number);
        canvasWidth = w; canvasHeight = h;
      }
      // background = "⬛"
      else if (this.check(TokenType.IDENTIFIER) && this.peek().value === "background") {
        this.advance();
        this.consume(TokenType.EQUALS, "Expected '='");
        background = this.consume(TokenType.STRING, "Expected background emoji").value;
      }
      // fps = 3
      else if (this.check(TokenType.FPS)) {
        this.advance();
        this.consume(TokenType.EQUALS, "Expected '='");
        fps = parseFloat(this.consume(TokenType.NUMBER, "Expected fps number").value);
      }
      // loop = true/false
      else if (this.check(TokenType.LOOP)) {
        this.advance();
        this.consume(TokenType.EQUALS, "Expected '='");
        loop = this.consume(TokenType.BOOLEAN, "Expected true or false").value === "true";
      }
      // sprite name = ...
      else if (this.check(TokenType.SPRITE)) {
        sprites.push(this.parseSprite());
      }
      // keyframe 0 { ... }
      else if (this.check(TokenType.KEYFRAME)) {
        keyframes.push(this.parseKeyframe());
      }
      else { this.advance(); }
    }

    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: "AnimationDeclaration", name, canvasWidth, canvasHeight, background, fps, loop, sprites, keyframes };
  }

  private parseSprite(): SpriteDeclaration {
    this.advance(); // consume 'sprite'
    const name = this.consume(TokenType.IDENTIFIER, "Expected sprite name").value;
    this.consume(TokenType.EQUALS, "Expected '='");

    const cells: SpriteCell[] = [];

    if (this.check(TokenType.STRING)) {
      // sprite line = "🟦" fill row 0  OR  sprite dot = "🟥" at 2,3
      const emoji = this.consume(TokenType.STRING, "Expected emoji").value;
      if (this.check(TokenType.FILL)) {
        this.advance(); // consume 'fill'
        if (this.check(TokenType.ROW)) {
          this.advance();
          const rowNum = parseFloat(this.consume(TokenType.NUMBER, "Expected row number").value);
          cells.push({ emoji, fillRow: rowNum });
        } else if (this.check(TokenType.COL)) {
          this.advance();
          const colNum = parseFloat(this.consume(TokenType.NUMBER, "Expected col number").value);
          cells.push({ emoji, fillCol: colNum });
        }
      } else if (this.check(TokenType.IDENTIFIER) && this.peek().value === "at") {
        this.advance(); // consume 'at'
        const x = parseFloat(this.consume(TokenType.NUMBER, "Expected x position").value);
        this.consume(TokenType.COMMA, "Expected ','");
        const y = parseFloat(this.consume(TokenType.NUMBER, "Expected y position").value);
        cells.push({ emoji, row: x, col: y });
      }
    } else if (this.check(TokenType.LBRACKET)) {
      // sprite name = [ "🟥" at 0,0  "🟥" at 1,1 ... ]
      this.advance();
      while (!this.check(TokenType.RBRACKET) && !this.isAtEnd()) {
        const emoji = this.consume(TokenType.STRING, "Expected emoji").value;
        if (this.check(TokenType.FILL)) {
          this.advance();
          if (this.check(TokenType.ROW)) {
            this.advance();
            const rowNum = parseFloat(this.consume(TokenType.NUMBER, "Expected row number").value);
            cells.push({ emoji, fillRow: rowNum });
          } else if (this.check(TokenType.COL)) {
            this.advance();
            const colNum = parseFloat(this.consume(TokenType.NUMBER, "Expected col number").value);
            cells.push({ emoji, fillCol: colNum });
          }
        } else if (this.check(TokenType.IDENTIFIER) && this.peek().value === "at") {
          this.advance();
          const x = parseFloat(this.consume(TokenType.NUMBER, "Expected x position").value);
          this.consume(TokenType.COMMA, "Expected ','");
          const y = parseFloat(this.consume(TokenType.NUMBER, "Expected y position").value);
          cells.push({ emoji, row: x, col: y });
        }
        if (this.check(TokenType.COMMA)) this.advance();
      }
      this.consume(TokenType.RBRACKET, "Expected ']'");
    }

    return { type: "SpriteDeclaration", name, cells };
  }

  private parseKeyframe(): KeyframeDeclaration {
    this.advance(); // consume 'keyframe'
    const index = parseFloat(this.consume(TokenType.NUMBER, "Expected keyframe number").value);
    this.consume(TokenType.LBRACE, "Expected '{'");

    const actions: KeyframeSpriteAction[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      // clear spriteName
      if (this.check(TokenType.CLEAR)) {
        this.advance();
        const clearName = this.consume(TokenType.IDENTIFIER, "Expected sprite name after clear").value;
        actions.push({ spriteName: clearName, clear: true });
        continue;
      }
      const spriteName = this.consume(TokenType.IDENTIFIER, "Expected sprite name").value;

      if (this.check(TokenType.STAYS)) {
        this.advance();
        actions.push({ spriteName, stays: true });
      } else if (this.check(TokenType.STAYS)) {
        this.advance();
        actions.push({ spriteName, stays: true });
      } else if (this.check(TokenType.FILL)) {
        this.advance();
        if (this.check(TokenType.ROW)) {
          this.advance();
          const rowNum = parseFloat(this.consume(TokenType.NUMBER, "Expected row number").value);
          actions.push({ spriteName, fillRow: rowNum });
        } else if (this.check(TokenType.COL)) {
          this.advance();
          const colNum = parseFloat(this.consume(TokenType.NUMBER, "Expected col number").value);
          actions.push({ spriteName, fillCol: colNum });
        }
      } else if (this.check(TokenType.IDENTIFIER) && this.peek().value === "at") {
        this.advance();
        const x = parseFloat(this.consume(TokenType.NUMBER, "Expected x position").value);
        this.consume(TokenType.COMMA, "Expected ','");
        const y = parseFloat(this.consume(TokenType.NUMBER, "Expected y position").value);
        actions.push({ spriteName, x, y });
      } else {
        this.advance();
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: "KeyframeDeclaration", index, actions };
  }

  private parsePlay(): PlayStatement {
    this.advance(); // consume 'play'
    const animationName = this.consume(TokenType.IDENTIFIER, "Expected animation name").value;
    return { type: "PlayStatement", animationName };
  }

}

// ── Animation AST Nodes ─────────────────────────────────────────────────────

export interface SpriteCell {
  emoji: string;
  row?: number;
  col?: number;
  fillRow?: number;
  fillCol?: number;
}

export interface SpriteDeclaration extends ASTNode {
  type: "SpriteDeclaration";
  name: string;
  cells: SpriteCell[];
}

export interface KeyframeSpriteAction {
  spriteName: string;
  fillRow?: number;
  fillCol?: number;
  x?: number;
  y?: number;
  stays?: boolean;
  clear?: boolean;
}

export interface KeyframeDeclaration extends ASTNode {
  type: "KeyframeDeclaration";
  index: number;
  actions: KeyframeSpriteAction[];
}

export interface AnimationDeclaration extends ASTNode {
  type: "AnimationDeclaration";
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  background: string;
  fps: number;
  loop: boolean;
  sprites: SpriteDeclaration[];
  keyframes: KeyframeDeclaration[];
}

export interface PlayStatement extends ASTNode {
  type: "PlayStatement";
  animationName: string;
}

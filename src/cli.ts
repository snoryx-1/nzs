#!/usr/bin/env node

import { program } from "commander";
import * as fs from "fs";
import * as path from "path";
import { execSync, spawn } from "child_process";
import { Lexer } from "./lexer";
import { NZSError, formatError, formatWarning, formatInfo } from "./errors";
import { Parser } from "./parser";
import { Transpiler } from "./transpiler";

const VERSION = "v0.1.0";

function compile(filePath: string): string {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(formatError(new NZSError(`File not found: ${filePath}`, 0), "", filePath));
    process.exit(1);
  }

  const source = fs.readFileSync(absPath, "utf-8");

  try {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens, source);
    const ast = parser.parse();
    const transpiler = new Transpiler();
    return transpiler.transpile(ast, absPath);
  } catch (err: any) {
    // v0.1.0 — beginner-friendly error messages
    const raw: string = err?.message ?? String(err);
    const friendlyMsg = makeBeginnerFriendly(raw, source);
    console.error(formatError(new NZSError(friendlyMsg, err?.line ?? 0), source, filePath));
    process.exit(1);
  }
}

// v0.1.0 — translate cryptic parser errors into plain English
function makeBeginnerFriendly(message: string, source: string): string {
  if (message.includes("Expected '='") && message.includes("var")) {
    return `Missing '=' in variable declaration.\n  Tip: use  var int hp = 100`;
  }
  if (message.includes("Expected variable name after var")) {
    return `You wrote 'var' but forgot the variable name.\n  Tip: var int hp = 100`;
  }
  if (message.includes("Unexpected token") && message.includes("@")) {
    return `Unknown decorator or permission flag.\n  Tip: try  m.@beginner  or  a.@everyone`;
  }
  if (message.includes("Expected '{'")) {
    return `Missing opening brace '{'.\n  Tip: every node, cmd, and block needs  { ... }`;
  }
  if (message.includes("Expected '}'")) {
    return `Missing closing brace '}'.\n  Tip: make sure every  {  has a matching  }`;
  }
  if (message.includes("Expected node name")) {
    return `Missing name after 'node'.\n  Tip:  node rpg { ... }`;
  }
  if (message.includes("Expected command name")) {
    return `Missing name after 'cmd'.\n  Tip:  cmd fight() { ... }`;
  }
  if (message.includes("File not found")) {
    return message; // already clear
  }
  return message;
}

function scaffoldProject(dir: string, name: string): void {
  const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });

  // v0.1.0 — scaffold includes a beginner-mode example with node vars
  const mainNzs = `node root {
    token = env.TOKEN
    prefix = "!"
    clientId = env.CLIENT_ID
    m.@beginner

    on ready {
        log "${name} is online!"
    }

    cmd ping() {
        a.@everyone
        reply "Pong!"
    }

    slash ping() {
        reply ephemeral "Pong!"
    }
}
`;

  const envFile = `TOKEN=your_discord_bot_token_here\nCLIENT_ID=your_application_client_id_here`;
  const gitignore = `node_modules/\ndist/\n.env\n.nzs_output.js\n.nzs_db.json\n*.js.map\ntests/out.js`;
  const configFile = `name = "${name}"\nversion = "1.0.0"\nauthor = ""\nmain = "main.nzs"\ndiscord_version = "latest"`;
  const readme = `# ${name}\n\nBuilt with NizumoScript ${VERSION}\n\n## Setup\n\n1. Add your bot token and client ID to \`.env\`\n2. Run \`nzs run main.nzs\`\n\n## Commands\n\n- \`!ping\` — Replies with Pong!\n\n## Beginner Mode\n\nThis project uses \`m.@beginner\` mode. You can declare typed variables anywhere:\n\n\`\`\`\nvar int hp = 100\nvar str name = "Hero"\n\`\`\`\n\nAnd use \`node vars { }\` for persistent per-user data:\n\n\`\`\`\nnode rpg {\n    node vars {\n        var int hp = 100\n        var int gold = 0\n    }\n    cmd stats() {\n        use vars\n        reply "HP: {vars.hp} | Gold: {vars.gold}"\n    }\n}\n\`\`\`\n`;

  fs.writeFileSync(path.join(dir, "main.nzs"), mainNzs);
  fs.writeFileSync(path.join(dir, ".env"), envFile);
  fs.writeFileSync(path.join(dir, ".gitignore"), gitignore);
  fs.writeFileSync(path.join(dir, "nzs.config"), configFile);
  fs.writeFileSync(path.join(dir, "README.md"), readme);
  fs.mkdirSync(path.join(dir, "nodes"), { recursive: true });

  console.log(`[NZS | ${now()} | INFO] Installing dependencies...`);
  try {
    execSync("npm init -y", { stdio: "ignore", cwd: dir });
    execSync("npm install discord.js dotenv", { stdio: "inherit", cwd: dir });
    console.log(`[NZS | ${now()} | INFO] Dependencies installed successfully!`);
  } catch (err: any) {
    console.log(`[NZS | ${now()} | WARN] Could not install dependencies. Run: npm install discord.js dotenv`);
  }
}

program
  .name("nzs")
  .description("NizumoScript CLI")
  .version(VERSION);

// nzs run <file>
program
  .command("run <file>")
  .description("Run a NizumoScript bot")
  .action((file: string) => {
    const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    console.log(`[NZS | ${now()} | INFO] Compiling ${file}...`);
    const js = compile(file);

    const tmpFile = path.resolve(".nzs_output.js");
    fs.writeFileSync(tmpFile, js);

    console.log(`[NZS | ${now()} | INFO] Starting bot...`);

    const child = spawn("node", [tmpFile], { stdio: "inherit" });

    child.on("close", (code) => {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      if (code !== 0) {
        console.error(`[NZS | ${now()} | ERROR] Bot exited with code ${code}`);
      }
    });

    process.on("SIGINT", () => {
      console.log(`\n[NZS | ${now()} | INFO] Shutting down...`);
      child.kill();
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      process.exit(0);
    });
  });

// nzs build <file>
program
  .command("build <file>")
  .description("Transpile a NizumoScript file to JavaScript")
  .option("-o, --output <output>", "Output file path")
  .action((file: string, options: any) => {
    const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    console.log(`[NZS | ${now()} | INFO] Building ${file}...`);
    const js = compile(file);
    const outFile = options.output || file.replace(".nzs", ".js");
    fs.writeFileSync(outFile, js);
    console.log(`[NZS | ${now()} | INFO] Built successfully → ${outFile}`);
  });

// nzs check <file>
program
  .command("check <file>")
  .description("Check a NizumoScript file for errors without running")
  .action((file: string) => {
    const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    console.log(`[NZS | ${now()} | INFO] Checking ${file}...`);

    const absPath = path.resolve(file);
    if (!fs.existsSync(absPath)) {
      console.error(`[NZS | ${now()} | ERROR] File not found: ${file}`);
      process.exit(1);
    }

    const source = fs.readFileSync(absPath, "utf-8");

    try {
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens, source);
      parser.parse();
      console.log(`[NZS | ${now()} | INFO] No errors found in ${file}`);
    } catch (err: any) {
      const raw: string = err?.message ?? String(err);
      const friendlyMsg = makeBeginnerFriendly(raw, source);
      console.error(formatError(new NZSError(friendlyMsg, err?.line ?? 0), source, file));
      process.exit(1);
    }
  });

// nzs new <name>
program
  .command("new <name>")
  .description("Create a new NizumoScript project in a new folder")
  .action((name: string) => {
    const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    const dir = path.resolve(name);

    if (fs.existsSync(dir)) {
      console.error(`[NZS | ${now()} | ERROR] Directory '${name}' already exists.`);
      process.exit(1);
    }

    console.log(`[NZS | ${now()} | INFO] Creating project '${name}'...`);
    fs.mkdirSync(dir, { recursive: true });

    scaffoldProject(dir, name);

    console.log(`[NZS | ${now()} | INFO] Project '${name}' created successfully!`);
    console.log(`[NZS | ${now()} | INFO] Next steps:`);
    console.log(`  cd ${name}`);
    console.log(`  # Add your bot token to .env`);
    console.log(`  nzs run main.nzs`);
  });

// nzs init
program
  .command("init")
  .description("Initialize a NizumoScript project in the current directory")
  .action(() => {
    const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    const name = path.basename(process.cwd());
    console.log(`[NZS | ${now()} | INFO] Initializing NizumoScript project...`);

    scaffoldProject(process.cwd(), name);

    console.log(`[NZS | ${now()} | INFO] Project created successfully!`);
    console.log(`[NZS | ${now()} | INFO] Add your bot token to .env and run: nzs run main.nzs`);
  });

// nzs watch <file>
program
  .command("watch <file>")
  .description("Run bot with hot reload on file save")
  .action((file: string) => {
    const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    console.log(`[NZS | ${now()} | INFO] Watching ${file} for changes...`);

    let child: any = null;
    const tmpFile = path.resolve(".nzs_output.js");

    const start = () => {
      if (child) child.kill();
      try {
        const js = compile(file);
        fs.writeFileSync(tmpFile, js);
        child = spawn("node", [tmpFile], { stdio: "inherit" });
        console.log(`[NZS | ${now()} | INFO] Bot started.`);
      } catch (err: any) {
        console.error(`[NZS | ${now()} | ERROR] ${err.message}`);
      }
    };

    start();

    let watcher: fs.FSWatcher | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      watcher = fs.watch(path.resolve(file), () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log(`[NZS | ${now()} | INFO] File changed, restarting...`);
          start();
        }, 200);
      });
    } catch {
      console.log(`[NZS | ${now()} | WARN] fs.watch unavailable, falling back to polling...`);
      fs.watchFile(path.resolve(file), { interval: 500 }, () => {
        console.log(`[NZS | ${now()} | INFO] File changed, restarting...`);
        start();
      });
    }

    process.on("SIGINT", () => {
      console.log(`\n[NZS | ${now()} | INFO] Stopping watcher...`);
      if (child) child.kill();
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      if (watcher) watcher.close();
      else fs.unwatchFile(path.resolve(file));
      process.exit(0);
    });
  });

// nzs add <package>
program
  .command("add <package>")
  .description("Add a package from npm")
  .action((pkg: string) => {
    const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    console.log(`[NZS | ${now()} | INFO] Installing ${pkg}...`);
    try {
      execSync(`npm install ${pkg}`, { stdio: "inherit" });
      console.log(`[NZS | ${now()} | INFO] ${pkg} installed successfully!`);
    } catch (err: any) {
      console.error(`[NZS | ${now()} | ERROR] Failed to install ${pkg}`);
    }
  });

// nzs remove <package>
program
  .command("remove <package>")
  .description("Remove a package")
  .action((pkg: string) => {
    const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    console.log(`[NZS | ${now()} | INFO] Removing ${pkg}...`);
    try {
      execSync(`npm uninstall ${pkg}`, { stdio: "inherit" });
      console.log(`[NZS | ${now()} | INFO] ${pkg} removed successfully!`);
    } catch (err: any) {
      console.error(`[NZS | ${now()} | ERROR] Failed to remove ${pkg}`);
    }
  });

// nzs update
program
  .command("update")
  .description("Update NizumoScript")
  .action(() => {
    const now = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    console.log(`[NZS | ${now()} | INFO] Updating NizumoScript...`);
    try {
      execSync(`npm install -g nizumoscript`, { stdio: "inherit" });
      console.log(`[NZS | ${now()} | INFO] NizumoScript updated successfully!`);
    } catch (err: any) {
      console.error(`[NZS | ${now()} | ERROR] Failed to update NizumoScript`);
    }
  });

// nzs version
program
  .command("version")
  .description("Show NizumoScript version")
  .action(() => {
    console.log(`NizumoScript ${VERSION}`);
  });

program.parse(process.argv);

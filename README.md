# NizumoScript

A node-based programming language purpose-built for Discord bots.  
Write clean, expressive bots without touching JavaScript or Discord.js.

```nzs
node root {
    token = env.TOKEN
    prefix = "!"
    m.@beginner

    on ready {
        log "Bot is online!"
    }

    cmd ping() {
        a.@everyone
        cooldown: 5s
        reply "Pong!"
    }

    slash hello() {
        reply "Hello from a slash command!"
    }
}
```

---

## Install

```bash
npm install -g nizumoscript
```

---

## Quick Start

```bash
nzs new mybot
cd mybot
# Add your bot token to .env
nzs run main.nzs
```

---

## What's New in v0.1.5 — Animation System

NizumoScript now has a built-in Discord animation system. Create frame-by-frame emoji grid animations that play directly in Discord messages — no GIFs, no external tools, just NZS code.

### How It Works

The bot sends a message with an emoji grid, then edits it frame by frame to create the illusion of movement. Each `keyframe` defines what the grid looks like at that moment.

### Basic Example

```nzs
animation ScanLine {
    canvas = 5x5
    background = "⬛"
    fps = 2
    loop = true

    sprite line = "🟥" fill row 0

    keyframe 0 { line fill row 0 }
    keyframe 1 { line fill row 1 }
    keyframe 2 { line fill row 2 }
    keyframe 3 { line fill row 3 }
    keyframe 4 { line fill row 4 }
}

node root {
    token = env.TOKEN
    prefix = "!"

    on ready { log "Online!" }

    cmd animate() {
        play ScanLine
    }
}
```

### Canvas

Define the grid size:

```nzs
canvas = 6x6   // width x height
background = "⬛"
fps = 2
loop = false
```

> **Note:** Keep fps at 2-3. Discord rate limits message edits to ~5 per 5 seconds. Anything above 5 fps will cause rate limit errors.

### Sprites

Three ways to define a sprite:

**Fill entire row:**
```nzs
sprite topLine = "🟦" fill row 0
```

**Fill entire column:**
```nzs
sprite leftLine = "🟩" fill col 0
```

**Exact cell positions (full control — diagonals, shapes, anything):**
```nzs
sprite diagonal = [
    "🟥" at 0,0
    "🟥" at 1,1
    "🟥" at 2,2
    "🟥" at 3,3
    "🟥" at 4,4
]
```

### Keyframes

Each keyframe defines where sprites are at that step:

```nzs
keyframe 0 {
    topLine fill row 0
    leftLine fill col 0
}
keyframe 1 {
    topLine fill row 1
    leftLine fill col 1
}
```

### Clearing Sprites

Use `clear` to remove a sprite from the grid in a keyframe — the background shows through:

```nzs
keyframe 3 {
    clear topLine
    clear bottomLine
    leftLine fill col 2
}
```

### Staying in Place

Use `stays` to keep a sprite where it was without redefining its position:

```nzs
keyframe 2 {
    hero stays
    enemy fill col 3
}
```

### Playing an Animation

```nzs
cmd battle() {
    play BattleOpening
}
```

### Full Battle Opening Example

```nzs
animation BattleOpening {
    canvas = 6x6
    background = "⬛"
    fps = 2
    loop = false

    sprite topLine = "🟦" fill row 0
    sprite bottomLine = "🟦" fill row 5
    sprite leftLine = "🟩" fill col 0
    sprite rightLine = "🟩" fill col 5

    keyframe 0 {
        topLine fill row 0
        bottomLine fill row 5
    }
    keyframe 1 {
        topLine fill row 1
        bottomLine fill row 4
    }
    keyframe 2 {
        topLine fill row 2
        bottomLine fill row 3
    }
    keyframe 3 {
        clear topLine
        clear bottomLine
        leftLine fill col 0
        rightLine fill col 5
    }
    keyframe 4 {
        leftLine fill col 1
        rightLine fill col 4
    }
    keyframe 5 {
        leftLine fill col 2
        rightLine fill col 3
    }
}

node root {
    token = env.TOKEN
    prefix = "!"
    on ready { log "Bot online!" }
    cmd battle() { play BattleOpening }
}
```

---

## What's New in v0.1.0 — Beginner Mode

### `m.@beginner` / `m.@normal`

Declare a mode on `node root` (or any node) to enable simplified syntax:

```nzs
node root {
    token = env.TOKEN
    prefix = "!"
    m.@beginner
}
```

### `var` — Typed Variable Declarations

```nzs
var int hp = 100
var str name = "Hero"
var float damage = 4.5
var bool alive = true
```

### `node vars` — Auto-Persisted Per-User Data

```nzs
node vars {
    var int hp = 100
    var int gold = 0
    var str title = "Novice"
}

node root {
    token = env.TOKEN
    prefix = "!"
    m.@beginner
    use vars

    cmd stats() {
        reply "HP: {vars.hp} | Gold: {vars.gold} | Title: {vars.title}"
    }

    cmd fight() {
        var int damage = 10
        var int reward = 25
        vars.hp -= damage
        vars.gold += reward
        reply "Fought! HP: {vars.hp} | Gold: {vars.gold}"
    }
}
```

---

## CLI

| Command | Description |
|---|---|
| `nzs new <name>` | Create a new project in a new folder |
| `nzs init` | Initialize a project in current folder |
| `nzs run <file>` | Run your bot |
| `nzs build <file>` | Transpile to JavaScript |
| `nzs check <file>` | Check for errors without running |
| `nzs watch <file>` | Run with hot reload on save |
| `nzs add <package>` | Install an npm package |
| `nzs remove <package>` | Remove an npm package |
| `nzs update` | Update NizumoScript |
| `nzs version` | Show version |

---

## The Node System

Everything in NizumoScript is a **node** — a self-contained, reusable block of logic or UI.

```nzs
node Economy {
    def getBalance(userId) {
        return db.get("bal_{userId}") ?? 100
    }

    def addBalance(userId, amount) {
        let current = Economy.getBalance(userId)
        db.set("bal_{userId}", current + amount)
    }
}

node root {
    token = env.TOKEN
    prefix = "!"
    use Economy

    cmd balance() {
        let bal = Economy.getBalance(ctx.user.id)
        reply "Your balance is {bal} coins."
    }
}
```

---

## Commands

### Prefix Commands
```nzs
cmd ban(user, reason) {
    a.@mod
    cooldown: 10s
    reply "Banned {user} for {reason}"
}
```

### Slash Commands
```nzs
slash ban(user, reason) {
    a.@mod
    reply "Banned {user} for {reason}"
}
```

### Permissions

| Level | Who |
|---|---|
| `a.@everyone` | All users |
| `a.@mod` | Members with Moderate Members permission |
| `a.@admin` | Administrators only |

### Cooldowns
```nzs
cmd daily() {
    cooldown: 24h
    reply "Daily reward!"
}
```

---

## Events

```nzs
on ready { log "Bot online!" }
on message { }
on join { dm user "Welcome!" }
on leave { }
on reaction { }
on ban { }
on unban { }
on voiceJoin { }
on voiceLeave { }
```

---

## Embeds

```nzs
node WelcomeEmbed {
    title = "Welcome!"
    description = "Glad you joined"
    color = "#5865F2"
    footer = "My Bot"
    timestamp = true

    field {
        name = "Rules"
        value = "Be respectful"
        inline = true
    }
}

cmd welcome() {
    reply WelcomeEmbed
}
```

---

## Buttons

```nzs
cmd ask() {
    reply "Are you sure?" with button {
        label = "Confirm"
        color = "success"
        onClick {
            reply "Confirmed!"
        }
    }
}
```

---

## Built-in Database

```nzs
db.set("key", value)
let val = db.get("key")
db.delete("key")
db.increment("coins_123", 100)
db.decrement("lives_123", 1)
```

---

## Built-in Functions

| Function | Description |
|---|---|
| `reply "msg"` | Reply in current channel |
| `reply ephemeral "msg"` | Ephemeral reply (slash only) |
| `ctx.reply "msg"` | Ping reply mentioning the user |
| `dm user "msg"` | Send a direct message |
| `log "msg"` | Log to console |
| `react("emoji")` | React to the message |
| `wait: 2s` | Pause execution |
| `random(min, max)` | Random integer |
| `fetch(url)` | Fetch JSON from an API |
| `role.give(user, "Role")` | Give a role |
| `role.remove(user, "Role")` | Remove a role |
| `play AnimationName` | Play an animation |

---

## How It Works

```
your-bot.nzs → NizumoScript Compiler → JavaScript → Discord.js → Discord
```

---

## License

MIT

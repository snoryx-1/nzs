# NizumoScript

A node-based programming language purpose-built for Discord bots.
Write clean, powerful bots without touching JavaScript or Discord.js.

```nzs
node vars {
    var int hp = 100
    var int gold = 0
}

node commands {
    cmd fight() {
        var int damage = random(10, 30)
        vars.hp -= damage
        vars.gold += 25
        reply "Fought! HP: {vars.hp} | Gold: {vars.gold}"
    }
}

node root {
    token = env.TOKEN
    prefix = "!"
    use vars
    use commands
    on ready { log "Bot online!" }
}
```

---

## Install

```bash
npm install -g nizumoscript
```

## Quick Start

```bash
nzs new mybot
cd mybot
# Add token to .env
nzs run main.nzs
```

---

## What's New in v0.2.0 — Full Flexibility

### Any Structure You Want

NZS no longer forces a rigid layout. Commands, events, embeds — put them anywhere.

```nzs
// Flat style
node PlayerEmbed { title = "Player Stats" color = "#3498db" }
node root { cmd stats() { reply PlayerEmbed } }

// Grouped style
node commands {
    cmd stats() { ... }
    cmd fight() { ... }
}
node root { use commands }

// Fully nested
node root {
    node vars { var int hp = 100 }
    node commands { cmd fight() { ... } }
}

// Any absurd structure — it all works
node game {
    node ui { node embeds { node StatsEmbed { title = "Stats" } } }
    node logic { cmd fight() { ... } }
}
```

### Pattern Matching

```nzs
match vars.class {
    when "Warrior" { reply "You are strong!" }
    when "Mage" { reply "You cast spells!" }
    default { reply "Unknown class" }
}
```

### Ternary Expressions

```nzs
let status = vars.hp > 50 ? "Healthy" : "Low HP"
reply "Status: {status}"
```

### Scheduled Tasks

```nzs
every 24h {
    log "Daily reset running..."
    // reset all player data
}
```

### Custom Events

```nzs
emit playerDied(ctx.user.id)

on playerDied {
    log "Player died!"
}
```

### Arrays as First Class

```nzs
let items = ["sword", "shield", "potion"]
items.push("bow")
let count = items.length()
let hasPotion = items.includes("potion")
reply "Items: {items.join(', ')}"
```

### New Operators

```nzs
vars.gold *= 2
vars.hp /= 2
```

---

## v0.1.5 — Animation System

Create frame-by-frame emoji grid animations:

```nzs
animation BattleOpening {
    canvas = 6x6
    background = "⬛"
    fps = 2
    loop = false

    sprite topLine = "🟦" fill row 0
    sprite leftLine = "🟩" fill col 0

    keyframe 0 { topLine fill row 0 }
    keyframe 1 { topLine fill row 1 }
    keyframe 2 {
        clear topLine
        leftLine fill col 0
    }
}

cmd battle() { play BattleOpening }
```

**Sprite types:** `fill row N`, `fill col N`, or `["emoji" at R,C ...]` for exact cells
**Keywords:** `clear spriteName`, `stays spriteName`, `loop = true/false`
**Max safe fps:** 2-3 (Discord rate limits)

---

## v0.1.0 — Beginner Mode

```nzs
node vars {
    var int hp = 100
    var str name = "Hero"
    var float damage = 4.5
    var bool alive = true
}

node root {
    m.@beginner
    use vars

    cmd stats() {
        reply "HP: {vars.hp} | Name: {vars.name}"
    }

    cmd fight() {
        vars.hp -= 10
        vars.gold += 25
        reply "HP: {vars.hp}"
    }
}
```

---

## CLI

| Command | Description |
|---|---|
| `nzs new <name>` | Create new project |
| `nzs init` | Init in current folder |
| `nzs run <file>` | Run your bot |
| `nzs build <file>` | Compile to JS |
| `nzs check <file>` | Check for errors |
| `nzs watch <file>` | Hot reload on save |
| `nzs add <pkg>` | Install npm package |
| `nzs update` | Update NizumoScript |

---

## Commands

```nzs
// Prefix command
cmd ban(user, reason) {
    a.@mod
    cooldown: 10s
    reply "Banned {user}"
}

// Slash command
slash ping() {
    reply ephemeral "Pong!"
}

// Aliases
cmd balance() {
    alias = ["bal", "b"]
    reply "Balance: {vars.gold}"
}

// Custom prefix
cmd shop() {
    prefix = "$"
    reply "Welcome to the shop!"
}
```

## Permissions

| Level | Who |
|---|---|
| `a.@everyone` | All users |
| `a.@mod` | Moderators |
| `a.@admin` | Administrators |

---

## Events

```nzs
on ready { log "Online!" }
on message { }
on join { dm user "Welcome!" }
on leave { }
on reaction { }
on ban { }
on voiceJoin { }
on voiceLeave { }
```

---

## Embeds

```nzs
node StatsEmbed {
    title = "Player Stats"
    color = "#3498db"
    footer = "Use .help for commands"
    timestamp = true
    field { name = "HP" value = "100" inline = true }
    field { name = "Gold" value = "0" inline = true }
}

cmd stats() { reply StatsEmbed }

// Inline embed
cmd info() {
    reply embed {
        title = "Info"
        description = "Hello {ctx.user.username}!"
        color = "#2ecc71"
    }
}
```

---

## Built-in Database

```nzs
db.set("key", value)
let val = db.get("key")
db.delete("key")
db.increment("coins", 100)
db.decrement("lives", 1)
db.push("items", "sword")
db.pull("items", "sword")
```

---

## Built-in Functions

| Function | Description |
|---|---|
| `reply "msg"` | Send a message |
| `reply ephemeral "msg"` | Ephemeral (slash only) |
| `ctx.reply "msg"` | Ping reply |
| `dm user "msg"` | Direct message |
| `log "msg"` | Console log |
| `random(min, max)` | Random integer |
| `fetch(url)` | Fetch JSON from API |
| `format(value)` | Format numbers |
| `wait: 2s` | Pause execution |
| `react("emoji")` | React to message |
| `role.give(user, "Role")` | Give role |
| `role.remove(user, "Role")` | Remove role |
| `play AnimationName` | Play animation |
| `emit eventName()` | Emit custom event |

---

## How It Works

```
your-bot.nzs → NizumoScript Compiler → JavaScript → Discord.js → Discord
```

---

## License

MIT

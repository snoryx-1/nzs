# NizumoScript

A node-based programming language purpose-built for Discord bots.
Write clean, powerful bots without touching JavaScript or Discord.js.

```nzs
node BaseEmbed {
    color = "#2ecc71"
    footer = "My Bot"
    timestamp = true
}

node vars {
    var int hp = 100
    var int gold = 0
    var str inventory = []
}

node commands {
    cmd stats() {
        reply BaseEmbed {
            title = "📊 Stats"
            description = "HP: {vars.hp} | Gold: {vars.gold}"
        }
    }

    cmd help() {
        paginate {
            page { title = "Help — Page 1" description = ".stats .fight .inv" color = "#3498db" }
            page { title = "Help — Page 2" description = ".heal .level .shop" color = "#3498db" }
        }
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

## What's New in v0.2.1

### Embed Templates

Define a base embed once, reuse it everywhere with custom content:

```nzs
node RedEmbed {
    color = "#e74c3c"
    footer = "Danger Zone"
    timestamp = true
}

cmd died() {
    reply RedEmbed {
        title = "💀 You Died"
        description = "HP reset to 100"
    }
}

cmd warning() {
    reply RedEmbed {
        title = "⚠️ Warning"
        description = "Watch out!"
    }
}
```

### Pagination

Built-in multi-page embeds with next/prev buttons:

```nzs
cmd help() {
    paginate {
        page { title = "Page 1" description = "First page content" color = "#3498db" }
        page { title = "Page 2" description = "Second page content" color = "#3498db" }
        page { title = "Page 3" description = "Third page content" color = "#3498db" }
    }
}
```

### Arrays & Maps in Vars

Persistent arrays and maps per user:

```nzs
node vars {
    var str inventory = []
    var str stats = {}
    var int gold = 0
}

cmd pickup(item) {
    vars.inventory.push(item)
    reply "Picked up {item}!"
}
```

### Type Enforcement

Types now actually coerce values:

```nzs
var int hp = 100        // always integer
var float damage = 4.5  // always float
var str name = "Hero"   // always string
var bool alive = true   // always boolean
```

### Animations & Scheduled Tasks Anywhere

```nzs
node game {
    animation BattleAnim {
        canvas = 12x12
        background = "⬛"
        fps = 1
        loop = false
        sprite hero = "🧙" at 0,5
        keyframe 0 { hero at 0,5 }
        keyframe 1 { hero at 3,5 }
    }

    every 24h {
        log "Daily reset..."
    }

    cmd battle() {
        play BattleAnim
    }
}
```

---

## v0.2.0 — Full Flexibility

Any structure works in NZS:

```nzs
// Flat
node PlayerEmbed { title = "Player" color = "#3498db" }
node root { cmd stats() { reply PlayerEmbed } }

// Grouped
node commands { cmd stats() { ... } cmd fight() { ... } }
node root { use commands }

// Fully nested
node root {
    node vars { var int hp = 100 }
    node commands { cmd fight() { ... } }
}
```

### Pattern Matching

```nzs
match vars.class {
    when "Warrior" { reply "Strong!" }
    when "Mage" { reply "Magical!" }
    default { reply "Unknown class" }
}
```

### Ternary Expressions

```nzs
let status = vars.hp > 50 ? "Healthy" : "Low HP"
```

### Scheduled Tasks

```nzs
every 24h { log "Daily reset" }
every 1h { log "Hourly check" }
```

### Custom Events

```nzs
emit playerDied(ctx.user.id)
```

---

## v0.1.5 — Animation System

```nzs
animation BattleOpening {
    canvas = 6x6
    background = "⬛"
    fps = 2
    loop = false

    sprite topLine = "🟦" fill row 0
    sprite leftLine = "🟩" fill col 0
    sprite diagonal = [
        "🟥" at 0,0
        "🟥" at 1,1
        "🟥" at 2,2
    ]

    keyframe 0 { topLine fill row 0 }
    keyframe 1 { topLine fill row 1 clear topLine leftLine fill col 0 }
    keyframe 2 { leftLine fill col 1 }
}

cmd battle() { play BattleOpening }
```

**Max safe fps:** 2-3 (Discord rate limits)

---

## v0.1.0 — Beginner Mode

```nzs
node vars {
    var int hp = 100
    var str name = "Hero"
}

node root {
    m.@beginner
    use vars
    cmd stats() { reply "HP: {vars.hp} | Name: {vars.name}" }
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
cmd ban(user, reason) {
    a.@mod
    cooldown: 10s
    reply "Banned {user} for {reason}"
}

slash ping() { reply ephemeral "Pong!" }

cmd balance() {
    alias = ["bal", "b"]
    reply "Balance: {vars.gold}"
}
```

## Permissions

| Level | Who |
|---|---|
| `a.@everyone` | All users |
| `a.@mod` | Moderators |
| `a.@admin` | Administrators |

---

## Built-in Database

```nzs
db.set("key", value)
db.get("key")
db.delete("key")
db.increment("coins", 100)
db.push("items", "sword")
db.pull("items", "sword")
```

---

## Built-in Functions

| Function | Description |
|---|---|
| `reply "msg"` | Send message |
| `reply ephemeral "msg"` | Ephemeral reply |
| `ctx.reply "msg"` | Ping reply |
| `dm user "msg"` | Direct message |
| `log "msg"` | Console log |
| `random(min, max)` | Random integer |
| `fetch(url)` | Fetch JSON |
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

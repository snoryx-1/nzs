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

Modes cascade down — all nodes inherit root's mode. A node can override it:

```nzs
node advanced {
    m.@normal
    // uses normal mode even if root is @beginner
}
```

---

### `var` — Typed Variable Declarations

In beginner mode, declare variables anywhere with an optional type:

```nzs
var int hp = 100
var str name = "Hero"
var float damage = 4.5
var bool alive = true
```

Types: `int`, `str`, `float`, `bool`

---

### `node vars` — Auto-Persisted Per-User Data

Declare a vars node to get automatic per-user database persistence — no `db.get()` or `db.set()` needed:

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

    cmd reset() {
        vars.hp = 100
        vars.gold = 0
        vars.title = "Novice"
        reply "Stats reset!"
    }
}
```

- `vars.hp` reads the value from the DB for the current user
- `vars.hp -= 10` subtracts and saves automatically
- `vars.hp += 25` adds and saves automatically
- `vars.hp = 100` sets and saves automatically
- `{vars.hp}` works in string interpolation
- Each user has their own separate data

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
    startingBalance = 100

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
        a.@everyone
        let bal = Economy.getBalance(ctx.user.id)
        reply "Your balance is {bal} coins."
    }
}
```

---

## Multi-File Support

```nzs
// main.nzs
import "nodes/economy.nzs"
import "nodes/moderation.nzs"

node root {
    token = env.TOKEN
    prefix = "!"

    use Economy
    use Moderation
}
```

---

## Prefix System

### Single Global Prefix
```nzs
node root { prefix = "!" }
```

### Multiple Global Prefixes
```nzs
node root {
    prefix = ["!", "?", "."]

    cmd ping() {
        reply "You used: {ctx.prefix}"
    }
}
```

### Per-Command Prefix
```nzs
cmd pay(user, amount) {
    prefix = "$"
    reply "Paid {amount} to {user}!"
}
```

### Command Aliases
```nzs
cmd balance() {
    alias = ["bal", "b", "cash"]
    reply "Balance: 100 coins"
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

### Ephemeral Replies
```nzs
slash secret() {
    reply ephemeral "Only you can see this!"
}
```

### Ping Reply
```nzs
cmd hello() {
    ctx.reply "Hey there!"
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
    cooldown: 24h   // supports s, m, h
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

### Embed Nodes
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

### Inline Embeds
```nzs
cmd stats() {
    reply embed {
        title = "Your Stats"
        description = "HP: {vars.hp}"
        color = "#57F287"
        timestamp = true
    }
}
```

---

## Buttons

### Inline Buttons
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

### Button Nodes
```nzs
node ConfirmButton {
    label = "Confirm"
    color = "success"
    customId = "confirm_btn"

    def onClick() {
        reply "Action confirmed!"
    }
}

cmd action() {
    reply "Click to confirm:" with ConfirmButton
}
```

| Color | Style |
|---|---|
| `primary` | Blue |
| `secondary` | Grey |
| `success` | Green |
| `danger` | Red |

---

## Select Menus

```nzs
node RoleSelect {
    placeholder = "Choose a role"
    customId = "role_select"

    option { label = "Red" value = "red" description = "Red color role" }
    option { label = "Blue" value = "blue" description = "Blue color role" }

    def onSelect() {
        role.give(ctx.user, selected)
        reply "Gave you the {selected} role!"
    }
}

cmd roles() {
    reply "Pick a role:" with RoleSelect
}
```

---

## Modals

```nzs
node FeedbackModal {
    title = "Send Feedback"
    customId = "feedback_modal"

    input { name = "Your Feedback" value = "Tell us what you think..." }
    input { name = "Rating" value = "1-10" }

    def onSubmit() {
        let feedback = fields.get("Your Feedback")
        reply "Thanks! You said: {feedback}"
    }
}

slash feedback() {
    FeedbackModal.showModal()
}
```

---

## DM

```nzs
dm ctx.user "Hello!"
on join { dm user WelcomeEmbed }
```

---

## Reactions

```nzs
cmd vote() {
    react("👍")
    reply "Vote registered!"
}
```

---

## Role Management

```nzs
cmd verify() {
    role.give(ctx.user, "Verified")
    reply "You are now verified!"
}
```

---

## Server Info

```nzs
cmd serverinfo() {
    reply embed {
        title = "{ctx.server.name}"
        description = "Members: {ctx.server.memberCount}"
        color = "#5865F2"
    }
}
```

---

## Variables & Interpolation

```nzs
let name = ctx.user.username
reply "Hello {name}!"
```

---

## Control Flow

```nzs
if score >= 90 {
    reply "A"
} else if score >= 80 {
    reply "B"
} else {
    reply "F"
}

for fruit in fruits { log "{fruit}" }
for i from 1 to 10 { log "{i}" }
while n > 0 { n -= 1 }
```

---

## Type Checks

```nzs
if val is null { reply "Not found" }
if val is number { reply "Score: {val}" }
if val is !null { reply "Exists!" }
```

---

## Error Handling

```nzs
try {
    let bal = Economy.getBalance(userId)
    reply "Balance: {bal}"
} catch(err) {
    reply "Something went wrong: {err}"
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

Data persists in `.nzs_db.json` automatically.

---

## Built-in Functions

| Function | Description |
|---|---|
| `reply "msg"` | Reply in current channel |
| `reply ephemeral "msg"` | Ephemeral reply (slash only) |
| `ctx.reply "msg"` | Ping reply mentioning the user |
| `dm user "msg"` | Send a direct message |
| `channelSend(nameOrId, "msg")` | Send to channel by name or ID |
| `attach("file.png")` | Send a file attachment |
| `log "msg"` | Log to console |
| `react("emoji")` | React to the message |
| `wait: 2s` | Pause execution |
| `random(min, max)` | Random integer |
| `fetch(url)` | Fetch JSON from an API |
| `format(value)` | Format numbers with commas |
| `number(val)` | Convert to number |
| `string(val)` | Convert to string |
| `boolean(val)` | Convert to boolean |
| `role.give(user, "Role")` | Give a role |
| `role.remove(user, "Role")` | Remove a role |
| `db.get(key)` | Get from database |
| `db.set(key, value)` | Save to database |
| `db.delete(key)` | Delete from database |
| `db.increment(key, n)` | Add to a number in the DB |
| `db.decrement(key, n)` | Subtract from a number in the DB |
| `db.keys()` | Get all database keys |
| `db.values()` | Get all database values |

---

## How It Works

```
your-bot.nzs → NizumoScript Compiler → JavaScript → Discord.js → Discord
```

NizumoScript transpiles `.nzs` files to JavaScript. You never write or see any JS.

---

## License

MIT

# NizumoScript

A node-based programming language purpose-built for Discord bots.  
Write clean, expressive bots without touching JavaScript or Discord.js.

```nzs
node root {
    token = env.TOKEN
    prefix = "!"

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

Split your bot into multiple files using `import`:

```nzs
// main.nzs
import "nodes/economy.nzs"
import "nodes/moderation.nzs"

node root {
    token = env.TOKEN
    prefix = "!"

    use Economy
    use Moderation

    cmd balance() {
        let bal = Economy.getBalance(ctx.user.id)
        reply "Balance: {bal} coins"
    }
}
```

```nzs
// nodes/economy.nzs
node Economy {
    def getBalance(userId) {
        return db.get("bal_{userId}") ?? 100
    }
}
```

---

## Prefix System

NizumoScript has the most flexible prefix system of any Discord bot language.

### Single Global Prefix
```nzs
node root {
    prefix = "!"
}
```

### Multiple Global Prefixes
```nzs
node root {
    prefix = ["!", "?", "."]

    cmd ping() {
        a.@everyone
        reply "Pong! You used: {ctx.prefix}"
    }
}
```

### Command Aliases
```nzs
cmd balance() {
    a.@everyone
    alias = ["bal", "b", "cash", "money"]
    reply "Your balance is 100 coins!"
}
```
Now `!balance`, `!bal`, `!b`, `!cash`, and `!money` all work.

### Per-Command Prefix
```nzs
cmd pay(user, amount) {
    a.@everyone
    prefix = "$"
    reply "Paid {amount} coins to {user}!"
}
```
Only `$pay` works — `!pay` does nothing.

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
    let bal = Economy.getBalance(ctx.user.id)
    reply embed {
        title = "Your Stats"
        description = "Balance: {bal} coins"
        color = "#57F287"
        timestamp = true
        field {
            name = "Rank"
            value = "Gold"
            inline = true
        }
    }
}
```

### Dynamic Fields
```nzs
cmd info() {
    reply StatsEmbed.addField("Ping", "50ms", true)
}
```

### Edit an Existing Message
```nzs
cmd update(messageId) {
    a.@admin
    StatsEmbed.edit(messageId)
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

### Button Colors
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

    option {
        label = "Red"
        value = "red"
        description = "Red color role"
    }

    option {
        label = "Blue"
        value = "blue"
        description = "Blue color role"
    }

    def onSelect() {
        let picked = selected
        role.give(ctx.user, picked)
        reply "Gave you the {picked} role!"
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

    input {
        name = "Your Feedback"
        value = "Tell us what you think..."
    }

    input {
        name = "Rating"
        value = "1-10"
    }

    def onSubmit() {
        let feedback = fields.get("Your Feedback")
        let rating = fields.get("Rating")
        reply "Thanks! You said: {feedback} ({rating}/10)"
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
dm ctx.user WelcomeEmbed

on join {
    dm user WelcomeEmbed
}
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
    a.@everyone
    role.give(ctx.user, "Verified")
    reply "You are now verified!"
}

cmd unverify() {
    a.@admin
    role.remove(ctx.user, "Verified")
    reply "Role removed."
}
```

---

## Mentioned User

Get the user mentioned in a command like `!ban @user`:

```nzs
cmd ban(reason) {
    a.@admin
    let target = ctx.mentioned
    reply "Banned {target.username} for {reason}"
}
```

---

## Server Info

```nzs
cmd serverinfo() {
    a.@everyone
    reply embed {
        title = "{ctx.server.name}"
        description = "Members: {ctx.server.memberCount}"
        color = "#5865F2"
    }
}
```

| Property | Description |
|---|---|
| `ctx.server.name` | Server name |
| `ctx.server.id` | Server ID |
| `ctx.server.memberCount` | Member count |
| `ctx.server.icon` | Server icon URL |

---

## Send to Specific Channel

Send a message to any channel by name or ID:

```nzs
cmd announce(msg) {
    a.@admin
    channelSend("announcements", "📢 {msg}")
}
```

---

## File Attachments

Send a file or image:

```nzs
cmd sendfile() {
    a.@everyone
    attach("assets/welcome.png", "Here is the welcome image!")
}

// Without a message
cmd sendlog() {
    a.@admin
    attach("logs/bot.log")
}
```

---

## Variables & Interpolation

```nzs
let name = ctx.user.username
let bal = Economy.getBalance(ctx.user.id)
reply "Hello {name}, you have {bal} coins!"
```

---

## Args Access

```nzs
cmd echo(text) {
    let first = ctx.args[0]
    let second = ctx.args[1]
    reply "First: {first}, Second: {second}"
}
```

---

## Control Flow

### if / else if / else
```nzs
let s = number(score)
if s >= 90 {
    reply "A"
} else if s >= 80 {
    reply "B"
} else if s >= 70 {
    reply "C"
} else {
    reply "F"
}
```

### for in loop
```nzs
let fruits = ["apple", "banana", "cherry"]
for fruit in fruits {
    log "Fruit: {fruit}"
}
```

### for range loop
```nzs
for i from 1 to 10 {
    log "Count: {i}"
}
```

### while loop
```nzs
let n = 5
while n > 0 {
    log "T-minus {n}"
    n -= 1
}
```

### break and continue
```nzs
for i from 1 to 10 {
    if i == 5 { break }
    if i == 3 { continue }
    log "{i}"
}
```

---

## Logical Operators

```nzs
if score >= 80 and score < 90 {
    reply "B grade"
}

if role == "admin" or role == "mod" {
    reply "Elevated permissions"
}
```

---

## Type Checks

```nzs
let val = db.get("score")

if val is null {
    reply "No score found"
} else if val is number {
    reply "Score: {val}"
} else {
    reply "Invalid score"
}
```

| Check | Description |
|---|---|
| `x is string` | Check if x is a string |
| `x is number` | Check if x is a number |
| `x is boolean` | Check if x is a boolean |
| `x is null` | Check if x is null or undefined |
| `x is array` | Check if x is an array |
| `x is !null` | Check if x is NOT null |

---

## Type Conversion

```nzs
let x = number(score)    // "85" → 85
let s = string(123)      // 123 → "123"
let b = boolean("true")  // "true" → true
```

---

## String Methods

```nzs
let text = "Hello World"

text.upper()              // "HELLO WORLD"
text.lower()              // "hello world"
text.length               // 11
text.includes("World")    // true
text.replace("World", "NZS")  // "Hello NZS"
text.split(" ")           // ["Hello", "World"]
text.startsWith("Hello")  // true
text.endsWith("World")    // true
text.slice(0, 5)          // "Hello"
text.indexOf("W")         // 6
text.trim()               // "Hello World"
```

---

## Math

```nzs
math.floor(4.9)    // 4
math.ceil(4.1)     // 5
math.round(4.5)    // 5
math.abs(-10)      // 10
math.pow(2, 8)     // 256
math.sqrt(16)      // 4
math.max(1, 5, 3)  // 5
math.min(1, 5, 3)  // 1
math.random()      // 0.0 - 1.0
math.PI            // 3.14159...
```

---

## Modulo

```nzs
let remainder = 10 % 3   // 1

if score % 2 == 0 {
    reply "Even number!"
}
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

attempt {
    Economy.addBalance(userId, amount)
} fail(err) {
    reply "Transaction failed."
}
```

---

## Null Safety

```nzs
let balance = user?.balance ?? 0
```

---

## Built-in Database

```nzs
db.set("key", value)
let val = db.get("key")
db.delete("key")
db.has("key")
db.all()

// Atomic increment/decrement
db.increment("coins_123", 100)   // adds 100
db.decrement("lives_123", 1)     // subtracts 1

// List all keys or values
let keys = db.keys()
let vals = db.values()
```

Data persists in `.nzs_db.json` automatically.

---

## Built-in Functions

| Function | Description |
|---|---|
| `reply "msg"` | Reply in current channel |
| `reply ephemeral "msg"` | Reply only visible to user (slash only) |
| `ctx.reply "msg"` | Ping reply mentioning the user |
| `reply embed { }` | Reply with inline embed |
| `reply "msg" with button { }` | Reply with a button |
| `reply "msg" with NodeName` | Reply with a node button/select |
| `dm user "msg"` | Send a direct message |
| `send(channel, "msg")` | Send to a specific channel object |
| `channelSend(nameOrId, "msg")` | Send to a channel by name or ID |
| `attach("file.png")` | Send a file attachment |
| `attach("file.png", "msg")` | Send a file with a message |
| `log "msg"` | Log to console |
| `react("emoji")` | React to the message |
| `wait: 2s` | Pause execution |
| `random(min, max)` | Random integer between min and max |
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
| `db.increment(key, amount)` | Add to a number in the database |
| `db.decrement(key, amount)` | Subtract from a number in the database |
| `db.keys()` | Get all database keys |
| `db.values()` | Get all database values |

---

## Node Inheritance

```nzs
node PremiumEconomy extends Economy {
    bonus = 500
}
```

---

## Private Nodes & Methods

```nzs
private node InternalHelper { }

node MyNode {
    private def secretMethod() { }

    def publicMethod() {
        return "Hello!"
    }
}
```

---

## How It Works

```
your-bot.nzs → NizumoScript Compiler → JavaScript → Discord.js → Discord
```

NizumoScript transpiles `.nzs` files to JavaScript. You never write or see any JS.

---

## License

MIT

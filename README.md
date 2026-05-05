# Discord JS Basic Command Handler
A simple command handler for a Discord bot built using the Discord.js library.

## Requirements
- Node.js installed
- A Discord account
- A Discord bot token (from the Discord Developer Portal)

## Features
- Cog-based command & event system
- Prefix commands with aliases
- Permission support
- Reload cogs command (commands + events)

## Todo
- Reload cogs command ✅
- Add hybrid commands (text & slash)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/testholder/discordjs-command-handler.git
```

### 2. Go to the project directory
```bash
cd discordjs-command-handler
```

### 3. Install dependencies
```bash
npm install
```

### 4. Set up environment variables
Rename `.env.example` to `.env` and replace the placeholder with your bot token:

```env
BOT_TOKEN=YOUR_BOT_TOKEN_HERE
DEFAULT_PREFIX=DEFAULT_PREFIX_HERE
```

### 5. Run the bot
```bash
npm start
```
---

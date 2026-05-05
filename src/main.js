// main.js
const { Client, Events, GatewayIntentBits, Collection, PermissionsBitField} = require("discord.js");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const PREFIX = process.env.DEFAULT_PREFIX;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           
        GatewayIntentBits.GuildMessages,    
        GatewayIntentBits.MessageContent,   
        GatewayIntentBits.GuildMembers,     
        GatewayIntentBits.GuildBans,         
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessageReactions,
    ]
});

client.commands = new Collection();
client.events = new Collection();

// help functions
async function reloadCommands() {
    Object.keys(require.cache).forEach(file => {
        if (file.includes(path.join(__dirname, "cogs"))) {
            delete require.cache[file];
        }
    });

    client.commands.clear();
    client.events.clear();

    await loadCommands();

    return true;
}

function registerEvents() {
    for (const [eventName, handlers] of client.events) {
        const existing = client.listeners(eventName);

        for (const listener of existing) {
            if (listener.isCogEvent) {
                client.removeListener(eventName, listener);
            }
        }
        const wrapper = async (...args) => {
            for (const handler of handlers) {
                try {
                    await handler.execute(client, ...args);
                } catch (err) {
                    console.error(`Error in event ${eventName}:`, err);
                }
            }
        };
        wrapper.isCogEvent = true;

        client.on(eventName, wrapper);
    }
}

async function loadCommands() {
    const cogsPath = path.join(__dirname, "cogs");
    const cogFiles = fs.readdirSync(cogsPath).filter(file => file.endsWith(".js"));
    
    client.commands.clear();

    for (const file of cogFiles) {
        const cog = require(`./cogs/${file}`);
        console.log(`Loading cog : ${cog.cogName}`);
        
        for (const command of cog.commands) {
            if (command.commandName) {
                client.commands.set(command.commandName, command);
                if (command.aliases && Array.isArray(command.aliases)) {
                    for (const alias of command.aliases) {
                        client.commands.set(alias, command);
                    }
                }

                console.log(`   Command name: ${command.commandName}`);
            }
        }
        for (const event of cog.events || []) {
            if (!client.events.has(event.eventName)) {
                client.events.set(event.eventName, []);
            }

            client.events.get(event.eventName).push(event);

            console.log(`   Event loaded: ${event.eventName}`);
        }
    }

    registerEvents();
    
    console.log("commands loaded + events");
};

async function handleCommand(command, message, args) {
    const messageCreator = message.author || message.user;
    
    if (command.permissions && command.permissions.length > 0) {
        const member = message.guild?.members.resolve(messageCreator.id);
        if (!member) return message.reply('Could not find your member information in this guild.');

        const missingPermissions = command.permissions.filter(perm => !member.permissions.has(PermissionsBitField.Flags[perm]));
        if (missingPermissions.length > 0) {
            return message.reply(`You are missing the following permissions: ${missingPermissions.join(', ')}`);
        }
    }

    if (command.requiredArgs && args.length < command.requiredArgs && !isSlash) {
        return message.reply(`This command requires at least ${command.requiredArgs} arguments. Example usage: \`${"!"}${command.textCommandName} [args]\``);
    }

    await command.execute(client, {
        author: messageCreator,
        id: messageCreator.id,
        guild: message.guild,
        options: message.options || [],
        channel: message.channel,
        reply: async (options = {}) => {
            const replyOptions = {
                content: options.content,
                embeds: options.embeds || [],
                components: options.components || [],
                ephemeral: options.ephemeral ?? false,
            };

            if (!replyOptions.content && !replyOptions.embeds.length) {
                throw new Error("no content found");
            }

            if (context.isCommand?.() || context.isContextMenu?.() || context.isButton?.()) {

                if (options.defer && !context.deferred && !context.replied) {
                    await context.deferReply({ ephemeral: replyOptions.ephemeral });
                    return;
                }

                if (context.deferred && !context.replied) {
                    return await context.editReply(replyOptions);
                }

                if (context.replied) {
                    return await context.followUp(replyOptions);
                }

                return await context.reply(replyOptions);
            }

            return await context.reply(replyOptions);
        },
        defer: async (ephemeral = false) => {
            if (context.isRepliable?.() && !context.deferred && !context.replied) {
                return await context.deferReply({ ephemeral });
            }
        },
        followUp: async (options = {}) => {
            const followUpOptions = {
                content: options.content,
                embeds: options.embeds || [],
                components: options.components || [],
                ephemeral: options.ephemeral ?? false,
            };

            if (context.followUp) {
                return await context.followUp(followUpOptions);
            }

            return await context.reply(followUpOptions);
        },
        collector: (target, options = {}) => {
            if (!target) throw new Error("Collector target required");

            return target.createMessageComponentCollector(options);
        }
    }, args);
};

// bot events
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;
    
    // remove prefix and split message into a array
    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    
    // remove first index of array which is command
    const commandName = args.shift().toLowerCase();
    
    // TODO: maybe make it so only admin or a set userID can access the command
    if (commandName === "reload") {
        return reloadCommands()
            .then(() => message.reply("Successfully reloaded cogs!"))
            .catch((error) => {
                message.reply("Failed to reload.");
                console.log(error);
            });
    }

    let command = client.commands.get(commandName);
    if (!command) return;
    
    
    try{ 
        // handle command
        await handleCommand(command, message, args);
    } catch (error) {
        console.error("error executing command: ", error);
    }

});

client.once(Events.ClientReady, (client) => {
	console.log(`Logged in as ${client.user.tag}`);
});


(async () => {
    await loadCommands();
    client.login(process.env.BOT_TOKEN);
})();
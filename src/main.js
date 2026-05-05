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


// help functions
async function loadCommands() {
    const cogsPath = path.join(__dirname, "cogs");
    const cogFiles = fs.readdirSync(cogsPath).filter(file => file.endsWith(".js"));
    
    client.commands.clear();
    client.commands = new Collection();

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
    }
    
    console.log("commands loaded");
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
                content: typeof options.content === 'string' ? options.content : options.content,
                embeds: Array.isArray(options.content) ? options.content : options.embeds || [],
                ephemeral: options.ephemeral,
            };
            
            if (options.components) {
                replyOptions.components = options.components;
            }

            if (!replyOptions.content && !replyOptions.embeds?.length) throw new Error("no content found");
            if (message.isCommand?.() || message.isContextMenu?.()) {
                if (options.deferReply && !message.deferred) return await message.deferReply({ ephemeral: options.ephemeral });
                if (message.deferred) return await message.followUp(replyOptions);
                else return await message.reply(replyOptions);
            } else {
                return await message.reply(replyOptions);
            }
        },
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
    

    console.log(args);
    console.log(commandName);

    let command = client.commands.get(commandName);
    if (!command) return;
    
    try{ 
        // handle command
        handleCommand(command, message, args);
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
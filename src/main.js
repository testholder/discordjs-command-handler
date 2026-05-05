const { Client, Events, GatewayIntentBits, Collection} = require("discord.js");
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
    console.log("commands loaded");
}

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
    } catch (error) {
        console.error("error executing command: ", error);
    }

})

client.once(Events.ClientReady, (client) => {
	console.log(`Logged in as ${client.user.tag}`);
});


(async () => {
    await loadCommands();
    client.login(process.env.BOT_TOKEN);
})();
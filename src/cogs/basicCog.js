// Todo

module.exports = {
    cogName: "basicCog",
    commands: [
        {
            commandName: "ping",
            description: "",
            aliases: ["test"],
            requiredArgs: 0,
            permissions: ['ManageMessages'],
            async execute(client, context, args) {
                context.reply({ content: "pong?" });
            }
        }
    ]
}
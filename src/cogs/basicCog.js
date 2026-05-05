// Todo

module.exports = {
    cogName: "basicCog",
    commands: [
        {
            commandName: "ping",
            description: "",
            aliases: [""],
            requiredArgs: 0,
            permissions: ['ManageMessages'],
            async execute(client, context, args) {
                context.reply({ content: "pong?" });
            }
        },
        {
            commandName: "purgetest",
            description: "",
            aliases: [""],
            requiredArgs: 0,
            permissions: ['ManageMessages'],
            async execute(client, context, args) {
                console.log(args[0])
                context.reply({ content: "pong?" });
            }
        }
    ]
}
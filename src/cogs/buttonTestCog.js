const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    cogName: "buttonTestCog",
    commands: [
        {
            commandName: "button",
            description: "",
            aliases: [""],
            requiredArgs: 0,
            permissions: ['ManageMessages'],
            async execute(client, context) {
                const button = new ButtonBuilder()
                    .setCustomId("my_button")
                    .setLabel("Click me")
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder().addComponents(button);

                await context.reply({
                    content: "Press the button:",
                    components: [row]
                });
            }
        }
    ],
    events: [
        {
            eventName: "interactionCreate",
            async execute(client, interaction) {
                if (!interaction.isButton()) return;

                if (interaction.customId === "my_button") {
                    await interaction.reply({
                        content: "You clicked the button!",
                        ephemeral: true
                    });
                }
            }
        }
    ]
};
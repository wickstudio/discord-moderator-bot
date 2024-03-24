const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Displays a user\'s avatar.')
        .addUserOption(option => option.setName('target').setDescription('The user to display avatar of').setRequired(false)),
        async execute(interaction,client) {
        const { commands } =  client.getConfig();
        if (!commands.avatar) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        try {
            const user = interaction.options.getUser('target') || interaction.user;
            
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`${user.username}'s Avatar`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing the avatar command:', error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};

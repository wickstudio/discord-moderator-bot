const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Displays a user\'s banner.')
        .addUserOption(option => option.setName('target').setDescription('The user to display the banner of').setRequired(false)),
        async execute(interaction,client) {
        const { commands } =  client.getConfig();
        if (!commands.banner) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        try {
            const user = interaction.options.getUser('target') || interaction.user;
            const member = await interaction.guild.members.fetch(user.id);
            // Fetch detailed user information to access the banner
            const fullUser = await interaction.client.users.fetch(member.id, { force: true });
            
            if (fullUser.banner) {
                const bannerUrl = fullUser.bannerURL({ size: 1024, dynamic: true });
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`${user.username}'s Banner`)
                    .setImage(bannerUrl)
                    .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({ content: "This user does not have a banner.", ephemeral: true });
            }
        } catch (error) {
            console.error('Error executing the banner command:', error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};

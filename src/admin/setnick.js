const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setnick')
        .setDescription('Changes a user\'s nickname.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to change the nickname for')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('nickname')
                .setDescription('The new nickname')
                .setRequired(true)
        ),
        async execute(interaction,client) {
            const { commands } = client.getConfig();
        if (!commands.setnick) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');
        const nickname = interaction.options.getString('nickname');

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.setNickname(nickname);
            await interaction.reply({ content: `${user.username}'s nickname has been changed to ${nickname}.`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the setnick command:', error);
            await interaction.reply({ content: 'There was an error trying to change the user\'s nickname!', ephemeral: true });
        }
    },
};

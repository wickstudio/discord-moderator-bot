const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rtimeout')
        .setDescription('Removes the timeout from a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to remove the timeout from')
                .setRequired(true)
        ),
        async execute(interaction,client) {
            const { commands } = client.getConfig();
        if (!commands.rtimeout) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.timeout(null);
            await interaction.reply({ content: `${user.username} has had their timeout removed.`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the rtimeout command:', error);
            await interaction.reply({ content: 'There was an error trying to remove the timeout from the user!', ephemeral: true });
        }
    },
};

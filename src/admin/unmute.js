const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Removes the mute from a user, allowing them to send messages and join voice channels again.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to unmute')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const { commands } = client.getConfig();
        if (!commands.unmute) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');
        const mutedRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');

        if (!mutedRole) {
            await interaction.reply({ content: 'Error: Muted role not found. Please ensure a "Muted" role exists.', ephemeral: true });
            return;
        }

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.roles.remove(mutedRole);
            await interaction.reply({ content: `${user.username} has been unmuted.`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the unmute command:', error);
            await interaction.reply({ content: 'There was an error trying to unmute the user!', ephemeral: true });
        }
    },
};

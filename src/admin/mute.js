const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a user, preventing them from sending messages or joining voice channels.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for muting the user')
                .setRequired(false)),
                async execute(interaction,client) {
                    const { commands } = client.getConfig();
                            if (!commands.mute) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const mutedRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');

        if (!mutedRole) {
            await interaction.reply({ content: 'Error: Muted role not found. Please ensure a "Muted" role exists.', ephemeral: true });
            return;
        }

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.roles.add(mutedRole, reason);
            await interaction.reply({ content: `${user.username} has been muted. Reason: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the mute command:', error);
            await interaction.reply({ content: 'There was an error trying to mute the user!', ephemeral: true });
        }
    },
};

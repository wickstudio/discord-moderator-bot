const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Locks the current channel, preventing members from sending messages.')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for locking the channel')
                .setRequired(false)),
                async execute(interaction,client) {
                    const { commands } = client.getConfig();
                            if (!commands.lock) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const reason = interaction.options.getString('reason') || 'Not specified';

        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }, { reason });
            await interaction.reply({ content: `This channel has been locked. Reason: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the lock command:', error);
            await interaction.reply({ content: 'There was an error trying to lock the channel!', ephemeral: true });
        }
    },
};

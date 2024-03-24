const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlocks the current channel, allowing members to send messages again.')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for unlocking the channel')
                .setRequired(false)),
                async execute(interaction,client) {
                    const { commands } = client.getConfig();
                            if (!commands.unlock) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const reason = interaction.options.getString('reason') || 'Not specified';

        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true }, { reason });
            await interaction.reply({ content: `This channel has been unlocked. Reason: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the unlock command:', error);
            await interaction.reply({ content: 'There was an error trying to unlock the channel!', ephemeral: true });
        }
    },
};

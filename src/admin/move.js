const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Moves a user from one voice channel to another.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to move')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('to')
                .setDescription('The voice channel to move the user to')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice)
        ),
        async execute(interaction,client) {
            const { commands } = client.getConfig();
                    if (!commands.move) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');
        const toChannel = interaction.options.getChannel('to');

        if (toChannel.type !== ChannelType.GuildVoice) {
            await interaction.reply({ content: 'The target channel must be a voice channel.', ephemeral: true });
            return;
        }

        try {
            const member = await interaction.guild.members.fetch(user.id);
            if (!member.voice.channel) {
                await interaction.reply({ content: `${user.username} is not in a voice channel.`, ephemeral: true });
                return;
            }
            await member.voice.setChannel(toChannel);
            await interaction.reply({ content: `${user.username} has been moved to ${toChannel.name}.`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the move command:', error);
            await interaction.reply({ content: 'There was an error trying to move the user!', ephemeral: true });
        }
    },
};

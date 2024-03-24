const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(false)
        ),
        async execute(interaction,client) {
            const { commands } = client.getConfig();
                    if (!commands.kick) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const member = await interaction.guild.members.fetch(user.id);
            if (!member) throw new Error('Member not found');
            
            await member.kick(reason);
            await interaction.reply({ content: `${user.username} has been kicked. Reason: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the kick command:', error);
            await interaction.reply({ content: 'There was an error trying to kick the user!', ephemeral: true });
        }
    },
};

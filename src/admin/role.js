const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Assigns a role to a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to assign the role to')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to assign')
                .setRequired(true)
        ),
        async execute(interaction,client) {
            const { commands } = client.getConfig();
        if (!commands.role) {
            await interaction.reply({ content: "This command has been disabled.", ephemeral: true });
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.roles.add(role);
            await interaction.reply({ content: `${user.username} has been assigned the role ${role.name}.`, ephemeral: true });
        } catch (error) {
            console.error('Error executing the role command:', error);
            await interaction.reply({ content: 'There was an error trying to assign the role to the user! Make sure the bot has the appropriate permissions and the role is not higher than the bot\'s highest role.', ephemeral: true });
        }
    },
};

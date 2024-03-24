
module.exports = {
  name: 'guildMemberAdd',
  execute(member,client) {
    const { autoRole } = client.getConfig();
    if (member.user.bot) {
      const botRole = member.guild.roles.cache.get(autoRole.botRoleId);
      if (botRole) {
        member.roles.add(botRole).catch(console.error);
      } else {
        console.log(`The bot role with ID ${autoRole.botRoleId} does not exist.`);
      }
    } else {
      const userRole = member.guild.roles.cache.get(autoRole.userRoleId);
      if (userRole) {
        member.roles.add(userRole).catch(console.error);
      } else {
        console.log(`The user role with ID ${autoRole.userRoleId} does not exist.`);
      }
    }
  },
};

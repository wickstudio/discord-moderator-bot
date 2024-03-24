async function handleGiveawayError(interaction, error) {
    console.error('Error handling the giveaway:', error);

    if (error.code === 10008) {
        console.warn('Tried to interact with a deleted giveaway message.');
        if (!interaction.replied) {
            await interaction.reply({
                content: 'It seems the giveaway message was deleted. Please restart the giveaway.',
                ephemeral: true
            }).catch(console.error);
        } else {
            await interaction.followUp({
                content: 'It seems the giveaway message was deleted. Unable to update or conclude the giveaway properly.',
                ephemeral: true
            }).catch(console.error);
        }
    } else {
        if (!interaction.replied) {
            await interaction.reply({
                content: 'An error occurred while setting up the giveaway. Please try again later or contact the support team.',
                ephemeral: true
            }).catch(console.error);
        } else {
            await interaction.followUp({
                content: 'An error occurred while processing the giveaway. Please check the bot’s permissions and try again.',
                ephemeral: true
            }).catch(console.error);
        }
    }
}

module.exports = { handleGiveawayError };

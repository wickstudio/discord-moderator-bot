
module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        const { autoResponders } = client.getConfig();
        if (message.author.bot) return;

        if (!autoResponders || !Array.isArray(autoResponders) || autoResponders.length === 0) {
            console.error('Auto responders configuration is missing or not an array.');
            return;
        }


        autoResponders.forEach((autoResponder) => {
            if (message.content.toLowerCase().includes(autoResponder.trigger.toLowerCase())) {
                let reply = autoResponder.reply
                    .replace(/{{user}}/g, message.author.toString())
                    .replace(/{{username}}/g, message.author.username);

                message.channel.send(reply)
                    .then(() => console.log(`Replied with: ${reply}`))
                    .catch(error => console.error(`Error sending reply: ${error.message}`));
                return;
            }
        });
    },
};

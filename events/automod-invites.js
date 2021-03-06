module.exports = {
    events: ['messageCreate'],
    code: m => {
        let invitere = /(?:https?:\/\/)?discord(?:app)?\.(?:com|gg|me|io)\/(?:invite\/)?([a-zA-Z0-9_-]+)/
        let content = m.content
        let bot = m._client
        if (!m.member) return;
        let guild = m.member.guild
        bot.db[guild.id].settings.get.then(settings => {
            if (!guild) {
                // DM (but why are they trying to shill in the bot's DMs in the first place...?)
                return;
            }
            if (invitere.test(content) && settings.automod_invites) {
                // oheck invite
                let match = invitere.exec(content)
                if (!match) return;
                let invite = bot.getInvite(match[1]).then(i => {
                    if (!i) {
                        return; // invalid for some reason
                    }
                    if (i.guild.id === guild.id) {
                        return; // invite points to current guild
                    }
                    // invite detected AND invite was for different guild
                    let me = guild.members.get(bot.user.id)
                    bot.addStrike(m.member, settings.invite_strikes || 1, 'Posting invite link.')
                    m.delete().catch(() => {})
                }).catch(i => {})
            }
        })
    }
}
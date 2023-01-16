require('dotenv').config()
const { Client, Intents, Collection } = require('discord.js')
const db = require('pro.db')
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
})

const Invites = new Collection()

client.on('messageCreate', async KINGER => {
    if(KINGER.content.startsWith('setup-channel')) {
        const Args = KINGER.content.split(' ').slice(1).join(' ')
        const Channel = KINGER.mentions.channels.first() || KINGER.guild.channels.cache.get(Args)
        if(!Channel) return;
        db.set(`Channel_${KINGER.guild.id}`, Channel.id)
        KINGER.channel.send({ content: `${Channel} has been Successfully Changed` }).then((Msg) => {
            setTimeout(() => {
                Msg.delete()
            }, 5000)
        })
    } else if(KINGER.content.startsWith('setup-message')) {
        const Args = KINGER.content.split(' ').slice(1).join(' ')
        if(!Args) return;
        db.set(`Message_${KINGER.guild.id}`, Args)
        KINGER.channel.send({ content: `\`\`\`${Args}\`\`\`` }).then((Msg) => {
            setTimeout(() => {
                Msg.delete()
            }, 5000)
        })
    }
})

client.on('ready', async() => {
    console.log(`${client.user.username} is Online!`)
    await client.guilds.cache.forEach(async Guild => {
        await (await Guild.invites.fetch()).forEach(async Invite => {
            Invites.set(Invite.code, Invite.uses, Invite.url)
        })
    })
})

client.on('inviteCreate', async Invite => Invites.set(Invite.code, Invite.uses))

client.on('inviteDelete', async Invite => Invites.delete(Invite.code))

client.on('guildMemberAdd', async Member => {
    const MessageDB = db.get(`Message_${Member.guild.id}`)
    const ChannelDB = db.get(`Channel_${Member.guild.id}`)
    if(!MessageDB && !ChannelDB) returnl;
    const Invite = await (await Member.guild.invites.fetch()).find((Invite) => Invite.uses > Invites.get(Invite.code))
    const Channel = await Member.guild.channels.cache.get(ChannelDB)
    const Variables = MessageDB
    .replace(/{user}/g, Member.user)
    .replace(/{id}/g, Member.user.id)
    .replace(/{inviter}/g, Invite.inviter)
    .replace(/{inviterTag}/g, Invite.inviter.tag)
    .replace(/{inviterID}/g, Invite.inviter.tag)
    .replace(/{invites}/g, Invite.uses)
    .replace(/{memberCount}/g, Member.guild.memberCount)
    Channel.send({ content: `${Variables}` })
})

client.login(process.env.Token)
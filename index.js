const { Client, Intents, MessageEmbed } = require('discord.js')
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
})
const db = require('quick.db')

client.on('ready', async() => {
    let Console = console.log;
    Console(`${client.user.username} is Online!`)
})

client.on('messageCreate', async TOBZiCoder => {
    if(TOBZiCoder.content.startsWith(require('./config.json').PREFIX + 'help')) {
        const EMBED = new MessageEmbed()
           .setAuthor(TOBZiCoder.author.tag, TOBZiCoder.author.displayAvatarURL())
           .setThumbnail(TOBZiCoder.author.displayAvatarURL())
           .setDescription(`***\`${require('./config.json').PREFIX}set-message  :\`  Set a Message of Welcome***\n***\`${require('./config.json').PREFIX}set-channel  :\` Set a Channel of Welcome***`)
           .addField(`_ _`, `
***\`\`\`fix
[User]               : Name + Tag (Member)
[UserName]           : Username of Member
[UserTag]            : Tag of Member
[UserID]             : ID of Member
[UserCreatedAt]      : Joined Discord (Member)
[MembersCount]       : Members Count
[guildName]          : Server Name
[guildID]            : Server ID
[guildOwner]         : Server Owner
\`\`\`***`)
        TOBZiCoder.channel.send({ embeds: [EMBED] })
    } else if(TOBZiCoder.content.startsWith(require('./config.json').PREFIX + 'set-message')) {
        if(!TOBZiCoder.member.permissions.has('MANAGE_GUILD')) return TOBZiCoder.react('❌')
        const args = await TOBZiCoder.content.split(' ').slice(1).join(' ')
        if(!args) return TOBZiCoder.react('❌')
        db.set(`WelcomeMessage_${TOBZiCoder.guild.id}`, args)
        TOBZiCoder.react('✅')
    } else if(TOBZiCoder.content.startsWith(require('./config.json').PREFIX + 'set-channel')) {
        if(!TOBZiCoder.member.permissions.has('MANAGE_GUILD')) return TOBZiCoder.react('❌')
        const Channel = await TOBZiCoder.mentions.channels.first()
        if(!Channel) return TOBZiCoder.react('❌')
        db.set(`WelcomeChannel_${TOBZiCoder.guild.id}`, Channel.id)
        TOBZiCoder.react('✅')
    } else if(TOBZiCoder.content.startsWith(require('./config.json').PREFIX + 'join')) {
        if(!TOBZiCoder.member.permissions.has('MANAGE_GUILD')) return TOBZiCoder.react('❌')
        client.emit('guildMemberAdd', TOBZiCoder.member)
        TOBZiCoder.react('✅')
    }
})

client.on('guildMemberAdd', async Member => {
    const Channel = await db.get(`WelcomeChannel_${Member.guild.id}`)
    if(!Channel) return;
    const Message = await db.get(`WelcomeMessage_${Member.guild.id}`)
    if(!Message) return;
    if(Message === null) {
        db.set(`WelcomeMessage_${Member.guild.id}`, `[User] has been invited by **[inviterTag].**`)
    }

    const Content = await Message
        .replace(`[User]`, Member.user)
        .replace(`[UserName]`, Member.user.username)
        .replace(`[UserTag]`, Member.user.tag)
        .replace(`[UserID]`, Member.user.id)
        .replace(`[UserCreatedAt]`, `<t:${parseInt(Member.user.createdAt / 1000)}:f>`)
        .replace(`[MembersCount]`, Member.guild.memberCount)
        .replace(`[guildName]`, Member.guild.name)
        .replace(`[guildID]`, Member.guild.id)
        .replace(`[guildOwner]`, `<@${Member.guild.ownerId}>`)
    Member.guild.channels.cache.get(Channel).send(Content)
})

client.login(require('./config.json').TOKEN)
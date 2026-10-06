const {
  ChannelType,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const labelMap = {
  compra: 'Compra',
  encomenda: 'Encomenda personalizada',
  suporte: 'Suporte',
  outros: 'Outros'
};

async function handleButton(interaction) {
  const action = interaction.customId.replace('ticket_', '');

  if (action === 'close') {
    const isStaff = interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID);
    const isOwner = interaction.channel.topic === `owner:${interaction.user.id}`;

    if (!isStaff && !isOwner) {
      return interaction.reply({
        content: 'Você não pode fechar este ticket.',
        ephemeral: true
      });
    }

    await interaction.reply('🔒 Ticket será fechado.');

    const logs = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (logs) {
      await logs.send(`🔒 Ticket **${interaction.channel.name}** fechado por ${interaction.user}.`);
    }

    setTimeout(() => interaction.channel.delete().catch(() => {}), 1500);
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`ticket_modal_${action}`)
    .setTitle(`Abrir ticket • ${labelMap[action] || action}`);

  const details = new TextInputBuilder()
    .setCustomId('details')
    .setLabel('Explique o que você precisa')
    .setPlaceholder('Ex: Quero uma viatura PMERJ baseada na Ranger...')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const budget = new TextInputBuilder()
    .setCustomId('budget')
    .setLabel('Orçamento / produto de interesse')
    .setPlaceholder('Ex: R$ 50 / Pack PRF')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(details),
    new ActionRowBuilder().addComponents(budget)
  );

  await interaction.showModal(modal);
}

async function handleModal(interaction) {
  const type = interaction.customId.replace('ticket_modal_', '');

  const existing = interaction.guild.channels.cache.find(
    c => c.topic === `owner:${interaction.user.id}`
  );

  if (existing) {
    return interaction.reply({
      content: `Você já possui um ticket: ${existing}`,
      ephemeral: true
    });
  }

  const channel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 90),
    type: ChannelType.GuildText,
    parent: process.env.TICKET_CATEGORY_ID,
    topic: `owner:${interaction.user.id}`,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      },
      {
        id: process.env.STAFF_ROLE_ID,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      }
    ]
  });

  const details = interaction.fields.getTextInputValue('details');
  const budget = interaction.fields.getTextInputValue('budget') || 'Não informado';

  const embed = new EmbedBuilder()
    .setTitle(`🎫 ${labelMap[type] || type}`)
    .setDescription(`Olá ${interaction.user}, a equipe já pode atender você.`)
    .addFields(
      { name: 'Solicitação', value: details.slice(0, 1024) },
      { name: 'Orçamento / interesse', value: budget.slice(0, 1024) }
    )
    .setColor('#111111')
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('Fechar ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    content: `<@&${process.env.STAFF_ROLE_ID}>`,
    embeds: [embed],
    components: [row]
  });

  await interaction.reply({
    content: `✅ Ticket criado: ${channel}`,
    ephemeral: true
  });

  const logs = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
  if (logs) {
    await logs.send(
      `🎫 Novo ticket ${channel} • ${interaction.user} • ${labelMap[type] || type}`
    );
  }
}

module.exports = { handleButton, handleModal };

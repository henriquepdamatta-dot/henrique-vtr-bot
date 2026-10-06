const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const {
  buildTicketPanel,
  buildHowToBuyPanel,
  buildProductsPanel
} = require('./panelBuilders');

async function getChannel(guild, id) {
  if (!id) return null;
  return guild.channels.fetch(id).catch(() => null);
}

async function sendPanel(interaction, channelId, type) {
  const channel = await getChannel(interaction.guild, channelId);

  if (!channel || !channel.isTextBased()) {
    return interaction.reply({
      content: '❌ Canal não encontrado ou não é um canal de texto.',
      ephemeral: true
    });
  }

  let payload;
  let label;

  if (type === 'ticket') {
    payload = buildTicketPanel();
    label = 'painel de tickets';
  } else if (type === 'buy') {
    payload = buildHowToBuyPanel();
    label = 'mensagem de como comprar';
  } else if (type === 'products') {
    payload = buildProductsPanel();
    label = 'catálogo';
  } else {
    return interaction.reply({ content: 'Tipo de painel inválido.', ephemeral: true });
  }

  await channel.send(payload);

  if (interaction.deferred || interaction.replied) {
    return interaction.followUp({
      content: `✅ ${label} enviado para ${channel}.`,
      ephemeral: true
    });
  }

  return interaction.reply({
    content: `✅ ${label} enviado para ${channel}.`,
    ephemeral: true
  });
}

async function handleButton(interaction) {
  if (!interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID)) {
    return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
  }

  if (interaction.customId === 'admin_quick_ticket') {
    return sendPanel(
      interaction,
      process.env.TICKET_PANEL_CHANNEL_ID || '1557098650960662578',
      'ticket'
    );
  }

  if (interaction.customId === 'admin_quick_buy') {
    return sendPanel(
      interaction,
      process.env.HOW_TO_BUY_CHANNEL_ID || '1557098294080053309',
      'buy'
    );
  }

  if (interaction.customId === 'admin_quick_products') {
    if (!process.env.PRODUCTS_CHANNEL_ID) {
      return interaction.reply({
        content: '⚠️ PRODUCTS_CHANNEL_ID ainda não foi definido. Use o seletor de canal do /painel.',
        ephemeral: true
      });
    }

    return sendPanel(interaction, process.env.PRODUCTS_CHANNEL_ID, 'products');
  }

  if (interaction.customId.startsWith('admin_custom_')) {
    const [, , type, channelId] = interaction.customId.split('_');
    return sendPanel(interaction, channelId, type);
  }
}

async function handleChannelSelect(interaction) {
  if (!interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID)) {
    return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
  }

  const channelId = interaction.values[0];
  const channel = await getChannel(interaction.guild, channelId);

  if (!channel || !channel.isTextBased()) {
    return interaction.reply({ content: 'Canal inválido.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setTitle('📤 Publicar neste canal')
    .setDescription(`Destino selecionado: ${channel}\nEscolha qual mensagem deseja enviar.`)
    .setColor('#111111');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`admin_custom_ticket_${channelId}`)
      .setLabel('Abrir Ticket')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`admin_custom_buy_${channelId}`)
      .setLabel('Como Comprar')
      .setEmoji('🛒')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`admin_custom_products_${channelId}`)
      .setLabel('Catálogo')
      .setEmoji('🚔')
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true
  });
}

module.exports = { handleButton, handleChannelSelect };

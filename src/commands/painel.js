const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Abre o painel administrativo para publicar as mensagens do servidor.'),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID))
      return interaction.reply({ content: 'Sem permissão.', ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Painel Henrique VTR')
      .setDescription(
        [
          'Escolha abaixo o que deseja publicar.',
          '',
          `🎫 **Abrir ticket** → <#${process.env.TICKET_PANEL_CHANNEL_ID || '1557098650960662578'}>`,
          `🛒 **Como comprar** → <#${process.env.HOW_TO_BUY_CHANNEL_ID || '1557098294080053309'}>`,
          process.env.PRODUCTS_CHANNEL_ID
            ? `🚔 **Catálogo** → <#${process.env.PRODUCTS_CHANNEL_ID}>`
            : '🚔 **Catálogo** → use o seletor de canal abaixo ou defina PRODUCTS_CHANNEL_ID.',
          '',
          'Você também pode escolher qualquer canal de texto no seletor e depois escolher qual painel enviar para ele.'
        ].join('\n')
      )
      .setColor('#111111');

    const quickRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('admin_quick_ticket')
        .setLabel('Enviar Abrir Ticket')
        .setEmoji('🎫')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('admin_quick_buy')
        .setLabel('Enviar Como Comprar')
        .setEmoji('🛒')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('admin_quick_products')
        .setLabel('Enviar Catálogo')
        .setEmoji('🚔')
        .setStyle(ButtonStyle.Secondary)
    );

    const channelRow = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('admin_choose_channel')
        .setPlaceholder('Escolher outro canal para publicar...')
        .addChannelTypes(ChannelType.GuildText)
    );

    await interaction.reply({
      embeds: [embed],
      components: [quickRow, channelRow],
      ephemeral: true
    });
  }
};

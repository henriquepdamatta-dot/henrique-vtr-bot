const { SlashCommandBuilder } = require('discord.js');
const { buildTicketPanel } = require('../utils/panelBuilders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel-ticket')
    .setDescription('Envia o painel principal de tickets.'),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID))
      return interaction.reply({ content: 'Sem permissão.', ephemeral: true });

    await interaction.channel.send(buildTicketPanel());
    await interaction.reply({ content: '✅ Painel de tickets enviado.', ephemeral: true });
  }
};

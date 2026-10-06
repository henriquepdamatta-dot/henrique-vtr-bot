const { SlashCommandBuilder } = require('discord.js');
const { buildProductsPanel } = require('../utils/panelBuilders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel-produtos')
    .setDescription('Envia o catálogo de VTRs e produtos.'),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID))
      return interaction.reply({ content: 'Sem permissão.', ephemeral: true });

    const payload = buildProductsPanel();
    await interaction.channel.send(payload);
    await interaction.reply({ content: '✅ Catálogo enviado.', ephemeral: true });
  }
};

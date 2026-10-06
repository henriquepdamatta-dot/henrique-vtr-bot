const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../../data/products.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('produtos')
    .setDescription('Lista os produtos cadastrados.'),

  async execute(interaction) {
    const products = JSON.parse(fs.readFileSync(file, 'utf8')).filter(p => p.active !== false);

    if (!products.length) {
      return interaction.reply({ content: 'Nenhum produto cadastrado.', ephemeral: true });
    }

    const text = products
      .map(p => `**${p.name}** • ${p.category} • R$ ${Number(p.price).toFixed(2)} • \`${p.id}\``)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('📦 Produtos')
      .setDescription(text.slice(0, 4000))
      .setColor('#111111');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

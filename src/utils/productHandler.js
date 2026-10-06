const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../../data/products.json');

async function handleSelect(interaction) {
  const products = JSON.parse(fs.readFileSync(file, 'utf8'));
  const p = products.find(x => x.id === interaction.values[0]);

  if (!p) {
    return interaction.reply({ content: 'Produto não encontrado.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setTitle(`🚔 ${p.name}`)
    .setDescription(p.description)
    .addFields(
      { name: 'Categoria', value: p.category, inline: true },
      { name: 'Preço', value: `R$ ${Number(p.price).toFixed(2)}`, inline: true },
      { name: 'Código', value: p.id, inline: true }
    )
    .setColor('#111111');

  if (p.image) embed.setImage(p.image);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`product_buy_${p.id}`)
      .setLabel('Comprar / abrir ticket')
      .setEmoji('🛒')
      .setStyle(ButtonStyle.Success)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function handleButton(interaction) {
  if (!interaction.customId.startsWith('product_buy_')) return;

  const id = interaction.customId.replace('product_buy_', '');
  const products = JSON.parse(fs.readFileSync(file, 'utf8'));
  const p = products.find(x => x.id === id);

  if (!p) {
    return interaction.reply({ content: 'Produto não encontrado.', ephemeral: true });
  }

  await interaction.reply({
    content: `🛒 Você selecionou **${p.name}** por **R$ ${Number(p.price).toFixed(2)}**.\nUse o botão **Comprar** no painel de tickets e informe o código \`${p.id}\`.`,
    ephemeral: true
  });
}

module.exports = { handleSelect, handleButton };

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const file = path.join(__dirname, '../../data/products.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('produto-adicionar')
    .setDescription('Adiciona uma VTR ou produto ao catálogo.')
    .addStringOption(o => o.setName('nome').setDescription('Nome do produto').setRequired(true))
    .addStringOption(o => o.setName('categoria').setDescription('Ex: PMERJ, PRF, Civil, Pack, Skin').setRequired(true))
    .addNumberOption(o => o.setName('preco').setDescription('Preço').setRequired(true))
    .addStringOption(o => o.setName('descricao').setDescription('Descrição').setRequired(true))
    .addStringOption(o => o.setName('imagem').setDescription('URL da imagem').setRequired(false))
    .addStringOption(o => o.setName('canal').setDescription('ID do canal correto para postagem automática').setRequired(false)),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID))
      return interaction.reply({ content: 'Sem permissão.', ephemeral: true });

    const products = JSON.parse(fs.readFileSync(file, 'utf8'));
    const product = {
      id: crypto.randomBytes(4).toString('hex'),
      name: interaction.options.getString('nome'),
      category: interaction.options.getString('categoria'),
      price: interaction.options.getNumber('preco'),
      description: interaction.options.getString('descricao'),
      image: interaction.options.getString('imagem') || null,
      channelId: interaction.options.getString('canal') || null,
      active: true
    };

    products.push(product);
    fs.writeFileSync(file, JSON.stringify(products, null, 2));

    const embed = new EmbedBuilder()
      .setTitle(`🚔 ${product.name}`)
      .setDescription(product.description)
      .addFields(
        { name: 'Categoria', value: product.category, inline: true },
        { name: 'Preço', value: `R$ ${product.price.toFixed(2)}`, inline: true },
        { name: 'Código', value: product.id, inline: true }
      )
      .setColor('#111111');

    if (product.image) embed.setImage(product.image);

    if (product.channelId) {
      const channel = await interaction.guild.channels.fetch(product.channelId).catch(() => null);
      if (channel?.isTextBased()) {
        await channel.send({ embeds: [embed] });
      }
    }

    await interaction.reply({
      content: `✅ Produto **${product.name}** cadastrado${product.channelId ? ' e enviado ao canal configurado' : ''}.`,
      ephemeral: true
    });
  }
};

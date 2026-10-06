require('dotenv').config();
const {
  Client, GatewayIntentBits, Partials, Collection,
  REST, Routes
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.commands = new Collection();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

client.once('ready', async () => {
  console.log(`✅ Online como ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Comandos registrados.');
  } catch (e) {
    console.error('Erro registrando comandos:', e);
  }
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction, client);
      return;
    }

    if (interaction.isButton()) {
      const ticket = require('./utils/ticketHandler');
      const product = require('./utils/productHandler');
      const admin = require('./utils/adminPanelHandler');

      if (interaction.customId.startsWith('admin_')) return admin.handleButton(interaction, client);
      if (interaction.customId.startsWith('ticket_')) return ticket.handleButton(interaction, client);
      if (interaction.customId.startsWith('product_')) return product.handleButton(interaction, client);
    }

    if (interaction.isChannelSelectMenu()) {
      const admin = require('./utils/adminPanelHandler');
      if (interaction.customId === 'admin_choose_channel') return admin.handleChannelSelect(interaction, client);
    }

    if (interaction.isStringSelectMenu()) {
      const product = require('./utils/productHandler');
      if (interaction.customId === 'product_select') return product.handleSelect(interaction, client);
    }

    if (interaction.isModalSubmit()) {
      const ticket = require('./utils/ticketHandler');
      if (interaction.customId.startsWith('ticket_modal_')) return ticket.handleModal(interaction, client);
    }
  } catch (e) {
    console.error(e);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ Ocorreu um erro ao executar esta ação.',
        ephemeral: true
      }).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

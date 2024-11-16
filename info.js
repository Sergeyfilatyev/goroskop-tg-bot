const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();

const botToken = process.env.BOT_TOKEN_TEST;

const bot = new Telegraf(botToken);

bot.on("message", (ctx) => {
  console.log("Ваш chat_id:", ctx.chat.id);
});
bot.launch();

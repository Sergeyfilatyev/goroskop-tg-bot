const { Telegraf } = require("telegraf");
require("dotenv").config();
const horoscopes = require("./horoscopes.json");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ch1 = process.env.CH_1;
const ch2 = process.env.CH_2;
const ch3 = process.env.CH_3;
const link1 = process.env.LINK_1;
const link2 = process.env.LINK_2;
const link3 = process.env.LINK_3;

const userData = {};
const channelInfo = {
  [link1]: "Я люблю",
  [link2]: "Я хочу",
  [link3]: "Гороскоп | OK",
};
// Устанавливаем команды бота
bot.telegram.setMyCommands([
  { command: "/start", description: "Перезапустить Гороскоп" },
]);

// Обработка команды /start
bot.start((ctx) => {
  const firstName = ctx.from.first_name || "друг";
  ctx.reply(
    `Привет, ${firstName}!\n Этот гороскоп создаст для тебя уникальный прогноз, чтобы приоткрыть завесу твоей судьбы!💚`
  );
  // Предлагаем выбрать знак зодиака
  return askForZodiac(ctx);
});

// Словарь знаков зодиака с эмодзи
const zodiacEmojis = {
  Овен: "♈️",
  Телец: "♉️",
  Близнецы: "♊️",
  Рак: "♋️",
  Лев: "♌️",
  Дева: "♍️",
  Весы: "♎️",
  Скорпион: "♏️",
  Стрелец: "♐️",
  Козерог: "♑️",
  Водолей: "♒️",
  Рыбы: "♓️",
};

// Функция для запроса знака зодиака
function askForZodiac(ctx) {
  // Создаем кнопки для знаков зодиака, расположенные в 3 ряда
  const zodiacSigns = Object.keys(zodiacEmojis);
  const zodiacButtons = [];
  for (let i = 0; i < zodiacSigns.length; i += 4) {
    zodiacButtons.push(
      zodiacSigns.slice(i, i + 4).map((sign) => ({
        text: `${zodiacEmojis[sign]} ${sign}`,
        callback_data: `zodiac_${sign}`,
      }))
    );
  }

  ctx.reply("Ваш знак зодиака:", {
    reply_markup: {
      inline_keyboard: zodiacButtons,
    },
  });
}

// Обработка выбора знака зодиака
bot.action(/zodiac_(.+)/, (ctx) => {
  const zodiacSign = ctx.match[1];
  const userId = ctx.from.id;

  // Сохраняем выбранный знак зодиака
  userData[userId] = { zodiacSign };

  // Спрашиваем пол
  ctx.answerCbQuery();
  ctx.reply("Ты парень или девочка?", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "👨", callback_data: "gender_male" },
          { text: "👩", callback_data: "gender_female" },
        ],
        [{ text: "🔙 Вернуться в главное меню", callback_data: "restart" }],
      ],
    },
  });
});

// Обработка выбора пола
bot.action(/gender_(.+)/, (ctx) => {
  const gender = ctx.match[1];
  const userId = ctx.from.id;

  // Сохраняем пол
  userData[userId].gender = gender;

  // Спрашиваем возраст
  ctx.answerCbQuery();
  ctx.reply("Сколько тебе лет?", {
    reply_markup: {
      keyboard: [[{ text: "🔙 Вернуться в главное меню" }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

// Обработка ввода возраста и кнопки "Вернуться в главное меню"
bot.on("text", (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;

  if (text === "🔙 Вернуться в главное меню") {
    return restartBot(ctx);
  }

  // Если возраст еще не задан
  if (!userData[userId].age) {
    const age = parseInt(text);
    if (isNaN(age)) {
      ctx.reply("Пожалуйста, введите корректный возраст.");
    } else if (age < 7) {
      ctx.reply(
        "Возраст должен быть не менее 7 лет. Пожалуйста, введите корректный возраст."
      );
    } else {
      userData[userId].age = age;

      // Предлагаем главное меню
      ctx.reply("Специально для тебя 🖤", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🌅 Гороскоп на сегодня", callback_data: "option_today" }],
            [{ text: "📅 Гороскоп на год", callback_data: "option_year" }],
            [
              {
                text: "💞 Знак судьбы",
                callback_data: "option_destiny",
              },
            ],
            [{ text: "🔙 Вернуться в главное меню", callback_data: "restart" }],
          ],
        },
      });
    }
  } else {
    ctx.reply("Пожалуйста, выберите опцию из меню.", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🌅 Гороскоп на сегодня", callback_data: "option_today" }],
          [{ text: "📅 Гороскоп на год", callback_data: "option_year" }],
          [
            {
              text: "💞 Знак судьбы",
              callback_data: "option_destiny",
            },
          ],
          [{ text: "🔙 Вернуться в главное меню", callback_data: "restart" }],
        ],
      },
    });
  }
});

// Обработка выбора основной опции
bot.action(/option_(.+)/, async (ctx) => {
  const option = ctx.match[1];
  const userId = ctx.from.id;

  ctx.answerCbQuery();

  // Сохраняем выбранную опцию
  userData[userId].selectedOption = option;

  // Отправляем промежуточные сообщения
  await ctx.reply("🔮 Связываемся со звездами...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await ctx.reply("✨ Вычисляем вашу судьбу...");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Предлагаем подписаться на каналы

  await ctx.reply(
    "Пожалуйста, подпишитесь на следующие каналы, чтобы получить ваш гороскоп:",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `${channelInfo[link1]}`,
              url: `https://t.me/${link1.replace("@", "")}`,
            },
            {
              text: `${channelInfo[link2]}`,
              url: `https://t.me/${link2.replace("@", "")}`,
            },
            {
              text: `${channelInfo[link3]}`,
              url: `https://t.me/${link3.replace("@", "")}`,
            },
          ],
          [{ text: "✅ Я подписался", callback_data: "subscribed" }],
          [{ text: "🔙 Вернуться в главное меню", callback_data: "restart" }],
        ],
      },
    }
  );
});

// Обработка подтверждения подписки
bot.action("subscribed", async (ctx) => {
  ctx.answerCbQuery();
  const userId = ctx.from.id;
  const user = userData[userId];

  const requiredChannels = [ch1, ch2, ch3];

  // Проверяем подписку на каждый канал
  let notSubscribedChannels = [];

  for (const channel of requiredChannels) {
    try {
      const chatMember = await bot.telegram.getChatMember(channel, userId);
      if (chatMember.status === "left" || chatMember.status === "kicked") {
        notSubscribedChannels.push(channel);
      }
    } catch (error) {
      console.log(`Ошибка при проверке подписки на канал ${channel}:`, error);
      notSubscribedChannels.push(channel);
    }
  }

  if (notSubscribedChannels.length > 0) {
    // Пользователь не подписан на все каналы
    await ctx.reply(
      "Вы не подписаны на все необходимые каналы. Пожалуйста, подпишитесь, чтобы получить гороскоп.",
      {
        reply_markup: {
          inline_keyboard: [
            notSubscribedChannels.map((channel) => ({
              text: `${channelInfo[channel]}`,
              url: `https://t.me/${channel.replace("@", "")}`,
            })),
            [{ text: "✅ Я подписался", callback_data: "subscribed" }],
            [{ text: "🔙 Вернуться в главное меню", callback_data: "restart" }],
          ],
        },
      }
    );
  } else {
    // Пользователь подписан на все каналы
    // Получаем нужный гороскоп
    const { zodiacSign, gender, age, selectedOption } = user;
    const category = user.selectedOption.replace("option_", "");
    const zodiacMapping = {
      Овен: "Aries",
      Телец: "Taurus",
      Близнецы: "Gemini",
      Рак: "Cancer",
      Лев: "Leo",
      Дева: "Virgo",
      Весы: "Libra",
      Скорпион: "Scorpio",
      Стрелец: "Sagittarius",
      Козерог: "Capricorn",
      Водолей: "Aquarius",
      Рыбы: "Pisces",
    };
    const zodiacSignEnglish = zodiacMapping[zodiacSign];
    const horoscopesList = horoscopes[zodiacSignEnglish][gender][category];

    // Проверяем, что гороскопы для данной категории существуют
    if (horoscopesList && horoscopesList.length > 0) {
      // Выбираем случайный гороскоп
      const horoscope =
        horoscopesList[Math.floor(Math.random() * horoscopesList.length)];

      // Отправляем гороскоп
      await ctx.reply(
        `\nИндивидуальный гороскоп только для тебя🧡\n\n✨${horoscope}✨\n `
      );
    } else {
      await ctx.reply("К сожалению, гороскопы для вашей категории не найдены.");
    }
    const adminChatId = process.env.YOUR_CHAT_ID;
    if (zodiacSign && gender && age && selectedOption) {
      const userInfo = `Новый запрос от пользователя:
Имя: ${ctx.from.first_name || "Не указано"}
Пользователь: @${ctx.from.username || "Не указан"}
ID: ${ctx.from.id}
Знак зодиака: ${zodiacSign}
Пол: ${gender === "male" ? "Муж" : "Жен"}
Возраст: ${age}
Выбранная опция: ${category}`;

      await bot.telegram.sendMessage(adminChatId, userInfo);
    } else {
      console.log(
        "Некоторые данные пользователя отсутствуют. Информация не отправлена."
      );
    }
    await ctx.reply("Хотите вернуться в главное меню?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔙 Вернуться в главное меню", callback_data: "restart" }],
        ],
      },
    });
  }
});

// Обработка кнопки "Вернуться в главное меню"
bot.action("restart", (ctx) => {
  ctx.answerCbQuery();
  // Очищаем данные пользователя
  delete userData[ctx.from.id];
  // Перезапускаем бота
  ctx.reply("Возвращаемся в главное меню...");
  return askForZodiac(ctx);
});

// Обработка ошибок при нажатии на кнопки без контекста
bot.on("callback_query", (ctx) => {
  ctx.answerCbQuery("Пожалуйста, начните сначала, используя команду /start");
});

// Функция перезапуска бота
function restartBot(ctx) {
  // Очищаем данные пользователя
  delete userData[ctx.from.id];
  // Перезапускаем бота
  ctx.reply("Возвращаемся в главное меню...");
  return askForZodiac(ctx);
}

bot.launch();
console.log("Бот запущен");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

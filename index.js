const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits,
  ChannelType,
  OverwriteType,
} = require("discord.js");

// =====================================================
//                    CONFIG - عدّل هنا فقط
// =====================================================

const CONFIG = {
  // التوكن يوضع في Railway Variables باسم DISCORD_TOKEN
  GUILD_ID: "1522093054365012078",

  // من يستطيع إرسال بانل التذاكر بأمر !ticketpanel
  PANEL_ROLE_IDS: [
    "1522093054507614300",
    "1532767584326385664",
  ],

  // من يستطيع استلام وإغلاق التذكرة
  TICKET_STAFF_ROLE_IDS: [
    "1522093054452957329",
    "1522093054452957328",
  ],

  // من يستطيع إعادة فتح التذكرة بعد الإغلاق
  REOPEN_ROLE_IDS: [
    "1522093054507614300",
    "1532767584326385664",
  ],

  // من يستطيع حذف التذكرة بعد الإغلاق
  DELETE_ROLE_IDS: [
    "1522093054507614300",
    "1532767584326385664",
  ],

  // من يظل يرى التذكرة وهي مغلقة
  CLOSED_VIEW_ROLE_IDS: [
    "1522093054507614300",
    "1532767584326385664",
  ],

  // كل نوع تذكرة له Category مستقلة
  TICKET_CATEGORY_IDS: {
    support: "1522093063369920700",
    monitoring: "1522093063588020290",
    player_complaint: "1522093064108249159",
    staff_complaint: "STAFF_COMPLAINT_CATEGORY_ID",
    bug_report: "1522093064942915656",
  },

  // اتشانل إشعار الأولوية لكل نوع تذكرة
  // التذكرة نفسها لا تنتقل عند تغيير الأولوية.
  PRIORITY_NOTIFICATION_CHANNEL_IDS: {
    support: {
      normal: "SUPPORT_NORMAL_CHANNEL_ID",
      important: "SUPPORT_IMPORTANT_CHANNEL_ID",
      urgent: "SUPPORT_URGENT_CHANNEL_ID",
    },
    monitoring: {
      normal: "MONITORING_NORMAL_CHANNEL_ID",
      important: "MONITORING_IMPORTANT_CHANNEL_ID",
      urgent: "MONITORING_URGENT_CHANNEL_ID",
    },
    player_complaint: {
      normal: "PLAYER_COMPLAINT_NORMAL_CHANNEL_ID",
      important: "PLAYER_COMPLAINT_IMPORTANT_CHANNEL_ID",
      urgent: "PLAYER_COMPLAINT_URGENT_CHANNEL_ID",
    },
    staff_complaint: {
      normal: "STAFF_COMPLAINT_NORMAL_CHANNEL_ID",
      important: "STAFF_COMPLAINT_IMPORTANT_CHANNEL_ID",
      urgent: "STAFF_COMPLAINT_URGENT_CHANNEL_ID",
    },
    bug_report: {
      normal: "BUG_REPORT_NORMAL_CHANNEL_ID",
      important: "BUG_REPORT_IMPORTANT_CHANNEL_ID",
      urgent: "BUG_REPORT_URGENT_CHANNEL_ID",
    },
  },

  // اتشانل لوج الإغلاق - لو سبتها Placeholder مش هيبعت لوج
  CLOSE_LOG_CHANNEL_ID: "CLOSE_LOG_CHANNEL_ID",

  // صورة بانل التذاكر
  PANEL_IMAGE_URL:
    "https://cdn.discordapp.com/attachments/1523767129629917315/1539717509199040523/IMG_0188.png?ex=6a87552c&is=6a8603ac&hm=01e6d5cdce37020fad09a0221ac9f8f8ba853da353b96277882b105b3b750e0e&",

  BLUE_COLOR: 0x1e90ff,
  TICKET_PREFIX: "ticket",
};

// =====================================================
//                       DATA
// =====================================================

const TICKET_TYPES = {
  support: {
    label: "الدعم الفني",
    emoji: "🛠️",
    description: "للمشاكل الفنية والبوتات والديسكورد أو مشاكل السيرفر.",
  },
  monitoring: {
    label: "الرقابة",
    emoji: "🛡️",
    description: "للتواصل مع فريق الرقابة بخصوص الحالات التي تحتاج متابعة.",
  },
  player_complaint: {
    label: "شكوى ضد شخص",
    emoji: "👤",
    description: "لتقديم شكوى ضد لاعب أو عضو مع توضيح التفاصيل والأدلة.",
  },
  staff_complaint: {
    label: "شكوى ضد إداري",
    emoji: "⚖️",
    description: "لتقديم شكوى ضد إداري.",
  },
  bug_report: {
    label: "الإبلاغ عن الأخطاء",
    emoji: "🐞",
    description: "للإبلاغ عن أخطاء أو مشاكل داخل السيرفر أو الأنظمة.",
  },
};

const PRIORITIES = {
  normal: {
    label: "عادي",
    emoji: "🔵",
    description: "حالة عادية.",
  },
  important: {
    label: "مهم",
    emoji: "🟠",
    description: "تحتاج متابعة أسرع.",
  },
  urgent: {
    label: "ضروري",
    emoji: "🔴",
    description: "تحتاج تدخل سريع.",
  },
};

// =====================================================
//                       CLIENT
// =====================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
});

// =====================================================
//                      HELPERS
// =====================================================

function isSnowflake(value) {
  return typeof value === "string" && /^\d{17,20}$/.test(value);
}

function validIds(ids = []) {
  return ids.filter(isSnowflake);
}

function hasAnyRole(member, ids = []) {
  const roles = validIds(ids);
  return roles.some((id) => member.roles.cache.has(id));
}

function canAdmin(member) {
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

function safeName(name) {
  return (
    String(name || "user")
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06ff-_]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 35) || "user"
  );
}

function parseTopic(topic = "") {
  const data = {};
  for (const part of String(topic).split("|")) {
    const [key, ...rest] = part.split(":");
    if (key && rest.length) data[key] = rest.join(":");
  }
  return data;
}

function buildTopic(data) {
  return [
    "ticket:true",
    `owner:${data.owner || "0"}`,
    `type:${data.type || "support"}`,
    `priority:${data.priority || "normal"}`,
    `claimed:${data.claimed || "0"}`,
    `status:${data.status || "open"}`,
  ].join("|");
}

function getTicketData(channel) {
  return parseTopic(channel.topic || "");
}

function isTicketChannel(channel) {
  if (!channel || channel.type !== ChannelType.GuildText) return false;
  return getTicketData(channel).ticket === "true";
}

function getType(typeKey) {
  return TICKET_TYPES[typeKey] || TICKET_TYPES.support;
}

function getPriority(priorityKey) {
  return PRIORITIES[priorityKey] || PRIORITIES.normal;
}

function ticketEmbed(channel, data) {
  const type = getType(data.type);
  const priority = getPriority(data.priority);
  const claimed =
    data.claimed && data.claimed !== "0" ? `<@${data.claimed}>` : "قريباً";

  return new EmbedBuilder()
    .setColor(CONFIG.BLUE_COLOR)
    .setTitle(`${type.emoji} ${type.label}`)
    .setDescription(
      [
        `**اسم التذكرة:** ${channel.name}`,
        `**صاحب التذكرة:** <@${data.owner}>`,
        `**نوع التذكرة:** ${type.label}`,
        `**الأولوية:** ${priority.emoji} ${priority.label}`,
        `**التذكرة استلمت بواسطة:** ${claimed}`,
      ].join("\n")
    )
    .setFooter({ text: "BLUE_TICKET_MAIN" })
    .setTimestamp();
}

function priorityRow(data) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("ticket_priority")
    .setPlaceholder(`الأولوية الحالية: ${getPriority(data.priority).label}`)
    .addOptions(
      Object.entries(PRIORITIES).map(([value, item]) => ({
        label: item.label,
        value,
        emoji: item.emoji,
        description: item.description,
        default: data.priority === value,
      }))
    );

  return new ActionRowBuilder().addComponents(menu);
}

function openButtons(data) {
  const claimed = data.claimed && data.claimed !== "0";

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_claim")
      .setLabel(claimed ? "تم الاستلام" : "استلام التذكرة")
      .setEmoji("🙋")
      .setStyle(claimed ? ButtonStyle.Secondary : ButtonStyle.Primary)
      .setDisabled(Boolean(claimed)),
    new ButtonBuilder()
      .setCustomId("ticket_add_user")
      .setLabel("إضافة شخص")
      .setEmoji("➕")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("إغلاق التذكرة")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger)
  );
}

function closedButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_reopen")
      .setLabel("إعادة فتح")
      .setEmoji("🔓")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("ticket_delete")
      .setLabel("حذف")
      .setEmoji("🗑️")
      .setStyle(ButtonStyle.Danger)
  );
}

async function findMainTicketMessage(channel) {
  const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
  if (!messages) return null;

  return (
    messages.find(
      (m) =>
        m.author.id === client.user.id &&
        m.embeds?.[0]?.footer?.text === "BLUE_TICKET_MAIN"
    ) || null
  );
}

async function refreshMainTicketMessage(channel) {
  const message = await findMainTicketMessage(channel);
  if (!message) return;

  const data = getTicketData(channel);

  if (data.status === "closed") {
    await message
      .edit({
        embeds: [ticketEmbed(channel, data)],
        components: [closedButtons()],
      })
      .catch(() => {});
  } else {
    await message
      .edit({
        embeds: [ticketEmbed(channel, data)],
        components: [priorityRow(data), openButtons(data)],
      })
      .catch(() => {});
  }
}

async function sendPriorityNotification(guild, channel, data, changedById, isNew) {
  const channelId =
    CONFIG.PRIORITY_NOTIFICATION_CHANNEL_IDS?.[data.type]?.[data.priority];

  if (!isSnowflake(channelId)) return;

  const notifyChannel =
    guild.channels.cache.get(channelId) ||
    (await guild.channels.fetch(channelId).catch(() => null));

  if (!notifyChannel?.isTextBased()) return;

  const type = getType(data.type);
  const priority = getPriority(data.priority);

  const embed = new EmbedBuilder()
    .setColor(CONFIG.BLUE_COLOR)
    .setTitle(
      `${priority.emoji} ${
        isNew ? "تذكرة جديدة" : "تم تغيير أولوية التذكرة"
      }`
    )
    .addFields(
      { name: "نوع التذكرة", value: type.label, inline: true },
      { name: "الأولوية", value: priority.label, inline: true },
      { name: "صاحب التذكرة", value: `<@${data.owner}>`, inline: true },
      {
        name: isNew ? "تم الفتح بواسطة" : "تم التغيير بواسطة",
        value: `<@${changedById}>`,
        inline: true,
      },
      { name: "اسم التذكرة", value: channel.name, inline: false }
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("الدخول إلى التذكرة")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${guild.id}/${channel.id}`)
  );

  await notifyChannel.send({ embeds: [embed], components: [row] }).catch(() => {});
}

async function sendTicketPanel(channel) {
  const embed = new EmbedBuilder()
    .setColor(CONFIG.BLUE_COLOR)
    .setTitle("🎫 نظام التذاكر")
    .setDescription(
      [
        "اختر نوع التذكرة من القائمة بالأسفل.",
        "",
        "كل تذكرة تفتح تلقائياً بأولوية 🔵 **عادي**.",
        "بعد فتح التذكرة تقدر تغيّر الأولوية من داخلها إلى **عادي / مهم / ضروري**.",
      ].join("\n")
    )
    .setFooter({ text: "اختر القسم المناسب" });

  if (CONFIG.PANEL_IMAGE_URL?.startsWith("http")) {
    embed.setImage(CONFIG.PANEL_IMAGE_URL);
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("ticket_type")
    .setPlaceholder("اختر نوع التذكرة")
    .addOptions(
      Object.entries(TICKET_TYPES).map(([value, item]) => ({
        label: item.label,
        value,
        emoji: item.emoji,
        description: item.description.slice(0, 100),
      }))
    );

  await channel.send({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(menu)],
  });
}

// =====================================================
//                    CREATE TICKET
// =====================================================

async function createTicket(interaction, typeKey) {
  const guild = interaction.guild;
  const type = TICKET_TYPES[typeKey];

  if (!type) {
    return interaction.reply({
      content: "❌ نوع التذكرة غير صحيح.",
      ephemeral: true,
    });
  }

  const categoryId = CONFIG.TICKET_CATEGORY_IDS[typeKey];

  if (!isSnowflake(categoryId)) {
    return interaction.reply({
      content: `❌ كاتجوري **${type.label}** لم يتم وضع ID صحيح لها في index.js.`,
      ephemeral: true,
    });
  }

  const existing = guild.channels.cache.find((channel) => {
    if (!isTicketChannel(channel)) return false;
    const data = getTicketData(channel);
    return data.owner === interaction.user.id && data.status === "open";
  });

  if (existing) {
    return interaction.reply({
      content: `❌ عندك تذكرة مفتوحة بالفعل: ${existing}`,
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const roleIds = [
    ...new Set([
      ...validIds(CONFIG.TICKET_STAFF_ROLE_IDS),
      ...validIds(CONFIG.REOPEN_ROLE_IDS),
      ...validIds(CONFIG.DELETE_ROLE_IDS),
      ...validIds(CONFIG.CLOSED_VIEW_ROLE_IDS),
    ]),
  ];

  const permissionOverwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
      ],
    },
    ...roleIds.map((roleId) => ({
      id: roleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
      ],
    })),
  ];

  let channel;

  try {
    channel = await guild.channels.create({
      name: `${CONFIG.TICKET_PREFIX}-${typeKey}-${safeName(
        interaction.user.username
      )}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      topic: buildTopic({
        owner: interaction.user.id,
        type: typeKey,
        priority: "normal",
        claimed: "0",
        status: "open",
      }),
      permissionOverwrites,
    });
  } catch (error) {
    console.error("CREATE TICKET ERROR:", error);
    return interaction.editReply(
      "❌ البوت لم يقدر ينشئ التذكرة. تأكد أن ID الكاتجوري صحيح وأن البوت عنده Manage Channels."
    );
  }

  const data = getTicketData(channel);

  await channel.send({
    content: `<@${interaction.user.id}> ${validIds(CONFIG.TICKET_STAFF_ROLE_IDS)
      .map((id) => `<@&${id}>`)
      .join(" ")}`,
    embeds: [ticketEmbed(channel, data)],
    components: [priorityRow(data), openButtons(data)],
    allowedMentions: {
      users: [interaction.user.id],
      roles: validIds(CONFIG.TICKET_STAFF_ROLE_IDS),
    },
  });

  await sendPriorityNotification(
    guild,
    channel,
    data,
    interaction.user.id,
    true
  );

  await interaction.editReply(
    `✅ تم فتح تذكرتك: ${channel}\n🔵 الأولوية الافتراضية: **عادي**`
  );
}

// =====================================================
//                    CLOSE TICKET
// =====================================================

async function closeTicket(interaction, reason) {
  const channel = interaction.channel;
  const data = getTicketData(channel);

  if (
    !hasAnyRole(interaction.member, CONFIG.TICKET_STAFF_ROLE_IDS) &&
    !canAdmin(interaction.member)
  ) {
    return interaction.reply({
      content: "❌ ليس لديك صلاحية إغلاق التذكرة.",
      ephemeral: true,
    });
  }

  if (data.status === "closed") {
    return interaction.reply({
      content: "❌ التذكرة مغلقة بالفعل.",
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  const type = getType(data.type);
  const priority = getPriority(data.priority);
  const unix = Math.floor(Date.now() / 1000);
  const claimed =
    data.claimed && data.claimed !== "0"
      ? `<@${data.claimed}>`
      : "لم يتم الاستلام";

  const closeEmbed = new EmbedBuilder()
    .setColor(CONFIG.BLUE_COLOR)
    .setTitle("🔒 تم إغلاق التذكرة")
    .addFields(
      { name: "اسم التذكرة", value: channel.name, inline: false },
      { name: "صاحب التذكرة", value: `<@${data.owner}>`, inline: true },
      { name: "نوع التذكرة", value: type.label, inline: true },
      {
        name: "الأولوية",
        value: `${priority.emoji} ${priority.label}`,
        inline: true,
      },
      { name: "استلمت بواسطة", value: claimed, inline: true },
      {
        name: "تم القفل بواسطة",
        value: `<@${interaction.user.id}>`,
        inline: true,
      },
      { name: "وقت الإغلاق", value: `<t:${unix}:F>`, inline: false },
      { name: "سبب الإغلاق", value: reason.slice(0, 1024), inline: false }
    )
    .setTimestamp();

  // DM لصاحب التذكرة
  const owner = await client.users.fetch(data.owner).catch(() => null);
  if (owner) {
    await owner.send({ embeds: [closeEmbed] }).catch(() => {});
  }

  // DM للشخص المستلم
  if (data.claimed && data.claimed !== "0" && data.claimed !== data.owner) {
    const claimer = await client.users.fetch(data.claimed).catch(() => null);
    if (claimer) {
      await claimer.send({ embeds: [closeEmbed] }).catch(() => {});
    }
  }

  // لوج الإغلاق
  if (isSnowflake(CONFIG.CLOSE_LOG_CHANNEL_ID)) {
    const logChannel =
      interaction.guild.channels.cache.get(CONFIG.CLOSE_LOG_CHANNEL_ID) ||
      (await interaction.guild.channels
        .fetch(CONFIG.CLOSE_LOG_CHANNEL_ID)
        .catch(() => null));

    if (logChannel?.isTextBased()) {
      await logChannel.send({ embeds: [closeEmbed] }).catch(() => {});
    }
  }

  // حفظ الحالة كمغلقة
  const updated = { ...data, status: "closed" };

  await channel.setTopic(buildTopic(updated)).catch(() => {});
  await channel
    .setName(`closed-${channel.name.replace(/^closed-/, "")}`.slice(0, 95))
    .catch(() => {});

  // نفس رد الإغلاق يتحول إلى بانل الإدارة؛ كده مفيش Loading يفضل معلق
  await interaction.editReply({
    embeds: [
      EmbedBuilder.from(closeEmbed).setFooter({
        text: "التذكرة مغلقة - الإدارة فقط",
      }),
    ],
    components: [closedButtons()],
  });

  // تحديث البانل الرئيسية القديمة أيضاً
  await refreshMainTicketMessage(channel);

  // صاحب التذكرة لا يرى التذكرة بعد الإغلاق
  await channel.permissionOverwrites
    .edit(data.owner, {
      ViewChannel: false,
      SendMessages: false,
    })
    .catch(() => {});

  // أي Member أُضيف للتذكرة يتم إخفاؤه بعد الإغلاق
  for (const overwrite of channel.permissionOverwrites.cache.values()) {
    if (
      overwrite.type === OverwriteType.Member &&
      overwrite.id !== client.user.id &&
      overwrite.id !== data.owner
    ) {
      await channel.permissionOverwrites
        .edit(overwrite.id, {
          ViewChannel: false,
          SendMessages: false,
        })
        .catch(() => {});
    }
  }

  const keepVisibleRoles = new Set([
    ...validIds(CONFIG.CLOSED_VIEW_ROLE_IDS),
    ...validIds(CONFIG.REOPEN_ROLE_IDS),
    ...validIds(CONFIG.DELETE_ROLE_IDS),
  ]);

  // رول الستاف العادي يختفي إلا لو موجود ضمن رولات التذاكر المغلقة
  for (const roleId of validIds(CONFIG.TICKET_STAFF_ROLE_IDS)) {
    if (!keepVisibleRoles.has(roleId)) {
      await channel.permissionOverwrites
        .edit(roleId, {
          ViewChannel: false,
          SendMessages: false,
        })
        .catch(() => {});
    }
  }

  // رولات الإدارة بعد الإغلاق
  for (const roleId of keepVisibleRoles) {
    await channel.permissionOverwrites
      .edit(roleId, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      })
      .catch(() => {});
  }

}

// =====================================================
//                    REOPEN TICKET
// =====================================================

async function reopenTicket(interaction) {
  const channel = interaction.channel;
  const data = getTicketData(channel);

  if (
    !hasAnyRole(interaction.member, CONFIG.REOPEN_ROLE_IDS) &&
    !canAdmin(interaction.member)
  ) {
    return interaction.reply({
      content: "❌ ليس لديك صلاحية إعادة فتح التذكرة.",
      ephemeral: true,
    });
  }

  if (data.status !== "closed") {
    return interaction.reply({
      content: "❌ التذكرة ليست مغلقة.",
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const updated = { ...data, status: "open" };
  await channel.setTopic(buildTopic(updated)).catch(() => {});
  await channel
    .setName(channel.name.replace(/^closed-/, "").slice(0, 95))
    .catch(() => {});

  // إظهارها لصاحبها
  await channel.permissionOverwrites
    .edit(data.owner, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
      AttachFiles: true,
      EmbedLinks: true,
    })
    .catch(() => {});

  // إظهارها لرولات الاستلام والإغلاق
  for (const roleId of validIds(CONFIG.TICKET_STAFF_ROLE_IDS)) {
    await channel.permissionOverwrites
      .edit(roleId, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      })
      .catch(() => {});
  }

  await refreshMainTicketMessage(channel);

  const owner = await client.users.fetch(data.owner).catch(() => null);

  if (owner) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("الدخول إلى التذكرة")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/channels/${interaction.guild.id}/${channel.id}`
        )
    );

    const embed = new EmbedBuilder()
      .setColor(CONFIG.BLUE_COLOR)
      .setTitle("🔓 تم إعادة فتح تذكرتك")
      .setDescription(
        `تم إعادة فتح التذكرة بواسطة <@${interaction.user.id}>.`
      )
      .setTimestamp();

    await owner.send({ embeds: [embed], components: [row] }).catch(() => {});
  }

  await channel
    .send(`🔓 تم إعادة فتح التذكرة بواسطة ${interaction.user}.`)
    .catch(() => {});

  await interaction.editReply("✅ تم إعادة فتح التذكرة.");
}

// =====================================================
//                      EVENTS
// =====================================================

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity("نظام التذاكر 🎫");
});

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  if (message.content.trim().toLowerCase() !== "!ticketpanel") return;

  if (
    !hasAnyRole(message.member, CONFIG.PANEL_ROLE_IDS) &&
    !canAdmin(message.member)
  ) {
    return message.reply("❌ ليس لديك صلاحية إرسال بانل التذاكر.");
  }

  await sendTicketPanel(message.channel);
  await message.delete().catch(() => {});
});

client.on("interactionCreate", async (interaction) => {
  try {
    // اختيار نوع التذكرة
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "ticket_type"
    ) {
      return createTicket(interaction, interaction.values[0]);
    }

    // باقي التفاعلات تعمل داخل التذكرة فقط
    if (
      (interaction.isButton() ||
        interaction.isModalSubmit() ||
        interaction.isStringSelectMenu()) &&
      interaction.customId?.startsWith("ticket_")
    ) {
      if (!isTicketChannel(interaction.channel)) {
        return interaction.reply({
          content: "❌ هذا الخيار يعمل داخل التذكرة فقط.",
          ephemeral: true,
        });
      }
    }

    if (!isTicketChannel(interaction.channel)) return;

    const channel = interaction.channel;
    const data = getTicketData(channel);

    // تغيير الأولوية
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "ticket_priority"
    ) {
      if (data.status !== "open") {
        return interaction.reply({
          content: "❌ لا يمكن تغيير أولوية تذكرة مغلقة.",
          ephemeral: true,
        });
      }

      const allowed =
        interaction.user.id === data.owner ||
        hasAnyRole(interaction.member, CONFIG.TICKET_STAFF_ROLE_IDS) ||
        canAdmin(interaction.member);

      if (!allowed) {
        return interaction.reply({
          content: "❌ ليس لديك صلاحية تغيير الأولوية.",
          ephemeral: true,
        });
      }

      const newPriority = interaction.values[0];

      if (!PRIORITIES[newPriority]) {
        return interaction.reply({
          content: "❌ أولوية غير صحيحة.",
          ephemeral: true,
        });
      }

      if (data.priority === newPriority) {
        return interaction.reply({
          content: `ℹ️ الأولوية بالفعل **${getPriority(newPriority).label}**.`,
          ephemeral: true,
        });
      }

      const updated = { ...data, priority: newPriority };
      await channel.setTopic(buildTopic(updated));

      await interaction.reply({
        content: `${getPriority(newPriority).emoji} تم تغيير الأولوية إلى **${
          getPriority(newPriority).label
        }** بواسطة ${interaction.user}.`,
      });

      await sendPriorityNotification(
        interaction.guild,
        channel,
        updated,
        interaction.user.id,
        false
      );

      await refreshMainTicketMessage(channel);
      return;
    }

    // استلام
    if (interaction.isButton() && interaction.customId === "ticket_claim") {
      if (data.status !== "open") {
        return interaction.reply({
          content: "❌ التذكرة مغلقة.",
          ephemeral: true,
        });
      }

      if (
        !hasAnyRole(interaction.member, CONFIG.TICKET_STAFF_ROLE_IDS) &&
        !canAdmin(interaction.member)
      ) {
        return interaction.reply({
          content: "❌ ليس لديك صلاحية استلام التذكرة.",
          ephemeral: true,
        });
      }

      if (data.claimed && data.claimed !== "0") {
        return interaction.reply({
          content: `❌ التذكرة مستلمة بالفعل بواسطة <@${data.claimed}>.`,
          ephemeral: true,
        });
      }

      const updated = { ...data, claimed: interaction.user.id };
      await channel.setTopic(buildTopic(updated));

      await interaction.reply(
        `🙋 تم استلام التذكرة بواسطة ${interaction.user}.`
      );

      await refreshMainTicketMessage(channel);
      return;
    }

    // إضافة شخص
    if (
      interaction.isButton() &&
      interaction.customId === "ticket_add_user"
    ) {
      if (data.status !== "open") {
        return interaction.reply({
          content: "❌ التذكرة مغلقة.",
          ephemeral: true,
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("ticket_add_user_modal")
        .setTitle("إضافة شخص للتذكرة");

      const input = new TextInputBuilder()
        .setCustomId("user_id")
        .setLabel("ID الشخص")
        .setPlaceholder("123456789012345678")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }

    if (
      interaction.isModalSubmit() &&
      interaction.customId === "ticket_add_user_modal"
    ) {
      if (data.status !== "open") {
        return interaction.reply({
          content: "❌ التذكرة مغلقة.",
          ephemeral: true,
        });
      }

      const userId = interaction.fields.getTextInputValue("user_id").trim();

      if (!isSnowflake(userId)) {
        return interaction.reply({
          content: "❌ الـ ID غير صحيح.",
          ephemeral: true,
        });
      }

      const member = await interaction.guild.members
        .fetch(userId)
        .catch(() => null);

      if (!member) {
        return interaction.reply({
          content: "❌ الشخص غير موجود داخل السيرفر.",
          ephemeral: true,
        });
      }

      await channel.permissionOverwrites.edit(member.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        AttachFiles: true,
        EmbedLinks: true,
      });

      return interaction.reply(
        `✅ تم إضافة ${member} للتذكرة بواسطة ${interaction.user}.`
      );
    }

    // إغلاق - فتح المودال
    if (interaction.isButton() && interaction.customId === "ticket_close") {
      if (
        !hasAnyRole(interaction.member, CONFIG.TICKET_STAFF_ROLE_IDS) &&
        !canAdmin(interaction.member)
      ) {
        return interaction.reply({
          content: "❌ ليس لديك صلاحية إغلاق التذكرة.",
          ephemeral: true,
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("ticket_close_modal")
        .setTitle("إغلاق التذكرة");

      const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("سبب الإغلاق")
        .setPlaceholder("اكتب سبب الإغلاق...")
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(2)
        .setMaxLength(1000)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(reason));
      return interaction.showModal(modal);
    }

    // إغلاق - إرسال المودال
    if (
      interaction.isModalSubmit() &&
      interaction.customId === "ticket_close_modal"
    ) {
      const reason = interaction.fields.getTextInputValue("reason");
      return closeTicket(interaction, reason);
    }

    // إعادة فتح
    if (
      interaction.isButton() &&
      interaction.customId === "ticket_reopen"
    ) {
      return reopenTicket(interaction);
    }

    // حذف
    if (
      interaction.isButton() &&
      interaction.customId === "ticket_delete"
    ) {
      if (
        !hasAnyRole(interaction.member, CONFIG.DELETE_ROLE_IDS) &&
        !canAdmin(interaction.member)
      ) {
        return interaction.reply({
          content: "❌ ليس لديك صلاحية حذف التذكرة.",
          ephemeral: true,
        });
      }

      if (data.status !== "closed") {
        return interaction.reply({
          content: "❌ لازم التذكرة تكون مغلقة قبل حذفها.",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `🗑️ يتم حذف التذكرة بواسطة ${interaction.user}...`,
      });

      setTimeout(() => {
        channel.delete("Closed ticket deleted").catch(console.error);
      }, 1500);

      return;
    }
  } catch (error) {
    console.error("INTERACTION ERROR:", error);

    const payload = {
      content:
        "❌ حصل خطأ. راجع Railway Logs وتأكد من الـ IDs وصلاحيات البوت.",
      ephemeral: true,
    };

    if (interaction.deferred) {
      await interaction.editReply({
        content: payload.content,
        embeds: [],
        components: [],
      }).catch(() => {});
    } else if (interaction.replied) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

// =====================================================
//                       LOGIN
// =====================================================

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error("❌ DISCORD_TOKEN غير موجود في Railway Variables.");
  process.exit(1);
}

client.login(token);

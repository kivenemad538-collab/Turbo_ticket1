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
} = require("discord.js");

// =====================================================
//                 إعدادات البوت - عدّل هنا فقط
// =====================================================

const CONFIG = {
  // التوكن لا تضعه هنا. ضعه في Railway Variables باسم DISCORD_TOKEN

  GUILD_ID: "1522093054365012078",

  // الرولات المسموح لها بإرسال بانل التذاكر بواسطة الأمر !ticketpanel
  PANEL_ROLE_IDS: [
    "1522093054507614300",
    "1532767584326385664",
  ],

  // الرولات التي تستطيع استلام وإغلاق التذاكر
  TICKET_STAFF_ROLE_IDS: [
    "1522093054452957329",
    "1522093054452957328",
    // يمكنك إضافة أي عدد من الرولات
  ],

  // الرولات التي تستطيع إعادة فتح التذكرة بعد إغلاقها
  REOPEN_ROLE_IDS: [
    "1522093054507614300",
    "1532767584326385664",
  ],

  // الرولات التي تستطيع حذف التذكرة بعد إغلاقها
  DELETE_ROLE_IDS: [
    "1522093054507614300",
    "1532767584326385664",
  ],

  // الرولات الإدارية التي تظل ترى التذكرة بعد إغلاقها
  CLOSED_VIEW_ROLE_IDS: [
    "1522093054507614300",
    "1532767584326385664",,
  ],

  // كل نوع تذكرة له كاتجوري ثابت خاص به
  TICKET_CATEGORY_IDS: {
    support: "1522093063369920700",
    monitoring: "1522093063588020290",
    player_complaint: "1522093064108249159",
    staff_complaint: "STAFF_COMPLAINT_CATEGORY_ID",
    bug_report: "1522093064942915656",
  },

  // اتشانلات إشعارات الأولوية لكل نوع تذكرة
  // التذكرة لا تنتقل من كاتجوري النوع عند تغيير الأولوية؛ يتم إرسال إشعار هنا فقط.
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

  // اتشانل لوج الإغلاق
  CLOSE_LOG_CHANNEL_ID: "CLOSE_LOG_CHANNEL_ID",

  // صورة بانل التذاكر
  PANEL_IMAGE_URL: "https://cdn.discordapp.com/attachments/1523767129629917315/1539717509199040523/IMG_0188.png?ex=6a87552c&is=6a8603ac&hm=01e6d5cdce37020fad09a0221ac9f8f8ba853da353b96277882b105b3b750e0e&",

  // اللون الأزرق
  BLUE_COLOR: 0x1e90ff,

  // بادئة اسم التذكرة
  TICKET_PREFIX: "ticket",
};

// =====================================================
//                  أنواع التذاكر
// =====================================================

const TICKET_TYPES = {
  support: {
    label: "الدعم الفني",
    emoji: "🛠️",
    description: "للمشاكل الفنية، البوتات، الديسكورد أو مشاكل السيرفر.",
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
    description: "لتقديم شكوى ضد إداري، ويتم التعامل معها بسرية قدر الإمكان.",
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
    description: "تذكرة عادية ولا تحتاج تدخلاً عاجلاً.",
  },
  important: {
    label: "مهم",
    emoji: "🟠",
    description: "مشكلة مهمة وتحتاج متابعة أسرع.",
  },
  urgent: {
    label: "ضروري",
    emoji: "🔴",
    description: "حالة ضرورية وتحتاج تدخل الإدارة بأسرع وقت.",
  },
};

// =====================================================
//                     تشغيل البوت
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


function memberHasAnyRole(member, roleIds = []) {
  return roleIds.some((id) => id && member.roles.cache.has(id));
}

function safeName(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06ff-_]/gi, "-")
      .replace(/-+/g, "-")
      .slice(0, 45) || "user"
  );
}

function priorityName(priority) {
  return PRIORITIES[priority]?.label || priority;
}

function parseTopic(topic = "") {
  const data = {};
  for (const part of topic.split("|")) {
    const [k, ...rest] = part.split(":");
    if (k && rest.length) data[k.trim()] = rest.join(":").trim();
  }
  return data;
}

function buildTopic(data) {
  return [
    `ticket:true`,
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
  return channel?.type === ChannelType.GuildText && getTicketData(channel).ticket === "true";
}

function ticketMainButtons(data) {
  const claimed = data.claimed && data.claimed !== "0";

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_claim")
      .setLabel(claimed ? "تم استلام التذكرة" : "استلام التذكرة")
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

function ticketPriorityMenu(data) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("ticket_change_priority")
    .setPlaceholder(`الأولوية الحالية: ${priorityName(data.priority)}`)
    .addOptions(
      Object.entries(PRIORITIES).map(([value, item]) => ({
        label: item.label,
        value,
        description: item.description,
        emoji: item.emoji,
        default: data.priority === value,
      }))
    );

  return new ActionRowBuilder().addComponents(menu);
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

function ticketInfoEmbed(channel, data) {
  const type = TICKET_TYPES[data.type] || TICKET_TYPES.support;
  const claimedText =
    data.claimed && data.claimed !== "0" ? `<@${data.claimed}>` : "قريباً";

  return new EmbedBuilder()
    .setColor(CONFIG.BLUE_COLOR)
    .setTitle(`${type.emoji} ${type.label}`)
    .setDescription(
      [
        `**اسم التذكرة:** ${channel.name}`,
        `**صاحب التذكرة:** <@${data.owner}>`,
        `**نوع التذكرة:** ${type.label}`,
        `**الأولوية:** ${priorityName(data.priority)}`,
        `**التذكرة استلمت بواسطة:** ${claimedText}`,
        "",
        "استخدم الأزرار بالأسفل لإدارة التذكرة.",
      ].join("\n")
    )
    .setFooter({ text: "نظام التذاكر" })
    .setTimestamp();
}

async function updateTicketInfoMessage(channel) {
  const data = getTicketData(channel);
  const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
  if (!messages) return;

  const botMessage = messages.find(
    (m) =>
      m.author.id === client.user.id &&
      m.embeds[0]?.footer?.text === "نظام التذاكر"
  );

  if (botMessage) {
    await botMessage
      .edit({
        embeds: [ticketInfoEmbed(channel, data)],
        components: data.status === "closed"
          ? [closedButtons()]
          : [ticketPriorityMenu(data), ticketMainButtons(data)],
      })
      .catch(() => {});
  }
}

async function sendTicketPanel(channel) {
  const embed = new EmbedBuilder()
    .setColor(CONFIG.BLUE_COLOR)
    .setTitle("🎫 نظام التذاكر")
    .setDescription(
      [
        "اختر نوع التذكرة التي تريد فتحها من القائمة بالأسفل.",
        "",
        "كل تذكرة تُفتح تلقائياً بأولوية 🔵 **عادي**.",
        "بعد فتح التذكرة يمكنك تغيير الأولوية من داخلها إلى عادي / مهم / ضروري.",
      ].join("\n")
    )
    .setFooter({ text: "اختر القسم المناسب حتى يتم خدمتك بشكل أسرع" });

  if (CONFIG.PANEL_IMAGE_URL && !CONFIG.PANEL_IMAGE_URL.includes("PUT_YOUR")) {
    embed.setImage(CONFIG.PANEL_IMAGE_URL);
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId("ticket_type_select")
    .setPlaceholder("اختر نوع التذكرة")
    .addOptions(
      Object.entries(TICKET_TYPES).map(([value, item]) => ({
        label: item.label,
        value,
        description: item.description.slice(0, 100),
        emoji: item.emoji,
      }))
    );

  await channel.send({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(select)],
  });
}

async function createTicket(interaction, typeKey) {
  const guild = interaction.guild;
  const type = TICKET_TYPES[typeKey];
  const priorityKey = "normal";
  const priority = PRIORITIES[priorityKey];

  if (!type || !priority) {
    return interaction.reply({ content: "❌ اختيار غير صحيح.", ephemeral: true });
  }

  const existing = guild.channels.cache.find((ch) => {
    if (!isTicketChannel(ch)) return false;
    const d = getTicketData(ch);
    return d.owner === interaction.user.id && d.status === "open";
  });

  if (existing) {
    return interaction.reply({
      content: `❌ لديك تذكرة مفتوحة بالفعل: ${existing}`,
      ephemeral: true,
    });
  }

  const parentId = CONFIG.TICKET_CATEGORY_IDS[typeKey];
  const everyoneId = guild.roles.everyone.id;

  const permissionOverwrites = [
    {
      id: everyoneId,
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
    ...CONFIG.TICKET_STAFF_ROLE_IDS.filter(Boolean).map((id) => ({
      id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    })),
    ...CONFIG.REOPEN_ROLE_IDS.filter(Boolean).map((id) => ({
      id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    })),
    ...CONFIG.DELETE_ROLE_IDS.filter(Boolean).map((id) => ({
      id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    })),
  ];

  const channel = await guild.channels.create({
    name: `${CONFIG.TICKET_PREFIX}-${typeKey}-${safeName(interaction.user.username)}`,
    type: ChannelType.GuildText,
    parent: parentId || null,
    topic: buildTopic({
      owner: interaction.user.id,
      type: typeKey,
      priority: priorityKey,
      claimed: "0",
      status: "open",
    }),
    permissionOverwrites,
  });

  const data = getTicketData(channel);

  await channel.send({
    content: `<@${interaction.user.id}> ${CONFIG.TICKET_STAFF_ROLE_IDS.map((id) => `<@&${id}>`).join(" ")}`,
    embeds: [ticketInfoEmbed(channel, data)],
    components: [ticketPriorityMenu(data), ticketMainButtons(data)],
    allowedMentions: {
      users: [interaction.user.id],
      roles: CONFIG.TICKET_STAFF_ROLE_IDS,
    },
  });

  await sendPriorityNotification(guild, channel, data, interaction.user.id, true);

  await interaction.reply({
    content: `✅ تم فتح تذكرتك بنجاح: ${channel}\n🔵 تم تعيين الأولوية تلقائياً إلى **عادي**، ويمكنك تغييرها من داخل التذكرة.`,
    ephemeral: true,
  });
}

async function sendPriorityNotification(guild, channel, data, changedById, isNew = false) {
  const notificationId = CONFIG.PRIORITY_NOTIFICATION_CHANNEL_IDS?.[data.type]?.[data.priority];
  const notifyChannel = guild.channels.cache.get(notificationId);
  if (!notifyChannel?.isTextBased()) return;

  const type = TICKET_TYPES[data.type] || TICKET_TYPES.support;
  const priority = PRIORITIES[data.priority] || PRIORITIES.normal;
  const jumpUrl = `https://discord.com/channels/${guild.id}/${channel.id}`;

  const embed = new EmbedBuilder()
    .setColor(CONFIG.BLUE_COLOR)
    .setTitle(`${priority.emoji} ${isNew ? "تذكرة جديدة" : "تم تغيير أولوية التذكرة"}`)
    .addFields(
      { name: "نوع التذكرة", value: type.label, inline: true },
      { name: "الأولوية", value: priority.label, inline: true },
      { name: "صاحب التذكرة", value: `<@${data.owner}>`, inline: true },
      { name: isNew ? "تم الفتح بواسطة" : "تم التغيير بواسطة", value: `<@${changedById}>`, inline: true },
      { name: "اسم التذكرة", value: channel.name, inline: false }
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("الدخول إلى التذكرة")
      .setStyle(ButtonStyle.Link)
      .setURL(jumpUrl)
  );

  await notifyChannel.send({ embeds: [embed], components: [row] }).catch(() => {});
}

async function closeTicket(interaction, reason) {
  const channel = interaction.channel;
  const data = getTicketData(channel);

  const canClose =
    memberHasAnyRole(interaction.member, CONFIG.TICKET_STAFF_ROLE_IDS) ||
    interaction.member.permissions.has(PermissionFlagsBits.Administrator);

  if (!canClose) {
    return interaction.reply({
      content: "❌ ليس لديك صلاحية إغلاق التذكرة.",
      ephemeral: true,
    });
  }

  const closeTime = new Date();
  const type = TICKET_TYPES[data.type] || TICKET_TYPES.support;
  const claimedBy =
    data.claimed && data.claimed !== "0" ? `<@${data.claimed}>` : "لم يتم الاستلام";

  const dmEmbed = new EmbedBuilder()
    .setColor(CONFIG.BLUE_COLOR)
    .setTitle("🔒 تم إغلاق التذكرة")
    .addFields(
      { name: "صاحب التذكرة", value: `<@${data.owner}>`, inline: true },
      { name: "نوع التذكرة", value: type.label, inline: true },
      { name: "الأولوية", value: priorityName(data.priority), inline: true },
      { name: "استلمت بواسطة", value: claimedBy, inline: true },
      { name: "تم القفل بواسطة", value: `<@${interaction.user.id}>`, inline: true },
      {
        name: "وقت الإغلاق",
        value: `<t:${Math.floor(closeTime.getTime() / 1000)}:F>`,
        inline: false,
      },
      { name: "سبب الإغلاق", value: reason.slice(0, 1024), inline: false }
    )
    .setTimestamp();

  // إرسال DM لصاحب التذكرة
  const owner = await client.users.fetch(data.owner).catch(() => null);
  if (owner) {
    await owner.send({ embeds: [dmEmbed] }).catch(() => {});
  }

  // إرسال DM للشخص الذي استلم التذكرة إن وجد
  if (data.claimed && data.claimed !== "0" && data.claimed !== data.owner) {
    const claimer = await client.users.fetch(data.claimed).catch(() => null);
    if (claimer) {
      await claimer.send({ embeds: [dmEmbed] }).catch(() => {});
    }
  }

  // اللوج
  const logChannel = interaction.guild.channels.cache.get(CONFIG.CLOSE_LOG_CHANNEL_ID);
  if (logChannel?.isTextBased()) {
    await logChannel.send({
      embeds: [
        EmbedBuilder.from(dmEmbed)
          .setTitle("📋 سجل إغلاق تذكرة")
          .addFields({ name: "اسم التذكرة", value: channel.name, inline: false }),
      ],
    }).catch(() => {});
  }

  // إخفاء التذكرة من صاحبها، وإبقاؤها للإدارة فقط
  await channel.permissionOverwrites.edit(data.owner, {
    ViewChannel: false,
    SendMessages: false,
  }).catch(() => {});

  // نخفيها من رولات الاستلام/الإغلاق إلا لو هم أيضاً من رولات العرض بعد الإغلاق
  for (const roleId of CONFIG.TICKET_STAFF_ROLE_IDS) {
    if (!CONFIG.CLOSED_VIEW_ROLE_IDS.includes(roleId) &&
        !CONFIG.REOPEN_ROLE_IDS.includes(roleId) &&
        !CONFIG.DELETE_ROLE_IDS.includes(roleId)) {
      await channel.permissionOverwrites.edit(roleId, {
        ViewChannel: false,
      }).catch(() => {});
    }
  }

  for (const roleId of new Set([
    ...CONFIG.CLOSED_VIEW_ROLE_IDS,
    ...CONFIG.REOPEN_ROLE_IDS,
    ...CONFIG.DELETE_ROLE_IDS,
  ])) {
    if (!roleId) continue;
    await channel.permissionOverwrites.edit(roleId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    }).catch(() => {});
  }

  const updated = { ...data, status: "closed" };
  await channel.setTopic(buildTopic(updated)).catch(() => {});
  await channel.setName(`closed-${channel.name.replace(/^closed-/, "")}`.slice(0, 95)).catch(() => {});

  const closedEmbed = new EmbedBuilder()
    .setColor(CONFIG.BLUE_COLOR)
    .setTitle("🔒 تم إغلاق التذكرة")
    .setDescription(
      [
        `**صاحب التذكرة:** <@${data.owner}>`,
        `**نوع التذكرة:** ${type.label}`,
        `**الأولوية:** ${priorityName(data.priority)}`,
        `**استلمت بواسطة:** ${claimedBy}`,
        `**تم القفل بواسطة:** <@${interaction.user.id}>`,
        `**سبب الإغلاق:** ${reason}`,
        `**وقت الإغلاق:** <t:${Math.floor(closeTime.getTime() / 1000)}:F>`,
      ].join("\n")
    )
    .setFooter({ text: "التذكرة مغلقة وتظهر للإدارة فقط" })
    .setTimestamp();

  await interaction.reply({
    embeds: [closedEmbed],
    components: [closedButtons()],
  });
}

async function reopenTicket(interaction) {
  const channel = interaction.channel;
  const data = getTicketData(channel);

  const allowed =
    memberHasAnyRole(interaction.member, CONFIG.REOPEN_ROLE_IDS) ||
    interaction.member.permissions.has(PermissionFlagsBits.Administrator);

  if (!allowed) {
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

  await channel.permissionOverwrites.edit(data.owner, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
  });

  for (const roleId of CONFIG.TICKET_STAFF_ROLE_IDS) {
    if (!roleId) continue;
    await channel.permissionOverwrites.edit(roleId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    }).catch(() => {});
  }

  const updated = { ...data, status: "open" };
  await channel.setTopic(buildTopic(updated));
  await channel.setName(channel.name.replace(/^closed-/, "").slice(0, 95)).catch(() => {});

  const owner = await client.users.fetch(data.owner).catch(() => null);
  if (owner) {
    const dmEmbed = new EmbedBuilder()
      .setColor(CONFIG.BLUE_COLOR)
      .setTitle("🔓 تم إعادة فتح تذكرتك")
      .setDescription(`تم إعادة فتح التذكرة بواسطة <@${interaction.user.id}>.`)
      .setTimestamp();

    const jumpButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("الدخول إلى التذكرة")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
    );

    await owner.send({
      embeds: [dmEmbed],
      components: [jumpButton],
    }).catch(() => {});
  }

  await interaction.reply({
    content: `✅ تم إعادة فتح التذكرة بواسطة ${interaction.user}.`,
  });

  await updateTicketInfoMessage(channel);
}

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity("نظام التذاكر 🎫");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.content.trim().toLowerCase() === "!ticketpanel") {
    const allowed =
      memberHasAnyRole(message.member, CONFIG.PANEL_ROLE_IDS) ||
      message.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!allowed) {
      return message.reply("❌ ليس لديك صلاحية إرسال بانل التذاكر.");
    }

    await sendTicketPanel(message.channel);
    await message.delete().catch(() => {});
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    // اختيار نوع التذكرة: تُفتح مباشرة بأولوية عادي
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_type_select") {
      const typeKey = interaction.values[0];
      return createTicket(interaction, typeKey);
    }

    // تغيير الأولوية من داخل التذكرة
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_change_priority") {
      if (!isTicketChannel(interaction.channel)) {
        return interaction.reply({ content: "❌ هذا الاختيار يعمل داخل التذكرة فقط.", ephemeral: true });
      }

      const channel = interaction.channel;
      const data = getTicketData(channel);

      const allowed =
        interaction.user.id === data.owner ||
        memberHasAnyRole(interaction.member, CONFIG.TICKET_STAFF_ROLE_IDS) ||
        interaction.member.permissions.has(PermissionFlagsBits.Administrator);

      if (!allowed) {
        return interaction.reply({ content: "❌ ليس لديك صلاحية تغيير أولوية هذه التذكرة.", ephemeral: true });
      }

      if (data.status === "closed") {
        return interaction.reply({ content: "❌ لا يمكن تغيير أولوية تذكرة مغلقة.", ephemeral: true });
      }

      const newPriority = interaction.values[0];
      if (!PRIORITIES[newPriority]) {
        return interaction.reply({ content: "❌ أولوية غير صحيحة.", ephemeral: true });
      }

      if (data.priority === newPriority) {
        return interaction.reply({
          content: `ℹ️ التذكرة بالفعل بالأولوية **${priorityName(newPriority)}**.`,
          ephemeral: true,
        });
      }

      const updated = { ...data, priority: newPriority };
      await channel.setTopic(buildTopic(updated));

      await interaction.reply({
        content: `${PRIORITIES[newPriority].emoji} تم تغيير أولوية التذكرة إلى **${priorityName(newPriority)}** بواسطة ${interaction.user}.`,
      });

      await sendPriorityNotification(interaction.guild, channel, updated, interaction.user.id, false);
      await updateTicketInfoMessage(channel);
      return;
    }

    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    if (!isTicketChannel(interaction.channel)) {
      if (interaction.isButton() && interaction.customId.startsWith("ticket_")) {
        return interaction.reply({
          content: "❌ هذا الزر يعمل داخل التذاكر فقط.",
          ephemeral: true,
        });
      }
      return;
    }

    const channel = interaction.channel;
    const data = getTicketData(channel);

    // استلام التذكرة
    if (interaction.isButton() && interaction.customId === "ticket_claim") {
      const allowed =
        memberHasAnyRole(interaction.member, CONFIG.TICKET_STAFF_ROLE_IDS) ||
        interaction.member.permissions.has(PermissionFlagsBits.Administrator);

      if (!allowed) {
        return interaction.reply({
          content: "❌ ليس لديك صلاحية استلام التذكرة.",
          ephemeral: true,
        });
      }

      if (data.status === "closed") {
        return interaction.reply({ content: "❌ التذكرة مغلقة.", ephemeral: true });
      }

      if (data.claimed && data.claimed !== "0") {
        return interaction.reply({
          content: `❌ التذكرة مستلمة بالفعل بواسطة <@${data.claimed}>.`,
          ephemeral: true,
        });
      }

      const updated = { ...data, claimed: interaction.user.id };
      await channel.setTopic(buildTopic(updated));

      await interaction.reply({
        content: `🙋 تم استلام التذكرة بواسطة ${interaction.user}.`,
      });

      await updateTicketInfoMessage(channel);
      return;
    }

    // إضافة شخص - أي شخص لديه وصول للتذكرة يستطيع الضغط
    if (interaction.isButton() && interaction.customId === "ticket_add_user") {
      if (data.status === "closed") {
        return interaction.reply({ content: "❌ التذكرة مغلقة.", ephemeral: true });
      }

      const modal = new ModalBuilder()
        .setCustomId("ticket_add_user_modal")
        .setTitle("إضافة شخص للتذكرة");

      const input = new TextInputBuilder()
        .setCustomId("user_id")
        .setLabel("اكتب ID الشخص")
        .setPlaceholder("مثال: 123456789012345678")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === "ticket_add_user_modal") {
      if (data.status === "closed") {
        return interaction.reply({ content: "❌ التذكرة مغلقة.", ephemeral: true });
      }

      const userId = interaction.fields.getTextInputValue("user_id").trim();
      const member = await interaction.guild.members.fetch(userId).catch(() => null);

      if (!member) {
        return interaction.reply({
          content: "❌ لم يتم العثور على عضو بهذا الـ ID داخل السيرفر.",
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

      return interaction.reply({
        content: `✅ تم إضافة ${member} إلى التذكرة بواسطة ${interaction.user}.`,
      });
    }

    // زر الإغلاق
    if (interaction.isButton() && interaction.customId === "ticket_close") {
      const allowed =
        memberHasAnyRole(interaction.member, CONFIG.TICKET_STAFF_ROLE_IDS) ||
        interaction.member.permissions.has(PermissionFlagsBits.Administrator);

      if (!allowed) {
        return interaction.reply({
          content: "❌ ليس لديك صلاحية إغلاق التذكرة.",
          ephemeral: true,
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("ticket_close_modal")
        .setTitle("إغلاق التذكرة");

      const reason = new TextInputBuilder()
        .setCustomId("close_reason")
        .setLabel("سبب الإغلاق")
        .setPlaceholder("اكتب سبب إغلاق التذكرة...")
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(2)
        .setMaxLength(1000)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(reason));
      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === "ticket_close_modal") {
      const reason = interaction.fields.getTextInputValue("close_reason");
      return closeTicket(interaction, reason);
    }

    // إعادة فتح
    if (interaction.isButton() && interaction.customId === "ticket_reopen") {
      return reopenTicket(interaction);
    }

    // حذف
    if (interaction.isButton() && interaction.customId === "ticket_delete") {
      const allowed =
        memberHasAnyRole(interaction.member, CONFIG.DELETE_ROLE_IDS) ||
        interaction.member.permissions.has(PermissionFlagsBits.Administrator);

      if (!allowed) {
        return interaction.reply({
          content: "❌ ليس لديك صلاحية حذف التذكرة.",
          ephemeral: true,
        });
      }

      if (data.status !== "closed") {
        return interaction.reply({
          content: "❌ لا يمكن حذف التذكرة قبل إغلاقها.",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `🗑️ يتم حذف التذكرة بواسطة ${interaction.user}.`,
      });

      setTimeout(() => channel.delete("Ticket deleted").catch(() => {}), 1500);
      return;
    }
  } catch (error) {
    console.error("Interaction error:", error);

    const payload = {
      content: "❌ حدث خطأ غير متوقع. تأكد من الـ IDs وصلاحيات البوت.",
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error("❌ DISCORD_TOKEN غير موجود في Railway Variables.");
  process.exit(1);
}

client.login(token);

import vine from '@vinejs/vine'

export const createTradeValidator = vine.compile(
  vine.object({
    senderId: vine.number(),
    receiverId: vine.number(),
    senderItems: vine.array(
      vine.object({
        name: vine
          .string()
          .trim()
          .toUpperCase()
          .transform((name) => name.replace(/[^a-zA-Z0-9]/g, '_')),
        quantity: vine.number(),
      })
    ),
    receiverItems: vine.array(
      vine.object({
        name: vine
          .string()
          .trim()
          .toUpperCase()
          .transform((name) => name.replace(/[^a-zA-Z0-9]/g, '_')),
        quantity: vine.number(),
      })
    ),
  })
)

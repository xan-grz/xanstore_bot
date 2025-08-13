from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters
import json
import os

TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://YOUR_GITHUB_PAGES_URL")  # например: https://username.github.io/tg-shop/

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("🛒 Открыть магазин", web_app=WebAppInfo(url=WEBAPP_URL))]
    ]
    await update.message.reply_text("Привет! Жми кнопку, чтобы открыть магазин:", reply_markup=InlineKeyboardMarkup(keyboard))

async def handle_webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # WebApp присылает данные в update.message.web_app_data
    if update.message and update.message.web_app_data:
        try:
            data = json.loads(update.message.web_app_data.data)
            lines = ["🧾 *Заказ оформлен:*"]
            for it in data.get("items", []):
                lines.append(f"- {it['title']} × {it['qty']} = {it['sum']} ₽")
            lines.append(f"\n*Итого:* {data.get('total', 0)} ₽")
            await update.message.reply_markdown_v2("\n".join(lines))
        except Exception as e:
            await update.message.reply_text(f"Не удалось обработать заказ: {e}")

def main():
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    # Ловим любые сообщения и вычленяем web_app_data внутри
    app.add_handler(MessageHandler(filters.ALL, handle_webapp_data))
    app.run_polling()

if __name__ == "__main__":
    main()

# GameShop — Telegram Mini App (WebApp)

Готовый шаблон магазина цифровых товаров: гемы, боевые пропуски, UC и т.д.  
Работает как статический сайт (GitHub Pages/верстка) и интегрируется в Telegram Mini Apps через JS API.

## Файлы
- `index.html` — структура страницы, секции, корзина
- `styles.css` — тёмная тема, адаптивная сетка, карточки
- `app.js` — список товаров, корзина, интеграция `Telegram.WebApp` (MainButton, theme, sendData)
- `icon.svg` и картинки в `art/` — иконки-заглушки

## Развёртывание на GitHub Pages
1. Создайте репозиторий и положите эти файлы в корень (или `/docs`).
2. В настройках включите **Pages** → Source: *main* / root.
3. Получите URL вида `https://username.github.io/repo/`.

## Подключение к боту
- В коде бота отправляйте кнопку с `web_app` на этот URL. Пример (Node.js Telegraf):

```js
bot.command('shop', (ctx) => {
  return ctx.reply('Открой магазин:', {
    reply_markup: {
      keyboard: [[{ text: 'Открыть магазин', web_app: { url: 'https://your-domain/'} }]],
      resize_keyboard: true
    }
  });
});
// Обработка данных из мини-аппа
bot.on('web_app_data', (ctx) => {
  const payload = JSON.parse(ctx.message.web_app_data.data);
  // TODO: создать инвойс/заказ, проверить пользователя и т.д.
  console.log('PAYLOAD:', payload);
  ctx.reply('Заявка получена! Сумма: ' + payload.total + ' ' + payload.currency);
});
```

> Внутри мини‑аппа при нажатии «Оплатить …» скрипт отправляет `tg.sendData(JSON.stringify(payload))`.

## Где подключать оплату
- Вы можете:
  1) Генерировать инвойс **Telegram Payments** в боте после получения `web_app_data`,
  2) Или принимать оплату вне Telegram и просто возвращать результат в бота.

## Кастомизация
- Измените товары в `PRODUCTS` (файл `app.js`).
- Обновите иконки игр в `GAMES` и картинки в папке `art/`.
- Цвета/тему — в `styles.css`. В Telegram цвета подтягиваются автоматически из темы пользователя.

Удачных продаж!

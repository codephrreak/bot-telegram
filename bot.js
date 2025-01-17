const TELEGRAM_BOT_TOKEN = 'YOUR-TELEGRAM-BOT-TOKEN';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;
const OPENAI_API_KEY = 'YOUR-OPENAI-API-KEY'; 
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function handleRequest(request) {
    const data = await request.json();
    if (data.message) {
        const chatId = data.message.chat.id;
        const messageText = data.message.text;
        const fromUserId = data.message.from.id;

       
        if (data.message.from.is_bot) {
           
            return new Response('OK');
        }

        if (messageText === "/start") {
            
            await sendMessage(chatId, "سلام! به ربات خوش آمدید.");
        } else {
            
            const aiResponse = await getAIResponse(messageText);

           
            await sendMessage(chatId, aiResponse);
        }
    }

    return new Response('OK');
}

async function sendMessage(chatId, text) {
    const url = `${TELEGRAM_API_URL}sendMessage`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text
        }),
    });

    if (!response.ok) {
        console.error('Error sending message:', await response.text());
    }
}

async function getAIResponse(userInput) {
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
    };

    const body = JSON.stringify({
        model: "gpt-4o", 
        messages: [{ role: "user", content: userInput }],
        max_tokens: 150, 
    });

    const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: headers,
        body: body,
    });

    if (!response.ok) {
        console.error('Error from OpenAI API:', await response.text());
        return 'مشکلی در پردازش پیام رخ داده است. لطفاً دوباره تلاش کنید.';
    }

    const data = await response.json();
    return data.choices[0].message.content.trim(); 
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

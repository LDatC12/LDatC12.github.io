let currentBot = '';
let darkMode = false;

function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.style.background = darkMode ? '#1a1a1a' : '#ffffff';
    document.body.style.color = darkMode ? '#ffffff' : '#000000';
    document.querySelector('#sidebar').style.background = darkMode ? '#2d2d2d' : '#f5f5f5';
    document.querySelector('#sidebar').style.borderColor = darkMode ? '#3d3d3d' : '#eaeaea';
    
    document.querySelectorAll('.message').forEach(msg => {
        msg.style.background = darkMode ? '#2d2d2d' : '#f5f5f5';
    });
}

function switchBot(bot) {
    currentBot = bot;
    document.querySelectorAll('.bot-btn').forEach(btn => {
        btn.style.opacity = '0.7';
    });
    event.target.style.opacity = '1';
    
    document.getElementById('messages').innerHTML = `
        <div style="text-align: center; margin: 20px;">
            <h3>Now chatting with ${bot.toUpperCase()}</h3>
        </div>
    `;
}

async function sendMessage() {
    if (!currentBot) {
        alert('Please select a chatbot first!');
        return;
    }

    const userInput = document.getElementById('userInput').value;
    if (!userInput.trim()) return;

    addMessage('user', userInput);
    document.getElementById('userInput').value = '';

    const response = await getBotResponse(currentBot, userInput);
    addMessage('bot', response);
}

function addMessage(sender, text) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.style.background = darkMode ? '#2d2d2d' : '#f5f5f5';
    
    messageDiv.innerHTML = sender === 'bot' ? marked.parse(text) : text;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    anime({
        targets: messageDiv,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutCubic'
    });
}

async function getBotResponse(bot, input) {
    const endpoints = {
        gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        textToImage: 'https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image'
    };

    try {
        switch (bot) {
            case 'gemini':
                try {
                    const geminiResponse = await fetch(`${endpoints.gemini}?key=AIzaSyAy9Yukv_M3k4r6_ciiasq7jdLKdRfTvdg`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: input }] }]
                        })
                    });

                    const geminiData = await geminiResponse.json();
                    if (geminiData.candidates && geminiData.candidates[0].content && geminiData.candidates[0].content.parts[0].text) {
                        return geminiData.candidates[0].content.parts[0].text;
                    } else {
                        return "Sorry, there was an issue with Gemini's response.";
                    }

                } catch (error) {
                    console.error('Error:', error);
                    return "Sorry, there was an error processing your request.";
                }

            case 'stable_diffusion':
                try {
                    const response = await fetch(endpoints.textToImage, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer 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`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ inputs: input })
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Hugging Face API Error:', errorData);
                        return "Sorry, there was an error generating the image.";
                    }
            
                    const result = await response.blob();
                    const imageUrl = URL.createObjectURL(result);
                    
                    console.log('Generated Image URL:', imageUrl);
            
                    return `<img src="${imageUrl}" alt="Generated Image" style="max-width: 100%; height: auto;" />`;
            
                } catch (error) {
                    console.error('Error:', error);
                    return "Sorry, there was an error generating the image.";
                }

            default:
                return "Sorry, the bot you selected is not available.";
        }
    } catch (error) {
        console.error('Error:', error);
        return "Sorry, there was an error processing your request.";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});


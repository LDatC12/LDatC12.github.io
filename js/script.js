const openaiKey = "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";
const huggingFaceKey = "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";
const dallEKey = "YOUR_DALL_E_API_KEY";

function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    const messagesDiv = document.getElementById("messages");

    // Display user's message
    messagesDiv.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;

    // Choose which chatbot to send the request to
    if (userInput.startsWith("image:")) {
        // Text-to-image functionality
        const prompt = userInput.slice(6); // Remove "image:" prefix
        generateImage(prompt);
    } else {
        // Send to LLM chatbots
        //sendToOpenAI(userInput);
        sendToHuggingFace(userInput);
    }
}

function sendToOpenAI(userInput) {
    fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userInput,
            max_tokens: 150
        })
    })
    .then(response => response.json())
    .then(data => {
        const messagesDiv = document.getElementById("messages");
        messagesDiv.innerHTML += `<p><strong>OpenAI:</strong> ${data.choices[0].text}</p>`;
    })
    .catch(error => console.error("Error:", error));
}
async function sendToHuggingFace(userInput) {
    const data = { inputs: userInput };
	const response = await fetch(
		"https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
		{
			headers: {
				Authorization: "Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	if (!response.ok) {
        // If response is not successful, handle the error.
        console.error('Error:', response.status, response.statusText);
        return;
    }

    // Parse the response as JSON.
    const result = await response.json();

    // Assuming the API returns text in 'generated_text' field.
    const generatedText = result.generated_text;

    // Display the result in the messagesDiv.
    const messagesDiv = document.getElementById("messages");
    if (generatedText) {
        messagesDiv.innerHTML += `<p><strong>Hugging Face:</strong> ${generatedText}</p>`;
    } else {
        messagesDiv.innerHTML += `<p><strong>Hugging Face:</strong> No response available.</p>`;
    }
}

function generateImage(prompt) {
    fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${dallEKey}`
        },
        body: JSON.stringify({
            prompt: prompt,
            n: 1,
            size: "1024x1024"
        })
    })
    .then(response => response.json())
    .then(data => {
        const messagesDiv = document.getElementById("messages");
        const imageUrl = data.data[0].url;
        messagesDiv.innerHTML += `<p><strong>DALL-E Image:</strong></p><img src="${imageUrl}" alt="Generated Image">`;
    })
    .catch(error => console.error("Error:", error));
}

// ======================================
// GET HTML ELEMENTS
// ======================================

const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const sidebar = document.getElementById("sidebar");

const chatHistory = document.getElementById("chatHistory");
const searchChat = document.getElementById("searchChat");

const welcomeSection = document.getElementById("welcomeSection");
const suggestionCards = document.getElementById("suggestionCards");

const newChatBtn = document.getElementById("newChatBtn");
const clearChatsBtn = document.getElementById("clearChatsBtn");

const creativeCard = document.getElementById("creativeCard");
const codingCard = document.getElementById("codingCard");
const writingCard = document.getElementById("writingCard");
const learnCard = document.getElementById("learnCard");


// ======================================
// LOCAL STORAGE
// ======================================

function loadChats() {
    try {
        const savedChats = JSON.parse(localStorage.getItem("chats"));

        return Array.isArray(savedChats) ? savedChats : [];
    } catch (error) {
        console.error("Unable to load chats:", error);
        return [];
    }
}

let chats = loadChats();
let currentChatId = null;

function saveChats() {
    try {
        localStorage.setItem("chats", JSON.stringify(chats));
    } catch (error) {
        console.error("Unable to save chats:", error);
        alert("Unable to save chats. Your browser storage may be full.");
    }
}


// ======================================
// HELPER FUNCTIONS
// ======================================

function getActiveChat() {
    return chats.find(function (chat) {
        return chat.id === currentChatId;
    });
}

function formatTime(time) {
    return time || "";
}

function showWelcome(show) {
    welcomeSection.style.display = show ? "block" : "none";
    suggestionCards.style.display = show ? "grid" : "none";
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// ======================================
// MOBILE SIDEBAR
// ======================================

mobileMenuBtn.addEventListener("click", function () {
    sidebar.classList.toggle("sidebar-open");
});

function closeMobileSidebar() {
    sidebar.classList.remove("sidebar-open");
}


// ======================================
// CREATE NEW CHAT
// ======================================

function createNewChat() {
    const newChat = {
        id: Date.now(),
        title: "New Chat",
        messages: []
    };

    chats.push(newChat);
    currentChatId = newChat.id;

    saveChats();
    displayChatHistory();
    renderMessages(newChat);

    userInput.value = "";
    showWelcome(true);
    closeMobileSidebar();
}

newChatBtn.addEventListener("click", createNewChat);


// ======================================
// RENDER CHAT MESSAGES
// ======================================

function renderMessages(chat) {
    chatMessages.innerHTML = "";

    if (!chat || chat.messages.length === 0) {
        const emptyMessage = document.createElement("div");

        emptyMessage.className = "empty-state";
        emptyMessage.textContent = "Your conversation will appear here.";

        chatMessages.appendChild(emptyMessage);
        showWelcome(true);
        return;
    }

    showWelcome(false);

    chat.messages.forEach(function (message) {
        addMessageToScreen(message, false);
    });

    scrollToBottom();
}


// ======================================
// ADD MESSAGE TO SCREEN
// ======================================

function addMessageToScreen(message, shouldScroll = true) {
    const messageDiv = document.createElement("div");

    const isUser = message.sender === "user";

    messageDiv.className = isUser
        ? "chat-message user-message"
        : "chat-message ai-message";

    // Safe text rendering - prevents HTML injection
    const messageText = document.createElement("p");

    messageText.className = "message-text";
    messageText.textContent = message.text || "";

    messageDiv.appendChild(messageText);

    // Timestamp
    if (message.time) {
        const timeElement = document.createElement("small");

        timeElement.className = "message-time";
        timeElement.textContent = formatTime(message.time);

        messageDiv.appendChild(timeElement);
    }

    // Copy button for AI messages
    if (!isUser) {
        const copyButton = document.createElement("button");

        copyButton.type = "button";
        copyButton.className = "copy-response-btn";
        copyButton.textContent = "📋 Copy Response";

        copyButton.addEventListener("click", async function () {
            try {
                await navigator.clipboard.writeText(message.text);

                copyButton.textContent = "✓ Copied!";

                setTimeout(function () {
                    copyButton.textContent = "📋 Copy Response";
                }, 1500);

            } catch (error) {
                alert("Copy failed. Please check browser clipboard permission.");
            }
        });

        messageDiv.appendChild(copyButton);
    }

    chatMessages.appendChild(messageDiv);

    if (shouldScroll) {
        scrollToBottom();
    }

    return messageDiv;
}


// ======================================
// CHAT HISTORY
// ======================================

function displayChatHistory() {
    chatHistory.innerHTML = "";

    const searchText = searchChat.value.trim().toLowerCase();

    const filteredChats = chats.filter(function (chat) {
        return chat.title.toLowerCase().includes(searchText);
    });

    if (filteredChats.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-state";

        emptyMessage.textContent = chats.length === 0
            ? "No chats yet. Start a new chat!"
            : "No matching chats found.";

        chatHistory.appendChild(emptyMessage);
        return;
    }

    filteredChats.forEach(function (chat) {
        const chatItem = document.createElement("div");

        chatItem.className = "chat-history-item";

        if (chat.id === currentChatId) {
            chatItem.classList.add("active");
        }

        // Chat title
        const chatTitle = document.createElement("span");

        chatTitle.className = "chat-history-title";
        chatTitle.textContent = chat.title;

        // Rename on double click
        chatTitle.addEventListener("dblclick", function (event) {
            event.stopPropagation();

            const newTitle = prompt("Enter new chat name:", chat.title);

            if (newTitle && newTitle.trim()) {
                chat.title = newTitle.trim();

                saveChats();
                displayChatHistory();
            }
        });

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-chat-btn";
        deleteButton.textContent = "🗑️";
        deleteButton.title = "Delete this chat";

        deleteButton.addEventListener("click", function (event) {
            event.stopPropagation();

            const confirmDelete = confirm(
                `Delete "${chat.title}"? This action cannot be undone.`
            );

            if (!confirmDelete) {
                return;
            }

            chats = chats.filter(function (item) {
                return item.id !== chat.id;
            });

            if (currentChatId === chat.id) {
                currentChatId = null;
                chatMessages.innerHTML = "";
                userInput.value = "";
                showWelcome(true);
            }

            saveChats();
            displayChatHistory();
        });

        chatItem.appendChild(chatTitle);
        chatItem.appendChild(deleteButton);

        // Open chat
        chatItem.addEventListener("click", function () {
            currentChatId = chat.id;

            renderMessages(chat);
            displayChatHistory();

            closeMobileSidebar();
        });

        chatHistory.appendChild(chatItem);
    });
}


// ======================================
// SEARCH CHAT HISTORY
// ======================================

searchChat.addEventListener("input", function () {
    displayChatHistory();
});


// ======================================
// CLEAR ALL CHATS
// ======================================

clearChatsBtn.addEventListener("click", function () {
    if (chats.length === 0) {
        alert("There are no chats to delete.");
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete all chats? This action cannot be undone."
    );

    if (!confirmDelete) {
        return;
    }

    chats = [];
    currentChatId = null;

    saveChats();
    displayChatHistory();

    chatMessages.innerHTML = "";
    userInput.value = "";

    showWelcome(true);
});


// ======================================
// SUGGESTION CARDS
// ======================================

function setSuggestion(text) {
    userInput.value = text;
    userInput.focus();
}

creativeCard.addEventListener("click", function () {
    setSuggestion("Give me creative ideas for my next project.");
});

codingCard.addEventListener("click", function () {
    setSuggestion("Help me learn programming step by step.");
});

writingCard.addEventListener("click", function () {
    setSuggestion("Help me write professional content.");
});

learnCard.addEventListener("click", function () {
    setSuggestion("Teach me something new and interesting.");
});


// ======================================
// AI RESPONSE LOGIC
// ======================================

function generateAIResponse(message) {
    const userMessage = message.toLowerCase();

    if (
        userMessage === "hi" ||
        userMessage === "hello" ||
        userMessage === "hey"
    ) {
        return "Hello! 👋 How can I help you today?";
    }

    if (userMessage.includes("who are you")) {
        return "I'm your AI Chat Assistant. I'm here to help you!";
    }

    if (userMessage.includes("your name")) {
        return "My name is AI Assistant. Nice to meet you! 😊";
    }

    if (userMessage.includes("how are you")) {
        return "I'm doing great! Thanks for asking. How can I help you?";
    }

    if (userMessage.includes("javascript")) {
        return "JavaScript is a programming language used to make websites interactive. It works with HTML and CSS.";
    }

    if (userMessage.includes("html")) {
        return "HTML stands for HyperText Markup Language. It is used to create the structure of web pages.";
    }

    if (userMessage.includes("css")) {
        return "CSS stands for Cascading Style Sheets. It is used to design and style websites.";
    }

    if (userMessage.includes("react")) {
        return "React is a JavaScript library used to build interactive user interfaces.";
    }

    if (userMessage.includes("time")) {
        return "Current time: " + new Date().toLocaleTimeString();
    }

    if (userMessage.includes("help")) {
        return "Sure! 😊 I can help you with programming, learning, creative ideas and writing.";
    }

    if (userMessage.includes("thank")) {
        return "You're welcome! 😊 Happy to help you.";
    }

    if (userMessage.includes("bye")) {
        return "Goodbye! 👋 Have a wonderful day!";
    }

    return "I don't know the answer yet. Can you ask me something about HTML, CSS, JavaScript or React?";
}


// ======================================
// SEND MESSAGE
// ======================================

function sendMessage() {
    const message = userInput.value.trim();

    if (message === "") {
        userInput.focus();
        return;
    }

    let activeChat = getActiveChat();

    // Create chat if no active chat exists
    if (!activeChat) {
        createNewChat();
        activeChat = getActiveChat();
    }

    // Set title from first message
    if (activeChat.messages.length === 0) {
        activeChat.title = message.substring(0, 25);
        displayChatHistory();
    }

    // Save user message
    const userMessage = {
        sender: "user",
        text: message,
        time: new Date().toLocaleTimeString()
    };

    activeChat.messages.push(userMessage);

    saveChats();

    showWelcome(false);

    // Display user message safely
    addMessageToScreen(userMessage);

    userInput.value = "";

    // AI typing message
    const typingMessage = document.createElement("div");

    typingMessage.className = "chat-message ai-message";
    typingMessage.innerHTML = `
        <p class="message-text">AI is thinking</p>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatMessages.appendChild(typingMessage);
    scrollToBottom();

    // Keep this chat reference for the delayed response
    const chatId = activeChat.id;

    // Generate response after 2 seconds
    setTimeout(function () {
        const currentChat = chats.find(function (chat) {
            return chat.id === chatId;
        });

        // Do not save a response to a deleted chat
        if (!currentChat) {
            typingMessage.remove();
            return;
        }

        const aiReply = generateAIResponse(message);

        const aiMessage = {
            sender: "ai",
            text: aiReply,
            time: new Date().toLocaleTimeString()
        };

        currentChat.messages.push(aiMessage);

        saveChats();

        typingMessage.remove();

        // Only render if this chat is currently open
        if (currentChatId === chatId) {
            addMessageToScreen(aiMessage);
        }

    }, 2000);
}

sendBtn.addEventListener("click", sendMessage);


// ======================================
// ENTER KEY
// ======================================

userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});


// ======================================
// INITIAL LOAD
// ======================================

displayChatHistory();

if (chats.length > 0) {
    const lastChat = chats[chats.length - 1];

    currentChatId = lastChat.id;

    renderMessages(lastChat);
    displayChatHistory();
} else {
    showWelcome(true);
}

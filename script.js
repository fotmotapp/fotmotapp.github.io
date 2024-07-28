document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const chatContainer = document.getElementById('chatContainer');
    const messageForm = document.getElementById('messageForm');
    const messagesDiv = document.getElementById('messages');
    const disconnectButton = document.getElementById('disconnectButton');

    let userId = null;
    let connectedWith = null;

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const gender = document.getElementById('gender').value;

        fetch('/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `gender=${gender}`
        })
        .then(response => response.json())
        .then(data => {
            userId = data.user_id;
            chatContainer.style.display = 'block';
            findMatch();
        });
    });

    function findMatch() {
        fetch(`https://fotmotapp.pythonanywhere.com/find_match/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                connectedWith = data.match;
                pollMessages();
            } else {
                alert(data.message);
            }
        });
    }

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = document.getElementById('message').value;

        fetch('https://fotmotapp.pythonanywhere.com/send_message', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `sender_id=${userId}&recipient_id=${connectedWith}&message=${message}`
        })
        .then(response => response.json())
        .then(() => {
            document.getElementById('message').value = '';
        });
    });

    function pollMessages() {
        setInterval(() => {
            fetch(`https://fotmotapp.pythonanywhere.com/get_messages/${userId}`)
            .then(response => response.json())
            .then(data => {
                messagesDiv.innerHTML = data.messages.map(msg => {
                    return `<p><strong>${msg.sender}:</strong> ${msg.message}</p>`;
                }).join('');
            });
        }, 2000);
    }

    disconnectButton.addEventListener('click', () => {
        fetch(`https://fotmotapp.pythonanywhere.com/disconnect/${userId}`, { method: 'POST' })
        .then(response => response.json())
        .then(() => {
            connectedWith = null;
            alert('Disconnected.');
            chatContainer.style.display = 'none';
        });
    });
});

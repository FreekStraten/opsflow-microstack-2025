// Haal users op van de API
fetch('/api/users')
    .then(response => response.json())
    .then(users => {
        const usersDiv = document.getElementById('users');
        usersDiv.innerHTML = '<pre>' + JSON.stringify(users, null, 2) + '</pre>';
    });
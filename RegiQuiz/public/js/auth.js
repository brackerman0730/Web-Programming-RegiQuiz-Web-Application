async function checkAuth() {
    let response = await fetch('/api/whoami');
    let data = await response.json();

    let link = document.getElementById('navProfileLink');
    if (!link) return data;

    if (data.loggedIn) {
        link.textContent = data.username;
        link.href = 'profile.html';
    } else {
        link.textContent = 'Login';
        link.href = 'login.html';
    }

    return data;
}

checkAuth();

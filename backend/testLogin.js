const login = async () => {
    try {
        console.log("Attempting login...");
        const res = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'adminelectrofix@gmail.com',
                password: 'password123'
            })
        });

        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Response:", data);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}
login();

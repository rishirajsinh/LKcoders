async function test() {
    try {
        const r = await fetch('https://testing-vm33.onrender.com/api/auth/register', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: 'Final Test', 
                email: 'final' + Math.random() + '@test.com', 
                password: 'password123',
                role: 'admin'
            })
        });
        const text = await r.text();
        console.log('Status:', r.status);
        console.log('Body:', text);
    } catch (e) {
        console.error(e);
    }
}
test();

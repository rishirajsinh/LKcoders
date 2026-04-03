async function seed() {
    try {
        const r = await fetch('https://testing-vm33.onrender.com/api/auth/seed', { method: 'POST' });
        const text = await r.text();
        console.log('Status:', r.status);
        console.log('Body:', text);
    } catch (e) {
        console.error(e);
    }
}
seed();

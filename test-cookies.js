// Test script to verify cookie persistence
// Run this in your browser console after logging in

console.log('=== Cookie Persistence Test ===\n');

// Check if cookies exist
console.log('1. Checking cookies...');
console.log('Document cookies:', document.cookie);
console.log('Note: httpOnly cookies (refreshToken, userRefreshToken) will NOT appear here - this is correct!\n');

// Test refresh token endpoint
async function testRefreshToken(endpoint, type) {
    console.log(`2. Testing ${type} refresh token endpoint...`);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            credentials: 'include', // CRITICAL: This sends the httpOnly cookie
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ ${type} refresh token SUCCESS!`);
            console.log('Response:', data);
            console.log('New access token:', data.data?.accessToken);
            return data.data?.accessToken;
        } else {
            console.log(`❌ ${type} refresh token FAILED!`);
            console.log('Error:', data);
            return null;
        }
    } catch (error) {
        console.log(`❌ ${type} refresh token ERROR!`);
        console.error('Error:', error);
        return null;
    }
}

// Test based on your login type
console.log('\nChoose your test:');
console.log('For ADMIN: testRefreshToken("http://localhost:YOUR_PORT/admin/refresh-Admin", "Admin")');
console.log('For USER: testRefreshToken("http://localhost:YOUR_PORT/user/refresh-user", "User")');
console.log('\nReplace YOUR_PORT with your actual backend port (e.g., 3000, 5000, etc.)\n');

// Example usage (uncomment and modify):
// await testRefreshToken('http://localhost:5000/admin/refresh-Admin', 'Admin');
// await testRefreshToken('http://localhost:5000/user/refresh-user', 'User');

console.log('\n=== Instructions ===');
console.log('1. Login first (admin or user)');
console.log('2. Run the appropriate testRefreshToken() command above');
console.log('3. Refresh the page');
console.log('4. Run the testRefreshToken() command again');
console.log('5. If step 4 succeeds, cookies are persisting correctly! ✅');
console.log('6. If step 4 fails, check the COOKIE_FIX_GUIDE.md for frontend requirements');

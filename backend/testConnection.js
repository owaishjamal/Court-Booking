require('dotenv').config();
const mongoose = require('mongoose');

// Get MongoDB URL from environment variables
const dbUrl = process.env.DB_URL;

// Connection options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

// Function to test the connection
async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('Connection URL:', dbUrl);
        
        await mongoose.connect(dbUrl, options);
        console.log('✅ Successfully connected to MongoDB!');
        
        // Get list of all databases
        const adminDb = mongoose.connection.db.admin();
        const dbs = await adminDb.listDatabases();
        console.log('\nAvailable databases:');
        dbs.databases.forEach(db => {
            console.log(`- ${db.name}`);
        });
        
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:');
        console.error(error.message);
        if (error.message.includes('ENOTFOUND')) {
            console.log('\nPossible issues:');
            console.log('1. Check if the MongoDB URL is correct');
            console.log('2. Verify if MongoDB server is running');
            console.log('3. Check your network connection');
        }
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('\nConnection closed.');
    }
}

// Run the test
testConnection();
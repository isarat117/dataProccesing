require('dotenv').config();
const mongoDBConnector = require('../infra/mongodb_connector');
const redisConnector = require('../infra/redis_connector');
const jsonScraper = require('./scrapers/JsonScraper');

async function main() {
    try {
        await mongoDBConnector.connect();
        await redisConnector.connect();

        console.log('\nData processing starting...');
        const totalJobs = await jsonScraper.scrapeAll();
        console.log(`\nProcessing completed! Total ${totalJobs} job listings processed.`);

        // Close connections
        console.log('\nClosing connections...');
        await mongoDBConnector.disconnect();
        await redisConnector.disconnect();
        console.log('All connections closed\n');

    } catch (error) {
        console.error('\nApplication error:', error.message);
        
        // Attempt to close connections in case of error
        try {
            await mongoDBConnector.disconnect();
            await redisConnector.disconnect();
        } catch (closeError) {
            console.error('Error closing connections:', closeError.message);
        }

        process.exit(1);
    }
}

// Start the application
console.log('\nStarting application...');
main();
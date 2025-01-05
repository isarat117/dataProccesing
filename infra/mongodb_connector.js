const mongoose = require('mongoose');
const winston = require('winston');

class MongoDBConnector {
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.Console()
            ]
        });
    }

    async connect() {
        try {
            const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/decanaria';
            await mongoose.connect(mongoUri);
            this.logger.info('MongoDB connection successful');
        } catch (error) {
            this.logger.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            this.logger.info('MongoDB connection closed');
        } catch (error) {
            this.logger.error('Error closing MongoDB connection:', error);
            throw error;
        }
    }

    async insertMany(collection, documents) {
        try {
            const result = await collection.insertMany(documents);
            this.logger.info(`${result.length} documents successfully inserted`);
            return result;
        } catch (error) {
            this.logger.error('Error inserting documents:', error);
            throw error;
        }
    }

    async findAll(collection, query = {}) {
        try {
            const documents = await collection.find(query).exec();
            return documents;
        } catch (error) {
            this.logger.error('Error finding documents:', error);
            throw error;
        }
    }
}

module.exports = new MongoDBConnector(); 
const Redis = require('redis');
const winston = require('winston');

class RedisConnector {
    constructor() {
        this.client = null;
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
            this.client = Redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });

            await this.client.connect();
            this.logger.info('Redis connection successful');
        } catch (error) {
            this.logger.error('Redis connection error:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.client) {
                await this.client.quit();
                this.logger.info('Redis connection closed');
            }
        } catch (error) {
            this.logger.error('Error closing Redis connection:', error);
            throw error;
        }
    }

    async setCached(key, value, expireTime = 3600) {
        try {
            await this.client.setEx(key, expireTime, JSON.stringify(value));
            return true;
        } catch (error) {
            this.logger.error('Redis cache write error:', error);
            return false;
        }
    }

    async getCached(key) {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            this.logger.error('Redis cache read error:', error);
            return null;
        }
    }
}

module.exports = new RedisConnector(); 
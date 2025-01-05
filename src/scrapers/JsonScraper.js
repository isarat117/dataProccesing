const fs = require('fs').promises;
const path = require('path');
const Job = require('../models/job');
const mongoDBConnector = require('../../infra/mongodb_connector');
const redisConnector = require('../../infra/redis_connector');

class JsonScraper {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data');
        this.savedJobs = [];
    }

    normalizeEmploymentType(type) {
        const types = {
            'FULL_TIME': 'full-time',
            'PART_TIME': 'part-time',
            'CONTRACT': 'contract',
            'TEMPORARY': 'temporary',
            'INTERNSHIP': 'internship',
            'VOLUNTEER': 'volunteer'
        };
        return types[type] || 'full-time';
    }

    normalizeEmploymentLevel(level) {
        const levels = {
            'ENTRY': 'entry',
            'JUNIOR': 'junior',
            'MID_LEVEL': 'mid-level',
            'SENIOR': 'senior',
            'LEAD': 'lead',
            'MANAGER': 'manager',
            'DIRECTOR': 'director',
            'EXECUTIVE': 'executive',
            '': 'entry' 
        };

        const normalized = (level || '')
            .toLowerCase()
            .replace(/_/g, '-')
            .replace(/\s+/g, '-');

        if (Object.values(levels).includes(normalized)) {
            return normalized;
        }

        if (levels[level?.toUpperCase()]) {
            return levels[level.toUpperCase()];
        }

        const mappings = {
            'jr': 'junior',
            'sr': 'senior',
            'mid': 'mid-level',
            'intermediate': 'mid-level',
            'principal': 'senior',
            'staff': 'senior',
            'head': 'lead',
            'chief': 'executive',
            'vp': 'executive'
        };

        for (const [key, value] of Object.entries(mappings)) {
            if (normalized.includes(key)) {
                return value;
            }
        }

        return 'entry';
    }

    async processFile(filePath) {
        try {
            console.log(`\nProcessing File: ${path.basename(filePath)}`);
            const data = await fs.readFile(filePath, 'utf8');
            const jsonData = JSON.parse(data);
            const jobs = jsonData.jobs || [];
            console.log(`Job Count: ${jobs.length}`);

            let successCount = 0;
            let updateCount = 0;
            let errorCount = 0;

            for (const jobItem of jobs) {
                try {
                    const job = jobItem.data;
                    if (!job) continue;

                    const categories = job.categories?.map(c => c.name) || [];
                    const benefits = job.benefits || [];
                    const metaData = job.meta_data || {};
                    const reqId = job.req_id || `${Date.now()}`;

                    const jobData = {
                        title: job.title || 'No title',
                        description: job.description || '',
                        company: {
                            name: job.hiring_organization || job.brand || job.location_name || 'No organization',
                        },
                        location: {
                            full: job.full_location || '',
                            short: job.short_location || '',
                            city: job.city || '',
                            state: job.state || '',
                            country: job.country_code || 'not found',
                            name: job.location_name || '',
                            street_address: job.street_address || '',
                            postal_code: job.postal_code || '',
                            coordinates: {
                                latitude: parseFloat(job.latitude) || 0,
                                longitude: parseFloat(job.longitude) || 0
                            }
                        },
                        salary: {
                            currency: job.salary_currency || 'USD',
                            value: parseFloat(job.salary_value) || 0,
                            min: parseFloat(job.salary_min_value) || 0,
                            max: parseFloat(job.salary_max_value) || 0,
                        },
                        employment: {
                            type: this.normalizeEmploymentType(job.employment_type),
                            brand: job.brand || '',
                            internal: job.internal || false,
                            applyUrl: job.apply_url || '',
                            work_hours: job.work_hours || ''
                        },
                        
                        details: {
                            reqId: job.req_id || `${Date.now()}`,
                            slug: job.slug || `${job.title}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            language: job.language || 'en',
                            languages: job.languages || [],
                            categories: categories,
                            benefits: benefits,
                            tags: job.tags || [],
                            source: job.source || 'fedex-jobs',
                            status: job.status || 'active'
                        },
                        dates: {
                            created: job.create_date ? new Date(job.create_date) : new Date(),
                            updated: job.update_date ? new Date(job.update_date) : new Date(),
                            published: job.publish_date ? new Date(job.publish_date) : new Date(),
                            expires: job.expire_date ? new Date(job.expire_date) : null,
                            posted_date: job.posted_date || '',
                            posting_expiry_date: job.posting_expiry_date || ''
                        },
                        meta: {
                            region: metaData.region_description || '',
                            district: metaData.district_description || '',
                            location: metaData.domicile_location || '',
                            views: parseInt(job.views) || 0,
                            applications: parseInt(job.applications) || 0,
                            featured: job.featured || false,
                            urgent: job.urgent || false,
                            searchable: job.searchable || false,
                            applyable: job.applyable || false,
                            li_easy_applyable: job.li_easy_applyable || false
                        }
                    };

                    const result = await Job.upsertJob(jobData);

                    if (result.success) {
                        this.savedJobs.push(result.job);
                        if (result.isNew) {
                            successCount++;
                            process.stdout.write('+');
                        } else {
                            updateCount++;
                            process.stdout.write('~');
                        }

                        try {
                            const cacheKey = `job:${result.job._id}`;
                            await redisConnector.setCached(cacheKey, jobData);
                        } catch (redisError) {
                            console.log('Redis Caching Error:', redisError.message);
                        }
                    } else {
                        console.error(`\nError saving job: ${result.error}`);
                        errorCount++;
                        process.stdout.write('-');
                    }
                } catch (error) {
                    console.error(`\nError saving job: ${error.message}`);
                    errorCount++;
                    process.stdout.write('-');
                }
            }

            console.log(`\ Updated: ${updateCount} | Failed: ${errorCount}\n`);
            return successCount + updateCount;
        } catch (error) {
            console.error(`File Processing Error: ${error.message}\n`);
            return 0;
        }
    }

    async scrapeAll() {
        try {
            const files = await fs.readdir(this.dataPath);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            
            console.log('\nData processing started');
            console.log(`File Count: ${jsonFiles.length}`);

            let totalJobs = 0;
            for (const file of jsonFiles) {
                const filePath = path.join(this.dataPath, file);
                const jobCount = await this.processFile(filePath);
                totalJobs += jobCount;
            }

            console.log('Processing completed!\n');
            return totalJobs;
        } catch (error) {
            console.error(`\nError: ${error.message}\n`);
            throw error;
        }
    }
}

module.exports = new JsonScraper(); 
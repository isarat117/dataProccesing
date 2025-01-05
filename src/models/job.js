const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    company: {
        name: { type: String, required: true },
    },
    location: {
        full: String,
        short: String,
        city: String,
        state: String,
        country: String,
        name: String,
        street_address: String,
        postal_code: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    salary: {
        currency: String,
        value: Number,
        min: Number,
        max: Number,
    },
    employment: {
        type: { type: String },
        brand: { type: String },
        internal: { type: Boolean },
        applyUrl: { type: String },
        work_hours: String
    },
    details: {
        reqId: { type: String, required: true, unique: true },
        slug: String,
        language: String,
        languages: [String],
        categories: [String],
        benefits: [String],
        tags: [String],
        source: String,
        status: String
    },
    dates: {
        created: { type: Date, default: Date.now },
        updated: { type: Date, default: Date.now },
        published: Date,
        expires: Date,
        posted_date: String,
        posting_expiry_date: String
    },
    meta: {
        region: String,
        district: String,
        location: String,
        views: { type: Number, default: 0 },
        applications: { type: Number, default: 0 },
        featured: Boolean,
        urgent: Boolean,
        searchable: Boolean,
        applyable: Boolean,
        li_easy_applyable: Boolean
    }
});

jobSchema.statics.upsertJob = async function(jobData) {
    try {
        const result = await this.findOneAndUpdate(
            { 'details.reqId': jobData.details.reqId },
            jobData,
            { upsert: true, new: true }
        );
        return { success: true, job: result, isNew: !result._id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = mongoose.model('Job', jobSchema);
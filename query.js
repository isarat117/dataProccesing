require('dotenv').config();
const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const fs = require('fs');
const Job = require('./src/models/job');

async function generateReport() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/decanaria');
        console.log('Connected to MongoDB');

        const totalJobs = await Job.countDocuments();
        console.log(`Total Job Listings: ${totalJobs}`);

        const allJobs = await Job.find().lean();
        
        const fields = [
            {
                label: 'Job Title',
                value: 'title'
            },
            {
                label: 'Description',
                value: 'description'
            },
            {
                label: 'Company Name',
                value: 'company.name'
            },
            {
                label: 'Location Full',
                value: 'location.full'
            },
            {
                label: 'Location Short',
                value: 'location.short'
            },
            {
                label: 'City',
                value: 'location.city'
            },
            {
                label: 'State',
                value: 'location.state'
            },
            {
                label: 'Country',
                value: 'location.country'
            },
            {
                label: 'Location Name',
                value: 'location.name'
            },
            {
                label: 'Street Address',
                value: 'location.street_address'
            },
            {
                label: 'Postal Code',
                value: 'location.postal_code'
            },
            {
                label: 'Latitude',
                value: 'location.coordinates.latitude'
            },
            {
                label: 'Longitude',
                value: 'location.coordinates.longitude'
            },
            {
                label: 'Salary Currency',
                value: 'salary.currency'
            },
            {
                label: 'Salary Value',
                value: 'salary.value'
            },
            {
                label: 'Salary Min',
                value: 'salary.min'
            },
            {
                label: 'Salary Max',
                value: 'salary.max'
            },
            {
                label: 'Employment Type',
                value: 'employment.type'
            },
            {
                label: 'Brand',
                value: 'employment.brand'
            },
            {
                label: 'Internal',
                value: 'employment.internal'
            },
            {
                label: 'Apply URL',
                value: 'employment.applyUrl'
            },
            {
                label: 'Work Hours',
                value: 'employment.work_hours'
            },
            {
                label: 'Req ID',
                value: 'details.reqId'
            },
            {
                label: 'Slug',
                value: 'details.slug'
            },
            {
                label: 'Language',
                value: 'details.language'
            },
            {
                label: 'Languages',
                value: (row) => row.details?.languages?.join(', ') || ''
            },
            {
                label: 'Categories',
                value: (row) => row.details?.categories?.join(', ') || ''
            },
            {
                label: 'Benefits',
                value: (row) => row.details?.benefits?.join(', ') || ''
            },
            {
                label: 'Tags',
                value: (row) => row.details?.tags?.join(', ') || ''
            },
            {
                label: 'Source',
                value: 'details.source'
            },
            {
                label: 'Status',
                value: 'details.status'
            },
            {
                label: 'Created Date',
                value: 'dates.created'
            },
            {
                label: 'Updated Date',
                value: 'dates.updated'
            },
            {
                label: 'Published Date',
                value: 'dates.published'
            },
            {
                label: 'Expiry Date',
                value: 'dates.expires'
            },
            {
                label: 'Posted Date',
                value: 'dates.posted_date'
            },
            {
                label: 'Posting Expiry Date',
                value: 'dates.posting_expiry_date'
            },
            {
                label: 'Region',
                value: 'meta.region'
            },
            {
                label: 'District',
                value: 'meta.district'
            },
            {
                label: 'Location Meta',
                value: 'meta.location'
            },
            {
                label: 'Views',
                value: 'meta.views'
            },
            {
                label: 'Applications',
                value: 'meta.applications'
            },
            {
                label: 'Featured',
                value: 'meta.featured'
            },
            {
                label: 'Urgent',
                value: 'meta.urgent'
            },
            {
                label: 'Searchable',
                value: 'meta.searchable'
            },
            {
                label: 'Applyable',
                value: 'meta.applyable'
            },
            {
                label: 'LinkedIn Easy Apply',
                value: 'meta.li_easy_applyable'
            }
        ];

        const json2csvParser = new Parser({ 
            fields,
            defaultValue: '',
            delimiter: ';'  
        });
        
        const csv = json2csvParser.parse(allJobs);
        fs.writeFileSync('jobs_report.csv', '\ufeff' + csv);
        console.log('\nDetailed CSV report generated: jobs_report.csv');

        await mongoose.disconnect();
        console.log('\nMongoDB connection closed');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

generateReport();

module.exports = { generateReport }; 
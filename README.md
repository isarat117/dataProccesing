# Decanaria - Job Listings Data Processing Project

This project is a Node.js application that processes job listing data in JSON format, stores it in MongoDB, and utilizes Redis caching.

## Features

- Fetching and processing data from JSON files
- Storing and managing data in MongoDB
- Caching and preventing duplicate records with Redis
- Containerization using Docker and Docker Compose
- Detailed reporting and CSV output

## Technologies

- **Node.js**: Main application platform
- **MongoDB**: Data storage
- **Redis**: Caching
- **Docker**: Containerization
- **Mongoose**: MongoDB object modeling
- **json2csv**: CSV report generation

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd decanaria
```

2. Create required directories:
```bash
mkdir -p data
```

3. Place the JSON files in the data folder:
- `data/s01.json`
- `data/s02.json`

4. Set up environment variables:
```bash
cp .env.example .env
```

## Running with Docker

1. Start the services:
```bash
docker-compose up -d
```

2. Process job listings:
```bash
docker-compose exec app node src/index.js
```

3. Generate reports:
```bash
docker-compose exec app node query.js
```

4. Stop services:
```bash
docker-compose down
```

## Data Structure

### Job Listing Schema

- **Basic Information**
  - Title
  - Description
  - Company name

- **Location**
  - Full location
  - Short location
  - City, State, Country
  - Street address
  - Postal code
  - Coordinates (latitude/longitude)

- **Employment Details**
  - Type (full-time, part-time, etc.)
  - Brand
  - Internal/External
  - Apply URL
  - Work hours

- **Additional Details**
  - Req ID
  - Slug
  - Language(s)
  - Categories
  - Benefits
  - Tags
  - Source
  - Status

- **Dates**
  - Created
  - Updated
  - Published
  - Expires
  - Posted date
  - Posting expiry date

- **Metadata**
  - Region
  - District
  - Location
  - Views
  - Applications
  - Featured status
  - Urgent status
  - Searchable status
  - Apply status
  - LinkedIn Easy Apply status

## Reports

The system generates detailed CSV reports containing all job listings with the following information:
- Basic job information
- Location details
- Employment information
- Dates and timestamps
- Metadata and statistics

## Notes

- Data persistence is handled through Docker volumes
- MongoDB data: `mongodb_data` volume
- Redis cache: `redis_data` volume
- Source JSON files should be placed in the `data` directory
- CSV reports are generated in the project root

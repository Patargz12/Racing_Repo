# Backend Deployment Guide

## 🚀 Deployment Checklist

This backend is production-ready for deployment. Follow these steps:

## ✅ Pre-Deployment Requirements

### 1. Environment Variables
Ensure you have the following environment variables set:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
PORT=4000  # Optional, defaults to 4000
```

### 2. Dependencies Installed
All dependencies are installed and verified:
```bash
npm install
```

### 3. MongoDB Database Setup
- Database Name: `excel_converter`
- Required Collections:
  - `_collection_registry` (automatically created)
  - Racing data collections (uploaded via API)

## 🌐 Deployment Options

### Option 1: Railway.app
1. Create new project on Railway
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically

### Option 2: Render.com
1. Create new Web Service
2. Connect repository
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables

### Option 3: Heroku
```bash
heroku create your-app-name
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set GEMINI_API_KEY="your_gemini_api_key"
git push heroku main
```

### Option 4: AWS EC2 / Digital Ocean
```bash
# SSH into server
ssh user@your-server

# Clone repository
git clone your-repo-url
cd backend

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Create .env file
nano .env  # Add your environment variables

# Start with PM2
pm2 start server.js --name toyota-backend
pm2 save
pm2 startup
```

### Option 5: Docker
```bash
# Build Docker image
docker build -t toyota-backend .

# Run container
docker run -d \
  -p 4000:4000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e GEMINI_API_KEY="your_gemini_api_key" \
  --name toyota-backend \
  toyota-backend
```

## 📋 Post-Deployment Verification

### Health Check
Test the health endpoint:
```bash
curl https://your-deployment-url.com/api/health
```

Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-23T...",
  "mongodb": "connected",
  "collections": 13
}
```

### API Endpoints
- **Upload**: `POST /api/upload`
- **Chat**: `POST /api/chat`
- **Health**: `GET /api/health`

## 🔧 Configuration Details

### Server Configuration
- **Port**: Configurable via `PORT` env variable (default: 4000)
- **File Upload Limit**: 10MB
- **JSON Payload Limit**: 10MB
- **CORS**: Enabled for all origins

### Database Configuration
- **Database Name**: `excel_converter`
- **Registry Collection**: `_collection_registry`
- **Supported File Types**: `.xlsx`, `.xls`, `.csv`

## 📊 Monitoring

### Recommended Monitoring Tools
- **Uptime**: Use UptimeRobot or Pingdom
- **Logs**: Check deployment platform logs
- **MongoDB**: MongoDB Atlas monitoring dashboard

### Key Metrics to Monitor
- API response times
- MongoDB connection status
- File upload success rate
- Session cleanup intervals (every 5 minutes)

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` file
2. **API Keys**: Rotate Gemini API keys regularly
3. **MongoDB**: Use strong passwords and IP whitelist
4. **CORS**: Consider restricting CORS to specific origins in production
5. **Rate Limiting**: Consider adding rate limiting middleware

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Verify MONGODB_URI is correct
- Check MongoDB Atlas IP whitelist
- Ensure network connectivity

**Gemini API Errors**
- Verify GEMINI_API_KEY is valid
- Check API quota limits
- Ensure correct API version

**File Upload Issues**
- Check file size (max 10MB)
- Verify file format (.xlsx, .xls, .csv)
- Check available disk space

## 📝 Production Notes

### Session Management
- Sessions are automatically cleaned up after 30 minutes of inactivity
- Cleanup runs every 5 minutes
- Session data stored in memory

### Collection Registry
- Automatically created on first data upload
- Tracks metadata for all collections
- Enables smart query routing

### File Processing
- Files stored in memory (not saved to disk)
- Supports Excel and CSV formats
- Automatic data type detection

## 🔄 Updates and Maintenance

### Deploying Updates
```bash
git pull origin main
npm install
pm2 restart toyota-backend  # If using PM2
```

### Database Migrations
If you need to backfill the registry:
```bash
node scripts/backfill-registry.js
```

## 📞 Support

For issues or questions, refer to:
- `SETUP_REGISTRY.md` - Registry setup documentation
- `mongodb_collections.md` - Collection structure documentation
- Test files in `test-data/` directory

---

**Backend Version**: 1.0.0  
**Node.js Required**: >= 18.0.0  
**Last Updated**: November 2024


# Application Running Status

## ✅ Services Running

### Docker Services
- ✅ **PostgreSQL**: Running on port `55432`
- ✅ **MinIO**: Running on ports `49000` (API) and `49001` (Console)

### Application Services
- ✅ **API Server**: Starting on port `4312` (default from main.ts)
- ✅ **Web Frontend**: Running on port `4311`

## 🌐 Access URLs

### Frontend (Web Application)
- **URL**: http://localhost:4311
- **Status**: ✅ Running
- **Features Available**:
  - Landing page
  - Authentication (Login/Register)
  - Dashboard
  - Projects management
  - Funding calls
  - Proposals
  - Papers
  - Admin panel

### Backend API
- **URL**: http://localhost:4312
- **Health Check**: http://localhost:4312/health
- **Status**: ✅ Running
- **Endpoints Available**:
  - `/auth/*` - Authentication
  - `/projects/*` - Project management
  - `/proposals/*` - Proposal management
  - `/funding/*` - Funding system
  - `/notifications/*` - Notifications
  - `/ai/*` - AI evaluation and risk detection
  - `/archive/*` - Archiving
  - WebSocket: Real-time communication

### MinIO Console
- **URL**: http://localhost:49001
- **Credentials**: 
  - Username: `edutech`
  - Password: `edutech12345`

### PostgreSQL
- **Host**: `localhost`
- **Port**: `55432`
- **Database**: `edutech`
- **User**: `edutech`
- **Password**: `edutech`

## 🚀 Quick Start

1. **Access the application**: http://localhost:4311
2. **Register/Login**: Create an account or login
3. **Create a project**: Navigate to Projects → Create Project
4. **Test features**:
   - Create milestones and tasks
   - Upload documents
   - Add participants
   - Send messages (Communication tab)
   - View risk alerts
   - Export reports (TXT/PDF/Excel)

## 📝 Notes

- API runs on port `4312` (configurable via `API_PORT` env var)
- Web runs on port `4311` (configured in package.json)
- Database migrations are applied
- All modules are loaded and ready

## 🔧 Troubleshooting

If services aren't responding:
1. Check Docker: `docker compose -f infra/docker-compose.yml ps`
2. Check API logs: Look for "API running on http://localhost:4312"
3. Check Web logs: Look for "Ready" message
4. Verify ports aren't in use: `lsof -i :4311 -i :4312`

---

**Status**: ✅ All services running
**Last Updated**: 2025-11-26



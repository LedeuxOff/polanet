# Polanet Deployment Guide

This guide explains how to deploy the Polanet application to Selectel infrastructure.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   Nginx     │────▶│   Backend   │
│             │     │  (Port 80/  │     │  (Port 3000)│
│             │     │   443)      │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │   SQLite    │
                                        │  (polanet.  │
                                        │    db)      │
                                        └─────────────┘
```

## Prerequisites

### Selectel Project Setup

1. **Create a VPS in Selectel Control Panel**
   - Recommended: 2 vCPU, 4GB RAM, 60GB SSD
   - OS: Ubuntu 22.04 LTS or Debian 12
   - Location: Moscow (for lowest latency)

2. **Configure DNS in Selectel**
   - Add A record: `admin-polanet.ru` → `YOUR_VPS_IP`
   - Add A record: `www.admin-polanet.ru` → `YOUR_VPS_IP` (optional)

3. **Create a user for deployment**
   ```bash
   sudo adduser deploy
   sudo usermod -aG sudo deploy
   ```

### Required Software on VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker deploy

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install curl (for healthchecks)
sudo apt install -y curl
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**

   ```bash
   ssh deploy@admin-polanet.ru
   mkdir -p /home/deploy/polanet
   cd /home/deploy/polanet
   git clone https://your-repo-url.git .
   ```

2. **Configure environment variables**

   ```bash
   # Create .env file in project root
   cat > .env << EOF
   JWT_SECRET=your-super-secret-jwt-key-change-this
   SMS_API_KEY=zAmaZKSynfOXAhA7X6WuUZkN14SIe4SxHE1GQ1Gl6EF3MEoshS6MGhY9VooI
   EOF
   ```

3. **Configure SSL certificates**

   ```bash
   # Create SSL directory
   mkdir -p /home/deploy/polanet/nginx/ssl

   # Obtain SSL certificate (Let's Encrypt)
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d admin-polanet.ru -d www.admin-polanet.ru
   ```

4. **Update Nginx config for SSL**
   Edit `nginx/nginx.conf` and uncomment SSL sections.

5. **Start with Docker Compose**

   ```bash
   docker compose up -d
   ```

6. **Create systemd service for auto-restart**

   ```bash
   cat > /etc/systemd/system/polanet.service << EOF
   [Unit]
   Description=Polanet Application
   After=docker.service
   Requires=docker.service

   [Service]
   Type=oneshot
   RemainAfterExit=yes
   WorkingDirectory=/home/deploy/polanet
   ExecStart=/usr/bin/docker compose up -d
   ExecStop=/usr/bin/docker compose down
   Restart=no

   [Install]
   WantedBy=multi-user.target
   EOF

   sudo systemctl daemon-reload
   sudo systemctl enable polanet
   ```

### Option 2: Manual Deployment (Without Docker)

1. **Clone and setup**

   ```bash
   ssh deploy@admin-polanet.ru
   mkdir -p /home/deploy/polanet
   cd /home/deploy/polanet
   git clone https://your-repo-url.git .
   ```

2. **Install dependencies**

   ```bash
   cd /home/deploy/polanet/backend
   npm ci --production

   cd /home/deploy/polanet/frontend
   npm ci
   npm run build
   ```

3. **Configure Nginx**

   ```bash
   sudo cp /home/deploy/polanet/nginx/nginx.conf /etc/nginx/nginx.conf
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Create systemd service**

   ```bash
   cat > /etc/systemd/system/polanet-backend.service << EOF
   [Unit]
   Description=Polanet Backend API
   After=network.target

   [Service]
   Type=simple
   User=deploy
   WorkingDirectory=/home/deploy/polanet/backend
   ExecStart=/usr/bin/node dist/index.js
   Environment=NODE_ENV=production
   EnvironmentFile=/home/deploy/polanet/backend/.env
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   EOF

   sudo systemctl daemon-reload
   sudo systemctl enable polanet-backend
   sudo systemctl start polanet-backend
   ```

## Environment Variables

### Backend (.env.production)

| Variable                | Description               | Example                                 |
| ----------------------- | ------------------------- | --------------------------------------- |
| `PORT`                  | Backend server port       | `3000`                                  |
| `JWT_SECRET`            | Secret key for JWT tokens | Generate with `openssl rand -base64 32` |
| `AUTO_BACKUP`           | Enable auto backup        | `true`                                  |
| `AUTO_BACKUP_INTERVAL`  | Backup interval in ms     | `3600000` (1 hour)                      |
| `AUTO_BACKUP_MAX_COUNT` | Max backups to keep       | `24`                                    |
| `SMS_API_KEY`           | SMS service API key       | From smsgorod.ru                        |
| `CORS_ORIGIN`           | Allowed origin            | `https://admin-polanet.ru`              |
| `LOG_LEVEL`             | Logging level             | `error`                                 |

## SSL Certificate Setup

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d admin-polanet.ru -d www.admin-polanet.ru

# Auto-renewal is configured by default
# Test renewal with:
sudo certbot renew --dry-run
```

## Database Management

### Initial Setup

```bash
cd /home/deploy/polanet/backend
npm run db:migrate
npm run db:seed
```

### Backup Database

```bash
cd /home/deploy/polanet/backend
npm run db:backup
```

### Restore Database

```bash
cd /home/deploy/polanet/backend
npm run db:restore <backup_filename>
```

### List Backups

```bash
cd /home/deploy/polanet/backend
npm run db:backup:list
```

## Monitoring and Logs

### Check Backend Status

```bash
sudo systemctl status polanet-backend
# or with Docker:
docker ps | grep polanet
```

### View Logs

```bash
# Systemd logs
sudo journalctl -u polanet-backend -f

# Docker logs
docker logs -f polanet-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## Security Recommendations

1. **Firewall Configuration**

   ```bash
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   ```

2. **SSH Hardening**

   ```bash
   # Edit /etc/ssh/sshd_config
   PermitRootLogin no
   PasswordAuthentication no
   PubkeyAuthentication yes
   ```

3. **Regular Updates**

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **JWT Secret**
   - Generate a strong secret: `openssl rand -base64 32`
   - Store in `.env` file, NOT in git

## Troubleshooting

### Backend not starting

```bash
# Check logs
sudo journalctl -u polanet-backend -n 50

# Check if port is in use
sudo lsof -i :3000
```

### Nginx 502 Bad Gateway

```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Restart backend
sudo systemctl restart polanet-backend
```

### Database locked errors

```bash
# Check SQLite file permissions
ls -la /home/deploy/polanet/backend/data/

# Fix permissions
chmod 755 /home/deploy/polanet/backend/data
chmod 644 /home/deploy/polanet/backend/data/polanet.db
```

## Rollback Procedure

1. **Stop current version**

   ```bash
   docker compose down
   # or
   sudo systemctl stop polanet-backend
   ```

2. **Checkout previous version**

   ```bash
   git checkout <previous-commit>
   ```

3. **Redeploy**
   ```bash
   docker compose up -d
   # or
   npm run build
   sudo systemctl start polanet-backend
   ```

## Support

For issues, check:

- Backend logs: `sudo journalctl -u polanet-backend`
- Nginx logs: `/var/log/nginx/error.log`
- Database: `/home/deploy/polanet/backend/data/`

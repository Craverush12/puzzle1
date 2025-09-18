# Kiosk Deployment Guide

This guide provides comprehensive instructions for deploying the SNB Puzzle App on a vertical kiosk system.

## Prerequisites

- Windows 10/11 or Linux system
- Touch screen display (vertical orientation recommended)
- Modern web browser (Chrome, Edge, or Firefox)
- Node.js 18+ (for development)
- Internet connection (for initial setup)

## Quick Deployment Steps

### 1. Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The built files will be in the 'out' directory
```

### 2. Deploy to Web Server

#### Option A: Static File Server
```bash
# Using Python (if available)
cd out
python -m http.server 8080

# Using Node.js serve package
npx serve out -p 8080
```

#### Option B: Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-kiosk-domain.com;
    root /path/to/out;
    index index.html;
    
    # Kiosk-specific headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Browser Kiosk Configuration

#### Chrome/Edge Kiosk Mode
```bash
# Windows
chrome.exe --kiosk --disable-infobars --disable-session-crashed-bubble --disable-dev-shm-usage --no-first-run --disable-default-apps --disable-popup-blocking --disable-translate --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows --disable-features=TranslateUI --disable-ipc-flooding-protection --autoplay-policy=no-user-gesture-required http://localhost:8080

# Linux
google-chrome --kiosk --disable-infobars --disable-session-crashed-bubble --disable-dev-shm-usage --no-first-run --disable-default-apps --disable-popup-blocking --disable-translate --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows --disable-features=TranslateUI --disable-ipc-flooding-protection --autoplay-policy=no-user-gesture-required http://localhost:8080
```

#### Firefox Kiosk Mode
```bash
# Windows
firefox.exe -kiosk http://localhost:8080

# Linux
firefox -kiosk http://localhost:8080
```

## Advanced Kiosk Setup

### Windows Kiosk Mode (Assigned Access)

1. **Enable Kiosk Mode:**
   - Go to Settings > Accounts > Family & other users
   - Click "Set up a kiosk"
   - Choose "Assigned access"
   - Select the browser and app

2. **Configure Auto-Login:**
   - Create a dedicated kiosk user account
   - Set up automatic login in User Accounts

3. **Disable Windows Updates:**
   - Go to Settings > Update & Security
   - Pause updates for the kiosk system

### Linux Kiosk Setup

#### Using X11
```bash
# Install required packages
sudo apt update
sudo apt install xorg openbox chromium-browser

# Create kiosk user
sudo useradd -m -s /bin/bash kiosk

# Create startup script
sudo nano /home/kiosk/start-kiosk.sh
```

```bash
#!/bin/bash
# /home/kiosk/start-kiosk.sh
export DISPLAY=:0
xset s off
xset -dpms
xset s noblank
openbox &
chromium-browser --kiosk --disable-infobars --no-first-run --disable-default-apps --disable-popup-blocking --disable-translate --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows --disable-features=TranslateUI --disable-ipc-flooding-protection --autoplay-policy=no-user-gesture-required http://localhost:8080
```

#### Using Wayland (Ubuntu 22.04+)
```bash
# Install required packages
sudo apt install gnome-session-wayland firefox

# Configure GNOME for kiosk mode
sudo apt install gnome-shell-extension-manager
```

## System Configuration

### Display Settings

1. **Set Vertical Orientation:**
   - Windows: Display Settings > Orientation > Portrait
   - Linux: `xrandr --output HDMI-1 --rotate left` (or right)

2. **Disable Screen Saver:**
   - Windows: Power Options > Never turn off display
   - Linux: `xset s off && xset -dpms`

3. **Set Brightness:**
   - Adjust for indoor/outdoor visibility
   - Consider automatic brightness adjustment

### Network Configuration

1. **Static IP (Recommended):**
   ```bash
   # Windows: Network Settings > Change adapter options
   # Linux: /etc/netplan/01-netcfg.yaml
   ```

2. **Firewall Rules:**
   ```bash
   # Allow only necessary ports
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

### Security Hardening

1. **Disable Unnecessary Services:**
   ```bash
   # Windows: Services.msc
   # Linux: systemctl disable <service-name>
   ```

2. **Remove Unnecessary Software:**
   - Uninstall unused applications
   - Disable Windows Store (Windows)
   - Remove desktop environment (Linux)

3. **Enable Auto-Updates for Security:**
   - Keep system security patches current
   - Schedule maintenance windows

## Monitoring and Maintenance

### Health Monitoring

1. **System Resources:**
   - Monitor CPU, memory, and disk usage
   - Set up alerts for high resource usage

2. **Application Health:**
   - The app includes built-in performance monitoring
   - Check browser console for errors
   - Monitor network connectivity

3. **Hardware Health:**
   - Monitor touch screen responsiveness
   - Check display brightness and clarity
   - Monitor temperature (if sensors available)

### Maintenance Schedule

1. **Daily:**
   - Check system is running
   - Verify touch screen functionality
   - Check network connectivity

2. **Weekly:**
   - Review error logs
   - Check disk space
   - Test backup systems

3. **Monthly:**
   - Update application (if needed)
   - Clean hardware
   - Review performance metrics

## Troubleshooting

### Common Issues

1. **Touch Screen Not Responding:**
   - Check touch screen drivers
   - Recalibrate touch screen
   - Restart browser/application

2. **Application Not Loading:**
   - Check network connectivity
   - Verify web server is running
   - Check browser console for errors

3. **Performance Issues:**
   - Check system resources
   - Clear browser cache
   - Restart application

4. **Display Issues:**
   - Check display orientation
   - Verify resolution settings
   - Check brightness/contrast

### Recovery Procedures

1. **Application Recovery:**
   - The app includes auto-restart functionality
   - Manual restart: Ctrl+Alt+Del (Windows) or Alt+F4
   - Browser restart: Close and reopen browser

2. **System Recovery:**
   - Hard reset: Power button hold
   - Safe mode boot (if needed)
   - System restore (Windows)

3. **Network Recovery:**
   - Check physical connections
   - Restart network services
   - Verify DNS settings

## Backup and Recovery

### Application Backup
```bash
# Backup application files
tar -czf kiosk-app-backup-$(date +%Y%m%d).tar.gz /path/to/out

# Backup system configuration
sudo tar -czf kiosk-config-backup-$(date +%Y%m%d).tar.gz /etc/network /etc/systemd
```

### Recovery Image
1. Create system image after successful setup
2. Store on external media
3. Test recovery procedure

## Performance Optimization

### Browser Optimization
- Disable unnecessary browser extensions
- Clear cache regularly
- Use hardware acceleration
- Optimize memory usage

### System Optimization
- Disable visual effects
- Optimize startup programs
- Use SSD storage
- Ensure adequate RAM (4GB minimum)

## Security Considerations

1. **Physical Security:**
   - Secure kiosk hardware
   - Prevent unauthorized access
   - Regular security audits

2. **Network Security:**
   - Use HTTPS in production
   - Implement firewall rules
   - Monitor network traffic

3. **Application Security:**
   - Regular security updates
   - Input validation
   - Error handling

## Support and Maintenance

### Log Files
- Application logs: Browser console
- System logs: `/var/log/` (Linux) or Event Viewer (Windows)
- Network logs: Router/firewall logs

### Contact Information
- Technical support: [Your support contact]
- Emergency contact: [Emergency contact]
- Maintenance schedule: [Maintenance contact]

---

## Quick Reference Commands

### Start Kiosk Mode
```bash
# Chrome/Edge
chrome --kiosk --disable-infobars http://localhost:8080

# Firefox
firefox -kiosk http://localhost:8080
```

### Check System Status
```bash
# Check if app is running
curl -I http://localhost:8080

# Check system resources
top
htop
```

### Restart Services
```bash
# Restart web server
sudo systemctl restart nginx

# Restart browser (kill and restart)
pkill chrome
chrome --kiosk http://localhost:8080 &
```

This guide provides a comprehensive foundation for deploying and maintaining your kiosk application. Adjust configurations based on your specific hardware and requirements.

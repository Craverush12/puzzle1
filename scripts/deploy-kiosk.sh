#!/bin/bash

# Kiosk Deployment Script for Linux
# This script sets up the SNB Puzzle App for kiosk deployment

set -e

echo "🚀 Starting Kiosk Deployment Setup..."

# Configuration
KIOSK_USER="kiosk"
KIOSK_APP_URL="http://localhost:8080"
KIOSK_DIR="/opt/kiosk-app"
SERVICE_NAME="kiosk-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if user has sudo privileges
if ! sudo -n true 2>/dev/null; then
    print_error "This script requires sudo privileges"
    exit 1
fi

print_status "Installing required packages..."

# Update package list
sudo apt update

# Install required packages
sudo apt install -y \
    xorg \
    openbox \
    chromium-browser \
    unclutter \
    xdotool \
    xinput \
    curl \
    wget \
    nginx \
    ufw

print_status "Creating kiosk user..."

# Create kiosk user if it doesn't exist
if ! id "$KIOSK_USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash "$KIOSK_USER"
    print_status "Created kiosk user: $KIOSK_USER"
else
    print_status "Kiosk user already exists: $KIOSK_USER"
fi

# Add current user to kiosk group for management
sudo usermod -a -G "$KIOSK_USER" "$USER"

print_status "Setting up application directory..."

# Create application directory
sudo mkdir -p "$KIOSK_DIR"
sudo chown "$KIOSK_USER:$KIOSK_USER" "$KIOSK_DIR"

# Copy application files (assuming they're in the current directory)
if [ -d "out" ]; then
    print_status "Copying application files..."
    sudo cp -r out/* "$KIOSK_DIR/"
    sudo chown -R "$KIOSK_USER:$KIOSK_USER" "$KIOSK_DIR"
else
    print_warning "No 'out' directory found. Please build the application first with 'npm run build'"
    print_status "Creating placeholder directory structure..."
    sudo mkdir -p "$KIOSK_DIR"
    sudo chown -R "$KIOSK_USER:$KIOSK_USER" "$KIOSK_DIR"
fi

print_status "Configuring Nginx..."

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/kiosk-app > /dev/null <<EOF
server {
    listen 80;
    server_name localhost;
    root $KIOSK_DIR;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Disable access logs for performance
    access_log off;
    error_log /var/log/nginx/kiosk-app-error.log;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/kiosk-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start and enable Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

print_status "Creating kiosk startup script..."

# Create startup script for kiosk user
sudo tee /home/$KIOSK_USER/start-kiosk.sh > /dev/null <<EOF
#!/bin/bash

# Kiosk startup script
export DISPLAY=:0

# Disable screen saver and power management
xset s off
xset -dpms
xset s noblank

# Hide cursor
unclutter -idle 1 -root &

# Start window manager
openbox &

# Wait for window manager to start
sleep 2

# Start browser in kiosk mode
chromium-browser \\
    --kiosk \\
    --disable-infobars \\
    --disable-session-crashed-bubble \\
    --disable-dev-shm-usage \\
    --no-first-run \\
    --disable-default-apps \\
    --disable-popup-blocking \\
    --disable-translate \\
    --disable-background-timer-throttling \\
    --disable-renderer-backgrounding \\
    --disable-backgrounding-occluded-windows \\
    --disable-features=TranslateUI \\
    --disable-ipc-flooding-protection \\
    --autoplay-policy=no-user-gesture-required \\
    --disable-web-security \\
    --disable-features=VizDisplayCompositor \\
    --enable-features=UseOzonePlatform \\
    --ozone-platform=wayland \\
    $KIOSK_APP_URL

# If browser crashes, restart it
while true; do
    sleep 5
    if ! pgrep chromium-browser > /dev/null; then
        print_status "Browser crashed, restarting..."
        chromium-browser \\
            --kiosk \\
            --disable-infobars \\
            --disable-session-crashed-bubble \\
            --disable-dev-shm-usage \\
            --no-first-run \\
            --disable-default-apps \\
            --disable-popup-blocking \\
            --disable-translate \\
            --disable-background-timer-throttling \\
            --disable-renderer-backgrounding \\
            --disable-backgrounding-occluded-windows \\
            --disable-features=TranslateUI \\
            --disable-ipc-flooding-protection \\
            --autoplay-policy=no-user-gesture-required \\
            --disable-web-security \\
            --disable-features=VizDisplayCompositor \\
            --enable-features=UseOzonePlatform \\
            --ozone-platform=wayland \\
            $KIOSK_APP_URL &
    fi
done
EOF

# Make script executable
sudo chmod +x /home/$KIOSK_USER/start-kiosk.sh
sudo chown "$KIOSK_USER:$KIOSK_USER" /home/$KIOSK_USER/start-kiosk.sh

print_status "Creating systemd service..."

# Create systemd service
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=Kiosk Application
After=graphical-session.target
Wants=graphical-session.target

[Service]
Type=simple
User=$KIOSK_USER
Group=$KIOSK_USER
Environment=DISPLAY=:0
ExecStart=/home/$KIOSK_USER/start-kiosk.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=graphical-session.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME

print_status "Configuring firewall..."

# Configure firewall
sudo ufw --force enable
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS

print_status "Setting up auto-login..."

# Configure auto-login for kiosk user
sudo mkdir -p /etc/systemd/system/getty@tty1.service.d
sudo tee /etc/systemd/system/getty@tty1.service.d/autologin.conf > /dev/null <<EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin $KIOSK_USER --noclear %I \$TERM
EOF

print_status "Configuring display settings..."

# Create display configuration script
sudo tee /home/$KIOSK_USER/configure-display.sh > /dev/null <<EOF
#!/bin/bash

# Wait for display to be ready
sleep 5

# Set display to portrait mode (vertical)
xrandr --output \$(xrandr | grep " connected" | cut -d' ' -f1) --rotate left

# Set brightness to 80%
xrandr --output \$(xrandr | grep " connected" | cut -d' ' -f1) --brightness 0.8

# Disable screen blanking
xset s off
xset -dpms
xset s noblank
EOF

sudo chmod +x /home/$KIOSK_USER/configure-display.sh
sudo chown "$KIOSK_USER:$KIOSK_USER" /home/$KIOSK_USER/configure-display.sh

print_status "Creating management scripts..."

# Create management scripts in current user's home
mkdir -p ~/kiosk-management

# Start kiosk script
tee ~/kiosk-management/start-kiosk.sh > /dev/null <<EOF
#!/bin/bash
echo "Starting kiosk application..."
sudo systemctl start $SERVICE_NAME
sudo systemctl status $SERVICE_NAME
EOF

# Stop kiosk script
tee ~/kiosk-management/stop-kiosk.sh > /dev/null <<EOF
#!/bin/bash
echo "Stopping kiosk application..."
sudo systemctl stop $SERVICE_NAME
sudo pkill chromium-browser
sudo pkill openbox
EOF

# Restart kiosk script
tee ~/kiosk-management/restart-kiosk.sh > /dev/null <<EOF
#!/bin/bash
echo "Restarting kiosk application..."
sudo systemctl restart $SERVICE_NAME
sudo systemctl status $SERVICE_NAME
EOF

# Status check script
tee ~/kiosk-management/status-kiosk.sh > /dev/null <<EOF
#!/bin/bash
echo "Kiosk Application Status:"
echo "========================"
sudo systemctl status $SERVICE_NAME --no-pager
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager
echo ""
echo "Application URL:"
curl -I $KIOSK_APP_URL 2>/dev/null | head -1 || echo "Application not responding"
EOF

# Update application script
tee ~/kiosk-management/update-app.sh > /dev/null <<EOF
#!/bin/bash
echo "Updating kiosk application..."

# Stop the service
sudo systemctl stop $SERVICE_NAME

# Backup current version
sudo cp -r $KIOSK_DIR $KIOSK_DIR.backup.\$(date +%Y%m%d_%H%M%S)

# Copy new version
if [ -d "out" ]; then
    sudo cp -r out/* $KIOSK_DIR/
    sudo chown -R $KIOSK_USER:$KIOSK_USER $KIOSK_DIR
    echo "Application updated successfully"
else
    echo "Error: No 'out' directory found. Please build the application first."
    exit 1
fi

# Restart the service
sudo systemctl start $SERVICE_NAME
echo "Kiosk application restarted"
EOF

# Make management scripts executable
chmod +x ~/kiosk-management/*.sh

print_status "Creating desktop shortcuts..."

# Create desktop shortcuts for management
tee ~/Desktop/Start\ Kiosk.desktop > /dev/null <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Start Kiosk
Comment=Start the kiosk application
Exec=$HOME/kiosk-management/start-kiosk.sh
Icon=applications-internet
Terminal=true
EOF

tee ~/Desktop/Stop\ Kiosk.desktop > /dev/null <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Stop Kiosk
Comment=Stop the kiosk application
Exec=$HOME/kiosk-management/stop-kiosk.sh
Icon=applications-internet
Terminal=true
EOF

chmod +x ~/Desktop/*.desktop

print_status "Setup completed successfully!"
echo ""
echo "🎉 Kiosk deployment setup is complete!"
echo ""
echo "📋 Next steps:"
echo "1. Build your application: npm run build"
echo "2. Update the application: ~/kiosk-management/update-app.sh"
echo "3. Start the kiosk: ~/kiosk-management/start-kiosk.sh"
echo "4. Reboot the system to enable auto-login"
echo ""
echo "🛠️  Management commands:"
echo "  Start:   ~/kiosk-management/start-kiosk.sh"
echo "  Stop:    ~/kiosk-management/stop-kiosk.sh"
echo "  Restart: ~/kiosk-management/restart-kiosk.sh"
echo "  Status:  ~/kiosk-management/status-kiosk.sh"
echo "  Update:  ~/kiosk-management/update-app.sh"
echo ""
echo "🌐 Application URL: $KIOSK_APP_URL"
echo "👤 Kiosk User: $KIOSK_USER"
echo "📁 App Directory: $KIOSK_DIR"
echo ""
print_warning "Remember to reboot the system to enable auto-login for the kiosk user!"

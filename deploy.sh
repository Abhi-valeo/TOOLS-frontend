#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Create deployment directory if it doesn't exist
echo "Creating deployment directory..."
ssh -i "~/Downloads/chatbotec2.pem" ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com "sudo mkdir -p /var/www/packages-app"

# Copy the built files to the EC2 instance
echo "Copying files to EC2..."
scp -i "~/Downloads/chatbotec2.pem" -r dist/* ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com:/tmp/packages-app/

# Move files to the correct location and set permissions
echo "Setting up files on EC2..."
ssh -i "~/Downloads/chatbotec2.pem" ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com "sudo mv /tmp/packages-app/* /var/www/packages-app/ && sudo chown -R nginx:nginx /var/www/packages-app"

# Copy nginx configuration
echo "Updating nginx configuration..."
scp -i "~/Downloads/chatbotec2.pem" nginx.conf ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com:/tmp/nginx.conf
ssh -i "~/Downloads/chatbotec2.pem" ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com "sudo mv /tmp/nginx.conf /etc/nginx/conf.d/default.conf"

# Restart nginx
echo "Restarting nginx..."
ssh -i "~/Downloads/chatbotec2.pem" ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com "sudo systemctl restart nginx"

echo "Deployment completed successfully!"
echo "Your packages app is now live at: http://ec2-34-227-108-46.compute-1.amazonaws.com/packages/" 
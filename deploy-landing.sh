#!/bin/bash

echo "Deploying modern landing page..."

# Create deployment directory
echo "Creating deployment directory..."
ssh -i "~/Downloads/chatbotec2.pem" ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com "sudo mkdir -p /var/www/landing"

# Copy the landing page to the EC2 instance
echo "Copying landing page to EC2..."
scp -i "~/Downloads/chatbotec2.pem" index.html ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com:/tmp/landing.html

# Move file to the correct location and set permissions
echo "Setting up landing page on EC2..."
ssh -i "~/Downloads/chatbotec2.pem" ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com "sudo mv /tmp/landing.html /var/www/landing/index.html && sudo chown -R nginx:nginx /var/www/landing"

# Copy nginx configuration
echo "Updating nginx configuration..."
scp -i "~/Downloads/chatbotec2.pem" nginx.conf ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com:/tmp/nginx.conf
ssh -i "~/Downloads/chatbotec2.pem" ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com "sudo mv /tmp/nginx.conf /etc/nginx/conf.d/default.conf"

# Restart nginx
echo "Restarting nginx..."
ssh -i "~/Downloads/chatbotec2.pem" ec2-user@ec2-34-227-108-46.compute-1.amazonaws.com "sudo systemctl restart nginx"

echo "Landing page deployment completed successfully!"
echo "Your landing page is now live at: http://ec2-34-227-108-46.compute-1.amazonaws.com/" 
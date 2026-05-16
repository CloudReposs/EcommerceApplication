const mongoose = require("mongoose");
require('dotenv').config();


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } 
    catch (error) {
        console.log(error);
        process.exit(1);
    }
};































/*
MERN STACK DEPLOYMENT ON AZURE VM
WITH PM2 AND NGINX REVERSE PROXY
PRODUCTION STYLE DEPLOYMENT
FRONTEND ACCESS USING PUBLIC_IP

====================================================
ARCHITECTURE
============

Browser
↓
Nginx Reverse Proxy :80
↓
Frontend React/Vite Application :3000
↓ API Requests
Backend Node/Express Server :5000
↓
MongoDB Database

PM2 manages:

1. Frontend Process
2. Backend Process

====================================================
STEP 1 — CREATE RESOURCE GROUP
==============================

Azure Portal → Search:

Resource Groups

Click:

Create

Configuration:

Resource Group Name:
mern-rg

Region:
Central India

====================================================
STEP 2 — CREATE VIRTUAL MACHINE
===============================

Azure Portal → Search:

Virtual Machines

Click:

Create → Azure Virtual Machine

Configuration:

Resource Group:
mern-rg

VM Name:
vm1

Region:
Central India

Image:
Ubuntu Server 22.04 LTS

Size:
Standard_B1s

Authentication:
SSH Public Key

Username:
azureuser

Allow Inbound Ports:

22
80

Download:

vm1_key.pem

====================================================
STEP 3 — CONNECT TO VM
======================

chmod 400 vm1_key.pem

ssh -i vm1_key.pem azureuser@PUBLIC_IP

Example:

ssh -i vm1_key.pem [azureuser@20.xx.xx.xx](mailto:azureuser@20.xx.xx.xx)

====================================================
STEP 4 — UPDATE UBUNTU
======================

sudo apt update

sudo apt upgrade -y

====================================================
STEP 5 — INSTALL NODEJS
=======================

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo apt install nodejs -y

node -v

npm -v

====================================================
STEP 6 — INSTALL GIT
====================

sudo apt install git -y

git --version

====================================================
STEP 7 — INSTALL NGINX
======================

sudo apt install nginx -y

sudo systemctl start nginx

sudo systemctl enable nginx

sudo systemctl status nginx

====================================================
STEP 8 — INSTALL PM2
====================

sudo npm install -g pm2

pm2 -v

====================================================
STEP 9 — CLONE PROJECT
======================

git clone YOUR_GITHUB_REPO_LINK

Example:

git clone https://github.com/username/blog-application.git

cd blog-application

====================================================
STEP 10 — BACKEND SETUP
=======================

cd backend

npm install

nano .env

Example:

PORT=5000

MONGO_URI=YOUR_MONGODB_CONNECTION_STRING

SAVE:

CTRL + O
ENTER
CTRL + X

====================================================
STEP 11 — CONFIGURE BACKEND HOST
================================

nano server.js

Update:

app.listen(5000, "0.0.0.0", () => {
console.log("Server Running");
});

====================================================
STEP 12 — START BACKEND USING PM2
=================================

pm2 start npm --name backend -- start

OR

pm2 start server.js --name backend

Check backend:

pm2 list

====================================================
STEP 13 — FRONTEND SETUP
========================

cd ../frontend

npm install

====================================================
STEP 14 — UPDATE FRONTEND API URL
=================================

Replace:

http://PUBLIC_IP:5000

OR

localhost:5000

with:

/api

Example:

axios.get("/api/posts")

====================================================
STEP 15 — START FRONTEND USING PM2
==================================

For Vite:

pm2 start "npm run dev -- --host 0.0.0.0" --name frontend

For Create React App:

pm2 start "HOST=0.0.0.0 npm start" --name frontend

Check frontend:

pm2 list

====================================================
STEP 16 — CONFIGURE NGINX REVERSE PROXY
=======================================

Open nginx configuration:

sudo nano /etc/nginx/sites-available/default

Delete everything and paste:

server {

listen 80;

server_name _;

location / {

    proxy_pass http://localhost:3000;

    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;

    proxy_set_header Connection "upgrade";

    proxy_set_header Host $host;

}

location /api/ {

    proxy_pass http://localhost:5000/;

    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;

    proxy_set_header Connection "upgrade";

    proxy_set_header Host $host;

}

}

SAVE:

CTRL + O
ENTER
CTRL + X

====================================================
STEP 17 — TEST NGINX CONFIGURATION
==================================

sudo nginx -t

Expected:

syntax is ok

test is successful

====================================================
STEP 18 — RESTART NGINX
=======================

sudo systemctl restart nginx

====================================================
STEP 19 — SAVE PM2 PROCESSES
============================

pm2 save

====================================================
STEP 20 — ENABLE PM2 AUTO START
===============================

pm2 startup

PM2 gives another command.

Example:

sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u azureuser --hp /home/azureuser

Run the generated command.

Then again run:

pm2 save

====================================================
STEP 21 — AZURE NETWORKING
==========================

Azure Portal → VM → Networking

Allow Inbound Rules:

22
80

Protocol:
TCP

Action:
Allow

====================================================
STEP 22 — ACCESS APPLICATION
============================

Frontend:

http://PUBLIC_IP

Example:

http://20.xx.xx.xx

Backend API:

http://PUBLIC_IP/api

====================================================
IMPORTANT COMMANDS SUMMARY
==========================

Connect VM:
ssh -i vm1_key.pem azureuser@IP

Install Packages:
npm install

Start Backend PM2:
pm2 start npm --name backend -- start

Start Frontend PM2:
pm2 start "npm run dev -- --host 0.0.0.0" --name frontend

Check PM2:
pm2 list

View PM2 Logs:
pm2 logs

Save PM2:
pm2 save

Restart Nginx:
sudo systemctl restart nginx

Check Nginx Status:
sudo systemctl status nginx

Test Nginx Config:
sudo nginx -t

Check Ports:
sudo ss -tulnp

====================================================
IMPORTANT NOTES
===============

Applications continue running even after:

1. SSH terminal closes
2. Laptop shuts down
3. SSH disconnects
4. VM reboots

Because PM2 manages processes.

Nginx acts as reverse proxy.

It forwards:

/       → Frontend Port 3000
/api    → Backend Port 5000

Only Port 80 is publicly exposed.



This is for stage 1 simple without setting the reverse proxy
====================================================
STEP 10 — START BACKEND
=======================

npm start


====================================================
STEP 13 — UPDATE FRONTEND API URL
=================================

Replace:

localhost:5000

with:

http://PUBLIC_IP:5000

Example:

axios.get("http://20.xx.xx.xx:5000/api/posts")

====================================================
STEP 14 — START FRONTEND
========================

For Vite:

npm run dev -- --host 0.0.0.0



*/
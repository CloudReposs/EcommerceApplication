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
1. CONNECT TO VM
chmod 400 vm1_key.pem
ssh -i vm1_key.pem azureuser@PUBLIC_IP

2. UPDATE UBUNTU
sudo apt update
sudo apt upgrade -y

3. INSTALL NODEJS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
node -v
npm -v

4. INSTALL GIT + NGINX + PM2
sudo apt install git nginx -y
sudo npm install -g pm2

5. START NGINX
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx

6. CLONE PROJECT
git clone YOUR_GITHUB_REPO_LINK
cd PROJECT_NAME


7. BACKEND SETUP
cd backend
npm install
nano .env


8. CONFIGURE BACKEND HOST
nano server.js
app.listen(5000, "0.0.0.0", () => {
    console.log("Server Running");
});


9. START BACKEND USING PM2
pm2 start npm --name backend -- start


10. FRONTEND SETUP
cd ../frontend
npm install


11. UPDATE FRONTEND API URL
Replace:
localhost:5000
OR
http://PUBLIC_IP:5000
with:
http://PUBLIC_IP/api


12. BUILD FRONTEND
npm run build

13. CONFIGURE NGINX
sudo nano /etc/nginx/sites-available/default


14. PASTE THIS
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

15. TEST NGINX
sudo nginx -t

16. RESTART NGINX
sudo systemctl restart nginx

17. SAVE PM2
pm2 save


18. ENABLE PM2 AUTO START
pm2 startup

19. Start Frontend if this not works
pm2 start "npm run dev -- --host=0.0.0.0" --name frontend

Run generated command.
Then:
pm2 save


19. AZURE NETWORKING

Allow:

22
80


20. ACCESS APPLICATION

Frontend:

http://PUBLIC_IP

Backend API:

http://PUBLIC_IP/api
*/
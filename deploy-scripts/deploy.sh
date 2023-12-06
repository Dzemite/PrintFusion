cd ../backend/print-fusion
pm2 delete APP_NAME
nvm use 20
NODE_ENV=production pm2 start --name APP_NAME npm -- start
cd ../../frontend/dist
rm -rf /var/www/html
mkdir /var/www/html
cp -a ./PrintFusion/. /var/www/html

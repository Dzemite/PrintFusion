cd ../backend/print-fusion
pm2 delete PrintFusionBackend
NODE_ENV=production pm2 start --name PrintFusionBackend npm -- start
cd ../../frontend/dist
rm -rf /var/www/html
mkdir /var/www/html
cp -a ./PrintFusion/. /var/www/html

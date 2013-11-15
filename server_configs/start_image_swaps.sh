#!/bin/sh
service nginx restart
if [ $(ps aux | grep $USER | grep node | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then
        export PATH=/usr/local/bin:$PATH
        export NODE_ENV=production
        forever start -a -l /var/log/image_swaps/forever.log -e /var/log/image_swaps/err.log /var/www/domain.com/app.js
fi
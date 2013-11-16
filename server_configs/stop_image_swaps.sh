#!/bin/sh
export PATH=/usr/local/bin:$PATH
export NODE_ENV=production
forever stop /var/www/exampe.com/app.js
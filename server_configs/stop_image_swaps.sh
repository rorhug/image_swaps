#!/bin/sh
export PATH=/usr/local/bin:$PATH
export NODE_ENV=production
forever stop /var/www/domain.com/app.js
#!/usr/bin/bash
echo 'navigating to application prime lab sys dir'
cd /f/PROJECTS/lobnos
echo '-----------------------------------------'
echo 'initiating build'
npm run build
echo 'starting application'
npm run start
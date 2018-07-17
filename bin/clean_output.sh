#!/bin/sh
# this script will delete all output files older than the given amount of time in minutes
# best to set this to run as a cron job every hour
source "$(dirname $0)/include.sh";
MAX_AGE_MINS=`expr 6 \* 60`;
find "${OUTPUT_DIR}" -depth -cmin +${MAX_AGE_MINS} -iname *.mp3 -delete;
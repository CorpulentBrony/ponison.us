#!/bin/sh
# this script will sleep for a specified number of seconds and then delete a given file
# this is used after generating output files
echo "scheduling your deletion of file ${2} after ${1} seconds";
sleep ${1};
rm ${2};
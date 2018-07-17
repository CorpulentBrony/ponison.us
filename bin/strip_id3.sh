#!/bin/sh
# this script will use id3convert to strip all id3v1 and id3v2 tags from MP3 files in the ROOT_DIR and AUDIO_DIR directories
# this should be executed any time files are loaded in order to ensure more accurate file duration estimates
source "$(dirname $0)/include.sh";
ID3_CONVERT="/usr/bin/id3convert";
find "${AUDIO_DIR}" -iname *.mp3 -execdir "${ID3_CONVERT}" -s '{}' \;;
find "${PONY_DIR}" -maxdepth 3 -iname *.mp3 -execdir "${ID3_CONVERT}" -s '{}' \;;
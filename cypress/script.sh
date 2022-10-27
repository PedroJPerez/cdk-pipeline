#!/bin/sh
COMMAND=`yarn run cypress version`
export SUMMARY="$COMMAND"

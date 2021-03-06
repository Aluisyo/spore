#!/bin/bash
if [ -z "$SPORE_WORKING_DIR" ];
then
  export SPORE_WORKING_DIR=`pwd`
fi

if [ -z "$SPORE_NPM_LOCATION" ];
then
  export SPORE_NPM_LOCATION=$(npm config --global get prefix)/lib/node_modules/eth-spore
fi

# Hack. babel-node will clobber -e, and it doesn't look like `--` will stop it.
# Because we're doing string replacement, we have to take edge cases into account.
args=" $@"
# args="$SPORE_WORKING_DIR $args"

node -- $SPORE_NPM_LOCATION/spore.es6 ${args}

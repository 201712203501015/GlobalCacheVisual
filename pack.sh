#!/bin/bash
set -x
set -e
SCRIPT_HOME=$(cd $(dirname $0); pwd)

function main() {
  echo "[WARN] pack global cache visual start"
  
  cd $SCRIPT_HOME

  npm install -g npm-pack-all

  npm install
  
  rm -rf $SCRIPT_HOME/dist $SCRIPT_HOME/GlobalCacheVisual.tgz

  npm-pack-all --output GlobalCacheVisual.tgz

  echo "[WARN] pack global cache visual end"
}
main

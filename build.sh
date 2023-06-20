#/bin/bash
SCRIPT_HOME=$(cd $(dirname $0)/; pwd)

function main()
{
    cd $SCRIPT_HOME
    
    if [ ! -d "$SCRIPT_HOME/node_modules" ]; then
        npm install
    fi

    npm run build
}
main
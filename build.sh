#/bin/bash
SCRIPT_HOME=$(cd $(dirname $0)/; pwd)

function main()
{
    cd $SCRIPT_HOME

    npm install

    npm run build
}
main
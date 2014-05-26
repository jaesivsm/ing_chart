#!/bin/bash
JQUERY_UI="jquery-ui-1.10.4"
LIB_CHART="lib/Chart.js"
JQ_DATE_LOC="lib/jquery/datepicker-fr.js"
echo "Downloading JQuery UI"
wget --quiet http://jqueryui.com/resources/download/$JQUERY_UI.zip
echo "Downloading JQuery DatePicker"
wget --quiet -O $JQ_DATE_LOC https://raw.githubusercontent.com/jquery/jquery-ui/master/ui/i18n/datepicker-fr.js
echo "Downloading Chart.js"
wget --quiet -O $LIB_CHART https://raw.githubusercontent.com/nnnick/Chart.js/master/Chart.js

echo "Uncompressing JQuery UI"
unzip -q $JQUERY_UI.zip

echo "Cleaning JQuery UI files"
mv $JQUERY_UI/css lib/jquery/
mv $JQUERY_UI/js/$JQUERY_UI.min.js lib/jquery/jquery-ui.js
rm $JQUERY_UI/js/$JQUERY_UI.js
mv $JQUERY_UI/js/*.js lib/jquery/jquery.js
rm $JQUERY_UI.zip -rf $JQUERY_UI

echo "Minifying JS files"
if [ "$(which yui-compressor)" != '' ]; then
    echo yui-compressor $LIB_CHART -e $LIB_CHART
    yui-compressor $LIB_CHART -o $LIB_CHART
    echo yui-compressor $JQ_DATE_LOC -e $JQ_DATE_LOC
    yui-compressor $JQ_DATE_LOC -o $JQ_DATE_LOC
    echo yui-compressor lib/jquery/jquery.js -e lib/jquery/jquery.js
    yui-compressor lib/jquery/jquery.js -o lib/jquery/jquery.js
fi

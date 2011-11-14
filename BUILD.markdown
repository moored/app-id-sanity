# Building for Chrome

Add a chrome alias for a tidier command line

    alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
    
Then build thus:

    $ chrome --pack-extension=./App\ ID\ Sanity.safariextension/ \
    --pack-extension-key=./uk.co.goosoftware.app-id-sanity.chrome.pem 
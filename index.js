#!/usr/bin/env node
const checkLinks = require('check-links')
const siteList = require('./sitelist.json')
const path = require('path')

var convert = require('xml-js')
var fs = require('fs')

async function  main()
{

    if(!process.env.SITE_MAP_LOCATION)
        throw new Error("Environmental variable SITE_MAP_LOCATION is not defined. Please define this before running this. It must be a relative path relative to this module's workspace.")
    
    console.log("Using " + __dirname  + '/' + process.env.SITE_MAP_LOCATION)
    const parsed = [];
    
    const data = fs.readFileSync(path.resolve(__dirname  + '/' + process.env.SITE_MAP_LOCATION), 'utf8')
    const sitemap = JSON.parse(convert.xml2json(data, {compact: true, spaces: 4}))
    sitemap.urlset.url.forEach(location => {
        parsed.push(location.loc._text)
    });

    console.log("Checking links")
    const results = await checkLinks(parsed, {
        timeout: 30000,
        retry: 1
    })

    console.log(results)
    let allOk = true;
    
    for (var link in results)
    {
        if(results[link].statusCode != 200)
        {
            allOk = false;
            console.log("Link has issues:")
            console.log(link)
        }
    }

    if(allOk)
    {
        console.log("All links returned 200 OK status codes!")
    }
    else
    {
        throw new Error('Not all links returned 200 OK status codes. Check the output above for details.')
    }
}


main()
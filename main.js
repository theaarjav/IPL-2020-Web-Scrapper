const fs=require("fs");
const request = require("request");
const cheerio = require("cheerio");
const score=require("./scorecard");
const path=require("path");
let IPLpath=path.join(__dirname,"ipl");
dircreator(IPLpath);
let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";

request(url, callback);

function callback(error,request ,html){
    if(error){
        console.log("Error",error);
    }
    else{
        extractlink(html);
    }
}

function extractlink(html){
    let $=cheerio.load(html);
    // console.log($);
    let anchoeEle=$("a[class='ds-inline-flex ds-items-start ds-leading-none']");
    let elem=$(anchoeEle[0]);
    let link=elem.attr("href");
    // console.log(link);
    
    let mainlink="https://www.espncricinfo.com"+link;
    // console.log(mainlink);
    getAllMatches(mainlink);
}

function getAllMatches(url){
    request(url, callback);
    function callback(error,request ,url){
        if(error){
            console.log("Error",error);
        }
        else{
            extractlinkOfAllMatches(url);
        }
    }
}

function extractlinkOfAllMatches(html){
    let $=cheerio.load(html);
    let scorecards=$("div.ds-grow.ds-px-4.ds-border-r.ds-border-line-default-translucent>a");
    for(let i=0;i<scorecards.length;i++){
        let link=$(scorecards[i]).attr("href");
        // let link=link_addr.attr("href");
        let mainlink="https://www.espncricinfo.com"+link;
        score.data(mainlink);
        // console.log(mainlink);
    }
    // console.log(scorecards.length);
}

function dircreator(filepath){
    if(!fs.existsSync(filepath)){
        fs.mkdirSync(filepath);
    }
}
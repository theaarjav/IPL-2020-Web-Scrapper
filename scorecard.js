const request=require("request");
const cheerio=require("cheerio");
const path=require("path");
const fs=require("fs");
const xlsx=require("xlsx");
// let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595/royal-challengers-bangalore-vs-sunrisers-hyderabad-eliminator-1237178/full-scorecard";
function scorecardData(url){
request(url, cb);
}

function cb(error, response, html){
    if(error){
        console.log(error);
    }
    else{
        extractScorecard(html);
    }
}

function extractScorecard(html){
    let $=cheerio.load(html);
    let match_data=$("div.ds-text-tight-m.ds-font-regular.ds-text-ui-typo-mid");//div.ds-text-tight-m.ds-font-regular.ds-text-ui-typo-mid
    match_data=$(match_data).text();
    // console.log(match_data);
    let match_data_arr=match_data.split(",");
    let match_type=match_data_arr[0].trim();
    let venue=match_data_arr[1].trim();
    let Date=match_data_arr[2].trim()+", "+match_data_arr[3].trim();
    let result=$(".ds-text-tight-m.ds-font-regular.ds-truncate.ds-text-typo-title");//.ds-text-tight-m.ds-font-regular.ds-truncate.ds-text-typo-title
    let innings=$(".ds-bg-fill-content-prime.ds-rounded-lg");
    let team=[];
    for(let i=0;i<2;i++){
        let htmlstring=$(innings[i]).html();
        let $team1=cheerio.load(htmlstring);
        let teamName=$team1(".ds-flex.ds-items-center.ds-cursor-pointer.ds-px-4");
        teamName=$team1(teamName).text();
        teamName=teamName.split("INNINGS");
        team.push(teamName[0].trim());
    }
    
    // console.log(innings.length);
    // console.log(team[0],"vs",team[1],",",match_type,"was played at",venue,"on",Date,"&",result.text());
    // console.log("");
    for(let i=0;i<2;i++){
        let htmlstring=$(innings[i]).html();
        let $team1=cheerio.load(htmlstring);
        let teamName=$team1(".ds-flex.ds-items-center.ds-cursor-pointer.ds-px-4");
        teamName=$team1(teamName).text();
        teamName=teamName.split("INNINGS");
        team.push(teamName[0].trim());
        // console.log(team[i]);
        let allRows=$team1("tbody tr");
        // console.log(allRows.length);
        for(let j=0;j<allRows.length;j++){
            let allCols=$(allRows[j]).find("td");
            let isWorthy=$(allCols[0]).hasClass("ds-w-0");
            if(isWorthy){
                // console.log(allCols.text());
                let playerName=$(allCols[0]).text().trim();
                let takenBy=$(allCols[1]).text().trim();
                let RunsScored=$(allCols[2]).text().trim();
                let balls=$(allCols[3]).text().trim();
                let m=$(allCols[4]).text().trim();
                let fours=$(allCols[5]).text().trim();
                let sixes=$(allCols[6]).text().trim();
                let strikeRate=$(allCols[7]).text().trim();
                // console.log(playerName,takenBy,RunsScored+"("+balls+")",m,"4s:"+fours,"6s:"+sixes,"SR:"+strikeRate);
                let oppTeamcell="vs"+team[1-i];
                let teamName=team[i];
                playerData(teamName,playerName,RunsScored, balls,m,fours,sixes,strikeRate,oppTeamcell);
            }
        }
        // console.log("");
    }
}
function playerData(teamName,playerName,RunsScored, balls,m,fours,sixes,strikeRate,oppTeamcell){
    let teamPath=path.join(__dirname,"ipl",teamName);
    dircreator(teamPath);
    let fileName=path.join(teamPath,playerName+".xlsx");
    let data=readFunc(fileName,playerName);
    let toappend={
        teamName,
        playerName,
        RunsScored,
        balls,
        m,
        fours,
        sixes,
        strikeRate,
        oppTeamcell
    }
    data.push(toappend);
    writefunc(fileName,data,playerName);
}

function dircreator(filepath){
    if(!fs.existsSync(filepath)){
        fs.mkdirSync(filepath);
    }
}

function writefunc(filePath,data,filename){
    let newBook=xlsx.utils.book_new();
    let newSheet=xlsx.utils.json_to_sheet(data);
  //  let filename="sheet1.xlsx";
    xlsx.utils.book_append_sheet(newBook, newSheet, filename);
    // let filePath=path.join(__dirname,filename);
    xlsx.writeFile(newBook,filePath);

}

function readFunc(bookPath, fileName){
    if(!fs.existsSync(fileName)) return [];
    let book=xlsx.readFile(bookPath);
    let data=book.Sheets[fileName];
    let ret=xlsx.utils.sheet_add_json(data);
    return ret;
}

module.exports={
    data:scorecardData
}
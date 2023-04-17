// Import the functions you need from the SDKs you need
import { ref, child, get, onChildAdded, onValue, set } from "firebase/database";
import { Chart } from "chart.js/auto"
import { DataStructure } from "../dataStructure";
import { Percentile } from "./modules/percentile";
import { DataConverter } from "../decoder";
import { SwitchPage } from "./modules/switchPage";
import { AddTable } from "../addTable"
import Hammer from 'hammerjs';

const dataStructure = new DataStructure()
const db = dataStructure.getFireBase();

// Check if Firebase path exists in local storage
let firebasePath = localStorage.getItem('firebasePath');
if (firebasePath == "null") {
    let userInput = prompt('Please enter a firebase path:', '');
    dataStructure.setFirebasePath("Events/" + userInput + "/");
    localStorage.setItem('firebasePath', userInput);
} else {
    let userInput = prompt('Please enter a firebase path:', firebasePath);
    dataStructure.setFirebasePath("Events/" + userInput + "/");
    localStorage.setItem('firebasePath', userInput);
}

function internetOnline(){
    document.getElementById("wifiON").style.display = "block";
    document.getElementById("wifiOFF").style.display = "none";
}
function internetOffline(){
    document.getElementById("wifiOFF").style.display = "block";
    document.getElementById("wifiON").style.display = "none";
}
  
window.navigator.onLine ? internetOnline() : internetOffline();
  
window.addEventListener('online', internetOnline);
window.addEventListener('offline', internetOffline);

let rankHeadNames = dataStructure.createDataLabels("Rank", "Team", "Score",
"Mobility",
"Auto High Cube",
"Auto Mid Cube",
"Auto Low Cube",
"Auto High Cone",
"Auto Mid Cone",
"Auto Low Cone",
"Auto Fumbled",
"Auto Climb",
"High Cube",
"Mid Cube",
"Low Cube",
"High Cone",
"Mid Cone",
"Low Cone",
"Fumbled",
"Climb",
"Defense Time",
"Penalty Count",
"Oof Time");

//Navigation
let pageChange = new SwitchPage()
let allNavBtns = document.querySelectorAll(".nav-container");
allNavBtns.forEach((element, index) => {
  element.addEventListener("click", () => {
      pageChange.switchEvent(allNavBtns[index].getAttribute("name"))
  })
})

let viewPageHammer = new Hammer(document.getElementById("viewpage"));
// viewPageHammer.on('swipeleft', function(ev) {
//     pageChange.hidePanel()
//     pageChange.toggleState = false;
// });
// viewPageHammer.on('swiperight', function(ev) {
//     pageChange.showPanel()
//     pageChange.toggleState = true;
//     document.getElementById("nav-search").focus();
// });
const isTouchDevice = "ontouchstart" in window;
if (isTouchDevice) {
    viewPageHammer.on('doubletap', function(ev) {
        if (pageChange.toggleState) {
            pageChange.hidePanel()
            pageChange.toggleState = false;
        } else {
            pageChange.showPanel()
            pageChange.toggleState = true;
            document.getElementById("nav-search").focus();
        }
    });
}

document.addEventListener("keydown", function(e) {
  if (e.key == "Tab") {
      e.preventDefault()
      if (pageChange.toggleState) {
          pageChange.hidePanel()
          pageChange.toggleState = false;
      } else {
          pageChange.showPanel()
          pageChange.toggleState = true;
          document.getElementById("nav-search").focus();
      }
  }
  if (e.key == "Enter") {
    let searchVal = document.getElementById("nav-search").value;
    if (pageChange.toggleState && searchVal != "") { //if the box is displayed and not empty
        switch (searchVal[0].toLowerCase()) { //check first letter
            case "h": //home page: the number following is the match number
                let matchNum = searchVal.substring(1); //get the rest of the command
                if (/^\d+$/.test(matchNum)) { //if the rest is a number, scroll to that number
                    pageChange.switchEvent("home")
                    let table = document.getElementById("homeTable-body");
                    let rows = table.getElementsByTagName("tr");
                    for (let i = 0; i < rows.length; i++) {
                        let cells = rows[i].getElementsByTagName("td");
                        let cellVal = cells[0].querySelector("div").querySelector("p").innerHTML
                        if (cellVal[0] === '0') {cellVal = cellVal.slice(1);}
                        if (cells.length > 0 && cellVal === matchNum.toString()) {
                            cells[0].scrollIntoView(true);
                            break;
                        }
                    }
                } else {
                    alert("Invalid home command");
                }
                break;
            case "r": //ranking
                let teamNum = searchVal.substring(1); //get the rest of the command
                if (/^\d+$/.test(teamNum)) { //if the rest is a number, scroll to that number
                    pageChange.switchEvent("ranking")
                    let table = document.getElementById("rankTableBody");
                    let rows = table.getElementsByTagName("tr");
                    for (let i = 0; i < rows.length; i++) {
                        let cells = rows[i].getElementsByTagName("td");
                        let cellVal = cells[1].querySelector("div").querySelector("p").innerHTML
                        if (cellVal[0] === '0') {cellVal = cellVal.slice(1);} //cutoff leading zeros from home table
                        if (cells.length > 0 && cellVal === teamNum.toString()) {
                            let header = document.getElementById("rankTableHeader");
                            cells[0].scrollIntoView(true);
                            break;
                        }
                    }
                } else {
                    alert("Invalid ranking command");
                }                
                break;
            case "c": //compare
                let teamList = searchVal.substring(1); //get the rest of the command
                if (/^[0-9\s]+$/.test(teamList)) { //if the rest is numbers and spaces
                    pageChange.switchEvent("compare")
                    let teamArray = teamList.split(" ");

                    compare();
                } else {
                    alert("Invalid ranking command");
                } 
                break;
            case "p": //predict
                let predictTeamList = searchVal.substring(1); //get the rest of the command
                if (/^[0-9\s]+$/.test(teamList)) { //if the rest is numbers and spaces
                    pageChange.switchEvent("predict");
                    let teamArray = teamList.split(" ");
                } else {
                    alert("Invalid predict command");
                } 
                break;
            default:
                if (/^\d+$/.test(searchVal)) { //search
                    pageChange.switchEvent("search")
                    search(document.getElementById("nav-search").value);
                    document.getElementById("searchbar").value = searchVal;
                } else {
                    alert("Invalid command");
                }
            break;
        }
        document.getElementById("nav-search").value = "";

    } else if (pageChange.currentState == "search") {
          e.preventDefault();
          search()
      } else if (pageChange.currentState == "predict") {
          e.preventDefault();
          predict();
      } else if (pageChange.currentState == "compare") {
          e.preventDefault();
          compare();
      }
    }
})

//DEFAULT PAGE
pageChange.switchEvent("home")

//=============== HOME ===============
var matchData = []
var homeHeadNames = dataStructure.createDataLabels("Match", "Team", "Position", "Scout",
  "Mobility", "Auto High Cube", "Auto Mid Cube", "Auto Low Cube", "Auto High Cone", "Auto Mid Cone", "Auto Low Cone", "Auto Fumbled", "Auto Climb",
  "High Cube", "Mid Cube", "Low Cube", "High Cone", "Mid Cone", "Low Cone", "Fumbled", "Climb", "Park",
  "Defense Time", "Penalty Count", "Oof Time");

var homeQataHeadNames = dataStructure.createDataLabels("Match", "Team", "Position", "Scout", "Climb QATA", "Intake QATA", "QATA");

//general table generation
let homeTable = new AddTable();
homeTable.addHeader(homeHeadNames);
let homeTableBody = homeTable.getTableBody();
document.getElementById("table-container").appendChild(homeTable.getTable());
homeTable.setID("homeTable");
homeTable.setBodyID("homeTable-body");

let homeQataTable = new AddTable();
homeQataTable.addHeader(homeQataHeadNames);
let homeQataTableBody = homeQataTable.getTableBody();
document.getElementById("table-qata-container").appendChild(homeQataTable.getTable());

let setPath = dataStructure.getPath("Final" + "/" + "Matches");
onValue(ref(db, setPath), (snapshot) => {
    if(snapshot.val()==null){
        return;
    }
    homeTableBody.innerHTML = "";
    homeQataTableBody.innerHTML = "";
  //call the consolidate function here, and add the consolidated data instead
  let all = snapshot.val();
  let matches = Object.keys(all);
  for(let i=0;i<matches.length;i++){
    let data = all[matches[i]];
    let row = document.createElement("tr")

    homeTable.addCells(homeHeadNames, data, row);

    let color = data["Position"][0];
    row.style.backgroundColor = "var(--" + color + ")"
    row.style.color = "var(--text-color)"
    homeTableBody.appendChild(row)

     row = document.createElement("tr")
    
    homeQataTable.addCells(homeQataHeadNames, data, row)

    color = data["Position"][0];
    row.style.backgroundColor = "var(--" + color + ")"
    row.style.color = "var(--text-color)"
    homeQataTableBody.appendChild(row)
  }
}
)

document.addEventListener('keydown', function(event) {
    if (event.code === "Space" && !pageChange.toggleState) {
        event.preventDefault();
        if (document.getElementById("table-container").style.display == "none") {
            document.getElementById("table-container").style.display = "block";
            document.getElementById("table-qata-container").style.display = "none";
        } else {
            document.getElementById("table-container").style.display = "none";
            document.getElementById("table-qata-container").style.display = "block";
        }
    }
  });

//=============== SEARCH ===============
let robotData = {}
let pitData = []
let image = []
onValue(ref(db, dataStructure.getPath("Final" + "/" + "Robots")), (snapshot) => {
    if(snapshot.val() == null){
        return
    }
  robotData = {}
  let robots = snapshot.val()
  let allRobots = Object.keys(robots)
  for(let i=0;i<allRobots.length; i++){
    get(ref(db, dataStructure.getPath("Final" +"/" + "Robots" + "/" + allRobots[i]))).then((data) => {
        let fbRobotData = data.val()
        let matchKeys = Object.keys(fbRobotData)
        let sortedRobotData = {};
        let tempRobotData = {};
        for (let j = 0; j < matchKeys.length; j++) {
            let newKey = matchKeys[j]
            if (matchKeys[j][0] == "0") {
                newKey = matchKeys[j].replace("0", "")
                tempRobotData[newKey] = fbRobotData[matchKeys[j]]
            } else {
                tempRobotData[matchKeys[j]] = fbRobotData[matchKeys[j]]
            }
        }
        //sortedRobotData[allRobots[i]] = tempRobotData;
        robotData[allRobots[i]] = tempRobotData;

        //robotData.push(sortedRobotData)
        if (i == allRobots.length-1) {
            //console.log("ROBOT STATS, RANKINGS, SUMMARY UPDATING")
            generateRobotStats(robotData);
            displayRankings(robotData, rankHeadNames)
            displaySummary(robotData);    
        }
    })
  }
  
})
//CHANGE
onValue(ref(db, dataStructure.getPath("Final" + "/" + "Pitscout")), (snapshot) => {
    if(snapshot.val() == null){
        return
    }
    pitData = []
      let pit = snapshot.val()
    let allPits = Object.keys(pit)
    for(let i=0;i<allPits.length; i++){
      get(ref(db, dataStructure.getPath("Final" +"/" + "Pitscout" + "/" + allPits[i]))).then((data) => {
          pitData.push(data.val())
      })
    }
  })
//CHANGE
onValue(ref(db, dataStructure.getPath("Final" + "/" + "Image")), (snapshot) => {
    if(snapshot.val() == null){
        return
    }
    image = []
      let imaged = snapshot.val()
    let allImages = Object.keys(imaged)
    for(let i=0;i<allImages.length; i++){
      get(ref(db, dataStructure.getPath("Final" +"/" + "Image" + "/" + allImages[i]))).then((data) => {
          image.push(data.val())
      })
    }
  })


  function search(team) {
    let resetArr = ["imgContainer", "pitsData", "dataContainer", "qataContainer", "miscData", "chart-container"];
    resetArr.forEach((elem) => {
        document.getElementById(elem).innerHTML = ''
    })
    //if no team arg is passed, then search() will use the value in the search bar
    if (!team) {
        team = document.getElementById("searchbar").value;
        document.getElementById("searchbar").innerHTML = team;
    }
    //if the search bar is still in the default position, then move it
    if (document.getElementById("barContainer").classList.contains("default")) {
        document.getElementById("barContainer").classList.remove("default")
        document.getElementById("barContainer").classList.add("active")
    }
    //Checks if robot exists in database
    let teams = [];
    let teamData = [];
    let teamPitData = [];
    let arrayRobotData = [];
    let availRobots = Object.keys(robotData)
    for(let i=0; i< availRobots.length; i++){
      arrayRobotData.push(robotData[availRobots[i]])
    }
    for (let i = 0; i < availRobots.length; i++) {
        teams.push(Object.values(arrayRobotData[i])[0]["Team"])
    }
    for (let i = 0; i < pitData.length; i++) {
        let dates = Object.keys(pitData[i])
        teams.push(JSON.stringify(pitData[i][dates[0]]["Team"]))
    }
    if (!teams.includes(team)) {
        alert("Team does not exist in database")
        return;
    } else {
        //team found in database, compiling team data into teamData array for easier access for charts etc. 
        for (let i = 0; i < arrayRobotData.length; i++) {
            if (team == Object.values(arrayRobotData[i])[0]["Team"]) {
                teamData = Object.values(arrayRobotData[i])
            }
        }
        for (let i = 0; i < pitData.length; i++) {
            if (team == Object.values(pitData[i])[0]["Team"]) {
                teamPitData = Object.values(pitData[i])
            }
        }
    }
    // Image generation here wallim do it
    //console.log(image)
    for (let i = 0; i < Object.values(image).length; i++) {
        //console.log(Object.values(image[i])[0]["Team"])
        if (team == Object.values(image[i])[0]["Team"]) {
            document.getElementById("imgContainer").innerHTML = "";
            let img = document.createElement("img");
            img.setAttribute("src", Object.values(image[i])[Object.values(image[i]).length - 1]["Image of Robot"]);
            img.setAttribute("id", "robotImage")
            document.getElementById("imgContainer").appendChild(img)
        }
    }
    //IF ONLY PITSCOUTING DATA EXISTS, then doesnt bother generating table/chart, and spits out err in HTML
    //console.log(teamData)

    let dates;
    let pitIndex;
    //Misc data: Drivetrain, turret
    for (let i = 0; i < pitData.length; i++) {
        dates = Object.keys(pitData[i])
        if (pitData[i][dates[0]]["Team"] == team) {
            pitIndex = i;
            break;
        }
    }
    var miscData = new AddTable();
    let miscLabels = ["Drivetrain", "Intake"];
    miscData.addHeader(miscLabels);
    var row = document.createElement("tr");
    var name = miscData.getTableBody();
    name.appendChild(row);
    let twoPitDatas = {};
    let drivetrain = "None";
    let manipulator = "None";
    try {
        for (let i = 0; i < dates.length; i++) {
            if (pitData[pitIndex][dates[i]]["Drivetrain"] != "None") {
                drivetrain = pitData[pitIndex][dates[i]]["Drivetrain"];
            }
        }
        for (let i = 0; i < dates.length; i++) {
            if (pitData[pitIndex][dates[i]]["Intake"] != "None") {
                manipulator = pitData[pitIndex][dates[i]]["Intake"];
            }
        }
    } catch {
  
    }
    twoPitDatas["Drivetrain"] = drivetrain;
    twoPitDatas["Intake"] = manipulator;
  
    miscData.addCells(miscLabels, twoPitDatas, row);
    document.getElementById("pitsData").innerHTML = "";
    document.getElementById("pitsData").appendChild(miscData.table);

    
    if (!teamData[0]) {
        let err_arr = ["dataContainer", "qataContainer", "chart-container"]
        err_arr.forEach((elem) => {
            let err = document.createElement("div")
            err.setAttribute("class", "match_err");
            err.innerHTML = "Match data not found"
            document.getElementById(elem).appendChild(err);
        })
        return;
    }
  
    //General data: Purely quantitative data, no descriptions or words, only numbers and bools
    let generalSearchData = new AddTable()
    let generalLabels = ["Match", "Position", "Mobility", "Auto High Cube", "Auto Mid Cube", "Auto Low Cube", "Auto High Cone", "Auto Mid Cone", "Auto Low Cone", "Auto Fumbled", "Auto Climb", "High Cube", "Mid Cube", "Low Cube", "High Cone", "Mid Cone", "Low Cone", "Fumbled"]
    generalSearchData.addHeader(generalLabels);
    //gettin each match
    var row = document.createElement("tr");
  
    for (let i = 0; i < teamData.length; i++) {
        //appending each match to a row
        var row = document.createElement("tr")
        generalSearchData.getTableBody().appendChild(generalSearchData.addCells(generalLabels, teamData[i], row))
        let color = teamData[i]["Position"][0];
        row.style.backgroundColor = "var(--" + color + ")"
        row.style.color = "var(--text-color)"
    }
  
    document.getElementById("dataContainer").appendChild(generalSearchData.table);
  
    //Qualatative data (Qata): Only descriptions/words nvm
    var qataSearchData = new AddTable()
    let qataLabels = ["Match", "Position", "Scout", "Climb", "Park", "Defense Time", "Penalty Count", "Oof Time", "Climb QATA", "Intake QATA", "QATA"]
    qataSearchData.addHeader(qataLabels);
    //gettin each match
    for (let i = 0; i < teamData.length; i++) {
        //appending each match to a row
        var row = document.createElement("tr");
        var name = qataSearchData.getTableBody();
        name.appendChild(row);
        qataSearchData.addCells(qataLabels, teamData[i], row);
        let color = teamData[i]["Position"][0];
        row.style.backgroundColor = "var(--" + color + ")"
        row.style.color = "var(--text-color)"
    }
  
    document.getElementById("qataContainer").appendChild(qataSearchData.table);
  
  
    //chart/graph: Radar graph of most important data
    //resetting canvas
    try{
        document.getElementById("chartContainer").remove()
    }catch{

    }
    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", "chartContainer");
    document.getElementById("chart-container").appendChild(canvas);
    //percentile work
    let percentile = new Percentile(arrayRobotData);
    percentile.convertRawToObject().processObjectData().sortPercentile()
    //td = team data
    let td = percentile.findAverageOfTeam(team)
    //d = data, which gets put into the chart
    let spiderStats = dataStructure.getSpiderChartLabels();
    let d = []; 
    for (let i = 0; i < 6; i++) {
        let currentStat = spiderStats[i];
        let percentileValueCalculated = percentile.findPercentileOf(td[percentile.percentileObject[0].indexOf(currentStat)], currentStat);
        let percentileValue = percentileValueCalculated == undefined || percentileValueCalculated >= 1.0 ? 1.0 : percentileValueCalculated;
        d.push(percentileValue);
    }
    //console.log(percentile.percentileObjectSorted);
  
    //chart setup
    const data = {
        labels: [
            'Auto pts',
            'T_Cubes',
            'T_Cones',
            'T_Acc',
            'End',
            'Def'
        ],
        datasets: [{
            label: ("Team " + team + " Percentiles"),
            data: d,
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 99, 132)'
        }]
    };
    //making the chart
    new Chart(
        document.getElementById("chartContainer"), {
            type: "radar",
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                    line: {
                        borderWidth: 3
                    }
                },
                scales: {
                    r: {
                        grid: {
                            color: "rgb(#ffffff)"
                        },
                        angleLines: {
                            color: "rgb(#ffffff)"
                        },
                        ticks: {
                            color: "rgb(#617b94)",
                            backdropColor: "rgba(0, 0, 0, 0)"
                        },
                        max: 1,
                        min: 0
                    }
  
                }
  
            }
        }
    )
  
  }
//=============== COMPARE ===============
var robotsDataCompared = [];
var robotsQataCompared = [];
var robotAdded = [];

function comptext(team) {
  if (!team) {
      team = document.getElementById("c-searchbar").value;
      document.getElementById("c-searchbar").innerHTML = team;
  }
  if (document.getElementById("c-barContainer").classList.contains("default")) {
      document.getElementById("c-barContainer").classList.remove("default")
      document.getElementById("c-barContainer").classList.add("active")
  }
  let teams = [];
  let teamData = [];
  let arrayRobotData = [];
    let availRobots = Object.keys(robotData)
    for(let i=0; i< availRobots.length; i++){
      arrayRobotData.push(robotData[availRobots[i]])
    }
  for (let i = 0; i < arrayRobotData.length; i++) {
      teams.push(Object.values(arrayRobotData[i])[0]["Team"])
  }
  if (!teams.includes(team)) {
      alert("Team does not exist in databse")
      return;
  } else if (robotAdded.includes(team)) {

  } else {
      compchart(document.getElementById("c-searchbar").value);
      for (let i = 0; i < arrayRobotData.length; i++) {
          if (team == Object.values(arrayRobotData[i])[0]["Team"]) {
              teamData = Object.values(arrayRobotData[i])
          }
      }
  }
  teams = undefined;

  //generates table for data and qata
  var gencomparedata = new AddTable()
  let genlabels = ["Match", "Position", "Mobility", "Auto High Cube", "Auto Mid Cube", "Auto Low Cube", "Auto High Cone", "Auto Mid Cone", "Auto Low Cone", "Auto Fumbled", "Auto Climb", "High Cube", "Mid Cube", "Low Cube", "High Cone", "Mid Cone", "Low Cone", "Fumbled"]
  gencomparedata.addHeader(genlabels);

  for (let i = 0; i < teamData.length; i++) {
      var row = document.createElement("tr");
      var name = gencomparedata.getTableBody();
      name.appendChild(row);
      gencomparedata.addCells(genlabels, teamData[i], row);
      let color = teamData[i]["Position"][0];
      row.style.backgroundColor = "var(--" + color + ")"
      row.style.color = "var(--text-color)"
  }
  var dataDiv = document.createElement("div")
  dataDiv.appendChild(gencomparedata.table)

  var qatacomparedata = new AddTable();
  let qatalabels = ["Match", "Position", "Scout", "Climb", "Park", "Defense Time", "Penalty Count", "Oof Time", "Climb QATA", "Intake QATA", "QATA"];
  qatacomparedata.addHeader(qatalabels);

  for (let i = 0; i < teamData.length; i++) {
      var row = document.createElement("tr");
      var name = qatacomparedata.getTableBody();
      name.appendChild(row);
      qatacomparedata.addCells(qatalabels, teamData[i], row);
      let color = teamData[i]["Position"][0];
      row.style.backgroundColor = "var(--" + color + ")"
      row.style.color = "var(--text-color)"
  }

  var qataDiv = document.createElement("div")
  qataDiv.appendChild(qatacomparedata.table)
  if (robotAdded.indexOf(team) == -1) {
      robotAdded.unshift(team)
      robotsDataCompared.unshift(dataDiv)
      robotsQataCompared.unshift(qataDiv)
  }
  displayRobot()
}

function addData(chart, data) {
  chart.data = data;
  chart.update();
}

//generates radar chart
var chart = new Chart(document.getElementById("c-chartContainer"),{
    type: "radar",
    options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            line: {
                borderWidth: 3
            }
        },
        scales: {
            r: {
                grid: {
                    color: "rgb(#ffffff)"
                },
                angleLines: {
                    color: "rgb(#ffffff)"
                },
                ticks: {
                    color: "rgb(#617b94)",
                    backdropColor: "rgba(0, 0, 0, 0)"
                },
                max: 1,
                min: 0
            }
        }
    }
})
let datasets = [];
//chart function -- generates radar chart
function compchart(team) {
  if (!team) {
      team = document.getElementById("c-searchbar").value;
      document.getElementById("c-searchbar").innerHTML = team;
  }
  let arrayRobotData = [];
  let availRobots = Object.keys(robotData)
  for(let i=0; i< availRobots.length; i++){
    arrayRobotData.push(robotData[availRobots[i]])
  }
  let percentile = new Percentile(arrayRobotData);
    percentile.convertRawToObject().processObjectData().sortPercentile()
  //td = team data
  let td = percentile.findAverageOfTeam(team);
  let spiderStats = dataStructure.getSpiderChartLabels();
  let d = []; 
  for (let i = 0; i < 6; i++) {
      let currentStat = spiderStats[i];
      let percentileValueCalculated = percentile.findPercentileOf(td[percentile.percentileObject[0].indexOf(currentStat)], currentStat);
      let percentileValue = percentileValueCalculated == undefined || percentileValueCalculated >= 1.0 ? 1.0 : percentileValueCalculated;
      d.push(percentileValue);
  }
  let x = Math.floor(Math.random() * 256);
  let y = Math.floor(Math.random() * 256);
  let z = Math.floor(Math.random() * 256);
  let newChart = {
      type: "radar",
      label: ("Team " + team + " Percentiles"),
      data: d,
      fill: true,
      backgroundColor: `rgba(${x}, ${y}, ${z}, 0.2)`,
      borderColor: `rgb(${x}, ${y}, ${z})`,
      pointBackgroundColor: `rgb(${x}, ${y}, ${z})`,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: `rgb(${x}, ${y}, ${z})`
  };
  datasets.unshift(newChart);

  const data = {
      labels: [
        'Auto pts',
        'T_Cubes',
        'T_Cones',
        'T_Acc',
        'End',
        'Def'
      ],
      datasets: datasets,
      options: {
          scale: {
              ticks: {
                  backdropColor: 'black' // should render black behind the text
              }
          }
      }
  };
  addData(chart, data);
}
//REAL COMPARE FUNCTION WOOOOOO
var slideIndex = 0;

function compare() {
  comptext(document.getElementById("c-searchbar").value);
  //do stuff for chart
  document.getElementById("robotsCompared").style.display = "grid"
  document.getElementById("compareRobots").style.display = "grid"
  document.getElementById("robotCurrData").style.display = "grid"
  document.getElementById("compareCurrRobot").style.display = "grid"
  document.getElementById("compareLeftSlide").style.display = "grid"
  document.getElementById("compareRightSlide").style.display = "grid"
  document.getElementById("compareRemoveRobot").style.display = "grid"
}

function displayRobot() {
  document.getElementById("c-dataContainer").innerHTML = "";
  document.getElementById("c-qataContainer").innerHTML = "";
  document.getElementById("compareRobots").innerHTML = "";
  document.getElementById("compareCurrRobot").innerHTML = "";
  try {
      document.getElementById("c-dataContainer").innerHTML = robotsDataCompared[slideIndex].innerHTML;
      document.getElementById("c-qataContainer").innerHTML = robotsQataCompared[slideIndex].innerHTML;
      document.getElementById("compareRobots").innerHTML = robotAdded;
      document.getElementById("compareCurrRobot").innerHTML = robotAdded[slideIndex];
      const data = {
          labels: [
            'Auto pts',
            'T_Cubes',
            'T_Cones',
            'T_Acc',
            'End',
            'Def'
          ],
          datasets: datasets
      };
      addData(chart, data);
  } catch {
      alert("no robots to compare")
  }

}

function changeSlideLeft() {
  slideIndex--;
  if (slideIndex == -1) {
      slideIndex = robotsDataCompared.length - 1;
  }
  //console.log(slideIndex)
  displayRobot()
}

function changeSlideRight() {
  slideIndex++;
  if (slideIndex == robotsDataCompared.length) {
      slideIndex = 0
  }
  //console.log(slideIndex)
  displayRobot()
}

function removeRobotFromCompare() {
  robotsDataCompared.splice(slideIndex, 1);
  robotsQataCompared.splice(slideIndex, 1);
  robotAdded.splice(slideIndex, 1);
  datasets.splice(slideIndex, 1)
  slideIndex = 0;
  displayRobot()
}
document.getElementById("compareLeftSlide").addEventListener("click", () => {
  changeSlideLeft()
});
document.getElementById("compareRightSlide").addEventListener("click", () => {
  changeSlideRight()
});
document.getElementById("compareRemoveRobot").addEventListener("click", () => {
  removeRobotFromCompare()
});


//=============== RANKING ===============

function sortTable(n) {
  let table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  let header = document.getElementById("rankTableHeader");
  let cells = header.getElementsByTagName("th");
  for (let i = 0; i < cells.length; i++) {
      cells[i].style.color = "var(--text-color)";
  }

  table = document.getElementById("rankTable");
  switching = true;
  dir = "asc"; // Set the sorting direction to ascending:
  // Make a loop that will continue until no switching has been done:
  while (switching) {
      switching = false;
      rows = table.rows;
      // Loop through all table rows (except the first, which contains table headers):
      for (i = 1; i < (rows.length - 1); i++) {
          shouldSwitch = false; // Start by saying there should be no switching:
          // Get the two elements you want to compare, one from current row and one from the next:
          let statName = header.getElementsByTagName("th")[n].innerHTML;
          let robotNum = rows[i].getElementsByTagName("td")[1].querySelector("div").querySelector("p").innerHTML
          let robotNumLower = rows[i + 1].getElementsByTagName("td")[1].querySelector("div").querySelector("p").innerHTML

          if (statName == "Score" || statName == "Rank") {
            x = rows[i].getElementsByTagName("td")[n].querySelector("div").querySelector("p").innerHTML;
            y = rows[i + 1].getElementsByTagName("td")[n].querySelector("div").querySelector("p").innerHTML;
          } else {
            x = robotStats[robotNum][statName].average;
            y = robotStats[robotNumLower][statName].average;
          }
          // Check if the two rows should switch place, based on the direction, asc or desc:
          if (dir == "asc") {
              if (Number(x) < Number(y)) {
                  shouldSwitch = true;
                  cells[n].style.color = "var(--g)";
                  break;
              }
          } else if (dir == "desc") {
              if (Number(x) > Number(y)) {
                  shouldSwitch = true;
                  cells[n].style.color = "var(--r-alt)";
                  break;
              }
          }
      }
      if (shouldSwitch) {
          // If a switch has been marked, make the switch and mark that a switch has been done:
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
          switchcount++;
      } else {
          // If no switching has been done AND the direction is "asc", set the direction to "desc" and run the while loop again.
          if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
          }
      }
  }
}

let robotStats;
setPath = dataStructure.getPath("Final" + "/" + "Robots")
function generateRobotStats(data) {
    let robots = data;
    robotStats = {};

    let robotKeys = Object.keys(robots);
    for (let i = 0; i < robotKeys.length; i++) {
        let robotNumber = robotKeys[i];
        let tempRobotData = robots[robotKeys[i]];
        let tempRobotDataKeys = Object.keys(tempRobotData);
        for (let j = 0; j < tempRobotDataKeys.length; j++) {
            let match = tempRobotData[tempRobotDataKeys[j]];
            let matchNumber = tempRobotDataKeys[j];
            if (!robotStats[robotNumber]) {
                robotStats[robotNumber] = {};
            }
            let matchKeys = Object.keys(match);
            for (let k = 0; k < matchKeys.length; k++) {
                let statName = matchKeys[k];
                if (!robotStats[robotNumber][statName]) {
                    robotStats[robotNumber][statName] = {
                        values: [],
                        matches: [],
                        standardDeviation: 0,
                        average: 0,
                        percentile: 1,
                        averagePts: 0,
                        standardDeviationPts: 0,
                        percentMax: 0
                    };
                }
                robotStats[robotNumber][statName].values.push(parseInt(match[statName]));
                robotStats[robotNumber][statName].matches.push(parseInt(matchNumber));
            }
        }
    }
  
    Object.keys(robotStats).forEach(robotNumber => { //find standard deviation, average
        let robotStat = robotStats[robotNumber];
        Object.keys(robotStat).forEach(statName => {
            let multiplier = dataStructure.searchPointValue(statName);
            let stat = robotStat[statName];
            let mean = stat.values.reduce((a, b) => a + b) / stat.values.length;
            let variance = stat.values.reduce((a, b) => a + (b - mean) ** 2, 0) / stat.values.length;
            stat.standardDeviation = Math.sqrt(variance);
            stat.average = mean;
            stat.standardDeviationPts = Math.sqrt(variance) * multiplier;
            stat.averagePts = mean * multiplier;
        });
    });
    let stats = dataStructure.getFilterLabels();
   //let stats = Object.keys(robotStats[0]);
   for (let i = 0; i < stats.length; i++) { //calculate percentile
    let statName = stats[i];
    let statArray = [];
    Object.keys(robotStats).forEach(robotNumber => {
        let robotStat = robotStats[robotNumber];
        let stat = robotStat[stats[i]];
        statArray.push(stat.average);
    });
    statArray.sort((a, b) => a - b);
    let maxStat = statArray[statArray.length-1];
    Object.keys(robotStats).forEach(robotNumber => { 
        let robotStat = robotStats[robotNumber];
        let stat = robotStat[statName];
        for (let i = 0; i < statArray.length; i++) {
            if (stat.average <= statArray[i]) {
                stat.percentile = (i / statArray.length);
                stat.percentMax = stat.average/maxStat;
                break;
            }
        }
    });
   }
    //console.log(robotStats)
}

let lineChart, histogram;

function displayRankings(data, rankHeadNames) {
    document.getElementById("rank-container").innerHTML = "";
    //general table generation
    let rankTable = new AddTable();
    let rankTableBody = rankTable.getTableBody();
    rankTable.setID("rankTable");
    rankTable.setHeaderID("rankTableHeader");
    rankTable.setBodyID("rankTableBody")
    rankTable.addHeader(rankHeadNames);
    document.getElementById("rank-container").appendChild(rankTable.getTable());
  
    var robotNames = Object.keys(data)
    rankHeadNames = dataStructure.createDataLabels("Rank", "Team", "Score","Mobility","Auto High Cube","Auto Mid Cube","Auto Low Cube","Auto High Cone","Auto Mid Cone","Auto Low Cone","Auto Fumbled","Auto Climb","High Cube","Mid Cube","Low Cube","High Cone","Mid Cone","Low Cone","Fumbled","Climb","Defense Time","Penalty Count","Oof Time");
  var dataLabelsToCalc = rankHeadNames.splice(3);
  //for loop over each robot
  for (var i = 0; i < robotNames.length; i++) {
      var robot = data[robotNames[i]];
      dataStructure.calcRobotPtAvgs(dataLabelsToCalc, robot);
  }
  //sorts all the avgs
  var robotRankByPt = dataStructure.calcRobotRanking();
  var storedRobotsTotalPtAvg = dataStructure.getStoredRobotsTotalPtAvg();
  var storedRobotsAvgPtVals = dataStructure.getStoredRobotsAvgPtVals();
  var allRobotPts = Object.keys(storedRobotsTotalPtAvg);
  var rank_counter = 1;
  //has to reset everytime, see above for reason why (firebase api)
  rankTableBody.innerHTML = ""
  //goes through all the avg, the by each avg, from greatest to least, checks all robots that have that avg then displays it in the table
  for (var i = robotRankByPt.length - 1; i >= 0; i--) {
      for (var f = 0; f < allRobotPts.length; f++) {
          if (storedRobotsTotalPtAvg[allRobotPts[f]] == robotRankByPt[i]) {

              var row = document.createElement("tr");
              rankTableBody.appendChild(row);
              rankTable.addCell(rank_counter, row);
              rankTable.addCell(allRobotPts[f], row);
              rankTable.addCell(storedRobotsTotalPtAvg[allRobotPts[f]], row);
              //adds avg data to the row, then is displayed on the table
              var robotAvgVals = storedRobotsAvgPtVals[allRobotPts[f]]
              rankTable.addCells(dataLabelsToCalc, robotAvgVals, row);
          }
      }
      rank_counter += 1
  }

  let header = document.getElementById("rankTable").querySelector("thead");
  let table = document.getElementById("rankTable").querySelector("tbody");
  var colCount = table.rows[0].cells.length;
  let maxRank = table.rows[0].cells[2].querySelector("div").querySelector("p").innerHTML;
  let minRank = table.rows[table.rows.length - 1].cells[2].querySelector("div").querySelector("p").innerHTML;
  let currentCell = null;

  let modal = document.getElementById("rankingModal");
  let span = document.getElementsByClassName("close")[0];
  span.onclick = function() {
      modal.style.display = "none";
  }
  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }
  document.addEventListener('keydown', function(event) {
    if (event.keyCode === 27) {
        modal.style.display = "none";
    }
  });
  //assigning ids and listeners to rows for sorting
  for (let i = 0; i < colCount; i++) {
      var cell = header.rows[0].cells[i];
      cell.setAttribute("id", "ranking_" + i)
      cell.addEventListener("click", () => {
          sortTable(i)
      });
  }
  //ranking column color gradient
  for (var j = 0; j < table.rows.length; j++) {
      i = 2; //index of ranking
      var cell = table.rows[j].cells[i];
      var value = cell.querySelector("div").querySelector("p").innerHTML;
      let p = (value - minRank) / (maxRank - minRank);
      cell.style.backgroundColor = "rgba(199, 151, 18, " + p + ")";
  }
  //percentile based gradient for the rest of the table
  for (let col = 3; col < colCount; col++) {
      let label = document.getElementById("rankTable").querySelector("thead").rows[0].cells[col].innerHTML;
      for (let row = 0; row < table.rows.length; row++) {
        let robotNum = document.getElementById("rankTable").querySelector("tbody").rows[row].cells[1].querySelector("div").querySelector("p").innerHTML;
          let cell = table.rows[row].cells[col];
          cell.addEventListener("click", function() {
              if (currentCell == this) {
                  modal.style.display = "none";
                  currentCell = null;
              } else {
                  // If a different cell is clicked, update the div and show it
                  currentCell = this;
                  modal.style.display = "block";
                  let cellValue = currentCell.querySelector("div").querySelector("p").innerHTML;
                  let modalHeader = document.getElementById("modal-header-content");
                  //let modalBody = document.getElementById("modal-body-content");
                  let curRow = currentCell.parentNode.rowIndex - 1;
                  let curCol = currentCell.cellIndex;

                  let robotNum = table.rows[curRow].cells[1].querySelector("div").querySelector("p").innerHTML;
                  let statName = header.rows[0].cells[curCol].innerHTML;
                  //let p = percentile.findPercentileOf(cellValue, label);
                  let p = robotStats[robotNum][statName].percentile;

                  //if (p == null) {p = 1;}
                  let numSummary = find5NumSummary(robotStats[robotNum][statName].values);
                  //console.log(robotStats[robotNum][statName])

                  let xData = robotStats[robotNum][statName].matches;
                  let yData = robotStats[robotNum][statName].values;

                  modalHeader.innerHTML = "Team " + robotNum + " - " + statName;
                  let rankTableData = {
                      AVG: (robotStats[robotNum][statName].values.reduce((a, b) => a + b) / robotStats[robotNum][statName].values.length).toFixed(3),
                      STDV: robotStats[robotNum][statName].standardDeviation.toFixed(3),
                      PCT: (p * 100).toFixed(2) + "%",
                      MIN: numSummary[0],
                      Q1: numSummary[1],
                      MED: numSummary[2],
                      Q3: numSummary[3],
                      MAX: numSummary[4],
                      SLP: linearRegression(xData, yData).slope.toFixed(3),
                      RSQ: linearRegression(xData, yData).rSquared.toFixed(3)
                  };
                  // Create the table element
                  let rankTable = document.createElement("table");
                  rankTable.setAttribute("id", "infoTable")
                  // Iterate through the data object
                  for (const key in rankTableData) {
                      // Create a new row
                      const row = rankTable.insertRow();
                      // Create the first cell for the label
                      const labelCell = row.insertCell();
                      labelCell.innerHTML = key;
                      // Create the second cell for the data value
                      const valueCell = row.insertCell();
                      valueCell.innerHTML = rankTableData[key];
                  }
                  // Add the table to the HTML document
                  document.getElementById("modal-table").innerHTML = "";
                  document.getElementById("modal-table").appendChild(rankTable);

                let formattedData = xData.map(function(x, i) {
                    return { x: x, y: yData[i] };
                });
                // Get the canvas element
                let canvas = document.getElementById('modal-body-content-chart');   
                let ctx = canvas.getContext('2d');
                if (lineChart) {
                  lineChart.data.datasets[0].data = formattedData;
                  lineChart.data.datasets[0].label = "Team " + robotNum + " - " + statName;
                  lineChart.update();
                } else {
                  lineChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: "Team " + robotNum + " - " + statName,
                            data: formattedData,
                            pointRadius: 10,
                            backgroundColor: 'rgba(92, 184, 92, 0.2)',
                            borderColor: 'rgba(92, 184, 92, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom',
                                scaleLabel: {
                                  display: true,
                                  text: 'Value'
                                }
                            },
                            y: {
                                type: 'linear',
                                scaleLabel: {
                                  display: true,
                                  text: 'Value'
                                }
                            }
                        }
                    }
                  });
                }

                canvas = document.getElementById('modal-body-content-plot');
                ctx = canvas.getContext('2d');
                let { binnedData, binLabels } = createBins(yData, 5);
                if (histogram) {
                  histogram.data.datasets[0].label = "Team " + robotNum + " - " + statName + ": " + 'Frequency';
                  histogram.data.datasets[0].data = binnedData;
                  histogram.data.labels = binLabels;
                  histogram.update();
                } else {
                  histogram = new Chart(ctx, {
                    type: 'bar',
                    data: {
                      labels: binLabels,
                      datasets: [{
                        label: "Team " + robotNum + " - " + statName + ": " + 'Frequency',
                        data: binnedData,
                        backgroundColor: 'rgba(92, 184, 92, 0.2)',
                        borderColor: 'rgba(92, 184, 92, 1)',
                        borderWidth: 1
                      }]
                    },
                    options: {
                      barPercentage: 1,
                    }
                  });
                }
              }
          });
          var value = cell.querySelector("div").querySelector("p").innerHTML;
          let p = robotStats[robotNum][label].percentMax;
          if (col >= 3 && col <= 11) { //manual column colors - for finer control, add an array of colors for each column
              cell.style.backgroundColor = "rgba(34, 176, 227, " + p + ")";
          } else if (col >= 12 && col <= 19) {
              cell.style.backgroundColor = "rgba(0, 134, 49, " + p + ")";
          } else {
              cell.style.backgroundColor = "rgba(227, 57, 45, " + p + ")";
          }
      }
  }
}


function find5NumSummary(data) {
  let sortedData = data.slice().sort(function(a, b) {
      return a - b
  });;
  let min = sortedData[0];
  let Q1 = sortedData[Math.floor(sortedData.length / 4)];
  let median;
  if (sortedData.length % 2 === 0) {
      median = (sortedData[sortedData.length / 2 - 1] + sortedData[sortedData.length / 2]) / 2;
  } else {
      median = sortedData[Math.floor(sortedData.length / 2)];
  }
  let Q3 = sortedData[Math.floor(sortedData.length * 3 / 4)];
  let max = sortedData[sortedData.length - 1];
  return [min, Q1, median, Q3, max];
}
function linearRegression(x, y) {
  let xSum = x.reduce((a, b) => a + b);
  let ySum = y.reduce((a, b) => a + b);
  let xySum = 0;
  let xSquaredSum = 0;
  let ySquaredSum = 0;
  for (let i = 0; i < x.length; i++) {
      xySum += x[i] * y[i];
      xSquaredSum += x[i] * x[i];
      ySquaredSum += y[i] * y[i];
  }
  let slope = (x.length * xySum - xSum * ySum) / (x.length * xSquaredSum - xSum * xSum);
  let yIntercept = (ySum - slope * xSum) / x.length;
  let rSquared = Math.pow((xySum - (xSum * ySum) / x.length) / (Math.sqrt((xSquaredSum - Math.pow(xSum, 2) / x.length) * (ySquaredSum - Math.pow(ySum, 2) / x.length))), 2);
  return {
      slope: slope,
      yIntercept: yIntercept,
      rSquared: rSquared
  };
}
function createBins(data, numBins) {
    data.sort((a, b) => a - b);   // Sort the data array
    let min = data[0], max = data[data.length - 1];   // Get the minimum and maximum values in the data array
    let binSize = (max - min) / numBins;   // Calculate the bin size
    let binnedData = Array(numBins).fill(0);   // Initialize the binnedData array
    let binLabels = Array(numBins);   // Initialize the binLabels array
    for (let i = 0; i < numBins; i++) {   // Iterate through the data array
      let binStart = min + (i * binSize);
      let binEnd = binStart + binSize;
      binLabels[i] = `${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`;
    }
    for (let i = 0; i < data.length; i++) {
        let binNum = Math.floor((data[i] - min) / binSize);       // Calculate the bin number for the current data point
        if(binNum === numBins) binNum--;       // Increment the count in the corresponding bin
        binnedData[binNum]++;       // Create the bin label for the current bin, if it doesn't exist yet
    }
    return { binnedData, binLabels };   // Return the binnedData and binLabels arrays
  }

//=============== PREDICT ===============
// uses robotData object in Search 
let avgFilterLabelsAuto = dataStructure.getFilterLabelsAuto();
let avgFilterLabelsTele = dataStructure.getFilterLabelsTele();
let autoPtValues = dataStructure.getAutoPtValues();
let telePtValues = dataStructure.getTelePtValues();
let defPenPtValues = dataStructure.getDefPenPtValues();
// event listener for button that activates predict
let predictButton = document.getElementById("calculateButton");
predictButton.addEventListener("click", () => predict())

function predict() {
    //console.log(robotStats)
    // reset html elements
    document.getElementById("blueVals").innerHTML = "";
    document.getElementById("redVals").innerHTML = "";
    document.getElementById("blueDefPen").innerHTML = "";
    document.getElementById("redDefPen").innerHTML = "";
    // check for min max potentials
    let potential = -1;
    let potentialButtons = document.getElementsByName("predictPots");
    for (let i = 0; i < potentialButtons.length; i++) {
        if (potentialButtons[i].checked) {
            potential = potentialButtons[i].value;
        }
    }
    // check for including def and pen
    let def = document.getElementById("includeDefence").checked;
    let pen = document.getElementById("includePen").checked;
    // get team numbers and set up variables for team info
    let blues = [
        parseInt(document.getElementById("blue1").value),
        parseInt(document.getElementById("blue2").value),
        parseInt(document.getElementById("blue3").value)
    ];
    let reds = [
        parseInt(document.getElementById("red1").value),
        parseInt(document.getElementById("red2").value),
        parseInt(document.getElementById("red3").value)
    ];
    let blueInfo = {
        0: {},
        1: {},
        2: {}
    };
    let redInfo = {
        0: {},
        1: {},
        2: {}
    };
    let blueMeans = [];
    let blueSTDVs = [];
    for (let i = 0; i < blues.length; i++) {
        let robot = blues[i];
        let tempMeans = [];
        let tempSTDVs = [];
        for (let robotStat in robotStats[robot]) {
            if (!(Number.isNaN(robotStats[robot][robotStat].averagePts))) {
                tempMeans.push(robotStats[robot][robotStat].averagePts);
                tempSTDVs.push(robotStats[robot][robotStat].standardDeviationPts);
            }
        }
        blueMeans.push(tempMeans.reduce((total, num) => total + num, 0));
        blueSTDVs.push(Math.sqrt(tempSTDVs.reduce((total, num) => total + num ** 2, 0)));
    }
    let redMeans = [];
    let redSTDVs = [];
    for (let i = 0; i < reds.length; i++) {
        let robot = reds[i];
        let tempMeans = [];
        let tempSTDVs = [];
        for (let robotStat in robotStats[robot]) {
            if (!(Number.isNaN(robotStats[robot][robotStat].averagePts))) {
                tempMeans.push(robotStats[robot][robotStat].averagePts);
                tempSTDVs.push(robotStats[robot][robotStat].standardDeviationPts);
            }
        }
        redMeans.push(tempMeans.reduce((total, num) => total + num, 0));
        redSTDVs.push(Math.sqrt(tempSTDVs.reduce((total, num) => total + num ** 2, 0)));
    }
    let combBlue = combinedDistribution(blueMeans, blueSTDVs);
    let combRed = combinedDistribution(redMeans, redSTDVs);
    let diffMean = combBlue.mean - combRed.mean //pos value: blue wins, neg value: red wins
    let diffSTDV = Math.sqrt(combBlue.standardDeviation ** 2 + combRed.standardDeviation ** 2)
    //console.log(diffMean + ", " + diffSTDV)
    let prediction = areaUnderNormalCurve(0, diffMean, diffSTDV)
    //console.log(prediction)

  // set scores to start at 0
  let blueScores = {
      "auto": {},
      "teleop": {},
      "total": {}
  };
  let redScores = {
      "auto": {},
      "teleop": {},
      "total": {}
  };
  let blueScore = 0;
  let redScore = 0;
  let blueDefPen = {
      "Defense Time": {},
      "Penalty Count": {}
  };
  let redDefPen = {
      "Defense Time": {},
      "Penalty Count": {}
  };
  // initialize value and defence/pen tables
  const blueAllianceTable = new AddTable();
  var blueTableBody = blueAllianceTable.getTableBody();
  const redAllianceTable = new AddTable();
  var redTableBody = redAllianceTable.getTableBody();
  const blueDefPenTable = new AddTable();
  var blueDefPenTableBody = blueDefPenTable.getTableBody();
  const redDefPenTable = new AddTable();
  var redDefPenTableBody = redDefPenTable.getTableBody();
  // vertical headers
  var gameStageHeader = dataStructure.createDataLabels("Auto", "Teleop", "Total");
  var defPenHeader = dataStructure.createDataLabels("Defence Value", "Penalties");
  // getting data on each robot
  let arrayRobotData = [];
    let availRobots = Object.keys(robotData)
    for(let i=0; i< availRobots.length; i++){
      arrayRobotData.push(robotData[availRobots[i]])
    }
  for (let i = 0; i < arrayRobotData.length; i++) {
      let team = Object.values(arrayRobotData[i])[0]["Team"];
      for (let j = 0; j < blues.length; j++) {
          if (blues[j] == team) blueInfo[j] = Object.values(arrayRobotData[i]);
      }
      for (let j = 0; j < reds.length; j++) {
          if (reds[j] == team) redInfo[j] = Object.values(arrayRobotData[i]);
      }
  }
  // check for empty inputs, replaces them with NA in the header
  for (let i = 0; i < blues.length; i++) {
      if (isNaN(blues[i])) blues[i] = "NA";
      if (isNaN(reds[i])) reds[i] = "NA";
  }
  // add headers
  var blueRobotsHeader = dataStructure.createDataLabels("Blue Teams", ...blues);
  var redRobotsHeader = dataStructure.createDataLabels("Red Teams", ...reds);
  blueAllianceTable.addHeader(blueRobotsHeader);
  redAllianceTable.addHeader(redRobotsHeader);
  blueDefPenTable.addHeader(blueRobotsHeader);
  redDefPenTable.addHeader(redRobotsHeader);
  // calculating scores for each robot on each team
  [blueScores, blueScore] = calcAverage(blueInfo, potential);
  [redScores, redScore] = calcAverage(redInfo, potential);
  // including def and pen calculations
  for (let i = 0; i < Object.keys(blueInfo).length; i++) {
      let currentRobotData = blueInfo[i];
      let defAvg = 0.0;
      let penAvg = 0.0;
      if (currentRobotData.length == undefined) {
          blueDefPen["Defense Time"][i] = -1;
          blueDefPen["Penalty Count"][i] = -1;
          continue;
      }
      for (let j = 0; j < currentRobotData.length; j++) {
          defAvg += currentRobotData[j]["Defense Time"] / currentRobotData.length;
          penAvg += currentRobotData[j]["Penalty Count"] / currentRobotData.length;
      }
      defAvg *= defPenPtValues[0];
      penAvg *= defPenPtValues[1];
      if (def) redScore -= defAvg;
      if (pen) redScore += penAvg;
      blueDefPen["Defense Time"][i] = defAvg;
      blueDefPen["Penalty Count"][i] = penAvg;
  }
  for (let i = 0; i < Object.keys(redInfo).length; i++) {
      let currentRobotData = redInfo[i];
      let defAvg = 0.0;
      let penAvg = 0.0;
      if (currentRobotData.length == undefined) {
          redDefPen["Defense Time"][i] = -1;
          redDefPen["Penalty Count"][i] = -1;
          continue;
      }
      for (let j = 0; j < currentRobotData.length; j++) {
          defAvg += currentRobotData[j]["Defense Time"] / currentRobotData.length;
          penAvg += currentRobotData[j]["Penalty Count"] / currentRobotData.length;
      }
      defAvg *= defPenPtValues[0];
      penAvg *= defPenPtValues[1];
      if (def) blueScore -= defAvg;
      if (pen) blueScore += penAvg;
      redDefPen["Defense Time"][i] = defAvg;
      redDefPen["Penalty Count"][i] = penAvg;
  }
  // adding score data to tables
  for (let i = 0; i < gameStageHeader.length; i++) {
      var blueRow = document.createElement("tr");
      var redRow = document.createElement("tr");
      blueTableBody.appendChild(blueRow);
      redTableBody.appendChild(redRow);
      // add vertical headers
      blueAllianceTable.addCell(gameStageHeader[i], blueRow, true);
      redAllianceTable.addCell(gameStageHeader[i], redRow, true);
      for (let j = 0; j < 3; j++) {
          let blueScoreVal = blueScores[gameStageHeader[i].toLowerCase()][j].toFixed(1);
          if (blueScoreVal == -1) {
              blueScoreVal = "NA"
          }
          let redScoreVal = redScores[gameStageHeader[i].toLowerCase()][j].toFixed(1);
          if (redScoreVal == -1) {
              redScoreVal = "NA"
          }
          blueAllianceTable.addCell(blueScoreVal, blueRow);
          redAllianceTable.addCell(redScoreVal, redRow);
      }
  }
  // add defence penalty data
  for (let i = 0; i < defPenHeader.length; i++) {
      var blueRow = document.createElement("tr");
      var redRow = document.createElement("tr");
      blueDefPenTableBody.appendChild(blueRow);
      redDefPenTableBody.appendChild(redRow);
      blueDefPenTable.addCell(defPenHeader[i], blueRow, true);
      redDefPenTable.addCell(defPenHeader[i], redRow, true);
      let defPenValue = "";
      if (defPenHeader[i] == "Defence Value") defPenValue = "Defense Time";
      else if (defPenHeader[i] == "Penalties") defPenValue = "Penalty Count";
      for (let j = 0; j < 3; j++) {
          let blueDefPenValue = blueDefPen[defPenValue][j].toFixed(1);
          if (blueDefPenValue == -1) {
              blueDefPenValue = "NA"
          }
          let redDefPenValue = redDefPen[defPenValue][j].toFixed(1);
          if (redDefPenValue == -1) {
              redDefPenValue = "NA"
          }
          blueAllianceTable.addCell(blueDefPenValue, blueRow);
          redAllianceTable.addCell(redDefPenValue, redRow);
      }
  }
  // displaying tables
  document.getElementById("blueVals").style.visibility = "visible";
  document.getElementById("redVals").style.visibility = "visible";
  document.getElementById("blueDefPen").style.visibility = "visible";
  document.getElementById("redDefPen").style.visibility = "visible";
  document.getElementById("blueVals").appendChild(blueAllianceTable.getTable());
  document.getElementById("redVals").appendChild(redAllianceTable.getTable());
  document.getElementById("blueDefPen").appendChild(blueDefPenTable.getTable());
  document.getElementById("redDefPen").appendChild(redDefPenTable.getTable());
  // displaying total scores
  document.getElementById("points").innerHTML = "Blue: " + blueScore.toFixed(1)  + " ± " + combBlue.standardDeviation.toFixed(1) + "<br>Red: " + redScore.toFixed(1)+ " ± " + combRed.standardDeviation.toFixed(1);
  // set and display winner
  let w = document.getElementById("winner");
  if (blueScore > redScore) {
      w.innerHTML = "BLUE WINS: " + (prediction * 100).toFixed(2) + '%';
      w.style.backgroundColor = "var(--b)"
  } else if (redScore > blueScore) {
      w.innerHTML = "RED WINS: " + ((1-prediction) * 100).toFixed(2) + '%';
      w.style.backgroundColor = "var(--r)"
  } else {
      w.innerHTML = "TIE" // + (prediction * 100).toFixed(2) + '%';
      w.style.backgroundColor = "";
  }
}

function combinedDistribution(means, standardDeviations) {
    let sum = 0;
    let squaresSum = 0;
    let n = means.length;
    for (let i = 0; i < n; i++) {
        sum += means[i];
        squaresSum += standardDeviations[i] ** 2;
    }
    let mean = sum;
    let standardDeviation = Math.sqrt(squaresSum);
    return { mean, standardDeviation };
}
function areaUnderNormalCurve(value, mean, standardDeviation) {
    // Convert the value to a z-score using the mean and standard deviation
    let z = (value - mean) / standardDeviation;
    // Use the cumulative distribution function to calculate the area under the curve to the right
    let area = 0.5 * (1 - erf(z / Math.sqrt(2)));
    return area;
}
function erf(x) {
    let a1 = 0.254829592;
    let a2 = -0.284496736;
    let a3 = 1.421413741;
    let a4 = -1.453152027;
    let a5 = 1.061405429;
    let p = 0.3275911;
    let sign = 1;
    if (x < 0) {
        sign = -1;
    }
    x = Math.abs(x);
    let t = 1 / (1 + p * x);
    let y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
}
function calcAverage(robotInfo, potential = 0) {
  let scores = {
      "auto": {},
      "teleop": {},
      "total": {}
  };
  let autoTotal, teleTotal, endTotal;
  let autoFilter = dataStructure.getFilterLabelsAuto();
  let autoVals = dataStructure.getAutoPtValues();
  let teleFilter = dataStructure.getFilterLabelsTele();
  let teleVals = dataStructure.getTelePtValues();
  Object.keys(robotStats).forEach(robotNumber => {
    let robotStat = robotStats[robotNumber];
    autoTotal = autoFilter.reduce((sum, key, index) => {
        let avg = robotStat[key].average;
        let value = autoVals[index];
        let stdv = robotStat[key].standardDeviation;
        return {total: sum + avg * value, standardDeviation: stdv};
    }, 0);
    teleTotal = teleFilter.reduce((sum, key, index) => {
        let avg = robotStat[key].average;
        let value = teleVals[index];
        let stdv = robotStat[key].standardDeviation;
        return {total: sum + avg * value, standardDeviation: stdv};
    }, 0);
    endTotal = robotStat["Climb"].average;
    teleTotal -= endTotal; //this is because the endgame points are counted in teleop filter for this game :skull:
    });
  let totalScore = 0;
  for (let i = 0; i < Object.keys(robotInfo).length; i++) {
      let currentRobotData = robotInfo[i];
      let autoScoreAvg = 0.0;
      let teleScoreAvg = 0.0;
      let autoScoreMax = 0.0;
      let teleScoreMax = 0.0;
      let autoScoreMin = 0.0;
      let teleScoreMin = 0.0;
      if (currentRobotData.length == undefined) {
          scores["auto"][i] = -1;
          scores["teleop"][i] = -1;
          scores["total"][i] = -1;
          continue;
      }

      autoScoreAvg += dataStructure.calcAvgAutoPts(currentRobotData)
      teleScoreAvg += dataStructure.calcAvgTelePts(currentRobotData)
      for (let j = 0; j < avgFilterLabelsAuto.length; j++) {
          let minVal = Number.MAX_SAFE_INTEGER;
          let maxVal = -1;
          for (let k = 0; k < currentRobotData.length; k++) {
              minVal = Math.min(currentRobotData[k][avgFilterLabelsAuto[j]], minVal);
              maxVal = Math.max(currentRobotData[k][avgFilterLabelsAuto[j]], maxVal);
          }
          autoScoreMin += minVal * autoPtValues[j];
          autoScoreMax += maxVal * autoPtValues[j];
      }
      for (let j = 0; j < avgFilterLabelsTele.length; j++) {
          let minVal = Number.MAX_SAFE_INTEGER;
          let maxVal = -1;
          for (let k = 0; k < currentRobotData.length; k++) {
              minVal = Math.min(currentRobotData[k][avgFilterLabelsTele[j]], minVal);
              maxVal = Math.max(currentRobotData[k][avgFilterLabelsTele[j]], maxVal);
          }
          teleScoreMin += minVal * telePtValues[j];
          teleScoreMax += maxVal * telePtValues[j];
      }
      if (potential == 0) {
          scores["auto"][i] = autoScoreAvg;
          scores["teleop"][i] = teleScoreAvg;
          scores["total"][i] = autoScoreAvg + teleScoreAvg;
          totalScore += autoScoreAvg + teleScoreAvg;
          continue;
      } else if (potential == 1) {
          scores["auto"][i] = autoScoreMax;
          scores["teleop"][i] = teleScoreMax;
          scores["total"][i] = autoScoreMax + teleScoreMax;
          totalScore += autoScoreMax + teleScoreMax;
          continue;
      } else if (potential == 2) {
          scores["auto"][i] = autoScoreMin;
          scores["teleop"][i] = teleScoreMin;
          scores["total"][i] = autoScoreMin + teleScoreMin;
          totalScore += autoScoreMin + teleScoreMin;
          continue;
      }
  }
  return [scores, totalScore];
}

//=============== SETTINGS ===============
var settingWghtHeadNames = dataStructure.createDataLabels("Mobility",
  "Auto High Cube",
  "Auto Mid Cube",
  "Auto Low Cube",
  "Auto High Cone",
  "Auto Mid Cone",
  "Auto Low Cone",
  "Auto Fumbled",
  "Auto Climb",
  "High Cube",
  "Mid Cube",
  "Low Cube",
  "High Cone",
  "Mid Cone",
  "Low Cone",
  "Fumbled",
  "Climb",
  "Defense Time",
  "Penalty Count",
  "Oof Time");

//general table generation
const settingWghtTable = new AddTable();
settingWghtTable.addHeader(settingWghtHeadNames);
var settingWghtTableBody = settingWghtTable.getTableBody();
document.getElementById("settings-wght-container").appendChild(settingWghtTable.getTable());

var row = document.createElement("tr");
settingWghtTableBody.appendChild(row);
var txtBoxes = [];

for (var i = 0; i < settingWghtHeadNames.length; i++) {
  var weights = dataStructure.getWghtValues()
  txtBoxes.push(settingWghtTable.addTextCell(weights[i], row, "weightBox", "weightInput"));
}

function getNewWeights() {
  var newWeights = [];
  for (var i = 0; i < settingWghtHeadNames.length; i++) {
      newWeights.push(txtBoxes[i].value)
  }
  dataStructure.changeWghtValues(newWeights)
  var rankHeadNames = dataStructure.createDataLabels("Rank", "Team", "Score",
      "Mobility",
      "Auto High Cube",
      "Auto Mid Cube",
      "Auto Low Cube",
      "Auto High Cone",
      "Auto Mid Cone",
      "Auto Low Cone",
      "Auto Fumbled",
      "Auto Climb",
      "High Cube",
      "Mid Cube",
      "Low Cube",
      "High Cone",
      "Mid Cone",
      "Low Cone",
      "Fumbled",
      "Climb",
      "Defense Time",
      "Penalty Count",
      "Oof Time");
  setPath = dataStructure.getPath("Final" + "/" + "Robots");
  get(ref(db, setPath)).then((snapshot) => {
      var data = snapshot.val()
      //displayRankings(data, rankHeadNames)
      //displaySummary(data)
  })
}

function resetWeights() {
  let defaultWeights = [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0];
  dataStructure.changeWghtValues(defaultWeights);
  for (var i = 0; i < settingWghtHeadNames.length; i++) {
      txtBoxes[i].value = defaultWeights[i];
  }
  var rankHeadNames = dataStructure.createDataLabels("Rank", "Team", "Score",
      "Mobility",
      "Auto High Cube",
      "Auto Mid Cube",
      "Auto Low Cube",
      "Auto High Cone",
      "Auto Mid Cone",
      "Auto Low Cone",
      "Auto Fumbled",
      "Auto Climb",
      "High Cube",
      "Mid Cube",
      "Low Cube",
      "High Cone",
      "Mid Cone",
      "Low Cone",
      "Fumbled",
      "Climb",
      "Defense Time",
      "Penalty Count",
      "Oof Time");
  setPath = dataStructure.getPath("Final" + "/" + "Robots");
  get(ref(db, setPath)).then((snapshot) => {
      var data = snapshot.val()
      //displayRankings(data, rankHeadNames)
      //displaySummary(data)
  })
}
document.getElementById("wghtBtn").addEventListener("click", getNewWeights);
document.getElementById("resetBtn").addEventListener("click", resetWeights);

// PITSCOUT REQUESTS

function sendPit(teamNum, details_str) {
  let currentTime = new Date().getTime();

  // Create a new Date object with the current time
  let date = new Date(currentTime);

  // Use the toLocaleTimeString method to format the time
  let options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
  };
  let formattedTime = date.toLocaleTimeString('en-US', options);


  let payload = {
      "blocks": [{
              "type": "header",
              "text": {
                  "type": "plain_text",
                  "text": "🔴Pitscout request",
                  "emoji": true
              }
          },
          {
              "type": "section",
              "text": {
                  "type": "mrkdwn",
                  "text": "*Team Number* \n" + teamNum
              }
          },
          {
              "type": "section",
              "text": {
                  "type": "mrkdwn",
                  "text": "*Details* \n" + details_str
              }
          },
          {
              "type": "divider"
          },
          {
              "type": "section",
              "text": {
                  "type": "mrkdwn",
                  "text": "https://forms.gle/9hBFnA2nQpssZrAV6"
              }
          },
          {
              "type": "context",
              "elements": [{
                  "type": "plain_text",
                  "text": "This is an automated request message sent at " + formattedTime + ". Above is the pitscout form link, if instructions unclear, please ping @strat in this channel. Please click the button if you are going to fulfill the request.",
                  "emoji": true
              }]
          },
          {
              "type": "actions",
              "elements": [{
                  "type": "button",
                  "text": {
                      "type": "plain_text",
                      "emoji": true,
                      "text": "Yes, I'm on it"
                  },
                  "style": "primary",
                  "value": "click_me_123"
              }]
          }
      ]
  };
  sendReq(payload)
}


function sendReq(payload) {
  fetch('https://nep2n-test.johnyuan1.repl.co/slack/webhook', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
      })
      .then(response => {
          if (response.ok) {
              console.log('Message posted successfully');
          } else {
              console.log('Failed to post message');
          }
      })
      .catch(error => console.error('Error:', error));

}

//=============== SUMMARY ===============
let scatterChart;
function displaySummary() {
    //let robotNames = Object.keys(data)
    //console.log(robotStats);

    let xData = [];
    let yData = [];
    let areaData = [];
    let labelData = [];

    let autoTotal, teleTotal, endTotal;
    let autoFilter = dataStructure.getFilterLabelsAuto();
    let autoVals = dataStructure.getAutoPtValues();
    let teleFilter = dataStructure.getFilterLabelsTele();
    let teleVals = dataStructure.getTelePtValues();

    Object.keys(robotStats).forEach(robotNumber => {
        let robotStat = robotStats[robotNumber];
        autoTotal = autoFilter.reduce((sum, key, index) => {
            let avg = robotStat[key].average;
            let value = autoVals[index];
            return sum + avg * value;
        }, 0);
        teleTotal = teleFilter.reduce((sum, key, index) => {
            let avg = robotStat[key].average;
            let value = teleVals[index];
            return sum + avg * value;
        }, 0);
        endTotal = robotStat["Climb"].average;
        teleTotal -= endTotal; //this is because the endgame points are counted in teleop filter for this game :skull:

        xData.push(teleTotal);
        yData.push(autoTotal);
        areaData.push(endTotal);
        labelData.push(robotNumber);
    });

    let sortedData = areaData.slice().sort(function(a, b) {return a - b});;
    let min = sortedData[0];
    let max = sortedData[sortedData.length - 1];
    for (let i = 0; i < areaData.length; i++) {
        let p = (areaData[i] - min) / (max - min)
        areaData[i] = 20*p + 5;
    }

    let ctx = document.getElementById("summaryScatterPlot").getContext("2d");
        if (scatterChart) {
            //console.log("scatter updated");
            scatterChart.data.datasets[0].data = xData.map(function(x, i) {
                return {
                    x: x.toFixed(1),
                    y: yData[i].toFixed(1),
                    r: areaData[i].toFixed(1),
                    label: labelData[i].toString()
                };
                })
            scatterChart.update();
        } else {
            scatterChart = new Chart(ctx, {
                type: "bubble",
                data: {
                datasets: [{
                    label: ["Summary of Robots"],
                    data: xData.map(function(x, i) {
                    return {
                        x: x.toFixed(1),
                        y: yData[i].toFixed(1),
                        r: areaData[i].toFixed(1),
                        label: labelData[i].toString()
                    };
                    }),
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgb(54, 162, 235)"
                }]
                },
                options: {
                  scales: {
                    y: {
                        title: {
                            display: true,
                            text: "Auto Points"
                        }
                    },x: {
                        title: {
                            display: true,
                            text: "Tele Points"
                        }
                    }
                  }
                }
            });
        }
        let fontSize = Chart.defaults.font.size
        Chart.register({
            id: 'permanentLabel',
            afterDatasetsDraw: (chart, args, options) => {
                const ctx = chart.ctx
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillStyle = "#d8dee9";
                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i)
                    if (meta.type !== 'bubble') return
                    meta.data.forEach((element, index) => {
                        const item = dataset.data[index]
                        const position = element.tooltipPosition()
                        ctx.fillText(item.label.toString(), position.x, position.y - item.r - fontSize)
                    })
                })
            },
        })
}

//=============== PICKLIST ===============
function duplicateTable(tableId, tableIdto) {
    let originalTable = document.getElementById(tableId);
    let newTable = originalTable.cloneNode(true);
    let rows = newTable.rows;
    for (let i = 0; i < rows.length; i++) {
      let cells = rows[i].cells;
      for (let j = 0; j < cells.length; j++) {
        cells[j].id = `${cells[j].id}_copy`;
      }
    }
    document.getElementById(tableIdto).appendChild(newTable);
}

function updateDuplicateTable() {
    // Clear the duplicate table
    while (duplicateTable.firstChild) {
      duplicateTable.removeChild(duplicateTable.firstChild);
    }
  
    // Clone the original table
    var newTable = originalTable.cloneNode(true);
  
    // Update the ID and class of the cloned table
    newTable.id = "duplicate-table";
    newTable.className = "duplicate-table-class";
  
    // Append the cloned table to the document
    duplicateTable.parentNode.appendChild(newTable);
  }

//   originalTable.addEventListener("change", updateDuplicateTable);
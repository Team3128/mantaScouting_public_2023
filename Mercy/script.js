import { Encoder } from '../encoder'
import { DataStructure } from '../dataStructure'
import { SwitchPage } from "./modules/switchPage"
import { ref, child, get, onChildAdded, onValue, set, remove } from "firebase/database";
import Hammer from 'hammerjs';
const encoder = new Encoder();
const dataStructure = new DataStructure();
const db = dataStructure.getFireBase();
let eventName;
let api_url;
let toggleTBA = false;

// Check if Firebase path exists in local storage
let availPaths = ["ADD_PATHS_HERE"];
let firebasePath = localStorage.getItem('firebasePath');
if (firebasePath == "null") {
    let valid = true;
    let userInput;
    while(valid){
      userInput = prompt('Please enter a firebase path:', '');
      userInput = userInput.toLowerCase()
      if(availPaths.indexOf(userInput) != -1){
        valid=false;
      }
    }

    if(userInput.includes("practice")){
      toggleTBA = true;
      console.log("here")
    }
    dataStructure.setFirebasePath("Events/" + userInput + "/");
    eventName = userInput;
    localStorage.setItem('firebasePath', userInput);
} else {
  let valid = true;
  let userInput;
  while(valid){
    userInput = prompt('Please enter a firebase path:', firebasePath);
    userInput = userInput.toLowerCase()
    if(availPaths.indexOf(userInput) != -1){
      valid=false;
    }
  }

    if(userInput.includes("practice")){
      toggleTBA = true;
      console.log("here")
    }
    dataStructure.setFirebasePath("Events/" + userInput + "/");
    eventName = userInput;
    localStorage.setItem('firebasePath', userInput);
}
api_url = "https://www.thebluealliance.com/api/v3/event/" + eventName + "/matches?X-TBA-Auth-Key=TBA_AUTH_HERE";
console.log("success")

var netStatus;
var cacheCSV = [];
let inputs =0;

let pageChange = new SwitchPage()
let allNavBtns = document.querySelectorAll(".nav-container");
allNavBtns.forEach((element, index) => {
  element.addEventListener("click", () => {
      pageChange.switchEvent(allNavBtns[index].getAttribute("name"))
  })
})
document.addEventListener("keydown", function(e) {
  if (e.key == "Tab") {
      e.preventDefault()
      if (pageChange.toggleState) {
          pageChange.hidePanel()
          pageChange.toggleState = false;
      } else {
          pageChange.showPanel()
          pageChange.toggleState = true;
      }
  }
})
pageChange.switchEvent("upload")

let viewPageHammer = new Hammer(document.body);

const isTouchDevice = "ontouchstart" in window;
if (isTouchDevice) {
    viewPageHammer.on('doubletap', function(ev) {
        if (pageChange.toggleState) {
            pageChange.hidePanel()
            pageChange.toggleState = false;
        } else {
            pageChange.showPanel()
            pageChange.toggleState = true;
        }
    });
}

function uploadData() {
  document.getElementById("status").innerHTML = "";
  if(!netStatus){
    document.getElementById("status").innerHTML = "Failed Internet Connection Test: Upload Not Registered"
    return;
  }
  var all_data = document.getElementById("input").value;
  if(all_data == ''){
    document.getElementById("status").innerHTML = "Empty Push, Upload Not Registered";
    return;
  }
  var sep_data = all_data.split(/\n/);
  var temp_data = all_data.split(/\n/)
  var sorted_data = []
  for(var i=0;i<sep_data.length;i++){
    if(sep_data[i] == ''){
      continue;
    }
    var data = sep_data[i].split(',');
      //data[0] = robot number, data[1] = match number
      data[0] = data[0].trim()
      data[1] = data[1].trim()
      data[2] = data[2].trim()
      
      if(data[0].length <2){
        data[0] = "0" + data[0];
      }
      
      if(data.length<dataStructure.dataLabels.length || data.length>dataStructure.dataLabels.length){
        document.getElementById("status").innerHTML += "Failed Upload for "+ data[0] + "-" + data[2]  + "-" + data[3] + ": " + "Invalid Length" + "<br>";
        continue;
      }
      if(!/^\d+$/.test(data[0])){
        document.getElementById("status").innerHTML += "Failed Upload for "+ data[0] + "-" + data[2]  + "-" + data[3] + ": " + "Invalid Match" + "<br>";
        continue;
      }
      if(!/^\d+$/.test(data[1]) || data[1].length>4){
        document.getElementById("status").innerHTML += "Failed Upload for "+ data[0] + "-" + data[2]  + "-" + data[3] + ": " + "Invalid Team" + "<br>";
        continue;
      }
      if(data[2] == "b1" || data[2] == "b2" ||data[2] == "b3" ||data[2] == "r1" ||data[2] == "r2" ||data[2] == "r3"){
  
      }else{
        document.getElementById("status").innerHTML += "Failed Upload for "+ data[0] + "-" + data[2]  + "-" + data[3] + ": " + "Invalid Position" + "<br>";
        continue;
      }
      let invalidQualitative = ""
      let validQualitative = true;
      for(let j=4; j<25; j++){
        if(!/^\d+$/.test(data[j])){
          validQualitative = false;
          invalidQualitative+= "index " + (j+1) + ", with value " + data[j] + ", or " + dataStructure.dataLabels[j] + "<br>";
        }
      }
      if(!validQualitative){
        document.getElementById("status").innerHTML += "Failed Upload for "+ data[0] + "-" + data[2]  + "-" + data[3] + ": " + "Invalid Qualitative Data For: <br>" + invalidQualitative + "<br>";
        continue;
      }
      
        let cache = localStorage.getItem("dataCache");
        cache+=temp_data[i] + "\n";
        cache.replace("null", "");
        localStorage.setItem("dataCache", cache)
      sorted_data.push(data)
  }
  
  for(var i=0;i<sorted_data.length;i++){
          var data = sorted_data[i];
            var formattedData = encoder.rawDataToFormattedData(data, dataStructure.dataLabels);
  
            var uploadStatus = encoder.uploadFormattedData(db, formattedData, dataStructure);

            if(uploadStatus == true){
              document.getElementById("status").innerHTML += "Successful Upload for " + formattedData["Match"] + "-" + formattedData["Position"] + "-" + formattedData["Scout"] + "<br>" ;
            }
            else{
              document.getElementById("status").innerHTML += "Failed Upload for "+ formattedData["Match"] + "-" + formattedData["Position"]  + "-" + formattedData["Scout"] + ": " + uploadStatus + "<br>";
            }
    }
  }
document.getElementById("button").addEventListener("click", uploadData);

function download(){
  let cache = localStorage.getItem("dataCache");
  if(cache == ""){
    return;
  }
  let fileName = "mercyCache.txt";

  var element = document.createElement('a');
  element.setAttribute('href','data:text/plain;charset=utf-8, ' + encodeURIComponent(cache));
  element.setAttribute('download', fileName);
  document.body.appendChild(element);
             
  element.click();
  document.body.removeChild(element);
}
document.getElementById("download").addEventListener("click", download);

function clearDownload(){
  localStorage.setItem("dataCache", "");
}
document.getElementById("cleardown").addEventListener("click", clearDownload);


function internetOnline(){
  netStatus = true;
  document.getElementById("wifiON").style.display = "block";
  document.getElementById("wifiOFF").style.display = "none";
  console.log("online")
}
function internetOffline(){
  netStatus = false;
  document.getElementById("wifiOFF").style.display = "block";
  document.getElementById("wifiON").style.display = "none";
  console.log("offline")
}

window.navigator.onLine ? internetOnline() : internetOffline();

window.addEventListener('online', internetOnline);
window.addEventListener('offline', internetOffline);

let textBox = document.getElementById('input')


textBox.addEventListener('keydown', (event) => {
  if(event.key === 'Enter'){
    if(inputs == 0){
      const audio = new Audio('sfx/Spectrum_Kill_1.mp3.mp3')
      audio.play()
      inputs +=1;
    }else if(inputs == 1){
      const audio = new Audio('sfx/Spectrum_Kill_2.mp3.mp3')
      audio.play()
      inputs+=1;
    }
    else if(inputs == 2){
      const audio = new Audio('sfx/Spectrum_Kill_3.mp3.mp3')
      audio.play()
      inputs+=1;
    }
    else if(inputs == 3){
      const audio = new Audio('sfx/Spectrum_Kill_4.mp3.mp3')
      audio.play()
      inputs+=1;
    }
    else if(inputs == 4){
      const audio = new Audio('sfx/Spectrum_Kill_5.mp3.mp3')
      audio.play()
      inputs+=1;
    }
    else if(inputs == 5){
      const audio = new Audio('sfx/Spectrum_Kill_6.mp3.mp3')
      audio.play()
      inputs+=1;
    }
    else{
      const audio = new Audio('sfx/Spectrum_Kill_6.mp3.mp3')
      audio.play()
    }

  }
  
})

function clear(){
  document.getElementById('input').value = ''
  inputs=0;
}
document.getElementById("clear").addEventListener("click", clear);

let setPath = dataStructure.getPath("/" + "Matches-TBA");
var storedData = {}
let dataLabels = dataStructure.getDataLabels()
onChildAdded(ref(db, setPath), (snapshot) => {
    //call the consolidate function here, and add the consolidated data instead
    let instance = snapshot.val()
    let finalPath = dataStructure.getPath("Final/Matches/" + instance["Match"] + "-" + instance["Position"]);
    get(ref(db, finalPath)).then((snapshot) => {
        var data = snapshot.val()
        let match = "" + instance["Match"] + "-" + instance["Position"];

        if (data != null && data["Scout"].includes(instance["Scout"])) {
            if (storedData[match] == undefined) {
                storedData[match] = []
            }
            let newScout = true;
            for (let i = 0; i < storedData[match].length; i++) {
                if (storedData[match][i]["Scout"] == instance["Scout"]) newScout = false
            }
            if (newScout) storedData[match].push(instance)
            // console.log(storedData)
        } else {
            if (storedData[match] == undefined) {
                storedData[match] = [];
            }
            // console.log(storedData[match]);
            for (let i = 0; i < storedData[match].length; i++) {
                if (storedData[match][i]["Scout"] == instance["Scout"]) {
                    return;
                }
            }
            storedData[match].push(Object.assign({}, instance));
            let replace = {};
            replace["Scout"] = [];
            for(let i = 0; i < dataLabels.length; i++){
                if (dataLabels[i] == "Position" || dataLabels[i] == "Match" || dataLabels[i] == "Team") {
                    replace[dataLabels[i]] = storedData[match][0][dataLabels[i]];
                    continue;
                } else if (dataLabels[i] == "Scout") {
                    for (let j = 0; j < storedData[match].length; j++) {
                        replace[dataLabels[i]].push(storedData[match][j][dataLabels[i]]);
                    }
                    continue;
                } else if (dataLabels[i] == "Intake QATA" || dataLabels[i] == "Climb QATA" || dataLabels[i] == "QATA") {
                    let combinedQATA = "";
                    for (let j = 0; j < storedData[match].length; j++) {
                        combinedQATA += storedData[match][j][dataLabels[i]];
                        if (j < storedData[match].length - 1) combinedQATA += ", ";
                    }
                    replace[dataLabels[i]] = combinedQATA;
                    continue;
                }
                let sum = 0;
                let countVals = 0;
                for (let j = 0; j < storedData[instance["Match"] + "-" + instance["Position"]].length; j++) {
                    sum += parseInt(storedData[instance["Match"] + "-" + instance["Position"]][j][dataLabels[i]]);
                    countVals += 1;
                }
                replace[dataLabels[i]] = "" + (sum / countVals).toFixed(0);
            }
            // console.log(replace)
            // console.log(pushPath)
            // console.log(storedData)

            let pushPath = dataStructure.getPath("Final" + "/" + "Matches");
            remove(ref(db, pushPath + match + "/"), replace)
            set(child(ref(db, pushPath), (match)), replace)
            
            pushPath = dataStructure.getPath("Final" + "/" + "Robots");
            set(child(ref(db, pushPath + instance["Team"] + '/'), instance["Match"]), replace);
        }
    })
})

// Defining async function
let TBAGrabber = setInterval(()=>{getapi(api_url)}, 30000);
let TBABypass;

if(toggleTBA){
  clearInterval(TBAGrabber);
  TBABypass = setInterval(()=>{directUpload()}, 30000);
}

function toggle(){
  if(toggleTBA){
    toggleTBA = false;
    clearInterval(TBABypass);
    TBAGrabber = setInterval(()=>{getapi(api_url)}, 30000);
    document.getElementById("TBAtoggle").innerHTML = "TBA: ON";
  }else{
    toggleTBA = true;
    clearInterval(TBAGrabber);
    TBABypass = setInterval(()=>{directUpload()}, 30000);
    document.getElementById("TBAtoggle").innerHTML = "TBA: OFF";
  }
}
document.getElementById("TBAtoggle").addEventListener("click", toggle);


function directUpload(){
  let setPath = dataStructure.getPath("/" + "Matches");
    get(ref(db, setPath)).then((snapshot) => {
        if(snapshot.val() == null){
            console.log("No Uploads")
            return;
        }
        let matches = snapshot.val();
        console.log(matches)
        let matches_key = Object.keys(matches)
        //console.log(matches_key)
        for(let i=0;i<matches_key.length;i++){
          let match = matches[matches_key[i]]
          let setPath = dataStructure.getPath("Matches-TBA");
          remove(ref(db, setPath + match["Match"] + "-" + match["Position"] + "-" + match["Scout"] + "/"), match)
          set(child(ref(db, setPath), (match["Match"] + "-" + match["Position"] + "-" + match["Scout"] + "/")), match)
        }
      })
}
async function getapi(url) {
    
    // Storing response
    const response = await fetch(url);
    if(response==null){
        console.log("No TBA Data")
        return;
    }
    
    // Storing data in form of JSON
    var allData = await response.json();
    allData = JSON.parse(JSON.stringify(allData))
    let availMatches = [];

    console.log(allData)
    for(let i=0;i<allData.length;i++){
        let data = allData[i]
        if(data.comp_level == "sf"){
            data.match_number = data.set_number + 200
        }
        else if(data.comp_level == "f"){
            data.match_number += 300
        }
        if(data.match_number<10){
            data.match_number = "0" + data.match_number;
        }
        data.match_number = String(data.match_number)
        availMatches.push(data.match_number)
        
    }
    //console.log(availMatches)
    let setPath = dataStructure.getPath("/" + "Matches");
    get(ref(db, setPath)).then((snapshot) => {
        if(snapshot.val() == null){
            console.log("No Uploads")
            return;
        }
        let matches = snapshot.val();
        console.log(matches)

        let matches_key = Object.keys(matches)
        //console.log(matches_key)
        for(let i=0;i<matches_key.length;i++){
           if(availMatches.indexOf(matches[matches_key[i]]["Match"]) != -1){
                let index = availMatches.indexOf(matches[matches_key[i]]["Match"]);
                let match = matches[matches_key[i]]
                
                let alliances = allData[index].alliances;
                let scores = allData[index].score_breakdown;

                if(match["Position"][0] == "b"){
                    match["Team"] = (alliances.blue.team_keys[Number(match["Position"][1])-1]).substr(3)

                    if(Number(match["Position"][1]) == 1 ){
                        match["Mobility"] = scores.blue.mobilityRobot1
                        match["Auto Climb"] = scores.blue.autoChargeStationRobot1
                        match["Climb"] = scores.blue.endGameChargeStationRobot1
                    }else if(Number(match["Position"][1]) == 2){
                        match["Mobility"] = scores.blue.mobilityRobot2
                        match["Auto Climb"] = scores.blue.autoChargeStationRobot2
                        match["Climb"] = scores.blue.endGameChargeStationRobot2
                    }else{
                        match["Mobility"] = scores.blue.mobilityRobot3
                        match["Auto Climb"] = scores.blue.autoChargeStationRobot3
                        match["Climb"] = scores.blue.endGameChargeStationRobot3
                    }
                    if(match["Mobility"] == "Yes"){
                        match["Mobility"] = "1";
                    }else{
                        match["Mobility"] = "0";
                    }
                    if(match["Auto Climb"] == "None"){
                        match["Auto Climb"] = "0";
                    }else{
                        if(scores.blue.autoBridgeState == "Level"){
                            match["Auto Climb"] = "12"
                        }else{
                            match["Auto Climb"] ="8"
                        }
                    }
                    if(match["Climb"] == "None"){
                        match["Climb"] = "0";
                    }else if(match["Climb"] == "Park"){
                        match["Climb"] = "2";
                    }else{
                        if(scores.blue.endGameBridgeState == "Level"){
                            match["Climb"] = "10"
                        }else{
                            match["Climb"] ="6"
                        }
                    }
                    let setPath = dataStructure.getPath("Matches-TBA");
                    remove(ref(db, setPath + match["Match"] + "-" + match["Position"] + "-" + match["Scout"] + "/"), match)
                    set(child(ref(db, setPath), (match["Match"] + "-" + match["Position"] + "-" + match["Scout"] + "/")), match)

                    //match["Mobility"] = 

                    //.blue.team_keys
                }else{
                    match["Team"] = (alliances.red.team_keys[Number(match["Position"][1])-1]).substr(3)

                    if(Number(match["Position"][1]) == 1 ){
                        match["Mobility"] = scores.red.mobilityRobot1
                        match["Auto Climb"] = scores.red.autoChargeStationRobot1
                        match["Climb"] = scores.red.endGameChargeStationRobot1
                    }else if(Number(match["Position"][1]) == 2){
                        match["Mobility"] = scores.red.mobilityRobot2
                        match["Auto Climb"] = scores.red.autoChargeStationRobot2
                        match["Climb"] = scores.red.endGameChargeStationRobot2
                    }else{
                        match["Mobility"] = scores.red.mobilityRobot3
                        match["Auto Climb"] = scores.red.autoChargeStationRobot3
                        match["Climb"] = scores.red.endGameChargeStationRobot3
                    }
                    if(match["Mobility"] == "Yes"){
                        match["Mobility"] = "1";
                    }else{
                        match["Mobility"] = "0";
                    }
                    if(match["Auto Climb"] == "None"){
                        match["Auto Climb"] = "0";
                    }else{
                        if(scores.red.autoBridgeState == "Level"){
                            match["Auto Climb"] = "12"
                        }else{
                            match["Auto Climb"] ="8"
                        }
                    }
                    if(match["Climb"] == "None"){
                        match["Climb"] = "0";
                    }else if(match["Climb"] == "Park"){
                        match["Climb"] = "2";
                    }else{
                        if(scores.red.endGameBridgeState == "Level"){
                            match["Climb"] = "10"
                        }else{
                            match["Climb"] ="6"
                        }
                    }

                    let setPath = dataStructure.getPath("Matches-TBA");
                    remove(ref(db, setPath + match["Match"] + "-" + match["Position"] + "-" + match["Scout"] + "/"), match)
                    set(child(ref(db, setPath), (match["Match"] + "-" + match["Position"] + "-" + match["Scout"] + "/")), match)
                }

                //
           }
        }

    })
        
}

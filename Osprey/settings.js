let settings = {
  "imported":{
    "transitionMode": "auto"
  },
  "auto": [
    //cube cone buttons
    {
      "label": "A High ❒",
      "trigger": "e", 
      "columnStart": 1,
      "columnEnd": 2,
      "rowStart": 1,
      "rowEnd": 2,
      "writeLoc": 1,
      "writeType": "int"
    },
    {
      "label": "A High △",
      "trigger": "r", 
      "columnStart": 2,
      "columnEnd": 3,
      "rowStart": 1,
      "rowEnd": 2,
      "writeLoc": 4,
      "writeType": "int"
    },
    {
      "label": "A Mid ❒",
      "trigger": "d", 
      "columnStart": 1,
      "columnEnd": 2,
      "rowStart": 2,
      "rowEnd": 3,
      "writeLoc": 2,
      "writeType": "int"
    },
    {
      "label": "A Mid △",
      "trigger": "f", 
      "columnStart": 2,
      "columnEnd": 3,
      "rowStart": 2,
      "rowEnd": 3,
      "writeLoc": 5,
      "writeType": "int"
    },
    {
      "label": "A Low ❒",
      "trigger": "c", 
      "columnStart": 1,
      "columnEnd": 2,
      "rowStart": 3,
      "rowEnd": 4,
      "writeLoc": 3,
      "writeType": "int"
    },
    {
      "label": "A Low △",
      "trigger": "v", 
      "columnStart": 2,
      "columnEnd": 3,
      "rowStart": 3,
      "rowEnd": 4,
      "writeLoc": 6,
      "writeType": "int"
    },
    //cube cone buttons end
    {
      "label": "A Fumble",
      "trigger": "j", 
      "columnStart": 3,
      "columnEnd": 5,
      "rowStart": 1,
      "rowEnd": 2,
      "writeLoc": 7,
      "writeType": "int"
    },
    {
      "label": "A Climb Level",
      "trigger": "l", 
      "columnStart": 3,
      "columnEnd": 4,
      "rowStart": 3,
      "rowEnd": 5,
      "writeLoc": 8,
      "writeType": "cycG",
      "cycGOptions": [0, 8, 12],
      "writeCycGOptions": 3
    },
    {
      "label": "Oof Time",
      "trigger": ";", 
      "columnStart": 4,
      "columnEnd": 5,
      "rowStart": 3,
      "rowEnd": 5,
      "writeLoc": 20,
      "writeType": "inc"
    },
    {
      "label": "Mobility",
      "trigger": "k", 
      "columnStart": 3,
      "columnEnd": 5,
      "rowStart": 2,
      "rowEnd": 3,
      "writeLoc": 0,
      "writeType": "bool"
    }
    // ,
    // {
    //   "label": "Defense",
    //   "trigger": "a", 
    //   "columnStart": 1,
    //   "columnEnd": 3,
    //   "rowStart": 4,
    //   "rowEnd": 5,
    //   "writeLoc": 18,
    //   "writeType": "inc"
    // }
  ],





  "tele":[
    //cube cone buttons
    {
      "label": "T High ❒",
      "trigger": "e", 
      "columnStart": 1,
      "columnEnd": 2,
      "rowStart": 1,
      "rowEnd": 2,
      "writeLoc": 9,
      "writeType": "int"
    },
    {
      "label": "T High △",
      "trigger": "r", 
      "columnStart": 2,
      "columnEnd": 3,
      "rowStart": 1,
      "rowEnd": 2,
      "writeLoc": 12,
      "writeType": "int"
    },
    {
      "label": "T Mid ❒",
      "trigger": "d", 
      "columnStart": 1,
      "columnEnd": 2,
      "rowStart": 2,
      "rowEnd": 3,
      "writeLoc": 10,
      "writeType": "int"
    },
    {
      "label": "T Mid △",
      "trigger": "f", 
      "columnStart": 2,
      "columnEnd": 3,
      "rowStart": 2,
      "rowEnd": 3,
      "writeLoc": 13,
      "writeType": "int"
    },
    {
      "label": "T Low ❒",
      "trigger": "c", 
      "columnStart": 1,
      "columnEnd": 2,
      "rowStart": 3,
      "rowEnd": 4,
      "writeLoc": 11,
      "writeType": "int"
    },
    {
      "label": "T Low △",
      "trigger": "v", 
      "columnStart": 2,
      "columnEnd": 3,
      "rowStart": 3,
      "rowEnd": 4,
      "writeLoc": 14,
      "writeType": "int"
    },
    //cube cone buttons end
    {
      "label": "T Fumble",
      "trigger": "j", 
      "columnStart": 3,
      "columnEnd": 5,
      "rowStart": 1,
      "rowEnd": 2,
      "writeLoc": 15,
      "writeType": "int"
    },
    {
      "label": "Penalty",
      "trigger": "k", 
      "columnStart": 3,
      "columnEnd": 5,
      "rowStart": 2,
      "rowEnd": 3,
      "writeLoc": 19,
      "writeType": "int"
    },
    {
      "label": "T Climb Level",
      "trigger": "l", 
      "columnStart": 3,
      "columnEnd": 4,
      "rowStart": 3,
      "rowEnd": 5,
      "writeLoc": 16,
      "writeType": "cycG",
      "cycGOptions": [0, 2, 6, 10],
      "writeCycGOptions": 4
    },
    {
      "label": "Oof Time",
      "trigger": ";", 
      "columnStart": 4,
      "columnEnd": 5,
      "rowStart": 3,
      "rowEnd": 5,
      "writeLoc": 20,
      "writeType": "inc"
    },
    {
      "label": "Defense",
      "trigger": "s", 
      "columnStart": 1,
      "columnEnd": 3,
      "rowStart": 4,
      "rowEnd": 5,
      "writeLoc": 18, 
      "writeType": "inc"
    }
  ], 

  "after":[
    // {
    //   "label":"Climbed?",
    //   "writeLoc": 16,
    //   "writeType": "cyc",
    //   "cycOptions": [0, 6, 10],
    //   "writeCycOptions": 3
    // },

    {
      "label": "Climbing Capabilities?",
      "writeLoc": 21,
      "writeType": "str",
      "placeholder": "e.g. write about climb, can balance?, very slow?"
    },
    {
      "label": "Intake?", 
      "writeLoc": 22, 
      "writeType": "str",
      "placeholder": "e.g. speed, ground/shelf?"
    },
    {
      "label": "QATA",
      "writeLoc": 23,
      "writeType": "str",
      "placeholder": "e.g. ability place cube/cone, defence, penalties, speed"
    }
  ],
  "start": [
    {
      "label": "Scout ID",
      "writeLoc": 24,
      "writeType": "strBegin",
      "placeholder": "your team # + your name"
    },
    {
      "label": "Team Number",
      "writeLoc": 25,
      "writeType": "strBegin",
      "placeholder": "# of the team you are scouting"
    },
    {
      "label": "Match Number",
      "writeLoc": 26,
      "writeType": "strBegin",
      "placeholder": "current match #"
    },
    {
      "label": "Team Position",
      "writeLoc": 27,
      "writeType": "strBegin",
      "placeholder": "1, 2, or 3"
    }
  ]
  
}

let dataValues = [false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,"","",""];
let dataLabels = [ "Mobility", "Auto High Cube", "Auto Mid Cube", "Auto Low Cube", "Auto High Cone", "Auto Mid Cone", "Auto Low Cone", "Auto Fumbled", "Auto Climb", "High Cube", "Mid Cube", "Low Cube",  "High Cone", "Mid Cone", "Low Cone", "Fumbled", "Climb", "Park","Defense Time", "Penalty Count", "Oof Time", "Climb QATA", "Link QATA", "QATA"];

// let tempFix = [{
//   "label": "Attempted Climb",
//   "writeLoc": 7,
//   "writeType": "bool"
// }]

let themes = {
  "mainStyleSheet": ["#000", "#999999", "#fff", "#f3f3f3", "#E54C38", "invert(0%) sepia(100%) saturate(7430%) hue-rotate(46deg) brightness(81%) contrast(114% opacity(50%))"],
// main, second, bg, highlight, 
"styleCarbon" : ["#eee", "#444", "#111", "#191919", "#da3333", "invert(100%) sepia(0%) saturate(6935%) hue-rotate(270deg) brightness(111%) contrast(87%) opacity(50%)"],
"styleMilkshake" : ["#000", "#999999", "#fff", "#f3f3f3", "#ffd1dc", "invert(0%) sepia(100%) saturate(7430%) hue-rotate(46deg) brightness(81%) contrast(114% opacity(50%))"],
"styleIceberg" : ["#212b43", "#62cfe6", "#f3fdff", "#ddeff3", "#e58c9d", "invert(16%) sepia(9%) saturate(2627%) hue-rotate(185deg) brightness(95%) contrast(96%) opacity(50%)"],
"styleLavender" : ["#54338e", "#9375c7", "#c4b2e3", "#e3daf2", "#e3daf2", "invert(11%) sepia(32%) saturate(6816%) hue-rotate(238deg) brightness(97%) contrast(99%) opacity(50%)"],
"styleHightide" : ["#094a58", "#00b6ae", "#fff", "#c1c1c1", "#3b3b3b", "invert(22%) sepia(51%) saturate(742%) hue-rotate(143deg) brightness(94%) contrast(96%) opacity(50%)"],
"styleEvergreen" : ["#edf5e1", "#05386b", "#5cdb95", "#8ee4af", "#379683", "invert(96%) sepia(9%) saturate(491%) hue-rotate(43deg) brightness(106%) contrast(92%) opacity(50%)"],
"styleOlivia" : ["#f2efed", "#deaf9d", "#1c1b1d", "#4e3e3e", "#bf616a", "invert(97%) sepia(47%) saturate(304%) hue-rotate(292deg) brightness(104%) contrast(90%) opacity(50%)"],
"style2077" : ["#e8e8e8", "#feff04", "#212121", "rgba(92,74,156,0.5)", "#da3333", "invert(100%) sepia(2%) saturate(421%) hue-rotate(168deg) brightness(115%) contrast(82%) opacity(50%)"],
"styleAlpine" : ["#d8dee9", "#617b94", "#242933", "#1b1f27", "#bf616a", "invert(92%) sepia(7%) saturate(277%) hue-rotate(180deg) brightness(97%) contrast(92%) opacity(50%)"],
"styleShadow" : ["#383e42", "#5e676e", "#010203", "#121212", "#e25303", "invert(22%) sepia(16%) saturate(303%) hue-rotate(161deg) brightness(95%) contrast(91%) opacity(50%)"]
}
export class Percentile {
    data;
    value;
    snapshot;

    constructor(data) {
        this.data = data;
        this.percentileObject = [];
        this.percentileObjectSorted = [];
    }

    convertRawToObject() {

        //percentile object recieves the keys
        this.percentileObject.push(Object.keys(Object.values(this.data[0])[0]))
        //iterating over each bot
        for (let i = 0; i < this.data.length; i++) {
            //gets all datapoint keys
            let keys = Object.keys(Object.values(this.data[i])[0])
            let robotAverage = []
            //uses datapoint keys to grab all values of those datapoints
            for (let j = 0; j < keys.length; j++) {
                let matches = Object.values(this.data[i])
                let total = 0;
                for (let k = 0; k < matches.length; k++) {
                    let data_value = matches[k][keys[j]]
                    if (data_value == "true") {
                        data_value = 1
                    } else if (data_value == "false") {
                        data_value = 0
                    } else if (!isNaN(Number(data_value))) {
                        data_value = Number(data_value);
                    } else if (isNaN(data_value)) {
                        //do nothing
                    }
                    total = total + data_value;

                }
                //averages the datapoints
                robotAverage.push(total / matches.length);
            }
            //pushes an array of all the averages of that robot
            this.percentileObject.push(robotAverage);

        }
        return (this);
    }
    processObjectData() {
        //processes additional data from existing datapoints, for example, auto points is processed from auto climb + auto objects placed
        this.percentileObject[0].push("Auto Points", "Tele Accuracy", "Tele Cones", "Tele Cubes", "Endgame Points")
        //iterates through each bot to figure out their processed data
        for(let i=1; i<this.percentileObject.length; i++){
            //calculates auto points
            let auto_climb = this.percentileObject[i][this.percentileObject[0].indexOf("Auto Climb")]
            let auto_h_cones = this.percentileObject[i][this.percentileObject[0].indexOf("Auto High Cone")]
            let auto_m_cones = this.percentileObject[i][this.percentileObject[0].indexOf("Auto Mid Cone")]
            let auto_l_cones = this.percentileObject[i][this.percentileObject[0].indexOf("Auto Low Cone")]
            let auto_h_cubes = this.percentileObject[i][this.percentileObject[0].indexOf("Auto High Cube")]
            let auto_m_cubes = this.percentileObject[i][this.percentileObject[0].indexOf("Auto Mid Cube")]
            let auto_l_cubes = this.percentileObject[i][this.percentileObject[0].indexOf("Auto Low Cube")]

            let auto_pts = auto_climb + auto_h_cones*6 + auto_m_cones*4 + auto_l_cones*3 + auto_h_cubes*6 + auto_m_cubes*4 + auto_l_cubes*3
            this.percentileObject[i].push(auto_pts)

            //calculates the accuracy, or how much the team fumbles
            let tele_h_cones = this.percentileObject[i][this.percentileObject[0].indexOf("High Cone")]
            let tele_m_cones = this.percentileObject[i][this.percentileObject[0].indexOf("Mid Cone")]
            let tele_l_cones = this.percentileObject[i][this.percentileObject[0].indexOf("Low Cone")]
            let tele_h_cubes = this.percentileObject[i][this.percentileObject[0].indexOf("High Cube")]
            let tele_m_cubes = this.percentileObject[i][this.percentileObject[0].indexOf("Mid Cube")]
            let tele_l_cubes = this.percentileObject[i][this.percentileObject[0].indexOf("Low Cube")]
            let tele_fumbled = this.percentileObject[i][this.percentileObject[0].indexOf("Fumbled")]
            let tele_acc = (tele_h_cones + tele_m_cones + tele_l_cones + tele_h_cubes + tele_m_cubes + tele_l_cubes)/(tele_h_cones + tele_m_cones + tele_l_cones + tele_h_cubes + tele_m_cubes + tele_l_cubes + tele_fumbled)
            this.percentileObject[i].push(tele_acc);

            //calculates amount of cones placed
            let tele_cones = (tele_h_cones + tele_m_cones + tele_l_cones);
            this.percentileObject[i].push(tele_cones);

            //calculates amount of cubes placed
            let tele_cubes = (tele_h_cubes + tele_m_cubes + tele_l_cubes);
            this.percentileObject[i].push(tele_cubes);

            //adds up climb and park points
            let endgame_climb = this.percentileObject[i][this.percentileObject[0].indexOf("Climb")]
            let endgame_park = this.percentileObject[i][this.percentileObject[0].indexOf("Park")]
            let endgame_pts = endgame_climb + endgame_park*2;
            this.percentileObject[i].push(endgame_pts);

        }   
        return this;
    }
    sortPercentile() {
        let keys = this.percentileObject[0];
        for(let i=0; i<keys.length; i++){
            let sorted_arr = []
            for(let j=1; j<this.percentileObject.length-1; j++){
                sorted_arr.push(this.percentileObject[j][i])
            }
            sorted_arr.sort(function(a, b) {
                return a - b;
            });
            this.percentileObjectSorted[this.percentileObject[0][i]] = sorted_arr
        }
        console.log(this.percentileObjectSorted);
        return this;
    }
    findAverageOfTeam(team){
        let key = this.percentileObject[0].indexOf("Team")
        for(let i=1; i<this.percentileObject.length-1; i++){
            if(this.percentileObject[i][key] == team){
                return this.percentileObject[i];
            }
        }
        alert("Team not found for average")
        return "Error: team not found"
    }
    findPercentileOf(val, name, sorted_data) {
        for (let i = 0; i < this.percentileObjectSorted[name].length; i++) {
            if (this.percentileObjectSorted[name][i] > val) {
                return (i / this.percentileObjectSorted[name].length);
            }
        }
    }
    addNewMatchToPercentile(snapshot) {

    }

}
import { ref, remove, set, child } from "firebase/database";
export class Encoder{
    constructor(){
        this.rawDataToEncode = [];
        this.formattedJsonData = {}
    }

    rawDataToFormattedData(arr, labels){
        this.rawDataToEncode = arr;
        for(let i=0;i<labels.length;i++){
            this.formattedJsonData[labels[i]] = this.rawDataToEncode[i];
        }
        return this.formattedJsonData;
        
    }

    uploadFormattedData(database, data, dataStructure){
        try{
            let setPath = dataStructure.getPath("Matches");
            remove(ref(database, setPath + data["Match"] + "-" + data["Position"] + "-" + data["Scout"] + "/"), data)
            set(child(ref(database, setPath), (data["Match"] + "-" + data["Position"] + "-" + data["Scout"] + "/")), data)
            
            //setPath = dataStructure.getPath("Robots");
            
            //if (data["Match"][0] == "0"){
            //    data["Match"] = data["Match"].replace("0","")
            //}
            //set(child(ref(database, setPath + data["Team"] + '/'), data["Match"]), data)

            
            return true;
        }
        catch(err){
          return err.message;
          }

    }


}
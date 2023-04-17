export class AddTable{
    constructor(){
        this.row;
        this.cell;
        this.cellText;
        this.cellP;
        
        this.table = document.createElement("table");
        this.tHead = document.createElement("thead");
        this.tableBody = document.createElement("tbody");
        this.hRow = document.createElement("tr");

        this.table.appendChild(this.tHead)
        this.tHead.appendChild(this.hRow)
        this.table.appendChild(this.tableBody);
    }
    getTable(){
        return this.table;
    }
    getTableBody(){
        return this.tableBody;
    }
    getHeader(){
        return this.tHead;
    }
    createRow(){
        return document.createElement("tr")
    }
    addHeader(rowHeadNames){
        for(var i=0; i<rowHeadNames.length; i++){
            const headCell = document.createElement("th");
            this.hRow.appendChild(headCell);
            headCell.innerHTML = rowHeadNames[i]
        }
    }
    addCell(data, row, header=false){
        this.cell = document.createElement("td");
        if (header) this.cell = document.createElement("th");
        this.cellText = document.createElement("div");
        this.cellP = document.createElement("p");

        this.cellP.innerHTML = data;
  
        row.appendChild(this.cell);
        this.cell.appendChild(this.cellText);
        this.cellText.appendChild(this.cellP);
    }
    addTextCell(data, row, box_id, input_id){
        this.cell = document.createElement("td");
        this.cellText = document.createElement("div");
        if(box_id){
            this.cell.setAttribute("class", box_id)
        }
        this.txtBox = document.createElement("INPUT");
        this.txtBox.setAttribute("type", "text");
        this.txtBox.setAttribute("value", data);
        if(input_id){
            this.txtBox.setAttribute("class", input_id)
        }
  
        row.appendChild(this.cell);
        this.cell.appendChild(this.cellText);
        this.cellText.appendChild(this.txtBox);

        return this.txtBox;
    }
    addCells(rowHeadNames, data, row){
        //needs to take data and return row that is passed onto something else
        for(var i=0;i<rowHeadNames.length;i++){
            this.cell = document.createElement("td");
            this.cellText = document.createElement("div");
            this.cellP = document.createElement("p");

            this.cellP.innerHTML = data[rowHeadNames[i]];
  
            row.appendChild(this.cell);
            this.cell.appendChild(this.cellText);
            this.cellText.appendChild(this.cellP);
            //console.log(data[color[i]][j+1][headNames[g]])
        }
        return row;
    }
    setID(id) {
        this.table.setAttribute("id", id);
    }
    setHeaderID(id) {
        this.tHead.setAttribute("id", id);
    }
    setBodyID(id) {
        this.tableBody.setAttribute("id", id);
    }
}
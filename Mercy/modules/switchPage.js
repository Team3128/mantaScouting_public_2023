export class SwitchPage {
    constructor(){
        this.currentState = "upload"
        this.hidePanelClass = "";
        this.showPanelClass = "";   
        this.elem = document.getElementById("nav");
        this.navBar = document.getElementById("nav-bar");
        this.toggleState = true;
    }
    hidePanel(){
        this.navBar.classList.add("hideNavBar")

        setTimeout(() => {
            this.elem.style = "display: none";
            this.navBar.classList.remove("hideNavBar")
        }, 300);
    }
    showPanel(){
        this.navBar.classList.add("showNavBar")
        this.elem.style = "display: grid";

        setTimeout(() => {
            this.navBar.classList.remove("showNavBar")
        }, 300);
    }
    switchEvent(index){
        try{
            if(index == "back"){
                this.hidePanel()
                this.toggleState = false;
                return;
            }
            document.getElementById(this.currentState).style = "display: none";
            document.getElementById(this.currentState).classList.add("hide");
            document.getElementById(index).classList.remove("hide");
            document.getElementById(index).style = "display: grid";
            setTimeout(()=>{
                this.currentState = index;
                this.hidePanel()
                this.toggleState = false;
            }, 50)
        }
        catch(err){
            console.error(err)
            alert("Err switching page: Page id or page name does not exist")
        }
    }
}
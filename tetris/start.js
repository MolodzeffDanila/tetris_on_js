function start(){
    let input=document.getElementById("input1");
    let player_name = input.value;
    localStorage.setItem("player_name",player_name);
}

function read(){
    if(localStorage.hasOwnProperty("player_name")) {
        let name = localStorage.getItem("player_name");
        let input = document.getElementById("input1");
        input.value = name;
    }
    ShowRecords();
}

function ShowRecords(){
    let record = [];
    for(let key in localStorage){
        if(localStorage.getItem(key)!=null && key!=="player_name"){
            record.push([key,parseInt(localStorage.getItem(key))]);
        }
    }
    //localStorage.removeItem("player_name");
    record.sort(cmp);
    for(let i=0;i<10;i++){
        if(i>record.length-1){
            break;
        }
        let tmp_record = document.getElementById((i+1).toString());
        tmp_record.innerHTML += record[i][0] + ": " + record[i][1];
    }
}

function cmp(a,b){
    if(a[1]>b[1]){
        return -1;
    }
    if(a[1]<b[1]){
        return 1;
    }
    return 0;
}
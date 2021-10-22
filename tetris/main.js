class Game{
    constructor() {
        this.name = localStorage.getItem("player_name");
        this.score = 0; //счет игрока
        this.level = 1; //текущий уровень
        this.field =[];     //логическая матрица поля (здесь хранится инфа об уже закрашенных клетках и их цвете)
        this.field_height=16;
        this.field_width=10;
        this.current_figure = new Figure(); //текущая фигура на поле
        this.next_figure = new Figure();    //следующая фигура
        this.is_lost = false;   //флаг поражения
        this.canvas = document.getElementById("game_field"); //canvas элемент игрового поля
        this.ctx = this.canvas.getContext('2d');
        this.delay=500;
    }
    Read_field_coeff(){
        this.cell_width = this.canvas.width/10;
    }

    Rewrite_score(){
        let score_ = document.getElementById("score");
        score_.innerHTML = "Счёт: " + this.score;
    }

    Generate_field(){   //заполнение поля нулями
        for(let i=0;i<this.field_height;i++){
            this.field[i] = [];
            for(let j=0;j<this.field_width;j++){
                this.field[i][j]=0;
            }
        }

    }

    Main_method(){  //метод, подготавливающий игру к старту
        this.Generate_field();
        this.Read_field_coeff();
        this.Change_level();
        this.current_figure.Generate_figure(this.field_width);
        this.next_figure.Generate_figure(this.field_width);
        this.Draw_figure();
        this.Draw_next_figure();

        document.addEventListener('keydown',ev => {
            if(ev.code === "ArrowRight"){
                this.Move_figure_right();
                this.Draw_figure();
            }
            if(ev.code === "ArrowLeft"){
                this.Move_figure_left();
                this.Draw_figure();
            }
            if(ev.code === "ArrowDown"){
                while (this.Is_possible_to_move_down()){
                    this.Move_figure_down();
                }
                this.Draw_figure();
            }
            if(ev.code === "ArrowUp"){
                this.Rotate_figure();
                this.Draw_figure();
            }
        });
        setInterval(() => this.play(),this.delay); //Движение фигурки вниз
    }

    Draw_next_figure(){     //отрисовка фигурки на вспомогательном поле
        const canvas_next_figure = document.getElementById("next_figure");
        let ctx_next_figure = canvas_next_figure.getContext('2d');
        ctx_next_figure.clearRect(0, 0, canvas_next_figure.width, canvas_next_figure.height);
        for(let i=0;i<4;i++){
            for(let j=0;j<4;j++){
                if(this.next_figure.figure[i][j]===1){
                    ctx_next_figure.strokeStyle = "black";
                    ctx_next_figure.fillStyle = colors[this.next_figure.color_id];
                    ctx_next_figure.fillRect(30+j*this.cell_width,30+i*this.cell_width,this.cell_width,this.cell_width);
                    ctx_next_figure.strokeRect(30+j*this.cell_width,30+i*this.cell_width,this.cell_width,this.cell_width);
                }
            }
        }
    }

    Draw_figure(){      //отрисовка фигурки на игровом поле
        for(let i=0;i<4;i++){
            for(let j=0;j<4;j++){
                if(this.current_figure.figure[i][j]===1){
                    this.ctx.strokeStyle = "black";
                    this.ctx.fillStyle = colors[this.current_figure.color_id];
                    this.ctx.fillRect((j+this.current_figure.coord_x)*this.cell_width,(i+this.current_figure.coord_y)*this.cell_width,this.cell_width,this.cell_width);
                    this.ctx.strokeRect((j+this.current_figure.coord_x)*this.cell_width,(i+this.current_figure.coord_y)*this.cell_width,this.cell_width,this.cell_width);
                }
            }
        }
    }

    Record_the_figure(){    //запись зафиксированной фигурки на логическом поле
        for(let i=this.current_figure.coord_y;i<this.current_figure.coord_y+4;i++){
            for(let j=this.current_figure.coord_x;j<this.current_figure.coord_x+4;j++){
                if(i<this.field_height){
                    if(this.field[i][j]===0) {
                        this.field[i][j] = this.current_figure.figure[i - this.current_figure.coord_y][j - this.current_figure.coord_x] * (this.current_figure.color_id + 1);
                    }
                }
            }
        }
        this.Clear_lowest_line();
        this.Draw_field();
    }

    Draw_field(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        for(let i=0;i<this.field_height;i++) {
            for (let j = 0; j < this.field_width; j++) {
                if(this.field[i][j]>0){
                    this.ctx.strokeStyle = "black";
                    this.ctx.fillStyle = colors[this.field[i][j]-1];
                    this.ctx.fillRect(j * this.cell_width, i * this.cell_width, this.cell_width, this.cell_width);
                    this.ctx.strokeRect(j * this.cell_width, i * this.cell_width, this.cell_width, this.cell_width);
                }
            }
        }
    }

    Change_level(){
        if(this.score>this.delay*this.level*2 && this.delay>100){
            console.log(this.delay);
            this.level++;
            this.delay-=50;
            setInterval(() => this.play(),this.delay);
        }
        let level_ = document.getElementById("level");
        level_.innerHTML = "Уровень: " + this.level;
    }

    Clear_lowest_line(){
        for(let i = this.field_height - 1; i >= 0;i--) {
            let count=1;
            for (let a = 0; a < this.field_width; a++) {
                count *= this.field[i][a];
            }
            if(count>0){
                for(let y=i;y>=1;y--){
                    for(let x=0;x<this.field_width;x++){
                        this.field[y][x]=this.field[y-1][x];
                    }
                }
                this.score+=this.level*100;
                this.Clear_lowest_line();
                this.Change_level();
            }
        }
        this.Rewrite_score();
    }

    Is_possible_to_move_down(){     //проверка на возможность движения вниз
        let shifted_vector_id = 3 - (this.current_figure.coord_y+3-15);
        if(shifted_vector_id<4){        //проверка на выход за поле
            for(let i=0;i<4;i++){
                if(this.current_figure.figure[shifted_vector_id][i]>0){
                    return false;
                }
            }
        }
        for(let i=0;i<4;i++){   //проверка на наложение с уже припаркованными фигурами
            for(let j=0;j<4;j++){
                if(this.current_figure.figure[i][j]>0 && this.field[i+this.current_figure.coord_y+1][j+this.current_figure.coord_x]>0){
                    return false;
                }
            }
        }
        return true;
    }

    Is_possible_to_move_left(){     //проверка на выход за поле при движении влево
        if(this.current_figure.coord_x <=0){
            for(let i=0;i<4;i++){
                if(this.current_figure.figure[i][this.current_figure.coord_x*(-1)]>0){
                    return false;
                }
            }
        }
        for(let i=0;i<4;i++){
            for(let j=0;j<4;j++){
                if(this.current_figure.figure[i][j]>0 && this.field[i+this.current_figure.coord_y][j+this.current_figure.coord_x-1]>0){
                    return false;
                }
            }
        }
        return true;
    }

    Is_possible_to_move_right(){    //проверка за выход за поле при движении вправо
        let shifted_vector_id = 3 - (this.current_figure.coord_x+3-9);
        if(shifted_vector_id<4){
            for(let i=0;i<4;i++){
                if(this.current_figure.figure[i][shifted_vector_id]>0){
                    return false;
                }
            }
        }
        for(let i=0;i<4;i++){
            for(let j=0;j<4;j++){
                if(this.current_figure.figure[i][j]>0 && this.field[i+this.current_figure.coord_y][j+this.current_figure.coord_x+1]>0){
                    return false;
                }
            }
        }
        return true;
    }

    play(){
        if(this.Is_possible_to_move_down()) {
            this.Move_figure_down();
            this.Draw_figure();
        }else{
            this.Record_the_figure();
            this.Copy_the_figure();
            this.Is_game_over();
            this.next_figure.Generate_figure(this.field_width);
            this.Draw_next_figure();
        }
    }

    Is_game_over(){
        if(!this.Is_possible_to_move_down()){
            window.location.href = "index.html";
            window.alert("Game over!");
            this.Write_records();
        }
    }

    Copy_the_figure(){
        this.current_figure.coord_y = this.next_figure.coord_y;
        this.current_figure.coord_x = this.next_figure.coord_x;
        this.current_figure.figure = this.next_figure.figure;
        this.current_figure.color_id = this.next_figure.color_id;
    }

    Clear_figure(){
        for(let i=0;i<4;i++){
            for(let j=0;j<4;j++){
                if(this.current_figure.figure[i][j]===1){
                    this.ctx.clearRect((j+this.current_figure.coord_x)*this.cell_width-1,(i+this.current_figure.coord_y)*this.cell_width-1,this.cell_width+2,this.cell_width+2);
                }
            }
        }
    }

    Is_possible_to_rotate(){
        let rotated = this.current_figure.Rotate();
        //проверка у правого бортика
        for(let i=0;i<4;i++){
            if(rotated[i][3]>0 && this.current_figure.coord_x+4>this.field_width){
                return false;
            }
        }
        //проверка у левого бортика
        for(let i=0;i<4;i++){
            for(let j=0;j<this.current_figure.coord_x*(-1);j++){
                if(rotated[i][j]>0){
                    return false;
                }
            }
        }
        //проверка у низа
        let shifted_vector_id = 3 - (this.current_figure.coord_y+3-15);
        if(shifted_vector_id<4){        //проверка на выход за поле
            for(let i=0;i<4;i++){
                if(rotated[shifted_vector_id][i]>0){
                    return false;
                }
            }
        }
        //проверка на наложение с припаркованными фигурами
        for(let i=0;i<4;i++){
            for(let j=0;j<4;j++){
                if(rotated[i][j]>0 && this.field[i+this.current_figure.coord_y][j+this.current_figure.coord_x+1]>0){
                    return false;
                }
            }
        }
        return true;
    }

    Rotate_figure(){
        if(this.Is_possible_to_rotate()){
            this.Clear_figure()
            this.current_figure.figure = this.current_figure.Rotate();
        }
    }

    Move_figure_down(){
        this.Clear_figure();
        this.current_figure.coord_y+=1;
    }

    Move_figure_left(){
        if(this.Is_possible_to_move_left()){
            for(let i=0;i<4;i++){
                for(let j=3;j>=0;j--){
                    if(this.current_figure.figure[i][j]===1){
                        this.ctx.clearRect((j+this.current_figure.coord_x)*this.cell_width-1,(i+this.current_figure.coord_y)*this.cell_width-1,this.cell_width+2,this.cell_width+2);
                    }
                }
            }
            this.current_figure.coord_x-=1;
        }
    }

    Move_figure_right(){
        if(this.Is_possible_to_move_right()){
            this.Clear_figure();
            this.current_figure.coord_x+=1;
        }
    }

    Write_records(){
        if(localStorage.hasOwnProperty(this.name)){
            if(this.score > parseInt(localStorage.getItem(this.name))){
                console.log(parseInt(localStorage.getItem(this.name)));
                localStorage.setItem(this.name,this.score);
            }
        }else{
            localStorage.setItem(this.name,this.score);
        }
    }
}

class Figure{
    constructor() {
        this.figure = [];
        this.color_id = null;
    }
    Generate_figure(field_w){
        this.coord_y = 0;
        this.color_id = Math.floor(Math.random() * 5);
        let figure_id = Math.floor(Math.random() * figures.length);
        this.figure = figures[figure_id];
        switch (figure_id){
            case 0:
                this.coord_x = Math.floor(Math.random() * (field_w-3));
                break;
            case 1:
                this.coord_y = -1;
                this.coord_x = Math.floor(Math.random() * (field_w-2));
                break;
            default:
                this.coord_x = Math.floor(Math.random() * (field_w-2));
                break;
        }
    }

    Rotate(){
        let result = [];
        for (let i = this.figure.length - 1; i >= 0; i--) {
            for (let j = 0; j < this.figure[i].length; j++) {
                if (!result[j]) {
                    result[j] = [];
                }
                result[j].push(this.figure[i][j]);
            }
        }
        return result;
    }
}


function main(){
    let name = document.getElementById("player_name");
    name.innerHTML += " " + localStorage.player_name;
    game.Rewrite_score();
    game.Main_method();
}

figures =  [[[1,1,1,1],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]],
       [[0,0,0,0],
        [0,1,1,0],
        [0,1,1,0],
        [0,0,0,0]],
       [[0,0,1,0],
        [1,1,1,0],
        [0,0,0,0],
        [0,0,0,0]],
       [[1,0,0,0],
        [1,1,1,0],
        [0,0,0,0],
        [0,0,0,0]],
       [[0,1,0,0],
        [1,1,1,0],
        [0,0,0,0],
        [0,0,0,0]],
       [[1,1,0,0],
        [0,1,1,0],
        [0,0,0,0],
        [0,0,0,0]],
       [[0,1,1,0],
        [1,1,0,0],
        [0,0,0,0],
        [0,0,0,0]]
]

colors = ["green","blue","orange","yellow","red","purple"]

var game = new Game();
main();
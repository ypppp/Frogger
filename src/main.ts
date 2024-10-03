import "./style.css";
import { fromEvent, interval, merge } from 'rxjs'; 
import { map, filter, scan } from 'rxjs/operators';

function main() {
  /**
   * Inside this function you will use the classes and functions from rx.js
   * to add visuals to the svg element in pong.html, animate them, and make them interactive.
   *
   * Study and complete the tasks in observable examples first to get ideas.
   *
   * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
   *
   * You will be marked on your functional programming style
   * as well as the functionality that you implement.
   *
   * Document your code!
   */

  /**
   * This is the view for your game to add and update your game elements.
   */


  const svg = document.querySelector("#svgCanvas") as SVGElement & HTMLElement;

// initialising types
  type Key = 'w' | 'a' | 's' | 'd'
  type Event = 'keydown' | 'keyup'
  type ViewType = 'frog' | 'car' | 'log' | 'river' | "target"

// initialising classes
  class Tick { constructor(public readonly elapsed:number) {} }
  class Move { constructor(public readonly direction:number) {} }
  class MoveUp { constructor(public readonly direction:number) {} }
  class MoveDown { constructor(public readonly direction:number) {} }


// a function that takes care of the time for updating the new states
  const gameClock = interval(10).pipe(map(elapsed=>new Tick(elapsed)))

// functions that take into account of the movements
  const keyObservable = <T>(e:Event, k:Key, result:()=>T)=>
    fromEvent<KeyboardEvent>(document,e)
      .pipe(
        filter(({key})=>key === k),
        filter(({repeat})=>!repeat),
        map(result))

  const Leftmove = keyObservable('keydown','a',()=>new Move(-40))
  const Rightmove = keyObservable('keydown','d',()=>new Move(40))
  const Upmove = keyObservable('keydown','w',()=>new MoveUp(-50))
  const Downmove = keyObservable('keydown','s',()=>new MoveDown(50))


// type declaration
  type Rect = Readonly<{
    id:string,
    viewType: ViewType,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    speed: number,
  }>

  type Circle = Readonly<{
    id:string,
    viewType: ViewType,
    cx: number,
    cy: number,
    r: number,
    fill: string,
  }>

  type State = Readonly<{
    time:number,
    frog:Circle,
    car:ReadonlyArray<Rect>,
    log:ReadonlyArray<Rect>,
    river: ReadonlyArray<Rect>,
    target: ReadonlyArray<Rect>,
    objCount:number,
    gameOver:boolean,
    score: number,
    win: boolean,
  }>
// a function used to create rectangles
  const createRect = (id: String)=> (viewType: ViewType)=> (x:number)=> (y:number)=> (width:number)=> (height:number)=> (fill:string)=> (speed:number)=>
  <Rect>{
    id:id,
    viewType: viewType,
    x: x,
    y: y,
    width: width,
    height: height,
    fill: fill,
    speed: speed,
  }
// a function that is used to handle collisions
 // insipred from https://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle
  const handleCollisions = (s:State) => {
    function RectCircleColliding(s:State, c:Rect){
      const distX = Math.abs(s.frog.cx - c.x-c.width/2);
      const distY = Math.abs(s.frog.cy - c.y-c.height/2);

      if (distX > (c.width/2 + s.frog.r)) { return false; }
      if (distY > (c.height/2 + s.frog.r)) { return false; }

      if (distX <= (c.width/2)) { return true; } 
      if (distY <= (c.height/2)) { return true; }

      const dx=distX-c.width/2;
      const dy=distY-c.height/2;
      return (dx*dx+dy*dy<=(s.frog.r*s.frog.r));
  }
  // filter used in these functions to check if the collision happen, the length increases above one and any number above one is true in boolean.
  const carsCollided = s.car.filter(c=>RectCircleColliding(s,c)).length > 0
  const logsCollided = s.log.filter(l=>RectCircleColliding(s,l)).length > 0
  const riverCollided = s.river.filter(a=>RectCircleColliding(s,a)).length > 0
  const targetCollided = s.target.filter(t=>RectCircleColliding(s,t)).length > 0

  if (carsCollided){
    return {
      ...initialState,
      gameOver: true

    }
  }

  if (targetCollided){
    return {
      ...s,
        frog: {...s.frog,cx:300,cy:575},
        score: s.score + 40,
        win: true,
    }
  }


  if ((s.frog.cy < 250 || s.frog.cy > 0)) {
    const logs = s.log.filter(t=>RectCircleColliding(s,t))
    if(logsCollided){
      if (logs[0].speed > 0){
        return {
          ...s,
          frog: {...s.frog, cx:s.frog.cx + logs[0].speed}
        }
      }
      if (logs[0].speed < 0){
        return {
          ...s,
          frog: {...s.frog, cx:s.frog.cx + logs[0].speed}
        }
      }
    }
  
    if (riverCollided || s.frog.cx > (s.frog.r)/2 + 600 || s.frog.cx < 0 - (s.frog.r)/2 ){
      return {
        ...s,
        frog: {...s.frog,cx:300,cy:575},
        gameOver: true
      }
    }
    else{
      return {
        ...s
      }
    }
    }

    else{
      return {
        ...s
      }
    }
  


    

  }

// function that used to create frog
  function createfrog():Circle {
    return {
      id:"frog",
      viewType: 'frog',
      cx: 300,
      cy: 575,
      r: 20,
      fill: "green",
    }
  }

// a function to write the starting state of the game 
  const initialState: State = {
    time:0,
    frog:createfrog(),
    car:[createRect("car1")("car")(0)(500)(50)(50)("green")(1),createRect("car2")("car")(200)(500)(50)(50)("green")(1),createRect("car3")("car")(400)(500)(50)(50)("green")(1),createRect("car4")("car")(100)(450)(50)(50)("green")(-1.5),createRect("car5")("car")(450)(450)(50)(50)("green")(-1.5),createRect("car6")("car")(50)(400)(50)(50)("green")(2),createRect("car7")("car")(258)(400)(50)(50)("green")(2),createRect("car8")("car")(532)(350)(50)(50)("green")(-1.5),createRect("car9")("car")(121)(350)(50)(50)("green")(-1.5),createRect("car10")("car")(35)(350)(50)(50)("green")(-1.5)],
    log:[createRect("log1")("log")(0)(50)(100)(50)("brown")(-1.5),createRect("log2")("log")(400)(50)(100)(50)("brown")(-1.5),createRect("log3")("log")(50)(100)(100)(50)("brown")(1),createRect("log4")("log")(300)(100)(100)(50)("brown")(1),createRect("log5")("log")(234)(150)(100)(50)("brown")(-0.5),createRect("log6")("log")(456)(150)(100)(50)("brown")(-0.5),createRect("log7")("log")(324)(200)(100)(50)("brown")(1),createRect("log8")("log")(196)(200)(100)(50)("brown")(1),createRect("log9")("log")(10)(250)(100)(50)("brown")(-1.5),createRect("log10")("log")(500)(250)(100)(50)("brown")(-1.5)],
    river: [createRect("river1")("river")(0)(50)(600)(50)("none")(0),createRect("river2")("river")(0)(100)(600)(50)("none")(0),createRect("river3")("river")(0)(150)(600)(50)("none")(0),createRect("river4")("river")(0)(200)(600)(50)("none")(0),createRect("river5")("river")(0)(250)(600)(50)("none")(0),createRect("river6")("river")(0)(0)(600)(50)("none")(0)],
    target: [createRect("target1")("target")(20)(0)(60)(50)("purple")(0),createRect("target2")("target")(140)(0)(60)(50)("purple")(0),createRect("target3")("target")(260)(0)(60)(50)("purple")(0),createRect("target4")("target")(380)(0)(60)(50)("purple")(0),createRect("target5")("target")(500)(0)(60)(50)("purple")(0)],
    objCount:0,
    gameOver:false,
    score: 0,
    win: false,
  }

// a function that takes into account of the movement
  const moveBody = (o:Rect) => {
    if(o.x > 600){
      return <Rect>{
        ...o,
        x: 0
      }
    }
    else if(o.x < 0 -o.width){
      return <Rect>{
        ...o,
        x: 600
      }
    } 
    else{
      return <Rect>{
        ...o,
        x: o.x + o.speed
      }
    }
  }
// a function that takes cares of the interval tick
  const tick = (s:State,elapsed:number) => {
    return handleCollisions({...s,
      car:s.car.map(moveBody),
      log:s.log.map(moveBody)
    })

  }

  // a function used to detect the movement for the frog and updated by using tick to a new game state
  const reduceState = (s:State, e:Move|Tick|MoveUp|MoveDown)=>
  e instanceof Move ? {...s,
    frog: {...s.frog, cx:s.frog.cx+ e.direction}
  }:
  e instanceof MoveUp ? {...s,
    frog: {...s.frog, cy:s.frog.cy+ e.direction},
    score: s.score + 10
  }:
  e instanceof MoveDown ? {...s,
    frog: {...s.frog, cy:s.frog.cy+ e.direction},
    score: s.score - 10
  }:
  tick(s,e.elapsed)

// function used to update the svg scene
  function updateView(s: State) {
    const 
      svg = document.getElementById("svgCanvas")!,
      score = document.getElementById("score")!,
      updateBodyView = (b:Circle | Rect) => {
        function createBodyView() {
          if (b.id === "frog") {
          const v = document.createElementNS(svg.namespaceURI, "circle")!;
          Object.entries(b).forEach(([key, val]) => v.setAttribute(key, String(val)));
          svg.appendChild(v)
          return v;
          }
          else {
          const v = document.createElementNS(svg.namespaceURI, "rect")!;
          Object.entries(b).forEach(([key, val]) => v.setAttribute(key, String(val)));
          svg.appendChild(v)
          return v;
          }

        }
        const v = document.getElementById(b.id) || createBodyView();
        Object.entries(b).forEach(([key, val]) => v.setAttribute(key, String(val)));
      };
      if(s.gameOver) {
        subscription.unsubscribe();
        const v = document.createElementNS(svg.namespaceURI, "text")!;
        v.setAttribute("x","150")
        v.setAttribute("y", "350")
        v.textContent = "Game Over";
        v.setAttribute("font-family", "sans-serif")
        v.setAttribute("font-size", "50")
        svg.appendChild(v);
      }
      if(s.win) {
        subscription.unsubscribe();
        const v = document.createElementNS(svg.namespaceURI, "text")!;
        v.setAttribute("x","10")
        v.setAttribute("y", "350")
        v.textContent = "Congratulations, You win!";
        v.setAttribute("font-family", "sans-serif")
        v.setAttribute("font-size", "50")
        svg.appendChild(v);
      }
 

    
    s.car.forEach(updateBodyView)
    s.log.forEach(updateBodyView)
    s.river.forEach(updateBodyView)
    s.target.forEach(updateBodyView)
    updateBodyView(s.frog)

    score.innerHTML = "Score " + String(s.score)
  }

  const subscription =
    merge(gameClock,
      Leftmove, Rightmove, Downmove, Upmove)
    .pipe(
      scan(reduceState, initialState))
    .subscribe(updateView)


  







  
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}

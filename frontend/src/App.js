import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import './style.css'

const socket = io("http://127.0.0.1:5000/terminal")

socket.on("connect", () =>{
  console.log("connected")
})

function App() {
  const [data, setData] = useState(null);
  
  const [terminalSelected, setTerminalSelected] = useState(false); // bool type checks if the terminal is clicked on and a function to set the variable
  const [offset, setOffset] = useState([0, 0]); // same here but offset number

  const [visible, setVisible] = useState(true);

  useEffect(() =>{  // the effect that moves stuff around on the page only works when there is a position attribute added to the moving thing
    function mouseEvent(event){
      const header = document.querySelector(".header");
      const terminal = document.querySelector(".terminal");
      const close = document.getElementById("close");
      const tag = document.querySelector(".tag")
      const div = document.getElementById("terminal-div");
      if (event.type === "mousedown"){

        if (event.target.parentNode === close){
          tag.style.top = `${header.offsetTop}px`
          tag.classList.add("visible");
          div.classList.remove("visible");
        }
        else if (event.target.parentNode === tag){
          tag.classList.remove("visible");
          setVisible(true);
        }
      }

      if (div){
        if (div.getBoundingClientRect().left > 800) setVisible(false)
        if (visible) div.classList.add("visible");
      }
    }
    
    window.addEventListener("mousedown", mouseEvent);
    window.addEventListener("mousemove", mouseEvent);
    window.addEventListener("mouseup", mouseEvent);
    return () => {
      window.removeEventListener("mousedown", mouseEvent);
      window.removeEventListener("mouseup", mouseEvent);
      window.removeEventListener("mousemove", mouseEvent);
    }
  }, [terminalSelected, offset])

  // rendering text data from server
  useEffect(() =>{
      socket.on("send", (data) =>{
        console.log(data)
        fetch("/terminal", {
          method: "GET",
        })
        .then((response) => response.json(""))
        .then((data) => setData(data))
        .catch(error => console.error("Error:", error));  
      });

  }, [])

  // recieving api data from flask
  function post(event) {
    event.preventDefault(); // stops page reload
    const input = document.getElementById("command");
    console.log("posting")

    // fetches api data by going into the post method and giving the content type headers so flask knows to get the json that i sent with the body
    fetch("/terminal", {
      method: "POST",
      headers : {'Content-Type' : 'application/json'}, // must have so flask knows it be json
      body: JSON.stringify(input.value)
    })
    .then((response) => response.json())
    .then(data => setData(data))
    .catch(error => console.error("Error:", error));

    document.querySelector("form").reset();
  }

  // making terminal form always at the bottom
  useEffect(() =>{
    const terminal = document.querySelector(".terminal");
    if (terminal)
      if (terminal.scrollHeight > 500)
        terminal.scroll(0, terminal.scrollHeight);
  })

  return (
    // html stuff
    <>
      <div style={{"display" : "flex", "height" : "100%"}}>
        <div className='side-bar'>
          <div className='icon-container'>
            <h1 style={{"textDecoration" : "underline dashed", "textAlign" : "center", "textUnderlineOffset" : "7px", "userSelect" : "none"}}>Aidan Agovich-Lee</h1>
            <h2>About</h2>
            <h2>Technologies</h2>
            <h2>Experience</h2>
            <h2>Terminal</h2>
            <h2>Projects</h2>
          </div>
        </div>

        <div className='cards-div'>
          <div className='tag visible animated'>
            <i className='material-icons' style={{color: "white", transform: "scaleX(2) scaleY(5)"}}>keyboard_arrow_left</i>
          </div>

          <div className='card' style={{"display" : "flex", "flexDirection" : "column"}}>
            <h1 style={{"textDecoration" : "underline dashed", "textUnderlineOffset" : "7px", "fontSize" : "35px", "marginBottom" : "2px"}}>Aidan Agovich-lee</h1>
            <p style={{"fontSize": "20px", "margin" : "7px", "color" : "grey"}}>Glasgow, Scotland</p>
            <p>I am a developer from Glasgow, working for more than 6 years on projects for myself and others. I create full-stack websites
              , video games and other pieces of software. This site is made using React and Flask for the onsite terminal.
            </p>
          </div>
          
          {visible && 
            <div className='card visible animated' id="terminal-div">
              <div className='container'>
                <div className='header window visible'>
                      <i className='fa fa-terminal' style={{fontSize: "25px", marginLeft: "5px"}}></i>
                      <h1 style={{fontSize: "20px", marginTop: "2px", marginRight: "5px", fontWeight: "400", color: "black"}}>Terminal 1</h1>
                      <div id="close">
                        <i className='material-icons' style={{fontSize: "27px", fontWeight: "200"}}>close</i>
                      </div>
                  </div>
                <div className='terminal window visible'>
                  {data ? (
                    data.message.map((message, index) =>
                      <p key={index} style={{"fontFamily" : "'Courier New', Courier, monospace"}}>{message}</p>
                    )
                  ):(
                    <p></p>
                  )}
                  <form style={{marginTop: "auto", marginBottom: "5px"}} method='post' type='submit' onSubmit={post}>
                    <input name='command' id='command'></input>
                  </form>
                </div>
              </div>
            </div>
          }

          <div className='card'>
            <h1>Technologies I Use</h1>
            <div style={{"display" : "flex", "justifyContent" : "space-around"}}>

              <div className='tech-list'>
                <h3><i className="fa fa-laptop" style={{"marginRight" : "4px"}}></i>Languages</h3>

                <div className='row'>
                  <h4 className='tech'>Python</h4>
                  <h4 className='tech'>JavaScript</h4>
                  <h4 className='tech'>C</h4>
                </div>

                <div className='row'>
                  <h4 className='tech'>
                  TypeScript</h4>
                </div>
              </div>

              <div className='tech-list'>
                <h3><i className='fa fa-code' style={{"marginRight" : "4px"}}></i>
                Web Development</h3>

                <div className='row'>
                  <h4 className='tech'>HTML</h4>
                  <h4 className='tech'>CSS</h4>
                  <h4 className='tech'>React</h4>
                  <h4 className='tech'>Flask</h4>
                </div>

                <div className='row'>
                  <h4 className='tech'>Bootstrap</h4>
                  <h4 className='tech'>NodeJS</h4>
                  <h4 className='tech'>ExpressJS</h4>
                </div>

                <div className='row'>
                <h4 className='tech'>WordPress</h4>
                </div>

              </div>

              <div className='tech-list'>
                <h3><i className='fa fa-database' style={{"marginRight" : "6px"}}></i>Databases</h3>

                <div className='row'>
                  <h4 className='tech'>SQL</h4>
                  <h4 className='tech'>MySQL</h4>
                </div>

                <div className='row'>
                  <h4 className='tech'>SQlite3</h4>
                  <h4 className='tech'>CSV</h4>
                </div>
              </div>
              
              <div className='tech-list'>
                <h3><i class='fa fa-gamepad' style={{"marginRight" : "6px"}}></i>Game Dev</h3>
                <div className='row'>
                  <h4 className='tech'>Pygame</h4>
                  <h4 className='tech'>Unity</h4>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
        
      
    </>
  );
}


export default App;

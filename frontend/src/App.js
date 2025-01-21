import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import './style.css'

const socket = io("wss://followup-zp4v.onrender.com/terminal", {
  transports: ["websocket"], 
  rejectUnauthorized: false, // Required for self-signed certificates
});


socket.on("connect", () =>{
  console.log("connected")
})

function App() {
  const [data, setData] = useState(null);
  
  const [terminalSelected, setTerminalSelected] = useState(false); // bool type checks if the terminal is clicked on and a function to set the variable
  const [offset, setOffset] = useState([0, 0]); // same here but offset number

  useEffect(() =>{  // the effect that moves stuff around on the page
    function mouseEvent(event){
      const header = document.querySelector(".header");
      const terminal = document.querySelector(".terminal");
      const close = document.getElementById("close");
      const tag = document.querySelector(".tag")
      if (event.type === "mousedown"){
        if (event.target === header){
          setTerminalSelected(true);
          setOffset([
            event.clientX - header.offsetLeft, 
            event.clientY - header.offsetTop])
          }
        else if (event.target.parentNode === close){
          tag.style.top = `${header.offsetTop}px`
          tag.classList.add("visible");
          terminal.classList.remove("visible");
          header.classList.remove("visible");
        }
        else if (event.target.parentNode === tag){
          tag.classList.remove("visible");
          terminal.classList.add("visible");
          header.classList.add("visible");
        }
      }
      if (event.type === "mouseup"){
        setTerminalSelected(false);
      } 
      if (event.type === "mousemove" && terminalSelected){
          header.style.top = `${event.clientY - offset[1]}px`;
          header.style.left = `${event.clientX - offset[0]}px`;
      }
      terminal.style.left = header.style.left;
      terminal.style.top = `${parseInt(header.style.top) - 2 + header.offsetHeight}px`

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
      <div className='tag visible animated'>
        <i className='material-icons' style={{color: "white", transform: "scaleX(2) scaleY(5)"}}>keyboard_arrow_left</i>
      </div>
      
      <div className='container'>
        <div className='header window visible animated'>
              <i className='fa fa-terminal' style={{fontSize: "25px", marginLeft: "5px"}}></i>
              <h1 style={{fontSize: "20px", marginTop: "2px", marginRight: "5px", fontWeight: "400", color: "black"}}>Terminal 1</h1>
              <div id="close">
                <i className='material-icons' style={{fontSize: "27px", fontWeight: "200"}}>close</i>
              </div>
          </div>
          
        <div className='terminal window visible animated'>
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
    </>
  );
}


export default App;

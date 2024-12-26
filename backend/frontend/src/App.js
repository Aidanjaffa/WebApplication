import React, { useState, useEffect } from 'react';
import {useTypewriter, Cursor} from 'react-simple-typewriter'
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

  const [hovering, setHover] = useState("");

  const projects = "Projects"
  const about = "About"
  const name = "Aidan Agovich-Lee"

  useEffect(() =>{
    function mouseEvent(event){
      let project = document.getElementById("projects");
      let about = document.getElementById("about");
      let name = document.getElementById("name");

      if (event.target === project) setHover("projects");
      else if (event.target === about) setHover("about");
      else if (event.target === name) setHover("name");
      else setHover("");
    }

    window.addEventListener("mousemove", mouseEvent);
  }, [hovering])

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
    if (terminal.scrollHeight > 500)
      terminal.scroll(0, terminal.scrollHeight);
  })

  console.log(hovering)

  return (
    // html stuff
    <>
      <nav>
        <a id='projects'>{projects}</a>
        <h1 id="name">{name}</h1>
        <a id='about'>{about}</a>
      </nav>

      <div className='tag visible animated'>
        <i className='material-icons' style={{color: "white", transform: "scaleX(2) scaleY(5)"}}>keyboard_arrow_left</i>
      </div>

      <div className='text-box'>
        <h1 style={{position: "relative", top: "20%"}}>Click for terminal access! -&gt;</h1>
      </div>

      <div className='container'>
        <div className='header animated window'>
              <i className='fa fa-terminal' style={{fontSize: "25px", marginLeft: "5px"}}></i>
              <h1 style={{fontSize: "20px", marginTop: "2px", marginRight: "5px", fontWeight: "400", color: "black"}}>Terminal 1</h1>
              <div id="close">
                <i className='material-icons' style={{fontSize: "27px", fontWeight: "200"}}>close</i>
              </div>
          </div>
        <div className='terminal animated window'>
          {data ? (
            data.message.map((message, index) =>
              <p key={index}>{message}</p>
            )
          ):(
            <p></p>
          )}
          <form style={{marginTop: "auto", marginBottom: "5px"}} method='post' type='submit' onSubmit={post}>
            <input name='command' id='command'></input>
          </form>
        </div>
      </div>

      <div className='projects'>
        <div className='card'></div>
      </div>    
    </>
  );
}


export default App;

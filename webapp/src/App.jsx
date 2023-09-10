import React from "react";
import { useState } from "react";
import { useEffect } from "react";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import "./fonts/Comfortaa-Regular.ttf";
import './index.css';

import {
  Typography,
  AppBar,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CssBaseline,
  Grid,
  Toolbar,
  Container,
  Button,
  searchBar,
  Paper,
  withStyles,
  makeStyles,
  Input,
} from "@mui/material";
import { Configuration, OpenAIApi } from "openai";
import { getSubtitles } from "youtube-captions-scraper";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      light: "#757ce8",
      main: "#3f50b5",
      dark: "#002884",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000",
    },
  },
});

const apiKey = ""

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const openaiCompletion = async (summary) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      'prompt': `Write summary about the following text. Seperate the paragraphs by new lines: ${summary}. `,

      'temperature': 0.1,
      'max_tokens': 800,
      'top_p': 1,
      'frequency_penalty': 0,
      'presence_penalty': 0.5,
      'stop': ["\"\"\""],
    })
  };
  const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', requestOptions)
  const json = await response.json();
  console.log(json)
  
  return json
}

const App = () => {
  //For the button
  const [inputValue, setInputValue] = useState("");
  const [summary, setSummary] = useState("");
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const openaiTrigger = async (summary) => {
    let finalResponse = "";
    for (let i = 0; i < summary.length; i++) {
      console.log("triggered: " + summary[i]);
      // const response = await openai
      //   .createCompletion({
      //     model: "code-davinci-002",
      //     prompt: ,
      //     max_tokens: 8000,
      //   });
      const response = await openaiCompletion(summary[i])

      console.log(response)

      

      console.log(response.choices[0].text);

      finalResponse += response.choices[0].text + "\n";      
      setSummary(finalResponse);
      await sleep(1000);
    }
  };

  const getAndPrintCaptions = async (videoId, language) => {
    console.log("Getting subtitles for video: ", videoId);
    const captions = await getSubtitles({
      videoID: videoId, // youtube video id
      lang: language, // default: `en`
    });

    console.log(captions[0].text);
    console.log("parsing...");
    let concat = "";

    for (let i = 0; i < captions.length; i++) {
      concat += captions[i].text;
      // console.log(captions[i].text);
    }
    // captions.forEach((caption) => console.log(caption.text));
    // captions.forEach((caption) => (concat += caption.text));
    //set the input value to the concatenated captions
    setInputValue(concat);
  };

  const postCaptions = async (videoId) => {
    const url = "http://127.0.0.1:5000/captions";
    const payload = { video_id: videoId };

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Access-Control-Allow-Methods": "POST",
        "Content-type": "application/json",
      },
    });
    const data = await response.json();
    // setSummary(data);
    openaiTrigger(data);
  };

  //TODO the button parseing the URL not working idk why. I think i solved it but guess not
  const handleClick = async () => {
    //get the video id
    const videoId = inputValue;
    console.log(videoId);
    //let videoId;

    // var regExp = "/^.(youtu.be/|v/|u/\w/|embed/|watch?v=|&v=)([^#&?]).*/";
    // var match = inputValue.match(regExp);
    // if (match && match[2].length == 11) {
    //   videoId = match[2];
    // } else {
    //   //error
    // }
    //get the captions
    await postCaptions(videoId);
  };

  console.log("summary: " + summary)

  return (
    <>
      <CssBaseline>
        <main>
          <Container maxWidth="md">
            <Typography
              className="comfortaa"
              fontFamily="Bold"
              component="h1"
              //size = "30px"
              fontSize= "70px"
              variant="h2"
              align="center"
              color="text.primary"
              style={{ paddingTop: "200px" }}
              gutterBottom
            >
              CaptionConcierge
            </Typography>
          </Container>
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
            style={{ paddingTop: "10px", paddingBottom: "50px" }}
          >
            <Grid item>
              <TextField
                id="outlined-basic"
                variant="outlined"
                style={{ width: "700px" }}
                value={inputValue}
                onChange={handleInputChange}
                label="Enter YouTube URL: EG. https://www.youtube.com/watch?v=QH2-TGUlwu4"
              />
            </Grid>

            <Grid item>
              <Button variant="contained" size="large" onClick={handleClick} font-family = "Bold" fontSize = "25px" width = "100px" height = "50px">
                Generate
              </Button>
            </Grid>
          </Grid>

          <Paper
            style={{
              borderRadius: 10,
              width: "1000px",
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: "100px",
              paddingTop: "30px",
              paddingLeft: "30px",
              paddingRight: "30px",
              paddingBottom: "30px",
              paddingBottom: "30px",
              backgroundColor: "#d8caf6",
              boxShadow: "0 0 1rem 0 rgba(0, 0, 0, .2)",
              backdropFilter: "blur(5px)",
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              alignContent: "flex-start",
            }}
          >
            {summary && summary.split("\n").map(para => <Typography
              variant="h5"
              align="center"
              fontFamily="Regular"
              gutterBottom
              style={{ flex: "1" }}
            >
              {para}
            </Typography>)}
          </Paper>
        </main>
      </CssBaseline>
    </>
  );
};

export default App;

#!/usr/bin/env node

// to use install the dependencies first
/* example usage */
/* node auto-git.js master */

'use strict';
const cron = require('node-cron');
const shell = require('shelljs');
const Format = require('json-format');
const randomWords = require('random-words');
let fs = require('fs');
let moment = require('moment');

try{
//filename
let filename = 'cron-logs.json';
const uchoices = process.argv.slice(2);
if(uchoices.length === 0){
  console.log(`Please pass in the arguments...`);
  process.exit(1);
}
let branch = uchoices[0];
  // ...
  const message = () => {
      return randomWords({ exactly: 5, join: ' ' })
  }

  //get today's time
  const getTime = () => {
    return new Date(Date.now()).toLocaleString("en-US", { timeZone: "Africa/Nairobi" });
  }
  //today's date
  const todayDate = () => {
    const today = new Date();
    let todaydate = "log"+today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear();
    return todaydate
  }

  //generate unique id
  const genId = () => {
    return (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2);
  }

  //formatter config
  let config = {
    type: 'space',
    size: 2
  }

  //logger
  function checkFileExistsSync(filepath){
      let flag = true;
      try{
        fs.accessSync(filepath, fs.constants.F_OK);
      }catch(e){
        flag = false;
      }
      return flag;
  }
  //read the json file
  const getLogs = () => {
    var webProjects = JSON.parse(fs.readFileSync(filename));
    if(Object.entries(webProjects).length === 0){
        return {data: webProjects, state: "Empty"}
    } else{
        return {data: webProjects, state: "Not Empty"}
    }
  }
  //write logs to file
  const writingLogs = (newlogs) => {
    //check logs state
    let logs;
    if(getLogs().state === "Empty"){
        let tod = todayDate();
        newlogs = '{"'+tod+'"'+' :['+JSON.stringify(newlogs)+']}';
        logs = JSON.parse(newlogs);
        fs.writeFileSync(filename, Format(logs, config));
    }else{
        //get last key input from the json data
        var lastKey;
        for(var key in getLogs().data){
            if(getLogs().data.hasOwnProperty(key)){
                lastKey = key;
            }
        }
        if(lastKey === todayDate()){
            let cutlogs = JSON.stringify(getLogs().data).slice(0, JSON.stringify(getLogs().data).length-2);
            logs = cutlogs+','+JSON.stringify(newlogs)+']}';
            logs = JSON.parse(logs);
            fs.writeFileSync(filename, Format(logs, config));
        }else{
            let cutlogs = JSON.stringify(getLogs().data).slice(0, JSON.stringify(getLogs().data).length-1);
            logs = cutlogs+',"'+todayDate()+'" :['+JSON.stringify(newlogs)+']}';
            logs = JSON.parse(logs);
            fs.writeFileSync(filename, Format(logs, config));
        }
    }
  }
  const logger = (newlogs) => {
    //check if log file exists
    if(!checkFileExistsSync(filename)){
      fs.open(filename, 'w', function (err) {
          if (err){
              throw err;
          } else {
              console.log('Created file: '+filename);
              fs.writeFileSync(filename, Format({}, config));
              //add logfile to gitignore
              fs.appendFile('.gitignore', filename+'\n', function (err) {
                if (err) throw err;
              });
              writingLogs(newlogs);
          }
      });
    }else{
      writingLogs(newlogs);
    }
  }

  let path = process.cwd(); //your folder path (views is an example folder)
  // Schedule tasks to be run on the server.
  cron.schedule('*/20 * * * *', function() {
      wasFileChanged(path, (err,wasChanged) => {
      if (wasChanged){
          console.log('folder was changed, need to compare files');
              console.log('---------------------');
              console.log("Commit message :"+message());
              console.log("Push Branch :"+branch);
              console.log('Running git');
              shell.exec('git add .');
              shell.exec('git commit -m '+'"'+message()+'"');
              shell.exec('git branch -M '+branch);
              if (shell.exec('git push').code !== 0) {
                  //shell.exit(1);
                  console.log('nothing to commit, working tree clean');
                  let newlogs =  {
                    id: genId(),
                    Status: 'nothing to commit, working tree clean',
                    TimePushed: getTime()
                  }
                  logger(newlogs);
              }
              else {
                  shell.echo('git update complete at '+getTime());
                  let newlogs =  {
                    id: genId(),
                    Status: 'git update complete',
                    TimePushed: getTime()
                  }
                  logger(newlogs);
              }
      }
      else{
          console.log('folder was not changed');
          let newlogs =  {
            id: genId(),
            Status: 'folder was not changed',
            TimePushed: getTime()
          }
          logger(newlogs);
      }
      });
  });
  //get las modified date and time from database
  const getLastMod = () => {
    if(!checkFileExistsSync(filename)){
      return getTime();
    }else {
      return JSON.stringify(getLogs().data).slice(-25).substring(0, 21);
    }
  }

  /**
   * Checks if a file/folder was changed 
   */
  function wasFileChanged(path, callback) {
    fs.open(path, 'r', (err, fd) => {
      if (err) {
        return callback (err);
      } else {
        //obtain previous modified date of the folder (Read Time From the database)
        let lastModifed = getLastMod();
        fs.stat(path, (err, data) => {
          console.log('check if file/folder last modified date, was it after my last check ');
          //I use moment module to compare dates
          let previousLMM = moment(lastModifed);
          //data.mtime.toISOString()
          let folderLMM = moment(getTime());
          let res = !(folderLMM.isSame(previousLMM, 'second')); //seconds granularity
          return callback (null, res);
        });
      }
    });
  }
} catch(err){
  console.log(err);
}
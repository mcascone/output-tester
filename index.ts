import * as core from '@actions/core';

async function getconfigdata() {
  type JsonData = {
    [key: string]: {
      outputs: { [key: string]: any },
      conclusion: string,
      outcome: string
    }
  };
  
  function extractOutputs(data: JsonData): { [key: string]: any }[] {
    const outputsArray: { [key: string]: any }[] = [];
  
    for (const key in data) {
      if (data[key].outputs) {
        outputsArray.push(data[key].outputs);
      }
    }
  
    return outputsArray;
  }



}

getconfigdata();
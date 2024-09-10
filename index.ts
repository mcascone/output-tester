import * as core from '@actions/core';

type JsonStepData = {
  [key: string]: {
    outputs: { [key: string]: any },
    conclusion: string,
    outcome: string
  }
}

type ExtractedOutput = {
  [key: string]: String | Number | Boolean
}

async function getconfigdata() {
  core.info('Getting step data');

  const stepInput: JsonStepData = JSON.parse(core.getInput('stepdata'));
  core.debug('input data: ' + JSON.stringify(stepInput));

  const extracts: ExtractedOutput[] = extractOutputs(stepInput);
  core.debug('Extracted data: ' + JSON.stringify(extracts));

  // TODO: test with config.path.values

  core.setOutput('finaloutput', extracts);
};

function extractOutputs(data: JsonStepData): { [key: string]: any }[] {
  const outputsArray: ExtractedOutput[] = [];
  
  for (const key in data) {
    if (data[key].outputs && Object.keys(data[key].outputs).length > 0) {
      outputsArray.push(data[key].outputs);
    }
  }

  return outputsArray;
}

getconfigdata();

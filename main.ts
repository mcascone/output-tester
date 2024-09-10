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

export async function getconfigdata() {
  core.info('Getting step data');

  // parse the passed-in step context data
  const stepInput: JsonStepData = JSON.parse(core.getInput('stepdata'));
  core.debug('input step data: ' + JSON.stringify(stepInput));

  // extract the outputs from the step data
  const extracts: ExtractedOutput[] = extractOutputs(stepInput);
  core.debug('Extracted outputs: ' + JSON.stringify(extracts));

  // get the config data from the environment
  // in the real action, use config.restoreConfigData() instead
  const configData = JSON.parse(process.env['CONFIG_DATA'] ?? '');
  core.debug('Incoming config data: ' + JSON.stringify(configData));

  // for each extracted key pair, put them into the config object
  for (const key in extracts) {
    configData[key] = extracts[key];
  }

  core.setOutput('config_output', configData);
  core.debug('Output config data: ' + JSON.stringify(configData));
  core.info('Config data updated: ' + Object.keys(extracts));
}

export function extractOutputs(data: JsonStepData): { [key: string]: any }[] {
  const outputsArray: ExtractedOutput[] = [];
  
  for (const key in data) {
    if (data[key].outputs && Object.keys(data[key].outputs).length > 0) {
      outputsArray.push(data[key].outputs);
    }
  }

  return outputsArray;
}

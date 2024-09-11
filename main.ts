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

// THE ACTUAL ACTION CODE
////////////////////////////////////////
export async function getconfigdata() {
  core.info('Getting step data');

  // get the config data from the environment
  // in the real action, use config.restoreConfigData() instead
  const configData = JSON.parse(process.env['CONFIG_DATA'] ?? '');
  // core.debug('Incoming config data: ' + JSON.stringify(configData));

  // parse the passed-in step context data
  const stepInput: JsonStepData = JSON.parse(core.getInput('stepdata'));
  core.debug('input step data: ' + JSON.stringify(stepInput));

  // extract the outputs from the step data
  const extracts: ExtractedOutput[] = extractOutputs(stepInput);
  core.debug('Extracted outputs: ' + JSON.stringify(extracts));

  // for each extracted key pair, put them into the config object
  // the path will be the name of the key: config.app.name
  updateConfigFromExtracts(extracts, configData);
  const allKeys = extracts.flatMap(extract => Object.keys(extract));
  core.info('Config data updated: ' + allKeys.join(', '));

  // set the Action output
  core.setOutput('config_output', configData);
}


// UTILITY FUNCTIONS

// extract the outputs from the passed-in step context data.
// only include outputs that start with 'config.'
function extractOutputs(data: JsonStepData): { [key: string]: any }[] {
  const outputsArray: ExtractedOutput[] = [];
  
  for (const key in data) {
    if (data[key].outputs && Object.keys(data[key].outputs).length > 0) {
      const filteredOutputs: ExtractedOutput = {};
      for (const outputKey in data[key].outputs) {
        if (outputKey.includes('config.')) {
          filteredOutputs[outputKey] = data[key].outputs[outputKey];
        }
      }
      if (Object.keys(filteredOutputs).length > 0) {
        outputsArray.push(data[key].outputs);
      }
    }
  }

  return outputsArray;
}

// Updates the configData object using the array of extracted objects.
// Each key in the extract objects represents a path in the configData structure.
// The function splits the key into parts, navigates through configData, and sets the value.
// If the key is invalid, it logs an error.
// This allows for dynamic updates to deeply nested structures in configData.
type Extract    = { [key: string]: any };
type ConfigData = { [key: string]: any };

export function updateConfigFromExtracts(extracts: Extract[], configData: ConfigData): void {
  extracts.forEach(extract => {
    for (const key in extract) {
      const path = key.split('.');
      const lastKey = path.pop();

      if (!lastKey) {
        core.error("Invalid key: ${key}");
        continue;
      }

      const nestedObject = path.reduce((obj, prop) => {
        if (!obj[prop]) {
          obj[prop] = {};
        }
        return obj[prop];
      }, configData);

      nestedObject[lastKey] = extract[key];
    }
  });
}
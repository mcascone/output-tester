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

// Extract the outputs from the passed-in step context data.
// Only include outputs that start with 'config.'
export function extractOutputs(data: JsonStepData): { [key: string]: any }[] {
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

/**
 * This function updates the `configData` object based on the provided `extracts`.
 * Each `extract` is an object with key-value pairs representing configuration updates.
 * The function iterates over each `extract` and applies the updates to the `configData` object.
 * 
 * Explanation of the code:
 * - The function uses the `forEach` method to iterate over each `extract`.
 * - For each `extract`, it retrieves the keys using `Object.keys(extract)`.
 * - The key is then modified by removing the prefix 'config.' and splitting it into an array of nested keys using the `split` method.
 * - The last key is extracted using the `pop` method.
 * - If there is no last key, an error is logged using `core.error` and the iteration continues to the next `extract`.
 * - The function then uses the `reduce` method on the `path` array to traverse the `configData` object and create any necessary nested objects.
 * - Finally, the value of the last key in the `extract` is assigned to the corresponding property in the nested object.
 */
type Extract    = { [key: string]: any };
type ConfigData = { [key: string]: any };

export function updateConfigFromExtracts(extracts: Extract[], configData: ConfigData): void {
  extracts.forEach(extract => {
    for (const key in extract) {
      const path = key.replace('config.', '').split('.');
      const lastKey = path.pop();

      if (!lastKey) {
        core.error(`Invalid key: ${key}`);
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
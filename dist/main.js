"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getconfigdata = getconfigdata;
exports.extractOutputs = extractOutputs;
exports.updateConfigFromExtracts = updateConfigFromExtracts;
const core = __importStar(require("@actions/core"));
// THE ACTUAL ACTION CODE
////////////////////////////////////////
function getconfigdata() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        core.info('Getting step data');
        // get the config data from the environment
        // in the real action, use config.restoreConfigData() instead
        const configData = JSON.parse((_a = process.env['CONFIG_DATA']) !== null && _a !== void 0 ? _a : '');
        // core.debug('Incoming config data: ' + JSON.stringify(configData));
        // parse the passed-in step context data
        const stepInput = JSON.parse(core.getInput('stepdata'));
        core.debug('input step data: ' + JSON.stringify(stepInput));
        // extract the outputs from the step data
        const extracts = extractOutputs(stepInput);
        core.debug('Extracted outputs: ' + JSON.stringify(extracts));
        // for each extracted key pair, put them into the config object
        // the path will be the name of the key: config.app.name
        updateConfigFromExtracts(extracts, configData);
        const allKeys = extracts.flatMap(extract => Object.keys(extract));
        core.info('Config data updated: ' + allKeys.join(', '));
        // set the Action output
        core.setOutput('config_output', configData);
    });
}
// UTILITY FUNCTIONS
// Extract the outputs from the passed-in step context data.
// Only include outputs that start with 'config.'
function extractOutputs(data) {
    const outputsArray = [];
    for (const key in data) {
        if (data[key].outputs && Object.keys(data[key].outputs).length > 0) {
            const filteredOutputs = {};
            for (const outputKey in data[key].outputs) {
                if (outputKey.includes('config.')) {
                    filteredOutputs[outputKey] = data[key].outputs[outputKey];
                }
            }
            if (Object.keys(filteredOutputs).length > 0) {
                outputsArray.push(filteredOutputs);
            }
        }
    }
    return outputsArray;
}
function updateConfigFromExtracts(extracts, configData) {
    extracts.forEach(extract => {
        for (const key in extract) {
            const path = key.replace('config.', '').split('.');
            const lastKey = path.pop();
            if (!lastKey) {
                core.error(`Invalid key: ${key}`);
                continue;
            }
            const nestedObject = path.reduce((obj, prop) => {
                ``;
                if (!obj[prop]) {
                    obj[prop] = {};
                }
                return obj[prop];
            }, configData);
            nestedObject[lastKey] = extract[key];
        }
    });
}

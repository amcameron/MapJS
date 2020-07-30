'use strict';

const path = require('path');

const exec = require('./spawn.js');
const utils = require('./utils.js');
const imageMagick = '/usr/local/bin/convert';

const baseDir = path.resolve(__dirname, '../../static/img');
const pokemonDir = path.resolve(baseDir, 'pokemon');
const pokemonLeagueDir = path.resolve(baseDir, 'pokemon_league');
const miscDir = path.resolve(baseDir, 'misc');
const raidDir = path.resolve(baseDir, 'raid');
const gymDir = path.resolve(baseDir, 'gym');
const eggDir = path.resolve(baseDir, 'egg');
const unkownEggDir = path.resolve(baseDir, 'unkown_egg');
const pokestopDir = path.resolve(baseDir, 'pokestop');
const itemDir = path.resolve(baseDir, 'item');
const questDir = path.resolve(baseDir, 'quest');
const gruntDir = path.resolve(baseDir, 'grunt');
const invasionDir = path.resolve(baseDir, 'invasion');
const questInvasionDir = path.resolve(baseDir, 'quest_invasion');

const firstFile = path.resolve(miscDir, 'first.png');
const secondFile = path.resolve(miscDir, 'second.png');
const thirdFile = path.resolve(miscDir, 'third.png');

let composeMethod;
if (process.env['IMAGEGEN_OVER']) {
    composeMethod = 'dst-over';
} else {
    composeMethod = 'over';
}

// TODO: If statements to get correct image
class ImageGenerator {
    static instance = new ImageGenerator();

    constructor() {
    }

    getPokemonImagePath(pokemonId, formId) {
        let pokeId = utils.zeroPad(pokemonId, 3);
        let form = formId === 0 ? '00' : formId;
        return path.resolve(pokemonDir, `pokemon_icon_${pokeId}_${form}.png`);
    }

    async generatePokemonImage(pokemonId, formId) {
        if (utils.fileExists(pokemonDir) &&
            utils.fileExists(firstFile) &&
            utils.fileExists(secondFile) &&
            utils.fileExists(thirdFile)) {
            console.log('[ImageGenerator] Creating Pokemon League Images...');
            try {
                const pokemonFileName = getPokemonImagePath(pokemonId, formId);
                if (!pokemonFileName.includes('.png')) {
                    return;
                }
                let pokemonFile = path.resolve(pokemonDir, pokemonFileName);
                let newFileFirst = path.resolve(pokemonLeagueDir, pokemonId + '_1.png');
                if (!utils.fileExists(newFileFirst)) {
                    console.debug(`[ImageGenerator] Creating #1 Pokemon League Images ${pokemonId}`);
                    await this.combineImagesLeague(pokemonFile, firstFile, newFileFirst);
                }
                let newFileSecond = path.resolve(pokemonLeagueDir, pokemonId + '_2.png');
                if (!utils.fileExists(newFileSecond)) {
                    console.debug(`[ImageGenerator] Creating #2 Pokemon League Images ${pokemonId}`);
                    await this.combineImagesLeague(pokemonFile, secondFile, newFileSecond);
                }
                let newFileThird = path.resolve(pokemonLeagueDir, pokemonId + '_3.png');
                if (!utils.fileExists(newFileThird)) {
                    console.debug(`[ImageGenerator] Creating #3 Pokemon League Images ${pokemonId}`);
                    await this.combineImagesLeague(pokemonFile, thirdFile, newFileThird);
                }
                return pokemonFile;
            } catch (e) {
                console.error('[ImageGenerator] Failed to generate iamge:', e);
            }
            console.log('[ImageGenerator] Pokemon League Images created.');
        } else {
            console.warn('[ImageGenerator] Creating Pokemon League Images (missing Dirs)');
            if (!utils.fileExists(pokemonDir)) {
                console.log(`[ImageGenerator] Missing dir ${pokemonDir}`);
            }
            if (!utils.fileExists(firstFile)) {
                console.log(`[ImageGenerator] Missing file ${firstFile}`);
            }
            if (!utils.fileExists(secondFile)) {
                console.log(`[ImageGenerator] Missing file ${secondFile}`);
            }
            if (!utils.fileExists(thirdFile)) {
                console.log(`[ImageGenerator] Missing file ${thirdFile}`);
            }
        }
        return null;
    }

    async generateGymImage(pokemonId, formId, teamId, level) {
        if (utils.fileExists(raidDir) &&
            utils.fileExists(gymDir) &&
            utils.fileExists(eggDir) &&
            utils.fileExists(unkownEggDir) &&
            utils.fileExists(pokemonDir)) {
            console.log('[ImageGenerator] Creating Raid Images...')

            try {
                let gymFile = path.resolve(gymDir, teamId + '.png');
                try {
                    let eggFile = path.resolve(eggDir, level + '.png');
                    let newFile = path.resolve(raidDir, teamId + '_e' + level + '.png');
                    if (!utils.fileExists(newFile)) {
                        console.debug(`[ImageGenerator] Creating image for gym ${teamId} and egg ${level}`);
                        await this.combineImages(eggFile, gymFile, composeMethod, newFile);
                    }
                    return newFile;
                } catch (e) {
                    console.error(e);
                }
                try {
                    let unkownEggFile = path.resolve(unkownEggDir, level);
                    let newFile = path.resolve(raidDir, teamId + '_ue' + level + '.png');
                    if (!utils.fileExists(newFile)) {
                        console.debug(`[ImageGenerator] Creating image for gym ${teamId} and unkown egg ${level}`);
                        await this.combineImages(unkownEggFile, gymFile, composeMethod, newFile);
                    }
                    return newFile;
                } catch (e) {
                    console.error(e);
                }
                try {
                    let pokeId = utils.zeroPad(pokemonId, 3);
                    let pokemonFile = getPokemonImagePath(pokeId, formId);
                    let newFile = path.resolve(raidDir, `{teamId}_${pokeId}_${formId === 0 ? '00' : formId}.png`);
                    if (!utils.fileExists(newFile)) {
                        console.debug(`[ImageGenerator] Creating image for gym ${teamId} and pokemon ${pokemonId}`);
                        await this.combineImages(pokemonFile, gymFile, composeMethod, newFile);
                    }
                    return newFile;
                } catch (e) {
                    console.error(e);
                }
            } catch (e) {
                console.error('[ImageGenerator] Error:', e);
            }

            console.log('[ImageGenerator] Raid images created.')
        } else {
            console.warn('[ImageGenerator] Not generating Quest Images (missing Dirs)');
            if (!utils.fileExists(raidDir)) {
                console.log(`[ImageGenerator] Missing dir ${raidDir}`);
            }
            if (!utils.fileExists(gymDir)) {
                console.log(`[ImageGenerator] Missing dir ${gymDir}`);
            }
            if (!utils.fileExists(eggDir)) {
                console.log(`[ImageGenerator] Missing dir ${eggDir}`);
            }
            if (!utils.fileExists(unkownEggDir)) {
                console.log(`[ImageGenerator] Missing dir ${unkownEggDir}`);
            }
            if (!utils.fileExists(pokemonDir)) {
                console.log(`[ImageGenerator] Missing dir ${pokemonDir}`);
            }
        }
        return null;
    }

    async generateQuestImage(pokemonId, formId, itemId, pokestopId) {
        if (utils.fileExists(questDir) &&
            utils.fileExists(itemDir) &&
            utils.fileExists(pokestopDir) &&
            utils.fileExists(pokemonDir)) {
            console.log('[ImageGenerator] Creating Quest Images...');
            try {
                let pokestopFile = path.resolve(pokestopDir, pokestopId + '.png');

                try {
                    let itemFile = path.resolve(itemDir, itemId + '.png');
                    let newFile = path.resolve(questDir, pokestopId + '_i' + itemId + '.png');
                    if (!utils.fileExists(newFile)) {
                        console.debug(`[ImageGenerator] Creating quest for stop ${pokestopId} and item ${itemId}`);
                        await this.combineImages(itemFile, pokestopFile, composeMethod, newFile);
                    }
                    return newFile;
                } catch (e) {
                    console.error(e);
                }

                try {
                    let pokeId = utils.zeroPad(pokemonId, 3);
                    let form = formId === 0 ? '00' : formId;
                    let pokemonFile = path.resolve(pokemonDir, `pokemon_icon_${pokeId}_${form}.png`);
                    let newFile = path.resolve(questDir, pokestopId + '_p' + pokemonId + '.png');
                    if (!utils.fileExists(newFile)) {
                        console.debug(`[ImageGenerator] Creating quest for stop ${pokestopId} and pokemon ${pokemonId}`);
                        await this.combineImages(pokemonFile, pokestopFile, composeMethod, newFile);
                    }
                    return newFile;
                } catch (e) {
                    console.error(e);
                }
            } catch (e) {
                console.error(e);
            }

            console.log('[ImageGenerator] Quest images created.');
        } else {
            console.warn('[ImageGenerator] Not generating Quest Images (missing Dirs)');
            if (!utils.fileExists(questDir)) {
                console.log(`[ImageGenerator] Missing dir ${questDir}`);
            }
            if (!utils.fileExists(itemDir)) {
                console.log(`[ImageGenerator] Missing dir ${itemDir}`);
            }
            if (!utils.fileExists(pokestopDir)) {
                console.log(`[ImageGenerator] Missing dir ${pokestopDir}`);
            }
            if (!utils.fileExists(pokemonDir)) {
                console.log(`[ImageGenerator] Missing dir ${pokemonDir}`);
            }
        }
        return null;
    }

    async generateInvasionImage(gruntId, pokestopId) {
        if (utils.fileExists(gruntDir) && utils.fileExists(pokestopDir)) {
            console.log('[ImageGenerator] Creating Invasion Images...');
            try {
                let pokestopFile = path.resolve(pokestopDir, pokestopId + '.png');
                try {
                    let gruntFile = path.resolve(gruntDir, gruntId + '.png');
                    let newFile = path.resolve(invasionDir, pokestopId + '_' + gruntId + '.png');
                    if (!utils.fileExists(newFile)) {
                        console.debug(`[ImageGenerator] Creating invasion for stop ${pokestopId} and grunt ${gruntId}`);
                        await this.combineImagesGrunt(pokestopFile, gruntFile, newFile);
                    }
                    return newFile;
                } catch (e) {
                    console.error(e);
                }
            } catch (e) {
                console.error(e);
            }
            console.log('[ImageGenerator] Invasion images created.');
        } else {
            console.warn('[ImageGenerator] Not generating Invasion Images (missing Dirs)');
            if (!utils.fileExists(gruntDir)) {
                console.log(`[ImageGenerator] Missing dir ${gruntDir}`);
            }
            if (!utils.fileExists(pokestopDir)) {
                console.log(`[ImageGenerator] Missing dir ${pokestopDir}`);
            }
        }
        return null;
    }

    async generateQuestInvasionImage(questId, gruntId) {
        if (utils.fileExists(gruntDir) && utils.fileExists(questDir)) {
            console.log('[ImageGenerator] Creating Quest Invasion Images...')
            try {
                let questFile = path.resolve(questDir, questId + '.png');
                try {
                    let gruntFile = path.resolve(gruntDir, gruntId + '.png');
                    let newFile = path.resolve(questInvasionDir, questId + '_' + gruntId + '.png');
                    if (!utils.fileExists(newFile)) {
                        console.debug(`[ImageGenerator] Creating invasion for quest ${questId} and grunt ${gruntId}`);
                        await this.combineImagesGruntQuest(questFile, gruntFile, newFile);
                    }
                    return newFile;
                } catch (e) {
                    console.error(e);
                }
            } catch (e) {
                console.error(e);
            }
            console.log('[ImageGenerator] Quest Invasion images created.');
        } else {
            console.warn('[ImageGenerator] Not generating Quest Invasion Images (missing Dirs)');
            if (!utils.fileExists(gruntDir)) {
                console.log(`[ImageGenerator] Missing dir ${gruntDir}`);
            }
            if (!utils.fileExists(questDir)) {
                console.log(`[ImageGenerator] Missing dir ${questDir}`);
            }
        }
        return null;
    }

    async combineImages(image1, image2, method, output) {
        await exec(imageMagick, [
                '-limit', 'thread', '1',
                image1, '-background', 'none',
                '-resize', '96x96',
                '-gravity', 'north',
                '-extent', '96x160',
                'tmp1.png'
        ]);
        await exec(imageMagick, [
            '-limit', 'thread', '1',
            image2, '-background', 'none',
            '-resize', '96x96',
            '-gravity', 'south',
            '-extent', '96x160',
            'tmp2.png'
        ]);
        await exec(imageMagick, [
            '-limit', 'thread', '1',
            'tmp1.png', 'tmp2.png',
            '-gravity', 'center',
            '-compose', method,
            '-composite', output
        ]);
        await exec('rm', ['-f', 'tmp1.png']);
        await exec('rm', ['-f', 'tmp2.png']);
    }

    async combineImagesGrunt(image1, image2, output) {
        await exec(imageMagick, [
            '-limit', 'thread', '1',
            image1, '-background', 'none',
            '-resize', '96x96',
            '-gravity', 'center',
            'tmp1.png'
        ]);
        await exec(imageMagick, [
            '-limit', 'thread', '1',
            image2, '-background', 'none',
            '-resize', '64x64',
            '-gravity', 'center',
            'tmp2.png'
        ]);
        await exec(imageMagick, [
            '-limit', 'thread', '1',
            'tmp1.png', 'tmp2.png',
            '-gravity', 'center',
            '-geometry', '+0-19',
            '-compose', 'over',
            '-composite', output
        ]);
        await exec('rm', ['-f', 'tmp1.png']);
        await exec('rm', ['-f', 'tmp2.png']);
    }

    async combineImagesGruntQuest(image1, image2, output) {
        await exec(imageMagick, [
            '-limit', 'thread', '1',
            image1, '-background', 'none',
            '-resize', '96x160',
            '-gravity', 'center',
            'tmp1.png'
        ]);
        await exec(imageMagick, [
            '-limit', 'thread', '1',
            image2, '-background', 'none',
            '-resize', '64x64',
            '-gravity', 'center',
            'tmp2.png'
        ]);
        await exec(imageMagick, [
            '-limit', 'thread', '1',
            'tmp1.png', 'tmp2.png',
            '-gravity', 'center',
            '-geometry', '+0+13',
            '-compose', 'over',
            '-composite', output
        ]);
        await exec('rm', '-f', 'tmp1.png');
        await exec('rm', '-f', 'tmp2.png');
    }

    async combineImagesLeague(image1, image2, output) {
        await exec(imageMagick, [
            '-limit', 'thread', '1',
            image1, '-background', 'none',
            '-resize', '96x96',
            '-gravity', 'center',
            'tmp1.png'
        ]);
        await exec(imageMagick, [
            '-limit', 'thread', '1',
            image2, '-background', 'none',
            '-resize', '64x64',
            '-gravity', 'center',
            'tmp2.png'
        ]);
        await exec(imageMagick, [
            '-limit', 'thread', '1',
            'tmp1.png', 'tmp2.png',
            '-gravity', 'SouthWest',
            '-compose', 'over',
            '-composite', output
        ]);
        await exec('rm', '-f', 'tmp1.png');
        await exec('rm', '-f', 'tmp2.png');
    }
}

module.exports = ImageGenerator;
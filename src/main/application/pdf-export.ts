import {getAllChurches, getAllMasses, getAllMessdiener} from "./state";
import {Church, ExportSettings, Mass, Messdiener} from "../../shared/general";
import * as fs from "node:fs";
import {saveExportSettings} from "./settings-cache";
import {getWorkingDirectoryPath} from "./main";
import {compile} from "node-tectonic";

export const MASSES_PER_ROW = 5;

const combineOriginalAndAdditionalNote = (original: string | undefined, additional: string | undefined): string => {
    if (original && additional) {
        return `${original} ${additional}`;
    }
    if (original) {
        return original;
    }
    if (additional) {
        return additional;
    }

    return "";
}

/**
 * Returns the name to display of the given Messdiener.
 * This takes the shorthand and whether it should be displayed into account.
 * If no shorthand is set, the display name of the family is taken.
 * @param messdiener
 */
const getNameOfMessdiener = (messdiener: Messdiener): string => {
    if (messdiener.displayShorthand) {
        return `${messdiener.firstName} ${messdiener.lastNameShorthand ? messdiener.lastNameShorthand : messdiener.lastNameDisplay}`;
    }
    return messdiener.firstName;
}


const getTEXForExport = async (settings: ExportSettings): Promise<string> => {
    const lastUpdate = new Date().toLocaleString("de", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const [masses, allocations] = await Promise.all([
        getMassesString(settings),
        getMessdienerAllocationsString(settings)
    ])

    return `\\documentclass[]{article} \\title{${settings.title}} \\date{(${settings.version}) \\\\Stand: ${lastUpdate}} \\pagestyle{empty}
\\usepackage{longtable}
\\usepackage[a4paper]{geometry}

\\begin{document}
\\maketitle

${allocations}

\\begin{center}
${settings.hint}    
\\end{center}
\\newpage    
${masses}
    
\\end{document}`;
}

const filterMassesForRelevancyAndSort = (masses: Mass[], relevantChurches: Set<number>) => masses.filter(mass => relevantChurches.has(mass.churchID)).sort((a, b) => a.date - b.date);
const filterMessdienerForRelevancy = (messdiener: Messdiener[], relevantChurches: Set<number>) => messdiener.filter(m => m.churchActivity.intersection(relevantChurches).size != 0);
const filterChurchesForRelevancy = (churches: Church[], relevantChurches: Set<number>) => churches.filter(church => relevantChurches.has(church.id));

const mapMessdiener = (messdiener: Messdiener[]) => new Map<number, Messdiener>(messdiener.map((m) => [m.identifier, m]));
const mapChurches = (churches: Church[]) => new Map<number, Church>(churches.map((c) => [c.id, c]));

const getMessdienerAllocationsString = async (settings: ExportSettings): Promise<string> => {
    const buffers = await Promise.all([
        getAllMasses(),
        getAllMessdiener()
    ]);

    const relevantMassesBuffer = filterMassesForRelevancyAndSort(buffers[0], settings.displayedChurchIDs);
    const relevantMessdienerBuffer = filterMessdienerForRelevancy(buffers[1], settings.displayedChurchIDs);
    const mappedRelevantMessdiener = mapMessdiener(relevantMessdienerBuffer);

    const messdienerMassAllocation = ((): Map<number, number> => {
        const messdienerAllocations = new Map<number, number>();
        const addAllocations = (id: number, change = 1) => {
            const currentNumberOfAllocations = messdienerAllocations.get(id)
            if (currentNumberOfAllocations == undefined) {
                messdienerAllocations.set(id, change);
                return;
            }
            messdienerAllocations.set(id, currentNumberOfAllocations + change);
        }
        let allAllocated = 0;

        for (const mass of relevantMassesBuffer) {
            if (mass.allocatedMessdiener.size == 0) {
                allAllocated++;
                continue;
            }

            for (const messdienerID of mass.allocatedMessdiener) {
                addAllocations(messdienerID);
            }
        }
        if (allAllocated > 0) {
            for (const messdiener of relevantMessdienerBuffer) {
                addAllocations(messdiener.identifier, allAllocated);
            }
        }

        return messdienerAllocations;
    })()

    const familyOrientedAllocations = makeFamilyAllocationMap(relevantMessdienerBuffer, messdienerMassAllocation);

    return makeAllocationsOverviewLaTeXString(familyOrientedAllocations, mappedRelevantMessdiener);
}

const getMassesString = async (settings: ExportSettings): Promise<string> => {
    const buffers = await Promise.all([
        getAllMasses(),
        getAllMessdiener(),
        getAllChurches(),
    ]);

    const relevantMassesBuffer = filterMassesForRelevancyAndSort(buffers[0], settings.displayedChurchIDs);
    const mappedRelevantMessdiener = mapMessdiener(filterMessdienerForRelevancy(buffers[1], settings.displayedChurchIDs));
    const mappedRelevantChurches = mapChurches(filterChurchesForRelevancy(buffers[2], settings.displayedChurchIDs));


    const minNumberOfLinesPerMass = 6;

    const getAdditionalNoteForMass = (mass: Mass): string | undefined => {
        if (!settings.otherChurchComment || mass.churchID == settings.mainChurchID) {
            return undefined;
        }
        const actualChurch = mappedRelevantChurches?.get(mass.churchID);
        if (!actualChurch) {
            return undefined;
        }

        if (settings.otherChurchCommentUseLocation) {
            return actualChurch.location;
        }
        return actualChurch.name;
    }

    const getMessdienerListForMass = (mass: Mass): string => {
        let messdienerStr = "";

        // if no messdiener are allocated, the mass should say "Alle" (en: "everyone")
        if (mass.allocatedMessdiener.size == 0) {
            const lineForTextIndex = Math.floor(minNumberOfLinesPerMass / 2) - 1;
            for (let i = 0; i <= minNumberOfLinesPerMass; i++) {
                if ((i == 0 && lineForTextIndex < 0) || i == lineForTextIndex) {
                    messdienerStr += "Alle \\\\";
                    continue;
                }
                messdienerStr += "\\\\ ";
            }
            return messdienerStr.substring(0, messdienerStr.length - 3);
        }

        mass.allocatedMessdiener.forEach(messdienerID => {
            const messdiener = mappedRelevantMessdiener?.get(messdienerID);
            if (messdiener) {
                messdienerStr += getNameOfMessdiener(messdiener) + "\\\\ ";
            }
        });

        // make sure to not have less than the target number of lines
        if (mass.allocatedMessdiener.size < minNumberOfLinesPerMass) {
            for (let i = 0; i <= minNumberOfLinesPerMass - mass.allocatedMessdiener.size; i++) {
                messdienerStr += "\\\\";
            }
        }

        return messdienerStr.substring(0, messdienerStr.length - 2);
    }


    const individualMassesStrings = relevantMassesBuffer.map((mass, index) => {
        const note = combineOriginalAndAdditionalNote(mass.note, getAdditionalNoteForMass(mass));
        const lastMassInRow = index % MASSES_PER_ROW == MASSES_PER_ROW - 1;

        return `\\begin{tabular}{|l|}
    \\hline 
    \\textbf{${makeDateStringFromDateNumber(mass.date)}} \\\\ \\hline
    ${note} \\\\ \\hline
    \\begin{tabular}[c]{@{}l@{}} ${getMessdienerListForMass(mass)} \\end{tabular} \\\\ \\hline
\\end{tabular}\n${lastMassInRow ? "\\\\ \\break" : ""}`;
    });


    if (individualMassesStrings.length > 0) {
        return `\\begin{longtable}{ c c c c c } ${individualMassesStrings.reduce((accumulator, currentValue) => accumulator + currentValue)} \\end{longtable}`;
    }
    return "";
}

export const bakePDF = async (settings: ExportSettings): Promise<string> => {
    console.log("Starting to create PDF export!")
    const [directory, tex] = await Promise.all([
        getWorkingDirectoryPath(),
        getTEXForExport(settings),
        saveExportSettings(settings),
    ]);


    const waitGroup: Promise<void>[] = [];

    const saveTEX = true;
    if (saveTEX) {
        const pathTEX = directory ? `${directory}/messdienerplan.tex` : "messdienerplan.tex";

        waitGroup.push(new Promise<void>(resolve => {
            fs.writeFile(pathTEX, tex, err => {
                if (err) {
                    console.error("Failed to save .tex for export:")
                    console.error(err.message);
                }
                resolve();
            });
        }));
    }

    const pathPDF = directory ? `${directory}/messdienerplan.pdf` : "./messdienerplan.pdf";

    try {
        const result = await compile({
            tex: tex,
            outputDir: directory ? `${directory}` : "./",
            cwd: directory,
        });
        if (!result.success) {
            throw new Error(`${result.failure?.message}\n${result.stderr}`);
        }

        waitGroup.push(new Promise<void>(resolve => {
            if (!result.pdfPath) {
                console.warn("Could not rename exported PDF because no path was provided!")
                resolve();
                return;
            }
            fs.rename(result.pdfPath, pathPDF, err => {
                if (err) {
                    console.error("Failed to rename exported pdf!");
                    console.error(err.message);
                    return;
                }
                resolve();
            });
        }));
    } catch (e) {
        console.error("Failed to compile pdf!")
        console.error(e);
    }

    await Promise.all(waitGroup);
    console.log("Finished exporting PDF!")
    return pathPDF;
}

/**
 * Produces a map wrapping each family id around said family members and their respective allocations.
 * @param allMessdiener All relevant Messdiener.
 * @param messdienerAllocationCount A map mapping Messdiener ids to the number of allocations in a plan.
 */
const makeFamilyAllocationMap = (allMessdiener: Messdiener[], messdienerAllocationCount: Map<number, number>): Map<number, Map<number, number>>  => {
    const familyAllocationMap = new Map<number, Map<number, number>>();

    for (const messdiener of allMessdiener) {
        const allocations = messdienerAllocationCount.get(messdiener.identifier);
        if (allocations == undefined) {
            continue;
        }

        const familyMap = familyAllocationMap.get(messdiener.familyID);
        if (familyMap == undefined) {
            const family = new Map<number, number>();
            family.set(messdiener.identifier, allocations);
            familyAllocationMap.set(messdiener.familyID, family);
            continue;
        }

        familyMap.set(messdiener.identifier, allocations);
    }

    return familyAllocationMap;
}

const makeAllocationsOverviewLaTeXString = (familyAllocations: Map<number, Map<number, number>>, allMessdiener: Map<number, Messdiener>): string => {
    let totalAllocatedMessdiener = 0;
    let largestFamily = 0;
    for (const family of familyAllocations) {
        totalAllocatedMessdiener += family[1].size;
        if (largestFamily < family[1].size) {
            largestFamily = family[1].size;
        }
    }

    const displayedFamilies = new Set<number>();
    const targetRows = 3;
    const maxMessdienerCapacityPerRow = Math.ceil(totalAllocatedMessdiener / targetRows) < largestFamily ? largestFamily : Math.ceil(totalAllocatedMessdiener / targetRows);
    let tableFormat = "";
    for (let i = 0; i < (targetRows * 2) - 1; i++) {
        tableFormat += "c ";
    }
    tableFormat = tableFormat.substring(0, tableFormat.length - 1);

    let overviewTable = `\\begin{center}
\\begin{tabular}{ ${tableFormat} }\n`

    for (let i = 0; i < targetRows; i++) {
        let row = `\\begin{tabular}{ c c }\n`;
        let usedCapacity = 0;
        for (const family of familyAllocations) {
            const familyID = family[0];
            const familyMemberAllocations = family[1];

            if (usedCapacity >= maxMessdienerCapacityPerRow) {
                break;
            }
            if (familyMemberAllocations.size > maxMessdienerCapacityPerRow - usedCapacity || displayedFamilies.has(familyID)) {
                continue;
            }

            for (const messdienerAllocation of familyMemberAllocations) {
                const messdienerID = messdienerAllocation[0];
                const allocations = messdienerAllocation[1];

                row += `${allMessdiener.get(messdienerID) ? allMessdiener.get(messdienerID)?.firstName : messdienerID} & ${allocations}\\\\\n`
            }
            row += `\\hfill \\\\\n`

            displayedFamilies.add(family[0]);
            usedCapacity += family[1].size;
        }

        if (i != targetRows - 1) {
            row += `\\end{tabular} & &\n`;
        } else {
            row += `\\end{tabular}\n`;
        }
        overviewTable += row;
    }

    for (const family of familyAllocations) {
        const familyID = family[0];
        if (!displayedFamilies.has(familyID)) {
            console.error(`Did not include family ${familyID} into account!`)
        }
    }

    return overviewTable + `\\end{tabular}\n\\end{center}\n\n`;
}

const makeDateStringFromDateNumber = (dateNum: number): string => {
    return new Date(Number(String(dateNum).substring(0, 4)),
        Number(String(dateNum).substring(4, 6)) - 1,
        Number(String(dateNum).substring(6, 8))).toLocaleString("de", {
        day: "numeric",
        month: "short"
    });
}

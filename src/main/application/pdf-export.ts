import {getAllChurches, getAllMasses, getAllMessdiener} from "./state";
import {Church, ExportSettings, Mass, Messdiener} from "../../shared/general";
import * as fs from "node:fs";
import {saveExportSettings} from "./settings-cache";
import {getWorkingDirectoryPath} from "./main";

export const texExport = (settings: ExportSettings): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const lastUpdate = new Date().toLocaleString("de", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        Promise.all([
            getAllMasses(),
            getAllMessdiener(),
            getAllChurches(),
            saveExportSettings(settings),
        ]).then(async responses => {
            const allMasses = responses[0].filter(mass => settings.displayedChurchIDs.has(mass.churchID)).sort((a, b) => a.date - b.date);
            const allMessdiener = responses[1];
            const allChurches = responses[2];

            const mappedMessdiener = new Map<number, Messdiener>(allMessdiener.map((m) => [m.identifier, m]));
            const mappedChurches = new Map<number, Church>(allChurches.map((c) => [c.id, c]));
            const massesPerRow = 5;

            let massesLaTeXString = "\\begin{table}[] "
            const individualMassesStrings = allMasses.map((mass, index) => {
                if (settings.otherChurchComment && mass.churchID != settings.mainChurchID) {
                    const additionalNote = settings.otherChurchCommentUseLocation ? mappedChurches.get(mass.churchID)?.location : mappedChurches.get(mass.churchID)?.name;
                    if (mass.note) {
                        mass.note = additionalNote ? `${mass.note} (${additionalNote})` : mass.note;
                    } else {
                        mass.note = additionalNote ? `(${additionalNote})` : undefined;
                    }
                }
                if (index % massesPerRow == massesPerRow - 1) {
                    return makeLaTeXStringFromMass(mass, mappedMessdiener) + "\\hfill \\break";
                }
                return makeLaTeXStringFromMass(mass, mappedMessdiener)
            });
            if (individualMassesStrings.length > 0) {
                massesLaTeXString += individualMassesStrings.reduce((accumulator, currentValue) => accumulator + currentValue);
            }
            massesLaTeXString += "\\end{table}";
            
            const allocationCount = getMassAllocationMap(allMasses);
            const familyOrientedAllocations = makeFamilyAllocationMap(allMessdiener, allocationCount);

            const allocationOverviewLaTeXString = makeAllocationsOverviewLaTeXString(familyOrientedAllocations, mappedMessdiener);

            const tex = `\\documentclass[]{article} \\title{${settings.title}} \\date{(${settings.version}) \\\\Stand: ${lastUpdate}} \\pagestyle{empty}

\\begin{document}
\\maketitle
    
${massesLaTeXString}
    
${allocationOverviewLaTeXString}
    
\\centering
${settings.hint}  
\\end{document}`;

            const directory = await getWorkingDirectoryPath();
            const path = directory ? `${directory}/messdienerplan.tex` : "messdienerplan.tex";

            fs.writeFile(path, tex, err => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                    return;
                }
                resolve(path)
            })
        });
    })
}

const getMassAllocationMap = (masses: Mass[]): Map<number, number> => {
    const map = new Map<number, number>();
    let allAllocated = 0;

    for (const mass of masses) {
        if (mass.allocatedMessdiener.size == 0) {
            allAllocated++;
            continue;
        }

        for (const messdienerID of mass.allocatedMessdiener) {
            const currentCount = map.get(messdienerID)
            if (currentCount == undefined) {
                map.set(messdienerID, 1);
                continue;
            }
            map.set(messdienerID, currentCount + 1);
        }
    }
    if (allAllocated > 0) {
        map.forEach((value, key) => {
            map.set(key, value + allAllocated);
        })
    }

    return map;
}

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

const makeLaTeXStringFromMass = (mass: Mass, messdienerMap: Map<number, Messdiener>, minMessdienerSize = 6): string => {
    let messdienerList = "";
    mass.allocatedMessdiener.forEach(messdienerID => {
        const messdiener = messdienerMap.get(messdienerID);
        if (messdiener) {
            messdienerList += (messdiener.displayShorthand ? `${messdiener.firstName} ${messdiener.lastNameShorthand}` : messdiener.firstName) + "\\\\";
        }
    })
    if (mass.allocatedMessdiener.size < minMessdienerSize && mass.allocatedMessdiener.size > 0) {
        for (let i = 0; i <= minMessdienerSize - mass.allocatedMessdiener.size; i++) {
            messdienerList += "\\\\";
        }
    }
    if (messdienerList.length == 0) {
        const lineForTextIndex = Math.floor(minMessdienerSize / 2) - 1;
        for (let i = 0; i <= minMessdienerSize; i++) {
            if ((i == 0 && lineForTextIndex < 0) || i == lineForTextIndex) {
                messdienerList += "Alle \\\\";
                continue;
            }
            messdienerList += "\\\\";
        }
    }

    messdienerList = messdienerList.substring(0, messdienerList.length - 2);

    const texStr = `\\begin{tabular}{|l|}
    \\hline 
    \\textbf{${makeDateStringFromDateNumber(mass.date)}} \\\\ \\hline
    ${mass.note ? mass.note : ""} \\\\ \\hline
    \\begin{tabular}[c]{@{}l@{}} ${messdienerList} \\end{tabular} \\\\ \\hline
\\end{tabular}\n`

    return texStr;
}
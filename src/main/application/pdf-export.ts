import {getAllMasses, getAllMessdiener} from "./state";
import {Mass, Messdiener} from "../../shared/general";
import * as fs from "node:fs";

export const texExport = (): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const title = "Messdienerplan";
        const version = "2026.2";
        const lastUpdate = new Date().toLocaleString("de", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        Promise.all([getAllMasses(), getAllMessdiener()]).then(responses => {
            const allMasses = responses[0];
            const allMessdiener = responses[1];
            const mappedMessdiener = new Map<number, Messdiener>(allMessdiener.map((m) => [m.identifier, m]));
            const massesPerRow = 5;

            const massesLaTeXString = ("\\begin{table}[] "
                + allMasses.map((mass, index) => {
                    if (index % massesPerRow == massesPerRow - 1) {
                        return makeLaTeXStringFromMass(mass, mappedMessdiener) + "\\hfill \\break";
                    }
                    return makeLaTeXStringFromMass(mass, mappedMessdiener)
                }).reduce((accumulator, currentValue) => accumulator + currentValue)
                + "\\end{table}");

            const tex = `\\documentclass[]{article} \\title{${title}} \\date{(${version}) \\\\Stand: ${lastUpdate}} \\pagestyle{empty}

\\begin{document}
    \\maketitle
    
    ${massesLaTeXString}
            
\\end{document}`;

            const path = `./messdienerplan.tex`

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

const makeDateStringFromDateNumber = (dateNum: number): string => {
    return new Date(Number(String(dateNum).substring(0, 4)),
        Number(String(dateNum).substring(4, 6)) - 1,
        Number(String(dateNum).substring(6, 8))).toLocaleString("de", {
        day: "numeric",
        month: "long"
    });
}

const makeLaTeXStringFromMass = (mass: Mass, messdienerMap: Map<number, Messdiener>, minMessdienerSize = 6): string => {
    let messdienerList = "";
    mass.allocatedMessdiener.forEach(messdienerID => {
        const messdiener = messdienerMap.get(messdienerID);
        if (messdiener) {
            messdienerList += messdiener.firstName + "\\\\";
        }
    })
    if (messdienerList.length == 0) {
        const lineForTextIndex = Math.floor(minMessdienerSize / 2) - 1;
        for (let i = 0; i < minMessdienerSize; i++) {
            if ((i == 0 && lineForTextIndex < 0) || i == lineForTextIndex) {
                messdienerList += "Alle \\\\ ";
                continue;
            }
            messdienerList += "\\\\ ";
        }
    }

    messdienerList = messdienerList.substring(0, messdienerList.length - 2);

    const texStr = `\\begin{tabular}{|l|}
    \\hline 
    \\textbf{${makeDateStringFromDateNumber(mass.date)}} \\\\ \\hline
    ${mass.note ? mass.note : ""} \\\\ \\hline
    \\begin{tabular}[c]{@{}l@{}} ${messdienerList} \\end{tabular} \\\\ \\hline
\\end{tabular}`

    return texStr;
}
import {addSubscription, ListenerEndpoints} from "../../state/state-manager";
import {
    Church,
    Mass,
    Messdiener,
    MessdienerChurchActivityStatus,
    MessdienerMassAllocation
} from "../../../shared/general";
import {ModalManager} from "../../types";
import {ChurchSelector} from "../church/church-selector";
import {setMainAndSidebar} from "../../builder/utilities";
import {MessdienerPreparedList} from "../messdiener/prepared-list";
import {MessdienerAllocator} from "../messdiener/allocator";

let editMassModalCount = 0;

export const generateEditMassModal = (id: number): ModalManager => {
    const thisModalCount = editMassModalCount++;
    const modal = document.createElement("dialog");

    modal.classList.add("mass-edit", "modal", "form");

    const numberOfInputElement = 4;
    const inputElementIDs: string[] = new Array<string>(numberOfInputElement);
    for (let i = 0; i < numberOfInputElement; i++) {
        inputElementIDs[i] = `modal-edit-mass-${thisModalCount}-input-${i}`;
    }

    modal.innerHTML = `
        <h1>Messe bearbeiten</h1>
        <div class="field">
            <label class="label" for="${inputElementIDs[0]}}">Datum</label>
            <input type="date" id="${inputElementIDs[0]}">
        </div>
        <div class="field">
            <label class="label" for="${inputElementIDs[1]}}">Kirche (Final)</label>
            <select is="church-selector" id="${inputElementIDs[1]}"></select>
        </div>
        <div class="field">
            <label class="label" for="${inputElementIDs[2]}}">Notiz (Optional)</label>
            <input type="text" id="${inputElementIDs[2]}">
        </div>
        <div class="field messdiener-allocation">
            <label class="label" for="${inputElementIDs[3]}}">Messdiener Zuweisung</label>
            <messdiener-allocator id="${inputElementIDs[3]}"></messdiener-allocator>
        </div>
        <div class="field controls">
            <button class="cancel">Abbrechen</button>
            <button class="save">Speichern</button>
            <button class="delete">Löschen</button>
        </div>
        `

    document.body.appendChild(modal);

    const inputDate = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[0]);
    const churchSelector = modal.querySelector<ChurchSelector>("#" + inputElementIDs[1]);
    const inputNote = modal.querySelector<HTMLInputElement>("#" + inputElementIDs[2]);
    const messdienerList = modal.querySelector<MessdienerAllocator>("#" + inputElementIDs[3]);

    const saveBtn = modal.querySelector<HTMLButtonElement>("button.save");
    const delBtn = modal.querySelector<HTMLButtonElement>("button.delete");

    if (!inputDate || !churchSelector || !inputNote || !saveBtn || !delBtn || !messdienerList) {
        modal.innerHTML = "<h1>A fatal error occurred!</h1>";
        console.error("Encountered issue with getting inputs of edit mass modal!");
        return {
            element: modal,
            destroy: () => (() => {
                let modalExists = true;
                return () => {
                    if (modalExists) {
                        modal.remove();
                        modalExists = false;
                    }
                }
            })(),
            show: () => modal.showModal(),
            hide: () => modal.close(),
        };
    }

    churchSelector.readonly = true;


    const cancel = addSubscription(ListenerEndpoints.AllMasses, (data: Mass[]) => {
        const mass = data.filter(m => m.id == id)[0];

        const setDate = new Date(Number(String(mass.date).substring(0, 4)),
            Number(String(mass.date).substring(4, 6)) - 1,
            Number(String(mass.date).substring(6, 8)) + 1);
        const setNote = mass.note ? mass.note : "";

        messdienerList.setAllocatedMessdiener(new Set<number>(mass.allocatedMessdiener));
        inputDate.valueAsDate = setDate;
        inputNote.value = setNote;
        churchSelector.initialiseWithStartID(mass.churchID);

        saveBtn.addEventListener("click", () => {
            if (inputDate.valueAsDate != setDate || inputNote.value != setNote) {
                modal.close();
                const numericDate = Number(inputDate.value.split("-").reduce((acc, currentValue) => acc + currentValue));
                 window.electronAPI.editMass({
                    id: mass.id,
                    date: inputDate.valueAsDate != setDate ? numericDate : 0,
                    churchID: 0,
                    note: inputNote.value != setNote ? inputNote.value : undefined,
                    allocatedMessdiener: new Set<number>()
                });
            }
            const setDivergences: MessdienerMassAllocation[] = [];
            const malloced = messdienerList.getAllocatedMessdiener();

            malloced.forEach(messdienerID => {
                if (!mass.allocatedMessdiener.has(messdienerID)) {
                    setDivergences.push({
                        messdienerID: messdienerID,
                        massID: id,
                        isActive: true
                    })
                }
            })
            mass.allocatedMessdiener.forEach(messdienerID => {
                if (!malloced.has(messdienerID)) {
                    setDivergences.push({
                        messdienerID: messdienerID,
                        massID: id,
                        isActive: false
                    })
                }
            })
            if (setDivergences.length != 0) {
                modal.close();
                console.log(setDivergences);
                window.electronAPI.changeMessdienerMassAllocation(setDivergences);
            }
        })
    })

    modal.querySelector<HTMLButtonElement>("button.cancel")?.addEventListener("click", () => modal.close());

    // @TODO implement confirmation
    const attainConfirmation = () => new Promise<void>((resolve) => resolve())

    delBtn.onclick = () => {
        attainConfirmation().then(() => {
            modal.close();
            window.electronAPI.deleteMass(id);
        })
    }

    return {
        element: modal,
        destroy: () => (() => {
            let modalExists = true;
            return () => {
                if (modalExists) {
                    cancel();
                    modal.remove();
                    modalExists = false;
                }
            }
        })(),
        show: () => modal.showModal(),
        hide: () => modal.close(),
    };
}
# Messdiener Planer

Ein Werkzeug zur einfachen Erstellung von Messdienerplänen. Ob für eine Kirche oder gleich mehrere mit überlappenden Messdienern, kann hiermit einfach ein Plan erstellt und als PDF exportiert werden.
## Warum?
Dieses Projekt ist aus der Notwendigkeit entstanden, dass meine Gemeinde einen neuen Plan brauchte, was letztlich auf meinem Schreibtisch landet. Da ich nicht wieder den Plan per Hand erstellen wollte, ist dieses Projekt entstanden. Es besitzt also alle Features, welche meine Gemeinde benötigt. Durch dieses Tool hat das Erstellen des letzten Plans (Stand: initiales Verfassen dieses READMEs) mehrere Stunden weniger gebraucht. 
## Features
- **100% lokal:** Alle Daten bleiben auf dem Gerät, mit welchem der Plan erstellt wird.
- **Klicken statt schreiben:** Statt dass man jede Messe und die Namen selbst schreiben muss, weißt man einfach über die Maus Messdiener einer Messe zu. Sollte später doch noch eine weitere Messe eingefügt werden, muss das Dokument nicht händisch neu formatiert werden.
- **Mehrere Kirchen:** Sofern man mehrere Kirchen erstellt, lassen sich Messdiener den jeweiligen Kirchen zuweisen, in welchen diese dienen wollen. Wenn nun Messdiener einer Messe zugewiesen werden sollen, werden nur jene, die auch in dieser Kirche dienen wollen, angezeigt.
- **Familien:** Es ist üblich, dass aus einer Familie gleich mehrere Geschwister Messdiener sind. Wenn also mehrere Messdiener einer Familie angehörig sind, werden diese automatisch gemeinsam zu einer Messe zugewiesen (sofern alle auch in der jeweiligen Kirche dienen möchten). 
- **Individualisierter Export:** Speziell wenn für mehrere Kirchen geplant wird, kann man einstellen, ob die Messen in einer gewissen Kirche inkludiert werden sollen. Möchte man für alle Messdiener einen Plan erstellen, so inkludiere man alle Messen. Ist ein Plan zum Drucken und aushängen in einer gewissen Kirche benötigt, so wähle man nur diese aus.
- **Erkennung von anderen Kirchen:** Damit man erkennt, wo eine Messe stattfindet, lässt sich automatisch eine Notiz hinzufügen. Gibt es beispielsweise eine "Hauptkirche" und eine Kapelle, so kann man diese Notiz für diese Hauptkirche deaktivieren. Auch lässt sich für die Notiz einstellen, ob der offizielle Name oder der Ort der Kirche gewählt werden soll. Im Beispiel könnte damit "Kapelle" stehen. 
- **Abwesenheiten:** Sofern man weiß, wann wer z.B. im Urlaub ist, lässt sich dies auch eingeben. In diesem Fall wird verhindert, dass die jeweilige Person in diesem Zeitraum eingeplant wird. Dies funktioniert auch mit nur einzelnen Personen einer Familie, auch wenn standardmäßig eine ganze Familie einer Abwesenheit zugeteilt wird. In solch einem Fall kann die Familie dennoch einer Messe zugewiesen werden, jedoch ohne das fehlende Mitglied.
- **Kürzel bei uneindeutige Vornamen:** Sofern man mehrere Messdiener mit gleichem Vornamen hat, wird der (zuvor definierte Kürzel) der Familie verwendet. Dadurch werden Unsicherheiten, wer denn gemeint sei, vorgebeugt. Ist kein Kürzel gesetzt, so wird der Familienname verwendet.
## FAQ
### Wie starte ich und erstelle einen Plan?
0. Das Program installieren und öffnen.
1. Einen Ordner auswählen, in welchem das Program arbeiten darf. 
	In diesem befindet sich dann die Datenbank für den Plan, mögliche Einstellungen und nach dem Export auch das PDF. Es ist Ratsam für jeden Zeitraum, für welchen man einen Plan erstellt, auch einen eigenen Ordner zu erstellen. Sonst finden sich nämlich die alten Messen wieder auf dem Plan.
2. Auf die Seite mit allen Kirchen (=> "Kirchen" in der Seitenleiste) navigieren und dort die Kirchen definieren, für welche der Plan erstellt wird.
	Bei der optionalen Ortseingabe ist Sinnvoll, nicht die Adresse oder sonstiges zu wählen, sondern den in der "Umgangssprache" der Messdiener verankerte Name. Wenn sich die Kirche in einer anderen Gemeinde befindet, könnte dies der passende Ortsname sein. Sollte es sich um eine Kapelle halten oder die Kirche auf dem Friedhof, so könnte man auch dies als Ortsangabe nehmen. Letztlich müssen die Messdiener, welche selbst Ortskenntnisse haben sollten, den Weg finden, nicht Google Maps.
3. Unter "Alle Messdiener" genau diese hinzufügen. 
	Hierbei sollten diese zu der jeweiligen Familie zugewiesen werden, welche ggf. eben dabei erstellt wird. Des weiteren müssen die Messdiener der jeweiligen Kirchen, in welchen diese dienen wollen, zugeteilt werden.
4. Sofern man über Abwesenheiten (z.B. durch Urlaub o.ä.) weiß, kann man diese unter "Abwesenheiten" hinzufügen.
	- In den hier definierten Zeiträumen können die zugewiesenen Messdiener nicht im Plan eingeteilt werden. 
	- Die Daten sind inklusive. 
5. Im Überblick über alle Messen (=> "Messen ändern") die für diesen Plan relevanten Messen erstellen.
	Sollte es sich um eine Besondere Messe handeln, wie beispielsweise Weihnachten, Karfreitag, Patrozinium oder die Messdienereinführung, so sollte dies als Notiz vermerkt werden. Auch Abweichungen in Uhrzeit sollten hier eingegeben werden. Jedoch lautet die Losung: In der Kürze liegt die Würze. "15 Uhr" oder "Patrozinium" reicht völlig aus.
6. Auf die jeweiligen Messen klicken und die Messdienereinteilung definieren.
	Wenn keine Messdiener einer Messe zugewiesen sind, wird dies als "Alle sollen dienen" interpretiert. Wenn für eine Messe keine Messdiener benötigt werden, so sollte diese nicht auf dem Plan stehen.
	Vor dem Familienname steht die Anzahl an Messdiener, welche hinzugefügt werden, wenn man diese Familie zuweißt. Nach dem Namen steht die Anzahl der Messen, zu welcher eine Familie aktuell zugewiesen ist. Dabei werden momentan Messen, zu welchen alle eingeteilt sind, nicht berücksichtigt.
7. Unter "Plan erstellen" den Plan als PDF exportieren.
	- Der Titel, die Version und die Kirchengemeinden müssen gesetzt werden.
	- Die Version ist dafür da, die Pläne einfacher differenzieren zu können. (z.B. 2026.1 für den ersten Plan für 2026)
	- Der Name des erstellten PDFs stellt sich aus dem Titel und der Version zusammen.
	- Soll es eine "Fußnote" auf der ersten Seite des Plans geben, in welchem z.B. ein Verweis  auf die aktuelle Gottesdienstordnung der Gemeinde steht, kann dies unter "Hinweistext" gesetzt werden.
	- Als "Kirchengemeinden" alle Kirchen auswählen, wessen Messen in diesem Planexport aufgenommen werden sollen.
	- Möchte man auf eine Abweichung von der "Hauptkirche" einer Messdienergemeinde aufmerksam machen, so wähle man eine Hauptkirche und und die "Zweitkirchennotiz".
	- Soll diese Notiz die Ortsangabe verwenden, wähle man "Zweitkirchennotiz als Ortsangabe".
	- Wenn keine Hauptkirche ausgewählt wird, werden alle Kirchen als Zweitkirche gewertet.
	- Möchte man die .tex Datei, welche als Zwischenschritt intern erstellt wird, speichern, so kann man dies per ".tex Datei auch speichern".


### Worum handelt es sich bei "Abweichender interner Name"?
Es kommt schon mal vor, dass es zwei Familien mit dem gleichen Nachnamen gibt. Hierbei ist es hilfreich einen internen Namen zur Unterscheidung zu setzen. Sollte es diesen geben, so wird dieser beim Editieren von Messen in Klammern hinter dem Familiennamen angezeigt. Im PDF findet sich dieser Name nirgens. 
### Was ist die Zahl vor dem Familienname?
Hierbei handelt es sich um die Zahl an Messdienern, welche zugewiesen werden.
### Dürfen sich Abwesenheiten überlappen?
Ja. Ein Messdiener darf genau so überlappende Abwesenheitszeiträume haben wie es auch parallele Abwesenheiten geben kann. Empfehlenswert ist es, pro Familie eine Abwesenheit zu erstellen, jedoch für Fahrten und des gleichen eine Abwesenheit mit allen jeweils betroffenen zu erstellen.
### Was ist eine "Hauptkirche" bzw. "Zweitkirche"?
Siehe unter "Wie starte ich und erstelle einen Plan?" den Punkt zum Planexport.
### Darf meine Gemeinde das Werkzeug auch verwenden?
Gerne. Dies ist ein kostenloses Werkzeug.
### Ich habe weitere Fragen bzw. Wünsche und Anregungen
In diesem Fall gerne ein Issue auf GitHub erstellen

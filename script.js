class BezierCurveHelper {

    #svgElem = undefined;
    #points = [];

    constructor(svgElem) {
        this.#svgElem = svgElem;
        svgElem.addEventListener('mousedown', this.#mouseDown.bind(this));
    }

    #getMousePosition(event) {
        var CTM = this.#svgElem.getScreenCTM();
        return {
            x: (event.clientX - CTM.e) / CTM.a,
            y: (event.clientY - CTM.f) / CTM.d
        };
    }

    #mouseDown(event) {
        
        let mousePosition = this.#getMousePosition(event);
        let newPoint = this.#createNewPointAndAppend(mousePosition.x, mousePosition.y, 'red', true);

        let newPointObj = {
            obj: newPoint,
            x: mousePosition.x,
            y: mousePosition.y,
        }

        this.#points.push(newPointObj);
    }

    #createNewPointAndAppend(x, y, color, draggable) {

        let newPoint = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        newPoint.setAttribute('cx', x);
        newPoint.setAttribute('cy', y);
        newPoint.setAttribute('r', 3);
        newPoint.setAttribute('stroke', 'black');
        newPoint.setAttribute('stroke-width', '2');
        newPoint.setAttribute('fill', color);

        if (draggable) {
            newPoint.classList.add('draggable');
        }

        this.#svgElem.append(newPoint);

        return newPoint;
    }    

    clearOldLinesAndPoints() {
        let svgLines = this.#svgElem.querySelectorAll('line');
        let svgPoints = this.#svgElem.querySelectorAll('circle');

        for (let svgLine of svgLines) {
            svgLine.remove();
        }

        for (let svgPoint of svgPoints) {
            if (svgPoint.classList.contains('draggable')) {
                continue;
            }

            svgPoint.remove();
        }
    }

    async start() {
        this.clearOldLinesAndPoints();

        if (this.#points.length <= 2) {
            alert('fuck off');
            return;
        }

        let helpLines = [];

        for (let i = 0; i < this.#points.length - 1; i++) {
            let line = this.#drawLine(this.#points[i], this.#points[i + 1]);
            helpLines.push(line);
        }

        let mainLines = this.#getHelpLines(helpLines);

        for (let t = 0; t <= 1; t += 0.001) {

            await new Promise(resolve => setTimeout(resolve, 5));
            requestAnimationFrame(() => this.#moveHelpLinesKastelzho(helpLines, t));
        }
    }

    #getHelpLines(mainHelpLines) {

        if (mainHelpLines.length == 1) {
            return;
        }

        let helpLines = [];

        for (let i = 0; i < mainHelpLines.length - 1; i++) {
            let color = mainHelpLines.length - 1 < 2 ? 'blue' : 'green';

            let line = this.#drawLine(mainHelpLines[i].startPoint, mainHelpLines[i].endPoint, color);

            line.isSuperMainLine = mainHelpLines.length - 1 < 2;

            helpLines.push(line);
            mainHelpLines[i].helpLine = line;
        }

        this.#getHelpLines(helpLines);
    }

    #moveHelpLinesKastelzho(mainHelpLines, t) {

        if (mainHelpLines.length == 1) {

            let mainLine = mainHelpLines[0];

            let mainPoint = {
                x: mainLine.xStartInitial + mainLine.xLength * t,
                y: mainLine.yStartInitial + mainLine.yLength * t,
            }

            this.#createNewPointAndAppend(mainPoint.x, mainPoint.y, 'blue', false);

            return;
        }

        let helpLines = [];

        for (let i = 0; i < mainHelpLines.length - 1; i++) {
            let startPoint = {
                x: mainHelpLines[i].xStartInitial + mainHelpLines[i].xLength * t,
                y: mainHelpLines[i].yStartInitial + mainHelpLines[i].yLength * t,
            }

            let endPoint = {
                x: mainHelpLines[i + 1].xStartInitial + mainHelpLines[i + 1].xLength * t,
                y: mainHelpLines[i + 1].yStartInitial + mainHelpLines[i + 1].yLength * t,
            }

            this.#setLine(mainHelpLines[i].helpLine, startPoint, endPoint);

            helpLines.push(mainHelpLines[i].helpLine);
        }

        this.#moveHelpLinesKastelzho(helpLines, t);
    }

    #drawLine(point1, point2, color) {
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.#setLine(line, point1, point2);
        line.setAttribute('style', "stroke-width:2;stroke:" + (color ?? 'black') + ';');

        this.#svgElem.append(line);

        return line;
    }

    #setLine(line, point1, point2) {
        line.setAttribute('x1', point1.x);
        line.setAttribute('y1', point1.y);
        line.setAttribute('x2', point2.x);
        line.setAttribute('y2', point2.y);
        line.startPoint = { x: point1.x, y: point1.y };
        line.endPoint = { x: point2.x, y: point2.y };
        line.xLength = point2.x - point1.x;
        line.yLength = point2.y - point1.y;
        line.xStartInitial = point1.x;
        line.yStartInitial = point1.y;
    }
}
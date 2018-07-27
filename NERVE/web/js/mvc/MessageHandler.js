module.exports = class MessageHandler {
    constructor(element) {
        this.container = null;
        this.setContainer(element);
    }
    setContainer(element) {
        this.container = element;
    }
    userMessage(string, duration = 3000) {
        let msgElement = document.createElement("div");
        msgElement.className = "userMessageElement";
        $(this.container).append(msgElement);

        msgElement.style.display = 'block';
        msgElement.innerText = string;

        let timeDelta = 50;
        let opacity = 1;
        let opacityDelta = timeDelta / 1000;
        let time = duration;

        msgElement.style.opacity = opacity;
        msgElement.style.filter = 'alpha(opacity=' + opacity * 100 + ")";

        let showMessageTimer = setInterval(function () {
            if (time <= 1000) {
                opacity -= opacityDelta;
                msgElement.style.opacity = opacity;
                msgElement.style.filter = 'alpha(opacity=' + opacity * 100 + ")";
            }

            time -= timeDelta;
            if (time <= 0.0) {
                clearInterval(showMessageTimer);

                $(msgElement).remove();
                showMessageTimer = null;
            }
        }.bind(this), timeDelta);
    }
};
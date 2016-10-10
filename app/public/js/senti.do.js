var sentido = {

    questions: function (user, req, top) {

        top = this;
        req = new XMLHttpRequest();
        req.responseType = 'json';
        req.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                return top.populate(this.response);
            }
        };

        req.open('GET', '/messenger/' + user + '/questions', true);
        req.send();
    },

    populate: function (questions, top) {

        top = this;
        questions.forEach(function (question) {
            var _div = $('<div class="question">'),
                _tally = $('<ul class="tally">');

            _tally.append($('<li class="yes">')
                .css('width', top.getWidth('yes', question))
                .html('Yes (' + question.tally.yes + ')'));

            _tally.append($('<li class="no">')
                .css('width', top.getWidth('no', question))
                .html('No (' + question.tally.no + ')'));

            _tally.append($('<li class="pass">')
                .css('width', top.getWidth('pass', question))
                .html('Pass (' + question.tally.pass + ')'));

            _div.append($('<p>').html(question.text));
            _div.append($('<span>').html(question.meta.askedOn));
            _div.append(_tally);

            $('.container').append(_div);
        });
    },

    getWidth: function (item, question, percent) {

        percent = (question.tally[item] * 100) / question.tally[question.largest];
        percent = Math.ceil(percent);
        return (percent < 40 ? (20 + percent * 2) : percent) + '%';
    }
};

window.extAsyncInit = function () {

    MessengerExtensions.getUserID(function success(uids) {
        sentido.questions(uids.psid);
    }, function error() {
        MessengerExtensions.requestCloseBrowser(function success() {}, function error() {});
    });
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = '//connect.facebook.com/en_US/messenger.Extensions.js';
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'Messenger'));

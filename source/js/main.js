(function($) {
    "use strict";

    //LOCAL STORAGE SETUP AND CHECK ON PAGE LOAD
    $(document).ready(function() {
        var allGames = [];
        var storage = {
            set: function() {
                localStorage.setItem('games', JSON.stringify(allGames));
            },
            get: function() {
                var games = localStorage.games === undefined ? false :
                    localStorage.games;
                return JSON.parse(games);
            }
        };

        function startGame() {
            $('.start-new-game').hide();
            if (storage.get()) {
                var games = storage.get();
                for (var index = 0; index < games.length; index++) {
                    new Game(games[index]);
                }
            } else {
              var game = {
                score: 0,
                right: 0,
                wrong: 0
              };
                new Game(game);
            }
        }

        //PROTOTYPE METHODS
        Game.prototype = {
            buildGame: function(game) {
                var source = $('#game-template').html(),
                    template = Handlebars.compile(source),
                    context = "",
                    html = template(context);
                $('.wrapper').append(html);
                this.getQuestion();
                return $('.game-container').last();
            },
            getQuestion: function() {
                var self = this;
                $.get('http://jservice.io/api/random', function(response) {
                    self.askQuestion(self.parseResponse(response[0]));
                });
            },
            parseResponse: function(response) {
                var params = {
                    question: response.question,
                    answer: response.answer,
                    category: response.category.title.toUpperCase(),
                    value: response.value
                };
                $(this.self[0]).find('.user-answer').val("");
                return params;
            },
            askQuestion: function(params) {
                this.values.answer = params.answer;
                $(this.self[0]).find('.category').html(params.category);
                $(this.self[0]).find('.question').html(params.question);
                $(this.self[0]).find('.question-value').html(params.value);
            },
            getUserAnswer: function() {
                var userAnswer = $(this.self[0]).find('.user-answer').val();
                $(this.self[0]).find('.user-answer').val("");
                this.postResult(this.checkAnswer(userAnswer));
            },
            checkAnswer: function(userAnswer) {
                userAnswer = userAnswer.split(' ');
                var tempAnswer = this.values.answer.replace(/(<([^>]+)>)/ig, "");
                var correctAnswer = tempAnswer.toLowerCase().split(' ');
                for (var index = 0; index < userAnswer.length; index++)
                    if (correctAnswer.indexOf(userAnswer[index]) == -1) {
                        return false;
                    } else {
                        return true;
                    }
            },
            postResult: function(result) {
                if (result) {
                    $(this.self[0]).find('.result').html("CORRECT!!!");
                } else {
                    $(this.self[0]).find('.result').html("NO. The correct answer was " + this.values.answer + ".");
                }
                this.updateScores(this.calculateScores(result));
            },
            calculateScores: function(result) {
                var curScore = this.values.score,
                    curRight = this.values.right,
                    curWrong = this.values.wrong,
                    questionValue = $('.question-value').html(),
                    scores = null;
                questionValue = Number(questionValue);
                if (result) {
                    scores = [curScore + questionValue, curRight + 1, curWrong];
                } else {
                    scores = [curScore - questionValue, curRight, curWrong + 1];
                }
                return scores;
            },
            updateScores: function(scores) {
                if (scores === undefined) {
                    scores = [0, 0, 0];
                }
                this.values.score = scores[0];
                $(this.self[0]).find('.score span').html(scores[0]);
                this.values.right = scores[1];
                $(this.self[0]).find('.number-right span').html(scores[1]);
                this.values.wrong = scores[2];
                $(this.self[0]).find('.number-wrong span').html(scores[2]);
                this.getQuestion();
                for (var i = 0; i < allGames.length; i++) {
                  if (allGames[i].id === this.values.id) {
                    allGames[i] = this.values;
                  }
                }
                storage.set();
            },

            deleteGame: function () {
              $(this.self[0]).remove();
              if ($('.game-container').length === 0) {
                  $('.start-new-game').show();
              }
              for (var i = 0; i < allGames.length; i++) {
                if (allGames[i].id === this.values.id) {
                  allGames.splice(i, 1);
                }
              }
              storage.set();
            }
        };

        //CONSTRUCTOR
        function Game(game) {
            this.self = "";
            this.values = {
                answer: null,
                score: game.score,
                right: game.right,
                wrong: game.wrong,
                id: Date.now()
            };
            this.init = function(game) {
                var self = this;
                this.self = this.buildGame(game);
                $(this.self[0]).find('form').on('submit', function(event) {
                    event.preventDefault();
                    self.getUserAnswer();
                });
                $(this.self[0]).find('.pose-question').on('click', function(event) {
                    self.getUserAnswer();
                });
                $(this.self[0]).find('.remove-game-button').on('click', function() {
                    self.deleteGame();
                });
                $(this.self[0]).find('.user-answer').attr('readonly', false);
            };
            this.init();
            allGames.push(this.values);
            storage.set();
        }

        //EVENT HANDLING
        $('.start-button').on('click', startGame());

        $('.wrapper').on('click', '.new-game-button', function() {
            startGame();
        });
    });
})(jQuery);

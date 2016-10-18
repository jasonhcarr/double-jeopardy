(function($) {
    "use strict";
    $(document).ready(function() {
        var allGames = [];
        var storage = {
            set: function() {
                localStorage.setItem('games', JSON.stringify(allGames));
            },
            get: function() {
                var games = localStorage.games === undefined ? false :
                    localStorage.ghosts;
                return JSON.parse(games);
            }
        };

        //VARIABLE DECLARATIONS
        //
        var games = [];
        //PROTOTYPE METHODS
        Game.prototype = {
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
                console.log(params.answer);
                $('.user-answer').val("");
                return params;
            },

            askQuestion: function(params) {
                this.values.answer = params.answer;
                $('.category').html(params.category);
                $('.question').html(params.question);
                $('.question-value').html(params.value);
            },

            getUserAnswer: function() {
                var userAnswer = "";
                var self = this;
                $('form').on('submit', function(event) {
                    event.preventDefault();
                    userAnswer = $('.user-answer').val();
                    $('.user-answer').val("");
                    self.postResult(self.checkAnswer(userAnswer));
                });

                $('.pose-question').on('click', function(event) {
                    userAnswer = $('.user-answer').val();
                    $('.user-answer').val("");
                    self.postResult(self.checkAnswer(userAnswer));
                });
            },

            checkAnswer: function(userAnswer) {
                userAnswer = userAnswer.split(' ');
                var correctAnswer = this.values.answer.toLowerCase().split(' ');
                for (var index = 0; index < userAnswer.length; index++)
                    if (correctAnswer.indexOf(userAnswer[index]) == -1) {
                        return false;
                    } else {
                        return true;
                    }
            },

            postResult: function(result) {
                if (result) {
                    $('.result').html("CORRECT!!!");
                } else {
                    $('.result').html("NO. The correct answer was " + this.values.answer + ".");
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
                scores = [curScore + questionValue, curRight+1, curWrong];
              } else {
                scores = [curScore - questionValue, curRight, curWrong+1];
              }
              return scores;
            },

            updateScores: function(scores) {
              if (scores === undefined) {
                scores = [0,0,0];
              }
                this.values.score = scores[0];
                $('.score span').html(scores[0]);
                this.values.right = scores[1];
                $('.number-right span').html(scores[1]);
                this.values.wrong = scores[2];
                $('.number-wrong span').html(scores[2]);
            }
        };

        //CONSTRUCTOR
        function Game(game) {
            this.values = {
              answer: null,
              score: 0,
              right: 0,
              wrong: 0,
              index: null
            };
            // this.info = gameInfo;
            this.init = function(game) {
                this.getQuestion();
                this.getUserAnswer();
                $('.user-answer').attr('readonly', false);
                this.updateScores(game);
            };
            this.init();
        }

        //clicking on the "start new game" button does as advertised
        $('.start-new-game').on('click', function() {
            new Game();
        });
    });
})(jQuery);

class QuestionService {
  constructor() {
    this.questions = null;
    this.initilized = false;
  }
  async fetchQuestions() {
    this.initilized = true;
    this.questions = [
      {
        id: '1',
        question: "Raynaud's symptoms have caused pain in my fingers",
        answers: [
          'Not at all',
          'A little bit',
          'Somewhat',
          'Quite a bit',
          'Very much',
        ],
      },
      {
        id: '2',
        question:
          "Raynaud's symptoms have made it difficult to use my fingers",
        answers: [
          'Not at all',
          'A little bit',
          'Somewhat',
          'Quite a bit',
          'Very much',
        ],
      },
      {
        id: '3',
        question: "Raynaud's symptoms have made me worry about my ability to do things",
        answers: [
          'Not at all',
          'A little bit',
          'Somewhat',
          'Quite a bit',
          'Very much',
        ],
      },
      {
        id: '4',
        question: "Raynaud's symptoms have made me frustrated",
        answers: [
          'Not at all',
          'A little bit',
          'Somewhat',
          'Quite a bit',
          'Very much',
        ],
      },
      {
        id: '5',
        question:
          "Raynaud's symptoms have made me irritable",
        answers: [
          'Not at all',
          'A little bit',
          'Somewhat',
          'Quite a bit',
          'Very much',
        ],
      },
      {
        id: '6',
        question: "Raynaud's symptoms have caused feelings of despiar / loss of hope",
        answers: [
          'Not at all',
          'A little bit',
          'Somewhat',
          'Quite a bit',
          'Very much',
        ],
      },
      {
        id: '7',
        question: "Being unable to do normal things because of Raynaud's symptoms has bothered me",
        answers: [
          'Not at all',
          'A little bit',
          'Somewhat',
          'Quite a bit',
          'Very much',
        ],
      },
      {
        id: '8',
        question: "Raynaud's symptoms have made it difficult to do work around the house",
        answers: [
          'Not at all',
          'A little bit',
          'Somewhat',
          'Quite a bit',
          'Very much',
        ],
      },
      {
        id: '9',
        question: "Raynaud's symptoms have made social events / doing exercise difficult",
        answers: [
          'Not at all',
          'A little bit',
          'Somewhat',
          'Quite a bit',
          'Very much',
        ],
      },
      {
        id: '10',
        question: "Raynaud's symptoms have had an effect on my personal / private life",
        answers: [
          'Not at all',
          'A little bit',
          'Somewhat',
          'Quite a bit',
          'Very much',
        ],
      },
    ];
    return Promise.resolve(this.questions);
  }
  getQuestions() {
    return this.questions;
  }
}

export default QuestionService;

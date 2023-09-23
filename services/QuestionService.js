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
          "Raynaud's symptoms have made my fingers tender / hypersensitive to touch",
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
        question: "Raynaud's symptoms have caused tingling in my fingers",
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
        question: "Raynaud's symptoms have made my fingers feel cold",
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
          "Raynaud's symptoms have made my fingers change one or more colours (white/blue/red/purple etc.)",
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
        question: "Raynaud's symptoms have made it difficult to use my fingers",
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

import {useCallback, useEffect, useMemo, useState} from 'react';
import Voice from '@react-native-voice/voice';
import TTS from 'react-native-tts';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Platform} from 'react-native';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Button, Divider, Text, LinearProgress} from '@rneui/themed';
import QuestionService from '../../services/QuestionService';
import useTrait from '../../hooks/useTrait';
// import Icon from 'react-native-vector-icons/AntDesign';

export const Questionnaire = () => {
  const questionService = new QuestionService();

  const QUESTIONNAIRE_STATES = {
    BEFORE_STARTING: 'BEFORE_STARTING',
    STARTED: 'START',
    LOADING: 'LOADING',
    FINISHED: 'FINISHED',
    SAVING: 'SAVING',
    SAVED: 'SAVED',
  };

  const TTS_STATES = {
    STARTED: 'STARTED',
    FINISHED: 'FINISHED',
    CANCELLED: 'CANCELLED',
  };

  const numbersInWords = {
    one: 1,
    to: 2,
    too: 2,
    two: 2,
    three: 3,
    four: 4,
    for: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
  };

  // FLAGS
  const found = useTrait(false);
  const isVoiceStartupDisabled = useTrait(false);

  // VOICE
  const [partialResults, setPartialResults] = useState('');

  // TTS
  const [ttsState, setTtsState] = useState();

  // QUESTIONS
  const [questions, setQuestions] = useState([]);

  // QUESTIONAIRE STATUS
  const [qStatus, setQStatus] = useState({
    state: QUESTIONNAIRE_STATES.BEFORE_STARTING,
    questionIdx: 0,
    answeredQuestions: [],
    externalData: {},
  });

  const stopRecording = () => {
    return Voice.stop();
  };

  const startRecording = () => {
    return Voice.start('en-US');
  };

  // VOICE HANDLERS
  function onSpeechStart(e) {
    console.log('onSpeechStart: ', e);
  }
  function onSpeechEnd(e) {
    console.log('onSpeechEnd: ', e);
  }
  function onSpeechPartialResults(e) {
    console.log('onSpeechPartialResults: ', e);
    setPartialResults(e.value);
  }

  function onSpeechError(e) {
    console.log('onSpeechError', e);
  }

  // TTS HANDLERS
  function ttsStartHandler(e) {
    console.log('TTS STARTED');
    setTimeout(() => {
      found.set(false);
      isVoiceStartupDisabled.set(false);
    }, 1000);
    setTtsState(TTS_STATES.STARTED);
  }

  function ttsFinishHandler(e) {
    console.log('TTS FINISHED');
    setTtsState(TTS_STATES.FINISHED);
  }

  function ttsCancelHandler(e) {
    console.log(e);
    setTtsState(TTS_STATES.CANCELLED);
  }

  useEffect(() => {
    // INIT FUNCTION
    async function init() {
      try {
        const ttsInitStatus = await TTS.getInitStatus();
        if (!ttsInitStatus) {
          throw new Error('TTS initialization Failed');
        }
        TTS.addEventListener('tts-start', ttsStartHandler);
        TTS.addEventListener('tts-finish', ttsFinishHandler);
        TTS.addEventListener('tts-cancel', ttsCancelHandler);
        if (Platform.OS === 'ios') {
          TTS.addEventListener('tts-start', ttsStartHandler);
          TTS.addEventListener('tts-finish', ttsFinishHandler);
          TTS.addEventListener('tts-cancel', ttsCancelHandler);
        }
      } catch (error) {
        // TODO: HANDLE ERRORS IN TTS INITIALIZATION
        console.log('TTS INITIALIZATION ERROR', error);
      }
      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechEnd = onSpeechEnd;

      Voice.onSpeechResults = onSpeechPartialResults;
      if (Platform.OS === 'android')
        Voice.onSpeechPartialResults = onSpeechPartialResults;
      Voice.onSpeechError = onSpeechError;

      try {
        const questions = await questionService.fetchQuestions();
        setQuestions(questions);
      } catch (error) {
        //TODO: HANDLE ERRORS WHEN QUESTIONS CAN NOT BE FETCHED
        console.log('QUESTION FETCH ERROR', error);
      }
    }
    init();

    return () => {
      if (Platform.OS === 'ios') {
        TTS.removeEventListener('tts-start', ttsStartHandler);
        TTS.removeEventListener('tts-finish', ttsFinishHandler);
        TTS.removeEventListener('tts-cancel', ttsCancelHandler);
      }
      TTS.stop().catch(error => console.log('TTS STOP FAILED', error));
      Voice.destroy().catch(error =>
        console.log('DESTORYING VOICE FAILED', error),
      );
    };
  }, []);

  const getWeather = async (lat, lon) => {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=0bb2954984e58b4696605e92623b8626`,
    );
    const weatherData = await weatherResponse.json();
    return {
      city: weatherData.name,
      country: weatherData.sys.country,
      temperature: (((weatherData.main.temp - 273.15) * 9) / 5 + 32).toFixed(2),
      description: weatherData.weather[0].description,
    };
  };

  const fetchGeoLocation = async () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition((info, error) => {
        if (error) {
          return reject(error);
        }
        return resolve(info);
      });
    });
  };

  const getExternalInformation = async () => {
    let location = {},
      weather = {};
    try {
      location = await fetchGeoLocation();
    } catch (ex) {
      console.error('Could not fetch location', ex);
    }

    if (!location) return [location, weather];

    try {
      weather = await getWeather(
        location.coords.latitude,
        location.coords.longitude,
      );
    } catch (ex) {
      console.error('could not fetch weather', ex);
    }

    return [location, weather];
  };

  const nextQuestion = async () => {
    console.log('NEXT QUESTION');
    isVoiceStartupDisabled.set(true);
    try {
      await TTS.stop();
    } catch (error) {
      console.log('TTS stop failed at next question');
    }
    if (qStatus.questionIdx + 1 >= questions.length) {
      return setQStatus(q => ({...q, state: QUESTIONNAIRE_STATES.LOADING}));
    }
    setQStatus(q => ({...q, questionIdx: q.questionIdx + 1}));
  };

  const selectAnswer = answer => {
    stopRecording().then(
      setQStatus(q => {
        return {
          ...q,
          answeredQuestions: [
            ...q.answeredQuestions,
            {
              questionObj: questions[qStatus.questionIdx],
              patientAnswer: answer,
            },
          ],
        };
      }),
    );
  };

  const startQuestionnaire = () => {
    return setQStatus(q => ({...q, state: QUESTIONNAIRE_STATES.STARTED}));
  };

  const restartQuestionnaire = () => {
    setQStatus({
      state: QUESTIONNAIRE_STATES.BEFORE_STARTING,
      questionIdx: 0,
      answeredQuestions: [],
      externalData: {},
    });
  };

  const readQuestion = async () => {
    const {question, answers} = questions[qStatus.questionIdx];

    const text =
      'Question ' + (qStatus.questionIdx + 1) + '. ' + question + '; ';

    const ans = answers
      .map((ans, index) => {
        if (qStatus.questionIdx == 0) return index + 1 + ', ' + ans;
        return index + 1 + ', ';
      })
      .join();

    TTS.getInitStatus().then(() => {
      TTS.speak(text + ans);
    });
  };

  const saveData = async () => {
    // TODO: ADD LOADING
    const history = await AsyncStorage.getItem('history');
    const newHistory = history ? JSON.parse(history) : [];
    if (newHistory.length >= 3) {
      Alert.alert(
        'File Limit Reached',
        'You have reached the limit of stored records. If you save this data, the oldest record will be deleted.',
        [
          {
            text: 'Ok',
            onPress: async () => {
              setQStatus(q => ({...q, state: QUESTIONNAIRE_STATES.SAVING}));
              newHistory.shift(); // Remove the oldest questionnaire from the start
              newHistory.push({
                answeredQuestions: qStatus.answeredQuestions,
                externalData: qStatus.externalData,
              });
              await AsyncStorage.setItem('history', JSON.stringify(newHistory));
              setQStatus(q => ({...q, state: QUESTIONNAIRE_STATES.SAVED}));
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
      );
    } else {
      setQStatus(q => ({...q, state: QUESTIONNAIRE_STATES.SAVING}));
      newHistory.push({
        answeredQuestions: qStatus.answeredQuestions,
        externalData: qStatus.externalData,
      });
      await AsyncStorage.setItem('history', JSON.stringify(newHistory));
      // TODO: NOTIFY SAVED
      setQStatus(q => ({...q, state: QUESTIONNAIRE_STATES.SAVED}));
    }
  };

  // CHECK CHAGES ON SAVED ANSWERED QUESTIONS
  useEffect(() => {
    if (qStatus.state === QUESTIONNAIRE_STATES.BEFORE_STARTING) return;
    nextQuestion();
  }, [qStatus.answeredQuestions]);

  // READ QUESTION ON INDEX UPDATE
  useEffect(() => {
    if (qStatus.state !== QUESTIONNAIRE_STATES.STARTED) return;
    readQuestion();
  }, [qStatus.questionIdx]);

  // HANDLE PARTIAL RESULT CHANGES
  useEffect(() => {
    console.log(found.get());
    if (qStatus.state === QUESTIONNAIRE_STATES.BEFORE_STARTING || found.get())
      return;

    const {answers} = questions[qStatus.questionIdx];

    const text = partialResults[0];
    if (!text) return;

    const words = text.split(' ');
    const number = words[words.length - 1].toLowerCase();

    if (numbersInWords[number] && numbersInWords[number] <= answers.length) {
      console.log('FOUND FOUND FOUND');
      found.set(true);
      selectAnswer(answers[numbersInWords[number] - 1]);
    } else {
      for (const answ of answers) {
        if (text.toLowerCase().includes(answ.toLowerCase())) {
          found.set(true);
          console.log('FOUND FOUND FOUND');
          selectAnswer(answ);
        }
      }
    }
  }, [partialResults]);

  // QUESTIONNAIRE STATE CHANGE
  useEffect(() => {
    if (qStatus.state == QUESTIONNAIRE_STATES.STARTED) {
      if (qStatus.questionIdx === 0) readQuestion();
    }

    if (qStatus.state == QUESTIONNAIRE_STATES.LOADING) {
      getExternalInformation().then(information => {
        const [location, weather] = information;
        const timestamp = new Date();
        setQStatus(q => ({
          ...q,
          externalData: {
            timestampLocale: timestamp.toLocaleString(),
            timestampUTC: timestamp.toISOString(),
            weather: weather,
            location: location,
          },
          state: QUESTIONNAIRE_STATES.FINISHED,
        }));
      });
    }
  }, [qStatus.state]);

  useEffect(() => {
    if (ttsState === TTS_STATES.FINISHED) {
      if (!isVoiceStartupDisabled.get()) {
        console.log('VOICE STARUP IS NOT DISABLED');
        startRecording();
      }
    }
    if (ttsState === TTS_STATES.CANCELLED) {
      try {
        stopRecording();
      } catch (error) {
        console.log('STOP RECORDING FAILED AT TTS STATE');
      }
    }
  }, [ttsState]);

  // UI LOGIC

  if (qStatus.state == QUESTIONNAIRE_STATES.BEFORE_STARTING) {
    return (
      <View style={styles.containerStart}>
        <View style={styles.constainerInstructions}>
          <Text
            h3
            style={{
              marginBottom: 10,
              color: '#4388d6',
            }}>
            Instructions
          </Text>
          <Text style={{marginBottom: 5, fontSize: 16}}>
            The Questionnaire consists of multiple multi-choice questions.
          </Text>
          <Text style={{marginBottom: 5, fontSize: 16}}>
            You can answer each question by speaking the answer in full or the
            number associated with the answer. The questionnaire can also be
            completed by manually selecting the answers.
          </Text>
          <Text style={{marginBottom: 5, fontSize: 16}}>
            After going though the questionnaire you can save your answers and
            view them in the history page or restart the questionnaire from the
            beggining.
          </Text>
          <Text style={{fontSize: 16}}>
            Press the <Text style={{color: '#4388d6'}}>"Start"</Text> button to
            begin the questionnaire
          </Text>
        </View>
        <View>
          <Button
            title="Start"
            size="lg"
            titleStyle={{
              color: 'white',
              fontSize: 25,
              fontWeight: 'bold',
            }}
            containerStyle={{
              borderRadius: 30,
              width: 300,
            }}
            onPress={startQuestionnaire}
          />
        </View>
      </View>
    );
  }

  if (qStatus.state == QUESTIONNAIRE_STATES.STARTED) {
    return (
      <View style={styles.containerQuestionnaire}>
        <View style={styles.containerQuestion}>
          <Text
            h3
            style={{
              marginBottom: 10,
              color: '#4388d6',
            }}>
            Question {qStatus.questionIdx + 1}
          </Text>
          <Text style={{fontSize: 20}}>
            {questions[qStatus.questionIdx].question}
          </Text>
        </View>
        <View accessible={Platform.OS === 'android' ? true : false}>
          {questions[qStatus.questionIdx].answers.map((ans, answerIndex) => {
            return (
              <Button
                title={`${answerIndex + 1}.   ${ans}`}
                accessible={Platform.OS === 'android' ? true : false}
                accessibilityLabelledBy={answerIndex + 1}
                titleStyle={{
                  color: 'white',
                  fontSize: 25,
                  fontWeight: 'bold',
                }}
                containerStyle={{
                  borderRadius: 10,
                  width: 300,
                  marginBottom: 10,
                }}
                key={`${questions[qStatus.questionIdx].id}-${ans}`}
                onPress={() => selectAnswer(ans)}
              />
            );
          })}
        </View>
      </View>
    );
  }

  if (qStatus.state == QUESTIONNAIRE_STATES.LOADING) {
    if (
      qStatus.questionIdx != 0 &&
      qStatus.questionIdx + 1 === questions.length
    ) {
      return (
        <View style={styles.containerResults}>
          <Text h3 style={{color: '#4388d6', marginBottom: 12}}>
            Collecting Results...
          </Text>
          <LinearProgress
            color="primary"
            animation={{duration: 700}}
            value={1}
          />
        </View>
      );
    }
  }

  if (qStatus.state == QUESTIONNAIRE_STATES.SAVING) {
    return (
      <View style={styles.containerResults}>
        <Text h3 style={{color: '#4388d6', marginBottom: 12}}>
          Saving...
        </Text>
        <LinearProgress color="primary" animation={{duration: 700}} value={1} />
      </View>
    );
  }

  if (qStatus.state == QUESTIONNAIRE_STATES.SAVED) {
    return (
      <View style={styles.containerSaved}>
        <Text style={{color: '#4ec747', fontSize: 50}}>Saved</Text>
      </View>

      // <View></View>
    );
  }

  if (qStatus.state == QUESTIONNAIRE_STATES.FINISHED) {
    return (
      <ScrollView>
        <View style={styles.containerResults}>
          <View>
            <View style={{marginBottom: 15}}>
              <Text style={{fontSize: 20, color: '#4388d6'}}>
                {' '}
                Timestamp:{' '}
                <Text style={{fontSize: 15}}>
                  {qStatus.externalData.timestampLocale}
                </Text>
              </Text>
            </View>
            <View style={{marginBottom: 15}}>
              <Text style={{fontSize: 20, color: '#4388d6'}}>
                {' '}
                Location:{' '}
                <Text style={{fontSize: 15}}>
                  {qStatus.externalData.weather.city},{' '}
                  {qStatus.externalData.weather.country}
                </Text>
              </Text>
            </View>
            <View style={{marginBottom: 15}}>
              <Text style={{fontSize: 20, color: '#4388d6'}}>
                {' '}
                Weather:{' '}
                <Text style={{fontSize: 15, textTransform: 'capitalize'}}>
                  {qStatus.externalData.weather.description}{' '}
                </Text>
              </Text>
            </View>
            <View style={{marginBottom: 15}}>
              <Text style={{fontSize: 20, color: '#4388d6'}}>
                {' '}
                Temperature:{' '}
                <Text style={{fontSize: 15}}>
                  {' '}
                  {qStatus.externalData.weather.temperature} °F{' '}
                </Text>
              </Text>
            </View>
          </View>

          {qStatus.answeredQuestions.map((q, qIdx) => {
            return (
              <View key={`${q.questionObj.question}-${q.patientAnswer}`}>
                <View style={{marginBottom: 15}}>
                  <Text h3 style={{color: '#4388d6', marginBottom: 12}}>
                    Question {qIdx + 1}
                  </Text>
                  <Text style={{fontSize: 20, marginBottom: 5}}>
                    {q.questionObj.question}
                  </Text>
                  <Text style={{fontSize: 25, color: '#4388d6'}}>
                    Answer:{' '}
                    <Text style={{fontSize: 20}}>{q.patientAnswer}</Text>
                  </Text>
                </View>
                <Divider
                  inset={true}
                  insetType="middle"
                  style={{marginBottom: 15}}
                />
              </View>
            );
          })}

          <View style={styles.constinerResultsButtons}>
            <Button
              title={'Save'}
              buttonStyle={{
                borderWidth: 2,
                borderColor: '#4388d6',
                borderRadius: 10,
              }}
              titleStyle={{
                color: 'white',
                fontSize: 25,
                width: 120,
                fontWeight: 'bold',
              }}
              onPress={() => saveData()}
            />

            <Button
              title={'Restart'}
              buttonStyle={{
                borderWidth: 2,
                borderColor: '#4388d6',
                borderRadius: 10,
              }}
              titleStyle={{
                color: '#4388d6',
                fontSize: 25,
                width: 120,
                fontWeight: 'bold',
              }}
              type="outline"
              onPress={restartQuestionnaire}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  return <View></View>;
};

const styles = StyleSheet.create({
  containerStart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: '100%',
  },

  constainerInstructions: {
    marginHorizontal: 25,
  },

  containerStartButton: {},

  containerQuestionnaire: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  containerQuestion: {
    paddingHorizontal: 25,
  },

  containerResults: {
    marginVertical: 30,
    marginHorizontal: 15,
  },
  containerSaved: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    marginTop: 50,
  },

  constinerResultsButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 10,
  },
});

import {View, StyleSheet, ScrollView} from 'react-native';
import {Divider, Text} from '@rneui/themed';

export const RecordView = props => {
  const {route} = props;
  const record = route.params.record;

  return (
    <ScrollView>
      <View style={styles.containerResults}>
        <View>
          <View style={{marginBottom: 15}}>
            <Text style={{fontSize: 20, color: '#4388d6'}}>
              {' '}
              Timestamp:{' '}
              <Text style={{fontSize: 15}}>
                {record.externalData.timestampLocale}
              </Text>
            </Text>
          </View>
          <View style={{marginBottom: 15}}>
            <Text style={{fontSize: 20, color: '#4388d6'}}>
              {' '}
              Location:{' '}
              <Text style={{fontSize: 15}}>
                {record.externalData.weather.city},{' '}
                {record.externalData.weather.country}
              </Text>
            </Text>
          </View>
          <View style={{marginBottom: 15}}>
            <Text style={{fontSize: 20, color: '#4388d6'}}>
              {' '}
              Weather:{' '}
              <Text style={{fontSize: 15, textTransform: 'capitalize'}}>
                {record.externalData.weather.description}{' '}
              </Text>
            </Text>
          </View>
          <View style={{marginBottom: 15}}>
            <Text style={{fontSize: 20, color: '#4388d6'}}>
              {' '}
              Temperature:{' '}
              <Text style={{fontSize: 15}}>
                {' '}
                {record.externalData.weather.temperature} °F{' '}
              </Text>
            </Text>
          </View>
        </View>

        {record.answeredQuestions.map((q, qIdx) => {
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
                  Answer: <Text style={{fontSize: 20}}>{q.patientAnswer}</Text>
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  containerResults: {
    marginVertical: 30,
    marginHorizontal: 15,
  },
});

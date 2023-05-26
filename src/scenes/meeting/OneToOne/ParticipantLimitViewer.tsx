import React from 'react';
import {Text, View} from 'react-native';
import Button from '../../../Components/Button';
import {useMeeting} from '@videosdk.live/react-native-sdk';

export default function ParticipantLimitViewer() {
  const {leave} = useMeeting({});
  return (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
      }}>
      <Text
        style={{
          color: '#FFFFFF',
        }}>
        OOPS !!
      </Text>
      <Text
        style={{
          color: '#FFFFFF',
          textAlign: 'center',
          marginTop: 20,
        }}>
        Maximun 2 participants can join this meeting.
      </Text>
      <Text
        style={{
          color: '#818181',
          marginTop: 10,
        }}>
        Please try again later
      </Text>

      <Button
        backgroundColor={'#5568FE'}
        text="Ok"
        onPress={() => {
          leave();
        }}
        style={{
          paddingHorizontal: 30,
          height: 50,
          marginTop: 30,
        }}
        textStyle={{}}
      />
    </View>
  );
}

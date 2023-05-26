import React from 'react';
import {
  View,
  Text,
  Clipboard,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useMeeting} from '@videosdk.live/react-native-sdk';
import {
  CallEnd,
  CameraSwitch,
  Copy,
  MicOff,
  MicOn,
  VideoOff,
  VideoOn,
} from '../../../assets/icons';
import IconContainer from '../../../Components/IconContainer';
import LocalViewContainer from './LocalViewContainer';
import {LargeViewContainer} from './LargeView';
import {MiniViewContainer} from './MiniView';

export default function OneToOneMeetingViewer() {
  const {
    participants,
    localWebcamOn,
    localMicOn,
    leave,
    changeWebcam,
    toggleWebcam,
    toggleMic,
    meetingId,
  } = useMeeting({
    onError: data => {
      const {code, message} = data;
      console.log(`Error: ${code}: ${message}`);
    },
  });

  const participantIds = [...participants.keys()];

  const participantCount = participantIds ? participantIds.length : null;

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                fontSize: 16,
                color: '#FFFFFF',
              }}>
              {meetingId ? meetingId : 'xxx - xxx - xxx'}
            </Text>

            <TouchableOpacity
              style={{
                justifyContent: 'center',
                marginLeft: 10,
              }}
              onPress={() => {
                Clipboard.setString(meetingId);
                console.log('Meeting Id copied Successfully');
              }}>
              <Copy fill={'#FFFFFF'} width={18} height={18} />
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              changeWebcam();
            }}>
            <CameraSwitch height={26} width={26} fill={'#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Center */}
      <View style={{flex: 1, marginTop: 8, marginBottom: 12}}>
        {participantCount! > 1 ? (
          <>
            <LargeViewContainer participantId={participantIds[1]} />
            <MiniViewContainer participantId={participantIds[0]} />
          </>
        ) : participantCount === 1 ? (
          <LocalViewContainer participantId={participantIds[0]} />
        ) : (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size={'large'} />
          </View>
        )}
      </View>
      {/* Bottom */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        <IconContainer
          backgroundColor={'red'}
          onPress={() => {
            leave();
          }}
          Icon={() => {
            return <CallEnd height={26} width={26} fill="#FFF" />;
          }}
        />
        <IconContainer
          style={{
            borderWidth: 1.5,
            borderColor: '#2B3034',
          }}
          backgroundColor={!localMicOn ? '#FFFFFF' : 'transparent'}
          onPress={() => {
            toggleMic();
          }}
          Icon={() => {
            return localMicOn ? (
              <MicOn height={24} width={24} fill="#FFF" />
            ) : (
              <MicOff height={28} width={28} fill="#1D2939" />
            );
          }}
        />
        <IconContainer
          style={{
            borderWidth: 1.5,
            borderColor: '#2B3034',
          }}
          backgroundColor={!localWebcamOn ? '#FFFFFF' : 'transparent'}
          onPress={() => {
            toggleWebcam();
          }}
          Icon={() => {
            return localWebcamOn ? (
              <VideoOn height={24} width={24} fill="#FFF" />
            ) : (
              <VideoOff height={36} width={36} fill="#1D2939" />
            );
          }}
        />
      </View>
    </>
  );
}

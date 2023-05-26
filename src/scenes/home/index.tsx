import React, {useEffect, useState, useRef} from 'react';
import {
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
  Clipboard,
  Alert,
  Linking,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {CallEnd, Copy} from '../../assets/icons';
import TextInputContainer from '../../Components/TextInputContainer';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {
  updateCallStatus,
  initiateCall,
  getToken,
  createMeeting,
} from '../../api';
import {SCREEN_NAMES} from '../../navigators/screenNames';
import Incomingvideocall from '../../utils/incoming-video-call';

export default function Home({navigation}: any) {
  const [number, setNumber] = useState('');
  const [firebaseUserConfig, setfirebaseUserConfig] = useState({
    callerId: '',
    token: '',
    platform: 'ANDROID',
  });
  const [isCalling, setisCalling] = useState(false);
  const [videosdkToken, setVideosdkToken] = useState('');
  const [videosdkMeeting, setVideosdkMeeting] = useState('');

  const videosdkTokenRef = useRef('');
  const videosdkMeetingRef = useRef('');
  const APNRef = useRef();
  videosdkTokenRef.current = videosdkToken;
  videosdkMeetingRef.current = videosdkMeeting;

  useEffect(() => {
    async function getFCMtoken() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        const querySnapshot = await firestore()
          .collection('users')
          .where('token', '==', token)
          .get();

        const uids = querySnapshot.docs.map(doc => {
          if (doc && doc?.data()?.callerId) {
            const {token, platform, APN, callerId} = doc?.data();
            setfirebaseUserConfig({
              callerId,
              token,
              platform,
            });
          }
          return doc;
        });

        if (uids && uids.length == 0) {
          addUser({token});
        } else {
          console.log('Token Found');
        }
      }
    }

    async function getTokenAndMeetingId() {
      const videoSDKtoken = getToken();
      const videoSDKMeetingId = await createMeeting({token: videoSDKtoken});
      setVideosdkToken(videoSDKtoken);
      setVideosdkMeeting(videoSDKMeetingId);
    }
    getFCMtoken();
    getTokenAndMeetingId();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(remoteMessage => {
      const {callerInfo, videoSDKInfo, type} = JSON.parse(
        remoteMessage.data.info,
      );
      switch (type) {
        case 'CALL_INITIATED':
          const incomingCallAnswer = ({callUUID}: any) => {
            updateCallStatus({
              callerInfo,
              type: 'ACCEPTED',
            });
            Incomingvideocall.endIncomingcallAnswer(callUUID);
            setisCalling(false);
            Linking.openURL(
              `videocalling://meetingscreen/${videoSDKInfo.token}/${videoSDKInfo.meetingId}`,
            ).catch(err => {
              console.log(`Error`, err);
            });
          };

          const endIncomingCall = () => {
            Incomingvideocall.endIncomingcallAnswer();
            updateCallStatus({callerInfo, type: 'REJECTED'});
          };

          Incomingvideocall.configure(incomingCallAnswer, endIncomingCall);
          Incomingvideocall.displayIncomingCall(callerInfo.name);

          break;
        case 'ACCEPTED':
          setisCalling(false);
          navigation.navigate(SCREEN_NAMES.Meeting, {
            name: 'Person B',
            token: videosdkTokenRef.current,
            meetingId: videosdkMeetingRef.current,
          });
          break;
        case 'REJECTED':
          console.log('Call Rejected');
          setisCalling(false);
          break;
        case 'DISCONNECT':
          Platform.OS === 'ios'
            ? Incomingvideocall.endAllCall()
            : Incomingvideocall.endIncomingcallAnswer();
          break;
        default:
          console.log('Call Could not placed');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addUser = ({token}: {token: string}) => {
    const platform = Platform.OS === 'android' ? 'ANDROID' : 'iOS';
    const obj = {
      callerId: Math.floor(10000000 + Math.random() * 90000000).toString(),
      token,
      platform,
    };
    firestore()
      .collection('users')
      .add(obj)
      .then(() => {
        setfirebaseUserConfig(obj);
        console.log('User added!');
      });
  };

  const getCallee = async (num: string) => {
    const querySnapshot = await firestore()
      .collection('users')
      .where('callerId', '==', num.toString())
      .get();
    return querySnapshot.docs.map(doc => {
      return doc;
    });
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
        backgroundColor: '#050A0E',
        justifyContent: 'center',
        paddingHorizontal: 42,
      }}>
      {!isCalling ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <>
            <View
              style={{
                padding: 35,
                backgroundColor: '#1A1C22',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 14,
              }}>
              <Text
                style={{
                  fontSize: 18,
                  color: '#D0D4DD',
                }}>
                Your Caller ID
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 12,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 32,
                    color: '#ffff',
                    letterSpacing: 8,
                  }}>
                  {firebaseUserConfig
                    ? firebaseUserConfig.callerId
                    : 'Loading..'}
                </Text>
                <TouchableOpacity
                  style={{
                    height: 30,
                    aspectRatio: 1,
                    backgroundColor: '#2B3034',
                    marginLeft: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 4,
                  }}
                  onPress={() => {
                    Clipboard.setString(
                      firebaseUserConfig && firebaseUserConfig.callerId,
                    );
                    if (Platform.OS === 'android') {
                      console.log('Copied');
                      Alert.alert(
                        'Information',
                        'This callerId will be unavailable, once you uninstall the App.',
                      );
                    }
                  }}>
                  <Copy fill={'#FFFFFF'} width={16} height={16} />
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                backgroundColor: '#1A1C22',
                padding: 40,
                marginTop: 25,
                justifyContent: 'center',
                borderRadius: 14,
              }}>
              <Text
                style={{
                  fontSize: 18,
                  color: '#D0D4DD',
                }}>
                Enter call id of another user
              </Text>
              <TextInputContainer
                placeholder={'Enter Caller ID'}
                value={number}
                setValue={setNumber}
                keyboardType={'number-pad'}
              />
              <TouchableOpacity
                onPress={async () => {
                  if (number) {
                    const data = await getCallee(number);
                    if (data) {
                      if (data.length === 0) {
                        console.log('CallerId Does not Match');
                      } else {
                        console.log('CallerId Match!');
                        const {token, platform, APN} = data[0]?.data();
                        initiateCall({
                          callerInfo: {
                            name: 'Person A',
                            ...firebaseUserConfig,
                          },
                          calleeInfo: {
                            token,
                            platform,
                            APN,
                          },
                          videoSDKInfo: {
                            token: videosdkTokenRef.current,
                            meetingId: videosdkMeetingRef.current,
                          },
                        });
                        setisCalling(true);
                      }
                    }
                  } else {
                    console.log('Please provide CallerId');
                  }
                }}
                style={{
                  height: 50,
                  backgroundColor: '#5568FE',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 12,
                  marginTop: 16,
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#FFFFFF',
                  }}>
                  Call Now
                </Text>
              </TouchableOpacity>
            </View>
          </>
        </TouchableWithoutFeedback>
      ) : (
        <View style={{flex: 1, justifyContent: 'space-around'}}>
          <View
            style={{
              padding: 35,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 14,
            }}>
            <Text
              style={{
                fontSize: 16,
                color: '#D0D4DD',
              }}>
              Calling to...
            </Text>

            <Text
              style={{
                fontSize: 36,
                marginTop: 12,
                color: '#ffff',
                letterSpacing: 8,
              }}>
              {number}
            </Text>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={async () => {
                const data = await getCallee(number);
                if (data) {
                  updateCallStatus({
                    callerInfo: data[0]?.data(),
                    type: 'DISCONNECT',
                  });
                  setisCalling(false);
                }
              }}
              style={{
                backgroundColor: '#FF5D5D',
                borderRadius: 30,
                height: 60,
                aspectRatio: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <CallEnd width={50} height={12} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

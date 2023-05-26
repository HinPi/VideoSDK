import {useMeeting} from '@videosdk.live/react-native-sdk';
import {Text, View} from 'react-native';
import ControlsContainer from './control';
import ParticipantList from './participantList';

export default function MeetingView() {
  const {join, leave, toggleWebcam, toggleMic, participants} = useMeeting({});
  const participantsArrId = [...participants.keys()];
  return (
    <View style={{flex: 1}}>
      <ParticipantList participants={participantsArrId} />
      <ControlsContainer
        join={join}
        leave={leave}
        toggleWebcam={toggleWebcam}
        toggleMic={toggleMic}
      />
    </View>
  );
}

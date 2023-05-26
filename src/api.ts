export const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIyNjBmMzZjMS1hYmQ2LTQxYzctYTdlZi04MTExMDIzYzEzZTAiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY4NDgwNTUyNywiZXhwIjoxNjg3Mzk3NTI3fQ.15IzVG7wDyb9NdDtr5Yw9TZ7D6_qOfanf7bro8-SiJY";
const FCM_SERVER_URL =
  "https://us-central1-react-native-callkit.cloudfunctions.net/app";

// API call to create meeting
export const createMeeting = async ({ token }: {token: string}) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });

  const { roomId } = await res.json();
  return roomId;
};

export const getToken = () => {
  return token;
};

export const initiateCall = async ({
  callerInfo,
  calleeInfo,
  videoSDKInfo,
}: any) => {
  await fetch(`${FCM_SERVER_URL}/initiate-call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callerInfo,
      calleeInfo,
      videoSDKInfo,
    }),
  })
    .then((response) => {
      console.log(" RESP", response);
    })
    .catch((error) => console.error("error", error));
};

export const updateCallStatus = async ({ callerInfo, type }: any) => {
  await fetch(`${FCM_SERVER_URL}/update-call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callerInfo,
      type,
    }),
  })
    .then((response) => {
      console.log("##RESP", response);
    })
    .catch((error) => console.error("error", error));
};
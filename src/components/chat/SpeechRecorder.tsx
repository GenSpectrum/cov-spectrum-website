import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export const SpeechRecorder = () => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  console.log(transcript, listening, resetTranscript, browserSupportsSpeechRecognition);

  return (
    <>
      <button onClick={() => SpeechRecognition.startListening({ continuous: true })}>Record</button>
      <br />
      <button onClick={() => SpeechRecognition.stopListening()}>Stop</button>
      <br />
      <button onClick={() => resetTranscript()}>Reset</button>
      <p>Listening: {listening.toString()}</p>
      <p>{transcript}</p>
    </>
  );
};

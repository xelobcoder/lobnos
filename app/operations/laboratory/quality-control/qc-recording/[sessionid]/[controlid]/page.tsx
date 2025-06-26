"use client"

import { useParams } from "next/navigation";
import { QCReadingRecorder } from "../../../../../../../components/laboratory/QualityControl/QCRecording/QCReadingRecorder";

export default function QCRecordingPage() {
  const params = useParams();
  const sessionId = params?.sessionid as string;
  const controlId = params?.controlid as string;

  return (
    <div className="p-4">
      <QCReadingRecorder 
        sessionId={sessionId}
        controlId={controlId}
      />
    </div>
  );
}
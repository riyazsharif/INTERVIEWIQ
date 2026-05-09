import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Setp1Setup from "../components/Setp1Setup";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";

function InterviewPage() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  useEffect(() => {
    if (!userData) {
      navigate("/auth");
    }
  }, [userData, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {step == 1 && (
        <Setp1Setup
          onStart={(data) => {
            setInterviewData(data);
            setStep(2);
          }}
        />
      )}

      {step == 2 && (
        <Step2Interview
          interviewData={interviewData}
          onFinish={(Report) => {
            setStep(3);
          }}
        />
      )}

      {step == 3 && <Step3Report report={interviewData} />}
    </div>
  );
}

export default InterviewPage;

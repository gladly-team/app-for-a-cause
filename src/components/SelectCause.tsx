import React from "react";

interface SelectCauseProps {
  userAccessToken: string;
  onCauseSelect: (causeId: string) => void;
}

const SelectCause: React.FC<SelectCauseProps> = ({ onCauseSelect, userAccessToken }) => {
  return <iframe src={`${process.env.REACT_APP_SERVER}/v5/mobile/select-cause?access_token=${userAccessToken}`} width="100%" height="100%" frameBorder="0" />;
};

export default SelectCause;

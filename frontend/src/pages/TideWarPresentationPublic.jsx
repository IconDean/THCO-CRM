import EmailGate from "../components/EmailGate";
import TideWarPresentation from "./TideWarPresentation";

export default function TideWarPresentationPublic() {
  return (
    <EmailGate proposalSlug="tide-war" proposalTitle="TIDE WAR — Current Shift">
      <TideWarPresentation />
    </EmailGate>
  );
}

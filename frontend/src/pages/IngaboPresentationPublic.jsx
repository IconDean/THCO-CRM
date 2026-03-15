import EmailGate from "../components/EmailGate";
import IngaboPresentation from "./IngaboPresentation";

export default function IngaboPresentationPublic() {
  return (
    <EmailGate proposalSlug="ingabo" proposalTitle="INGABO — Rise of the Thousand Hills">
      <IngaboPresentation />
    </EmailGate>
  );
}

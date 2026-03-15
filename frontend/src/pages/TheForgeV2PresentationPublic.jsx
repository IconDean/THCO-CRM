import EmailGate from "../components/EmailGate";
import TheForgeV2Presentation from "./TheForgeV2Presentation";

export default function TheForgeV2PresentationPublic() {
  return (
    <EmailGate proposalSlug="the-forge-v2" proposalTitle="THE FORGE V2 — Fire and Memory">
      <TheForgeV2Presentation />
    </EmailGate>
  );
}

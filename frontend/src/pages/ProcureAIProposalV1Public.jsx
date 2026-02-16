import EmailGate from '../components/EmailGate';
import ProcureAIProposal from './ProcureAIProposal';

const ProcureAIProposalV1Public = () => {
  return (
    <EmailGate 
      proposalSlug="procure-ai-v1" 
      proposalTitle="Procure AI V1 - Original Presentation"
    >
      <ProcureAIProposal />
    </EmailGate>
  );
};

export default ProcureAIProposalV1Public;

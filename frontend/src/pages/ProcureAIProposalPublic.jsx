import EmailGate from '../components/EmailGate';
import ProcureAIProposalV2 from './ProcureAIProposalV2';

const ProcureAIProposalPublic = () => {
  return (
    <EmailGate 
      proposalSlug="procure-ai" 
      proposalTitle="Procure AI - Process Flowcharts"
    >
      <ProcureAIProposalV2 />
    </EmailGate>
  );
};

export default ProcureAIProposalPublic;

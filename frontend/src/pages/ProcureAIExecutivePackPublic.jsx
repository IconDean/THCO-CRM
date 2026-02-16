import EmailGate from '../components/EmailGate';
import ProcureAIExecutivePackV4 from './ProcureAIExecutivePackV4';

const ProcureAIExecutivePackPublic = () => {
  return (
    <EmailGate 
      proposalSlug="procure-ai-executive" 
      proposalTitle="Executive Kick-Off Pack - IHS Towers"
    >
      <ProcureAIExecutivePackV4 />
    </EmailGate>
  );
};

export default ProcureAIExecutivePackPublic;
